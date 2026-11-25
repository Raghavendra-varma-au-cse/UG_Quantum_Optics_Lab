"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { SimulatorShell, type Readout } from "@/components/sim/SimulatorShell";
import { SegmentedControl, Slider } from "@/components/ui/Controls";
import { Badge } from "@/components/ui/primitives";
import { LabBarChart, LabLineChart } from "@/components/viz/Plot";

import {
  EXPECTED_TRIALS_PER_DETECTION,
  SIMULATION_SPEC,
  THEORY_DUD,
  THEORY_LIVE,
  addTrial,
  confidenceAtLeastOneD0,
  cumulativeSeries,
  emptyStats,
  posteriorLiveGivenD1,
  theoreticalCounts,
  trialAt,
  wilsonInterval,
  type BombKind,
  type BombStats,
  type Outcome,
  type Population,
  type TrialRecord
} from "./physics";

/* -------------------------------------------------------------------------- */
/* Palette and geometry                                                        */
/* -------------------------------------------------------------------------- */

const INK = "#171713";
const INK2 = "#3B3A33";
const MUTED = "#6E6A5E";
const LINE = "#BFB8A7";
const PAPER = "#FBF9F4";
const GLASS = "#E9E4D8";
const VERMILION = "#B23A1E";
const PETROL = "#14524A";

const PATH_IN = "M 40 210 H 160";
const PATH_UPPER = "M 160 210 L 160 90 L 415 90";
const PATH_LOWER = "M 160 210 L 415 210 L 415 90";
const PATH_TO_BOMB = "M 160 210 H 300";
const PATH_D1 = "M 415 90 H 555";
const PATH_D0 = "M 415 90 L 415 260 L 555 260";

const OUTCOME_TONE: Record<Outcome, "vermilion" | "petrol" | "slate"> = {
  explosion: "vermilion",
  D0: "petrol",
  D1: "slate"
};

const POPULATION_LABEL: Record<Population, string> = {
  random: "Random 50/50",
  live: "Force live",
  dud: "Force dud"
};

/* -------------------------------------------------------------------------- */
/* Small presentation helpers                                                  */
/* -------------------------------------------------------------------------- */

function fmt(v: number, digits = 3): string {
  return Number.isFinite(v) ? v.toFixed(digits) : "—";
}

function pct(v: number, digits = 1): string {
  return Number.isFinite(v) ? `${(100 * v).toFixed(digits)}%` : "—";
}

function verdictFor(record: TrialRecord): { title: string; badge: string; body: string } {
  if (record.outcome === "D0") {
    return {
      title: "Live bomb certified — no explosion",
      badge: "D0 · interaction-free",
      body:
        "The lower amplitude was removed, so the two paths could not cancel at the dark port. The detected photon travelled the upper arm and never entered the absorbing arm. The bomb is live."
    };
  }
  if (record.outcome === "explosion") {
    return {
      title: "Live bomb — detonated",
      badge: "Explosion",
      body:
        "The photon took the lower arm and was absorbed. The bomb is certainly live, but it is destroyed: this is a destructive confirmation, not an interaction-free one."
    };
  }
  return {
    title: "Inconclusive",
    badge: "D1 · no verdict",
    body:
      record.kind === "dud"
        ? "A dud always exits the bright port. But a live bomb also exits D1 when the photon takes the upper arm, so one click cannot decide. (Revealed: this bomb was a dud.)"
        : "The photon took the upper arm and exited the bright port. A dud would produce the same record, so the click is inconclusive. (Revealed: this bomb was live.)"
  };
}

/* -------------------------------------------------------------------------- */
/* Optical bench                                                               */
/* -------------------------------------------------------------------------- */

