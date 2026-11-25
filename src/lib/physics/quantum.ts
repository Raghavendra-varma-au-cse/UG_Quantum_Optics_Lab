/**
 * Quantum-optics models: beam-splitter transformations, Mach–Zehnder output
 * probabilities, the Elitzur–Vaidman bomb tester and which-path marking.
 *
 * Conventions
 * -----------
 * A lossless beam splitter with power reflectivity η is represented by
 *
 *      B(η) = [[ t, i r ],
 *              [ i r, t  ]]      t = √(1−η), r = √η
 *
 * which is unitary. The factor i on reflection encodes the π/2 phase shift
 * required by energy conservation and is the convention used throughout.
 */

import {
  c,
  cAbs2,
  cAdd,
  cExp,
  cMul,
  cScale,
  type Complex,
  type ComplexVector,
  type Matrix2,
  deg2rad
} from "./complex";

export const BS_50_50: Matrix2 = [
  [c(Math.SQRT1_2), c(0, Math.SQRT1_2)],
  [c(0, Math.SQRT1_2), c(Math.SQRT1_2)]
];

export function beamSplitterMatrix(reflectivity: number): Matrix2 {
  const eta = Math.min(1, Math.max(0, reflectivity));
  const t = Math.sqrt(1 - eta);
  const r = Math.sqrt(eta);
  return [
    [c(t), c(0, r)],
    [c(0, r), c(t)]
  ];
}

export function phaseShift(phaseRad: number): Matrix2 {
  return [
    [cExp(phaseRad), c(0)],
    [c(0), c(1)]
  ];
}

export interface MzResult {
  /** Amplitude at the dark/other port (port 0). */
  amp0: Complex;
  amp1: Complex;
  p0: number;
  p1: number;
  visibility: number;
  phaseDifference: number;
}

/**
 * Mach–Zehnder with independent arm phases and beam-splitter reflectivities.
 * Input is a single photon (or unit-amplitude classical field) in port 0.
 */
export function machZehnder(
  phaseUpper: number,
  phaseLower: number,
  eta1 = 0.5,
  eta2 = 0.5
): MzResult {
  const b1 = beamSplitterMatrix(eta1);
  const b2 = beamSplitterMatrix(eta2);
  const input: ComplexVector = [c(1), c(0)];
  const afterFirst: ComplexVector = [
    cAdd(cMul(b1[0][0], input[0]), cMul(b1[0][1], input[1])),
    cAdd(cMul(b1[1][0], input[0]), cMul(b1[1][1], input[1]))
  ];
  const upper = cMul(afterFirst[0], cExp(phaseUpper));
  const lower = cMul(afterFirst[1], cExp(phaseLower));
  const amp0 = cAdd(cMul(b2[0][0], upper), cMul(b2[0][1], lower));
  const amp1 = cAdd(cMul(b2[1][0], upper), cMul(b2[1][1], lower));
  const p0 = cAbs2(amp0);
  const p1 = cAbs2(amp1);
  return {
    amp0,
    amp1,
    p0,
    p1,
    visibility: Math.abs(p0 - p1) / (p0 + p1 || 1),
    phaseDifference: phaseUpper - phaseLower
  };
}

/** Output probabilities of a balanced MZ as a function of relative phase. */
export function mzProbabilities(phase: number): { dark: number; bright: number } {
  return { dark: 0.5 * (1 - Math.cos(phase)), bright: 0.5 * (1 + Math.cos(phase)) };
}

/** Which output port is bright at zero phase for the convention above. */
export const MZ_BRIGHT_PORT_AT_ZERO = 1;

/* -------------------------------------------------------------------------- */
/* Elitzur–Vaidman bomb tester                                                 */
/* -------------------------------------------------------------------------- */

export type BombOutcome = "explosion" | "dark" | "bright";

export interface BombProbabilities {
  explosion: number;
  dark: number;
  bright: number;
  /** Probability that a live bomb is identified without detonating it. */
  interactionFreePerLiveBomb: number;
  /** Probability that a dud is certified as dud. */
  dudCertified: number;
}

