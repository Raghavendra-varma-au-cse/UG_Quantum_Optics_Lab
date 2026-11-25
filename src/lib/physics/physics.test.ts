import { describe, expect, it } from "vitest";
import {
  coherenceLength,
  michelsonOPD,
  observedVisibility,
  refractiveIndexFromFringes,
  thermalExpansionCoefficient,
  twoBeamIntensity,
  visibilityEnvelope,
  wavelengthFromFringes,
  michelsonPattern,
  circularFringeRadius
} from "./interference";
import {
  H,
  V,
  D,
  R,
  jonesFromAngles,
  linearPolarizer,
  wavePlate,
  stokesFromJones,
  poincarePoint,
  jonesFromPoincare,
  malus,
  polarizationEllipse
} from "./polarization";
import { BS_50_50, beamSplitterMatrix, bombTesterProbabilities, machZehnder, quantumEraser, bombTesterProbabilities as bomb } from "./quantum";
import { isUnitary, cAbs2, matVec, cExp } from "./complex";
import { simulateBB84, parityCorrect } from "./qkd";
import { fft2, makeField, fourF, makePattern, magnitude, normalize01 } from "./fourier";
import { linearRegression, sem, confidenceInterval95, mean, histogram } from "./stats";
import { createRng, randNormal } from "./rng";
import { rayleighRange, trapStiffness, gradientForce, simulateBrownian } from "./gaussian";

describe("two-beam interference", () => {
  it("gives maximum intensity for equal in-phase beams", () => {
    expect(twoBeamIntensity(1, 1, 0)).toBeCloseTo(4, 10);
  });
  it("gives zero for equal anti-phase beams", () => {
    expect(twoBeamIntensity(1, 1, Math.PI)).toBeCloseTo(0, 10);
  });
  it("reports unit visibility for balanced coherent beams", () => {
    expect(observedVisibility(1, 1, 0, 1)).toBeCloseTo(1, 10);
  });
  it("uses the Michelson double-pass path difference", () => {
    expect(michelsonOPD(0.1, 0.1 + 1e-6)).toBeCloseTo(-2e-6, 12);
  });
  it("recovers wavelength from mirror travel and fringe count", () => {
    const lambda = 632.8e-9;
    const travel = (100 * lambda) / 2; // 100 fringes
    expect(wavelengthFromFringes(travel, 100)).toBeCloseTo(lambda, 15);
  });
  it("inverts the gas-cell relation", () => {
    const lambda = 632.8e-9;
    const t = 0.1;
    const n = 1.00027;
    const N = (2 * t * (n - 1)) / lambda;
    expect(refractiveIndexFromFringes(N, lambda, t)).toBeCloseTo(n, 9);
  });
  it("inverts the thermal expansion relation", () => {
    const alpha = 2.3e-5;
    const L = 0.2;
    const dT = 10;
    const lambda = 632.8e-9;
    const N = (2 * L * alpha * dT) / lambda;
    expect(thermalExpansionCoefficient(N, lambda, L, dT)).toBeCloseTo(alpha, 12);
  });
  it("has a coherence length of λ²/Δλ", () => {
    expect(coherenceLength(632.8e-9, 1e-9)).toBeCloseTo((632.8e-9) ** 2 / 1e-9, 10);
  });
  it("washes out visibility beyond the coherence length", () => {
    expect(visibilityEnvelope(1e-3, 1e-4)).toBeLessThan(1e-10);
    expect(visibilityEnvelope(0, 1e-4)).toBe(1);
  });
  it("produces radii that grow as sqrt(m)", () => {
    const r1 = circularFringeRadius(0.1, 1, 632.8e-9, 1e-3);
    const r4 = circularFringeRadius(0.1, 4, 632.8e-9, 1e-3);
    expect(r4 / r1).toBeCloseTo(2, 6);
  });
  it("produces a pattern normalised within [0,1]", () => {
    const p = michelsonPattern({
      fieldM: 0.01,
      wavelengthM: 632.8e-9,
      armDifferenceM: 0,
      tiltRad: 0,
      coherence: 1,
      coherenceLengthM: 1,
      balance: 1,
      envelope: 0.8,
      samples: 32
    });
    expect(Math.min(...p)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...p)).toBeLessThanOrEqual(1);
  });
});

