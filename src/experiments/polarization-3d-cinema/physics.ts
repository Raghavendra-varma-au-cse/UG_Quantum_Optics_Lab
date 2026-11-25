/**
 * Physics for Experiment 05 — Polarization & 3D Cinema.
 *
 * Two coupled models:
 *
 * 1. A bench model for fully polarized, monochromatic light. The optical train
 *    is source → linear polarizer → retarder (wave plate) → analyser, composed
 *    with 2×2 Jones matrices. The Jones algebra is delegated to
 *    `@/lib/physics/polarization` so the bench, the derivation and the tests
 *    share one set of conventions.
 *
 * 2. A stereo-projection model for partially polarized channels. Each eye's
 *    image is a unit Stokes vector; a partially depolarizing screen scales the
 *    polarized part; the glasses are imperfect analysers with an intensity
 *    extinction ε. Channel leakage, contrast and crosstalk are projections in
 *    Stokes space, so the model handles partial polarization where a Jones
 *    vector cannot.
 *
 * Conventions (stated, not implied):
 *   • Propagation along +z, transverse axes x and y.
 *   • Jones vectors are [E_x, E_y]ᵀ and normalized to unit intensity.
 *   • Stokes: S1 = |Ex|²−|Ey|², S2 = 2Re(Ex Ey*), S3 = −2Im(Ex Ey*), which is
 *     the convention of `stokesFromJones` in the shared library. S3 > 0 is
 *     labelled right circular by `classifyPolarization`; that label is a
 *     convention, the sign of S3 relative to a calibrated λ/4 plate is not.
 *   • A retarder with fast axis at θ applies diag(1, e^{iδ}) in its own frame,
 *     i.e. the slow axis accumulates phase δ. This matches `wavePlate`.
 *   • Angles are degrees at the API boundary and radians inside the algebra.
 *   • Intensities are fractions of the source intensity unless a unit is given.
 *
 * No commercial projector, screen or eyewear is modelled. Parameters such as
 * "extinction ratio" are model inputs, not datasheet values.
 */

import { deg2rad, rad2deg, type Matrix2 } from "@/lib/physics/complex";
import {
  A,
  D,
  H,
  L,
  R,
  V,
  applyMatrix,
  classifyPolarization,
  extinctionRatioDb,
  intensity,
  linearPolarizer,
  muellerLinearPolarizer,
  polarizationEllipse,
  stokesFromJones,
  wavePlate,
  type Jones,
  type Stokes
} from "@/lib/physics/polarization";
import type { SimulationSpec } from "@/lib/content/types";

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/* -------------------------------------------------------------------------- */
/* Declared simulation model                                                   */
/* -------------------------------------------------------------------------- */

