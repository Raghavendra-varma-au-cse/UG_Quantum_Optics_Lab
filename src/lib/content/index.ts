import type { ExperimentContent, ExperimentSlug, Question } from "./types";
import michelson from "@/experiments/michelson-interferometer/content";
import machZehnder from "@/experiments/mach-zehnder-interferometer/content";
import bomb from "@/experiments/quantum-bomb-tester/content";
import eraser from "@/experiments/quantum-eraser/content";
import polarization from "@/experiments/polarization-3d-cinema/content";
import fourier from "@/experiments/fourier-optics/content";
import qkd from "@/experiments/quantum-key-distribution/content";
import tweezers from "@/experiments/optical-tweezers/content";

/**
 * Content is authored per experiment and statically imported so pages can be
 * rendered on the server without a database. Adding an experiment means adding
 * one entry here and one in the registry.
 */
export const EXPERIMENT_CONTENT: Record<ExperimentSlug, ExperimentContent> = {
  "michelson-interferometer": michelson,
  "mach-zehnder-interferometer": machZehnder,
  "quantum-bomb-tester": bomb,
  "quantum-eraser": eraser,
  "polarization-3d-cinema": polarization,
  "fourier-optics": fourier,
  "quantum-key-distribution": qkd,
  "optical-tweezers": tweezers
};

export function getExperimentContent(slug: string): ExperimentContent | null {
  return (EXPERIMENT_CONTENT as Record<string, ExperimentContent | undefined>)[slug] ?? null;
}

export function allQuestions(): { slug: ExperimentSlug; question: Question }[] {
  return (Object.entries(EXPERIMENT_CONTENT) as [ExperimentSlug, ExperimentContent][]).flatMap(([slug, content]) =>
    content.questions.map((question) => ({ slug, question }))
  );
}

export function questionCounts(): Record<string, number> {
  return Object.fromEntries(
    (Object.entries(EXPERIMENT_CONTENT) as [ExperimentSlug, ExperimentContent][]).map(([slug, content]) => [
      slug,
      content.questions.length
    ])
  );
}

export function totalWordCount(): number {
  return (Object.values(EXPERIMENT_CONTENT) as ExperimentContent[]).reduce((sum, content) => {
    let words = 0;
    for (const section of content.sections) {
      for (const block of section.blocks) {
        if (block.type === "p" || block.type === "lead") words += block.text.split(/\s+/).length;
        if (block.type === "callout") words += (block.title + " " + block.body).split(/\s+/).length;
        if (block.type === "list") words += block.items.join(" ").split(/\s+/).length;
        if (block.type === "definition") words += block.body.split(/\s+/).length;
        if (block.type === "numeric") words += (block.statement + " " + block.result).split(/\s+/).length;
      }
    }
    return sum + words;
  }, 0);
}
