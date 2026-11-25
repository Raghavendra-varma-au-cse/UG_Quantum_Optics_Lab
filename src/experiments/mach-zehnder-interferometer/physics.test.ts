import { describe, expect, it } from "vitest";
import { cAbs2, isUnitary } from "@/lib/physics/complex";
import { beamSplitterMatrix, machZehnder } from "@/lib/physics/quantum";
import { HARDWARE_ID_SET } from "@/lib/content/hardware-ids";
import { REFERENCE_CATALOGUE } from "@/lib/content/references";
import content from "./content";
import {
  HE_NE_WAVELENGTH_NM,
  countPhotons,
  maxPhaseSensitivity,
  phaseFromPathDifference,
  scanPhase,
  simulateMachZehnder,
  visibilityForSplitting
} from "./physics";

const ETA_VALUES = [0.2, 0.35, 0.5, 0.65, 0.8];

describe("beam-splitter matrix", () => {
  it("is unitary for several reflectivities", () => {
    for (const eta of ETA_VALUES) {
      expect(isUnitary(beamSplitterMatrix(eta))).toBe(true);
    }
  });

  it("uses t² = 1−η and r² = η", () => {
    for (const eta of ETA_VALUES) {
      const b = beamSplitterMatrix(eta);
      expect(cAbs2(b[0][0])).toBeCloseTo(1 - eta, 12);
      expect(cAbs2(b[0][1])).toBeCloseTo(eta, 12);
      expect(b[0][1].re).toBeCloseTo(0, 12);
      expect(b[0][1].im).toBeCloseTo(Math.sqrt(eta), 12);
    }
  });
});

