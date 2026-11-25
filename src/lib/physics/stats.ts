/**
 * Statistical utilities for the data-analysis workspace and for validating
 * simulations. Formulas follow standard undergraduate treatment
 * (Taylor, "An Introduction to Error Analysis"; Bevington & Robinson).
 */

export interface Regression {
  slope: number;
  intercept: number;
  slopeSE: number;
  interceptSE: number;
  r2: number;
  n: number;
  residuals: number[];
  /** Standard error of the estimate (residual standard deviation). */
  syx: number;
  dof: number;
}

export const mean = (xs: readonly number[]): number =>
  xs.length === 0 ? Number.NaN : xs.reduce((s, x) => s + x, 0) / xs.length;

export function variance(xs: readonly number[], sample = true): number {
  const n = xs.length;
  if (n < 2) return Number.NaN;
  const m = mean(xs);
  const ss = xs.reduce((s, x) => s + (x - m) ** 2, 0);
  return ss / (n - (sample ? 1 : 0));
}

export const sd = (xs: readonly number[]): number => Math.sqrt(variance(xs, true));

/** Standard error of the mean. */
export const sem = (xs: readonly number[]): number => sd(xs) / Math.sqrt(xs.length);

export function median(xs: readonly number[]): number {
  if (xs.length === 0) return Number.NaN;
  const a = xs.slice().sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid]! : (a[mid - 1]! + a[mid]!) / 2;
}

/** Two-sided 95% Student-t critical values for small samples (ν = 1..30). */
const T95: readonly number[] = [
  12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.16, 2.145,
  2.131, 2.12, 2.11, 2.101, 2.093, 2.086, 2.08, 2.074, 2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042
];

export function tCritical95(dof: number): number {
  if (dof <= 0) return Number.NaN;
  if (dof <= 30) return T95[Math.round(dof) - 1]!;
  // Normal approximation for large ν.
  return 1.96;
}

export function confidenceInterval95(xs: readonly number[]): { low: number; high: number; halfWidth: number } {
  const m = mean(xs);
  const s = sem(xs);
  const hw = tCritical95(xs.length - 1) * s;
  return { low: m - hw, high: m + hw, halfWidth: hw };
}

/** Ordinary least squares y = a + b x with standard errors. */
export function linearRegression(xs: readonly number[], ys: readonly number[]): Regression {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) {
    return { slope: NaN, intercept: NaN, slopeSE: NaN, interceptSE: NaN, r2: NaN, n, residuals: [], syx: NaN, dof: n - 2 };
  }
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - mx;
    const dy = ys[i]! - my;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const residuals: number[] = [];
  let sse = 0;
  for (let i = 0; i < n; i++) {
    const r = ys[i]! - (intercept + slope * xs[i]!);
    residuals.push(r);
    sse += r * r;
  }
  const dof = n - 2;
  const syx = Math.sqrt(sse / dof);
  const slopeSE = syx / Math.sqrt(sxx);
  const interceptSE = syx * Math.sqrt(1 / n + (mx * mx) / sxx);
  const r2 = syy === 0 ? 1 : 1 - sse / syy;
  return { slope, intercept, slopeSE, interceptSE, r2, n, residuals, syx, dof };
}