export const SIMULATION_SPEC: SimulationSpec = {
  model:
    "Two coupled deterministic models. Bench: a monochromatic plane wave is a two-component complex Jones vector; an ideal linear polarizer is a Hermitian projector, a retarder is a unitary matrix with arbitrary retardance, and an ideal analyser is a second projector. The train source → polarizer → retarder → analyser is multiplied in that order and the output intensity, Jones vector and Stokes parameters are computed algebraically. Cinema: each eye's image is a unit Stokes vector (linear ±45° or circular right/left); a partially depolarizing screen multiplies the polarized part by (1−p); each lens is an imperfect analyser whose principal transmittances are 1 and ε = 10^(−ER/10); head tilt rotates the analyser axes. Leakage, contrast and crosstalk follow from the projections. Both channels add incoherently.",
  approximations: [
    "Monochromatic, collimated, normal-incidence plane waves; no spectral average over the source bandwidth.",
    "Ideal elements on the bench: no absorption in retarders, no spatial non-uniformity, no multiple reflections, no beam wander on rotation.",
    "The cinema screen is described by one scalar depolarization p, not by a bidirectional reflectance distribution function.",
    "Viewer perception is not modelled: crosstalk is an optical intensity ratio, not a visibility or comfort threshold.",
    "The two stereo channels are mutually incoherent and add by intensity.",
    "Angles are read from each element's own scale; no mount backlash or zero-offset calibration is included."
  ],
  validity: [
    "Bench angles 0–360°, retardance 0–360°, unit-intensity input states.",
    "Cinema extinction ratios 3–80 dB, screen depolarization 0–100 %, head tilt 0–45°.",
    "Small-angle propagation and paraxial collection by the detector.",
    "The model is quantitative for intensity ratios; absolute photocurrents require the detector responsivity, which is not assumed."
  ],
  exclusions: [
    "No model of a commercial cinema projector, silver screen micro-structure, or any specific eyewear product.",
    "No claim about viewer physiology, ghosting perception thresholds, or comfortable crosstalk limits.",
    "No wavelength dependence of retardance, dispersion, thermal drift, or mechanical creep.",
    "No single-photon, entangled-photon or quantum-channel behaviour; this is a classical polarization model.",
    "No projector optics, keystone geometry, viewing-angle dependence of screen gain, or audio/video timing.",
    "No claim that the listed kit matches a commercial installation; the cinema section is an optical demonstration of stereo separation."
  ],
  validation: [
    "Unit tests verify Malus's law at 0°, 45° and 90°, the polarizer projection, the half-wave rotation law, quarter-wave circular generation, Stokes vectors of H/V/D/R, unit degree of polarization, retarder unitarity, Mueller polarizer idempotence, extinction-ratio conversion and monotonic crosstalk with depolarization.",
    "The bench chain is checked against the closed forms I = I0 cos²(φ−θ) for a linear input and I = sin²(2θ) sin²(δ/2) for a plate between crossed polarizers.",
    "The stereo model reduces to XT = ε/(1+ε) at zero tilt with a perfect screen, and to 50 % at full depolarization."
  ],
  stochastic: "None. Every output is a deterministic function of the controls, so no seed is required."
};

/* -------------------------------------------------------------------------- */
/* Source states                                                               */
/* -------------------------------------------------------------------------- */

export type SourcePresetId = "H" | "V" | "D" | "A" | "R" | "L" | "custom";

export interface SourcePreset {
  id: SourcePresetId;
  label: string;
  azimuthDeg: number;
  ellipticityDeg: number;
  note: string;
}

export const SOURCE_PRESETS: readonly SourcePreset[] = [
  { id: "H", label: "H", azimuthDeg: 0, ellipticityDeg: 0, note: "Linear, horizontal (x)" },
  { id: "V", label: "V", azimuthDeg: 90, ellipticityDeg: 0, note: "Linear, vertical (y)" },
  { id: "D", label: "D", azimuthDeg: 45, ellipticityDeg: 0, note: "Linear, +45°" },
  { id: "A", label: "A", azimuthDeg: -45, ellipticityDeg: 0, note: "Linear, −45°" },
  { id: "R", label: "R", azimuthDeg: 0, ellipticityDeg: 45, note: "Right circular (S₃ > 0)" },
  { id: "L", label: "L", azimuthDeg: 0, ellipticityDeg: -45, note: "Left circular (S₃ < 0)" },
  { id: "custom", label: "Custom", azimuthDeg: 30, ellipticityDeg: 20, note: "Arbitrary azimuth and ellipticity" }
] as const;

/**
 * Jones vector from an azimuth ψ and ellipticity angle χ, with χ > 0 mapping
 * to S₃ > 0 (right circular) exactly as `stokesFromJones` reports it.
 *
 * The shared library's `jonesFromAngles` uses the opposite ellipticity sign,
 * so this module keeps its own constructor and documents the convention.
 */
export function jonesFromStateAngles(azimuthDeg: number, ellipticityDeg: number): Jones {
  const psi = deg2rad(azimuthDeg);
  const chi = deg2rad(clamp(ellipticityDeg, -45, 45));
  return [
    { re: Math.cos(psi) * Math.cos(chi), im: -Math.sin(psi) * Math.sin(chi) },
    { re: Math.sin(psi) * Math.cos(chi), im: Math.cos(psi) * Math.sin(chi) }
  ];
}

export function presetJones(preset: SourcePresetId, azimuthDeg = 0, ellipticityDeg = 0): Jones {
  switch (preset) {
    case "H":
      return H;
    case "V":
      return V;
    case "D":
      return D;
    case "A":
      return A;
    case "R":
      return R;
    case "L":
      return L;
    case "custom":
    default:
      return jonesFromStateAngles(azimuthDeg, ellipticityDeg);
  }
}

