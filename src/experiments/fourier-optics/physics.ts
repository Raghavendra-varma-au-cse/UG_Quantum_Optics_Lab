/**
 * Physics for the 4f spatial-filtering experiment.
 *
 * The model is deliberately narrow and explicit: a scalar, paraxial,
 * monochromatic field is sampled on an N × N grid, transformed with the
 * shared radix-2 FFT, multiplied by an ideal pupil mask at the Fourier plane,
 * and transformed back. A quadratic defocus phase models an object that is
 * not exactly at the front focal plane of L1; a magnification factor models
 * f2 / f1. Nothing else is claimed.
 *
 * Units are millimetres throughout the optical model (wavelengths are entered
 * in nanometres at the UI boundary and converted once). Spatial frequencies
 * are cycles per millimetre, mm⁻¹.
 */

import type { SimulationSpec } from "@/lib/content/types";
import {
  fft2,
  fftShift,
  imageToField,
  logMagnitude,
  magnitude,
  phase as fieldPhase,
  type FftField,
  type FilterKind,
  type PatternKind
} from "@/lib/physics/fourier";

/* -------------------------------------------------------------------------- */
/* Grid, patterns and labels                                                   */
/* -------------------------------------------------------------------------- */

export const FOURIER_GRID_SIZES = [128, 256] as const;
export type GridSize = (typeof FOURIER_GRID_SIZES)[number];

export const DEFAULT_OBJECT_WINDOW_MM = 12;
export const DEFAULT_FEATURE_MM = 1.5;
export const DEFAULT_WAVELENGTH_NM = 632.8;
export const DEFAULT_FOCAL_MM = 150;

export type ObjectPattern = Exclude<PatternKind, "custom">;

export const OBJECT_PATTERNS: readonly ObjectPattern[] = [
  "slits",
  "grating",
  "checker",
  "rings",
  "cross",
  "letterQ"
] as const;

export const PATTERN_LABELS: Record<ObjectPattern | "custom", string> = {
  slits: "Double slit",
  grating: "Grating",
  checker: "Checkerboard",
  rings: "Concentric rings",
  cross: "Cross",
  letterQ: "Letter Q",
  custom: "Uploaded image"
};

/** Feature size that makes each test object legible at the default window. */
export const PATTERN_DEFAULT_FEATURE_MM: Record<ObjectPattern, number> = {
  slits: 1.5,
  grating: 1,
  checker: 1.5,
  rings: 1,
  cross: 2,
  letterQ: 1
};

export const FILTER_LABELS: Record<FilterKind, string> = {
  none: "None (open pupil)",
  lowpass: "Low-pass (disk)",
  highpass: "High-pass (central block)",
  vertical: "Vertical slit",
  horizontal: "Horizontal slit",
  annulus: "Annulus (band-pass)",
  phase: "Phase plate"
};

export const FILTER_DESCRIPTIONS: Record<FilterKind, string> = {
  none: "Transmits every collected spatial frequency.",
  lowpass: "Keeps frequencies inside the disk; removes fine detail and sharp edges.",
  highpass: "Blocks the central disk; removes the background and emphasises edges.",
  vertical: "Keeps a narrow vertical strip near fx = 0; smears structure along x.",
  horizontal: "Keeps a narrow horizontal strip near fy = 0; smears structure along y.",
  annulus: "Keeps a ring of frequencies; isotropic band-pass edge enhancement.",
  phase: "Adds a controlled phase inside the disk — the Zernike phase-contrast geometry."
};

/* -------------------------------------------------------------------------- */
/* Public parameter and result types                                           */
/* -------------------------------------------------------------------------- */

export interface SimParams {
  pattern: PatternKind;
  /** Feature size in mm: slit separation, grating period or checker cell. */
  featureMm: number;
  gridN: GridSize;
  objectWindowMm: number;
  filter: FilterKind;
  /** Filter radius or half-width, normalised to the half-width of the Fourier plane. */
  filterRadius: number;
  /** Iris radius, normalised. Values ≥ 0.995 mean "open". */
  apertureRadius: number;
  /** Phase step in radians for the phase plate. */
  phaseShift: number;
  focalLength1Mm: number;
  focalLength2Mm: number;
  wavelengthNm: number;
  objectDistanceMm: number;
  /** Uploaded field, row-major, length gridN². */
  customField?: Float64Array | null;
}

