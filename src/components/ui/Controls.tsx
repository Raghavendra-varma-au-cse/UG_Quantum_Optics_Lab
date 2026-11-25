"use client";

import { useId, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/* Slider                                                                      */
/* -------------------------------------------------------------------------- */

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  format,
  hint,
  disabled = false,
  className = ""
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  const display = format ? format(value) : Number.isInteger(step) ? String(value) : value.toFixed(step < 0.01 ? 4 : 2);
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.75rem] leading-tight text-ink-2">
          {label}
        </label>
        <span className="num whitespace-nowrap text-[0.72rem] text-ink">
          {display}
          {unit ? <span className="ml-0.5 text-[0.62rem] text-muted">{unit}</span> : null}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="lab-range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={`${display}${unit ? ` ${unit}` : ""}`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint ? <p className="mt-1 text-[0.65rem] leading-snug text-muted">{hint}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Segmented control                                                           */
/* -------------------------------------------------------------------------- */

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = "",
  size = "md"
}: {
  options: { value: T; label: string; title?: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className={`seg ${size === "sm" ? "text-[0.6rem]" : ""} ${className}`} role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={size === "sm" ? "px-2 py-1 text-[0.6rem]" : ""}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Toggle / checkbox                                                           */
/* -------------------------------------------------------------------------- */

export function Toggle({
  label,
  checked,
  onChange,
  hint,
  disabled
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`group flex cursor-pointer items-start justify-between gap-4 ${disabled ? "opacity-50" : ""}`}>
      <span>
        <span className="block text-[0.75rem] leading-tight text-ink-2">{label}</span>
        {hint ? <span className="mt-0.5 block text-[0.65rem] leading-snug text-muted">{hint}</span> : null}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          aria-hidden
          className="block h-[18px] w-[32px] border border-line-strong bg-paper-3 transition-colors peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-vermilion"
        />
        <span
          aria-hidden
          className="absolute left-[3px] top-[3px] h-[10px] w-[10px] bg-paper-2 transition-transform duration-150 ease-editorial peer-checked:translate-x-[14px] peer-checked:bg-paper-2"
        />
      </span>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Inputs                                                                      */
/* -------------------------------------------------------------------------- */

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  hint
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[0.75rem] text-ink-2">
        {label}
      </label>
      <div className="flex items-stretch">
        <input
          id={id}
          type="number"
          className="field"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {unit ? (
          <span className="flex items-center border border-l-0 border-line-strong bg-paper-3 px-2 font-mono text-[0.65rem] text-muted">
            {unit}
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-[0.65rem] text-muted">{hint}</p> : null}
    </div>
  );
}

export function SeedControl({
  seed,
  onChange,
  onRandomize,
  className = ""
}: {
  seed: string;
  onChange: (seed: string) => void;
  onRandomize?: () => void;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="label mb-1 block">
        Random seed
      </label>
      <div className="flex">
        <input
          id={id}
          type="text"
          value={seed}
          onChange={(e) => onChange(e.target.value)}
          className="field h-[30px] text-[0.7rem]"
          aria-describedby={`${id}-hint`}
          spellCheck={false}
        />
        {onRandomize ? (
          <button
            type="button"
            onClick={onRandomize}
            className="border border-l-0 border-line-strong bg-paper-3 px-2 text-[0.65rem] uppercase tracking-wide text-ink-2 hover:bg-paper"
            title="Draw a new seed"
          >
            ↻
          </button>
        ) : null}
      </div>
      <p id={`${id}-hint`} className="mt-1 text-[0.6rem] text-muted">
        Same seed reproduces the exact run.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tabs                                                                        */
/* -------------------------------------------------------------------------- */

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className = ""
}: {
  items: { id: T; label: string; meta?: string }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={`flex overflow-x-auto border-b border-line no-scrollbar ${className}`} role="tablist">
      {items.map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`relative shrink-0 px-4 py-3 text-left transition-colors ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            <span className="block font-mono text-[0.68rem] uppercase tracking-[0.12em]">{item.label}</span>
            {item.meta ? <span className="mt-0.5 block text-[0.62rem] text-muted">{item.meta}</span> : null}
            {active ? (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-x-0 bottom-0 h-[2px] bg-ink"
                transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Disclosure                                                                  */
/* -------------------------------------------------------------------------- */

export function Disclosure({
  title,
  meta,
  children,
  defaultOpen = false,
  className = ""
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <details className={`group border-b border-line ${className}`} open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3.5 [&::-webkit-details-marker]:hidden">
        <span className="text-[0.8125rem] font-medium text-ink">{title}</span>
        <span className="flex items-center gap-3">
          {meta}
          <span className="font-mono text-[0.9rem] text-muted transition-transform group-open:rotate-45">+</span>
        </span>
      </summary>
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.2 }}
        className="pb-5"
      >
        {children}
      </motion.div>
    </details>
  );
}

/* -------------------------------------------------------------------------- */
/* Lightweight tooltip                                                         */
/* -------------------------------------------------------------------------- */

export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={label}
        className="flex h-[15px] w-[15px] items-center justify-center rounded-full border border-line-strong font-mono text-[0.55rem] text-muted hover:border-ink hover:text-ink"
      >
        i
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 border border-line-strong bg-paper-2 p-2.5 text-[0.68rem] leading-relaxed text-ink-2 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {children}
      </span>
    </span>
  );
}

export { AnimatePresence, motion };
