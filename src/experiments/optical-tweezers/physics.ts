/**
 * Optical tweezers: Gaussian beam, point-dipole forces, Brownian dynamics and
 * calibration estimators.
 *
 * Conventions
 * -----------
 * - Lengths in metres, powers in watts, angles in radians, times in seconds.
 * - The beam is a paraxial TEM00 Gaussian focused in a homogeneous medium of
 *   refractive index n_m. The waist w0 is the 1/e^2 intensity radius.
 * - The particle is a homogeneous dielectric sphere in the Rayleigh regime
 *   (a << lambda_m). Its optical response is described by the Clausius–
 *   Mossotti factor K = (m^2 - 1)/(m^2 + 2), m = n_p/n_m.
 * - Gradient force (signed, along the radial unit vector):
 *       F_r = A dI/dr,   A = 2*pi*n_m*a^3*K/c.
 *   For K > 0 this is negative for r > 0, i.e. directed toward the focus.
 * - Scattering force is along +z: F_scat = n_m*sigma*I/c with the Rayleigh
 *   cross-section evaluated at the medium wavelength lambda_m = lambda_0/n_m.
 * - The optical potential is U(r) = -A I(r), so a positive K gives a well.
 *
 * These are deliberate approximations: no vector/Debye focusing, no
 * spherical aberration, no hydrodynamic wall corrections, no heating, no
 * saturation and no Mie resonances. Numbers from this module are model
 * outputs, not calibration data from a real trap.
 */

import { createRng, randNormal } from "@/lib/physics/rng";

export const C_LIGHT = 299_792_458; // m/s
export const K_B = 1.380649e-23; // J/K
export const EPS0 = 8.8541878128e-12; // F/m
export const PI = Math.PI;

export interface TweezersParams {
  /** Laser power at the sample, W. */
  powerW: number;
  /** Vacuum wavelength, m. */
  wavelengthM: number;
  /** 1/e^2 intensity radius at focus, m. */
  waistM: number;
  /** Sphere radius, m. */
  radiusM: number;
  /** Particle refractive index. */
  nParticle: number;
  /** Medium refractive index. */
  nMedium: number;
  /** Dynamic viscosity, Pa s. */
  viscosityPaS: number;
  /** Absolute temperature, K. */
  temperatureK: number;
}

/* -------------------------------------------------------------------------- */
/* Beam geometry                                                              */
/* -------------------------------------------------------------------------- */

/** Rayleigh range z_R = pi w0^2 n_m / lambda_0 (m). */
export function rayleighRangeM(p: Pick<TweezersParams, "waistM" | "wavelengthM" | "nMedium">): number {
  return (PI * p.waistM * p.waistM * p.nMedium) / p.wavelengthM;
}

/** Wavelength in the medium, lambda_m = lambda_0 / n_m (m). */
export function mediumWavelengthM(p: Pick<TweezersParams, "wavelengthM" | "nMedium">): number {
  return p.wavelengthM / p.nMedium;
}

/** Beam radius w(z) = w0 sqrt(1 + (z/z_R)^2) (m). */
export function beamRadiusM(
  p: Pick<TweezersParams, "waistM" | "wavelengthM" | "nMedium">,
  zM: number
): number {
  const zr = rayleighRangeM(p);
  return p.waistM * Math.sqrt(1 + (zM / zr) ** 2);
}

/** Far-field half-angle divergence theta = lambda_0 / (pi w0 n_m), radians. */
export function divergenceRad(
  p: Pick<TweezersParams, "waistM" | "wavelengthM" | "nMedium">
): number {
  return p.wavelengthM / (PI * p.waistM * p.nMedium);
}

/** Diffraction-limited waist used to link the NA slider to w0: w0 = 0.61 lambda / NA. */
export function waistFromNaM(wavelengthM: number, na: number): number {
  return (0.61 * wavelengthM) / Math.max(1e-6, na);
}

/** Inverse of waistFromNaM: nominal NA = 0.61 lambda / w0. */
export function naFromWaist(wavelengthM: number, waistM: number): number {
  return (0.61 * wavelengthM) / Math.max(1e-12, waistM);
}

