import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EXPERIMENTS, getExperimentMeta } from "@/lib/content/registry";
import { getExperimentContent } from "@/lib/content";
import { ExperimentHeader } from "@/components/experiments/ExperimentHeader";
import { ModeNav } from "@/components/experiments/ModeNav";
import { MasterPanel } from "@/components/experiments/MasterPanel";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return EXPERIMENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getExperimentMeta(slug);
  return { title: meta ? `${meta.title} — mastery` : "Experiment" };
}

export default async function MasterModePage({ params }: PageProps) {
  const { slug } = await params;
  const meta = getExperimentMeta(slug);
  const content = getExperimentContent(slug);
  if (!meta || !content) notFound();

  return (
    <>
      <ExperimentHeader content={content} meta={meta} />
      <ModeNav slug={slug} active="master" />
      <div className="animate-fade-up">
        <MasterPanel content={content} />
      </div>
    </>
  );
}
