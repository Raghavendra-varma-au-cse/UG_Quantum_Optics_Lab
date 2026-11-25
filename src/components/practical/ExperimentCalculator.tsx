"use client";

import { useState } from "react";
import type { ExperimentContent } from "@/lib/content/types";
import {
  fringeCountAnalysis,
  refractiveIndexAnalysis,
  thermalExpansionAnalysis,
  trapStiffnessAnalysis,
  qkdAnalysis,
  fourierResolutionAnalysis
} from "@/lib/data/analysis";
import { formatSig } from "@/lib/physics/stats";

type TableLike = { columns: string[]; rows: string[][] } | undefined;

function Result({ result }: { result: { title: string; value: number; unit: string; uncertainty?: number; working: string[]; notes?: string[] } }) {
  return (
    <div className="border border-line bg-paper-2">
      <div className="flex items-baseline justify-between gap-3 border-b border-line px-3 py-2">
        <p className="text-[0.75rem] font-medium text-ink">{result.title}</p>
        <p className="num text-[0.9rem] text-petrol">
          {formatSig(result.value)} <span className="text-[0.6rem] text-muted">{result.unit}</span>
        </p>
      </div>
      <ul className="space-y-1 px-3 py-2">
        {result.working.map((w, i) => (
          <li key={i} className="font-mono text-[0.64rem] leading-relaxed text-ink-2">{w}</li>
        ))}
      </ul>
      {result.notes?.length ? (
        <ul className="border-t border-line px-3 py-2">
          {result.notes.map((n, i) => (
            <li key={i} className="text-[0.62rem] leading-relaxed text-muted">— {n}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Field({ label, value, onChange, unit, step = "any" }: { label: string; value: number; onChange: (v: number) => void; unit?: string; step?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.66rem] text-muted">{label}</span>
      <div className="flex">
        <input type="number" step={step} className="field h-8 text-[0.72rem]" value={Number.isFinite(value) ? value : ""} onChange={(e) => onChange(Number(e.target.value))} />
        {unit ? <span className="flex items-center border border-l-0 border-line-strong bg-paper-3 px-1.5 font-mono text-[0.55rem] text-muted">{unit}</span> : null}
      </div>
    </label>
  );
}

export function ExperimentCalculator({ content, table }: { content: ExperimentContent; table: TableLike }) {
  const [travel, setTravel] = useState(0.25);
  const [fringes, setFringes] = useState(790);
  const [cellN, setCellN] = useState(100);
  const [cellT, setCellT] = useState(50);
  const [rodN, setRodN] = useState(120);
  const [rodL, setRodL] = useState(200);
  const [deltaT, setDeltaT] = useState(25);
  const [iMax, setIMax] = useState(1);
  const [iMin, setIMin] = useState(0.002);
  const [sifted, setSifted] = useState(512);
  const [errors, setErrors] = useState(12);
  const [variance, setVariance] = useState(0.0042);
  const [temperature, setTemperature] = useState(298);
  const [power, setPower] = useState(100);
  const [spacing, setSpacing] = useState(2.4);
  const [focal, setFocal] = useState(150);
  const [slit, setSlit] = useState(100);

  const wavelength = 632.8;

  if (content.slug === "michelson-interferometer") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Field label="Mirror travel" value={travel} onChange={setTravel} unit="mm" />
          <Field label="Fringes counted" value={fringes} onChange={setFringes} unit="—" />
          <Field label="Cell length" value={cellT} onChange={setCellT} unit="mm" />
          <Field label="Gas-cell fringes" value={cellN} onChange={setCellN} unit="—" />
          <Field label="Rod length" value={rodL} onChange={setRodL} unit="mm" />
          <Field label="Rod fringes" value={rodN} onChange={setRodN} unit="—" />
          <Field label="ΔT" value={deltaT} onChange={setDeltaT} unit="K" />
        </div>
        <Result result={fringeCountAnalysis(travel, fringes)} />
        <Result result={refractiveIndexAnalysis(cellN, wavelength, cellT)} />
        <Result result={thermalExpansionAnalysis(rodN, wavelength, rodL, deltaT)} />
      </div>
    );
  }

  if (content.slug === "polarization-3d-cinema") {
    const extinction = iMin > 0 ? 10 * Math.log10(iMax / iMin) : Infinity;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Field label="I max (parallel)" value={iMax} onChange={setIMax} unit="a.u." />
          <Field label="I min (crossed)" value={iMin} onChange={setIMin} unit="a.u." />
        </div>
        <div className="border border-line bg-paper-2 p-3">
          <p className="label mb-1">Extinction ratio</p>
          <p className="num text-[1rem] text-petrol">{Number.isFinite(extinction) ? `${extinction.toFixed(2)} dB` : "∞"}</p>
          <p className="mt-1 font-mono text-[0.64rem] text-ink-2">ER = 10 log₁₀(I∥ / I⊥)</p>
          <p className="mt-2 text-[0.62rem] leading-relaxed text-muted">
            For a perfect polarizer ER → ∞. Leakage, ambient light and detector offset set the measured floor; subtract the
            dark level before quoting ER.
          </p>
        </div>
        {table ? (
          <p className="text-[0.64rem] text-muted">
            Active table: {table.rows.filter((r) => r.some((c) => c.trim() !== "")).length} rows. Fit I(θ) = a + b cos²(θ−θ₀) in the regression panel.
          </p>
        ) : null}
      </div>
    );
  }

  if (content.slug === "quantum-key-distribution") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Sifted bits" value={sifted} onChange={setSifted} unit="bits" step="1" />
          <Field label="Errors found" value={errors} onChange={setErrors} unit="bits" step="1" />
        </div>
        <Result result={qkdAnalysis(sifted, errors, 0, Math.max(0, Math.floor(sifted * 0.4)))} />
      </div>
    );
  }

  if (content.slug === "optical-tweezers") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Field label="Position variance" value={variance} onChange={setVariance} unit="µm²" />
          <Field label="Temperature" value={temperature} onChange={setTemperature} unit="K" />
          <Field label="Laser power" value={power} onChange={setPower} unit="mW" />
        </div>
        <Result result={trapStiffnessAnalysis(variance, temperature, power)} />
      </div>
    );
  }

  if (content.slug === "fourier-optics") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Field label="Fringe spacing" value={spacing} onChange={setSpacing} unit="mm" />
          <Field label="Focal length" value={focal} onChange={setFocal} unit="mm" />
          <Field label="Wavelength" value={wavelength} onChange={() => undefined} unit="nm" />
          <Field label="Nominal separation" value={slit} onChange={setSlit} unit="µm" />
        </div>
        <Result result={fourierResolutionAnalysis(slit / 1000, spacing, focal, wavelength)} />
      </div>
    );
  }

  return (
    <div className="border border-line bg-paper-2 p-3">
      <p className="label mb-1">Calculation worksheet</p>
      <p className="text-[0.72rem] leading-relaxed text-ink-2">
        Use the analysis tasks on the experiment page as the calculation sequence. Enter measurements in the table, then
        quote the result with its uncertainty; this experiment's specialised calculator is not enabled in this build.
      </p>
      <ul className="mt-2 space-y-1">
        {content.analysis.map((a) => (
          <li key={a.id} className="text-[0.66rem] text-muted">— {a.title}: {a.method}</li>
        ))}
      </ul>
    </div>
  );
}