describe("polarization", () => {
  it("obeys Malus's law", () => {
    expect(malus(0)).toBeCloseTo(1, 12);
    expect(malus(Math.PI / 4)).toBeCloseTo(0.5, 12);
    expect(malus(Math.PI / 2)).toBeCloseTo(0, 12);
  });
  it("projects H through a horizontal polarizer", () => {
    const out = matVec(linearPolarizer(0), H);
    expect(cAbs2(out[0])).toBeCloseTo(1, 12);
    expect(cAbs2(out[1])).toBeCloseTo(0, 12);
  });
  it("is unitary for a general retarder", () => {
    expect(isUnitary(wavePlate(37, 1.234))).toBe(true);
  });
  it("turns H into D with a half-wave plate at 22.5°", () => {
    const out = matVec(wavePlate(22.5, Math.PI), H);
    const s = stokesFromJones(out);
    expect(Math.abs(s.S1)).toBeLessThan(1e-9);
    expect(s.S2).toBeCloseTo(1, 9);
  });
  it("turns H into circular with a quarter-wave plate at 45°", () => {
    const out = matVec(wavePlate(45, Math.PI / 2), H);
    const s = stokesFromJones(out);
    expect(Math.abs(s.S3)).toBeCloseTo(1, 9);
  });
  it("round-trips Stokes coordinates through the Poincaré sphere", () => {
    const j = jonesFromAngles(31, 19);
    const p = poincarePoint(j);
    const back = jonesFromPoincare(p.x, p.y, p.z);
    const s1 = stokesFromJones(j);
    const s2 = stokesFromJones(back);
    expect(s1.S1).toBeCloseTo(s2.S1, 6);
    expect(s1.S2).toBeCloseTo(s2.S2, 6);
    expect(s1.S3).toBeCloseTo(s2.S3, 6);
  });
  it("classifies H, D, R correctly", () => {
    expect(polarizationEllipse(H).handedness).toBe("linear");
    expect(polarizationEllipse(R).handedness).toBe("right");
    expect(stokesFromJones(D).S2).toBeCloseTo(1, 10);
    expect(stokesFromJones(V).S1).toBeCloseTo(-1, 10);
  });
});

describe("beam-splitter and Mach–Zehnder", () => {
  it("uses a unitary beam-splitter matrix", () => {
    for (const eta of [0, 0.2, 0.5, 0.8, 1]) expect(isUnitary(beamSplitterMatrix(eta))).toBe(true);
    expect(isUnitary(BS_50_50)).toBe(true);
  });
  it("conserves probability in the MZ", () => {
    for (let phi = -Math.PI; phi <= Math.PI; phi += 0.2) {
      const r = machZehnder(phi, 0, 0.5, 0.5);
      expect(r.p0 + r.p1).toBeCloseTo(1, 10);
    }
  });
  it("has unit visibility for an ideal balanced MZ", () => {
    const r = machZehnder(0, 0, 0.5, 0.5);
    expect(r.visibility).toBeCloseTo(1, 10);
  });
  it("reduces visibility when the second splitter is unbalanced", () => {
    const r = machZehnder(0, 0, 0.5, 0.9);
    expect(r.visibility).toBeLessThan(0.7);
  });
  it("distinguishes a live bomb from a dud", () => {
    const live = bombTesterProbabilities(true);
    const dud = bombTesterProbabilities(false);
    expect(live.explosion + live.dark + live.bright).toBeCloseTo(1, 12);
    expect(live.interactionFreePerLiveBomb).toBeCloseTo(0.25, 12);
    expect(dud.bright).toBeCloseTo(1, 12);
    expect(dud.dark).toBeCloseTo(0, 12);
    expect(bomb(true).dark).toBeCloseTo(0.25, 12);
  });
});

