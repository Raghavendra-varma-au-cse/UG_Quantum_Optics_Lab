import { describe, expect, it } from "vitest";
import { deg2rad, isUnitary, matMul, type Matrix2 } from "@/lib/physics/complex";
import { HARDWARE_ID_SET } from "@/lib/content/hardware-ids";
import { REFERENCE_CATALOGUE } from "@/lib/content/references";
import { EXPERIMENT_SLUGS } from "@/lib/content/registry";
import content from "./content";import {
  D,
  H,
  L,
  R,
  V,
  applyMatrix,
  applyMueller,
  intensity,
  linearPolarizer,
  muellerLinearPolarizer,
  stokesFromJones,
  wavePlate
} from "@/lib/physics/polarization";
import {
  DEFAULT_BENCH,
  DEFAULT_CINEMA,
  analyzerTransmission,
  benchMalusCurve,
  brewsterAngleDeg,
  crosstalkVsTilt,
  degreeOfPolarization,
  extinctionFromDb,
  extinctionRatioDb,
  jonesFromStateAngles,
  malusIntensity,
  poincareFromStokes,
  presetJones,
  retardanceFromCrossedTransmission,
  runBench,
  runCinema,
  stokesFromIntensities,
  thicknessForRetardance
} from "./physics";

const close = (a: number, b: number, digits = 6) => expect(a).toBeCloseTo(b, digits);

describe("Malus's law", () => {
  it("transmits fully, half and nothing at 0°, 45° and 90°", () => {
    close(malusIntensity(0), 1);
    close(malusIntensity(45), 0.5);
    close(malusIntensity(90), 0, 12);
    close(malusIntensity(60), 0.25);
  });

  it("agrees with the Stokes projection for a linear state", () => {
    const h = stokesFromJones(H);
    close(analyzerTransmission(h, 0), 1);
    close(analyzerTransmission(h, 45), 0.5);
    close(analyzerTransmission(h, 90), 0, 12);
    close(analyzerTransmission(h, 135), 0.5);
  });

  it("is periodic in 180°", () => {
    close(analyzerTransmission(stokesFromJones(D), 30), analyzerTransmission(stokesFromJones(D), 210));
  });
});

describe("Jones polarizer projection", () => {
  it("projects D onto H and loses half the intensity", () => {
    const out = applyMatrix(linearPolarizer(0), D);
    close(out[0].re, Math.SQRT1_2);
    close(out[1].re, 0, 10);
    close(intensity(out), 0.5);
  });

  it("leaves H unchanged through a horizontal polarizer", () => {
    const out = applyMatrix(linearPolarizer(0), H);
    close(intensity(out), 1);
    close(stokesFromJones(out).S1, 1);
  });

  it("extinguishes H through a vertical polarizer", () => {
    close(intensity(applyMatrix(linearPolarizer(90), H)), 0, 12);
  });
});

