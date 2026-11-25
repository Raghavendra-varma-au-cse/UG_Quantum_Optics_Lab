/**
 * Quantum-eraser model: two paths, a pure polarization marker on path b, an
 * ideal analysing polarizer, and seeded photon-count sampling.
 *
 * Conventions
 * -----------
 * Path a carries |H>. Path b carries the linear marker state
 *
 *     |θ> = cosθ |H> + sinθ |V>
 *
 * so that the marker overlap is <H|θ> = cosθ and θ = 90° gives orthogonal
 * (perfect which-path) marking.  θ is the *polarization* angle, not the
 * half-wave-plate axis: a zero-order half-wave plate at axis θ/2 rotates |H>
 * to |θ>.
 *
 * The state before the analyser, with path-b amplitude ratio r = √(I_b/I_a),
 * is
 *
 *     |Ψ> = ( |a>|H> + r e^{iφ} |b>|θ> ) / √(1+r²).
 *
 * A detector that ignores polarization sees the reduced path state and a
 * fringe visibility V = 2r|cosθ|/(1+r²) (|cosθ| when balanced).  An analyser
 * at α projects both paths onto one polarization; the selected output then
 * shows conditional interference with the visibility V_cond(α) below.
 *
 * The module deliberately does not model detector noise, dark counts,
 * multi-photon emission, timing jitter or real coincidence electronics.
 * Those omissions are declared in the experiment's SimulationSpec.
 */

import { clamp, deg2rad, type Complex } from "@/lib/physics/complex";
import { quantumEraser } from "@/lib/physics/quantum";
import { createRng } from "@/lib/physics/rng";
import type { SimulationSpec } from "@/lib/content/types";

export const eraserSimulation: SimulationSpec = {
  model:
    "Two-path pure-state model with a polarization marker on path b. Path a carries |H⟩; path b carries |θ⟩ = cosθ|H⟩ + sinθ|V⟩ after an ideal marker, with amplitude ratio r = √(I_B/I_A) and relative phase φ. An ideal analysing polarizer at α projects both paths onto a common polarization. The unconditioned fringe visibility is V = 2r|cosθ|/(1+r²); the visibility in a selected analyser channel is V_cond(α) = 2r|cos α cos(α−θ)| / (cos²α + r²cos²(α−θ)). Photon positions are sampled from these intensities with a seeded PRNG, binned across a six-fringe field, and the visibility is recovered from the binned counts by a Fourier component. Channel-resolved counts correspond to post-selection on the analyser output.",
  approximations: [
    "Ideal lossless 50:50 beam splitters and perfect spatial mode overlap.",
    "Ideal polarization optics: the marker and analyser have unit extinction and no retardance error.",
    "A single scalar spatial mode and a monochromatic field; no spatial walk-off or chromatic dispersion.",
    "Detectors have unit efficiency and no dark counts, afterpulsing or timing jitter.",
    "The two path intensities are adjustable but stable; the phase is a single scalar φ.",
    "Photon events are sampled independently; no multi-photon or squeezed-state effects."
  ],
  validity: [
    "Marker polarization angle θ from 0° to 90°; analyser angle α from 0° to 180°.",
    "Intensity ratio I_B/I_A between about 0.2 and 5; balanced paths give the textbook D² + V² = 1 relation.",
    "Any relative phase φ; the visibility is independent of φ for a fixed setting.",
    "Photon numbers from a few hundred to a few thousand give useful visibility estimates with visible shot noise.",
    "The conditional description applies to an ideal post-selected subensemble, not to the full singles record."
  ],
  exclusions: [
    "No real coincidence electronics, time-tagging latency, dead time or accidental-coincidence subtraction.",
    "No detector noise, dark counts, background light or detector imbalance.",
    "No multi-photon emission, SPDC source, heralding or photon-number statistics beyond independent events.",
    "No delayed-choice experiment: the analyser is a fixed projection in this model, not a choice made after detection.",
    "No claim of a genuine single-photon measurement; the tabletop implementation is a classical-wave analogue."
  ],
  validation: [
    "V(0°) = 1 and V(90°) = 0 for balanced paths.",
    "D(90°) = 1 and D² + V² = 1 for balanced pure marking.",
    "Conditional visibility at θ = 90°, α = 45° equals 1.",
    "The ungated sum of the two analyser channels has visibility 0 at θ = 90°.",
    "The seeded photon sampler reproduces counts exactly for the same seed and recovers the analytic visibility within shot noise."
  ],
  stochastic:
    "mulberry32 seeded from the user's seed string. Photon positions are drawn by inverse-CDF sampling from the model intensity; channel labels are drawn from the conditional analyser probabilities. The same seed reproduces the same counts; changing the seed changes only the sampling noise."
};

