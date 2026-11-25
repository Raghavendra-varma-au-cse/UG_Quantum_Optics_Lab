import { describe, expect, it } from "vitest";
import {
  K_B,
  analyseTrace,
  axialStabilityRatio,
  beamRadiusM,
  clausiusMossotti,
  cornerFrequencyHz,
  diffusionCoefficientM2S,
  dragCoefficientNsM,
  escapeForceN,
  fitLorentzianCorner,
  gradientForceN,
  intensityWm2,
  lorentzianPsdM2Hz,
  maxGradientForceN,
  rayleighRangeM,
  scatteringForceN,
  simulateBrownian,
  stiffnessFromVariance,
  trapDepthKt,
  trapStiffnessNm,
  type TweezersParams
} from "./physics";

const base: TweezersParams = {
  powerW: 0.15,
  wavelengthM: 1064e-9,
  waistM: 0.4637e-6,
  radiusM: 0.2e-6,
  nParticle: 1.45,
  nMedium: 1.33,
  viscosityPaS: 1.0e-3,
  temperatureK: 298
};

describe("Gaussian beam geometry", () => {
  it("gives z_R = pi w0^2 n / lambda", () => {
    const zr = rayleighRangeM({ ...base, nMedium: 1 });
    expect(zr).toBeCloseTo((Math.PI * base.waistM ** 2) / base.wavelengthM, 18);
  });

  it("has w(0) = w0 and w(z_R) = sqrt(2) w0", () => {
    expect(beamRadiusM(base, 0)).toBeCloseTo(base.waistM, 18);
    const zr = rayleighRangeM(base);
    expect(beamRadiusM(base, zr) / base.waistM).toBeCloseTo(Math.SQRT2, 10);
  });

  it("integrates the radial intensity to the beam power", () => {
    const samples = 20001;
    const rMax = 8 * base.waistM;
    let integral = 0;
    let previous = 0;
    for (let i = 0; i < samples; i++) {
      const r = (rMax * i) / (samples - 1);
      const value = 2 * Math.PI * r * intensityWm2(base, r, 0);
      if (i > 0) integral += ((value + previous) / 2) * (rMax / (samples - 1));
      previous = value;
    }
    expect(integral / base.powerW).toBeCloseTo(1, 4);
  });
});

describe("point-dipole optical forces", () => {
  it("pulls a higher-index particle inward and pushes a lower-index particle outward", () => {
    const r = 0.3 * base.waistM;
    expect(gradientForceN(base, r)).toBeLessThan(0);
    const lowIndex = { ...base, nParticle: 1.3 };
    expect(clausiusMossotti(lowIndex.nParticle, lowIndex.nMedium)).toBeLessThan(0);
    expect(gradientForceN(lowIndex, r)).toBeGreaterThan(0);
    expect(trapStiffnessNm(lowIndex)).toBeLessThan(0);
  });

  it("has its maximum inward gradient force at r = w0/2", () => {
    const half = base.waistM / 2;
    const atHalf = Math.abs(gradientForceN(base, half));
    expect(atHalf / Math.abs(maxGradientForceN(base))).toBeCloseTo(1, 8);
    expect(atHalf).toBeGreaterThan(Math.abs(gradientForceN(base, 0.1 * base.waistM)));
    expect(atHalf).toBeGreaterThan(Math.abs(gradientForceN(base, base.waistM)));
  });

  it("scales stiffness linearly with power", () => {
    const doubled = { ...base, powerW: 2 * base.powerW };
    expect(trapStiffnessNm(doubled) / trapStiffnessNm(base)).toBeCloseTo(2, 10);
  });

  it("scales stiffness as 1/w0^2 at fixed peak intensity", () => {
    const w2 = base.waistM / 2;
    const p2 = { ...base, waistM: w2, powerW: base.powerW / 4 };
    expect(trapStiffnessNm(p2) / trapStiffnessNm(base)).toBeCloseTo(4, 10);
  });

  it("scales stiffness as 1/w0^4 at fixed power", () => {
    const w2 = base.waistM / 2;
    const p2 = { ...base, waistM: w2 };
    expect(trapStiffnessNm(p2) / trapStiffnessNm(base)).toBeCloseTo(16, 8);
  });

  it("reports a positive escape force only when the gradient beats scattering", () => {
    expect(scatteringForceN(base)).toBeGreaterThan(0);
    expect(maxGradientForceN(base)).toBeGreaterThan(scatteringForceN(base));
    expect(escapeForceN(base)).toBeGreaterThan(0);
    expect(axialStabilityRatio(base)).toBeLessThan(1);

    const big = { ...base, radiusM: 1.2e-6 };
    expect(maxGradientForceN(big)).toBeLessThan(scatteringForceN(big));
    expect(escapeForceN(big)).toBeLessThan(0);
    expect(axialStabilityRatio(big)).toBeGreaterThan(1);
  });

  it("increases the trap depth linearly with power", () => {
    const doubled = { ...base, powerW: 2 * base.powerW };
    expect(trapDepthKt(doubled) / trapDepthKt(base)).toBeCloseTo(2, 8);
    expect(trapDepthKt(base)).toBeGreaterThan(0);
  });
});