describe("Mach–Zehnder probabilities", () => {
  it("conserves total probability over a full phase scan", () => {
    for (const eta1 of ETA_VALUES) {
      for (const eta2 of ETA_VALUES) {
        for (const phase of [-2, -1.1, -0.2, 0, 0.7, 1.9, 3.0]) {
          const r = simulateMachZehnder({ phaseRad: phase, eta1, eta2 });
          expect(r.p0 + r.p1).toBeCloseTo(1, 12);
          expect(r.loss).toBeCloseTo(0, 12);
        }
      }
    }
  });

  it("keeps the total at the surviving fraction when one arm is blocked", () => {
    for (const eta1 of ETA_VALUES) {
      const blockedA = simulateMachZehnder({ phaseRad: 0.4, eta1, eta2: 0.5, blockA: true });
      expect(blockedA.p0 + blockedA.p1).toBeCloseTo(1 - eta1, 12);
      expect(blockedA.p0).toBeCloseTo((1 - eta1) * 0.5, 12);
      expect(blockedA.p1).toBeCloseTo((1 - eta1) * 0.5, 12);

      const blockedB = simulateMachZehnder({ phaseRad: 0.4, eta1, eta2: 0.5, blockB: true });
      expect(blockedB.p0 + blockedB.p1).toBeCloseTo(eta1, 12);
      expect(blockedB.p0).toBeCloseTo(eta1 * 0.5, 12);
      expect(blockedB.p1).toBeCloseTo(eta1 * 0.5, 12);
      expect(blockedB.visibility).toBe(0);
    }
  });

  it("matches the shared machZehnder implementation", () => {
    for (const eta1 of ETA_VALUES) {
      for (const eta2 of ETA_VALUES) {
        for (const phase of [-2.1, -0.4, 0, 0.9, 2.8]) {
          const mine = simulateMachZehnder({ phaseRad: phase, eta1, eta2 });
          const shared = machZehnder(phase, 0, eta1, eta2);
          expect(mine.p0).toBeCloseTo(shared.p0, 12);
          expect(mine.p1).toBeCloseTo(shared.p1, 12);
        }
      }
    }
  });

  it("has a dark port at φ = 0 for a balanced interferometer", () => {
    const r = simulateMachZehnder({ phaseRad: 0, eta1: 0.5, eta2: 0.5 });
    expect(r.p0).toBeCloseTo(0, 12);
    expect(r.p1).toBeCloseTo(1, 12);
    expect(r.amp0.re).toBeCloseTo(0, 12);
    expect(r.amp0.im).toBeCloseTo(0, 12);

    const shared = machZehnder(0, 0, 0.5, 0.5);
    expect(shared.p0).toBeCloseTo(r.p0, 12);
    expect(shared.p1).toBeCloseTo(r.p1, 12);
  });

  it("follows P0 = sin²(φ/2) and P1 = cos²(φ/2)", () => {
    for (const phase of [0, 0.3, 1.0, Math.PI / 2, 2.2, Math.PI, 4.5, 2 * Math.PI]) {
      const r = simulateMachZehnder({ phaseRad: phase, eta1: 0.5, eta2: 0.5 });
      expect(r.p0).toBeCloseTo(Math.sin(phase / 2) ** 2, 12);
      expect(r.p1).toBeCloseTo(Math.cos(phase / 2) ** 2, 12);
    }
  });

  it("gives unit visibility for a balanced, coherent interferometer", () => {
    expect(visibilityForSplitting(0.5, 0.5, 1)).toBeCloseTo(1, 12);
    const scan = scanPhase({ eta1: 0.5, eta2: 0.5 }, 4001);
    const values = scan.map((p) => p.p0);
    const v = (Math.max(...values) - Math.min(...values)) / (Math.max(...values) + Math.min(...values));
    expect(v).toBeCloseTo(1, 10);
  });

  it("reduces visibility in proportion to the coherence factor", () => {
    expect(visibilityForSplitting(0.5, 0.5, 0.4)).toBeCloseTo(0.4, 12);
    const r = simulateMachZehnder({ phaseRad: 0, eta1: 0.5, eta2: 0.5, coherence: 0.4 });
    expect(r.visibility).toBeCloseTo(0.4, 12);
    expect(r.p0).toBeCloseTo(0.3, 12);
    expect(r.p1).toBeCloseTo(0.7, 12);
  });

  it("matches the unequal-splitting visibility formula", () => {
    for (const eta1 of [0.3, 0.5, 0.6]) {
      for (const eta2 of [0.4, 0.5, 0.7, 0.8]) {
        const expected =
          (2 * Math.sqrt(eta1 * eta2 * (1 - eta1) * (1 - eta2))) /
          (eta1 * eta2 + (1 - eta1) * (1 - eta2));
        expect(visibilityForSplitting(eta1, eta2, 1)).toBeCloseTo(expected, 12);

        const scan = scanPhase({ eta1, eta2 }, 4001);
        const values = scan.map((p) => p.p0);
        const hi = Math.max(...values);
        const lo = Math.min(...values);
        expect((hi - lo) / (hi + lo)).toBeCloseTo(expected, 9);
      }
    }
  });

  it("reports the maximum phase sensitivity 2 t1 t2 r1 r2 γ", () => {
    const eta1 = 0.5;
    const eta2 = 0.5;
    expect(maxPhaseSensitivity(eta1, eta2, 1)).toBeCloseTo(0.5, 12);
    expect(maxPhaseSensitivity(0.3, 0.7, 0.8)).toBeCloseTo(
      2 * Math.sqrt(0.3 * 0.7 * 0.7 * 0.3) * 0.8,
      12
    );
  });
});

describe("phase and optical path difference", () => {
  it("maps one wavelength of OPD to 2π", () => {
    expect(phaseFromPathDifference(HE_NE_WAVELENGTH_NM)).toBeCloseTo(2 * Math.PI, 12);
    expect(phaseFromPathDifference(HE_NE_WAVELENGTH_NM / 2)).toBeCloseTo(Math.PI, 12);
    expect(phaseFromPathDifference(HE_NE_WAVELENGTH_NM / 4)).toBeCloseTo(Math.PI / 2, 12);
  });

  it("puts the dark port at λ/2 of extra path difference", () => {
    const phase = phaseFromPathDifference(HE_NE_WAVELENGTH_NM / 2);
    const r = simulateMachZehnder({ phaseRad: phase, eta1: 0.5, eta2: 0.5 });
    expect(r.p0).toBeCloseTo(1, 10);
    expect(r.p1).toBeCloseTo(0, 10);
  });
});

