import { refs } from "./references";
import type { MathChapter, Reference } from "./types";

/**
 * Advanced Quantum Mechanics for the Quantum Optics Laboratory.
 *
 * Eight chapters that take a student from the classical wave to single-photon
 * interference, measurement, unitary beam-splitter evolution, density
 * matrices, entanglement and decoherence. The conventions match
 * src/lib/physics/quantum.ts: a lossless beam splitter is
 *
 *     B = [[t, ir], [ir, t]],   t = sqrt(1 - eta), r = sqrt(eta)
 *
 * and photon polarization uses |H> = (1, 0), |V> = (0, 1).
 */

const R = (id: string): Reference => {
  const reference = refs[id];
  if (!reference) throw new Error(`Unknown reference id: ${id}`);
  return reference;
};

export const QUANTUM_CHAPTERS: MathChapter[] = [
  /* ------------------------------------------------------------------ */
  /* q01 — Classical wave versus quantum                                */
  /* ------------------------------------------------------------------ */
  {
    id: "q01-classical-wave-vs-quantum",
    number: "Q01",
    title: "Classical Wave versus Quantum Light",
    kicker: "Two descriptions of the same beam",
    summary:
      "A laser beam can be described by a continuous electric field or by a stream of discrete detections. This chapter computes photon energy and flux, introduces Poisson photon statistics, and explains which observations force the quantum description and which do not.",
    interactive: "superposition",
    blocks: [
      {
        type: "lead",
        text: "Attenuate a laser until the detector clicks about once per second and record the position of every click. Nothing changes in the optics, yet the pattern that builds up is made of individual events. The classical wave tells you where the events are likely; it does not tell you when the next one will arrive."
      },
      {
        type: "p",
        text: "Classically, light is a continuous transverse electromagnetic field. Its intensity I is the cycle-averaged Poynting flux in W m⁻², and a detector measures a smooth power proportional to I. Quantum mechanically, the field is quantised and its energy at frequency f is carried in quanta of energy hf. For a monochromatic beam of power P, the mean photon flux is Φ = P/(hf), in photons per second. The two descriptions agree on average for a bright beam: the classical intensity divided by hf is the mean photon flux. They differ in the fluctuations and in what happens when the beam is attenuated to the single-quantum level."
      },
      {
        type: "eq",
        latex:
          "E_{\\gamma}=hf=\\frac{hc}{\\lambda},\\qquad \\Phi=\\frac{P}{hf}=\\frac{P\\lambda}{hc}",
        number: "Q1.1",
        note: "E_γ in J (or eV), h = 6.626 × 10⁻³⁴ J s, λ in m, P in W, Φ in s⁻¹."
      },
      {
        type: "p",
        text: "A detector does not record a smooth wave; it records discrete photoelectric events. Practical single-photon detectors — avalanche photodiodes, photomultiplier tubes and superconducting nanowire detectors — have finite quantum efficiency, dark counts and dead time, all of which must be calibrated before count rates are interpreted. For a stable source with mean count μ in an interval, the probability of k counts is Poissonian, P(k) = μ^k e^{−μ}/k!, with variance equal to the mean. The shot-noise limit σ = √μ is a property of the detection process and of the light. A coherent laser state has Poissonian photon statistics. A strongly attenuated laser remains a coherent state with a small mean photon number: many pulses contain no photon and a few contain two or more. It is not a source of single photons on demand."
      },
      {
        type: "eq",
        latex:
          "P(k)=\\frac{\\mu^k e^{-\\mu}}{k!},\\qquad \\langle k\\rangle=\\operatorname{Var}(k)=\\mu",
        number: "Q1.2"
      },
      {
        type: "callout",
        tone: "misconception",
        title: "Dimming a laser does not produce single photons",
        body:
          "A coherent state with mean photon number μ has P(0) = e^{−μ}, P(1) = μe^{−μ} and P(2) = μ²e^{−μ}/2. At μ = 0.1, about 90% of pulses are empty, 9% contain one photon and 0.45% contain two. A true single-photon source must have a photon-number distribution with P(1) near one and P(2) near zero; in practice it is heralded by detecting one photon of a correlated pair. The laboratory's classical-demo experiments use attenuated coherent light and say so explicitly."
      },
      {
        type: "p",
        text: "The quantum state of a particle is a vector |ψ⟩ in a Hilbert space, or a wavefunction ψ(r) = ⟨r|ψ⟩ in the position representation. The wavefunction is complex and normalised, and its squared modulus gives a probability density. For a photon, the relevant degree of freedom in this laboratory is usually polarization or which path the photon took. A single photon passing a Mach–Zehnder interferometer has an amplitude for each path; the amplitudes interfere, and the detector clicks in one output or the other. Repeating the experiment builds up the classical fringe pattern, one event at a time. In the photon-number basis the same Born rule reads P(k) = ⟨k|ρ|k⟩, where |k⟩ is a state with exactly k photons."
      },
      {
        type: "derivation",
        derivationId: "d-q01-photon-energy"
      },
      {
        type: "numeric",
        title: "Energy of a visible photon",
        statement:
          "Find the energy of a 633 nm photon in joules and electronvolts, and the total energy of 10⁶ such photons.",
        latex:
          "E_{\\gamma}=\\frac{(6.626\\times10^{-34})(2.998\\times10^8)}{633\\times10^{-9}}=3.14\\times10^{-19}\\ \\mathrm{J}",
        result:
          "E_γ = 3.14 × 10⁻¹⁹ J = 1.96 eV. One million photons carry 3.14 × 10⁻¹³ J = 0.314 pJ, a macroscopic but still tiny pulse energy. The inverse relation, about 3.2 × 10¹⁸ photons per joule at 633 nm, is useful for converting detector energies into photon counts."
      },
      {
        type: "numeric",
        title: "From milliwatts to photons per pulse",
        statement:
          "A 1.00 mW laser at 633 nm is attenuated by optical density 6 and then gated into 1.00 ns pulses. Find the mean photon number per pulse and the probabilities of zero and one photon.",
        latex:
          "\\Phi_0=\\frac{10^{-3}}{3.14\\times10^{-19}}=3.19\\times10^{15}\\ \\mathrm{s^{-1}},\\qquad \\Phi=10^{-6}\\Phi_0=3.19\\times10^9\\ \\mathrm{s^{-1}}",
        result:
          "After OD 6 the flux is 3.19 × 10⁹ s⁻¹. In a 1 ns gate the mean is μ = 3.19 photons. Then P(0) = e^{−3.19} = 0.041 and P(1) = 3.19e^{−3.19} = 0.131. The pulses are still Poissonian; reducing the mean to 0.01 would make 99% of pulses empty and 0.005% contain two photons, which is why a strongly attenuated laser is a poor approximation to a single-photon source."
      }
    ],
    equations: [
      {
        id: "q01-e1",
        latex:
          "E_{\\gamma}=hf=\\frac{hc}{\\lambda}",
        name: "Photon energy",
        symbols: [
          { symbol: "E_{\\gamma}", meaning: "Energy of one photon", unit: "J" },
          { symbol: "h", meaning: "Planck constant", unit: "J s" },
          { symbol: "f", meaning: "Optical frequency", unit: "Hz" },
          { symbol: "\\lambda", meaning: "Vacuum wavelength", unit: "m" }
        ],
        interpretation:
          "The energy of a photon is proportional to frequency and inversely proportional to wavelength. Visible photons carry a few electronvolts; telecom photons near 1550 nm carry about 0.8 eV.",
        assumptions: ["Free-space photon", "Monochromatic limit", "No medium dispersion in the energy relation"],
        usedIn: ["Photon counting", "Detector calibration", "QKD", "Photochemistry"],
        numericExample: {
          statement: "A 633 nm photon has E = hc/λ = 3.14 × 10⁻¹⁹ J = 1.96 eV.",
          latex: "E_{\\gamma}=1.96\\ \\mathrm{eV}"
        }
      },
      {
        id: "q01-e2",
        latex:
          "\\Phi=\\frac{P}{hf}=\\frac{P\\lambda}{hc}",
        name: "Mean photon flux",
        symbols: [
          { symbol: "\\Phi", meaning: "Mean photons per second", unit: "s⁻¹" },
          { symbol: "P", meaning: "Optical power", unit: "W" }
        ],
        interpretation:
          "Power divided by photon energy gives the mean arrival rate. It converts a power-meter reading into the number of quantum events per second.",
        assumptions: ["Monochromatic or narrow-band light", "Power measured over many cycles", "Uniform beam cross-section"],
        usedIn: ["Attenuator design", "Single-photon experiments", "Detector dead-time checks"],
        numericExample: {
          statement: "1 mW at 633 nm gives 3.19 × 10¹⁵ photons s⁻¹.",
          latex: "\\Phi=3.19\\times10^{15}\\ \\mathrm{s^{-1}}"
        }
      },
      {
        id: "q01-e3",
        latex:
          "P(k)=\\frac{\\mu^k e^{-\\mu}}{k!}",
        name: "Poisson photon-count distribution",
        symbols: [
          { symbol: "P(k)", meaning: "Probability of k counts", unit: "dimensionless" },
          { symbol: "\\mu", meaning: "Mean count in the interval", unit: "counts" }
        ],
        interpretation:
          "Independent random arrivals give Poisson statistics. The variance equals the mean, so the shot noise is √μ.",
        assumptions: ["Constant mean rate", "Independent arrivals", "Detector dead time negligible", "No excess noise"],
        usedIn: ["Photon counting", "QKD", "Detector characterisation", "Shot-noise analysis"],
        numericExample: {
          statement: "For μ = 3.19, P(0) = 0.041 and P(1) = 0.131.",
          latex: "P(0)=e^{-3.19}=0.041"
        }
      },
      {
        id: "q01-e4",
        latex:
          "P(k)=\\langle k|\\rho|k\\rangle,\\qquad \\sum_k P(k)=1",
        name: "Born rule in the photon-number basis",
        symbols: [
          { symbol: "|k\\rangle", meaning: "State with k photons", unit: "dimensionless" },
          { symbol: "\\rho", meaning: "State of the field", unit: "dimensionless" }
        ],
        interpretation:
          "The probability of detecting k photons is the expectation of the projector |k⟩⟨k|. For a coherent state the result is the Poisson distribution; for a Fock state |n⟩ it is a delta function at k = n.",
        assumptions: ["Ideal photon-number-resolving detector", "Mode matching to the detector", "No loss"],
        usedIn: ["Photon statistics", "State preparation", "Detector tomography"],
        numericExample: {
          statement: "A Fock state |2⟩ gives P(2) = 1 and all other P(k) = 0.",
          latex: "P(2)=\\langle2|2\\rangle\\langle2|2\\rangle=1"
        }
      }
    ],
    derivations: [
      {
        id: "d-q01-photon-energy",
        title: "Photon energy and flux from the wave relation",
        intro:
          "The two relations are Planck's quantum hypothesis combined with the classical wave identity c = λf.",
        steps: [
          {
            label: "1",
            text: "Planck's hypothesis assigns energy hf to one quantum of oscillation.",
            latex: "E=hf"
          },
          {
            label: "2",
            text: "For a wave in vacuum, frequency and wavelength are related by the speed of light.",
            latex: "c=\\lambda f\\;\\Rightarrow\\;f=\\frac{c}{\\lambda}"
          },
          {
            label: "3",
            text: "Substitute the frequency.",
            latex: "E=\\frac{hc}{\\lambda}"
          },
          {
            label: "4",
            text: "Divide the beam power by the energy per photon to obtain the mean flux.",
            latex: "\\Phi=\\frac{P}{E}=\\frac{P\\lambda}{hc}"
          },
          {
            label: "5",
            text: "Check the numerical scale at 633 nm.",
            latex: "E=3.14\\times10^{-19}\\ \\mathrm{J},\\qquad \\Phi=3.19\\times10^{15}\\ \\mathrm{s^{-1}}\\ \\text{per mW}"
          }
        ],
        result: {
          latex: "E_{\\gamma}=\\frac{hc}{\\lambda},\\qquad \\Phi=\\frac{P\\lambda}{hc}",
          text:
            "A milliwatt of visible light is an enormous number of photons per second by single-photon standards. This is why strong attenuation and careful shielding are needed before single-photon detectors can be used."
        },
        assumptions: ["Vacuum or air with n ≈ 1", "Monochromatic light", "Power measured over a time long compared with the optical period"]
      }
    ],
    problems: [
      {
        id: "q01-p1",
        type: "numerical",
        difficulty: 1,
        topic: "Photon energy",
        prompt: "Find the energy in electronvolts of a 1550 nm telecom photon.",
        answer:
          "E = hc/λ = (6.626 × 10⁻³⁴)(2.998 × 10⁸)/(1550 × 10⁻⁹) = 1.282 × 10⁻¹⁹ J. Divide by 1.602 × 10⁻¹⁹ J eV⁻¹ to get 0.800 eV. This is below the silicon band gap of about 1.1 eV, which is why 1550 nm needs InGaAs detectors rather than silicon.",
        numeric: { value: 0.8, tolerance: 0.005, unit: "eV" },
        marks: 2
      },
      {
        id: "q01-p2",
        type: "numerical",
        difficulty: 2,
        topic: "Photon flux",
        prompt:
          "A 1.00 nW beam at 500 nm falls on a detector. How many photons arrive per second?",
        answer:
          "E = hc/λ = (6.626 × 10⁻³⁴)(2.998 × 10⁸)/(500 × 10⁻⁹) = 3.973 × 10⁻¹⁹ J. Then Φ = 1.00 × 10⁻⁹/3.973 × 10⁻¹⁹ = 2.52 × 10⁹ photons s⁻¹.",
        numeric: { value: 2.52e9, tolerance: 0.02e9, unit: "s⁻¹" },
        marks: 2
      },
      {
        id: "q01-p3",
        type: "numerical",
        difficulty: 1,
        topic: "Poisson statistics",
        prompt:
          "A pulsed source has a mean of 2.0 photons per pulse. What is the probability that a pulse contains no photon?",
        answer:
          "P(0) = e^{−2.0} = 0.135. About 13.5% of pulses are empty, so a counter gated on every pulse would record a click in only 86.5% of pulses even with a perfect detector.",
        numeric: { value: 0.135, tolerance: 0.002, unit: "dimensionless" },
        marks: 1
      },
      {
        id: "q01-p4",
        type: "mcq",
        difficulty: 1,
        topic: "Single-photon sources",
        prompt:
          "A laser is attenuated so that it delivers a mean of 0.1 photon per pulse. Which statement best describes the light?",
        options: [
          "It is a source of single photons on demand",
          "It is a coherent state with a Poissonian distribution: about 90% empty, 9% one photon, 0.45% two photons",
          "It is a Fock state with exactly one photon per pulse",
          "It has become incoherent and cannot interfere"
        ],
        answerIndex: 1,
        answer:
          "Attenuation reduces the mean amplitude of a coherent state but does not change its Poissonian statistics. P(0) = e^{−0.1} = 0.905, P(1) = 0.0905 and P(2) = 0.0045. Single-photon interference is still possible because each photon's amplitude interferes with itself; the issue is the uncontrolled photon number, not coherence.",
        explanation:
          "A heralded source is needed for on-demand single photons.",
        marks: 2
      },
      {
        id: "q01-p5",
        type: "short",
        difficulty: 2,
        topic: "Evidence for quantisation",
        prompt:
          "Name two experimental observations that a purely classical wave theory cannot explain, and explain why.",
        answer:
          "First, photon antibunching: a single atom or a single quantum emitter emits one photon at a time, so the second-order correlation function at zero delay vanishes, g²(0) = 0. A classical wave with a stable intensity would give g²(0) ≥ 1. Second, the photoelectric threshold and the discrete detection events at low intensity: a classical wave of arbitrarily low intensity would eventually deposit enough energy continuously, whereas the energy is delivered in quanta hf and no photoelectron is emitted below the threshold. A third example is the violation of a Bell inequality by entangled photon pairs, which cannot be reproduced by any local classical model.",
        marks: 3
      },
      {
        id: "q01-p6",
        type: "derivation",
        difficulty: 2,
        topic: "Photon flux",
        prompt:
          "Starting from E = hc/λ and Φ = P/E, derive the photon flux for a beam of power P and wavelength λ. Evaluate it for a 1.00 µW beam at 1550 nm.",
        answer:
          "The photon energy is E = hc/λ. Dividing the beam power by the energy per photon gives Φ = P/E = Pλ/(hc). For P = 1.00 × 10⁻⁶ W, λ = 1550 × 10⁻⁹ m, h = 6.626 × 10⁻³⁴ J s and c = 2.998 × 10⁸ m s⁻¹, E = 1.282 × 10⁻¹⁹ J and Φ = 7.80 × 10¹² photons s⁻¹. At a 1 GHz modulation rate this is about 7.8 photons per bit on average.",
        numeric: { value: 7.8e12, tolerance: 0.1e12, unit: "s⁻¹" },
        marks: 2
      }
    ],
    references: [R("loudon"), R("saleh"), R("grangier1986"), R("hecht"), R("nielsen")],
    related: [
      "mach-zehnder-interferometer",
      "quantum-key-distribution",
      "interference-and-coherence",
      "waves-and-maxwell",
      "q02-state-vectors-and-hilbert-space"
    ]
  },

  /* ------------------------------------------------------------------ */
  /* q02 — State vectors and Hilbert space                              */
  /* ------------------------------------------------------------------ */
  {
    id: "q02-state-vectors-and-hilbert-space",
    number: "Q02",
    title: "State Vectors and Hilbert Space",
    kicker: "A state is a direction, not a list of facts",
    summary:
      "Quantum states are unit vectors in a complex inner-product space. This chapter introduces kets and bras, orthonormal bases, expansion coefficients, global versus relative phase, and the Born rule, using photon polarization as the concrete two-level example.",
    interactive: "superposition",
    blocks: [
      {
        type: "lead",
        text: "A classical bit is 0 or 1. A quantum bit is a unit vector in a two-dimensional complex space, and the basis labels 0 and 1 are just two directions in that space. The geometry — angles, overlaps, projections — is what the laboratory measures."
      },
      {
        type: "p",
        text: "A quantum state is written as a ket |ψ⟩. Kets form a complex vector space: they can be added and multiplied by complex scalars. For a photon's polarization the space is two-dimensional, with basis kets |H⟩ and |V⟩. Any state can be expanded as |ψ⟩ = c_H|H⟩ + c_V|V⟩. The coefficients c_H and c_V are complex amplitudes. The same physical state can be expanded in any orthonormal basis, for example the diagonal basis |D⟩ = (|H⟩ + |V⟩)/√2 and |A⟩ = (|H⟩ − |V⟩)/√2, or the circular basis |R⟩ = (|H⟩ + i|V⟩)/√2 and |L⟩ = (|H⟩ − i|V⟩)/√2. The amplitudes change with the basis; the vector does not."
      },
      {
        type: "eq",
        latex:
          "|\\psi\\rangle=\\sum_n c_n|n\\rangle,\\qquad c_n=\\langle n|\\psi\\rangle",
        number: "Q2.1"
      },
      {
        type: "p",
        text: "The bra ⟨ψ| is the conjugate transpose of |ψ⟩. The inner product ⟨φ|ψ⟩ is a complex number with conjugate symmetry ⟨ψ|φ⟩ = ⟨φ|ψ⟩*, and its squared modulus is the probability of finding |ψ⟩ in the state |φ⟩ under a projective measurement. An orthonormal basis satisfies ⟨m|n⟩ = δ_mn. Normalisation requires ⟨ψ|ψ⟩ = Σ|c_n|² = 1. The coefficients are not probabilities, but their squared moduli are, and the two bases are related by a unitary change of basis."
      },
      {
        type: "eq",
        latex:
          "\\langle\\phi|\\psi\\rangle=\\sum_n\\phi_n^*\\psi_n,\\qquad \\langle m|n\\rangle=\\delta_{mn},\\qquad \\sum_n|c_n|^2=1",
        number: "Q2.2"
      },
      {
        type: "p",
        text: "Two kinds of phase must be distinguished. A global phase multiplies the whole state by e^{iα} and changes nothing measurable: every probability |⟨φ|ψ⟩|² and every expectation value is invariant. A relative phase multiplies one component only and changes the interference between components. The state (|H⟩ + |V⟩)/√2 is diagonal linear polarization; the state (|H⟩ − |V⟩)/√2 is orthogonal to it; and (|H⟩ + i|V⟩)/√2 is circular. All three have the same H/V outcome probabilities but different behavior in other bases."
      },
      {
        type: "callout",
        tone: "misconception",
        title: "A superposition is not a classical mixture",
        body:
          "The state (|H⟩ + |V⟩)/√2 is not “the photon is either H or V with 50% probability”. A mixture with that description has a density matrix diagonal in the H/V basis and no off-diagonal terms; the superposition has off-diagonal coherence. A 45° polarizer transmits 100% of the superposition but only 50% of the mixture. The difference is measurable and is the entire content of Chapters Q03 and Q06."
      },
      {
        type: "derivation",
        derivationId: "d-q02-born"
      },
      {
        type: "numeric",
        title: "Normalising a two-component state",
        statement:
          "Normalise the unnormalised state |ψ⟩ = 2|H⟩ + (1 − i)|V⟩ and find the probabilities of H and V outcomes.",
        latex:
          "\\langle\\psi|\\psi\\rangle=|2|^2+|1-i|^2=4+2=6,\\qquad |\\psi\\rangle=\\frac{1}{\\sqrt6}\\left(2|H\\rangle+(1-i)|V\\rangle\\right)",
        result:
          "The normalised amplitudes are 2/√6 and (1 − i)/√6. The H probability is |2/√6|² = 4/6 = 2/3 and the V probability is |1 − i|²/6 = 2/6 = 1/3. The relative phase of (1 − i) is −45°, which is physical and affects measurements in the D/A basis."
      },
      {
        type: "numeric",
        title: "Changing basis",
        statement:
          "The state |ψ⟩ = (|H⟩ + i|V⟩)/√2 is measured first in the diagonal basis and then in the circular basis. Find the probabilities.",
        latex:
          "\\langle D|\\psi\\rangle=\\frac{1}{2}(1+i),\\qquad P(D)=\\left|\\frac{1+i}{2}\\right|^2=\\frac12",
        result:
          "In the diagonal basis, P(D) = P(A) = ½. In the circular basis, ⟨R|ψ⟩ = (1 + i·(−i))/2 = 1, so P(R) = 1 and P(L) = 0. The state is an eigenstate of circular polarization. A measurement basis that matches the state gives a certain outcome; a mutually unbiased basis gives 50/50."
      }
    ],
    equations: [
      {
        id: "q02-e1",
        latex:
          "|\\psi\\rangle=\\sum_n c_n|n\\rangle,\\qquad c_n=\\langle n|\\psi\\rangle",
        name: "Expansion of a state in a basis",
        symbols: [
          { symbol: "|\\psi\\rangle", meaning: "State ket", unit: "dimensionless" },
          { symbol: "c_n", meaning: "Complex amplitude", unit: "dimensionless" },
          { symbol: "|n\\rangle", meaning: "Orthonormal basis ket", unit: "dimensionless" }
        ],
        interpretation:
          "The state is a vector; the amplitudes are its coordinates in the chosen basis. The basis is a choice, not a physical assumption.",
        assumptions: ["Complete orthonormal basis", "Normalised state", "Finite dimension for qubits"],
        usedIn: ["Polarization encoding", "Beam-splitter analysis", "Measurement", "State tomography"],
        numericExample: {
          statement: "|D⟩ = (|H⟩ + |V⟩)/√2 has c_H = c_V = 1/√2.",
          latex: "c_H=c_V=\\frac{1}{\\sqrt2}"
        }
      },
      {
        id: "q02-e2",
        latex:
          "\\langle\\phi|\\psi\\rangle=\\sum_n\\phi_n^*\\psi_n,\\qquad \\langle\\psi|\\phi\\rangle=\\langle\\phi|\\psi\\rangle^*",
        name: "Inner product",
        symbols: [
          { symbol: "\\langle\\phi|", meaning: "Bra corresponding to |φ⟩", unit: "dimensionless" },
          { symbol: "\\langle\\phi|\\psi\\rangle", meaning: "Complex overlap", unit: "dimensionless" }
        ],
        interpretation:
          "The inner product measures the overlap of two states. Orthogonal states have zero overlap; parallel states have unit modulus.",
        assumptions: ["Complex vector space", "Positive-definite inner product", "Normalised states"],
        usedIn: ["Born rule", "Visibility", "Fidelity", "Basis changes"],
        numericExample: {
          statement: "⟨H|V⟩ = 0 and ⟨D|D⟩ = 1.",
          latex: "\\langle H|V\\rangle=0"
        }
      },
      {
        id: "q02-e3",
        latex:
          "\\sum_n|c_n|^2=1,\\qquad \\sum_n|n\\rangle\\langle n|=I",
        name: "Normalisation and completeness",
        symbols: [
          { symbol: "c_n", meaning: "Expansion amplitude", unit: "dimensionless" },
          { symbol: "I", meaning: "Identity operator", unit: "dimensionless" }
        ],
        interpretation:
          "Probabilities sum to one, and inserting a complete basis between states changes nothing. Completeness is the algebraic statement that the basis spans the space.",
        assumptions: ["Orthonormal basis", "Physical state normalisable"],
        usedIn: ["Born rule", "Trace calculations", "Interferometer amplitudes"],
        numericExample: {
          statement: "For |D⟩, |c_H|² + |c_V|² = ½ + ½ = 1.",
          latex: "\\frac12+\\frac12=1"
        }
      },
      {
        id: "q02-e4",
        latex:
          "P(a)=|\\langle a|\\psi\\rangle|^2",
        name: "Born rule for a pure state",
        symbols: [
          { symbol: "P(a)", meaning: "Probability of outcome a", unit: "dimensionless" },
          { symbol: "|a\\rangle", meaning: "Eigenstate of the measured observable", unit: "dimensionless" }
        ],
        interpretation:
          "The probability is the squared overlap between the state and the measurement basis vector. Amplitudes add before the square; probabilities do not.",
        assumptions: ["Projective measurement", "Normalised state", "Non-degenerate outcome for this form"],
        usedIn: ["Polarization measurement", "MZ output probabilities", "QKD sifting"],
        numericExample: {
          statement: "For |ψ⟩ = (H + iV)/√2 measured in D, P(D) = ½.",
          latex: "P(D)=\\left|\\frac{1+i}{2}\\right|^2=\\frac12"
        }
      },
      {
        id: "q02-e5",
        latex:
          "|D\\rangle=\\frac{|H\\rangle+|V\\rangle}{\\sqrt2},\\quad |A\\rangle=\\frac{|H\\rangle-|V\\rangle}{\\sqrt2},\\quad |R\\rangle=\\frac{|H\\rangle+i|V\\rangle}{\\sqrt2},\\quad |L\\rangle=\\frac{|H\\rangle-i|V\\rangle}{\\sqrt2}",
        name: "Common polarization bases",
        symbols: [
          { symbol: "|D\\rangle,|A\\rangle", meaning: "Diagonal and antidiagonal linear states", unit: "dimensionless" },
          { symbol: "|R\\rangle,|L\\rangle", meaning: "Right and left circular states", unit: "dimensionless" }
        ],
        interpretation:
          "The three standard bases are mutually unbiased: a state certain in one basis gives 50/50 outcomes in either of the others. This is the basis of BB84.",
        assumptions: ["H/V convention fixed", "Phase convention fixed (sign of i)"],
        usedIn: ["BB84", "Quantum eraser", "Bell tests", "Polarimetry"],
        numericExample: {
          statement: "⟨D|R⟩ = (1 + i)/2 has modulus 1/√2, so P = ½.",
          latex: "|\\langle D|R\\rangle|^2=\\frac12"
        }
      }
    ],
    derivations: [
      {
        id: "d-q02-born",
        title: "From the expansion to the Born rule",
        intro:
          "The Born rule is consistent with orthonormality and completeness; it is not an extra independent axiom about coefficients.",
        steps: [
          {
            label: "1",
            text: "Expand the state in an orthonormal measurement basis.",
            latex: "|\\psi\\rangle=\\sum_n c_n|n\\rangle"
          },
          {
            label: "2",
            text: "Project onto a particular outcome |a⟩ and use orthonormality.",
            latex: "\\langle a|\\psi\\rangle=\\sum_n c_n\\langle a|n\\rangle=c_a"
          },
          {
            label: "3",
            text: "The probability is the squared modulus of the projected amplitude.",
            latex: "P(a)=|c_a|^2=|\\langle a|\\psi\\rangle|^2"
          },
          {
            label: "4",
            text: "Sum over all outcomes and use completeness.",
            latex:
              "\\sum_aP(a)=\\sum_a\\langle\\psi|a\\rangle\\langle a|\\psi\\rangle=\\langle\\psi|\\left(\\sum_a|a\\rangle\\langle a|\\right)|\\psi\\rangle=1"
          },
          {
            label: "5",
            text: "For a qubit in the H/V basis the rule reads P(H) = |c_H|² and P(V) = |c_V|².",
            latex: "P(H)=|c_H|^2,\\qquad P(V)=|c_V|^2"
          }
        ],
        result: {
          latex: "P(a)=|\\langle a|\\psi\\rangle|^2,\\qquad \\sum_aP(a)=1",
          text:
            "Probabilities are squared overlaps. The amplitudes add coherently when the intermediate states are indistinguishable; the probabilities add only when the alternatives are distinguishable."
        },
        assumptions: ["Projective measurement", "Orthonormal basis", "Normalised state", "No detector inefficiency"]
      }
    ],
    problems: [
      {
        id: "q02-p1",
        type: "numerical",
        difficulty: 1,
        topic: "Normalisation",
        prompt:
          "Normalise |ψ⟩ = |H⟩ + √3|V⟩ and find the probability of H.",
        answer:
          "⟨ψ|ψ⟩ = 1 + 3 = 4, so the normalised state is (|H⟩ + √3|V⟩)/2. The H probability is 1/4 = 0.25 and the V probability is 3/4.",
        numeric: { value: 0.25, tolerance: 0.001, unit: "dimensionless" },
        marks: 2
      },
      {
        id: "q02-p2",
        type: "numerical",
        difficulty: 2,
        topic: "Basis change",
        prompt:
          "The state |+⟩ = (|H⟩ + |V⟩)/√2 is measured in the circular basis. Find P(R).",
        answer:
          "⟨R|+⟩ = ½(1·1 + (−i)·1) = (1 − i)/2. Its squared modulus is (1 + 1)/4 = ½. The result is 50/50, as required for mutually unbiased bases: a state definite in the H/V basis has no definite circular polarization.",
        numeric: { value: 0.5, tolerance: 0.001, unit: "dimensionless" },
        marks: 2
      },
      {
        id: "q02-p3",
        type: "mcq",
        difficulty: 1,
        topic: "Global phase",
        prompt: "Which operation changes the physical predictions of a state?",
        options: [
          "Multiplying the whole state by e^{iπ/4}",
          "Multiplying only the |V⟩ component by e^{iπ/4}",
          "Adding an overall normalisation constant and then renormalising",
          "Writing the same state in a different basis"
        ],
        answerIndex: 1,
        answer:
          "A relative phase between components changes interference and is observable. A global phase cancels from every probability and expectation value. Changing basis changes the coordinates, not the vector.",
        explanation:
          "Only the relative phase carries physical information.",
        marks: 1
      },
      {
        id: "q02-p4",
        type: "short",
        difficulty: 2,
        topic: "Basis independence",
        prompt:
          "Explain why the same physical state can have different expansion coefficients in different bases without being a different state.",
        answer:
          "A ket is an abstract vector. A basis is a set of coordinate axes; the coefficients are the components of the vector along those axes. Rotating the axes changes the components but not the vector. Physical predictions are inner products, which are invariant under a unitary change of basis: if |n′⟩ = U|n⟩, then the amplitudes transform by U† and all probabilities |⟨a|ψ⟩|² are unchanged.",
        marks: 3
      },
      {
        id: "q02-p5",
        type: "derivation",
        difficulty: 2,
        topic: "Completeness",
        prompt:
          "Show that the expansion coefficients of a state in an orthonormal basis are given by inner products, and that the norm is the sum of squared moduli.",
        answer:
          "Write |ψ⟩ = Σc_n|n⟩. Project with ⟨m|: ⟨m|ψ⟩ = Σc_n⟨m|n⟩ = Σc_nδ_mn = c_m. Then ⟨ψ|ψ⟩ = Σ_mΣ_n c_m*c_n⟨m|n⟩ = Σ_n|c_n|². Normalisation sets this equal to one.",
        marks: 3
      },
      {
        id: "q02-p6",
        type: "numerical",
        difficulty: 1,
        topic: "Dimension",
        prompt:
          "What is the dimension of the Hilbert space of three polarization qubits? How many real parameters specify a pure state after normalisation and global phase are removed?",
        answer:
          "The dimension is 2³ = 8. A pure state in dimension d has 2d real parameters; normalisation removes one and global phase removes another, leaving 2d − 2 = 14 real parameters. For one qubit this gives 2, the Bloch-sphere angles.",
        numeric: { value: 8, tolerance: 0, unit: "dimension" },
        marks: 2
      }
    ],
    references: [R("nielsen"), R("griffiths"), R("loudon"), R("saleh")],
    related: [
      "mach-zehnder-interferometer",
      "polarization-3d-cinema",
      "linear-algebra-and-hilbert-spaces",
      "q03-superposition-and-complex-amplitudes",
      "q06-density-matrices-pure-and-mixed"
    ]
  },

  /* ------------------------------------------------------------------ */
  /* q03 — Superposition and complex amplitudes                         */
  /* ------------------------------------------------------------------ */
  {
    id: "q03-superposition-and-complex-amplitudes",
    number: "Q03",
    title: "Superposition and Complex Amplitudes",
    kicker: "Amplitudes add; probabilities do not",
    summary:
      "Single-photon interference is the addition of complex amplitudes for indistinguishable alternatives. This chapter derives the interference term, applies it to the Mach–Zehnder interferometer, and explains why blocking one path changes the counting statistics even when the photon is never detected in the blocked path.",
    interactive: "superposition",
    blocks: [
      {
        type: "lead",
        text: "Send one photon at a time into a Mach–Zehnder interferometer. Each photon is detected once, at one output. Yet the rate at which photons appear at that output depends on the phase in the other arm. The photon's amplitude explored both arms; the detector saw one arrival."
      },
      {
        type: "p",
        text: "If a photon can reach a detector by two indistinguishable routes, the probability amplitude is the sum of the amplitudes for each route: a = a₁ + a₂. The probability is P = |a₁ + a₂|², not |a₁|² + |a₂|². Writing a_j = A_j e^{iφ_j}, the cross term is 2A₁A₂cos(φ₁ − φ₂). This is the same algebra as classical two-beam interference, with one conceptual change: the amplitude describes the possibility of a single detection event, not a continuous field. The interference disappears if the two routes can be distinguished in principle, because then the amplitudes belong to orthogonal final states and cannot be added."
      },
      {
        type: "p",
        text: "Expanding the square gives P = |a₁|² + |a₂|² + 2|a₁||a₂|cos δ. The first two terms are the probabilities that would be measured if the other path were blocked. The third is the interference term. It can be positive, negative or zero. The visibility of the resulting fringe pattern is V = 2|a₁a₂|/(|a₁|² + |a₂|²), which is one for balanced amplitudes and less than one otherwise. A phase plate in one arm changes δ without changing either amplitude, moving the pattern but not its contrast."
      },
      {
        type: "eq",
        latex:
          "P=|a_1|^2+|a_2|^2+2|a_1||a_2|\\cos\\delta,\\qquad V=\\frac{2|a_1a_2|}{|a_1|^2+|a_2|^2}",
        number: "Q3.2"
      },
      {
        type: "p",
        text: "A balanced Mach–Zehnder interferometer makes the algebra concrete. The first 50:50 beam splitter puts the photon into an equal superposition of the two paths. The phase shifter multiplies one amplitude by e^{iδ}. The second beam splitter recombines the amplitudes. With the convention used by the laboratory simulation, the dark-port probability is (1 − cos δ)/2 and the bright-port probability is (1 + cos δ)/2. At δ = 0 all photons leave by the bright port; at δ = π all leave by the dark port. The ports are complementary, so the total probability remains one."
      },
      {
        type: "eq",
        latex:
          "P_{\\mathrm{dark}}=\\frac{1-\\cos\\delta}{2},\\qquad P_{\\mathrm{bright}}=\\frac{1+\\cos\\delta}{2}",
        number: "Q3.3"
      },
      {
        type: "callout",
        tone: "misconception",
        title: "The photon does not split into two half-photons",
        body:
          "The beam splitter does not divide a photon into two pieces that both trigger detectors. It entangles the photon's internal path degree of freedom with the spatial modes, and a detection collapses the state to one mode. The amplitude is a calculational object encoding the possibility of arrival; it is not a classical subdivision of energy. Only one detector clicks per photon, and the total energy delivered is hf, not hf/2 in each arm."
      },
      {
        type: "derivation",
        derivationId: "d-q03-mz"
      },
      {
        type: "numeric",
        title: "Mach–Zehnder at a 60° phase",
        statement:
          "A balanced Mach–Zehnder interferometer has a relative phase δ = 60.0° between its arms. Find the probabilities at the dark and bright ports, and the visibility of the fringe pattern as δ is scanned.",
        latex:
          "P_{\\mathrm{dark}}=\\frac{1-\\cos60^\\circ}{2}=\\frac{1-0.500}{2}=0.250",
        result:
          "P_dark = 0.250 and P_bright = 0.750. The visibility is V = (P_max − P_min)/(P_max + P_min) = (1 − 0)/1 = 1 because the two amplitudes are balanced and no which-path information exists. A scan of δ from 0 to 2π moves all the light from one port to the other and back."
      },
      {
        type: "numeric",
        title: "Two amplitudes recombined at a 50:50 splitter",
        statement:
          "Two routes have amplitudes 0.60 and 0.80 and are recombined by a 50:50 beam splitter before detection. Find the probability at one output when the routes are in phase and when they differ by π.",
        latex:
          "P_{\\mathrm{in}}=\\frac{|0.60+0.80|^2}{2}=0.98,\\qquad P_{\\pi}=\\frac{|0.60-0.80|^2}{2}=0.02",
        result:
          "The beam splitter supplies a factor 1/√2 to each amplitude, so the output probability is |a₁ + a₂|²/2. In phase, P = 0.98; antiphase, P = 0.02. The other output receives the complementary 0.02 and 0.98, so the total probability is one in both cases. The strong modulation with unequal amplitudes is possible because the splitter, not the source, sets the final normalization."
      }
    ],
    equations: [
      {
        id: "q03-e1",
        latex:
          "|\\psi\\rangle=a_1|1\\rangle+a_2|2\\rangle,\\qquad |a_1|^2+|a_2|^2=1",
        name: "Two-path superposition",
        symbols: [
          { symbol: "a_1,a_2", meaning: "Complex amplitudes for the two paths", unit: "dimensionless" },
          { symbol: "|1\\rangle,|2\\rangle", meaning: "Orthogonal path states", unit: "dimensionless" }
        ],
        interpretation:
          "The state is a vector in a two-dimensional path space. The amplitudes are not probabilities; their squared moduli are the probabilities that would be measured if the other path were blocked.",
        assumptions: ["Two indistinguishable paths", "Pure state", "No entanglement with the environment"],
        usedIn: ["Mach–Zehnder", "Young's slits", "Bomb tester", "Quantum eraser"],
        numericExample: {
          statement: "A balanced state has a₁ = a₂ = 1/√2.",
          latex: "|a_1|^2=|a_2|^2=\\frac12"
        }
      },
      {
        id: "q03-e2",
        latex:
          "P=|a_1+a_2|^2=|a_1|^2+|a_2|^2+2|a_1a_2|\\cos\\delta",
        name: "Interference of two amplitudes",
        symbols: [
          { symbol: "P", meaning: "Detection probability", unit: "dimensionless" },
          { symbol: "\\delta", meaning: "Relative phase, φ₁ − φ₂", unit: "rad" }
        ],
        interpretation:
          "The cross term is the interference. It is present only when the two alternatives are indistinguishable at the detector.",
        assumptions: ["Same final detection state", "Stable relative phase", "Coherent source"],
        usedIn: ["Single-photon interference", "MZ fringes", "Ramsey interferometry"],
        numericExample: {
          statement: "Balanced amplitudes with δ = 60° give P = 0.75.",
          latex: "P=\\frac12+\\frac12+\\frac12\\cos60^\\circ=0.75"
        }
      },
      {
        id: "q03-e3",
        latex:
          "V=\\frac{P_{\\max}-P_{\\min}}{P_{\\max}+P_{\\min}}=\\frac{2|a_1a_2|}{|a_1|^2+|a_2|^2}",
        name: "Fringe visibility of a two-path state",
        symbols: [
          { symbol: "V", meaning: "Visibility", unit: "dimensionless" },
          { symbol: "P_{\\max},P_{\\min}", meaning: "Extreme detection probabilities", unit: "dimensionless" }
        ],
        interpretation:
          "Visibility measures how much of the detection rate is modulated by phase. Balanced, coherent paths give unity; unequal amplitudes or which-path information reduce it.",
        assumptions: ["Two-path interference", "Phase scanned uniformly", "No background counts"],
        usedIn: ["MZ alignment", "Eraser experiments", "Coherence measurement"],
        numericExample: {
          statement: "Amplitudes 1/√2 and 1/√2 give V = 1.",
          latex: "V=\\frac{2(1/2)}{1}=1"
        }
      },
      {
        id: "q03-e4",
        latex:
          "P_{\\mathrm{dark}}=\\frac{1-\\cos\\delta}{2},\\qquad P_{\\mathrm{bright}}=\\frac{1+\\cos\\delta}{2}",
        name: "Balanced Mach–Zehnder output probabilities",
        symbols: [
          { symbol: "\\delta", meaning: "Relative phase between the arms", unit: "rad" },
          { symbol: "P_{\\mathrm{dark}}", meaning: "Probability at the normally dark port", unit: "dimensionless" }
        ],
        interpretation:
          "At zero phase all light exits the bright port; at π all exits the dark port. The two outputs are complementary.",
        assumptions: ["Two ideal 50:50 beam splitters", "Lossless arms", "Single input port", "No which-path information"],
        usedIn: ["Mach–Zehnder experiment", "Bomb tester", "Quantum eraser", "Phase sensing"],
        numericExample: {
          statement: "δ = 60° gives P_dark = 0.25 and P_bright = 0.75.",
          latex: "P_{\\mathrm{dark}}=0.25"
        }
      },
      {
        id: "q03-e5",
        latex:
          "\\delta=\\frac{2\\pi\\Delta}{\\lambda}+\\delta_0",
        name: "Phase difference in an interferometer",
        symbols: [
          { symbol: "\\Delta", meaning: "Path difference between the arms", unit: "m" },
          { symbol: "\\delta_0", meaning: "Any fixed offset phase", unit: "rad" }
        ],
        interpretation:
          "The interference pattern is a ruler for path difference. One wavelength of path change moves the pattern through one full fringe.",
        assumptions: ["Monochromatic light", "Stable paths", "Same polarization in both arms"],
        usedIn: ["MZ phase scan", "Michelson", "Fringe counting"],
        numericExample: {
          statement: "Δ = λ/2 gives δ = π and switches the output from bright to dark.",
          latex: "\\delta=\\frac{2\\pi(\\lambda/2)}{\\lambda}=\\pi"
        }
      }
    ],
    derivations: [
      {
        id: "d-q03-mz",
        title: "Output probabilities of a balanced Mach–Zehnder interferometer",
        intro:
          "Track the two-component path amplitude through two 50:50 beam splitters and one phase shifter.",
        steps: [
          {
            label: "1",
            text: "Start with one photon in the upper input port.",
            latex: "|\\psi_0\\rangle=\\begin{pmatrix}1\\\\0\\end{pmatrix}"
          },
          {
            label: "2",
            text: "Apply the first 50:50 beam splitter B = (1/√2)[[1, i], [i, 1]].",
            latex: "|\\psi_1\\rangle=\\frac{1}{\\sqrt2}\\begin{pmatrix}1\\\\ i\\end{pmatrix}"
          },
          {
            label: "3",
            text: "Shift the phase of the lower path by δ.",
            latex: "|\\psi_2\\rangle=\\frac{1}{\\sqrt2}\\begin{pmatrix}1\\\\ ie^{i\\delta}\\end{pmatrix}"
          },
          {
            label: "4",
            text: "Apply the second beam splitter.",
            latex:
              "|\\psi_3\\rangle=\\frac{1}{2}\\begin{pmatrix}1-e^{i\\delta}\\\\ i(1+e^{i\\delta})\\end{pmatrix}"
          },
          {
            label: "5",
            text: "Take squared moduli.",
            latex:
              "P_{\\mathrm{dark}}=\\frac{|1-e^{i\\delta}|^2}{4}=\\frac{1-\\cos\\delta}{2}"
          },
          {
            label: "6",
            text: "The other port is the complement.",
            latex:
              "P_{\\mathrm{bright}}=\\frac{1+\\cos\\delta}{2},\\qquad P_{\\mathrm{dark}}+P_{\\mathrm{bright}}=1"
          }
        ],
        result: {
          latex:
            "P_{\\mathrm{dark}}=\\frac{1-\\cos\\delta}{2},\\qquad P_{\\mathrm{bright}}=\\frac{1+\\cos\\delta}{2}",
          text:
            "The interference comes from the two amplitudes that reach each output. The i phases from the two reflections are essential: without them the dark port would not cancel at δ = 0."
        },
        assumptions: ["Ideal 50:50 beam splitters", "Lossless propagation", "Single input port", "No path distinguishability"]
      }
    ],
    problems: [
      {
        id: "q03-p1",
        type: "numerical",
        difficulty: 2,
        topic: "MZ probabilities",
        prompt:
          "A balanced Mach–Zehnder interferometer is set to δ = 120°. What are the dark- and bright-port probabilities?",
        answer:
          "cos120° = −0.5, so P_dark = (1 + 0.5)/2 = 0.75 and P_bright = 0.25. The dark port is now the brighter one; the labels refer to the δ = 0 configuration, not to a permanent darkness.",
        numeric: { value: 0.75, tolerance: 0.001, unit: "dimensionless" },
        marks: 2
      },
      {
        id: "q03-p2",
        type: "numerical",
        difficulty: 2,
        topic: "Two-amplitude interference",
        prompt:
          "Two paths have equal amplitudes 1/√2 and a relative phase of 90°. What is the probability at one output of a balanced interferometer? At what phase does that output go dark?",
        answer:
          "For one output of a balanced interferometer the probability is P = ½(1 + cosδ), not 1 + cosδ; the factor ½ comes from the final beam splitter, which divides the recombined amplitude between two ports. At δ = 90°, P = ½. The output is dark when cosδ = −1, i.e. δ = 180°. The other output carries the complementary probability and the two sum to one.",
        numeric: { value: 0.5, tolerance: 0.001, unit: "dimensionless" },
        marks: 2
      },
      {
        id: "q03-p3",
        type: "mcq",
        difficulty: 2,
        topic: "Which-path information",
        prompt:
          "A polarizer is inserted in one arm of a Mach–Zehnder interferometer so that the two paths carry orthogonal polarizations. What happens to the interference at the output?",
        options: [
          "It remains unchanged because the phase is unchanged",
          "It disappears because the path alternatives are now distinguishable",
          "It doubles in visibility",
          "It shifts by 90° but keeps full contrast"
        ],
        answerIndex: 1,
        answer:
          "Orthogonal polarization states are perfectly distinguishable in principle, so the two amplitudes no longer add: the cross term contains the overlap ⟨H|V⟩ = 0. The output is the sum of two independent intensities. Erasing the marker with an analyzer before detection can restore interference in selected subensembles, which is the quantum eraser.",
        explanation:
          "Interference requires indistinguishable alternatives, not merely a stable phase.",
        marks: 2
      },
      {
        id: "q03-p4",
        type: "short",
        difficulty: 2,
        topic: "Single-photon interference",
        prompt:
          "How can a single photon interfere with itself, and why does the interference disappear if one path is blocked?",
        answer:
          "The photon's state is a superposition of the two path modes, and the amplitudes for the two routes add at the detector. The photon is not split; the state explores both possibilities. Blocking one path removes one amplitude, leaving a single route with probability one (or zero), so there is no cross term and no phase dependence. The same disappearance occurs if a which-path detector makes the routes distinguishable, even if the photon is not absorbed.",
        marks: 3
      },
      {
        id: "q03-p5",
        type: "derivation",
        difficulty: 3,
        topic: "Interference term",
        prompt:
          "Derive the interference law for two complex amplitudes and show that the visibility is unity for equal amplitudes.",
        answer:
          "Let a₁ = A₁e^{iφ₁} and a₂ = A₂e^{iφ₂}. Then |a₁ + a₂|² = (a₁ + a₂)(a₁* + a₂*) = A₁² + A₂² + A₁A₂(e^{iδ} + e^{−iδ}) = A₁² + A₂² + 2A₁A₂cosδ, with δ = φ₁ − φ₂. The maximum is (A₁ + A₂)² and the minimum (A₁ − A₂)². Hence V = [(A₁ + A₂)² − (A₁ − A₂)²]/[(A₁ + A₂)² + (A₁ − A₂)²] = 4A₁A₂/[2(A₁² + A₂²)] = 2A₁A₂/(A₁² + A₂²). For A₁ = A₂ this is 1.",
        marks: 4
      },
      {
        id: "q03-p6",
        type: "numerical",
        difficulty: 2,
        topic: "Phase from path difference",
        prompt:
          "What path difference in a Mach–Zehnder arm produces a phase shift of π at λ = 633 nm?",
        answer:
          "δ = 2πΔ/λ = π implies Δ = λ/2 = 316.5 nm. The output switches from fully bright to fully dark. A full fringe corresponds to Δ = λ = 633 nm.",
        numeric: { value: 316.5, tolerance: 1, unit: "nm" },
        marks: 2
      }
    ],
    references: [R("nielsen"), R("griffiths"), R("hecht"), R("loudon")],
    related: [
      "mach-zehnder-interferometer",
      "quantum-bomb-tester",
      "quantum-eraser",
      "q02-state-vectors-and-hilbert-space",
      "q05-unitary-evolution-and-beam-splitters"
    ]
  },

  /* ------------------------------------------------------------------ */
  /* q04 — Measurement, Born rule and operators                          */
  /* ------------------------------------------------------------------ */
  {
    id: "q04-measurement-born-rule-and-operators",
    number: "Q04",
    title: "Measurement, the Born Rule and Operators",
    kicker: "What a click permits you to say",
    summary:
      "Observables are Hermitian operators, outcomes are their eigenvalues, and probabilities are squared overlaps. This chapter states the Born rule, the projection postulate, expectation values and the uncertainty relation, and separates what measurement disturbance really implies from what it does not.",
    interactive: "uncertainty",
    blocks: [
      {
        type: "lead",
        text: "A polarizing beam splitter sends H photons one way and V photons another. Before the photon reaches it, the state may be a superposition. At the detector, one path clicks. The theory must connect the pre-measurement vector to the statistics of clicks, and it must say what the state is after the click."
      },
      {
        type: "p",
        text: "An observable is represented by a Hermitian operator A. Its eigenvalues a_n are the possible outcomes and its eigenvectors |a_n⟩ are the states that give that outcome with certainty. For a photon polarization measurement the observable might be σ_z, with eigenvalues +1 (H) and −1 (V), or σ_x, with eigenstates D and A. The physical setting of the analyzer chooses which operator is measured. Operators that do not commute cannot both have definite values in the same state."
      },
      {
        type: "eq",
        latex:
          "A=A^{\\dagger},\\qquad A|a_n\\rangle=a_n|a_n\\rangle,\\qquad a_n\\in\\mathbb{R}",
        number: "Q4.1"
      },
      {
        type: "p",
        text: "The Born rule gives the probability of outcome a as P(a) = |⟨a|ψ⟩|² for a pure state, or Tr(Π_aρ) for a density matrix. The projection postulate says that immediately after the outcome, the state is the projected and renormalised vector Π_a|ψ⟩/√P(a). For a non-degenerate outcome this is simply |a⟩. The postulate is not a claim that the measurement revealed a pre-existing value; it is a rule for updating predictions after the result is known. In a demolition detector, such as a photomultiplier or an avalanche photodiode, the photon is absorbed and the post-measurement state of the light is the vacuum."
      },
      {
        type: "eq",
        latex:
          "P(a)=|\\langle a|\\psi\\rangle|^2,\\qquad |\\psi\\rangle\\to\\frac{\\Pi_a|\\psi\\rangle}{\\sqrt{P(a)}}",
        number: "Q4.2"
      },
      {
        type: "p",
        text: "The expectation value of an observable is ⟨A⟩ = ⟨ψ|A|ψ⟩ = ΣaP(a), and the variance is (ΔA)² = ⟨A²⟩ − ⟨A⟩². For the Pauli operators on a qubit, ⟨σ_z⟩ = P(H) − P(V), ⟨σ_x⟩ = 2 Re(c_H*c_V) and ⟨σ_y⟩ = 2 Im(c_H*c_V). These three numbers are the components of the Bloch vector. The Robertson relation ΔAΔB ≥ ½|⟨[A,B]⟩| follows from the Cauchy–Schwarz inequality. For σ_x and σ_y the commutator is 2iσ_z, so Δσ_xΔσ_y ≥ |⟨σ_z⟩|."
      },
      {
        type: "callout",
        tone: "misconception",
        title: "The uncertainty relation is not merely experimental clumsiness",
        body:
          "It is true that measuring a photon's polarization disturbs it, and that real analyzers are imperfect. But the Robertson relation survives even for ideal measurements and ideal states: it is a property of the state and the non-commuting operators. A state can be prepared with a definite σ_z value, but then σ_x and σ_y are completely undetermined. This is not because the apparatus is bad; it is because no state vector can be an eigenstate of two non-commuting operators. Contextual hidden-variable models that try to assign pre-existing values to all observables are ruled out by Bell and Kochen–Specker theorems."
      },
      {
        type: "derivation",
        derivationId: "d-q04-born"
      },
      {
        type: "numeric",
        title: "Outcome probabilities for a tilted state",
        statement:
          "A photon is prepared in |ψ⟩ = cos30°|H⟩ + sin30°|V⟩. Find the probabilities of H and V outcomes, the expectation of σ_z, and the uncertainty Δσ_z.",
        latex:
          "P(H)=\\cos^2 30^\\circ=0.750,\\qquad P(V)=\\sin^2 30^\\circ=0.250",
        result:
          "⟨σ_z⟩ = 0.750 − 0.250 = 0.500 and ⟨σ_z²⟩ = 1, so Δσ_z = √(1 − 0.25) = 0.866. The state is not an eigenstate of σ_z, so the outcome is uncertain. A measurement of σ_x on the same state gives ⟨σ_x⟩ = 2(0.866)(0.500) = 0.866 and Δσ_x = 0.500."
      },
      {
        type: "numeric",
        title: "Expectation and uncertainty product",
        statement:
          "For the same state, compute ⟨σ_x⟩, Δσ_x, ⟨σ_y⟩ and the product Δσ_zΔσ_x. Compare with the Robertson bound.",
        latex:
          "\\langle\\sigma_x\\rangle=2\\operatorname{Re}(c_H^*c_V)=0.866,\\qquad \\langle\\sigma_y\\rangle=2\\operatorname{Im}(c_H^*c_V)=0",
        result:
          "Δσ_x = √(1 − 0.866²) = 0.500. The product is 0.866 × 0.500 = 0.433. The commutator [σ_z, σ_x] = −2iσ_y has zero expectation, so the bound is 0 and the product comfortably exceeds it. The state is not a minimum-uncertainty state for this pair; minimum uncertainty would require the commutator expectation to saturate the product."
      }
    ],
    equations: [
      {
        id: "q04-e1",
        latex:
          "A=A^{\\dagger},\\qquad A|a_n\\rangle=a_n|a_n\\rangle",
        name: "Hermitian observable and eigenvalues",
        symbols: [
          { symbol: "A", meaning: "Observable operator", unit: "depends on observable" },
          { symbol: "a_n", meaning: "Possible outcome", unit: "depends on observable" }
        ],
        interpretation:
          "Hermitian operators have real eigenvalues and orthogonal eigenvectors. The eigenvalues are exactly the outcomes that can occur.",
        assumptions: ["A is Hermitian", "Finite-dimensional space for qubits", "Properly normalised eigenstates"],
        usedIn: ["Polarization measurement", "Stern–Gerlach", "Energy measurement", "QKD"],
        numericExample: {
          statement: "σ_z = diag(1, −1) has outcomes +1 and −1.",
          latex: "\\sigma_z=\\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}"
        }
      },
      {
        id: "q04-e2",
        latex:
          "P(a)=|\\langle a|\\psi\\rangle|^2,\\qquad \\rho\\to\\frac{\\Pi_a\\rho\\Pi_a}{P(a)}",
        name: "Born rule and state update",
        symbols: [
          { symbol: "P(a)", meaning: "Probability of outcome a", unit: "dimensionless" },
          { symbol: "\\Pi_a", meaning: "Projector onto outcome a", unit: "dimensionless" }
        ],
        interpretation:
          "The probability is the squared overlap. After the outcome, the state is the projected state renormalised, not the original superposition.",
        assumptions: ["Projective measurement", "Ideal detector", "Normalised state"],
        usedIn: ["Any polarization measurement", "MZ detection", "Eraser coincidence analysis"],
        numericExample: {
          statement: "P(H) = cos²30° = 0.75 for |ψ⟩ = cos30°|H⟩ + sin30°|V⟩.",
          latex: "P(H)=0.75"
        }
      },
      {
        id: "q04-e3",
        latex:
          "\\langle A\\rangle=\\sum_n a_nP(a_n)=\\langle\\psi|A|\\psi\\rangle",
        name: "Expectation value",
        symbols: [
          { symbol: "\\langle A\\rangle", meaning: "Mean outcome over many trials", unit: "units of A" },
          { symbol: "P(a_n)", meaning: "Outcome probability", unit: "dimensionless" }
        ],
        interpretation:
          "The expectation is the weighted average of the eigenvalues. It is what a long run of identical measurements converges to.",
        assumptions: ["Identically prepared states", "Many independent trials", "Detector linearity"],
        usedIn: ["Bloch-vector measurement", "Bell inequalities", "State tomography"],
        numericExample: {
          statement: "P(H) = 0.75, P(V) = 0.25 give ⟨σ_z⟩ = 0.50.",
          latex: "\\langle\\sigma_z\\rangle=1(0.75)+(-1)(0.25)=0.50"
        }
      },
      {
        id: "q04-e4",
        latex:
          "(\\Delta A)^2=\\langle A^2\\rangle-\\langle A\\rangle^2",
        name: "Variance of an observable",
        symbols: [
          { symbol: "\\Delta A", meaning: "Standard deviation of outcomes", unit: "units of A" },
          { symbol: "A", meaning: "Hermitian observable being measured", unit: "varies with the observable" }
        ],
        interpretation:
          "The variance measures the spread of outcomes around the mean. An eigenstate has zero variance for that observable.",
        assumptions: ["Normalised state", "Finite second moment"],
        usedIn: ["Uncertainty relations", "Noise analysis", "Quantum metrology"],
        numericExample: {
          statement: "For P(H) = 0.75, Δσ_z = √(1 − 0.25) = 0.866.",
          latex: "\\Delta\\sigma_z=0.866"
        }
      },
      {
        id: "q04-e5",
        latex:
          "\\Delta A\\Delta B\\ge\\frac12|\\langle[A,B]\\rangle|",
        name: "Robertson uncertainty relation",
        symbols: [
          { symbol: "[A,B]", meaning: "Commutator AB − BA", unit: "product of units" },
          { symbol: "\\Delta A,\\Delta B", meaning: "Standard deviations in the state", unit: "units of A and B" }
        ],
        interpretation:
          "Non-commuting observables cannot both be sharp in the same state. The bound depends on the state through the expectation of the commutator.",
        assumptions: ["Hermitian A and B", "Normalised state", "Finite variances"],
        usedIn: ["σ_x/σ_y trade-off", "Entropic uncertainty", "QKD security proofs"],
        numericExample: {
          statement: "[σ_x, σ_y] = 2iσ_z gives Δσ_xΔσ_y ≥ |⟨σ_z⟩|.",
          latex: "\\Delta\\sigma_x\\Delta\\sigma_y\\ge|\\langle\\sigma_z\\rangle|"
        }
      }
    ],
    derivations: [
      {
        id: "d-q04-born",
        title: "Born probabilities, expectation and variance for a qubit",
        intro:
          "The qubit formulas follow from expanding the state in the measurement basis and using orthonormality.",
        steps: [
          {
            label: "1",
            text: "Expand the state in the eigenbasis of the observable.",
            latex: "|\\psi\\rangle=c_0|0\\rangle+c_1|1\\rangle"
          },
          {
            label: "2",
            text: "The probability of outcome a_n is the squared overlap.",
            latex: "P(n)=|\\langle n|\\psi\\rangle|^2=|c_n|^2"
          },
          {
            label: "3",
            text: "The expectation is the eigenvalue-weighted sum.",
            latex: "\\langle A\\rangle=a_0|c_0|^2+a_1|c_1|^2"
          },
          {
            label: "4",
            text: "The second moment uses the squared eigenvalues.",
            latex: "\\langle A^2\\rangle=a_0^2|c_0|^2+a_1^2|c_1|^2"
          },
          {
            label: "5",
            text: "Subtract the square of the mean to obtain the variance.",
            latex:
              "\\operatorname{Var}(A)=|c_0|^2|c_1|^2(a_0-a_1)^2"
          }
        ],
        result: {
          latex:
            "P(n)=|c_n|^2,\\qquad \\langle A\\rangle=\\sum_n a_nP(n),\\qquad \\operatorname{Var}(A)=\\sum_n a_n^2P(n)-\\langle A\\rangle^2",
          text:
            "For a two-outcome observable the variance is maximal when the probabilities are equal and zero when one outcome is certain. For σ_z with outcomes ±1, Var = 4P(H)P(V)."
        },
        assumptions: ["Projective measurement", "Normalised state", "Non-degenerate eigenvalues for the simple formulas"]
      }
    ],
    problems: [
      {
        id: "q04-p1",
        type: "numerical",
        difficulty: 1,
        topic: "Born rule",
        prompt:
          "A qubit is in |ψ⟩ = √0.20|H⟩ + √0.80|V⟩. What is P(V)?",
        answer:
          "P(V) = |√0.80|² = 0.80. The amplitudes are real and the state is already normalised because 0.20 + 0.80 = 1.",
        numeric: { value: 0.8, tolerance: 0.001, unit: "dimensionless" },
        marks: 1
      },
      {
        id: "q04-p2",
        type: "numerical",
        difficulty: 2,
        topic: "Expectation and variance",
        prompt:
          "For |+⟩ = (|H⟩ + |V⟩)/√2, compute ⟨σ_z⟩ and Δσ_z.",
        answer:
          "P(H) = P(V) = ½, so ⟨σ_z⟩ = ½ − ½ = 0. Since σ_z² = I, ⟨σ_z²⟩ = 1 and Δσ_z = √(1 − 0) = 1. The outcome is maximally uncertain.",
        numeric: { value: 0, tolerance: 0.001, unit: "dimensionless" },
        marks: 2
      },
      {
        id: "q04-p3",
        type: "mcq",
        difficulty: 2,
        topic: "Compatible observables",
        prompt: "Two observables can be measured simultaneously with arbitrary precision if and only if:",
        options: [
          "They have the same eigenvalues",
          "Their commutator is zero",
          "They are both Hermitian",
          "They act on different photons"
        ],
        answerIndex: 1,
        answer:
          "Commuting Hermitian operators share a complete orthonormal eigenbasis. Preparing a joint eigenstate makes both outcomes certain. Hermiticity alone is not enough: σ_x and σ_z are both Hermitian but do not commute.",
        explanation:
          "Compatibility is a property of the operator pair, not of the state alone.",
        marks: 2
      },
      {
        id: "q04-p4",
        type: "short",
        difficulty: 2,
        topic: "Measurement disturbance",
        prompt:
          "Does the projection postulate mean that measurement reveals a value that already existed? Discuss briefly with a polarization example.",
        answer:
          "Not in general. For a state that is not an eigenstate of the measured observable, the outcome is not predetermined by the state vector; only the probabilities are. A photon in (|H⟩ + |V⟩)/√2 gives a definite H or V click, but the state did not carry a definite H/V label before the measurement. After the click the state is updated to the corresponding eigenstate. Interpretations differ on what happens between preparation and click, but the operational predictions — probabilities and post-measurement states — are unambiguous and are what the laboratory tests.",
        marks: 3
      },
      {
        id: "q04-p5",
        type: "derivation",
        difficulty: 2,
        topic: "Expectation value",
        prompt:
          "Show that ⟨A⟩ = Σa_nP(a_n) for a Hermitian observable with a complete eigenbasis.",
        answer:
          "Write |ψ⟩ = Σc_n|a_n⟩. Then A|ψ⟩ = Σa_nc_n|a_n⟩ and ⟨ψ|A|ψ⟩ = Σ_mΣ_n c_m*a_nc_n⟨a_m|a_n⟩ = Σ_n a_n|c_n|². Since P(a_n) = |c_n|², the result is Σa_nP(a_n). The calculation uses orthonormality and the reality of the eigenvalues.",
        marks: 3
      },
      {
        id: "q04-p6",
        type: "mcq",
        difficulty: 1,
        topic: "Observables",
        prompt: "Which of these matrices is Hermitian?",
        options: [
          "[[1, i], [−i, 2]]",
          "[[1, i], [i, 1]]",
          "[[0, 1], [0, 0]]",
          "[[1, 2], [3, 4]]"
        ],
        answerIndex: 0,
        answer:
          "A matrix is Hermitian when it equals its conjugate transpose. For [[1, i], [−i, 2]], transposing swaps the off-diagonal entries and conjugating turns i into −i and −i into i, returning the original matrix. Option 2 is symmetric but its off-diagonal entries do not conjugate to each other; option 3 is not symmetric; option 4 is neither symmetric nor Hermitian.",
        explanation:
          "Check both symmetry and conjugation of the off-diagonal entries.",
        marks: 1
      }
    ],
    references: [R("griffiths"), R("nielsen"), R("loudon"), R("saleh")],
    related: [
      "mach-zehnder-interferometer",
      "quantum-eraser",
      "linear-algebra-and-hilbert-spaces",
      "q03-superposition-and-complex-amplitudes",
      "q06-density-matrices-pure-and-mixed"
    ]
  }
,

  /* ------------------------------------------------------------------ */
  /* q05 — Unitary evolution and beam splitters                         */
  /* ------------------------------------------------------------------ */
  {
    id: "q05-unitary-evolution-and-beam-splitters",
    number: "Q05",
    title: "Unitary Evolution and Beam Splitters",
    kicker: "Optics as matrix mechanics",
    summary:
      "A closed quantum system evolves by a unitary operator, and a lossless beam splitter is one. This chapter connects the Schrödinger equation to U†U = I, derives the beam-splitter matrix from conservation of probability, and composes beam splitters and phase shifters into interferometer predictions.",
    interactive: "jones",
    blocks: [
      {
        type: "lead",
        text: "A beam splitter is the quantum optics laboratory's simplest logic gate. It takes one input mode and creates a superposition of two, with amplitudes fixed by conservation of energy. Two beam splitters and a phase plate are enough to build a Mach–Zehnder interferometer, the bomb tester and the front end of a quantum key distribution system."
      },
      {
        type: "p",
        text: "Between measurements, a closed quantum system evolves according to the Schrödinger equation iħ ∂|ψ⟩/∂t = H|ψ⟩, where H is the Hamiltonian, the operator for energy. For a time-independent Hamiltonian the solution is |ψ(t)⟩ = U(t)|ψ(0)⟩ with U(t) = exp(−iHt/ħ). The operator U is unitary: U†U = I. Unitarity is the statement that probability is conserved. It also implies that evolution is reversible in principle: U⁻¹ = U†. The reversibility is a statement about the ideal closed dynamics, not a claim that a laboratory can undo every loss and decoherence process in practice."
      },
      {
        type: "eq",
        latex:
          "i\\hbar\\frac{\\partial|\\psi\\rangle}{\\partial t}=H|\\psi\\rangle,\\qquad U(t)=e^{-iHt/\\hbar}",
        number: "Q5.1"
      },
      {
        type: "p",
        text: "For a two-mode field the state is a two-component vector of mode amplitudes. A lossless beam splitter with power reflectivity η is represented by a 2×2 unitary matrix. In the convention used by the laboratory simulation, the transmitted amplitude is t = √(1 − η), the reflected amplitude is r = √η, and reflection carries a factor i. The matrix B = [[t, ir], [ir, t]] is unitary because t² + r² = 1. The factor i is not arbitrary: it encodes the π/2 phase shift required by energy conservation and determines which port is dark at zero phase in an interferometer."
      },
      {
        type: "eq",
        latex:
          "B(\\eta)=\\begin{pmatrix}t&ir\\\\ ir&t\\end{pmatrix},\\qquad t=\\sqrt{1-\\eta},\\quad r=\\sqrt{\\eta},\\quad B^{\\dagger}B=I",
        number: "Q5.2"
      },
      {
        type: "p",
        text: "A phase shifter on one mode multiplies its amplitude by e^{iφ} and leaves the other mode unchanged. Its matrix is diagonal and unitary. A Mach–Zehnder interferometer is the product B₂ diag(e^{iφ₁}, e^{iφ₂}) B₁. Because matrix multiplication is associative but not commutative, the order of the factors is the order of the optical path. Evaluating the product for balanced beam splitters gives the dark- and bright-port probabilities (1 − cos δ)/2 and (1 + cos δ)/2, with δ the relative phase."
      },
      {
        type: "callout",
        tone: "misconception",
        title: "Unitarity does not permit cloning",
        body:
          "A unitary operator can copy a known basis state: a classical CNOT-like gate maps |0⟩|0⟩ to |0⟩|0⟩ and |1⟩|0⟩ to |1⟩|1⟩. It cannot copy an arbitrary unknown superposition. If a unitary U copied both |0⟩ and |1⟩, linearity would force it to copy (|0⟩ + |1⟩)/√2 into (|00⟩ + |11⟩)/√2, which is entangled, not the product (|0⟩ + |1⟩)(|0⟩ + |1⟩)/2. The no-cloning theorem is a consequence of linearity and is the reason eavesdropping in BB84 cannot be perfect."
      },
      {
        type: "derivation",
        derivationId: "d-q05-bs"
      },
      {
        type: "numeric",
        title: "A 30:70 beam splitter",
        statement:
          "A beam splitter has power reflectivity η = 0.30. Write its matrix and find the output probabilities for a single photon entering port 0.",
        latex:
          "t=\\sqrt{0.70}=0.837,\\qquad r=\\sqrt{0.30}=0.548,\\qquad B=\\begin{pmatrix}0.837&0.548i\\\\0.548i&0.837\\end{pmatrix}",
        result:
          "The output state is (0.837, 0.548i), so P(port 0) = 0.837² = 0.70 and P(port 1) = 0.548² = 0.30. The i phase appears in the relative phase of the two output amplitudes but not in the probabilities. Checking unitarity: t² + r² = 0.70 + 0.30 = 1."
      },
      {
        type: "numeric",
        title: "Mach–Zehnder at quadrature and at π",
        statement:
          "For a balanced Mach–Zehnder interferometer, find the output probabilities at δ = 90.0° and at δ = 180.0°.",
        latex:
          "\\delta=90^\\circ:\\quad P_{\\mathrm{dark}}=0.500,\\quad P_{\\mathrm{bright}}=0.500",
        result:
          "At δ = 90° the cosine is zero, so the outputs are equal: 50/50. At δ = 180° the cosine is −1, so P_dark = 1 and P_bright = 0: all photons leave by the dark port. The labels are historical; the port that is dark at δ = 0 is the bright one at δ = π."
      }
    ],
    equations: [
      {
        id: "q05-e1",
        latex:
          "i\\hbar\\frac{\\partial|\\psi\\rangle}{\\partial t}=H|\\psi\\rangle,\\qquad U(t)=e^{-iHt/\\hbar}",
        name: "Schrödinger equation and unitary evolution",
        symbols: [
          { symbol: "H", meaning: "Hamiltonian operator", unit: "J" },
          { symbol: "\\hbar", meaning: "Reduced Planck constant", unit: "J s" },
          { symbol: "U(t)", meaning: "Time-evolution operator", unit: "dimensionless" }
        ],
        interpretation:
          "The Hamiltonian generates time evolution. For a closed system the evolution operator is unitary and preserves the norm of the state.",
        assumptions: ["Closed system", "Time-independent Hamiltonian for the exponential form", "No measurement during the evolution"],
        usedIn: ["Interferometer dynamics", "Ramsey sequences", "Quantum gates", "Coherent states"],
        numericExample: {
          statement: "A phase accumulated as e^{−iEt/ħ} for an energy eigenstate with E = 1 eV and t = 1 ps is e^{−i1.52}.",
          latex: "\\phi=\\frac{Et}{\\hbar}=\\frac{(1.602\\times10^{-19})(10^{-12})}{1.055\\times10^{-34}}=1.52\\ \\mathrm{rad}"
        }
      },
      {
        id: "q05-e2",
        latex:
          "U^{\\dagger}U=I,\\qquad \\langle U\\phi|U\\psi\\rangle=\\langle\\phi|\\psi\\rangle",
        name: "Unitary operator",
        symbols: [
          { symbol: "U", meaning: "Evolution or gate operator", unit: "dimensionless" },
          { symbol: "U^{\\dagger}", meaning: "Conjugate transpose", unit: "dimensionless" }
        ],
        interpretation:
          "Unitarity preserves inner products, norms and therefore total probability. It makes the ideal evolution invertible, with U⁻¹ = U†.",
        assumptions: ["Closed system", "No loss or gain", "No measurement"],
        usedIn: ["Beam splitters", "Wave plates", "Quantum gates", "State preservation"],
        numericExample: {
          statement: "A phase gate diag(1, e^{iφ}) is unitary for every real φ.",
          latex: "U^{\\dagger}U=\\begin{pmatrix}1&0\\\\0&e^{-i\\phi}\\end{pmatrix}\\begin{pmatrix}1&0\\\\0&e^{i\\phi}\\end{pmatrix}=I"
        }
      },
      {
        id: "q05-e3",
        latex:
          "B(\\eta)=\\begin{pmatrix}\\sqrt{1-\\eta}&i\\sqrt{\\eta}\\\\ i\\sqrt{\\eta}&\\sqrt{1-\\eta}\\end{pmatrix}",
        name: "Beam-splitter matrix",
        symbols: [
          { symbol: "\\eta", meaning: "Power reflectivity, 0 to 1", unit: "dimensionless" },
          { symbol: "t", meaning: "Transmission amplitude, √(1 − η)", unit: "dimensionless" },
          { symbol: "r", meaning: "Reflection amplitude, √η", unit: "dimensionless" }
        ],
        interpretation:
          "The matrix maps input mode amplitudes to output mode amplitudes. The i on reflection supplies the phase required for energy conservation and for the dark port to cancel.",
        assumptions: ["Lossless beam splitter", "Single frequency", "Same polarization", "Ideal mode matching"],
        usedIn: ["Mach–Zehnder", "Bomb tester", "Hong–Ou–Mandel", "QKD"],
        numericExample: {
          statement: "η = 0.5 gives t = r = 1/√2 and B = (1/√2)[[1, i], [i, 1]].",
          latex: "B(1/2)=\\frac{1}{\\sqrt2}\\begin{pmatrix}1&i\\\\ i&1\\end{pmatrix}"
        }
      },
      {
        id: "q05-e4",
        latex:
          "P(\\phi)=\\begin{pmatrix}e^{i\\phi}&0\\\\0&1\\end{pmatrix}",
        name: "Phase-shifter matrix",
        symbols: [
          { symbol: "\\phi", meaning: "Phase delay", unit: "rad" },
          { symbol: "P(\\phi)", meaning: "Phase-shifter operator on the two modes", unit: "dimensionless" }
        ],
        interpretation:
          "A phase shifter changes the phase of one mode relative to the other without changing either intensity. It is the adjustable knob of an interferometer.",
        assumptions: ["Lossless", "Single mode", "Phase stable during the measurement"],
        usedIn: ["MZ phase scan", "Ramsey interferometry", "Phase encoding in QKD"],
        numericExample: {
          statement: "φ = π flips the sign of one amplitude and converts a bright output into a dark one.",
          latex: "P(\\pi)=\\begin{pmatrix}-1&0\\\\0&1\\end{pmatrix}"
        }
      },
      {
        id: "q05-e5",
        latex:
          "P_{\\mathrm{dark}}=\\frac{1-\\cos\\delta}{2},\\qquad P_{\\mathrm{bright}}=\\frac{1+\\cos\\delta}{2}",
        name: "Balanced Mach–Zehnder output",
        symbols: [
          { symbol: "\\delta", meaning: "Relative phase between the arms", unit: "rad" },
          { symbol: "P_{\\mathrm{dark}}", meaning: "Probability at the normally dark port", unit: "dimensionless" }
        ],
        interpretation:
          "The two output probabilities are complementary. A relative phase of π transfers all the light from one port to the other.",
        assumptions: ["Two ideal 50:50 splitters", "Lossless arms", "Single input port"],
        usedIn: ["Interferometry", "Bomb tester", "Quantum eraser", "Sensing"],
        numericExample: {
          statement: "δ = 90° gives 50/50; δ = 180° gives all dark.",
          latex: "\\delta=180^\\circ:\\ P_{\\mathrm{dark}}=1"
        }
      }
    ],
    derivations: [
      {
        id: "d-q05-bs",
        title: "The beam-splitter matrix is unitary",
        intro:
          "Conservation of probability fixes the allowed form of the matrix. The calculation also shows why reflection needs a phase factor.",
        steps: [
          {
            label: "1",
            text: "Parameterise a symmetric lossless two-port device by transmission t and reflection r.",
            latex: "B=\\begin{pmatrix}t&ir\\\\ ir&t\\end{pmatrix}"
          },
          {
            label: "2",
            text: "Write the conjugate transpose.",
            latex: "B^{\\dagger}=\\begin{pmatrix}t&-ir\\\\ -ir&t\\end{pmatrix}"
          },
          {
            label: "3",
            text: "Multiply B†B.",
            latex:
              "B^{\\dagger}B=\\begin{pmatrix}t^2+r^2&t(ir)+(-ir)t\\\\ (ir)t+t(-ir)&t^2+r^2\\end{pmatrix}"
          },
          {
            label: "4",
            text: "The off-diagonal terms cancel because they are complex conjugates of each other.",
            latex: "t(ir)-irt=0"
          },
          {
            label: "5",
            text: "The diagonal terms are one by conservation of power.",
            latex: "t^2+r^2=(1-\\eta)+\\eta=1"
          }
        ],
        result: {
          latex: "B^{\\dagger}B=I,\\qquad \\det B=t^2+r^2=1",
          text:
            "The beam splitter is unitary for every reflectivity between zero and one. The determinant is one, so the transformation is also phase-preserving in the sense of preserving the two-mode volume."
        },
        assumptions: ["Lossless device", "Two modes only", "Same frequency and polarization", "No nonlinearity"]
      }
    ],
    problems: [
      {
        id: "q05-p1",
        type: "numerical",
        difficulty: 1,
        topic: "Beam-splitter probabilities",
        prompt:
          "A beam splitter has power reflectivity η = 0.20. A single photon enters port 0. What are the probabilities of detecting it at ports 0 and 1?",
        answer:
          "P(port 0) = 1 − η = 0.80 and P(port 1) = η = 0.20. The amplitudes are √0.80 = 0.894 and i√0.20 = 0.447i; the squared moduli give the probabilities.",
        numeric: { value: 0.8, tolerance: 0.001, unit: "dimensionless" },
        marks: 1
      },
      {
        id: "q05-p2",
        type: "mcq",
        difficulty: 1,
        topic: "Unitarity",
        prompt: "What does unitarity of a quantum evolution operator guarantee?",
        options: [
          "That the total probability remains one",
          "That the energy is zero",
          "That the state is an eigenstate of the Hamiltonian",
          "That the evolution is irreversible"
        ],
        answerIndex: 0,
        answer:
          "U†U = I implies ⟨Uψ|Uψ⟩ = ⟨ψ|ψ⟩, so the norm and hence the total probability are preserved. Unitarity also implies reversibility in principle. It does not force the state to be an energy eigenstate; a superposition evolves by relative phases.",
        explanation:
          "Norm preservation is the defining physical content of unitarity.",
        marks: 1
      },
      {
        id: "q05-p3",
        type: "numerical",
        difficulty: 1,
        topic: "Phase shifter",
        prompt:
          "A phase gate diag(1, e^{iπ/3}) acts on |+⟩ = (|0⟩ + |1⟩)/√2. What is the probability of outcome 0?",
        answer:
          "The state becomes (|0⟩ + e^{iπ/3}|1⟩)/√2. The probability of outcome 0 is still |1/√2|² = 0.50. A relative phase does not change the probabilities in the basis in which it was applied; it changes the interference in other bases.",
        numeric: { value: 0.5, tolerance: 0.001, unit: "dimensionless" },
        marks: 2
      },
      {
        id: "q05-p4",
        type: "short",
        difficulty: 2,
        topic: "No-cloning",
        prompt:
          "State the no-cloning theorem and explain why it follows from the linearity of quantum mechanics.",
        answer:
          "There is no unitary operation that copies an arbitrary unknown state: U(|ψ⟩|0⟩) = |ψ⟩|ψ⟩ for every |ψ⟩. Suppose U copies two non-orthogonal states |0⟩ and |1⟩. By linearity, U[(|0⟩ + |1⟩)/√2 |0⟩] = (|00⟩ + |11⟩)/√2, which is entangled, whereas a copier would have to produce the product (|0⟩ + |1⟩)(|0⟩ + |1⟩)/2. The two differ, so no such U exists. Cloning is possible only for a known, orthogonal set of states.",
        marks: 3
      },
      {
        id: "q05-p5",
        type: "derivation",
        difficulty: 2,
        topic: "MZ composition",
        prompt:
          "Compose two 50:50 beam splitters with a phase shifter in one arm and derive the output probabilities.",
        answer:
          "With B = (1/√2)[[1, i], [i, 1]] and P = diag(1, e^{iδ}), the input (1, 0) becomes B(1, 0) = (1, i)/√2. After the phase shifter it is (1, ie^{iδ})/√2. Applying B again gives (1 − e^{iδ}, i + ie^{iδ})/2. The squared moduli are (1 − cosδ)/2 and (1 + cosδ)/2. The two results sum to one.",
        marks: 4
      },
      {
        id: "q05-p6",
        type: "mcq",
        difficulty: 2,
        topic: "Unitary matrices",
        prompt: "Which matrix is unitary?",
        options: [
          "(1/√2)[[1, i], [i, 1]]",
          "[[1, 1], [0, 1]]",
          "[[2, 0], [0, 1]]",
          "[[1, i], [i, −1]]"
        ],
        answerIndex: 0,
        answer:
          "The first matrix is the 50:50 beam splitter. Its conjugate transpose multiplied by itself gives the identity because the diagonal terms are ½ + ½ = 1 and the off-diagonal terms cancel. The second is a shear with determinant one but not unitary; the third scales one component by two; the fourth has a determinant that does not have modulus one and fails the unitarity check.",
        explanation:
          "Check both the diagonal norm and the cancellation of off-diagonal terms.",
        marks: 2
      }
    ],
    references: [R("nielsen"), R("loudon"), R("grangier1986"), R("saleh")],
    related: [
      "mach-zehnder-interferometer",
      "quantum-bomb-tester",
      "quantum-key-distribution",
      "q03-superposition-and-complex-amplitudes",
      "q06-density-matrices-pure-and-mixed"
    ]
  },

  /* ------------------------------------------------------------------ */
  /* q06 — Density matrices, pure and mixed                             */
  /* ------------------------------------------------------------------ */
  {
    id: "q06-density-matrices-pure-and-mixed",
    number: "Q06",
    title: "Density Matrices: Pure and Mixed",
    kicker: "The state when the ensemble is the experiment",
    summary:
      "A density matrix describes both a coherent superposition and a classical ensemble of preparations. This chapter defines ρ, distinguishes purity from coherence, introduces the Bloch vector, states the Born rule for mixed states, and traces out unobserved subsystems.",
    interactive: "density",
    blocks: [
      {
        type: "lead",
        text: "A polarizer set to 45° transmits all of a diagonally polarized beam but only half of an unpolarized one. Both beams may have the same H/V count rates. The density matrix is the object that records the difference and predicts the 45° result."
      },
      {
        type: "p",
        text: "For a pure state |ψ⟩ the density operator is ρ = |ψ⟩⟨ψ|. For an ensemble in which |ψ_i⟩ occurs with probability p_i, ρ = Σp_i|ψ_i⟩⟨ψ_i|. It is Hermitian, positive semidefinite, and has unit trace. The diagonal element ρ_nn is the probability of outcome n in that basis. The off-diagonal element ρ_mn measures coherence between |m⟩ and |n⟩. A pure state satisfies ρ² = ρ; a mixed state does not. The purity γ = Tr ρ² is one for a pure state and 1/d for the maximally mixed state in dimension d."
      },
      {
        type: "eq",
        latex:
          "\\rho=\\sum_ip_i|\\psi_i\\rangle\\langle\\psi_i|,\\qquad \\rho^{\\dagger}=\\rho,\\qquad \\operatorname{Tr}\\rho=1",
        number: "Q6.1"
      },
      {
        type: "p",
        text: "Different ensembles can produce the same ρ. A 50/50 mixture of |H⟩ and |V⟩, a 50/50 mixture of |D⟩ and |A⟩, and a 50/50 mixture of |R⟩ and |L⟩ all give ρ = I/2. No measurement can distinguish them. For a qubit, ρ = (I + r·σ)/2 with |r| ≤ 1. Pure states have |r| = 1 and lie on the Bloch sphere; the maximally mixed state has r = 0. The purity is γ = (1 + |r|²)/2, so the length of the Bloch vector is a direct measure of how much coherence survives."
      },
      {
        type: "eq",
        latex:
          "\\rho=\\frac{I+\\mathbf r\\cdot\\boldsymbol\\sigma}{2},\\qquad \\gamma=\\operatorname{Tr}\\rho^2=\\frac{1+|\\mathbf r|^2}{2}",
        number: "Q6.2"
      },
      {
        type: "p",
        text: "The Born rule for a projective measurement is P(a) = Tr(Π_aρ). After the outcome the state is updated to Π_aρΠ_a/P(a). For an entangled joint state ρ_AB, the reduced state of A is the partial trace over B. A pure Bell state gives ρ_A = I/2: all the coherence is in the correlations, and the local state is maximally mixed. This is the mechanism behind decoherence and the quantum eraser, and it is why a which-path marker destroys interference even when no photon is absorbed."
      },
      {
        type: "callout",
        tone: "misconception",
        title: "A mixed state is not merely a pure state you happen not to know",
        body:
          "Operationally, ρ is the complete prediction, and two ensembles with the same ρ are indistinguishable by any measurement. But a mixed state is not the same as a coherent superposition: the mixture ½|H⟩⟨H| + ½|V⟩⟨V| has zero off-diagonal coherence, while (|H⟩ + |V⟩)/√2 has ρ_HV = ½. A 45° analyzer transmits half of the mixture and all of the superposition. Whether the mixture reflects ignorance of a definite preparation or entanglement with an environment is an interpretational question; the predictions are the same, and both are described by the same ρ."
      },
      {
        type: "derivation",
        derivationId: "d-q06-bell-trace"
      },
      {
        type: "numeric",
        title: "Mixture versus superposition",
        statement:
          "Compare the 50/50 H/V mixture with the pure diagonal state |D⟩. Find their density matrices, purities, and transmission through a 45° polarizer.",
        latex:
          "\\rho_{\\mathrm{mix}}=\\frac12\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix},\\qquad \\rho_D=\\begin{pmatrix}0.5&0.5\\\\0.5&0.5\\end{pmatrix}",
        result:
          "The mixture has purity ½ and the pure state has purity 1. Both give P(H) = P(V) = ½, so an H/V measurement cannot tell them apart. A 45° analyzer projects onto |D⟩: the mixture transmits Tr(Π_Dρ_mix) = ½, while the pure state transmits 1. The off-diagonal coherence is the measurable difference."
      },
      {
        type: "numeric",
        title: "Reading a density matrix",
        statement:
          "For ρ = [[0.5, 0.3], [0.3, 0.5]], find the eigenvalues, purity, entropy and Bloch vector.",
        latex:
          "\\lambda_{\\pm}=\\frac{1\\pm\\sqrt{1-4(0.25-0.09)}}{2}=\\frac{1\\pm0.6}{2}=0.8,\\ 0.2",
        result:
          "The determinant is 0.25 − 0.09 = 0.16, so the discriminant is 1 − 0.64 = 0.36 and the eigenvalues are (1 ± 0.6)/2 = 0.8 and 0.2. The purity is 0.64 + 0.04 = 0.68. The entropy is −0.8log₂0.8 − 0.2log₂0.2 = 0.722 bits. The Bloch vector is (2 × 0.3, 0, 0) = (0.6, 0, 0), with length 0.6, consistent with γ = (1 + 0.36)/2 = 0.68."
      }
    ],
    equations: [
      {
        id: "q06-e1",
        latex:
          "\\rho=\\sum_ip_i|\\psi_i\\rangle\\langle\\psi_i|,\\qquad \\operatorname{Tr}\\rho=1,\\qquad \\rho\\ge0",
        name: "Density operator",
        symbols: [
          { symbol: "\\rho", meaning: "Density operator", unit: "dimensionless" },
          { symbol: "p_i", meaning: "Ensemble probability", unit: "dimensionless" }
        ],
        interpretation:
          "The density operator encodes both quantum coherence and classical uncertainty about the preparation. All predictions follow from it.",
        assumptions: ["Normalised states", "Probabilities sum to one", "No unlisted correlations"],
        usedIn: ["Unpolarised light", "Decoherence", "State tomography", "Eraser analysis"],
        numericExample: {
          statement: "A 50/50 H/V mixture is ρ = I/2.",
          latex: "\\rho=\\frac12\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}"
        }
      },
      {
        id: "q06-e2",
        latex:
          "\\gamma=\\operatorname{Tr}\\rho^2,\\qquad \\rho=\\frac{I+\\mathbf r\\cdot\\boldsymbol\\sigma}{2}",
        name: "Purity and Bloch representation",
        symbols: [
          { symbol: "\\gamma", meaning: "Purity", unit: "dimensionless" },
          { symbol: "\\mathbf r", meaning: "Bloch vector", unit: "dimensionless" }
        ],
        interpretation:
          "Purity measures the length of the Bloch vector. A pure state lies on the sphere; a mixed state lies inside it.",
        assumptions: ["Two-level system", "Trace-one Hermitian ρ"],
        usedIn: ["Decoherence", "Polarimetry", "State tomography"],
        numericExample: {
          statement: "r = 0.6 gives γ = (1 + 0.36)/2 = 0.68.",
          latex: "\\gamma=0.68"
        }
      },
      {
        id: "q06-e3",
        latex:
          "P(a)=\\operatorname{Tr}(\\Pi_a\\rho),\\qquad \\rho\\to\\frac{\\Pi_a\\rho\\Pi_a}{P(a)}",
        name: "Born rule and update for a mixed state",
        symbols: [
          { symbol: "\\Pi_a", meaning: "Projector for outcome a", unit: "dimensionless" },
          { symbol: "P(a)", meaning: "Outcome probability", unit: "dimensionless" }
        ],
        interpretation:
          "The trace formula averages the pure-state Born rule over the ensemble. The update rule conditions the ensemble on the observed outcome.",
        assumptions: ["Projective measurement", "Ideal detector", "Normalised ρ"],
        usedIn: ["Polarization analysis", "Eraser coincidence", "QKD"],
        numericExample: {
          statement: "For ρ = diag(0.7, 0.3), P(H) = 0.7.",
          latex: "P(H)=0.7"
        }
      },
      {
        id: "q06-e4",
        latex:
          "\\rho_A=\\operatorname{Tr}_B\\rho_{AB}=\\sum_j\\langle j|_B\\rho_{AB}|j\\rangle_B",
        name: "Partial trace",
        symbols: [
          { symbol: "\\rho_A", meaning: "Reduced state of A", unit: "dimensionless" },
          { symbol: "|j\\rangle_B", meaning: "Basis of B", unit: "dimensionless" }
        ],
        interpretation:
          "Discarding B averages over its states. The reduced state can be mixed even when the joint state is pure.",
        assumptions: ["Bipartite space", "Orthonormal basis for B", "Trace over the full B space"],
        usedIn: ["Entanglement", "Decoherence", "Eraser", "Thermalisation"],
        numericExample: {
          statement: "The reduced state of one half of a Bell pair is I/2.",
          latex: "\\rho_A=I/2"
        }
      },
      {
        id: "q06-e5",
        latex:
          "S=-\\operatorname{Tr}(\\rho\\log_2\\rho)=-\\sum_i\\lambda_i\\log_2\\lambda_i",
        name: "Von Neumann entropy",
        symbols: [
          { symbol: "S", meaning: "Entropy in bits", unit: "bit" },
          { symbol: "\\lambda_i", meaning: "Eigenvalues of ρ", unit: "dimensionless" }
        ],
        interpretation:
          "Entropy measures missing information about the preparation or entanglement with an environment.",
        assumptions: ["0 log 0 = 0", "Eigenvalues sum to one"],
        usedIn: ["Decoherence", "QKD security", "Entanglement measures"],
        numericExample: {
          statement: "ρ = diag(0.8, 0.2) gives S = 0.722 bits.",
          latex: "S=0.722\\ \\mathrm{bit}"
        }
      }
    ],
    derivations: [
      {
        id: "d-q06-bell-trace",
        title: "The reduced state of a Bell pair is maximally mixed",
        intro:
          "This is the canonical calculation showing that entanglement produces local mixedness.",
        steps: [
          {
            label: "1",
            text: "Write the Bell state.",
            latex: "|\\Phi^+\\rangle=\\frac{1}{\\sqrt2}\\left(|00\\rangle+|11\\rangle\\right)"
          },
          {
            label: "2",
            text: "Form the projector.",
            latex:
              "\\rho_{AB}=\\frac12\\left(|00\\rangle\\langle00|+|00\\rangle\\langle11|+|11\\rangle\\langle00|+|11\\rangle\\langle11|\\right)"
          },
          {
            label: "3",
            text: "Apply the partial-trace rule.",
            latex:
              "\\operatorname{Tr}_B\\left(|a\\rangle\\langle c|\\otimes|b\\rangle\\langle d|\\right)=\\langle b|d\\rangle|a\\rangle\\langle c|"
          },
          {
            label: "4",
            text: "The cross terms vanish because ⟨0|1⟩ = 0.",
            latex:
              "\\rho_A=\\frac12\\left(|0\\rangle\\langle0|+|1\\rangle\\langle1|\\right)"
          },
          {
            label: "5",
            text: "Identify the maximally mixed state and its purity.",
            latex: "\\rho_A=\\frac{I}{2},\\qquad \\gamma=\\frac12,\\qquad S=1\\ \\mathrm{bit}"
          }
        ],
        result: {
          latex: "\\rho_A=\\frac{I}{2}",
          text:
            "The joint state is pure, but neither subsystem has a definite state. All coherence is stored in the correlations. If B is lost, A is described by unpolarised light."
        },
        assumptions: ["Ideal Bell state", "Tensor-product Hilbert space", "Full trace over B"]
      }
    ],
    problems: [
      {
        id: "q06-p1",
        type: "numerical",
        difficulty: 2,
        topic: "Purity and entropy",
        prompt:
          "For ρ = diag(0.90, 0.10), find the purity and the von Neumann entropy.",
        answer:
          "γ = 0.9² + 0.1² = 0.81 + 0.01 = 0.82. S = −0.9log₂0.9 − 0.1log₂0.1 = 0.1368 + 0.3322 = 0.469 bits. The state is close to pure but not pure.",
        numeric: { value: 0.82, tolerance: 0.01, unit: "dimensionless" },
        marks: 3
      },
      {
        id: "q06-p2",
        type: "numerical",
        difficulty: 2,
        topic: "Bloch vector",
        prompt:
          "Find the Bloch vector and purity of ρ = [[0.6, 0.2], [0.2, 0.4]].",
        answer:
          "ρ_HH − ρ_VV = 0.2, so r_z = 0.2. The off-diagonal is real and equal to 0.2, so r_x = 2(0.2) = 0.4 and r_y = 0. The Bloch vector is (0.4, 0, 0.2), with length √0.20 = 0.447. Purity is (1 + 0.20)/2 = 0.60.",
        numeric: { value: 0.6, tolerance: 0.01, unit: "dimensionless" },
        marks: 3
      },
      {
        id: "q06-p3",
        type: "mcq",
        difficulty: 1,
        topic: "Pure versus mixed",
        prompt: "Which density matrix describes a pure state?",
        options: [
          "diag(0.5, 0.5)",
          "[[0.5, 0.5], [0.5, 0.5]]",
          "diag(0.7, 0.3)",
          "[[0.6, 0.1], [0.1, 0.4]]"
        ],
        answerIndex: 1,
        answer:
          "The matrix [[0.5, 0.5], [0.5, 0.5]] is the projector |D⟩⟨D| for |D⟩ = (|H⟩ + |V⟩)/√2. It satisfies ρ² = ρ and has purity 1. The diagonal matrices are mixed, and the last matrix has determinant 0.23 ≠ 0, so it is mixed.",
        explanation:
          "A pure qubit state has determinant zero and lies on the Bloch sphere.",
        marks: 1
      },
      {
        id: "q06-p4",
        type: "derivation",
        difficulty: 2,
        topic: "Partial trace",
        prompt:
          "Derive the reduced state of A for the product state |+⟩_A|0⟩_B, and show that its purity is one.",
        answer:
          "Write the joint state as ρ_AB = |+⟩⟨+|_A ⊗ |0⟩⟨0|_B. The partial trace over B acts only on the second factor: Tr_B(|0⟩⟨0|) = 1. Hence ρ_A = |+⟩⟨+|_A Tr(|0⟩⟨0|_B) = |+⟩⟨+|, which is pure and has purity Tr(ρ_A²) = 1. More generally, a product state always has pure marginals; entanglement is required for a pure joint state to give a mixed reduced state.",
        marks: 2
      },
      {
        id: "q06-p5",
        type: "numerical",
        difficulty: 2,
        topic: "Depolarising channel",
        prompt:
          "A pure state is mixed with the maximally mixed state with probability p = 0.10. Find the purity.",
        answer:
          "The Bloch vector shrinks to length 1 − p = 0.90. Purity γ = (1 + 0.81)/2 = 0.905. Equivalently the eigenvalues are 0.95 and 0.05, whose squares sum to 0.9025 + 0.0025 = 0.905.",
        numeric: { value: 0.905, tolerance: 0.005, unit: "dimensionless" },
        marks: 2
      },
      {
        id: "q06-p6",
        type: "short",
        difficulty: 2,
        topic: "Decoherence",
        prompt:
          "Explain how tracing out an environment produces decoherence of a qubit, and why the effect is basis-dependent.",
        answer:
          "Let the qubit interact with an environment so that the joint state becomes Σc_n|n⟩|E_n⟩. The reduced state is ρ = Σ_mΣ_n c_m*c_n⟨E_n|E_m⟩|m⟩⟨n|. The off-diagonal terms are multiplied by the environment overlaps. If the environment states are orthogonal, the off-diagonal terms vanish and the qubit becomes a classical mixture in the {|n⟩} basis. The basis selected is the one in which the qubit-environment interaction is diagonal; a different interaction selects a different pointer basis. This is why decoherence explains the absence of interference without invoking a collapse postulate.",
        marks: 3
      }
    ],
    references: [R("nielsen"), R("griffiths"), R("loudon"), R("saleh")],
    related: [
      "quantum-eraser",
      "quantum-key-distribution",
      "density-matrices-and-measurement",
      "q07-entanglement-and-tensor-products",
      "q08-decoherence-which-path-and-complementarity"
    ]
  },

  /* ------------------------------------------------------------------ */
  /* q07 — Entanglement and tensor products                             */
  /* ------------------------------------------------------------------ */
  {
    id: "q07-entanglement-and-tensor-products",
    number: "Q07",
    title: "Entanglement and Tensor Products",
    kicker: "Correlations that no product state can hold",
    summary:
      "Composite quantum systems live in tensor-product spaces, and some states in those spaces cannot be written as products. This chapter defines tensor products, constructs the Bell states, computes correlation probabilities and the CHSH bound, and distinguishes entanglement from signalling.",
    interactive: "superposition",
    blocks: [
      {
        type: "lead",
        text: "Two photons can be prepared so that each one alone is unpolarised, yet a measurement of one instantly predicts the other. The joint state is pure and the local states are maximally mixed. This is entanglement: all the information is in the correlations."
      },
      {
        type: "p",
        text: "The state space of two systems is the tensor product of their individual spaces. If A has dimension d_A and B has dimension d_B, the joint space has dimension d_A d_B. A basis is formed by all products |i⟩_A|j⟩_B, often written |ij⟩. A product state is |ψ⟩_A|φ⟩_B; a general state is a superposition Σc_ij|ij⟩. If no choice of bases makes the sum a single product, the state is entangled. For two qubits the joint space is four-dimensional, spanned by |HH⟩, |HV⟩, |VH⟩ and |VV⟩."
      },
      {
        type: "eq",
        latex:
          "\\mathcal H_{AB}=\\mathcal H_A\\otimes\\mathcal H_B,\\qquad \\dim(\\mathcal H_{AB})=d_Ad_B,\\qquad |\\Psi\\rangle=\\sum_{ij}c_{ij}|i\\rangle_A|j\\rangle_B",
        number: "Q7.1"
      },
      {
        type: "p",
        text: "The four Bell states are the maximally entangled basis of two qubits: |Φ±⟩ = (|HH⟩ ± |VV⟩)/√2 and |Ψ±⟩ = (|HV⟩ ± |VH⟩)/√2. Each is a pure state of the pair, but each photon alone is maximally mixed. Measuring both photons in the same basis gives perfectly correlated results for Φ+ and Ψ+, and perfectly anticorrelated results for Φ− and Ψ−. Measuring at a relative angle θ, the probability of the same outcome is cos²θ for Φ+ and the probability of the opposite outcome is sin²θ. At θ = 30°, P(same) = 0.75. In the laboratory, polarization-entangled pairs are commonly produced by spontaneous parametric down-conversion, in which a pump photon splits into a signal and an idler photon; energy and momentum conservation determine the correlations, and a detected idler can herald the presence of the signal."
      },
      {
        type: "eq",
        latex:
          "|\\Phi^+\\rangle=\\frac{|HH\\rangle+|VV\\rangle}{\\sqrt2},\\qquad |\\Psi^-\\rangle=\\frac{|HV\\rangle-|VH\\rangle}{\\sqrt2}",
        number: "Q7.2"
      },
      {
        type: "p",
        text: "Entanglement is quantified by the concurrence for two qubits. For a pure state written in the Schmidt form Σs_k|u_k⟩|v_k⟩, the concurrence is C = 2s₀s₁ when there are two Schmidt coefficients, and C = 0 for a product state, C = 1 for a Bell state. A Werner state ρ = p|Φ+⟩⟨Φ+| + (1 − p)I/4 has C = max(0, (3p − 1)/2), so it remains entangled above p = 1/3. The CHSH combination of correlation measurements is bounded by 2 for any local hidden-variable model and reaches 2√2 for a Bell state measured at optimal angles."
      },
      {
        type: "callout",
        tone: "misconception",
        title: "Entanglement does not permit faster-than-light signalling",
        body:
          "The marginal statistics of each photon are unchanged by what is done to the other. For a Bell state, each local measurement gives 50/50 regardless of the distant choice of basis. The correlations appear only when the two lists of outcomes are brought together through an ordinary classical channel. This is the no-signalling property, and it is why entanglement is a resource for cryptography and computation rather than a telephone. Experimental Bell tests must also close the locality and detection loopholes before claiming a conclusive violation; the 2022 Nobel Prize recognised the long development of loophole-free tests."
      },
      {
        type: "derivation",
        derivationId: "d-q07-schmidt"
      },
      {
        type: "numeric",
        title: "Correlations at a relative angle",
        statement:
          "Two photons are in |Φ+⟩ = (|HH⟩ + |VV⟩)/√2. Photon A is measured at 0° and photon B at 30° in the same plane. Find the probabilities of the same and opposite outcomes.",
        latex:
          "P(\\text{same})=\\cos^2 30^\\circ=0.750,\\qquad P(\\text{opposite})=\\sin^2 30^\\circ=0.250",
        result:
          "The outcomes agree 75% of the time and disagree 25% of the time. At 0° they agree perfectly; at 90° they disagree perfectly. These correlations are stronger than any local hidden-variable model can reproduce when combined across four angle settings."
      },
      {
        type: "numeric",
        title: "CHSH value and Werner-state entanglement",
        statement:
          "A Bell state is measured at the optimal CHSH angles. What is S? For a Werner state with p = 0.80, find the concurrence and state whether it is entangled.",
        latex:
          "S=2\\sqrt2=2.828,\\qquad C=\\max\\left(0,\\frac{3p-1}{2}\\right)=\\frac{2.4-1}{2}=0.700",
        result:
          "S = 2.828 exceeds the classical bound 2 by 0.828. The Werner state with p = 0.80 has C = 0.700 > 0, so it is entangled. The threshold is p = 1/3; below that the state is separable and can be written as a mixture of product states."
      }
    ],
    equations: [
      {
        id: "q07-e1",
        latex:
          "\\mathcal H_{AB}=\\mathcal H_A\\otimes\\mathcal H_B,\\qquad |ij\\rangle=|i\\rangle_A\\otimes|j\\rangle_B",
        name: "Tensor-product space",
        symbols: [
          { symbol: "\\mathcal H_A,\\mathcal H_B", meaning: "Individual Hilbert spaces", unit: "dimensionless" },
          { symbol: "|ij\\rangle", meaning: "Product basis ket", unit: "dimensionless" }
        ],
        interpretation:
          "Composite systems multiply their dimensions. A general joint state is a superposition of product basis states, not necessarily a product itself.",
        assumptions: ["Distinguishable subsystems", "Tensor-product structure", "Finite dimensions for qubits"],
        usedIn: ["Bell states", "Quantum gates", "Entanglement", "Eraser"],
        numericExample: {
          statement: "Two qubits span a four-dimensional space; three span eight.",
          latex: "2\\times2=4,\\qquad 2^3=8"
        }
      },
      {
        id: "q07-e2",
        latex:
          "|\\Phi^+\\rangle=\\frac{|00\\rangle+|11\\rangle}{\\sqrt2},\\qquad |\\Psi^-\\rangle=\\frac{|01\\rangle-|10\\rangle}{\\sqrt2}",
        name: "Bell states",
        symbols: [
          { symbol: "|\\Phi^+\\rangle", meaning: "Maximally entangled state with correlated outcomes", unit: "dimensionless" },
          { symbol: "|\\Psi^-\\rangle", meaning: "Maximally entangled singlet state", unit: "dimensionless" }
        ],
        interpretation:
          "The Bell states form an orthonormal basis of two qubits. Each is pure, but each local state is maximally mixed.",
        assumptions: ["Two qubits", "Ideal state preparation", "Fixed phase convention"],
        usedIn: ["Bell tests", "QKD", "Teleportation", "Entanglement swapping"],
        numericExample: {
          statement: "Tracing one photon out of |Φ+⟩ gives I/2.",
          latex: "\\operatorname{Tr}_B|\\Phi^+\\rangle\\langle\\Phi^+|=I/2"
        }
      },
      {
        id: "q07-e3",
        latex:
          "P(\\text{same}|\\theta)=\\cos^2\\theta,\\qquad P(\\text{opposite}|\\theta)=\\sin^2\\theta",
        name: "Polarization correlation of |Φ+⟩",
        symbols: [
          { symbol: "\\theta", meaning: "Relative analyzer angle", unit: "rad" },
          { symbol: "P(\\text{same})", meaning: "Probability that the two outcomes agree", unit: "dimensionless" }
        ],
        interpretation:
          "The correlations are deterministic at 0° and 90° and probabilistic in between. They are stronger than any classical model with pre-existing values.",
        assumptions: ["Ideal |Φ+⟩", "Same measurement plane", "Perfect detectors", "No noise"],
        usedIn: ["Bell tests", "CHSH", "Quantum eraser", "QKD security"],
        numericExample: {
          statement: "θ = 30° gives P(same) = 0.75.",
          latex: "P(\\text{same})=\\cos^2 30^\\circ=0.75"
        }
      },
      {
        id: "q07-e4",
        latex:
          "S=E(a,b)-E(a,b')+E(a',b)+E(a',b'),\\qquad |S|\\le2",
        name: "CHSH inequality",
        symbols: [
          { symbol: "E(a,b)", meaning: "Correlation of outcomes for settings a and b", unit: "dimensionless" },
          { symbol: "S", meaning: "CHSH combination", unit: "dimensionless" }
        ],
        interpretation:
          "Any local hidden-variable model obeys |S| ≤ 2. Quantum mechanics allows up to 2√2, the Tsirelson bound.",
        assumptions: ["Space-like separated measurements", "Free choice of settings", "Fair sampling or detector-efficiency correction"],
        usedIn: ["Bell tests", "Device-independent QKD", "Foundations"],
        numericExample: {
          statement: "A Bell state at optimal angles gives S = 2.828.",
          latex: "S=2\\sqrt2=2.828"
        }
      },
      {
        id: "q07-e5",
        latex:
          "C=\\max\\left(0,\\frac{3p-1}{2}\\right)\\quad\\text{for }\\rho=p|\\Phi^+\\rangle\\langle\\Phi^+|+\\frac{1-p}{4}I",
        name: "Concurrence of a Werner state",
        symbols: [
          { symbol: "C", meaning: "Concurrence, 0 separable to 1 Bell", unit: "dimensionless" },
          { symbol: "p", meaning: "Weight of the Bell state", unit: "dimensionless" }
        ],
        interpretation:
          "Noise reduces entanglement linearly until it vanishes at p = 1/3. Above that threshold the state is entangled, but it may still fail to violate a Bell inequality: a two-qubit Werner state violates CHSH only above p = 1/√2 ≈ 0.707. Entanglement and Bell violation are therefore not the same property.",
        assumptions: ["Two-qubit Werner state", "White-noise model", "Ideal measurements"],
        usedIn: ["Decoherence models", "Entanglement witnesses", "QKD"],
        numericExample: {
          statement: "p = 0.80 gives C = 0.70; p = 0.30 gives C = 0.",
          latex: "C(0.8)=0.70,\\qquad C(0.3)=0"
        }
      }
    ],
    derivations: [
      {
        id: "d-q07-schmidt",
        title: "Schmidt decomposition and the origin of entanglement",
        intro:
          "Any pure two-qubit state can be written as a sum of at most two product terms with orthogonal local bases. The number of terms measures entanglement.",
        steps: [
          {
            label: "1",
            text: "Write the state in an arbitrary product basis.",
            latex: "|\\Psi\\rangle=\\sum_{i,j=0}^{1}A_{ij}|i\\rangle_A|j\\rangle_B"
          },
          {
            label: "2",
            text: "Treat the coefficient array A as a 2×2 matrix.",
            latex: "A=\\begin{pmatrix}A_{00}&A_{01}\\\\ A_{10}&A_{11}\\end{pmatrix}"
          },
          {
            label: "3",
            text: "Use the singular-value decomposition A = UΣV†.",
            latex: "A=U\\begin{pmatrix}s_0&0\\\\0&s_1\\end{pmatrix}V^{\\dagger}"
          },
          {
            label: "4",
            text: "Redefine the local bases by U and V; the state becomes diagonal in the new labels.",
            latex: "|\\Psi\\rangle=s_0|u_0\\rangle|v_0\\rangle+s_1|u_1\\rangle|v_1\\rangle"
          },
          {
            label: "5",
            text: "Normalisation requires s₀² + s₁² = 1. A product state has one nonzero Schmidt coefficient; a Bell state has two equal coefficients.",
            latex: "s_0^2+s_1^2=1,\\qquad C=2s_0s_1"
          }
        ],
        result: {
          latex: "|\\Psi\\rangle=\\sum_ks_k|u_k\\rangle|v_k\\rangle,\\qquad C=2s_0s_1",
          text:
            "Entanglement is basis-independent: it is the number of Schmidt coefficients that cannot be removed. For a Bell state s₀ = s₁ = 1/√2 and C = 1; for a product state one coefficient is zero and C = 0."
        },
        assumptions: ["Pure two-qubit state", "Normalised state", "Orthonormal local bases"]
      }
    ],
    problems: [
      {
        id: "q07-p1",
        type: "numerical",
        difficulty: 1,
        topic: "Tensor-product dimension",
        prompt:
          "What is the dimension of the Hilbert space of four polarization qubits? How many computational-basis amplitudes does a general state have?",
        answer:
          "The dimension is 2⁴ = 16, so a general pure state has 16 complex amplitudes (32 real parameters before normalisation and global phase). A product state of four qubits is a much smaller subset specified by four Bloch vectors.",
        numeric: { value: 16, tolerance: 0, unit: "dimension" },
        marks: 1
      },
      {
        id: "q07-p2",
        type: "mcq",
        difficulty: 1,
        topic: "Separability",
        prompt: "Which two-qubit state is a product state?",
        options: [
          "(|00⟩ + |11⟩)/√2",
          "(|01⟩ − |10⟩)/√2",
          "|0⟩(|0⟩ + |1⟩)/√2",
          "(|00⟩ + |01⟩ + |10⟩ + |11⟩)/2"
        ],
        answerIndex: 2,
        answer:
          "The state |0⟩(|0⟩ + |1⟩)/√2 factors into a state of A and a state of B, so it is a product. The first two are Bell states. The fourth is also a product: it equals (|0⟩ + |1⟩)(|0⟩ + |1⟩)/2, a superposition of all four terms with equal amplitudes.",
        explanation:
          "A product state has a coefficient matrix of rank one.",
        marks: 2
      },
      {
        id: "q07-p3",
        type: "numerical",
        difficulty: 2,
        topic: "Correlations",
        prompt:
          "For |Φ+⟩, the analyzers are at a relative angle of 60°. What is the probability that the two outcomes disagree?",
        answer:
          "P(opposite) = sin²60° = 0.75. Equivalently P(same) = cos²60° = 0.25.",
        numeric: { value: 0.75, tolerance: 0.001, unit: "dimensionless" },
        marks: 2
      },
      {
        id: "q07-p4",
        type: "numerical",
        difficulty: 2,
        topic: "CHSH",
        prompt:
          "What is the maximum CHSH value achievable with a Bell state, and by how much does it exceed the classical bound?",
        answer:
          "S_max = 2√2 = 2.828. The classical bound is 2, so the excess is 0.828. The optimal settings are separated by 45° in the measurement plane: a = 0°, a′ = 45°, b = 22.5°, b′ = −22.5° in the standard derivation.",
        numeric: { value: 2.828, tolerance: 0.002, unit: "dimensionless" },
        marks: 2
      },
      {
        id: "q07-p5",
        type: "short",
        difficulty: 2,
        topic: "No-signalling",
        prompt:
          "Why do entangled correlations not allow faster-than-light communication?",
        answer:
          "The reduced density matrix of each subsystem is independent of the operations performed on the other. For a Bell state, ρ_A = I/2 no matter what basis B is measured in, so every local outcome distribution is 50/50. The correlations are visible only when the two outcome lists are compared, which requires a classical channel limited by the speed of light. This is the no-signalling theorem.",
        marks: 3
      },
      {
        id: "q07-p6",
        type: "derivation",
        difficulty: 2,
        topic: "Product-state purity",
        prompt:
          "Show that a product state has a pure reduced state, while a Bell state has a maximally mixed one.",
        answer:
          "For |Ψ⟩ = |ψ⟩_A|φ⟩_B, ρ_AB = |ψ⟩⟨ψ| ⊗ |φ⟩⟨φ|. Taking the trace over B gives ρ_A = |ψ⟩⟨ψ| Tr(|φ⟩⟨φ|) = |ψ⟩⟨ψ|, which is pure. For |Φ+⟩ = (|00⟩ + |11⟩)/√2, the partial trace gives (|0⟩⟨0| + |1⟩⟨1|)/2 = I/2, whose purity is ½. The difference is the entanglement: the Bell state has two Schmidt coefficients, the product state only one.",
        marks: 3
      }
    ],
    references: [R("nielsen"), R("griffiths"), R("loudon"), R("hecht")],
    related: [
      "quantum-eraser",
      "quantum-key-distribution",
      "density-matrices-and-measurement",
      "q06-density-matrices-pure-and-mixed",
      "q08-decoherence-which-path-and-complementarity"
    ]
  },

  /* ------------------------------------------------------------------ */
  /* q08 — Decoherence, which-path and complementarity                  */
  /* ------------------------------------------------------------------ */
  {
    id: "q08-decoherence-which-path-and-complementarity",
    number: "Q08",
    title: "Decoherence, Which-Path and Complementarity",
    kicker: "Interference is a statement about indistinguishability",
    summary:
      "Which-path information and interference are complementary: the more the paths can be distinguished, the less they can interfere. This chapter derives the visibility–distinguishability relation, analyses the quantum eraser and delayed-choice experiments, and states the ideal assumptions behind the bomb tester and QKD security.",
    interactive: "density",
    blocks: [
      {
        type: "lead",
        text: "Put a polarization marker in one arm of an interferometer and the fringes vanish. Put an analyzer before the detector and fringes return in selected subensembles. Nothing has been erased from the past; the selection has restored indistinguishability in the future. Complementarity is an accounting identity, not a paradox."
      },
      {
        type: "p",
        text: "Model a two-path interferometer in which path a carries polarization |H⟩ and path b carries a marker state |m_b⟩ = cos θ|H⟩ + sin θ|V⟩. The overlap ⟨H|m_b⟩ = cos θ measures how distinguishable the paths are. If the marker is orthogonal to the reference (θ = 90°), the paths are perfectly distinguishable and no interference is possible. If the marker is identical (θ = 0°), the paths are indistinguishable and full interference returns. The state of the marker is the environment that stores the which-path information, even if no detector reads it."
      },
      {
        type: "p",
        text: "Tracing out the marker gives the reduced state of the path degree of freedom. The off-diagonal terms are multiplied by cos θ, so the interference term is reduced by the same factor. For balanced paths the visibility is V = |cos θ| and the distinguishability is D = √(1 − V²) = |sin θ|. More generally D² + V² ≤ 1, with equality for a pure marker and ideal detection. This is the quantitative form of Bohr's complementarity: the which-path information and the fringe visibility are not independent resources."
      },
      {
        type: "eq",
        latex:
          "V=|\\cos\\theta|,\\qquad D=\\sqrt{1-V^2}=|\\sin\\theta|,\\qquad D^2+V^2\\le1",
        number: "Q8.2"
      },
      {
        type: "p",
        text: "A quantum eraser removes the marker information by projecting the marker onto a basis that overlaps the two path states. An analyzer at angle α before detection gives conditional amplitudes cos α for path a and cos(α − θ) for path b, so the conditional visibility is 2|cos α cos(α − θ)|/[cos²α + cos²(α − θ)]. At θ = 90° and α = ±45°, each analyzer output shows full-visibility fringes, but the two outputs are out of phase by π. The unconditional pattern, summed over both outputs, has no fringes. The fringes are recovered only in coincidence with a particular marker outcome."
      },
      {
        type: "p",
        text: "Decoherence is the same mathematics applied to an unavoidable environment. A photon scattered by a dust particle, a stray reflection, or a detector that records the path all create orthogonal marker states. The environment does not need to be observed; it only needs to carry information. The fraction of sifted bits that disagree in a quantum key distribution run is the quantum bit error rate QBER = N_error/N_sifted, the quantity used to bound an eavesdropper's information. This explains why macroscopic objects do not show interference and why interferometers must be isolated. It does not explain why one outcome occurs; that is the measurement problem, which the formalism leaves open."
      },
      {
        type: "callout",
        tone: "misconception",
        title: "What the famous experiments do and do not assume",
        body:
          "A common misconception is that delayed-choice erasure is retrocausal; it is not. The ideal bomb tester predicts a 25% chance of identifying a live bomb without exploding it, a 50% chance of explosion and a 25% inconclusive result per trial, assuming perfect 50:50 beam splitters, lossless paths, unit-efficiency detectors and a bomb that absorbs every photon it encounters. Real demonstrations have losses and imperfect efficiency, so the rates are lower. BB84 security assumes an authenticated classical channel, a source close to a single-photon or decoy-state source, characterised detectors, and no side channels; the asymptotic secure threshold near 11% QBER is a statement within those assumptions, not a guarantee for every real device. The coincidence subsets in an eraser are defined after both records exist, and no signal travels backwards in time."
      },
      {
        type: "derivation",
        derivationId: "d-q08-visibility"
      },
      {
        type: "numeric",
        title: "Marker angle and the complementarity budget",
        statement:
          "A marker is set at θ = 30.0°. Find the visibility and distinguishability. Repeat for θ = 60.0° and θ = 90.0°.",
        latex:
          "\\theta=30^\\circ:\\quad V=\\cos30^\\circ=0.866,\\quad D=\\sin30^\\circ=0.500",
        result:
          "At 30°: V = 0.866, D = 0.500, and D² + V² = 0.25 + 0.75 = 1. At 60°: V = 0.500, D = 0.866. At 90°: V = 0, D = 1. The budget is always exactly one for this pure marker: information gained about the path is visibility lost."
      },
      {
        type: "numeric",
        title: "Eraser visibility and the BB84 error rate",
        statement:
          "For a marker at 90°, an analyzer at +45° is placed before detection. Find the conditional visibility. Separately, an intercept–resend eavesdropper measures every BB84 photon in a randomly chosen basis. What QBER results?",
        latex:
          "V_{\\mathrm{cond}}=\\frac{2(0.707)(0.707)}{0.5+0.5}=1.000",
        result:
          "The conditional visibility is 1: full fringes return in the +45° output, and the −45° output shows the same fringes shifted by π. The unconditional sum has zero visibility. For intercept–resend, Eve guesses the basis correctly half the time and introduces an error in half of the wrong-basis cases, giving QBER = ½ × ½ = 25%. A QBER near 11% or below is required for secure key generation in the ideal asymptotic BB84 analysis; 25% is far above it."
      }
    ],
    equations: [
      {
        id: "q08-e1",
        latex:
          "|\\Psi\\rangle=\\frac{1}{\\sqrt2}\\left(|a\\rangle|H\\rangle+e^{i\\delta}|b\\rangle|m_b\\rangle\\right)",
        name: "Two paths with a which-path marker",
        symbols: [
          { symbol: "|m_b\\rangle", meaning: "Marker state on path b", unit: "dimensionless" },
          { symbol: "\\delta", meaning: "Relative phase", unit: "rad" }
        ],
        interpretation:
          "The marker is the environment that stores path information. Its overlap with the reference state controls whether the path alternatives remain indistinguishable.",
        assumptions: ["Pure marker state", "Balanced paths", "Single photon", "No additional loss"],
        usedIn: ["Quantum eraser", "Complementarity", "Decoherence models"],
        numericExample: {
          statement: "θ = 30° gives overlap cos30° = 0.866.",
          latex: "\\langle H|m_b\\rangle=0.866"
        }
      },
      {
        id: "q08-e2",
        latex:
          "V=|\\cos\\theta|,\\qquad D=|\\sin\\theta|,\\qquad D^2+V^2=1",
        name: "Visibility–distinguishability trade-off",
        symbols: [
          { symbol: "V", meaning: "Fringe visibility", unit: "dimensionless" },
          { symbol: "D", meaning: "Which-path distinguishability", unit: "dimensionless" },
          { symbol: "\\theta", meaning: "Marker angle", unit: "rad" }
        ],
        interpretation:
          "Information and interference are complementary. A perfectly distinguishable path gives no fringes; an indistinguishable path gives full fringes.",
        assumptions: ["Balanced two-path interferometer", "Pure marker", "Ideal detectors"],
        usedIn: ["Eraser", "Complementarity tests", "Decoherence"],
        numericExample: {
          statement: "θ = 45° gives V = D = 0.707.",
          latex: "V=D=\\frac{1}{\\sqrt2}=0.707"
        }
      },
      {
        id: "q08-e3",
        latex:
          "V_{\\mathrm{cond}}=\\frac{2|\\cos\\alpha\\cos(\\alpha-\\theta)|}{\\cos^2\\alpha+\\cos^2(\\alpha-\\theta)}",
        name: "Conditional visibility after an analyzer",
        symbols: [
          { symbol: "\\alpha", meaning: "Analyzer angle", unit: "rad" },
          { symbol: "\\theta", meaning: "Marker angle", unit: "rad" }
        ],
        interpretation:
          "Projecting the marker onto a chosen analyzer output selects a subensemble. Within that subensemble the paths can become indistinguishable again, restoring fringes.",
        assumptions: ["Ideal analyzer", "Balanced paths", "Coincidence detection", "Pure marker"],
        usedIn: ["Quantum eraser", "Delayed choice", "Coincidence imaging"],
        numericExample: {
          statement: "θ = 90°, α = 45° gives V_cond = 1.",
          latex: "V_{\\mathrm{cond}}=1"
        }
      },
      {
        id: "q08-e4",
        latex:
          "\\mathrm{QBER}=\\frac{N_{\\mathrm{error}}}{N_{\\mathrm{sifted}}}",
        name: "Quantum bit error rate",
        symbols: [
          { symbol: "N_{\\mathrm{error}}", meaning: "Sifted bits that disagree", unit: "bits" },
          { symbol: "N_{\\mathrm{sifted}}", meaning: "Bits retained after basis sifting", unit: "bits" }
        ],
        interpretation:
          "The QBER estimates the disturbance introduced by the channel or an eavesdropper. Above a protocol-dependent threshold, no secure key can be extracted.",
        assumptions: ["Random basis choice", "Authenticated classical channel", "Fair sample of test bits", "No side channels"],
        usedIn: ["BB84", "E91", "Decoy-state QKD"],
        numericExample: {
          statement: "Intercept–resend gives QBER = 0.25.",
          latex: "\\mathrm{QBER}=0.25"
        }
      },
      {
        id: "q08-e5",
        latex:
          "\\rho_A=\\operatorname{Tr}_B|\\Psi\\rangle\\langle\\Psi|,\\qquad \\rho_{A,01}=\\frac{\\cos\\theta}{2}e^{i\\delta}",
        name: "Reduced state and decoherence factor",
        symbols: [
          { symbol: "\\rho_{A,01}", meaning: "Off-diagonal coherence of the path state", unit: "dimensionless" },
          { symbol: "\\cos\\theta", meaning: "Marker overlap (decoherence factor)", unit: "dimensionless" }
        ],
        interpretation:
          "Tracing out the marker multiplies the off-diagonal terms by the overlap. Orthogonal marker states erase the coherence and the interference term.",
        assumptions: ["Pure joint state", "Marker traced out", "Balanced paths"],
        usedIn: ["Decoherence", "Eraser", "Which-path analysis"],
        numericExample: {
          statement: "θ = 90° makes the off-diagonal coherence zero.",
          latex: "\\rho_{A,01}=0"
        }
      }
    ],
    derivations: [
      {
        id: "d-q08-visibility",
        title: "Which-path information limits fringe visibility",
        intro:
          "The reduced density matrix of the path degree of freedom contains the whole effect. The calculation is the partial trace of a pure two-qubit state.",
        steps: [
          {
            label: "1",
            text: "Write the state with a marker on path b.",
            latex: "|\\Psi\\rangle=\\frac{1}{\\sqrt2}\\left(|a\\rangle|H\\rangle+e^{i\\delta}|b\\rangle|m_b\\rangle\\right)"
          },
          {
            label: "2",
            text: "Form the projector and trace over the marker.",
            latex:
              "\\rho_A=\\frac12\\left(|a\\rangle\\langle a|+|b\\rangle\\langle b|+e^{-i\\delta}\\langle m_b|H\\rangle|a\\rangle\\langle b|+e^{i\\delta}\\langle H|m_b\\rangle|b\\rangle\\langle a|\\right)"
          },
          {
            label: "3",
            text: "Insert the overlap cos θ.",
            latex:
              "\\rho_A=\\frac12\\begin{pmatrix}1&e^{-i\\delta}\\cos\\theta\\\\ e^{i\\delta}\\cos\\theta&1\\end{pmatrix}"
          },
          {
            label: "4",
            text: "The detection probability in a basis that mixes the paths contains the off-diagonal term.",
            latex: "P\\propto1+\\cos\\theta\\cos\\delta"
          },
          {
            label: "5",
            text: "The visibility is the amplitude of the phase-dependent term.",
            latex: "V=|\\cos\\theta|,\\qquad D=\\sqrt{1-V^2}=|\\sin\\theta|"
          }
        ],
        result: {
          latex: "V^2+D^2=1",
          text:
            "The complementarity relation is an equality for a pure marker and balanced paths. Any loss or imperfect detection turns it into an inequality D² + V² ≤ 1."
        },
        assumptions: ["Pure joint state", "Balanced path amplitudes", "Ideal marker and detectors", "Single photon"]
      }
    ],
    problems: [
      {
        id: "q08-p1",
        type: "numerical",
        difficulty: 2,
        topic: "Complementarity",
        prompt:
          "A which-path marker is set at 45°. Find the visibility and distinguishability, and verify the complementarity relation.",
        answer:
          "V = |cos45°| = 0.707 and D = |sin45°| = 0.707. Then D² + V² = 0.5 + 0.5 = 1. The paths are equally distinguishable and interfering; neither resource is maximal.",
        numeric: { value: 0.707, tolerance: 0.002, unit: "dimensionless" },
        marks: 2
      },
      {
        id: "q08-p2",
        type: "derivation",
        difficulty: 3,
        topic: "Quantum eraser",
        prompt:
          "Derive the conditional visibility of a two-path interferometer with a marker at angle θ and an analyzer at angle α. Evaluate it for θ = 90° and α = 45°.",
        answer:
          "After tracing out the marker, the path density matrix has off-diagonal terms multiplied by cos θ. An analyzer at α projects the marker states onto amplitudes cos α for path a and cos(α − θ) for path b. The conditional intensities are cos²α and cos²(α − θ), so the conditional visibility is V_cond = 2|cosα cos(α − θ)|/[cos²α + cos²(α − θ)]. At α = 45° and θ = 90°, both cosines have magnitude 1/√2, the numerator is 1 and the denominator is 1, so V_cond = 1. The orthogonal analyzer output also has full visibility but with the fringes shifted by π, so the sum over both outputs has no fringes.",
        numeric: { value: 1, tolerance: 0.001, unit: "dimensionless" },
        marks: 4
      },
      {
        id: "q08-p3",
        type: "mcq",
        difficulty: 2,
        topic: "Delayed choice",
        prompt:
          "In a delayed-choice quantum eraser, the choice of whether to erase which-path information is made after the photon has been detected. Which statement is correct?",
        options: [
          "The future choice changes the past detection event",
          "The erasure selects coincidence subensembles; no signal travels backwards in time",
          "The experiment violates the no-signalling theorem",
          "The interference disappears because the photon is absorbed"
        ],
        answerIndex: 1,
        answer:
          "The idler photon's measurement is correlated with the signal photon's detection. Sorting the signal events according to the idler outcome produces fringe or antifringe patterns in the subsets; the total pattern is unchanged. The sorting is done after both records exist, so there is no retrocausal signal and no violation of no-signalling.",
        explanation:
          "Conditioning on a later measurement is a selection, not a modification of the earlier event.",
        marks: 2
      },
      {
        id: "q08-p4",
        type: "short",
        difficulty: 2,
        topic: "No-cloning and QKD",
        prompt:
          "Why does no-cloning make perfect eavesdropping impossible in BB84?",
        answer:
          "BB84 uses non-orthogonal states, for example the Z basis {|0⟩, |1⟩} and the X basis {|+⟩, |−⟩}. An eavesdropper who does not know the basis cannot copy an unknown state faithfully, because no unitary copies all non-orthogonal states. Any attempt to measure and re-prepare disturbs the state; if the wrong basis is used, the resent photon is in the wrong state half the time, producing a 25% QBER overall. Alice and Bob detect this disturbance in a sample of sifted bits and abort if it is too high.",
        marks: 3
      },
      {
        id: "q08-p5",
        type: "numerical",
        difficulty: 2,
        topic: "Bomb tester",
        prompt:
          "In the ideal Elitzur–Vaidman bomb tester with two 50:50 beam splitters, what is the probability that a live bomb is identified without exploding it in a single trial? What is the probability of explosion?",
        answer:
          "The photon has probability ½ of taking the path through the bomb, which explodes. If it takes the other path, the second beam splitter sends it to the dark port with probability ½ and to the bright port with probability ½. A dark-port click therefore occurs with probability ¼ and certifies the bomb is live. The remaining ¼ is an inconclusive bright-port click. The probabilities are 25% interaction-free detection, 50% explosion and 25% inconclusive.",
        numeric: { value: 0.25, tolerance: 0.001, unit: "dimensionless" },
        marks: 3
      },
      {
        id: "q08-p6",
        type: "short",
        difficulty: 3,
        topic: "QKD security assumptions",
        prompt:
          "List the main assumptions behind a claim that a BB84 implementation is secure.",
        answer:
          "The source must approximate a single-photon source, or a decoy-state protocol must bound multi-photon pulses. The detectors must be characterised, with trusted efficiency and dark counts, or their behavior must be included in the security model. The classical channel must be authenticated, so Eve cannot mount a man-in-the-middle attack. The random-number generator and basis choices must be unpredictable. Side channels — timing, power, wavelength, back-reflection — must be closed or bounded. Finite-key effects and composability must be analysed, not just the asymptotic rate. Under these assumptions, a QBER below the protocol threshold (about 11% asymptotically for ideal BB84 with one-way reconciliation) permits a positive secure key rate.",
        marks: 4
      }
    ],
    references: [
      R("nielsen"),
      R("elitzur1993"),
      R("kwiat1995"),
      R("bennett1984"),
      R("scarani2009")
    ],
    related: [
      "quantum-eraser",
      "quantum-bomb-tester",
      "quantum-key-distribution",
      "density-matrices-and-measurement",
      "entanglement-and-tensor-products"
    ]
  }
];

export const QUANTUM_BY_ID: Record<string, MathChapter> = Object.fromEntries(
  QUANTUM_CHAPTERS.map((chapter) => [chapter.id, chapter])
);

export function getQuantumChapter(id: string): MathChapter | undefined {
  return QUANTUM_BY_ID[id];
}
