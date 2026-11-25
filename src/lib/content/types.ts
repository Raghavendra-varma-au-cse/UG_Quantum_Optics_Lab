/**
 * Content model for the Quantum Optics Laboratory.
 *
 * Every experiment is described by a single serialisable object: theory,
 * hardware, procedure, questions, references and the declared simulation
 * model. Scientific prose lives here; calculations live in physics modules;
 * rendering lives in components. No fabricated measurements.
 */

export type ExperimentSlug =
  | "michelson-interferometer"
  | "mach-zehnder-interferometer"
  | "quantum-bomb-tester"
  | "quantum-eraser"
  | "polarization-3d-cinema"
  | "fourier-optics"
  | "quantum-key-distribution"
  | "optical-tweezers";

/** Honest provenance labels used everywhere a claim appears. */
export type EvidenceLabel = "actual" | "classical-demo" | "simulation";

export type Verification = "verified" | "partially-verified" | "unverified";

export interface SymbolDef {
  symbol: string;
  meaning: string;
  unit?: string;
}

export interface Equation {
  id: string;
  latex: string;
  /** Human-readable name, e.g. "Two-beam interference intensity". */
  name: string;
  symbols: SymbolDef[];
  interpretation: string;
  assumptions?: string[];
  /** Where this equation is used. */
  usedIn?: string[];
  numericExample?: { statement: string; latex?: string };
}

export type Block =
  | { type: "p"; text: string }
  | { type: "lead"; text: string }
  | { type: "h"; text: string; id?: string }
  | { type: "eq"; latex: string; number?: string; note?: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "callout"; tone: "principle" | "caution" | "note" | "misconception" | "lab"; title: string; body: string }
  | { type: "table"; caption?: string; head: string[]; rows: string[][]; align?: ("l" | "r")[] }
  | { type: "diagram"; kind: DiagramKind; caption: string; height?: number }
  | { type: "derivation"; derivationId: string }
  | { type: "definition"; term: string; body: string }
  | { type: "numeric"; title: string; statement: string; latex?: string; result: string }
  | { type: "steps"; items: { title: string; body: string }[] };

export type DiagramKind =
  | "michelson"
  | "michelson-fringes"
  | "mach-zehnder"
  | "bomb-tester"
  | "quantum-eraser"
  | "polarization"
  | "poincare"
  | "fourier-4f"
  | "qkd-bb84"
  | "tweezers"
  | "gaussian-beam"
  | "coherence"
  | "beam-splitter"
  | "waveplate"
  | "optical-table"
  | "detection-chain";

export interface DerivationStep {
  label?: string;
  text: string;
  latex?: string;
}

export interface Derivation {
  id: string;
  title: string;
  intro?: string;
  steps: DerivationStep[];
  result: { latex: string; text: string };
  assumptions?: string[];
}

export interface TheorySection {
  id: string;
  number?: string;
  title: string;
  kicker?: string;
  blocks: Block[];
}

export interface ProcedureStep {
  title: string;
  detail: string;
  checkpoint?: string;
  caution?: string;
}

export interface ProcedurePhase {
  id: string;
  title: string;
  purpose?: string;
  steps: ProcedureStep[];
}

export interface ObservationColumn {
  key: string;
  label: string;
  unit?: string;
  type?: "number" | "text";
}

export interface ObservationTemplate {
  id: string;
  title: string;
  purpose: string;
  columns: ObservationColumn[];
  /** Guidance for how many rows / what to vary. */
  guidance: string;
  /** Formula applied by the analysis workspace, if any. */
  formula?: string;
}

export interface AnalysisTask {
  id: string;
  title: string;
  method: string;
  formula?: string;
  steps: string[];
  expected?: string;
}

export interface ErrorSource {
  source: string;
  type: "systematic" | "random" | "statistical";
  effect: string;
  mitigation: string;
}

export type QuestionType =
  | "mcq"
  | "short"
  | "long"
  | "numerical"
  | "derivation"
  | "viva"
  | "troubleshooting"
  | "instrumentation";

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: 1 | 2 | 3;
  topic: string;
  prompt: string;
  options?: string[];
  answerIndex?: number;
  /** Model answer. For MCQ this is the explanation of why the correct option holds. */
  answer: string;
  explanation?: string;
  hint?: string;
  marks?: number;
  numeric?: { value: number; tolerance: number; unit?: string };
}

export interface Reference {
  id: string;
  authors: string;
  title: string;
  year: string;
  source: string;
  doi?: string;
  url?: string;
  pages?: string;
  accessed?: string;
  kind: "manual" | "textbook" | "paper" | "standard" | "web";
  note?: string;
}

