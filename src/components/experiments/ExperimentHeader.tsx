import Link from "next/link";
import type { ExperimentContent, ExperimentMeta } from "@/lib/content/types";
import { DIFFICULTY_LABEL, EVIDENCE_LABEL } from "@/lib/content/registry";
import { EvidenceTag } from "@/components/ui/primitives";
import { ExperimentProgressBadge } from "@/components/experiments/ExperimentProgressBadge";

export function ExperimentHeader({ content, meta }: { content: ExperimentContent; meta: ExperimentMeta }) {
  const evidence = EVIDENCE_LABEL[content.evidence.implementation];
  return (
    <header className="border-b border-line">
      <div className="shell">
        <div className="flex items-center justify-between gap-4 border-b border-line py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
            <Link href="/" className="hover:text-ink">Laboratory</Link>
            <span aria-hidden>/</span>
            <Link href="/experiments" className="hover:text-ink">Experiments</Link>
            <span aria-hidden>/</span>
            <span className="text-ink">{content.number}</span>
          </nav>
          <ExperimentProgressBadge slug={content.slug} />
        </div>

        <div className="grid gap-8 py-8 md:py-10 lg:grid-cols-[1.55fr_1fr] lg:gap-14">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="label text-vermilion">Experiment {content.number}</span>
              <span className="h-[1px] w-6 bg-line-strong" aria-hidden />
              <span className="label">{content.family}</span>
              <span className="label">· {DIFFICULTY_LABEL[content.difficulty]}</span>
            </div>
            <h1 className="display-lg max-w-3xl">{content.title}</h1>
            <p className="lede mt-4 max-w-2xl">{content.subtitle}</p>
            <p className="body-copy mt-4 max-w-2xl text-[0.9rem]">{content.summary}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <EvidenceTag label={content.evidence.implementation} />
              <span className="border border-line px-2 py-[3px] font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
                {content.duration}
              </span>
              <span className="border border-line px-2 py-[3px] font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
                {content.questions.length} questions
              </span>
              <span className="border border-line px-2 py-[3px] font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
                3 learning modes
              </span>
            </div>
          </div>

          <aside className="self-start border border-line bg-paper-2">
            <div className="border-b border-line px-4 py-3">
              <p className="label">At a glance</p>
            </div>
            <dl className="divide-y divide-line">
              <div className="px-4 py-3">
                <dt className="label mb-1 !text-[0.58rem]">Physical principle</dt>
                <dd className="text-[0.8rem] leading-relaxed text-ink-2">{content.principle}</dd>
              </div>
              <div className="px-4 py-3">
                <dt className="label mb-1 !text-[0.58rem]">Implementation status</dt>
                <dd className="text-[0.78rem] leading-relaxed text-ink-2">
                  <span className="font-medium text-ink">{evidence.long}.</span> {content.evidence.headline}
                </dd>
              </div>
              <div className="px-4 py-3">
                <dt className="label mb-1 !text-[0.58rem]">Kit verification</dt>
                <dd className="flex items-start gap-2 text-[0.78rem] leading-relaxed text-ink-2">
                  <span className={`mt-1.5 h-[5px] w-[5px] shrink-0 ${content.kit.verification === "verified" ? "bg-petrol" : content.kit.verification === "partially-verified" ? "bg-brass" : "bg-vermilion"}`} />
                  <span>
                    <span className="font-mono text-[0.6rem] uppercase tracking-wide text-muted">{content.kit.verification}</span>
                    <br />
                    {content.kit.name}
                  </span>
                </dd>
              </div>
              <div className="px-4 py-3">
                <dt className="label mb-1 !text-[0.58rem]">Simulation model</dt>
                <dd className="text-[0.78rem] leading-relaxed text-ink-2">
                  {content.simulation.model.split(". ")[0]}.
                </dd>
              </div>
            </dl>
            <div className="border-t border-line px-4 py-2.5">
              <Link href={`/experiments/${content.slug}/experiment/`} className="arrow-link">
                Open the bench →
              </Link>
            </div>
          </aside>
        </div>

        <div className="border-t border-line py-2.5">
          <p className="text-[0.66rem] leading-relaxed text-muted">
            <span className="font-mono uppercase tracking-[0.08em] text-ink">Provenance.</span> {content.evidence.detail}
          </p>
        </div>
      </div>
    </header>
  );
}
