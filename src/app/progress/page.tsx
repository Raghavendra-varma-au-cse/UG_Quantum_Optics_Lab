import type { Metadata } from "next";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";

export const metadata: Metadata = {
  title: "Learning progress",
  description: "Local, per-experiment progress across theory, simulation, mastery and practical work."
};

export default function ProgressPage() {
  return (
    <div className="shell py-10 md:py-14">
      <div className="mb-8 max-w-3xl border-b border-line pb-6">
        <p className="label mb-3 text-vermilion">Learning progress</p>
        <h1 className="display-xl">What you have actually done.</h1>
        <p className="lede mt-4">
          Not a streak counter. Each experiment records whether you have read the theory, run the bench, answered
          questions and worked in practical mode — and keeps those states separate.
        </p>
      </div>
      <ProgressDashboard />
    </div>
  );
}
