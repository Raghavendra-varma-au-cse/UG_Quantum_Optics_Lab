/**
 * Gaussian beams, optical forces and Brownian motion for the optical tweezers
 * experiment.
 *
 * Force model: point dipole / Rayleigh regime (a ≪ λ). The gradient force is
 *  F_grad = (n_m α / 2c) ∇I,  α = 4π ε0 a³ (m²−1)/(m²+2), m = n_p/n_m
 * and the scattering force is F_scat = n_m σ I / c with the Rayleigh cross
 * section σ = (128π⁵ a⁶ / 3λ⁴) ((m²−1)/(m²+2))².
 *
 * These approximations fail for particles comparable to the wavelength and for
 * high-NA tightly focused beams; the simulation states this explicitly and
 * does not claim quantitative agreement with a real trap.
 */

export const K_B = 1.380649e-23; // J/K
export const EPS0 = 8.8541878128e-12; // F/m
export const PI = Math.PI;

export interface BeamParams {
  wavelengthM: number;
  waistM: number;
  powerW: number;
  indexMedium?: number;
}

/** Rayleigh range z_R = π w₀² n / λ. */
export function rayleighRange(p: BeamParams): number {
  const n = p.indexMedium ?? 1;
  return (PI * p.waistM * p.waistM * n) / p.wavelengthM;
}

/** Beam radius w(z). */
export function beamRadius(p: BeamParams, z: number): number {
  const zr = rayleighRange(p);
  return p.waistM * Math.sqrt(1 + (z / zr) ** 2);
}

/** Far-field half-angle divergence θ = λ/(π w₀ n). */
export function divergence(p: BeamParams): number {
  const n = p.indexMedium ?? 1;
  return p.wavelengthM / (PI * p.waistM * n);
}

/** Numerical aperture from a focusing half-angle. */
export function numericalAperture(halfAngleRad: number, indexMedium = 1): number {
  return indexMedium * Math.sin(halfAngleRad);
}

/** Waist produced by an objective of given NA: w₀ ≈ 0.61 λ / NA (diffraction limit). */
export function diffractionLimitedWaist(wavelengthM: number, na: number): number {
  return (0.61 * wavelengthM) / Math.max(1e-6, na);
}

/** On-axis intensity I(0,z) = 2P/(π w(z)²). */
export function onAxisIntensity(p: BeamParams, z = 0): number {
  const w = beamRadius(p, z);
  return (2 * p.powerW) / (PI * w * w);
}

/** Radial intensity I(r,z) = 2P/(πw²) exp(−2r²/w²). */
export function intensity(p: BeamParams, r: number, z = 0): number {
  const w = beamRadius(p, z);
  return ((2 * p.powerW) / (PI * w * w)) * Math.exp((-2 * r * r) / (w * w));
}

/** Peak intensity at the focus. */
export function peakIntensity(p: BeamParams): number {
  return (2 * p.powerW) / (PI * p.waistM * p.waistM);
}

/** Clausius–Mossotti factor (m²−1)/(m²+2). */
export function clausiusMossotti(nParticle: number, nMedium: number): number {
  const m = nParticle / nMedium;
  return (m * m - 1) / (m * m + 2);
}

/** Electric-dipole polarisability of a sphere, in SI (C m²/V). */
export function polarizability(radiusM: number, nParticle: number, nMedium: number): number {
  return 4 * PI * EPS0 * radiusM ** 3 * clausiusMossotti(nParticle, nMedium);
}

export interface ForceParams {
  wavelengthM: number;
  waistM: number;
  powerW: number;
  radiusM: number;
  nParticle: number;
  nMedium: number;
}

/**
 * Gradient force magnitude at radial offset r, directed toward the focus for
 * n_p > n_m. Positive value = inward (trapping).
 */
export function gradientForce(fp: ForceParams, r: number): number {
  const alpha = polarizability(fp.radiusM, fp.nParticle, fp.nMedium);
  const w = fp.waistM;
  const i0 = (2 * fp.powerW) / (PI * w * w);
  const dIdr = ((-4 * r) / (w * w)) * i0 * Math.exp((-2 * r * r) / (w * w));
  const cMedium = 299_792_458 / fp.nMedium;
  return -((fp.nMedium * alpha) / (2 * cMedium)) * dIdr;
}

/** Scattering force along propagation, in newtons. */
export function scatteringForce(fp: ForceParams, r = 0): number {
  const sigma =
    ((128 * PI ** 5 * fp.radiusM ** 6) / (3 * fp.wavelengthM ** 4)) *
    clausiusMossotti(fp.nParticle, fp.nMedium) ** 2;
  const i = intensity(
    { wavelengthM: fp.wavelengthM, waistM: fp.waistM, powerW: fp.powerW, indexMedium: fp.nMedium },
    r,
    0
  );
  return (fp.nMedium * sigma * i) / 299_792_458;
}

/**
 * Transverse trap stiffness near the focus, k = 2 n_m α I₀ / (c w₀²) [N/m].
 * Derived from F ≈ −k r for r ≪ w₀.
 */
export function trapStiffness(fp: ForceParams): number {
  const alpha = polarizability(fp.radiusM, fp.nParticle, fp.nMedium);
  const cMedium = 299_792_458 / fp.nMedium;
  return (2 * fp.nMedium * alpha * peakIntensity({ wavelengthM: fp.wavelengthM, waistM: fp.waistM, powerW: fp.powerW })) / (cMedium * fp.waistM ** 2);
}