function Bench({ record }: { record: TrialRecord | null }) {
  const reduce = useReducedMotion() ?? false;
  const kind: BombKind | null = record?.kind ?? null;
  const outcome = record?.outcome ?? null;

  const active: { d: string; color: string }[] = [];
  if (record) {
    active.push({ d: PATH_IN, color: INK2 });
    if (outcome === "explosion") {
      active.push({ d: PATH_TO_BOMB, color: VERMILION });
    } else {
      active.push({ d: PATH_UPPER, color: outcome === "D0" ? PETROL : INK2 });
      if (outcome === "D0") {
        active.push({ d: PATH_D0, color: PETROL });
      } else {
        if (kind === "dud") active.push({ d: PATH_LOWER, color: INK2 });
        active.push({ d: PATH_D1, color: INK2 });
      }
    }
  }

  const aria =
    record === null
      ? "Mach–Zehnder bomb tester. No measurement yet; the bomb is unclassified."
      : `Mach–Zehnder bomb tester. Last outcome: ${outcome}. Revealed bomb: ${kind}.`;

  return (
    <div className="relative border border-line bg-paper-2">
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
        <span className="label">{record ? "Optical bench · last record" : "Optical bench · ready"}</span>
        <Badge tone="slate">Simulated</Badge>
      </div>
      <svg viewBox="0 0 620 320" className="h-auto w-full" role="img" aria-label={aria}>
        <defs>
          <marker id="bench-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={MUTED} />
          </marker>
        </defs>
        <rect width="620" height="320" fill={PAPER} />

        {/* base paths */}
        {[PATH_IN, PATH_UPPER, PATH_LOWER, PATH_D0, PATH_D1].map((d) => (
          <path key={d} d={d} fill="none" stroke={LINE} strokeWidth={1.1} strokeDasharray="2 3" />
        ))}

        {/* active paths */}
        {active.map((p) => (
          <motion.path
            key={`${p.d}-${p.color}`}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth={2.4}
            strokeLinecap="round"
            initial={reduce ? false : { opacity: 0.15 }}
            animate={{ opacity: 1 }}
            transition={reduce ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }}
          />
        ))}

        {/* source */}
        <g transform="translate(50 210)">
          <rect x={-30} y={-12} width={60} height={24} fill={GLASS} stroke={INK} strokeWidth={1} />
          <circle cx={12} cy={0} r={4} fill={VERMILION} />
          <text x={0} y={-18} textAnchor="middle" fill={INK} fontFamily="var(--font-mono)" fontSize={8} letterSpacing="0.06em">
            SINGLE PHOTON
          </text>
        </g>

        {/* mirrors */}
        {[ { x: 160, y: 90 }, { x: 415, y: 210 } ].map((m) => (
          <g key={`mirror-${m.x}-${m.y}`} transform={`translate(${m.x} ${m.y})`}>
            <line x1={-15} y1={15} x2={15} y2={-15} stroke={INK} strokeWidth={2.4} />
            <line x1={-11} y1={11} x2={19} y2={-19} stroke={MUTED} strokeWidth={0.6} />
          </g>
        ))}

        {/* beam splitters */}
        {[ { x: 160, y: 210, label: "BS1" }, { x: 415, y: 90, label: "BS2" } ].map((b) => (
          <g key={b.label} transform={`translate(${b.x} ${b.y})`}>
            <rect x={-16} y={-16} width={32} height={32} fill="rgba(255,255,255,0.6)" stroke={INK} strokeWidth={1} />
            <line x1={-16} y1={16} x2={16} y2={-16} stroke={INK} strokeWidth={0.8} strokeDasharray="3 2" />
          </g>
        ))}
        <text x={160} y={246} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono)" fontSize={9}>
          BS1
        </text>
        <text x={415} y={66} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono)" fontSize={9}>
          BS2
        </text>

        {/* bomb */}
        <g transform="translate(300 210)">
          <rect
            x={-18}
            y={-16}
            width={36}
            height={32}
            fill={kind === "live" ? "#F1DCD3" : GLASS}
            stroke={kind === "live" ? VERMILION : kind === "dud" ? MUTED : INK}
            strokeWidth={kind === null ? 1 : 1.2}
            strokeDasharray={kind === null ? "3 2" : undefined}
          />
          {kind === null ? (
            <text x={0} y={5} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono)" fontSize={16}>
              ?
            </text>
          ) : null}
          {kind === "live" ? <circle cx={0} cy={0} r={7} fill={VERMILION} opacity={0.85} /> : null}
          {kind === "dud" ? (
            <>
              <line x1={-14} y1={-12} x2={14} y2={12} stroke={MUTED} strokeWidth={1} />
              <line x1={-14} y1={12} x2={14} y2={-12} stroke={MUTED} strokeWidth={1} />
            </>
          ) : null}
          {kind === "live" ? (
            <path d="M 8 -16 Q 16 -24 10 -30" fill="none" stroke={VERMILION} strokeWidth={1.2} />
          ) : null}
          <text x={0} y={30} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono)" fontSize={8}>
            ABSTRACT ABSORBER
          </text>
        </g>

        {/* explosion burst */}
        {outcome === "explosion" ? (
          <motion.g
            initial={reduce ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reduce ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
            style={{ transformOrigin: "300px 196px" }}
          >
            <path
              d="M 300 196 l 9 -20 l 5 14 l 18 -9 l -7 16 l 20 5 l -18 7 l 7 16 l -18 -7 l -5 14 z"
              fill={VERMILION}
              opacity={0.9}
            />
          </motion.g>
        ) : null}

        {/* detectors */}
        {[
          { x: 555, y: 90, label: "D1", note: "bright port", hit: outcome === "D1", color: INK2 },
          { x: 555, y: 260, label: "D0", note: "dark port", hit: outcome === "D0", color: PETROL }
        ].map((d) => (
          <g key={d.label}>
            {d.hit ? (
              <motion.circle
                cx={d.x}
                cy={d.y}
                r={18}
                fill="none"
                stroke={d.color}
                strokeWidth={1.4}
                initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.9 }}
                transition={reduce ? { duration: 0 } : { duration: 0.3 }}
                style={{ transformOrigin: `${d.x}px ${d.y}px` }}
              />
            ) : null}
            <circle cx={d.x} cy={d.y} r={11} fill={d.hit ? d.color : PAPER} stroke={INK} strokeWidth={1} />
            <circle cx={d.x} cy={d.y} r={4} fill={d.hit ? PAPER : INK} />
            <text x={d.x} y={d.y + 26} textAnchor="middle" fill={INK} fontFamily="var(--font-mono)" fontSize={9}>
              {d.label}
            </text>
            <text x={d.x} y={d.y + 38} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono)" fontSize={8}>
              {d.note}
            </text>
          </g>
        ))}

        {/* arm labels */}
        <text x={270} y={78} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono)" fontSize={8}>
          upper arm · no object
        </text>
        <text x={205} y={238} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono)" fontSize={8}>
          lower arm
        </text>

        {/* legend */}
        <g transform="translate(30 28)">
          <circle cx={0} cy={0} r={3} fill={PETROL} />
          <text x={8} y={3} fill={MUTED} fontFamily="var(--font-mono)" fontSize={8}>
            D0 → certified live
          </text>
          <circle cx={0} cy={16} r={3} fill={VERMILION} />
          <text x={8} y={19} fill={MUTED} fontFamily="var(--font-mono)" fontSize={8}>
            explosion → live, destroyed
          </text>
          <circle cx={0} cy={32} r={3} fill={INK2} />
          <text x={8} y={35} fill={MUTED} fontFamily="var(--font-mono)" fontSize={8}>
            D1 → inconclusive
          </text>
        </g>
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Probability tree                                                            */
/* -------------------------------------------------------------------------- */

