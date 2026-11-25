/**
 * Michelson interferometer — physical model.
 *
 * All lengths are in metres, wavelengths in metres, angles in radians and
 * temperatures in kelvin unless a symbol explicitly says otherwise. The
 * functions are pure and deterministic: they contain no React, no timers and
 * no random numbers. Every formula is stated next to its implementation so the
 * content, the tests and the simulation can be checked against one another.
 *
 * Sign convention: d1 and d2 are the two arm lengths measured from the beam
 * splitter. The optical path difference is Δ = 2 n (d2 − d1); a positive Δ
 * therefore means arm 2 is longer. Only cos δ enters the ideal two-beam
 * intensity, so the sign of Δ changes the fringe order but not the fringe
 * contrast.
 */

import {
  circularFringeRadius,
  coherenceLength,
  displacementPerFringe,
  fringeVisibility,
  michelsonOPD,
  michelsonPattern,
  observedVisibility,
  phaseFromOPD,
  refractiveIndexFromFringes,
  straightFringeSpacing,
  thermalExpansionCoefficient,
  twoBeamIntensity,
  visibilityEnvelope,
  wavelengthFromFringes,
  whiteLightVisibility
} from "@/lib/physics/interference";
import { propagateProduct } from "@/lib/physics/stats";

/* -------------------------------------------------------------------------- */
/* Source presets                                                              */
/* -------------------------------------------------------------------------- */

export type SourceId = "hene" | "dpss532" | "led" | "white";

export interface SourcePreset {
  id: SourceId;
  /** Full label used in prose and tables. */
  label: string;
  /** Compact label for segmented controls. */
  short: string;
  wavelengthNm: number;
  /** FWHM spectral width in nanometres. */
  bandwidthNm: number;
  /** Phenomenological source coherence factor, 0..1. */
  coherence: number;
  note: string;
}

/**
 * Representative teaching sources. The bandwidths are typical values chosen to
 * make the coherence-length difference visible; they are not datasheet claims
 * for a specific purchased unit. The physical kit must be checked against its
 * own labels.
 */
export const SOURCE_PRESETS: readonly SourcePreset[] = [
  {
    id: "hene",
    label: "Helium–neon laser, 632.8 nm",
    short: "HeNe",
    wavelengthNm: 632.8,
    bandwidthNm: 0.002,
    coherence: 0.98,
    note: "Narrow line; coherence length of order 0.2 m for a 0.002 nm FWHM envelope."
  },
  {
    id: "dpss532",
    label: "Diode-pumped solid-state laser, 532 nm",
    short: "532",
    wavelengthNm: 532,
    bandwidthNm: 0.1,
    coherence: 0.96,
    note: "Green line; a 0.1 nm envelope gives a coherence length of a few millimetres."
  },
  {
    id: "led",
    label: "Green LED, 530 nm, 30 nm FWHM",
    short: "LED",
    wavelengthNm: 530,
    bandwidthNm: 30,
    coherence: 0.9,
    note: "Broad line; fringes are confined to a few tens of micrometres of OPD."
  },
  {
    id: "white",
    label: "White-light source, 550 nm, 200 nm FWHM",
    short: "White",
    wavelengthNm: 550,
    bandwidthNm: 200,
    coherence: 0.85,
    note: "Very short coherence; only a handful of coloured fringes near zero OPD."
  }
];

export function getSourcePreset(id: SourceId): SourcePreset {
  return SOURCE_PRESETS.find((source) => source.id === id) ?? SOURCE_PRESETS[0]!;
}

/* -------------------------------------------------------------------------- */
/* Geometry constants used by the fringe renderer                              */
/* -------------------------------------------------------------------------- */

/** Width of the sampled observation field (square), in metres. */
export const FIELD_M = 0.016;
/** Effective radius of curvature of the wavefront mismatch for circular fringes, in metres. */
export const CURVATURE_RADIUS_M = 20;
/** Sampling grid per side for the rendered fringe field. */
export const PATTERN_SAMPLES = 256;

