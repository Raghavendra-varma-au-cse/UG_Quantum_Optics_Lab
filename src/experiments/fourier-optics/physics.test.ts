import { describe, expect, it } from "vitest";
import katex from "katex";
import { HARDWARE_ID_SET } from "@/lib/content/hardware-ids";
import { REFERENCE_CATALOGUE } from "@/lib/content/references";
import { EXPERIMENT_SLUGS } from "@/lib/content/registry";
import fourierContent from "./content";
import {
  fft2,
  magnitude,
  makeField,
  type FftField
} from "@/lib/physics/fourier";
import {
  DEFAULT_OBJECT_WINDOW_MM,
  FOURIER_GRID_SIZES,
  makeObjectField,
  opticalScale,
  simulateFourF,
  type SimParams,
  type SimulateErrorResponse,
  type SimulateRequest,
  type SimulateResponse,
  type WorkerResponse
} from "./physics";

const N = 128;

function baseParams(overrides: Partial<SimParams> = {}): SimParams {
  return {
    pattern: "grating",
    featureMm: 1,
    gridN: N,
    objectWindowMm: DEFAULT_OBJECT_WINDOW_MM,
    filter: "none",
    filterRadius: 0.2,
    apertureRadius: 1,
    phaseShift: Math.PI,
    focalLength1Mm: 150,
    focalLength2Mm: 150,
    wavelengthNm: 632.8,
    objectDistanceMm: 150,
    customField: null,
    ...overrides
  };
}

function maxAbs(values: Float64Array): number {
  let m = 0;
  for (const v of values) m = Math.max(m, Math.abs(v));
  return m;
}

describe("shared 2D FFT used by the 4f model", () => {
  it("transforms a delta into a constant magnitude", () => {
    const field = makeField(N);
    const mid = (N / 2) * N + N / 2;
    field.re[mid] = 1;
    const transformed = fft2(field, false);
    const mag = magnitude(transformed);
    expect(maxAbs(Float64Array.from(mag.map((m) => m - 1)))).toBeLessThan(1e-10);
  }, 20000);

  it("transforms a constant into a delta at zero frequency", () => {
    const field = makeField(N, 1);
    const transformed = fft2(field, false);
    const mag = magnitude(transformed);
    expect(mag[0]).toBeCloseTo(N * N, 6);
    let offCentre = 0;
    for (let i = 1; i < mag.length; i++) offCentre += mag[i] ?? 0;
    expect(offCentre).toBeLessThan(1e-8);
  });

  it("round-trips through the inverse transform", () => {
    const field = makeField(N);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        field.re[y * N + x] = Math.sin(x / 7) * Math.cos(y / 11) + 0.3;
        field.im[y * N + x] = 0.2 * Math.sin((x + y) / 5);
      }
    }
    const round = fft2(fft2(field, false), true);
    let worst = 0;
    for (let i = 0; i < round.re.length; i++) {
      worst = Math.max(
        worst,
        Math.abs((round.re[i] ?? 0) - (field.re[i] ?? 0)),
        Math.abs((round.im[i] ?? 0) - (field.im[i] ?? 0))
      );
    }
    expect(worst).toBeLessThan(1e-10);
  }, 20000);

  it("obeys Parseval's theorem", () => {
    const object = makeObjectField({
      kind: "rings",
      n: N,
      windowMm: DEFAULT_OBJECT_WINDOW_MM,
      featureMm: 1.1
    });
    const field: FftField = { re: object.slice(), im: new Float64Array(N * N), size: N };
    const transformed = fft2(field, false);
    let spatial = 0;
    let spectral = 0;
    for (let i = 0; i < object.length; i++) {
      spatial += (object[i] ?? 0) ** 2;
      const re = transformed.re[i] ?? 0;
      const im = transformed.im[i] ?? 0;
      spectral += re * re + im * im;
    }
    expect(spectral / (N * N)).toBeCloseTo(spatial, 8);
  });

  it("leaves the magnitude invariant under a translation (shift theorem)", () => {
    const object = makeObjectField({
      kind: "slits",
      n: N,
      windowMm: DEFAULT_OBJECT_WINDOW_MM,
      featureMm: 1.5
    });
    const shifted = new Float64Array(N * N);
    const dx = 9;
    const dy = -5;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const sx = (x - dx + N) % N;
        const sy = (y - dy + N) % N;
        shifted[y * N + x] = object[sy * N + sx] ?? 0;
      }
    }
    const a = magnitude(fft2({ re: object, im: new Float64Array(N * N), size: N }, false));
    const b = magnitude(fft2({ re: shifted, im: new Float64Array(N * N), size: N }, false));
    let worst = 0;
    for (let i = 0; i < a.length; i++) worst = Math.max(worst, Math.abs((a[i] ?? 0) - (b[i] ?? 0)));
    expect(worst).toBeLessThan(1e-9);
  }, 20000);
});