describe("seeded photon counting", () => {
  it("is reproducible and conserves the number of events", () => {
    const a = countPhotons(0.25, 0.75, 500, "mz-test");
    const b = countPhotons(0.25, 0.75, 500, "mz-test");
    expect(a.counts0).toBe(b.counts0);
    expect(a.counts1).toBe(b.counts1);
    expect(a.counts0 + a.counts1 + a.lost).toBe(500);
    expect(a.events).toHaveLength(20);
    expect(a.events[a.events.length - 1]?.count0).toBe(a.counts0);
    expect(a.events[a.events.length - 1]?.count1).toBe(a.counts1);
  });

  it("returns observed fractions close to the model probabilities", () => {
    const r = countPhotons(0.3, 0.7, 20000, "mz-large");
    expect(r.counts0 / r.n).toBeCloseTo(0.3, 1);
    expect(r.counts1 / r.n).toBeCloseTo(0.7, 1);
    expect(r.lost).toBe(0);
  });

  it("counts loss when a path is blocked", () => {
    const model = simulateMachZehnder({ phaseRad: 0.2, eta1: 0.5, eta2: 0.5, blockA: true });
    const r = countPhotons(model.p0, model.p1, 4000, "mz-loss");
    expect(r.lost / r.n).toBeCloseTo(model.loss, 1);
  });
});

describe("experiment content integrity", () => {
  it("declares the expected structure and counts", () => {
    expect(content.slug).toBe("mach-zehnder-interferometer");
    expect(content.number).toBe("02");
    expect(content.family).toBe("Interferometry");
    expect(content.difficulty).toBe(2);
    expect(content.duration).toBe("3–4 h");
    expect(content.evidence.implementation).toBe("classical-demo");
    expect(content.kit.verification).toBe("unverified");
    expect(content.sections).toHaveLength(12);
    expect(content.equations.length).toBeGreaterThanOrEqual(8);
    expect(content.equations.length).toBeLessThanOrEqual(12);
    expect(content.derivations).toHaveLength(3);
    expect(content.objectives.length).toBeGreaterThanOrEqual(7);
    expect(content.objectives.length).toBeLessThanOrEqual(9);
    expect(content.procedure).toHaveLength(6);
    expect(content.observations).toHaveLength(2);
    expect(content.analysis).toHaveLength(4);
    expect(content.errors).toHaveLength(6);
    expect(content.questions.length).toBeGreaterThanOrEqual(28);
    expect(content.references.length).toBeGreaterThanOrEqual(10);
    expect(content.related).toEqual([
      "michelson-interferometer",
      "quantum-bomb-tester",
      "quantum-eraser",
      "quantum-key-distribution"
    ]);
    expect(content.status).toEqual({
      content: true,
      simulation: true,
      procedure: true,
      analysis: true,
      questions: true,
      references: true,
      validation: true
    });
  });

  it("uses only known hardware and reference identifiers", () => {
    for (const item of content.hardware) {
      expect(HARDWARE_ID_SET.has(item.itemId)).toBe(true);
    }
    for (const ref of content.references) {
      expect(REFERENCE_CATALOGUE[ref.id]).toBe(ref);
    }
  });

  it("has unique question, section and equation identifiers", () => {
    const questionIds = content.questions.map((q) => q.id);
    expect(new Set(questionIds).size).toBe(questionIds.length);
    const sectionIds = content.sections.map((s) => s.id);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
    const equationIds = content.equations.map((e) => e.id);
    expect(new Set(equationIds).size).toBe(equationIds.length);
  });

  it("has valid answers for multiple-choice questions", () => {
    const mcqs = content.questions.filter((q) => q.type === "mcq");
    expect(mcqs.length).toBeGreaterThan(5);
    for (const q of mcqs) {
      expect(q.options?.length).toBeGreaterThan(1);
      expect(q.answerIndex).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex).toBeLessThan(q.options?.length ?? 0);
    }
  });

  it("gives every numerical question a numeric answer field", () => {
    for (const q of content.questions.filter((item) => item.type === "numerical")) {
      expect(q.numeric).toBeDefined();
      expect(Number.isFinite(q.numeric?.value)).toBe(true);
    }
  });
});
