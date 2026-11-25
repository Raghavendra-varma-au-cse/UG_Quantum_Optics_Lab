/**
 * Two-beam interference, coherence and Michelson measurement relations.
 *
 * Model: scalar, monochromatic (or quasi-monochromatic) scalar fields,
 * perfectly polarised and spatially coherent across the observed aperture.
 * These assumptions are stated in each experiment's model disclosure.
 */

import { clamp } from "./complex";

export const SPEED_OF_LIGHT = 299_792_458; // m/s

/** Phase difference from an optical path difference. */
export function phaseFromOPD(opdM: number, wavelengthM: number): number {
  return (2 * Math.PI * opdM) / wavelengthM;
}

/** Optical path difference of a Michelson interferometer, in metres. */
export function michelsonOPD(arm1M: number, arm2M: number, index = 1): number {
  return 2 * index * (arm1M - arm2M);
}

/** Two-beam interference intensity, I = I1 + I2 + 2√(I1 I2) cos δ. */
export function twoBeamIntensity(i1: number, i2: number, phase: number, coherence = 1): number {
  return i1 + i2 + 2 * Math.sqrt(Math.max(0, i1 * i2)) * coherence * Math.cos(phase);
}

/** Michelson fringe visibility from the two returning intensities and coherence. */
export function fringeVisibility(i1: number, i2: number, coherence = 1): number {
  const sum = i1 + i2;
  if (sum === 0) return 0;
  return (2 * Math.sqrt(Math.max(0, i1 * i2)) / sum) * clamp(coherence, 0, 1);
}

/**
 * Coherence length of a source with a Gaussian spectral profile.
 * Lc = λ0² / Δλ (FWHM convention). Order-of-magnitude only for real sources.
 */
export function coherenceLength(wavelengthM: number, bandwidthM: number): number {
  if (bandwidthM <= 0) return Number.POSITIVE_INFINITY;
  return (wavelengthM * wavelengthM) / bandwidthM;
}

/** Coherence time τc = Lc / c. */
export function coherenceTime(coherenceLengthM: number): number {
  return coherenceLengthM / SPEED_OF_LIGHT;
}

/**
 * Gaussian-profile visibility envelope as a function of OPD.
 * Visibility falls to 1/e at |OPD| = Lc.
 */
export function visibilityEnvelope(opdM: number, coherenceLengthM: number): number {
  if (!Number.isFinite(coherenceLengthM)) return 1;
  const x = opdM / coherenceLengthM;
  return Math.exp(-x * x);
}

/** Wavelength from N fringes counted while a mirror moves Δd. */
export function wavelengthFromFringes(mirrorTravelM: number, fringeCount: number): number {
  if (fringeCount <= 0) return Number.NaN;
  return (2 * mirrorTravelM) / fringeCount;
}

/** Gas-cell refractive index from N fringes on evacuation/refill: n = 1 + Nλ/(2t). */
export function refractiveIndexFromFringes(
  fringeCount: number,
  wavelengthM: number,
  cellLengthM: number
): number {
  if (cellLengthM <= 0) return Number.NaN;
  return 1 + (fringeCount * wavelengthM) / (2 * cellLengthM);
}

/** Thermal expansion coefficient from N fringes over temperature rise ΔT. */
export function thermalExpansionCoefficient(
  fringeCount: number,
  wavelengthM: number,
  sampleLengthM: number,
  deltaTK: number
): number {
  if (sampleLengthM <= 0 || deltaTK === 0) return Number.NaN;
  return (fringeCount * wavelengthM) / (2 * sampleLengthM * deltaTK);
}

/**
 * Radius of the m-th circular fringe in the focal plane of a lens, for a
 * Michelson air gap d (Haidinger-type fringes): r_m ≈ f √(mλ/d).
 */
export function circularFringeRadius(focalM: number, order: number, wavelengthM: number, gapM: number): number {
  if (gapM <= 0) return Number.NaN;
  return focalM * Math.sqrt((order * wavelengthM) / gapM);
}

