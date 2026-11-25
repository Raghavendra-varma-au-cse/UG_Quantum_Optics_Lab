/**
 * Polarization algebra: Jones vectors/matrices, Stokes parameters and
 * Poincaré-sphere coordinates. All states are normalised unless stated.
 */

import {
  c,
  cAbs2,
  cAdd,
  cArg,
  cDiv,
  cExp,
  cMul,
  cScale,
  type Complex,
  type ComplexVector,
  type Matrix2,
  deg2rad,
  normalize,
  wrapPhase
} from "./complex";

export type Jones = ComplexVector;

export const H: Jones = [c(1), c(0)];
export const V: Jones = [c(0), c(1)];
export const D: Jones = [c(Math.SQRT1_2), c(Math.SQRT1_2)];
export const A: Jones = [c(Math.SQRT1_2), c(-Math.SQRT1_2)];
export const R: Jones = [c(Math.SQRT1_2), c(0, Math.SQRT1_2)];
export const L: Jones = [c(Math.SQRT1_2), c(0, -Math.SQRT1_2)];

export function jonesFromAngles(azimuthDeg: number, ellipticityDeg = 0): Jones {
  const psi = deg2rad(azimuthDeg);
  const chi = deg2rad(ellipticityDeg);
  // Standard Poincaré parametrisation: S = (cos2χ cos2ψ, cos2χ sin2ψ, sin2χ).
  return [
    c(Math.cos(chi) * Math.cos(psi), -Math.sin(chi) * Math.sin(psi)),
    c(Math.cos(chi) * Math.sin(psi), Math.sin(chi) * Math.cos(psi))
  ];
}

export function intensity(j: Jones): number {
  return cAbs2(j[0]) + cAbs2(j[1]);
}

/** Normalised intensity transmission through an ideal linear analyser at θ. */
export function malus(angleRad: number): number {
  return Math.cos(angleRad) ** 2;
}

export function linearPolarizer(thetaDeg: number): Matrix2 {
  const t = deg2rad(thetaDeg);
  const cc = Math.cos(t) * Math.cos(t);
  const ss = Math.sin(t) * Math.sin(t);
  const cs = Math.cos(t) * Math.sin(t);
  return [
    [c(cc), c(cs)],
    [c(cs), c(ss)]
  ];
}

/** Wave plate with retardance δ (rad) and fast axis at θ. */
export function wavePlate(thetaDeg: number, retardanceRad: number): Matrix2 {
  const t = deg2rad(thetaDeg);
  const ct = Math.cos(t);
  const st = Math.sin(t);
  const e = cExp(retardanceRad);
  // R(θ) · diag(1, e^{iδ}) · R(−θ)
  const a00 = c(ct * ct + e.re * st * st, e.im * st * st);
  const a01 = c(ct * st - e.re * ct * st, -e.im * ct * st);
  const a10 = c(ct * st - e.re * ct * st, -e.im * ct * st);
  const a11 = c(st * st + e.re * ct * ct, e.im * ct * ct);
  return [
    [a00, a01],
    [a10, a11]
  ];
}

export function halfWavePlate(thetaDeg: number): Matrix2 {
  return wavePlate(thetaDeg, Math.PI);
}

export function quarterWavePlate(thetaDeg: number): Matrix2 {
  return wavePlate(thetaDeg, Math.PI / 2);
}

/** Rotator (optical activity / coordinate rotation). */
export function rotator(thetaDeg: number): Matrix2 {
  const t = deg2rad(thetaDeg);
  return [
    [c(Math.cos(t)), c(-Math.sin(t))],
    [c(Math.sin(t)), c(Math.cos(t))]
  ];
}

export function applyMatrix(m: Matrix2, j: Jones): Jones {
  return [cAdd(cMul(m[0][0], j[0]), cMul(m[0][1], j[1])), cAdd(cMul(m[1][0], j[0]), cMul(m[1][1], j[1]))];
}

export interface Stokes {
  S0: number;
  S1: number;
  S2: number;
  S3: number;
  /** Degree of polarization, 1 for a pure Jones state. */
  dop: number;
  /** Azimuth of the polarization ellipse, degrees. */
  azimuthDeg: number;
  /** Ellipticity angle χ, degrees (−45° = left circular, +45° = right circular). */
  ellipticityDeg: number;
}