/* -------------------------------------------------------------------------- */
/* Bench model                                                                 */
/* -------------------------------------------------------------------------- */

export type PlateKind = "none" | "half" | "quarter" | "custom";

export interface BenchConfig {
  source: SourcePresetId;
  sourceAzimuthDeg: number;
  sourceEllipticityDeg: number;
  polarizerEnabled: boolean;
  polarizerAngleDeg: number;
  plate: PlateKind;
  plateAngleDeg: number;
  customRetardanceDeg: number;
  analyzerAngleDeg: number;
}

export const DEFAULT_BENCH: BenchConfig = {
  source: "H",
  sourceAzimuthDeg: 30,
  sourceEllipticityDeg: 0,
  polarizerEnabled: true,
  polarizerAngleDeg: 0,
  plate: "none",
  plateAngleDeg: 0,
  customRetardanceDeg: 90,
  analyzerAngleDeg: 60
};

export interface BenchResult {
  config: BenchConfig;
  input: Jones;
  afterPolarizer: Jones;
  afterPlate: Jones;
  output: Jones;
  stateStokes: Stokes;
  outputStokes: Stokes;
  inputIntensity: number;
  intensityBeforeAnalyzer: number;
  transmitted: number;
  normalizedTransmission: number;
  classification: string;
  dop: number;
  azimuthDeg: number;
  ellipticityDeg: number;
  ellipse: { major: number; minor: number; angleDeg: number; handedness: "right" | "left" | "linear" };
  retardanceDeg: number;
  polarizerMatrix: Matrix2 | null;
  plateMatrix: Matrix2 | null;
  analyzerMatrix: Matrix2;
}

export function retardanceForPlate(plate: PlateKind, customDeg: number): number {
  switch (plate) {
    case "half":
      return 180;
    case "quarter":
      return 90;
    case "custom":
      return clamp(customDeg, 0, 360);
    case "none":
    default:
      return 0;
  }
}

export function runBench(config: BenchConfig): BenchResult {
  const input = presetJones(config.source, config.sourceAzimuthDeg, config.sourceEllipticityDeg);
  const polarizerMatrix = config.polarizerEnabled ? linearPolarizer(config.polarizerAngleDeg) : null;
  const afterPolarizer = polarizerMatrix ? applyMatrix(polarizerMatrix, input) : input;

  const retardanceDeg = retardanceForPlate(config.plate, config.customRetardanceDeg);
  const plateMatrix = config.plate === "none" ? null : wavePlate(config.plateAngleDeg, deg2rad(retardanceDeg));
  const afterPlate = plateMatrix ? applyMatrix(plateMatrix, afterPolarizer) : afterPolarizer;

  const analyzerMatrix = linearPolarizer(config.analyzerAngleDeg);
  const output = applyMatrix(analyzerMatrix, afterPlate);

  const inputIntensity = intensity(input);
  const intensityBeforeAnalyzer = intensity(afterPlate);
  const transmitted = intensity(output);
  const stateStokes = stokesFromJones(afterPlate);

  return {
    config,
    input,
    afterPolarizer,
    afterPlate,
    output,
    stateStokes,
    outputStokes: stokesFromJones(output),
    inputIntensity,
    intensityBeforeAnalyzer,
    transmitted,
    normalizedTransmission: inputIntensity > 0 ? transmitted / inputIntensity : 0,
    classification: classifyPolarization(afterPlate),
    dop: stateStokes.dop,
    azimuthDeg: stateStokes.azimuthDeg,
    ellipticityDeg: stateStokes.ellipticityDeg,
    ellipse: polarizationEllipse(afterPlate),
    retardanceDeg,
    polarizerMatrix,
    plateMatrix,
    analyzerMatrix
  };
}

/**
 * Intensity through an ideal linear analyser at φ for a Stokes vector S:
 * I(φ) = ½(S0 + S1 cos2φ + S2 sin2φ). For a unit linear state this is
 * Malus's law; for an elliptical state it is the projection onto the
 * analyser axis. The S3 component is not addressed by a linear analyser.
 */
