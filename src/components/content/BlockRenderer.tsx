import type { Block, Derivation, Equation, Reference, TheorySection } from "@/lib/content/types";
import { Eq, EquationBlock } from "@/components/ui/Equation";
import { OpticalDiagram } from "@/components/diagrams/OpticalDiagram";
import { Badge } from "@/components/ui/primitives";

const CALLOUT: Record<string, { label: string; border: string; bg: string; text: string }> = {
  principle: { label: "Physical principle", border: "border-l-petrol", bg: "bg-petrol-soft/40", text: "text-petrol" },
  caution: { label: "Caution", border: "border-l-vermilion", bg: "bg-vermilion-soft/40", text: "text-vermilion" },
  note: { label: "Note", border: "border-l-line-strong", bg: "bg-paper-3/50", text: "text-muted" },
  misconception: { label: "Common misconception", border: "border-l-brass", bg: "bg-brass-soft/40", text: "text-brass" },
  lab: { label: "In the laboratory", border: "border-l-slate", bg: "bg-slate/5", text: "text-slate" }
};

export function BlockRenderer({ block, derivations }: { block: Block; derivations?: Derivation[] }) {
  switch (block.type) {
    case "p":
      return <p>{block.text}</p>;
    case "lead":
      return <p className="!mb-6 border-l border-line pl-4 font-display !text-[1.2rem] !leading-relaxed text-ink">{block.text}</p>;
    case "h":
      return (
        <h3 id={block.id} className="display-sm !mb-3 !mt-9 scroll-mt-28 text-ink">
          {block.text}
        </h3>
      );
    case "eq":
      return <EquationBlock latex={block.latex} number={block.number} note={block.note} />;
    case "list":
      if (block.ordered) {
        return (
          <ol className="mb-5 list-none space-y-2">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-[0.9rem] leading-relaxed text-ink-2">
                <span className="mt-[2px] shrink-0 font-mono text-[0.65rem] text-vermilion">{String(i + 1).padStart(2, "0")}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="mb-5 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[0.9rem] leading-relaxed text-ink-2">
              <span className="mt-[9px] h-[3px] w-[3px] shrink-0 bg-ink" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "callout": {
      const tone = CALLOUT[block.tone] ?? CALLOUT.note!;
      return (
        <aside className={`my-6 border border-line border-l-2 ${tone.border} ${tone.bg} px-4 py-3.5`}>
          <p className={`mb-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] ${tone.text}`}>{tone.label}</p>
          <p className="mb-1 text-[0.84rem] font-medium text-ink">{block.title}</p>
          <p className="text-[0.82rem] leading-relaxed text-ink-2">{block.body}</p>
        </aside>
      );
    }
    case "table":
      return (
        <div className="my-6 overflow-x-auto border border-line">
          <table className="lab-table">
            {block.caption ? <caption className="label px-3 pt-3 text-left">{block.caption}</caption> : null}
            <thead>
              <tr>
                {block.head.map((h, i) => (
                  <th key={i} className={block.align?.[i] === "r" ? "num" : ""}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className={block.align?.[ci] === "r" ? "num" : ""}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "diagram":
      return (
        <figure className="my-7">
          <div className="tick-frame border border-line bg-paper-2">
            <OpticalDiagram kind={block.kind} />
          </div>
          <figcaption className="mt-2 flex items-start gap-3 text-[0.72rem] leading-relaxed text-muted">
            <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-ink">Schematic</span>
            <span>{block.caption}</span>
          </figcaption>
        </figure>
      );
    case "derivation": {
      const d = derivations?.find((x) => x.id === block.derivationId);
      return d ? <DerivationView derivation={d} /> : null;
    }
    case "definition":
      return (
        <div className="my-5 border-t border-line pt-3">
          <p className="mb-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-vermilion">{block.term}</p>
          <p className="text-[0.88rem] leading-relaxed text-ink-2">{block.body}</p>
        </div>
      );
    case "numeric":
      return (
        <div className="my-6 border border-line bg-paper-2 p-4">
          <p className="label mb-2">Worked example · {block.title}</p>
          <p className="text-[0.85rem] leading-relaxed text-ink-2">{block.statement}</p>
          {block.latex ? (
            <div className="mt-3 border-y border-line py-3">
              <Eq>{block.latex}</Eq>
            </div>
          ) : null}
          <p className="mt-3 flex items-start gap-2 text-[0.82rem] text-ink">
            <span className="mt-[2px] font-mono text-[0.6rem] uppercase tracking-wide text-petrol">Result</span>
            <span>{block.result}</span>
          </p>
        </div>
      );
    case "steps":
      return (
        <ol className="my-5 border-t border-line">
          {block.items.map((s, i) => (
            <li key={i} className="grid gap-1 border-b border-line py-3 sm:grid-cols-[30px_1fr] sm:gap-4">
              <span className="font-mono text-[0.65rem] text-vermilion">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-[0.85rem] font-medium text-ink">{s.title}</p>
                <p className="mt-0.5 text-[0.8rem] leading-relaxed text-ink-2">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    default:
      return null;
  }
}

export function TheorySectionView({
  section,
  derivations,
  index
}: {
  section: TheorySection;
  derivations: Derivation[];
  index: number;
}) {
  return (
    <section id={section.id} className="scroll-mt-28 border-t border-line pt-7">
      <div className="mb-5 flex items-baseline gap-4">
        <span className="font-mono text-[0.65rem] tracking-[0.1em] text-vermilion">
          {section.number ?? String(index + 1).padStart(2, "0")}
        </span>
        <div>
          {section.kicker ? <p className="label mb-1 !text-[0.6rem]">{section.kicker}</p> : null}
          <h2 className="display-sm text-ink">{section.title}</h2>
        </div>
      </div>
      <div className="lab-prose">
        {section.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} derivations={derivations} />
        ))}
      </div>
    </section>
  );
}

export function DerivationView({ derivation }: { derivation: Derivation }) {
  return (
    <div className="my-7 border border-line bg-paper-2">
      <div className="border-b border-line px-4 py-3">
        <p className="label mb-1">Step-by-step derivation</p>
        <p className="text-[0.9rem] font-medium text-ink">{derivation.title}</p>
        {derivation.intro ? <p className="mt-1 text-[0.75rem] leading-relaxed text-muted">{derivation.intro}</p> : null}
      </div>
      <ol className="divide-y divide-line">
        {derivation.steps.map((s, i) => (
          <li key={i} className="grid gap-1.5 px-4 py-3 sm:grid-cols-[26px_1fr] sm:gap-4">
            <span className="font-mono text-[0.62rem] text-muted">{String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-0">
              {s.label ? <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-vermilion">{s.label}</p> : null}
              <p className="text-[0.8rem] leading-relaxed text-ink-2">{s.text}</p>
              {s.latex ? (
                <div className="mt-2 overflow-x-auto">
                  <Eq>{s.latex}</Eq>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      <div className="border-t border-line bg-paper-3/40 px-4 py-3">
        <p className="label mb-1.5">Result</p>
        <div className="overflow-x-auto">
          <Eq>{derivation.result.latex}</Eq>
        </div>
        <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-2">{derivation.result.text}</p>
        {derivation.assumptions && derivation.assumptions.length > 0 ? (
          <p className="mt-2 text-[0.68rem] leading-relaxed text-muted">
            Assumptions: {derivation.assumptions.join("; ")}.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function EquationTable({ equations }: { equations: Equation[] }) {
  return (
    <div className="border border-line">
      <div className="border-b border-line bg-paper-3/40 px-4 py-2.5">
        <p className="label">Formula sheet · symbols, units and interpretation</p>
      </div>
      <div className="divide-y divide-line">
        {equations.map((eq) => (
          <div key={eq.id} className="px-4 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="text-[0.75rem] font-medium text-ink">{eq.name}</p>
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">{eq.id}</span>
            </div>
            <div className="mt-2 overflow-x-auto">
              <Eq>{eq.latex}</Eq>
            </div>
            <p className="mt-2 text-[0.76rem] leading-relaxed text-ink-2">{eq.interpretation}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {eq.symbols.map((s) => (
                <span key={s.symbol} className="text-[0.68rem] text-muted">
                  <Eq>{s.symbol}</Eq> — {s.meaning}
                  {s.unit ? <span className="ml-1 font-mono text-[0.6rem]">[{s.unit}]</span> : null}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReferenceList({ references }: { references: Reference[] }) {
  return (
    <ol className="space-y-3">
      {references.map((r, i) => (
        <li key={r.id} className="grid gap-1 border-b border-line pb-3 sm:grid-cols-[26px_1fr] sm:gap-4">
          <span className="font-mono text-[0.62rem] text-muted">[{i + 1}]</span>
          <div>
            <p className="text-[0.8rem] leading-relaxed text-ink-2">
              {r.authors}. <em>{r.title}</em>. {r.source}, {r.year}.
              {r.pages ? ` ${r.pages}.` : ""}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge tone={r.kind === "manual" ? "petrol" : r.kind === "paper" ? "vermilion" : "neutral"}>{r.kind}</Badge>
              {r.doi ? (
                <a
                  href={`https://doi.org/${r.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[0.6rem] text-muted underline decoration-line-strong underline-offset-2 hover:text-vermilion"
                >
                  doi:{r.doi}
                </a>
              ) : null}
              {r.url ? (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[0.6rem] text-muted underline decoration-line-strong underline-offset-2 hover:text-vermilion"
                >
                  source document ↗
                </a>
              ) : null}
            </div>
            {r.note ? <p className="mt-1 text-[0.68rem] leading-relaxed text-muted">{r.note}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