export interface OpticalScale {
  n: number;
  objectWindowMm: number;
  objectPixelMm: number;
  /** Physical pitch in the Fourier plane: λ f₁ / L. */
  fourierPixelMm: number;
  fourierHalfWidthMm: number;
  /** Frequency pitch of the sampled object: 1 / L. */
  dfPerMm: number;
  fMaxPerMm: number;
  wavelengthMm: number;
  focalLength1Mm: number;
  focalLength2Mm: number;
  magnification: number;
  objectDistanceMm: number;
  defocusMm: number;
  filterCutoffPerMm: number;
  apertureCutoffPerMm: number;
  /** Highest spatial frequency actually passed by the combined mask and iris. */
  effectiveCutoffPerMm: number;
  na: number;
  /** Conventional Abbe limit λ/(2NA): oblique illumination or incoherent imaging. */
  abbeResolutionMm: number;
  /** Axial coherent cutoff period λ/NA, the limit of this simulation's pupil. */
  coherentResolutionMm: number;
  rayleighResolutionMm: number;
  fresnelNumber: number;
}

export interface SweepPoint {
  radius: number;
  energyPassed: number;
  contrast: number;
}

export interface SimResult {
  object: Float64Array;
  /** Centred, log-scaled |spectrum| normalised to [0,1]. */
  spectrum: Float64Array;
  /** Centred phase of the object spectrum in [−π, π]. */
  phase: Float64Array;
  /** Centred, log-scaled |filtered spectrum| normalised to [0,1]. */
  filtered: Float64Array;
  /** Magnified image intensity, normalised to a maximum of 1. */
  reconstruction: Float64Array;
  /** Central row of the reconstruction, normalised to [0,1]. */
  profile: Float64Array;
  scale: OpticalScale;
  contrast: number;
  energyPassed: number;
  peakFrequencyPerMm: number;
  peakPeriodMm: number;
  peakStrength: number;
  reconstructionError: number;
  sweep: SweepPoint[];
  warnings: string[];
  computeMs: number;
}

/* -------------------------------------------------------------------------- */
/* Worker protocol                                                             */
/* -------------------------------------------------------------------------- */

export interface SimulateRequest {
  type: "simulate";
  id: number;
  params: SimParams;
}

export interface SimulateResponse {
  type: "result";
  id: number;
  result: SimResult;
}

export interface SimulateErrorResponse {
  type: "error";
  id: number;
  message: string;
}

export type WorkerRequest = SimulateRequest;
export type WorkerResponse = SimulateResponse | SimulateErrorResponse;

/* -------------------------------------------------------------------------- */
/* Object generation                                                           */
/* -------------------------------------------------------------------------- */

const TAU = Math.PI * 2;

/**
 * Four-point supersampling inside each pixel. This keeps the hard edges of a
 * binary transparency from turning into pure aliasing in the spectrum.
 */
function sampleObject(
  n: number,
  windowMm: number,
  value: (xMm: number, yMm: number) => number
): Float64Array {
  const out = new Float64Array(n * n);
  const dx = windowMm / n;
  const half = windowMm / 2;
  const offsets = [-0.25, 0.25];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let acc = 0;
      for (const oy of offsets) {
        for (const ox of offsets) {
          const xm = (x + 0.5 + ox) * dx - half;
          const ym = (y + 0.5 + oy) * dx - half;
          acc += value(xm, ym);
        }
      }
      out[y * n + x] = acc / 4;
    }
  }
  return out;
}

/**
 * Analytic test objects. All are defined in physical millimetres so that the
 * feature-size control changes the object, not just its rendering.
 * Symmetric objects are exactly symmetric about the array centre.
 */
