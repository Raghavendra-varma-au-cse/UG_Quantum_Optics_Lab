import { describe, expect, it } from "vitest";

import { EXPERIMENT_SLUGS } from "@/lib/content/registry";
import { REFERENCE_CATALOGUE } from "@/lib/content/references";

import content from "./content";
import {
  EXPECTED_TRIALS_PER_DETECTION,
  P_LIVE_PRIOR,
  THEORY_DUD,
  THEORY_LIVE,
  addTrial,
  bombKindAt,
  conclusionFromOutcome,
  confidenceAtLeastOneD0,
  cumulativeSeries,
  emptyStats,
  isFalseConclusion,
  outcomeAt,
  posteriorLiveGivenD1,
  runBatch,
  summarise,
  theoreticalCounts,
  trialAt,
  wilsonInterval,
  type BombKind,
  type Outcome
} from "./physics";

/** Wilson-style binomial tolerance: three standard errors at p=0.25. */
const TOLERANCE_3SIGMA_20000 = 3 * Math.sqrt((0.25 * 0.75) / 20000);

describe("ideal probability table", () => {
  it("sums to one for both bomb types", () => {
    for (const kind of ["live", "dud"] as const) {
      const p = kind === "live" ? THEORY_LIVE : THEORY_DUD;
      expect(p.explosion + p.D0 + p.D1).toBeCloseTo(1, 12);
      expect(p.explosion).toBeGreaterThanOrEqual(0);
      expect(p.D0).toBeGreaterThanOrEqual(0);
      expect(p.D1).toBeGreaterThanOrEqual(0);
    }
  });

  it("reproduces the Elitzur–Vaidman values", () => {
    expect(THEORY_LIVE.explosion).toBe(0.5);
    expect(THEORY_LIVE.D0).toBe(0.25);
    expect(THEORY_LIVE.D1).toBe(0.25);
    expect(THEORY_DUD.explosion).toBe(0);
    expect(THEORY_DUD.D0).toBe(0);
    expect(THEORY_DUD.D1).toBe(1);
  });

  it("gives P(D0 | live) = 1/4, the interaction-free bound", () => {
    expect(THEORY_LIVE.D0).toBeCloseTo(0.25, 12);
  });

  it("has the declared 50/50 prior", () => {
    expect(P_LIVE_PRIOR).toBe(0.5);
  });
});

describe("seeded sampling", () => {
  it("is deterministic for a given seed, population and index", () => {
    for (let i = 0; i < 50; i++) {
      expect(trialAt("repro", i, "random")).toEqual(trialAt("repro", i, "random"));
    }
  });

  it("addresses trials independently of batch boundaries", () => {
    const whole = runBatch("boundary", 12, "random", 0).records;
    const partA = runBatch("boundary", 5, "random", 0).records;
    const partB = runBatch("boundary", 7, "random", 5).records;
    expect([...partA, ...partB]).toEqual(whole);

    for (let i = 0; i < whole.length; i++) {
      expect(trialAt("boundary", i, "random")).toEqual(whole[i]);
    }
  });

  it("matches P(D0 | live) = 1/4, P(explosion | live) = 1/2 and P(D1 | live) = 1/4", () => {
    const n = 20000;
    const { stats } = runBatch("live-calibration", n, "live");
    expect(stats.live).toBe(n);
    expect(Math.abs(stats.d0 / n - 0.25)).toBeLessThan(TOLERANCE_3SIGMA_20000);
    expect(Math.abs(stats.explosion / n - 0.5)).toBeLessThan(TOLERANCE_3SIGMA_20000);
    expect(Math.abs(stats.d1 / n - 0.25)).toBeLessThan(TOLERANCE_3SIGMA_20000);
  });

  it("never produces D0 or an explosion for a dud", () => {
    const { records, stats } = runBatch("dud-calibration", 5000, "dud");
    expect(stats.dud).toBe(5000);
    expect(stats.d0).toBe(0);
    expect(stats.explosion).toBe(0);
    expect(stats.d1).toBe(5000);
    expect(records.every((r) => r.outcome === "D1")).toBe(true);
  });

  it("splits a random population near 50/50", () => {
    const n = 20000;
    const { stats } = runBatch("random-prior", n, "random");
    expect(Math.abs(stats.live / n - 0.5)).toBeLessThan(0.02);
    expect(stats.live + stats.dud).toBe(n);
  });

  it("matches the unconditional D0 rate for a 50/50 population", () => {
    const n = 20000;
    const { stats } = runBatch("random-d0", n, "random");
    // P(D0) = P(live) P(D0|live) = 1/2 × 1/4 = 1/8.
    expect(Math.abs(stats.d0 / n - 0.125)).toBeLessThan(0.01);
  });

  it("honours forced populations", () => {
    const n = 200;
    expect(runBatch("forced", n, "live").records.every((r) => r.kind === "live")).toBe(true);
    expect(runBatch("forced", n, "dud").records.every((r) => r.kind === "dud")).toBe(true);
  });
});

