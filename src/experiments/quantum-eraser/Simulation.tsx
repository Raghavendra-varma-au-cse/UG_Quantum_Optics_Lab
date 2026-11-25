"use client";

import { useMemo, useState, type ReactNode } from "react";
import { SimulatorShell, type Readout } from "@/components/sim/SimulatorShell";
import { Slider, Toggle } from "@/components/ui/Controls";
import { Badge } from "@/components/ui/primitives";
import { IntensityCanvas } from "@/components/viz/IntensityCanvas";
import {
  DEFAULT_ERASER_CONFIG,
  conditionalVisibility,
  effectiveMarkerAngle,
  eraserSimulation,
  fringeProfile,
  markerVisibility,
  resolveEraserState,
  simulateAnalyzerSeries,
  simulateCoincidence,
  simulateMarkerSeries,
  type EraserConfig,
  type EraserState,
  type FringeChannel,
  type SeriesPoint
} from "./physics";

const INITIAL: EraserConfig = {
  ...DEFAULT_ERASER_CONFIG,
  markerInserted: true,
  markerAngleDeg: 90,
  analyzerInserted: true,
  analyzerAngleDeg: 45,
  gated: false,
  phaseRad: 0,
  intensityRatio: 1
};

const MARKER_ANGLES = [0, 15, 30, 45, 60, 75, 90];
const ANALYZER_ANGLES = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180];
const PETROL = "#14524A";
const VERMILION = "#B23A1E";
const SLATE = "#3D4A55";

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const fmt = (v: number, digits = 3): string => (Number.isFinite(v) ? v.toFixed(digits) : "—");
const countFmt = (n: number): string => n.toLocaleString("en-US");

/* -------------------------------------------------------------------------- */
/* Scientific widgets                                                         */
/* -------------------------------------------------------------------------- */

function Chip({
  label,
  value,
  tone = "ink"
}: {
  label: string;
  value: string;
  tone?: "ink" | "petrol" | "vermilion" | "muted";
}) {
  const color =
    tone === "petrol" ? "text-petrol" : tone === "vermilion" ? "text-vermilion" : tone === "muted" ? "text-muted" : "text-ink";
  return (
    <span className="inline-flex items-baseline gap-1.5 border border-line bg-paper-2 px-2 py-1">
      <span className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-muted">{label}</span>
      <span className={`num text-[0.66rem] ${color}`}>{value}</span>
    </span>
  );
}

function Gauge({
  label,
  value,
  note,
  tone = "petrol"
}: {
  label: string;
  value: number;
  note?: string;
  tone?: "petrol" | "vermilion" | "brass" | "ink";
}) {
  const bg =
    tone === "vermilion" ? "bg-vermilion" : tone === "brass" ? "bg-brass" : tone === "ink" ? "bg-ink" : "bg-petrol";
  return (
    <div role="meter" aria-valuemin={0} aria-valuemax={1} aria-valuenow={clamp01(value)} aria-label={label}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[0.56rem] uppercase tracking-[0.09em] text-muted">{label}</span>
        <span className="num text-[0.76rem] text-ink">{fmt(value)}</span>
      </div>
      <div className="mt-1 h-[5px] w-full border border-line bg-paper-3">
        <div className={`h-full ${bg}`} style={{ width: `${clamp01(value) * 100}%` }} />
      </div>
      {note ? <p className="mt-1 text-[0.58rem] leading-snug text-muted">{note}</p> : null}
    </div>
  );
}

