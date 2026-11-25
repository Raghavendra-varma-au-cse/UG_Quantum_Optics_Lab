import katex from "katex";
import type { SymbolDef } from "@/lib/content/types";

function render(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: "ignore",
      trust: false,
      output: "html"
    });
  } catch {
    return `<code>${tex}</code>`;
  }
}

/** Inline mathematical expression. */
export function Eq({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span
      className={className}
      // KaTeX output is generated locally from trusted content strings.
      dangerouslySetInnerHTML={{ __html: render(children, false) }}
    />
  );
}

/** Display equation with optional numbering and symbol table. */
export function EquationBlock({
  latex,
  number,
  note,
  symbols,
  className = ""
}: {
  latex: string;
  number?: string;
  note?: string;
  symbols?: SymbolDef[];
  className?: string;
}) {
  return (
    <div className={`my-6 ${className}`}>
      <div className="eq-block">
        <div
          className="min-w-0 overflow-x-auto py-1 text-ink"
          dangerouslySetInnerHTML={{ __html: render(latex, true) }}
        />
        {number ? <span className="eq-number">({number})</span> : null}
      </div>
      {note ? <p className="mt-2 text-[0.72rem] leading-relaxed text-muted">{note}</p> : null}
      {symbols && symbols.length > 0 ? (
        <dl className="mt-3 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
          {symbols.map((s) => (
            <div key={s.symbol} className="flex items-baseline gap-2 text-[0.72rem]">
              <dt className="min-w-[28px] text-ink">
                <Eq>{s.symbol}</Eq>
              </dt>
              <dd className="text-muted">
                {s.meaning}
                {s.unit ? <span className="ml-1 font-mono text-[0.65rem] text-muted/80">[{s.unit}]</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
