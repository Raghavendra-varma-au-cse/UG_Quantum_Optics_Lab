import type { ExperimentMeta, ExperimentSlug } from "./types";

/**
 * The canonical laboratory index. Order is the recommended learning
 * progression: interference → quantum foundations → polarization →
 * Fourier optics → communication → manipulation.
 */
export const EXPERIMENTS: ExperimentMeta[] = [
  {
    slug: "michelson-interferometer",
    number: "01",
    title: "Michelson Interferometer",
    shortTitle: "Michelson",
    subtitle: "Precision measurement with two interfering paths",
    summary:
      "Build the canonical two-path interferometer and measure wavelength, refractive index and thermal expansion from fringe motion.",
    principle: "Two coherent beams recombine after different optical path lengths; the phase difference sets the intensity.",
    family: "Interferometry",
    difficulty: 1,
    duration: "3–4 h",
    evidence: "actual",
    accent: "vermilion",
    concepts: ["Superposition", "Coherence", "Optical path difference", "Fringe counting", "Metrology"]
  },
  {
    slug: "mach-zehnder-interferometer",
    number: "02",
    title: "Mach–Zehnder Interferometer",
    shortTitle: "Mach–Zehnder",
    subtitle: "Two paths, complex amplitudes and quantum superposition",
    summary:
      "Trace complex amplitudes through two beam splitters and see how phase, splitting ratio and path information control the outputs.",
    principle: "Unitary beam-splitter transformations map an input mode to two outputs whose probabilities depend on relative phase.",
    family: "Interferometry",
    difficulty: 2,
    duration: "3–4 h",
    evidence: "classical-demo",
    accent: "vermilion",
    concepts: ["Beam-splitter matrices", "Complex amplitudes", "Unitarity", "Superposition", "Path information"]
  },
  {
    slug: "quantum-bomb-tester",
    number: "03",
    title: "Quantum Bomb Tester",
    shortTitle: "Bomb Tester",
    subtitle: "Interaction-free measurement after Elitzur and Vaidman",
    summary:
      "Test bombs with a Mach–Zehnder interferometer: a click in the dark port certifies a live bomb without detonating it.",
    principle: "An absorptive object destroys one path amplitude; the remaining amplitude can no longer cancel at the dark port.",
    family: "Quantum foundations",
    difficulty: 2,
    duration: "2–3 h",
    evidence: "simulation",
    accent: "petrol",
    concepts: ["Interaction-free measurement", "Probability amplitudes", "Counterfactuality", "Measurement"]
  },
  {
    slug: "quantum-eraser",
    number: "04",
    title: "Quantum Eraser",
    shortTitle: "Quantum Eraser",
    subtitle: "Which-path information, marking and erasure",
    summary:
      "Mark the paths with polarization, watch interference vanish, then erase the marker and recover fringes conditionally.",
    principle: "Distinguishability D and visibility V obey D² + V² ≤ 1; erasing the marker restores coherence in a selected subensemble.",
    family: "Quantum foundations",
    difficulty: 3,
    duration: "3–5 h",
    evidence: "classical-demo",
    accent: "petrol",
    concepts: ["Complementarity", "Which-path information", "Polarization marking", "Coincidence detection"]
  },
  {
    slug: "polarization-3d-cinema",
    number: "05",
    title: "Polarization & 3D Cinema",
    shortTitle: "Polarization",
    subtitle: "From Maxwell's vector field to stereo projection",
    summary:
      "Work through Jones calculus, wave plates, Stokes parameters and the Poincaré sphere, then separate left- and right-eye images.",
    principle: "The transverse electric-field vector carries polarization state; anisotropic media and analysers transform it deterministically.",
    family: "Polarization",
    difficulty: 2,
    duration: "4–6 h",
    evidence: "actual",
    accent: "brass",
    concepts: ["Jones vectors", "Malus's law", "Birefringence", "Stokes parameters", "Poincaré sphere", "3D projection"]
  },
  {
    slug: "fourier-optics",
    number: "06",
    title: "Fourier Optics & Spatial Filtering",
    shortTitle: "Fourier Optics",
    subtitle: "A lens as a Fourier transformer in a 4f processor",
    summary:
      "Place an object in a 4f system, inspect its numerical Fourier plane and reconstruct the image after low- and high-pass filtering.",
    principle: "A converging lens produces the Fraunhofer diffraction pattern — the spatial Fourier transform — at its focal plane.",
    family: "Fourier optics",
    difficulty: 3,
    duration: "3–5 h",
    evidence: "actual",
    accent: "slate",
    concepts: ["Spatial frequency", "Fraunhofer diffraction", "Fourier transform", "Spatial filtering", "Resolution"]
  },
  {
    slug: "quantum-key-distribution",
    number: "07",
    title: "Quantum Key Distribution",
    shortTitle: "QKD / BB84",
    subtitle: "Bases, sifting, eavesdropping and the QBER",
    summary:
      "Run BB84 photon by photon, let Eve intercept, sift the key and decide from the error rate whether the channel is secure.",
    principle: "Non-orthogonal quantum states cannot be copied or measured without disturbance; errors reveal eavesdropping.",
    family: "Quantum communication",
    difficulty: 3,
    duration: "3–4 h",
    evidence: "simulation",
    accent: "petrol",
    concepts: ["Qubits", "No-cloning", "BB84", "Sifting", "QBER", "Privacy amplification"]
  },
  {
    slug: "optical-tweezers",
    number: "08",
    title: "Optical Tweezers",
    shortTitle: "Optical Tweezers",
    subtitle: "Trapping and calibrating a micron-scale particle",
    summary:
      "Focus a Gaussian beam, balance gradient and scattering forces, and calibrate trap stiffness from Brownian motion.",
    principle: "A tightly focused beam exerts a gradient force toward the intensity maximum and a scattering force along propagation.",
    family: "Optical manipulation",
    difficulty: 3,
    duration: "4–6 h",
    evidence: "actual",
    accent: "brass",
    concepts: ["Gaussian beams", "Gradient force", "Scattering force", "Brownian motion", "Trap stiffness"]
  }
];

