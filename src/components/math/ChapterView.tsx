import type { MathChapter } from "@/lib/content/types";
import { BlockRenderer, EquationTable, DerivationView, ReferenceList } from "@/components/content/BlockRenderer";
import { MathInteractive } from "./MathInteractive";
import { ProblemSet } from "./ProblemSet";
import { Badge } from "@/components/ui/primitives";
import Link from "next/link";
import { EXPERIMENTS } from "@/lib/content/registry";

export function ChapterView({ chapter, accent = "vermilion" }: { chapter: MathChapter; accent?: "vermilion" | "petrol" }) {
  const accentClass = accent === "petrol" ? "text-petrol" : "text-vermilion";
  return (
    <section id={chapter.id} className="scroll-mt-28 border-t border-line pt-7">
      <div className="mb-5 grid gap-4 md:grid-cols-[70px_1fr]">
        <p className={`font-mono text-[0.7rem] ${accentClass}`}>{chapter.number}</p>
        <div>
          <p className="label mb-1">{chapter.kicker}</p>
          <h2 className="display-md">{chapter.title}</h2>
          <p className="mt-2 max-w-2xl text-[0.85rem] leading-relaxed text-ink-2">{chapter.summary}</p>
        </div>
      </div>

      <div className="lab-prose">
        {chapter.blocks.map((b, i) => (
          <BlockRenderer key={i} block={b} derivations={chapter.derivations} />
        ))}
      </div>

      {chapter.interactive ? <MathInteractive kind={chapter.interactive} /> : null}

      <div className="mt-7">
        <EquationTable equations={chapter.equations} />
      </div>

      {chapter.derivations.length > 0 ? (
        <div className="mt-7">
          <p className="label mb-2">Derivations</p>
          {chapter.derivations.map((d) => (
            <DerivationView key={d.id} derivation={d} />
          ))}
        </div>
      ) : null}

      <div className="mt-8">
        <ProblemSet problems={chapter.problems} />
      </div>

      <div className="mt-8 grid gap-8 border-t border-line pt-5 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="label mb-3">References</p>
          <ReferenceList references={chapter.references} />
        </div>
        <div>
          <p className="label mb-3">Connected to</p>
          <div className="flex flex-wrap gap-1.5">
            {chapter.related.map((r) => {
              const exp = EXPERIMENTS.find((e) => e.slug === r);
              return exp ? (
                <Link key={r} href={`/experiments/${exp.slug}`} className="border border-line px-2 py-1 text-[0.68rem] text-ink-2 hover:border-ink hover:text-ink">
                  {exp.shortTitle}
                </Link>
              ) : (
                <Badge key={r}>{r.replace(/-/g, " ")}</Badge>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
