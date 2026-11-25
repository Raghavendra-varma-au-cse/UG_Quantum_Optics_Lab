/**
 * Numerical Fourier optics for the 4f processor.
 *
 * Implements a radix-2 2D FFT (and inverse) and the operations used by a
 * coherent 4f spatial-filtering system in the Fraunhofer approximation:
 *
 *   object → lens 1 → Fourier plane (multiply by filter) → lens 2 → image.
 *
 * The field at the Fourier plane is the discrete Fourier transform of the
 * object field; the reconstruction is the inverse transform of the filtered
 * spectrum. Pixel pitch and lens focal length convert array coordinates to
 * spatial frequencies. This is a scalar, paraxial, unity-magnification model.
 */

export type PatternKind =
  | "slits"
  | "grating"
  | "checker"
  | "rings"
  | "letterQ"
  | "cross"
  | "custom";

export type FilterKind = "none" | "lowpass" | "highpass" | "vertical" | "horizontal" | "annulus" | "phase";

export interface FilterSpec {
  kind: FilterKind;
  /** Normalised radius or width in [0, 1] of the half-width of the Fourier plane. */
  radius: number;
  /** Phase shift in radians for the phase filter. */
  phase?: number;
}

export interface FftField {
  re: Float64Array;
  im: Float64Array;
  size: number;
}

export function makeField(size: number, fill = 0): FftField {
  return { re: new Float64Array(size * size).fill(fill), im: new Float64Array(size * size), size };
}

/** In-place iterative radix-2 FFT along one axis of a square array. */
function fft1d(re: Float64Array, im: Float64Array, n: number, inverse: boolean): void {
  // Bit reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i]!;
      re[i] = re[j]!;
      re[j] = tr;
      const ti = im[i]!;
      im[i] = im[j]!;
      im[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = (inverse ? 2 : -2) * Math.PI / len;
    const wRe = Math.cos(angle);
    const wIm = Math.sin(angle);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k]!;
        const uIm = im[i + k]!;
        const vRe = re[i + k + len / 2]! * curRe - im[i + k + len / 2]! * curIm;
        const vIm = re[i + k + len / 2]! * curIm + im[i + k + len / 2]! * curRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + len / 2] = uRe - vRe;
        im[i + k + len / 2] = uIm - vIm;
        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
  if (inverse) {
    for (let i = 0; i < n; i++) {
      re[i]! /= n;
      im[i]! /= n;
    }
  }
}

export function fft2(field: FftField, inverse = false): FftField {
  const n = field.size;
  const out = { re: field.re.slice(), im: field.im.slice(), size: n };
  const rowRe = new Float64Array(n);
  const rowIm = new Float64Array(n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      rowRe[x] = out.re[y * n + x]!;
      rowIm[x] = out.im[y * n + x]!;
    }
    fft1d(rowRe, rowIm, n, inverse);
    for (let x = 0; x < n; x++) {
      out.re[y * n + x] = rowRe[x]!;
      out.im[y * n + x] = rowIm[x]!;
    }
  }
  const colRe = new Float64Array(n);
  const colIm = new Float64Array(n);
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      colRe[y] = out.re[y * n + x]!;
      colIm[y] = out.im[y * n + x]!;
    }
    fft1d(colRe, colIm, n, inverse);
    for (let y = 0; y < n; y++) {
      out.re[y * n + x] = colRe[y]!;
      out.im[y * n + x] = colIm[y]!;
    }
  }
  return out;
}

/** Shift zero frequency to the centre. */
export function fftShift(field: FftField): FftField {
  const n = field.size;
  const out = makeField(n);
  const half = n / 2;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const sx = (x + half) % n;
      const sy = (y + half) % n;
      out.re[y * n + x] = field.re[sy * n + sx]!;
      out.im[y * n + x] = field.im[sy * n + sx]!;
    }
  }
  return out;
}

export function magnitude(field: FftField): Float64Array {
  const out = new Float64Array(field.size * field.size);
  for (let i = 0; i < out.length; i++) out[i] = Math.hypot(field.re[i]!, field.im[i]!);
  return out;
}

export function phase(field: FftField): Float64Array {
  const out = new Float64Array(field.size * field.size);
  for (let i = 0; i < out.length; i++) out[i] = Math.atan2(field.im[i]!, field.re[i]!);
  return out;
}

