/**
 * Mach–Zehnder interferometer model.
 *
 * The model uses the shared beam-splitter convention
 *
 *      B(η) = [[ t, i r ],
 *              [ i r, t  ]]      t = √(1−η), r = √η
 *
 * and propagates scalar complex amplitudes through
 *
 *      source → BS1 → two arms (path A, path B) → BS2 → D0 / D1.
 *
 * Path A is the reflected (upper) arm after BS1 and carries phase 0.  Path B
 * is the transmitted (lower) arm and carries the adjustable phase φ.  At
 * φ = 0 a balanced interferometer sends everything to port 1 (D1); port 0
 * (D0) is dark.
 *
 * A phenomenological coherence factor γ ∈ [0, 1] multiplies the interference
 * term.  γ = 1 is a perfectly coherent field (or a pure single-photon state);
 * γ = 0 corresponds to completely distinguishable paths.  The total
 * probability remains 1 while both paths are open, because the two output
 * probabilities are complementary.
 *
 * Blocking an arm removes that amplitude.  The remaining probability is the
 * fraction that survived the block, so p0 + p1 < 1.  No detector dark counts,
 * dead time or spatial-mode mismatch are modelled.
 */

import { c, cAbs2, cAdd, cExp, cMul, cScale, clamp, deg2rad, rad2deg, type Complex } from "@/lib/physics/complex";
import { beamSplitterMatrix } from "@/lib/physics/quantum";
import { createRng } from "@/lib/physics/rng";

/** He–Ne wavelength used by the teaching kit, in nanometres. */
export const HE_NE_WAVELENGTH_NM = 632.8;

/** Optical path difference corresponding to one full 2π phase cycle, in nm. */
export const OPD_NM_PER_FRINGE = HE_NE_WAVELENGTH_NM;

/** Phase advance per nanometre of optical path difference, in degrees. */
export const PHASE_DEGREES_PER_NM = 360 / HE_NE_WAVELENGTH_NM;

export interface MzParams {
  /** Relative phase of path B with respect to path A, in radians. */
  phaseRad: number;
  /** Power reflectivity of BS1, 0..1. */
  eta1: number;
  /** Power reflectivity of BS2, 0..1. */
  eta2: number;
  /** Degree of coherence multiplying the interference term, 0..1. */
  coherence?: number;
  /** Remove the reflected (path A) amplitude. */
  blockA?: boolean;
  /** Remove the transmitted (path B) amplitude. */
  blockB?: boolean;
}

export interface MzResult {
  /** Probability of a detection at the nominally dark port D0. */
  p0: number;
  /** Probability of a detection at the nominally bright port D1. */
  p1: number;
  /** p0 + p1. Equals 1 for a lossless, unblocked interferometer. */
  total: number;
  /** Fraction of the input lost to blocking or imbalance, 1 − total. */
  loss: number;
  /** Fringe visibility of port D0 over a full phase scan, 0..1. */
  visibility: number;
  /** Effective reflectivities after clamping. */
  eta1: number;
  eta2: number;
  /** Effective coherence factor after clamping. */
  coherence: number;
  /** Phase used in the model, in radians. */
  phaseRad: number;
  /** Coherent amplitudes at the two outputs (γ = 1 limit). */
  amp0: Complex;
  amp1: Complex;
  /** |amp|² for the coherent amplitudes. Equal to p0/p1 only when γ = 1. */
  coherentP0: number;
  coherentP1: number;
  /** Normalised intensity on each arm after BS1. */
  intensityA: number;
  intensityB: number;
}

/**
 * Fringe visibility of port D0 for two beam splitters with power
 * reflectivities η1 and η2 and coherence γ.
 *
 *      V = 2 γ √(η1 η2 (1−η1)(1−η2))
 *          / [η1 η2 + (1−η1)(1−η2)]
 *
 * For η1 = η2 = 1/2 this reduces to V = γ.  With one arm blocked there is no
 * interference and V = 0.
 */
export function visibilityForSplitting(eta1: number, eta2: number, coherence = 1): number {
  const e1 = clamp(eta1, 0, 1);
  const e2 = clamp(eta2, 0, 1);
  const gamma = clamp(coherence, 0, 1);
  const a = Math.sqrt((1 - e1) * (1 - e2)); // |t1 t2|
  const b = Math.sqrt(e1 * e2); // |r1 r2|
  const denominator = a * a + b * b;
  if (denominator < 1e-15) return 0;
  return clamp((2 * gamma * a * b) / denominator, 0, 1);
}

/** Maximum |∂P0/∂φ| over a phase scan, in inverse radians. */
export function maxPhaseSensitivity(eta1: number, eta2: number, coherence = 1): number {
  const e1 = clamp(eta1, 0, 1);
  const e2 = clamp(eta2, 0, 1);
  const a = Math.sqrt((1 - e1) * (1 - e2));
  const b = Math.sqrt(e1 * e2);
  return 2 * a * b * clamp(coherence, 0, 1);
}

/**
 * Propagate a unit-amplitude input through the interferometer.
 * All probabilities are conditional on a photon entering the input port.
 */
