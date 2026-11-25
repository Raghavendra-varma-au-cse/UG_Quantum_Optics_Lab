"use client";

import { useState, type ReactNode } from "react";
import type { SimulationSpec } from "@/lib/content/types";
import { SegmentedControl } from "@/components/ui/Controls";

export interface Readout {
  label: string;
  value: string;
  unit?: string;
  note?: string;
  tone?: "default" | "accent" | "warn";
}

/**
 * The shared laboratory bench frame.
 *
 * Every experiment's interactive area uses this shell so the interaction
 * language — mode, seed, reset, model disclosure — is identical everywhere.
 */
export function SimulatorShell({
  title,
  subtitle,
  badge,
  children,
  controls,
  readouts,
  footer,
  onReset,
  seed,
  onSeedChange,
  onRandomize,
  spec,
  guidedNote,
  freeNote,
  className = "",
  initialMode = "guided"
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  children: ReactNode;
  controls: ReactNode;
  readouts?: Readout[];
  footer?: ReactNode;
  onReset?: () => void;
  seed?: string;
  onSeedChange?: (seed: string) => void;
  onRandomize?: () => void;
  spec: SimulationSpec;
  guidedNote?: string;
  freeNote?: string;
  className?: string;
  initialMode?: "guided" | "free";
}) {
  const [mode, setMode] = useState<"guided" | "free">(initialMode);
  const [showModel, setShowModel] = useState(false);

  return (
    <div className={`border border-line-strong bg-paper-2 ${className}`}>
      {/* Bench header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper-3/60 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="flex gap-1" aria-hidden>
            <span className="h-[6px] w-[6px] bg-vermilion" />
            <span className="h-[6px] w-[6px] bg-brass" />
            <span className="h-[6px] w-[6px] bg-petrol" />
          </span>
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink">{title}</p>
            {subtitle ? <p className="text-[0.65rem] text-muted">{subtitle}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {badge}
          <SegmentedControl
            size="sm"
            ariaLabel="Operating mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "guided", label: "Guided" },
              { value: "free", label: "Independent" }
            ]}
          />
          {onReset ? (
            <button onClick={onReset} className="border border-line-strong px-2 py-1 font-mono text-[0.6rem] uppercase tracking-wide text-ink-2 hover:bg-paper" type="button">
              Reset
            </button>
          ) : null}
          <button
            onClick={() => setShowModel((v) => !v)}
            className="border border-line-strong px-2 py-1 font-mono text-[0.6rem] uppercase tracking-wide text-ink-2 hover:bg-paper"
            type="button"
            aria-expanded={showModel}
          >
            Model
          </button>
        </div>
      </div>

      {/* Mode note */}
      <div className="border-b border-line bg-paper px-4 py-1.5">
        <p className="text-[0.65rem] leading-relaxed text-muted">
          <span className="font-mono uppercase tracking-[0.08em] text-ink">{mode === "guided" ? "Guided" : "Independent"}</span>
          {" — "}
          {mode === "guided"
            ? guidedNote ?? "Follow the suggested sequence. Presets keep the model inside its stated validity range."
            : freeNote ?? "All parameters are unlocked. Watch for the validity warnings when you leave the model's approximation regime."}
        </p>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_310px]">
        {/* Visualization */}
        <div className="min-w-0 border-b border-line lg:border-b-0 lg:border-r">
          <div className="p-3 sm:p-4">{children}</div>
          {footer ? <div className="border-t border-line px-4 py-2.5">{footer}</div> : null}
        </div>

        {/* Controls */}
        <aside className="min-w-0 bg-paper-2 p-4">
          <p className="label mb-3">Controls</p>
          <div className="space-y-4">{controls}</div>
          {seed !== undefined && onSeedChange ? (
            <div className="mt-5 border-t border-line pt-4">
              <label className="label mb-1 block" htmlFor="sim-seed">
                Random seed
              </label>
              <div className="flex">
                <input
                  id="sim-seed"
                  className="field h-[30px] text-[0.7rem]"
                  value={seed}
                  onChange={(e) => onSeedChange(e.target.value)}
                  spellCheck={false}
                />
                {onRandomize ? (
                  <button
                    type="button"
                    onClick={onRandomize}
                    className="border border-l-0 border-line-strong bg-paper-3 px-2 text-[0.7rem] hover:bg-paper"
                    title="New seed"
                  >
                    ↻
                  </button>
                ) : null}
              </div>
              <p className="mt-1 text-[0.6rem] text-muted">Same seed reproduces the run exactly.</p>
            </div>
          ) : null}
        </aside>
      </div>

      {/* Readouts */}
      {readouts && readouts.length > 0 ? (
        <div className="grid grid-cols-2 border-t border-line sm:grid-cols-3 lg:grid-cols-4">
          {readouts.map((r, i) => (
            <div
              key={`${r.label}-${i}`}
              className="border-b border-r border-line px-4 py-3 last:border-r-0 sm:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(4n)]:border-r-0"
            >
              <p className="label mb-1 text-[0.58rem]">{r.label}</p>
              <p
                className={`num text-[0.95rem] leading-tight ${
                  r.tone === "warn" ? "text-vermilion" : r.tone === "accent" ? "text-petrol" : "text-ink"
                }`}
              >
                {r.value}
                {r.unit ? <span className="ml-1 text-[0.6rem] font-normal text-muted">{r.unit}</span> : null}
              </p>
              {r.note ? <p className="mt-0.5 text-[0.58rem] leading-tight text-muted">{r.note}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {/* Model disclosure */}
      {showModel ? <ModelDisclosure spec={spec} /> : null}
    </div>
  );
}

export function ModelDisclosure({ spec }: { spec: SimulationSpec }) {
  return (
    <div className="border-t border-line bg-paper-3/50 px-4 py-4">
      <p className="label mb-2">Declared model · approximations · exclusions</p>
      <p className="max-w-3xl text-[0.72rem] leading-relaxed text-ink-2">{spec.model}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">Approximations</p>
          <ul className="space-y-1">
            {spec.approximations.map((a, i) => (
              <li key={i} className="text-[0.68rem] leading-snug text-ink-2">
                — {a}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">Validity</p>
          <ul className="space-y-1">
            {spec.validity.map((a, i) => (
              <li key={i} className="text-[0.68rem] leading-snug text-ink-2">
                — {a}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">Not claimed</p>
          <ul className="space-y-1">
            {spec.exclusions.map((a, i) => (
              <li key={i} className="text-[0.68rem] leading-snug text-ink-2">
                — {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {spec.stochastic ? (
        <p className="mt-3 border-t border-line pt-2 text-[0.65rem] text-muted">
          Stochastic model: {spec.stochastic}
        </p>
      ) : null}
    </div>
  );
}