export const EXPERIMENT_SLUGS = EXPERIMENTS.map((e) => e.slug);

export function getExperimentMeta(slug: string): ExperimentMeta | undefined {
  return EXPERIMENTS.find((e) => e.slug === slug);
}

export function experimentNeighbours(slug: ExperimentSlug): {
  previous: ExperimentMeta | null;
  next: ExperimentMeta | null;
} {
  const i = EXPERIMENTS.findIndex((e) => e.slug === slug);
  return {
    previous: i > 0 ? EXPERIMENTS[i - 1]! : null,
    next: i >= 0 && i < EXPERIMENTS.length - 1 ? EXPERIMENTS[i + 1]! : null
  };
}

export const FAMILIES = Array.from(new Set(EXPERIMENTS.map((e) => e.family)));

export const ACCENT_CLASS: Record<ExperimentMeta["accent"], { text: string; bg: string; border: string }> = {
  vermilion: { text: "text-vermilion", bg: "bg-vermilion", border: "border-vermilion" },
  petrol: { text: "text-petrol", bg: "bg-petrol", border: "border-petrol" },
  brass: { text: "text-brass", bg: "bg-brass", border: "border-brass" },
  slate: { text: "text-slate", bg: "bg-slate", border: "border-slate" }
};

export const EVIDENCE_LABEL: Record<
  "actual" | "classical-demo" | "simulation",
  { short: string; long: string; description: string }
> = {
  actual: {
    short: "Lab implementation",
    long: "Actual laboratory implementation",
    description:
      "Can be performed with the listed kit in an undergraduate teaching laboratory using the stated source and detector."
  },
  "classical-demo": {
    short: "Classical demonstration",
    long: "Classical optical demonstration",
    description:
      "The apparatus demonstrates the same mathematics with attenuated coherent light; it is not a single-photon experiment unless a heralded source is added."
  },
  simulation: {
    short: "Theoretical simulation",
    long: "Numerical / theoretical simulation",
    description:
      "No equivalent table-top kit is assumed. Results shown are model outputs, not laboratory measurements."
  }
};

export const DIFFICULTY_LABEL: Record<1 | 2 | 3, string> = {
  1: "Foundational",
  2: "Intermediate",
  3: "Advanced"
};