/** Stokes parameters from a Jones vector. */
export function stokesFromJones(j: Jones): Stokes {
  const [ex, ey] = j;
  const s0 = cAbs2(ex) + cAbs2(ey);
  const s1 = cAbs2(ex) - cAbs2(ey);
  const cross = cMul(ex, { re: ey.re, im: -ey.im });
  const s2 = 2 * cross.re;
  const s3 = -2 * cross.im;
  const dop = s0 === 0 ? 0 : Math.hypot(s1, s2, s3) / s0;
  const azimuth = 0.5 * Math.atan2(s2, s1);
  const ellipticity = 0.5 * Math.asin(s0 === 0 ? 0 : Math.max(-1, Math.min(1, s3 / s0)));
  return {
    S0: s0,
    S1: s1,
    S2: s2,
    S3: s3,
    dop,
    azimuthDeg: (azimuth * 180) / Math.PI,
    ellipticityDeg: (ellipticity * 180) / Math.PI
  };
}

/** Unit Poincaré coordinates (s1,s2,s3)/S0, safe for unpolarised input. */
export function poincarePoint(j: Jones): { x: number; y: number; z: number; dop: number } {
  const s = stokesFromJones(j);
  if (s.S0 === 0) return { x: 0, y: 0, z: 0, dop: 0 };
  return { x: s.S1 / s.S0, y: s.S2 / s.S0, z: s.S3 / s.S0, dop: s.dop };
}

/**
 * Build a Jones vector from a Poincaré point (must lie on/in the unit sphere).
 * For partially polarised light the returned pure state represents the
 * polarised component only.
 */
export function jonesFromPoincare(x: number, y: number, z: number): Jones {
  const r = Math.hypot(x, y, z) || 1;
  const nx = x / r;
  const ny = y / r;
  const nz = z / r;
  const azimuth = 0.5 * Math.atan2(ny, nx);
  const ellipticity = 0.5 * Math.asin(Math.max(-1, Math.min(1, nz)));
  return jonesFromAngles((azimuth * 180) / Math.PI, (ellipticity * 180) / Math.PI);
}

/** Rotation of the electric field vector at time t for an animated ellipse. */
export function fieldVector(j: Jones, omegaT: number): { x: number; y: number } {
  const [ex, ey] = j;
  return {
    x: ex.re * Math.cos(omegaT) - ex.im * Math.sin(omegaT),
    y: ey.re * Math.cos(omegaT) - ey.im * Math.sin(omegaT)
  };
}

/** Ellipse semi-axes and orientation for drawing. */
export function polarizationEllipse(j: Jones): {
  major: number;
  minor: number;
  angleDeg: number;
  handedness: "right" | "left" | "linear";
} {
  const s = stokesFromJones(j);
  const denom = s.S0 || 1;
  const major = Math.sqrt((1 + Math.hypot(s.S1, s.S2) / denom) / 2);
  const minor = Math.sqrt(Math.max(0, (1 - Math.hypot(s.S1, s.S2) / denom) / 2));
  const handedness = Math.abs(s.S3) < 1e-6 ? "linear" : s.S3 > 0 ? "right" : "left";
  return { major, minor, angleDeg: s.azimuthDeg, handedness };
}

/** Extinction ratio in dB for a polariser pair. */
export function extinctionRatioDb(transmissionMin: number, transmissionMax: number): number {
  if (transmissionMin <= 0) return Number.POSITIVE_INFINITY;
  return 10 * Math.log10(transmissionMax / transmissionMin);
}

/** Fringe visibility from the two orthogonal polarisation components. */
export function polarizationVisibility(j1: Jones, j2: Jones): number {
  const i1 = intensity(j1);
  const i2 = intensity(j2);
  if (i1 + i2 === 0) return 0;
  const overlap = cMul(j1[0], { re: j2[0].re, im: -j2[0].im });
  const overlap2 = cMul(j1[1], { re: j2[1].re, im: -j2[1].im });
  const inner = Math.hypot(overlap.re + overlap2.re, overlap.im + overlap2.im);
  return (2 * inner) / (i1 + i2);
}

