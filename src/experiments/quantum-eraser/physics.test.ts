import { describe, expect, it } from "vitest";
import { maxConditionalVisibility } from "@/lib/physics/quantum";
import {
  DEFAULT_ERASER_CONFIG,
  analyzerChannels,
  analyzerFraction,
  bestAnalyzerAngle,
  conditionalVisibility,
  coreEraserResult,
  effectiveMarkerAngle,
  fringeProfile,
  markerDistinguishability,
  markerOverlap,
  markerVisibility,
  maxConditionalVisibilityForRatio,
  measuredVisibilityFromCounts,
  orthogonalConditionalVisibility,
  rawFringeRate,
  resolveEraserState,
  simulateAnalyzerSeries,
  simulateCoincidence,
  simulateMarkerSeries,
  tracedPathDensityMatrix,
  type EraserConfig
} from "./physics";

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThanOrEqual(eps);

const config = (over: Partial<EraserConfig> = {}): EraserConfig => ({
  ...DEFAULT_ERASER_CONFIG,
  ...over
});

describe("marker overlap, visibility and distinguishability", () => {
  it("gives unit visibility when no which-path marker is present (θ = 0)", () => {
    close(markerVisibility(0), 1);
    close(markerVisibility(0, 1.7), (2 * Math.sqrt(1.7)) / (1 + 1.7));
    expect(markerOverlap(0)).toBeCloseTo(1, 12);
    expect(markerDistinguishability(0)).toBeCloseTo(0, 12);
  });

  it("gives zero visibility for orthogonal markers (θ = 90°)", () => {
    expect(markerVisibility(90)).toBeLessThan(1e-12);
    expect(markerOverlap(90)).toBeLessThan(1e-12);
    expect(markerDistinguishability(90)).toBeCloseTo(1, 12);
  });

  it("gives V = |cos θ| for balanced paths", () => {
    for (const theta of [0, 10, 30, 45, 60, 75, 90]) {
      expect(markerVisibility(theta)).toBeCloseTo(Math.abs(Math.cos((theta * Math.PI) / 180)), 12);
    }
    expect(markerVisibility(60)).toBeCloseTo(0.5, 12);
  });

  it("saturates the pure-state duality relation D² + V² = 1 for balanced marking", () => {
    for (const theta of [0, 15, 30, 45, 60, 75, 90]) {
      const state = resolveEraserState(config({ markerAngleDeg: theta }));
      expect(state.dualitySum).toBeCloseTo(1, 12);
    }
  });

  it("obeys D² + V² ≤ 1 when the paths are unbalanced", () => {
    for (const ratio of [0.25, 0.5, 2, 4]) {
      for (const theta of [0, 20, 40, 60, 80, 90]) {
        const state = resolveEraserState(
          config({ markerAngleDeg: theta, intensityRatio: ratio, analyzerInserted: false })
        );
        expect(state.dualitySum).toBeLessThanOrEqual(1 + 1e-12);
      }
    }
  });
});

describe("analyser projection and conditional visibility", () => {
  it("recovers unit conditional visibility at θ = 90°, α = 45°", () => {
    expect(conditionalVisibility(90, 45)).toBeCloseTo(1, 12);
    expect(orthogonalConditionalVisibility(90, 45)).toBeCloseTo(1, 12);
  });

  it("blocks the marked path at α = 0° when θ = 90°, so no fringes remain", () => {
    expect(conditionalVisibility(90, 0)).toBeLessThan(1e-12);
    expect(conditionalVisibility(90, 90)).toBeLessThan(1e-12);
    expect(conditionalVisibility(90, 30)).toBeCloseTo(Math.sin((60 * Math.PI) / 180), 12);
  });

  it("reaches unit conditional visibility at the bisector α = θ/2 for balanced paths", () => {
    for (const theta of [20, 45, 70, 90]) {
      expect(conditionalVisibility(theta, theta / 2)).toBeCloseTo(1, 12);
      expect(bestAnalyzerAngle(theta)).toBeCloseTo(theta / 2, 12);
    }
  });

  it("agrees with the shared quantumEraser conditional visibility", () => {
    for (const theta of [0, 25, 50, 75, 90]) {
      for (const alpha of [0, 30, 45, 67.5, 90, 120, 160]) {
        // At α = θ + 90° both projected amplitudes vanish and the visibility is
        // undefined (no detected light). The shared routine can return a
        // numerically meaningless value there, so compare only where light
        // reaches the detector.
        if (analyzerFraction(theta, alpha) < 1e-9) continue;
        const shared = coreEraserResult(config({ markerAngleDeg: theta, analyzerAngleDeg: alpha }));
        expect(conditionalVisibility(theta, alpha)).toBeCloseTo(shared.conditionalVisibility, 10);
      }
    }
  });

  it("keeps the analyser channel fractions normalised", () => {
    for (const theta of [0, 30, 60, 90]) {
      for (const alpha of [0, 22.5, 45, 90, 135, 179]) {
        for (const ratio of [0.4, 1, 3]) {
          const ch = analyzerChannels(theta, alpha, ratio);
          expect(ch.qPlus + ch.qMinus).toBeCloseTo(1, 12);
          expect(ch.plusVisibility).toBeLessThanOrEqual(1 + 1e-12);
          expect(ch.minusVisibility).toBeLessThanOrEqual(1 + 1e-12);
        }
      }
    }
    expect(analyzerFraction(90, 45) + analyzerFraction(90, 135)).toBeCloseTo(1, 12);
  });

  it("max conditional visibility is 2r/(1+r²) and is monotonic in θ for balanced paths", () => {
    let previous = -Infinity;
    for (let theta = 0; theta <= 90; theta += 5) {
      const value = maxConditionalVisibility(theta);
      expect(value).toBeGreaterThanOrEqual(previous - 1e-12);
      previous = value;
    }
    expect(maxConditionalVisibilityForRatio(90, 1)).toBeCloseTo(1, 12);
    expect(maxConditionalVisibilityForRatio(90, 4)).toBeCloseTo(0.8, 12);
  });
});