/** Fit y = A sin(2π f x + φ) + C on a fixed frequency grid, then refine. */
export function sinusoidFit(
  xs: readonly number[],
  ys: readonly number[],
  frequencyHint?: number
): { amplitude: number; frequency: number; phase: number; offset: number; r2: number } {
  const n = Math.min(xs.length, ys.length);
  if (n < 8) return { amplitude: NaN, frequency: NaN, phase: NaN, offset: NaN, r2: NaN };
  const xMin = Math.min(...xs.slice(0, n));
  const xMax = Math.max(...xs.slice(0, n));
  const span = xMax - xMin || 1;
  const my = mean(ys.slice(0, n));

  const evaluate = (f: number) => {
    let ss = 0;
    let sc = 0;
    for (let i = 0; i < n; i++) {
      const a = 2 * Math.PI * f * xs[i]!;
      ss += (ys[i]! - my) * Math.sin(a);
      sc += (ys[i]! - my) * Math.cos(a);
    }
    // amplitude of the sinusoid at this frequency
    return Math.hypot(ss, sc) / n;
  };

  const base = frequencyHint ?? 1 / span;
  let bestF = base;
  let bestAmp = evaluate(base);
  const lo = Math.max(1 / (span * 4), base * 0.5);
  const hi = base * 4;
  for (let k = 0; k <= 240; k++) {
    const f = lo + ((hi - lo) * k) / 240;
    const a = evaluate(f);
    if (a > bestAmp) {
      bestAmp = a;
      bestF = f;
    }
  }
  // Golden-section-free local refinement
  let step = (hi - lo) / 240;
  for (let iter = 0; iter < 40; iter++) {
    const candidates = [bestF - step, bestF, bestF + step];
    for (const f of candidates) {
      if (f <= 0) continue;
      const a = evaluate(f);
      if (a > bestAmp) {
        bestAmp = a;
        bestF = f;
      }
    }
    step *= 0.72;
  }

  let ss = 0;
  let sc = 0;
  for (let i = 0; i < n; i++) {
    const a = 2 * Math.PI * bestF * xs[i]!;
    ss += (ys[i]! - my) * Math.sin(a);
    sc += (ys[i]! - my) * Math.cos(a);
  }
  const b = (2 / n) * ss;
  const a = (2 / n) * sc;
  const amplitude = Math.hypot(a, b);
  const phase = Math.atan2(a, b);
  const offset = my;
  let sse = 0;
  let sst = 0;
  for (let i = 0; i < n; i++) {
    const pred = offset + amplitude * Math.sin(2 * Math.PI * bestF * xs[i]! + phase);
    sse += (ys[i]! - pred) ** 2;
    sst += (ys[i]! - my) ** 2;
  }
  return { amplitude, frequency: bestF, phase, offset, r2: sst === 0 ? 1 : 1 - sse / sst };
}

export function covariance(xs: readonly number[], ys: readonly number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return NaN;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let s = 0;
  for (let i = 0; i < n; i++) s += (xs[i]! - mx) * (ys[i]! - my);
  return s / (n - 1);
}

export function correlation(xs: readonly number[], ys: readonly number[]): number {
  const sx = sd(xs);
  const sy = sd(ys);
  if (!sx || !sy) return NaN;
  return covariance(xs, ys) / (sx * sy);
}

/** Histogram with a fixed number of bins. */
export function histogram(
  xs: readonly number[],
  bins = 20,
  range?: [number, number]
): { x: number; count: number; density: number }[] {
  if (xs.length === 0) return [];
  const lo = range?.[0] ?? Math.min(...xs);
  const hi = range?.[1] ?? Math.max(...xs);
  const width = (hi - lo) / bins || 1;
  const counts = new Array<number>(bins).fill(0);
  for (const x of xs) {
    const idx = Math.min(bins - 1, Math.max(0, Math.floor((x - lo) / width)));
    counts[idx]! += 1;
  }
  return counts.map((count, i) => ({
    x: lo + (i + 0.5) * width,
    count,
    density: count / (xs.length * width)
  }));
}

/** Relative uncertainty of a product/quotient: sqrt(sum of squared relative errors). */
export function propagateProduct(relativeErrors: readonly number[]): number {
  return Math.sqrt(relativeErrors.reduce((s, r) => s + r * r, 0));
}

/** Standard deviation of a derived quantity f(x1..xn) from partial derivatives. */
export function propagate(partials: readonly number[], sigmas: readonly number[]): number {
  return Math.sqrt(partials.reduce((s, p, i) => s + (p * (sigmas[i] ?? 0)) ** 2, 0));
}

export function chiSquared(
  observed: readonly number[],
  expected: readonly number[],
  sigma?: readonly number[]
): { chi2: number; dof: number; reduced: number } {
  const n = Math.min(observed.length, expected.length);
  let chi2 = 0;
  for (let i = 0; i < n; i++) {
    const e = expected[i]!;
    const s = sigma?.[i] ?? Math.sqrt(Math.max(e, 1e-12));
    chi2 += ((observed[i]! - e) / s) ** 2;
  }
  const dof = Math.max(1, n - 1);
  return { chi2, dof, reduced: chi2 / dof };
}

/** Shannon entropy in bits. */
export function entropyBits(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
}

/** Pretty number formatting with fixed significant figures. */
export function formatSig(value: number, digits = 4): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e5 || abs < 1e-3) return value.toExponential(digits - 1);
  const decimals = Math.max(0, digits - Math.floor(Math.log10(abs)) - 1);
  return value.toFixed(Math.min(decimals, 8));
}

export function formatUncertainty(value: number, uncertainty: number): string {
  if (!Number.isFinite(value) || !Number.isFinite(uncertainty) || uncertainty === 0) {
    return `${formatSig(value)}`;
  }
  const exponent = Math.floor(Math.log10(Math.abs(uncertainty)));
  const decimals = Math.max(0, -exponent + 1);
  return `${value.toFixed(decimals)} ± ${uncertainty.toFixed(decimals)}`;
}