/** Numerical aperture from a focusing half-angle: NA = n sin(theta). */
export function numericalAperture(halfAngleRad: number, nMedium = 1): number {
  return nMedium * Math.sin(halfAngleRad);
}

/* -------------------------------------------------------------------------- */
/* Intensity                                                                  */
/* -------------------------------------------------------------------------- */

/** On-axis intensity at z: I(0,z) = 2P / (pi w(z)^2). */
export function onAxisIntensityWm2(
  p: Pick<TweezersParams, "powerW" | "waistM" | "wavelengthM" | "nMedium">,
  zM = 0
): number {
  const w = beamRadiusM(p, zM);
  return (2 * p.powerW) / (PI * w * w);
}

/** I(r,z) = 2P/(pi w^2) exp(-2 r^2 / w^2), W/m^2. */
export function intensityWm2(
  p: Pick<TweezersParams, "powerW" | "waistM" | "wavelengthM" | "nMedium">,
  rM: number,
  zM = 0
): number {
  const w = beamRadiusM(p, zM);
  return ((2 * p.powerW) / (PI * w * w)) * Math.exp((-2 * rM * rM) / (w * w));
}

/** Peak intensity at the focus, 2P/(pi w0^2), W/m^2. */
export function peakIntensityWm2(p: Pick<TweezersParams, "powerW" | "waistM">): number {
  return (2 * p.powerW) / (PI * p.waistM * p.waistM);
}

/* -------------------------------------------------------------------------- */
/* Optical response of the sphere                                             */
/* -------------------------------------------------------------------------- */

/** Clausius–Mossotti factor (m^2 - 1)/(m^2 + 2). */
export function clausiusMossotti(nParticle: number, nMedium: number): number {
  const m = nParticle / nMedium;
  return (m * m - 1) / (m * m + 2);
}

/**
 * Excess dipole polarisability referred to the medium,
 * alpha = 4 pi eps0 n_m^2 a^3 K (C m^2/V).
 *
 * The n_m^2 factor makes the compact force form
 * F = alpha grad(I) / (2 n_m eps0 c) reduce to the standard
 * F = (2 pi n_m a^3 K / c) grad(I).
 */
export function polarizabilitySI(
  p: Pick<TweezersParams, "radiusM" | "nParticle" | "nMedium">
): number {
  return (
    4 * PI * EPS0 * p.nMedium ** 2 * p.radiusM ** 3 * clausiusMossotti(p.nParticle, p.nMedium)
  );
}

/** Gradient-force coefficient A = 2 pi n_m a^3 K / c, N per (W/m^3). */
export function gradientCoefficient(p: TweezersParams): number {
  return (
    (2 * PI * p.nMedium * p.radiusM ** 3 * clausiusMossotti(p.nParticle, p.nMedium)) / C_LIGHT
  );
}

/** Signed radial gradient force at (r, z=0), N. Negative = inward for K > 0. */
export function gradientForceN(p: TweezersParams, rM: number): number {
  const w = p.waistM;
  const i0 = peakIntensityWm2(p);
  const dIdr = ((-4 * rM) / (w * w)) * i0 * Math.exp((-2 * rM * rM) / (w * w));
  return gradientCoefficient(p) * dIdr;
}

/**
 * Gradient force at the point of maximum inward pull, r = w0/2.
 * Signed: positive only when K > 0.
 */
export function maxGradientForceN(p: TweezersParams): number {
  const a = gradientCoefficient(p);
  const i0 = peakIntensityWm2(p);
  return a * ((2 * i0) / p.waistM) * Math.exp(-0.5);
}

/** Rayleigh scattering cross-section, m^2. */
export function scatteringCrossSectionM2(p: TweezersParams): number {
  const lambdaM = mediumWavelengthM(p);
  const k = clausiusMossotti(p.nParticle, p.nMedium);
  return (
    ((128 * PI ** 5 * p.radiusM ** 6) / (3 * lambdaM ** 4)) * k * k
  );
}

