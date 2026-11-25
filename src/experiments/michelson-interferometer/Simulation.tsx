"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { SimulatorShell, type Readout } from "@/components/sim/SimulatorShell";
import { NumberField, SegmentedControl, Slider } from "@/components/ui/Controls";
import { Badge, DataTable } from "@/components/ui/primitives";
import { IntensityCanvas } from "@/components/viz/IntensityCanvas";
import { LabLineChart } from "@/components/viz/Plot";
import {
  AIR_INDEX_MINUS_ONE_1ATM,
  CURVATURE_RADIUS_M,
  FIELD_M,
  PATTERN_SAMPLES,
  SOURCE_PRESETS,
  balanceVisibility,
  buildFringeField,
  coherenceEnvelopeAt,
  coherenceLengthOf,
  fringeOrderAt,
  fringeSpacingM,
  fringesAcrossFieldM,
  fringesForTravel,
  gasCellFringes,
  gasCellIndexFromFringes,
  getSourcePreset,
  intensityAtOpd,
  observedVisibilityAt,
  opticalPathDifferenceM,
  phaseAtOpd,
  ringsAcrossFieldM,
  thermalExpansionFromFringes,
  travelForFringes,
  wavelengthFromScan,
  type FringeGeometry,
  type SourceId
} from "./physics";
import { simulationSpec } from "./content";

/* -------------------------------------------------------------------------- */
/* Local helpers and types                                                     */
/* -------------------------------------------------------------------------- */

interface MeasurementRow {
  id: number;
  count: number;
  travelMm: number;
  wavelengthNm: number;
  residualPct: number;
  sourceShort: string;
}

const clamp = (value: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, value));

const fmt = (value: number, digits: number): string =>
  Number.isFinite(value) ? value.toFixed(digits) : "—";

