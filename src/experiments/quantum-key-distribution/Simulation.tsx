"use client";

import { useMemo, useState, type ReactNode } from "react";
import { SimulatorShell, type Readout } from "@/components/sim/SimulatorShell";
import { Slider, Toggle } from "@/components/ui/Controls";
import { Badge } from "@/components/ui/primitives";
import { LabBarChart, LabLineChart } from "@/components/viz/Plot";
import type { PhotonState, QkdResult } from "@/lib/physics/qkd";
import { content } from "./content";
import {
  DEFAULT_SECURITY_MARGIN,
  MAX_PHOTONS,
  MIN_PHOTONS,
  PROTOCOL_STAGES,
  QBER_PLOT_MAX,
  SECURITY_THRESHOLD,
  STAGE_COUNT,
  eveKnowledge,
  expectedDetected,
  expectedQberTotal,
  expectedSifted,
  formatPercent,
  keyRatePerPhoton,
  runBb84,
  securityVerdict,
  stageInfo,
  teachingCompressionFraction,
  type SecurityVerdict
} from "./physics";

/* -------------------------------------------------------------------------- */
/* Parameters                                                                 */
/* -------------------------------------------------------------------------- */

interface RunParams {
  photons: number;
  eveProbability: number;
  detectionEfficiency: number;
  intrinsicErrorRate: number;
  errorCorrection: boolean;
  seed: string;
}

const DEFAULT_PARAMS: RunParams = {
  photons: 512,
  eveProbability: 0,
  detectionEfficiency: 0.9,
  intrinsicErrorRate: 0.01,
  errorCorrection: true,
  seed: "bb84-2026-3"
};

const GUIDED_EVE = [0, 0.5, 1] as const;
const GUIDED_PHOTONS = 256;
const TABLE_CAP = 1024;

const fmtInt = (value: number): string => Math.round(value).toLocaleString("en-US");

/* -------------------------------------------------------------------------- */
/* Small visual atoms                                                         */
/* -------------------------------------------------------------------------- */

function StateGlyph({
  state,
  size = 16,
  tone = "auto",
  muted = false
}: {
  state: PhotonState;
  size?: number;
  tone?: "auto" | "muted" | "vermilion" | "petrol";
  muted?: boolean;
}) {
  const color =
    muted || tone === "muted"
      ? "#BFB8A7"
      : tone === "vermilion"
        ? "#B23A1E"
        : tone === "petrol"
          ? "#14524A"
          : state === "H" || state === "V"
            ? "#171713"
            : "#14524A";
  const angle = state === "H" ? 0 : state === "V" ? 90 : state === "D" ? 45 : 135;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden focusable="false" className="shrink-0">
      <circle cx={10} cy={10} r={8.2} fill="none" stroke="#D9D3C5" strokeWidth={0.7} />
      <line
        x1={3.2}
        y1={10}
        x2={16.8}
        y2={10}
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        transform={`rotate(${angle} 10 10)`}
      />
    </svg>
  );
}

function BasisTag({ basis, muted = false }: { basis: 0 | 1; muted?: boolean }) {
  return (
    <span
      className={`inline-flex h-[15px] min-w-[15px] items-center justify-center border px-[3px] font-mono text-[0.52rem] leading-none ${
        muted ? "border-line text-muted/60" : "border-line-strong text-ink-2"
      }`}
      title={basis === 0 ? "Rectilinear (Z) basis: H/V" : "Diagonal (X) basis: D/A"}
    >
      {basis === 0 ? "Z" : "X"}
    </span>
  );
}

function MiniStat({ label, value, note, warn = false }: { label: string; value: string; note?: string; warn?: boolean }) {
  return (
    <div>
      <p className="label text-[0.55rem]">{label}</p>
      <p className={`num mt-0.5 text-[0.82rem] leading-tight ${warn ? "text-vermilion" : "text-ink"}`}>{value}</p>
      {note ? <p className="mt-0.5 text-[0.56rem] leading-tight text-muted">{note}</p> : null}
    </div>
  );
}

function PanelTitle({ label, right }: { label: string; right?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-2">
      <p className="label">{label}</p>
      {right ? <span className="font-mono text-[0.55rem] uppercase tracking-wide text-muted">{right}</span> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stage stepper                                                              */
/* -------------------------------------------------------------------------- */

function StageStepper({ stage, onStage }: { stage: number; onStage: (stage: number) => void }) {
  const info = stageInfo(stage);
  return (
    <section className="border border-line bg-paper-2" aria-label="Protocol stage">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
        <p className="label">
          Stage {String(Math.min(stage + 1, STAGE_COUNT)).padStart(2, "0")} / {String(STAGE_COUNT).padStart(2, "0")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onStage(Math.max(0, stage - 1))}
            disabled={stage === 0}
          >
            Back
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onStage(Math.min(STAGE_COUNT - 1, stage + 1))}
            disabled={stage >= STAGE_COUNT - 1}
          >
            Next
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onStage(0)}>
            Walkthrough
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 border-b border-line sm:grid-cols-8">
        {PROTOCOL_STAGES.map((s, i) => {
          const active = i === stage;
          const reached = i <= stage;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onStage(i)}
              aria-current={active ? "step" : undefined}
              title={s.description}
              className={`border-b border-r border-line px-1 py-1.5 text-center transition-colors last:border-r-0 ${
                active
                  ? "bg-ink text-paper-2"
                  : reached
                    ? "bg-paper text-ink hover:bg-paper-3"
                    : "bg-paper-2 text-muted/60 hover:bg-paper-3"
              }`}
            >
              <span className="block font-mono text-[0.52rem] leading-none">{String(i + 1).padStart(2, "0")}</span>
              <span className="mt-1 block text-[0.58rem] uppercase leading-none tracking-[0.06em]">{s.short}</span>
            </button>
          );
        })}
      </div>
      <p className="px-3 py-2 text-[0.71rem] leading-relaxed text-ink-2">
        <span className="font-mono text-[0.6rem] uppercase tracking-wide text-ink">{info.label}</span>
        {" — "}
        {info.description}
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Participant cards                                                          */
/* -------------------------------------------------------------------------- */

function ParticipantCard({
  title,
  role,
  accent,
  visible,
  lockedLabel,
  children
}: {
  title: string;
  role: string;
  accent: "ink" | "vermilion" | "petrol";
  visible: boolean;
  lockedLabel: string;
  children: ReactNode;
}) {
  const dot = accent === "vermilion" ? "bg-vermilion" : accent === "petrol" ? "bg-petrol" : "bg-ink";
  return (
    <section
      className={`flex min-w-0 flex-col border p-2.5 ${
        accent === "vermilion" ? "border-vermilion/30 bg-vermilion-soft/25" : "border-line bg-paper"
      }`}
      aria-label={`${title} record`}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`h-[5px] w-[5px] ${dot}`} aria-hidden />
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink">{title}</p>
        </div>
        <span className="font-mono text-[0.52rem] uppercase tracking-wide text-muted">{role}</span>
      </div>
      {visible ? (
        children
      ) : (
        <div className="flex min-h-[74px] items-center justify-center border border-dashed border-line-strong px-2 py-3 text-center">
          <p className="text-[0.6rem] leading-snug text-muted">{lockedLabel}</p>
        </div>
      )}
    </section>
  );
}