/**
 * Ideal bomb tester with two 50:50 beam splitters.
 *
 * Dud: the second beam splitter recombines both paths; the normally dark port
 * stays dark (probability 0), the bright port fires with probability 1.
 *
 * Live: the lower-path amplitude is absorbed by the bomb. If the photon took
 * that path (1/2) the bomb explodes. If it took the upper path (1/2), it has
 * amplitude 1/√2 at the second splitter, so each output receives 1/4.
 * A click at the dark port therefore proves the bomb is live without
 * interaction.
 */
export function bombTesterProbabilities(live: boolean): BombProbabilities {
  if (!live) {
    return {
      explosion: 0,
      dark: 0,
      bright: 1,
      interactionFreePerLiveBomb: 0,
      dudCertified: 1
    };
  }
  return {
    explosion: 0.5,
    dark: 0.25,
    bright: 0.25,
    interactionFreePerLiveBomb: 0.25,
    dudCertified: 0
  };
}

export interface BombTrial {
  live: boolean;
  outcome: BombOutcome;
  /** Conclusive identification, or null when the result is inconclusive. */
  conclusion: "live" | "dud" | null;
}

export function runBombTrial(rng: () => number, live: boolean): BombTrial {
  const u = rng();
  if (!live) {
    // Ideal dud: bright port always fires.
    return { live, outcome: "bright", conclusion: "dud" };
  }
  if (u < 0.5) return { live, outcome: "explosion", conclusion: null };
  if (u < 0.75) return { live, outcome: "dark", conclusion: "live" };
  return { live, outcome: "bright", conclusion: null };
}

/** Expected number of trials to certify one live bomb (geometric mean 1/p). */
export function expectedTrialsPerDetection(probability: number): number {
  return probability > 0 ? 1 / probability : Number.POSITIVE_INFINITY;
}

/* -------------------------------------------------------------------------- */
/* Which-path marking / quantum eraser                                         */
/* -------------------------------------------------------------------------- */

export interface EraserModel {
  /** Angle of the marker on path b relative to path a (degrees). */
  markerAngleDeg: number;
  /** Relative phase between the paths (radians). */
  phase: number;
  /** Analyzer angle before detection (degrees). */
  analyzerAngleDeg: number;
  /** Relative intensity of path b (1 = balanced). */
  intensityRatio: number;
}

export interface EraserResult {
  /** Unconditioned visibility of the two-path interference. */
  visibility: number;
  /** Distinguishability D = √(1−V²) for balanced, pure marking. */
  distinguishability: number;
  /** Conditional visibility in the selected analyzer output. */
  conditionalVisibility: number;
  /** Conditional visibility in the orthogonal analyzer output. */
  orthogonalVisibility: number;
  /** Intensities of the two paths after the analyzer. */
  intensityA: number;
  intensityB: number;
  /** Marker-state overlap |⟨a|b⟩|. */
  overlap: number;
}

/**
 * Two-path interference with a polarization marker on path b.
 * Path a carries |H⟩; path b carries |θ⟩ = cosθ|H⟩ + sinθ|V⟩.
 * An analyzer at α projects both paths onto the same final polarization.
 */
export function quantumEraser(m: EraserModel): EraserResult {
  const theta = deg2rad(m.markerAngleDeg);
  const alpha = deg2rad(m.analyzerAngleDeg);
  const overlap = Math.abs(Math.cos(theta));
  const r = Math.sqrt(Math.max(0, m.intensityRatio));

  // Amplitudes after projection onto the analyzer.
  const ca = Math.cos(alpha);
  const cb = Math.cos(alpha - theta) * r;

  const ia = ca * ca;
  const ib = cb * cb;
  const sum = ia + ib;

  const condVis = sum > 0 ? (2 * Math.abs(ca * cb)) / sum : 0;

  const caOrth = Math.cos(alpha + Math.PI / 2);
  const cbOrth = Math.cos(alpha + Math.PI / 2 - theta) * r;
  const iaOrth = caOrth * caOrth;
  const ibOrth = cbOrth * cbOrth;
  const sumOrth = iaOrth + ibOrth;
  const orthVis = sumOrth > 0 ? (2 * Math.abs(caOrth * cbOrth)) / sumOrth : 0;

  // Unconditioned visibility: tracing out the marker leaves the overlap
  // |⟨a|b⟩| = |cos θ|. For unequal path intensities the balance factor is
  // 2√r/(1+r). This is independent of the analyzer angle.
  const balance = (2 * r) / (1 + r * r);
  const unconditioned = balance * overlap;

  return {
    visibility: unconditioned,
    distinguishability: Math.sqrt(Math.max(0, 1 - overlap * overlap)),
    conditionalVisibility: condVis,
    orthogonalVisibility: orthVis,
    intensityA: ia,
    intensityB: ib,
    overlap
  };
}