export type FringeChannel = "total" | "plus" | "minus";

export interface EraserConfig {
  /** Marker polarization angle θ on path b, degrees (0–90). */
  markerAngleDeg: number;
  /** Analyser transmission angle α, degrees (0–180). */
  analyzerAngleDeg: number;
  /** Relative phase φ between the paths, radians. */
  phaseRad: number;
  /** Intensity ratio I_b/I_a. 1 is balanced. */
  intensityRatio: number;
  /** Insert the polarization marker on path b. */
  markerInserted: boolean;
  /** Insert the analysing polarizer (two complementary outputs). */
  analyzerInserted: boolean;
  /** Keep the analyser-channel label (post-selection / coincidence gating). */
  gated: boolean;
}

export const DEFAULT_ERASER_CONFIG: EraserConfig = {
  markerAngleDeg: 90,
  analyzerAngleDeg: 45,
  phaseRad: 0,
  intensityRatio: 1,
  markerInserted: true,
  analyzerInserted: true,
  gated: false
};

export interface AnalyzerChannels {
  /** Fraction of the light in the + analyser channel at one output. */
  qPlus: number;
  /** Fraction in the orthogonal (−) analyser channel. */
  qMinus: number;
  /** Signed fringe coefficient of the + channel. */
  kPlus: number;
  /** Signed fringe coefficient of the − channel. */
  kMinus: number;
  /** |kPlus| / qPlus. */
  plusVisibility: number;
  /** |kMinus| / qMinus. */
  minusVisibility: number;
  /** Mean intensity of the + channel at one interferometer output. */
  meanPlus: number;
  /** Mean intensity of the − channel at one interferometer output. */
  meanMinus: number;
}

export interface EraserState extends AnalyzerChannels {
  /** Effective θ after the marker-inserted switch. */
  thetaDeg: number;
  /** Effective α. */
  alphaDeg: number;
  /** Amplitude ratio r = √(I_b/I_a). */
  amplitudeRatio: number;
  /** |<H|θ>| = |cos θ|. */
  overlap: number;
  /** Visibility of the full (channel-summed) ensemble. */
  totalVisibility: number;
  /** Alias for plusVisibility, the usual "conditional" number. */
  conditionalVisibility: number;
  /** Alias for minusVisibility. */
  orthogonalVisibility: number;
  /** D = √(1−|<H|θ>|²) = |sin θ|. */
  distinguishability: number;
  /** D² + V_total². Equals 1 for balanced pure marking. */
  dualitySum: number;
  /** Visibility the monitor should currently display. */
  displayVisibility: number;
  /** True when the analyser and gating switches are both on. */
  channelResolved: boolean;
  /** Weighted channel visibility q₊V₊ + q₋V₋, ≤ 1. */
  weightedChannelVisibility: number;
}

/** Effective marker angle: removing the marker is exactly θ = 0. */
export function effectiveMarkerAngle(config: EraserConfig): number {
  return config.markerInserted ? clamp(config.markerAngleDeg, 0, 90) : 0;
}

/** Unconditioned fringe visibility with a pure marker on path b. */
export function markerVisibility(markerAngleDeg: number, intensityRatio = 1): number {
  const theta = deg2rad(clamp(markerAngleDeg, 0, 90));
  const r = Math.sqrt(Math.max(0, intensityRatio));
  return (2 * r * Math.abs(Math.cos(theta))) / (1 + r * r);
}