/* -------------------------------------------------------------------------- */
/* Basic relations                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Δ = 2 n (d2 − d1). Round trip in each arm gives the factor two.
 *
 * The shared helper `michelsonOPD` is written with the opposite argument
 * convention, 2 n (arm1 − arm2), so the arguments are swapped here to keep
 * this module and the written content on the same definition.
 */
export function opticalPathDifferenceM(arm1M: number, arm2M: number, index = 1): number {
  return michelsonOPD(arm2M, arm1M, index);
}

/** δ = 2πΔ/λ. */
export function phaseAtOpd(opdM: number, wavelengthM: number): number {
  if (wavelengthM <= 0) return Number.NaN;
  return phaseFromOPD(opdM, wavelengthM);
}

/** Fringe order m = Δ/λ; not rounded, so the fractional part carries the phase. */
export function fringeOrderAt(opdM: number, wavelengthM: number): number {
  if (wavelengthM <= 0) return Number.NaN;
  return opdM / wavelengthM;
}

/** Distance of the current phase from the nearest integer fringe order, 0..0.5. */
export function fractionalFringeAt(opdM: number, wavelengthM: number): number {
  const order = fringeOrderAt(opdM, wavelengthM);
  if (!Number.isFinite(order)) return Number.NaN;
  return Math.abs(order - Math.round(order));
}

/** Number of fringes crossing a fixed point when one mirror moves by travel. N = 2|Δd|/λ. */
export function fringesForTravel(travelM: number, wavelengthM: number): number {
  if (wavelengthM <= 0) return Number.NaN;
  return (2 * Math.abs(travelM)) / wavelengthM;
}

/** Mirror travel needed for N fringes: Δd = N λ/2. */
export function travelForFringes(fringeCount: number, wavelengthM: number): number {
  return (Math.abs(fringeCount) * wavelengthM) / 2;
}

/** λ = 2Δd/N. */
export function wavelengthFromScan(mirrorTravelM: number, fringeCount: number): number {
  return wavelengthFromFringes(Math.abs(mirrorTravelM), Math.abs(fringeCount));
}

/** One fringe corresponds to λ/2 of mirror travel. */
export function displacementPerFringeM(wavelengthM: number): number {
  return displacementPerFringe(wavelengthM);
}

/** Lc = λ²/Δλ (Gaussian FWHM convention, as in the shared module). */
export function coherenceLengthOf(wavelengthM: number, bandwidthM: number): number {
  return coherenceLength(wavelengthM, bandwidthM);
}

/** Gaussian coherence envelope exp[−(Δ/Lc)²]. */
export function coherenceEnvelopeAt(opdM: number, coherenceLengthM: number): number {
  return visibilityEnvelope(opdM, coherenceLengthM);
}

/** Channeled-spectrum envelope for a Gaussian white-light spectrum. */
export function whiteLightFringeVisibility(opdM: number, wavelengthM: number, bandwidthM: number): number {
  return whiteLightVisibility(opdM, wavelengthM, bandwidthM);
}

/* -------------------------------------------------------------------------- */
/* Visibility                                                                  */
/* -------------------------------------------------------------------------- */

/** Balanced-beam visibility factor 2√r/(1+r) for intensity ratio r = I1/I2. */
export function balanceVisibility(intensityRatio: number): number {
  const ratio = Math.max(0, intensityRatio);
  const sum = 1 + ratio;
  if (sum === 0) return 0;
  return (2 * Math.sqrt(ratio)) / sum;
}

/** V = 2√(I1 I2)/(I1 + I2) · |γ|. */
export function visibilityFromIntensities(i1: number, i2: number, coherence = 1): number {
  return fringeVisibility(i1, i2, coherence);
}

/** Observed visibility including the arm imbalance and the coherence envelope. */
export function observedVisibilityAt(
  intensityRatio: number,
  coherence: number,
  opdM: number,
  coherenceLengthM: number
): number {
  return observedVisibility(intensityRatio, coherence, opdM, coherenceLengthM);
}

/**
 * Normalised two-beam intensity at an optical path difference.
 *
 * I/I_max = ½ [1 + V cos δ], with V = balance · coherence · exp[−(Δ/Lc)²].
 * Implemented through the shared two-beam expression with I1 = I2 = ½, which
 * gives 1 + V cos δ, then divided by two.
 */
