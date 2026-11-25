"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { ExperimentSlug } from "@/lib/content/types";

const Bench = dynamic(() => import("./OpticalBench3D").then((m) => m.OpticalBench3D), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center border border-line bg-[#1b1b18]">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-white/40">Loading spatial bench…</p>
    </div>
  )
});

export function Bench3D({ slug }: { slug: ExperimentSlug }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-line bg-paper-2">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="label">Spatial layout · 3D</p>
          <p className="mt-0.5 text-[0.68rem] text-muted">Orbit a schematic bench to check component placement and beam routing.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.55rem] uppercase tracking-wide text-muted">illustrative geometry</span>
          <button type="button" onClick={() => setOpen((v) => !v)} className="btn btn-ghost btn-sm" aria-expanded={open}>
            {open ? "Close" : "Open 3D bench"}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-line">
          <Bench slug={slug} />
          <p className="border-t border-line px-4 py-2 text-[0.62rem] leading-relaxed text-muted">
            Positions are representative, not a measured layout or a CAD model. Use the physical bench and the written
            procedure for actual placement; record measured positions in the notebook.
          </p>
        </div>
      ) : null}
    </div>
  );
}
