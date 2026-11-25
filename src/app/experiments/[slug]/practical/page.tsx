import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EXPERIMENTS, getExperimentMeta } from "@/lib/content/registry";
import { getExperimentContent } from "@/lib/content";
import { ExperimentHeader } from "@/components/experiments/ExperimentHeader";
import { ModeNav } from "@/components/experiments/ModeNav";
import { PracticalWorkspace } from "@/components/practical/PracticalWorkspace";
import { experimentPath } from "@/lib/content/routes";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return EXPERIMENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = getExperimentMeta(slug);
  return { title: meta ? `${meta.title} — practical record` : "Practical record" };
}

export default async function PracticalExperimentPage({ params }: Props) {
  const { slug } = await params;
  const meta = getExperimentMeta(slug);
  const content = getExperimentContent(slug);
  if (!meta || !content) notFound();

  return (
    <>
      <ExperimentHeader content={content} meta={meta} />
      <ModeNav slug={slug} active="practical" />
      <div className="animate-fade-up">
        <PracticalWorkspace content={content} />
      </div>
      <div className="shell pb-10">
        <Link href={experimentPath(slug, "understand")} className="arrow-link">← Back to the experiment</Link>
      </div>
    </>
  );
}
