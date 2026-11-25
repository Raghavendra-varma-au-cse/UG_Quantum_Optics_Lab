"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ExperimentMeta } from "@/lib/content/types";
import { EVIDENCE_LABEL, DIFFICULTY_LABEL } from "@/lib/content/registry";
import { useProgress } from "@/lib/store/progress";
import { ProgressBar } from "@/components/ui/primitives";

const ACCENT_TEXT: Record<ExperimentMeta["accent"], string> = {
  vermilion: "text-vermilion",
  petrol: "text-petrol",
  brass: "text-brass",
  slate: "text-slate"
};

const ACCENT_DOT: Record<ExperimentMeta["accent"], string> = {
  vermilion: "bg-vermilion",
  petrol: "bg-petrol",
  brass: "bg-brass",
  slate: "bg-slate"
};

export function ExperimentDirectory({
  experiments,
  questionCounts
}: {
  experiments: ExperimentMeta[];
  questionCounts: Record<string, number>;
}) {
  const [family, setFamily] = useState<string>("all");
  const [query, setQuery] = useState("");
  const records = useProgress((s) => s.records);
  const hydrated = useProgress((s) => s.hydrated);

  const families = useMemo(() => ["all", ...Array.from(new Set(experiments.map((e) => e.family)))], [experiments]);

  const filtered = experiments.filter((e) => {
    if (family !== "all" && e.family !== family) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.concepts.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-4 border-y border-line py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by family">
          {families.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFamily(f)}
              aria-pressed={family === f}
              className={`px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] transition-colors ${
                family === f ? "bg-ink text-paper-2" : "text-muted hover:bg-paper-3 hover:text-ink"
              }`}
            >
              {f === "all" ? "All experiments" : f}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 border border-line-strong bg-paper-2 px-2.5 py-1.5 lg:w-64">
          <span className="font-mono text-[0.6rem] uppercase tracking-wide text-muted">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="concept, phenomenon…"
            className="w-full border-0 bg-transparent font-mono text-[0.7rem] text-ink placeholder:text-muted/70 focus:outline-none"
            aria-label="Search experiments"
          />
        </label>
      </div>

      <div className="hidden grid-cols-[52px_minmax(0,1.4fr)_minmax(0,1fr)_120px_100px_24px] gap-4 border-b border-line px-2 py-2 md:grid">
        <span className="label">No.</span>
        <span className="label">Experiment</span>
        <span className="label">Physical principle</span>
        <span className="label">Duration</span>
        <span className="label">Progress</span>
        <span />
      </div>

      <div>
        {filtered.map((e) => {
          const progress = records[e.slug];
          const pct = hydrated && progress
            ? Math.round(
                (progress.visitedUnderstand ? 35 : 0) +
                  Math.min(1, progress.sectionsRead.length / 8) * 15 +
                  (progress.ranSimulation > 0 ? 20 : 0) +
                  Math.min(1, progress.quizTotal / 8) * 20 +
                  (progress.practicalSteps > 0 ? 10 : 0)
              )
            : 0;
          return (
            <Link
              key={e.slug}
              href={`/experiments/${e.slug}`}
              className="group grid gap-2 border-b border-line px-2 py-5 transition-colors hover:bg-paper-2 md:grid-cols-[52px_minmax(0,1.4fr)_minmax(0,1fr)_120px_100px_24px] md:items-start md:gap-4"
            >
              <div className="flex items-center gap-2">
                <span className={`inline-block h-[5px] w-[5px] ${ACCENT_DOT[e.accent]}`} aria-hidden />
                <span className="font-mono text-[0.72rem] text-muted">{e.number}</span>
              </div>
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="display-sm text-ink transition-colors group-hover:text-vermilion">{e.title}</h3>
                  <span className={`font-mono text-[0.55rem] uppercase tracking-[0.08em] ${ACCENT_TEXT[e.accent]}`}>
                    {DIFFICULTY_LABEL[e.difficulty]}
                  </span>
                </div>
                <p className="mt-1 text-[0.76rem] leading-relaxed text-muted">{e.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {e.concepts.slice(0, 4).map((c) => (
                    <span key={c} className="border border-line px-1.5 py-[1px] font-mono text-[0.55rem] uppercase tracking-[0.04em] text-muted">
                      {c}
                    </span>
                  ))}
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.04em] text-muted/70">
                    {questionCounts[e.slug] ?? 0} questions
                  </span>
                </div>
              </div>
              <p className="text-[0.72rem] leading-relaxed text-ink-2">{e.principle}</p>
              <div>
                <p className="font-mono text-[0.65rem] text-muted">{e.duration}</p>
                <p className="mt-1 text-[0.55rem] font-mono uppercase tracking-[0.06em] text-muted">
                  {EVIDENCE_LABEL[e.evidence].short}
                </p>
              </div>
              <div className="pt-1">
                <ProgressBar value={pct} tone={e.accent === "petrol" ? "petrol" : e.accent === "vermilion" ? "vermilion" : "ink"} />
                <p className="mt-1 font-mono text-[0.55rem] text-muted">{pct > 0 ? `${pct}%` : "not started"}</p>
              </div>
              <span className="pt-1 font-mono text-[0.9rem] text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-vermilion">→</span>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-[0.8rem] text-muted">No experiment matches “{query}”.</p>
      ) : null}
    </div>
  );
}