/** Marker overlap |<H|θ>|. */
export function markerOverlap(markerAngleDeg: number): number {
  return Math.abs(Math.cos(deg2rad(clamp(markerAngleDeg, 0, 90))));
}

/** Distinguishability D = √(1−|<H|θ>|²). */
export function markerDistinguishability(markerAngleDeg: number): number {
  const o = markerOverlap(markerAngleDeg);
  return Math.sqrt(Math.max(0, 1 - o * o));
}

/**
 * Fraction of the light reaching one interferometer output that is transmitted
 * by an analyser at α, when path b is marked at θ.
 */
export function analyzerFraction(markerAngleDeg: number, analyzerAngleDeg: number, intensityRatio = 1): number {
  const theta = deg2rad(clamp(markerAngleDeg, 0, 90));
  const alpha = deg2rad(analyzerAngleDeg);
  const r = Math.sqrt(Math.max(0, intensityRatio));
  const ca = Math.cos(alpha);
  const cb = r * Math.cos(alpha - theta);
  return (ca * ca + cb * cb) / (1 + r * r);
}

/**
 * Conditional visibility in the analyser output selected at α.
 *
 * This is the visibility of a *post-selected* subensemble.  It is not the
 * visibility of the full ensemble: summing both analyser outputs restores the
 * marker-limited visibility markerVisibility(θ).
 */
export function conditionalVisibility(
  markerAngleDeg: number,
  analyzerAngleDeg: number,
  intensityRatio = 1
): number {
  const theta = deg2rad(clamp(markerAngleDeg, 0, 90));
  const alpha = deg2rad(analyzerAngleDeg);
  const r = Math.sqrt(Math.max(0, intensityRatio));
  const ca = Math.cos(alpha);
  const cb = r * Math.cos(alpha - theta);
  const denom = ca * ca + cb * cb;
  if (denom < 1e-12) return 0;
  return (2 * Math.abs(ca * cb)) / denom;
}

/** Conditional visibility in the analyser output orthogonal to α. */
export function orthogonalConditionalVisibility(
  markerAngleDeg: number,
  analyzerAngleDeg: number,
  intensityRatio = 1
): number {
  return conditionalVisibility(markerAngleDeg, analyzerAngleDeg + 90, intensityRatio);
}

/** Signed fringe coefficients and channel fractions. */
export function analyzerChannels(markerAngleDeg: number, analyzerAngleDeg: number, intensityRatio = 1): AnalyzerChannels {
  const theta = deg2rad(clamp(markerAngleDeg, 0, 90));
  const alpha = deg2rad(analyzerAngleDeg);
  const r = Math.sqrt(Math.max(0, intensityRatio));
  const denom = 1 + r * r;

  const ca = Math.cos(alpha);
  const cb = r * Math.cos(alpha - theta);
  const qPlus = (ca * ca + cb * cb) / denom;
  const kPlus = (2 * ca * cb) / denom;

  // Orthogonal analyser setting: cos(α+π/2−θ) = −sin(α−θ).
  const caMinus = -Math.sin(alpha);
  const cbMinus = -r * Math.sin(alpha - theta);
  const qMinus = (caMinus * caMinus + cbMinus * cbMinus) / denom;
  const kMinus = (2 * caMinus * cbMinus) / denom;

  return {
    qPlus,
    qMinus,
    kPlus,
    kMinus,
    plusVisibility: qPlus > 1e-12 ? Math.min(1, Math.abs(kPlus) / qPlus) : 0,
    minusVisibility: qMinus > 1e-12 ? Math.min(1, Math.abs(kMinus) / qMinus) : 0,
    meanPlus: 0.5 * qPlus,
    meanMinus: 0.5 * qMinus
  };
}

/**
 * Full state of the model for a given set of switches.
 *
 * The unconditioned visibility is the same whether the analyser is present or
 * not, provided the two complementary analyser outputs are summed: erasure
 * cannot increase the coherence available without post-selection.
 */
