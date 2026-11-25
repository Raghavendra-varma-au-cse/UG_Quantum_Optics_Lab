/**
 * EXPERIMENT 07 — BB84 teaching layer.
 *
 * This module is a thin, testable wrapper around the shared stochastic model in
 * `src/lib/physics/qkd.ts`. It adds the protocol bookkeeping the interface
 * needs (stage metadata, expected values, Hamming demonstration, security
 * verdict) without changing the shared simulator.
 *
 * Nothing here is cryptography. The privacy-amplification routine in the shared
 * model is an XOR construction for teaching; the bounds quoted below are the
 * ideal-device asymptotic BB84 bounds, not a finite-key security proof.
 */

import {
  HAMMING_RATE,
  expectedInterceptResendQber,
  expectedSiftedLength,
  hammingCorrect,
  hammingDecodeBlock,
  hammingEncode,
  privacyAmplify,
  secretKeyFraction,
  simulateBB84,
  stateFor,
  type Basis,
  type CorrectionResult,
  type PhotonRecord,
  type PhotonState,
  type PrivacyResult,
  type QkdOptions,
  type QkdResult,
  type StageCounts
} from "@/lib/physics/qkd";
import { entropyBits } from "@/lib/physics/stats";

export {
  HAMMING_RATE,
  expectedInterceptResendQber,
  expectedSiftedLength,
  hammingCorrect,
  hammingDecodeBlock,
  hammingEncode,
  privacyAmplify,
  secretKeyFraction,
  simulateBB84,
  stateFor,
  entropyBits
};
export type { Basis, CorrectionResult, PhotonRecord, PhotonState, PrivacyResult, QkdOptions, QkdResult, StageCounts };

/* -------------------------------------------------------------------------- */
/* Bounds and defaults                                                        */
/* -------------------------------------------------------------------------- */

/** Asymptotic BB84 threshold, QBER at which 1 − 2h₂(Q) reaches zero. */
export const SECURITY_THRESHOLD = 0.11;

/** The simulator is capped so the photon-by-photon view stays usable. */
export const MIN_PHOTONS = 64;
export const MAX_PHOTONS = 4096;

/** Fixed margin subtracted by the teaching privacy-amplification step (bits). */
export const DEFAULT_SECURITY_MARGIN = 16;

/** Upper edge of the QBER chart, chosen so 0%, 12.5% and 25% are all visible. */
export const QBER_PLOT_MAX = 0.3;

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

function clampInt(value: number, lo: number, hi: number): number {
  if (!Number.isFinite(value)) return lo;
  return Math.min(hi, Math.max(lo, Math.round(value)));
}

/* -------------------------------------------------------------------------- */
/* Protocol stages                                                            */
/* -------------------------------------------------------------------------- */

export interface ProtocolStage {
  id: string;
  label: string;
  short: string;
  description: string;
}

/**
 * Eight reveal points. The interface uses the index as a gate: information is
 * only shown once the run has reached the stage at which that information
 * would exist for the named participant.
 */
export const PROTOCOL_STAGES: readonly ProtocolStage[] = [
  {
    id: "raw",
    label: "Raw",
    short: "Prepare",
    description:
      "Alice draws a random bit and a random basis for every photon and prepares the corresponding polarisation state. Nothing has entered the channel yet."
  },
  {
    id: "transmission",
    label: "Transmission",
    short: "Transmit",
    description:
      "Photons traverse the channel. Bob chooses a basis for each arriving photon and records a detector result; detector efficiency removes a fraction of the events here."
  },
  {
    id: "eve",
    label: "Eve",
    short: "Intercept",
    description:
      "With probability p Eve intercepts, measures in a random basis and resends. This record is visible only inside the simulator: Alice and Bob never see it."
  },
  {
    id: "sifting",
    label: "Sifting",
    short: "Sift",
    description:
      "Alice and Bob announce their bases over an authenticated classical channel and keep only the events where the bases match. The other events are discarded."
  },
  {
    id: "qber",
    label: "QBER",
    short: "Estimate",
    description:
      "A sample of the sifted key is compared, or in this model the whole sifted key is inspected, to estimate the quantum bit error rate. Errors are marked in vermilion."
  },
  {
    id: "correct",
    label: "Correct",
    short: "Reconcile",
    description:
      "Bob corrects errors using parity information that leaks to Eve. The Hamming(7,4) demonstration shows both the correction and its information cost."
  },
  {
    id: "amplify",
    label: "Amplify",
    short: "Compress",
    description:
      "Both parties compress the corrected key with the same seeded hash. The output is shorter and Eve's partial correlation is reduced in the model."
  },
  {
    id: "final",
    label: "Final key",
    short: "Verify",
    description:
      "The final keys are compared, the run is accepted or aborted, and the limits of the key are stated explicitly."
  }
];