describe("Wave plates", () => {
  it("λ/2 at 45° rotates H to V", () => {
    const out = applyMatrix(wavePlate(45, Math.PI), H);
    close(intensity(out), 1);
    close(Math.abs(out[0].re), 0, 10);
    close(stokesFromJones(out).S1, -1);
  });

  it("λ/2 at 22.5° rotates H to D", () => {
    const out = applyMatrix(wavePlate(22.5, Math.PI), H);
    const s = stokesFromJones(out);
    close(s.S1, 0, 8);
    close(s.S2, 1);
    close(s.S3, 0, 8);
  });

  it("λ/4 at 45° turns H into circular light with |S₃| = 1", () => {
    const out = applyMatrix(wavePlate(45, Math.PI / 2), H);
    const s = stokesFromJones(out);
    close(s.S1, 0, 8);
    close(s.S2, 0, 8);
    close(Math.abs(s.S3), 1);
    close(s.dop, 1);
  });

  it("a retarder is unitary for arbitrary angle and retardance", () => {
    for (const theta of [0, 17, 45, 90, 133]) {
      for (const delta of [0.3, Math.PI / 2, Math.PI, 4.2]) {
        expect(isUnitary(wavePlate(theta, delta))).toBe(true);
      }
    }
  });

  it("uses the documented composition R(θ) diag(1, e^{iδ}) R(−θ)", () => {
    const theta = 33;
    const delta = 1.1;
    const t = deg2rad(theta);
    const co = Math.cos(t);
    const si = Math.sin(t);
    const e = { re: Math.cos(delta), im: Math.sin(delta) };
    const rotation: Matrix2 = [
      [{ re: co, im: 0 }, { re: -si, im: 0 }],
      [{ re: si, im: 0 }, { re: co, im: 0 }]
    ];
    const inverse: Matrix2 = [
      [{ re: co, im: 0 }, { re: si, im: 0 }],
      [{ re: -si, im: 0 }, { re: co, im: 0 }]
    ];
    const diag: Matrix2 = [
      [{ re: 1, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, e]
    ];
    const expected = matMul(matMul(rotation, diag), inverse);
    const actual = wavePlate(theta, delta);
    const pairs = [
      [actual[0][0], expected[0][0]],
      [actual[0][1], expected[0][1]],
      [actual[1][0], expected[1][0]],
      [actual[1][1], expected[1][1]]
    ] as const;
    for (const [cell, reference] of pairs) {
      close(cell.re, reference.re, 12);
      close(cell.im, reference.im, 12);
    }
  });
});

describe("Stokes parameters", () => {
  it("reports H, V, D and R correctly", () => {
    const h = stokesFromJones(H);
    close(h.S1, 1);
    close(h.S2, 0, 10);
    close(h.S3, 0, 10);

    const v = stokesFromJones(V);
    close(v.S1, -1);
    close(v.S2, 0, 10);
    close(v.S3, 0, 10);

    const d = stokesFromJones(D);
    close(d.S1, 0, 10);
    close(d.S2, 1);
    close(d.S3, 0, 10);

    const r = stokesFromJones(R);
    close(r.S1, 0, 10);
    close(r.S2, 0, 10);
    close(r.S3, 1);
  });

  it("has degree of polarization one for every pure state", () => {
    for (const state of [H, V, D, R, L, presetJones("custom", 23, 17)]) {
      close(degreeOfPolarization(stokesFromJones(state)), 1);
      close(stokesFromJones(state).dop, 1);
    }
  });

  it("maps right and left circular to opposite poles of the Poincaré sphere", () => {
    const r = poincareFromStokes(stokesFromJones(R));
    const l = poincareFromStokes(stokesFromJones(L));
    close(r.z, 1);
    close(l.z, -1);
    close(r.x + l.x, 0, 12);
  });

  it("recovers Stokes parameters from six analyser measurements", () => {
    const s = stokesFromIntensities({
      I0: 1.0,
      I90: 0.2,
      I45: 0.6,
      I135: 0.6,
      IR: 0.5,
      IL: 0.7
    });
    close(s.S0, 1.2);
    close(s.S1, 0.8);
    close(s.S2, 0, 10);
    close(s.S3, -0.2);
    close(s.dop, Math.hypot(0.8, 0, -0.2) / 1.2);
    expect(s.dop).toBeLessThan(1);
    close(s.azimuthDeg, 0, 8);
  });

  it("constructs custom states with χ > 0 on the upper Poincaré pole", () => {
    close(stokesFromJones(jonesFromStateAngles(0, 45)).S3, 1);
    close(stokesFromJones(jonesFromStateAngles(0, -45)).S3, -1);
    close(stokesFromJones(jonesFromStateAngles(45, 0)).S2, 1);
  });
});

describe("Bench chain", () => {
  it("crosses H and V polarizers to zero", () => {
    const bench = runBench({
      ...DEFAULT_BENCH,
      source: "H",
      polarizerEnabled: true,
      polarizerAngleDeg: 0,
      plate: "none",
      analyzerAngleDeg: 90
    });
    expect(bench.transmitted).toBeLessThan(1e-12);
    expect(bench.stateStokes.S1).toBeCloseTo(1, 10);
  });

  it("recovers 50 % with a λ/2 plate at 22.5° between crossed polarizers", () => {
    const crossed = runBench({
      ...DEFAULT_BENCH,
      source: "H",
      polarizerAngleDeg: 0,
      analyzerAngleDeg: 90,
      plate: "none"
    });
    const recovered = runBench({
      ...DEFAULT_BENCH,
      source: "H",
      polarizerAngleDeg: 0,
      analyzerAngleDeg: 90,
      plate: "half",
      plateAngleDeg: 22.5
    });
    expect(crossed.transmitted).toBeLessThan(1e-12);
    close(recovered.transmitted, 0.5);
  });

  it("reproduces Malus for a linear input at any analyser angle", () => {
    for (let angle = 0; angle <= 180; angle += 15) {
      const bench = runBench({
        ...DEFAULT_BENCH,
        source: "H",
        polarizerAngleDeg: 0,
        analyzerAngleDeg: angle,
        plate: "none"
      });
      close(bench.transmitted, malusIntensity(angle), 10);
    }
  });

  it("puts the analyser null where the sampled curve has its minimum", () => {
    const bench = runBench({
      ...DEFAULT_BENCH,
      source: "H",
      analyzerAngleDeg: 90,
      plate: "none"
    });
    const curve = benchMalusCurve(bench.stateStokes, 180);
    const min = curve.reduce((a, b) => (b.y < a.y ? b : a));
    close(min.x, 90, 6);
    expect(bench.transmitted).toBeLessThan(1e-12);
  });
});

describe("Mueller calculus", () => {
  it("polarizer matrix is idempotent", () => {
    const m = muellerLinearPolarizer(37);
    const s = [1, 0.3, -0.2, 0.5];
    const once = applyMueller(m, s);
    const twice = applyMueller(m, once);
    once.forEach((v, i) => close(twice[i] ?? Number.NaN, v, 12));
  });

  it("turns unpolarized light into half intensity, fully polarized light", () => {
    const s = [1, 0, 0, 0];
    const out = applyMueller(muellerLinearPolarizer(0), s);
    close(out[0] ?? Number.NaN, 0.5);
    close(out[1] ?? Number.NaN, 0.5);
    close(out[2] ?? Number.NaN, 0);
    close(out[3] ?? Number.NaN, 0);
  });
});

describe("Extinction, retardance and Brewster angle", () => {
  it("converts extinction ratio to dB and back", () => {
    close(extinctionRatioDb(1e-3, 1), 30);
    close(extinctionRatioDb(1e-5, 1), 50);
    close(10 * Math.log10(1 / extinctionFromDb(30)), 30);
    expect(extinctionFromDb(30)).toBeCloseTo(1e-3, 12);
  });

  it("computes the quarter-wave thickness of quartz", () => {
    // Δn = 0.0090, λ = 589 nm → 16.4 µm (typical room-temperature figure).
    const d = thicknessForRetardance(0.009, 589e-9, Math.PI / 2);
    expect(d).toBeCloseTo(16.36e-6, 8);
  });

  it("recovers retardance from transmission between crossed polarizers", () => {
    const delta = retardanceFromCrossedTransmission(0.25);
    close(delta, Math.PI / 3);
    close(retardanceFromCrossedTransmission(0.5), Math.PI / 2);
  });

  it("computes the air–glass Brewster angle", () => {
    expect(brewsterAngleDeg(1, 1.5)).toBeCloseTo(56.31, 2);
    expect(brewsterAngleDeg(1, 1.52)).toBeCloseTo(56.66, 2);
    expect(brewsterAngleDeg(1, 1)).toBeCloseTo(45, 6);
  });
});

describe("3D cinema channel separation", () => {
  it("has zero crosstalk for an ideal, aligned pair", () => {
    const result = runCinema({
      ...DEFAULT_CINEMA,
      technology: "circular",
      extinctionDb: 60,
      depolarization: 0,
      ghostFloorPct: 0
    });
    expect(result.meanCrosstalk).toBeLessThan(1e-6);
    expect(result.left.contrast).toBeGreaterThan(1e6);
    expect(result.leftAlignment).toBeCloseTo(1, 12);
  });

  it("increases crosstalk monotonically with screen depolarization", () => {
    let previous = -1;
    for (const p of [0, 0.01, 0.02, 0.05, 0.1, 0.2, 0.4]) {
      const result = runCinema({
        ...DEFAULT_CINEMA,
        technology: "circular",
        headTiltDeg: 0,
        extinctionDb: 30,
        depolarization: p,
        ghostFloorPct: 0
      });
      expect(result.meanCrosstalk).toBeGreaterThan(previous);
      previous = result.meanCrosstalk;
    }
    expect(previous).toBeGreaterThan(0.1);
  });

  it("increases crosstalk with ghost floor", () => {
    const clean = runCinema({ ...DEFAULT_CINEMA, ghostFloorPct: 0 });
    const dirty = runCinema({ ...DEFAULT_CINEMA, ghostFloorPct: 4 });
    expect(dirty.meanCrosstalk).toBeGreaterThan(clean.meanCrosstalk);
  });

  it("reaches 50 % crosstalk when the screen fully depolarizes the image", () => {
    const result = runCinema({
      ...DEFAULT_CINEMA,
      technology: "circular",
      depolarization: 1,
      extinctionDb: 60,
      ghostFloorPct: 0
    });
    close(result.meanCrosstalk, 0.5);
  });

  it("makes linear stereo tilt-sensitive and circular stereo tilt-invariant", () => {
    const linear0 = runCinema({ ...DEFAULT_CINEMA, technology: "linear", headTiltDeg: 0, extinctionDb: 40, depolarization: 0 });
    const linear30 = runCinema({ ...DEFAULT_CINEMA, technology: "linear", headTiltDeg: 30, extinctionDb: 40, depolarization: 0 });
    const circular0 = runCinema({ ...DEFAULT_CINEMA, technology: "circular", headTiltDeg: 0, extinctionDb: 40, depolarization: 0 });
    const circular30 = runCinema({ ...DEFAULT_CINEMA, technology: "circular", headTiltDeg: 30, extinctionDb: 40, depolarization: 0 });

    expect(linear30.meanCrosstalk).toBeGreaterThan(linear0.meanCrosstalk + 0.2);
    close(linear30.meanCrosstalk, 0.25, 3);
    close(circular0.meanCrosstalk, circular30.meanCrosstalk, 12);
    expect(circular30.tiltSensitive).toBe(false);
    expect(linear30.tiltSensitive).toBe(true);
  });

  it("matches the closed form ½[(1+ε) − (1−ε)cos 2β] for linear leakage", () => {
    const epsilon = extinctionFromDb(30);
    const beta = deg2rad(30);
    const expectedWanted = 0.5 * ((1 + epsilon) + (1 - epsilon) * Math.cos(2 * beta));
    const expectedLeak = 0.5 * ((1 + epsilon) - (1 - epsilon) * Math.cos(2 * beta));
    const result = runCinema({
      ...DEFAULT_CINEMA,
      technology: "linear",
      headTiltDeg: 30,
      extinctionDb: 30,
      depolarization: 0,
      ghostFloorPct: 0
    });
    close(result.left.wanted, expectedWanted, 12);
    close(result.left.leak, expectedLeak, 12);
    close(result.left.crosstalk, expectedLeak / (expectedWanted + expectedLeak), 12);
  });

  it("produces a monotone tilt comparison table", () => {
    const rows = crosstalkVsTilt({ ...DEFAULT_CINEMA, extinctionDb: 35 }, 45, 5);
    expect(rows.length).toBe(10);
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1];
      const row = rows[i];
      if (!prev || !row) continue;
      expect(row.linear).toBeGreaterThanOrEqual(prev.linear);
      close(row.circular, rows[0]?.circular ?? Number.NaN, 10);
    }
  });
});

