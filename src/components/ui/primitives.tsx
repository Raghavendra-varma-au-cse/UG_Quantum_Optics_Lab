import type { ReactNode } from "react";
import type { EvidenceLabel } from "@/lib/content/types";
import { EVIDENCE_LABEL } from "@/lib/content/registry";

/* -------------------------------------------------------------------------- */
/* Typographic primitives                                                      */
/* -------------------------------------------------------------------------- */

export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`label ${className}`}>{children}</p>;
}

export function SectionHead({
  index,
  title,
  lede,
  right,
  className = ""
}: {
  index?: string;
  title: string;
  lede?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-5 border-t border-line pt-5 md:flex-row md:items-start md:justify-between ${className}`}>
      <div className="max-w-2xl">
        <div className="mb-3 flex items-baseline gap-4">
          {index ? <span className="label text-vermilion">{index}</span> : null}
          <h2 className="display-md">{title}</h2>
        </div>
        {lede ? <p className="body-copy max-w-xl text-[0.95rem]">{lede}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export function Rule({ className = "" }: { className?: string }) {
  return <hr className={`border-line ${className}`} />;
}

/* -------------------------------------------------------------------------- */
/* Surfaces                                                                    */
/* -------------------------------------------------------------------------- */

export function Panel({
  children,
  className = "",
  inset = false,
  as: Tag = "div"
}: {
  children: ReactNode;
  className?: string;
  inset?: boolean;
  as?: "div" | "section" | "aside" | "article";
}) {
  return <Tag className={`${inset ? "panel-inset" : "panel"} ${className}`}>{children}</Tag>;
}

export function PanelHeader({
  label,
  title,
  right,
  className = ""
}: {
  label?: string;
  title?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 border-b border-line px-4 py-3 ${className}`}>
      <div>
        {label ? <p className="label mb-1">{label}</p> : null}
        {title ? <p className="text-[0.8125rem] font-medium text-ink">{title}</p> : null}
      </div>
      {right}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Data display                                                                */
/* -------------------------------------------------------------------------- */

export function Stat({
  label,
  value,
  unit,
  note,
  className = ""
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  note?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="label mb-1.5">{label}</p>
      <p className="num text-[1.35rem] leading-none text-ink">
        {value}
        {unit ? <span className="ml-1 text-[0.7rem] font-normal text-muted">{unit}</span> : null}
      </p>
      {note ? <p className="mt-1.5 text-[0.7rem] leading-snug text-muted">{note}</p> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className = ""
}: {
  children: ReactNode;
  tone?: "neutral" | "vermilion" | "petrol" | "brass" | "slate";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-line-strong text-muted",
    vermilion: "border-vermilion/40 text-vermilion",
    petrol: "border-petrol/40 text-petrol",
    brass: "border-brass/50 text-brass",
    slate: "border-slate/40 text-slate"
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-[3px] font-mono text-[0.625rem] uppercase leading-none tracking-[0.1em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function EvidenceTag({ label, compact = false }: { label: EvidenceLabel; compact?: boolean }) {
  const meta = EVIDENCE_LABEL[label];
  const tone = label === "actual" ? "petrol" : label === "classical-demo" ? "brass" : "slate";
  return (
    <Badge tone={tone} className={compact ? "" : "px-2.5 py-1"}>
      <span
        aria-hidden
        className={`inline-block h-[5px] w-[5px] ${label === "actual" ? "bg-petrol" : label === "classical-demo" ? "bg-brass" : "bg-slate"}`}
      />
      {compact ? meta.short : meta.long}
    </Badge>
  );
}

export function ProgressBar({
  value,
  className = "",
  tone = "ink",
  label
}: {
  value: number;
  className?: string;
  tone?: "ink" | "vermilion" | "petrol";
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const bg = tone === "vermilion" ? "bg-vermilion" : tone === "petrol" ? "bg-petrol" : "bg-ink";
  return (
    <div className={className}>
      {label ? (
        <div className="mb-1.5 flex justify-between">
          <span className="label">{label}</span>
          <span className="num text-[0.65rem] text-muted">{Math.round(pct)}%</span>
        </div>
      ) : null}
      <div
        className="h-[3px] w-full bg-line"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div className={`h-full ${bg} transition-[width] duration-500 ease-editorial`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function DataTable({
  head,
  rows,
  align,
  caption,
  className = "",
  dense = false
}: {
  head: string[];
  rows: ReactNode[][];
  align?: ("l" | "r")[];
  caption?: string;
  className?: string;
  dense?: boolean;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className={`lab-table ${dense ? "[&_td]:py-2 [&_th]:py-2" : ""}`}>
        {caption ? <caption className="label mb-2 text-left">{caption}</caption> : null}
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={`${h}-${i}`} className={align?.[i] === "r" ? "num" : ""}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className={align?.[ci] === "r" ? "num" : ""}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 border border-dashed border-line-strong px-6 py-10 text-center">
      <p className="text-[0.8125rem] font-medium text-ink">{title}</p>
      {children ? <div className="max-w-sm text-[0.75rem] leading-relaxed text-muted">{children}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Scientific figure frame                                                     */
/* -------------------------------------------------------------------------- */

export function Figure({
  children,
  caption,
  number,
  source,
  className = ""
}: {
  children: ReactNode;
  caption: string;
  number?: string;
  source?: string;
  className?: string;
}) {
  return (
    <figure className={`group ${className}`}>
      <div className="relative border border-line bg-paper-2">{children}</div>
      <figcaption className="mt-2.5 flex gap-3 text-[0.72rem] leading-relaxed text-muted">
        {number ? <span className="shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-ink">Fig. {number}</span> : null}
        <span>
          {caption}
          {source ? <span className="ml-1 text-[0.68rem] text-muted/80">{source}</span> : null}
        </span>
      </figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Definition list                                                             */
/* -------------------------------------------------------------------------- */

export function DefinitionRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-line py-3 last:border-b-0 sm:grid-cols-[160px_1fr] sm:gap-6">
      <dt className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-muted">{term}</dt>
      <dd className="text-[0.8125rem] leading-relaxed text-ink-2">{children}</dd>
    </div>
  );
}
