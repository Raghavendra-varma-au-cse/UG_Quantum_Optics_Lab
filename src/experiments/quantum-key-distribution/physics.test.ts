import { describe, expect, it } from "vitest";
import {
  hammingDecodeBlock,
  hammingEncode,
  simulateBB84
} from "@/lib/physics/qkd";
import {
  DEFAULT_SECURITY_MARGIN,
  SECURITY_THRESHOLD,
  asymptoticKeyFraction,
  hammingDemo,
  hammingLeakageBits,
  hammingNetBits,
  eveKnowledge,
  expectedInterceptResendQber,
  expectedQberTotal,
  expectedSifted,
  privacyOutputBits,
  reconcileHamming,
  runBb84,
  securityVerdict,
  teachingPrivacyOutputBits
} from "./physics";
import { content } from "./content";
import { HARDWARE_ID_SET } from "@/lib/content/hardware-ids";
import { REFERENCE_CATALOGUE } from "@/lib/content/references";

const IDEAL = {
  photons: 2048,
  eveProbability: 0,
  seed: "ideal-seed",
  detectionEfficiency: 1,
  intrinsicErrorRate: 0,
  errorCorrection: true
} as const;

describe("ideal BB84 run", () => {
  const result = runBb84(IDEAL);

  it("has zero QBER on an ideal channel", () => {
    expect(result.stages.sifted).toBeGreaterThan(0);
    expect(result.stages.siftedErrors).toBe(0);
    expect(result.qber).toBe(0);
  });

  it("sifts approximately half of the detected photons", () => {
    expect(Math.abs(result.stages.sifted - 2048 / 2)).toBeLessThanOrEqual(90);
  });

  it("distils matching keys and accepts the run", () => {
    expect(result.privacy.outputBits).toBeGreaterThan(0);
    expect(result.privacy.matches).toBe(true);
    const verdict = securityVerdict(result);
    expect(verdict.decision).toBe("accept");
    expect(verdict.severity).toBe("secure");
  });
});

describe("intercept–resend attack", () => {
  it("produces about 25% QBER at full interception", () => {
    const result = simulateBB84({
      photons: 8192,
      eveProbability: 1,
      seed: "full-eve",
      detectionEfficiency: 1,
      intrinsicErrorRate: 0,
      errorCorrection: true
    });
    expect(Math.abs(result.qber - 0.25)).toBeLessThan(0.025);
    expect(result.qber).toBeGreaterThan(SECURITY_THRESHOLD);
  });

  it("matches expectedInterceptResendQber across interception probabilities", () => {
    for (const p of [0.25, 0.5, 0.75]) {
      const result = simulateBB84({
        photons: 4096,
        eveProbability: p,
        seed: `sweep-${p}`,
        detectionEfficiency: 1,
        intrinsicErrorRate: 0,
        errorCorrection: true
      });
      const expected = expectedInterceptResendQber(p);
      expect(Math.abs(result.qber - expected)).toBeLessThan(0.03);
    }
  });

  it("aborts the run at full interception", () => {
    const result = runBb84({ ...IDEAL, photons: 1024, eveProbability: 1, seed: "eve-abort" });
    const verdict = securityVerdict(result);
    expect(verdict.decision).toBe("abort");
    expect(verdict.severity).toBe("compromised");
    expect(verdict.reasons.length).toBeGreaterThan(0);
  });
});

describe("sifted length and detector efficiency", () => {
  it("matches Nη/2 for reduced efficiency", () => {
    const result = simulateBB84({
      photons: 4096,
      eveProbability: 0,
      seed: "efficiency",
      detectionEfficiency: 0.4,
      intrinsicErrorRate: 0,
      errorCorrection: true
    });
    expect(Math.abs(result.stages.detected - 4096 * 0.4)).toBeLessThan(150);
    expect(Math.abs(result.stages.sifted - 4096 * 0.4 * 0.5)).toBeLessThan(100);
  });

  it("detects fewer photons when efficiency is reduced", () => {
    const full = simulateBB84({ ...IDEAL, seed: "eff-full", detectionEfficiency: 1 });
    const half = simulateBB84({ ...IDEAL, seed: "eff-half", detectionEfficiency: 0.5 });
    expect(half.stages.detected).toBeLessThan(full.stages.detected);
    expect(half.stages.sifted).toBeLessThan(full.stages.sifted);
  });

  it("exposes the analytic expectation", () => {
    expect(expectedSifted(4096, 0.8)).toBeCloseTo(1638.4, 5);
    expect(expectedSifted(1000, 0.5)).toBeCloseTo(250, 5);
  });
});

