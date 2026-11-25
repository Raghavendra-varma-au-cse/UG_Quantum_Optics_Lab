/**
 * Deterministic pseudo-random number generation.
 *
 * Every stochastic simulation in the lab takes an explicit seed so a student
 * can reproduce an exact run. The generator is mulberry32 (public-domain
 * algorithm by Tommy Ettinger), adequate for teaching simulations and never
 * used for security.
 */

export type Rng = () => number;

/** Hash an arbitrary string to a 32-bit integer seed (FNV-1a). */
export function hashSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: number | string): Rng {
  return mulberry32(typeof seed === "string" ? hashSeed(seed) : seed);
}

/** Uniform integer in [0, n). */
export function randInt(rng: Rng, n: number): number {
  return Math.floor(rng() * n);
}

export function randBit(rng: Rng): 0 | 1 {
  return rng() < 0.5 ? 0 : 1;
}

/** Standard normal via Box–Muller (one value per call, no caching). */
export function randNormal(rng: Rng, mean = 0, sd = 1): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + sd * z;
}

/** Exponential waiting time with rate λ. */
export function randExponential(rng: Rng, rate: number): number {
  if (rate <= 0) return Number.POSITIVE_INFINITY;
  let u = 0;
  while (u === 0) u = rng();
  return -Math.log(u) / rate;
}

export function shuffle<T>(rng: Rng, input: readonly T[]): T[] {
  const a = input.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) throw new Error("pick() from empty array");
  return items[randInt(rng, items.length)]!;
}