export function makeObjectField(options: {
  kind: PatternKind;
  n: number;
  windowMm: number;
  featureMm: number;
  customField?: Float64Array | null;
}): Float64Array {
  const { kind, n, windowMm } = options;
  const feature = Math.max(windowMm / n, options.featureMm);
  const dx = windowMm / n;

  if (kind === "custom") {
    const custom = options.customField;
    if (custom && custom.length === n * n) {
      const out = new Float64Array(n * n);
      for (let i = 0; i < out.length; i++) {
        const v = custom[i] ?? 0;
        out[i] = v < 0 ? 0 : v > 1 ? 1 : v;
      }
      return out;
    }
    return new Float64Array(n * n);
  }

  if (kind === "slits") {
    const slitWidth = Math.max(3 * dx, feature * 0.1);
    const halfHeight = 0.29 * windowMm;
    return sampleObject(n, windowMm, (x, y) => {
      if (Math.abs(y) > halfHeight) return 0;
      const d = Math.abs(Math.abs(x) - feature / 2);
      return d <= slitWidth / 2 ? 1 : 0;
    });
  }

  if (kind === "grating") {
    return sampleObject(n, windowMm, (x) => (Math.cos((TAU * x) / feature) >= 0 ? 1 : 0));
  }

  if (kind === "checker") {
    return sampleObject(n, windowMm, (x, y) =>
      Math.cos((TAU * x) / feature) * Math.cos((TAU * y) / feature) >= 0 ? 1 : 0
    );
  }

  if (kind === "rings") {
    const maxRadius = 0.44 * windowMm;
    return sampleObject(n, windowMm, (x, y) => {
      const r = Math.hypot(x, y);
      if (r > maxRadius) return 0;
      return Math.cos((TAU * r) / feature) >= 0 ? 1 : 0;
    });
  }

  if (kind === "cross") {
    const bar = Math.max(3 * dx, feature * 0.18);
    const arm = 0.3 * windowMm;
    return sampleObject(n, windowMm, (x, y) => {
      const vertical = Math.abs(x) <= bar / 2 && Math.abs(y) <= arm;
      const horizontal = Math.abs(y) <= bar / 2 && Math.abs(x) <= arm;
      return vertical || horizontal ? 1 : 0;
    });
  }

  // Letter Q: an annulus with a diagonal tail. Deliberately asymmetric so that
  // the phase spectrum has visible structure.
  return sampleObject(n, windowMm, (x, y) => {
    const r = Math.hypot(x, y);
    const ring = r <= 0.29 * windowMm && r >= 0.21 * windowMm;
    const tail = x > 0.17 * windowMm && y > 0.17 * windowMm && Math.abs(y - x) < 0.035 * windowMm;
    return ring || tail ? 1 : 0;
  });
}