describe("intrinsic error model", () => {
  it("combines the Eve and intrinsic terms as 0.25p + e − 0.5pe", () => {
    expect(expectedQberTotal(0, 0.01)).toBeCloseTo(0.01, 10);
    expect(expectedQberTotal(0.5, 0.01)).toBeCloseTo(0.125 + 0.01 - 2 * 0.125 * 0.01, 10);
  });

  it("is reproduced by the simulation", () => {
    const result = simulateBB84({
      photons: 4096,
      eveProbability: 0.5,
      seed: "intrinsic",
      detectionEfficiency: 1,
      intrinsicErrorRate: 0.01,
      errorCorrection: true
    });
    expect(Math.abs(result.qber - expectedQberTotal(0.5, 0.01))).toBeLessThan(0.03);
  });
});

describe("Hamming(7,4) demonstration", () => {
  const data: (0 | 1)[] = [1, 0, 1, 1];

  it("decodes a codeword with no error", () => {
    const word = hammingEncode(data);
    const decoded = hammingDecodeBlock(word);
    expect(decoded.corrected).toBe(0);
    expect(decoded.data).toEqual(data);
  });

  it("corrects every single-bit codeword error", () => {
    for (let flip = 0; flip < 7; flip++) {
      const demo = hammingDemo(data, flip);
      expect(demo.syndrome).toBe(flip + 1);
      expect(demo.corrected).toBe(true);
      expect(demo.decoded).toEqual(data);
    }
  });

  it("reconciles a single data-bit error through the syndrome", () => {
    const alice: (0 | 1)[] = [1, 0, 1, 1, 0, 1, 0, 1];
    const bob = alice.slice();
    bob[1] = (bob[1]! ^ 1) as 0 | 1;
    const correction = reconcileHamming(alice, bob, true);
    expect(correction.correctedBits).toBe(1);
    expect(correction.residualErrors).toBe(0);
    expect(correction.bitsAfter).toEqual(alice);
    expect(correction.leakedParityBits).toBe(6);
  });

  it("reports leakage and uncorrectable blocks honestly", () => {
    expect(hammingLeakageBits(700)).toBe(525);
    expect(hammingNetBits(700)).toBe(175);
    const alice: (0 | 1)[] = [1, 0, 1, 1, 0, 0, 0, 0];
    const bob = alice.slice();
    bob[0] = (bob[0]! ^ 1) as 0 | 1;
    bob[2] = (bob[2]! ^ 1) as 0 | 1;
    const correction = reconcileHamming(alice, bob, true);
    expect(correction.residualErrors).toBeGreaterThan(0);
  });
});