describe("complementarity and the summed pattern", () => {
  it("shows no fringes in the ungated pattern at θ = 90°, even with the analyser inserted", () => {
    const state = resolveEraserState(config({ markerAngleDeg: 90, analyzerAngleDeg: 45, gated: false }));
    expect(state.totalVisibility).toBeLessThan(1e-12);
    expect(state.distinguishability).toBeCloseTo(1, 12);
    expect(state.dualitySum).toBeCloseTo(1, 12);
    expect(state.displayVisibility).toBeLessThan(1e-12);
  });

  it("recovers fringes only after channel post-selection", () => {
    const ungated = resolveEraserState(config({ gated: false }));
    const gated = resolveEraserState(config({ gated: true }));
    expect(ungated.displayVisibility).toBeLessThan(1e-12);
    expect(gated.displayVisibility).toBeCloseTo(1, 12);
    expect(gated.plusVisibility).toBeCloseTo(1, 12);
    expect(gated.minusVisibility).toBeCloseTo(1, 12);
    // Both analyser channels can be fully coherent: they are separately
    // post-selected and carry fringes of opposite phase.  The complementarity
    // statement is about the *weighted* channel visibility, which cannot
    // exceed one, and about the ungated sum, which is flat.
    expect(gated.weightedChannelVisibility).toBeCloseTo(1, 12);
  });

  it("cannot make the conditional fringes and the unconditioned pattern maximal at once", () => {
    const state = resolveEraserState(config({ markerAngleDeg: 90, analyzerAngleDeg: 45, gated: true }));
    expect(state.conditionalVisibility).toBeCloseTo(1, 12);
    expect(state.totalVisibility).toBeLessThan(1e-12);
    expect(state.conditionalVisibility + state.totalVisibility).toBeLessThanOrEqual(1 + 1e-12);
  });

  it("bounds the mean-weighted visibility of the two analyser channels by one", () => {
    for (const theta of [0, 15, 30, 45, 60, 75, 90]) {
      for (let alpha = 0; alpha <= 180; alpha += 5) {
        for (const ratio of [0.3, 1, 2.5]) {
          const state = resolveEraserState(
            config({ markerAngleDeg: theta, analyzerAngleDeg: alpha, intensityRatio: ratio, gated: true })
          );
          expect(state.weightedChannelVisibility).toBeLessThanOrEqual(1 + 1e-12);
        }
      }
    }
  });

  it("keeps the channel rates non-negative and additive", () => {
    for (const theta of [0, 45, 90]) {
      for (const alpha of [0, 30, 45, 120]) {
        for (const ratio of [0.5, 1, 3]) {
          const cfg = config({ markerAngleDeg: theta, analyzerAngleDeg: alpha, intensityRatio: ratio, gated: true });
          for (let phi = 0; phi < 2 * Math.PI; phi += 0.1) {
            const total = rawFringeRate(cfg, "total", phi);
            const plus = rawFringeRate(cfg, "plus", phi);
            const minus = rawFringeRate(cfg, "minus", phi);
            expect(plus).toBeGreaterThanOrEqual(-1e-12);
            expect(minus).toBeGreaterThanOrEqual(-1e-12);
            expect(plus + minus).toBeCloseTo(total, 12);
          }
        }
      }
    }
  });
});

