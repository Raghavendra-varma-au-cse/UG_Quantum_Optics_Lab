import type { ExperimentContent, Reference } from "@/lib/content/types";
import { getReference } from "@/lib/content/references";
import { eraserSimulation } from "./physics";

export { eraserSimulation };

const tex = String.raw;

function ref(id: string): Reference {
  const found = getReference(id);
  if (!found) throw new Error(`Unknown reference in quantum-eraser content: ${id}`);
  return found;
}

const REFERENCES: Reference[] = [
  ref("hecht"),
  ref("bornwolf"),
  ref("loudon"),
  ref("nielsen"),
  ref("griffiths"),
  ref("kim2000"),
  ref("jacques2007"),
  ref("saleh"),
  ref("goldstein"),
  ref("thorlabs_edu"),
  ref("taylor")
];

export const content: ExperimentContent = {
  slug: "quantum-eraser",
  number: "04",
  title: "Quantum Eraser",
  shortTitle: "Quantum Eraser",
  subtitle: "Which-path information, polarization marking and post-selected interference",
  summary:
    "Mark the two arms of a Mach–Zehnder interferometer with polarization, watch the fringes disappear, then erase the marker with an analyser and recover fringes in a post-selected subensemble.",
  principle:
    "Distinguishability D and fringe visibility V obey D² + V² ≤ 1; erasing the marker restores coherence only in a selected subensemble, never in the full singles record.",
  family: "Quantum foundations",
  difficulty: 3,
  duration: "3–5 h",
  evidence: {
    implementation: "classical-demo",
    headline: "Classical-wave analogue — not a single-photon experiment",
    detail:
      "The tabletop procedure uses a coherent He–Ne laser and photodiodes. It demonstrates the same polarization algebra and post-selected interference as the quantum eraser, but it does not establish single-photon behaviour. A genuine single-photon quantum eraser requires a heralded photon source (for example SPDC), single-photon detectors and coincidence counting; a SPAD and time tagger are listed as unverified and are not assumed to be available."
  },
  kit: {
    name: "Thorlabs educational interferometry kit — polarization extension",
    manufacturer: "Thorlabs",
    verification: "unverified",
    documentation: [
      {
        title: "Thorlabs educational kits, user guides and application notes",
        url: "https://www.thorlabs.com/",
        note: "Consult the packing list supplied with the physical kit. The exact kit model and part numbers have not been verified here."
      }
    ],
    note:
      "Hardware is listed as generic teaching-laboratory categories, not as verified catalogue SKUs. The single-photon source, SPAD and time tagger are explicitly unverified and are needed only for a genuine coincidence experiment."
  },
  hardware: [
    {
      itemId: "src-he-ne",
      quantity: "1",
      role: "kit",
      note: "Coherent 632.8 nm source for the classical-wave demonstration; attenuate if necessary."
    },
    {
      itemId: "bs-cube-50",
      quantity: "2",
      role: "kit",
      note: "Non-polarizing 50:50 cubes for the two Mach–Zehnder splitters."
    },
    {
      itemId: "mir-plane",
      quantity: "2",
      role: "kit",
      note: "One steering mirror per arm."
    },
    {
      itemId: "waveplate-half",
      quantity: "2",
      role: "kit",
      note: "One zero-order half-wave plate in each arm; the marker plate is rotated in a graduated mount."
    },
    {
      itemId: "pol-linear",
      quantity: "2",
      role: "kit",
      note: "Analysers before the two output detectors; a single analyser can be moved between outputs in a minimal build."
    },
    {
      itemId: "rotation-mount",
      quantity: "2",
      role: "kit",
      note: "Graduated rotation mounts for the marker and analyser; record the zero positions."
    },
    {
      itemId: "det-photodiode",
      quantity: "2",
      role: "kit",
      note: "Photodiodes with transimpedance amplifiers for the classical fringe measurement."
    },
    {
      itemId: "det-spad",
      quantity: "2",
      role: "unverified",
      note: "Required only for a genuine photon-counting experiment. A photodiode cannot count photons. Verify availability, dark counts and timing before planning the coincidence phase."
    },
    {
      itemId: "det-photon-counter",
      quantity: "1",
      role: "unverified",
      note: "Time tagger or coincidence unit needed to record gated counts; not assumed present."
    },
    {
      itemId: "src-single-photon",
      quantity: "1",
      role: "unverified",
      note: "Heralded single-photon source; a genuine quantum-eraser experiment requires this or an equivalent SPDC source."
    },
    {
      itemId: "optical-table",
      quantity: "1",
      role: "kit",
      note: "Damped table for sub-wavelength path stability."
    },
    {
      itemId: "beam-block",
      quantity: "2",
      role: "kit",
      note: "One at each unused beam exit; block the beam before changing optics."
    },
    {
      itemId: "iris-diaphragm",
      quantity: "2",
      role: "kit",
      note: "Beam centring and aperture control."
    }
  ],
  objectives: [
    "Explain wave–particle duality and complementarity in a two-path interferometer.",
    "Write the two-path state with a polarization marker and compute the marker overlap ⟨H|θ⟩ = cosθ.",
    "Derive the fringe visibility V = |cosθ| and the distinguishability D = √(1−V²) for balanced pure marking.",
    "Align a Mach–Zehnder interferometer and obtain stable, high-visibility fringes.",
    "Insert a half-wave plate marker and quantify how V falls as the marker angle increases.",
    "Use an analysing polarizer to recover conditional fringes and explain why post-selection is essential.",
    "Explain why the ungated pattern remains flat at θ = 90° even after the analyser is inserted.",
    "Distinguish the classical-wave demonstration from a genuine single-photon coincidence experiment.",
    "Estimate visibility uncertainty and identify the dominant systematic errors in a real alignment."
  ],
  concepts: [
    "Complementarity",
    "Which-path information",
    "Distinguishability",
    "Polarization marking",
    "Partial trace",
    "Post-selection",
    "Fringe visibility",
    "Coincidence detection"
  ],
  prerequisites: [
    "Two-beam interference and the meaning of fringe visibility",
    "Complex amplitudes and phase differences",
    "Jones vectors, Malus's law and wave-plate axes",
    "Beam-splitter amplitude relations",
    "Coherence and spatial mode overlap",
    "Density matrices and the partial trace",
    "Uncertainty propagation and least-squares fitting"
  ],
  sections: [
    {
      id: "duality",
      number: "01",
      title: "Wave–particle duality and complementarity",
      kicker: "Two ways of asking the same question",
      blocks: [
        {
          type: "lead",
          text: "Interference asks whether the two paths were indistinguishable. Which-path information asks which path was taken. A two-path interferometer can answer one question well, but not both at once."
        },
        {
          type: "p",
          text: "In a Young or Mach–Zehnder experiment, a single detection event is recorded at a screen or detector. The pattern that builds up from many events is not produced by classical particles choosing a route, nor by a classical wave divided in two. It is the statistics of a quantum amplitude that has a phase. When the two path amplitudes reach the detector with a definite relative phase, their cross term produces fringes. When an unambiguous record of the path exists — in the environment, in a marker, or in a detector — the cross term is reduced or eliminated."
        },
        {
          type: "p",
          text: "This trade-off is complementarity. It is quantitative: the fringe visibility V and the which-path distinguishability D satisfy D² + V² ≤ 1. For an ideal pure-state marker and balanced paths the inequality becomes an equality. The quantum eraser explores what happens when the which-path record is itself quantum-mechanical and can be erased before the interference is observed."
        },
        {
          type: "callout",
          tone: "principle",
          title: "Complementarity is a statement about available information",
          body:
            "The fringes disappear when the path could be known in principle, even if no one reads the marker. Erasing the marker does not delete a past event; it changes which subensemble of detected events is being analysed."
        },
        {
          type: "callout",
          tone: "note",
          title: "Evidence label for this module",
          body:
            "This is a classical optical demonstration. A coherent laser field and photodiodes reproduce the polarization algebra exactly, but the experiment does not demonstrate single-photon interference. The genuine single-photon version requires a heralded source, single-photon detectors and coincidence counting, none of which is assumed."
        },
        {
          type: "p",
          text: "The distinction matters for interpretation. A classical field can show the same visibility curve, the same Malus projection and the same post-selected fringes. What the classical demonstration cannot show is that the interference survives when the field is attenuated to the single-quantum level and the marker is carried by the same photon. That claim requires photon-counting evidence."
        }
      ]
    },
    {
      id: "two-path",
      number: "02",
      title: "Superposition in a two-path interferometer",
      kicker: "Two amplitudes, one phase",
      blocks: [
        {
          type: "p",
          text: "A balanced Mach–Zehnder interferometer splits an input field at the first beam splitter, sends the two amplitudes around separate arms, and recombines them at the second. With a relative phase φ between the arms, the intensity at one output is I = I₀(1 + V cos φ). The visibility V is 1 when the two amplitudes are equal and fully coherent, and falls when the amplitudes are unequal, the spatial modes do not overlap, or an additional degree of freedom distinguishes the paths."
        },
        {
          type: "eq",
          latex: tex`I(\varphi)=I_0\left[1+V\cos\varphi\right]`,
          number: "2.1",
          note: "One output of a balanced two-path interferometer. The second output carries the complementary pattern."
        },
        {
          type: "diagram",
          kind: "mach-zehnder",
          caption:
            "Mach–Zehnder layout used as the starting point. The marker and analyser are added in the two arms and before the detectors, as shown in later figures.",
          height: 300
        },
        {
          type: "p",
          text: "A single photon is not a small classical pulse. The state after the first beam splitter is a superposition of two path states, |a⟩ and |b⟩. The second beam splitter maps that superposition onto the two output modes. The relative phase φ can come from a path-length difference, a refractive index, or a deliberately inserted phase plate. Scanning φ traces the fringe."
        },
        {
          type: "callout",
          tone: "misconception",
          title: "The photon does not split into two halves",
          body:
            "The correct statement is that the photon's state has amplitudes on both paths. A detection event is registered at one output, not at both. The fringe appears in the probability distribution over many identically prepared events."
        },
        {
          type: "p",
          text: "For the rest of this experiment, path a is the upper arm and path b is the lower arm. The beam splitters are treated as ideal 50:50 devices, and the two arms are adjusted to equal intensity and good spatial overlap before any polarization marker is inserted."
        }
      ]
    },
    {
      id: "which-path",
      number: "03",
      title: "Which-path information and distinguishability",
      kicker: "How much could you know?",
      blocks: [
        {
          type: "p",
          text: "Which-path information does not require a human observer. It requires that some physical degree of freedom becomes correlated with the path. If the correlation is perfect, the two path states are orthogonal and no interference remains. The standard measure is the distinguishability D, defined so that D = 0 means the paths are indistinguishable and D = 1 means they are perfectly distinguishable."
        },
        {
          type: "eq",
          latex: tex`D=\sqrt{1-\left|\langle a|b\rangle\right|^2}`,
          number: "3.1",
          note: "For two normalized path states with overlap ⟨a|b⟩. The overlap may include the marker, the environment, or any other degree of freedom correlated with the path."
        },
        {
          type: "table",
          caption: "Ideal balanced marker: visibility and distinguishability versus marker angle",
          head: ["Marker angle θ", "Overlap |cos θ|", "Visibility V", "Distinguishability D", "D² + V²"],
          align: ["r", "r", "r", "r", "r"],
          rows: [
            ["0°", "1.000", "1.000", "0.000", "1.000"],
            ["30°", "0.866", "0.866", "0.500", "1.000"],
            ["45°", "0.707", "0.707", "0.707", "1.000"],
            ["60°", "0.500", "0.500", "0.866", "1.000"],
            ["90°", "0.000", "0.000", "1.000", "1.000"]
          ]
        },
        {
          type: "p",
          text: "The table is the quantitative core of the experiment. At θ = 0° the marker does nothing and the fringes are fully visible. At θ = 90° the marker states are orthogonal, D = 1 and V = 0. Intermediate angles trade one quantity for the other along the circle D² + V² = 1. The equality is special to a pure marker and balanced paths; a mixed marker, unequal path intensities or imperfect mode overlap move the system inside the circle."
        }
      ]
    },
    {
      id: "marking",
      number: "04",
      title: "Polarization marking with a half-wave plate",
      kicker: "Write the path label into the polarization",
      blocks: [
        {
          type: "p",
          text: "A zero-order half-wave plate rotates a linear polarization by twice its fast-axis angle. With horizontally polarized input, a plate whose fast axis is at β produces linear polarization at 2β. To create the marker state |θ⟩ = cosθ|H⟩ + sinθ|V⟩ on path b, set the plate axis to β = θ/2. A plate at 0° leaves |H⟩ unchanged; a plate at 45° produces |V⟩, which is orthogonal to path a and therefore a perfect which-path marker."
        },
        {
          type: "diagram",
          kind: "waveplate",
          caption:
            "Half-wave plate geometry. The fast axis is at β; a linear input at 0° emerges at 2β. In this experiment the marker polarization angle is θ = 2β, so the plate scale reads θ/2.",
          height: 300
        },
        {
          type: "p",
          text: "The state just before the second beam splitter, with a marker on path b and a relative phase φ, is"
        },
        {
          type: "eq",
          latex: tex`|\Psi\rangle=\frac{1}{\sqrt{1+r^2}}\left(|a\rangle|H\rangle+r\,e^{i\varphi}|b\rangle|\theta\rangle\right),\qquad |\theta\rangle=\cos\theta\,|H\rangle+\sin\theta\,|V\rangle`,
          number: "4.1",
          note: "r = √(I_B/I_A) is the path-b amplitude ratio. The marker is a pure polarization state; the spatial mode is the same for both paths."
        },
        {
          type: "p",
          text: "The overlap that controls interference is not the overlap of the spatial modes — those are deliberately matched — but the overlap of the marker states: ⟨H|θ⟩ = cosθ. At θ = 90° the overlap is zero. The paths are still spatially overlapped at the second beam splitter, yet the polarization label carries away the which-path information."
        },
        {
          type: "callout",
          tone: "lab",
          title: "Practical marker alignment",
          body:
            "Mount the half-wave plate in a graduated rotation stage. With the plate removed, record the fringe maxima and minima. Insert the plate at its nominal 0° and confirm that the fringes return to the same positions. Then rotate in 5° steps. A zero-order plate is preferable: it is less sensitive to wavelength and temperature than a multi-order plate, and it keeps the retardation close to 180° across the beam."
        }
      ]
    },
    {
      id: "orthogonal",
      number: "05",
      title: "Why orthogonal markers destroy the fringes",
      kicker: "The cross term carries the overlap",
      blocks: [
        {
          type: "p",
          text: "A detector without an analyser responds to both polarizations. The intensity is the sum of the two path intensities plus an interference term proportional to the marker overlap. Only the component of path b that shares path a's polarization can interfere with it. The orthogonal component adds intensity but no phase-dependent cross term."
        },
        {
          type: "eq",
          latex: tex`V=\frac{2r\left|\langle H|\theta\rangle\right|}{1+r^2}=\frac{2r|\cos\theta|}{1+r^2}`,
          number: "5.1",
          note: "Balanced paths (r = 1) give the familiar V = |cos θ|."
        },
        {
          type: "derivation",
          derivationId: "visibility-marking"
        },
        {
          type: "numeric",
          title: "Half marking",
          statement: "A marker at θ = 60° is inserted in one arm of a balanced interferometer.",
          latex: tex`V=\left|\cos 60^\circ\right|=0.500`,
          result: "The fringe contrast falls to 50 %. The remaining contrast is not noise: it is the part of the field that still shares a common polarization."
        },
        {
          type: "callout",
          tone: "misconception",
          title: "Nobody has to read the marker",
          body:
            "The fringes disappear because the which-path information exists in the polarization state, not because a detector or a person accesses it. If the marker were measured in the {|H⟩,|V⟩} basis, the path would be known; if it is left alone, the mere correlation is enough to reduce the interference."
        },
        {
          type: "p",
          text: "This is the first half of the eraser story. The marker has converted path information into polarization information. To recover fringes, the polarization must be projected in a way that removes the path correlation — and that projection is a post-selection."
        }
      ]
    },
    {
      id: "density",
      number: "06",
      title: "The density-matrix view: tracing over the marker",
      kicker: "What the detector sees when it ignores polarization",
      blocks: [
        {
          type: "p",
          text: "A detector that does not analyse polarization does not have access to the marker. Its predictions are obtained from the reduced density matrix of the path degree of freedom, found by taking the partial trace over the marker states. The diagonal elements are the path probabilities. The off-diagonal elements are the coherences that produce fringes."
        },
        {
          type: "eq",
          latex: tex`\rho_A=\mathrm{Tr}_{\rm pol}|\Psi\rangle\langle\Psi|=\frac{1}{1+r^2}\begin{pmatrix}1&r\,e^{-i\varphi}\cos\theta\\[2pt] r\,e^{i\varphi}\cos\theta&r^2\end{pmatrix}`,
          number: "6.1",
          note: "Path basis {|a⟩,|b⟩}. The off-diagonal coherence is multiplied by the marker overlap cos θ."
        },
        {
          type: "p",
          text: "For balanced paths, r = 1, the matrix becomes (1/2) × [[1, e^{−iφ} cos θ], [e^{iφ} cos θ, 1]]. At θ = 0° it is a pure state and the off-diagonal magnitude is 1/2; at θ = 90° it is diagonal, (1/2)I, a maximally mixed path state. The visibility is 2|ρ_ab|/(ρ_aa + ρ_bb) = |cosθ|, matching the wave-optics calculation."
        },
        {
          type: "callout",
          tone: "note",
          title: "Tracing is not a disturbance",
          body:
            "The partial trace is not a physical kick to the photon. It is the correct description for an observer who does not measure the marker. The full two-qubit state remains pure; the reduced path state is mixed because path and polarization are entangled."
        },
        {
          type: "definition",
          term: "Partial trace",
          body:
            "For a bipartite state ρ_AB, the reduced state on A is ρ_A = Tr_B ρ_AB = Σ_j (I_A ⊗ ⟨j|_B) ρ_AB (I_A ⊗ |j⟩_B), where {|j⟩_B} is an orthonormal basis of B. It gives the statistics of every measurement that acts only on A."
        },
        {
          type: "p",
          text: "The density-matrix language makes the eraser transparent. A polarization projection prepares a new path state conditional on the analyser outcome. In that subensemble the off-diagonal coherence can be restored, even though the original reduced state had none. The cost is that the subensemble is selected after the interference has already been recorded."
        }
      ]
    },
    {
      id: "erasure",
      number: "07",
      title: "Erasure by projection with an analyser",
      kicker: "Project both paths onto one polarization",
      blocks: [
        {
          type: "p",
          text: "Place a linear analyser before the detector and set its transmission axis to α. Both path amplitudes are projected onto |α⟩. Malus's law gives the probability for a path whose polarization is at angle γ: P = cos²(α − γ). Path a is at 0°, path b at θ. After projection, the two amplitudes share the same polarization and can interfere again."
        },
        {
          type: "diagram",
          kind: "polarization",
          caption:
            "Analyser geometry. A linear polarizer at α transmits the component of each path along α. The projection is the erasure step: it removes the orthogonal marker component and with it the path label.",
          height: 300
        },
        {
          type: "eq",
          latex: tex`P(\alpha|\gamma)=\cos^2(\alpha-\gamma)`,
          number: "7.1",
          note: "Malus projection for a linear polarization at γ. For path a, γ = 0°; for path b, γ = θ."
        },
        {
          type: "p",
          text: "The conditional visibility in the selected analyser output is"
        },
        {
          type: "eq",
          latex: tex`V_{\rm cond}(\alpha)=\frac{2r\left|\cos\alpha\,\cos(\alpha-\theta)\right|}{\cos^2\alpha+r^2\cos^2(\alpha-\theta)}`,
          number: "7.2",
          note: "For balanced paths, the maximum is 1 at α = θ/2 and α = θ/2 + 90°. At θ = 90° the erasure angles are 45° and 135°."
        },
        {
          type: "derivation",
          derivationId: "conditional-visibility"
        },
        {
          type: "numeric",
          title: "The canonical erasure setting",
          statement: "θ = 90° (orthogonal marker) and α = 45° (analyser on the bisector).",
          latex: tex`V_{\rm cond}(45^\circ)=\frac{2(1)\left|\cos45^\circ\cos(-45^\circ)\right|}{\cos^2 45^\circ+\cos^2(-45^\circ)}=1`,
          result: "The selected subensemble shows full-contrast fringes, even though the unconditioned visibility is zero. The fringes in the orthogonal analyser channel are shifted by 180°."
        },
        {
          type: "callout",
          tone: "principle",
          title: "Erasure is a projection, not a recovery of the original state",
          body:
            "The analyser transmits only part of the light. The conditional fringes appear in the transmitted subensemble. The discarded photons are not available, and the total singles rate contains no fringe."
        }
      ]
    },
    {
      id: "coincidence",
      number: "08",
      title: "Conditional interference and coincidence gating",
      kicker: "Keep the label, see the fringe",
      blocks: [
        {
          type: "p",
          text: "An analysing polarizer has two complementary outputs: transmission at α and transmission at α + 90°. Each output shows an interference pattern, and the two patterns are phase-shifted. A detector that records only one output, or a coincidence record that tags which output fired, selects one of these subensembles. Without the tag, the two patterns are summed: at θ = 90° their fringes cancel exactly, while for intermediate θ the sum retains the marker-limited visibility."
        },
        {
          type: "eq",
          latex: tex`R_{+}(\alpha,\varphi)=R_0\,\frac{\cos^2\alpha+r^2\cos^2(\alpha-\theta)}{2(1+r^2)}\left[1+V_{\rm cond}(\alpha)\cos\varphi\right]`,
          number: "8.1",
          note: "Count rate in the + analyser channel at one interferometer output. The orthogonal channel has cos → sin and the opposite fringe phase."
        },
        {
          type: "diagram",
          kind: "quantum-eraser",
          caption:
            "Quantum-eraser layout. The half-wave plate in path b writes the marker; the analyser before the detector erases it. In a genuine single-photon version the two outputs feed single-photon detectors and a time tagger, and coincidences with a herald define the gated record.",
          height: 320
        },
        {
          type: "p",
          text: "In the classical demonstration, 'gating' means recording the analyser setting and the output port, then sorting the photodiode signal into the corresponding subensemble. In a single-photon experiment it means recording a time tag for each detector and keeping only events that satisfy the coincidence condition. Both procedures are post-selection: the data are partitioned after the detection event."
        },
        {
          type: "callout",
          tone: "lab",
          title: "What a real coincidence stage adds",
          body:
            "A polarizing beam splitter, two SPADs and a time tagger let you record both analyser outputs simultaneously. The coincidence window must be short compared with the source coherence and the detector jitter; accidental coincidences are estimated from delayed time windows and subtracted. None of this is modelled by the simulator."
        },
        {
          type: "eq",
          latex: tex`R_{+}(\varphi)+R_{-}(\varphi)=\frac{R_0}{2}\left[1+\frac{2r\cos\theta}{1+r^2}\cos\varphi\right]`,
          number: "8.2",
          note: "The sum of the two complementary analyser channels reproduces the marker-limited visibility. At θ = 90° it is independent of φ."
        }
      ]
    },
    {
      id: "unconditional",
      number: "09",
      title: "Why the unconditional pattern shows no fringes",
      kicker: "The two erasure patterns cancel",
      blocks: [
        {
          type: "p",
          text: "At θ = 90° the two analyser channels carry fringes of equal amplitude and opposite phase. Channel + is bright where channel − is dark, and vice versa. If the experimenter does not record which channel fired, the two patterns add. The result is flat: the which-path information has not been erased from the full record, only hidden inside a correlation that was not measured."
        },
        {
          type: "eq",
          latex: tex`I_{+}(\varphi)+I_{-}(\varphi)=\text{constant}\qquad(\theta=90^\circ)`,
          number: "9.1",
          note: "At one interferometer output, after summing the two orthogonal analyser settings. This is the unconditional singles record."
        },
        {
          type: "p",
          text: "For intermediate marker angles the sum is not exactly flat: it retains the visibility V = |cosθ| that was already present before the analyser. The eraser does not create coherence in the total ensemble. It reveals, in a selected subensemble, coherence that was never accessible to a detector insensitive to the marker."
        },
        {
          type: "p",
          text: "In the two-channel language, the mean-weighted visibility q₊V₊ + q₋V₋ is bounded by one, where q± are the fractions of the light in the two analyser channels. Both V₊ and V₋ can be close to one at the same time because the channels are separately post-selected and their fringes are in antiphase; the bound applies to the weighted combination, not to the unweighted sum V₊ + V₋."
        },
        {
          type: "callout",
          tone: "misconception",
          title: "Erasure does not change the past",
          body:
            "The detection event at the screen or detector is already recorded before the analyser channel is known. Post-selection sorts events into subensembles; it does not send a signal back to the interferometer. No choice of analyser setting can be read out from the unconditional singles rate at θ = 90°."
        },
        {
          type: "p",
          text: "This is also why the delayed-choice experiments are subtle. The choice of measurement basis can be made after the signal photon is detected, but the interference is only visible after the idler is detected and the coincidence record is sorted. The ordinary singles record remains flat. The correlation is real; retrocausation is not required."
        }
      ]
    },
    {
      id: "complementarity",
      number: "10",
      title: "The D² + V² ≤ 1 relation",
      kicker: "A quantitative trade-off",
      blocks: [
        {
          type: "p",
          text: "For a pure marker and balanced paths, distinguishability and visibility lie on a circle. For unequal path intensities the fringe visibility is reduced by the amplitude imbalance, and the sum falls below one. The general statement is an inequality: no preparation can make both the which-path information and the interference fringes arbitrarily strong."
        },
        {
          type: "eq",
          latex: tex`D^2+V^2\le 1,\qquad D^2+V^2=1\ \text{for pure balanced marking}`,
          number: "10.1",
          note: "D = √(1−|⟨a|b⟩|²), V = 2r|⟨a|b⟩|/(1+r²). Equality requires a pure marker and r = 1."
        },
        {
          type: "derivation",
          derivationId: "complementarity"
        },
        {
          type: "table",
          caption: "Effect of path imbalance on the duality sum (θ = 45°)",
          head: ["Intensity ratio I_B/I_A", "r", "V", "D", "D² + V²"],
          align: ["r", "r", "r", "r", "r"],
          rows: [
            ["0.25", "0.500", "0.566", "0.707", "0.820"],
            ["0.50", "0.707", "0.667", "0.707", "0.944"],
            ["1.00", "1.000", "0.707", "0.707", "1.000"],
            ["2.00", "1.414", "0.667", "0.707", "0.944"],
            ["4.00", "2.000", "0.566", "0.707", "0.820"]
          ]
        },
        {
          type: "p",
          text: "The table shows why the balanced condition matters. The marker is still pure at θ = 45°, and D is still 0.707, but unequal path intensities reduce V and therefore the sum. A real interferometer should be balanced to within a few percent before the duality relation is tested quantitatively."
        },
        {
          type: "callout",
          tone: "principle",
          title: "Why the relation is useful",
          body:
            "It turns a conceptual statement into a measurable consistency check. Measure V from the fringe maxima and minima, compute D from the marker angle, and test whether the apparatus behaves as a pure two-state system. A significant violation points to a calibration error or an unmodelled degree of freedom."
        }
      ]
    },
    {
      id: "delayed-choice",
      number: "11",
      title: "Delayed-choice extension",
      kicker: "Advanced theory — not implemented here",
      blocks: [
        {
          type: "p",
          text: "In a delayed-choice eraser, the which-path marker is carried by an idler photon that is detected after the signal photon has already been recorded. Kim et al. (2000) used spontaneous parametric down-conversion and a coincidence circuit to sort signal events according to the idler measurement. The sorted subensembles show fringes or which-path behaviour, while the unsorted singles record is flat. Jacques et al. (2007) realised Wheeler's delayed-choice gedanken experiment with a single-photon source and a fast electro-optic switch, closing the time-ordering loophole in their configuration."
        },
        {
          type: "p",
          text: "These experiments are important tests of the consistency of quantum mechanics, but they do not demonstrate that a future choice changes a past event. The idler measurement and the signal detection are spacelike or time-ordered in a way that forbids using the correlation to send a signal. The fringes appear only after the coincidence record is sorted."
        },
        {
          type: "callout",
          tone: "note",
          title: "Not part of this module's implementation",
          body:
            "This module implements the fixed-analyser polarization eraser only. It has no SPDC source, no idler arm, no delay line and no delayed-choice switch. The delayed-choice discussion is included so that the limits of the tabletop demonstration are explicit."
        },
        {
          type: "list",
          items: [
            "Kim et al. (2000): signal and idler photons from SPDC; idler detected after the signal; coincidence sorting produces complementary fringe patterns.",
            "Jacques et al. (2007): single-photon source and electro-optic switch; the choice of closed or open interferometer is made after the photon has entered the apparatus.",
            "Neither experiment allows faster-than-light signalling: the unconditional singles record contains no fringe and no choice-dependent signal.",
            "A classroom laser demonstration cannot reproduce these tests; it lacks a heralded single-photon source and true coincidence timing."
          ]
        }
      ]
    },
    {
      id: "lab-reality",
      number: "12",
      title: "What is and is not observed in a real lab",
      kicker: "Stability, extinction and honest claims",
      blocks: [
        {
          type: "p",
          text: "With a coherent laser and photodiodes, the observable quantities are fringe intensity versus phase, visibility versus marker angle, conditional visibility versus analyser angle, and extinction ratios. These are classical-wave measurements. They reproduce the mathematics of the quantum eraser but do not establish single-photon behaviour. A genuine single-photon experiment adds a heralded source, SPADs and a time tagger, and must demonstrate that the detected events are antibunched or heralded before the word 'single-photon' is justified."
        },
        {
          type: "table",
          caption: "Claims supported by the two implementations",
          head: ["Observation", "Laser + photodiode", "Heralded single-photon + coincidences"],
          rows: [
            ["Fringes versus path phase", "Yes", "Yes, in coincidence counts"],
            ["Visibility falls as θ → 90°", "Yes", "Yes"],
            ["Conditional fringes after the analyser", "Yes, by sorting the detected signal", "Yes, by coincidence gating"],
            ["Unconditional pattern flat at θ = 90°", "Yes", "Yes"],
            ["Single-photon antibunching", "No", "Required evidence"],
            ["Delayed-choice time ordering", "No", "Specialised apparatus"]
          ]
        },
        {
          type: "p",
          text: "Alignment is the dominant practical difficulty. The path difference must be stable to a small fraction of a wavelength: at 632.8 nm, a drift of 63 nm corresponds to a phase change of about 0.63 rad, which visibly moves the fringes. Air currents, thermal expansion of the breadboard, and loose posts all contribute. The polarization extinction of the marker and analyser should be high — a 1000:1 intensity extinction is a reasonable teaching-lab target — and the two detectors should be matched in gain and linearity."
        },
        {
          type: "callout",
          tone: "caution",
          title: "Sub-wavelength stability is not optional",
          body:
            "Mount the interferometer on a damped table, use short rigid posts, and enclose the arms if the room has strong air currents. Wait for thermal equilibrium before recording a visibility curve. If the fringes drift during a single measurement, average symmetrically in time or stabilise the path actively; do not fit a drifting pattern as if it were static."
        },
        {
          type: "callout",
          tone: "lab",
          title: "A defensible measurement sequence",
          body:
            "1. Align for maximum visibility with no marker. 2. Record the fringe maxima and minima. 3. Insert the marker at 0° and confirm the fringe positions. 4. Rotate the marker in 5° steps and record V. 5. Insert the analyser and record conditional visibility versus α. 6. Only after the classical data are stable, consider the single-photon phase — and record the equipment verification status before claiming it."
        },
        {
          type: "diagram",
          kind: "detection-chain",
          caption:
            "Detection chain for the classical measurement: photodiode → transimpedance amplifier → oscilloscope or DAQ. A single-photon version replaces the photodiode with a SPAD and adds a time tagger; the signal chain is not equivalent.",
          height: 300
        }
      ]
    }
  ],
  equations: [
    {
      id: "path-state-marker",
      latex: tex`|\Psi\rangle=\frac{1}{\sqrt{1+r^2}}\left(|a\rangle|H\rangle+r\,e^{i\varphi}|b\rangle|\theta\rangle\right)`,
      name: "Two-path state with a polarization marker",
      symbols: [
        { symbol: tex`|a\rangle,|b\rangle`, meaning: "path states of the two interferometer arms" },
        { symbol: tex`|H\rangle`, meaning: "horizontal polarization on path a" },
        { symbol: tex`|\theta\rangle`, meaning: "linear marker state cos θ|H⟩ + sin θ|V⟩ on path b" },
        { symbol: "r", meaning: "amplitude ratio √(I_B/I_A)", unit: "dimensionless" },
        { symbol: tex`\varphi`, meaning: "relative path phase", unit: "rad" }
      ],
      interpretation:
        "The full pure state of path and marker. Setting θ = 0 removes the marker; θ = 90° makes the path states orthogonal in polarization.",
      assumptions: ["Ideal beam splitters", "Pure marker state", "Single spatial mode"],
      usedIn: ["Theory 4", "Derivation 1"]
    },
    {
      id: "marker-overlap",
      latex: tex`\langle H|\theta\rangle=\cos\theta`,
      name: "Marker overlap",
      symbols: [
        { symbol: tex`\theta`, meaning: "marker polarization angle relative to H", unit: "°" }
      ],
      interpretation:
        "The overlap controls the interference cross term. Orthogonal markers give zero overlap and no fringes.",
      assumptions: ["Linear, pure marker states"],
      usedIn: ["Theory 5", "Theory 6"]
    },
    {
      id: "visibility",
      latex: tex`V=\frac{2r|\cos\theta|}{1+r^2}`,
      name: "Unconditioned fringe visibility",
      symbols: [
        { symbol: "V", meaning: "fringe visibility (Imax − Imin)/(Imax + Imin)", unit: "dimensionless" },
        { symbol: "r", meaning: "amplitude ratio √(I_B/I_A)", unit: "dimensionless" },
        { symbol: tex`\theta`, meaning: "marker polarization angle", unit: "°" }
      ],
      interpretation:
        "Visibility of the full ensemble when the detector does not analyse polarization. For r = 1 it reduces to V = |cos θ|.",
      assumptions: ["Balanced beam splitters", "Perfect spatial overlap", "Pure marker"],
      usedIn: ["Theory 5", "Derivation 1", "Analysis 1"]
    },
    {
      id: "distinguishability",
      latex: tex`D=\sqrt{1-\left|\langle H|\theta\rangle\right|^2}=|\sin\theta|`,
      name: "Which-path distinguishability",
      symbols: [
        { symbol: "D", meaning: "distinguishability, 0 = indistinguishable, 1 = perfectly distinguishable", unit: "dimensionless" },
        { symbol: tex`\theta`, meaning: "marker polarization angle", unit: "°" }
      ],
      interpretation:
        "The amount of which-path information available in the marker. At θ = 90° the paths are perfectly distinguishable.",
      assumptions: ["Pure marker", "Two path states only"],
      usedIn: ["Theory 3", "Theory 10", "Derivation 3"]
    },
    {
      id: "conditional-visibility",
      latex: tex`V_{\rm cond}(\alpha)=\frac{2r\left|\cos\alpha\,\cos(\alpha-\theta)\right|}{\cos^2\alpha+r^2\cos^2(\alpha-\theta)}`,
      name: "Conditional visibility after an analyser",
      symbols: [
        { symbol: tex`V_{\rm cond}`, meaning: "visibility in the selected analyser output", unit: "dimensionless" },
        { symbol: tex`\alpha`, meaning: "analyser transmission angle", unit: "°" },
        { symbol: tex`\theta`, meaning: "marker polarization angle", unit: "°" },
        { symbol: "r", meaning: "amplitude ratio √(I_B/I_A)", unit: "dimensionless" }
      ],
      interpretation:
        "Visibility of the post-selected subensemble transmitted by an analyser at α. It reaches 1 at α = θ/2 for balanced paths.",
      assumptions: ["Ideal analyser", "Pure marker", "Post-selection on one output"],
      usedIn: ["Theory 7", "Derivation 2", "Analysis 2"]
    },
    {
      id: "duality",
      latex: tex`D^2+V^2\le 1`,
      name: "Complementarity (duality) relation",
      symbols: [
        { symbol: "D", meaning: "which-path distinguishability", unit: "dimensionless" },
        { symbol: "V", meaning: "unconditioned fringe visibility", unit: "dimensionless" }
      ],
      interpretation:
        "No preparation can simultaneously provide perfect path information and perfect fringes. Equality holds for a pure marker with balanced paths.",
      assumptions: ["Two-path state", "Unconditioned visibility", "D defined from the path-state overlap"],
      usedIn: ["Theory 10", "Derivation 3", "Analysis 2"]
    },
    {
      id: "reduced-density",
      latex: tex`\rho_A=\frac{1}{1+r^2}\begin{pmatrix}1&r\,e^{-i\varphi}\cos\theta\\[2pt]r\,e^{i\varphi}\cos\theta&r^2\end{pmatrix}`,
      name: "Path density matrix after tracing over the marker",
      symbols: [
        { symbol: tex`\rho_A`, meaning: "reduced density matrix in the path basis" },
        { symbol: tex`\varphi`, meaning: "relative path phase", unit: "rad" },
        { symbol: tex`\theta`, meaning: "marker angle", unit: "°" }
      ],
      interpretation:
        "The off-diagonal coherence is reduced by cos θ. At θ = 90° the matrix is diagonal: the path state is maximally mixed for balanced paths.",
      assumptions: ["Pure overall state", "Marker traced out", "Ideal preparation"],
      usedIn: ["Theory 6"]
    },
    {
      id: "fringe-intensity",
      latex: tex`I(x)=I_0\left[1+V\cos\left(\frac{2\pi x}{\Lambda}+\varphi_0\right)\right]`,
      name: "Fringe intensity versus position",
      symbols: [
        { symbol: "I(x)", meaning: "detected intensity or count rate at position x" },
        { symbol: tex`\Lambda`, meaning: "fringe period", unit: "m" },
        { symbol: tex`\varphi_0`, meaning: "fringe phase at x = 0", unit: "rad" },
        { symbol: "V", meaning: "fringe visibility", unit: "dimensionless" }
      ],
      interpretation:
        "The monitor strip used in the simulation. The phase is scanned across the field; V is the quantity extracted from the maxima and minima.",
      assumptions: ["Uniform illumination", "Straight fringes", "One output port"],
      usedIn: ["Simulation", "Analysis 1", "Analysis 4"]
    },
    {
      id: "coincidence-rate",
      latex: tex`R_{+}(\alpha,\varphi)=R_0\,\frac{\cos^2\alpha+r^2\cos^2(\alpha-\theta)}{2(1+r^2)}\left[1+V_{\rm cond}(\alpha)\cos\varphi\right]`,
      name: "Conditional count rate in one analyser channel",
      symbols: [
        { symbol: tex`R_+`, meaning: "count rate in the + analyser output", unit: "s⁻¹" },
        { symbol: tex`R_0`, meaning: "input count rate scale", unit: "s⁻¹" },
        { symbol: tex`\varphi`, meaning: "relative path phase", unit: "rad" }
      ],
      interpretation:
        "The rate in a gated subensemble. The prefactor is the mean transmission of that channel; the bracket carries the conditional fringe.",
      assumptions: ["Ideal analyser", "Unit detector efficiency", "No accidentals"],
      usedIn: ["Theory 8", "Simulation"]
    },
    {
      id: "malus",
      latex: tex`P(\alpha|\gamma)=\cos^2(\alpha-\gamma)`,
      name: "Malus projection",
      symbols: [
        { symbol: tex`P`, meaning: "transmission probability", unit: "dimensionless" },
        { symbol: tex`\alpha`, meaning: "analyser angle", unit: "°" },
        { symbol: tex`\gamma`, meaning: "linear polarization angle before the analyser", unit: "°" }
      ],
      interpretation:
        "The analyser projects each path onto α. This is the physical operation that erases the polarization marker.",
      assumptions: ["Ideal linear polarizer", "Fully polarized input"],
      usedIn: ["Theory 7"]
    },
    {
      id: "path-phase",
      latex: tex`\varphi=\frac{2\pi}{\lambda}\Delta L+\varphi_0`,
      name: "Path phase from an optical path difference",
      symbols: [
        { symbol: tex`\varphi`, meaning: "relative phase", unit: "rad" },
        { symbol: tex`\lambda`, meaning: "wavelength", unit: "m" },
        { symbol: tex`\Delta L`, meaning: "optical path difference", unit: "m" },
        { symbol: tex`\varphi_0`, meaning: "constant offset", unit: "rad" }
      ],
      interpretation:
        "A path difference of one wavelength corresponds to 2π of phase. At 632.8 nm, λ/2 = 316.4 nm gives a π phase shift.",
      assumptions: ["Monochromatic light", "Single transverse mode", "Negligible dispersion"],
      usedIn: ["Theory 2", "Procedure 2"]
    },
    {
      id: "channel-sum",
      latex: tex`R_{+}(\varphi)+R_{-}(\varphi)=\frac{R_0}{2}\left[1+\frac{2r\cos\theta}{1+r^2}\cos\varphi\right]`,
      name: "Sum of the two complementary analyser channels",
      symbols: [
        { symbol: tex`R_\pm`, meaning: "count rates in the two orthogonal analyser outputs", unit: "s⁻¹" },
        { symbol: tex`\theta`, meaning: "marker angle", unit: "°" }
      ],
      interpretation:
        "The ungated record. It has the marker-limited visibility, not the conditional visibility. At θ = 90° it is independent of φ.",
      assumptions: ["Both analyser outputs recorded", "Ideal optics"],
      usedIn: ["Theory 9", "Simulation"]
    }
  ],
  derivations: [
    {
      id: "visibility-marking",
      title: "Fringe visibility with polarization marking",
      intro:
        "Start from the pure two-path state with a marker on path b and compute the intensity seen by a detector that does not analyse polarization.",
      steps: [
        {
          label: "1",
          text: "Write the state with the marker overlap isolated.",
          latex: tex`|\Psi\rangle=\frac{1}{\sqrt{1+r^2}}\left(|a\rangle|H\rangle+r e^{i\varphi}|b\rangle|\theta\rangle\right)`
        },
        {
          label: "2",
          text: "The detector traces over polarization. The diagonal terms give the path intensities; the cross term is proportional to ⟨H|θ⟩ = cos θ.",
          latex: tex`I=\frac{1}{1+r^2}\left(1+r^2+2r\cos\theta\cos\varphi\right)`
        },
        {
          label: "3",
          text: "Read off the maximum and minimum as φ varies.",
          latex: tex`I_{\max}=\frac{1+r^2+2r|\cos\theta|}{1+r^2},\qquad I_{\min}=\frac{1+r^2-2r|\cos\theta|}{1+r^2}`
        },
        {
          label: "4",
          text: "Use V = (Imax − Imin)/(Imax + Imin).",
          latex: tex`V=\frac{2r|\cos\theta|}{1+r^2}`
        }
      ],
      result: {
        latex: tex`V=\frac{2r|\cos\theta|}{1+r^2}\xrightarrow{r=1}|\cos\theta|`,
        text: "Orthogonal markers (θ = 90°) give zero visibility; no marker (θ = 0°) gives the full balanced visibility."
      },
      assumptions: ["Ideal 50:50 beam splitters", "Perfect spatial mode overlap", "Pure marker state", "No background light"]
    },
    {
      id: "conditional-visibility",
      title: "Conditional visibility after an analyser",
      intro:
        "Project both paths onto the analyser axis α and compute the visibility of the transmitted subensemble.",
      steps: [
        {
          label: "1",
          text: "The analyser amplitudes for the two paths are Malus factors.",
          latex: tex`c_a=\frac{\cos\alpha}{\sqrt{1+r^2}},\qquad c_b=\frac{r e^{i\varphi}\cos(\alpha-\theta)}{\sqrt{1+r^2}}`
        },
        {
          label: "2",
          text: "The transmitted intensity is the squared modulus of the sum.",
          latex: tex`I_\alpha=\frac{\cos^2\alpha+r^2\cos^2(\alpha-\theta)+2r\cos\alpha\cos(\alpha-\theta)\cos\varphi}{1+r^2}`
        },
        {
          label: "3",
          text: "The oscillating part has amplitude 2r|cos α cos(α−θ)|/(1+r²), while the mean is [cos²α + r²cos²(α−θ)]/(1+r²).",
          latex: tex`V_{\rm cond}=\frac{2r|\cos\alpha\cos(\alpha-\theta)|}{\cos^2\alpha+r^2\cos^2(\alpha-\theta)}`
        },
        {
          label: "4",
          text: "For balanced paths the maximum occurs when the two projected amplitudes are equal in magnitude: |cos α| = |cos(α−θ)|, i.e. α = θ/2 or α = θ/2 + 90°.",
          latex: tex`V_{\rm cond}^{\max}=\frac{2r}{1+r^2}\xrightarrow{r=1}1`
        }
      ],
      result: {
        latex: tex`V_{\rm cond}(\theta/2)=1\quad(r=1)`,
        text: "The erasure angle is the bisector of the two marker polarizations. At θ = 90° it is α = 45° (or 135°)."
      },
      assumptions: ["Ideal analyser", "Pure marker", "Post-selection on one output", "Balanced paths for the maximum"]
    },
    {
      id: "complementarity",
      title: "The complementarity relation",
      intro:
        "Combine the distinguishability of the marker with the unconditioned visibility and show that the sum is bounded by one.",
      steps: [
        {
          label: "1",
          text: "For a pure marker, D² = 1 − |⟨H|θ⟩|².",
          latex: tex`D^2=1-\cos^2\theta=\sin^2\theta`
        },
        {
          label: "2",
          text: "Square the visibility and add.",
          latex: tex`D^2+V^2=\sin^2\theta+\left(\frac{2r\cos\theta}{1+r^2}\right)^2`
        },
        {
          label: "3",
          text: "Collect the cos²θ term.",
          latex: tex`D^2+V^2=1-\cos^2\theta\left[1-\frac{4r^2}{(1+r^2)^2}\right]=1-\cos^2\theta\,\frac{(r^2-1)^2}{(1+r^2)^2}`
        },
        {
          label: "4",
          text: "The bracket is non-negative, so the sum never exceeds one. It equals one exactly when r = 1.",
          latex: tex`D^2+V^2\le 1,\qquad D^2+V^2=1\iff r=1`
        }
      ],
      result: {
        latex: tex`D^2+V^2=1-\cos^2\theta\,\frac{(r^2-1)^2}{(1+r^2)^2}\le 1`,
        text: "Pure balanced marking saturates the bound. Path imbalance or a mixed marker moves the system inside the circle."
      },
      assumptions: ["Two path states", "Pure marker", "D defined from the marker overlap", "V is the unconditioned visibility"]
    }
  ],
  simulation: eraserSimulation,
  procedure: [
    {
      id: "safety-inventory",
      title: "Safety, inventory and polarization hygiene",
      purpose: "Establish a safe beam path and verify that the polarization optics are what they claim to be.",
      steps: [
        {
          title: "Laser safety briefing",
          detail:
            "Identify the laser class and wavelength, put a beam block at every unused exit, remove reflective jewellery and watches, and wear wavelength-appropriate eyewear if the risk assessment requires it. Never look into the beam or align with a mirror at eye level.",
          caution: "A 632.8 nm He–Ne beam is still hazardous even at a few milliwatts. Treat every stray reflection as live."
        },
        {
          title: "Inventory the polarization optics",
          detail:
            "Confirm that you have two zero-order half-wave plates, two linear analysers, two 50:50 non-polarizing cubes, two plane mirrors and two detectors. Record the serial numbers and any known extinction data.",
          checkpoint: "All optics are mounted, labelled and accounted for before the beam is unblocked."
        },
        {
          title: "Find the polarizer and wave-plate zeros",
          detail:
            "Cross two linear polarizers and rotate one to extinction; record its scale as the 90° reference. With the input polarization known, rotate the half-wave plate until the transmitted polarization is extinguished by a fixed analyser; that plate setting corresponds to a 45° rotation of the input. From these references, build a calibration table for the marker axis β = θ/2.",
          checkpoint: "The extinction of the polarizer pair is at least 1000:1, and the marker scale is reproducible to ±1°."
        }
      ]
    },
    {
      id: "align-mz",
      title: "Align the Mach–Zehnder and obtain fringes",
      purpose: "Produce a stable, high-visibility two-path interference pattern with no marker inserted.",
      steps: [
        {
          title: "Set the beam height and centre the irises",
          detail:
            "Use two irises to define a straight input beam at the nominal height. Place the first beam splitter, both mirrors and the second beam splitter so that the beam passes through the centre of each optic at the same height.",
          checkpoint: "The beam is centred on every optic and does not clip an aperture."
        },
        {
          title: "Overlap the two arms",
          detail:
            "With the second beam splitter removed or the unused port blocked, bring the two arm spots to the same position on a distant screen. Adjust the mirrors in small increments; iterate until the spots overlap in both near and far fields.",
          checkpoint: "The two spots coincide to better than one beam diameter at the observation plane."
        },
        {
          title: "Find and optimise the fringes",
          detail:
            "Recombine the arms at the second beam splitter. Translate one mirror or adjust a phase plate to scan the relative phase. Optimise the visibility by equalising the arm intensities with a neutral-density filter and by fine-tuning the overlap.",
          checkpoint: "A stable fringe pattern is visible with V ≥ 0.8 and the fringe period is well resolved."
        },
        {
          title: "Record the reference pattern",
          detail:
            "Record Imax and Imin at one output, the fringe period, and the phase-drift rate over one minute. This is the baseline against which the marker measurements will be compared.",
          caution: "If the fringes drift by more than a fraction of a period during a measurement, stop and improve the mounting before proceeding."
        }
      ]
    },
    {
      id: "insert-marker",
      title: "Insert the half-wave-plate marker",
      purpose: "Convert path information into polarization information and observe the loss of fringes.",
      steps: [
        {
          title: "Insert the plate at its zero setting",
          detail:
            "Place the half-wave plate in path b with its fast axis at 0° (no polarization rotation). Confirm that the fringe positions and visibility are unchanged. This verifies that the plate is not clipping the beam or adding an unintended phase.",
          checkpoint: "V returns to the reference value within experimental uncertainty."
        },
        {
          title: "Rotate the marker to θ = 90°",
          detail:
            "Rotate the plate axis to 45°, which rotates the path-b polarization from H to V. The two paths now carry orthogonal polarizations. Observe the fringe pattern at the detector without an analyser.",
          checkpoint: "The fringes disappear; the two path intensities still add to a roughly constant level."
        },
        {
          title: "Check for residual fringes",
          detail:
            "Record Imax and Imin at θ = 90°. Any residual visibility indicates imperfect polarization extinction, a mis-set plate, or a polarization-dependent beam-splitter response. Quantify it rather than assuming it is zero.",
          caution: "Do not force a null by misaligning the interferometer. Record the residual honestly."
        }
      ]
    },
    {
      id: "quantify-marker",
      title: "Rotate the marker and quantify V(θ) and D",
      purpose: "Measure the visibility curve and test the complementarity relation.",
      steps: [
        {
          title: "Scan the marker angle",
          detail:
            "Rotate the half-wave plate axis from 0° to 45° in 5° steps, corresponding to marker angles θ = 0° to 90° in 10° steps. At each setting, record Imax and Imin from a slow phase scan and compute V = (Imax − Imin)/(Imax + Imin).",
          checkpoint: "At least seven marker settings are recorded with stable fringes at each."
        },
        {
          title: "Compute the distinguishability",
          detail:
            "For each marker angle, compute D = |sin θ| from the calibrated plate scale. If the path intensities are unequal, also record the intensity ratio and use the general visibility formula when fitting.",
          checkpoint: "The D values are consistent with the measured plate scale and the known input polarization."
        },
        {
          title: "Test D² + V²",
          detail:
            "Plot D² + V² against θ. For a pure balanced marker the points should lie on the line 1. A systematic downward trend indicates path imbalance or a mixed marker; scatter indicates phase drift or readout noise.",
          checkpoint: "The weighted mean of D² + V² is reported with an uncertainty, not just a single number."
        },
        {
          title: "Record the extinction ratio",
          detail:
            "With the marker at θ = 90°, rotate the analyser to extinction and record the minimum and maximum transmitted powers. Convert to an extinction ratio in dB. This number limits the smallest visibility you can claim.",
          checkpoint: "The extinction ratio is recorded in the same run as the visibility data."
        }
      ]
    },
    {
      id: "analyser",
      title: "Insert the analyser and find conditional fringes",
      purpose: "Erase the marker by projection and observe the recovery of fringes in a selected output.",
      steps: [
        {
          title: "Insert the analyser at α = 0°",
          detail:
            "Place a linear analyser before the detector. At α = 0° it transmits H; with θ = 90° the marked path b is blocked. The detector sees only path a, so the intensity is flat as the phase scans.",
          checkpoint: "The fringe visibility is near zero and the count rate has dropped substantially."
        },
        {
          title: "Rotate to the erasure angle",
          detail:
            "Set α = 45°, the bisector between H and V. Both paths now contribute equally to the transmitted polarization. Scan the phase and observe the return of fringes.",
          checkpoint: "V_cond is close to 1 at α = 45° for a balanced interferometer."
        },
        {
          title: "Scan the analyser angle",
          detail:
            "Record V_cond at α = 0°, 15°, 30°, 45°, 60°, 75°, 90°, 105°, 120°, 135°, 150°, 165° and 180°. The ideal curve is |sin 2α| for θ = 90°, with maxima at 45° and 135° and zeros at 0° and 90°.",
          checkpoint: "The measured maxima and minima occur at the predicted analyser angles within the angular readout uncertainty."
        },
        {
          title: "Compare the two analyser outputs",
          detail:
            "If a polarizing beam splitter and two detectors are available, record both outputs simultaneously. The fringes should be in antiphase, and their sum should reproduce the marker-limited visibility.",
          caution: "If only one analyser is available, move it between outputs and repeat the phase scan; do not assume the two outputs have equal throughput."
        }
      ]
    },
    {
      id: "coincidence",
      title: "Coincidence-gated configuration (requires equipment verification)",
      purpose: "Extend the classical demonstration to photon counting only if the required equipment is verified.",
      steps: [
        {
          title: "Verify the single-photon hardware",
          detail:
            "Confirm that a heralded single-photon source, two SPADs and a time tagger are available and characterised. Record dark counts, quantum efficiency, timing jitter and the maximum count rate. If any item is missing, stop here and report the classical result only.",
          caution: "Do not describe the experiment as single-photon unless the source herald and detector events have been demonstrated. A photodiode cannot count photons."
        },
        {
          title: "Build the coincidence detection stage",
          detail:
            "Replace the photodiode with a SPAD at the selected output, add a second SPAD for the complementary analyser output or the herald, and connect both to the time tagger. Set a coincidence window short compared with the source coherence and the detector jitter.",
          checkpoint: "Singles rates are stable and the coincidence rate responds to deliberate path blocking."
        },
        {
          title: "Record gated counts versus phase",
          detail:
            "For each analyser angle, scan the path phase and record coincidences in the two channels. Subtract accidental coincidences estimated from a delayed time window. Compute the conditional visibility from the background-corrected counts.",
          checkpoint: "The accidental-corrected accidental fraction and the coincidence window are recorded with the data."
        },
        {
          title: "Compare with the classical result",
          detail:
            "Check that the conditional fringe appears at the same analyser angle and with the same phase as in the classical run. The agreement tests the optical model; it does not by itself prove single-photon behaviour, which requires the source and detector evidence.",
          caution: "Do not claim a quantum advantage from visibility alone. State the source, detection and coincidence evidence explicitly."
        }
      ]
    },
    {
      id: "analysis-shutdown",
      title: "Analysis, documentation and shutdown",
      purpose: "Turn the measurements into a defensible result and leave the laboratory safe.",
      steps: [
        {
          title: "Fit the visibility curves",
          detail:
            "Fit V(θ) to the model 2r|cos θ|/(1+r²) with r fixed from the measured intensity ratio. Report the fitted scale offset and the residual scatter. Fit V_cond(α) to the analyser model and locate the maxima.",
          checkpoint: "The fit residuals are inspected for drift and the reduced chi-squared is reported."
        },
        {
          title: "Propagate the uncertainties",
          detail:
            "Propagate the uncertainties in Imax and Imin into V, and include the marker-angle readout uncertainty. For the duality test, propagate into D² + V². State whether the result is consistent with 1 at the quoted confidence level.",
          checkpoint: "Every quoted visibility has an uncertainty and a stated source."
        },
        {
          title: "Separate observation from interpretation",
          detail:
            "Record what was measured with the laser and photodiodes, what was inferred from the model, and what would require a single-photon source. Do not describe a classical visibility curve as a single-photon measurement.",
          checkpoint: "The report contains an explicit evidence statement matching the implementation."
        },
        {
          title: "Shut down safely",
          detail:
            "Block the beam, switch off the laser, discharge any high-voltage detector supplies according to the manufacturer's procedure, cover the optics, and restore the mounts. Log any drift, damage or missing item.",
          caution: "Allow laser and detector supplies to cool before covering or moving equipment."
        }
      ]
    }
  ],
  observations: [
    {
      id: "marker-sweep",
      title: "Marker angle versus visibility",
      purpose: "Measure the loss of unconditioned visibility as the which-path marker is rotated.",
      columns: [
        { key: "theta_deg", label: "Marker θ", unit: "°", type: "number" },
        { key: "plate_axis_deg", label: "Plate axis β", unit: "°", type: "number" },
        { key: "i_max", label: "Imax", unit: "a.u.", type: "number" },
        { key: "i_min", label: "Imin", unit: "a.u.", type: "number" },
        { key: "v_measured", label: "V", unit: "", type: "number" },
        { key: "v_error", label: "u(V)", unit: "", type: "number" },
        { key: "d_measured", label: "D", unit: "", type: "number" }
      ],
      guidance:
        "Use at least seven marker angles from 0° to 90°. Take Imax and Imin from a slow phase scan at each setting; do not re-align between settings. Record the plate axis β = θ/2 alongside θ so the calibration can be checked.",
      formula: "V = (Imax − Imin)/(Imax + Imin); D = |sin θ|"
    },
    {
      id: "analyser-sweep",
      title: "Analyser angle versus conditional visibility",
      purpose: "Locate the erasure angle and compare the two complementary analyser outputs.",
      columns: [
        { key: "alpha_deg", label: "Analyser α", unit: "°", type: "number" },
        { key: "counts_plus", label: "Counts +", unit: "counts", type: "number" },
        { key: "counts_minus", label: "Counts −", unit: "counts", type: "number" },
        { key: "v_plus", label: "V+", unit: "", type: "number" },
        { key: "v_plus_error", label: "u(V+)", unit: "", type: "number" },
        { key: "v_minus", label: "V−", unit: "", type: "number" },
        { key: "integration_s", label: "Integration time", unit: "s", type: "number" }
      ],
      guidance:
        "Scan α from 0° to 180° in 15° steps with θ fixed at 90°. Record both outputs if a polarizing beam splitter is available; otherwise repeat the run with the analyser rotated by 90°. Keep the integration time fixed so the visibility uncertainties are comparable.",
      formula: "V± = (Nmax − Nmin)/(Nmax + Nmin) per channel; theory V+ = |sin 2α| at θ = 90°"
    },
    {
      id: "coincidence-counts",
      title: "Coincidence counts A/B",
      purpose: "Record gated counts and accidental corrections for a genuine single-photon run.",
      columns: [
        { key: "alpha_deg", label: "Analyser α", unit: "°", type: "number" },
        { key: "n_a", label: "Coincidences A", unit: "counts", type: "number" },
        { key: "n_b", label: "Coincidences B", unit: "counts", type: "number" },
        { key: "t_s", label: "Integration time", unit: "s", type: "number" },
        { key: "accidentals", label: "Accidentals", unit: "counts", type: "number" },
        { key: "v_cond", label: "V_cond", unit: "", type: "number" },
        { key: "notes", label: "Notes", type: "text" }
      ],
      guidance:
        "Use only after the source, SPADs and time tagger have been verified. Record the coincidence window, the singles rates and the accidental estimate from a delayed window. Do not fill this table with simulated counts; label simulated data explicitly.",
      formula: "V_cond = (Nmax − Nmin)/(Nmax + Nmin) after accidental subtraction"
    }
  ],
  analysis: [
    {
      id: "fit-visibility",
      title: "Fit V(θ) and extract the marker calibration",
      method:
        "Fit the unconditioned visibility to V(θ) = 2r|cos θ|/(1+r²), with r fixed from the measured path-intensity ratio. Allow a small angular offset θ → θ + δ to absorb the wave-plate zero error.",
      formula: "V(θ) = 2r|cos(θ + δ)|/(1+r²)",
      steps: [
        "Convert each plate-axis reading to marker angle θ = 2β.",
        "Compute V and its uncertainty from Imax and Imin at each setting.",
        "Fit with r fixed; report δ and its uncertainty.",
        "Inspect residuals for a systematic trend with θ; a trend suggests polarization-dependent loss or a plate mis-calibration."
      ],
      expected:
        "δ should be within a few degrees of zero after calibration; the fitted curve should follow the measured points within their error bars."
    },
    {
      id: "test-duality",
      title: "Test D² + V² = 1",
      method:
        "For each marker angle compute D = |sin θ| and form D² + V². Weight each point by its propagated uncertainty and test the weighted mean against 1.",
      formula: "D² + V² = sin²θ + V²",
      steps: [
        "Propagate u(V) into u(D² + V²) = 2V u(V).",
        "Compute the weighted mean and its standard error.",
        "Compare with 1 using a chi-squared or z-test.",
        "If the mean is significantly below 1, measure and report the path-intensity ratio and the polarization extinction."
      ],
      expected:
        "For a balanced, pure marker the weighted mean should be consistent with 1. Path imbalance or imperfect polarization optics pull it below 1."
    },
    {
      id: "extinction-ratio",
      title: "Measure the extinction ratio of the analyser pair",
      method:
        "With the marker at θ = 90°, rotate the analyser through extinction and record the maximum and minimum transmitted power. Convert the ratio to decibels.",
      formula: "ER_dB = 10 log₁₀(Pmax/Pmin)",
      steps: [
        "Block the beam and record the detector zero.",
        "Record Pmax at the analyser angle that transmits the path-b polarization.",
        "Rotate to the minimum and record Pmin after subtracting the zero.",
        "Repeat at three wavelengths or three positions if the polarizer is not uniform."
      ],
      expected:
        "A teaching-grade polarizer pair typically gives 20–40 dB. The measured extinction sets the smallest residual visibility that can be attributed to the apparatus."
    },
    {
      id: "visibility-uncertainty",
      title: "Uncertainty on the visibility",
      method:
        "Propagate the uncertainties in Imax and Imin into V = (Imax − Imin)/(Imax + Imin). For photon-counted data, use the shot-noise estimate √(2/N) and compare it with the scatter of repeated runs.",
      formula: "u(V) ≈ 2√(Imin² u(Imax)² + Imax² u(Imin)²)/(Imax + Imin)²",
      steps: [
        "Estimate u(Imax) and u(Imin) from repeated phase scans, not from a single reading.",
        "Propagate using the formula above, or use a Monte Carlo if the errors are large.",
        "For counted data, compare the shot-noise error √(2/N) with the observed run-to-run scatter.",
        "Report the larger of the statistical and systematic estimates, and state which dominates."
      ],
      expected:
        "At high visibility the uncertainty is dominated by intensity drift; near V = 0 it is dominated by shot noise and residual polarization leakage."
    }
  ],
  errors: [
    {
      source: "Imperfect polarization optics",
      type: "systematic",
      effect:
        "Finite polarizer extinction and wave-plate retardance error leave a residual marker component, so the fringes never fully disappear and the conditional visibility is reduced.",
      mitigation:
        "Measure the extinction ratio, use zero-order wave plates, calibrate the plate axis, and subtract the residual visibility from the reported contrast where appropriate."
    },
    {
      source: "Path drift and air currents",
      type: "random",
      effect:
        "A sub-wavelength change in path length moves the fringes during a scan, broadening the apparent maxima and minima and reducing the fitted visibility.",
      mitigation:
        "Use a damped table, short rigid mounts, enclosures or baffles, thermal equilibration, and symmetric up/down phase scans. Monitor the drift with a reference photodiode."
    },
    {
      source: "Detector imbalance and nonlinearity",
      type: "systematic",
      effect:
        "Mismatched gains or a nonlinear transimpedance amplifier distort the measured Imax and Imin, especially when comparing the two analyser outputs.",
      mitigation:
        "Swap detectors and repeat, calibrate with a neutral-density filter wheel, keep signals well below saturation, and record dark offsets."
    },
    {
      source: "Accidental coincidences",
      type: "statistical",
      effect:
        "Uncorrelated detector clicks inside the coincidence window inflate the gated counts and wash out the conditional visibility.",
      mitigation:
        "Estimate accidentals from a delayed time window, subtract them, keep singles rates low enough that the accidental fraction is small, and report the window and rates."
    },
    {
      source: "Multi-photon light",
      type: "systematic",
      effect:
        "A coherent or attenuated laser source has a Poisson photon-number distribution; the detected events are not single photons, so a coincidence measurement can be mimicked by classical correlations.",
      mitigation:
        "Use a heralded source and verify antibunching or a g²(0) < 0.5 measurement before claiming single-photon behaviour. Label laser data as a classical analogue."
    },
    {
      source: "Analyser misalignment and scale error",
      type: "systematic",
      effect:
        "A zero offset in the analyser scale shifts the apparent erasure angle and biases the fitted conditional visibility curve.",
      mitigation:
        "Calibrate the analyser against a known input polarization, record the zero, and fit an angular offset rather than forcing the maxima to the nominal angles."
    }
  ],
  applications: [
    {
      title: "Quantum cryptography",
      body:
        "Which-path marking and basis choices underlie BB84 and its variants. An eavesdropper's attempt to learn the path or polarization disturbs the state and shows up as an increased quantum bit error rate; complementarity is the physical reason the disturbance cannot be avoided."
    },
    {
      title: "Quantum imaging",
      body:
        "Post-selected interference and coincidence detection are used in ghost imaging, interaction-free imaging and imaging with undetected photons. The eraser model is a small-scale example of extracting an image or fringe from a correlated subensemble."
    },
    {
      title: "Quantum metrology",
      body:
        "The trade-off between path information and fringe visibility limits phase estimation. Understanding D² + V² ≤ 1 helps design interferometers that keep the phase-sensitive coherence while monitoring the path for noise or intrusion."
    },
    {
      title: "Foundations of quantum mechanics",
      body:
        "Eraser experiments test complementarity, the role of measurement and post-selection, and the consistency of delayed-choice protocols. They are a clean demonstration that correlations can be revealed by sorting data without enabling faster-than-light signalling."
    }
  ],
  questions: [
    {
      id: "q01",
      type: "mcq",
      difficulty: 1,
      topic: "Complementarity",
      prompt:
        "Which relation best captures the complementarity between fringe visibility V and which-path distinguishability D for a pure, balanced two-path state?",
      options: ["V + D = 1 for every state", "D² + V² ≤ 1, with equality for pure balanced marking", "V = 1 − D only for orthogonal markers", "V and D are independent and can both be 1"],
      answerIndex: 1,
      answer: "D² + V² ≤ 1, with equality for pure balanced marking.",
      explanation:
        "The bound is saturated only when the marker is pure and the two path amplitudes are equal. Mixed markers and path imbalance move the state inside the circle.",
      marks: 1
    },
    {
      id: "q02",
      type: "mcq",
      difficulty: 1,
      topic: "Orthogonal markers",
      prompt:
        "A balanced interferometer is marked with orthogonal polarization states on the two paths. What is the unconditioned fringe visibility at a single output?",
      options: ["1", "0.5", "0", "It depends on the path phase"],
      answerIndex: 2,
      answer: "0.",
      explanation:
        "The marker overlap is zero, so the interference cross term vanishes. The two path intensities add without a phase-dependent term.",
      marks: 1
    },
    {
      id: "q03",
      type: "mcq",
      difficulty: 2,
      topic: "Conditional visibility",
      prompt:
        "With θ = 90° and the analyser at α = 45°, what conditional visibility does the ideal balanced model predict in the selected analyser output?",
      options: ["0", "0.5", "1/√2", "1"],
      answerIndex: 3,
      answer: "1.",
      explanation:
        "At the bisector the two projected amplitudes have equal magnitude, so the selected subensemble shows full-contrast fringes. The orthogonal analyser output shows the same visibility with opposite fringe phase.",
      marks: 2
    },
    {
      id: "q04",
      type: "mcq",
      difficulty: 2,
      topic: "Post-selection",
      prompt: "What does enabling coincidence or analyser-channel gating change in this experiment?",
      options: [
        "It changes the path the photon took before detection.",
        "It selects a subensemble using the analyser-channel label, revealing fringes that are absent from the summed record when θ = 90°.",
        "It increases the total singles count rate.",
        "It makes the marker states orthogonal."
      ],
      answerIndex: 1,
      answer:
        "It selects a subensemble using the analyser-channel label; the fringes are visible only after the data are sorted.",
      explanation:
        "The detection event is not altered. Gating partitions the recorded events; the unconditional sum remains flat at θ = 90°.",
      marks: 2
    },
    {
      id: "q05",
      type: "mcq",
      difficulty: 2,
      topic: "Duality",
      prompt: "For which situation is D² + V² = 1 expected to hold exactly in this model?",
      options: ["A mixed marker with unequal path intensities", "A pure marker with balanced path intensities", "Any state after the analyser is inserted", "Only when the analyser is removed"],
      answerIndex: 1,
      answer: "A pure marker with balanced path intensities.",
      explanation:
        "The derivation gives D² + V² = 1 − cos²θ (r²−1)²/(1+r²)². Equality requires r = 1 and a pure marker.",
      marks: 2
    },
    {
      id: "q06",
      type: "mcq",
      difficulty: 2,
      topic: "Density matrix",
      prompt: "After tracing the pure path–marker state over the marker polarization, the path density matrix has:",
      options: [
        "No off-diagonal elements for any marker angle",
        "Off-diagonal elements reduced by the factor cos θ",
        "Off-diagonal elements increased by cos θ",
        "Trace zero"
      ],
      answerIndex: 1,
      answer: "Off-diagonal elements reduced by cos θ.",
      explanation:
        "ρ_ab = r e^{−iφ} cos θ/(1+r²). At θ = 90° the coherence vanishes and the path state is diagonal.",
      marks: 2
    },
    {
      id: "q07",
      type: "mcq",
      difficulty: 1,
      topic: "Wave plates",
      prompt: "A zero-order half-wave plate whose fast axis is at 22.5° to a horizontal linear input produces:",
      options: ["Horizontal linear polarization", "Vertical linear polarization", "Linear polarization at +45°", "Circular polarization"],
      answerIndex: 2,
      answer: "Linear polarization at +45°.",
      explanation:
        "A half-wave plate rotates linear polarization by twice the axis angle: 2 × 22.5° = 45°.",
      marks: 1
    },
    {
      id: "q08",
      type: "mcq",
      difficulty: 2,
      topic: "Unconditional pattern",
      prompt:
        "With θ = 90°, the analyser inserted at 45°, and the two complementary analyser outputs summed without channel gating, how does the total detected count rate vary with phase?",
      options: ["It shows full-contrast fringes", "It is flat", "It follows cos²φ", "It is random from run to run"],
      answerIndex: 1,
      answer: "It is flat.",
      explanation:
        "The two analyser outputs carry equal-amplitude fringes in antiphase. Their sum is independent of phase at θ = 90°.",
      marks: 2
    },
    {
      id: "q09",
      type: "numerical",
      difficulty: 1,
      topic: "Visibility",
      prompt: "A balanced interferometer has a pure marker at θ = 60°. Calculate the unconditioned fringe visibility.",
      answer: "V = |cos 60°| = 0.500.",
      explanation: "For balanced paths V = |cos θ|.",
      numeric: { value: 0.5, tolerance: 0.01, unit: "" },
      marks: 1
    },
    {
      id: "q10",
      type: "numerical",
      difficulty: 1,
      topic: "Distinguishability",
      prompt: "Calculate the which-path distinguishability D for a pure marker at θ = 45°.",
      answer: "D = |sin 45°| = 0.7071.",
      explanation: "D = √(1 − cos²θ) = |sin θ|.",
      numeric: { value: 0.7071, tolerance: 0.01, unit: "" },
      marks: 1
    },
    {
      id: "q11",
      type: "numerical",
      difficulty: 2,
      topic: "Conditional visibility",
      prompt:
        "For θ = 90° and a balanced interferometer, calculate the conditional visibility at analyser angle α = 30°.",
      answer: "V_cond = |sin 2α| = sin 60° = 0.8660.",
      explanation:
        "At θ = 90° the conditional visibility simplifies to |sin 2α|. At α = 30° this is 0.866.",
      numeric: { value: 0.866, tolerance: 0.01, unit: "" },
      marks: 2
    },
    {
      id: "q12",
      type: "numerical",
      difficulty: 1,
      topic: "Malus",
      prompt: "Horizontally polarized light passes through an ideal linear analyser at 30° to the horizontal. What fraction of the intensity is transmitted?",
      answer: "cos²30° = 0.75.",
      explanation: "Malus's law gives P = cos²(α − γ).",
      numeric: { value: 0.75, tolerance: 0.01, unit: "" },
      marks: 1
    },
    {
      id: "q13",
      type: "numerical",
      difficulty: 2,
      topic: "Path phase",
      prompt: "What optical path difference at λ = 632.8 nm produces a phase shift of π?",
      answer: "ΔL = λ/2 = 316.4 nm.",
      explanation: "φ = 2π ΔL/λ; setting φ = π gives ΔL = λ/2.",
      numeric: { value: 316.4, tolerance: 1, unit: "nm" },
      marks: 2
    },
    {
      id: "q14",
      type: "numerical",
      difficulty: 2,
      topic: "Visibility from extrema",
      prompt: "A fringe scan gives Imax = 1.00 and Imin = 0.10 in arbitrary units. Calculate the visibility.",
      answer: "V = (1.00 − 0.10)/(1.00 + 0.10) = 0.818.",
      explanation: "V = (Imax − Imin)/(Imax + Imin).",
      numeric: { value: 0.818, tolerance: 0.005, unit: "" },
      marks: 2
    },
    {
      id: "q15",
      type: "numerical",
      difficulty: 2,
      topic: "Counted visibility",
      prompt:
        "In one analyser channel the binned counts oscillate between 1600 and 400. Estimate the visibility.",
      answer: "V = (1600 − 400)/(1600 + 400) = 0.60.",
      explanation: "The same extrema formula applies to background-corrected counts.",
      numeric: { value: 0.6, tolerance: 0.01, unit: "" },
      marks: 2
    },
    {
      id: "q16",
      type: "numerical",
      difficulty: 2,
      topic: "Uncertainty",
      prompt:
        "A gated visibility is estimated from N = 2500 counts. Using the shot-noise estimate u(V) = √(2/N), calculate the uncertainty.",
      answer: "u(V) = √(2/2500) = 0.0283.",
      explanation: "The Fourier visibility estimator has a large-N shot-noise standard deviation of about √(2/N).",
      numeric: { value: 0.0283, tolerance: 0.003, unit: "" },
      marks: 2
    },
    {
      id: "q17",
      type: "viva",
      difficulty: 2,
      topic: "Interpretation",
      prompt: "A visitor says that the quantum eraser changes the past. Give a precise response.",
      answer:
        "The eraser does not change any recorded event. It partitions already-recorded events according to a later measurement or an analyser-channel label. The conditional subensemble shows fringes, but the unconditional singles record remains flat at θ = 90°, so no signal about the later choice can be read from it.",
      explanation:
        "The correct statement is about post-selection and correlations, not retrocausation. The no-signalling property is essential.",
      marks: 3
    },
    {
      id: "q18",
      type: "viva",
      difficulty: 2,
      topic: "Complementary channels",
      prompt: "Why is the sum of the two conditional analyser patterns flat at θ = 90°?",
      answer:
        "The two analyser outputs project onto orthogonal polarizations. At θ = 90° the two projected amplitudes have equal magnitude in each output, but the interference terms have opposite signs. The two fringe patterns therefore have equal amplitude and a 180° phase difference; their sum is constant. At intermediate θ the sum retains the marker-limited visibility |cos θ|.",
      explanation:
        "The sum of the intensities is the unconditional record, which cannot contain more coherence than the marker allows.",
      marks: 3
    },
    {
      id: "q19",
      type: "viva",
      difficulty: 3,
      topic: "Single-photon evidence",
      prompt: "What would it take to turn this tabletop demonstration into a genuine single-photon quantum-eraser experiment?",
      answer:
        "You would need a heralded single-photon source (for example SPDC with an idler detector), single-photon detectors at the signal and idler or at the two analyser outputs, and a time tagger with a coincidence window short compared with the source coherence and detector jitter. You would also need to demonstrate the source's single-photon character (antibunching or a low g²(0)), subtract accidental coincidences, and show that the conditional fringes persist at the single-photon count rate. Visibility alone is not sufficient evidence.",
      explanation:
        "The classical laser demonstration reproduces the algebra but not the photon statistics. The evidence must include the source and detection characterization.",
      marks: 4
    },
    {
      id: "q20",
      type: "viva",
      difficulty: 3,
      topic: "Delayed choice",
      prompt: "What did Kim et al. (2000) and Jacques et al. (2007) demonstrate, and what do they not show?",
      answer:
        "Kim et al. used SPDC signal–idler pairs and a coincidence circuit to sort signal events according to a later idler measurement; the sorted subensembles show complementary fringes or which-path behaviour while the unsorted singles record is flat. Jacques et al. realised Wheeler's delayed-choice experiment with a single-photon source and a fast switch, choosing the interferometer configuration after the photon entered it. Neither result demonstrates retrocausation or faster-than-light signalling; the correlations are revealed only after the coincidence record is sorted.",
      explanation:
        "The time ordering is a test of quantum consistency, not a mechanism for changing the past.",
      marks: 4
    },
    {
      id: "q21",
      type: "derivation",
      difficulty: 2,
      topic: "Derivation",
      prompt: "Derive the unconditioned visibility V = |cos θ| for a balanced two-path interferometer with a pure polarization marker.",
      answer:
        "Write |Ψ⟩ = (|a⟩|H⟩ + e^{iφ}|b⟩|θ⟩)/√2. A polarization-insensitive detector gives I = (1/2)(2 + 2 cos θ cos φ) = 1 + cos θ cos φ. Hence Imax = 1 + |cos θ|, Imin = 1 − |cos θ|, and V = (Imax − Imin)/(Imax + Imin) = |cos θ|.",
      explanation: "The cross term is multiplied by the marker overlap ⟨H|θ⟩ = cos θ.",
      marks: 4
    },
    {
      id: "q22",
      type: "derivation",
      difficulty: 2,
      topic: "Derivation",
      prompt: "Derive the conditional visibility after an analyser at α for balanced paths and a marker at θ.",
      answer:
        "Project onto |α⟩: the amplitudes are cos α/√2 and e^{iφ}cos(α−θ)/√2. The intensity is Iα = (1/2)[cos²α + cos²(α−θ) + 2 cos α cos(α−θ) cos φ]. The oscillating amplitude divided by the mean gives V_cond = 2|cos α cos(α−θ)|/[cos²α + cos²(α−θ)]. At α = θ/2 the two cosines are equal in magnitude and V_cond = 1.",
      explanation: "The analyser removes the path label by projecting both paths onto the same polarization.",
      marks: 4
    },
    {
      id: "q23",
      type: "derivation",
      difficulty: 3,
      topic: "Derivation",
      prompt: "Show that D² + V² = 1 for a pure, balanced marker and identify where the equality fails for unequal paths.",
      answer:
        "D² = 1 − cos²θ = sin²θ and V² = cos²θ for r = 1, so the sum is 1. For general r, V² = 4r²cos²θ/(1+r²)², and D² + V² = 1 − cos²θ (r²−1)²/(1+r²)². The correction is negative unless r = 1, so unequal path intensities move the state inside the circle even when the marker is pure.",
      explanation: "The equality is a statement about an ideal balanced two-state system.",
      marks: 5
    },
    {
      id: "q24",
      type: "troubleshooting",
      difficulty: 1,
      topic: "Alignment",
      prompt: "You see no fringes anywhere after assembling the Mach–Zehnder. List the first checks.",
      answer:
        "Check that both arms actually reach the second beam splitter and overlap in the near and far fields; verify that the beam is not clipped by an aperture or a wave plate; check that the path lengths are within the source coherence length; confirm that the polarizations in the two arms are not accidentally orthogonal; and check that the detector is at a recombined output rather than a single-arm port.",
      explanation:
        "No fringes usually means no spatial overlap, no coherence, or orthogonal polarizations — not a quantum effect.",
      marks: 2
    },
    {
      id: "q25",
      type: "troubleshooting",
      difficulty: 2,
      topic: "Marker",
      prompt: "At θ = 90° the fringes do not disappear completely. What could cause the residual visibility?",
      answer:
        "The half-wave plate may not be at the correct axis, the input polarization may not be exactly H, the plate may not be zero-order or may have retardance error, the beam splitters may have polarization-dependent splitting, the analyser may be leaking, or part of the beam may bypass the plate. Measure the extinction ratio and the plate calibration before attributing the residual to the quantum model.",
      explanation: "A residual is an apparatus imperfection unless the marker is demonstrably orthogonal.",
      marks: 3
    },
    {
      id: "q26",
      type: "troubleshooting",
      difficulty: 2,
      topic: "Erasure",
      prompt: "With θ = 90° and the analyser at 45°, you still see no conditional fringes. What should you check?",
      answer:
        "Check that the analyser is actually at 45° in the beam and that its scale zero is correct; confirm that gating is enabled and that the two channels are being recorded separately; check the path-intensity balance; verify that the detector is at the correct output and not saturating; and confirm that the phase scan is actually changing the path phase.",
      explanation:
        "Conditional fringes require both paths to contribute equally after projection and a genuine channel label.",
      marks: 3
    },
    {
      id: "q27",
      type: "troubleshooting",
      difficulty: 2,
      topic: "Stability",
      prompt: "The fringes drift during a visibility scan. What is the cause and what should you do?",
      answer:
        "The path difference is changing by a fraction of a wavelength, usually from air currents, thermal expansion, vibrating mounts or a loose optic. Improve the mounting, enclose the arms, wait for thermal equilibrium, shorten the integration time, and monitor a reference fringe. Do not fit a drifting pattern as if it were static.",
      explanation:
        "At 632.8 nm, a 63 nm drift is already about 0.63 rad of phase.",
      marks: 3
    },
    {
      id: "q28",
      type: "instrumentation",
      difficulty: 2,
      topic: "Detection",
      prompt: "Why are SPADs and a time tagger needed for a genuine single-photon eraser, rather than photodiodes?",
      answer:
        "A photodiode measures optical power and cannot resolve individual photon arrivals. A SPAD can detect single photons with timing information, and a time tagger records arrival times so that coincidences between the signal and idler (or between the two analyser outputs) can be identified within a short window. The coincidence record is what defines the gated subensemble.",
      explanation:
        "The classical demonstration can use photodiodes because it measures a coherent field; the single-photon claim requires photon counting.",
      marks: 3
    },
    {
      id: "q29",
      type: "instrumentation",
      difficulty: 2,
      topic: "Calibration",
      prompt: "How would you calibrate the half-wave-plate zero and the analyser scale?",
      answer:
        "Cross two polarizers and rotate one to extinction to establish a reference axis. Insert the half-wave plate and rotate it until the transmitted polarization is again extinguished by a fixed analyser; that plate setting corresponds to a 45° rotation of the input. Use the known input polarization and the extinction points to build a table of marker angle versus plate axis, then check the table at several angles.",
      explanation: "The marker angle is twice the plate-axis angle, so a scale error is doubled.",
      marks: 3
    },
    {
      id: "q30",
      type: "short",
      difficulty: 2,
      topic: "Density matrix",
      prompt: "Interpret the off-diagonal element of the reduced path density matrix.",
      answer:
        "Its magnitude is the path coherence available to a detector that does not measure the marker. For balanced paths it is (1/2)cos θ, so the visibility is 2|ρ_ab| = |cos θ|. At θ = 90° it vanishes: the path state is maximally mixed and no interference is possible without post-selection.",
      explanation: "The off-diagonal element is the quantity that produces the interference cross term.",
      marks: 2
    },
    {
      id: "q31",
      type: "long",
      difficulty: 3,
      topic: "Experiment design",
      prompt:
        "Design a genuine single-photon quantum-eraser experiment. State the source, the marking and erasure stages, the detection and coincidence electronics, and the checks needed before claiming single-photon behaviour.",
      answer:
        "Use a heralded SPDC source: a pump laser and nonlinear crystal produce signal–idler pairs; detect the idler to herald the signal. Send the signal through a stable Mach–Zehnder interferometer. Mark one arm with a half-wave plate so the path states are |H⟩ and |θ⟩. Recombine and analyse with a polarizing beam splitter, sending the two outputs to SPADs. Record signal and idler times with a time tagger; keep coincidences within a window short compared with the coherence time and jitter. Measure the source's g²(0) or antibunching, characterize dark counts and efficiencies, subtract accidentals using a delayed window, and compare the conditional visibility at the erasure angle with the classical model. Report the evidence for single-photon operation separately from the visibility result.",
      explanation:
        "The key additions are heralding, photon counting and coincidence timing; the optical algebra is the same as the classical demonstration.",
      marks: 6
    },
    {
      id: "q32",
      type: "mcq",
      difficulty: 2,
      topic: "Delayed choice",
      prompt: "Which statement about delayed-choice quantum-eraser experiments is correct?",
      options: [
        "A future choice changes the earlier recorded signal.",
        "Coincidence sorting reveals complementary conditional patterns, but the unconditional singles record carries no choice-dependent signal.",
        "They violate causality because the idler is detected later.",
        "They require no idler photon or coincidence electronics."
      ],
      answerIndex: 1,
      answer:
        "Coincidence sorting reveals complementary conditional patterns, but the unconditional singles record carries no choice-dependent signal.",
      explanation:
        "The correlations are real, but they cannot be used for signalling. The signal event is not altered by the later choice.",
      marks: 2
    },
    {
      id: "q33",
      type: "short",
      difficulty: 2,
      topic: "Definitions",
      prompt: "Define distinguishability operationally in this experiment.",
      answer:
        "Distinguishability is a number between 0 and 1 that quantifies how well an ideal observer could determine the path from the marker. For a pure marker it is D = √(1 − |⟨H|θ⟩|²) = |sin θ|. Operationally, D = 0 means the two marker states are identical; D = 1 means they are orthogonal and a measurement could identify the path with certainty.",
      explanation: "It is a property of the available information, not of whether anyone reads it.",
      marks: 2
    },
    {
      id: "q34",
      type: "viva",
      difficulty: 2,
      topic: "Extinction",
      prompt: "Why does the extinction ratio of the polarizers matter for the eraser measurement?",
      answer:
        "Finite extinction means the analyser does not project perfectly onto one polarization: a small component of the orthogonal marker leaks through. That leakage leaves a residual interference term and limits the smallest visibility you can distinguish from zero. It also biases the conditional visibility, especially near the erasure angle.",
      explanation:
        "The extinction ratio sets a systematic floor on the contrast and must be measured in the same configuration.",
      marks: 3
    },
    {
      id: "q35",
      type: "numerical",
      difficulty: 2,
      topic: "Wave plates",
      prompt: "At what fast-axis angle should a half-wave plate be set to produce a marker polarization of θ = 60° from horizontal input?",
      answer: "β = θ/2 = 30°.",
      explanation: "A half-wave plate rotates linear polarization by 2β.",
      numeric: { value: 30, tolerance: 0.5, unit: "°" },
      marks: 2
    },
    {
      id: "q36",
      type: "numerical",
      difficulty: 2,
      topic: "Path phase",
      prompt: "Calculate the phase shift produced by an optical path difference of 100 nm at λ = 632.8 nm.",
      answer: "φ = 2π(100/632.8) = 0.993 rad.",
      explanation: "φ = 2π ΔL/λ.",
      numeric: { value: 0.993, tolerance: 0.01, unit: "rad" },
      marks: 2
    },
    {
      id: "erase-x01",
      type: "mcq",
      difficulty: 2,
      topic: "Alignment / experimental practice",
      prompt:
        "Before inserting the polarization marker, which alignment condition is most important for a meaningful V(θ) measurement?",
      options: [
        "The two arm spots overlap in the near and far fields, the arm intensities are balanced, and the path difference is stable to a fraction of a wavelength.",
        "The marker is already at θ = 90° so the fringes are suppressed before the measurement begins.",
        "The analyser is set to extinction so that no light reaches the detector.",
        "The path difference is many coherence lengths, so the fringe envelope is flat."
      ],
      answerIndex: 0,
      answer:
        "The two arm spots must overlap in the near and far fields, the arm intensities must be balanced, and the path difference must be stable to a small fraction of a wavelength.",
      explanation:
        "These three conditions give V(0°) close to one and keep the fringe phase from drifting during a scan. A marker at 90°, an analyser at extinction, or a path difference far beyond the coherence length would all remove or wash out the reference fringes before the measurement starts.",
      marks: 3
    },
    {
      id: "erase-x02",
      type: "mcq",
      difficulty: 1,
      topic: "Detection / experimental practice",
      prompt: "Why is a camera often used alongside a photodiode when recording fringe visibility?",
      options: [
        "The camera replaces the need for a coherent source.",
        "The camera checks fringe straightness, period and spatial overlap; the photodiode provides a low-noise phase scan at a chosen point.",
        "The camera directly measures the analyser extinction ratio.",
        "The camera removes path drift by averaging successive frames."
      ],
      answerIndex: 1,
      answer:
        "The camera is a spatial diagnostic: it shows whether the fringes are straight, equally spaced and well overlapped. The photodiode gives a quantitative, low-noise phase scan at a selected point.",
      explanation:
        "A camera alone is not a calibrated visibility instrument unless its response is characterised. The analyser extinction ratio is measured with a polarizer pair and a power meter, while path drift must be controlled mechanically or tracked with a reference signal, not averaged away.",
      marks: 2
    },
    {
      id: "erase-x03",
      type: "mcq",
      difficulty: 2,
      topic: "Coincidence gating",
      prompt: "In a genuine single-photon eraser run, what does the coincidence window primarily select?",
      options: [
        "Photons with the highest energy in the down-converted spectrum.",
        "Signal events that occur within a short time window of a herald or of the complementary analyser-channel event.",
        "Only photons that passed through the marker plate.",
        "Events with perfect polarization extinction."
      ],
      answerIndex: 1,
      answer:
        "It selects signal events that are time-correlated with a herald (or with the complementary analyser-channel event) inside a short coincidence window.",
      explanation:
        "The timing correlation defines the gated subensemble. The window must be short compared with the source coherence and detector jitter; accidentals are estimated from a delayed window and subtracted. The window does not select on photon energy or polarization extinction.",
      marks: 3
    },
    {
      id: "erase-x04",
      type: "mcq",
      difficulty: 2,
      topic: "Troubleshooting / marker",
      prompt:
        "A student inserts the λ/2 marker at θ = 90° and the fringes disappear. What is the best interpretation?",
      options: [
        "The interferometer is broken and must be completely realigned.",
        "This is expected: orthogonal path polarizations remove the unconditioned interference; insert the analyser and post-select a channel to look for recovery.",
        "The marker has increased the coherence, so the fringes have moved off the detector.",
        "The detector is saturated by the marker."
      ],
      answerIndex: 1,
      answer:
        "The disappearance is expected at θ = 90° because the two path polarizations are orthogonal. The next step is to insert the analyser and post-select one output channel.",
      explanation:
        "If the fringes also vanish at θ = 0° (marker nominally removed), then suspect a real fault: polarization mismatch, loss of spatial overlap or path drift. At θ = 90° the flat unconditioned pattern is the signature that the which-path marker is working, not evidence of a broken interferometer.",
      marks: 3
    },
    {
      id: "erase-x05",
      type: "mcq",
      difficulty: 3,
      topic: "Troubleshooting / conditional visibility",
      prompt:
        "At θ = 90°, the gated + channel shows a weak fringe with V ≈ 0.2 instead of near 1. Which combination best explains the reduced visibility?",
      options: [
        "An analyser zero offset, an incomplete or drifting phase scan, or a large accidental-coincidence fraction.",
        "The marker is exactly orthogonal and the two path intensities are balanced.",
        "The analyser is exactly at 45° and the phase is scanned over several fringes.",
        "The detector is linear and the coincidence window is correct."
      ],
      answerIndex: 0,
      answer:
        "An analyser zero offset, an incomplete or drifting phase scan, or a large accidental-coincidence fraction can all reduce the gated visibility.",
      explanation:
        "A wrong analyser angle reduces the projection overlap; phase drift or too short a scan smears the extrema; accidentals add a flat background. Also check that the input is pure H and that the marker and analyser extinction are adequate. The other options describe healthy conditions and would not explain V ≈ 0.2.",
      marks: 4
    },
    {
      id: "erase-x06",
      type: "mcq",
      difficulty: 2,
      topic: "Post-selection",
      prompt: "After erasure at θ = 90°, why does the total singles count rate still show no fringes?",
      options: [
        "The analyser absorbs all the light, so no interference can be observed.",
        "The two analyser channels carry equal-amplitude fringes in antiphase; their sum is flat, and fringes appear only after channel post-selection.",
        "The marker has been physically removed from the beam by the analyser.",
        "The detector cannot respond fast enough to the fringe motion."
      ],
      answerIndex: 1,
      answer:
        "The two complementary analyser patterns have equal amplitude and opposite phase. Summed, they are flat; keeping the channel label selects one pattern and reveals fringes.",
      explanation:
        "This is post-selection, not a signal sent back in time. The eraser does not alter the earlier detection event, and the unconditional singles record at θ = 90° carries no information about the analyser setting.",
      marks: 3
    },
    {
      id: "erase-x07",
      type: "mcq",
      difficulty: 3,
      topic: "Complementarity / QKD",
      prompt:
        "Which statement best connects the eraser's complementarity relation to quantum key distribution (BB84)?",
      options: [
        "BB84 works because measuring a non-orthogonal basis disturbs the state, producing errors that reveal eavesdropping; this is the same which-path/basis trade-off as D² + V² ≤ 1.",
        "BB84 requires D = 1 and V = 1 simultaneously to encode two bits per photon.",
        "The eraser proves that polarization can be cloned without disturbance, which is the basis of BB84.",
        "BB84 uses only orthogonal states, so complementarity plays no role."
      ],
      answerIndex: 0,
      answer: "BB84 relies on the disturbance caused by measuring non-orthogonal states; the resulting errors reveal eavesdropping, just as which-path information reduces fringe visibility.",
      explanation:
        "The eraser and BB84 are both consequences of complementarity: gaining path or basis information degrades the conjugate interference. BB84 does not require D = V = 1, does not rely on cloning, and uses non-orthogonal bases.",
      marks: 3
    },
    {
      id: "erase-x08",
      type: "numerical",
      difficulty: 1,
      topic: "Visibility and distinguishability",
      prompt:
        "A balanced interferometer has a pure marker at θ = 75°. Calculate the unconditioned visibility V and the distinguishability D. Enter V as the numeric answer.",
      answer:
        "V = |cos 75°| = 0.2588; D = |sin 75°| = 0.9659; D² + V² = 1.000.",
      explanation:
        "For balanced paths V = |cos θ| and D = |sin θ|. The pure-state duality relation is saturated, so the two numbers lie on the unit circle.",
      numeric: { value: 0.2588, tolerance: 0.01, unit: "" },
      marks: 3
    },
    {
      id: "erase-x09",
      type: "numerical",
      difficulty: 2,
      topic: "Coincidence visibility",
      prompt:
        "In a gated θ = 90° run at α = 45°, the + channel counts after accidental subtraction oscillate between 1600 and 400. Calculate the conditional visibility. Also state the Malus transmission of the H path through the analyser.",
      answer:
        "V_cond = (1600 − 400)/(1600 + 400) = 0.60. The H path transmits cos²45° = 0.50 through the analyser.",
      explanation:
        "Use the extrema formula on the background-corrected counts; the analyser projection is Malus's law. A perfect balanced eraser would give V = 1, so 0.60 indicates imperfect projection, phase drift or residual background.",
      numeric: { value: 0.6, tolerance: 0.01, unit: "" },
      marks: 3
    },
    {
      id: "erase-x10",
      type: "viva",
      difficulty: 3,
      topic: "Instrumentation / viva",
      prompt:
        "Why is a laser-plus-photodiode demonstration not, by itself, a genuine quantum eraser? Which evidence would justify the single-photon claim?",
      options: [
        "The laser is too intense; attenuating it to a few photons per second automatically makes the experiment single-photon.",
        "A coherent laser has Poissonian photon statistics and no heralded single-photon events; the quantum claim requires a heralded source, single-photon detectors and coincidence or antibunching evidence, not just a visibility curve.",
        "A photodiode cannot measure interference, so the fringes are not real.",
        "The marker is classical, so no polarization projection can occur."
      ],
      answerIndex: 1,
      answer:
        "A coherent laser is a classical-wave analogue. A genuine single-photon claim requires a heralded source, single-photon detectors, coincidence timing and source characterization such as antibunching or a low g²(0). A visibility curve alone is not sufficient.",
      explanation:
        "Attenuating a laser reduces the mean photon number but leaves a Poissonian distribution; it does not create a heralded single-photon state. A photodiode measures optical power, not photon arrivals, and polarization projection is a valid classical operation. The evidence must establish the photon statistics and the coincidence record.",
      marks: 4
    }
  ],
  references: REFERENCES,
  related: [
    "mach-zehnder-interferometer",
    "quantum-bomb-tester",
    "quantum-key-distribution",
    "polarization-3d-cinema"
  ],
  status: {
    content: true,
    simulation: true,
    procedure: true,
    analysis: true,
    questions: true,
    references: true,
    validation: true
  }
};

export default content;
export { content as quantumEraserContent };