describe("privacy amplification accounting", () => {
  it("is positive below threshold and zero at or above it", () => {
    expect(privacyOutputBits(20000, 0.05, 0)).toBeGreaterThan(0);
    expect(privacyOutputBits(20000, 0.1, 0)).toBeGreaterThan(0);
    expect(privacyOutputBits(20000, SECURITY_THRESHOLD, 0)).toBe(0);
    expect(privacyOutputBits(20000, 0.12, 0)).toBe(0);
  });

  it("decreases monotonically with QBER", () => {
    const lengths = [0, 0.02, 0.05, 0.08, 0.1].map((q) => privacyOutputBits(10000, q, 0));
    for (let i = 1; i < lengths.length; i++) {
      expect(lengths[i]!).toBeLessThanOrEqual(lengths[i - 1]!);
    }
    expect(lengths[0]).toBe(10000);
  });

  it("matches the analytic value at 5% QBER", () => {
    expect(privacyOutputBits(2048, 0.05, 16)).toBe(858);
  });

  it("leaves a longer key than the asymptotic bound in the teaching hash", () => {
    expect(teachingPrivacyOutputBits(2048, 0.05, DEFAULT_SECURITY_MARGIN)).toBeGreaterThan(
      privacyOutputBits(2048, 0.05, DEFAULT_SECURITY_MARGIN)
    );
    expect(teachingPrivacyOutputBits(2048, SECURITY_THRESHOLD, 0)).toBe(0);
  });

  it("has the expected limiting fractions", () => {
    expect(asymptoticKeyFraction(0)).toBeCloseTo(1, 10);
    expect(asymptoticKeyFraction(0.11)).toBeLessThan(0.001);
    expect(asymptoticKeyFraction(0.25)).toBe(0);
  });
});

describe("default console run", () => {
  it("accepts the documented default settings", () => {
    const result = runBb84({
      photons: 512,
      eveProbability: 0,
      seed: "bb84-2026-3",
      detectionEfficiency: 0.9,
      intrinsicErrorRate: 0.01,
      errorCorrection: true,
      securityMargin: DEFAULT_SECURITY_MARGIN
    });
    const verdict = securityVerdict(result);
    expect(result.qber).toBeGreaterThan(0);
    expect(result.qber).toBeLessThan(0.05);
    expect(result.correction.residualErrors).toBe(0);
    expect(result.privacy.matches).toBe(true);
    expect(verdict.decision).toBe("accept");
  });
});

describe("reproducibility", () => {
  it("returns identical records and keys for the same seed", () => {
    const options = {
      photons: 1024,
      eveProbability: 0.3,
      seed: "repeat-me",
      detectionEfficiency: 0.9,
      intrinsicErrorRate: 0.01,
      errorCorrection: true
    };
    const a = runBb84(options);
    const b = runBb84(options);
    expect(a.qber).toBe(b.qber);
    expect(a.stages.siftedIndices).toEqual(b.stages.siftedIndices);
    expect(a.privacy.keyAlice).toBe(b.privacy.keyAlice);
    expect(a.privacy.keyBob).toBe(b.privacy.keyBob);
    expect(a.correction.residualErrors).toBe(b.correction.residualErrors);
  });

  it("produces a different key for a different seed", () => {
    const a = runBb84({ ...IDEAL, photons: 512, seed: "seed-a" });
    const b = runBb84({ ...IDEAL, photons: 512, seed: "seed-b" });
    expect(a.privacy.keyAlice).not.toBe(b.privacy.keyAlice);
  });
});

describe("Eve's information and the decision", () => {
  it("gives Eve about half of the sifted bits at full interception", () => {
    const result = runBb84({ ...IDEAL, photons: 2048, eveProbability: 1, seed: "eve-knowledge" });
    const knowledge = eveKnowledge(result.records);
    expect(knowledge.intercepted).toBe(2048);
    expect(knowledge.siftedBits).toBe(result.stages.sifted);
    expect(Math.abs(knowledge.knownFraction - 0.5)).toBeLessThan(0.05);
  });

  it("gives Eve no record when interception is off", () => {
    const result = runBb84({ ...IDEAL, photons: 512, eveProbability: 0, seed: "no-eve" });
    const knowledge = eveKnowledge(result.records);
    expect(knowledge.intercepted).toBe(0);
    expect(knowledge.knownSiftedBits).toBe(0);
  });

  it("aborts when the final keys differ", () => {
    const result = runBb84({
      photons: 2048,
      eveProbability: 0.3,
      seed: "mismatch",
      detectionEfficiency: 1,
      intrinsicErrorRate: 0,
      errorCorrection: false
    });
    expect(result.qber).toBeLessThan(SECURITY_THRESHOLD);
    expect(result.privacy.matches).toBe(false);
    const verdict = securityVerdict(result);
    expect(verdict.decision).toBe("abort");
    expect(verdict.headline.toLowerCase()).toContain("do not match");
  });

  it("aborts when too few bits survive privacy amplification", () => {
    const result = runBb84({
      photons: 128,
      eveProbability: 0,
      seed: "short-key",
      detectionEfficiency: 1,
      intrinsicErrorRate: 0,
      errorCorrection: true,
      securityMargin: 500
    });
    expect(result.privacy.outputBits).toBe(0);
    const verdict = securityVerdict(result);
    expect(verdict.decision).toBe("abort");
    expect(verdict.headline.toLowerCase()).toContain("no key");
  });
});