describe("drag and Brownian motion", () => {
  it("uses gamma = 6 pi eta a", () => {
    expect(dragCoefficientNsM(0.5e-6, 1e-3)).toBeCloseTo(6 * Math.PI * 1e-3 * 0.5e-6, 20);
  });

  it("uses D = k_B T / gamma", () => {
    const gamma = dragCoefficientNsM(base.radiusM, base.viscosityPaS);
    expect(diffusionCoefficientM2S(base.radiusM, base.viscosityPaS, base.temperatureK)).toBeCloseTo(
      (K_B * base.temperatureK) / gamma,
      22
    );
  });

  it("reproduces the equipartition variance in a long seeded run", () => {
    const stiffness = trapStiffnessNm(base);
    const fc = cornerFrequencyHz(stiffness, base.radiusM, base.viscosityPaS);
    const trace = simulateBrownian(base, "variance-check", {
      steps: 240000,
      dt: 1 / (400 * fc)
    });
    const expected = (K_B * base.temperatureK) / stiffness;
    expect(trace.varianceM2).toBeGreaterThan(0);
    expect(trace.varianceM2 / expected).toBeGreaterThan(0.86);
    expect(trace.varianceM2 / expected).toBeLessThan(1.14);
    expect(trace.stiffnessMeasuredNm / stiffness).toBeGreaterThan(0.86);
    expect(trace.stiffnessMeasuredNm / stiffness).toBeLessThan(1.14);
    expect(stiffnessFromVariance(trace.varianceM2, base.temperatureK)).toBeCloseTo(
      trace.stiffnessMeasuredNm,
      18
    );
  });

  it("recovers the corner frequency from the simulated PSD", () => {
    const stiffness = trapStiffnessNm(base);
    const fc = cornerFrequencyHz(stiffness, base.radiusM, base.viscosityPaS);
    const trace = simulateBrownian(base, "psd-check", {
      steps: 65536,
      dt: 1 / (200 * fc)
    });
    const analysis = analyseTrace(trace, 72);
    expect(analysis.fit.points).toBeGreaterThan(30);
    expect(analysis.fit.cornerHz).toBeGreaterThan(0.75 * fc);
    expect(analysis.fit.cornerHz).toBeLessThan(1.25 * fc);

    // A direct fit to the analytic model must return the model corner.
    const direct = fitLorentzianCorner(analysis.psdModel.f, analysis.psdModel.s, fc);
    expect(direct.cornerHz / fc).toBeGreaterThan(0.95);
    expect(direct.cornerHz / fc).toBeLessThan(1.05);
  });

  it("puts the maximum of f*S(f) at the corner while the raw PSD falls monotonically", () => {
    const stiffness = trapStiffnessNm(base);
    const fc = cornerFrequencyHz(stiffness, base.radiusM, base.viscosityPaS);
    let bestF = 0;
    let bestWeighted = 0;
    let previous = Number.POSITIVE_INFINITY;
    let monotonic = true;
    const decades = 4;
    const samples = 4000;
    for (let i = 0; i < samples; i++) {
      const f = fc * 0.01 * Math.pow(10, (decades * i) / (samples - 1));
      const psd = lorentzianPsdM2Hz(f, stiffness, base.radiusM, base.viscosityPaS, base.temperatureK);
      if (psd > previous) monotonic = false;
      previous = psd;
      const weighted = f * psd;
      if (weighted > bestWeighted) {
        bestWeighted = weighted;
        bestF = f;
      }
    }
    expect(monotonic).toBe(true);
    expect(bestF / fc).toBeGreaterThan(0.95);
    expect(bestF / fc).toBeLessThan(1.05);
  });
});
