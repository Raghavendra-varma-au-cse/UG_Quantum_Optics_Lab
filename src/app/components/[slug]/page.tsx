import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HARDWARE_BY_ID, HARDWARE_INVENTORY, getHardware } from "@/lib/content/hardware";
import { EXPERIMENTS } from "@/lib/content/registry";
import { Badge } from "@/components/ui/primitives";
import { ComponentThumb } from "@/components/components/ComponentThumb";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return HARDWARE_INVENTORY.map((i) => ({ slug: i.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getHardware(slug);
  if (!item) return { title: "Component not found" };
  return { title: item.name, description: item.summary };
}

export default async function ComponentDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getHardware(slug);
  if (!item) notFound();

  const related = HARDWARE_INVENTORY.filter((i) => i.category === item.category && i.id !== item.id).slice(0, 4);
  const experiments = item.experiments
    .map((s) => EXPERIMENTS.find((e) => e.slug === s))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  return (
    <div className="shell py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">
        <Link href="/components" className="hover:text-ink">Components</Link>
        <span aria-hidden>/</span>
        <span className="text-ink">{item.category}</span>
      </nav>

      <div className="grid gap-8 border-b border-line pb-8 lg:grid-cols-[1fr_320px] lg:gap-14">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <ComponentThumb category={item.category} name={item.name} />
            <div>
              <p className="label">{item.category}</p>
              <p className="font-mono text-[0.62rem] text-muted">
                {item.manufacturer}
                {item.partNumber ? ` · ${item.partNumber}` : " · part number to be confirmed"}
              </p>
            </div>
          </div>
          <h1 className="display-lg">{item.name}</h1>
          <p className="lede mt-3 max-w-2xl">{item.summary}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge tone={item.verification === "verified" ? "petrol" : item.verification === "partially-verified" ? "brass" : "vermilion"}>
              {item.verification}
            </Badge>
            <Badge>{item.kind}</Badge>
            {item.generic ? <Badge>generic category</Badge> : null}
          </div>
          <p className="mt-4 max-w-2xl border-l-2 border-vermilion/40 pl-3 text-[0.7rem] leading-relaxed text-muted">
            {item.verification === "verified"
              ? "This entry has been checked against a manufacturer document or the physical item."
              : "The configuration is not verified. Do not treat these values as a datasheet; check the label and the manufacturer document supplied with the physical component."}
          </p>
        </div>
        <aside className="self-start border border-line bg-paper-2">
          <div className="border-b border-line px-4 py-3">
            <p className="label">Specifications</p>
            <p className="mt-1 text-[0.65rem] text-muted">“typical” values are educational ranges</p>
          </div>
          <dl className="divide-y divide-line">
            {item.specs.map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                <dt className="text-[0.7rem] text-muted">{s.label}</dt>
                <dd className="text-right font-mono text-[0.68rem] text-ink">
                  {s.value}
                  {s.typical ? <span className="ml-1 text-[0.55rem] uppercase text-brass">typ.</span> : null}
                </dd>
              </div>
            ))}
          </dl>
          {item.docUrl ? (
            <div className="border-t border-line px-4 py-2.5">
              <a href={item.docUrl} target="_blank" rel="noopener noreferrer" className="arrow-link">
                Manufacturer document library ↗
              </a>
            </div>
          ) : null}
        </aside>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
        <div>
          <section>
            <p className="label mb-2 text-vermilion">Working principle</p>
            <p className="text-[0.86rem] leading-relaxed text-ink-2">{item.principle}</p>
          </section>
          <section className="mt-8 border-t border-line pt-5">
            <p className="label mb-3 text-vermilion">How to align it</p>
            <ol className="space-y-2.5">
              {item.alignment.map((a, i) => (
                <li key={i} className="flex gap-3 text-[0.8rem] leading-relaxed text-ink-2">
                  <span className="mt-[3px] font-mono text-[0.58rem] text-muted">{String(i + 1).padStart(2, "0")}</span>
                  {a}
                </li>
              ))}
            </ol>
          </section>
          <section className="mt-8 border-t border-line pt-5">
            <p className="label mb-3 text-vermilion">Common errors</p>
            <ul className="space-y-2">
              {item.errors.map((e, i) => (
                <li key={i} className="flex gap-3 text-[0.8rem] leading-relaxed text-ink-2">
                  <span className="mt-[9px] h-[3px] w-[3px] shrink-0 bg-vermilion" />
                  {e}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div>
          <section>
            <p className="label mb-3 text-vermilion">Used in</p>
            {experiments.length ? (
              <div className="border-t border-line">
                {experiments.map((e) => (
                  <Link key={e.slug} href={`/experiments/${e.slug}`} className="group flex items-baseline justify-between gap-4 border-b border-line py-2.5">
                    <span>
                      <span className="font-mono text-[0.58rem] text-muted">{e.number}</span>
                      <span className="ml-2 text-[0.8rem] text-ink group-hover:text-vermilion">{e.shortTitle}</span>
                    </span>
                    <span className="font-mono text-[0.7rem] text-muted">→</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[0.76rem] text-muted">Reference item; not assigned to a specific experiment.</p>
            )}
          </section>
          <section className="mt-8 border-t border-line pt-5">
            <p className="label mb-3 text-vermilion">Applications</p>
            <ul className="space-y-1.5">
              {item.applications.map((a) => (
                <li key={a} className="text-[0.78rem] leading-relaxed text-ink-2">— {a}</li>
              ))}
            </ul>
          </section>
          {related.length ? (
            <section className="mt-8 border-t border-line pt-5">
              <p className="label mb-3">Related components</p>
              <div className="grid grid-cols-2 gap-2">
                {related.map((r) => (
                  <Link key={r.id} href={`/components/${r.id}`} className="border border-line p-2.5 text-[0.72rem] leading-snug text-ink-2 hover:border-ink hover:text-ink">
                    {r.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