describe("4f pipeline", () => {
  it("reconstructs the object with an open pupil", () => {
    const result = simulateFourF(baseParams({ pattern: "slits", featureMm: 1.5 }));
    expect(result.reconstructionError).toBeLessThan(1e-6);
    expect(result.energyPassed).toBeCloseTo(1, 10);
    expect(result.contrast).toBeGreaterThan(0.5);
  });

  it("removes high-frequency energy and contrast with a low-pass filter", () => {
    const open = simulateFourF(baseParams({ filter: "none" }));
    const low = simulateFourF(baseParams({ filter: "lowpass", filterRadius: 0.08 }));
    expect(low.energyPassed).toBeLessThan(open.energyPassed);
    expect(low.energyPassed).toBeLessThan(0.7);
    expect(low.contrast).toBeLessThan(0.25 * open.contrast);
    expect(low.reconstructionError).toBeGreaterThan(0.1);
  });

  it("transmits a larger fraction of energy as a low-pass radius grows", () => {
    const small = simulateFourF(baseParams({ filter: "lowpass", filterRadius: 0.06 }));
    const large = simulateFourF(baseParams({ filter: "lowpass", filterRadius: 0.4 }));
    expect(large.energyPassed).toBeGreaterThan(small.energyPassed);
  });

  it("keeps the phase-only filter lossless", () => {
    const open = simulateFourF(baseParams({ filter: "none" }));
    const phase = simulateFourF(baseParams({ filter: "phase", filterRadius: 0.15, phaseShift: Math.PI / 2 }));
    expect(phase.energyPassed).toBeCloseTo(open.energyPassed, 8);
  });

  it("sweeps the iris when the filter is open", () => {
    const result = simulateFourF(baseParams({ filter: "none", apertureRadius: 0.3 }));
    expect(result.energyPassed).toBeLessThan(1);
    const first = result.sweep[0];
    const last = result.sweep[result.sweep.length - 1];
    expect(first).toBeDefined();
    expect(last).toBeDefined();
    expect(last?.energyPassed ?? 0).toBeGreaterThan(first?.energyPassed ?? 1);
  });

  it("blurs the image when the object leaves the front focal plane", () => {
    const focused = simulateFourF(baseParams({ pattern: "slits" }));
    const defocused = simulateFourF(baseParams({ pattern: "slits", objectDistanceMm: 190 }));
    expect(defocused.reconstructionError).toBeGreaterThan(focused.reconstructionError);
    expect(defocused.warnings.length).toBeGreaterThan(0);
  });

  it("recovers the grating period from the dominant spatial frequency", () => {
    const result = simulateFourF(baseParams({ pattern: "grating", featureMm: 1.2 }));
    expect(result.peakFrequencyPerMm).toBeGreaterThan(0);
    expect(Math.abs(result.peakPeriodMm - 1.2) / 1.2).toBeLessThan(0.08);
    expect(result.scale.dfPerMm).toBeCloseTo(1 / DEFAULT_OBJECT_WINDOW_MM, 12);
  });

  it("computes the Fourier-plane scale from wavelength and focal length", () => {
    const scale = opticalScale(
      baseParams({ focalLength1Mm: 200, focalLength2Mm: 200, filter: "lowpass", filterRadius: 0.2 })
    );
    expect(scale.fMaxPerMm).toBeCloseTo(N / (2 * DEFAULT_OBJECT_WINDOW_MM), 12);
    expect(scale.fourierPixelMm).toBeCloseTo((632.8e-6 * 200) / DEFAULT_OBJECT_WINDOW_MM, 10);
    expect(scale.magnification).toBeCloseTo(1, 12);
    expect(scale.filterCutoffPerMm).toBeCloseTo(0.2 * scale.fMaxPerMm, 12);
    expect(scale.na).toBeGreaterThan(0);
    expect(scale.na).toBeCloseTo(Math.sin(Math.atan(632.8e-6 * 0.2 * scale.fMaxPerMm)), 12);
    expect(scale.abbeResolutionMm).toBeGreaterThan(0);
    expect(scale.coherentResolutionMm).toBeCloseTo(2 * scale.abbeResolutionMm, 12);
    expect(scale.rayleighResolutionMm).toBeGreaterThan(scale.abbeResolutionMm);
  });

  it("scales the image with f2 / f1", () => {
    const unity = simulateFourF(baseParams({ pattern: "cross", focalLength2Mm: 150 }));
    const magnified = simulateFourF(baseParams({ pattern: "cross", focalLength2Mm: 300 }));
    expect(magnified.scale.magnification).toBeCloseTo(2, 12);
    // The magnified central row is not identical to the unity-magnification one.
    expect(maxAbs(magnified.profile)).toBeGreaterThan(0.9);
    let difference = 0;
    for (let i = 0; i < unity.profile.length; i++) {
      difference += Math.abs((unity.profile[i] ?? 0) - (magnified.profile[i] ?? 0));
    }
    expect(difference).toBeGreaterThan(1);
  });
});

