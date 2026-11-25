"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { HardwareCategory, HardwareItem } from "@/lib/content/types";
import { Badge } from "@/components/ui/primitives";
import { ComponentThumb } from "./ComponentThumb";

export function ComponentLibrary({ items }: { items: HardwareItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HardwareCategory | "all">("all");
  const [kind, setKind] = useState<"all" | "optical" | "optomechanical" | "instrument">("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(items.map((i) => i.category))).sort()] as (HardwareCategory | "all")[],
    [items]
  );

  const filtered = items.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (kind !== "all" && item.kind !== kind) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.principle.toLowerCase().includes(q) ||
      (item.partNumber ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="sticky top-[64px] z-10 border-y border-line bg-paper/95 py-3 backdrop-blur-[2px]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex items-center gap-2 border border-line-strong bg-paper-2 px-2.5 py-1.5 lg:w-80">
            <span className="font-mono text-[0.6rem] uppercase tracking-wide text-muted">Search</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="mirror, wave plate, stage…"
              className="w-full border-0 bg-transparent font-mono text-[0.72rem] text-ink placeholder:text-muted/70 focus:outline-none"
              aria-label="Search components"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <div className="seg" role="group" aria-label="Filter by type">
              {(
                [
                  ["all", "All"],
                  ["optical", "Optical"],
                  ["optomechanical", "Optomechanical"],
                  ["instrument", "Instrument"]
                ] as const
              ).map(([v, l]) => (
                <button key={v} type="button" aria-pressed={kind === v} onClick={() => setKind(v)}>
                  {l}
                </button>
              ))}
            </div>
            <select
              className="field h-[30px] w-auto max-w-[220px] text-[0.68rem]"
              value={category}
              onChange={(e) => setCategory(e.target.value as HardwareCategory | "all")}
              aria-label="Filter by category"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All categories" : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-line py-2">
        <p className="label">
          {filtered.length} of {items.length} entries
        </p>
        <p className="font-mono text-[0.58rem] uppercase tracking-wide text-muted">Schematic drawings, not product photos</p>
      </div>

      <div className="grid md:grid-cols-2">
        {filtered.map((item, i) => (
          <Link
            key={item.id}
            href={`/components/${item.id}`}
            className={`group grid grid-cols-[76px_1fr] gap-4 border-b border-line py-4 transition-colors hover:bg-paper-2 ${
              i % 2 === 0 ? "md:border-r md:pr-6" : "md:pl-6"
            }`}
          >
            <ComponentThumb category={item.category} name={item.name} />
            <div>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[0.86rem] font-medium text-ink group-hover:text-vermilion">{item.name}</p>
                  <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.06em] text-muted">
                    {item.category} · {item.manufacturer}
                    {item.partNumber ? ` · ${item.partNumber}` : ""}
                  </p>
                </div>
                <Badge tone={item.verification === "verified" ? "petrol" : item.verification === "partially-verified" ? "brass" : "vermilion"}>
                  {item.verification}
                </Badge>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[0.72rem] leading-relaxed text-ink-2">{item.summary}</p>
              <p className="mt-1.5 font-mono text-[0.56rem] text-muted">
                {item.experiments.length ? `used in ${item.experiments.length} experiment${item.experiments.length === 1 ? "" : "s"}` : "reference item"}
                <span className="ml-2 text-vermilion opacity-0 transition-opacity group-hover:opacity-100">open →</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 ? <p className="py-12 text-center text-[0.8rem] text-muted">No component matches that search.</p> : null}
    </div>
  );
}