describe("quantum eraser", () => {
  it("has full visibility with no marker", () => {
    const r = quantumEraser({ markerAngleDeg: 0, phase: 0, analyzerAngleDeg: 0, intensityRatio: 1 });
    expect(r.visibility).toBeCloseTo(1, 9);
    expect(r.distinguishability).toBeCloseTo(0, 9);
  });
  it("destroys visibility with orthogonal markers", () => {
    const r = quantumEraser({ markerAngleDeg: 90, phase: 0, analyzerAngleDeg: 0, intensityRatio: 1 });
    expect(r.visibility).toBeCloseTo(0, 9);
    expect(r.distinguishability).toBeCloseTo(1, 9);
  });
  it("satisfies D² + V² = 1 for pure marking", () => {
    for (const theta of [0, 15, 30, 45, 60, 90]) {
      const r = quantumEraser({ markerAngleDeg: theta, phase: 0.3, analyzerAngleDeg: 0, intensityRatio: 1 });
      expect(r.visibility ** 2 + r.distinguishability ** 2).toBeCloseTo(1, 9);
    }
  });
  it("recovers conditional fringes at the erasure angle", () => {
    const r = quantumEraser({ markerAngleDeg: 90, phase: 0, analyzerAngleDeg: 45, intensityRatio: 1 });
    expect(r.conditionalVisibility).toBeCloseTo(1, 6);
  });
});

describe("BB84", () => {
  it("has zero QBER on an ideal channel", () => {
    const r = simulateBB84({ photons: 512, eveProbability: 0, seed: "ideal" });
    expect(r.qber).toBeCloseTo(0, 12);
    expect(r.privacy.matches).toBe(true);
    expect(r.secure).toBe(true);
  });
  it("produces roughly 25% QBER under full intercept–resend", () => {
    const r = simulateBB84({ photons: 4096, eveProbability: 1, seed: "eve" });
    expect(r.qber).toBeGreaterThan(0.2);
    expect(r.qber).toBeLessThan(0.3);
    expect(r.secure).toBe(false);
  });
  it("sifts roughly half the detected photons", () => {
    const r = simulateBB84({ photons: 2048, eveProbability: 0, seed: "sift" });
    expect(r.stages.sifted).toBeGreaterThan(900);
    expect(r.stages.sifted).toBeLessThan(1150);
  });
  it("is reproducible for the same seed and different for another", () => {
    const a = simulateBB84({ photons: 256, eveProbability: 0.4, seed: "same" });
    const b = simulateBB84({ photons: 256, eveProbability: 0.4, seed: "same" });
    const c = simulateBB84({ photons: 256, eveProbability: 0.4, seed: "other" });
    expect(a.privacy.keyAlice).toBe(b.privacy.keyAlice);
    expect(a.privacy.keyAlice).not.toBe(c.privacy.keyAlice);
  });
  it("corrects a single error per block with parity disclosure", () => {
    const alice = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1] as (0 | 1)[];
    const bob = alice.slice();
    bob[3] = (bob[3]! ^ 1) as 0 | 1;
    const res = parityCorrect(alice, bob, 8);
    expect(res.correctedBits).toBeGreaterThanOrEqual(1);
    expect(res.residualErrors).toBe(0);
    expect(res.leakedParityBits).toBeGreaterThan(0);
  });
});