export function resolveEraserState(config: EraserConfig): EraserState {
  const thetaDeg = effectiveMarkerAngle(config);
  const alphaDeg = config.analyzerAngleDeg;
  const amplitudeRatio = Math.sqrt(Math.max(0, config.intensityRatio));
  const channels = analyzerChannels(thetaDeg, alphaDeg, config.intensityRatio);
  const totalVisibility = markerVisibility(thetaDeg, config.intensityRatio);
  const distinguishability = markerDistinguishability(thetaDeg);
  const channelResolved = config.analyzerInserted && config.gated;

  return {
    ...channels,
    thetaDeg,
    alphaDeg,
    amplitudeRatio,
    overlap: markerOverlap(thetaDeg),
    totalVisibility,
    conditionalVisibility: channels.plusVisibility,
    orthogonalVisibility: channels.minusVisibility,
    distinguishability,
    dualitySum: distinguishability * distinguishability + totalVisibility * totalVisibility,
    displayVisibility: channelResolved ? channels.plusVisibility : totalVisibility,
    channelResolved,
    weightedChannelVisibility:
      channels.qPlus * channels.plusVisibility + channels.qMinus * channels.minusVisibility
  };
}

/** Raw intensity at one interferometer output, for a chosen channel. */
export function rawFringeRate(config: EraserConfig, channel: FringeChannel, phaseRad: number): number {
  const s = resolveEraserState(config);
  const cosPhi = Math.cos(phaseRad);

  if (channel === "total") {
    return 0.5 * (1 + s.totalVisibility * cosPhi);
  }
  if (channel === "plus") {
    return 0.5 * (s.qPlus + s.kPlus * cosPhi);
  }
  return 0.5 * (s.qMinus + s.kMinus * cosPhi);
}

/**
 * Normalised fringe profile for the monitor, sampled in x ∈ [0,1).
 * Each channel is normalised to its own mean, so the strip shows fringe
 * *shape*; absolute count rates are shown separately.
 */
export function fringeProfile(
  config: EraserConfig,
  channel: FringeChannel,
  samples = 480,
  cycles = 6
): Float32Array {
  const n = Math.max(32, Math.min(4096, Math.round(samples)));
  const out = new Float32Array(n);
  const s = resolveEraserState(config);
  const m = Math.max(1, Math.round(cycles));

  for (let i = 0; i < n; i++) {
    const x = (i + 0.5) / n;
    const phi = config.phaseRad + 2 * Math.PI * m * x;
    const cosPhi = Math.cos(phi);
    if (channel === "total") {
      out[i] = 0.5 * (1 + s.totalVisibility * cosPhi);
    } else if (channel === "plus") {
      const signed = s.qPlus > 1e-12 ? s.kPlus / s.qPlus : 0;
      out[i] = 0.5 * (1 + signed * cosPhi);
    } else {
      const signed = s.qMinus > 1e-12 ? s.kMinus / s.qMinus : 0;
      out[i] = 0.5 * (1 + signed * cosPhi);
    }
  }
  return out;
}

/** Trace of |Ψ><Ψ| over the marker polarization, in the {|a>,|b>} basis. */
export function tracedPathDensityMatrix(
  markerAngleDeg: number,
  phaseRad: number,
  intensityRatio = 1
): [[Complex, Complex], [Complex, Complex]] {
  const theta = deg2rad(clamp(markerAngleDeg, 0, 90));
  const r = Math.sqrt(Math.max(0, intensityRatio));
  const denom = 1 + r * r;
  const coh = (r * Math.cos(theta)) / denom;
  return [
    [{ re: 1 / denom, im: 0 }, { re: coh * Math.cos(phaseRad), im: -coh * Math.sin(phaseRad) }],
    [{ re: coh * Math.cos(phaseRad), im: coh * Math.sin(phaseRad) }, { re: (r * r) / denom, im: 0 }]
  ];
}

/** Best analyser angle for conditional visibility, degrees (0–180). */
export function bestAnalyzerAngle(markerAngleDeg: number): number {
  return ((clamp(markerAngleDeg, 0, 90) / 2) % 180 + 180) % 180;
}