export interface HardwareRef {
  /** Matches an id in the hardware inventory. */
  itemId: string;
  quantity?: string;
  role: "kit" | "recommended" | "substitute" | "unverified";
  note?: string;
}

export interface KitInfo {
  name: string;
  manufacturer: string;
  partNumber?: string;
  verification: Verification;
  documentation?: { title: string; url?: string; note?: string }[];
  note: string;
}

export interface SimulationSpec {
  /** One-paragraph statement of the implemented model. */
  model: string;
  approximations: string[];
  validity: string[];
  /** What the simulation deliberately does not claim. */
  exclusions: string[];
  validation: string[];
  /** RNG use and reproducibility. */
  stochastic?: string;
}

export interface ExperimentContent {
  slug: ExperimentSlug;
  number: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  /** One sentence for the index table. */
  summary: string;
  /** The physical principle in one line. */
  principle: string;
  family: "Interferometry" | "Quantum foundations" | "Polarization" | "Fourier optics" | "Quantum communication" | "Optical manipulation";
  difficulty: 1 | 2 | 3;
  duration: string;
  evidence: {
    implementation: EvidenceLabel;
    headline: string;
    detail: string;
  };
  kit: KitInfo;
  hardware: HardwareRef[];
  objectives: string[];
  concepts: string[];
  prerequisites: string[];
  sections: TheorySection[];
  equations: Equation[];
  derivations: Derivation[];
  simulation: SimulationSpec;
  procedure: ProcedurePhase[];
  observations: ObservationTemplate[];
  analysis: AnalysisTask[];
  errors: ErrorSource[];
  applications: { title: string; body: string }[];
  questions: Question[];
  references: Reference[];
  /** Cross-links to other experiments. */
  related: ExperimentSlug[];
  /** Completion checklist status, maintained honestly. */
  status?: {
    content: boolean;
    simulation: boolean;
    procedure: boolean;
    analysis: boolean;
    questions: boolean;
    references: boolean;
    validation: boolean;
  };
}

export interface ExperimentMeta {
  slug: ExperimentSlug;
  number: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  summary: string;
  principle: string;
  family: ExperimentContent["family"];
  difficulty: 1 | 2 | 3;
  duration: string;
  evidence: EvidenceLabel;
  accent: "vermilion" | "petrol" | "brass" | "slate";
  concepts: string[];
}

export type HardwareCategory =
  | "Mirrors"
  | "Beam splitting"
  | "Polarization"
  | "Lenses & objectives"
  | "Sources"
  | "Detection"
  | "Nonlinear optics"
  | "Prisms & gratings"
  | "Filters & apertures"
  | "Fibre"
  | "Mounts"
  | "Positioning"
  | "Structure"
  | "Accessories";

export interface SpecRow {
  label: string;
  value: string;
  /** true when the value is a typical/educational figure rather than a verified datasheet value. */
  typical?: boolean;
}

export interface HardwareItem {
  id: string;
  name: string;
  category: HardwareCategory;
  kind: "optical" | "optomechanical" | "instrument";
  manufacturer: string;
  partNumber?: string;
  image?: string;
  summary: string;
  principle: string;
  specs: SpecRow[];
  alignment: string[];
  errors: string[];
  applications: string[];
  experiments: ExperimentSlug[];
  docUrl?: string;
  verification: Verification;
  /** True if this is a generic category rather than a specific catalogue item. */
  generic?: boolean;
}

export interface InstrumentEntry {
  id: string;
  name: string;
  category: "Source" | "Detection" | "Electrical" | "Imaging" | "Positioning" | "Optical";
  summary: string;
  principle: string;
  specs: SpecRow[];
  measurementProcedure: string[];
  noise: string[];
  calibration: string[];
  commonErrors: string[];
  links: string[];
  experiments: ExperimentSlug[];
  docUrl?: string;
}

export interface MathChapter {
  id: string;
  number: string;
  title: string;
  kicker: string;
  summary: string;
  blocks: Block[];
  equations: Equation[];
  derivations: Derivation[];
  interactive?: "superposition" | "jones" | "gaussian" | "fourier" | "uncertainty" | "density" | "abcd";
  problems: Question[];
  references: Reference[];
  related: string[];
}

export interface QuizAttempt {
  id: string;
  experiment: ExperimentSlug | "mixed";
  startedAt: string;
  finishedAt?: string;
  total: number;
  correct: number;
  answers: Record<string, number | string>;
  mode: "practice" | "timed" | "viva";
}