function EraserSchematic({ config, state }: { config: EraserConfig; state: EraserState }) {
  const markerOn = config.markerInserted;
  const analyzerOn = config.analyzerInserted;
  const gated = state.channelResolved;
  const theta = state.thetaDeg;
  const alpha = config.analyzerAngleDeg;
  const markerStroke = markerOn ? PETROL : "#BFB8A7";
  const analyzerStroke = analyzerOn ? PETROL : "#BFB8A7";
  const markerDash = markerOn ? undefined : "3 3";
  const analyzerDash = analyzerOn ? undefined : "3 3";
  const pathB = markerOn ? `|θ=${theta.toFixed(0)}°⟩` : "|H⟩ · marker out";
  const detectorLabel = analyzerOn ? (gated ? "D+" : "D₁") : "D₁";
  const detectorLabel2 = analyzerOn ? (gated ? "D−" : "D₀") : "D₀";

  return (
    <div>
      <svg
        viewBox="0 0 680 250"
        className="h-auto w-full"
        role="img"
        aria-label={`Quantum eraser schematic. Path a carries H. Path b marker is ${markerOn ? `${theta.toFixed(0)} degrees` : "removed"}. Analyser is ${analyzerOn ? `${alpha.toFixed(0)} degrees` : "removed"}. Record is ${gated ? "channel resolved" : "summed"}.`}
      >
        <title>Mach–Zehnder interferometer with polarization marker and analyser</title>
        <rect width="680" height="250" fill="#FBF9F4" />

        {/* beams */}
        <path d="M 62 185 H 134" fill="none" stroke={VERMILION} strokeWidth={1.7} strokeLinecap="round" />
        <path d="M 150 170 V 85 H 385" fill="none" stroke={VERMILION} strokeWidth={1.7} strokeLinecap="round" />
        <path d="M 165 185 H 385" fill="none" stroke={VERMILION} strokeWidth={1.7} strokeLinecap="round" />
        <path d="M 400 185 V 101" fill="none" stroke={VERMILION} strokeWidth={1.7} strokeLinecap="round" />
        <path d="M 415 85 H 555" fill="none" stroke={VERMILION} strokeWidth={1.7} strokeLinecap="round" />
        <path d="M 400 70 V 38" fill="none" stroke={VERMILION} strokeWidth={1.7} strokeLinecap="round" />

        {/* source */}
        <g>
          <rect x={18} y={173} width={44} height={24} fill="#EEE9DF" stroke="#171713" strokeWidth={1} />
          <rect x={26} y={179} width={24} height={12} fill={VERMILION} opacity={0.82} />
          <text x={40} y={164} textAnchor="middle" fill="#171713" fontFamily="var(--font-mono), monospace" fontSize={8}>
            He–Ne 632.8 nm
          </text>
        </g>

        {/* BS1 */}
        <g>
          <rect x={135} y={170} width={30} height={30} fill="rgba(255,255,255,0.55)" stroke="#171713" strokeWidth={1} />
          <line x1={135} y1={200} x2={165} y2={170} stroke="#171713" strokeWidth={0.8} strokeDasharray="3 2" />
          <text x={132} y={162} textAnchor="end" fill="#6E6A5E" fontFamily="var(--font-mono), monospace" fontSize={8}>
            BS1
          </text>
        </g>

        {/* BS2 */}
        <g>
          <rect x={385} y={70} width={30} height={30} fill="rgba(255,255,255,0.55)" stroke="#171713" strokeWidth={1} />
          <line x1={385} y1={100} x2={415} y2={70} stroke="#171713" strokeWidth={0.8} strokeDasharray="3 2" />
          <text x={421} y={104} textAnchor="start" fill="#6E6A5E" fontFamily="var(--font-mono), monospace" fontSize={8}>
            BS2
          </text>
        </g>

        {/* lower mirror */}
        <g transform="translate(400 185) rotate(45)">
          <rect x={-16} y={-2.4} width={32} height={4.8} fill="#EEE9DF" stroke="#171713" strokeWidth={1} />
          <line x1={-16} y1={-4.4} x2={16} y2={-4.4} stroke="#171713" strokeWidth={1} />
        </g>

        {/* marker */}
        <g>
          <rect
            x={272}
            y={170}
            width={6}
            height={30}
            fill="#EEE9DF"
            stroke={markerStroke}
            strokeWidth={markerOn ? 1.3 : 1}
            strokeDasharray={markerDash}
          />
          <line x1={275} y1={170} x2={275} y2={200} stroke={markerStroke} strokeWidth={0.7} strokeDasharray="2 2" />
          <text x={275} y={158} textAnchor="middle" fill={markerStroke} fontFamily="var(--font-mono), monospace" fontSize={8}>
            {markerOn ? `λ/2 @ ${(theta / 2).toFixed(1)}°` : "marker out"}
          </text>
          <text x={275} y={214} textAnchor="middle" fill="#6E6A5E" fontFamily="var(--font-mono), monospace" fontSize={7.5}>
            path b marker
          </text>
        </g>

        {/* phase shifter */}
        <g>
          <rect x={330} y={172} width={24} height={26} fill="#FBF9F4" stroke="#BFB8A7" strokeWidth={0.8} />
          <text x={342} y={188} textAnchor="middle" fill={PETROL} fontFamily="var(--font-mono), monospace" fontSize={9}>
            φ
          </text>
          <text x={342} y={214} textAnchor="middle" fill="#6E6A5E" fontFamily="var(--font-mono), monospace" fontSize={7.5}>
            phase
          </text>
        </g>

        {/* analyser, right output */}
        <g>
          <rect
            x={477}
            y={66}
            width={6}
            height={38}
            fill="#EEE9DF"
            stroke={analyzerStroke}
            strokeWidth={analyzerOn ? 1.3 : 1}
            strokeDasharray={analyzerDash}
          />
          <line x1={480} y1={66} x2={480} y2={104} stroke={analyzerStroke} strokeWidth={0.7} strokeDasharray="2 2" />
          <text x={480} y={54} textAnchor="middle" fill={analyzerStroke} fontFamily="var(--font-mono), monospace" fontSize={8}>
            {analyzerOn ? `pol α=${alpha.toFixed(0)}°` : "analyser out"}
          </text>
        </g>

        {/* analyser, upper output */}
        <g>
          <rect
            x={382}
            y={55}
            width={36}
            height={6}
            fill="#EEE9DF"
            stroke={analyzerStroke}
            strokeWidth={analyzerOn ? 1.3 : 1}
            strokeDasharray={analyzerDash}
          />
          <line x1={382} y1={58} x2={418} y2={58} stroke={analyzerStroke} strokeWidth={0.7} strokeDasharray="2 2" />
          <text x={424} y={61} textAnchor="start" fill={analyzerStroke} fontFamily="var(--font-mono), monospace" fontSize={8}>
            {analyzerOn ? `α+90°` : "out"}
          </text>
        </g>

        {/* detectors */}
        <g>
          <circle cx={585} cy={85} r={11} fill="#FBF9F4" stroke="#171713" strokeWidth={1} />
          <circle cx={585} cy={85} r={4} fill="#171713" />
          <text x={585} y={112} textAnchor="middle" fill="#171713" fontFamily="var(--font-mono), monospace" fontSize={8}>
            {detectorLabel}
          </text>
        </g>
        <g>
          <circle cx={400} cy={24} r={11} fill="#FBF9F4" stroke="#171713" strokeWidth={1} />
          <circle cx={400} cy={24} r={4} fill="#171713" />
          <text x={418} y={27} textAnchor="start" fill="#171713" fontFamily="var(--font-mono), monospace" fontSize={8}>
            {detectorLabel2}
          </text>
        </g>

        {/* path labels */}
        <text x={214} y={75} textAnchor="middle" fill={VERMILION} fontFamily="var(--font-mono), monospace" fontSize={8.5}>
          path a · |H⟩
        </text>
        <text x={214} y={205} textAnchor="middle" fill={VERMILION} fontFamily="var(--font-mono), monospace" fontSize={8.5}>
          path b · {pathB}
        </text>

        {/* dashed region labels */}
        <rect x={252} y={146} width={50} height={76} fill="none" stroke="#D9D3C5" strokeWidth={0.8} strokeDasharray="2 3" />
        <text x={248} y={238} textAnchor="start" fill="#6E6A5E" fontFamily="var(--font-mono), monospace" fontSize={7.5}>
          which-path marker
        </text>
        <rect x={368} y={45} width={130} height={78} fill="none" stroke="#D9D3C5" strokeWidth={0.8} strokeDasharray="2 3" />
        <text x={502} y={40} textAnchor="start" fill="#6E6A5E" fontFamily="var(--font-mono), monospace" fontSize={7.5}>
          eraser projection
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Chip label="path a" value="|H⟩" tone="vermilion" />
        <Chip label="path b" value={markerOn ? `|${theta.toFixed(0)}°⟩` : "|H⟩"} tone="petrol" />
        <Chip label="HWP axis" value={markerOn ? `${(theta / 2).toFixed(1)}°` : "out"} />
        <Chip label="analyser" value={analyzerOn ? `${alpha.toFixed(0)}° / +90°` : "out"} />
        <Chip label="record" value={gated ? "channel-resolved" : "summed"} tone={gated ? "petrol" : "muted"} />
      </div>
    </div>
  );
}

