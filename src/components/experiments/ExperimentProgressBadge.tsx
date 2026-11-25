"use client";

import { useProgress } from "@/lib/store/progress";

export function ExperimentProgressBadge({ slug }: { slug: string }) {
  const records = useProgress((s) => s.records);
  const hydrated = useProgress((s) => s.hydrated);
  const r = records[slug];
  if (!hydrated || !r) {
    return <span className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted">Progress saved locally</span>;
  }
  const parts = [
    r.visitedUnderstand ? "theory" : null,
    r.ranSimulation ? "bench" : null,
    r.quizTotal > 0 ? "mastery" : null,
    r.practicalSteps > 0 ? "practical" : null
  ].filter(Boolean);
  return (
    <span className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted">
      <span className={`inline-block h-[5px] w-[5px] ${parts.length >= 3 ? "bg-petrol" : parts.length > 0 ? "bg-brass" : "bg-line-strong"}`} />
      {parts.length > 0 ? parts.join(" · ") : "Not started"}
    </span>
  );
}
