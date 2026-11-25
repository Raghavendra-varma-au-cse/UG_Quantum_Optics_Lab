/**
 * Complex arithmetic and 2×2 matrix helpers used by the wave-optics and
 * quantum-optics models. Kept allocation-light and dependency-free so the
 * same code runs in the browser, in Web Workers and in Node tests.
 */

export interface Complex {
  re: number;
  im: number;
}

export const c = (re: number, im = 0): Complex => ({ re, im });
export const cZero: Complex = { re: 0, im: 0 };
export const cOne: Complex = { re: 1, im: 0 };
export const cI: Complex = { re: 0, im: 1 };

export const cAdd = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });
export const cSub = (a: Complex, b: Complex): Complex => ({ re: a.re - b.re, im: a.im - b.im });
export const cMul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re
});
export const cScale = (a: Complex, s: number): Complex => ({ re: a.re * s, im: a.im * s });
export const cConj = (a: Complex): Complex => ({ re: a.re, im: -a.im });
export const cAbs2 = (a: Complex): number => a.re * a.re + a.im * a.im;
export const cAbs = (a: Complex): number => Math.hypot(a.re, a.im);
export const cArg = (a: Complex): number => Math.atan2(a.im, a.re);

export const cExp = (phase: number): Complex => ({ re: Math.cos(phase), im: Math.sin(phase) });

export function cDiv(a: Complex, b: Complex): Complex {
  const d = cAbs2(b);
  if (d === 0) return { re: Number.NaN, im: Number.NaN };
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
}

export function cSqrt(a: Complex): Complex {
  const r = cAbs(a);
  const re = Math.sqrt(Math.max(0, (r + a.re) / 2));
  const im = Math.sign(a.im || 1) * Math.sqrt(Math.max(0, (r - a.re) / 2));
  return { re, im };
}

export type ComplexVector = [Complex, Complex];

export type Matrix2 = [[Complex, Complex], [Complex, Complex]];

export function matVec(m: Matrix2, v: ComplexVector): ComplexVector {
  return [
    cAdd(cMul(m[0][0], v[0]), cMul(m[0][1], v[1])),
    cAdd(cMul(m[1][0], v[0]), cMul(m[1][1], v[1]))
  ];
}

export function matMul(a: Matrix2, b: Matrix2): Matrix2 {
  const out: Matrix2 = [
    [cZero, cZero],
    [cZero, cZero]
  ];
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      out[i]![j] = cAdd(cMul(a[i]![0]!, b[0]![j]!), cMul(a[i]![1]!, b[1]![j]!));
    }
  }
  return out;
}

export function matDagger(m: Matrix2): Matrix2 {
  return [
    [cConj(m[0][0]), cConj(m[1][0])],
    [cConj(m[0][1]), cConj(m[1][1])]
  ];
}

export function isUnitary(m: Matrix2, tol = 1e-10): boolean {
  const p = matMul(matDagger(m), m);
  return (
    Math.abs(p[0]![0]!.re - 1) < tol &&
    Math.abs(p[1]![1]!.re - 1) < tol &&
    Math.abs(p[0]![1]!.re) < tol &&
    Math.abs(p[0]![1]!.im) < tol &&
    Math.abs(p[1]![0]!.re) < tol &&
    Math.abs(p[1]![0]!.im) < tol
  );
}

export const deg2rad = (d: number): number => (d * Math.PI) / 180;
export const rad2deg = (r: number): number => (r * 180) / Math.PI;

/** Wrap an angle to (-π, π]. */
export function wrapPhase(p: number): number {
  const t = ((p + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  return t - Math.PI;
}

/** Clamp helper. */
export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** Normalise a complex vector; returns null for the zero vector. */
export function normalize(v: ComplexVector): ComplexVector | null {
  const n = Math.hypot(cAbs(v[0]), cAbs(v[1]));
  if (n === 0) return null;
  return [cScale(v[0], 1 / n), cScale(v[1], 1 / n)];
}
