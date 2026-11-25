import type { ExperimentSlug } from "./types";

export type ExperimentMode = "understand" | "experiment" | "master" | "practical";

/** Canonical static route for an experiment mode. */
export function experimentPath(slug: ExperimentSlug | string, mode: ExperimentMode): string {
  if (mode === "understand") return `/experiments/${slug}/`;
  return `/experiments/${slug}/${mode}/`;
}

export const EXPERIMENT_MODES: { id: ExperimentMode; label: string; note: string }[] = [
  { id: "understand", label: "Understand", note: "Theory & derivation" },
  { id: "experiment", label: "Experiment", note: "Simulation & procedure" },
  { id: "master", label: "Master", note: "Viva & problems" },
  { id: "practical", label: "Practical", note: "Measurements & report" }
];