/** Bilinear centre-aligned resampling, used when the FFT grid changes. */
export function resampleField(src: Float64Array, fromN: number, toN: number): Float64Array {
  if (fromN === toN) return src.slice();
  const out = new Float64Array(toN * toN);
  const scale = (fromN - 1) / Math.max(1, toN - 1);
  for (let y = 0; y < toN; y++) {
    const sy = y * scale;
    const y0 = Math.floor(sy);
    const y1 = Math.min(fromN - 1, y0 + 1);
    const fy = sy - y0;
    for (let x = 0; x < toN; x++) {
      const sx = x * scale;
      const x0 = Math.floor(sx);
      const x1 = Math.min(fromN - 1, x0 + 1);
      const fx = sx - x0;
      const a = src[y0 * fromN + x0] ?? 0;
      const b = src[y0 * fromN + x1] ?? 0;
      const c = src[y1 * fromN + x0] ?? 0;
      const d = src[y1 * fromN + x1] ?? 0;
      out[y * toN + x] = (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
    }
  }
  return out;
}

/** Re-exported so the client can reuse the shared image downsampler. */
export { imageToField };

/* -------------------------------------------------------------------------- */
/* Fourier-plane geometry                                                      */
/* -------------------------------------------------------------------------- */

/** Signed FFT bin index centred on zero, in [−n/2, n/2). */
function signedIndex(i: number, n: number): number {
  return i < n / 2 ? i : i - n;
}

export function opticalScale(params: SimParams): OpticalScale {
  const n = params.gridN;
  const L = params.objectWindowMm;
  const lambdaMm = params.wavelengthNm * 1e-6;
  const f1 = params.focalLength1Mm;
  const f2 = params.focalLength2Mm;
  const defocusMm = params.objectDistanceMm - f1;
  const fMaxPerMm = n / (2 * L);
  const apertureFraction = params.apertureRadius >= 0.995 ? 1 : params.apertureRadius;
  const apertureCutoffPerMm = apertureFraction * fMaxPerMm;
  const filterCutoffPerMm =
    params.filter === "none" ? apertureCutoffPerMm : Math.max(0, params.filterRadius) * fMaxPerMm;
  const filterMaxFraction =
    params.filter === "lowpass" || params.filter === "vertical" || params.filter === "horizontal"
      ? params.filterRadius
      : params.filter === "annulus"
        ? Math.min(1.2, params.filterRadius + 0.12)
        : 1;
  const effectiveCutoffPerMm = Math.min(apertureFraction, Math.max(0, filterMaxFraction)) * fMaxPerMm;
  const na = Math.sin(Math.atan(lambdaMm * effectiveCutoffPerMm));
  const fresnelNumber =
    params.objectDistanceMm > 0
      ? (L / 2) ** 2 / (lambdaMm * params.objectDistanceMm)
      : Number.POSITIVE_INFINITY;

  return {
    n,
    objectWindowMm: L,
    objectPixelMm: L / n,
    fourierPixelMm: (lambdaMm * f1) / L,
    fourierHalfWidthMm: (lambdaMm * f1) / L * (n / 2),
    dfPerMm: 1 / L,
    fMaxPerMm,
    wavelengthMm: lambdaMm,
    focalLength1Mm: f1,
    focalLength2Mm: f2,
    magnification: f2 / f1,
    objectDistanceMm: params.objectDistanceMm,
    defocusMm,
    filterCutoffPerMm,
    apertureCutoffPerMm,
    effectiveCutoffPerMm,
    na,
    abbeResolutionMm: na > 0 ? (0.5 * lambdaMm) / na : Number.POSITIVE_INFINITY,
    coherentResolutionMm: na > 0 ? lambdaMm / na : Number.POSITIVE_INFINITY,
    rayleighResolutionMm: na > 0 ? (0.61 * lambdaMm) / na : Number.POSITIVE_INFINITY,
    fresnelNumber
  };
}

/** Physical spatial frequency of a centred FFT bin. */
export function binFrequencyPerMm(index: number, n: number, windowMm: number): number {
  return signedIndex(index, n) / windowMm;
}

/* -------------------------------------------------------------------------- */
/* Pupil mask                                                                  */
/* -------------------------------------------------------------------------- */

export interface PupilMask {
  gain: Float64Array;
  phase: Float64Array;
}

/**
 * Build the complex pupil multiplier on the unshifted FFT grid.
 *
 * The defocus term is the standard quadratic phase at the back focal plane of
 * L1 for an object a distance d in front of the lens:
 *
 *   φ(fx, fy) = π λ (f₁ − d) (fx² + fy²)
 *
 * which vanishes at d = f₁ and leaves only a phase (no intensity change) when
 * no filter is present. The final image is held at the fixed 4f plane.
 */
export function buildPupil(params: SimParams): PupilMask {
  const n = params.gridN;
  const gain = new Float64Array(n * n);
  const phaseOut = new Float64Array(n * n);
  const L = params.objectWindowMm;
  const lambdaMm = params.wavelengthNm * 1e-6;
  const f1 = params.focalLength1Mm;
  const defocus = params.objectDistanceMm - f1;
  const radius = Math.max(0.005, Math.min(1.5, params.filterRadius));
  const aperture = params.apertureRadius >= 0.995 ? 1.5 : Math.max(0.01, params.apertureRadius);
  const annulusOuter = Math.min(1.45, radius + 0.12);
  const phaseStep = params.phaseShift;

  for (let y = 0; y < n; y++) {
    const my = signedIndex(y, n);
    const fy = my / L;
    const v = my / (n / 2);
    for (let x = 0; x < n; x++) {
      const mx = signedIndex(x, n);
      const fx = mx / L;
      const u = mx / (n / 2);
      const r = Math.hypot(u, v);
      let g = 1;
      let ph = 0;

      if (r > aperture) {
        g = 0;
      } else {
        switch (params.filter) {
          case "none":
            break;
          case "lowpass":
            if (r > radius) g = 0;
            break;
          case "highpass":
            if (r < radius) g = 0;
            break;
          case "vertical":
            if (Math.abs(u) > radius) g = 0;
            break;
          case "horizontal":
            if (Math.abs(v) > radius) g = 0;
            break;
          case "annulus":
            if (r < radius || r > annulusOuter) g = 0;
            break;
          case "phase":
            if (r <= radius) ph += phaseStep;
            break;
        }
      }

      if (g > 0 && defocus !== 0) {
        ph += -Math.PI * lambdaMm * defocus * (fx * fx + fy * fy);
      }

      const i = y * n + x;
      gain[i] = g;
      phaseOut[i] = ph;
    }
  }

  return { gain, phase: phaseOut };
}

export function applyPupil(field: FftField, mask: PupilMask): FftField {
  const n = field.size;
  const re = new Float64Array(n * n);
  const im = new Float64Array(n * n);
  for (let i = 0; i < re.length; i++) {
    const g = mask.gain[i] ?? 0;
    const ph = mask.phase[i] ?? 0;
    const a = field.re[i] ?? 0;
    const b = field.im[i] ?? 0;
    if (g === 0) continue;
    const c = Math.cos(ph);
    const s = Math.sin(ph);
    re[i] = g * (a * c - b * s);
    im[i] = g * (a * s + b * c);
  }
  return { re, im, size: n };
}

function sumSquares(re: Float64Array, im: Float64Array): number {
  let total = 0;
  for (let i = 0; i < re.length; i++) {
    const a = re[i] ?? 0;
    const b = im[i] ?? 0;
    total += a * a + b * b;
  }
  return total;
}

/* -------------------------------------------------------------------------- */
/* Measurements on the result                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Dominant spatial frequency of the object spectrum. The DC lobe and the
 * lowest three bins are excluded; the strongest remaining peak is refined by
 * a small magnitude-weighted centroid so that the reported period is not
 * quantised to 1/L.
 */
export function dominantFrequency(
  centredMagnitude: Float64Array,
  n: number,
  dfPerMm: number
): { frequency: number; strength: number } {
  const c = n / 2;
  const minRadius = Math.max(3, Math.round(n * 0.02));
  let best = 0;
  let bestX = 0;
  let bestY = 0;
  for (let y = 0; y < n; y++) {
    const my = y - c;
    for (let x = 0; x < n; x++) {
      const mx = x - c;
      if (mx * mx + my * my < minRadius * minRadius) continue;
      const v = centredMagnitude[y * n + x] ?? 0;
      if (v > best) {
        best = v;
        bestX = x;
        bestY = y;
      }
    }
  }
  if (best <= 0) return { frequency: 0, strength: 0 };

  // Magnitude-weighted centroid over a 5×5 neighbourhood of the peak.
  let sw = 0;
  let sf = 0;
  for (let dy = -2; dy <= 2; dy++) {
    const y = bestY + dy;
    if (y < 0 || y >= n) continue;
    for (let dx = -2; dx <= 2; dx++) {
      const x = bestX + dx;
      if (x < 0 || x >= n) continue;
      const v = centredMagnitude[y * n + x] ?? 0;
      if (v < 0.5 * best) continue;
      const f = Math.hypot(x - c, y - c) * dfPerMm;
      sf += f * v;
      sw += v;
    }
  }
  return { frequency: sw > 0 ? sf / sw : 0, strength: best };
}

function contrastOfIntensity(values: Float64Array): number {
  const n = values.length;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += values[i] ?? 0;
  const mean = sum / n;
  if (Math.abs(mean) < 1e-10) return 0;
  let variance = 0;
  for (let i = 0; i < n; i++) {
    const d = (values[i] ?? 0) - mean;
    variance += d * d;
  }
  return Math.sqrt(variance / n) / Math.abs(mean);
}

function normalizeMax(values: Float64Array): Float64Array {
  let max = 0;
  for (let i = 0; i < values.length; i++) max = Math.max(max, values[i] ?? 0);
  const out = new Float64Array(values.length);
  if (max <= 0) return out;
  for (let i = 0; i < values.length; i++) out[i] = (values[i] ?? 0) / max;
  return out;
}

/**
 * Image-plane sampling: a real 4f system inverts the image and magnifies it by
 * M = f₂/f₁. Pixel i sits at the image coordinate (i + 0.5 − N/2)·p, so the
 * corresponding object coordinate is −(i + 0.5 − N/2)·p/M. In index form the
 * geometric centre is N/2 − 0.5 and the source index is sc − (i − sc)/M.
 */
export function magnifyIntensity(src: Float64Array, n: number, magnification: number): Float64Array {
  const M = Math.abs(magnification);
  const out = new Float64Array(n * n);
  if (!Number.isFinite(M) || M <= 0) return out;
  const sc = n / 2 - 0.5;
  for (let y = 0; y < n; y++) {
    const sy = sc - (y - sc) / M;
    if (sy < 0 || sy > n - 1) continue;
    const y0 = Math.floor(sy);
    const y1 = Math.min(n - 1, y0 + 1);
    const fy = sy - y0;
    for (let x = 0; x < n; x++) {
      const sx = sc - (x - sc) / M;
      if (sx < 0 || sx > n - 1) continue;
      const x0 = Math.floor(sx);
      const x1 = Math.min(n - 1, x0 + 1);
      const fx = sx - x0;
      const a = src[y0 * n + x0] ?? 0;
      const b = src[y0 * n + x1] ?? 0;
      const cc = src[y1 * n + x0] ?? 0;
      const d = src[y1 * n + x1] ?? 0;
      out[y * n + x] = (a * (1 - fx) + b * fx) * (1 - fy) + (cc * (1 - fx) + d * fx) * fy;
    }
  }
  return out;
}

function centralProfile(intensity: Float64Array, n: number): Float64Array {
  const row = Math.floor(n / 2);
  const out = new Float64Array(n);
  let max = 0;
  for (let x = 0; x < n; x++) {
    const above = intensity[Math.max(0, row - 1) * n + x] ?? 0;
    const centre = intensity[row * n + x] ?? 0;
    const below = intensity[Math.min(n - 1, row + 1) * n + x] ?? 0;
    const v = (above + centre + below) / 3;
    out[x] = v;
    if (v > max) max = v;
  }
  if (max > 0) for (let x = 0; x < n; x++) out[x] = (out[x] ?? 0) / max;
  return out;
}

/* -------------------------------------------------------------------------- */
/* The simulation                                                              */
/* -------------------------------------------------------------------------- */

function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

/**
 * Run the sampled 4f pipeline. Deterministic: no stochastic input exists.
 *
 * Forward FFT → pupil mask → inverse FFT. The inverse transform is normalised
 * by N², so with an open pupil the complex reconstruction equals the object
 * field within floating-point error.
 */
export function simulateFourF(params: SimParams): SimResult {
  const started = now();
  const n = params.gridN;
  const L = params.objectWindowMm;
  const warnings: string[] = [];

  if (params.pattern === "custom") {
    const custom = params.customField;
    if (!custom || custom.length !== n * n) {
      warnings.push("No uploaded image is loaded at this grid size; the object plane is blank.");
    }
  }

  const object = makeObjectField({
    kind: params.pattern,
    n,
    windowMm: L,
    featureMm: params.featureMm,
    customField: params.customField
  });

  const input: FftField = { re: object.slice(), im: new Float64Array(n * n), size: n };
  const spectrumField = fft2(input, false);
  const centred = fftShift(spectrumField);

  const spectrum = logMagnitude(centred);
  const phaseSpectrum = fieldPhase(centred);
  const spectrumMagnitude = magnitude(centred);

  const mask = buildPupil(params);
  const filteredField = applyPupil(spectrumField, mask);
  const filtered = logMagnitude(fftShift(filteredField));

  const totalEnergy = sumSquares(spectrumField.re, spectrumField.im);
  const passedEnergy = sumSquares(filteredField.re, filteredField.im);
  const energyPassed = totalEnergy > 0 ? passedEnergy / totalEnergy : 0;

  const reconstructionField = fft2(filteredField, true);
  const rawIntensity = new Float64Array(n * n);
  for (let i = 0; i < rawIntensity.length; i++) {
    const re = reconstructionField.re[i] ?? 0;
    const im = reconstructionField.im[i] ?? 0;
    rawIntensity[i] = re * re + im * im;
  }

  const magnification = params.focalLength2Mm / params.focalLength1Mm;
  const magnified = magnifyIntensity(rawIntensity, n, magnification);
  const reconstruction = normalizeMax(magnified);
  const profile = centralProfile(magnified, n);
  const contrast = contrastOfIntensity(magnified);

  const df = 1 / L;
  const peak = dominantFrequency(spectrumMagnitude, n, df);
  const peakFrequencyPerMm = peak.frequency;
  const peakPeriodMm = peak.frequency > 0 ? 1 / peak.frequency : 0;

  // Compare with the ideally transformed object: inverted by the 4f geometry
  // and magnified by f₂/f₁, using the same sampling as the reconstruction.
  let errorAcc = 0;
  const objectSquared = new Float64Array(n * n);
  for (let i = 0; i < object.length; i++) objectSquared[i] = (object[i] ?? 0) ** 2;
  const expectedImage = magnifyIntensity(objectSquared, n, magnification);
  const objectMax = expectedImage.reduce((m, v) => Math.max(m, v), 0);
  const peakIntensity = magnified.reduce((m, v) => Math.max(m, v), 0);
  if (objectMax > 0 && peakIntensity > 0) {
    for (let i = 0; i < n * n; i++) {
      const expected = (expectedImage[i] ?? 0) / objectMax;
      const observed = (magnified[i] ?? 0) / peakIntensity;
      errorAcc += (observed - expected) ** 2;
    }
    errorAcc = Math.sqrt(errorAcc / (n * n));
  }

  const scale = opticalScale(params);

  if (Math.abs(scale.defocusMm) > 0.02 * params.focalLength1Mm) {
    warnings.push(
      `The object is ${scale.defocusMm.toFixed(1)} mm from L1's front focal plane; the image is defocused by the residual quadratic phase.`
    );
  }
  if (params.focalLength1Mm / L < 3) {
    warnings.push("Focal ratio below f/3: the paraxial and thin-lens approximations are stressed.");
  }
  if (params.featureMm < 4 * scale.objectPixelMm) {
    warnings.push("Feature size is below four sample pixels; the sampled object cannot represent it faithfully.");
  }
  if (params.filter !== "none" && params.filterRadius * scale.fMaxPerMm < 2 * scale.dfPerMm) {
    warnings.push("The filter cutoff is within two FFT bins of DC; the mask is coarse at this window.");
  }
  if (params.focalLength2Mm !== params.focalLength1Mm) {
    warnings.push(
      `f₂ / f₁ = ${scale.magnification.toFixed(2)}: the camera window shows a ${scale.magnification > 1 ? "magnified" : "reduced"} central region of the image.`
    );
  }

  const sweep = sweepContrast(params, spectrumField, rawIntensity.length, contrast);

  return {
    object,
    spectrum,
    phase: phaseSpectrum,
    filtered,
    reconstruction,
    profile,
    scale,
    contrast,
    energyPassed,
    peakFrequencyPerMm,
    peakPeriodMm,
    peakStrength: peak.strength,
    reconstructionError: errorAcc,
    sweep,
    warnings,
    computeMs: Math.round((now() - started) * 10) / 10
  };
}

/**
 * Contrast and transmitted energy as the filter radius is swept, reusing the
 * forward spectrum. This is what the "contrast vs radius" panel plots.
 */
function sweepContrast(
  params: SimParams,
  spectrumField: FftField,
  pixelCount: number,
  baseContrast: number
): SweepPoint[] {
  const points: SweepPoint[] = [];
  const total = sumSquares(spectrumField.re, spectrumField.im);
  const sweepAperture = params.filter === "none";
  const radii = sweepAperture
    ? Array.from({ length: 12 }, (_, i) => 0.04 + (i * 0.94) / 11)
    : Array.from({ length: 12 }, (_, i) => 0.04 + (i * 0.96) / 11);

  for (const radius of radii) {
    if (sweepAperture && radius >= 0.995) {
      points.push({ radius, energyPassed: 1, contrast: baseContrast });
      continue;
    }
    const mask = buildPupil(
      sweepAperture ? { ...params, apertureRadius: radius } : { ...params, filterRadius: radius }
    );
    const filteredField = applyPupil(spectrumField, mask);
    const passed = sumSquares(filteredField.re, filteredField.im);
    const recon = fft2(filteredField, true);
    const intensity = new Float64Array(pixelCount);
    for (let i = 0; i < pixelCount; i++) {
      const re = recon.re[i] ?? 0;
      const im = recon.im[i] ?? 0;
      intensity[i] = re * re + im * im;
    }
    points.push({
      radius,
      energyPassed: total > 0 ? passed / total : 0,
      contrast: contrastOfIntensity(intensity)
    });
  }
  return points;
}

/* -------------------------------------------------------------------------- */
/* Declared model (shared by the content and the simulator disclosure)         */
/* -------------------------------------------------------------------------- */

export const FOURIER_SIMULATION_SPEC: SimulationSpec = {
  model:
    "A scalar, paraxial, monochromatic field is sampled on a 128×128 or 256×256 grid over a 12 mm object window. The object transparency is Fourier-transformed with a radix-2 2D FFT, multiplied by an ideal thin-lens pupil mask (open, disk, central block, slit, annulus or phase step, with an optional circular iris) and transformed back to give the image. Lenses are ideal phase elements with focal lengths f₁ and f₂; an object distance d₁ ≠ f₁ adds the standard quadratic defocus phase at the pupil, and f₂/f₁ magnifies the output about the axis. The image is inverted, as in a real 4f geometry. The object window L fixes the frequency pitch 1/L and the maximum spatial frequency N/(2L); the Fourier-plane pitch is λf₁/L and a pupil coordinate x_f corresponds to f_x = x_f/(λf₁).",
  approximations: [
    "Scalar diffraction: polarisation and vector coupling are ignored.",
    "Paraxial (Fresnel) propagation and ideal thin lenses; no spherical aberration, coma, astigmatism or chromatic focal shift.",
    "Fully coherent, monochromatic illumination at the selected wavelength.",
    "The object is treated as a periodic tiling of period L (circular convolution), not as an isolated transparency.",
    "The image plane is fixed at the 4f plane; a non-focal object distance is represented only by its quadratic pupil phase.",
    "Camera response is ideal and linear; displayed images are normalised field intensities."
  ],
  validity: [
    "Object features larger than roughly four sample pixels (about 0.4 mm at 128² over 12 mm).",
    "Focal length much larger than the object and pupil dimensions, so sin θ ≈ tan θ.",
    "Filter and iris thin compared with the Rayleigh range of the focusing beam.",
    "Single transverse mode, single longitudinal mode laser illumination with a wavefront flat over the object.",
    "Wavelength and focal length set the scale; changing either rescales the Fourier plane as λf₁."
  ],
  exclusions: [
    "No lens aberrations, surface figure error, or chromatic response.",
    "No polarisation, birefringence, or vector diffraction.",
    "No partial coherence, finite linewidth, speckle, or multimode illumination.",
    "No detector noise, dark current, gamma, blooming, pixel MTF, or quantisation.",
    "No multiple reflections, ghost orders, dust, or stray light.",
    "No absolute photometric calibration: energies and contrasts are relative model quantities."
  ],
  validation: [
    "FFT of a delta is a constant magnitude; FFT of a constant is a delta.",
    "Inverse transform round-trip reproduces the input to floating-point precision.",
    "Parseval's theorem holds for every generated field.",
    "An open pupil reconstructs the object with normalised RMS error below 1e-6.",
    "The low-pass sweep reduces transmitted high-frequency energy and image contrast monotonically at small radii.",
    "The Web Worker and the synchronous fallback execute the same pure function and return identical arrays."
  ],
  stochastic: "None. The model is deterministic; repeating a parameter set reproduces the same field exactly."
};