describe("decision rule", () => {
  const n = 20000;
  const { records } = runBatch("decision-audit", n, "random");

  it("never certifies a dud as live in the ideal model", () => {
    const falsePositives = records.filter(
      (r) => r.kind === "dud" && r.conclusion === "live"
    );
    expect(falsePositives).toHaveLength(0);
    expect(summarise(records).falseConclusions).toBe(0);
  });

  it("never certifies any bomb from a D1 click", () => {
    expect(conclusionFromOutcome("D1")).toBeNull();
    expect(records.filter((r) => r.outcome === "D1").every((r) => r.conclusion === null)).toBe(true);
  });

  it("certifies every D0 and every explosion as live", () => {
    for (const outcome of ["D0", "explosion"] as const) {
      expect(conclusionFromOutcome(outcome)).toBe("live");
    }
    expect(
      records.filter((r) => r.outcome !== "D1").every((r) => r.conclusion === "live")
    ).toBe(true);
  });

  it("produces no false conclusion of any kind", () => {
    expect(records.filter(isFalseConclusion)).toHaveLength(0);
  });

  it("counts an explosion as destructive and a D0 as interaction-free", () => {
    const { stats } = runBatch("semantics", 5000, "live");
    expect(stats.certifiedLive).toBe(stats.d0);
    expect(stats.destructiveLive).toBe(stats.explosion);
    expect(stats.inconclusive).toBe(stats.d1);
  });
});

describe("expected trials and confidence", () => {
  it("expects 1/p = 4 live bombs per interaction-free detection", () => {
    expect(EXPECTED_TRIALS_PER_DETECTION).toBe(4);
    expect(EXPECTED_TRIALS_PER_DETECTION).toBeCloseTo(1 / 0.25, 12);
  });

  it("computes the per-run detection confidence", () => {
    expect(confidenceAtLeastOneD0(0)).toBe(0);
    expect(confidenceAtLeastOneD0(10)).toBeCloseTo(1 - Math.pow(0.75, 10), 12);
    expect(confidenceAtLeastOneD0(10)).toBeCloseTo(0.9436864853, 8);
    expect(confidenceAtLeastOneD0(1)).toBeCloseTo(0.25, 12);
    expect(confidenceAtLeastOneD0(100)).toBeGreaterThan(0.9999999999);
  });

  it("updates the live posterior after repeated D1 clicks", () => {
    expect(posteriorLiveGivenD1(0)).toBeCloseTo(0.5, 12);
    expect(posteriorLiveGivenD1(1)).toBeCloseTo(0.2, 12);
    expect(posteriorLiveGivenD1(3)).toBeCloseTo(1 / 65, 12);
    expect(posteriorLiveGivenD1(10)).toBeLessThan(posteriorLiveGivenD1(5));
  });
});