const DEFAULT_MIRROR_2_MM = 0.0003;

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export default function Simulation() {
  const measurementHeadingId = useId();
  const gasHeadingId = useId();
  const thermalHeadingId = useId();

  /* Source and interference parameters. */
  const [sourceId, setSourceId] = useState<SourceId>("hene");
  const [wavelengthNm, setWavelengthNm] = useState(632.8);
  const [bandwidthNm, setBandwidthNm] = useState(0.002);
  const [coherence, setCoherence] = useState(0.98);
  const [ratio, setRatio] = useState(1);

  /* Geometry. */
  const [arm1Mm, setArm1Mm] = useState(0);
  const [arm2Mm, setArm2Mm] = useState(DEFAULT_MIRROR_2_MM);
  const [tiltUrad, setTiltUrad] = useState(0);
  const [geometry, setGeometry] = useState<FringeGeometry>("circular");
  const [colormap, setColormap] = useState<"mono" | "amber">("amber");

  /* Simulated measurement table. */
  const [rows, setRows] = useState<MeasurementRow[]>([]);
  const [nextId, setNextId] = useState(1);
  const [countInput, setCountInput] = useState(100);
  const [travelMmInput, setTravelMmInput] = useState(0.0317);
  const [scanStartMm, setScanStartMm] = useState<number | null>(null);

  /* Calculator inputs. */
  const [gasFringes, setGasFringes] = useState(92);
  const [gasLengthMm, setGasLengthMm] = useState(100);
  const [thermalCount, setThermalCount] = useState(730);
  const [thermalLengthMm, setThermalLengthMm] = useState(500);
  const [deltaTK, setDeltaTK] = useState(20);

  const wavelengthM = wavelengthNm * 1e-9;
  const bandwidthM = bandwidthNm * 1e-9;
  const arm1M = arm1Mm * 1e-3;
  const arm2M = arm2Mm * 1e-3;
  const tiltRad = tiltUrad * 1e-6;
  const source = getSourcePreset(sourceId);

  const opdM = opticalPathDifferenceM(arm1M, arm2M);
  const coherenceLengthM = coherenceLengthOf(wavelengthM, bandwidthM);
  const visibility = observedVisibilityAt(ratio, coherence, opdM, coherenceLengthM);
  const order = fringeOrderAt(opdM, wavelengthM);
  const phase = phaseAtOpd(opdM, wavelengthM);
  const centreCos = Math.cos(phase);
  const centreLabel =
    Math.abs(centreCos) > 0.9 ? (centreCos > 0 ? "bright" : "dark") : "intermediate";

  const fringesInField =
    geometry === "straight"
      ? fringesAcrossFieldM(FIELD_M, wavelengthM, tiltRad)
      : ringsAcrossFieldM(FIELD_M, wavelengthM, CURVATURE_RADIUS_M);

  const spacingMm =
    geometry === "straight" ? fringeSpacingM(wavelengthM, tiltRad) * 1e3 : Number.NaN;

  const coherenceLabel =
    coherenceLengthM < 1e-3
      ? `${fmt(coherenceLengthM * 1e6, 1)} µm`
      : coherenceLengthM < 1
        ? `${fmt(coherenceLengthM * 1e3, 2)} mm`
        : `${fmt(coherenceLengthM, 3)} m`;

  /* Fringe field. */
  const field = useMemo(
    () =>
      buildFringeField({
        armDifferenceM: arm2M - arm1M,
        wavelengthM,
        bandwidthM,
        coherence,
        intensityRatio: ratio,
        tiltRad,
        geometry,
        fieldM: FIELD_M,
        samples: PATTERN_SAMPLES
      }),
    [arm1M, arm2M, wavelengthM, bandwidthM, coherence, ratio, tiltRad, geometry]
  );

  /* Intensity versus OPD for the current source and arm balance. */
  const plot = useMemo(() => {
    const spanM = Math.min(Math.max(3 * wavelengthM, 1.5 * coherenceLengthM), 12 * wavelengthM);
    const spanUm = spanM * 1e6;
    const points = 241;
    const balance = balanceVisibility(ratio);
    const data: Record<string, number>[] = [];
    for (let i = 0; i < points; i++) {
      const xUm = -spanUm + (2 * spanUm * i) / (points - 1);
      const opd = xUm * 1e-6;
      const envelope = 0.5 * (1 + balance * coherence * coherenceEnvelopeAt(opd, coherenceLengthM));
      data.push({
        opdUm: xUm,
        intensity: intensityAtOpd(opd, wavelengthM, coherenceLengthM, coherence, ratio),
        envelope
      });
    }
    return { data, spanUm };
  }, [wavelengthM, coherenceLengthM, coherence, ratio]);

  const plotReference = Math.abs(opdM) <= plot.spanUm ? opdM * 1e6 : undefined;

  /* Measurement calculator. */
  const safeCount = Math.max(1, Math.round(countInput));
  const travelMInput = Math.abs(travelMmInput) * 1e-3;
  const measuredWavelengthM = wavelengthFromScan(travelMInput, safeCount);
  const residualPct =
    Number.isFinite(measuredWavelengthM) && wavelengthM > 0
      ? ((measuredWavelengthM - wavelengthM) / wavelengthM) * 100
      : Number.NaN;
  const expectedCount = fringesForTravel(travelMInput, wavelengthM);
  const scanCoherence = coherenceEnvelopeAt(2 * travelMInput, coherenceLengthM);
  const scanUsable = scanCoherence > 0.02;
  const canRecord =
    countInput >= 1 &&
    travelMInput > 0 &&
    Number.isFinite(measuredWavelengthM) &&
    Number.isFinite(residualPct) &&
    scanUsable;

  const residualLabel = Number.isFinite(residualPct)
    ? `${residualPct >= 0 ? "+" : ""}${residualPct.toFixed(2)} %`
    : "—";

  function applyPreset(id: SourceId) {
    const preset = getSourcePreset(id);
    setSourceId(id);
    setWavelengthNm(preset.wavelengthNm);
    setBandwidthNm(preset.bandwidthNm);
    setCoherence(preset.coherence);
  }

  function nudgeMirror2(fringes: number) {
    const travelMm = travelForFringes(fringes, wavelengthM) * 1e3;
    setArm2Mm((previous) => clamp(previous + travelMm, -5, 5));
  }

  function applyScanTravel() {
    if (scanStartMm === null) return;
    setTravelMmInput(Math.abs(arm2Mm - scanStartMm));
  }

  function addMeasurement() {
    if (!canRecord) return;
    setRows((previous) => [
      {
        id: nextId,
        count: safeCount,
        travelMm: Math.abs(travelMmInput),
        wavelengthNm: measuredWavelengthM * 1e9,
        residualPct,
        sourceShort: source.short
      },
      ...previous
    ]);
    setNextId((id) => id + 1);
  }

  function downloadCsv() {
    if (rows.length === 0) return;
    const header = "n_fringes,travel_mm,wavelength_nm,residual_percent,source";
    const body = rows.map((row) =>
      [
        row.count,
        row.travelMm.toFixed(6),
        row.wavelengthNm.toFixed(3),
        row.residualPct.toFixed(3),
        row.sourceShort
      ].join(",")
    );
    const blob = new Blob([`\uFEFF${[header, ...body].join("\n")}`], {
      type: "text/csv;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "michelson-simulated-measurements.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const handleReset = useCallback(() => {
    const preset = getSourcePreset("hene");
    setSourceId("hene");
    setWavelengthNm(preset.wavelengthNm);
    setBandwidthNm(preset.bandwidthNm);
    setCoherence(preset.coherence);
    setRatio(1);
    setArm1Mm(0);
    setArm2Mm(DEFAULT_MIRROR_2_MM);
    setTiltUrad(0);
    setGeometry("circular");
    setColormap("amber");
    setRows([]);
    setNextId(1);
    setCountInput(100);
    setTravelMmInput(0.0317);
    setScanStartMm(null);
    setGasFringes(92);
    setGasLengthMm(100);
    setThermalCount(730);
    setThermalLengthMm(500);
    setDeltaTK(20);
  }, []);

  /* Gas-cell and thermal calculators. */
  const gasIndex = gasCellIndexFromFringes(gasFringes, wavelengthM, gasLengthMm * 1e-3);
  const gasIndexMinusOne = gasIndex - 1;
  const expectedAirFringes = gasCellFringes(
    AIR_INDEX_MINUS_ONE_1ATM,
    wavelengthM,
    gasLengthMm * 1e-3
  );
  const alpha = thermalExpansionFromFringes(
    thermalCount,
    wavelengthM,
    thermalLengthMm * 1e-3,
    deltaTK
  );

  const readouts: Readout[] = [
    {
      label: "Optical path difference",
      value: fmt(opdM * 1e6, 2),
      unit: "µm",
      note: "Δ = 2(d₂ − d₁)"
    },
    {
      label: "Fringe order at centre",
      value: fmt(order, 2),
      note: "m = Δ/λ"
    },
    {
      label: "Visibility at centre",
      value: fmt(visibility * 100, 1),
      unit: "%",
      tone: visibility < 0.2 ? "warn" : "default",
      note: "balance × coherence × envelope"
    },
    {
      label: "Coherence length",
      value: coherenceLengthM < 1e-3 ? fmt(coherenceLengthM * 1e6, 1) : fmt(coherenceLengthM * 1e3, 2),
      unit: coherenceLengthM < 1e-3 ? "µm" : "mm",
      note: "Lc ≈ λ²/Δλ"
    },
    {
      label: "Fringes in field",
      value: fmt(fringesInField, 1),
      note: geometry === "straight" ? "spacing λ/(2α)" : "quadratic curvature"
    },
    {
      label: "Centre point",
      value: centreLabel,
      note: `cos δ = ${fmt(centreCos, 2)}`
    },
    {
      label: "Mirror travel per fringe",
      value: fmt((wavelengthM * 1e9) / 2, 1),
      unit: "nm",
      note: "one fringe = λ/2"
    },
    {
      label: "Source width (FWHM)",
      value: fmt(bandwidthNm, bandwidthNm < 1 ? 3 : 1),
      unit: "nm",
      note: source.short
    }
  ];

  return (
    <SimulatorShell
      title="Michelson bench"
      subtitle="Two-path interference · live field and measurement"
      badge={<Badge tone="slate">Model output</Badge>}
      onReset={handleReset}
      readouts={readouts}
      spec={simulationSpec}
      controls={
        <>
          <div>
            <p className="label mb-1.5">Source preset</p>
            <SegmentedControl<SourceId>
              ariaLabel="Source preset"
              value={sourceId}
              onChange={applyPreset}
              options={SOURCE_PRESETS.map((preset) => ({
                value: preset.id,
                label: preset.short,
                title: preset.label
              }))}
            />
            <p className="mt-1.5 text-[0.64rem] leading-snug text-muted">{source.note}</p>
          </div>

          <Slider
            label="Wavelength"
            value={wavelengthNm}
            min={400}
            max={700}
            step={0.1}
            unit="nm"
            onChange={setWavelengthNm}
            format={(value) => value.toFixed(1)}
          />

          <Slider
            label="Spectral width (FWHM)"
            value={bandwidthNm}
            min={0.001}
            max={250}
            step={0.001}
            unit="nm"
            onChange={setBandwidthNm}
            format={(value) => (value < 1 ? value.toFixed(3) : value.toFixed(1))}
            hint={`Coherence length ${coherenceLabel}.`}
          />

          <Slider
            label="Source coherence factor"
            value={coherence}
            min={0}
            max={1}
            step={0.01}
            onChange={setCoherence}
            format={(value) => value.toFixed(2)}
            hint="Phenomenological factor for residual spatial coherence and mode mismatch; not a measured value."
          />

          <Slider
            label="Beam balance I₂/I₁"
            value={ratio}
            min={0.05}
            max={1}
            step={0.01}
            onChange={setRatio}
            format={(value) => value.toFixed(2)}
            hint={`Visibility factor ${balanceVisibility(ratio).toFixed(2)}.`}
          />

          <div>
            <p className="label mb-1.5">Fringe geometry</p>
            <SegmentedControl<FringeGeometry>
              ariaLabel="Fringe geometry"
              value={geometry}
              onChange={(next) => {
                setGeometry(next);
                if (next === "straight" && tiltUrad < 10) setTiltUrad(250);
              }}
              options={[
                { value: "circular", label: "Circular" },
                { value: "straight", label: "Straight" }
              ]}
            />
            <p className="mt-1.5 text-[0.64rem] leading-snug text-muted">
              {geometry === "circular"
                ? "Quadratic wavefront mismatch; the tilt control is inactive."
                : `Straight fringes; spacing ${fmt(spacingMm, 2)} mm.`}
            </p>
          </div>

          <Slider
            label="Mirror 1 (relative)"
            value={arm1Mm}
            min={-5}
            max={5}
            step={0.00005}
            unit="mm"
            onChange={setArm1Mm}
            format={(value) => value.toFixed(5)}
            hint="Arm lengths are measured from the splitter; only their difference matters."
          />

          <Slider
            label="Mirror 2 (relative)"
            value={arm2Mm}
            min={-5}
            max={5}
            step={0.00005}
            unit="mm"
            onChange={setArm2Mm}
            format={(value) => value.toFixed(5)}
            hint={`Δ = ${fmt(opdM * 1e6, 2)} µm; one fringe per ${fmt(
              (wavelengthM * 1e9) / 2,
              1
            )} nm of travel.`}
          />

          <Slider
            label="Mirror tilt"
            value={tiltUrad}
            min={0}
            max={800}
            step={1}
            unit="µrad"
            onChange={setTiltUrad}
            format={(value) => value.toFixed(0)}
            disabled={geometry === "circular"}
            hint={
              geometry === "circular"
                ? "Switch to straight fringes to use the tilt."
                : "Tilt direction sets fringe orientation; magnitude sets spacing."
            }
          />
        </>
      }
      guidedNote="Start with the He–Ne preset and circular fringes. Press Zero OPD, then step Mirror 2 by +λ/4 twice, or drag it slowly through λ/2: the centre goes bright → dark → bright, exactly one fringe. Record N = 1 and Δd = λ/2 in the measurement panel."
      freeNote="All parameters are unlocked. Leave the coherent, paraxial regime and watch visibility, aliasing and the coherence envelope respond; the declared model lists what is not claimed."
      footer={
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
            {/* Measurement workspace */}
            <section className="border border-line bg-paper-2" aria-labelledby={measurementHeadingId}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
                <div>
                  <p id={measurementHeadingId} className="label text-vermilion">
                    Simulated measurements — not laboratory data
                  </p>
                  <p className="text-[0.66rem] leading-snug text-muted">
                    λ = 2Δd/N compared with the selected source. The model does not check your counting.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={downloadCsv}
                    disabled={rows.length === 0}
                  >
                    Download CSV
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setRows([])}
                    disabled={rows.length === 0}
                  >
                    Clear rows
                  </button>
                </div>
              </div>

              <div className="grid gap-3 p-3 sm:grid-cols-2">
                <NumberField
                  label="Fringes counted N"
                  value={countInput}
                  onChange={setCountInput}
                  min={1}
                  max={5000}
                  step={1}
                  hint="Whole fringes crossing one fixed point."
                />
                <NumberField
                  label="Mirror travel Δd"
                  value={travelMmInput}
                  onChange={setTravelMmInput}
                  min={0.000001}
                  max={10}
                  step={0.000001}
                  unit="mm"
                  hint={`Model expectation: ${fmt(expectedCount, 1)} fringes.`}
                />

                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setScanStartMm(arm2Mm)}
                  >
                    Mark start (mirror 2)
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={applyScanTravel}
                    disabled={scanStartMm === null}
                  >
                    Use travel since start
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      setTravelMmInput(Number(((safeCount * wavelengthM * 1e3) / 2).toFixed(7)))
                    }
                  >
                    Set Δd = Nλ/2
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={addMeasurement}
                    disabled={!canRecord}
                  >
                    Record measurement
                  </button>
                </div>

                <div
                  className="grid grid-cols-2 gap-3 border-t border-line pt-3 sm:col-span-2"
                  aria-live="polite"
                >
                  <div>
                    <p className="label mb-1">Implied λ</p>
                    <p className="num text-[0.95rem] text-ink">
                      {fmt(measuredWavelengthM * 1e9, 2)}
                      <span className="ml-1 text-[0.62rem] text-muted">nm</span>
                    </p>
                  </div>
                  <div>
                    <p className="label mb-1">Residual vs source</p>
                    <p
                      className={`num text-[0.95rem] ${
                        Number.isFinite(residualPct) && Math.abs(residualPct) > 1
                          ? "text-vermilion"
                          : "text-ink"
                      }`}
                    >
                      {residualLabel}
                    </p>
                  </div>
                  <p className="col-span-2 text-[0.63rem] leading-snug text-muted">
                    Start position: {scanStartMm === null ? "not marked" : `${scanStartMm.toFixed(4)} mm`}.
                    Scan coherence at the far end: {fmt(scanCoherence * 100, 1)}%.{" "}
                    {scanUsable
                      ? "The source still supports fringes over this travel."
                      : "This travel exceeds the source coherence; the recording is disabled."}
                  </p>
                </div>
              </div>

              <div className="border-t border-line px-3 pb-3">
                <DataTable
                  dense
                  caption="SIMULATED MEASUREMENTS — not laboratory data"
                  head={["#", "N", "Δd (mm)", "λ (nm)", "Residual (%)", "Action"]}
                  align={["r", "r", "r", "r", "r", "l"]}
                  rows={rows.map((row) => [
                    String(row.id),
                    String(row.count),
                    row.travelMm.toFixed(6),
                    row.wavelengthNm.toFixed(2),
                    `${row.residualPct >= 0 ? "+" : ""}${row.residualPct.toFixed(2)}`,
                    <button
                      key={`delete-${row.id}`}
                      type="button"
                      className="font-mono text-[0.7rem] text-vermilion hover:underline"
                      onClick={() => setRows((previous) => previous.filter((item) => item.id !== row.id))}
                      aria-label={`Delete simulated measurement ${row.id}`}
                    >
                      remove
                    </button>
                  ])}
                />
                {rows.length === 0 ? (
                  <p className="pt-2 text-[0.66rem] leading-snug text-muted">
                    No rows yet. Mark a start position, move mirror 2, enter the fringes you count,
                    then record. Every row is a model calculation, not a measurement of the physical kit.
                  </p>
                ) : null}
              </div>
            </section>

            {/* Calculators */}
            <div className="space-y-3">
              <section className="border border-line bg-paper-2" aria-labelledby={gasHeadingId}>
                <div className="border-b border-line px-3 py-2">
                  <p id={gasHeadingId} className="label">
                    Gas-cell calculator
                  </p>
                  <p className="text-[0.64rem] leading-snug text-muted">
                    n = 1 + Nλ/(2t) at the selected λ = {fmt(wavelengthNm, 1)} nm.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 p-3">
                  <NumberField
                    label="Fringes N"
                    value={gasFringes}
                    onChange={setGasFringes}
                    min={0}
                    max={5000}
                    step={1}
                  />
                  <NumberField
                    label="Cell length t"
                    value={gasLengthMm}
                    onChange={setGasLengthMm}
                    min={10}
                    max={1000}
                    step={1}
                    unit="mm"
                  />
                  <div className="col-span-2 grid grid-cols-2 gap-3 border-t border-line pt-3" aria-live="polite">
                    <div>
                      <p className="label mb-1">n</p>
                      <p className="num text-[0.9rem] text-ink">
                        {Number.isFinite(gasIndex) ? gasIndex.toFixed(6) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="label mb-1">n − 1</p>
                      <p className="num text-[0.9rem] text-ink">
                        {Number.isFinite(gasIndexMinusOne)
                          ? `${(gasIndexMinusOne * 1e4).toFixed(2)} × 10⁻⁴`
                          : "—"}
                      </p>
                    </div>
                    <p className="col-span-2 text-[0.63rem] leading-snug text-muted">
                      Typical dry air at 1 atm: n − 1 ≈ 2.74 × 10⁻⁴, which would give about{" "}
                      {fmt(expectedAirFringes, 0)} fringes in this cell. This is a calculator, not a
                      measurement.
                    </p>
                  </div>
                </div>
              </section>

              <section className="border border-line bg-paper-2" aria-labelledby={thermalHeadingId}>
                <div className="border-b border-line px-3 py-2">
                  <p id={thermalHeadingId} className="label">
                    Thermal-expansion calculator
                  </p>
                  <p className="text-[0.64rem] leading-snug text-muted">
                    α = Nλ/(2LΔT) at the selected λ = {fmt(wavelengthNm, 1)} nm.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 p-3">
                  <NumberField
                    label="Fringes N"
                    value={thermalCount}
                    onChange={setThermalCount}
                    min={0}
                    max={20000}
                    step={1}
                  />
                  <NumberField
                    label="Sample length L"
                    value={thermalLengthMm}
                    onChange={setThermalLengthMm}
                    min={10}
                    max={2000}
                    step={1}
                    unit="mm"
                  />
                  <NumberField
                    label="Temperature rise ΔT"
                    value={deltaTK}
                    onChange={setDeltaTK}
                    min={0.1}
                    max={200}
                    step={0.1}
                    unit="K"
                  />
                  <div className="flex flex-col justify-end" aria-live="polite">
                    <p className="label mb-1">α</p>
                    <p className="num text-[0.95rem] text-ink">
                      {Number.isFinite(alpha) ? `${(alpha * 1e6).toFixed(2)} × 10⁻⁶` : "—"}
                      <span className="ml-1 text-[0.62rem] text-muted">K⁻¹</span>
                    </p>
                  </div>
                  <p className="col-span-2 text-[0.63rem] leading-snug text-muted">
                    Typical values: aluminium ≈ 23, copper ≈ 17, steel ≈ 12 × 10⁻⁶ K⁻¹. A result
                    far below the material value usually means the mount absorbed the expansion.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          {/* Fringe field */}
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="label">
                Fringe field · {fmt(FIELD_M * 1e3, 0)} mm across · {field.samples}² samples
              </p>
              <SegmentedControl<"mono" | "amber">
                size="sm"
                ariaLabel="Fringe colormap"
                value={colormap}
                onChange={setColormap}
                options={[
                  { value: "mono", label: "Mono" },
                  { value: "amber", label: "Amber" }
                ]}
              />
            </div>
            <div className="flex min-h-[320px] items-center justify-center border border-line bg-[#111110] p-2">
              <IntensityCanvas
                values={field.values}
                size={field.samples}
                colormap={colormap}
                min={0}
                max={1}
                ariaLabel={`Simulated ${geometry} Michelson fringe field. Optical path difference ${fmt(
                  opdM * 1e6,
                  2
                )} micrometres, visibility ${fmt(visibility * 100, 0)} percent, ${fmt(
                  fringesInField,
                  1
                )} fringes in the field.`}
                className="aspect-square w-full max-w-[420px]"
              />
            </div>
            <p className="mt-2 text-[0.65rem] leading-relaxed text-muted">
              {geometry === "straight"
                ? `Straight fringes from a ${fmt(tiltUrad, 0)} µrad tilt; spacing ${fmt(
                    spacingMm,
                    2
                  )} mm. The field is sampled, not a photograph of the kit.`
                : `Circular fringes from a quadratic wavefront mismatch (R = ${CURVATURE_RADIUS_M} m). The centre order is ${fmt(
                    order,
                    2
                  )}; the rings are a model of defocus, not a measured mirror figure.`}
            </p>
          </div>

          {/* Intensity plot */}
          <div>
            <p className="label mb-2">Intensity vs optical path difference</p>
            <div className="border border-line bg-paper-2 p-2">
              <LabLineChart
                data={plot.data}
                xKey="opdUm"
                xLabel="OPD (µm)"
                yLabel="I / I₀"
                xUnit="µm"
                yUnit=""
                height={250}
                domain={[-plot.spanUm, plot.spanUm]}
                yDomain={[0, 1.02]}
                referenceX={plotReference}
                series={[
                  { key: "intensity", label: "I / I₀" },
                  { key: "envelope", label: "coherence envelope", dashed: true }
                ]}
                showLegend
                digits={3}
              />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[0.65rem] leading-snug text-muted">
              <p>
                Centre phase: <span className="num text-ink">{fmt(phase, 2)} rad</span>
              </p>
              <p>
                Centre state: <span className="text-ink">{centreLabel}</span>
              </p>
              <p>
                Spacing / rings:{" "}
                <span className="num text-ink">
                  {geometry === "straight" ? `${fmt(spacingMm, 2)} mm` : `${fmt(fringesInField, 1)} rings`}
                </span>
              </p>
              <p>
                Coherence: <span className="num text-ink">{coherenceLabel}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Guided scan */}
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className="label mr-1">Guided scan</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setArm2Mm(arm1Mm)}>
            Zero OPD
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => nudgeMirror2(0.5)}>
            Mirror 2 +λ/4
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => nudgeMirror2(1)}>
            Mirror 2 +λ/2
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => nudgeMirror2(-1)}>
            Mirror 2 −λ/2
          </button>
          <span className="text-[0.66rem] leading-snug text-muted">
            One fringe is {fmt((wavelengthM * 1e9) / 2, 1)} nm of mirror travel. The centre is{" "}
            <span className="text-ink">{centreLabel}</span>; press +λ/4 twice, or drag slowly, and
            watch bright → dark → bright.
          </span>
        </div>
      </div>
    </SimulatorShell>
  );
}
