/**
 * Ideal Elitzur–Vaidman bomb tester.
 *
 * Model
 * -----
 * A single photon enters a balanced Mach–Zehnder interferometer built from two
 * lossless 50:50 beam splitters. One arm contains an abstract object that is
 * either:
 *
 *   live  — a perfect single-photon absorber on that arm (absorption is
 *           declared to "explode" the bomb), or
 *   dud   — perfectly transparent.
 *
 * With a dud the two amplitudes recombine and cancel at the dark port D0, so
 * D1 fires with certainty. With a live bomb the lower amplitude is removed:
 * the photon is absorbed on that arm with probability 1/2 (explosion), and if
 * it survives on the upper arm the remaining amplitude splits equally at the
 * second beam splitter, giving D0 with probability 1/4 and D1 with 1/4.
 *
 * Everything here is a numerical model of the thought experiment. There is no
 * explosive device, no detector dark count, no loss, no multi-photon
 * contribution and no decoherence. See `SIMULATION_SPEC` for the declared
 * model.
 *
 * Randomness
 * ----------
 * Each trial derives two independent mulberry32 streams from the pair
 * (seed, trial index): one for the bomb type and one for the outcome. Trials
 * are therefore addressable out of order and a run can be paused, resumed or
 * recomputed from any index without changing the sequence.
 */

import type { SimulationSpec } from "@/lib/content/types";
import { bombTesterProbabilities, expectedTrialsPerDetection } from "@/lib/physics/quantum";
import { createRng } from "@/lib/physics/rng";

export type BombKind = "live" | "dud";

/** Detector naming used throughout the experiment: D0 is the dark port. */
export type Outcome = "explosion" | "D0" | "D1";

/**
 * Verdict available to an observer who sees only the outcome.
 * `null` means the outcome is inconclusive: D1 is produced both by a dud and
 * by a live bomb whose photon took the upper arm, so one click cannot decide.
 */
export type Conclusion = "live" | null;

export type Population = "random" | "live" | "dud";

export interface BombProbabilities {
  explosion: number;
  D0: number;
  D1: number;
}

/** Prior probability that a bomb drawn from the population is live. */
export const P_LIVE_PRIOR = 0.5;

export function probabilities(kind: BombKind): BombProbabilities {
  const p = bombTesterProbabilities(kind === "live");
  return { explosion: p.explosion, D0: p.dark, D1: p.bright };
}

/**
 * Exact ideal-model table. Derived from `bombTesterProbabilities` so the
 * simulation and the shared quantum-optics library cannot drift apart.
 */
export const THEORY_LIVE: BombProbabilities = probabilities("live");
export const THEORY_DUD: BombProbabilities = probabilities("dud");

/** Expected number of live bombs tested per interaction-free certification. */
export const EXPECTED_TRIALS_PER_DETECTION = expectedTrialsPerDetection(THEORY_LIVE.D0);

export interface TrialRecord {
  /** Zero-based position in the seeded stream. */
  index: number;
  /** Hidden truth, revealed to the student only after the measurement. */
  kind: BombKind;
  outcome: Outcome;
  /** Verdict the outcome alone supports. */
  conclusion: Conclusion;
  /** True for D0: certified live without destruction. */
  interactionFree: boolean;
  /** True for an explosion: certified live, but the bomb is destroyed. */
  destructive: boolean;
}

/* -------------------------------------------------------------------------- */
/* Seeded trial generation                                                     */
/* -------------------------------------------------------------------------- */

export function bombKindAt(seed: string, index: number, population: Population): BombKind {
  if (population === "live") return "live";
  if (population === "dud") return "dud";
  return createRng(`${seed}|kind|${index}`)() < P_LIVE_PRIOR ? "live" : "dud";
}

export function outcomeAt(seed: string, index: number, kind: BombKind): Outcome {
  if (kind === "dud") return "D1";
  const u = createRng(`${seed}|outcome|${index}`)();
  const p = THEORY_LIVE;
  if (u < p.explosion) return "explosion";
  if (u < p.explosion + p.D0) return "D0";
  return "D1";
}

/**
 * The observer's decision rule. It deliberately never receives the bomb type:
 * only D0 (and, destructively, an explosion) can certify a live bomb, and a
 * D1 click certifies nothing.
 */
export function conclusionFromOutcome(outcome: Outcome): Conclusion {
  return outcome === "D1" ? null : "live";
}