describe("observable statistics", () => {
  it("builds the same aggregate incrementally and in one pass", () => {
    const { records } = runBatch("aggregate", 400, "random");
    let incremental = emptyStats();
    for (const t of records) incremental = addTrial(incremental, t);
    expect(incremental).toEqual(summarise(records));
  });

  it("predicts counts from the realised live/dud mix", () => {
    const { stats } = runBatch("expected-counts", 4000, "random");
    const expected = theoreticalCounts(stats);
    expect(expected.explosion).toBeCloseTo(stats.live * 0.5, 12);
    expect(expected.D0).toBeCloseTo(stats.live * 0.25, 12);
    expect(expected.D1).toBeCloseTo(stats.live * 0.25 + stats.dud, 12);
    expect(Math.abs(stats.d0 - expected.D0)).toBeLessThan(0.03 * Math.max(1, stats.live));
  });

  it("returns a Wilson interval that covers the analytic proportion", () => {
    const interval = wilsonInterval(250, 1000);
    expect(interval).not.toBeNull();
    if (!interval) return;
    expect(interval.centre).toBeCloseTo(0.25, 12);
    expect(interval.low).toBeLessThan(0.25);
    expect(interval.high).toBeGreaterThan(0.25);
    expect(interval.low).toBeGreaterThan(0);
    expect(interval.high).toBeLessThan(0.5);
    expect(wilsonInterval(0, 0)).toBeNull();
  });

  it("stays inside [0,1] for extreme proportions", () => {
    const zero = wilsonInterval(0, 20);
    const full = wilsonInterval(20, 20);
    expect(zero).not.toBeNull();
    expect(full).not.toBeNull();
    if (!zero || !full) return;
    expect(zero.low).toBe(0);
    expect(zero.high).toBeGreaterThan(0);
    expect(zero.high).toBeLessThan(0.2);
    expect(full.high).toBe(1);
    expect(full.low).toBeGreaterThan(0.8);
    expect(full.low).toBeLessThan(1);
  });

  it("produces a monotone cumulative curve ending at the totals", () => {
    const { records, stats } = runBatch("series", 1000, "random");
    const series = cumulativeSeries(records, 100);
    expect(series.length).toBeGreaterThan(1);
    expect(series.length).toBeLessThanOrEqual(101);
    const last = series[series.length - 1];
    expect(last).toBeDefined();
    if (!last) return;
    expect(last.n).toBe(1000);
    expect(last.d0).toBe(stats.d0);
    expect(last.expected).toBeCloseTo(stats.live * 0.25, 12);
    for (let i = 1; i < series.length; i++) {
      const prev = series[i - 1];
      const cur = series[i];
      expect(prev).toBeDefined();
      expect(cur).toBeDefined();
      if (!prev || !cur) continue;
      expect(cur.n).toBeGreaterThan(prev.n);
      expect(cur.d0).toBeGreaterThanOrEqual(prev.d0);
      expect(cur.expected).toBeGreaterThanOrEqual(prev.expected);
    }
  });

  it("returns an empty series before the first trial", () => {
    expect(cumulativeSeries([], 100)).toEqual([]);
  });
});

describe("outcome plumbing", () => {
  it("maps seeded draws to the declared outcomes", () => {
    const kinds: BombKind[] = ["live", "dud"];
    const outcomes: Outcome[] = ["explosion", "D0", "D1"];
    for (let i = 0; i < 200; i++) {
      const kind = bombKindAt("plumbing", i, "random");
      const outcome = outcomeAt("plumbing", i, kind);
      expect(kinds).toContain(kind);
      expect(outcomes).toContain(outcome);
      if (kind === "dud") expect(outcome).toBe("D1");
      else expect(outcomes).toContain(outcome);
    }
  });
});

