import { describe, expect, it } from "vitest";
import katex from "katex";
import {
  MATHEMATICS_CHAPTERS,
  MATHEMATICS_BY_ID,
  getMathChapter
} from "./mathematics";
import {
  QUANTUM_CHAPTERS,
  QUANTUM_BY_ID,
  getQuantumChapter
} from "./quantum-foundations";
import { REFERENCE_CATALOGUE } from "./references";
import type { MathChapter } from "./types";

const ALL: MathChapter[] = [...MATHEMATICS_CHAPTERS, ...QUANTUM_CHAPTERS];

const allowedInteractive = new Set<NonNullable<MathChapter["interactive"]>>([
  "superposition",
  "jones",
  "gaussian",
  "fourier",
  "uncertainty",
  "density",
  "abcd"
]);

function latexStrings(chapter: MathChapter): string[] {
  const out: string[] = [];
  for (const equation of chapter.equations) {
    out.push(equation.latex);
    if (equation.numericExample?.latex) out.push(equation.numericExample.latex);
  }
  for (const derivation of chapter.derivations) {
    for (const step of derivation.steps) if (step.latex) out.push(step.latex);
    out.push(derivation.result.latex);
  }
  for (const block of chapter.blocks) {
    if (block.type === "eq") out.push(block.latex);
    if (block.type === "numeric" && block.latex) out.push(block.latex);
  }
  return out;
}

function braceBalance(latex: string): number {
  let depth = 0;
  for (let i = 0; i < latex.length; i++) {
    const ch = latex[i];
    if (ch === "\\") {
      i += 1;
      continue;
    }
    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;
    if (depth < 0) return -1;
  }
  return depth;
}