export const STAGE_COUNT = PROTOCOL_STAGES.length;

export function stageInfo(index: number): ProtocolStage {
  const i = Math.min(STAGE_COUNT - 1, Math.max(0, Math.floor(index)));
  return PROTOCOL_STAGES[i] ?? PROTOCOL_STAGES[0]!;
}

/* -------------------------------------------------------------------------- */
/* Running the model                                                          */
/* -------------------------------------------------------------------------- */

export function normalizePhotons(photons: number): number {
  return clampInt(photons, MIN_PHOTONS, MAX_PHOTONS);
}

/** Clamp the user-facing photon count, then delegate to the shared model. */
export function runBb84(options: QkdOptions): QkdResult {
  return postProcess(simulateBB84({ ...options, photons: normalizePhotons(options.photons) }));
}

/**
 * Syndrome-based Hamming(7,4) reconciliation.
 *
 * The shared model exposes a codeword-level Hamming demonstration. That is a
 * useful decoder exercise, but it does not correct the realistic case in which
 * Bob's four data bits differ from Alice's: a single data-bit flip changes
 * three or four codeword bits, so the shared routine reports no correction.
 *
 * Here Alice reveals the three parity bits of each 7-bit block and Bob computes
 * the syndrome from his own data bits plus Alice's parity. A syndrome at a data
 * position (3, 5, 6 or 7) identifies a single data-bit error and is corrected.
 * A syndrome at a parity position (1, 2 or 4) is left unchanged. Two or more
 * errors can alias to a data position and cause a mis-correction; the residual
 * count exposes that, which is the honest limit of a single-error-correcting
 * code. Leakage is three parity bits per four data bits.
 */
export function reconcileHamming(
  aliceBits: readonly (0 | 1)[],
  bobBits: readonly (0 | 1)[],
  apply: boolean
): CorrectionResult {
  const n = Math.min(aliceBits.length, bobBits.length);
  if (!apply) {
    let residual = 0;
    for (let i = 0; i < n; i++) if (aliceBits[i] !== bobBits[i]) residual++;
    return {
      applied: false,
      blockSize: 1,
      blocks: 0,
      correctedBits: 0,
      residualErrors: residual,
      bitsAfter: bobBits.slice(0, n),
      leakedParityBits: 0
    };
  }

  const usable = n - (n % 4);
  const out: (0 | 1)[] = [];
  let correctedBits = 0;

  for (let i = 0; i < usable; i += 4) {
    const a = [
      aliceBits[i] ?? 0,
      aliceBits[i + 1] ?? 0,
      aliceBits[i + 2] ?? 0,
      aliceBits[i + 3] ?? 0
    ] as (0 | 1)[];
    const b = [
      bobBits[i] ?? 0,
      bobBits[i + 1] ?? 0,
      bobBits[i + 2] ?? 0,
      bobBits[i + 3] ?? 0
    ] as (0 | 1)[];
    const aliceWord = hammingEncode(a);
    // Alice's parity at positions 1,2,4; Bob's data at positions 3,5,6,7.
    const syndromeWord = [
      aliceWord[0] ?? 0,
      aliceWord[1] ?? 0,
      b[0],
      aliceWord[3] ?? 0,
      b[1],
      b[2],
      b[3]
    ] as (0 | 1)[];
    const s1 = ((syndromeWord[0] ?? 0) ^ (syndromeWord[2] ?? 0) ^ (syndromeWord[4] ?? 0) ^ (syndromeWord[6] ?? 0)) as 0 | 1;
    const s2 = ((syndromeWord[1] ?? 0) ^ (syndromeWord[2] ?? 0) ^ (syndromeWord[5] ?? 0) ^ (syndromeWord[6] ?? 0)) as 0 | 1;
    const s4 = ((syndromeWord[3] ?? 0) ^ (syndromeWord[4] ?? 0) ^ (syndromeWord[5] ?? 0) ^ (syndromeWord[6] ?? 0)) as 0 | 1;
    const syndrome = s1 + 2 * s2 + 4 * s4;
    const decoded = b.slice();
    // Data positions in Hamming(7,4): 3 -> d0, 5 -> d1, 6 -> d2, 7 -> d3.
    const dataIndex = syndrome === 3 ? 0 : syndrome === 5 ? 1 : syndrome === 6 ? 2 : syndrome === 7 ? 3 : -1;
    if (dataIndex >= 0) {
      decoded[dataIndex] = ((decoded[dataIndex] ?? 0) ^ 1) as 0 | 1;
      correctedBits++;
    }
    out.push(...decoded);
  }

  // Trailing bits that do not fill a four-bit block pass through unchanged.
  for (let i = usable; i < n; i++) out.push((bobBits[i] ?? 0) as 0 | 1);

  let residual = 0;
  for (let i = 0; i < out.length; i++) if (out[i] !== aliceBits[i]) residual++;

  return {
    applied: true,
    blockSize: 7,
    blocks: usable / 4,
    correctedBits,
    residualErrors: residual,
    bitsAfter: out,
    leakedParityBits: (usable / 4) * 3
  };
}