describe("content contract", () => {
  it("declares the required identity and evidence label", () => {
    expect(content.slug).toBe("quantum-bomb-tester");
    expect(content.number).toBe("03");
    expect(content.family).toBe("Quantum foundations");
    expect(content.difficulty).toBe(2);
    expect(content.duration).toBe("2–3 h");
    expect(content.evidence.implementation).toBe("simulation");
    expect(content.title.length).toBeGreaterThan(0);
  });

  it("has the required structural counts", () => {
    expect(content.sections.length).toBeGreaterThanOrEqual(10);
    expect(content.sections.length).toBeLessThanOrEqual(12);
    expect(content.equations.length).toBeGreaterThanOrEqual(8);
    expect(content.derivations).toHaveLength(3);
    expect(content.objectives.length).toBeGreaterThanOrEqual(6);
    expect(content.questions.length).toBeGreaterThanOrEqual(28);
    expect(content.references.length).toBeGreaterThanOrEqual(10);
    expect(content.procedure).toHaveLength(6);
    expect(content.observations).toHaveLength(2);
    expect(content.analysis).toHaveLength(4);
    expect(content.errors).toHaveLength(6);
    expect(content.applications).toHaveLength(4);
  });

  it("cites only catalogue references", () => {
    const catalogueIds = new Set(Object.keys(REFERENCE_CATALOGUE));
    for (const r of content.references) {
      expect(catalogueIds.has(r.id)).toBe(true);
    }
  });

  it("validates every MCQ and numerical question", () => {
    for (const q of content.questions) {
      if (q.type === "mcq") {
        expect(q.options).toBeDefined();
        expect(q.answerIndex).toBeDefined();
        if (!q.options || q.answerIndex === undefined) continue;
        expect(q.answerIndex).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex).toBeLessThan(q.options.length);
        expect(q.answer.length).toBeGreaterThan(0);
      }
      if (q.type === "numerical") {
        expect(q.numeric).toBeDefined();
        expect(q.numeric?.value).toBeDefined();
      }
    }
  });

  it("marks every completion status true and links only real experiments", () => {
    expect(content.status).toBeDefined();
    if (!content.status) return;
    expect(Object.values(content.status).every(Boolean)).toBe(true);
    const slugs = new Set<string>(EXPERIMENT_SLUGS);
    for (const s of content.related) expect(slugs.has(s)).toBe(true);
  });

  it("assumes no hardware and excludes a real explosive", () => {
    expect(content.kit.verification).toBe("unverified");
    expect(content.hardware.length).toBeGreaterThan(0);
    expect(content.hardware.every((h) => h.role === "unverified")).toBe(true);
    const exclusions = content.simulation.exclusions.join(" ").toLowerCase();
    expect(exclusions).toContain("explosive");
    expect(content.simulation.stochastic).toBeDefined();
  });

  it("has unique identifiers and resolvable derivation references", () => {
    const sectionIds = content.sections.map((s) => s.id);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
    const equationIds = content.equations.map((e) => e.id);
    expect(new Set(equationIds).size).toBe(equationIds.length);
    const derivationIds = new Set(content.derivations.map((d) => d.id));
    expect(derivationIds.size).toBe(content.derivations.length);
    const questionIds = new Set(content.questions.map((q) => q.id));
    expect(questionIds.size).toBe(content.questions.length);
    for (const section of content.sections) {
      for (const block of section.blocks) {
        if (block.type === "derivation") {
          expect(derivationIds.has(block.derivationId)).toBe(true);
        }
      }
    }
  });

  it("preserves LaTeX backslashes for KaTeX", () => {
    const bs = content.equations.find((e) => e.id === "bs-transformation");
    const d0 = content.equations.find((e) => e.id === "p-d0");
    const state = content.equations.find((e) => e.id === "state-after-bs1");
    expect(bs).toBeDefined();
    expect(d0).toBeDefined();
    expect(state).toBeDefined();
    if (!bs || !d0 || !state) return;
    expect(bs.latex).toContain("\\begin{pmatrix}");
    expect(bs.latex).toContain("\\\\");
    expect(state.latex).toContain("\\frac");
    expect(d0.latex).toContain("\\tfrac");
    expect(state.latex).not.toContain("\f");
    expect(d0.latex).not.toContain("\t");
  });

  it("uses both required diagram kinds", () => {
    const kinds: string[] = [];
    for (const section of content.sections) {
      for (const block of section.blocks) {
        if (block.type === "diagram") kinds.push(block.kind);
      }
    }
    expect(kinds).toContain("bomb-tester");
    expect(kinds).toContain("mach-zehnder");
  });
});
