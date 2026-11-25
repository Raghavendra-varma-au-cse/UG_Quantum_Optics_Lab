import type { Metadata } from "next";
import { MATHEMATICS_CHAPTERS } from "@/lib/content/mathematics";
import { ChapterView } from "@/components/math/ChapterView";

export const metadata: Metadata = {
  title: "Mathematics for experimental optics",
  description:
    "Ten chapters connecting complex numbers, Maxwell's equations, Fourier transforms, Hilbert spaces and density matrices to real optical experiments."
};

export default function MathematicsPage() {
  return (
    <div className="shell py-10 md:py-14">
      <div className="grid gap-8 border-b border-line pb-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="label mb-3 text-vermilion">Mathematics · ten chapters</p>
          <h1 className="display-xl max-w-3xl">The language the bench speaks.</h1>
          <p className="lede mt-5 max-w-2xl">
            Not a formula sheet. Each chapter starts from the physical question, derives the relation, defines every
            symbol and unit, and then makes you use it on a real experiment.
          </p>
        </div>
        <div className="self-end border border-line bg-paper-2 p-4">
          <p className="label mb-2">How to use this section</p>
          <p className="text-[0.75rem] leading-relaxed text-ink-2">
            Read the chapter that the experiment assumes. Work the interactive parameter, then reproduce the derivation
            without scrolling. Attempt the problems before revealing the answer; recognising a solution is not the same as
            producing one.
          </p>
        </div>
      </div>

      <div className="grid gap-10 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-[88px]">
            <p className="label mb-3">Chapters</p>
            <nav className="border-l border-line">
              {MATHEMATICS_CHAPTERS.map((c) => (
                <a key={c.id} href={`#${c.id}`} className="group flex gap-2 border-l border-transparent py-1.5 pl-3 text-[0.7rem] leading-snug text-muted hover:border-vermilion hover:text-ink">
                  <span className="font-mono text-[0.55rem] text-line-strong group-hover:text-vermilion">{c.number}</span>
                  {c.title}
                </a>
              ))}
            </nav>
            <p className="mt-4 border-t border-line pt-3 text-[0.65rem] leading-relaxed text-muted">
              Units follow SI. Angles are radians unless a degree sign is explicit. “Typical” values are not datasheet
              limits.
            </p>
          </div>
        </aside>

        <div className="min-w-0 space-y-12">
          {MATHEMATICS_CHAPTERS.map((c) => (
            <ChapterView key={c.id} chapter={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
