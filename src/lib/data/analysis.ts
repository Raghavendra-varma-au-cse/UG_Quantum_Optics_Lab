import type { ExperimentContent } from "@/lib/content/types";

/**
 * Analysis helpers specialised to each experiment. Every function is pure and
 * returns the intermediate quantities so the UI can show the working, not just
 * a final number.
 */

export interface AnalysisResult {
  id: string;
  title: string;
  value: number;
  unit: string;
  uncertainty?: number;
  working: string[];
  notes?: string[];
}

export function fringeCountAnalysis(
  travelMm: number,
  count: number,
  travelUncertaintyMm = 0.01,
  countUncertainty = 0.5
): AnalysisResult {
  const travelM = travelMm / 1000;
  const lambda = count > 0 ? (2 * travelM) / count : NaN;
  const rel = Math.hypot(travelUncertaintyMm / Math.max(travelMm, 1e-9), countUncertainty / Math.max(count, 1e-9));
  return {
    id: "wavelength-from-fringes",
    title: "Wavelength from fringe count",
    value: lambda * 1e9,
    unit: "nm",
    uncertainty: Number.isFinite(lambda) ? lambda * rel * 1e9 : undefined,
    working: [
      `Mirror travel Δd = ${travelMm.toFixed(3)} mm = ${(travelM * 1e3).toFixed(6)} × 10⁻³ m`,
      `Fringe count N = ${count}`,
      `λ = 2Δd/N = ${(lambda * 1e9).toFixed(2)} nm`,
      `Relative uncertainty = √[(u(Δd)/Δd)² + (u(N)/N)²] = ${(rel * 100).toFixed(2)} %`
    ],
    notes: ["One fringe corresponds to λ/2 of mirror travel.", "Count uncertainty dominates for small N."]
  };
}

export function refractiveIndexAnalysis(
  count: number,
  wavelengthNm: number,
  cellLengthMm: number,
  countUncertainty = 0.5
): AnalysisResult {
  const lambda = wavelengthNm * 1e-9;
  const t = cellLengthMm / 1000;
  const n = 1 + (count * lambda) / (2 * t);
  const dn = (lambda / (2 * t)) * countUncertainty;
  return {
    id: "refractive-index",
    title: "Refractive index from gas-cell fringes",
    value: n,
    unit: "",
    uncertainty: dn,
    working: [
      `t = ${cellLengthMm.toFixed(2)} mm, λ = ${wavelengthNm.toFixed(1)} nm`,
      `n = 1 + Nλ/(2t)`,
      `n = 1 + (${count} × ${lambda.toExponential(3)})/(2 × ${t.toExponential(3)}) = ${n.toFixed(6)}`,
      `u(n) = λ u(N)/(2t) = ${dn.toExponential(2)}`
    ],
    notes: ["Valid for a single pass through the cell in one arm (double pass if the beam traverses it twice)."]
  };
}

export function thermalExpansionAnalysis(
  count: number,
  wavelengthNm: number,
  lengthMm: number,
  deltaTK: number
): AnalysisResult {
  const lambda = wavelengthNm * 1e-9;
  const l = lengthMm / 1000;
  const alpha = (count * lambda) / (2 * l * deltaTK);
  return {
    id: "thermal-expansion",
    title: "Thermal expansion coefficient",
    value: alpha,
    unit: "K⁻¹",
    working: [
      `α = Nλ/(2LΔT)`,
      `α = (${count} × ${lambda.toExponential(3)})/(2 × ${l.toExponential(3)} × ${deltaTK})`,
      `α = ${alpha.toExponential(3)} K⁻¹`
    ],
    notes: ["Assumes the sample expands freely and the fringe count is due only to length change."]
  };
}