export function trialAt(seed: string, index: number, population: Population): TrialRecord {
  const kind = bombKindAt(seed, index, population);
  const outcome = outcomeAt(seed, index, kind);
  return {
    index,
    kind,
    outcome,
    conclusion: conclusionFromOutcome(outcome),
    interactionFree: outcome === "D0",
    destructive: outcome === "explosion"
  };
}

/** A conclusion is false when it contradicts the hidden truth. */
export function isFalseConclusion(t: TrialRecord): boolean {
  return t.conclusion !== null && t.conclusion !== t.kind;
}

/* -------------------------------------------------------------------------- */
/* Batch statistics                                                            */
/* -------------------------------------------------------------------------- */

export interface BombStats {
  trials: number;
  live: number;
  dud: number;
  explosion: number;
  d0: number;
  d1: number;
  /** D0 events: live bombs certified without destruction. */
  certifiedLive: number;
  /** Explosions: live bombs certified destructively. */
  destructiveLive: number;
  /** D1 events: no verdict. */
  inconclusive: number;
  /** Verdicts that contradict the hidden truth. Zero in the ideal model. */
  falseConclusions: number;
}

export function emptyStats(): BombStats {
  return {
    trials: 0,
    live: 0,
    dud: 0,
    explosion: 0,
    d0: 0,
    d1: 0,
    certifiedLive: 0,
    destructiveLive: 0,
    inconclusive: 0,
    falseConclusions: 0
  };
}

export function addTrial(stats: BombStats, t: TrialRecord): BombStats {
  return {
    trials: stats.trials + 1,
    live: stats.live + (t.kind === "live" ? 1 : 0),
    dud: stats.dud + (t.kind === "dud" ? 1 : 0),
    explosion: stats.explosion + (t.outcome === "explosion" ? 1 : 0),
    d0: stats.d0 + (t.outcome === "D0" ? 1 : 0),
    d1: stats.d1 + (t.outcome === "D1" ? 1 : 0),
    certifiedLive: stats.certifiedLive + (t.interactionFree ? 1 : 0),
    destructiveLive: stats.destructiveLive + (t.destructive ? 1 : 0),
    inconclusive: stats.inconclusive + (t.outcome === "D1" ? 1 : 0),
    falseConclusions: stats.falseConclusions + (isFalseConclusion(t) ? 1 : 0)
  };
}

export function summarise(records: readonly TrialRecord[]): BombStats {
  let stats = emptyStats();
  for (const t of records) stats = addTrial(stats, t);
  return stats;
}

export interface BatchResult {
  records: TrialRecord[];
  stats: BombStats;
}

/**
 * Run `count` trials from stream position `start`.
 * Identical to calling `trialAt` for every index, which is what the UI does so
 * that a paused batch can be resumed without replaying it.
 */
export function runBatch(
  seed: string,
  count: number,
  population: Population,
  start = 0
): BatchResult {
  const records: TrialRecord[] = [];
  let stats = emptyStats();
  const n = Math.max(0, Math.floor(count));
  for (let k = 0; k < n; k++) {
    const t = trialAt(seed, start + k, population);
    records.push(t);
    stats = addTrial(stats, t);
  }
  return { records, stats };
}

/** Expected counts given the realised mix of live and dud bombs. */
export function theoreticalCounts(stats: BombStats): {
  explosion: number;
  D0: number;
  D1: number;
} {
  return {
    explosion: stats.live * THEORY_LIVE.explosion,
    D0: stats.live * THEORY_LIVE.D0,
    D1: stats.live * THEORY_LIVE.D1 + stats.dud * THEORY_DUD.D1
  };
}

/* -------------------------------------------------------------------------- */
/* Inference                                                                   */
/* -------------------------------------------------------------------------- */

export interface Interval {
  low: number;
  high: number;
  /** Raw observed proportion k/n. */
  centre: number;
}

/**
 * Wilson score interval for a binomial proportion. Preferred over the normal
 * approximation when n is small or the proportion is near 0 or 1 — both happen
 * here, since D0 is rare.
 */
export function wilsonInterval(successes: number, n: number, z = 1.96): Interval | null {
  if (n <= 0) return null;
  const p = Math.min(1, Math.max(0, successes / n));
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const centre = (p + z2 / (2 * n)) / denom;
  const half = (z / denom) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
  return {
    low: Math.max(0, centre - half),
    high: Math.min(1, centre + half),
    centre: p
  };
}