describe("fringe monitor and density matrix", () => {
  it("renders full contrast at θ = 0° and a flat strip at θ = 90°", () => {
    const open = fringeProfile(config({ markerAngleDeg: 0, analyzerInserted: false }), "total", 256, 4);
    let lo = Infinity;
    let hi = -Infinity;
    for (const v of open) {
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
    expect(hi - lo).toBeGreaterThan(0.98);

    const flat = fringeProfile(config({ markerAngleDeg: 90, analyzerInserted: false }), "total", 256, 4);
    for (const v of flat) expect(v).toBeCloseTo(0.5, 12);
  });

  it("produces complementary normalised channel strips at the erasure angle", () => {
    const cfg = config({ markerAngleDeg: 90, analyzerAngleDeg: 45 });
    const plus = fringeProfile(cfg, "plus", 256, 4);
    const minus = fringeProfile(cfg, "minus", 256, 4);
    for (let i = 0; i < plus.length; i++) {
      expect((plus[i] ?? 0) + (minus[i] ?? 0)).toBeCloseTo(1, 5);
    }
  });

  it("traces the marker out to a coherence equal to V/2", () => {
    for (const theta of [0, 30, 60, 90]) {
      const rho = tracedPathDensityMatrix(theta, 0.7, 1);
      expect(rho[0][0].re + rho[1][1].re).toBeCloseTo(1, 12);
      const coherence = Math.hypot(rho[0][1].re, rho[0][1].im);
      expect(coherence).toBeCloseTo(markerVisibility(theta) / 2, 12);
    }
  });

  it("treats the removed marker as θ = 0°", () => {
    expect(effectiveMarkerAngle(config({ markerInserted: false, markerAngleDeg: 90 }))).toBe(0);
    const state = resolveEraserState(config({ markerInserted: false, analyzerInserted: false }));
    expect(state.totalVisibility).toBeCloseTo(1, 12);
    expect(state.distinguishability).toBeCloseTo(0, 12);
  });
});

describe("seeded photon-count sampling", () => {
  it("conserves photon number and is reproducible", () => {
    const runA = simulateCoincidence(config({ gated: true }), 2000, "seed-04");
    const runB = simulateCoincidence(config({ gated: true }), 2000, "seed-04");
    const runC = simulateCoincidence(config({ gated: true }), 2000, "seed-05");
    expect(runA.total.total).toBe(2000);
    expect(runA.plus.total + runA.minus.total).toBe(2000);
    expect(runA.plus.bins).toEqual(runB.plus.bins);
    expect(runA.total.bins).toEqual(runB.total.bins);
    expect(runA.total.bins).not.toEqual(runC.total.bins);
  });

  it("recovers the marker visibility from binned counts", () => {
    const cfg = config({ markerAngleDeg: 60, phaseRad: 0.4, analyzerInserted: false });
    const run = simulateCoincidence(cfg, 9000, "recover-marker", 96, 6);
    expect(run.total.visibility).toBeGreaterThan(0.44);
    expect(run.total.visibility).toBeLessThan(0.56);
    expect(run.total.visibilityError).toBeCloseTo(Math.sqrt(2 / 9000), 12);
  });

  it("recovers conditional fringes and a flat ungated sum at θ = 90°, α = 45°", () => {
    const gated = simulateCoincidence(config({ gated: true }), 9000, "recover-erasure", 96, 6);
    expect(gated.plus.visibility).toBeGreaterThan(0.93);
    expect(gated.minus.visibility).toBeGreaterThan(0.93);
    const ungated = simulateCoincidence(config({ gated: false }), 9000, "recover-erasure", 96, 6);
    expect(ungated.total.visibility).toBeLessThan(0.06);
    expect(ungated.plus.total).toBe(0);
  });

  it("finds the erasure angles in a simulated analyser sweep", () => {
    const points = simulateAnalyzerSeries(
      config({ markerAngleDeg: 90, phaseRad: 0.2 }),
      [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180],
      900,
      "sweep"
    );
    const at45 = points.find((p) => p.x === 45);
    const at0 = points.find((p) => p.x === 0);
    const at90 = points.find((p) => p.x === 90);
    expect(at45?.y ?? 0).toBeGreaterThan(0.8);
    expect(at0?.y ?? 1).toBeLessThan(0.2);
    expect(at90?.y ?? 1).toBeLessThan(0.2);
    for (const p of points) expect(p.error).toBeGreaterThan(0);
  });

  it("produces a marker sweep consistent with |cos θ|", () => {
    const points = simulateMarkerSeries(
      config({ phaseRad: 1.1 }),
      [0, 15, 30, 45, 60, 75, 90],
      1200,
      "marker-sweep"
    );
    for (const p of points) {
      expect(Math.abs(p.y - markerVisibility(p.x))).toBeLessThan(0.08);
      expect(p.counts).toBeGreaterThan(0);
    }
  });

  it("computes visibility from a synthetic perfect fringe and from a flat histogram", () => {
    const bins = 120;
    const cycles = 5;
    const perfect = Array.from({ length: bins }, (_, k) => {
      const x = (k + 0.5) / bins;
      return 100 * (1 + Math.cos(2 * Math.PI * cycles * x));
    });
    const flat = new Array<number>(bins).fill(100);
    expect(measuredVisibilityFromCounts(perfect, cycles).visibility).toBeCloseTo(1, 10);
    expect(measuredVisibilityFromCounts(flat, cycles).visibility).toBeLessThan(1e-12);
  });
});