export function malusFitAnalysis(
  anglesDeg: number[],
  intensities: number[],
  regression: { slope: number; intercept: number; r2: number }
): AnalysisResult {
  const maxI = Math.max(...intensities);
  const minI = Math.min(...intensities);
  const extinction = minI > 0 ? 10 * Math.log10(maxI / minI) : Infinity;
  return {
    id: "malus-extinction",
    title: "Malus fit and extinction ratio",
    value: extinction,
    unit: "dB",
    working: [
      `Fit I(θ) = a + b cos²(θ − θ₀); slope b = ${regression.slope.toExponential(3)}, intercept a = ${regression.intercept.toExponential(3)}`,
      `R² = ${regression.r2.toFixed(5)}`,
      `Extinction ratio = 10 log₁₀(I_max/I_min) = ${Number.isFinite(extinction) ? extinction.toFixed(2) : "∞"} dB`
    ],
    notes: ["A real polarizer has finite extinction; the fit intercept captures leakage and ambient light."]
  };
}

export function trapStiffnessAnalysis(
  varianceUm2: number,
  temperatureK: number,
  powerMw: number
): AnalysisResult {
  const kB = 1.380649e-23;
  const variance = varianceUm2 * 1e-12;
  const k = variance > 0 ? (kB * temperatureK) / variance : NaN;
  return {
    id: "trap-stiffness",
    title: "Trap stiffness from equipartition",
    value: k * 1e6,
    unit: "pN/µm",
    working: [
      `⟨x²⟩ = ${varianceUm2.toExponential(3)} µm² = ${variance.toExponential(3)} m²`,
      `k = k_B T/⟨x²⟩ = (${kB.toExponential(3)} × ${temperatureK})/${variance.toExponential(3)}`,
      `k = ${(k * 1e6).toFixed(4)} pN/µm`,
      `Normalised stiffness k/P = ${(k / (powerMw * 1e-3)).toExponential(3)} N m⁻¹ W⁻¹`
    ],
    notes: ["Equipartition assumes a harmonic trap and thermal equilibrium; drift biases the variance."]
  };
}

export function qkdAnalysis(
  sifted: number,
  errors: number,
  correctedResidual: number,
  finalBits: number
): AnalysisResult {
  const qber = sifted > 0 ? errors / sifted : NaN;
  const qberPct = qber * 100;
  return {
    id: "qkd-qber",
    title: "Sifted key and QBER",
    value: qberPct,
    unit: "%",
    uncertainty: sifted > 0 ? (Math.sqrt((qber * (1 - qber)) / sifted) * 100) : undefined,
    working: [
      `Sifted key length n = ${sifted}`,
      `Errors = ${errors}`,
      `QBER = ${errors}/${sifted} = ${qberPct.toFixed(2)} %`,
      `Statistical uncertainty ≈ √(Q(1−Q)/n) = ${sifted > 0 ? (Math.sqrt((qber * (1 - qber)) / sifted) * 100).toFixed(2) : "—"} %`,
      `Residual errors after correction = ${correctedResidual}`,
      `Final key length after privacy amplification = ${finalBits}`
    ],
    notes: ["Above 11% (asymptotic BB84) the run is aborted; finite-key analyses use a stricter bound."]
  };
}

export function fourierResolutionAnalysis(
  slitSeparationMm: number,
  fringeSpacingMm: number,
  focalLengthMm: number,
  wavelengthNm: number
): AnalysisResult {
  const lambda = wavelengthNm * 1e-9;
  const f = focalLengthMm / 1000;
  const measuredPeriod = (lambda * f) / (fringeSpacingMm / 1000);
  return {
    id: "fourier-period",
    title: "Object period from Fourier-plane spacing",
    value: measuredPeriod * 1e6,
    unit: "µm",
    working: [
      `fringe spacing Δx = ${fringeSpacingMm.toFixed(3)} mm`,
      `spatial frequency f_x = Δx/(λf) = ${((fringeSpacingMm / 1000) / (lambda * f)).toExponential(3)} m⁻¹`,
      `object period d = 1/f_x = ${(measuredPeriod * 1e6).toFixed(2)} µm`,
      `nominal slit separation = ${(slitSeparationMm * 1e6).toFixed(1)} µm`
    ],
    notes: ["The 4f Fourier plane maps position to spatial frequency linearly under the paraxial approximation."]
  };
}

/** Build the analysis tasks advertised by an experiment with any numeric defaults. */
export function analysisSummary(content: ExperimentContent): { id: string; title: string; method: string }[] {
  return content.analysis.map((a) => ({ id: a.id, title: a.title, method: a.method }));
}