/** Scattering force along +z at radial offset r, N. */
export function scatteringForceN(p: TweezersParams, rM = 0): number {
  const sigma = scatteringCrossSectionM2(p);
  const i = intensityWm2(p, rM, 0);
  return (p.nMedium * sigma * i) / C_LIGHT;
}

/**
 * Transverse trap stiffness k = 4 A I0 / w0^2, N/m.
 * Signed: negative for a repulsive particle (K < 0).
 */
export function trapStiffnessNm(p: TweezersParams): number {
  const a = gradientCoefficient(p);
  const i0 = peakIntensityWm2(p);
  return (4 * a * i0) / (p.waistM * p.waistM);
}

/** Optical potential U(r) = -A I(r), J. Zero far from focus. */
export function trapPotentialJ(p: TweezersParams, rM: number): number {
  return -gradientCoefficient(p) * intensityWm2(p, rM, 0);
}

/** Optical potential plus tilt from a constant external force along +x, J. */
export function totalPotentialJ(p: TweezersParams, rM: number, externalForceN = 0): number {
  return trapPotentialJ(p, rM) - externalForceN * rM;
}

/** Trap depth |U(0)| in units of k_B T. Zero when the particle is repelled. */
export function trapDepthKt(p: TweezersParams): number {
  if (clausiusMossotti(p.nParticle, p.nMedium) <= 0) return 0;
  return Math.abs(trapPotentialJ(p, 0)) / (K_B * p.temperatureK);
}

/** Escape force: maximum gradient pull minus the scattering push, N. */
export function escapeForceN(p: TweezersParams): number {
  return maxGradientForceN(p) - scatteringForceN(p, 0);
}

/** Ratio F_scat / |F_grad,max|. Values >= 1 cannot support a single-beam trap. */
export function axialStabilityRatio(p: TweezersParams): number {
  const g = maxGradientForceN(p);
  if (g <= 0) return Number.POSITIVE_INFINITY;
  return scatteringForceN(p, 0) / g;
}

/** True when the Rayleigh model predicts a stable single-beam trap. */
export function isAxiallyStable(p: TweezersParams): boolean {
  return maxGradientForceN(p) > scatteringForceN(p, 0) && trapStiffnessNm(p) > 0;
}

/** Radius divided by the medium wavelength: the Rayleigh validity indicator. */
export function sizeParameter(p: TweezersParams): number {
  return p.radiusM / mediumWavelengthM(p);
}

/* -------------------------------------------------------------------------- */
/* Brownian motion and calibration                                            */
/* -------------------------------------------------------------------------- */

/** Stokes drag coefficient gamma = 6 pi eta a, N s/m. */
export function dragCoefficientNsM(radiusM: number, viscosityPaS: number): number {
  return 6 * PI * viscosityPaS * radiusM;
}

/** Diffusion coefficient D = k_B T / gamma, m^2/s. */
export function diffusionCoefficientM2S(
  radiusM: number,
  viscosityPaS: number,
  temperatureK: number
): number {
  return (K_B * temperatureK) / dragCoefficientNsM(radiusM, viscosityPaS);
}

/** Corner frequency f_c = k / (2 pi gamma), Hz. */
export function cornerFrequencyHz(
  stiffnessNm: number,
  radiusM: number,
  viscosityPaS: number
): number {
  return Math.abs(stiffnessNm) / (2 * PI * dragCoefficientNsM(radiusM, viscosityPaS));
}

/** Equipartition stiffness k = k_B T / <x^2>, N/m. */
export function stiffnessFromVariance(varianceM2: number, temperatureK: number): number {
  if (!(varianceM2 > 0)) return Number.NaN;
  return (K_B * temperatureK) / varianceM2;
}

/** Lorentzian displacement PSD S_x(f), m^2/Hz. */
export function lorentzianPsdM2Hz(
  frequencyHz: number,
  stiffnessNm: number,
  radiusM: number,
  viscosityPaS: number,
  temperatureK: number
): number {
  const gamma = dragCoefficientNsM(radiusM, viscosityPaS);
  const fc = Math.abs(stiffnessNm) / (2 * PI * gamma);
  return (
    (4 * K_B * temperatureK) /
    (gamma * (2 * PI) ** 2 * (frequencyHz * frequencyHz + fc * fc))
  );
}