/** Log-scaled magnitude normalised to [0,1]. */
export function logMagnitude(field: FftField): Float64Array {
  const mag = magnitude(field);
  let max = 0;
  for (const m of mag) max = Math.max(max, m);
  const out = new Float64Array(mag.length);
  const denom = Math.log1p(max) || 1;
  for (let i = 0; i < mag.length; i++) out[i] = Math.log1p(mag[i]!) / denom;
  return out;
}

/** Centred log spectrum suitable for rendering. */
export function spectrumImage(field: FftField): Float64Array {
  return logMagnitude(fftShift(field));
}

/* -------------------------------------------------------------------------- */
/* Test objects                                                                */
/* -------------------------------------------------------------------------- */

function drawRect(arr: Float64Array, size: number, x0: number, y0: number, w: number, h: number, value = 1): void {
  for (let y = Math.max(0, Math.floor(y0)); y < Math.min(size, Math.ceil(y0 + h)); y++) {
    for (let x = Math.max(0, Math.floor(x0)); x < Math.min(size, Math.ceil(x0 + w)); x++) {
      arr[y * size + x] = value;
    }
  }
}

/** Generate a binary test object. All patterns are defined analytically. */
export function makePattern(kind: PatternKind, size = 128): Float64Array {
  const arr = new Float64Array(size * size);
  const c = size / 2;
  if (kind === "slits") {
    const widths = [0.03, 0.06, 0.1];
    const gap = size * 0.16;
    for (const w of widths) {
      const px = Math.max(1, Math.round(size * w));
      drawRect(arr, size, c - gap - px / 2, size * 0.22, px, size * 0.56);
      drawRect(arr, size, c + gap - px / 2, size * 0.22, px, size * 0.56);
    }
  } else if (kind === "grating") {
    const period = Math.max(2, Math.round(size / 16));
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        arr[y * size + x] = Math.floor(x / period) % 2 === 0 ? 1 : 0;
      }
    }
  } else if (kind === "checker") {
    const cell = Math.max(2, Math.round(size / 8));
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        arr[y * size + x] = (Math.floor(x / cell) + Math.floor(y / cell)) % 2 === 0 ? 1 : 0;
      }
    }
  } else if (kind === "rings") {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const r = Math.hypot(x - c, y - c) / (size / 2);
        arr[y * size + x] = Math.sin(2 * Math.PI * 6 * r) > 0 ? 1 : 0;
      }
    }
  } else if (kind === "cross") {
    drawRect(arr, size, c - size * 0.04, size * 0.2, size * 0.08, size * 0.6);
    drawRect(arr, size, size * 0.2, c - size * 0.04, size * 0.6, size * 0.08);
  } else if (kind === "letterQ") {
    // Aperture with a diagonal stroke: produces recognisable diffraction detail.
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const r = Math.hypot(x - c, y - c);
        const inside = r < size * 0.26 && r > size * 0.17;
        const stroke = x > c + size * 0.06 && y > c + size * 0.06 && Math.abs(x - y) < size * 0.025;
        arr[y * size + x] = inside || stroke ? 1 : 0;
      }
    }
  }
  return arr;
}

/** Convert a grayscale RGBA buffer to a Float64Array field of the given size. */
export function imageToField(data: Uint8ClampedArray, width: number, height: number, size: number): Float64Array {
  const out = new Float64Array(size * size);
  for (let y = 0; y < size; y++) {
    const sy = Math.min(height - 1, Math.floor((y / size) * height));
    for (let x = 0; x < size; x++) {
      const sx = Math.min(width - 1, Math.floor((x / size) * width));
      const idx = (sy * width + sx) * 4;
      const r = data[idx] ?? 0;
      const g = data[idx + 1] ?? 0;
      const b = data[idx + 2] ?? 0;
      out[y * size + x] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    }
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Spatial filtering                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Apply a filter at the Fourier plane. Coordinates are centred; u,v ∈ [-1,1].
 * radius is the normalised cutoff.
 */
export function applyFilter(field: FftField, spec: FilterSpec): FftField {
  const n = field.size;
  const out: FftField = { re: field.re.slice(), im: field.im.slice(), size: n };
  const c = n / 2;
  const norm = n / 2;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const u = (x - c) / norm;
      const v = (y - c) / norm;
      const r = Math.hypot(u, v);
      let gain = 1;
      switch (spec.kind) {
        case "none":
          gain = 1;
          break;
        case "lowpass":
          gain = r <= spec.radius ? 1 : 0;
          break;
        case "highpass":
          gain = r >= spec.radius ? 1 : 0;
          break;
        case "vertical":
          gain = Math.abs(u) <= spec.radius ? 1 : 0;
          break;
        case "horizontal":
          gain = Math.abs(v) <= spec.radius ? 1 : 0;
          break;
        case "annulus":
          gain = r >= spec.radius && r <= spec.radius + 0.12 ? 1 : 0;
          break;
        case "phase":
          gain = r <= spec.radius ? 1 : 1;
          if (r <= spec.radius) {
            const ph = spec.phase ?? Math.PI;
            const re = out.re[y * n + x]!;
            const im = out.im[y * n + x]!;
            out.re[y * n + x] = re * Math.cos(ph) - im * Math.sin(ph);
            out.im[y * n + x] = re * Math.sin(ph) + im * Math.cos(ph);
            gain = 0; // already applied
          }
          break;
      }
      if (gain !== 1) {
        out.re[y * n + x]! *= gain;
        out.im[y * n + x]! *= gain;
      }
    }
  }
  return out;
}

