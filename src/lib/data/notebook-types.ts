import type { ExperimentSlug } from "@/lib/content/types";

export interface NotebookMeasurement {
  title: string;
  columns: string[];
  rows: string[][];
  provenance: "actual" | "simulated" | "mixed";
  note?: string;
}

export interface NotebookRecord {
  id: string;
  experimentSlug: ExperimentSlug | "general";
  title: string;
  date: string;
  studentName: string;
  apparatus: string;
  objectives: string;
  theory: string;
  observations: string;
  calculations: string;
  uncertainties: string;
  errors: string;
  conclusion: string;
  measurements: NotebookMeasurement[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  /** No attachment is ever uploaded; data URLs stay in IndexedDB. */
  attachments?: { name: string; type: string; size: number; dataUrl?: string }[];
}

export function newNotebookId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `note_${crypto.randomUUID()}`;
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyNotebookRecord(): NotebookRecord {
  const now = new Date();
  return {
    id: newNotebookId(),
    experimentSlug: "general",
    title: "Untitled experiment",
    date: now.toISOString().slice(0, 10),
    studentName: "",
    apparatus: "",
    objectives: "",
    theory: "",
    observations: "",
    calculations: "",
    uncertainties: "",
    errors: "",
    conclusion: "",
    measurements: [],
    tags: [],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}