/** Boltzmann density of x in a harmonic well, 1/m. */
export function boltzmannDensityPerM(
  xM: number,
  stiffnessNm: number,
  temperatureK: number
): number {
  const k = Math.abs(stiffnessNm);
  if (!(k > 0)) return Number.NaN;
  const sigma = Math.sqrt((K_B * temperatureK) / k);
  return (1 / (Math.sqrt(2 * PI) * sigma)) * Math.exp(-(xM * xM) / (2 * sigma * sigma));
}

export interface BrownianOptions {
  steps?: number;
  /** Time step, s. Defaults to 1/(60 f_c). */
  dt?: number;
  x0M?: number;
  externalForceN?: number;
}

export interface BrownianTrace {
  t: Float64Array;
  x: Float64Array;
  dt: number;
  steps: number;
  varianceM2: number;
  meanM: number;
  rmsM: number;
  /** k_B T / variance, N/m. NaN when the run is not bounded. */
  stiffnessMeasuredNm: number;
  /** Model stiffness supplied to the integrator, N/m. */
  stiffnessModelNm: number;
  cornerHz: number;
  diffusionM2S: number;
  temperatureK: number;
  radiusM: number;
  viscosityPaS: number;
}

/**
 * Overdamped Langevin (Euler–Maruyama) integration:
 *
 *   x_{n+1} = x_n + (-k x_n + F_ext) dt / gamma + sqrt(2 D dt) N(0,1)
 *
 * The harmonic force is exact only for |x| << w0. With k = 0 the particle
 * performs free Brownian motion, which is useful for comparison but has no
 * stationary variance.
 */
export function simulateBrownian(
  p: TweezersParams,
  seed: number | string,
  options: BrownianOptions = {}
): BrownianTrace {
  const stiffness = trapStiffnessNm(p);
  const radiusM = p.radiusM;
  const viscosityPaS = p.viscosityPaS;
  const temperatureK = p.temperatureK;
  const gamma = dragCoefficientNsM(radiusM, viscosityPaS);
  const diffusion = (K_B * temperatureK) / gamma;
  const fcModel = cornerFrequencyHz(stiffness, radiusM, viscosityPaS);

  const steps = Math.max(1000, Math.min(400000, Math.round(options.steps ?? 12000)));
  const dt =
    options.dt ??
    (Number.isFinite(fcModel) && fcModel > 0
      ? Math.min(1e-2, 1 / (60 * fcModel))
      : 1e-4);

  // Deterministic mulberry32 generator from the shared physics utilities.
  const rng = createRng(seed);
  const t = new Float64Array(steps);
  const x = new Float64Array(steps);
  const noise = Math.sqrt(2 * diffusion * dt);
  const external = options.externalForceN ?? 0;

  let position = options.x0M ?? 0;
  let mean = 0;
  let m2 = 0;
  for (let i = 0; i < steps; i++) {
    const force = -stiffness * position + external;
    const gaussian = randNormal(rng);
    position += (force / gamma) * dt + noise * gaussian;
    t[i] = i * dt;
    x[i] = position;
    // Welford accumulation for a numerically stable variance.
    const n = i + 1;
    const delta = position - mean;
    mean += delta / n;
    m2 += delta * (position - mean);
  }
  const variance = steps > 1 ? m2 / (steps - 1) : Number.NaN;

  return {
    t,
    x,
    dt,
    steps,
    varianceM2: variance,
    meanM: mean,
    rmsM: Math.sqrt(variance),
    stiffnessMeasuredNm: stiffnessFromVariance(variance, temperatureK),
    stiffnessModelNm: stiffness,
    cornerHz: fcModel,
    diffusionM2S: diffusion,
    temperatureK,
    radiusM,
    viscosityPaS
  };
}

/* -------------------------------------------------------------------------- */
/* Power spectral density                                                     */
/* -------------------------------------------------------------------------- */

export interface Periodogram {
  f: number[];
  s: number[];
}