describe("Fourier optics", () => {
  it("transforms a delta into a constant magnitude", () => {
    const f = makeField(16);
    f.re[0] = 1;
    const out = fft2(f, false);
    const mag = magnitude(out);
    for (const m of mag) expect(m).toBeCloseTo(1, 9);
  });
  it("transforms a constant into a delta", () => {
    const f = makeField(16, 1);
    const out = fft2(f, false);
    expect(out.re[0]).toBeCloseTo(256, 6);
    expect(Math.abs(out.re[5] ?? 0)).toBeLessThan(1e-9);
  });
  it("inverts exactly", () => {
    const f = makeField(16);
    const rng = createRng("fft-inverse");
    for (let i = 0; i < f.re.length; i++) f.re[i] = rng();
    const back = fft2(fft2(f, false), true);
    for (let i = 0; i < f.re.length; i++) expect(back.re[i]).toBeCloseTo(f.re[i]!, 9);
  });
  it("satisfies Parseval", () => {
    const n = 16;
    const f = makeField(n);
    const rng = createRng("parseval");
    let spatial = 0;
    for (let i = 0; i < f.re.length; i++) {
      f.re[i] = rng() - 0.5;
      spatial += f.re[i]! ** 2;
    }
    const out = fft2(f, false);
    let spectral = 0;
    for (let i = 0; i < out.re.length; i++) spectral += out.re[i]! ** 2 + out.im[i]! ** 2;
    expect(spectral).toBeCloseTo(n * n * spatial, 6);
  });
  it("reconstructs the object with no filter", () => {
    const n = 32;
    const obj = makePattern("slits", n);
    const res = fourF(obj, n, { kind: "none", radius: 1 });
    const a = normalize01(res.object);
    const b = normalize01(res.reconstruction);
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff += Math.abs(a[i]! - b[i]!);
    expect(diff / a.length).toBeLessThan(0.02);
  });
  it("reduces contrast with an aggressive low-pass filter", () => {
    const n = 32;
    const obj = makePattern("checker", n);
    const all = fourF(obj, n, { kind: "none", radius: 1 });
    const low = fourF(obj, n, { kind: "lowpass", radius: 0.08 });
    expect(low.contrast).toBeLessThan(all.contrast);
  });
});

describe("statistics", () => {
  it("recovers an exact line", () => {
    const xs = [1, 2, 3, 4, 5];
    const ys = xs.map((x) => 3 + 2 * x);
    const r = linearRegression(xs, ys);
    expect(r.slope).toBeCloseTo(2, 12);
    expect(r.intercept).toBeCloseTo(3, 12);
    expect(r.r2).toBeCloseTo(1, 12);
  });
  it("computes the standard error as sd/√n", () => {
    const xs = [1, 2, 3, 4, 5];
    expect(sem(xs)).toBeCloseTo(Math.sqrt(2.5 / 5), 12);
  });
  it("brackets the mean with a 95% interval", () => {
    const xs = [10, 10.2, 9.8, 10.1, 9.9];
    const ci = confidenceInterval95(xs);
    expect(ci.low).toBeLessThan(mean(xs));
    expect(ci.high).toBeGreaterThan(mean(xs));
  });
  it("conserves counts in a histogram", () => {
    const rng = createRng("hist");
    const xs = Array.from({ length: 1000 }, () => randNormal(rng, 0, 1));
    const h = histogram(xs, 20);
    expect(h.reduce((s, b) => s + b.count, 0)).toBe(1000);
  });
});

describe("Gaussian beam and trap", () => {
  it("has z_R = πw₀²/λ", () => {
    expect(rayleighRange({ wavelengthM: 1064e-9, waistM: 1e-6, powerW: 1 })).toBeCloseTo((Math.PI * 1e-12) / 1064e-9, 15);
  });
  it("scales stiffness linearly with power", () => {
    const base = { wavelengthM: 1064e-9, waistM: 1e-6, radiusM: 0.5e-6, nParticle: 1.5, nMedium: 1.33 };
    const k1 = trapStiffness({ ...base, powerW: 0.1 });
    const k2 = trapStiffness({ ...base, powerW: 0.2 });
    expect(k2 / k1).toBeCloseTo(2, 10);
  });
  it("pulls a high-index particle toward the focus", () => {
    const fp = { wavelengthM: 1064e-9, waistM: 1e-6, powerW: 0.1, radiusM: 0.5e-6, nParticle: 1.5, nMedium: 1.33 };
    expect(gradientForce(fp, 0.4e-6)).toBeGreaterThan(0);
  });
  it("has a Brownian variance consistent with equipartition", () => {
    const k = 1e-5;
    const T = 300;
    const sim = simulateBrownian(
      { stiffness: k, radiusM: 0.5e-6, viscosityPaS: 1e-3, temperatureK: T, dt: 1e-5, steps: 200000, x0: 0 },
      createRng("brownian")
    );
    const expected = (1.380649e-23 * T) / k;
    expect(sim.variance).toBeGreaterThan(expected * 0.5);
    expect(sim.variance).toBeLessThan(expected * 1.8);
  });
});
