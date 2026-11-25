"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Scatter,
  ScatterChart,
  ZAxis,
  Legend
} from "recharts";
import type { ReactNode } from "react";

const INK = "#171713";
const MUTED = "#6E6A5E";
const LINE = "#D9D3C5";
const SERIES = ["#B23A1E", "#14524A", "#9A7527", "#3D4A55", "#7A4A6B"];

export interface Series {
  key: string;
  label: string;
  color?: string;
  dashed?: boolean;
  width?: number;
}

function LabTooltip({
  active,
  payload,
  label,
  xUnit,
  yUnit,
  digits = 3
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string }[];
  label?: number | string;
  xUnit?: string;
  yUnit?: string;
  digits?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="border border-line-strong bg-paper-2 px-2.5 py-2 shadow-sm">
      <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted">
        {typeof label === "number" ? label.toPrecision(digits) : label}
        {xUnit ? ` ${xUnit}` : ""}
      </p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 font-mono text-[0.65rem] text-ink">
          <span className="inline-block h-[2px] w-3" style={{ background: p.color }} />
          <span className="text-muted">{p.name}:</span>
          <span>
            {typeof p.value === "number" ? p.value.toPrecision(digits) : p.value}
            {yUnit ? ` ${yUnit}` : ""}
          </span>
        </p>
      ))}
    </div>
  );
}

/** Scientific line plot with editorial styling. Data must be computed, not decorative. */
export function LabLineChart({
  data,
  series,
  xKey = "x",
  xLabel,
  yLabel,
  height = 220,
  xUnit,
  yUnit,
  domain,
  yDomain,
  referenceX,
  referenceY,
  digits = 3,
  className = "",
  showLegend = false,
  connectNulls = false
}: {
  data: Record<string, number | string | null>[];
  series: Series[];
  xKey?: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  xUnit?: string;
  yUnit?: string;
  domain?: [number | "auto", number | "auto"];
  yDomain?: [number | "auto", number | "auto"];
  referenceX?: number;
  referenceY?: number;
  digits?: number;
  className?: string;
  showLegend?: boolean;
  connectNulls?: boolean;
}) {
  return (
    <div className={className} style={{ width: "100%" }}>
      {showLegend ? (
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
          {series.map((s, i) => (
            <span key={s.key} className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.06em] text-muted">
              <span className="inline-block h-[2px] w-4" style={{ background: s.color ?? SERIES[i % SERIES.length] }} />
              {s.label}
            </span>
          ))}
        </div>
      ) : null}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: xLabel ? 22 : 4, left: yLabel ? 4 : 0 }}>
          <CartesianGrid stroke={LINE} strokeDasharray="1 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            type="number"
            domain={domain ?? ["auto", "auto"]}
            tick={{ fill: MUTED, fontSize: 9, fontFamily: "var(--font-mono)" }}
            tickLine={{ stroke: LINE }}
            axisLine={{ stroke: LINE }}
            label={
              xLabel
                ? { value: xLabel, position: "insideBottom", offset: -14, fill: MUTED, fontSize: 9, fontFamily: "var(--font-mono)" }
                : undefined
            }
            tickFormatter={(v: number) => (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0) ? v.toExponential(1) : String(Number(v.toPrecision(3))))}
          />
          <YAxis
            domain={yDomain ?? ["auto", "auto"]}
            tick={{ fill: MUTED, fontSize: 9, fontFamily: "var(--font-mono)" }}
            tickLine={{ stroke: LINE }}
            axisLine={{ stroke: LINE }}
            width={44}
            label={
              yLabel
                ? { value: yLabel, angle: -90, position: "insideLeft", offset: 12, fill: MUTED, fontSize: 9, fontFamily: "var(--font-mono)" }
                : undefined
            }
            tickFormatter={(v: number) => (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0) ? v.toExponential(1) : String(Number(v.toPrecision(3))))}
          />
          <Tooltip content={<LabTooltip xUnit={xUnit} yUnit={yUnit} digits={digits} />} cursor={{ stroke: LINE }} />
          {referenceX !== undefined ? <ReferenceLine x={referenceX} stroke={MUTED} strokeDasharray="3 3" /> : null}
          {referenceY !== undefined ? <ReferenceLine y={referenceY} stroke={MUTED} strokeDasharray="3 3" /> : null}
          {series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color ?? SERIES[i % SERIES.length]}
              strokeWidth={s.width ?? 1.4}
              strokeDasharray={s.dashed ? "4 3" : undefined}
              dot={false}
              isAnimationActive={false}
              connectNulls={connectNulls}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LabBarChart({
  data,
  xKey = "x",
  yKey = "y",
  height = 200,
  xLabel,
  yLabel,
  color = "#B23A1E",
  className = ""
}: {
  data: Record<string, number | string>[];
  xKey?: string;
  yKey?: string;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  color?: string;
  className?: string;
}) {
  return (
    <div className={className} style={{ width: "100%" }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 6, right: 8, bottom: xLabel ? 20 : 4, left: 0 }}>
          <CartesianGrid stroke={LINE} strokeDasharray="1 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fill: MUTED, fontSize: 9, fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: LINE }}
            tickLine={{ stroke: LINE }}
            label={xLabel ? { value: xLabel, position: "insideBottom", offset: -12, fill: MUTED, fontSize: 9 } : undefined}
          />
          <YAxis tick={{ fill: MUTED, fontSize: 9, fontFamily: "var(--font-mono)" }} axisLine={{ stroke: LINE }} tickLine={{ stroke: LINE }} width={38} />
          <Tooltip content={<LabTooltip />} cursor={{ fill: "rgba(217,211,197,0.3)" }} />
          <Bar dataKey={yKey} fill={color} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LabScatter({
  data,
  xKey = "x",
  yKey = "y",
  height = 220,
  xLabel,
  yLabel,
  className = "",
  fit,
  fitLabel
}: {
  data: Record<string, number>[];
  xKey?: string;
  yKey?: string;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  className?: string;
  fit?: { intercept: number; slope: number };
  fitLabel?: string;
}) {
  const fitData =
    fit && data.length > 0
      ? [
          { x: Math.min(...data.map((d) => d[xKey] ?? 0)), y: 0 },
          { x: Math.max(...data.map((d) => d[xKey] ?? 0)), y: 0 }
        ].map((p) => ({ x: p.x, y: fit.intercept + fit.slope * p.x }))
      : undefined;
  return (
    <div className={className} style={{ width: "100%" }}>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 8, right: 12, bottom: xLabel ? 22 : 4, left: 0 }}>
          <CartesianGrid stroke={LINE} strokeDasharray="1 3" />
          <XAxis
            dataKey={xKey}
            type="number"
            tick={{ fill: MUTED, fontSize: 9, fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: LINE }}
            tickLine={{ stroke: LINE }}
            label={xLabel ? { value: xLabel, position: "insideBottom", offset: -14, fill: MUTED, fontSize: 9 } : undefined}
          />
          <YAxis
            dataKey={yKey}
            type="number"
            tick={{ fill: MUTED, fontSize: 9, fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: LINE }}
            tickLine={{ stroke: LINE }}
            width={44}
            label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", offset: 10, fill: MUTED, fontSize: 9 } : undefined}
          />
          <ZAxis range={[22, 22]} />
          <Tooltip content={<LabTooltip />} />
          <Scatter data={data} fill="#14524A" isAnimationActive={false} />
          {fitData ? (
            <Scatter data={fitData} fill="transparent" line={{ stroke: "#B23A1E", strokeWidth: 1.2 }} isAnimationActive={false} name={fitLabel ?? "Fit"} />
          ) : null}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