/**
 * One-sided Hann-windowed periodogram of a uniformly sampled trace.
 * Frequencies are log-spaced, which is the useful presentation for a
 * Lorentzian that spans several decades.
 */
export function periodogram(
  xs: ArrayLike<number>,
  dt: number,
  bins = 72,
  fMin?: number,
  fMax?: number,
  segments = 8
): Periodogram {
  const n = xs.length;
  if (n < 16 || !(dt > 0)) return { f: [], s: [] };

  const requestedSegments = Math.max(1, Math.min(32, Math.round(segments)));
  let count = Math.min(requestedSegments, Math.floor(n / 512));
  if (count < 1) count = 1;
  const length = Math.floor(n / count);
  if (length < 16) return { f: [], s: [] };

  const nyquist = 0.5 / dt;
  const resolution = 1 / (length * dt);
  const low = Math.max(fMin ?? 2 * resolution, 2 * resolution, 1e-9);
  const high = Math.min(fMax ?? nyquist * 0.45, nyquist * 0.95);
  if (!(high > low)) return { f: [], s: [] };

  const frequencies: number[] = [];
  const logLow = Math.log(low);
  const logHigh = Math.log(high);
  for (let b = 0; b < bins; b++) {
    frequencies.push(Math.exp(logLow + ((logHigh - logLow) * b) / (bins - 1)));
  }

  const power = new Float64Array(bins);
  const window = new Float64Array(length);

  for (let seg = 0; seg < count; seg++) {
    const start = seg * length;
    let mean = 0;
    for (let i = 0; i < length; i++) mean += xs[start + i] ?? 0;
    mean /= length;

    let windowPower = 0;
    for (let i = 0; i < length; i++) {
      const w = 0.5 - 0.5 * Math.cos((2 * PI * i) / (length - 1));
      window[i] = w * ((xs[start + i] ?? 0) - mean);
      windowPower += w * w;
    }
    windowPower /= length;

    for (let b = 0; b < bins; b++) {
      const omega = 2 * PI * frequencies[b]! * dt;
      const cw = Math.cos(omega);
      const sw = Math.sin(omega);
      let cr = 1;
      let ci = 0;
      let re = 0;
      let im = 0;
      for (let i = 0; i < length; i++) {
        const value = window[i]!;
        re += value * cr;
        im -= value * ci;
        const nextCr = cr * cw - ci * sw;
        ci = cr * sw + ci * cw;
        cr = nextCr;
      }
      // Average the periodograms of the segments (Welch's method).
      power[b] = power[b]! + (((2 * dt) / (length * windowPower)) * (re * re + im * im)) / count;
    }
  }

  return { f: frequencies, s: Array.from(power) };
}

export interface LorentzianFit {
  cornerHz: number;
  plateauM2Hz: number;
  sse: number;
  points: number;
}

/**
 * Fit S(f) = A / (1 + (f/fc)^2) to a periodogram in log space.
 * The plateau A and corner fc are both free; a log-space residual weights
 * every decade of the roll-off comparably.
 */
export function fitLorentzianCorner(
  frequencies: readonly number[],
  densities: readonly number[],
  cornerHintHz: number
): LorentzianFit {
  const f: number[] = [];
  const y: number[] = [];
  for (let i = 0; i < Math.min(frequencies.length, densities.length); i++) {
    const fi = frequencies[i]!;
    const si = densities[i]!;
    if (fi > 0 && si > 0 && Number.isFinite(si)) {
      f.push(fi);
      y.push(Math.log(si));
    }
  }
  const points = f.length;
  if (points < 8 || !(cornerHintHz > 0)) {
    return { cornerHz: Number.NaN, plateauM2Hz: Number.NaN, sse: Number.NaN, points };
  }

  let bestFc = cornerHintHz;
  let bestLogA = 0;
  let bestSse = Number.POSITIVE_INFINITY;
  const lo = Math.log(cornerHintHz / 10);
  const hi = Math.log(cornerHintHz * 10);

  for (let t = 0; t <= 120; t++) {
    const fc = Math.exp(lo + ((hi - lo) * t) / 120);
    let logA = 0;
    for (let i = 0; i < points; i++) {
      const u = f[i]! / fc;
      logA += y[i]! + Math.log1p(u * u);
    }
    logA /= points;
    let sse = 0;
    for (let i = 0; i < points; i++) {
      const u = f[i]! / fc;
      const residual = y[i]! - (logA - Math.log1p(u * u));
      sse += residual * residual;
    }
    if (sse < bestSse) {
      bestSse = sse;
      bestFc = fc;
      bestLogA = logA;
    }
  }

  return {
    cornerHz: bestFc,
    plateauM2Hz: Math.exp(bestLogA),
    sse: bestSse,
    points
  };
}

