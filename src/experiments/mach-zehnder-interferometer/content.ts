import type { ExperimentContent, Reference } from "@/lib/content/types";
import { REFERENCE_CATALOGUE } from "@/lib/content/references";

function reference(id: string): Reference {
  const entry = REFERENCE_CATALOGUE[id];
  if (!entry) throw new Error(`Unknown reference id: ${id}`);
  return entry;
}

const content: ExperimentContent = {
  slug: "mach-zehnder-interferometer",
  number: "02",
  title: "Mach–Zehnder Interferometer",
  shortTitle: "Mach–Zehnder",
  subtitle: "Two paths, complex amplitudes and quantum superposition",
  summary:
    "Trace complex amplitudes through two beam splitters and see how phase, splitting ratio and path information control the outputs.",
  principle:
    "Unitary beam-splitter transformations map an input mode to two outputs whose probabilities depend on relative phase.",
  family: "Interferometry",
  difficulty: 2,
  duration: "3–4 h",
  evidence: {
    implementation: "classical-demo",
    headline:
      "A coherent laser demonstrates the full unitary mathematics — this is not a single-photon experiment.",
    detail:
      "The kit drives the interferometer with a coherent He–Ne laser, so every measurement is a classical intensity measurement. The same beam-splitter algebra describes a single photon traversing the same set-up, and the simulator lets you explore that limit, but the apparatus is not a single-photon experiment unless a heralded source is added. Attenuating the laser does not change this: an attenuated laser remains a coherent state with Poissonian photon statistics, not a source of one photon at a time. A genuine single-photon implementation requires a heralded source, single-photon detectors and coincidence electronics, none of which is assumed present."
  },
  kit: {
    name: "Thorlabs educational interferometry kit (model to be confirmed)",
    manufacturer: "Thorlabs",
    verification: "unverified",
    documentation: [
      {
        title: "Thorlabs educational kits, user guides and application notes",
        url: "https://www.thorlabs.com/",
        note:
          "Consult the printed guide and packing list supplied with the physical kit. A model-specific document URL must be recorded after the kit label is verified; it is not asserted here."
      }
    ],
    note:
      "Verification required. The physical kit label, packing list, component quantities and beam height have not been checked against this content. No model-specific SKU or specification is claimed. Confirm every item and thread size before starting the procedure."
  },
  hardware: [
    {
      itemId: "src-he-ne",
      quantity: "1",
      role: "kit",
      note: "632.8 nm coherent source. The demonstration is classical; the laser is not a single-photon source."
    },
    {
      itemId: "bs-cube-50",
      quantity: "2",
      role: "kit",
      note: "BS1 divides the input, BS2 recombines the arms. Measure the actual splitting ratio; do not assume 50:50."
    },
    { itemId: "mir-plane", quantity: "2", role: "kit", note: "One mirror per arm; both must steer the beam to BS2." },
    {
      itemId: "kinematic-mount",
      quantity: "2",
      role: "kit",
      note: "Two-axis adjustment is needed for overlapping the beams at BS2."
    },
    {
      itemId: "translation-stage",
      quantity: "1",
      role: "kit",
      note: "Moves one arm longitudinally for path balancing and the phase scan."
    },
    { itemId: "lens-convex", quantity: "1", role: "kit", note: "Optional beam expander or focusing lens before the detectors." },
    { itemId: "screen-white", quantity: "1", role: "kit", note: "Alignment target at the two output ports." },
    { itemId: "det-photodiode", quantity: "2", role: "kit", note: "One photodiode per output port; a photodiode measures power, not photon number." },
    { itemId: "optical-table", quantity: "1", role: "kit", note: "Damped surface for path stability." },
    { itemId: "beam-block", quantity: "2", role: "kit", note: "One for each arm; also used to find the detector zero level." },
    { itemId: "iris-diaphragm", quantity: "2", role: "kit", note: "Beam-height and centring references." },
    {
      itemId: "src-attenuated-laser",
      quantity: "1",
      role: "recommended",
      note: "Recommended only for the single-photon discussion. Attenuation lowers the count rate but does not produce a single-photon state."
    },
    {
      itemId: "src-single-photon",
      quantity: "1",
      role: "unverified",
      note: "Not assumed present. A heralded SPDC source, single-photon detectors and coincidence logic would be required for a genuine single-photon implementation."
    }
  ],
  objectives: [
    "Align a folded two-path interferometer so that the two beams overlap at the second beam splitter and produce complementary outputs.",
    "Represent each beam splitter by a 2×2 unitary matrix and propagate complex amplitudes through the full interferometer.",
    "Derive and test the output probabilities P0 = sin²(φ/2) and P1 = cos²(φ/2) for a balanced instrument.",
    "Convert between relative phase, optical path difference and translation-stage displacement using the 632.8 nm wavelength.",
    "Measure fringe visibility as a function of splitting ratio and compare it with the unequal-splitting formula.",
    "Explain why a coherent laser and an ideal single photon give the same output probabilities, and identify what would change in a real photon-counting experiment.",
    "Distinguish interference visibility from single-photon antibunching and state honestly what the kit can and cannot demonstrate.",
    "Use the interferometer as a phase-estimation primitive and connect it to the bomb tester, quantum eraser and phase-encoded quantum key distribution."
  ],
  concepts: [
    "Beam-splitter matrix",
    "Unitarity",
    "Complex amplitude",
    "Phasor addition",
    "Optical path difference",
    "Fringe visibility",
    "Degree of coherence",
    "Which-path information",
    "Complementarity",
    "Phase estimation",
    "Single-photon self-interference"
  ],
  prerequisites: [
    "Complex numbers, modulus and argument",
    "Harmonic waves and the relation between phase and optical path",
    "Two-beam superposition and the intensity formula",
    "Basic 2×2 matrix multiplication",
    "Meaning of intensity, optical power and detector responsivity",
    "Laboratory laser safety and beam-block discipline"
  ],
  sections: [
    {
      id: "beam-splitting",
      number: "01",
      title: "Optical beam splitting and recombination",
      kicker: "Geometry",
      blocks: [
        {
          type: "lead",
          text: "A Mach–Zehnder interferometer is two beam splitters and two mirrors arranged so that each wavefront has two routes from the input to either output. Everything that follows is a consequence of adding the two route amplitudes."
        },
        {
          type: "p",
          text: "At the first beam splitter (BS1) the incoming field is divided into a transmitted and a reflected beam. Two plane mirrors redirect the beams so that they meet again at the second beam splitter (BS2). BS2 has two output ports: one is the nominally bright port, the other the nominally dark port. Unlike a Michelson interferometer, the two beams travel in separate directions and recombine only once, so the output is a pair of beams rather than a fringe pattern on a screen."
        },
        {
          type: "callout",
          tone: "principle",
          title: "The observable is a phase difference",
          body:
            "No detector can measure the absolute phase of a light wave. The interferometer converts the difference between two optical phases into a difference between two intensities. That conversion is the measurement."
        },
        {
          type: "diagram",
          kind: "beam-splitter",
          caption:
            "A beam splitter has two input and two output ports. In the symmetric convention used here the transmitted amplitude is t and the reflected amplitude is i r; the factor i is a 90° phase shift required by energy conservation and reciprocity."
        },
        {
          type: "p",
          text: "A real beam-splitter cube is a glass cube with a partially reflecting dielectric coating on its diagonal. The coating is designed to be non-polarizing over a wavelength band, but no cube is perfectly 50:50, perfectly non-polarizing or perfectly lossless. The model treats it as an ideal lossless splitter; the procedure asks you to measure the real splitting ratio and to include it in the analysis."
        },
        {
          type: "list",
          items: [
            "The two beams must overlap in space at BS2; a lateral offset produces two separated spots instead of one interference field.",
            "Their polarizations must be parallel; an orthogonal component does not interfere and only adds background.",
            "The path difference must be within the source coherence length, and the wavefront curvatures must match."
          ]
        },
        {
          type: "diagram",
          kind: "mach-zehnder",
          caption:
            "The folded Mach–Zehnder layout. BS1 divides the input; mirrors M1 and M2 redirect the upper path A and lower path B; BS2 recombines them into outputs D0 and D1. Path A is the reflected arm and path B the transmitted arm in this module."
        },
        {
          type: "p",
          text: "The labels A and B are conventions, not physics. What matters is that one arm accumulates a phase relative to the other. In the simulation path A is the reflected upper arm, path B the transmitted lower arm, and the adjustable phase φ is placed on path B. Changing which arm carries the phase reverses the sign of the fringe shift but not the visibility."
        },
        {
          type: "callout",
          tone: "note",
          title: "Port convention used throughout",
          body:
            "With the symmetric beam-splitter matrix B = [[t, i r], [i r, t]] and a 50:50 splitting, φ = 0 sends all light to port D1 and none to D0. The probability of a D0 detection is P0 = sin²(φ/2)."
        }
      ]
    },
    {
      id: "two-path-interference",
      number: "02",
      title: "Two-path interference",
      kicker: "Superposition",
      blocks: [
        {
          type: "lead",
          text: "When two coherent fields overlap, the detector records the squared modulus of their sum, not the sum of their powers. The cross term is the interference."
        },
        {
          type: "eq",
          latex: "I = I_1 + I_2 + 2\\sqrt{I_1 I_2}\\,\\cos\\delta",
          note:
            "I1 and I2 are the intensities that each beam would produce alone and δ is their relative phase. The equation assumes parallel polarizations and matched spatial modes."
        },
        {
          type: "p",
          text: "For equal beams, I1 = I2 = I0, the expression becomes I = 2I0(1 + cos δ) = 4I0 cos²(δ/2). The intensity oscillates between zero and four times the single-beam intensity. At δ = π the two complex amplitudes are opposite and cancel exactly; at δ = 0 they add."
        },
        {
          type: "numeric",
          title: "Destructive interference",
          statement: "Two equal beams arrive exactly out of phase at the monitored port.",
          latex: "I = 2I_0 + 2I_0\\cos\\pi = 0",
          result: "The field amplitudes cancel at that port. The power is not destroyed: it leaves through the other output of the second beam splitter."
        },
        {
          type: "p",
          text: "The last point is the central bookkeeping rule of the Mach–Zehnder interferometer. BS2 is a lossless four-port device. If one output is dark, the other output must be bright, because the total number of photons (or the total classical power) is conserved. A dark fringe is a redirection of energy, not its absorption."
        },
        {
          type: "callout",
          tone: "misconception",
          title: "A dark port does not mean the light vanished",
          body:
            "Students often expect the dark output to be a place where light is somehow 'blocked'. Nothing is blocked. The two amplitudes arrive with opposite signs and cancel in that direction; the same amplitudes add in the other direction."
        },
        {
          type: "p",
          text: "In a real instrument the two outputs are complementary only to the extent that the beam splitters are lossless and the two beams overlap perfectly. Scattered light, surface reflections and unequal splitting put a small amount of power into the dark port even at the setting where an ideal model predicts zero."
        }
      ]
    },
    {
      id: "phase-and-opd",
      number: "03",
      title: "Phase accumulation and optical path difference",
      kicker: "Metrology",
      blocks: [
        {
          type: "lead",
          text: "A beam acquires phase as it propagates. The interferometer responds to the difference between the phases accumulated on the two arms, which is proportional to the optical path difference."
        },
        {
          type: "p",
          text: "For a monochromatic wave of vacuum wavelength λ travelling a geometric distance L through a medium of refractive index n, the accumulated phase is φ = 2π n L / λ. In the Mach–Zehnder each beam traverses its arm once, so the phase difference is set by the optical path difference ΔLopt = nA LA − nB LB. This is the single-pass counterpart of the Michelson factor of two."
        },
        {
          type: "eq",
          latex: "\\Delta\\varphi = \\frac{2\\pi}{\\lambda}\\,\\left(n_A L_A - n_B L_B\\right) = \\frac{2\\pi\\,\\Delta L_{\\mathrm{opt}}}{\\lambda}",
          note:
            "A positive ΔLopt means path A is optically longer. The sign determines the direction in which the fringe pattern moves, not its visibility."
        },
        {
          type: "p",
          text: "At 632.8 nm one full fringe corresponds to 632.8 nm of optical path difference. In the Michelson, a mirror must move by λ/2 = 316.4 nm for one fringe because the light traverses the arm twice. In the Mach–Zehnder, moving a mirror by 316.4 nm changes the optical path of that arm by 316.4 nm and produces half a fringe."
        },
        {
          type: "table",
          caption: "Phase difference and optical path difference at the He–Ne wavelength.",
          head: ["Optical path difference ΔLopt", "Phase difference Δφ", "P0 = sin²(Δφ/2)"],
          rows: [
            ["0", "0", "0"],
            ["79.1 nm = λ/8", "45° = π/4", "0.146"],
            ["158.2 nm = λ/4", "90° = π/2", "0.500"],
            ["316.4 nm = λ/2", "180° = π", "1.000"],
            ["474.6 nm = 3λ/4", "270° = 3π/2", "0.500"],
            ["632.8 nm = λ", "360° = 2π", "0"]
          ],
          align: ["l", "l", "r"]
        },
        {
          type: "numeric",
          title: "Phase from a quarter-wave path difference",
          statement: "A translation stage adds 158.2 nm of optical path to one arm of a balanced interferometer at 632.8 nm.",
          latex: "\\Delta\\varphi = \\frac{2\\pi \\times 158.2\\ \\mathrm{nm}}{632.8\\ \\mathrm{nm}} = \\frac{\\pi}{2}",
          result: "P0 = sin²(π/4) = 0.50 and P1 = 0.50. The outputs are equally bright."
        },
        {
          type: "callout",
          tone: "caution",
          title: "Phase is exquisitely sensitive to length",
          body:
            "A 100 nm drift in one arm changes the phase by 2π × 100/632.8 ≈ 0.99 rad, about 57°. Thermal expansion of a metal post, a hand near an open beam or a door closing is enough to move the fringe. Enclose the arms or wait for thermal equilibrium before a quantitative scan."
        },
        {
          type: "p",
          text: "Air is not a vacuum. The refractive index of air is about 1.00027 at 632.8 nm and changes with temperature, pressure and humidity. A 10 cm air path that warms by 1 °C can change the optical path by tens of nanometres. For a teaching measurement this is a source of slow drift; for precision metrology it is the dominant systematic and must be measured or compensated."
        }
      ]
    },
    {
      id: "complex-amplitudes",
      number: "04",
      title: "Complex amplitudes and phasors",
      kicker: "Representation",
      blocks: [
        {
          type: "lead",
          text: "Interference is easiest to calculate with complex amplitudes. The detector responds to the squared modulus, so only relative phases survive."
        },
        {
          type: "p",
          text: "Write a monochromatic scalar field as the real part of E0 exp[i(kz − ωt + φ)]. The common factor exp(−iωt) is the same for every beam at a fixed time, so it can be dropped when adding fields. What remains is a complex phasor whose modulus is the field amplitude and whose argument is the phase at a chosen reference plane."
        },
        {
          type: "eq",
          latex: "a = a_1 e^{i\\varphi_1} + a_2 e^{i\\varphi_2}, \\qquad I = |a|^2",
          note:
            "The phasors must be referred to the same plane. Moving the reference plane multiplies each phasor by a phase factor, which cancels in the intensity."
        },
        {
          type: "definition",
          term: "Phasor",
          body:
            "A complex number representing the amplitude and phase of a sinusoidally varying field at a fixed frequency. Adding phasors head-to-tail is equivalent to adding the fields; the squared length of the resultant gives the intensity."
        },
        {
          type: "p",
          text: "Two phasors of equal length add to twice the length when they are parallel, to zero when they are antiparallel, and to √2 times the length when they are at 90°. The last case gives twice the single-beam intensity, not four times. This geometric picture is exactly what the beam-splitter matrices automate."
        },
        {
          type: "numeric",
          title: "Equal phasors at 90°",
          statement: "Two unit phasors differ in phase by 90°.",
          latex: "\\left|1 + e^{i\\pi/2}\\right|^2 = \\left|1 + i\\right|^2 = 2",
          result: "The intensity is 2, compared with 4 for the fully constructive case: half of the maximum."
        },
        {
          type: "callout",
          tone: "note",
          title: "Global phase is unobservable",
          body:
            "Multiplying every phasor by the same phase factor changes nothing measurable. Only relative phases — and therefore optical path differences — enter the intensity. This is why an interferometer measures differences, never an absolute phase."
        }
      ]
    },
    {
      id: "beam-splitter-matrices",
      number: "05",
      title: "Beam-splitter matrices and unitarity",
      kicker: "Algebra",
      blocks: [
        {
          type: "lead",
          text: "A lossless beam splitter is a unitary two-port device. Once its matrix is known, the whole interferometer is a product of matrices and phase factors."
        },
        {
          type: "p",
          text: "Let η be the power reflectivity and 1 − η the power transmissivity. The amplitude coefficients are r = √η and t = √(1 − η). In the symmetric convention the reflected wave acquires a factor i, giving the matrix below. The two input ports are the two columns; the two output ports are the two rows."
        },
        {
          type: "eq",
          latex: "B(\\eta) = \\begin{pmatrix} t & i r \\\\ i r & t \\end{pmatrix}, \\qquad t=\\sqrt{1-\\eta},\\; r=\\sqrt{\\eta}",
          note:
            "The same matrix acts on a classical field amplitude and on a single-photon mode amplitude. Only the interpretation of the squared modulus changes."
        },
        {
          type: "eq",
          latex: "B^{\\dagger}B = B B^{\\dagger} = \\mathbb{1}",
          note: "Unitarity is the statement that no probability (or energy) is created or lost in the beam splitter."
        },
        {
          type: "derivation",
          derivationId: "bs-unitarity"
        },
        {
          type: "p",
          text: "Why does reflection carry i? Unitarity requires the transmitted and reflected amplitudes to be 90° out of phase when both are non-zero: the cross terms in B†B must cancel. A real matrix with equal diagonal entries t and equal off-diagonal entries r would leave a 2tr cross term and would not be unitary. The factor i supplies the required quadrature, so the two reflection paths acquire opposite phases and the cross terms cancel. Different authors put the i on different ports; the physical predictions are unchanged as long as one is consistent. This module uses the convention of the shared physics library: the off-diagonal elements are +i r."
        },
        {
          type: "table",
          caption: "Amplitude coefficients for three reflectivities.",
          head: ["Power reflectivity η", "Reflectivity amplitude r = √η", "Transmission amplitude t = √(1−η)"],
          rows: [
            ["0.20", "0.447", "0.894"],
            ["0.50", "0.707", "0.707"],
            ["0.80", "0.894", "0.447"]
          ],
          align: ["r", "r", "r"]
        },
        {
          type: "callout",
          tone: "caution",
          title: "Real cubes are not ideal matrices",
          body:
            "Absorption, polarization-dependent splitting, multiple internal reflections and a finite acceptance angle all violate the ideal model. A cube specified as 50:50 may be 48:52 at your wavelength, and its splitting ratio can depend on polarization. Measure it before using it as a quantitative standard."
        }
      ]
    },
    {
      id: "quantum-superposition",
      number: "06",
      title: "Quantum superposition and single-photon self-interference",
      kicker: "Quantum limit",
      blocks: [
        {
          type: "lead",
          text: "Send one photon at a time and the same output probabilities appear. The photon is not split; the two path amplitudes belong to the same photon."
        },
        {
          type: "p",
          text: "After BS1 the state is a superposition of the two arm modes. For a single photon entering port 0 and a beam splitter with coefficients t1 and r1, the state is t1|B⟩ + i r1|A⟩, where |A⟩ and |B⟩ denote one photon in the reflected and transmitted arms. For a 50:50 splitter this is (|B⟩ + i|A⟩)/√2 up to a global phase. The modulus squared of each coefficient is the probability of finding the photon in that arm if a detector were placed there."
        },
        {
          type: "eq",
          latex: "|\\psi\\rangle = i r_1\\,|A\\rangle + t_1 e^{i\\varphi}\\,|B\\rangle",
          note:
            "A single photon in a two-mode superposition. The phase φ is accumulated on path B; the factor i belongs to the reflection at BS1."
        },
        {
          type: "p",
          text: "At BS2 the two amplitudes are recombined. A detector click is indivisible: one detector fires, the other does not. The probability of a click at D0 is |a0|², where a0 is the complex amplitude for the two routes to port 0. There is no state in which half a photon reaches each detector; the wavefunction gives probabilities, and the detection event selects one outcome."
        },
        {
          type: "derivation",
          derivationId: "balanced-mz"
        },
        {
          type: "callout",
          tone: "principle",
          title: "One photon interferes with itself",
          body:
            "The interferometer compares two amplitudes of the same photon, not two different photons. This is why the fringe persists when the source is so weak that only one photon is in the apparatus at a time. The requirement is indistinguishability of the two routes, not simultaneous presence of two photons."
        },
        {
          type: "p",
          text: "The single-photon description requires the two routes to be indistinguishable in every degree of freedom: arrival time, polarization, spatial mode and frequency. If a marker or an extra path length makes them distinguishable in principle, the interference term disappears. The visibility is then limited by the overlap of the two mode functions, not by the intensity of the source."
        },
        {
          type: "callout",
          tone: "note",
          title: "What the laser demonstration does and does not show",
          body:
            "The kit uses a coherent laser. It demonstrates the unitary algebra, the phase-to-intensity mapping, the complementary outputs and the visibility formula. It does not demonstrate single-photon detection, antibunching or a heralded source. Those require a different source and detector chain, as stated in the evidence label."
        },
        {
          type: "p",
          text: "A He–Ne laser has a coherence length of at least tens of centimetres for a single longitudinal mode, and several centimetres even when a few modes oscillate. A table-top Mach–Zehnder with arm differences of a few centimetres is therefore well within the coherence length, and the fringes are limited by alignment and stability rather than by temporal coherence. This is the opposite of a white-light interferometer, where the fringe envelope is narrow and path balancing is the central challenge."
        }
      ]
    },
    {
      id: "distinguishability",
      number: "07",
      title: "Path distinguishability and which-path information",
      kicker: "Complementarity",
      blocks: [
        {
          type: "lead",
          text: "Interference requires that the two routes remain indistinguishable. Any record — even one that is never read — that could reveal the route destroys the fringe."
        },
        {
          type: "p",
          text: "Model a which-path marker as a state entangled with the arm. If the marker states for the two arms have overlap |⟨mA|mB⟩| = 1, the routes are indistinguishable and the full fringe survives. If the marker states are orthogonal, the routes are perfectly distinguishable and the interference term vanishes. The visibility is proportional to the overlap."
        },
        {
          type: "eq",
          latex: "D^2 + V^2 \\le 1",
          note:
            "D is the distinguishability of the two routes (0 = no information, 1 = perfect which-path information) and V is the fringe visibility. Equality holds for a pure two-path state with an ideal marker; a mixed state lies inside the bound."
        },
        {
          type: "p",
          text: "Blocking one arm is the crudest form of path marking: it removes one amplitude entirely. The output becomes constant as the phase is scanned, so the fringe visibility is zero, and the total power drops to the fraction that survived the block. A more subtle marker — a polarization rotation, a time delay or an entangled idler — preserves both amplitudes but reduces their overlap, giving 0 < V < 1."
        },
        {
          type: "numeric",
          title: "Distinguishability bound",
          statement: "A measurement yields a fringe visibility of 0.90.",
          latex: "D_{\\max} = \\sqrt{1 - V^2} = \\sqrt{1 - 0.81} = 0.436",
          result: "At most 43.6% of the which-path information is available. A perfect which-path measurement would force V = 0."
        },
        {
          type: "callout",
          tone: "misconception",
          title: "The information need not be read",
          body:
            "It is the availability of the which-path information in principle, not a conscious observer, that removes the interference. Erasing the information before detection can restore fringes in a selected subensemble — the logic of the quantum eraser."
        },
        {
          type: "p",
          text: "The same complementarity relation underlies the Elitzur–Vaidman bomb tester and the quantum eraser, both of which are Mach–Zehnder experiments at heart. In the bomb tester an absorptive object in one arm acts as a perfect marker: a click in the normally dark port certifies that the object is present without the photon having been absorbed. In the eraser a polarization marker is applied and then erased conditionally. This experiment supplies the algebra those modules build on."
        }
      ]
    },
    {
      id: "measurement",
      number: "08",
      title: "Measurement and detection",
      kicker: "Detection",
      blocks: [
        {
          type: "lead",
          text: "The interferometer produces two optical powers. Turning those powers into probabilities requires a detector model, and the detector model must be stated honestly."
        },
        {
          type: "p",
          text: "A photodiode converts incident optical power into a photocurrent with a responsivity of order 0.1–0.6 A/W at visible wavelengths. With a transimpedance amplifier the current becomes a voltage proportional to power. The diode integrates over many photons, so it measures a classical intensity even when the underlying field is quantized."
        },
        {
          type: "eq",
          latex: "p_k^{\\mathrm{det}} = \\eta_{\\mathrm{det}}\\,\\mathrm{Tr}(\\rho\\,\\Pi_k), \\qquad N_k \\sim \\mathrm{Binomial}(N, p_k)",
          note:
            "For one photon, p_k is the probability that detector k fires. For N independent photons, the count at detector k follows a binomial distribution when every photon is detected with the same probability. Detection efficiency multiplies the ideal probability."
        },
        {
          type: "p",
          text: "For a coherent laser field the photon number is not fixed; a coherent state has Poissonian statistics. A photodiode current proportional to mean power is the correct description. A single-photon avalanche diode (SPAD) can register individual detection events, but it still has dark counts, dead time and afterpulsing, and it cannot tell whether a click came from a true single-photon state or from a weak coherent pulse."
        },
        {
          type: "table",
          caption: "Two detector regimes.",
          head: ["Property", "Photodiode (this kit)", "SPAD / photon counter (not assumed)"],
          rows: [
            ["Records", "Mean optical power", "Individual detection events"],
            ["Suitable for", "Classical fringes and visibility", "Photon counting and coincidence logic"],
            ["Noise", "Dark current, shot noise, thermal noise", "Dark counts, dead time, afterpulsing"],
            ["Single-photon evidence", "None", "Antibunching only with a true single-photon source"]
          ]
        },
        {
          type: "callout",
          tone: "lab",
          title: "Keep the detector linear",
          body:
            "Record the dark level with the beam blocked, then check that doubling the optical power doubles the signal. A photodiode near saturation compresses the peaks of the fringe and biases the visibility downward. Use a neutral-density filter rather than operating at the top of the range."
        },
        {
          type: "p",
          text: "The simulator's photon counter is an ideal binomial sampler. It is labelled SIMULATED and is not a claim about the kit. It is useful for seeing how count noise scales as √N and why a finite sample does not reproduce the exact probabilities."
        }
      ]
    },
    {
      id: "quantum-primitive",
      number: "09",
      title: "The Mach–Zehnder as a quantum information primitive",
      kicker: "Information",
      blocks: [
        {
          type: "lead",
          text: "In dual-rail encoding a photon in one of two modes is a qubit. The Mach–Zehnder is then a sequence of single-qubit rotations, and its output probability is a phase readout."
        },
        {
          type: "p",
          text: "A 50:50 beam splitter acts as a Hadamard-like operation on the two mode amplitudes. A relative phase φ between the arms acts as a phase gate. Recombining the modes converts the phase into a bit-flip probability: P0 = sin²(φ/2). This is the elementary circuit behind phase estimation, where a controlled phase is converted into a measurable population difference."
        },
        {
          type: "p",
          text: "The sensitivity of that readout is set by the slope of P0(φ). Near the half-intensity point the slope is largest, and the uncertainty for N independent photons is limited by shot noise. The Fisher information formalizes the bound."
        },
        {
          type: "eq",
          latex: "\\left|\\frac{\\partial P_0}{\\partial \\varphi}\\right| = 2\\,t_1 t_2 r_1 r_2\\,\\gamma\\,|\\sin\\varphi|, \\qquad \\Delta\\varphi_{\\min} \\approx \\frac{1}{\\sqrt{N F(\\varphi)}}",
          note:
            "F(φ) = (∂P0/∂φ)²/[P0(1−P0)] for ideal single-photon counting. For a balanced interferometer at the half-intensity point, F = 4 and Δφmin ≈ 1/(2√N)."
        },
        {
          type: "p",
          text: "The same topology appears in several protocols. An unbalanced Mach–Zehnder converts a phase modulation into a time-bin modulation and is used in phase-encoded quantum key distribution. A Mach–Zehnder with a removable absorber is the Elitzur–Vaidman bomb tester. A Mach–Zehnder with a polarization marker and a later analyzer is the quantum eraser."
        },
        {
          type: "list",
          items: [
            "Phase estimation: the interferometer maps an unknown phase onto a population that can be measured.",
            "Quantum key distribution: an unbalanced interferometer implements phase/time-bin encoding and detection.",
            "Interaction-free measurement: the bomb tester uses the dark port of a Mach–Zehnder as a presence detector.",
            "Quantum erasure: marking and unmarking the arms controls whether fringes appear in a subensemble."
          ]
        },
        {
          type: "callout",
          tone: "note",
          title: "A Mach–Zehnder is not a universal gate",
          body:
            "With linear optics and no ancilla or measurement, a Mach–Zehnder implements single-qubit rotations, not a deterministic two-qubit gate. Entangling gates require an interaction, ancilla photons and measurement, or a nonlinear medium. The interferometer is a primitive, not a computer."
        }
      ]
    },
    {
      id: "alignment",
      number: "10",
      title: "Alignment and path balancing",
      kicker: "Practice",
      blocks: [
        {
          type: "lead",
          text: "The interferometer works only when the two beams are the same size, the same polarization and the same position at BS2. Alignment is the experiment."
        },
        {
          type: "p",
          text: "Set the beam height with the laser, an iris and a ruled target before placing any optics. Keep every component at the same height and square to the table. Walk the beam with the first mirror, then with the second, using the standard far-field technique: adjust the near-field position and the far-field direction iteratively until the beam passes through two irises separated by as much distance as the table allows."
        },
        {
          type: "steps",
          items: [
            {
              title: "Define the reference axis",
              body:
                "Place two irises at the laser height, separated by at least half the table. Adjust the laser or the first steering mirror until the beam passes through both. Do not move the laser after this step."
            },
            {
              title: "Install BS1",
              body:
                "Place BS1 at 45° so that the reflected beam is perpendicular to the input and the transmitted beam continues along the reference axis. Check that both beams are at the same height."
            },
            {
              title: "Build path A",
              body:
                "Place mirror M1 in the reflected arm and steer the beam to the centre of BS2's input face. Use a white card or an iris at BS2 to mark the target position."
            },
            {
              title: "Build path B",
              body:
                "Place mirror M2 in the transmitted arm and steer the beam to the same point at BS2. Both beams must arrive at the same height and angle."
            },
            {
              title: "Overlap the outputs",
              body:
                "Observe the two output beams on a screen several metres away. Adjust the last mirror of each arm until the two spots merge into one. Near-field and far-field overlap must be achieved together."
            }
          ]
        },
        {
          type: "p",
          text: "A useful diagnostic is to block one arm at a time. Each output should show a single spot of roughly the same size and position. If the spots are displaced, the beams are not collinear; if they differ in size, the wavefront curvature or beam divergence is mismatched. Only when the spots coincide should you expect high-visibility interference."
        },
        {
          type: "callout",
          tone: "caution",
          title: "Laser safety during alignment",
          body:
            "Keep the beam below eye level, block stray reflections with beam blocks and wear wavelength-appropriate eyewear. Remove watches and reflective jewellery. Never look into the beam or use a phone camera as an alignment aid. Lower the power or use an alignment target whenever possible."
        },
        {
          type: "p",
          text: "Path balancing means making the two optical path lengths equal to within the source coherence length. With a He–Ne laser this is usually satisfied over a table-top layout, but it is still worth using the translation stage to find the position of maximum visibility. With a short-coherence source the same procedure becomes essential: the fringe envelope is narrow and the stage must be scanned until fringes appear."
        },
        {
          type: "callout",
          tone: "lab",
          title: "Record the sign convention",
          body:
            "Write down which direction of stage travel increases the optical path of each arm. Without that record, a phase scan cannot be converted into a signed path difference, and the fitted phase offset is ambiguous."
        }
      ]
    },
    {
      id: "visibility",
      number: "11",
      title: "Visibility, imbalance and coherence",
      kicker: "Quantitative",
      blocks: [
        {
          type: "lead",
          text: "Visibility is the normalized depth of the fringe. It separates a good interference measurement from a pair of beams that merely overlap."
        },
        {
          type: "eq",
          latex: "V = \\frac{I_{\\max} - I_{\\min}}{I_{\\max} + I_{\\min}}",
          note:
            "I_max and I_min are measured over a full phase scan at the monitored port. V = 1 for perfect constructive and destructive cancellation, V = 0 for no interference."
        },
        {
          type: "p",
          text: "Three effects reduce visibility. Unequal beam intensities prevent complete cancellation; partial coherence reduces the correlation between the two fields; and spatial or polarization mismatch means that only part of the field interferes. The first is described by the splitting ratios, the second by the coherence factor γ, and the third by a mode-overlap integral that the ideal model sets to one."
        },
        {
          type: "eq",
          latex: "V = \\frac{2\\gamma\\sqrt{\\eta_1\\eta_2(1-\\eta_1)(1-\\eta_2)}}{\\eta_1\\eta_2 + (1-\\eta_1)(1-\\eta_2)}",
          note:
            "Fringe visibility of port D0 for beam splitters with power reflectivities η1 and η2 and coherence γ. For η1 = η2 = 0.5 it reduces to V = γ."
        },
        {
          type: "derivation",
          derivationId: "unequal-visibility"
        },
        {
          type: "p",
          text: "The numerator contains the product of all four amplitude coefficients; the denominator is the sum of the two non-interfering background terms. The formula shows that a splitting imbalance reduces visibility only weakly near 50:50 and strongly as either splitter approaches 0% or 100%. It also shows why a balanced instrument is the natural starting point for a quantitative measurement."
        },
        {
          type: "table",
          caption: "Predicted visibility of port D0 with η1 = 0.5, γ = 1.",
          head: ["BS2 reflectivity η2", "Visibility V", "Comment"],
          rows: [
            ["50%", "1.000", "Balanced; complete cancellation"],
            ["60%", "0.980", "Slight imbalance; 2% visibility loss"],
            ["70%", "0.917", "Clearly unequal amplitudes"],
            ["80%", "0.800", "Strong imbalance"]
          ],
          align: ["r", "r", "l"]
        },
        {
          type: "numeric",
          title: "Visibility with unequal splitters",
          statement: "BS1 is 50:50 and BS2 is 70:30 (η2 = 0.70); the source is coherent.",
          latex: "V = \\frac{2\\sqrt{0.5 \\times 0.7 \\times 0.5 \\times 0.3}}{0.35 + 0.15} = 0.917",
          result: "The fringe depth is 91.7%, not 100%. About 8% of the visibility is lost purely to the splitting imbalance."
        },
        {
          type: "p",
          text: "With unequal beam splitters the two output ports do not have the same mean power. The visibility defined at D0 and the visibility defined at D1 are therefore slightly different. Always state which port was monitored and use the corresponding formula. The total power over both ports is still conserved."
        },
        {
          type: "callout",
          tone: "note",
          title: "Visibility is not coherence",
          body:
            "A measured visibility includes splitting imbalance, mode mismatch and detector nonlinearity as well as the degree of coherence. To extract γ, equalize the beam powers at the detectors, verify spatial overlap, stay in the linear detector range, and then apply the unequal-splitting correction."
        }
      ]
    },
    {
      id: "classical-vs-single-photon",
      number: "12",
      title: "Classical wave versus single-photon interpretation",
      kicker: "Interpretation",
      blocks: [
        {
          type: "lead",
          text: "The mathematics is the same; the ontology is not. A coherent field and a single photon obey the same beam-splitter algebra, but they are different physical states and require different evidence."
        },
        {
          type: "table",
          caption: "What changes and what does not when the source is changed.",
          head: ["Question", "Coherent laser field (this kit)", "Ideal single photon"],
          rows: [
            ["State entering BS1", "Coherent state with Poissonian photon number", "One-photon Fock state in one mode"],
            ["What the detector records", "Mean power; many photons per integration", "One click per photon; no half-click"],
            ["Output statistics", "Poissonian intensity noise", "Bernoulli outcomes with probabilities p0, p1"],
            ["Fringe visibility", "Set by coherence and alignment", "Set by indistinguishability of the two routes"],
            ["Same P0(φ)?", "Yes, for an ideal coherent field", "Yes"],
            ["What proves quantumness", "Nothing by itself", "Antibunching, g²(0) < 1, with a true single-photon source"]
          ]
        },
        {
          type: "p",
          text: "The beam-splitter matrix acts on mode amplitudes. In the classical description those amplitudes are numbers describing a field; in the quantum description they are operators acting on a Fock space. The predicted mean intensities are identical because the algebra is linear. This is why a laser interferometer is an excellent test of the mathematics of superposition even though it is not a single-photon experiment."
        },
        {
          type: "p",
          text: "What changes is the fluctuation statistics and the kind of evidence required. A coherent state has a Poissonian photon-number distribution and gives a shot-noise-limited signal. A one-photon state produces a single detection event and no possibility of a second simultaneous click in the same mode. A photodiode cannot see this difference; a SPAD with a Hanbury Brown–Twiss set-up can, through the second-order correlation function."
        },
        {
          type: "callout",
          tone: "misconception",
          title: "Attenuation is not a single-photon source",
          body:
            "Attenuating a laser until clicks are rare does not create a one-photon state. The state remains a coherent state with a small mean photon number, and its photon statistics remain Poissonian. A weak coherent pulse sometimes contains two photons; a true single-photon source does not."
        },
        {
          type: "p",
          text: "The definitive signature is antibunching: for a true single-photon source the second-order correlation at zero delay satisfies g²(0) < 1, ideally g²(0) ≈ 0. Grangier and co-workers demonstrated this anticorrelation at a beam splitter in 1986. A Mach–Zehnder fringe, however clean, does not establish it."
        },
        {
          type: "callout",
          tone: "lab",
          title: "What this kit can claim",
          body:
            "It can claim a quantitative demonstration of unitary beam-splitter algebra, two-path interference, phase-to-intensity conversion, complementary outputs, visibility versus splitting ratio and phase estimation with a coherent source. It cannot claim single-photon generation, single-photon detection, antibunching or a loophole-free test of complementarity."
        },
        {
          type: "p",
          text: "The simulator deliberately keeps both descriptions side by side. The classical-field and single-photon modes produce the same probabilities because the model is the same; the text explains that the difference lies in the state and the detection record, not in the interference law. This is the honest boundary of a classical-demonstration kit."
        }
      ]
    }
  ],
  equations: [
    {
      id: "bs-matrix",
      latex: "B(\\eta) = \\begin{pmatrix} t & i r \\\\ i r & t \\end{pmatrix}, \\qquad t=\\sqrt{1-\\eta},\\; r=\\sqrt{\\eta}",
      name: "Symmetric beam-splitter matrix",
      symbols: [
        { symbol: "\\eta", meaning: "power reflectivity of the splitter (0 to 1)" },
        { symbol: "t", meaning: "amplitude transmission coefficient" },
        { symbol: "r", meaning: "amplitude reflection coefficient" },
        { symbol: "i", meaning: "imaginary unit; reflection carries a 90° phase shift" }
      ],
      interpretation:
        "A lossless two-port beam splitter maps the two input mode amplitudes to the two output mode amplitudes. The same matrix applies to a classical field and to a single-photon mode.",
      assumptions: ["Lossless", "Symmetric and reciprocal", "Single polarization", "Paraxial, single spatial mode"],
      usedIn: ["Complex amplitude propagation", "Mach–Zehnder output probabilities", "Unitarity derivation"],
      numericExample: {
        statement: "For a 50:50 splitter, t = r = 1/√2 ≈ 0.707.",
        latex: "B(0.5) = \\frac{1}{\\sqrt{2}}\\begin{pmatrix}1 & i \\\\ i & 1\\end{pmatrix}"
      }
    },
    {
      id: "mz-amplitudes",
      latex: "a_0 = t_1 t_2 e^{i\\varphi_B} - r_1 r_2 e^{i\\varphi_A}, \\qquad a_1 = i\\left(r_1 t_2 e^{i\\varphi_A} + t_1 r_2 e^{i\\varphi_B}\\right)",
      name: "Output amplitudes of the Mach–Zehnder",
      symbols: [
        { symbol: "a_0", meaning: "complex amplitude at the nominally dark output D0" },
        { symbol: "a_1", meaning: "complex amplitude at the nominally bright output D1" },
        { symbol: "t_1, r_1", meaning: "amplitude coefficients of BS1" },
        { symbol: "t_2, r_2", meaning: "amplitude coefficients of BS2" },
        { symbol: "\\varphi_A", meaning: "phase accumulated on path A, the reflected arm", unit: "rad" },
        { symbol: "\\varphi_B", meaning: "phase accumulated on path B, the transmitted arm", unit: "rad" }
      ],
      interpretation:
        "Each output is the sum of two route amplitudes. The minus sign in a0 is the physical origin of the dark port: the two contributions can cancel.",
      assumptions: ["Ideal lossless splitters", "Perfect spatial and polarization overlap", "One spatial mode per arm"],
      usedIn: ["Output probabilities", "Dark-port condition", "Photon counting"]
    },
    {
      id: "balanced-probabilities",
      latex: "P_0 = \\sin^2\\!\\left(\\frac{\\Delta\\varphi}{2}\\right), \\qquad P_1 = \\cos^2\\!\\left(\\frac{\\Delta\\varphi}{2}\\right)",
      name: "Balanced Mach–Zehnder output probabilities",
      symbols: [
        { symbol: "P_0", meaning: "probability of a detection at D0" },
        { symbol: "P_1", meaning: "probability of a detection at D1" },
        { symbol: "\\Delta\\varphi", meaning: "relative phase between the two arms", unit: "rad" }
      ],
      interpretation:
        "The two outputs are complementary. At Δφ = 0 all light leaves D1 and D0 is dark; at Δφ = π the roles reverse. The oscillation period is 2π in phase, one optical wavelength in path difference.",
      assumptions: ["BS1 and BS2 both 50:50", "Lossless", "Perfect mode overlap", "Coherent source"],
      usedIn: ["Phase scan", "Visibility measurement", "Phase estimation"],
      numericExample: {
        statement: "At Δφ = π/2 both outputs are equally bright.",
        latex: "P_0 = \\sin^2(\\pi/4) = 0.5, \\qquad P_1 = 0.5"
      }
    },
    {
      id: "visibility-definition",
      latex: "V = \\frac{I_{\\max} - I_{\\min}}{I_{\\max} + I_{\\min}}",
      name: "Fringe visibility",
      symbols: [
        { symbol: "V", meaning: "fringe visibility (0 to 1)" },
        { symbol: "I_{\\max}", meaning: "maximum intensity over a full phase scan", unit: "W m^{-2}" },
        { symbol: "I_{\\min}", meaning: "minimum intensity over a full phase scan", unit: "W m^{-2}" }
      ],
      interpretation:
        "Visibility is the normalized fringe depth. It is 1 when the minimum is exactly zero and 0 when there is no phase dependence.",
      assumptions: ["A full phase scan", "Detector response linear over the recorded range", "Stable alignment during the scan"],
      usedIn: ["Observation template 1", "Analysis task 1", "Coherence studies"]
    },
    {
      id: "phase-from-opd",
      latex: "\\Delta\\varphi = \\frac{2\\pi}{\\lambda}\\,\\left(n_A L_A - n_B L_B\\right) = \\frac{2\\pi\\,\\Delta L_{\\mathrm{opt}}}{\\lambda}",
      name: "Phase difference from optical path difference",
      symbols: [
        { symbol: "\\Delta\\varphi", meaning: "relative phase", unit: "rad" },
        { symbol: "\\lambda", meaning: "vacuum wavelength", unit: "m" },
        { symbol: "n_A, n_B", meaning: "refractive indices of the two arms" },
        { symbol: "L_A, L_B", meaning: "geometric arm lengths", unit: "m" },
        { symbol: "\\Delta L_{\\mathrm{opt}}", meaning: "optical path difference", unit: "m" }
      ],
      interpretation:
        "The Mach–Zehnder is a single-pass device: each arm contributes nL once. One wavelength of optical path difference corresponds to 2π of phase.",
      assumptions: ["Monochromatic or quasi-monochromatic light", "Dispersion negligible over the source bandwidth", "One transverse mode"],
      usedIn: ["Translation-stage calibration", "Phase scan", "OPD mapping in the simulator"],
      numericExample: {
        statement: "At 632.8 nm, ΔLopt = 316.4 nm gives Δφ = π.",
        latex: "\\Delta\\varphi = \\frac{2\\pi \\times 316.4}{632.8} = \\pi"
      }
    },
    {
      id: "unitarity",
      latex: "B^{\\dagger}B = B B^{\\dagger} = \\mathbb{1}",
      name: "Unitarity of the beam splitter",
      symbols: [
        { symbol: "B", meaning: "2×2 beam-splitter matrix" },
        { symbol: "B^{\\dagger}", meaning: "conjugate transpose of B" },
        { symbol: "\\mathbb{1}", meaning: "2×2 identity matrix" }
      ],
      interpretation:
        "Unitarity guarantees that the total probability leaving the two output ports equals the probability entering. For a single photon it is conservation of probability; for a classical field it is conservation of energy.",
      assumptions: ["Lossless splitter", "No absorption or scattering", "Both output ports included"],
      usedIn: ["Probability conservation tests", "Beam-splitter derivation"]
    },
    {
      id: "fringe-condition",
      latex: "\\Delta L_{\\mathrm{opt}} = m\\lambda \\;\\Rightarrow\\; P_1 = 1, \\qquad \\Delta L_{\\mathrm{opt}} = \\left(m+\\tfrac12\\right)\\lambda \\;\\Rightarrow\\; P_0 = 1",
      name: "Bright and dark conditions",
      symbols: [
        { symbol: "m", meaning: "integer fringe order" },
        { symbol: "\\lambda", meaning: "wavelength", unit: "m" },
        { symbol: "P_0, P_1", meaning: "output probabilities" }
      ],
      interpretation:
        "Constructive interference at D1 occurs at integer wavelengths of path difference; constructive interference at D0 occurs at half-integer wavelengths. The pattern repeats every λ.",
      assumptions: ["Balanced 50:50 splitters", "Lossless", "Perfect overlap"],
      usedIn: ["Path balancing", "Fringe counting"]
    },
    {
      id: "distinguishability-relation",
      latex: "D^2 + V^2 \\le 1",
      name: "Distinguishability–visibility relation",
      symbols: [
        { symbol: "D", meaning: "distinguishability of the two paths (0 to 1)" },
        { symbol: "V", meaning: "fringe visibility (0 to 1)" }
      ],
      interpretation:
        "The more information exists about which path was taken, the less visible the interference. Equality holds for an ideal pure two-path state; real mixed states lie below the bound.",
      assumptions: ["Two interfering alternatives", "A marker or environment that can store path information", "Ideal detectors otherwise"],
      usedIn: ["Which-path discussion", "Quantum eraser", "Bomb tester"],
      numericExample: {
        statement: "If V = 0.6, the maximum distinguishability is 0.8.",
        latex: "D_{\\max} = \\sqrt{1 - 0.6^2} = 0.8"
      }
    },
    {
      id: "detection-probability",
      latex: "p_k^{\\mathrm{det}} = \\eta_{\\mathrm{det}}\\,\\mathrm{Tr}(\\rho\\,\\Pi_k), \\qquad N_k \\sim \\mathrm{Binomial}(N, p_k)",
      name: "Detection probability and counting statistics",
      symbols: [
        { symbol: "p_k^{\\mathrm{det}}", meaning: "probability that detector k registers a photon" },
        { symbol: "\\eta_{\\mathrm{det}}", meaning: "detection efficiency (0 to 1)" },
        { symbol: "\\rho", meaning: "density operator of the field state" },
        { symbol: "\\Pi_k", meaning: "projector onto the mode reaching detector k" },
        { symbol: "N_k", meaning: "number of counts at detector k" },
        { symbol: "N", meaning: "number of independent photons sent" }
      ],
      interpretation:
        "For one photon the Born rule gives the click probability. For N independent photons the counts are binomial around N p_k, so the fractional uncertainty falls as 1/√N.",
      assumptions: ["Independent photons", "Constant detection efficiency", "No dark counts or dead time", "Ideal mode matching"],
      usedIn: ["Photon-counting mode", "Error analysis", "Phase sensitivity"],
      numericExample: {
        statement: "N = 1000 photons with p0 = 0.25 give 250 ± 14 counts (one standard deviation).",
        latex: "\\sigma = \\sqrt{N p_0(1-p_0)} = \\sqrt{1000 \\times 0.25 \\times 0.75} = 13.7"
      }
    },
    {
      id: "phase-sensitivity",
      latex: "\\left|\\frac{\\partial P_0}{\\partial \\varphi}\\right| = 2\\,t_1 t_2 r_1 r_2\\,\\gamma\\,|\\sin\\varphi|, \\qquad \\Delta\\varphi_{\\min} \\approx \\frac{1}{\\sqrt{N F(\\varphi)}}",
      name: "Phase sensitivity and Fisher information",
      symbols: [
        { symbol: "F(\\varphi)", meaning: "Fisher information per photon", unit: "rad^{-2}" },
        { symbol: "N", meaning: "number of detected photons" },
        { symbol: "\\gamma", meaning: "degree of coherence (0 to 1)" },
        { symbol: "\\Delta\\varphi_{\\min}", meaning: "minimum phase uncertainty", unit: "rad" }
      ],
      interpretation:
        "The slope of the output probability converts a phase change into a count change. The Fisher information gives the best achievable uncertainty for ideal counting; a balanced interferometer at the half-intensity point has F = 4.",
      assumptions: ["Ideal photon counting", "Known loss and visibility", "Small phase deviation around the operating point", "No technical noise"],
      usedIn: ["Phase-estimation discussion", "Uncertainty budget", "Interferometric sensing"],
      numericExample: {
        statement: "For a balanced instrument with N = 10 000 photons at the optimal bias, Δφmin ≈ 1/(2√N) = 0.005 rad.",
        latex: "\\Delta\\varphi_{\\min} \\approx \\frac{1}{2\\sqrt{10^4}} = 0.005\\ \\mathrm{rad}"
      }
    },
    {
      id: "general-probabilities",
      latex: "P_0 = (1-\\eta_1)(1-\\eta_2) + \\eta_1\\eta_2 - 2\\gamma\\sqrt{\\eta_1\\eta_2(1-\\eta_1)(1-\\eta_2)}\\cos\\Delta\\varphi",
      name: "Output probability for arbitrary splitting",
      symbols: [
        { symbol: "\\eta_1, \\eta_2", meaning: "power reflectivities of BS1 and BS2" },
        { symbol: "\\gamma", meaning: "degree of coherence" },
        { symbol: "\\Delta\\varphi", meaning: "relative phase", unit: "rad" }
      ],
      interpretation:
        "The first two terms are the non-interfering background; the cosine term is the interference. P1 = 1 − P0 while both arms are open. Setting η1 = η2 = 0.5 recovers P0 = sin²(Δφ/2).",
      assumptions: ["Lossless splitters", "Perfect mode overlap", "γ constant over the scan"],
      usedIn: ["Visibility derivation", "Independent mode", "Blocking comparison"]
    },
    {
      id: "visibility-unequal",
      latex: "V = \\frac{2\\gamma\\sqrt{\\eta_1\\eta_2(1-\\eta_1)(1-\\eta_2)}}{\\eta_1\\eta_2 + (1-\\eta_1)(1-\\eta_2)}",
      name: "Visibility for unequal splitting",
      symbols: [
        { symbol: "V", meaning: "fringe visibility at port D0" },
        { symbol: "\\eta_1, \\eta_2", meaning: "power reflectivities of BS1 and BS2" },
        { symbol: "\\gamma", meaning: "degree of coherence" }
      ],
      interpretation:
        "The visibility is the ratio of the interference amplitude to the mean background. A splitting imbalance reduces it; perfect balance and coherence give V = 1.",
      assumptions: ["Ideal lossless splitters", "Perfect spatial and polarization overlap", "No detector nonlinearity"],
      usedIn: ["Observation template 2", "Analysis task 2"]
    }
  ],
  derivations: [
    {
      id: "bs-unitarity",
      title: "Unitarity of the beam-splitter matrix",
      intro:
        "Show that the symmetric matrix B(η) satisfies B†B = 1 when t² + r² = 1. This is the algebraic statement that a lossless beam splitter conserves probability.",
      steps: [
        {
          label: "Write the matrix",
          text: "Let t and r be real amplitude coefficients and let the reflected wave carry the factor i.",
          latex: "B = \\begin{pmatrix} t & i r \\\\ i r & t \\end{pmatrix}"
        },
        {
          label: "Take the conjugate transpose",
          text: "Transpose and complex-conjugate every element. Since t and r are real, only the sign of each i changes.",
          latex: "B^{\\dagger} = \\begin{pmatrix} t & -i r \\\\ -i r & t \\end{pmatrix}"
        },
        {
          label: "Multiply",
          text: "Compute the four entries of B†B.",
          latex: "B^{\\dagger}B = \\begin{pmatrix} t^2 + r^2 & i t r - i t r \\\\ i t r - i t r & r^2 + t^2 \\end{pmatrix}"
        },
        {
          label: "Use losslessness",
          text: "The power coefficients satisfy t² = 1 − η and r² = η, hence t² + r² = 1. The off-diagonal terms cancel exactly.",
          latex: "t^2 + r^2 = (1-\\eta) + \\eta = 1"
        },
        {
          label: "Conclude",
          text: "The product is the identity, so B is unitary. The same argument with the order reversed gives BB† = 1.",
          latex: "B^{\\dagger}B = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix} = \\mathbb{1}"
        }
      ],
      result: {
        latex: "B^{\\dagger}B = \\mathbb{1}",
        text:
          "A lossless beam splitter is unitary. Probability (or energy) is conserved when both output ports are included, and the inverse transformation is B†."
      },
      assumptions: ["t and r are real", "The splitter is lossless", "Both output ports are retained", "One polarization and one spatial mode"]
    },
    {
      id: "balanced-mz",
      title: "Output probabilities of a balanced Mach–Zehnder",
      intro:
        "Propagate a unit input amplitude through two 50:50 splitters with a relative phase φ and show that P0 = sin²(φ/2).",
      steps: [
        {
          label: "Input and first splitter",
          text: "A unit amplitude enters BS1. Path A is the reflected arm and path B the transmitted arm, so aA = i/√2 and aB = 1/√2.",
          latex: "a_A = \\frac{i}{\\sqrt{2}}, \\qquad a_B = \\frac{1}{\\sqrt{2}}"
        },
        {
          label: "Accumulate the relative phase",
          text: "Put the adjustable phase on path B. A global phase would not matter; only the difference does.",
          latex: "a_A = \\frac{i}{\\sqrt{2}}, \\qquad a_B = \\frac{1}{\\sqrt{2}}e^{i\\varphi}"
        },
        {
          label: "Recombine at BS2",
          text: "At the second splitter D0 receives the reflection of path A and the transmission of path B; D1 receives the transmission of A and the reflection of B.",
          latex: "a_0 = i r_2 a_A + t_2 a_B, \\qquad a_1 = t_2 a_A + i r_2 a_B"
        },
        {
          label: "Evaluate the amplitudes",
          text: "Substitute aA and aB with t2 = r2 = 1/√2 and simplify using i² = −1.",
          latex: "a_0 = \\frac{1}{2}\\left(e^{i\\varphi} - 1\\right), \\qquad a_1 = \\frac{i}{2}\\left(e^{i\\varphi} + 1\\right)"
        },
        {
          label: "Take the squared moduli",
          text: "Use |e^{iφ} − 1|² = 2 − 2cosφ = 4sin²(φ/2) and |e^{iφ} + 1|² = 2 + 2cosφ = 4cos²(φ/2).",
          latex: "P_0 = |a_0|^2 = \\frac{1}{4}\\left(2 - 2\\cos\\varphi\\right) = \\sin^2\\frac{\\varphi}{2}"
        }
      ],
      result: {
        latex: "P_0 = \\sin^2\\frac{\\varphi}{2}, \\qquad P_1 = \\cos^2\\frac{\\varphi}{2}",
        text:
          "The outputs are complementary and sum to one. At φ = 0 all light leaves D1; at φ = π all light leaves D0. The fringe period is 2π in phase, or one wavelength in optical path difference."
      },
      assumptions: ["Both splitters are 50:50", "Lossless", "Perfect spatial and polarization overlap", "A single spatial mode"]
    },
    {
      id: "unequal-visibility",
      title: "Visibility with unequal splitting",
      intro:
        "Derive the fringe visibility at port D0 when the two beam splitters have different power reflectivities and the field has coherence γ.",
      steps: [
        {
          label: "Start from the general probability",
          text: "Write the output probability in terms of the four amplitude coefficients and the coherence factor.",
          latex: "P_0 = t_1^2 t_2^2 + r_1^2 r_2^2 - 2\\gamma t_1 t_2 r_1 r_2\\cos\\Delta\\varphi"
        },
        {
          label: "Collect the background and interference terms",
          text: "Define positive amplitudes a = t1t2 and b = r1r2. The probability has the form of a constant minus a cosine.",
          latex: "P_0 = a^2 + b^2 - 2\\gamma a b\\cos\\Delta\\varphi"
        },
        {
          label: "Identify the extrema",
          text: "The maximum occurs at cosΔφ = −1 and the minimum at cosΔφ = +1.",
          latex: "I_{\\max} = a^2 + b^2 + 2\\gamma a b, \\qquad I_{\\min} = a^2 + b^2 - 2\\gamma a b"
        },
        {
          label: "Apply the visibility definition",
          text: "Subtract and add the extrema.",
          latex: "V = \\frac{I_{\\max}-I_{\\min}}{I_{\\max}+I_{\\min}} = \\frac{4\\gamma a b}{2(a^2+b^2)} = \\frac{2\\gamma a b}{a^2+b^2}"
        },
        {
          label: "Substitute the reflectivities",
          text: "Use a² = (1−η1)(1−η2) and b² = η1η2.",
          latex: "V = \\frac{2\\gamma\\sqrt{\\eta_1\\eta_2(1-\\eta_1)(1-\\eta_2)}}{\\eta_1\\eta_2 + (1-\\eta_1)(1-\\eta_2)}"
        }
      ],
      result: {
        latex: "V = \\frac{2\\gamma\\sqrt{\\eta_1\\eta_2(1-\\eta_1)(1-\\eta_2)}}{\\eta_1\\eta_2 + (1-\\eta_1)(1-\\eta_2)}",
        text:
          "For η1 = η2 = 0.5 this reduces to V = γ. With η1 = 0.5 and η2 = 0.7 it gives V = 0.917. The visibility of the other port differs when η1 ≠ η2, so the monitored port must be stated."
      },
      assumptions: ["Lossless splitters", "Perfect spatial and polarization overlap", "γ constant over the scan", "No detector nonlinearity"]
    }
  ],
  simulation: {
    model:
      "Scalar monochromatic fields at 632.8 nm are propagated through two ideal unitary 2×2 beam-splitter matrices. Path A (reflected) carries phase 0 and path B (transmitted) carries the adjustable phase φ. A coherence factor γ multiplies the interference term; blocking an arm removes its amplitude. Output probabilities are P0 and P1, normalised to one when both arms are open. The photon counter draws independent Bernoulli trials with the computed probabilities using a seeded mulberry32 generator.",
    approximations: [
      "Paraxial, scalar and monochromatic light at 632.8 nm",
      "Ideal lossless beam splitters with a single power reflectivity",
      "Perfect spatial-mode overlap and parallel polarizations",
      "Phenomenological coherence factor γ applied only to the interference term",
      "Ideal detectors: no dark counts, dead time or afterpulsing",
      "No dynamic vibration, thermal drift or air-turbulence model"
    ],
    validity: [
      "Beam-splitter reflectivities between 20% and 80%",
      "Coherence factor between 0 and 1",
      "Arbitrary relative phase, including phase generated by a path difference",
      "A single transverse mode per arm",
      "Photon counts interpreted as independent trials"
    ],
    exclusions: [
      "No genuine single-photon source, heralding or coincidence detection",
      "No detector efficiency, dark counts, dead time or afterpulsing",
      "No spatial-mode mismatch, beam walk or multi-mode interference",
      "No thermal, acoustic or air-current dynamics",
      "No claim that counts from the classical kit are photon-counting measurements",
      "No polarizing beam-splitter physics or polarization-dependent splitting"
    ],
    validation: [
      "B(η) is unitary for reflectivities from 0.2 to 0.8",
      "P0 + P1 = 1 for all phases when both arms are open",
      "A balanced interferometer has P0 = 0 and P1 = 1 at φ = 0",
      "P0 follows sin²(φ/2) over a full scan",
      "Visibility equals 1 for a balanced coherent instrument and follows the unequal-splitting formula otherwise",
      "Seeded photon counts reproduce exactly and their total equals the number sent"
    ],
    stochastic:
      "Photon counts use mulberry32 seeded by the seed field. Each photon is one Bernoulli trial with probability p0 for D0, then p1 for D1, otherwise lost. The same seed reproduces the same run. All counts are labelled SIMULATED; they are not measurements."
  },
  procedure: [
    {
      id: "safety",
      title: "Safety and beam control",
      purpose:
        "Establish a safe optical layout before any beam reaches an optic or a detector.",
      steps: [
        {
          title: "Read the laser label",
          detail:
            "Record the laser class, wavelength and maximum output power from the label. Confirm that the eyewear in the room is rated for 632.8 nm and that everyone present understands the beam path.",
          checkpoint: "The laser class and the eyewear rating are written in the logbook."
        },
        {
          title: "Set the beam below eye level",
          detail:
            "Mount the laser so the beam travels at the planned height, typically 100 mm above the table, and stays below eye level for a seated or standing operator. Remove reflective jewellery and watches.",
          caution: "Never look into the beam or use a camera phone as an alignment screen."
        },
        {
          title: "Place beam blocks before power",
          detail:
            "Put a beam block at the far end of the table and at every unused port before switching on the laser. Keep a spare block in reach at all times.",
          checkpoint: "Every open beam path terminates on a block or a detector."
        },
        {
          title: "Check the electrical set-up",
          detail:
            "Inspect the photodiode amplifier, the translation-stage micrometer and the laser supply for damaged leads. Connect the detector load before applying power and keep liquids away from the table."
        }
      ]
    },
    {
      id: "inventory-beam-height",
      title: "Inventory and beam height",
      purpose:
        "Verify that the kit is complete and establish a common optical axis.",
      steps: [
        {
          title: "Check the packing list",
          detail:
            "Compare the physical items with the packing list and this module's hardware table. Record the model numbers actually present. The kit is marked unverified, so do not assume quantities or thread sizes.",
          checkpoint: "Every item used in the procedure is present and recorded."
        },
        {
          title: "Inspect the optics",
          detail:
            "Check the beam-splitter cubes and mirrors for chips, fingerprints and delamination. Hold optics by their mounts, never by the coated faces. Clean only with the approved method in the kit guide.",
          caution: "Do not use abrasive tissue or acetone on cemented cube assemblies."
        },
        {
          title: "Define the reference axis",
          detail:
            "Place two irises at the chosen beam height, separated by at least half the table. Adjust the laser or the first steering optic until the beam passes through both irises.",
          checkpoint: "The beam passes through both irises without touching the edges."
        },
        {
          title: "Mark the layout",
          detail:
            "Use tape or a sketch to record the positions of the laser, BS1, the mirrors, BS2 and the detectors. A reproducible layout is worth more than a perfect first alignment."
        }
      ]
    },
    {
      id: "bs1-mirrors",
      title: "BS1 and mirror alignment",
      purpose:
        "Create the two arms and route both beams to the second beam-splitter position.",
      steps: [
        {
          title: "Install BS1",
          detail:
            "Place BS1 at 45° to the input so the reflected beam is perpendicular to the transmitted beam. Both beams must remain at the reference height.",
          checkpoint: "Both BS1 outputs are at the same height as the input beam."
        },
        {
          title: "Route path A",
          detail:
            "Place mirror M1 in the reflected arm and steer the beam to the centre of the future BS2 position. Use a white card or an iris as a target.",
          caution: "Keep the beam inside the table footprint; do not let it leave the optical surface."
        },
        {
          title: "Route path B",
          detail:
            "Place mirror M2 in the transmitted arm and steer the beam to the same target point. The two arms should have roughly equal lengths and no unnecessary folds.",
          checkpoint: "Both beams hit the same marked point at BS2 within a millimetre."
        },
        {
          title: "Verify each arm separately",
          detail:
            "Block one arm at a time and inspect the output spots on a distant screen. Each arm should produce a single round spot at the same height and position.",
          checkpoint: "Each arm alone gives one spot; neither arm is clipped by a mount."
        }
      ]
    },
    {
      id: "bs2-recombination",
      title: "BS2 recombination",
      purpose:
        "Overlap the two arms in the near field and the far field so that they can interfere.",
      steps: [
        {
          title: "Install BS2",
          detail:
            "Place BS2 at the marked recombination point at 45° to both incoming beams. Confirm that the two outputs leave in the expected directions and are not clipped.",
          checkpoint: "Two output beams are visible and unobstructed."
        },
        {
          title: "Overlap in the far field",
          detail:
            "Put a screen several metres away and adjust M1 and M2 until the two spots merge into one. Then check the near field at BS2 and repeat the adjustment iteratively.",
          checkpoint: "A single overlapping spot is seen both near BS2 and far away."
        },
        {
          title: "Check the polarization",
          detail:
            "If a polarizer is available, verify that the two arms have the same polarization. A cube that splits polarization will otherwise reduce the fringe contrast and may produce two displaced spots.",
          caution: "Do not force a cube to rotate against its mount; loosen the clamp first."
        },
        {
          title: "Look for fringes",
          detail:
            "While watching one output on the screen, gently move the translation stage by a few micrometres. A stable set of fringes should appear when the path difference is scanned.",
          checkpoint: "Fringes are visible and persist for at least ten seconds without touching the table."
        }
      ]
    },
    {
      id: "balancing-scan",
      title: "Path balancing, fringe optimisation and quantitative phase scan",
      purpose:
        "Maximise the visibility, then record output power as a function of phase and extract the fringe parameters.",
      steps: [
        {
          title: "Find the dark setting",
          detail:
            "Adjust the translation stage until one output is as dark as possible. Record both detector voltages and the stage reading. This is the φ = 0 reference for the balanced instrument.",
          checkpoint: "The dark port is at least ten times weaker than the bright port."
        },
        {
          title: "Record the residual background",
          detail:
            "Block the input and record the detector zero levels. Unblock and check that the bright-port power is within the linear range of the amplifier.",
          caution: "If the signal saturates, reduce the optical power or the transimpedance gain before continuing."
        },
        {
          title: "Scan the phase",
          detail:
            "Advance the stage in equal steps through at least one full fringe. At each step record the stage reading and both detector voltages. Use at least 20 points per fringe and repeat the scan in the reverse direction.",
          checkpoint: "The forward and reverse scans overlap within the noise."
        },
        {
          title: "Compute the visibility",
          detail:
            "Fit or read off I_max and I_min at the monitored port and calculate V = (Imax − Imin)/(Imax + Imin). Record which port was monitored and the measured splitting ratios.",
          checkpoint: "The fitted period agrees with the expected 632.8 nm per fringe within the stage calibration."
        },
        {
          title: "Test the splitting dependence",
          detail:
            "If a second splitting ratio is available, repeat the scan and compare with the unequal-splitting formula. If the kit contains only fixed 50:50 cubes, perform this comparison in the simulator and state that it is a model result.",
          caution: "Do not present a simulated visibility as a measurement."
        }
      ]
    },
    {
      id: "shutdown",
      title: "Shutdown and records",
      purpose:
        "Leave the apparatus safe and the data traceable.",
      steps: [
        {
          title: "Block the beam",
          detail:
            "Insert the beam block or close the shutter before changing any optic or detector. Wait for the laser to cool only if the manufacturer requires it.",
          checkpoint: "No open beam remains on the table."
        },
        {
          title: "Record the zero levels",
          detail:
            "With the beam blocked, record the detector offsets and the amplifier settings so that the data can be corrected later."
        },
        {
          title: "Power down",
          detail:
            "Switch off the laser, the detector amplifier and the translation-stage controller in the order given in the kit guide. Do not leave a powered laser unattended."
        },
        {
          title: "Protect the optics",
          detail:
            "Cap or cover the beam splitters and mirrors, remove temporary targets and return the hardware to its case. Note any damaged or missing item for the next user.",
          checkpoint: "The inventory is complete and the table is clear."
        },
        {
          title: "Archive the data",
          detail:
            "Save the raw voltages, stage readings, detector settings and a sketch of the layout. Record the seed and the model version for any simulated comparison."
        }
      ]
    }
  ],
  observations: [
    {
      id: "phase-scan",
      title: "Relative phase versus output intensity",
      purpose:
        "Record the complementary outputs of the interferometer while the relative phase is scanned through at least one full fringe.",
      columns: [
        { key: "stage_nm", label: "Stage change", unit: "nm", type: "number" },
        { key: "phase_deg", label: "Relative phase", unit: "°", type: "number" },
        { key: "v0", label: "D0 voltage", unit: "V", type: "number" },
        { key: "v1", label: "D1 voltage", unit: "V", type: "number" },
        { key: "v_sum", label: "D0 + D1", unit: "V", type: "number" },
        { key: "note", label: "Observation", type: "text" }
      ],
      guidance:
        "Take at least 25 rows from 0° to 360° in 15° steps, then repeat in the reverse direction. Record the blocked-beam zero before and after the scan and keep both detector signals inside their linear range. If the stage is calibrated in micrometres, convert to phase with φ = 2π ΔL/λ.",
      formula: "V = (V_max − V_min)/(V_max + V_min);  φ = 2π ΔL_opt/λ"
    },
    {
      id: "splitting-visibility",
      title: "Splitting ratio versus visibility",
      purpose:
        "Test how the beam-splitter splitting ratio limits the achievable fringe visibility at a fixed coherence.",
      columns: [
        { key: "eta1", label: "BS1 reflectivity", unit: "%", type: "number" },
        { key: "eta2", label: "BS2 reflectivity", unit: "%", type: "number" },
        { key: "imax", label: "I_max", unit: "V", type: "number" },
        { key: "imin", label: "I_min", unit: "V", type: "number" },
        { key: "visibility", label: "Measured V", type: "number" },
        { key: "predicted", label: "Predicted V", type: "number" },
        { key: "note", label: "Port and conditions", type: "text" }
      ],
      guidance:
        "Fix BS1 at its measured ratio. For each BS2 ratio available, scan the phase over one full fringe and record I_max and I_min at the monitored port. The physical kit may contain only 50:50 cubes; in that case run the sweep in the simulator, record the values and label them explicitly as simulated. Always state which output port was monitored.",
      formula: "V = 2γ√(η1η2(1−η1)(1−η2)) / [η1η2 + (1−η1)(1−η2)]"
    }
  ],
  analysis: [
    {
      id: "fit-phase-scan",
      title: "Fit the phase scan and extract visibility",
      method:
        "Normalise the D0 signal by the sum of the two detector signals to remove slow laser-power drift, then fit a sinusoid in φ.",
      formula: "P_0(\\varphi) = A + B\\cos(\\varphi + \\varphi_0), \\qquad V = |B|/A",
      steps: [
        "Subtract the blocked-beam zero from each detector voltage.",
        "Convert the stage reading to phase using the known wavelength and the measured stage calibration.",
        "Fit A, B and φ0 by least squares over at least one full fringe.",
        "Compute V = B/A and propagate the uncertainty from the fit residuals.",
        "Compare the fitted period with 2π and the fitted phase offset with the expected dark-port setting."
      ],
      expected:
        "A good 50:50 alignment gives V close to 1 after correction for the measured splitting ratio. The fitted period should agree with 632.8 nm per fringe within the stage calibration uncertainty."
    },
    {
      id: "visibility-versus-splitting",
      title: "Compare visibility with the splitting-ratio formula",
      method:
        "Use the measured reflectivities of both cubes and the fitted visibility at each setting; compare with the unequal-splitting expression.",
      formula: "V_{\\mathrm{pred}} = \\frac{2\\gamma\\sqrt{\\eta_1\\eta_2(1-\\eta_1)(1-\\eta_2)}}{\\eta_1\\eta_2 + (1-\\eta_1)(1-\\eta_2)}",
      steps: [
        "Measure η1 and η2 from the individual beam powers with the other arm blocked.",
        "For each setting, compute the predicted visibility with γ = 1.",
        "Plot measured V against predicted V and fit a straight line through the origin.",
        "Interpret the slope as the effective coherence and mode-overlap factor γ.",
        "Check whether the residuals correlate with the detector power, which would indicate nonlinearity."
      ],
      expected:
        "The slope should be at most 1. A slope well below 1 points to coherence or mode-overlap loss; scatter around the line points to drift or readout noise."
    },
    {
      id: "phase-calibration",
      title: "Calibrate phase against stage displacement",
      method:
        "Use the known He–Ne wavelength to convert stage travel into optical path difference and check the translation-stage calibration.",
      formula: "\\Delta\\varphi = \\frac{2\\pi\\,\\Delta L_{\\mathrm{opt}}}{\\lambda}, \\qquad \\Delta L_{\\mathrm{opt}} = \\Delta x_{\\mathrm{stage}}",
      steps: [
        "Identify the stage direction that increases the optical path of the measured arm.",
        "Record the stage displacement for ten consecutive fringes.",
        "Compute the mean displacement per fringe and compare with λ = 632.8 nm.",
        "Plot the fitted phase against the stage reading and report the slope in degrees per micrometre.",
        "Repeat after twenty minutes to expose thermal drift."
      ],
      expected:
        "One fringe per 632.8 nm of optical path difference. A stage that moves a mirror contributes twice its displacement to the round-trip path in a Michelson but once in a Mach–Zehnder; confirm which geometry you have before applying a factor of two."
    },
    {
      id: "blocked-arm-test",
      title: "Blocked-arm test and the disappearance of interference",
      method:
        "Predict the output powers with one arm blocked, then compare with the measured values and the residual visibility.",
      formula: "P_0^{\\mathrm{block\\,B}} = \\eta_1\\eta_2, \\qquad P_1^{\\mathrm{block\\,B}} = \\eta_1(1-\\eta_2)",
      steps: [
        "Measure the input power and the splitting ratio of BS1.",
        "Block path B and record both output powers.",
        "Compare with η1η2 and η1(1−η2); repeat with path A blocked and compare with (1−η1)(1−η2) and (1−η1)η2.",
        "Scan the phase with the block in place and confirm that the output no longer oscillates.",
        "Compute the residual visibility and compare it with the fraction of stray light that bypasses the block."
      ],
      expected:
        "The total power falls to the fraction transmitted by BS1 on the open arm, and the phase dependence disappears. A small residual oscillation indicates stray light or imperfect blocking, not a quantum eraser."
    }
  ],
  errors: [
    {
      source: "Air currents and temperature gradients",
      type: "random",
      effect:
        "The refractive index of the air paths fluctuates, producing slow phase wander and a washed-out fringe when data are averaged over seconds.",
      mitigation:
        "Enclose the arms, switch off nearby fans and air conditioning, wait for thermal equilibrium and use short scans with frequent reference points."
    },
    {
      source: "Table and mount vibration",
      type: "random",
      effect:
        "Mechanical motion modulates the path difference at acoustic frequencies, broadening the fringe and adding noise to every reading.",
      mitigation:
        "Use a damped table, tighten mounts, keep cables and hands off the table during a scan, and average repeated scans rather than single long exposures."
    },
    {
      source: "Polarization mismatch",
      type: "systematic",
      effect:
        "A non-polarizing cube still has polarization-dependent splitting. Orthogonal components do not interfere and add a constant background, reducing the measured visibility.",
      mitigation:
        "Keep both arms at the same polarization, verify with a polarizer, and avoid stressing the cube mounts. Record the polarization state with the data."
    },
    {
      source: "Beam-splitter imbalance",
      type: "systematic",
      effect:
        "Unequal amplitudes prevent complete cancellation. The dark port never reaches zero and the fitted visibility falls even with a perfectly coherent source.",
      mitigation:
        "Measure both splitting ratios, apply the unequal-splitting formula, and compare like with like. Do not quote an ideal V = 1 as a measured result."
    },
    {
      source: "Detector nonlinearity or saturation",
      type: "systematic",
      effect:
        "The photodiode or transimpedance amplifier compresses the bright peaks, reducing the apparent fringe depth and distorting the fitted phase.",
      mitigation:
        "Verify linearity with a power sweep, use neutral-density attenuation or lower the gain, record the dark level and keep the peak signal well below saturation."
    },
    {
      source: "Path drift and stage hysteresis",
      type: "systematic",
      effect:
        "The phase at a given stage reading changes with time, and a stage scanned forward and backward does not return to the same position, producing an apparent phase offset and a distorted fringe.",
      mitigation:
        "Let the laser and mounts warm up, approach each setting from the same direction, take forward and reverse scans, and reference the phase to a fixed fiducial."
    }
  ],
  applications: [
    {
      title: "Interferometric sensing",
      body:
        "A Mach–Zehnder can place its two arms in different environments, so it responds to a refractive-index change, a temperature change or a displacement in one arm. Integrated versions are used as chemical and biological sensors and as displacement encoders."
    },
    {
      title: "Phase estimation and metrology",
      body:
        "The interferometer converts phase into a measurable population. The same primitive underlies lock-in detection, optical phase-locked loops and the Fisher-information analysis of the best achievable sensitivity with a given number of photons."
    },
    {
      title: "Quantum gates and dual-rail qubits",
      body:
        "In dual-rail encoding a beam splitter is a single-qubit rotation and a phase shifter is a phase gate. Linear-optical quantum circuits are built from networks of these elements, with measurement and ancilla photons supplying the nonlinearity needed for entangling gates."
    },
    {
      title: "Gravitational-wave topology",
      body:
        "Kilometre-scale gravitational-wave detectors use a Michelson topology with Fabry–Pérot arms. The same two-path recombination, balanced detection and phase-to-intensity conversion are central; Mach–Zehnder variants appear in auxiliary sensing and in atom interferometry."
    },
    {
      title: "Integrated photonics",
      body:
        "On-chip Mach–Zehnder interferometers made from waveguides, directional couplers and thermo-optic phase shifters serve as modulators, tunable filters, switches and sensors. Their compactness makes them a workhorse of silicon photonics."
    }
  ],
  questions: [
    {
      id: "mz-q01",
      type: "mcq",
      difficulty: 1,
      topic: "Output ports",
      prompt:
        "A balanced Mach–Zehnder interferometer is set to φ = 0 with the convention used in this module. Where does the light leave?",
      options: [
        "Equally from D0 and D1",
        "Almost all from D1, with D0 dark",
        "Almost all from D0, with D1 dark",
        "It is absorbed inside BS2"
      ],
      answerIndex: 1,
      answer:
        "At φ = 0 the two amplitudes add at D1 and cancel at D0, so P1 = 1 and P0 = 0.",
      explanation:
        "The model gives P0 = sin²(φ/2). At φ = 0 this is zero and the complementary probability P1 = cos²(φ/2) is one.",
      marks: 1
    },
    {
      id: "mz-q02",
      type: "mcq",
      difficulty: 1,
      topic: "Beam-splitter matrix",
      prompt: "Which entry of the symmetric beam-splitter matrix carries the 90° phase associated with reflection?",
      options: ["The diagonal element t", "The off-diagonal element i r", "The determinant", "The identity matrix"],
      answerIndex: 1,
      answer:
        "The off-diagonal element i r contains the factor i. A reflected wave acquires a 90° phase relative to a transmitted wave in this convention.",
      explanation:
        "Writing B = [[t, i r], [i r, t]] makes the reflection phase explicit and keeps the matrix unitary when t² + r² = 1.",
      marks: 1
    },
    {
      id: "mz-q03",
      type: "mcq",
      difficulty: 1,
      topic: "Unitarity",
      prompt: "Unitarity of B(η) guarantees that…",
      options: [
        "the two output probabilities sum to one when both ports are included",
        "the beam is perfectly polarized",
        "the splitter is exactly 50:50",
        "the relative phase is zero"
      ],
      answerIndex: 0,
      answer:
        "Unitarity is conservation of probability (or energy) for the two-port device. It does not require a particular splitting ratio or polarization.",
      explanation:
        "B†B = 1 implies that the squared norms of the two outputs sum to the squared norm of the input.",
      marks: 1
    },
    {
      id: "mz-q04",
      type: "mcq",
      difficulty: 2,
      topic: "Visibility",
      prompt: "Which condition does NOT reduce the fringe visibility?",
      options: [
        "A slow drift of the path difference during the scan",
        "An unequal splitting ratio at BS2",
        "A polarization mismatch between the arms",
        "Perfect spatial overlap of the two modes"
      ],
      answerIndex: 3,
      answer:
        "Perfect spatial overlap is the condition for maximum visibility; the other three all reduce it.",
      explanation:
        "Drift washes out the fringe, imbalance prevents complete cancellation, and polarization mismatch removes part of the field from the interference term.",
      marks: 1
    },
    {
      id: "mz-q05",
      type: "mcq",
      difficulty: 2,
      topic: "Single photon",
      prompt: "A single photon enters a balanced Mach–Zehnder interferometer set to φ = 0. What is observed?",
      options: [
        "Half a photon at each detector",
        "One click at D1 with certainty",
        "One click at D0 with certainty",
        "No click at all"
      ],
      answerIndex: 1,
      answer:
        "The photon is detected once, at D1, with probability one. Detection is indivisible; there is no half-photon outcome.",
      explanation:
        "The two path amplitudes cancel at D0 and add at D1. The squared moduli give the probabilities, not a physical splitting of the photon.",
      marks: 1
    },
    {
      id: "mz-q06",
      type: "mcq",
      difficulty: 2,
      topic: "Photon statistics",
      prompt:
        "A He–Ne laser is attenuated until the average count rate is one photon per microsecond. The state of the field is…",
      options: [
        "a one-photon Fock state",
        "a weak coherent state with Poissonian statistics",
        "a thermal state",
        "an entangled photon pair"
      ],
      answerIndex: 1,
      answer:
        "Attenuation preserves the coherent-state character and lowers the mean photon number. The statistics remain Poissonian.",
      explanation:
        "A weak coherent pulse still has a nonzero probability of containing two photons. It is not a deterministic single-photon source.",
      marks: 1
    },
    {
      id: "mz-q07",
      type: "mcq",
      difficulty: 2,
      topic: "Blocking an arm",
      prompt:
        "One arm of a balanced Mach–Zehnder is blocked. What happens to the output as the relative phase is scanned?",
      options: [
        "The fringes shift by π but remain visible",
        "The fringes disappear and the total power falls to one half",
        "The total power doubles",
        "The visibility becomes one"
      ],
      answerIndex: 1,
      answer: "With one amplitude removed there is nothing for the other to interfere with. The output is constant and only half the input power survives at a 50:50 BS1.",
      explanation:
        "The remaining path contributes a phase-independent probability. A blocked arm is the extreme case of a which-path marker.",
      marks: 1
    },
    {
      id: "mz-q08",
      type: "mcq",
      difficulty: 2,
      topic: "Complementarity",
      prompt: "A measurement gives V = 0.6. What is the maximum distinguishability compatible with D² + V² ≤ 1?",
      options: ["0.4", "0.6", "0.8", "1.0"],
      answerIndex: 2,
      answer: "D_max = √(1 − 0.6²) = √0.64 = 0.8.",
      explanation:
        "The bound limits how much which-path information can coexist with a given fringe visibility.",
      marks: 1
    },
    {
      id: "mz-q09",
      type: "mcq",
      difficulty: 1,
      topic: "Energy conservation",
      prompt: "At a dark output port of a lossless Mach–Zehnder, the missing energy…",
      options: [
        "is absorbed by the beam-splitter coating",
        "leaves through the other output port",
        "is stored in the mirror",
        "is converted into heat in the cube"
      ],
      answerIndex: 1,
      answer:
        "The two amplitudes cancel in one direction and add in the other. BS2 is unitary, so the power appears at the complementary port.",
      explanation:
        "A dark fringe is a redirection of energy, not absorption. Real losses add a small third channel but do not explain the ideal null.",
      marks: 1
    },
    {
      id: "mz-q10",
      type: "mcq",
      difficulty: 3,
      topic: "Quantum evidence",
      prompt: "Which observation would demonstrate behaviour that a coherent-state model cannot explain?",
      options: [
        "A high-visibility fringe at low power",
        "Antibunching with g²(0) < 1",
        "A stable output power",
        "A linear polarization"
      ],
      answerIndex: 1,
      answer:
        "Antibunching requires non-classical photon statistics and is the standard signature of a true single-photon source.",
      explanation:
        "A weak coherent state can produce high-visibility fringes and rare clicks, but its second-order correlation at zero delay is not below one.",
      marks: 1
    },
    {
      id: "mz-q11",
      type: "mcq",
      difficulty: 1,
      topic: "Phase",
      prompt: "The relative phase φ in the model represents…",
      options: [
        "the absolute phase of the laser",
        "the optical path difference between the arms expressed as an angle",
        "the detector gain",
        "the loss in BS1"
      ],
      answerIndex: 1,
      answer:
        "Only the phase difference between the two arms is observable. It is the optical path difference multiplied by 2π/λ.",
      explanation:
        "A global phase applied to both arms cancels in the intensity and has no physical consequence.",
      marks: 1
    },
    {
      id: "mz-q12",
      type: "numerical",
      difficulty: 1,
      topic: "Optical path difference",
      prompt: "At 632.8 nm, what optical path difference gives a phase difference of π? Give the answer in nanometres.",
      answer: "ΔL = λ/2 = 316.4 nm.",
      explanation: "Δφ = 2π ΔL/λ, so Δφ = π requires ΔL = λ/2.",
      numeric: { value: 316.4, tolerance: 1, unit: "nm" },
      marks: 2
    },
    {
      id: "mz-q13",
      type: "numerical",
      difficulty: 1,
      topic: "Output probability",
      prompt: "A balanced Mach–Zehnder has φ = 90°. What is P1?",
      answer: "P1 = cos²(45°) = 0.500.",
      explanation: "P1 = cos²(φ/2) with φ = π/2.",
      numeric: { value: 0.5, tolerance: 0.01 },
      marks: 2
    },
    {
      id: "mz-q14",
      type: "numerical",
      difficulty: 1,
      topic: "Output probability",
      prompt: "A balanced Mach–Zehnder has φ = 120°. What is P0?",
      answer: "P0 = sin²(60°) = 0.750.",
      explanation: "P0 = sin²(φ/2) with φ = 2π/3.",
      numeric: { value: 0.75, tolerance: 0.01 },
      marks: 2
    },
    {
      id: "mz-q15",
      type: "numerical",
      difficulty: 2,
      topic: "Visibility",
      prompt:
        "BS1 is 50:50 and BS2 has power reflectivity η2 = 0.70. Taking γ = 1, what is the predicted visibility at D0?",
      answer:
        "V = 2√(0.5 × 0.7 × 0.5 × 0.3)/(0.35 + 0.15) = 0.917.",
      explanation:
        "Use V = 2γ√(η1η2(1−η1)(1−η2))/[η1η2 + (1−η1)(1−η2)] with η1 = 0.5.",
      numeric: { value: 0.9165, tolerance: 0.005 },
      marks: 2
    },
    {
      id: "mz-q16",
      type: "numerical",
      difficulty: 2,
      topic: "Phase conversion",
      prompt: "A path difference of 100 nm is introduced at 632.8 nm. What is the phase difference in degrees?",
      answer: "Δφ = 360° × 100/632.8 = 56.9°.",
      explanation: "One wavelength corresponds to 360°, so the phase is the path difference divided by the wavelength, times 360°.",
      numeric: { value: 56.9, tolerance: 0.5, unit: "°" },
      marks: 2
    },
    {
      id: "mz-q17",
      type: "numerical",
      difficulty: 2,
      topic: "Counting statistics",
      prompt:
        "N = 1000 independent photons pass through a balanced Mach–Zehnder biased at the half-intensity point. What is the expected standard deviation of the D0 count?",
      answer: "p0 = 0.5, so σ = √(1000 × 0.5 × 0.5) = 15.8 counts.",
      explanation: "Binomial statistics: σ = √(N p(1 − p)).",
      numeric: { value: 15.8, tolerance: 0.5, unit: "counts" },
      marks: 2
    },
    {
      id: "mz-q18",
      type: "numerical",
      difficulty: 2,
      topic: "Fringe counting",
      prompt: "A translation stage changes the optical path of one arm by 1.00 µm. How many fringes does the output pass through at 632.8 nm?",
      answer: "1.00 µm / 632.8 nm = 1.58 fringes.",
      explanation: "One fringe corresponds to one wavelength of optical path difference.",
      numeric: { value: 1.58, tolerance: 0.02 },
      marks: 2
    },
    {
      id: "mz-q19",
      type: "numerical",
      difficulty: 3,
      topic: "Phase sensitivity",
      prompt: "For a balanced, coherent Mach–Zehnder, what is the maximum value of |∂P0/∂φ|? Give the answer in rad⁻¹.",
      answer: "0.5 rad⁻¹.",
      explanation:
        "For η1 = η2 = 0.5 and γ = 1, 2t1t2r1r2 = 2 × 0.5 × 0.5 = 0.5. The maximum occurs at φ = π/2.",
      numeric: { value: 0.5, tolerance: 0.01, unit: "rad^-1" },
      marks: 2
    },
    {
      id: "mz-q20",
      type: "numerical",
      difficulty: 1,
      topic: "Beam-splitter coefficients",
      prompt: "A 50:50 beam splitter has η = 0.5. What is the amplitude reflection coefficient r?",
      answer: "r = √0.5 = 0.7071.",
      explanation: "The amplitude coefficient is the square root of the power coefficient.",
      numeric: { value: 0.7071, tolerance: 0.001 },
      marks: 1
    },
    {
      id: "mz-q21",
      type: "short",
      difficulty: 2,
      topic: "Reflection phase",
      prompt: "Why does the reflected beam carry a factor i in the beam-splitter matrix?",
      answer:
        "The factor i is a 90° phase shift between transmission and reflection. It is required for the symmetric two-port device to be unitary at both input ports and follows from energy conservation and reciprocity. Without it, a real symmetric matrix would not describe a lossless splitter consistently for both inputs.",
      explanation:
        "The relative phase of transmitted and reflected waves is a property of the coating and the geometry. The symmetric convention places a +i on each reflection; other conventions move the phase elsewhere and give the same intensities.",
      marks: 3
    },
    {
      id: "mz-q22",
      type: "short",
      difficulty: 2,
      topic: "Dark port",
      prompt: "Why is one output dark at φ = 0 for a balanced interferometer?",
      answer:
        "The two routes to that output acquire equal magnitudes and a relative phase of π, so their complex amplitudes cancel. The same two amplitudes add constructively at the other output, which is therefore bright.",
      explanation:
        "In the matrix calculation, a0 = (e^{iφ} − 1)/2 at φ = 0, which is zero; a1 = i(e^{iφ} + 1)/2 = i.",
      marks: 3
    },
    {
      id: "mz-q23",
      type: "short",
      difficulty: 2,
      topic: "Classical versus quantum",
      prompt:
        "What is the difference between the classical-field and single-photon descriptions of this experiment?",
      answer:
        "The beam-splitter algebra and the output probabilities are the same. Classically the amplitudes describe a continuous field and the detector records mean power; quantum mechanically they are mode operators acting on a one-photon state and the detector records a single click with probability |a|². The difference is in the state and the detection statistics, not in the interference law.",
      explanation:
        "A coherent state and a one-photon state both give P0 = sin²(φ/2) for an ideal balanced interferometer. They differ in photon-number statistics and in what evidence establishes non-classicality.",
      marks: 3
    },
    {
      id: "mz-q24",
      type: "short",
      difficulty: 2,
      topic: "Visibility",
      prompt: "What does visibility measure, and what does it not measure?",
      answer:
        "Visibility measures the normalized depth of the fringe at the monitored port. It does not by itself measure the degree of coherence: splitting imbalance, spatial-mode mismatch, polarization mismatch and detector nonlinearity all reduce it. To extract coherence, the other contributions must be measured or eliminated.",
      explanation:
        "V = (Imax − Imin)/(Imax + Imin) is an operational quantity. Its interpretation requires the beam powers, the overlap and the detector response.",
      marks: 3
    },
    {
      id: "mz-q25",
      type: "short",
      difficulty: 2,
      topic: "Mode matching",
      prompt: "Why do the two beams need matched wavefront curvature and polarization at BS2?",
      answer:
        "Interference occurs only between fields that are indistinguishable in polarization and spatial mode. A wavefront-curvature mismatch produces a phase that varies across the beam, averaging the fringe; an orthogonal polarization component does not interfere at all and adds background.",
      explanation:
        "The measured visibility is proportional to the squared overlap of the two mode functions. Perfect overlap is the idealisation γ = 1 in the model.",
      marks: 3
    },
    {
      id: "mz-q26",
      type: "short",
      difficulty: 1,
      topic: "Detectors",
      prompt: "Why can a photodiode not count individual photons?",
      answer:
        "A photodiode integrates the photocurrent produced by many photons over its response time. It measures mean optical power, not discrete absorption events. Photon counting requires a detector with sufficient gain and timing resolution, such as a SPAD, plus electronics that register each avalanche.",
      explanation:
        "Even a SPAD has dark counts and dead time; a photodiode has neither single-photon sensitivity nor event timing.",
      marks: 2
    },
    {
      id: "mz-q27",
      type: "viva",
      difficulty: 2,
      topic: "Blocking",
      prompt: "If you block one arm, what happens to the fringe and to the total power? Explain using amplitudes.",
      answer:
        "Only one route amplitude remains, so the output probability is its squared modulus and has no phase dependence: the fringe disappears. At a 50:50 BS1 the surviving power is one half of the input. The other half was blocked before recombination, so the two outputs no longer sum to the input.",
      explanation:
        "With path B blocked, P0 = η1η2 and P1 = η1(1−η2). The missing 1−η1 is absorbed by the block.",
      marks: 4
    },
    {
      id: "mz-q28",
      type: "viva",
      difficulty: 3,
      topic: "Interpretation",
      prompt: "Does the photon take both paths? How should the experiment be described?",
      answer:
        "The photon is not a classical particle that secretly chooses a path while the interferometer is closed. Its state is a superposition of the two arm modes, and the two amplitudes contribute to the detection probability. If a measurement reveals the path, the superposition decoheres and the interference disappears. It is safer to say that the two routes are indistinguishable than to say that the photon took both.",
      explanation:
        "The formalism predicts detection probabilities, not a trajectory. Asking which path was taken is only meaningful when an experiment records it.",
      marks: 4
    },
    {
      id: "mz-q29",
      type: "viva",
      difficulty: 2,
      topic: "Evidence",
      prompt: "Is this a classical or a quantum experiment?",
      answer:
        "The kit as implemented is a classical optical experiment: a coherent laser and photodiodes measure interference of classical fields. The mathematics is the same as the quantum single-photon case, but the experiment does not demonstrate single-photon detection or non-classical statistics. It becomes a single-photon experiment only with a heralded source and appropriate detectors.",
      explanation:
        "The evidence label classical-demo records exactly this distinction. The simulator can explore the single-photon limit, but a simulation is not a measurement.",
      marks: 4
    },
    {
      id: "mz-q30",
      type: "viva",
      difficulty: 3,
      topic: "Single-photon implementation",
      prompt: "What would you need to add to claim single-photon operation?",
      answer:
        "A heralded single-photon source, such as spontaneous parametric down-conversion with an idler detector; single-photon detectors on both outputs; coincidence or time-tagging electronics; and a demonstration of antibunching or a heralded g² measurement. Attenuating the laser is not sufficient.",
      explanation:
        "The source must have a nonzero probability of zero photons and a negligible probability of two or more. Heralding uses the idler to announce the presence of a photon in the signal mode.",
      marks: 5
    },
    {
      id: "mz-q31",
      type: "viva",
      difficulty: 3,
      topic: "Visibility and ports",
      prompt: "How does beam-splitter imbalance affect visibility, and which port should you monitor?",
      answer:
        "Imbalance reduces the interference term relative to the background, so the dark port no longer reaches zero and V falls. The two ports have different mean powers when the splitters are unequal, so their visibilities differ slightly. State which port is monitored and use the corresponding unequal-splitting formula; do not compare a measured V with the ideal value of one.",
      explanation:
        "For η1 = 0.5 and η2 = 0.7 the dark-port visibility is 0.917 at γ = 1. The complementary port has a different mean and a slightly different visibility.",
      marks: 4
    },
    {
      id: "mz-q32",
      type: "derivation",
      difficulty: 2,
      topic: "Unitarity",
      prompt: "Derive B†B = 1 for the symmetric beam-splitter matrix B = [[t, i r], [i r, t]] with real t and r.",
      answer:
        "B† = [[t, −i r], [−i r, t]]. Multiplying gives diagonal entries t² + r² and off-diagonal entries i t r − i t r = 0. With t² + r² = 1 the product is the identity.",
      explanation:
        "The key steps are conjugating the i factors, multiplying the two matrices and using the lossless relation t² = 1 − η, r² = η.",
      marks: 5
    },
    {
      id: "mz-q33",
      type: "derivation",
      difficulty: 3,
      topic: "Balanced outputs",
      prompt: "Derive P0 = sin²(φ/2) and P1 = cos²(φ/2) for a balanced Mach–Zehnder.",
      answer:
        "After BS1 the arm amplitudes are 1/√2 and i/√2. Applying the phase to path B gives aA = 1/√2 and aB = i e^{iφ}/√2. At BS2, a0 = (e^{iφ} − 1)/2 and a1 = i(e^{iφ} + 1)/2. Then |a0|² = (2 − 2cosφ)/4 = sin²(φ/2), and |a1|² = (2 + 2cosφ)/4 = cos²(φ/2).",
      explanation:
        "Use |e^{iφ} ± 1|² = 2 ± 2cosφ and the half-angle identities.",
      marks: 5
    },
    {
      id: "mz-q34",
      type: "derivation",
      difficulty: 3,
      topic: "Unequal visibility",
      prompt: "Derive the fringe visibility for a Mach–Zehnder with unequal beam-splitter reflectivities.",
      answer:
        "Write P0 = a² + b² − 2γab cosφ with a = t1t2 and b = r1r2. The extrema are a² + b² ± 2γab. Substituting into V = (Imax − Imin)/(Imax + Imin) gives V = 2γab/(a² + b²), and replacing a and b by the reflectivities gives the stated formula.",
      explanation:
        "The derivation separates the non-interfering background from the interference amplitude. Setting η1 = η2 = 0.5 gives V = γ.",
      marks: 5
    },
    {
      id: "mz-q35",
      type: "troubleshooting",
      difficulty: 2,
      topic: "Alignment",
      prompt: "You see two separate spots at the output and no fringes. What is wrong?",
      answer:
        "The two arms are not overlapping at BS2 or are not collinear. One spot comes from each arm. Adjust the last mirror of each arm to overlap the spots in the near field and the far field simultaneously, then check the beam heights and the BS2 orientation.",
      explanation:
        "Interference requires spatial overlap. Two spots mean the mode overlap is essentially zero.",
      marks: 4
    },
    {
      id: "mz-q36",
      type: "troubleshooting",
      difficulty: 2,
      topic: "Stability",
      prompt: "The fringes drift steadily across the screen. What are the likely causes?",
      answer:
        "Thermal expansion of mounts, air-current refractive-index changes, vibration and stage hysteresis. Let the laser and table reach equilibrium, enclose the arms, remove sources of airflow, shorten the scan and take forward and reverse data.",
      explanation:
        "A slow monotonic drift is usually thermal; a faster random jitter is usually acoustic or vibrational.",
      marks: 4
    },
    {
      id: "mz-q37",
      type: "troubleshooting",
      difficulty: 3,
      topic: "Visibility loss",
      prompt: "The beam powers at the detectors are equal but the visibility is only 0.4. What should you check?",
      answer:
        "Check polarization mismatch, spatial-mode and wavefront-curvature mismatch, beam clipping, stray light and detector nonlinearity. Equal mean powers do not guarantee equal mode amplitudes or perfect overlap. Also verify that the phase scan covers a full fringe and that the stage is not slipping.",
      explanation:
        "Visibility is limited by the mode-overlap integral and by coherence, not only by the power balance.",
      marks: 4
    },
    {
      id: "mz-q38",
      type: "troubleshooting",
      difficulty: 3,
      topic: "Dark port",
      prompt: "The dark port is not dark at the supposed φ = 0 setting. What could explain it?",
      answer:
        "The beam splitters may not be exactly 50:50, the beams may not overlap perfectly, the polarizations may differ, or the phase may not be exactly zero because of an extra path difference. Stray reflections and detector offsets also contribute. Measure the splitting ratios and the background before blaming the interferometer.",
      explanation:
        "An ideal balanced instrument gives zero only with perfect overlap and exact balance. A residual dark-port signal is expected in a real set-up.",
      marks: 4
    },
    {
      id: "mz-q39",
      type: "troubleshooting",
      difficulty: 2,
      topic: "Detector range",
      prompt: "The photodiode signal stops increasing when you increase the laser power. What is happening?",
      answer:
        "The detector or transimpedance amplifier is saturating. Reduce the optical power with attenuation, lower the gain, or check the load resistance. Confirm linearity with a power sweep before recording quantitative fringes.",
      explanation:
        "A saturated detector compresses the bright peaks and biases the visibility downward.",
      marks: 3
    },
    {
      id: "mz-q40",
      type: "instrumentation",
      difficulty: 2,
      topic: "Detector choice",
      prompt: "Which detector would you choose for genuine photon counting, and why?",
      answer:
        "A single-photon avalanche diode or a photomultiplier with time-tagging electronics. A photodiode measures mean power and cannot resolve individual photons. The chosen detector must have low dark counts, known efficiency and dead-time characteristics.",
      explanation:
        "Photon counting also requires a source with suitable statistics; a detector alone does not make the experiment single-photon.",
      marks: 3
    },
    {
      id: "mz-q40b",
      type: "instrumentation",
      difficulty: 2,
      topic: "Splitting ratio",
      prompt: "How do you measure the splitting ratio of a beam-splitter cube?",
      answer:
        "Send a stable beam into one input port, measure the power in each output with the other input blocked, and compute η = P_reflected/(P_reflected + P_transmitted). Correct for detector responsivity and stray light, and repeat for both polarizations if the cube is not specified as non-polarizing.",
      explanation:
        "The power ratio gives η; the amplitude coefficients are the square roots of the power fractions.",
      marks: 3
    },
    {
      id: "mz-q41",
      type: "instrumentation",
      difficulty: 2,
      topic: "Translation stage",
      prompt: "What is the role of the translation stage in this experiment?",
      answer:
        "It changes the length of one arm by a known amount, which changes the optical path difference and therefore the relative phase. Scanning it produces the fringe; calibrating it converts a stage reading into a phase and a path difference.",
      explanation:
        "A micrometer stage with fine travel is needed because one fringe corresponds to only 632.8 nm of optical path difference.",
      marks: 3
    },
    {
      id: "mz-q42",
      type: "instrumentation",
      difficulty: 1,
      topic: "Alignment aids",
      prompt: "Why use iris diaphragms and beam blocks during alignment?",
      answer:
        "Irises define the beam height and direction at two separated points, making the optical axis reproducible. Beam blocks terminate unused beams and protect the operator during alignment. Both are safety and precision tools, not optional accessories.",
      explanation:
        "A beam that passes through two distant irises is both at the right height and travelling in the right direction.",
      marks: 2
    },
    {
      id: "mz-q43",
      type: "instrumentation",
      difficulty: 2,
      topic: "Simulator seed",
      prompt: "What does the seed control in the simulator's photon-counting mode, and what does it not control?",
      answer:
        "The seed initialises the pseudo-random generator that decides each simulated detection. The same seed reproduces the same sequence of counts. It does not change the underlying probabilities, which are computed deterministically from the phase and splitting ratios, and it does not make the counts experimental data.",
      explanation:
        "Every simulated run is labelled SIMULATED. The seed is a reproducibility device, not a physical parameter.",
      marks: 2
    },
    {
      id: "mz-x01",
      type: "mcq",
      difficulty: 2,
      topic: "Dark-port verification",
      prompt:
        "You suspect that D0 is not truly dark at the nominal φ = 0 setting. Which check is the most direct test?",
      options: [
        "Increase the laser power until D0 becomes visible.",
        "Block the input and record the detector zero, then scan the stage for the minimum D0 while confirming that D1 is simultaneously maximum.",
        "Remove BS2 and check that each arm produces a spot.",
        "Rotate the laser polarization until D0 disappears."
      ],
      answerIndex: 1,
      answer:
        "A dark port is established by a background-corrected minimum at D0 together with a simultaneous maximum at D1. Visual darkness alone is not a measurement.",
      explanation:
        "Subtracting the blocked-beam offset removes detector dark current and stray light. The simultaneous bright-port maximum confirms that the two outputs are complementary rather than both simply weak.",
      marks: 2
    },
    {
      id: "mz-x02",
      type: "short",
      difficulty: 2,
      topic: "Beam overlap and path balancing",
      prompt:
        "Both arms carry equal power, but the output spots are displaced and no fringes appear. Describe the near-field and far-field alignment procedure you would use.",
      answer:
        "Block one arm and use the other spot as a reference. Place an iris at BS2 and a screen several metres away. Adjust the last mirror of the blocked arm so that its spot lands on the same point at BS2 (near field), then on the same point on the distant screen (far field), iterating between the two. Check that both beams have the same height, size and angle. Unblock the arm and scan the translation stage to find fringes. Equal powers do not guarantee equal modes.",
      explanation:
        "Interference requires spatial overlap in both position and direction. A displaced spot means the mode-overlap integral is essentially zero, no matter how well the powers are balanced.",
      marks: 4
    },
    {
      id: "mz-x03",
      type: "short",
      difficulty: 2,
      topic: "Polarization matching",
      prompt:
        "How would you test whether the two arms have matching polarization, and what would you do if they do not?",
      answer:
        "Place a polarizer in the recombined output, or temporarily in each arm, and rotate it. If both arms have the same linear polarization, they extinguish at the same angle and the fringe contrast is high. If the extinction angles differ, or if rotating the polarizer strongly changes the power ratio between the arms, the polarizations are mismatched. Correct by rotating the laser polarization, using a half-wave plate or polarization controller if available, and confirming that the beam-splitter cube is specified as non-polarizing. Avoid strain on the cube mount, which can induce polarization dependence.",
      explanation:
        "Orthogonal polarization components do not interfere: they add as intensities and only raise the background. A polarization mismatch therefore lowers visibility without changing the total power very much.",
      marks: 3
    },
    {
      id: "mz-x04",
      type: "mcq",
      difficulty: 2,
      topic: "No fringes",
      prompt:
        "The translation stage is scanned over several fringe periods, but both detector signals remain constant; one port is always bright and the other always dark. What is the most likely cause?",
      options: [
        "The laser coherence length is too long.",
        "The two beams do not overlap at BS2, or one arm is blocked or badly misaligned.",
        "The photodiode bandwidth is too low.",
        "The phase scan is too slow."
      ],
      answerIndex: 1,
      answer: "A phase-independent, complementary output means that only one arm is contributing at BS2. The other path is blocked, clipped or spatially missing the overlap region.",
      explanation:
        "Check the beam blocks first, then the irises and the two spots at BS2. If both arms are present but displaced, the output is the sum of two non-interfering spots rather than a single overlapping mode.",
      marks: 3
    },
    {
      id: "mz-x05",
      type: "short",
      difficulty: 2,
      topic: "Phase drift",
      prompt:
        "The fringe drifts monotonically across the screen over several minutes. List the likely causes and the practical mitigations.",
      answer:
        "Likely causes are thermal expansion of the mounts or table, slow changes in the air refractive index from temperature or air currents, acoustic or building vibration, and hysteresis in the translation stage. Mitigate by letting the laser and mounts warm up, enclosing the arms, switching off fans and air conditioning, using a damped table, keeping hands and cables off the table during a scan, using short forward and reverse scans, and referencing the phase to a stable fiducial or a second detector.",
      explanation:
        "A slow monotonic drift is usually thermal or air-index related; faster random jitter is usually acoustic or vibrational. Forward and reverse scans expose hysteresis.",
      marks: 4
    },
    {
      id: "mz-x06",
      type: "mcq",
      difficulty: 1,
      topic: "Path length to phase",
      prompt:
        "An extra optical path of 158.2 nm is added to one arm at λ = 632.8 nm. What phase difference does it produce?",
      options: ["45°", "90°", "180°", "360°"],
      answerIndex: 1,
      answer: "Δφ = 2π × 158.2/632.8 = π/2 = 90°.",
      explanation:
        "158.2 nm is one quarter of 632.8 nm, so the phase advance is one quarter of a full 2π cycle. At this setting a balanced interferometer has P0 = P1 = 0.5.",
      marks: 1
    },
    {
      id: "mz-x07",
      type: "short",
      difficulty: 3,
      topic: "Visibility optimisation",
      prompt:
        "Explain why a 50:50 second beam splitter maximises fringe visibility when the first splitter is also 50:50. Give the general condition for V = 1 when the splitters are unequal.",
      answer:
        "For a lossless instrument V = 2ab/(a² + b²), where a = t1t2 and b = r1r2 are the magnitudes of the two route amplitudes at the output. The visibility is one when a = b, so the two interfering amplitudes must be equal. With η1 = 0.5, a² = 0.25(1 − η2) and b² = 0.25η2; equality requires η2 = 0.5. More generally, (1 − η1)(1 − η2) = η1η2, which gives η2 = 1 − η1. Thus a 30:70 first splitter is compensated by a 70:30 second splitter, not by another 50:50 cube. This argument assumes γ = 1 and no loss.",
      explanation:
        "Balancing the route amplitudes is what removes the non-interfering background. A second 50:50 cube is optimal only when the first cube is also 50:50; for unequal splitters the optimum is complementary.",
      marks: 4
    },
    {
      id: "mz-x08",
      type: "numerical",
      difficulty: 2,
      topic: "Output probability",
      prompt:
        "A balanced, coherent Mach–Zehnder interferometer is set to φ = 150°. Calculate P0. Give four decimal places.",
      answer: "P0 = sin²(150°/2) = sin²(75°) = 0.9330.",
      explanation:
        "The half-angle form follows from P0 = (1 − cos φ)/2. With φ = 150°, cos φ = −0.8660, so P0 = (1 + 0.8660)/2 = 0.9330 and P1 = 0.0670.",
      numeric: { value: 0.933, tolerance: 0.002 },
      marks: 2
    },
    {
      id: "mz-x09",
      type: "numerical",
      difficulty: 3,
      topic: "Visibility with unequal splitting",
      prompt:
        "BS1 has power reflectivity η1 = 0.30 and BS2 has η2 = 0.80. Taking γ = 1 and neglecting loss, calculate the predicted fringe visibility at D0.",
      answer:
        "V = 2√(0.30 × 0.80 × 0.70 × 0.20) / (0.30 × 0.80 + 0.70 × 0.20) = 0.3666/0.380 = 0.9648.",
      explanation:
        "The numerator is twice the geometric mean of the two route intensities; the denominator is the sum of the non-interfering background terms. Here the imbalance costs only about 3.5% of visibility.",
      numeric: { value: 0.9648, tolerance: 0.003 },
      marks: 3
    },
    {
      id: "mz-x10",
      type: "viva",
      difficulty: 3,
      topic: "Instrumentation and evidence",
      prompt:
        "You want to measure a small phase modulation with the photodiode. Describe how you would verify detector linearity, implement a piezo phase scan and use lock-in detection. A student claims that the clean fringe proves single-photon operation — how do you respond?",
      answer:
        "Verify linearity by measuring the detector signal against optical power over the range you will use, using neutral-density attenuation and staying below saturation; record the dark level. Mount a mirror on a piezo or use the translation stage, drive a slow ramp, and calibrate nanometres per volt from the known fringe period of 632.8 nm; check for hysteresis by scanning in both directions. For a small modulation, modulate the phase at a known frequency and detect at that frequency with a lock-in amplifier referenced to the modulation; this rejects slow drift and broadband noise and improves signal-to-noise. The clean fringe does not prove single-photon operation: the laser is a coherent state and the photodiode records mean optical power. A single-photon claim needs a heralded source, single-photon detectors and a measured antibunching signal such as g²(0) < 1.",
      explanation:
        "Linearity protects the visibility measurement, the piezo provides a calibrated phase scan, and the lock-in improves the signal-to-noise ratio for small modulations. None of these turns a coherent-state measurement into a single-photon measurement.",
      marks: 5
    }
  ],
  references: [
    "hecht",
    "bornwolf",
    "fowles",
    "saleh",
    "loudon",
    "nielsen",
    "griffiths",
    "taylor",
    "thorlabs_edu",
    "thorlabs_kine",
    "edmund_optics",
    "grangier1986",
    "elitzur1993",
    "kwiat1995",
    "kim2000",
    "bennett1992",
    "jacques2007"
  ].map(reference),
  related: [
    "michelson-interferometer",
    "quantum-bomb-tester",
    "quantum-eraser",
    "quantum-key-distribution"
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