function MiniChart({
  theory,
  points,
  xMin,
  xMax,
  xTicks,
  xLabel,
  highlight,
  highlightLabel,
  ariaLabel
}: {
  theory: readonly { x: number; y: number }[];
  points: readonly SeriesPoint[];
  xMin: number;
  xMax: number;
  xTicks: readonly number[];
  xLabel: string;
  highlight: number;
  highlightLabel: string;
  ariaLabel: string;
}) {
  const W = 520;
  const H = 236;
  const m = { l: 42, r: 14, t: 12, b: 34 };
  const pw = W - m.l - m.r;
  const ph = H - m.t - m.b;
  const sx = (x: number) => m.l + ((x - xMin) / (xMax - xMin || 1)) * pw;
  const sy = (y: number) => m.t + (1 - clamp01(y)) * ph;
  const path = theory
    .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`)
    .join(" ");
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
      <rect width={W} height={H} fill="#FBF9F4" />
      {yTicks.map((y) => (
        <g key={y}>
          <line x1={m.l} y1={sy(y)} x2={W - m.r} y2={sy(y)} stroke="#D9D3C5" strokeWidth={0.6} strokeDasharray={y === 0 ? undefined : "1 3"} />
          <text x={m.l - 6} y={sy(y) + 3} textAnchor="end" fill="#6E6A5E" fontFamily="var(--font-mono), monospace" fontSize={7.5}>
            {y.toFixed(2)}
          </text>
        </g>
      ))}
      {xTicks.map((x) => (
        <g key={x}>
          <line x1={sx(x)} y1={m.t} x2={sx(x)} y2={H - m.b} stroke="#D9D3C5" strokeWidth={0.4} strokeDasharray="1 4" />
          <text x={sx(x)} y={H - m.b + 13} textAnchor="middle" fill="#6E6A5E" fontFamily="var(--font-mono), monospace" fontSize={7.5}>
            {x.toFixed(0)}
          </text>
        </g>
      ))}
      <line x1={m.l} y1={H - m.b} x2={W - m.r} y2={H - m.b} stroke="#BFB8A7" strokeWidth={0.8} />
      <line x1={m.l} y1={m.t} x2={m.l} y2={H - m.b} stroke="#BFB8A7" strokeWidth={0.8} />

      <line
        x1={sx(highlight)}
        y1={m.t}
        x2={sx(highlight)}
        y2={H - m.b}
        stroke={VERMILION}
        strokeWidth={0.9}
        strokeDasharray="3 3"
      />
      <text
        x={highlight > xMax - (xMax - xMin) * 0.15 ? sx(highlight) - 3 : sx(highlight) + 3}
        y={m.t + 8}
        textAnchor={highlight > xMax - (xMax - xMin) * 0.15 ? "end" : "start"}
        fill={VERMILION}
        fontFamily="var(--font-mono), monospace"
        fontSize={7.5}
      >
        {highlightLabel}
      </text>

      <path d={path} fill="none" stroke={PETROL} strokeWidth={1.5} strokeLinecap="round" />

      {points.map((p, i) => {
        const lo = clamp01(p.y - p.error);
        const hi = clamp01(p.y + p.error);
        return (
          <g key={`${p.x}-${i}`}>
            <line x1={sx(p.x)} y1={sy(lo)} x2={sx(p.x)} y2={sy(hi)} stroke={SLATE} strokeWidth={1} />
            <line x1={sx(p.x) - 3} y1={sy(lo)} x2={sx(p.x) + 3} y2={sy(lo)} stroke={SLATE} strokeWidth={1} />
            <line x1={sx(p.x) - 3} y1={sy(hi)} x2={sx(p.x) + 3} y2={sy(hi)} stroke={SLATE} strokeWidth={1} />
            <circle cx={sx(p.x)} cy={sy(p.y)} r={2.8} fill={SLATE} stroke="#FBF9F4" strokeWidth={0.7} />
          </g>
        );
      })}

      <text x={m.l + pw / 2} y={H - 4} textAnchor="middle" fill="#6E6A5E" fontFamily="var(--font-mono), monospace" fontSize={8}>
        {xLabel}
      </text>
      <text x={12} y={m.t + ph / 2} textAnchor="middle" fill="#6E6A5E" fontFamily="var(--font-mono), monospace" fontSize={8} transform={`rotate(-90 12 ${m.t + ph / 2})`}>
        visibility V
      </text>
    </svg>
  );
}

function ChartCard({
  title,
  meta,
  children,
  caption
}: {
  title: string;
  meta: ReactNode;
  children: ReactNode;
  caption: string;
}) {
  return (
    <div className="min-w-0 border border-line bg-paper-2">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-ink">{title}</p>
        {meta}
      </div>
      <div className="p-2">{children}</div>
      <p className="border-t border-line px-3 py-2 text-[0.6rem] leading-relaxed text-muted">{caption}</p>
    </div>
  );
}

function CountHistogram({ bins, color, ariaLabel }: { bins: readonly number[]; color: string; ariaLabel: string }) {
  const W = 480;
  const H = 42;
  const max = Math.max(1, ...bins);
  const n = Math.max(1, bins.length);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
      <rect width={W} height={H} fill="#F1EDE4" />
      {bins.map((c, i) => {
        const h = (c / max) * (H - 5);
        return <rect key={i} x={(i * W) / n} y={H - 2 - h} width={Math.max(0.6, W / n - 0.5)} height={h} fill={color} />;
      })}
      <line x1={0} y1={H - 1.5} x2={W} y2={H - 1.5} stroke="#BFB8A7" strokeWidth={0.6} />
    </svg>
  );
}

function ChannelCounts({
  label,
  counts,
  total,
  visibility,
  error,
  color,
  bins,
  active
}: {
  label: string;
  counts: number;
  total: number;
  visibility: number;
  error: number;
  color: string;
  bins: readonly number[];
  active: boolean;
}) {
  const share = total > 0 ? counts / total : 0;
  return (
    <div className={`border border-line p-2.5 ${active ? "bg-paper-2" : "bg-paper-3/40"}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.09em] text-ink">{label}</span>
        <span className="num text-[0.72rem] text-ink">{countFmt(counts)} counts</span>
      </div>
      <div className="mt-1.5 h-[4px] w-full border border-line bg-paper-3">
        <div className="h-full" style={{ width: `${share * 100}%`, background: color }} />
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-2 text-[0.6rem] text-muted">
        <span>V = {fmt(visibility)} ± {fmt(error)}</span>
        <span>{fmt(share * 100, 1)} % of events</span>
      </div>
      {active ? (
        <div className="mt-1.5">
          <CountHistogram bins={bins} color={color} ariaLabel={`${label} binned simulated counts`} />
        </div>
      ) : null}
    </div>
  );
}