export function intensityAtOpd(
  opdM: number,
  wavelengthM: number,
  coherenceLengthM: number,
  coherence: number,
  intensityRatio = 1
): number {
  if (wavelengthM <= 0) return Number.NaN;
  const envelope = visibilityEnvelope(opdM, coherenceLengthM);
  const effective = coherence * envelope * balanceVisibility(intensityRatio);
  return twoBeamIntensity(0.5, 0.5, phaseAtOpd(opdM, wavelengthM), effective) / 2;
}

/* -------------------------------------------------------------------------- */
/* Fringe geometry                                                             */
/* -------------------------------------------------------------------------- */

export type FringeGeometry = "circular" | "straight";

/** Straight-fringe spacing Δx = λ/(2α). */
export function fringeSpacingM(wavelengthM: number, tiltRad: number): number {
  return straightFringeSpacing(wavelengthM, tiltRad);
}

/** Number of straight fringes across a field of width w. */
export function fringesAcrossFieldM(fieldM: number, wavelengthM: number, tiltRad: number): number {
  const spacing = straightFringeSpacing(wavelengthM, tiltRad);
  if (!Number.isFinite(spacing) || spacing <= 0) return 0;
  return fieldM / spacing;
}

/** Radius of circular fringe m for focal length f and effective gap d: r_m ≈ f√(mλ/d). */
export function ringRadiusM(focalM: number, order: number, wavelengthM: number, gapM: number): number {
  return circularFringeRadius(focalM, order, wavelengthM, gapM);
}

/**
 * Number of circular fringes between the centre and the edge of the field when
 * the phase is quadratic with curvature radius R: Δ(r) = Δ0 + r²/(2R), so the
 * ring count is (w/2)² / (2 R λ).
 */
export function ringsAcrossFieldM(
  fieldM: number,
  wavelengthM: number,
  curvatureRadiusM = CURVATURE_RADIUS_M
): number {
  if (wavelengthM <= 0 || curvatureRadiusM <= 0) return Number.NaN;
  const half = fieldM / 2;
  return (half * half) / (2 * curvatureRadiusM * wavelengthM);
}

export interface FringeFieldOptions {
  /** d2 − d1 in metres. */
  armDifferenceM: number;
  wavelengthM: number;
  bandwidthM: number;
  /** Source coherence factor 0..1. */
  coherence: number;
  /** Intensity ratio I1/I2 used for the balance factor. */
  intensityRatio: number;
  /** Mirror tilt in radians; used for straight fringes. */
  tiltRad: number;
  geometry: FringeGeometry;
  fieldM?: number;
  samples?: number;
  curvatureRadiusM?: number;
}

export interface FringeField {
  values: Float32Array;
  fieldM: number;
  samples: number;
}

/**
 * Sample the normalised fringe field for the renderer.
 *
 * Straight fringes: the shared `michelsonPattern` is used, with the OPD
 * Δ(x) = 2d + 2αx and a Gaussian coherence envelope.
 *
 * Circular fringes: a local radial phase Δ(r) = 2d + r²/(2R) is used. This is
 * the quadratic (defocus) approximation to a wavefront-curvature mismatch and
 * reduces to the familiar ring pattern. The intensity still comes from the
 * shared two-beam expression.
 */
