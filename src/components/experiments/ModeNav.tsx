"use client";

import Link from "next/link";
import type { ExperimentSlug } from "@/lib/content/types";
import { EXPERIMENT_MODES, experimentPath, type ExperimentMode } from "@/lib/content/routes";

/**
 * Mode navigation. Each mode is a real static route so GitHub Pages can serve
 * the exported site without a Next.js server.
 */
export function ModeNav({ slug, active, compact = false }: { slug: ExperimentSlug | string; active: ExperimentMode; compact?: boolean }) {
  return (
    <div className="sticky top-[64px] z-20 border-b border-line bg-paper/95 backdrop-blur-[2px]">
      <div className="shell flex items-stretch justify-between gap-4">
        <div className="flex overflow-x-auto no-scrollbar" role="tablist" aria-label="Experiment modes">
          {EXPERIMENT_MODES.map((m) => {
            const isActive = active === m.id;
            return (
              <Link
                key={m.id}
                href={experimentPath(slug, m.id)}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? "page" : undefined}
                className={`relative shrink-0 px-2.5 py-3 text-left transition-colors sm:px-5 ${
                  isActive ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] sm:text-[0.68rem] sm:tracking-[0.12em]">
                  {m.label}
                </span>
                <span className="mt-0.5 hidden text-[0.6rem] text-muted sm:block">{m.note}</span>
                {isActive ? <span className="absolute inset-x-0 bottom-0 h-[2px] bg-vermilion" /> : null}
              </Link>
            );
          })}
        </div>
        {!compact ? (
          <div className="hidden items-center gap-4 py-2 md:flex">
            <Link
              href={experimentPath(slug, "practical")}
              className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted hover:text-ink"
            >
              Practical record ↗
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