/** Re-run reconciliation and amplification on a simulated run. */
export function postProcess(result: QkdResult): QkdResult {
  const alice = result.stages.siftedBits.map((b) => b.alice);
  const bob = result.stages.siftedBits.map((b) => b.bob);
  const correction = reconcileHamming(alice, bob, result.options.errorCorrection);
  const finalAlice = alice.slice(0, correction.bitsAfter.length);
  const privacy = privacyAmplify(
    finalAlice,
    correction.bitsAfter,
    result.qber,
    result.options.seed,
    result.options.securityMargin
  );
  const secure =
    result.qber < SECURITY_THRESHOLD && privacy.outputBits > 0 && privacy.matches;
  return { ...result, correction, privacy, secure };
}

/* -------------------------------------------------------------------------- */
/* Expected values                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Expected QBER contributed by intercept–resend alone.
 * Eve is right about the basis half the time; when she is wrong Bob's sifted
 * result is random, so the error probability is p/4.
 */
export function expectedQberFromEve(eveProbability: number): number {
  return expectedInterceptResendQber(clamp01(eveProbability));
}

/**
 * Expected sifted-key QBER when an independent intrinsic flip of probability e
 * is applied to every detected photon. Two independent error mechanisms give
 * P(error) = a(1 − e) + e(1 − a) = a + e − 2ae with a = p/4.
 *
 * The shared model exposes its own `expectedQber`, but that field applies a
 * factor 1/2 to the intrinsic term, which does not match the implemented
 * per-detected-photon flip. This helper is the value used for the interface.
 */
export function expectedQberTotal(eveProbability: number, intrinsicErrorRate: number): number {
  const a = expectedQberFromEve(eveProbability);
  const e = clamp01(intrinsicErrorRate);
  return a + e - 2 * a * e;
}

/** Expected number of detector clicks: N η. */
export function expectedDetected(photons: number, detectionEfficiency: number): number {
  return Math.max(0, photons) * clamp01(detectionEfficiency);
}

/** Expected sifted length: N η / 2. */
export function expectedSifted(photons: number, detectionEfficiency = 1): number {
  return expectedSiftedLength(Math.max(0, Math.floor(photons))) * clamp01(detectionEfficiency);
}

/** Standard error of a measured QBER on n sifted bits (binomial, normal approx.). */
export function qberStandardError(qber: number, siftedBits: number): number {
  if (siftedBits <= 0) return Number.NaN;
  const q = clamp01(qber);
  return Math.sqrt((q * (1 - q)) / siftedBits);
}

/** Fraction of the sifted key that intercept–resend gives Eve in this model. */
export function expectedEveKnowledgeFraction(eveProbability: number): number {
  // She must guess the basis (1/2) and only intercepted photons are affected.
  return 0.5 * clamp01(eveProbability);
}

/* -------------------------------------------------------------------------- */
/* Privacy amplification                                                      */
/* -------------------------------------------------------------------------- */

/** Ideal asymptotic key fraction r∞ = max(0, 1 − 2h₂(Q)). */
export function asymptoticKeyFraction(qber: number): number {
  return secretKeyFraction(clamp01(qber));
}

/**
 * Length after privacy amplification for the ideal asymptotic bound, with an
 * explicit abort at or above the 11% threshold. A protocol that aborts has no
 * key, even where the algebraic fraction is a fraction of a bit.
 */
export function privacyOutputBits(
  inputBits: number,
  qber: number,
  securityMargin = 0
): number {
  const n = Math.max(0, Math.floor(inputBits));
  const q = clamp01(qber);
  if (q >= SECURITY_THRESHOLD) return 0;
  const raw = Math.floor(n * asymptoticKeyFraction(q)) - Math.max(0, securityMargin);
  return Math.max(0, raw);
}