/** Fringe spacing for straight fringes from a mirror tilt angle α: Δx = λ/(2α). */
export function straightFringeSpacing(wavelengthM: number, tiltRad: number): number {
  if (tiltRad === 0) return Number.POSITIVE_INFINITY;
  return wavelengthM / (2 * Math.abs(tiltRad));
}

/** Number of fringes in a field of view for a tilt. */
export function fringesAcrossField(fieldM: number, wavelengthM: number, tiltRad: number): number {
  const spacing = straightFringeSpacing(wavelengthM, tiltRad);
  if (!Number.isFinite(spacing)) return 0;
  return fieldM / spacing;
}

export interface InterferencePatternParams {
  /** Width of the sampled field in metres. */
  fieldM: number;
  wavelengthM: number;
  /** Arm length difference (m). */
  armDifferenceM: number;
  /** Mirror tilt angle (rad), producing straight fringes. */
  tiltRad: number;
  /** Fractional coherence at zero OPD (0..1). */
  coherence: number;
  coherenceLengthM: number;
  /** Visibility balance term from unequal arm intensities (0..1). */
  balance: number;
  /** Beam intensity envelope radius as a fraction of field half-width. */
  envelope: number;
  /**
   * Optional focal length of the illuminating lens (m). When present, the
   * quadratic radial phase of a diverging illumination is included, producing
   * circular Haidinger fringes: OPD ≈ 2d − d r²/f². Without it the model
   * represents a collimated beam (straight fringes under tilt, uniform at
   * zero tilt).
   */
  radialFocalM?: number;
  samples: number;
}

/**
 * Sample the normalised Michelson intensity on a square grid.
 * Returns values in [0,1] with 1 = constructive maximum.
 */
export function michelsonPattern(p: InterferencePatternParams): Float32Array {
  const n = Math.max(16, p.samples);
  const out = new Float32Array(n * n);
  const half = p.fieldM / 2;
  for (let iy = 0; iy < n; iy++) {
    const y = (iy / (n - 1) - 0.5) * p.fieldM;
    for (let ix = 0; ix < n; ix++) {
      const x = (ix / (n - 1) - 0.5) * p.fieldM;
      const radiusSq = x * x + y * y;
      const radial = p.radialFocalM ? (p.armDifferenceM * radiusSq) / (p.radialFocalM * p.radialFocalM) : 0;
      const opd = 2 * p.armDifferenceM + 2 * p.tiltRad * x - radial;
      const envelope = Math.exp(-(x * x + y * y) / (2 * (p.envelope * half) ** 2));
      const coherence = p.coherence * visibilityEnvelope(opd, p.coherenceLengthM);
      const value = (1 + p.balance * coherence * Math.cos((2 * Math.PI * opd) / p.wavelengthM)) / 2;
      out[iy * n + ix] = clamp(value * (0.25 + 0.75 * envelope), 0, 1);
    }
  }
  return out;
}

/**
 * White-light channeled spectrum visibility envelope, Gaussian spectrum.
 * The envelope is the Fourier transform of the source spectrum.
 */
export function whiteLightVisibility(opdM: number, centralWavelengthM: number, bandwidthM: number): number {
  if (bandwidthM <= 0) return 1;
  const sigma = bandwidthM / (2 * Math.sqrt(2 * Math.log(2)));
  const arg = (Math.PI * sigma * opdM) / (centralWavelengthM * centralWavelengthM);
  return Math.exp(-0.5 * arg * arg);
}

/** Visibility for unequal beams including a coherence envelope. */
export function observedVisibility(
  intensityRatio: number,
  coherence: number,
  opdM: number,
  coherenceLengthM: number
): number {
  const r = Math.max(0, intensityRatio);
  const balance = (2 * Math.sqrt(r)) / (1 + r);
  return balance * coherence * visibilityEnvelope(opdM, coherenceLengthM);
}

/** Displacement sensitivity: one fringe corresponds to λ/2 of mirror travel. */
export function displacementPerFringe(wavelengthM: number): number {
  return wavelengthM / 2;
}