/**
 * Distinguishability–visibility trade-off for a two-path interferometer with
 * path states |a⟩ and |b⟩ that need not be orthogonal.
 * D = √(1 − |⟨a|b⟩|²), V = |⟨a|b⟩| for balanced paths.
 */
export function distinguishability(overlap: number): number {
  const o = Math.max(0, Math.min(1, Math.abs(overlap)));
  return Math.sqrt(1 - o * o);
}

/** Relative phase between two Jones vectors (for marking / erasure demos). */
export function relativePhase(j1: Jones, j2: Jones): number {
  const a = cDiv(j1[0], j2[0]);
  return wrapPhase(cArg(a));
}

/** A 2×2 Jones matrix for a general retarder written as exp(-iδ/2) form. */
export function generalRetarder(thetaDeg: number, retardanceRad: number): Matrix2 {
  return wavePlate(thetaDeg, retardanceRad);
}

/**
 * Mueller matrix for an ideal linear polariser at θ. Used when partially
 * polarised input is described by a Stokes vector.
 */
export function muellerLinearPolarizer(thetaDeg: number): number[][] {
  const t = deg2rad(thetaDeg);
  const c2 = Math.cos(2 * t);
  const s2 = Math.sin(2 * t);
  return [
    [0.5, 0.5 * c2, 0.5 * s2, 0],
    [0.5 * c2, 0.5 * c2 * c2, 0.5 * c2 * s2, 0],
    [0.5 * s2, 0.5 * c2 * s2, 0.5 * s2 * s2, 0],
    [0, 0, 0, 0]
  ];
}

/** Mueller matrix for a retarder with retardance δ and fast axis θ. */
export function muellerRetarder(thetaDeg: number, retardanceRad: number): number[][] {
  const t = deg2rad(thetaDeg);
  const c2 = Math.cos(2 * t);
  const s2 = Math.sin(2 * t);
  const cd = Math.cos(retardanceRad);
  const sd = Math.sin(retardanceRad);
  return [
    [1, 0, 0, 0],
    [0, c2 * c2 + s2 * s2 * cd, c2 * s2 * (1 - cd), -s2 * sd],
    [0, c2 * s2 * (1 - cd), s2 * s2 + c2 * c2 * cd, c2 * sd],
    [0, s2 * sd, -c2 * sd, cd]
  ];
}

export function applyMueller(m: number[][], s: number[]): number[] {
  return m.map((row) => row.reduce((sum, v, i) => sum + v * (s[i] ?? 0), 0));
}

/** Analyse an arbitrary Jones vector into a human-readable classification. */
export function classifyPolarization(j: Jones): string {
  const s = stokesFromJones(j);
  if (s.S0 === 0) return "No light";
  if (s.dop < 0.999) return "Partially polarised";
  if (Math.abs(s.S3 / s.S0) > 0.999) return s.S3 > 0 ? "Right circular" : "Left circular";
  if (Math.abs(s.S3 / s.S0) < 1e-3) {
    const az = ((s.azimuthDeg % 180) + 180) % 180;
    return `Linear ${az.toFixed(0)}°`;
  }
  return `Elliptical (${s.ellipticityDeg > 0 ? "right" : "left"})`;
}

/** Normalise a Jones vector (returns H if zero). */
export function normalizeJones(j: Jones): Jones {
  return normalize(j) ?? H;
}

export function jonesToString(j: Jones): string {
  const fmt = (z: Complex): string => {
    const re = Math.abs(z.re) < 1e-9 ? 0 : z.re;
    const im = Math.abs(z.im) < 1e-9 ? 0 : z.im;
    if (im === 0) return re.toFixed(3);
    if (re === 0) return `${im.toFixed(3)}i`;
    return `${re.toFixed(3)}${im >= 0 ? "+" : "−"}${Math.abs(im).toFixed(3)}i`;
  };
  return `[${fmt(j[0])}, ${fmt(j[1])}]ᵀ`;
}

export { cScale };