describe("object generators", () => {
  it("produces non-empty objects at both supported grid sizes", () => {
    for (const n of FOURIER_GRID_SIZES) {
      for (const kind of ["slits", "grating", "checker", "rings", "cross", "letterQ"] as const) {
        const field = makeObjectField({
          kind,
          n,
          windowMm: DEFAULT_OBJECT_WINDOW_MM,
          featureMm: 1.2
        });
        expect(field.length).toBe(n * n);
        expect(field.some((v) => v > 0.5)).toBe(true);
      }
    }
  });

  it("keeps the symmetric patterns symmetric about both axes", () => {
    for (const kind of ["slits", "grating", "checker", "cross"] as const) {
      const f = makeObjectField({
        kind,
        n: N,
        windowMm: DEFAULT_OBJECT_WINDOW_MM,
        featureMm: 1.5
      });
      let worst = 0;
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          worst = Math.max(
            worst,
            Math.abs((f[y * N + x] ?? 0) - (f[y * N + (N - 1 - x)] ?? 0)),
            Math.abs((f[y * N + x] ?? 0) - (f[(N - 1 - y) * N + x] ?? 0))
          );
        }
      }
      expect(worst).toBeLessThan(1e-12);
    }
  }, 20000);

  it("keeps the ring pattern radially symmetric", () => {
    const f = makeObjectField({
      kind: "rings",
      n: N,
      windowMm: DEFAULT_OBJECT_WINDOW_MM,
      featureMm: 1
    });
    const c = N / 2;
    for (let d = 3; d < c - 2; d += 5) {
      expect(f[c * N + c + d]).toBeCloseTo(f[(c + d) * N + c] ?? -1, 12);
      // The array centre lies between pixels c-1 and c, so the mirror of c+d is c-1-d.
      expect(f[c * N + (c - 1 - d)]).toBeCloseTo(f[c * N + c + d] ?? -1, 12);
    }
  });

  it("clamps and copies an uploaded field", () => {
    const custom = new Float64Array(N * N).fill(2);
    const field = makeObjectField({
      kind: "custom",
      n: N,
      windowMm: DEFAULT_OBJECT_WINDOW_MM,
      featureMm: 1,
      customField: custom
    });
    expect(field.every((v) => v === 1)).toBe(true);
  });
});

describe("worker protocol", () => {
  it("constructs and discriminates typed worker messages", () => {
    const request: SimulateRequest = { type: "simulate", id: 7, params: baseParams() };
    expect(request.type).toBe("simulate");

    const result = simulateFourF(request.params);
    const response: SimulateResponse = { type: "result", id: request.id, result };
    const failure: SimulateErrorResponse = { type: "error", id: request.id, message: "boom" };

    const messages: WorkerResponse[] = [response, failure];
    const kinds = messages.map((m) => m.type);
    expect(kinds).toEqual(["result", "error"]);

    for (const message of messages) {
      if (message.type === "result") {
        expect(message.result.spectrum).toBeInstanceOf(Float64Array);
        expect(message.result.reconstruction.length).toBe(N * N);
        expect(message.result.sweep.length).toBeGreaterThan(1);
      } else {
        expect(message.message).toBe("boom");
      }
    }
  });
});