function ProbabilityTree({ kind }: { kind: BombKind | null }) {
  const liveOpacity = kind === "dud" ? 0.3 : 1;
  const dudOpacity = kind === "live" ? 0.3 : 1;
  const label = (x: number, y: number, text: string, anchor: "start" | "middle" | "end" = "middle") => (
    <text x={x} y={y} textAnchor={anchor} fill={MUTED} fontFamily="var(--font-mono)" fontSize={8}>
      {text}
    </text>
  );
  return (
    <svg viewBox="0 0 620 270" className="h-auto w-full" role="img" aria-label="Probability tree for a live and a dud bomb">
      <rect width="620" height="270" fill={PAPER} />
      {/* root */}
      <circle cx={48} cy={134} r={4} fill={INK} />
      {label(48, 120, "ONE BOMB")}
      {label(48, 156, "prior 1/2")}

      {/* level one */}
      <g opacity={liveOpacity}>
        <line x1={54} y1={132} x2={196} y2={70} stroke={VERMILION} strokeWidth={1.2} />
        {label(120, 92, "live · 1/2")}
        <circle cx={200} cy={70} r={4} fill={VERMILION} />
        {label(200, 56, "LIVE")}
        {[ { y: 20, text: "explosion · 1/2", sub: "destroys" }, { y: 75, text: "D0 · 1/4", sub: "certifies live" }, { y: 130, text: "D1 · 1/4", sub: "no verdict" } ].map((leaf) => (
          <g key={leaf.text}>
            <line x1={206} y1={70} x2={402} y2={leaf.y} stroke={VERMILION} strokeWidth={1} opacity={0.7} />
            {label(304, leaf.y - 5, leaf.text)}
            <circle cx={408} cy={leaf.y} r={4} fill={leaf.text.startsWith("D0") ? PETROL : leaf.text.startsWith("D1") ? INK2 : VERMILION} />
            {label(420, leaf.y + 3, leaf.sub, "start")}
          </g>
        ))}
      </g>

      {/* dud */}
      <g opacity={dudOpacity}>
        <line x1={54} y1={136} x2={196} y2={198} stroke={INK2} strokeWidth={1.2} />
        {label(120, 178, "dud · 1/2")}
        <circle cx={200} cy={198} r={4} fill={INK2} />
        {label(200, 184, "DUD")}
        <line x1={206} y1={198} x2={402} y2={222} stroke={INK2} strokeWidth={1} opacity={0.7} />
        {label(304, 205, "D1 · 1")}
        <circle cx={408} cy={222} r={4} fill={INK2} />
        {label(420, 225, "no verdict", "start")}
      </g>

      <line x1={30} y1={252} x2={590} y2={252} stroke={LINE} strokeWidth={0.5} />
      {label(30, 266, "Probabilities are conditional on the branch; each row sums to 1.", "start")}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Guided walkthrough                                                          */
/* -------------------------------------------------------------------------- */

interface GuidedStep {
  title: string;
  body: string;
  cta: string;
  run?: () => void;
}

/* -------------------------------------------------------------------------- */
/* Main component                                                              */
/* -------------------------------------------------------------------------- */

type Mode = "single" | "batch" | "guided";

export default function Simulation() {
  const reduce = useReducedMotion() ?? false;

  const [mode, setMode] = useState<Mode>("single");
  const [population, setPopulation] = useState<Population>("random");
  const [batchSize, setBatchSize] = useState(200);
  const [speed, setSpeed] = useState(4);
  const [seed, setSeed] = useState("bomb-03");
  const [records, setRecords] = useState<TrialRecord[]>([]);
  const [target, setTarget] = useState(0);
  const [running, setRunning] = useState(false);
  const [guidedStep, setGuidedStep] = useState(0);

  const intervalMs = reduce ? 0 : Math.max(50, 360 - speed * 38);

  const append = useCallback(
    (n: number, pop: Population) => {
      if (n <= 0) return;
      setRecords((prev) => {
        const out = prev.slice();
        for (let i = 0; i < n; i++) out.push(trialAt(seed, out.length, pop));
        return out;
      });
    },
    [seed]
  );

  const resetSession = useCallback(() => {
    setRunning(false);
    setRecords([]);
    setTarget(0);
    setGuidedStep(0);
  }, []);

  const handleSeed = useCallback(
    (next: string) => {
      setSeed(next);
      resetSession();
    },
    [resetSession]
  );

  const randomizeSeed = useCallback(() => {
    handleSeed(`bomb-${Math.random().toString(36).slice(2, 8)}`);
  }, [handleSeed]);

  const handleMode = useCallback((next: Mode) => {
    setRunning(false);
    setMode(next);
  }, []);

  /* Batch runner: appends a growing chunk until the target is reached. */
  useEffect(() => {
    if (!running || reduce) return;
    const id = window.setInterval(() => {
      setRecords((prev) => {
        if (prev.length >= target) return prev;
        const remaining = target - prev.length;
        const chunk = mode === "batch" ? Math.max(1, Math.ceil(remaining / 40)) : 1;
        const out = prev.slice();
        for (let k = 0; k < chunk && out.length < target; k++) {
          out.push(trialAt(seed, out.length, population));
        }
        return out;
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [running, reduce, target, mode, seed, population, intervalMs]);

  useEffect(() => {
    if (running && records.length >= target) setRunning(false);
  }, [running, records.length, target]);

  const last = records.length > 0 ? records[records.length - 1] : undefined;
  const lastRecord = last ?? null;

  const stats = useMemo(
    () => records.reduce<BombStats>((acc, r) => addTrial(acc, r), emptyStats()),
    [records]
  );

  const series = useMemo(() => cumulativeSeries(records, 160), [records]);
  const expected = useMemo(() => theoreticalCounts(stats), [stats]);
  const ci = wilsonInterval(stats.d0, stats.live);

  const d1Streak = useMemo(() => {
    let streak = 0;
    for (let i = records.length - 1; i >= 0; i--) {
      const r = records[i];
      if (r && r.outcome === "D1") streak += 1;
      else break;
    }
    return streak;
  }, [records]);

  const pending = Math.max(0, target - records.length);
  const primaryLabel =
    mode === "single"
      ? "Measure one photon"
      : running
        ? "Pause"
        : pending > 0
          ? `Resume (${pending} left)`
          : `Run ${batchSize.toLocaleString()}`;

  const onPrimary = () => {
    if (mode === "single") {
      append(1, population);
      return;
    }
    if (running) {
      setRunning(false);
      return;
    }
    if (pending > 0) {
      setRunning(true);
      return;
    }
    const nextTarget = records.length + batchSize;
    setTarget(nextTarget);
    if (reduce) {
      append(batchSize, population);
      setRunning(false);
      return;
    }
    setRunning(true);
  };

  const onStep = () => {
    setRunning(false);
    append(1, population);
  };

  const guidedSteps: GuidedStep[] = [
    {
      title: "Establish the dark port with a dud",
      body:
        "A transparent object leaves both amplitudes in place. The dark port stays dark and D1 should fire with probability 1. Run one dud trial and check the record.",
      cta: "Insert a dud and measure",
      run: () => append(1, "dud")
    },
    {
      title: "Send one live bomb",
      body:
        "The live absorber removes the lower amplitude. Expect one of three records: explosion (1/2), D0 (1/4) or D1 (1/4). The bomb type stays hidden until the record is written.",
      cta: "Insert a live bomb and measure",
      run: () => append(1, "live")
    },
    {
      title: "Accumulate a random batch",
      body:
        "A 50/50 population mixes live and dud bombs. Run 40 trials and watch the three counts grow. The ideal D0 rate among live bombs is 0.250.",
      cta: "Run 40 random trials",
      run: () => append(40, "random")
    },
    {
      title: "Read the interaction-free rate",
      body:
        "Compare D0/live with 1/4 and inspect the Wilson interval. At small n the interval is wide; that is sampling noise, not a broken model. The expected number of live bombs per D0 is 4.",
      cta: "Mark as read"
    },
    {
      title: "State the limits",
      body:
        "This model has no loss, dark counts, multi-photon emission, misalignment or decoherence, and no real explosive. A real run would differ. Say how before quoting any number.",
      cta: "Finish walkthrough"
    }
  ];

  const readouts: Readout[] = [
    {
      label: "Trials",
      value: stats.trials.toLocaleString(),
      note: `${stats.live} live · ${stats.dud} dud (revealed)`
    },
    {
      label: "Interaction-free",
      value: String(stats.certifiedLive),
      tone: "accent",
      note: "D0 clicks · live certified"
    },
    {
      label: "Explosions",
      value: String(stats.destructiveLive),
      tone: stats.destructiveLive > 0 ? "warn" : "default",
      note: "live, but destroyed"
    },
    {
      label: "Inconclusive",
      value: String(stats.inconclusive),
      note: "D1 clicks · no verdict"
    },
    {
      label: "P(D0 | live)",
      value: ci ? fmt(ci.centre) : "—",
      tone: "accent",
      note: ci ? `95% CI ${fmt(ci.low)}–${fmt(ci.high)} · theory 0.250` : "no live bombs yet"
    },
    {
      label: "False conclusions",
      value: String(stats.falseConclusions),
      tone: stats.falseConclusions > 0 ? "warn" : "default",
      note: "must be 0 in the ideal model"
    }
  ];

  const treeKind: BombKind | null = lastRecord ? lastRecord.kind : null;

  return (
    <SimulatorShell
      title="Bomb tester · single-photon bench"
      subtitle="Ideal lossless 50:50 interferometer · seeded numerical model"
      badge={<Badge tone="slate">Simulated</Badge>}
      spec={SIMULATION_SPEC}
      seed={seed}
      onSeedChange={handleSeed}
      onRandomize={randomizeSeed}
      onReset={resetSession}
      initialMode="free"
      freeNote="All controls are unlocked. The model stays in the ideal lossless 50:50 regime; the Model panel lists every exclusion."
      guidedNote="Suggested sequence: verify the dark port with a dud, send one live bomb, then accumulate a random batch before reading the rate."
      readouts={readouts}
      controls={
        <>
          <div>
            <p className="label mb-1.5">Experiment mode</p>
            <SegmentedControl<Mode>
              ariaLabel="Experiment mode"
              value={mode}
              onChange={handleMode}
              options={[
                { value: "single", label: "Single trial" },
                { value: "batch", label: "Batch N" },
                { value: "guided", label: "Guided" }
              ]}
            />
            <p className="mt-1.5 text-[0.65rem] leading-snug text-muted">
              {mode === "single"
                ? "One photon per press. The bomb type is revealed only after the outcome is recorded."
                : mode === "batch"
                  ? "Run a seeded batch of independent bombs. The log shows the most recent records."
                  : "A five-step walkthrough: dud reference → live bomb → random batch → rate → limits."}
            </p>
          </div>

          <div>
            <p className="label mb-1.5">Bomb population</p>
            <SegmentedControl<Population>
              ariaLabel="Bomb population"
              value={population}
              onChange={setPopulation}
              options={[
                { value: "random", label: "Random 50/50" },
                { value: "live", label: "Live" },
                { value: "dud", label: "Dud" }
              ]}
            />
            <p className="mt-1.5 text-[0.65rem] leading-snug text-muted">
              Forcing a population is a teaching control. In an honest single-blind run, keep it on {POPULATION_LABEL.random.toLowerCase()}.
            </p>
          </div>

          <Slider
            label="Trials per batch"
            value={batchSize}
            min={10}
            max={5000}
            step={10}
            onChange={setBatchSize}
            format={(v) => v.toLocaleString()}
            disabled={mode !== "batch"}
            hint="Each batch continues the seeded stream from the previous one."
          />

          <Slider
            label="Animation speed"
            value={speed}
            min={1}
            max={8}
            step={1}
            onChange={setSpeed}
            format={(v) => `${v}×`}
            disabled={reduce}
            hint={reduce ? "Reduced motion is enabled: outcomes appear instantly." : "Only affects how quickly a batch is revealed."}
          />

          <div className="space-y-2">
            <button type="button" className="btn btn-sm w-full" onClick={onPrimary} disabled={mode === "guided"}>
              {mode === "guided" ? "Use the walkthrough steps below" : primaryLabel}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm w-full"
              onClick={onStep}
              disabled={mode === "guided" || running}
            >
              Step one trial
            </button>
            <button type="button" className="btn btn-ghost btn-sm w-full" onClick={resetSession}>
              Clear records
            </button>
          </div>

          <div className="border-t border-line pt-3">
            <p className="label mb-1.5">Ideal probabilities</p>
            <div className="space-y-1 font-mono text-[0.65rem] text-ink-2">
              <p className="flex justify-between"><span>live · explosion</span><span>0.500</span></p>
              <p className="flex justify-between"><span>live · D0</span><span className="text-petrol">0.250</span></p>
              <p className="flex justify-between"><span>live · D1</span><span>0.250</span></p>
              <p className="flex justify-between border-t border-line pt-1"><span>dud · D1</span><span>1.000</span></p>
            </div>
            <p className="mt-2 text-[0.6rem] leading-snug text-muted">
              Expected live bombs per D0: {EXPECTED_TRIALS_PER_DETECTION}. With {stats.live} live bombs,
              P(≥1 D0) = {pct(confidenceAtLeastOneD0(stats.live))}.
            </p>
          </div>
        </>
      }
      footer={
        <p className="text-[0.65rem] leading-relaxed text-muted">
          <span className="font-mono uppercase tracking-[0.08em] text-ink">Simulated data.</span>{" "}
          The bomb is an abstract absorber, not an explosive. All counts, intervals and charts are outputs of the
          ideal seeded model described under <span className="font-mono">Model</span>.
        </p>
      }
    >
      {mode === "guided" ? (
        <div className="mb-4 border border-line bg-paper-3/40">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <p className="label">Guided walkthrough</p>
            <p className="num text-[0.65rem] text-muted">
              step {Math.min(guidedStep + 1, guidedSteps.length)} / {guidedSteps.length}
            </p>
          </div>
          <ol className="divide-y divide-line">
            {guidedSteps.map((step, i) => {
              const done = i < guidedStep;
              const current = i === guidedStep;
              return (
                <li key={step.title} className={`px-3 py-2.5 ${current ? "bg-paper-2" : ""}`}>
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center border font-mono text-[0.6rem] ${
                        done ? "border-petrol bg-petrol text-paper-2" : current ? "border-ink text-ink" : "border-line-strong text-muted"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[0.78rem] ${done ? "text-muted" : "text-ink"}`}>{step.title}</p>
                      {current ? (
                        <>
                          <p className="mt-1 text-[0.7rem] leading-relaxed text-ink-2">{step.body}</p>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm mt-2"
                            onClick={() => {
                              step.run?.();
                              setGuidedStep(i + 1);
                            }}
                          >
                            {step.cta}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          {guidedStep >= guidedSteps.length ? (
            <p className="border-t border-line px-3 py-2 text-[0.7rem] text-petrol">
              Walkthrough complete. Use Single trial or Batch N to explore further; the seed keeps the run reproducible.
            </p>
          ) : null}
        </div>
      ) : null}

      <Bench record={lastRecord} />

      <div className="mt-3 border border-line bg-paper-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-1.5">
          <span className="label">Last measurement</span>
          {lastRecord ? (
            <div className="flex items-center gap-2">
              <Badge tone={OUTCOME_TONE[lastRecord.outcome]}>{lastRecord.outcome}</Badge>
              <Badge tone={lastRecord.kind === "live" ? "vermilion" : "slate"}>
                revealed: {lastRecord.kind}
              </Badge>
            </div>
          ) : (
            <Badge tone="neutral">no record</Badge>
          )}
        </div>
        <div aria-live="polite" className="px-3 py-3">
          <AnimatePresence mode="wait">
            {lastRecord ? (
              <motion.div
                key={`${lastRecord.index}-${lastRecord.kind}-${lastRecord.outcome}`}
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.18 }}
              >
                <p className="display-sm">{verdictFor(lastRecord).title}</p>
                <p className="mt-1.5 max-w-2xl text-[0.78rem] leading-relaxed text-ink-2">
                  {verdictFor(lastRecord).body}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.62rem] text-muted">
                  <span>trial #{lastRecord.index + 1}</span>
                  <span>outcome {lastRecord.outcome}</span>
                  <span>verdict {lastRecord.conclusion ?? "none"}</span>
                  <span>interaction-free {lastRecord.interactionFree ? "yes" : "no"}</span>
                  {lastRecord.outcome === "D1" ? (
                    <span>
                      posterior live after {d1Streak} D1{d1Streak === 1 ? "" : "s"}:{" "}
                      {fmt(posteriorLiveGivenD1(d1Streak), 4)}
                    </span>
                  ) : null}
                </div>
              </motion.div>
            ) : (
              <p className="text-[0.78rem] leading-relaxed text-muted">
                No measurement yet. In <span className="text-ink">Single trial</span> the bomb is unclassified until
                the photon is detected. Press <span className="text-ink">Measure one photon</span> to write the first
                record.
              </p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="border border-line bg-paper-2">
          <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
            <p className="label">Probability tree · ideal model</p>
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted">simulated</span>
          </div>
          <ProbabilityTree kind={treeKind} />
        </div>
        <div className="border border-line bg-paper-2">
          <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
            <p className="label">Measured vs ideal · conditional on the realised mix</p>
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted">simulated</span>
          </div>
          <div className="p-3">
            <table className="lab-table">
              <caption className="label mb-2 text-left">Outcome counts (model truth revealed)</caption>
              <thead>
                <tr>
                  <th>Outcome</th>
                  <th className="num">Observed</th>
                  <th className="num">Ideal</th>
                  <th className="num">Δ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Explosion</td>
                  <td className="num">{stats.explosion}</td>
                  <td className="num">{fmt(expected.explosion, 1)}</td>
                  <td className="num">{fmt(stats.explosion - expected.explosion, 1)}</td>
                </tr>
                <tr>
                  <td>D0 (interaction-free)</td>
                  <td className="num">{stats.d0}</td>
                  <td className="num">{fmt(expected.D0, 1)}</td>
                  <td className="num">{fmt(stats.d0 - expected.D0, 1)}</td>
                </tr>
                <tr>
                  <td>D1 (inconclusive)</td>
                  <td className="num">{stats.d1}</td>
                  <td className="num">{fmt(expected.D1, 1)}</td>
                  <td className="num">{fmt(stats.d1 - expected.D1, 1)}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-[0.62rem] leading-relaxed text-muted">
              Ideal counts use the exact probabilities and the live/dud totals actually drawn:
              explosion 1/2 × live, D0 1/4 × live, D1 1/4 × live + 1 × dud.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3">
              <div>
                <p className="label mb-1">Live table</p>
                <p className="font-mono text-[0.65rem] text-ink-2">
                  exp {fmt(THEORY_LIVE.explosion)} · D0 {fmt(THEORY_LIVE.D0)} · D1 {fmt(THEORY_LIVE.D1)}
                </p>
              </div>
              <div>
                <p className="label mb-1">Dud table</p>
                <p className="font-mono text-[0.65rem] text-ink-2">
                  exp {fmt(THEORY_DUD.explosion)} · D0 {fmt(THEORY_DUD.D0)} · D1 {fmt(THEORY_DUD.D1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="border border-line bg-paper-2 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="label">Cumulative interaction-free detections</p>
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted">simulated</span>
          </div>
          {series.length > 1 ? (
            <LabLineChart
              data={series.map((p) => ({ n: p.n, d0: p.d0, expected: p.expected }))}
              series={[
                { key: "d0", label: "Observed D0", color: PETROL, width: 1.8 },
                { key: "expected", label: "Ideal 0.25 × live", color: MUTED, dashed: true }
              ]}
              xKey="n"
              xLabel="Trials"
              yLabel="Cumulative D0"
              height={180}
              showLegend
              digits={3}
            />
          ) : (
            <p className="py-10 text-center text-[0.72rem] text-muted">Run at least two trials to plot the curve.</p>
          )}
          <p className="sr-only">
            Simulated cumulative interaction-free detections: {stats.d0} D0 clicks after {stats.trials} trials. The
            dashed ideal line is 0.25 times the number of live bombs.
          </p>
        </div>
        <div className="border border-line bg-paper-2 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="label">Outcome distribution</p>
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted">simulated</span>
          </div>
          {stats.trials > 0 ? (
            <LabBarChart
              data={[
                { outcome: "Explosion", count: stats.explosion },
                { outcome: "D0", count: stats.d0 },
                { outcome: "D1", count: stats.d1 }
              ]}
              xKey="outcome"
              yKey="count"
              height={180}
              yLabel="Count"
              color={VERMILION}
            />
          ) : (
            <p className="py-10 text-center text-[0.72rem] text-muted">No outcomes yet.</p>
          )}
          <p className="sr-only">
            Simulated outcome distribution: {stats.explosion} explosions, {stats.d0} D0 clicks and {stats.d1} D1
            clicks.
          </p>
        </div>
      </div>

      <div className="mt-4 border border-line bg-paper-2">
        <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
          <p className="label">Trial log · most recent first</p>
          <p className="num text-[0.62rem] text-muted">{stats.trials} recorded · simulated</p>
        </div>
        {records.length > 0 ? (
          <div className="max-h-[240px] overflow-y-auto">
            <table className="lab-table">
              <caption className="sr-only">
                Most recent simulated trials. Bomb type is model truth, revealed after the outcome was recorded.
              </caption>
              <thead>
                <tr>
                  <th className="num">#</th>
                  <th>Outcome</th>
                  <th>Verdict</th>
                  <th>Bomb (revealed)</th>
                  <th className="num">Interaction-free</th>
                </tr>
              </thead>
              <tbody>
                {records
                  .slice(-12)
                  .reverse()
                  .map((r) => (
                    <tr key={r.index}>
                      <td className="num">{r.index + 1}</td>
                      <td>
                        <Badge tone={OUTCOME_TONE[r.outcome]}>{r.outcome}</Badge>
                      </td>
                      <td className="font-mono text-[0.68rem]">{r.conclusion ?? "none"}</td>
                      <td className="font-mono text-[0.68rem]">{r.kind}</td>
                      <td className="num">{r.interactionFree ? "1" : "0"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-3 py-6 text-center text-[0.72rem] text-muted">
            The log fills as trials are recorded. Each row keeps the outcome, the verdict the observer could make, and
            the model truth revealed afterwards.
          </p>
        )}
      </div>
    </SimulatorShell>
  );
}