function FringeMonitor({ config, state }: { config: EraserConfig; state: EraserState }) {
  const strips = useMemo(() => {
    const channels: FringeChannel[] = state.channelResolved ? ["plus", "minus"] : ["total"];
    return channels.map((channel) => {
      const profile = fringeProfile(config, channel, 480, 6);
      const buffer = new Float32Array(480 * 64);
      for (let row = 0; row < 64; row++) buffer.set(profile, row * 480);
      const visibility =
        channel === "plus" ? state.plusVisibility : channel === "minus" ? state.minusVisibility : state.totalVisibility;
      return { channel, buffer, visibility };
    });
  }, [config, state.channelResolved, state.plusVisibility, state.minusVisibility, state.totalVisibility]);

  return (
    <div className="space-y-2.5">
      {strips.map((strip) => (
        <div key={strip.channel}>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.09em] text-ink">
              {strip.channel === "total"
                ? state.channelResolved
                  ? "ungated sum"
                  : "unconditioned intensity"
                : strip.channel === "plus"
                  ? "analyser + channel"
                  : "analyser − channel (α + 90°)"}
            </span>
            <span className="num text-[0.62rem] text-muted">V = {fmt(strip.visibility)}</span>
          </div>
          <IntensityCanvas
            values={strip.buffer}
            width={480}
            height={64}
            size={480}
            colormap="amber"
            max={1}
            ariaLabel={`Simulated fringe strip for the ${strip.channel} channel; visibility ${fmt(strip.visibility)}`}
          />
        </div>
      ))}
      <div className="flex items-center justify-between text-[0.55rem] text-muted">
        <span>0</span>
        <span>position across field · six fringe periods · normalised per channel</span>
        <span>1</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function Simulation() {
  const [config, setConfig] = useState<EraserConfig>(INITIAL);
  const [photons, setPhotons] = useState(3000);
  const [seed, setSeed] = useState("eraser-04");

  const reset = () => {
    setConfig(INITIAL);
    setPhotons(3000);
    setSeed("eraser-04");
  };

  const randomizeSeed = () => {
    setSeed(`eraser-${Math.random().toString(36).slice(2, 8)}`);
  };

  const patch = (next: Partial<EraserConfig>) => {
    setConfig((current) => ({ ...current, ...next }));
  };

  const state = useMemo(() => resolveEraserState(config), [config]);
  const run = useMemo(
    () => simulateCoincidence(config, photons, seed, 96, 6),
    [config, photons, seed]
  );

  const markerPoints = useMemo(() => {
    if (!config.markerInserted) return [];
    return simulateMarkerSeries(
      config,
      MARKER_ANGLES,
      Math.max(240, Math.round(photons / 5)),
      seed,
      72,
      6
    );
  }, [config, config.markerInserted, config.phaseRad, config.intensityRatio, photons, seed]);

  const analyzerPoints = useMemo(() => {
    if (!config.markerInserted || !config.analyzerInserted || !config.gated) return [];
    return simulateAnalyzerSeries(
      config,
      ANALYZER_ANGLES,
      Math.max(220, Math.round(photons / 8)),
      seed,
      72,
      6
    );
  }, [
    config,
    config.markerInserted,
    config.analyzerInserted,
    config.gated,
    config.markerAngleDeg,
    config.phaseRad,
    config.intensityRatio,
    photons,
    seed
  ]);

  const markerTheory = useMemo(
    () => Array.from({ length: 91 }, (_, i) => ({ x: i, y: markerVisibility(i, config.intensityRatio) })),
    [config.intensityRatio]
  );

  const thetaCurve = effectiveMarkerAngle(config);
  const analyzerTheory = useMemo(
    () =>
      Array.from({ length: 181 }, (_, i) => ({
        x: i,
        y: conditionalVisibility(thetaCurve, i, config.intensityRatio)
      })),
    [thetaCurve, config.intensityRatio]
  );

  const displayed = state.channelResolved ? run.plus : run.total;
  const countsLabel = state.channelResolved
    ? `${countFmt(run.plus.total)} / ${countFmt(run.minus.total)}`
    : countFmt(run.total.total);

  const readouts: Readout[] = [
    {
      label: "Unconditioned V",
      value: fmt(state.totalVisibility),
      note: "both analyser outputs summed; |cos θ| at balance"
    },
    {
      label: "Conditional V",
      value: config.analyzerInserted ? fmt(state.conditionalVisibility) : "—",
      note: state.channelResolved ? "selected analyser channel" : config.analyzerInserted ? "enable gating" : "insert analyser",
      tone: state.channelResolved ? "accent" : "default"
    },
    {
      label: "Distinguishability D",
      value: fmt(state.distinguishability),
      note: "D = |sin θ|"
    },
    {
      label: "D² + V²",
      value: fmt(state.dualitySum),
      note: "= 1 for pure balanced marking",
      tone: state.dualitySum > 1.0005 ? "warn" : "default"
    },
    {
      label: "Marker overlap",
      value: fmt(state.overlap),
      note: "|⟨H|θ⟩| = |cos θ|"
    },
    {
      label: state.channelResolved ? "Counts A / B (sim.)" : "Counts total (sim.)",
      value: countsLabel,
      note: "sampled events, not laboratory data"
    },
    {
      label: "Measured V (sim.)",
      value: `${fmt(displayed.visibility)} ± ${fmt(displayed.visibilityError)}`,
      note: "Fourier fit to binned counts",
      tone: "accent"
    },
    {
      label: "Photons / seed",
      value: countFmt(run.photons),
      note: `seed ${seed}`
    }
  ];

  const preset = (next: Partial<EraserConfig>) => () => patch(next);

  return (
    <SimulatorShell
      title="Quantum eraser — polarization marking"
      subtitle="Two paths · one marker · post-selected interference"
      badge={
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="brass">
            <span aria-hidden className="inline-block h-[5px] w-[5px] bg-brass" />
            Classical-wave analogue
          </Badge>
          <Badge tone="slate">Simulated counts</Badge>
        </div>
      }
      spec={eraserSimulation}
      seed={seed}
      onSeedChange={setSeed}
      onRandomize={randomizeSeed}
      onReset={reset}
      readouts={readouts}
      guidedNote="Guided sequence: start with θ = 90°, the analyser in and gating off — the summed record is flat. Enable gating to recover fringes in each analyser channel. Then try α = 0° and α = 90° to see the path information return."
      freeNote="Every parameter is independent. The optical model is exact for ideal polarization optics; only the photon counts are sampled, so the measured visibility scatters within its shot-noise error."
      controls={
        <ControlsSlot
          config={config}
          patch={patch}
          state={state}
          photons={photons}
          setPhotons={setPhotons}
          preset={preset}
        />
      }
      footer={
        <div className="grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="mb-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-ink">What this run shows</p>
            <p className="text-[0.68rem] leading-relaxed text-ink-2">
              The marker converts path information into polarization information. The summed record keeps only the
              marker-limited visibility; the analyser projects both paths onto a common polarization, and the channel
              label selects a subensemble. At θ = 90° and α = 45° the conditional fringes are full-contrast while the
              ungated record is flat.
            </p>
          </div>
          <div className="border-line sm:border-l sm:pl-4">
            <p className="mb-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-vermilion">Erasure does not change the past</p>
            <p className="text-[0.68rem] leading-relaxed text-ink-2">
              Post-selection sorts events after they are recorded. It does not alter the earlier detection event and it
              cannot be read out from the unconditional singles rate. The counts here are sampled from the model, not
              measured in a laboratory.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Live schematic */}
        <div className="border border-line bg-paper-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
            <div>
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-ink">Interferometer · live state</p>
              <p className="text-[0.6rem] text-muted">Polarization labels update with the controls.</p>
            </div>
            <Badge tone="neutral">schematic</Badge>
          </div>
          <div className="p-3">
            <EraserSchematic config={config} state={state} />
          </div>
        </div>

        {/* Fringe monitor */}
        <div className="border border-line bg-paper-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
            <div>
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-ink">Fringe monitor · simulated</p>
              <p className="text-[0.6rem] text-muted">
                {state.channelResolved
                  ? "Each analyser channel is normalised to its own mean; the two patterns are complementary."
                  : "Unconditioned intensity at one output. At θ = 90° the marker washes the fringes out."}
              </p>
            </div>
            <Badge tone="brass">SIMULATED</Badge>
          </div>
          <div className="p-3">
            <FringeMonitor config={config} state={state} />
          </div>
        </div>

        {/* Gauges */}
        <div className="grid gap-3 border border-line bg-paper-2 p-3 sm:grid-cols-2">
          <Gauge
            label="Unconditioned visibility V"
            value={state.totalVisibility}
            tone="ink"
            note="The full singles ensemble, with the two analyser outputs summed. At θ = 90° this is zero."
          />
          <Gauge
            label="Conditional visibility V_cond"
            value={state.conditionalVisibility}
            tone="petrol"
            note={
              state.channelResolved
                ? `Selected analyser channel at α = ${config.analyzerAngleDeg.toFixed(0)}°.`
                : "Enable gating to display the post-selected channel."
            }
          />
          <Gauge
            label="Distinguishability D"
            value={state.distinguishability}
            tone="vermilion"
            note="D = |sin θ|. D = 1 means the path is known in principle."
          />
          <Gauge
            label="Weighted channel visibility"
            value={state.weightedChannelVisibility}
            tone="brass"
            note="q₊V₊ + q₋V₋ ≤ 1. Both channels can be coherent because they are separately post-selected."
          />
        </div>

        {/* Counts */}
        <div className="border border-line bg-paper-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
            <div>
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-ink">Detected events · sampled</p>
              <p className="text-[0.6rem] text-muted">
                {state.channelResolved
                  ? "The analyser-channel label is kept. Visibility is computed from the binned counts."
                  : "Channel labels are discarded; the histogram is the sum of the analyser outputs."}
              </p>
            </div>
            <Badge tone="brass">SIMULATED</Badge>
          </div>
          <div className="grid gap-2 p-3 sm:grid-cols-2">
            {state.channelResolved ? (
              <>
                <ChannelCounts
                  label="analyser +"
                  counts={run.plus.total}
                  total={run.photons}
                  visibility={run.plus.visibility}
                  error={run.plus.visibilityError}
                  color={PETROL}
                  bins={run.plus.bins}
                  active
                />
                <ChannelCounts
                  label="analyser − (α + 90°)"
                  counts={run.minus.total}
                  total={run.photons}
                  visibility={run.minus.visibility}
                  error={run.minus.visibilityError}
                  color={VERMILION}
                  bins={run.minus.bins}
                  active
                />
              </>
            ) : (
              <div className="sm:col-span-2">
                <ChannelCounts
                  label="unconditional record"
                  counts={run.total.total}
                  total={run.photons}
                  visibility={run.total.visibility}
                  error={run.total.visibilityError}
                  color={SLATE}
                  bins={run.total.bins}
                  active
                />
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-3 xl:grid-cols-2">
          <ChartCard
            title="Visibility versus marker angle"
            meta={<Badge tone="slate">SIMULATED</Badge>}
            caption="Theory curve V = 2r|cos θ|/(1+r²). Points are recovered from a seeded photon run with the analyser removed, so each point carries the shot-noise error bar of its own count budget. At θ = 90° the fringes vanish."
          >
            <MiniChart
              theory={markerTheory}
              points={markerPoints}
              xMin={0}
              xMax={90}
              xTicks={[0, 30, 60, 90]}
              xLabel="marker angle θ (degrees)"
              highlight={state.thetaDeg}
              highlightLabel={`θ = ${state.thetaDeg.toFixed(0)}°`}
              ariaLabel="Theoretical and simulated unconditioned visibility versus marker angle"
            />
          </ChartCard>

          <ChartCard
            title="Conditional visibility versus analyser angle"
            meta={<Badge tone="slate">SIMULATED</Badge>}
            caption="Theory curve for the selected analyser channel. Points are shown only when the analyser is inserted and gating is on. At θ = 90° the curve is |sin 2α|, with maxima at 45° and 135° — the erasure angles."
          >
            <MiniChart
              theory={analyzerTheory}
              points={analyzerPoints}
              xMin={0}
              xMax={180}
              xTicks={[0, 45, 90, 135, 180]}
              xLabel="analyser angle α (degrees)"
              highlight={config.analyzerAngleDeg}
              highlightLabel={`α = ${config.analyzerAngleDeg.toFixed(0)}°`}
              ariaLabel="Theoretical and simulated conditional visibility versus analyser angle"
            />
          </ChartCard>
        </div>

        {/* Interpretation */}
        <div className="border-l-2 border-petrol bg-petrol-soft/40 px-3 py-2.5">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-petrol">Interpretation</p>
          <p className="mt-1 text-[0.7rem] leading-relaxed text-ink-2">
            At θ = 90° the two analyser channels carry fringes of equal amplitude and opposite phase. Summed, they
            reproduce the marker-limited visibility — zero — so the unconditional record is flat. Keeping the channel
            label selects one pattern and reveals fringes. This is post-selection, not a signal sent back in time. The
            total singles rate contains no information about which analyser setting was used.
          </p>
        </div>
      </div>
    </SimulatorShell>
  );
}

/**
 * SimulatorShell takes its controls as a prop, so the interactive panel is
 * defined here and passed through a thin wrapper component. Keeping it in one
 * file makes the experiment self-contained while preserving the shared shell.
 */
function ControlsSlot({
  config,
  patch,
  state,
  photons,
  setPhotons,
  preset
}: {
  config: EraserConfig;
  patch: (next: Partial<EraserConfig>) => void;
  state: EraserState;
  photons: number;
  setPhotons: (n: number) => void;
  preset: (next: Partial<EraserConfig>) => () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="label mb-2">Worked sequence</p>
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={preset({ markerInserted: true, markerAngleDeg: 90, analyzerInserted: false, gated: false })}
            className="border border-line-strong px-1.5 py-1.5 text-left text-[0.58rem] leading-tight text-ink-2 hover:bg-paper"
          >
            <span className="block font-mono text-[0.54rem] uppercase tracking-[0.08em] text-vermilion">1 · mark</span>
            θ = 90°, no analyser
          </button>
          <button
            type="button"
            onClick={preset({ markerInserted: true, markerAngleDeg: 90, analyzerInserted: true, analyzerAngleDeg: 45, gated: false })}
            className="border border-line-strong px-1.5 py-1.5 text-left text-[0.58rem] leading-tight text-ink-2 hover:bg-paper"
          >
            <span className="block font-mono text-[0.54rem] uppercase tracking-[0.08em] text-brass">2 · erase</span>
            α = 45°, ungated
          </button>
          <button
            type="button"
            onClick={preset({ markerInserted: true, markerAngleDeg: 90, analyzerInserted: true, analyzerAngleDeg: 45, gated: true })}
            className="border border-line-strong px-1.5 py-1.5 text-left text-[0.58rem] leading-tight text-ink-2 hover:bg-paper"
          >
            <span className="block font-mono text-[0.54rem] uppercase tracking-[0.08em] text-petrol">3 · select</span>
            gating on
          </button>
        </div>
      </div>

      <Toggle
        label="Marker inserted (λ/2 in path b)"
        checked={config.markerInserted}
        onChange={(v) => patch({ markerInserted: v })}
        hint="Removing the marker is equivalent to θ = 0°: the paths are indistinguishable."
      />

      <Slider
        label="Marker polarization θ"
        value={config.markerAngleDeg}
        min={0}
        max={90}
        step={1}
        unit="°"
        onChange={(v) => patch({ markerAngleDeg: v })}
        format={(v) => `${v.toFixed(0)}°`}
        hint="Half-wave-plate axis = θ/2. θ = 90° gives orthogonal markers."
        disabled={!config.markerInserted}
      />

      <Toggle
        label="Analyser inserted"
        checked={config.analyzerInserted}
        onChange={(v) => patch({ analyzerInserted: v })}
        hint="A linear analyser projects both paths onto α. The orthogonal output is at α + 90°."
      />

      <Slider
        label="Analyser angle α"
        value={config.analyzerAngleDeg}
        min={0}
        max={180}
        step={1}
        unit="°"
        onChange={(v) => patch({ analyzerAngleDeg: v })}
        format={(v) => `${v.toFixed(0)}°`}
        hint="α = 0° transmits H; α = 90° transmits V."
        disabled={!config.analyzerInserted}
      />

      <Toggle
        label="Show coincidence-gated data"
        checked={config.gated}
        onChange={(v) => patch({ gated: v })}
        hint="Keeps the analyser-channel label. Off = sum both outputs; on = post-select one channel."
        disabled={!config.analyzerInserted}
      />

      <Slider
        label="Relative path phase φ"
        value={config.phaseRad}
        min={0}
        max={2 * Math.PI}
        step={0.01}
        onChange={(v) => patch({ phaseRad: v })}
        format={(v) => `${(v / Math.PI).toFixed(2)}π`}
        hint="Scans the fringe pattern. Visibility is independent of φ for a fixed setting."
      />

      <Slider
        label="Path intensity ratio I_B / I_A"
        value={config.intensityRatio}
        min={0.25}
        max={4}
        step={0.05}
        onChange={(v) => patch({ intensityRatio: v })}
        format={(v) => v.toFixed(2)}
        hint="1.00 is balanced. Imbalance reduces both V and D² + V²."
      />

      <Slider
        label="Detected photons (simulated)"
        value={photons}
        min={200}
        max={5000}
        step={100}
        onChange={setPhotons}
        format={(v) => v.toFixed(0)}
        hint="More photons reduce the shot noise on the measured visibility."
      />

      <div className="border-t border-line pt-3">
        <p className="label mb-1">Model status</p>
        <p className="text-[0.62rem] leading-relaxed text-muted">
          {state.channelResolved
            ? "Channel-resolved. Visibility is computed from the binned simulated counts."
            : "Unconditioned. Enable the analyser and gating to compute conditional visibility."}
        </p>
      </div>
    </div>
  );
}
