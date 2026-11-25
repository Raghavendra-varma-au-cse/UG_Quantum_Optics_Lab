import type { Metadata } from "next";
import { allQuestions } from "@/lib/content";
import { ExamHub } from "@/components/exam/ExamHub";

export const metadata: Metadata = {
  title: "Examination preparation",
  description:
    "Mixed mock papers, explained MCQs, numerical problems, viva practice and a practical examination across all eight experiments."
};

export default function ExamPage() {
  const questions = allQuestions();
  return (
    <div className="shell py-10 md:py-14">
      <div className="grid gap-8 border-b border-line pb-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="label mb-3 text-vermilion">Examination &amp; viva</p>
          <h1 className="display-xl max-w-3xl">Answer the question behind the question.</h1>
          <p className="lede mt-5 max-w-2xl">
            The examination does not reward memorised apparatus. It asks why the fringe moves, what limits the
            measurement, and what your result would be if an assumption failed. Every answer here explains the reasoning.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 self-end">
          <div className="border-t border-line pt-2">
            <p className="display-md">{questions.length}</p>
            <p className="label mt-1">Explained questions</p>
          </div>
          <div className="border-t border-line pt-2">
            <p className="display-md">4</p>
            <p className="label mt-1">Question formats</p>
          </div>
          <div className="border-t border-line pt-2">
            <p className="display-md">3</p>
            <p className="label mt-1">Quiz modes</p>
          </div>
          <div className="border-t border-line pt-2">
            <p className="display-md">∞</p>
            <p className="label mt-1">Seeded papers</p>
          </div>
        </div>
      </div>

      <div className="py-8">
        <ExamHub allQuestions={questions} />
      </div>
    </div>
  );
}