function AliceCard({ result, stage }: { result: QkdResult; stage: number }) {
  const records = result.records.slice(0, 12);
  return (
    <ParticipantCard
      title="Alice"
      role="sender"
      accent="ink"
      visible={stage >= 0}
      lockedLabel="Alice's record appears at preparation."
    >
      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
        <MiniStat label="Bits drawn" value={fmtInt(result.options.photons)} />
        <MiniStat label="States sent" value={`${result.options.photons} qubits`} note="one qubit per event" />
      </div>
      <p className="mt-2 text-[0.56rem] leading-snug text-muted">First 12: bit · state · basis (private)</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {records.map((r) => (
          <span
            key={r.index}
            className="inline-flex items-center gap-0.5 border border-line bg-paper-2 px-1 py-[1px]"
            title={`Photon ${r.index + 1}: bit ${r.aliceBit}, ${r.sentState}, ${r.aliceBasis === 0 ? "Z" : "X"} basis`}
          >
            <StateGlyph state={r.sentState} size={12} />
            <span className="font-mono text-[0.54rem] leading-none">{r.aliceBit}</span>
            <span className="font-mono text-[0.48rem] leading-none text-muted">{r.aliceBasis === 0 ? "Z" : "X"}</span>
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-[0.56rem] leading-snug text-muted">
        Bits stay private. Bases are announced only after Bob has measured.
      </p>
    </ParticipantCard>
  );
}

function BobCard({ result, stage }: { result: QkdResult; stage: number }) {
  const detected = result.records.filter((r) => r.detected && r.bobBit !== null);
  const sifted = stage >= 3 ? result.stages.sifted : null;
  const errors = stage >= 4 ? result.stages.siftedErrors : null;
  return (
    <ParticipantCard
      title="Bob"
      role="receiver"
      accent="petrol"
      visible={stage >= 1}
      lockedLabel="Bob's bases and results appear after transmission and measurement."
    >
      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
        <MiniStat label="Clicks" value={fmtInt(result.stages.detected)} note={`η = ${formatPercent(result.options.detectionEfficiency, 0)}`} />
        <MiniStat
          label="Basis match"
          value={sifted === null ? "unknown" : fmtInt(sifted)}
          note={sifted === null ? "announced at sifting" : "sifted bits"}
        />
        <MiniStat
          label="Errors"
          value={errors === null ? "unknown" : fmtInt(errors)}
          note={errors === null ? "known after QBER step" : "in sifted key"}
          warn={errors !== null && errors > 0}
        />
        <MiniStat label="Detected" value={fmtInt(result.stages.detected)} note="of photons sent" />
      </div>
      <p className="mt-2 text-[0.56rem] leading-snug text-muted">First 12 clicks: state · bit</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {detected.slice(0, 12).map((r) => {
          const bit = r.bobBit ?? 0;
          const isSifted = r.aliceBasis === r.bobBasis;
          const isError = stage >= 4 && isSifted && r.aliceBit !== bit;
          return (
            <span
              key={r.index}
              className={`inline-flex items-center gap-0.5 border px-1 py-[1px] ${
                isError ? "border-vermilion bg-vermilion-soft/70" : "border-line bg-paper-2"
              }`}
              title={`Photon ${r.index + 1}: Bob measured ${bit} in ${r.bobBasis === 0 ? "Z" : "X"} basis${isSifted ? " (sifted)" : ""}`}
            >
              <StateGlyph state={stateFromBit(bit, r.bobBasis)} size={12} tone={isError ? "vermilion" : "auto"} />
              <span className={`font-mono text-[0.54rem] leading-none ${isError ? "text-vermilion" : ""}`}>{bit}</span>
            </span>
          );
        })}
      </div>
      <p className="mt-1.5 text-[0.56rem] leading-snug text-muted">
        Results are private to Bob; bases become public at sifting. Vermilion marks a sifted error.
      </p>
    </ParticipantCard>
  );
}

function EveCard({ result, knowledge, stage }: { result: QkdResult; knowledge: ReturnType<typeof eveKnowledge>; stage: number }) {
  const intercepted = result.records.filter((r) => r.eveIntercepted);
  const active = result.options.eveProbability > 0;
  return (
    <ParticipantCard
      title="Eve"
      role="simulator only"
      accent="vermilion"
      visible={stage >= 2}
      lockedLabel="The eavesdropper record is revealed at the interception stage."
    >
      {active ? (
        <>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
            <MiniStat label="Intercepted" value={fmtInt(knowledge.intercepted)} note={`p = ${formatPercent(result.options.eveProbability, 0)}`} warn />
            <MiniStat label="Basis matches" value={fmtInt(knowledge.basisMatches)} note="Alice's basis" />
            <MiniStat
              label="Sifted bits known"
              value={stage >= 3 ? `${fmtInt(knowledge.knownSiftedBits)} / ${fmtInt(knowledge.siftedBits)}` : "sealed"}
              note={stage >= 3 ? formatPercent(knowledge.knownFraction, 1) : "revealed after sifting"}
              warn
            />
            <MiniStat label="Intercepts in sifted" value={stage >= 3 ? fmtInt(knowledge.siftedIntercepted) : "sealed"} warn />
          </div>
          <p className="mt-2 text-[0.56rem] leading-snug text-muted">First 10 intercepted: her state · bit</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {intercepted.slice(0, 10).map((r) => {
              if (r.eveBasis === undefined || r.eveBit === undefined || r.eveState === undefined) return null;
              return (
                <span
                  key={r.index}
                  className="inline-flex items-center gap-0.5 border border-vermilion/40 bg-paper-2 px-1 py-[1px]"
                  title={`Eve measured photon ${r.index + 1} in ${r.eveBasis === 0 ? "Z" : "X"} basis and resent ${r.eveState}`}
                >
                  <StateGlyph state={r.eveState} size={12} tone="vermilion" />
                  <span className="font-mono text-[0.54rem] leading-none text-vermilion">{r.eveBit}</span>
                  <span className="font-mono text-[0.48rem] leading-none text-muted">{r.eveBasis === 0 ? "Z" : "X"}</span>
                </span>
              );
            })}
          </div>
          <p className="mt-1.5 text-[0.58rem] leading-snug text-vermilion">
            Simulator-only record. Alice and Bob never see these bases or bits; they only see the QBER.
          </p>
        </>
      ) : (
        <div className="flex min-h-[74px] items-center justify-center border border-dashed border-line-strong px-2 py-3">
          <p className="text-center text-[0.62rem] leading-snug text-muted">
            Eve is inactive in this run (p = 0). The channel is ideal apart from the detector model.
          </p>
        </div>
      )}
    </ParticipantCard>
  );
}

/** Recompute the state Bob would have resent/holds for the glyph. */
function stateFromBit(bit: 0 | 1, basis: 0 | 1): PhotonState {
  if (basis === 0) return bit === 0 ? "H" : "V";
  return bit === 0 ? "D" : "A";
}

/* -------------------------------------------------------------------------- */
/* Photon table                                                               */
/* -------------------------------------------------------------------------- */

function PhotonTable({
  result,
  stage,
  visibleRows,
  onShowMore
}: {
  result: QkdResult;
  stage: number;
  visibleRows: number;
  onShowMore: () => void;
}) {
  const showBob = stage >= 1;
  const showSifted = stage >= 3;
  const showError = stage >= 4;
  const rows = result.records.slice(0, Math.min(visibleRows, TABLE_CAP, result.records.length));
  const canShowMore = rows.length < Math.min(TABLE_CAP, result.records.length);

  return (
    <section className="border border-line bg-paper-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-3 py-2">
        <PanelTitle label="Photon-by-photon record" right={`first ${fmtInt(rows.length)} of ${fmtInt(result.options.photons)}`} />
        <p className="text-[0.56rem] text-muted">Bases are announced at sifting; errors are compared at the QBER stage.</p>
      </div>
      <div className="max-h-[360px] overflow-auto">
        <table className="w-full min-w-[560px] border-collapse text-[0.7rem]">
          <thead className="sticky top-0 z-10 bg-paper-2">
            <tr className="border-b border-ink">
              <th className="px-2 py-1.5 text-left font-mono text-[0.55rem] font-medium uppercase tracking-[0.08em] text-muted">#</th>
              <th className="px-2 py-1.5 text-left font-mono text-[0.55rem] font-medium uppercase tracking-[0.08em] text-muted">Alice bit</th>
              <th className="px-2 py-1.5 text-left font-mono text-[0.55rem] font-medium uppercase tracking-[0.08em] text-muted">Basis</th>
              <th className="px-2 py-1.5 text-left font-mono text-[0.55rem] font-medium uppercase tracking-[0.08em] text-muted">State</th>
              {showBob ? (
                <>
                  <th className="px-2 py-1.5 text-left font-mono text-[0.55rem] font-medium uppercase tracking-[0.08em] text-muted">Bob basis</th>
                  <th className="px-2 py-1.5 text-left font-mono text-[0.55rem] font-medium uppercase tracking-[0.08em] text-muted">Bob bit</th>
                </>
              ) : null}
              {showSifted ? (
                <th className="px-2 py-1.5 text-left font-mono text-[0.55rem] font-medium uppercase tracking-[0.08em] text-muted">Sifted</th>
              ) : null}
              {showError ? (
                <th className="px-2 py-1.5 text-left font-mono text-[0.55rem] font-medium uppercase tracking-[0.08em] text-muted">Error</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const sifted = r.detected && r.bobBit !== null && r.aliceBasis === r.bobBasis;
              const error = showError && sifted && r.aliceBit !== r.bobBit;
              return (
                <tr
                  key={r.index}
                  className={
                    error
                      ? "border-b border-line bg-vermilion-soft/50"
                      : showSifted && sifted
                        ? "border-b border-line bg-petrol-soft/40"
                        : "border-b border-line"
                  }
                >
                  <td className="px-2 py-1 font-mono text-[0.6rem] tabular-nums text-muted">{r.index + 1}</td>
                  <td className="px-2 py-1 font-mono text-[0.66rem] tabular-nums text-ink">{r.aliceBit}</td>
                  <td className="px-2 py-1">
                    <BasisTag basis={r.aliceBasis} />
                  </td>
                  <td className="px-2 py-1">
                    <span className="inline-flex items-center gap-1">
                      <StateGlyph state={r.sentState} size={13} />
                      <span className="font-mono text-[0.62rem] text-ink-2">{r.sentState}</span>
                    </span>
                  </td>
                  {showBob ? (
                    <>
                      <td className="px-2 py-1">
                        <BasisTag basis={r.bobBasis} />
                      </td>
                      <td className={`px-2 py-1 font-mono text-[0.66rem] tabular-nums ${r.detected ? "text-ink" : "text-muted"}`}>
                        {r.detected && r.bobBit !== null ? r.bobBit : "—"}
                      </td>
                    </>
                  ) : null}
                  {showSifted ? (
                    <td className="px-2 py-1 font-mono text-[0.58rem] uppercase tracking-wide">
                      {r.detected && r.bobBit !== null ? (sifted ? <span className="text-petrol">kept</span> : <span className="text-muted">drop</span>) : <span className="text-muted">no click</span>}
                    </td>
                  ) : null}
                  {showError ? (
                    <td className="px-2 py-1 font-mono text-[0.58rem] uppercase tracking-wide">
                      {sifted ? error ? <span className="text-vermilion">flip</span> : <span className="text-muted">ok</span> : "—"}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2">
        <p className="text-[0.58rem] text-muted">
          Table capped at {fmtInt(TABLE_CAP)} rows; the simulation and every key use all {fmtInt(result.options.photons)} photons.
        </p>
        {canShowMore ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onShowMore}>
            Show more rows
          </button>
        ) : null}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Charts                                                                     */
/* -------------------------------------------------------------------------- */

function QberCharts({ result }: { result: QkdResult }) {
  const lineData = result.qberCurve.map((p) => ({ n: p.n, qber: p.qber }));
  const expected = expectedQberTotal(result.options.eveProbability, result.options.intrinsicErrorRate);
  const barData = [
    { x: "Measured", qber: Number(result.qber.toFixed(4)) },
    { x: "Expected", qber: Number(expected.toFixed(4)) },
    { x: "Threshold", qber: SECURITY_THRESHOLD }
  ];
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <section className="border border-line bg-paper-2 p-3">
        <PanelTitle label="Cumulative QBER" right={`${fmtInt(result.stages.sifted)} sifted bits`} />
        <LabLineChart
          data={lineData}
          series={[{ key: "qber", label: "Cumulative QBER", color: "#B23A1E", width: 1.6 }]}
          xKey="n"
          xLabel="sifted bits"
          yLabel="QBER"
          xUnit=""
          yUnit=""
          yDomain={[0, QBER_PLOT_MAX]}
          referenceY={SECURITY_THRESHOLD}
          height={205}
          digits={3}
        />
        <p className="mt-1 text-[0.58rem] leading-snug text-muted">
          Dashed line: 11% asymptotic threshold. The curve is cumulative, so it starts noisy and settles toward the run's error rate.
        </p>
      </section>
      <section className="border border-line bg-paper-2 p-3">
        <PanelTitle label="Measured vs expected" right={`p = ${formatPercent(result.options.eveProbability, 0)}`} />
        <LabBarChart data={barData} xKey="x" yKey="qber" height={205} yLabel="QBER" color="#14524A" />
        <p className="mt-1 text-[0.58rem] leading-snug text-muted">
          Expected QBER = 0.25p + e − 0.5pe, with e the intrinsic flip probability. The threshold bar is the 11% abort line.
        </p>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Post-processing panels                                                     */
/* -------------------------------------------------------------------------- */

function CorrectionPanel({ result }: { result: QkdResult }) {
  const c = result.correction;
  return (
    <section className="border border-line bg-paper-2 p-3">
      <PanelTitle
        label="Reconciliation · Hamming(7,4) demonstration"
        right={c.applied ? "correction on" : "correction off"}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniStat label="Blocks" value={fmtInt(c.blocks)} note={`${c.blockSize || "—"}-bit code`} />
        <MiniStat label="Corrected" value={fmtInt(c.correctedBits)} note="single-bit fixes" />
        <MiniStat label="Residual" value={fmtInt(c.residualErrors)} note="after correction" warn={c.residualErrors > 0} />
        <MiniStat label="Parity leaked" value={fmtInt(c.leakedParityBits)} note="public information" warn />
      </div>
      <p className="mt-2 text-[0.62rem] leading-relaxed text-muted">
        Hamming(7,4) has code rate 4/7, but reconciliation reveals three parity bits per four data bits. Those leaked bits must be
        subtracted before privacy amplification. {c.applied ? (c.residualErrors === 0 ? "This run leaves no residual errors, so the final keys can match." : "At least one block was uncorrectable; the final keys may not match.") : "Correction is disabled, so sifted errors propagate into the hash."}
      </p>
    </section>
  );
}

function AmplificationPanel({ result }: { result: QkdResult }) {
  const qberPass = result.qber < SECURITY_THRESHOLD;
  const asym = qberPass ? result.privacy.outputBits : 0;
  const teach = teachingCompressionFraction(result.qber);
  return (
    <section className="border border-line bg-paper-2 p-3">
      <PanelTitle label="Privacy amplification · teaching hash" right={`margin ${fmtInt(result.options.securityMargin)} bits`} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniStat label="Input" value={`${fmtInt(result.privacy.inputBits)} bits`} note="after correction" />
        <MiniStat label="Output" value={`${fmtInt(asym)} bits`} note={qberPass ? "final key material" : "discarded at QBER check"} warn={!qberPass} />
        <MiniStat label="Compression" value={qberPass ? formatPercent(result.privacy.compression, 1) : "0.0%"} note="output / input" />
        <MiniStat
          label="Key rate"
          value={qberPass ? `${(keyRatePerPhoton(result) * 1000).toFixed(2)}` : "0.00"}
          note="bits per 1000 photons"
        />
      </div>
      <p className="mt-2 text-[0.62rem] leading-relaxed text-muted">
        The shared model compresses by 1 − h₂(Q) (here {(teach * 100).toFixed(1)}%) and then subtracts the margin. The ideal
        asymptotic BB84 bound is 1 − 2h₂(Q); it is more compressive and is shown in the theory. Because 1 − h₂(Q) leaves more bits
        than the security bound allows, the teaching output is not cryptographically secure. This XOR construction is for illustration only: it is not a
        universal₂ hash and it has no security proof.
        {!qberPass ? " Because the QBER check failed, no key material is issued even though the teaching hash can still be computed." : ""}
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Final keys and verdict                                                     */
/* -------------------------------------------------------------------------- */

function KeyBlock({
  label,
  bits,
  matched,
  showMatch
}: {
  label: string;
  bits: string;
  matched: boolean;
  showMatch: boolean;
}) {
  const shown = bits.slice(0, 192);
  const groups = shown.replace(/(.{8})/g, "$1 ");
  const hasKey = bits.length > 0;
  return (
    <div className="min-w-0 border border-line bg-paper p-2.5">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-ink">{label}</p>
        <Badge tone={!showMatch ? "neutral" : hasKey ? (matched ? "petrol" : "vermilion") : "neutral"}>
          {!showMatch ? "unverified" : hasKey ? (matched ? "match" : "mismatch") : "empty"}
        </Badge>
      </div>
      <p className="mb-1 font-mono text-[0.55rem] uppercase tracking-wide text-muted">
        {hasKey ? `${fmtInt(bits.length)} bits` : "no key"}
      </p>
      <p className="break-all font-mono text-[0.6rem] leading-relaxed text-ink-2">
        {hasKey ? groups : "The run produced no key bits."}
        {bits.length > 192 ? <span className="text-muted"> …</span> : null}
      </p>
    </div>
  );
}

function FinalKeyPanel({ result, stage }: { result: QkdResult; stage: number }) {
  const verified = stage >= 7;
  const qberPass = result.qber < SECURITY_THRESHOLD;
  const issued = qberPass && result.privacy.outputBits > 0;
  return (
    <section className="border border-line bg-paper-2 p-3">
      <PanelTitle
        label="Final keys"
        right={
          !qberPass
            ? "discarded at QBER check"
            : !issued
              ? "no key after amplification"
              : verified
                ? result.privacy.matches
                  ? "verified match"
                  : "verification failed"
                : "not yet compared"
        }
      />
      {issued ? (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <KeyBlock label="Alice key" bits={result.privacy.keyAlice} matched={result.privacy.matches} showMatch={verified} />
            <KeyBlock label="Bob key" bits={result.privacy.keyBob} matched={result.privacy.matches} showMatch={verified} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MiniStat label="Input" value={`${fmtInt(result.privacy.inputBits)} bits`} />
            <MiniStat label="Output" value={`${fmtInt(result.privacy.outputBits)} bits`} />
            <MiniStat label="Compression" value={formatPercent(result.privacy.compression, 1)} />
            <MiniStat
              label="Key rate"
              value={`${(result.options.photons > 0 ? (result.privacy.outputBits / result.options.photons) * 100 : 0).toFixed(2)}`}
              note="bits per 100 photons"
            />
          </div>
        </>
      ) : (
        <div className="border border-vermilion/40 bg-vermilion-soft/30 px-3 py-3">
          <p className="text-[0.72rem] font-medium text-vermilion">No key is issued.</p>
          <p className="mt-1 text-[0.62rem] leading-relaxed text-ink-2">
            {!qberPass
              ? `The measured QBER is ${formatPercent(result.qber)}, at or above the ${formatPercent(SECURITY_THRESHOLD, 0)} threshold. Alice and Bob discard every sifted bit; privacy amplification is not applied to a key that the protocol has already rejected.`
              : `Only ${fmtInt(result.stages.sifted)} sifted bits were available. After reconciliation and the ${fmtInt(result.options.securityMargin)}-bit margin, no key bits remain. Collect more photons or reduce the loss.`}
          </p>
        </div>
      )}
      <p className="mt-2 text-[0.62rem] leading-relaxed text-muted">
        In a real protocol the keys would be compared through a keyed authentication tag, not printed in full over a public channel.
        {issued && !verified ? " Advance to the final stage to record the comparison and the accept/abort decision." : ""}
      </p>
    </section>
  );
}

function VerdictPanel({ verdict, qber, sifted, finalBits }: { verdict: SecurityVerdict; qber: number; sifted: number; finalBits: number }) {
  const border =
    verdict.severity === "compromised"
      ? "border-vermilion"
      : verdict.severity === "warning"
        ? "border-brass"
        : "border-petrol";
  const text =
    verdict.severity === "compromised" ? "text-vermilion" : verdict.severity === "warning" ? "text-brass" : "text-petrol";
  return (
    <section className={`border-l-4 ${border} border-y border-r border-line bg-paper-2 p-3`} aria-live="polite">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className={`font-mono text-[0.68rem] uppercase tracking-[0.1em] ${text}`}>Simulated verdict</p>
        <span className="font-mono text-[0.55rem] uppercase tracking-wide text-muted">conditional, not a security proof</span>
      </div>
      <p className={`mt-1 font-display text-[1.15rem] leading-tight ${text}`}>{verdict.headline}</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <MiniStat label="QBER" value={formatPercent(qber)} warn={qber >= SECURITY_THRESHOLD} />
        <MiniStat label="Sifted" value={`${fmtInt(sifted)} bits`} />
        <MiniStat label="Final key" value={`${fmtInt(finalBits)} bits`} warn={finalBits === 0} />
      </div>
      <ul className="mt-2.5 space-y-1">
        {verdict.reasons.map((reason, i) => (
          <li key={i} className="flex gap-1.5 text-[0.66rem] leading-relaxed text-ink-2">
            <span className={`mt-[3px] h-[4px] w-[4px] shrink-0 ${verdict.decision === "accept" ? "bg-petrol" : "bg-vermilion"}`} aria-hidden />
            {reason}
          </li>
        ))}
      </ul>
    </section>
  );
}

function FlowNode({
  step,
  title,
  detail,
  active,
  tone = "neutral"
}: {
  step: string;
  title: string;
  detail: string;
  active: boolean;
  tone?: "neutral" | "ok" | "warn";
}) {
  const border = !active ? "border-line/70" : tone === "ok" ? "border-petrol" : tone === "warn" ? "border-vermilion" : "border-line-strong";
  const bg = !active ? "bg-paper/40" : tone === "ok" ? "bg-petrol-soft/40" : tone === "warn" ? "bg-vermilion-soft/40" : "bg-paper";
  return (
    <div className={`border ${border} ${bg} px-2.5 py-2 ${active ? "" : "opacity-45"}`}>
      <p className="font-mono text-[0.52rem] uppercase tracking-[0.08em] text-muted">Step {step}</p>
      <p className="mt-0.5 text-[0.72rem] font-medium leading-snug text-ink">{title}</p>
      <p className="mt-0.5 text-[0.6rem] leading-snug text-ink-2">{detail}</p>
    </div>
  );
}

function FlowArrow({ label, outcome }: { label: string; outcome: "yes" | "no" }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="h-3 w-px bg-line-strong" aria-hidden />
      <span className="font-mono text-[0.55rem] uppercase tracking-wide text-muted">{label}</span>
      <span
        className={`border px-1 py-[1px] font-mono text-[0.52rem] uppercase leading-none ${
          outcome === "yes" ? "border-petrol/50 text-petrol" : "border-vermilion/50 text-vermilion"
        }`}
      >
        {outcome}
      </span>
    </div>
  );
}

function DecisionFlow({ result, verdict }: { result: QkdResult; verdict: SecurityVerdict }) {
  const qPass = result.qber < SECURITY_THRESHOLD;
  const keyPass = result.privacy.outputBits > 0 && result.privacy.matches;
  return (
    <section className="border border-line bg-paper-2 p-3">
      <PanelTitle label="Decision flow · accept or abort" right="public information only" />
      <div className="space-y-1.5">
        <FlowNode
          step="1"
          title="Estimate QBER on the sifted key"
          detail={`Q = ${formatPercent(result.qber)} on ${fmtInt(result.stages.sifted)} bits (expected ${formatPercent(expectedQberTotal(result.options.eveProbability, result.options.intrinsicErrorRate))}).`}
          active
        />
        <FlowArrow label={`Q ≤ ${formatPercent(SECURITY_THRESHOLD, 0)}?`} outcome={qPass ? "yes" : "no"} />
        <div className="grid gap-1.5 sm:grid-cols-2">
          <FlowNode
            step="2a"
            title="Continue to reconciliation and amplification"
            detail="Correct errors, subtract parity leakage, compress with privacy amplification."
            active={qPass}
          />
          <FlowNode
            step="2b"
            title="Abort and discard the key"
            detail="Investigate misalignment, detectors or an active eavesdropper. Do not use these bits."
            active={!qPass}
            tone="warn"
          />
        </div>
        {qPass ? (
          <>
            <FlowArrow label="final key bits > 0 and both keys match?" outcome={keyPass ? "yes" : "no"} />
            <div className="grid gap-1.5 sm:grid-cols-2">
              <FlowNode
                step="3a"
                title="Accept key material"
                detail={`${fmtInt(result.privacy.outputBits)} bits are available for a one-time pad, subject to the stated assumptions.`}
                active={keyPass}
                tone="ok"
              />
              <FlowNode
                step="3b"
                title="Abort"
                detail="No usable key survives correction and amplification. Collect more photons or fix the channel."
                active={!keyPass}
                tone="warn"
              />
            </div>
          </>
        ) : null}
      </div>
      <p className="mt-2 border-t border-line pt-2 text-[0.6rem] leading-relaxed text-muted">
        Outcome: <span className="text-ink">{verdict.headline}</span>. The flow uses the measured QBER, the final key length and the key
        comparison. Authentication and device trust sit outside the diagram but are required for the result to mean anything.
      </p>
    </section>
  );
}

function CapabilityPanel() {
  return (
    <section className="border border-line bg-paper-2 p-3">
      <PanelTitle label="What this key can and cannot do" right="scope statement" />
      <p className="border-l-2 border-brass bg-brass-soft/30 px-2.5 py-2 text-[0.72rem] leading-relaxed text-ink-2">
        This key could encrypt a message with a one-time pad; it does not send the message. Without authentication, Eve could
        impersonate Bob.
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <p className="label mb-1 text-petrol">The key can</p>
          <ul className="space-y-1">
            {[
              "Provide confidentiality if used as a one-time pad of sufficient length.",
              "Be combined with a message authentication code to protect message integrity.",
              "Be refreshed by a new protocol run rather than reused indefinitely."
            ].map((t) => (
              <li key={t} className="flex gap-1.5 text-[0.64rem] leading-snug text-ink-2">
                <span className="mt-[3px] h-[4px] w-[4px] shrink-0 bg-petrol" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label mb-1 text-vermilion">The key cannot</p>
          <ul className="space-y-1">
            {[
              "Transmit or encrypt the message by itself.",
              "Authenticate Alice and Bob without a separate authentication secret.",
              "Prove that the devices are free of side channels or blinding attacks.",
              "Recover from key reuse, a weak random-number generator or a compromised endpoint."
            ].map((t) => (
              <li key={t} className="flex gap-1.5 text-[0.64rem] leading-snug text-ink-2">
                <span className="mt-[3px] h-[4px] w-[4px] shrink-0 bg-vermilion" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-2 border-t border-line pt-2 text-[0.6rem] leading-relaxed text-muted">
        These statements describe a key that survived verification. If the verdict above is an abort, no key is issued and the scope
        statement is hypothetical.
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function Simulation() {
  const [draft, setDraft] = useState<RunParams>(DEFAULT_PARAMS);
  const [committed, setCommitted] = useState<RunParams>(DEFAULT_PARAMS);
  const [stage, setStage] = useState(STAGE_COUNT - 1);
  const [visibleRows, setVisibleRows] = useState(64);

  const result = useMemo(
    () =>
      runBb84({
        photons: committed.photons,
        eveProbability: committed.eveProbability,
        detectionEfficiency: committed.detectionEfficiency,
        intrinsicErrorRate: committed.intrinsicErrorRate,
        errorCorrection: committed.errorCorrection,
        seed: committed.seed,
        securityMargin: DEFAULT_SECURITY_MARGIN
      }),
    [committed]
  );

  const verdict = useMemo(() => securityVerdict(result), [result]);
  const knowledge = useMemo(() => eveKnowledge(result.records), [result]);

  const guided = useMemo(
    () =>
      GUIDED_EVE.map((p) => {
        const r = runBb84({
          photons: GUIDED_PHOTONS,
          eveProbability: p,
          detectionEfficiency: 1,
          intrinsicErrorRate: 0,
          errorCorrection: true,
          seed: `${committed.seed}:guided`,
          securityMargin: DEFAULT_SECURITY_MARGIN
        });
        return { p, qber: r.qber, expected: expectedQberTotal(p, 0), sifted: r.stages.sifted };
      }),
    [committed.seed]
  );

  const commit = (next: RunParams) => {
    setDraft(next);
    setCommitted(next);
    setStage(STAGE_COUNT - 1);
    setVisibleRows(64);
  };

  const runGuided = (p: number) => {
    commit({
      ...draft,
      photons: GUIDED_PHOTONS,
      eveProbability: p,
      detectionEfficiency: 1,
      intrinsicErrorRate: 0,
      errorCorrection: true
    });
  };

  const randomize = () => {
    const seed = `bb84-${Math.random().toString(36).slice(2, 8)}`;
    commit({ ...draft, seed });
  };

  const reset = () => {
    setDraft(DEFAULT_PARAMS);
    setCommitted(DEFAULT_PARAMS);
    setStage(STAGE_COUNT - 1);
    setVisibleRows(64);
  };

  const dirty =
    draft.photons !== committed.photons ||
    draft.eveProbability !== committed.eveProbability ||
    draft.detectionEfficiency !== committed.detectionEfficiency ||
    draft.intrinsicErrorRate !== committed.intrinsicErrorRate ||
    draft.errorCorrection !== committed.errorCorrection ||
    draft.seed !== committed.seed;

  const readouts: Readout[] = [
    { label: "Photons sent", value: fmtInt(result.options.photons), note: "one qubit per event" },
    {
      label: "Detected",
      value: stage >= 1 ? fmtInt(result.stages.detected) : "—",
      note: stage >= 1 ? `expected ${fmtInt(expectedDetected(result.options.photons, result.options.detectionEfficiency))}` : "after transmission"
    },
    {
      label: "Sifted",
      value: stage >= 3 ? fmtInt(result.stages.sifted) : "—",
      note: stage >= 3 ? `expected ${fmtInt(expectedSifted(result.options.photons, result.options.detectionEfficiency))}` : "after basis announcement"
    },
    {
      label: "QBER",
      value: stage >= 4 ? formatPercent(result.qber) : "—",
      tone: stage >= 4 ? (result.qber >= SECURITY_THRESHOLD ? "warn" : result.qber > 0.05 ? "default" : "accent") : "default",
      note: `threshold ${formatPercent(SECURITY_THRESHOLD, 0)}`
    },
    {
      label: "Final key",
      value: stage >= 7 ? fmtInt(verdict.decision === "accept" ? result.privacy.outputBits : 0) : "—",
      unit: stage >= 7 ? "bits" : undefined,
      note: stage >= 7 ? (verdict.decision === "accept" ? `${formatPercent(result.privacy.compression, 1)} of corrected bits` : "no key issued") : "after verification"
    },
    {
      label: "Verdict",
      value: stage >= 7 ? (verdict.decision === "accept" ? "ACCEPT" : "ABORT") : "PENDING",
      tone: stage >= 7 ? (verdict.decision === "accept" ? "accent" : "warn") : "default",
      note: stage >= 7 ? verdict.severity : "complete the protocol"
    }
  ];

  const showCharts = stage >= 4;
  const showCorrection = stage >= 5;
  const showAmplify = stage >= 6;
  const showFinal = stage >= 7;
  const nextInfo = stage < STAGE_COUNT - 1 ? stageInfo(stage + 1) : null;

  const showMore = () => {
    setVisibleRows((current) => {
      if (current < 256) return 256;
      if (current < TABLE_CAP) return TABLE_CAP;
      return current;
    });
  };

  const controls = (
    <>
      <Slider
        label="Photons prepared"
        value={draft.photons}
        min={MIN_PHOTONS}
        max={MAX_PHOTONS}
        step={64}
        onChange={(v) => setDraft((d) => ({ ...d, photons: v }))}
        format={(v) => fmtInt(v)}
        hint={`Capped at ${fmtInt(MAX_PHOTONS)} events so the photon view stays usable.`}
      />
      <Slider
        label="Eve interception probability"
        value={draft.eveProbability}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => setDraft((d) => ({ ...d, eveProbability: v }))}
        format={(v) => `${Math.round(v * 100)}%`}
        hint="Intercept–resend: Eve measures in a random basis and resends."
      />
      <Slider
        label="Detector efficiency"
        value={draft.detectionEfficiency}
        min={0.2}
        max={1}
        step={0.01}
        onChange={(v) => setDraft((d) => ({ ...d, detectionEfficiency: v }))}
        format={(v) => `${Math.round(v * 100)}%`}
        hint="Bernoulli click probability. Dark counts and dead time are not modelled."
      />
      <Slider
        label="Intrinsic error rate"
        value={draft.intrinsicErrorRate}
        min={0}
        max={0.05}
        step={0.001}
        onChange={(v) => setDraft((d) => ({ ...d, intrinsicErrorRate: v }))}
        format={(v) => `${(v * 100).toFixed(1)}%`}
        hint="Independent bit flip applied to detected photons (misalignment analogue)."
      />
      <Toggle
        label="Hamming error correction"
        checked={draft.errorCorrection}
        onChange={(v) => setDraft((d) => ({ ...d, errorCorrection: v }))}
        hint="Correct one error per 4-bit block; reveals three parity bits per block."
      />
      <button type="button" className="btn w-full" onClick={() => commit({ ...draft })}>
        Run protocol
      </button>
      {dirty ? (
        <p className="text-[0.62rem] leading-snug text-vermilion">
          Parameters changed. Press Run protocol to regenerate the records and keys.
        </p>
      ) : (
        <p className="text-[0.62rem] leading-snug text-muted">
          Current result uses seed <span className="font-mono text-ink">{committed.seed}</span>.
        </p>
      )}

      <div className="border border-line bg-paper p-2.5">
        <p className="label mb-1.5">Guided sequence · 256 photons</p>
        <div className="grid grid-cols-3 gap-1">
          {guided.map((g) => (
            <button
              key={g.p}
              type="button"
              onClick={() => runGuided(g.p)}
              className="border border-line-strong bg-paper-2 px-1 py-1.5 text-center hover:bg-paper-3"
              title={`Run 256 photons with Eve p = ${g.p}`}
            >
              <span className="block font-mono text-[0.62rem] text-ink">p = {Math.round(g.p * 100)}%</span>
              <span className="mt-0.5 block font-mono text-[0.55rem] text-muted">Q {formatPercent(g.qber, 1)}</span>
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[0.58rem] leading-snug text-muted">
          Ideal detector, no intrinsic error, same seed. Compare 0%, 12.5% and 25% QBER. Clicking a preset also runs it.
        </p>
      </div>

      <div className="border border-line bg-paper p-2.5">
        <p className="label mb-1.5">Model boundaries</p>
        <ul className="space-y-1 text-[0.58rem] leading-snug text-muted">
          <li>— Ideal single qubits; no multi-photon pulses.</li>
          <li>— Bernoulli detection only; no dark counts or dead time.</li>
          <li>— XOR hash is illustrative, not cryptographically secure.</li>
          <li>— No finite-key proof, no device modelling, no authentication protocol.</li>
        </ul>
      </div>
    </>
  );

  return (
    <SimulatorShell
      title="BB84 protocol console"
      subtitle="Prepare-and-measure QKD · seeded stochastic model"
      badge={<Badge tone="slate">Simulated</Badge>}
      controls={controls}
      readouts={readouts}
      onReset={reset}
      seed={draft.seed}
      onSeedChange={(seed) => setDraft((d) => ({ ...d, seed }))}
      onRandomize={randomize}
      spec={content.simulation}
      guidedNote="Use the guided sequence first (256 photons, Eve 0 → 0.5 → 1.0), then step through the eight stages and watch which information exists at each point. The final stage states the limits of the verdict."
      freeNote="All parameters are unlocked. Keep the photon count moderate while stepping through stages; the table is capped at 1024 rows, but the simulation uses every photon."
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border border-vermilion/40 bg-vermilion-soft/30 px-3 py-2">
          <p className="text-[0.68rem] leading-snug text-ink-2">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-vermilion">Simulated</span>
            {" — "}
            every count, basis, detector click and key bit below comes from the seeded numerical model. No quantum channel, single-photon
            source or detector is connected.
          </p>
          <span className="font-mono text-[0.52rem] uppercase tracking-wide text-muted">no hardware</span>
        </div>

        <StageStepper stage={stage} onStage={setStage} />

        <div className="grid gap-2 sm:grid-cols-3">
          <AliceCard result={result} stage={stage} />
          <EveCard result={result} knowledge={knowledge} stage={stage} />
          <BobCard result={result} stage={stage} />
        </div>

        <PhotonTable result={result} stage={stage} visibleRows={visibleRows} onShowMore={showMore} />

        {showCharts ? <QberCharts result={result} /> : null}
        {showCorrection ? <CorrectionPanel result={result} /> : null}
        {showAmplify ? <AmplificationPanel result={result} /> : null}
        {showAmplify ? <FinalKeyPanel result={result} stage={stage} /> : null}
        {showFinal ? (
          <>
            <VerdictPanel
              verdict={verdict}
              qber={result.qber}
              sifted={result.stages.sifted}
              finalBits={verdict.decision === "accept" ? result.privacy.outputBits : 0}
            />
            <DecisionFlow result={result} verdict={verdict} />
            <CapabilityPanel />
          </>
        ) : null}

        {nextInfo ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border border-dashed border-line-strong bg-paper/50 px-3 py-2.5">
            <div className="min-w-0">
              <p className="label mb-0.5">
                Next · stage {stage + 2} · {nextInfo.label}
              </p>
              <p className="max-w-2xl text-[0.65rem] leading-snug text-muted">{nextInfo.description}</p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm shrink-0" onClick={() => setStage(stage + 1)}>
              Reveal next stage
            </button>
          </div>
        ) : null}
      </div>
    </SimulatorShell>
  );
}