describe("experiment content contract", () => {
  const content = fourierContent;

  it("declares the required metadata and provenance", () => {
    expect(content.slug).toBe("fourier-optics");
    expect(content.number).toBe("06");
    expect(content.family).toBe("Fourier optics");
    expect(content.difficulty).toBe(3);
    expect(content.duration).toBe("3–5 h");
    expect(content.evidence.implementation).toBe("actual");
    expect(content.evidence.detail).toContain("not");
    expect(content.kit.verification).toBe("unverified");
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

  it("has the requested counts and unique identifiers", () => {
    expect(content.objectives.length).toBeGreaterThanOrEqual(8);
    expect(content.concepts.length).toBeGreaterThanOrEqual(6);
    expect(content.prerequisites.length).toBeGreaterThanOrEqual(4);
    expect(content.sections.length).toBeGreaterThanOrEqual(12);
    expect(content.sections.length).toBeLessThanOrEqual(14);
    expect(content.equations.length).toBeGreaterThanOrEqual(10);
    expect(content.equations.length).toBeLessThanOrEqual(14);
    expect(content.derivations.length).toBe(4);
    expect(content.procedure.length).toBe(7);
    expect(content.observations.length).toBe(3);
    expect(content.analysis.length).toBe(5);
    expect(content.errors.length).toBe(6);
    expect(content.questions.length).toBeGreaterThanOrEqual(28);
    expect(content.references.length).toBeGreaterThanOrEqual(10);
    expect(content.applications.length).toBeGreaterThanOrEqual(5);

    const sectionIds = content.sections.map((s) => s.id);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
    const equationIds = content.equations.map((e) => e.id);
    expect(new Set(equationIds).size).toBe(equationIds.length);
    const questionIds = content.questions.map((q) => q.id);
    expect(new Set(questionIds).size).toBe(questionIds.length);
  });

  it("renders every displayed equation in KaTeX", () => {
    for (const section of content.sections) {
      for (const block of section.blocks) {
        if (block.type === "eq") {
          expect(() => katex.renderToString(block.latex, { throwOnError: true, strict: "ignore" })).not.toThrow();
        }
      }
    }
    for (const equation of content.equations) {
      expect(equation.symbols.length).toBeGreaterThan(0);
      expect(equation.interpretation.length).toBeGreaterThan(20);
      expect(() => katex.renderToString(equation.latex, { throwOnError: true, strict: "ignore" })).not.toThrow();
    }
    for (const derivation of content.derivations) {
      for (const step of derivation.steps) {
        const latex = step.latex;
        if (latex) {
          expect(() => katex.renderToString(latex, { throwOnError: true, strict: "ignore" })).not.toThrow();
        }
      }
      expect(() =>
        katex.renderToString(derivation.result.latex, { throwOnError: true, strict: "ignore" })
      ).not.toThrow();
    }
  });

  it("references every derivation from the prose and no missing diagrams", () => {
    const referenced = new Set<string>();
    for (const section of content.sections) {
      for (const block of section.blocks) {
        if (block.type === "derivation") referenced.add(block.derivationId);
        if (block.type === "diagram") {
          expect(["fourier-4f", "gaussian-beam"]).toContain(block.kind);
        }
      }
    }
    for (const derivation of content.derivations) expect(referenced.has(derivation.id)).toBe(true);
    expect(referenced.size).toBe(content.derivations.length);
  });

  it("uses only catalogue hardware, references and related experiments", () => {
    for (const item of content.hardware) {
      expect(HARDWARE_ID_SET.has(item.itemId)).toBe(true);
    }
    for (const reference of content.references) {
      expect(REFERENCE_CATALOGUE[reference.id]).toBeDefined();
    }
    for (const slug of content.related) {
      expect(EXPERIMENT_SLUGS).toContain(slug);
    }
  });

  it("has complete questions and valid multiple-choice answers", () => {
    for (const question of content.questions) {
      expect(question.prompt.length).toBeGreaterThan(10);
      expect(question.answer.trim().length).toBeGreaterThan(3);
      expect(question.marks ?? 0).toBeGreaterThan(0);
      if (question.type === "mcq") {
        expect(question.options?.length ?? 0).toBeGreaterThanOrEqual(2);
        expect(question.answerIndex).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex).toBeLessThan(question.options?.length ?? 0);
      }
      if (question.type === "numerical") {
        expect(question.numeric).toBeDefined();
        expect(question.numeric?.tolerance ?? 0).toBeGreaterThan(0);
      }
    }
  });

  it("declares a numerical model with explicit exclusions", () => {
    expect(content.simulation.model).toContain("FFT");
    expect(content.simulation.exclusions.length).toBeGreaterThanOrEqual(4);
    expect(content.simulation.exclusions.join(" ")).toContain("polarisation");
    expect(content.simulation.exclusions.join(" ")).toContain("partial coherence");
    expect(content.simulation.exclusions.join(" ")).toContain("detector noise");
    expect(content.simulation.stochastic).toContain("deterministic");
  });
});
