"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/db";
import { EXPERIMENT_SLUGS } from "@/lib/content/registry";
import type { ExperimentSlug as Slug } from "@/lib/content/types";

export interface ExperimentProgress {
  visitedUnderstand: boolean;
  ranSimulation: number;
  quizCorrect: number;
  quizTotal: number;
  practicalSteps: number;
  sectionsRead: string[];
  lastVisited: string | null;
  completed: boolean;
  bookmarked: boolean;
}

const emptyProgress = (): ExperimentProgress => ({
  visitedUnderstand: false,
  ranSimulation: 0,
  quizCorrect: 0,
  quizTotal: 0,
  practicalSteps: 0,
  sectionsRead: [],
  lastVisited: null,
  completed: false,
  bookmarked: false
});

interface ProgressState {
  hydrated: boolean;
  records: Record<string, ExperimentProgress>;
  overallPercent: number;
  lastExperiment: string | null;
  hydrate: () => Promise<void>;
  visit: (slug: string, mode: "understand" | "experiment" | "master" | "practical") => void;
  markSection: (slug: string, sectionId: string) => void;
  recordSimulationRun: (slug: string) => void;
  recordQuiz: (slug: string, correct: number, total: number) => void;
  recordPracticalStep: (slug: string, count: number) => void;
  toggleBookmark: (slug: string) => void;
  reset: () => void;
}

function computePercent(records: Record<string, ExperimentProgress>): number {
  const total = EXPERIMENT_SLUGS.length;
  let sum = 0;
  for (const slug of EXPERIMENT_SLUGS) {
    const r = records[slug] ?? emptyProgress();
    const theory = r.visitedUnderstand ? 0.35 : 0;
    const reading = Math.min(1, r.sectionsRead.length / 8) * 0.15;
    const sim = r.ranSimulation > 0 ? 0.2 : 0;
    const quiz = r.quizTotal > 0 ? 0.2 * Math.min(1, r.quizTotal / 8) : 0;
    const practical = r.practicalSteps > 0 ? 0.1 : 0;
    sum += theory + reading + sim + quiz + practical;
  }
  return Math.round((sum / total) * 100);
}

function withRecord(
  records: Record<string, ExperimentProgress>,
  slug: string,
  update: (r: ExperimentProgress) => ExperimentProgress
): { records: Record<string, ExperimentProgress>; overallPercent: number } {
  const current = records[slug] ?? emptyProgress();
  const next = { ...records, [slug]: { ...update(current), lastVisited: new Date().toISOString() } };
  return { records: next, overallPercent: computePercent(next) };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      records: {},
      overallPercent: 0,
      lastExperiment: null,

      hydrate: async () => {
        try {
          await useProgress.persist.rehydrate();
        } finally {
          set({ hydrated: true, overallPercent: computePercent(get().records) });
        }
      },

      visit: (slug, mode) => {
        set((state) => {
          const patch = withRecord(state.records, slug, (r) => {
            if (mode === "understand") return { ...r, visitedUnderstand: true };
            if (mode === "experiment") return { ...r, ranSimulation: Math.max(1, r.ranSimulation) };
            if (mode === "practical") return { ...r, practicalSteps: Math.max(1, r.practicalSteps) };
            return r;
          });
          return { ...patch, lastExperiment: slug };
        });
      },

      markSection: (slug, sectionId) => {
        set((state) => {
          const patch = withRecord(state.records, slug, (r) =>
            r.sectionsRead.includes(sectionId) ? r : { ...r, sectionsRead: [...r.sectionsRead, sectionId], visitedUnderstand: true }
          );
          return patch;
        });
      },

      recordSimulationRun: (slug) => {
        set((state) =>
          withRecord(state.records, slug, (r) => {
            const ranSimulation = r.ranSimulation + 1;
            return { ...r, ranSimulation, completed: ranSimulation > 0 && r.quizTotal > 0 };
          })
        );
      },

      recordQuiz: (slug, correct, total) => {
        set((state) =>
          withRecord(state.records, slug, (r) => ({
            ...r,
            quizCorrect: r.quizCorrect + correct,
            quizTotal: r.quizTotal + total,
            completed: r.visitedUnderstand && r.ranSimulation > 0
          }))
        );
      },

      recordPracticalStep: (slug, count) => {
        set((state) =>
          withRecord(state.records, slug, (r) => ({
            ...r,
            practicalSteps: Math.max(r.practicalSteps, count)
          }))
        );
      },

      toggleBookmark: (slug) => {
        set((state) => withRecord(state.records, slug, (r) => ({ ...r, bookmarked: !r.bookmarked })));
      },

      reset: () => set({ records: {}, overallPercent: 0, lastExperiment: null })
    }),
    {
      name: "qol-progress-v1",
      storage: createJSONStorage(() => idbStorage),
      skipHydration: true,
      partialize: (state) => ({
        records: state.records,
        overallPercent: state.overallPercent,
        lastExperiment: state.lastExperiment
      })
    }
  )
);

export function experimentPercent(slug: string): number {
  const r = useProgress.getState().records[slug];
  if (!r) return 0;
  return Math.round(
    (r.visitedUnderstand ? 35 : 0) +
      Math.min(1, r.sectionsRead.length / 8) * 15 +
      (r.ranSimulation > 0 ? 20 : 0) +
      (r.quizTotal > 0 ? Math.min(1, r.quizTotal / 8) * 20 : 0) +
      (r.practicalSteps > 0 ? 10 : 0)
  );
}

export type { Slug };