describe("mathematics and quantum chapter collections", () => {
  it("contains 10 mathematics and 8 quantum chapters", () => {
    expect(MATHEMATICS_CHAPTERS).toHaveLength(10);
    expect(QUANTUM_CHAPTERS).toHaveLength(8);
  });

  it("has unique chapter ids across both files", () => {
    const ids = ALL.map((chapter) => chapter.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(MATHEMATICS_BY_ID)).toHaveLength(10);
    expect(Object.keys(QUANTUM_BY_ID)).toHaveLength(8);
  });

  it("exposes working lookup functions", () => {
    for (const chapter of ALL) {
      const byId = chapter.id.startsWith("q") ? QUANTUM_BY_ID[chapter.id] : MATHEMATICS_BY_ID[chapter.id];
      expect(byId?.id).toBe(chapter.id);
      const getter = chapter.id.startsWith("q") ? getQuantumChapter : getMathChapter;
      expect(getter(chapter.id)?.id).toBe(chapter.id);
    }
    expect(getMathChapter("not-a-chapter")).toBeUndefined();
    expect(getQuantumChapter("not-a-chapter")).toBeUndefined();
  });

  it("has the required structure in every chapter", () => {
    for (const chapter of ALL) {
      const isQuantum = chapter.id.startsWith("q");
      expect(chapter.number.length).toBeGreaterThan(0);
      expect(chapter.title.length).toBeGreaterThan(3);
      expect(chapter.kicker.length).toBeGreaterThan(3);
      expect(chapter.summary.length).toBeGreaterThan(80);
      expect(chapter.blocks.length, chapter.id).toBeGreaterThanOrEqual(isQuantum ? 5 : 6);
      expect(chapter.blocks.length, chapter.id).toBeLessThanOrEqual(isQuantum ? 10 : 12);
      expect(chapter.equations.length).toBeGreaterThanOrEqual(3);
      expect(chapter.equations.length).toBeLessThanOrEqual(5);
      expect(chapter.derivations.length).toBeGreaterThanOrEqual(1);
      expect(chapter.derivations.length).toBeLessThanOrEqual(2);
      expect(chapter.problems.length).toBeGreaterThanOrEqual(4);
      expect(chapter.problems.length).toBeLessThanOrEqual(6);
      expect(chapter.references.length).toBeGreaterThanOrEqual(3);
      expect(chapter.references.length).toBeLessThanOrEqual(5);
      expect(chapter.related.length).toBeGreaterThan(0);
      expect(chapter.interactive).toBeDefined();
      expect(allowedInteractive.has(chapter.interactive!)).toBe(true);
      expect(chapter.blocks.some((block) => block.type === "numeric")).toBe(true);
      const numericBlocks = chapter.blocks.filter((block) => block.type === "numeric");
      expect(numericBlocks.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("uses every interactive key at least once", () => {
    const used = new Set(ALL.map((chapter) => chapter.interactive));
    for (const key of allowedInteractive) {
      expect(used.has(key), `interactive key not used: ${key}`).toBe(true);
    }
  });

  it("has at least three equations and four problems everywhere", () => {
    for (const chapter of ALL) {
      expect(chapter.equations.length, chapter.id).toBeGreaterThanOrEqual(3);
      expect(chapter.problems.length, chapter.id).toBeGreaterThanOrEqual(4);
    }
  });

  it("uses only catalogue references", () => {
    for (const chapter of ALL) {
      for (const reference of chapter.references) {
        expect(REFERENCE_CATALOGUE[reference.id], `${chapter.id} -> ${reference.id}`).toBeDefined();
        expect(reference.title.length).toBeGreaterThan(0);
      }
    }
  });

  it("has unique equation, derivation and problem ids", () => {
    const ids: string[] = [];
    for (const chapter of ALL) {
      for (const equation of chapter.equations) ids.push(equation.id);
      for (const derivation of chapter.derivations) ids.push(derivation.id);
      for (const problem of chapter.problems) ids.push(problem.id);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a valid answer index for every MCQ and enough options", () => {
    for (const chapter of ALL) {
      for (const problem of chapter.problems) {
        if (problem.type !== "mcq") continue;
        expect(problem.options, problem.id).toBeDefined();
        expect(problem.options!.length, problem.id).toBeGreaterThanOrEqual(2);
        expect(problem.answerIndex, problem.id).toBeTypeOf("number");
        expect(Number.isInteger(problem.answerIndex), problem.id).toBe(true);
        expect(problem.answerIndex!, problem.id).toBeGreaterThanOrEqual(0);
        expect(problem.answerIndex!, problem.id).toBeLessThan(problem.options!.length);
      }
    }
  });

  it("gives every numerical problem a finite numeric answer with a tolerance", () => {
    for (const chapter of ALL) {
      for (const problem of chapter.problems) {
        if (problem.type !== "numerical") continue;
        expect(problem.numeric, problem.id).toBeDefined();
        expect(Number.isFinite(problem.numeric!.value), problem.id).toBe(true);
        expect(problem.numeric!.tolerance, problem.id).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("has derivations with at least three steps and a result", () => {
    for (const chapter of ALL) {
      for (const derivation of chapter.derivations) {
        expect(derivation.steps.length, derivation.id).toBeGreaterThanOrEqual(3);
        expect(derivation.steps.length, derivation.id).toBeLessThanOrEqual(8);
        expect(derivation.result.latex.length, derivation.id).toBeGreaterThan(0);
        expect(derivation.result.text.length, derivation.id).toBeGreaterThan(20);
      }
    }
  });

  it("introduces every equation with symbols and interpretation", () => {
    const thin: string[] = [];
    for (const chapter of ALL) {
      for (const equation of chapter.equations) {
        expect(equation.name.length, equation.id).toBeGreaterThan(2);
        if (equation.symbols.length < 2) thin.push(equation.id);
        expect(equation.interpretation.length, equation.id).toBeGreaterThan(40);
        for (const symbol of equation.symbols) {
          expect(symbol.symbol.length, equation.id).toBeGreaterThan(0);
          expect(symbol.meaning.length, equation.id).toBeGreaterThan(0);
        }
      }
    }
    expect(thin).toEqual([]);
  });

  it("contains no literal control characters in LaTeX strings", () => {
    const control = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;
    for (const chapter of ALL) {
      for (const latex of latexStrings(chapter)) {
        expect(control.test(latex), `${chapter.id}: ${latex}`).toBe(false);
        expect(latex.includes("\n"), chapter.id).toBe(false);
        expect(latex.includes("\r"), chapter.id).toBe(false);
        expect(braceBalance(latex), `${chapter.id}: ${latex}`).toBe(0);
      }
    }
  });

  it("renders every display LaTeX string with KaTeX", () => {
    for (const chapter of ALL) {
      for (const latex of latexStrings(chapter)) {
        expect(() =>
          katex.renderToString(latex, { throwOnError: true, displayMode: true, strict: false })
        , `${chapter.id}: ${latex}`).not.toThrow();
      }
    }
  });

  it("keeps a few known numerical answers correct", () => {
    const find = (chapterId: string, problemId: string) => {
      const chapter = ALL.find((c) => c.id === chapterId);
      expect(chapter, chapterId).toBeDefined();
      const problem = chapter!.problems.find((p) => p.id === problemId);
      expect(problem, problemId).toBeDefined();
      return problem!;
    };

    // Malus at 30 degrees.
    expect(find("polarization-mathematics", "m10-p1").numeric!.value).toBeCloseTo(0.75, 6);

    // Rayleigh range of w0 = 0.5 mm at 633 nm.
    const zR = Math.PI * (0.5e-3) ** 2 / 633e-9;
    expect(find("gaussian-beams-and-abcd", "m05-p1").numeric!.value).toBeCloseTo(zR, 2);

    // One fringe per lambda/2 of mirror travel.
    expect(find("interference-and-coherence", "m04-p1").numeric!.value).toBeCloseTo(633, 0);

    // Two-beam intensity at quadrature.
    expect(find("trigonometry-and-complex-numbers", "m01-p2").numeric!.value).toBeCloseTo(10, 6);

    // Mach-Zehnder dark port at 120 degrees.
    expect(1 - Math.cos((120 * Math.PI) / 180)).toBeCloseTo(1.5, 6);
    expect(find("q03-superposition-and-complex-amplitudes", "q03-p1").numeric!.value).toBeCloseTo(
      0.75,
      6
    );

    // Ideal bomb tester interaction-free probability.
    expect(find("q08-decoherence-which-path-and-complementarity", "q08-p5").numeric!.value).toBeCloseTo(
      0.25,
      6
    );

    // Purity of [[0.6, 0.2], [0.2, 0.4]].
    expect((1 + Math.hypot(0.4, 0.2) ** 2) / 2).toBeCloseTo(0.6, 6);
    expect(find("q06-density-matrices-pure-and-mixed", "q06-p2").numeric!.value).toBeCloseTo(0.6, 6);
  });
});