/** Maximum conditional visibility over analyser angle for a given balance. */
export function maxConditionalVisibilityForRatio(markerAngleDeg: number, intensityRatio = 1): number {
  void markerAngleDeg;
  const r = Math.sqrt(Math.max(0, intensityRatio));
  return (2 * r) / (1 + r * r);
}

/* -------------------------------------------------------------------------- */
/* Seeded photon-count sampling                                               */
/* -------------------------------------------------------------------------- */

export interface HistogramSummary {
  bins: number[];
  total: number;
  visibility: number;
  visibilityError: number;
}

export interface CoincidenceRun {
  photons: number;
  total: HistogramSummary;
  plus: HistogramSummary;
  minus: HistogramSummary;
}

export interface SeriesPoint {
  x: number;
  y: number;
  error: number;
  counts: number;
}

const CDF_SAMPLES = 720;

function buildCdf(weights: readonly number[]): { cdf: number[]; sum: number } {
  const cdf = new Array<number>(weights.length);
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += Math.max(0, weights[i] ?? 0);
    cdf[i] = sum;
  }
  return { cdf, sum };
}

function sampleIndex(rng: () => number, cdf: readonly number[], sum: number): number {
  if (sum <= 0) return Math.floor(rng() * cdf.length);
  const target = rng() * sum;
  let lo = 0;
  let hi = cdf.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if ((cdf[mid] ?? 0) < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Visibility of a sampled fringe histogram.
 *
 * For counts c_k on bins centred at x_k and a fringe of `cycles` periods across
 * the strip, the fundamental Fourier amplitude is
 *
 *     V = 2 √(A² + B²) / N,   A = Σ c_k cos(2π m x_k),  B = Σ c_k sin(...).
 *
 * The returned uncertainty is the large-N shot-noise estimate √(2/N).
 */
export function measuredVisibilityFromCounts(
  bins: readonly number[],
  cycles = 6
): { visibility: number; error: number; total: number } {
  const nBins = bins.length;
  const total = bins.reduce((s, v) => s + Math.max(0, v), 0);
  if (nBins === 0 || total <= 0) return { visibility: 0, error: 0, total };
  let a = 0;
  let b = 0;
  for (let k = 0; k < nBins; k++) {
    const x = (k + 0.5) / nBins;
    const ang = 2 * Math.PI * cycles * x;
    a += (bins[k] ?? 0) * Math.cos(ang);
    b += (bins[k] ?? 0) * Math.sin(ang);
  }
  const raw = (2 * Math.hypot(a, b)) / total;
  return {
    visibility: Math.max(0, Math.min(1, raw)),
    error: Math.sqrt(2 / Math.max(1, total)),
    total
  };
}

function emptySummary(nBins: number): HistogramSummary {
  return {
    bins: new Array<number>(nBins).fill(0),
    total: 0,
    visibility: 0,
    visibilityError: 0
  };
}

/**
 * Simulate one photon run.
 *
 * Positions are sampled from the total single-output intensity by inverse-CDF
 * sampling.  When the analyser and gating are both on, each photon is assigned
 * to the + or − analyser channel with probability I₊/(I₊+I₋); this is the
 * post-selection that produces conditional fringes.  The same seed reproduces
 * the exact same counts.
 */
export function simulateCoincidence(
  config: EraserConfig,
  photons: number,
  seed: string | number,
  bins = 96,
  cycles = 6
): CoincidenceRun {
  const nPhotons = Math.max(1, Math.min(200_000, Math.round(photons)));
  const nBins = Math.max(8, Math.min(1024, Math.round(bins)));
  const m = Math.max(1, Math.round(cycles));
  const rng = createRng(seed);
  const state = resolveEraserState(config);

  const weights = new Array<number>(CDF_SAMPLES);
  const totalRates = new Float64Array(CDF_SAMPLES);
  const plusRates = new Float64Array(CDF_SAMPLES);
  for (let i = 0; i < CDF_SAMPLES; i++) {
    const x = (i + 0.5) / CDF_SAMPLES;
    const phi = config.phaseRad + 2 * Math.PI * m * x;
    const cosPhi = Math.cos(phi);
    const total = 0.5 * (1 + state.totalVisibility * cosPhi);
    totalRates[i] = total;
    plusRates[i] = 0.5 * (state.qPlus + state.kPlus * cosPhi);
    weights[i] = total;
  }
  const { cdf, sum } = buildCdf(weights);

  const totalBins = new Array<number>(nBins).fill(0);
  const plusBins = new Array<number>(nBins).fill(0);
  const minusBins = new Array<number>(nBins).fill(0);
  const gated = config.analyzerInserted && config.gated;

  for (let p = 0; p < nPhotons; p++) {
    const idx = sampleIndex(rng, cdf, sum);
    const x = (idx + rng()) / CDF_SAMPLES;
    const bin = Math.min(nBins - 1, Math.max(0, Math.floor(x * nBins)));
    totalBins[bin] = (totalBins[bin] ?? 0) + 1;

    if (gated) {
      const totalRate = totalRates[idx] ?? 0;
      const plusRate = plusRates[idx] ?? 0;
      const pPlus = totalRate > 1e-12 ? Math.max(0, Math.min(1, plusRate / totalRate)) : 0.5;
      if (rng() < pPlus) {
        plusBins[bin] = (plusBins[bin] ?? 0) + 1;
      } else {
        minusBins[bin] = (minusBins[bin] ?? 0) + 1;
      }
    }
  }

  const summarise = (arr: number[]): HistogramSummary => {
    const res = measuredVisibilityFromCounts(arr, m);
    return {
      bins: arr,
      total: res.total,
      visibility: res.visibility,
      visibilityError: res.error
    };
  };

  return {
    photons: nPhotons,
    total: summarise(totalBins),
    plus: gated ? summarise(plusBins) : emptySummary(nBins),
    minus: gated ? summarise(minusBins) : emptySummary(nBins)
  };
}

/** Measured unconditioned V(θ) points, with the analyser removed. */
export function simulateMarkerSeries(
  base: EraserConfig,
  angles: readonly number[],
  photonsPerPoint: number,
  seed: string | number,
  bins = 72,
  cycles = 6
): SeriesPoint[] {
  const n = Math.max(120, Math.round(photonsPerPoint));
  return angles.map((angle) => {
    const config: EraserConfig = {
      ...base,
      markerAngleDeg: clamp(angle, 0, 90),
      markerInserted: true,
      analyzerInserted: false,
      gated: false
    };
    const run = simulateCoincidence(config, n, `${String(seed)}:marker:${angle}`, bins, cycles);
    return {
      x: angle,
      y: run.total.visibility,
      error: run.total.visibilityError,
      counts: run.total.total
    };
  });
}

/** Measured conditional V(α) points in the + analyser channel. */
export function simulateAnalyzerSeries(
  base: EraserConfig,
  angles: readonly number[],
  photonsPerPoint: number,
  seed: string | number,
  bins = 72,
  cycles = 6
): SeriesPoint[] {
  const n = Math.max(120, Math.round(photonsPerPoint));
  return angles.map((angle) => {
    const config: EraserConfig = {
      ...base,
      analyzerAngleDeg: angle,
      markerInserted: true,
      analyzerInserted: true,
      gated: true
    };
    const run = simulateCoincidence(config, n, `${String(seed)}:analyzer:${angle}`, bins, cycles);
    return {
      x: angle,
      y: run.plus.visibility,
      error: run.plus.visibilityError,
      counts: run.plus.total
    };
  });
}

/**
 * Convenience wrapper around the shared which-path model.
 *
 * Note: `quantumEraser().visibility` is computed from the post-analyser
 * amplitudes and is not the marker-only unconditioned visibility used in this
 * module. Use `conditionalVisibility`, `overlap` and `distinguishability`
 * from this result; the module's own `markerVisibility` is the correct
 * unconditioned quantity.
 */
export function coreEraserResult(config: EraserConfig) {
  return quantumEraser({
    markerAngleDeg: effectiveMarkerAngle(config),
    phase: config.phaseRad,
    analyzerAngleDeg: config.analyzerAngleDeg,
    intensityRatio: config.intensityRatio
  });
}