export interface TraceAnalysis {
  periodogram: Periodogram;
  fit: LorentzianFit;
  psdModel: { f: number[]; s: number[] };
}

/** Periodogram plus a Lorentzian fit for a simulated trace. */
export function analyseTrace(trace: BrownianTrace, bins = 72): TraceAnalysis {
  const fMin = trace.cornerHz > 0 ? trace.cornerHz / 50 : 1 / (trace.steps * trace.dt);
  const fMax = trace.cornerHz > 0 ? trace.cornerHz * 60 : 0.45 / trace.dt;
  const pg = periodogram(trace.x, trace.dt, bins, fMin, fMax, 12);

  // Fit only up to a few corner frequencies. Far above the knee the Euler
  // scheme's white-noise floor and spectral leakage dominate, and including
  // those bins biases the fitted corner upward.
  const fitBand = trace.cornerHz > 0 ? trace.cornerHz * 8 : Infinity;
  const fitF: number[] = [];
  const fitS: number[] = [];
  for (let i = 0; i < pg.f.length; i++) {
    if (pg.f[i]! <= fitBand) {
      fitF.push(pg.f[i]!);
      fitS.push(pg.s[i]!);
    }
  }
  const fit =
    trace.cornerHz > 0
      ? fitLorentzianCorner(fitF, fitS, trace.cornerHz)
      : { cornerHz: Number.NaN, plateauM2Hz: Number.NaN, sse: Number.NaN, points: 0 };
  const psdModel = {
    f: pg.f,
    s: pg.f.map((f) =>
      trace.stiffnessModelNm > 0
        ? lorentzianPsdM2Hz(
            f,
            trace.stiffnessModelNm,
            trace.radiusM,
            trace.viscosityPaS,
            trace.temperatureK
          )
        : Number.NaN
    )
  };
  return { periodogram: pg, fit, psdModel };
}

/* -------------------------------------------------------------------------- */
/* Convenience bundle                                                         */
/* -------------------------------------------------------------------------- */

export interface DerivedMetrics {
  waistM: number;
  rayleighRangeM: number;
  divergenceRad: number;
  peakIntensityWm2: number;
  gradientAtBeadN: number;
  scatteringN: number;
  stiffnessNm: number;
  depthKt: number;
  cornerHz: number;
  diffusionM2S: number;
  escapeN: number;
  maxGradientN: number;
  stabilityRatio: number;
  attractive: boolean;
  sizeParameter: number;
}

export function deriveMetrics(p: TweezersParams, displacementM = 0): DerivedMetrics {
  const cm = clausiusMossotti(p.nParticle, p.nMedium);
  return {
    waistM: p.waistM,
    rayleighRangeM: rayleighRangeM(p),
    divergenceRad: divergenceRad(p),
    peakIntensityWm2: peakIntensityWm2(p),
    gradientAtBeadN: gradientForceN(p, displacementM),
    scatteringN: scatteringForceN(p, 0),
    stiffnessNm: trapStiffnessNm(p),
    depthKt: trapDepthKt(p),
    cornerHz: cornerFrequencyHz(trapStiffnessNm(p), p.radiusM, p.viscosityPaS),
    diffusionM2S: diffusionCoefficientM2S(p.radiusM, p.viscosityPaS, p.temperatureK),
    escapeN: escapeForceN(p),
    maxGradientN: maxGradientForceN(p),
    stabilityRatio: axialStabilityRatio(p),
    attractive: cm > 0,
    sizeParameter: sizeParameter(p)
  };
}