export function buildFringeField(options: FringeFieldOptions): FringeField {
  const fieldM = options.fieldM ?? FIELD_M;
  const samples = Math.max(16, Math.round(options.samples ?? PATTERN_SAMPLES));
  const coherenceLengthM = coherenceLengthOf(options.wavelengthM, options.bandwidthM);
  const balance = balanceVisibility(options.intensityRatio);

  if (options.geometry === "straight") {
    const values = michelsonPattern({
      fieldM,
      wavelengthM: options.wavelengthM,
      armDifferenceM: options.armDifferenceM,
      tiltRad: options.tiltRad,
      coherence: options.coherence,
      coherenceLengthM,
      balance,
      envelope: 0.92,
      samples
    });
    return { values, fieldM, samples };
  }

  const out = new Float32Array(samples * samples);
  const half = fieldM / 2;
  const radius = Math.max(1e-3, options.curvatureRadiusM ?? CURVATURE_RADIUS_M);
  const sigma = 0.92 * half;

  for (let iy = 0; iy < samples; iy++) {
    const y = (iy / (samples - 1) - 0.5) * fieldM;
    for (let ix = 0; ix < samples; ix++) {
      const x = (ix / (samples - 1) - 0.5) * fieldM;
      const r2 = x * x + y * y;
      const opd = 2 * options.armDifferenceM + r2 / (2 * radius);
      const envelope = Math.exp(-r2 / (2 * sigma * sigma));
      const visibility = options.coherence * coherenceEnvelopeAt(opd, coherenceLengthM) * balance;
      const intensity = twoBeamIntensity(0.5, 0.5, phaseAtOpd(opd, options.wavelengthM), visibility) / 2;
      const masked = intensity * (0.25 + 0.75 * envelope);
      out[iy * samples + ix] = Math.max(0, Math.min(1, masked));
    }
  }
  return { values: out, fieldM, samples };
}

/* -------------------------------------------------------------------------- */
/* Gas cell                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Typical refractive index of dry air minus one at 1 atm and about 20 °C,
 * around 633 nm. Used only as an order-of-magnitude comparison; the actual
 * value depends on temperature, pressure, humidity and CO2 content.
 */
export const AIR_INDEX_MINUS_ONE_1ATM = 2.74e-4;

/** n = 1 + Nλ/(2t) from N fringes on evacuation or refill of a cell of length t. */
export function gasCellIndexFromFringes(
  fringeCount: number,
  wavelengthM: number,
  cellLengthM: number
): number {
  return refractiveIndexFromFringes(Math.abs(fringeCount), wavelengthM, cellLengthM);
}

/** Inverse relation: N = 2 t (n − 1)/λ. */
export function gasCellFringes(indexMinusOne: number, wavelengthM: number, cellLengthM: number): number {
  if (wavelengthM <= 0) return Number.NaN;
  return (2 * cellLengthM * indexMinusOne) / wavelengthM;
}

/* -------------------------------------------------------------------------- */
/* Thermal expansion                                                           */
/* -------------------------------------------------------------------------- */

/** α = Nλ/(2LΔT) for a sample of length L heated by ΔT. */
export function thermalExpansionFromFringes(
  fringeCount: number,
  wavelengthM: number,
  sampleLengthM: number,
  deltaTK: number
): number {
  return thermalExpansionCoefficient(Math.abs(fringeCount), wavelengthM, sampleLengthM, deltaTK);
}

/** Inverse relation: N = 2 α L ΔT / λ. */
export function thermalFringes(
  alphaPerK: number,
  sampleLengthM: number,
  deltaTK: number,
  wavelengthM: number
): number {
  if (wavelengthM <= 0) return Number.NaN;
  return (2 * alphaPerK * sampleLengthM * deltaTK) / wavelengthM;
}

/* -------------------------------------------------------------------------- */
/* Uncertainty                                                                 */
/* -------------------------------------------------------------------------- */

export interface WavelengthUncertainty {
  /** Relative standard uncertainty σλ/λ. */
  relative: number;
  /** Absolute standard uncertainty in metres. */
  absolute: number;
}

/**
 * σλ/λ = √[(σ_Δd/Δd)² + (σ_N/N)²].
 *
 * This treats the wavelength as λ = 2Δd/N and assumes the travel and count
 * uncertainties are independent. It excludes source drift and index changes,
 * which are systematic and must be budgeted separately.
 */
export function wavelengthUncertainty(
  wavelengthM: number,
  travelM: number,
  travelSigmaM: number,
  fringeCount: number,
  countSigma: number
): WavelengthUncertainty {
  if (travelM === 0 || fringeCount === 0) {
    return { relative: Number.NaN, absolute: Number.NaN };
  }
  const relativeTravel = travelSigmaM / Math.abs(travelM);
  const relativeCount = countSigma / Math.abs(fringeCount);
  const relative = propagateProduct([relativeTravel, relativeCount]);
  return { relative, absolute: relative * wavelengthM };
}