/** Compression actually applied by the shared teaching model: 1 − h₂(Q). */
export function teachingCompressionFraction(qber: number): number {
  return Math.max(0, 1 - entropyBits(clamp01(qber)));
}

/** Output of the teaching model's XOR compression, including its abort rule. */
export function teachingPrivacyOutputBits(
  inputBits: number,
  qber: number,
  securityMargin = DEFAULT_SECURITY_MARGIN
): number {
  const n = Math.max(0, Math.floor(inputBits));
  const q = clamp01(qber);
  if (q >= SECURITY_THRESHOLD) return 0;
  return Math.max(0, Math.floor(n * teachingCompressionFraction(q)) - Math.max(0, securityMargin));
}

/** Final-key bits per photon sent, as a rate for this run. */
export function keyRatePerPhoton(result: QkdResult): number {
  return result.options.photons > 0 ? result.privacy.outputBits / result.options.photons : 0;
}

/* -------------------------------------------------------------------------- */
/* Hamming demonstration                                                      */
/* -------------------------------------------------------------------------- */

export interface HammingDemo {
  data: (0 | 1)[];
  codeword: (0 | 1)[];
  corrupted: (0 | 1)[];
  decoded: (0 | 1)[];
  /** 1-based syndrome, 0 when no error is detected. */
  syndrome: number;
  corrected: boolean;
}

/** One Hamming(7,4) block with a single flipped codeword bit. */
export function hammingDemo(
  data: readonly (0 | 1)[] = [1, 0, 1, 1],
  flipIndex = 3
): HammingDemo {
  const block = [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0, data[3] ?? 0] as (0 | 1)[];
  const codeword = hammingEncode(block);
  const corrupted = codeword.slice();
  const at = ((Math.floor(flipIndex) % 7) + 7) % 7;
  corrupted[at] = ((corrupted[at] ?? 0) ^ 1) as 0 | 1;
  const b = [0, ...corrupted]; // 1-indexed
  const s1 = ((b[1] ?? 0) ^ (b[3] ?? 0) ^ (b[5] ?? 0) ^ (b[7] ?? 0)) as 0 | 1;
  const s2 = ((b[2] ?? 0) ^ (b[3] ?? 0) ^ (b[6] ?? 0) ^ (b[7] ?? 0)) as 0 | 1;
  const s4 = ((b[4] ?? 0) ^ (b[5] ?? 0) ^ (b[6] ?? 0) ^ (b[7] ?? 0)) as 0 | 1;
  const syndrome = s1 + 2 * s2 + 4 * s4;
  const decoded = hammingDecodeBlock(corrupted);
  return {
    data: block,
    codeword,
    corrupted,
    decoded: decoded.data,
    syndrome,
    corrected: decoded.corrected === 1
  };
}

/** Parity bits Alice must reveal to reconcile n sifted bits with Hamming(7,4). */
export function hammingLeakageBits(inputBits: number): number {
  return Math.floor(Math.max(0, inputBits) / 4) * 3;
}

/** Bits left after the Hamming demonstration, before privacy amplification. */
export function hammingNetBits(inputBits: number): number {
  const n = Math.max(0, Math.floor(inputBits));
  return n - hammingLeakageBits(n);
}

/* -------------------------------------------------------------------------- */
/* Eve's view                                                                 */
/* -------------------------------------------------------------------------- */

export interface EveKnowledge {
  intercepted: number;
  basisMatches: number;
  siftedBits: number;
  siftedIntercepted: number;
  /** Sifted bits for which Eve used Alice's basis and therefore holds the bit. */
  knownSiftedBits: number;
  knownFraction: number;
}

/** Omniscient bookkeeping shown only in the simulator's Eve panel. */
export function eveKnowledge(records: readonly PhotonRecord[]): EveKnowledge {
  let intercepted = 0;
  let basisMatches = 0;
  let siftedBits = 0;
  let siftedIntercepted = 0;
  let knownSiftedBits = 0;
  for (const r of records) {
    if (r.detected && r.bobBit !== null && r.aliceBasis === r.bobBasis) siftedBits++;
    if (!r.eveIntercepted) continue;
    intercepted++;
    const usedAliceBasis = r.eveBasis !== undefined && r.eveBasis === r.aliceBasis;
    if (usedAliceBasis) basisMatches++;
    if (r.detected && r.bobBit !== null && r.aliceBasis === r.bobBasis) {
      siftedIntercepted++;
      if (usedAliceBasis) knownSiftedBits++;
    }
  }
  return {
    intercepted,
    basisMatches,
    siftedBits,
    siftedIntercepted,
    knownSiftedBits,
    knownFraction: siftedBits > 0 ? knownSiftedBits / siftedBits : 0
  };
}