describe("content integrity", () => {
  it("meets the required structural counts", () => {
    expect(content.slug).toBe("quantum-key-distribution");
    expect(content.number).toBe("07");
    expect(content.family).toBe("Quantum communication");
    expect(content.difficulty).toBe(3);
    expect(content.evidence.implementation).toBe("simulation");
    expect(content.sections.length).toBeGreaterThanOrEqual(12);
    expect(content.sections.length).toBeLessThanOrEqual(14);
    expect(content.equations.length).toBeGreaterThanOrEqual(10);
    expect(content.equations.length).toBeLessThanOrEqual(14);
    expect(content.derivations).toHaveLength(4);
    expect(content.objectives.length).toBeGreaterThanOrEqual(8);
    expect(content.procedure).toHaveLength(8);
    expect(content.observations).toHaveLength(3);
    expect(content.analysis).toHaveLength(5);
    expect(content.errors).toHaveLength(7);
    expect(content.applications.length).toBeGreaterThanOrEqual(3);
    expect(content.questions.length).toBeGreaterThanOrEqual(30);
    expect(content.references.length).toBeGreaterThanOrEqual(12);
    expect(content.related).toEqual([
      "quantum-eraser",
      "polarization-3d-cinema",
      "mach-zehnder-interferometer"
    ]);
  });

  it("uses only canonical hardware ids marked unverified", () => {
    for (const hardware of content.hardware) {
      expect(HARDWARE_ID_SET.has(hardware.itemId)).toBe(true);
      expect(hardware.role).toBe("unverified");
      expect(hardware.note).toBeTruthy();
    }
  });

  it("uses only references present in the catalogue", () => {
    for (const reference of content.references) {
      expect(REFERENCE_CATALOGUE[reference.id]).toBeDefined();
    }
  });

  it("marks every completion flag true", () => {
    expect(content.status).toBeDefined();
    expect(Object.values(content.status ?? {}).every(Boolean)).toBe(true);
  });

  it("has well-formed multiple-choice and numerical questions", () => {
    for (const question of content.questions) {
      if (question.type === "mcq") {
        expect(question.options && question.options.length).toBeGreaterThan(1);
        expect(question.answerIndex).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex).toBeLessThan(question.options?.length ?? 0);
      }
      if (question.type === "numerical") {
        expect(question.numeric).toBeDefined();
        expect(question.numeric?.tolerance).toBeGreaterThan(0);
      }
      expect(question.answer.length).toBeGreaterThan(0);
      expect(question.explanation?.length).toBeGreaterThan(0);
    }
  });

  it("resolves every derivation reference and keeps section ids unique", () => {
    const derivationIds = new Set(content.derivations.map((d) => d.id));
    for (const section of content.sections) {
      for (const block of section.blocks) {
        if (block.type === "derivation") {
          expect(derivationIds.has(block.derivationId)).toBe(true);
        }
      }
    }
    const sectionIds = content.sections.map((section) => section.id);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
    const equationIds = content.equations.map((equation) => equation.id);
    expect(new Set(equationIds).size).toBe(equationIds.length);
  });

  it("declares the simulation exclusions honestly", () => {
    const exclusions = content.simulation.exclusions.join(" ").toLowerCase();
    expect(exclusions).toContain("not cryptographically secure");
    expect(exclusions).toContain("finite-key");
    expect(exclusions).toContain("device");
    expect(content.simulation.model.toLowerCase()).toContain("bb84");
  });
});
