import Link from "next/link";
import type { ExperimentContent } from "@/lib/content/types";
import { EXPERIMENTS } from "@/lib/content/registry";
import { TheorySectionView, ReferenceList, EquationTable, DerivationView } from "@/components/content/BlockRenderer";
import { ReadingTracker } from "./ReadingTracker";
import { Badge } from "@/components/ui/primitives";

export function UnderstandPanel({ content }: { content: ExperimentContent }) {
  const sectionIds = content.sections.map((s) => s.id);
  const related = content.related
    .map((slug) => EXPERIMENTS.find((e) => e.slug === slug))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  return (
    <div className="shell py-10">
      <ReadingTracker slug={content.slug} sectionIds={sectionIds} />
      <div className="grid gap-10 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-14">
        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-[132px]">
            <p className="label mb-3">Contents</p>
            <nav aria-label="Theory contents" className="border-l border-line">
              {content.sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="group flex gap-2 border-l border-transparent py-1.5 pl-3 text-[0.72rem] leading-snug text-muted transition-colors hover:border-vermilion hover:text-ink"
                >
                  <span className="font-mono text-[0.58rem] text-line-strong group-hover:text-vermilion">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                </a>
              ))}
              <a href="#equations" className="flex gap-2 border-l border-transparent py-1.5 pl-3 text-[0.72rem] text-muted hover:border-vermilion hover:text-ink">
                <span className="font-mono text-[0.58rem] text-line-strong">—</span> Equation collection
              </a>
              <a href="#references" className="flex gap-2 border-l border-transparent py-1.5 pl-3 text-[0.72rem] text-muted hover:border-vermilion hover:text-ink">
                <span className="font-mono text-[0.58rem] text-line-strong">—</span> References
              </a>
            </nav>
            <div className="mt-5 border-t border-line pt-3">
              <Link href={`/experiments/${content.slug}/experiment/`} className="arrow-link">
                Go to the bench →
              </Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          {/* Objectives */}
          <section className="border-t border-line pt-5">
            <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="label mb-3">Learning objectives</p>
                <ol className="space-y-2.5">
                  {content.objectives.map((o, i) => (
                    <li key={i} className="flex gap-3 text-[0.86rem] leading-relaxed text-ink-2">
                      <span className="mt-[3px] font-mono text-[0.6rem] text-vermilion">{String(i + 1).padStart(2, "0")}</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="label mb-3">You should already know</p>
                <ul className="mb-5 space-y-1.5">
                  {content.prerequisites.map((p) => (
                    <li key={p} className="border-b border-line pb-1.5 text-[0.76rem] text-ink-2">
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="label mb-2">Core concepts</p>
                <div className="flex flex-wrap gap-1.5">
                  {content.concepts.map((c) => (
                    <Badge key={c}>{c}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Sections */}
          <div className="mt-10 space-y-10">
            {content.sections.map((section, i) => (
              <TheorySectionView key={section.id} section={section} derivations={content.derivations} index={i} />
            ))}
          </div>

          {/* Derivations not referenced inline */}
          <section id="derivations" className="mt-12 scroll-mt-28 border-t border-line pt-7">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <h2 className="display-sm">Derivations in full</h2>
              <span className="font-mono text-[0.6rem] uppercase tracking-wide text-muted">{content.derivations.length} worked</span>
            </div>
            <p className="mb-4 max-w-2xl text-[0.8rem] leading-relaxed text-muted">
              Each step states the approximation being used. Reproduce these on paper before the viva; the questions assume you can derive, not recall, the final result.
            </p>
            {content.derivations.map((d) => (
              <DerivationView key={d.id} derivation={d} />
            ))}
          </section>

          {/* Applications */}
          <section className="mt-12 border-t border-line pt-7">
            <h2 className="display-sm mb-4">Where this is used</h2>
            <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {content.applications.map((a) => (
                <div key={a.title} className="border-t border-line pt-2.5">
                  <p className="mb-1 text-[0.82rem] font-medium text-ink">{a.title}</p>
                  <p className="text-[0.76rem] leading-relaxed text-ink-2">{a.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Equations */}
          <section id="equations" className="mt-12 scroll-mt-28 border-t border-line pt-7">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="display-sm">Equation collection</h2>
              <span className="font-mono text-[0.6rem] uppercase tracking-wide text-muted">{content.equations.length} relations</span>
            </div>
            <EquationTable equations={content.equations} />
          </section>

          {/* References */}
          <section id="references" className="mt-12 scroll-mt-28 border-t border-line pt-7">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="display-sm">References &amp; sources</h2>
              <span className="font-mono text-[0.6rem] uppercase tracking-wide text-muted">accessed 2026-11-25 where applicable</span>
            </div>
            <p className="mb-4 max-w-2xl text-[0.76rem] leading-relaxed text-muted">
              Manufacturer procedures should be read alongside the physical kit guide. Where a model-specific document could not be verified, the entry says so rather than asserting a configuration.
            </p>
            <ReferenceList references={content.references} />
          </section>

          {/* Related */}
          <section className="mt-12 border-t border-line pt-7">
            <p className="label mb-3">Continue the progression</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((e) => (
                <Link
                  key={e.slug}
                  href={`/experiments/${e.slug}`}
                  className="group flex items-start justify-between gap-4 border border-line bg-paper-2 p-3.5 transition-colors hover:border-ink"
                >
                  <div>
                    <p className="font-mono text-[0.58rem] uppercase tracking-wide text-muted">{e.number} · {e.family}</p>
                    <p className="mt-1 font-display text-[1.05rem] leading-tight text-ink group-hover:text-vermilion">{e.shortTitle}</p>
                    <p className="mt-1 text-[0.68rem] leading-snug text-muted">{e.principle}</p>
                  </div>
                  <span className="mt-1 font-mono text-[0.7rem] text-muted group-hover:translate-x-0.5">→</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