/* -------------------------------------------------------------------------- */
/* Verdict                                                                    */
/* -------------------------------------------------------------------------- */

export type VerdictDecision = "accept" | "abort";
export type VerdictSeverity = "secure" | "warning" | "compromised";

export interface SecurityVerdict {
  decision: VerdictDecision;
  severity: VerdictSeverity;
  qber: number;
  threshold: number;
  headline: string;
  reasons: string[];
}

/**
 * The decision Alice and Bob can actually make from public information plus the
 * measured QBER. It is a simulation verdict under the stated device model; it
 * is not a security proof.
 */
export function securityVerdict(result: QkdResult): SecurityVerdict {
  const qber = result.qber;
  const reasons: string[] = [];

  if (qber >= SECURITY_THRESHOLD) {
    reasons.push(
      `Measured QBER ${(qber * 100).toFixed(2)}% is at or above the ${(SECURITY_THRESHOLD * 100).toFixed(0)}% asymptotic threshold.`
    );
    reasons.push("The key is discarded. The error rate is consistent with an intercept–resend attack or with a badly aligned channel.");
    reasons.push("Raising privacy amplification cannot repair a channel that is above threshold: no positive secret-key rate is available.");
    return {
      decision: "abort",
      severity: "compromised",
      qber,
      threshold: SECURITY_THRESHOLD,
      headline: "Abort — QBER above threshold",
      reasons
    };
  }

  if (result.privacy.outputBits === 0) {
    reasons.push(
      `QBER ${(qber * 100).toFixed(2)}% is below threshold, but only ${result.stages.sifted} sifted bits were available.`
    );
    reasons.push(
      `After compression by r∞ = 1 − 2h₂(Q) and the ${result.options.securityMargin}-bit margin, no key bits remain.`
    );
    reasons.push("Collect more photons or reduce the loss; a key shorter than the security margin is not usable.");
    return {
      decision: "abort",
      severity: "warning",
      qber,
      threshold: SECURITY_THRESHOLD,
      headline: "Abort — no key survives amplification",
      reasons
    };
  }

  if (!result.privacy.matches) {
    reasons.push("The final keys differ, so Bob cannot use the key Alice holds.");
    reasons.push(
      result.correction.applied
        ? `Error correction left ${result.correction.residualErrors} residual error(s); the teaching hash then amplified the difference.`
        : "Error correction is switched off, so the sifted errors were carried into the hash."
    );
    reasons.push("Re-run with correction enabled until the residual error count is zero.");
    return {
      decision: "abort",
      severity: "warning",
      qber,
      threshold: SECURITY_THRESHOLD,
      headline: "Abort — final keys do not match",
      reasons
    };
  }

  reasons.push(
    `Measured QBER ${(qber * 100).toFixed(2)}% is below the ${(SECURITY_THRESHOLD * 100).toFixed(0)}% asymptotic threshold.`
  );
  reasons.push(
    `Privacy amplification reduced ${result.privacy.inputBits} corrected bits to ${result.privacy.outputBits} bits (compression ${(result.privacy.compression * 100).toFixed(1)}%).`
  );
  reasons.push("The two final keys match in this seeded simulation.");
  reasons.push(
    "The verdict is conditional on an authenticated classical channel and on the declared device model. A real implementation also needs a finite-key analysis, a cryptographic hash and characterised detectors."
  );

  return {
    decision: "accept",
    severity: qber > 0.05 ? "warning" : "secure",
    qber,
    threshold: SECURITY_THRESHOLD,
    headline: qber > 0.05 ? "Accept with monitoring — elevated QBER" : "Accept — key distilled",
    reasons
  };
}

/* -------------------------------------------------------------------------- */
/* Small display helpers                                                      */
/* -------------------------------------------------------------------------- */

export function formatPercent(fraction: number, digits = 2): string {
  return `${(clamp01(fraction) * 100).toFixed(digits)}%`;
}

export function formatBits(bits: number): string {
  return `${Math.max(0, Math.round(bits))} bit${Math.round(bits) === 1 ? "" : "s"}`;
}