/** Maximum inward gradient force (occurs at r = w/2). */
export function maxGradientForce(fp: ForceParams): number {
  const alpha = polarizability(fp.radiusM, fp.nParticle, fp.nMedium);
  const cMedium = 299_792_458 / fp.nMedium;
  const i0 = peakIntensity({ wavelengthM: fp.wavelengthM, waistM: fp.waistM, powerW: fp.powerW });
  return ((fp.nMedium * alpha) / (2 * cMedium)) * ((2 * i0) / fp.waistM) * Math.exp(-0.5);
}

/** Escape force estimate: maximum gradient force minus scattering force. */
export function escapeForce(fp: ForceParams): number {
  return maxGradientForce(fp) - scatteringForce(fp, 0);
}

/** Stokes drag coefficient γ = 6π η a for a sphere in a medium. */
export function dragCoefficient(radiusM: number, viscosityPaS: number): number {
  return 6 * PI * viscosityPaS * radiusM;
}

/** Diffusion coefficient D = k_B T / γ. */
export function diffusionCoefficient(radiusM: number, viscosityPaS: number, temperatureK: number): number {
  return K_B * temperatureK / dragCoefficient(radiusM, viscosityPaS);
}

/** Equipartition stiffness k = k_B T / ⟨x²⟩. */
export function stiffnessFromVariance(varianceM2: number, temperatureK: number): number {
  if (varianceM2 <= 0) return Number.NaN;
  return (K_B * temperatureK) / varianceM2;
}

/** Corner frequency of the Lorentzian power spectral density. */
export function cornerFrequency(stiffness: number, radiusM: number, viscosityPaS: number): number {
  return stiffness / (2 * PI * dragCoefficient(radiusM, viscosityPaS));
}

/** Lorentzian PSD of a trapped Brownian particle: S(f) in m²/Hz. */
export function psdLorentzian(
  frequencyHz: number,
  stiffness: number,
  radiusM: number,
  viscosityPaS: number,
  temperatureK: number
): number {
  const gamma = dragCoefficient(radiusM, viscosityPaS);
  const fc = stiffness / (2 * PI * gamma);
  return (2 * K_B * temperatureK * gamma) / (gamma * gamma * (2 * PI) ** 2 * (frequencyHz * frequencyHz + fc * fc));
}

/**
 * Overdamped Langevin integration (Euler–Maruyama) of a particle in a
 * harmonic trap plus constant offset force.
 *
 *   x_{n+1} = x_n + (F(x_n)/γ) dt + √(2 D dt) N(0,1)
 *
 * The harmonic approximation is only valid for |x| ≪ w₀.
 */
export interface BrownianParams {
  stiffness: number;
  radiusM: number;
  viscosityPaS: number;
  temperatureK: number;
  dt: number;
  steps: number;
  x0?: number;
  /** Constant external force (N), e.g. from a flow. */
  externalForce?: number;
}

export function simulateBrownian(
  p: BrownianParams,
  rng: () => number
): { t: number[]; x: number[]; variance: number; mean: number } {
  const gamma = dragCoefficient(p.radiusM, p.viscosityPaS);
  const D = (K_B * p.temperatureK) / gamma;
  const noise = Math.sqrt(2 * D * p.dt);
  const xs: number[] = [];
  const ts: number[] = [];
  let x = p.x0 ?? 0;
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < p.steps; i++) {
    // Box–Muller normal
    let u = 0;
    let v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    const n = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    const force = -p.stiffness * x + (p.externalForce ?? 0);
    x += (force / gamma) * p.dt + noise * n;
    xs.push(x);
    ts.push(i * p.dt);
    sum += x;
    sumSq += x * x;
  }
  const n = xs.length || 1;
  const meanX = sum / n;
  const variance = sumSq / n - meanX * meanX;
  return { t: ts, x: xs, variance, mean: meanX };
}

/** Boltzmann probability density of the trap potential U = ½ k x². */
export function boltzmannDensity(x: number, stiffness: number, temperatureK: number): number {
  const sigma = Math.sqrt((K_B * temperatureK) / stiffness);
  return (1 / (Math.sqrt(2 * PI) * sigma)) * Math.exp(-(x * x) / (2 * sigma * sigma));
}

/** Optical trap potential U(r) = −(n_m α / 2c) I(r), in joules. */
export function trapPotential(fp: ForceParams, r: number): number {
  const alpha = polarizability(fp.radiusM, fp.nParticle, fp.nMedium);
  const cMedium = 299_792_458 / fp.nMedium;
  const i = intensity(
    { wavelengthM: fp.wavelengthM, waistM: fp.waistM, powerW: fp.powerW, indexMedium: fp.nMedium },
    r,
    0
  );
  return -((fp.nMedium * alpha) / (2 * cMedium)) * i;
}

/** Depth of the trap in units of k_B T. */
export function trapDepthInKt(fp: ForceParams, temperatureK: number): number {
  return Math.abs(trapPotential(fp, 0) - trapPotential(fp, 4 * fp.waistM)) / (K_B * temperatureK);
}

/** Photon recoil force for a fully absorbed beam of power P: F = P/c. */
export function photonPressureForce(powerW: number): number {
  return powerW / 299_792_458;
}

/** Axial trapping stability heuristic: scattering must not exceed gradient. */
export function axialStabilityRatio(fp: ForceParams): number {
  const scattering = scatteringForce(fp, 0);
  const gradient = maxGradientForce(fp);
  return gradient > 0 ? scattering / gradient : Number.POSITIVE_INFINITY;
}