export interface FourFResult {
  object: Float64Array;
  spectrum: Float64Array;
  phaseSpectrum: Float64Array;
  filteredSpectrum: Float64Array;
  reconstruction: Float64Array;
  /** Contrast (standard deviation / mean) of the reconstruction. */
  contrast: number;
  /** Fraction of spectral energy passed by the filter. */
  energyPassed: number;
}

/**
 * Run the full 4f pipeline on a real object distribution.
 * `filter.radius` is normalised to the half-width of the Fourier plane.
 */
export function fourF(object: Float64Array, size: number, filter: FilterSpec): FourFResult {
  const field: FftField = { re: Float64Array.from(object), im: new Float64Array(size * size), size };
  const spectrumField = fft2(field, false);
  const filtered = applyFilter(spectrumField, filter);
  const reconstructionField = fft2(filtered, true);

  const objectEnergy = object.reduce((s, v) => s + v * v, 0);
  let passedEnergy = 0;
  for (let i = 0; i < filtered.re.length; i++) {
    passedEnergy += filtered.re[i]! ** 2 + filtered.im[i]! ** 2;
  }
  // Normalise by the total spectral energy (Parseval: N² × spatial energy).
  const totalSpectral = objectEnergy * size * size;

  const reconstruction = new Float64Array(size * size);
  let mean = 0;
  for (let i = 0; i < reconstruction.length; i++) {
    // Take the real part, scaled by N² (inverse FFT normalisation) to compare
    // with the object. Display code normalises again to [0,1].
    reconstruction[i] = reconstructionField.re[i]! * size * size;
    mean += reconstruction[i]!;
  }
  mean /= reconstruction.length;
  let variance = 0;
  for (const v of reconstruction) variance += (v - mean) ** 2;
  variance /= reconstruction.length;
  const contrast = mean !== 0 ? Math.sqrt(variance) / Math.abs(mean) : 0;

  return {
    object: Float64Array.from(object),
    spectrum: spectrumImage(spectrumField),
    phaseSpectrum: phase(fftShift(spectrumField)),
    filteredSpectrum: spectrumImage(filtered),
    reconstruction,
    contrast,
    energyPassed: totalSpectral > 0 ? passedEnergy / totalSpectral : 0
  };
}

/** Normalise an array to [0,1] using min/max. */
export function normalize01(arr: Float64Array): Float64Array {
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of arr) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  const span = hi - lo || 1;
  const out = new Float64Array(arr.length);
  for (let i = 0; i < arr.length; i++) out[i] = (arr[i]! - lo) / span;
  return out;
}

/**
 * Convert a Fourier-plane pixel coordinate to a spatial frequency.
 * f_x = x / (λ f), with x measured from the optical axis in metres.
 */
export function spatialFrequency(xM: number, wavelengthM: number, focalM: number): number {
  return xM / (wavelengthM * focalM);
}

/**
 * Resolution limit of a lens (Rayleigh): Δx = 0.61 λ / NA.
 */
export function resolutionLimit(wavelengthM: number, na: number): number {
  return (0.61 * wavelengthM) / Math.max(1e-9, na);
}

/**
 * Cutoff spatial frequency for a circular aperture of radius a in the
 * Fourier plane of a lens with focal length f: f_c = a / (λ f).
 */
export function apertureCutoff(radiusM: number, wavelengthM: number, focalM: number): number {
  return radiusM / (wavelengthM * focalM);
}

/** Test whether an array length is a power of two. */
export function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}