describe("Content module", () => {
  it("declares the experiment identity and evidence honestly", () => {
    expect(content.slug).toBe("polarization-3d-cinema");
    expect(content.number).toBe("05");
    expect(content.family).toBe("Polarization");
    expect(content.difficulty).toBe(2);
    expect(content.duration).toBe("4–6 h");
    expect(content.evidence.implementation).toBe("actual");
    expect(content.evidence.detail.toLowerCase()).toContain("not a claim");
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

  it("has the required breadth of sections, equations and derivations", () => {
    expect(content.sections.length).toBeGreaterThanOrEqual(14);
    expect(content.sections.length).toBeLessThanOrEqual(16);
    expect(content.equations.length).toBeGreaterThanOrEqual(12);
    expect(content.equations.length).toBeLessThanOrEqual(15);
    expect(content.derivations).toHaveLength(4);
    expect(content.objectives.length).toBeGreaterThanOrEqual(8);
    expect(content.objectives.length).toBeLessThanOrEqual(10);
    expect(content.observations).toHaveLength(3);
    expect(content.analysis).toHaveLength(5);
    expect(content.errors).toHaveLength(7);
    expect(content.procedure.length).toBeGreaterThanOrEqual(7);
  });

  it("gives every equation symbols, an interpretation and a numeric example", () => {
    for (const equation of content.equations) {
      expect(equation.symbols.length).toBeGreaterThan(0);
      expect(equation.interpretation.length).toBeGreaterThan(20);
      expect(equation.numericExample?.statement.length).toBeGreaterThan(10);
    }
  });

  it("covers all three required diagrams", () => {
    const kinds = content.sections.flatMap((section) =>
      section.blocks.filter((block) => block.type === "diagram").map((block) => (block.type === "diagram" ? block.kind : ""))
    );
    expect(kinds).toContain("polarization");
    expect(kinds).toContain("poincare");
    expect(kinds).toContain("waveplate");
  });

  it("has at least 32 valid, unique questions covering every required type", () => {
    expect(content.questions.length).toBeGreaterThanOrEqual(32);
    const ids = new Set(content.questions.map((question) => question.id));
    expect(ids.size).toBe(content.questions.length);
    const types = new Set(content.questions.map((question) => question.type));
    for (const required of ["mcq", "numerical", "short", "viva", "derivation", "troubleshooting", "instrumentation"] as const) {
      expect(types.has(required)).toBe(true);
    }
    for (const question of content.questions) {
      expect(question.prompt.length).toBeGreaterThan(10);
      expect(question.answer.length).toBeGreaterThan(0);
      expect(question.explanation?.length ?? 0).toBeGreaterThan(10);
      expect(question.topic.length).toBeGreaterThan(1);
      expect([1, 2, 3]).toContain(question.difficulty);
      if (question.type === "mcq") {
        expect(question.options).toBeDefined();
        expect(question.answerIndex).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex).toBeLessThan(question.options?.length ?? 0);
      }
      if (question.type === "numerical") {
        expect(question.numeric).toBeDefined();
      }
    }
  });

  it("only cites catalogue references and known hardware ids", () => {
    expect(content.references.length).toBeGreaterThanOrEqual(12);
    for (const reference of content.references) {
      expect(REFERENCE_CATALOGUE[reference.id]).toBeDefined();
      expect(reference.title.length).toBeGreaterThan(2);
    }
    for (const item of content.hardware) {
      expect(HARDWARE_ID_SET.has(item.itemId)).toBe(true);
    }
  });

  it("links only to experiments that exist", () => {
    for (const slug of content.related) {
      expect(EXPERIMENT_SLUGS).toContain(slug);
    }
  });
});