export function analyzerTransmission(stokes: Pick<Stokes, "S0" | "S1" | "S2">, angleDeg: number): number {
  const a = deg2rad(2 * angleDeg);
  return 0.5 * (stokes.S0 + stokes.S1 * Math.cos(a) + stokes.S2 * Math.sin(a));
}

/** Ideal Malus response, kept explicit for the teaching curve and tests. */
export function malusIntensity(thetaDeg: number, i0 = 1): number {
  return i0 * Math.cos(deg2rad(thetaDeg)) ** 2;
}

/** Sampled Malus curve for the analyser angle, 0–180° inclusive. */
export function benchMalusCurve(state: BenchResult["stateStokes"], samples = 180): { x: number; y: number }[] {
  const n = Math.max(2, Math.round(samples));
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const angle = (180 * i) / n;
    out.push({ x: angle, y: clamp(analyzerTransmission(state, angle), 0, 1) });
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Measurement reductions                                                      */
/* -------------------------------------------------------------------------- */

export interface StokesMeasurement {
  /** Intensity through a linear analyser at 0° (x). */
  I0: number;
  /** Intensity through a linear analyser at 45°. */
  I45: number;
  /** Intensity through a linear analyser at 90° (y). */
  I90: number;
  /** Intensity through a linear analyser at 135° (−45°). */
  I135: number;
  /** Intensity through a right-circular analyser. */
  IR: number;
  /** Intensity through a left-circular analyser. */
  IL: number;
}

/** Stokes parameters from the six canonical analyser measurements. */
export function stokesFromIntensities(m: StokesMeasurement): Stokes {
  const S0 = m.I0 + m.I90;
  const S1 = m.I0 - m.I90;
  const S2 = m.I45 - m.I135;
  const S3 = m.IR - m.IL;
  const dop = S0 > 0 ? Math.hypot(S1, S2, S3) / S0 : 0;
  const azimuthDeg = rad2deg(0.5 * Math.atan2(S2, S1));
  const ellipticityDeg = S0 > 0 ? rad2deg(0.5 * Math.asin(clamp(S3 / S0, -1, 1))) : 0;
  return { S0, S1, S2, S3, dop, azimuthDeg, ellipticityDeg };
}

export function degreeOfPolarization(s: Pick<Stokes, "S0" | "S1" | "S2" | "S3">): number {
  if (s.S0 <= 0) return 0;
  return Math.hypot(s.S1, s.S2, s.S3) / s.S0;
}

export type PoincarePoint = { x: number; y: number; z: number; dop: number };

/** Map a Stokes vector to Poincaré coordinates (S1, S2, S3)/S0. */
export function poincareFromStokes(s: Pick<Stokes, "S0" | "S1" | "S2" | "S3">): PoincarePoint {
  if (s.S0 <= 0) return { x: 0, y: 0, z: 0, dop: 0 };
  return {
    x: s.S1 / s.S0,
    y: s.S2 / s.S0,
    z: s.S3 / s.S0,
    dop: Math.hypot(s.S1, s.S2, s.S3) / s.S0
  };
}

/** Retardance recovered from a plate at 45° between crossed polarizers. */
export function retardanceFromCrossedTransmission(transmission: number): number {
  return 2 * Math.asin(Math.sqrt(clamp(transmission, 0, 1)));
}

/** Physical thickness for a given retardance: d = δλ / (2π Δn). */
export function thicknessForRetardance(deltaN: number, lambdaM: number, retardanceRad: number): number {
  if (deltaN === 0) return Number.POSITIVE_INFINITY;
  return (retardanceRad * lambdaM) / (2 * Math.PI * deltaN);
}

export function brewsterAngleDeg(n1: number, n2: number): number {
  return rad2deg(Math.atan(n2 / n1));
}

/* -------------------------------------------------------------------------- */
/* Stereo projection (3D cinema)                                               */
/* -------------------------------------------------------------------------- */

/*
 * Channel separation is computed from Stokes projections directly rather than
 * from a stored Mueller matrix. Every output here is an intensity, so the
 * model is insensitive to the global sign convention for S3; what matters is
 * that the image state and the analyser eigenaxis are orthogonal for the
 * unwanted channel. This keeps the cinema model self-consistent even when a
 * retarder matrix elsewhere in the codebase uses the opposite phase sign.
 */

export type CinemaTechnology = "linear" | "circular";

export interface CinemaConfig {
  technology: CinemaTechnology;
  /** Rotation of the glasses about the viewing axis, degrees. */
  headTiltDeg: number;
  /** Intensity extinction ratio of one analyser, dB. */
  extinctionDb: number;
  /** Fraction of the image intensity that the screen fully depolarizes, 0–1. */
  depolarization: number;
  /** Extra unpolarized leakage from scatter/transport, percent of the opposite channel. */
  ghostFloorPct: number;
}

export const DEFAULT_CINEMA: CinemaConfig = {
  technology: "circular",
  headTiltDeg: 0,
  extinctionDb: 30,
  depolarization: 0.02,
  ghostFloorPct: 0
};

export interface EyeChannel {
  /** Intensity of this eye's own image reaching this eye. */
  wanted: number;
  /** Intensity of the opposite eye's image leaking into this eye. */
  leak: number;
  /** wanted + leak. */
  total: number;
  /** leak / total, 0–1. */
  crosstalk: number;
  /** wanted / leak; Infinity when the leakage is zero. */
  contrast: number;
}

export interface CinemaResult {
  config: CinemaConfig;
  left: EyeChannel;
  right: EyeChannel;
  meanCrosstalk: number;
  meanContrast: number;
  analyzerExtinction: number;
  /** Projection of the left image state on the left analyser axis, before imperfections. */
  leftAlignment: number;
  rightAlignment: number;
  tiltSensitive: boolean;
  note: string;
}

type Vec3 = readonly [number, number, number];

const dot3 = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export function extinctionFromDb(db: number): number {
  return Math.pow(10, -clamp(db, 0, 120) / 10);
}

/**
 * Normalized transmission of an imperfect analyser whose Stokes eigenaxis is
 * `axis`, for a state whose polarized part is `state`:
 *
 *   T = ½[(1+ε) + (1−ε)(1−p)(state·axis)]
 *
 * The principal transmittances are 1 (aligned) and ε (crossed), so the
 * intensity extinction ratio is 1/ε.
 */
function analyserChannel(state: Vec3, axis: Vec3, epsilon: number, depolarization: number): number {
  const polarized = (1 - clamp(depolarization, 0, 1)) * dot3(state, axis);
  return 0.5 * ((1 + epsilon) + (1 - epsilon) * polarized);
}

function eyeChannel(wanted: number, leakRaw: number, ghost: number): EyeChannel {
  const leak = clamp(leakRaw + ghost * (1 - clamp(leakRaw, 0, 1)), 0, 1);
  const total = wanted + leak;
  return {
    wanted,
    leak,
    total,
    crosstalk: total > 0 ? leak / total : 0,
    contrast: leak > 1e-12 ? wanted / leak : Number.POSITIVE_INFINITY
  };
}

export function runCinema(config: CinemaConfig): CinemaResult {
  const epsilon = extinctionFromDb(config.extinctionDb);
  const tilt = deg2rad(clamp(config.headTiltDeg, -89, 89));
  const ghost = clamp(config.ghostFloorPct, 0, 20) / 100;

  let leftState: Vec3;
  let rightState: Vec3;
  let leftAxis: Vec3;
  let rightAxis: Vec3;

  if (config.technology === "linear") {
    // Images at ±45°; glasses analysers at ±45°, rotated with the head.
    leftState = [0, 1, 0];
    rightState = [0, -1, 0];
    const a = 2 * (Math.PI / 4 + tilt);
    const b = 2 * (-Math.PI / 4 + tilt);
    leftAxis = [Math.cos(a), Math.sin(a), 0];
    rightAxis = [Math.cos(b), Math.sin(b), 0];
  } else {
    // Images at the poles; a rotation about the viewing axis leaves the
    // circular eigenstates unchanged, which is the whole point.
    leftState = [0, 0, 1];
    rightState = [0, 0, -1];
    leftAxis = [0, 0, 1];
    rightAxis = [0, 0, -1];
  }

  const wantL = analyserChannel(leftState, leftAxis, epsilon, config.depolarization);
  const wantR = analyserChannel(rightState, rightAxis, epsilon, config.depolarization);
  const leakLRaw = analyserChannel(rightState, leftAxis, epsilon, config.depolarization);
  const leakRRaw = analyserChannel(leftState, rightAxis, epsilon, config.depolarization);

  const left = eyeChannel(wantL, leakLRaw, ghost);
  const right = eyeChannel(wantR, leakRRaw, ghost);
  const tiltSensitive = config.technology === "linear" && Math.abs(config.headTiltDeg) > 0.5;

  return {
    config,
    left,
    right,
    meanCrosstalk: 0.5 * (left.crosstalk + right.crosstalk),
    meanContrast:
      Number.isFinite(left.contrast) && Number.isFinite(right.contrast)
        ? 0.5 * (left.contrast + right.contrast)
        : Number.POSITIVE_INFINITY,
    analyzerExtinction: epsilon,
    leftAlignment: dot3(leftState, leftAxis),
    rightAlignment: dot3(rightState, rightAxis),
    tiltSensitive,
    note: tiltSensitive
      ? "Linear stereo: rotating the glasses by β changes the projected amplitude by cos 2β, so leakage rises as sin²β."
      : config.technology === "circular"
        ? "Circular stereo: the analyser eigenstates lie on the S₃ axis, so rotation about the beam axis does not change the projection."
        : "Linear stereo with the glasses upright: each eye is aligned with its own image."
  };
}

/** Crosstalk-versus-tilt data for the comparison plot (values in percent). */
export function crosstalkVsTilt(
  config: CinemaConfig,
  maxTiltDeg = 45,
  stepDeg = 1
): { tilt: number; linear: number; circular: number }[] {
  const rows: { tilt: number; linear: number; circular: number }[] = [];
  const step = Math.max(0.5, stepDeg);
  for (let tilt = 0; tilt <= maxTiltDeg + 1e-9; tilt += step) {
    const base = { ...config, headTiltDeg: tilt };
    rows.push({
      tilt: Math.round(tilt * 10) / 10,
      linear: 100 * runCinema({ ...base, technology: "linear" }).meanCrosstalk,
      circular: 100 * runCinema({ ...base, technology: "circular" }).meanCrosstalk
    });
  }
  return rows;
}

/* -------------------------------------------------------------------------- */
/* Formatting helpers for the read-only matrix display                         */
/* -------------------------------------------------------------------------- */

function fmtNumber(v: number, digits = 3): string {
  if (!Number.isFinite(v)) return v > 0 ? "+∞" : "−∞";
  if (Math.abs(v) < 5 * Math.pow(10, -digits) * 0.5) return "0";
  let s = v.toFixed(digits);
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s.replace("-", "−");
}

export function formatComplex(z: { re: number; im: number }, digits = 3): string {
  const re = fmtNumber(z.re, digits);
  const im = fmtNumber(z.im, digits);
  const tinyRe = Math.abs(z.re) < 5 * Math.pow(10, -digits) * 0.5;
  const tinyIm = Math.abs(z.im) < 5 * Math.pow(10, -digits) * 0.5;
  if (tinyIm) return re;
  if (tinyRe) return im === "1" ? "i" : im === "−1" ? "−i" : `${im}i`;
  return `${re} ${z.im >= 0 ? "+" : "−"} ${Math.abs(z.im) < 5 * Math.pow(10, -digits) * 0.5 ? "0" : fmtNumber(Math.abs(z.im), digits)}i`;
}

export function formatJones(j: Jones, digits = 3): string {
  return `[${formatComplex(j[0], digits)}, ${formatComplex(j[1], digits)}]ᵀ`;
}

export function formatMatrix(m: Matrix2, digits = 3): string[][] {
  return [
    [formatComplex(m[0][0], digits), formatComplex(m[0][1], digits)],
    [formatComplex(m[1][0], digits), formatComplex(m[1][1], digits)]
  ];
}

/* -------------------------------------------------------------------------- */
/* Re-exports used by the interactive component                                */
/* -------------------------------------------------------------------------- */

export {
  applyMatrix,
  classifyPolarization,
  extinctionRatioDb,
  intensity,
  linearPolarizer,
  muellerLinearPolarizer,
  polarizationEllipse,
  stokesFromJones,
  wavePlate,
  type Jones,
  type Stokes
};