export function simulateMachZehnder(params: MzParams): MzResult {
  const eta1 = clamp(params.eta1, 0, 1);
  const eta2 = clamp(params.eta2, 0, 1);
  const gamma = clamp(params.coherence ?? 1, 0, 1);
  const blockA = params.blockA ?? false;
  const blockB = params.blockB ?? false;

  const b1 = beamSplitterMatrix(eta1);
  const b2 = beamSplitterMatrix(eta2);
  const t1 = b1[0][0].re;
  const r1 = b1[0][1].im;
  const t2 = b2[0][0].re;
  const r2 = b2[0][1].im;

  // Amplitudes on the two arms after BS1.
  const ampA = blockA ? c(0) : c(0, r1); // reflected arm, phase 0
  const ampB = blockB ? c(0) : cScale(cExp(params.phaseRad), t1); // transmitted arm, phase φ

  // Contributions to each output from each arm.
  const u0 = cScale(ampB, t2); // path B transmitted by BS2
  const v0 = cMul(ampA, c(0, r2)); // path A reflected by BS2
  const u1 = cMul(ampB, c(0, r2)); // path B reflected by BS2
  const v1 = cScale(ampA, t2); // path A transmitted by BS2

  const amp0 = cAdd(u0, v0);
  const amp1 = cAdd(u1, v1);

  const cross = (u: Complex, v: Complex): number => 2 * (u.re * v.re + u.im * v.im);
  const base0 = cAbs2(u0) + cAbs2(v0);
  const base1 = cAbs2(u1) + cAbs2(v1);

  const p0 = Math.max(0, base0 + gamma * cross(u0, v0));
  const p1 = Math.max(0, base1 + gamma * cross(u1, v1));
  const total = p0 + p1;
  const loss = Math.max(0, 1 - total);

  return {
    p0,
    p1,
    total,
    loss,
    visibility: blockA || blockB ? 0 : visibilityForSplitting(eta1, eta2, gamma),
    eta1,
    eta2,
    coherence: gamma,
    phaseRad: params.phaseRad,
    amp0,
    amp1,
    coherentP0: cAbs2(amp0),
    coherentP1: cAbs2(amp1),
    intensityA: blockA ? 0 : r1 * r1,
    intensityB: blockB ? 0 : t1 * t1
  };
}

export interface PhaseScanPoint {
  phaseRad: number;
  phaseDeg: number;
  p0: number;
  p1: number;
  total: number;
}

/**
 * Sample the output probabilities over a phase interval.  The default is a
 * full 2π scan centred on zero, which is the data plotted in the simulator.
 */
export function scanPhase(
  params: Omit<MzParams, "phaseRad">,
  points = 241,
  rangeRad = 2 * Math.PI
): PhaseScanPoint[] {
  const n = Math.max(2, Math.floor(points));
  const span = Math.max(1e-9, rangeRad);
  const out: PhaseScanPoint[] = [];
  for (let i = 0; i < n; i++) {
    const phaseRad = -span / 2 + (span * i) / (n - 1);
    const r = simulateMachZehnder({ ...params, phaseRad });
    out.push({
      phaseRad,
      phaseDeg: rad2deg(phaseRad),
      p0: r.p0,
      p1: r.p1,
      total: r.total
    });
  }
  return out;
}

/** Phase difference produced by an optical path difference in air/vacuum. */
export function phaseFromPathDifference(opdNm: number, wavelengthNm = HE_NE_WAVELENGTH_NM): number {
  if (wavelengthNm <= 0) return Number.NaN;
  return (2 * Math.PI * opdNm) / wavelengthNm;
}

/** Inverse mapping: optical path difference required for a phase difference. */
export function pathDifferenceFromPhase(phaseRad: number, wavelengthNm = HE_NE_WAVELENGTH_NM): number {
  return (phaseRad * wavelengthNm) / (2 * Math.PI);
}

/** Convenience wrapper for UI sliders that work in degrees. */
export function phaseFromDegrees(phaseDeg: number): number {
  return deg2rad(phaseDeg);
}

export interface DetectionEvent {
  /** Photon number in the simulated run, starting at 1. */
  index: number;
  port: 0 | 1;
  /** Cumulative D0 counts up to and including this event. */
  count0: number;
  /** Cumulative D1 counts up to and including this event. */
  count1: number;
}

export interface PhotonCounts {
  /** Number of photons sent. */
  n: number;
  counts0: number;
  counts1: number;
  /** Photons that were neither detected (blocked/lost in the model). */
  lost: number;
  /** Probabilities used for the run. */
  probability0: number;
  probability1: number;
  /** Last `keep` detected events, in order. */
  events: DetectionEvent[];
}

/**
 * Simulate independent photon detections with a seeded generator.
 *
 * Each photon is one Bernoulli trial: it is detected at D0 with probability
 * p0, at D1 with probability p1, and otherwise lost.  This is a teaching
 * model, not a physical source: it reproduces binomial counting statistics but
 * says nothing about the photon statistics of a real laser or SPDC source.
 */
export function countPhotons(
  probability0: number,
  probability1: number,
  n: number,
  seed: number | string,
  keep = 20
): PhotonCounts {
  const p0 = clamp(probability0, 0, 1);
  const p1 = clamp(probability1, 0, Math.max(0, 1 - p0));
  const total = Math.max(0, Math.floor(n));
  const keepCount = Math.max(1, Math.floor(keep));
  const rng = createRng(seed);

  let counts0 = 0;
  let counts1 = 0;
  const events: DetectionEvent[] = [];

  for (let i = 1; i <= total; i++) {
    const u = rng();
    if (u < p0) {
      counts0 += 1;
      events.push({ index: i, port: 0, count0: counts0, count1: counts1 });
    } else if (u < p0 + p1) {
      counts1 += 1;
      events.push({ index: i, port: 1, count0: counts0, count1: counts1 });
    }
    if (events.length > keepCount) events.shift();
  }

  return {
    n: total,
    counts0,
    counts1,
    lost: total - counts0 - counts1,
    probability0: p0,
    probability1: p1,
    events
  };
}