/** P(at least one D0 in n live bombs), the per-run detection confidence. */
export function confidenceAtLeastOneD0(n: number): number {
  if (n <= 0) return 0;
  return 1 - Math.pow(1 - THEORY_LIVE.D0, n);
}

/**
 * Posterior probability that a bomb is live after n consecutive D1 outcomes.
 * P(D1|live)=1/4 and P(D1|dud)=1, so with a 1/2 prior
 * P(live|n D1) = 1/(1+4^n). Evaluated in the log domain for stability.
 */
export function posteriorLiveGivenD1(n: number): number {
  const k = Math.max(0, n);
  return 1 / (1 + Math.exp(k * Math.log(4)));
}

export interface CumulativePoint {
  /** Trials completed. */
  n: number;
  /** Cumulative D0 (interaction-free) detections. */
  d0: number;
  /** Ideal expectation 0.25 × (live bombs seen so far). */
  expected: number;
}

/** Down-sampled cumulative curve for the chart. */
export function cumulativeSeries(
  records: readonly TrialRecord[],
  maxPoints = 180
): CumulativePoint[] {
  const total = records.length;
  if (total === 0) return [];
  const stride = Math.max(1, Math.ceil(total / Math.max(2, maxPoints)));
  const out: CumulativePoint[] = [];
  let d0 = 0;
  let live = 0;
  for (let i = 0; i < total; i++) {
    const t = records[i];
    if (!t) continue;
    if (t.interactionFree) d0 += 1;
    if (t.kind === "live") live += 1;
    if ((i + 1) % stride === 0 || i === total - 1) {
      out.push({ n: i + 1, d0, expected: THEORY_LIVE.D0 * live });
    }
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Declared simulation model                                                   */
/* -------------------------------------------------------------------------- */

export const SIMULATION_SPEC: SimulationSpec = {
  model:
    "Ideal numerical model of the Elitzur–Vaidman thought experiment. One photon at a time enters a lossless interferometer made of two perfectly balanced 50:50 beam splitters. The object in the lower arm is an abstract two-state absorber: a live bomb absorbs a photon on that arm with probability 1 (declared an explosion), a dud is perfectly transparent. Live: explosion 1/2, D0 1/4, D1 1/4. Dud: D1 with probability 1. Counts, intervals and charts are model outputs.",
  approximations: [
    "Perfectly balanced 50:50 beam splitters with the ideal unitary transformation.",
    "One photon in the apparatus at a time; number-resolving detectors with unit efficiency.",
    "A live bomb is a perfect, instantaneous absorber on one arm; a dud has zero interaction.",
    "Mirror and propagation phases are set to the dark-port condition; no drift.",
    "The bomb population is an explicit 50/50 prior for the 'random' setting."
  ],
  validity: [
    "Exact single-photon probabilities for the ideal interferometer.",
    "Sampled frequencies approach the analytic values as 1/√n; the seed fixes the realised sequence.",
    "The decision rule 'D0 ⇒ live, D1 ⇒ no conclusion' is the observer's rule, not an oracle.",
    "The ideal bounds are 1/4 interaction-free per live bomb and 1/4 detection probability per live bomb."
  ],
  exclusions: [
    "No real explosive, fuse or detonator is modelled or required.",
    "No detector dark counts, dead time, afterpulsing or finite quantum efficiency.",
    "No optical loss, misalignment, beam-splitter imbalance or phase drift.",
    "No multi-photon emission, no decoherence and no distinguishability from stray light.",
    "No claim that a table-top implementation was performed for this module.",
    "No numerical claim about improved (Kwiat-type) efficiencies beyond the ideal limit of unity."
  ],
  validation: [
    "Live and dud probability tables each sum to one and match the shared quantum-optics model.",
    "Seeded batches are checked against P(D0|live)=1/4, P(explosion|live)=1/2 and P(D1|dud)=1.",
    "The decision rule is audited over the whole batch: it never certifies a dud as live.",
    "Wilson intervals from the sampled data cover the analytic proportion at large n."
  ],
  stochastic:
    "mulberry32 seeded from the run seed and the trial index. The bomb type and the outcome use independent derived streams, so the same seed, population and trial index always reproduce the same record, and a paused run resumes without changing the sequence. This is teaching pseudo-randomness, not a cryptographic generator."
};
