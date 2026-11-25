"use client";

import dynamic from "next/dynamic";
import type { ExperimentSlug } from "@/lib/content/types";

function Skeleton() {
  return (
    <div className="flex min-h-[420px] items-center justify-center border border-line bg-paper-2">
      <div className="text-center">
        <p className="label mb-2">Loading simulation</p>
        <p className="text-[0.72rem] text-muted">Preparing the numerical model…</p>
        <div className="mx-auto mt-4 h-[1px] w-24 overflow-hidden bg-line">
          <div className="h-full w-1/3 animate-[sweep_1.4s_linear_infinite] bg-vermilion" />
        </div>
      </div>
    </div>
  );
}

const Michelson = dynamic(() => import("@/experiments/michelson-interferometer/Simulation"), { ssr: false, loading: Skeleton });
const MachZehnder = dynamic(() => import("@/experiments/mach-zehnder-interferometer/Simulation"), { ssr: false, loading: Skeleton });
const Bomb = dynamic(() => import("@/experiments/quantum-bomb-tester/Simulation"), { ssr: false, loading: Skeleton });
const Eraser = dynamic(() => import("@/experiments/quantum-eraser/Simulation"), { ssr: false, loading: Skeleton });
const Polarization = dynamic(() => import("@/experiments/polarization-3d-cinema/Simulation"), { ssr: false, loading: Skeleton });
const Fourier = dynamic(() => import("@/experiments/fourier-optics/Simulation"), { ssr: false, loading: Skeleton });
const Qkd = dynamic(() => import("@/experiments/quantum-key-distribution/Simulation"), { ssr: false, loading: Skeleton });
const Tweezers = dynamic(() => import("@/experiments/optical-tweezers/Simulation"), { ssr: false, loading: Skeleton });

const MAP: Record<ExperimentSlug, React.ComponentType> = {
  "michelson-interferometer": Michelson,
  "mach-zehnder-interferometer": MachZehnder,
  "quantum-bomb-tester": Bomb,
  "quantum-eraser": Eraser,
  "polarization-3d-cinema": Polarization,
  "fourier-optics": Fourier,
  "quantum-key-distribution": Qkd,
  "optical-tweezers": Tweezers
};

export function SimulationHost({ slug }: { slug: ExperimentSlug }) {
  const Component = MAP[slug];
  return <Component />;
}