/** Best achievable conditional visibility by choosing the analyzer angle. */
export function maxConditionalVisibility(markerAngleDeg: number): number {
  const theta = deg2rad(markerAngleDeg);
  let best = 0;
  for (let a = 0; a < 180; a += 0.5) {
    const r = quantumEraser({ markerAngleDeg, phase: 0, analyzerAngleDeg: a, intensityRatio: 1 });
    best = Math.max(best, r.conditionalVisibility);
  }
  return best;
}

/* -------------------------------------------------------------------------- */
/* Density matrices and measurement                                           */
/* -------------------------------------------------------------------------- */

export type DensityMatrix = [[Complex, Complex], [Complex, Complex]];

export function densityFromPure(v: ComplexVector): DensityMatrix {
  return [
    [cMul(v[0], { re: v[0].re, im: -v[0].im }), cMul(v[0], { re: v[1].re, im: -v[1].im })],
    [cMul(v[1], { re: v[0].re, im: -v[0].im }), cMul(v[1], { re: v[1].re, im: -v[1].im })]
  ];
}

export function densityFromEnsemble(
  states: { vector: ComplexVector; weight: number }[]
): DensityMatrix {
  const out: DensityMatrix = [
    [c(0), c(0)],
    [c(0), c(0)]
  ];
  for (const { vector, weight } of states) {
    const d = densityFromPure(vector);
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        out[i]![j] = cAdd(out[i]![j]!, cScale(d[i]![j]!, weight));
      }
    }
  }
  return out;
}

/** Purity Tr(ρ²) for a qubit. */
export function purity(rho: DensityMatrix): number {
  // Tr(ρ²) = Σ_ij ρ_ij ρ_ji
  let sum = 0;
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const prod = cMul(rho[i]![j]!, rho[j]![i]!);
      sum += prod.re;
    }
  }
  return sum;
}

/** Born-rule probability for a projective measurement onto |ψ⟩. */
export function bornProbability(rho: DensityMatrix, psi: ComplexVector): number {
  let sum = 0;
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const bra = { re: psi[i]!.re, im: -psi[i]!.im };
      const term = cMul(cMul(bra, rho[i]![j]!), psi[j]!);
      sum += term.re;
    }
  }
  return Math.max(0, Math.min(1, sum));
}

/** Von Neumann entropy in bits. */
export function vonNeumannEntropy(rho: DensityMatrix): number {
  // For a 2×2 density matrix the eigenvalues are (1 ± √(1−4detρ))/2.
  const detRe = rho[0][0].re * rho[1][1].re - rho[0][0].im * rho[1][1].im - (rho[0][1].re * rho[1][0].re - rho[0][1].im * rho[1][0].im);
  const disc = Math.sqrt(Math.max(0, 1 - 4 * detRe));
  const l1 = (1 + disc) / 2;
  const l2 = (1 - disc) / 2;
  const h = (l: number) => (l > 0 ? -l * Math.log2(l) : 0);
  return h(l1) + h(l2);
}

/** Single-qubit measurement in a basis rotated by θ from Z. */
export function measureInBasis(
  state: ComplexVector,
  basisAngleRad: number,
  rng: () => number
): { outcome: 0 | 1; probability: number } {
  const plus: ComplexVector = [c(Math.cos(basisAngleRad)), c(Math.sin(basisAngleRad))];
  const minus: ComplexVector = [c(-Math.sin(basisAngleRad)), c(Math.cos(basisAngleRad))];
  const rho = densityFromPure(state);
  const p0 = bornProbability(rho, plus);
  const outcome = rng() < p0 ? 0 : 1;
  return { outcome, probability: outcome === 0 ? p0 : 1 - p0 };
}
