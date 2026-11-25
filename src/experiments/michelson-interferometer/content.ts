import type { ExperimentContent, SimulationSpec } from "@/lib/content/types";
import { refs } from "@/lib/content/references";

/**
 * Declared simulation model, shared by the interactive component and the
 * written disclosure so the two can never drift apart.
 */
export const simulationSpec: SimulationSpec = {
  model:
    "The simulation evaluates scalar two-beam interference for a Michelson interferometer over a 16 mm × 16 mm observation field at 256 × 256 samples. The optical path difference is Δ = 2(d₂ − d₁), plus 2αx for a tilted mirror or r²/(2R) for a quadratic wavefront-curvature mismatch. Straight fringes use the shared michelsonPattern implementation; circular fringes use the same two-beam intensity law with a radial phase. Visibility combines the arm-intensity balance 2√r/(1+r), a source coherence factor and a Gaussian coherence envelope exp[−(Δ/Lc)²], with Lc = λ²/Δλ. The displayed intensity is normalised to [0, 1]. Measurement rows are labelled as simulated and are never presented as laboratory data.",
  approximations: [
    "Scalar diffraction-free fields, perfectly polarised and spatially coherent across the sampled aperture.",
    "Ideal lossless 50:50 beam splitter; any reflection phase is common to both arms and is absorbed into the definition of zero OPD.",
    "Gaussian spectral profile, used both for the coherence length Lc = λ²/Δλ and for the white-light envelope.",
    "Paraxial propagation and small mirror tilt (≤ 1 mrad); circular fringes use a quadratic phase r²/(2R).",
    "Square-law detector with linear response and no saturation; intensities are normalised, not radiometric."
  ],
  validity: [
    "Wavelength 400–700 nm, tilt 0–1 mrad, optical path difference within ±10 mm.",
    "Fringe spacing must remain larger than about four sample pixels; the renderer uses 256 samples over 16 mm.",
    "Arm intensity ratio 0.05–1 and source coherence factor 0–1.",
    "The measurement calculator is valid for fringe counts above about 20, where λ = 2Δd/N is well conditioned."
  ],
  exclusions: [
    "No vibration, air turbulence, thermal drift, mirror figure error or table bending.",
    "No detector dark current, shot noise, saturation, gain drift or readout nonlinearity.",
    "No real beam-splitter absorption, dispersion, polarisation splitting or ghost reflections from a plate.",
    "No multimode laser structure, mode hopping, frequency drift or amplitude noise.",
    "Not a measurement of the physical kit; every table row is a model output."
  ],
  validation: [
    "Δ = 2(d₂ − d₁) is checked against the shared optical-path relation in the unit tests.",
    "One fringe per λ/2 of mirror travel is checked analytically and numerically.",
    "Equal beams at full coherence give unit visibility and intensity extrema of 0 and 1.",
    "Wavelength, refractive-index and thermal-expansion inversions recover their input values in the test suite.",
    "Rendered fields are bounded to [0, 1] and contain 256² samples."
  ],
  stochastic: "None. The model is deterministic and uses no random number generator."
};

const content: ExperimentContent = {
  slug: "michelson-interferometer",
  number: "01",
  title: "Michelson Interferometer",
  shortTitle: "Michelson",
  subtitle: "Precision measurement with two interfering paths",
  summary:
    "Build the canonical two-path interferometer and measure wavelength, refractive index and thermal expansion from fringe motion.",
  principle:
    "Two coherent beams recombine after different optical path lengths; the phase difference sets the intensity.",
  family: "Interferometry",
  difficulty: 1,
  duration: "3–4 h",
  evidence: {
    implementation: "actual",
    headline: "A real undergraduate bench experiment, not a thought experiment",
    detail:
      "The layout — laser or white-light source, non-polarising beam-splitter cube, two plane mirrors, one on a micrometer stage, and a screen, camera or photodiode — is standard teaching-laboratory equipment. The exact Thorlabs kit model is not yet verified against the physical label, so component part numbers and the packing list must be checked before the session. Alignment quality, table stability and source coherence determine whether the quoted precision is reached; the simulation on this page is a model and is labelled separately."
  },
  kit: {
    name: "Thorlabs educational optics kit — model to be verified against the physical kit label",
    manufacturer: "Thorlabs",
    verification: "unverified",
    documentation: [
      {
        title: "Thorlabs educational kits, user guides and application notes",
        url: "https://www.thorlabs.com/",
        note:
          "Use the printed guide and packing list supplied with the physical kit. Record the exact model and serial number after checking the label; no model-specific document URL is asserted here."
      }
    ],
    note:
      "The kit identity is deliberately unverified. Quantities and part descriptions in the hardware list are typical for this experiment, not a claim about a specific shipped configuration. Substitute equivalent 50:50 splitters, plane mirrors and stages only after checking surface quality, coating and travel resolution."
  },
  hardware: [
    {
      itemId: "src-he-ne",
      quantity: "1",
      role: "kit",
      note: "Typical 1–2 mW linearly polarised tube; confirm class and output power on the label."
    },
    {
      itemId: "src-white-led",
      quantity: "1",
      role: "kit",
      note: "Broadband source for white-light fringes; a fibre-coupled lamp is an acceptable substitute."
    },
    {
      itemId: "src-diode-532",
      quantity: "1",
      role: "recommended",
      note: "Optional green source; check whether the module is Class 3B before opening the shutter."
    },
    {
      itemId: "bs-cube-50",
      quantity: "1",
      role: "kit",
      note: "Non-polarising 50:50 cube is preferred over a plate for stable, single fringe sets."
    },
    {
      itemId: "mir-plane",
      quantity: "2",
      role: "kit",
      note: "One fixed mirror and one movable mirror; dielectric coatings are adequate at 633 nm."
    },
    {
      itemId: "kinematic-mount",
      quantity: "2",
      role: "kit",
      note: "Two-axis tip/tilt mounts with fine adjusters; one carries the fixed mirror, one the scan mirror."
    },
    {
      itemId: "translation-stage",
      quantity: "1",
      role: "kit",
      note: "Stage carrying the scan mirror; typical 25 mm travel with a fine micrometer drive."
    },
    {
      itemId: "micrometer",
      quantity: "1",
      role: "kit",
      note: "Micrometer head with 10 µm graduations and a vernier or digital readout; check backlash."
    },
    {
      itemId: "lens-convex",
      quantity: "1",
      role: "kit",
      note: "f = 100 mm plano-convex lens for expanding the beam and imaging circular fringes."
    },
    {
      itemId: "screen-white",
      quantity: "1",
      role: "kit",
      note: "White card for coarse alignment; a camera or photodiode replaces it for measurements."
    },
    {
      itemId: "det-photodiode",
      quantity: "1",
      role: "recommended",
      note: "Silicon photodiode with transimpedance amplifier for fringe counting and visibility."
    },
    {
      itemId: "det-camera",
      quantity: "1",
      role: "recommended",
      note: "USB machine-vision camera for recording straight or circular fringe fields."
    },
    {
      itemId: "sample-gas-cell",
      quantity: "1",
      role: "recommended",
      note: "Cell with optical windows and a valve, length typically 50–100 mm; check pressure rating."
    },
    {
      itemId: "sample-glass-slide",
      quantity: "1",
      role: "kit",
      note: "Compensating plate for white-light work; thickness and material should match the splitter."
    },
    {
      itemId: "sample-metal-rod",
      quantity: "1",
      role: "recommended",
      note: "Aluminium or brass rod, typically 300–500 mm, for the thermal-expansion measurement."
    },
    {
      itemId: "optical-table",
      quantity: "1",
      role: "kit",
      note: "Damped table or breadboard; a rigid bench with isolation is acceptable for teaching."
    },
    {
      itemId: "beam-block",
      quantity: "2",
      role: "kit",
      note: "One at the unused beam-splitter port and one for the main beam during adjustment."
    },
    {
      itemId: "inst-safety-glasses",
      quantity: "1 per person",
      role: "kit",
      note: "Wavelength-specific eyewear with adequate optical density; confirm the marking for the source in use."
    },
    {
      itemId: "iris-diaphragm",
      quantity: "2",
      role: "recommended",
      note: "Useful for setting beam height and centring the two returned beams."
    }
  ],
  objectives: [
    "Assemble a Michelson interferometer at a fixed beam height and overlap the two return beams to a single spot.",
    "Recognise circular and straight fringe patterns and explain how mirror tilt and wavefront curvature produce them.",
    "Measure the wavelength of a laser from the number of fringes counted over a measured mirror translation.",
    "Determine the refractive index of air by evacuating a gas cell in one arm and counting the fringes that pass.",
    "Measure the linear thermal-expansion coefficient of a metal rod from fringe motion versus temperature.",
    "Observe white-light fringes near zero optical path difference and explain why they are localised there.",
    "Estimate the visibility, coherence length and uncertainty budget of the measurement rather than quoting a single number."
  ],
  concepts: [
    "Superposition of scalar fields",
    "Optical path difference and phase",
    "Temporal and spatial coherence",
    "Fringe visibility",
    "Fringe counting and sub-fringe interpolation",
    "Refractive index and thermal expansion metrology"
  ],
  prerequisites: [
    "Wave equation and phasor addition",
    "Intensity as the time-averaged square of the electric field",
    "Basic geometrical optics: reflection, refraction and thin lenses",
    "Uncertainty propagation and least-squares fitting (Taylor, chapters 1–8)"
  ],
  sections: [
    {
      id: "history",
      number: "1",
      title: "An instrument that made the invisible measurable",
      kicker: "History",
      blocks: [
        {
          type: "lead",
          text:
            "The Michelson interferometer turns a length difference smaller than a wavelength into a change of brightness that a human eye or a photodiode can follow. That single trick made it the first practical instrument for comparing lengths with nanometre sensitivity, and it remains the clearest introduction to two-beam interference."
        },
        {
          type: "p",
          text:
            "Albert Michelson built his first interferometer in 1881 while working in Berlin, then refined it with Edward Morley at Case Western Reserve in 1887. The instrument splits a beam at a semi-reflecting surface, sends the two halves down perpendicular arms, reflects them from mirrors, and recombines them. Because the two paths share a common source, their relative phase is stable enough to observe even when the path difference changes by a fraction of a wavelength."
        },
        {
          type: "p",
          text:
            "The 1887 experiment looked for the ether wind that classical physics expected as the Earth moved through the luminiferous ether. The predicted shift was about 0.4 of a fringe. Michelson and Morley found no shift at that scale; their paper placed the residual below about one-twentieth of the prediction, and probably below one-fortieth — a few hundredths of a fringe. The null result survived every repetition and helped motivate the Lorentz–FitzGerald contraction and, eventually, Einstein's special relativity in 1905."
        },
        {
          type: "table",
          caption: "Selected milestones of two-beam interferometry",
          head: ["Year", "Development", "Why it mattered"],
          rows: [
            ["1881", "Michelson's first interferometer", "Demonstrated that a two-path instrument could compare lengths at the wavelength scale."],
            ["1887", "Michelson–Morley experiment", "Null result for ether drift; set an upper limit far below the predicted 0.4 fringe."],
            ["1892–93", "Metre measured in cadmium wavelengths", "Linked the international length standard to an atomic wavelength."],
            ["1920", "Michelson–Pease stellar interferometer", "Measured the angular diameter of Betelgeuse from fringe visibility."],
            ["2015", "Advanced LIGO detection of GW150914", "A 4 km Michelson-type interferometer sensed a strain of order 10⁻²¹."]
          ],
          align: ["l", "l", "l"]
        },
        {
          type: "callout",
          tone: "principle",
          title: "Why the instrument still matters",
          body:
            "The Michelson layout is the simplest device that converts a displacement into a phase, and a phase into an intensity. Every later interferometric measurement — refractive index, thermal expansion, gravitational waves, optical coherence tomography — is a variation on that conversion."
        },
        {
          type: "p",
          text:
            "In this laboratory the historical question is replaced by three practical ones: how precisely can you count fringes, how well do you know the mirror translation, and how stable is the optical path while you count? The answers decide whether your wavelength agrees with the source label to one part in a thousand or to one part in ten thousand."
        }
      ]
    },
    {
      id: "superposition",
      number: "2",
      title: "Superposition and the two-beam interference law",
      kicker: "Theory",
      blocks: [
        {
          type: "lead",
          text:
            "At a fixed point in space, each returning beam delivers a sinusoidally varying electric field. The detector responds to the time average of the square of their sum, not to either field separately. The cross term is the interference signal."
        },
        {
          type: "p",
          text:
            "Write the two scalar fields at the detector as E₁ = E₀₁ cos(ωt − φ₁) and E₂ = E₀₂ cos(ωt − φ₂). Both have the same optical frequency ω because they originate from the same source. Superposition gives E = E₁ + E₂. Squaring and averaging over many optical cycles eliminates the terms at 2ω and leaves"
        },
        {
          type: "eq",
          latex: "I = I_1 + I_2 + 2\\sqrt{I_1 I_2}\\,\\cos\\delta,\\qquad \\delta=\\phi_2-\\phi_1",
          number: "2.1",
          note:
            "I₁ and I₂ are the intensities that each beam would produce alone. The factor 2 in the cross term is the signature of two-beam interference; a single beam has no such term."
        },
        {
          type: "derivation",
          derivationId: "two-beam-intensity"
        },
        {
          type: "p",
          text:
            "When the beams are equally bright, I₁ = I₂ = I₀, the expression becomes I = 2I₀(1 + cos δ) = 4I₀ cos²(δ/2). The intensity runs from zero at δ = π, 3π, … to 4I₀ at δ = 0, 2π, … . Energy is not created or destroyed: the bright and dark regions together carry the same total power as the two beams separately, redistributed in space."
        },
        {
          type: "diagram",
          kind: "michelson",
          caption:
            "The Michelson layout. The beam splitter divides the source into two perpendicular arms; the returning beams recombine and travel to the observation port. The optical path difference is twice the mirror-position difference because each beam traverses its arm twice.",
          height: 340
        },
        {
          type: "callout",
          tone: "misconception",
          title: "Interference is not a reduction of the total energy",
          body:
            "A dark fringe does not mean the interferometer has absorbed the light. The missing energy appears in the complementary output port — for an ideal lossless splitter, the sum of the two output powers is constant. A real cube absorbs and scatters some light, which is why the two ports do not sum exactly."
        },
        {
          type: "numeric",
          title: "Bright, dark and mid-fringe",
          statement:
            "Two equal beams each deliver 1.0 mW to the detector. What are the maximum, minimum and quarter-wave intensities?",
          latex: "I = 1.0 + 1.0 + 2\\sqrt{1.0\\times1.0}\\cos\\delta = 2.0 + 2.0\\cos\\delta\\ \\text{mW}",
          result: "Maximum 4.0 mW at δ = 0; minimum 0 mW at δ = π; 2.0 mW at δ = π/2."
        }
      ]
    },
    {
      id: "coherence",
      number: "3",
      title: "Coherence: why fringes fade",
      kicker: "Theory",
      blocks: [
        {
          type: "lead",
          text:
            "No real source is perfectly monochromatic or perfectly point-like. The finite spectrum and finite source size make the fringe visibility fall as the path difference grows. Coherence is the quantitative statement of how much path difference the source can tolerate."
        },
        {
          type: "p",
          text:
            "Temporal coherence describes the correlation between the field and a delayed copy of itself. A source with spectral width Δλ has a coherence time τc of order 1/Δν and a coherence length Lc = cτc. For a Gaussian line shape the standard order-of-magnitude relation is"
        },
        {
          type: "eq",
          latex: "L_c \\approx \\frac{\\lambda^2}{\\Delta\\lambda}",
          number: "3.1",
          note:
            "The numerical prefactor depends on the line shape and on how Lc is defined. Use this expression for estimates and quote the convention whenever a value is compared with a datasheet."
        },
        {
          type: "table",
          caption: "Typical coherence lengths for the teaching sources (Gaussian FWHM convention)",
          head: ["Source", "λ (nm)", "Δλ (nm)", "Lc ≈ λ²/Δλ"],
          rows: [
            ["He–Ne laser", "632.8", "0.002", "0.20 m"],
            ["DPSS 532 laser", "532", "0.1", "2.8 mm"],
            ["Green LED", "530", "30", "9.4 µm"],
            ["White light", "550", "200", "1.5 µm"]
          ],
          align: ["l", "r", "r", "r"]
        },
        {
          type: "p",
          text:
            "Spatial coherence is the analogous correlation between fields at two transverse points. A laser operating in a single transverse mode is spatially coherent across its beam; an LED or a lamp is not. Passing an extended source through a pinhole restores spatial coherence, at the cost of intensity, because the pinhole selects a small patch of the wavefront. In a Michelson interferometer the two recombined beams must also overlap in direction and position: a transverse shift produces a fringe pattern that averages to low contrast across the detector."
        },
        {
          type: "diagram",
          kind: "coherence",
          caption:
            "Temporal coherence visualised as a field with a long correlation time (top) and a short correlation time (bottom). The envelope, not the fast optical oscillation, is what the interferometer samples when the path difference is scanned.",
          height: 340
        },
        {
          type: "callout",
          tone: "note",
          title: "Coherence length is not the length of the beam",
          body:
            "A laser beam can be metres long in space and still have a coherence length of centimetres if it contains several longitudinal modes. Coherence length refers to the path-difference range over which fringes remain visible, not to the physical extent of the beam."
        },
        {
          type: "p",
          text:
            "The simulator multiplies the ideal visibility by a Gaussian envelope exp[−(Δ/Lc)²]. This is a convenient model, not a universal law: a multimode laser produces a visibility that oscillates as modes alternately add and cancel, and a source with a structured spectrum produces a more complicated envelope. The envelope is nevertheless the right first picture, and it explains the central experimental fact that white-light fringes exist only near zero path difference."
        }
      ]
    },
    {
      id: "opd",
      number: "4",
      title: "Optical path difference, phase and fringe order",
      kicker: "Theory",
      blocks: [
        {
          type: "lead",
          text:
            "The interferometer compares optical paths, not geometrical lengths. In air the distinction is tiny; through glass or a gas it is the whole point of the measurement."
        },
        {
          type: "definition",
          term: "Optical path",
          body:
            "The optical path along a ray is the integral of the refractive index along the geometrical path, ∫n ds. In a uniform medium of length L it is nL. Two paths that differ by one wavelength in optical path differ in phase by 2π."
        },
        {
          type: "p",
          text:
            "Each arm is traversed twice — out to the mirror and back — so a geometrical arm-length difference d₂ − d₁ produces an optical path difference 2(d₂ − d₁) in air. If one arm contains a medium of index n and length L, its optical path is nL instead of L. The general expression for a Michelson with arm lengths d₁ and d₂ and a sample of index n and length t in arm 2 is Δ = 2(d₂ − d₁) + 2(n − 1)t."
        },
        {
          type: "eq",
          latex: "\\Delta = 2\\,(d_2-d_1)",
          number: "4.1",
          note:
            "Air has n ≈ 1.00027, so the vacuum value is accurate to about 3 × 10⁻⁴ of the geometrical difference. That is negligible for wavelength measurement but not for the gas-cell experiment, where the 10⁻⁴ term is the signal."
        },
        {
          type: "p",
          text:
            "The phase difference is δ = 2πΔ/λ. The fringe order m = Δ/λ counts how many wavelengths fit into the path difference; it need not be an integer. At a point where m is an integer the intensity is maximum (for equal beams and a symmetric splitter); at a half-integer it is minimum. As a mirror moves, the local order changes continuously and the brightness oscillates."
        },
        {
          type: "eq",
          latex: "\\delta = \\frac{2\\pi\\Delta}{\\lambda} = \\frac{4\\pi(d_2-d_1)}{\\lambda}",
          number: "4.2",
          note:
            "The sign of Δ determines whether the order increases or decreases, but cos δ is even, so reversing the sign does not change the pattern."
        },
        {
          type: "numeric",
          title: "Order for a 25 µm arm difference",
          statement:
            "The movable mirror is 25.0 µm farther from the splitter than the fixed mirror, and the source is a He–Ne laser at 632.8 nm. Find the optical path difference, the phase difference and the fringe order at the centre.",
          latex:
            "\\Delta = 2(25.0\\ \\mu\\text{m}) = 50.0\\ \\mu\\text{m},\\quad m=\\frac{50.0\\ \\mu\\text{m}}{632.8\\ \\text{nm}}=79.0",
          result: "Δ = 50.0 µm, δ = 4.96 × 10² rad, m = 79.0 fringes."
        },
        {
          type: "callout",
          tone: "lab",
          title: "The number to remember",
          body:
            "One fringe of mirror travel is λ/2, not λ. At 632.8 nm that is 316.4 nm. A 1 µm micrometer step moves the pattern through 3.16 fringes."
        }
      ]
    },
    {
      id: "beam-splitter",
      number: "5",
      title: "What the beam splitter really does",
      kicker: "Instrumentation",
      blocks: [
        {
          type: "lead",
          text:
            "The beam splitter is the most under-appreciated component in the interferometer. It must divide amplitude, preserve coherence and avoid producing a second, unwanted interferometer behind the first one."
        },
        {
          type: "p",
          text:
            "A 50:50 non-polarising cube consists of two right-angle prisms cemented together with a dielectric coating on the diagonal. Light entering the cube is split at the coating: one component is transmitted into the second prism, the other reflected into the first. Because the coating is buried in glass, the reflection takes place in a controlled medium and the cube is relatively insensitive to small angle changes. A plate splitter is a thin parallel slab; its front surface splits the beam, but the back surface also reflects, creating a weak secondary beam and a second set of fringes displaced from the first."
        },
        {
          type: "diagram",
          kind: "beam-splitter",
          caption:
            "Amplitude division at a 50:50 dielectric splitter. A lossless splitter obeys |t|² + |r|² = 1 for each polarisation, and the Stokes relations connect the reflection coefficients on the two sides. Real cubes add absorption, scattering and a small polarisation-dependent splitting.",
          height: 340
        },
        {
          type: "p",
          text:
            "Reflection at a dielectric interface can carry a phase shift of π relative to transmission, depending on which side of the coating the light arrives from. In the ideal symmetric Michelson each returning beam has undergone one reflection and one transmission at the splitter. The two paths therefore acquire the same product of coefficients apart from a possible constant phase; that constant shifts the zero-path-difference fringe but not the λ/2 period used to measure wavelength. An asymmetric coating, a plate without a compensating plate, or a cube with a different coating on each internal face can change the offset and therefore which port is bright at zero path difference."
        },
        {
          type: "table",
          caption: "Cube versus plate beam splitter for a teaching Michelson",
          head: ["Property", "Cube", "Plate"],
          rows: [
            ["Ghost reflections", "Suppressed by the buried coating", "Back-surface reflection produces a weak second fringe set"],
            ["Alignment sensitivity", "Low; the diagonal is fixed inside the cube", "Higher; tilt and wedge matter"],
            ["Dispersion", "Glass path is nearly common to both arms", "Needs a compensating plate of matching thickness"],
            ["Polarisation", "Usually low splitting ratio for s and p", "Can be strongly polarisation-dependent"],
            ["Cost and handling", "Higher; clean only with approved methods", "Lower; fragile coating on exposed faces"]
          ],
          align: ["l", "l", "l"]
        },
        {
          type: "callout",
          tone: "caution",
          title: "Never touch an optical face",
          body:
            "Fingerprints are absorbing, scattering and sometimes permanently damaging to dielectric coatings. Use a blower first, then approved lens tissue and solvent if necessary. Hold a cube by its frosted side faces, never by the polished entrance or exit faces."
        },
        {
          type: "p",
          text:
            "For the white-light experiment, a plate splitter is normally paired with a compensating plate in the other arm so that both beams pass through the same glass thickness. Without compensation, the dispersion of the glass broadens and shifts the white-light envelope, and the central fringe can be difficult to identify. With a cube the two glass paths are closer to equal, but a compensator may still be needed if the cube is not symmetric."
        }
      ]
    },
    {
      id: "alignment",
      number: "6",
      title: "Alignment and the birth of a fringe pattern",
      kicker: "Practice",
      blocks: [
        {
          type: "lead",
          text:
            "A Michelson interferometer does not produce fringes because the components are expensive; it produces them because two wavefronts overlap with a controlled relative angle and a controlled relative displacement. Alignment is the experiment."
        },
        {
          type: "p",
          text:
            "Begin with the beam parallel to the table at a fixed height, typically 100 mm, and use two irises to define that line. Place the beam splitter so the incoming beam hits the centre of the diagonal at 45°. Direct the two outputs to the two mirrors and make each return beam retrace its outgoing path. The autocollimation test — the return spot lands on the source aperture — is the quickest way to set a mirror normal to its arm. Then overlap the two return spots on a card or screen. When the spots coincide, the wavefronts overlap and fringes appear."
        },
        {
          type: "steps",
          items: [
            {
              title: "Set the height",
              body:
                "Use the irises to put the beam at a constant height and parallel to the table. Every optic centre should sit on that line; a beam that climbs or falls will miss a mirror when the stage moves."
            },
            {
              title: "Autocollimate each arm",
              body:
                "With the other arm blocked, adjust the mirror until the return spot comes back onto the source aperture. Do this for both mirrors before trying to see fringes."
            },
            {
              title: "Overlap the returns",
              body:
                "Remove the blocks and place a card at the output. Bring the two spots together with the kinematic adjusters until they form one spot. Fringes should appear as fine stripes or rings within the overlap region."
            },
            {
              title: "Choose the geometry",
              body:
                "Small residual tilt gives straight fringes; a small defocus or wavefront-curvature mismatch gives circular fringes. Reduce the tilt to widen straight fringes, or adjust the axial position to change the ring pattern."
            }
          ]
        },
        {
          type: "p",
          text:
            "The fringe pattern is the interference of two nearly plane wavefronts. If one mirror is tilted by angle α, the round-trip phase varies linearly across the beam, producing straight fringes with spacing Δx = λ/(2α). If the wavefronts have different curvature, the phase varies quadratically with radius and the fringes become concentric rings. Real patterns are a mixture: a small tilt superimposed on curvature gives curved arcs that straighten as the tilt increases."
        },
        {
          type: "diagram",
          kind: "michelson-fringes",
          caption:
            "The same optical layout produces different fringe geometries. A tilt between the returned wavefronts gives straight fringes whose spacing is inversely proportional to the tilt; a curvature mismatch gives circular fringes whose radii depend on the path difference.",
          height: 340
        },
        {
          type: "callout",
          tone: "lab",
          title: "Alignment sequence that works",
          body:
            "Height first, then autocollimation, then overlap, then fringe geometry. Do not adjust the beam splitter and both mirrors at once: change one degree of freedom, observe, and undo it if the spot moves the wrong way."
        },
        {
          type: "p",
          text:
            "The beam diameter matters. A narrow beam produces a small fringe field and makes the pattern sensitive to dust and local air currents. Expanding the beam with a lens gives more fringes across the field and a brighter pattern for a camera, but it also averages over wavefront errors and makes alignment less forgiving. A useful compromise is a beam of 5–10 mm diameter at the observation plane."
        }
      ]
    },
    {
      id: "wavelength",
      number: "7",
      title: "Measuring wavelength from fringe motion",
      kicker: "Measurement",
      blocks: [
        {
          type: "lead",
          text:
            "Move one mirror by a known distance and count how many fringes pass a fixed point. The mirror travel for one fringe is λ/2, so the wavelength follows from a division — provided the travel is known and the count is honest."
        },
        {
          type: "p",
          text:
            "Suppose the movable mirror moves by Δd. Its round-trip optical path changes by 2Δd. Every time that change reaches one wavelength, the phase at the observation point advances by 2π and one fringe passes. Counting N fringes therefore gives 2Δd = Nλ, or"
        },
        {
          type: "eq",
          latex: "\\lambda = \\frac{2\\,\\Delta d}{N}",
          number: "7.1",
          note:
            "Use the magnitude of the travel. If the mirror moves toward the splitter, the order decreases, but the number of fringes is the same."
        },
        {
          type: "derivation",
          derivationId: "wavelength-from-fringes"
        },
        {
          type: "p",
          text:
            "The measurement is simple in principle and demanding in practice. Count many fringes: the relative uncertainty from a one-fringe miscount is 1/N, so 1000 fringes reduce that contribution to 0.1%. Measure a long travel for the same reason, but remember that the micrometer calibration error is systematic and does not average away. Approach the final position from one direction to avoid backlash, and repeat the scan several times to expose hysteresis."
        },
        {
          type: "numeric",
          title: "The 1000-fringe example",
          statement:
            "A student counts 1000 fringes while the mirror moves 0.3164 mm. What wavelength is implied?",
          latex: "\\lambda = \\frac{2(0.3164\\times10^{-3}\\ \\text{m})}{1000}=6.328\\times10^{-7}\\ \\text{m}",
          result: "λ = 632.8 nm, consistent with a He–Ne source."
        },
        {
          type: "callout",
          tone: "note",
          title: "Count at a fixed point",
          body:
            "Do not count the number of fringes visible across the field; that is set by tilt and beam size. Count the fringes that sweep past one chosen point — the centre of the pattern or a marked pixel — as the mirror moves."
        }
      ]
    },
    {
      id: "gas-cell",
      number: "8",
      title: "Refractive index of a gas",
      kicker: "Measurement",
      blocks: [
        {
          type: "lead",
          text:
            "A gas cell in one arm adds an optical path (n − 1)t on each pass. Evacuating the cell removes that path and sweeps the fringes. The number counted gives the refractive index without ever measuring an angle."
        },
        {
          type: "p",
          text:
            "Place a cell of internal length t in one arm, with its windows perpendicular to the beam. When the cell is filled with gas of index n, the one-way optical path through the gas is nt instead of t; the round trip adds 2(n − 1)t to that arm. If the cell is then evacuated, the optical path difference changes by 2(n − 1)t. Counting N fringes during the change gives 2(n − 1)t = Nλ, hence"
        },
        {
          type: "eq",
          latex: "n = 1 + \\frac{N\\lambda}{2t}",
          number: "8.1",
          note:
            "N is the number of fringes crossing the chosen point during evacuation or refill, and t is the gas column length, not the outer cell dimension."
        },
        {
          type: "derivation",
          derivationId: "gas-cell-index"
        },
        {
          type: "p",
          text:
            "For air at room temperature and pressure, n − 1 is about 2.7 × 10⁻⁴, so a 100 mm cell gives only a few dozen fringes at 633 nm. The count is small and the fractional uncertainty can be a few percent unless the cell is long or the pressure is changed by a known larger amount. The gas index is approximately proportional to pressure and inversely proportional to absolute temperature, so record both and reduce the result to a stated reference condition."
        },
        {
          type: "numeric",
          title: "Air in a 100 mm cell",
          statement:
            "Evacuating a 100.0 mm cell at 632.8 nm produces 92 fringes. Find n and n − 1.",
          latex:
            "n-1=\\frac{92(632.8\\times10^{-9}\\ \\text{m})}{2(0.1000\\ \\text{m})}=2.91\\times10^{-4}",
          result: "n = 1.000291, close to the typical 1 atm air value of about 1.00027–1.00029."
        },
        {
          type: "callout",
          tone: "caution",
          title: "Vent and evacuate slowly",
          body:
            "A sudden pressure change can flex or crack the windows and will blur the fringes while the cell is moving. Use a metering valve, stay within the cell's rated pressure, and wait for the fringes to stop drifting before taking the start or end reading."
        }
      ]
    },
    {
      id: "thermal",
      number: "9",
      title: "Thermal expansion of a metal rod",
      kicker: "Measurement",
      blocks: [
        {
          type: "lead",
          text:
            "Heat a rod whose far end pushes a mirror. The rod lengthens by αLΔT, the arm changes length, and the fringes count the expansion in units of λ/2. The result is a direct, absolute measurement of the linear expansion coefficient."
        },
        {
          type: "p",
          text:
            "Mount the rod with one end against a fixed stop and the other against the back of the movable mirror or its mount. As the rod heats, it pushes the mirror by ΔL = αLΔT, where L is the rod length and α the linear expansion coefficient. The round-trip optical path in that arm changes by 2ΔL, so N fringes correspond to 2αLΔT = Nλ. Solving,"
        },
        {
          type: "eq",
          latex: "\\alpha = \\frac{N\\lambda}{2L\\,\\Delta T}",
          number: "9.1",
          note:
            "ΔT is the temperature rise of the rod, measured with a sensor in good thermal contact with it. The factor 2 is the round trip, not a property of the material."
        },
        {
          type: "p",
          text:
            "The method is sensitive but slow. A 0.5 m aluminium rod heated by 10 K expands by about 115 µm, which is roughly 360 fringes at 633 nm — easy to count. A fused-silica rod of the same length expands by only about 2.8 µm, or nine fringes, so the same apparatus needs better temperature control and a longer integration time. Measure the temperature at several points along the rod, or at least wait until the reading stops changing, because the rod's surface and core do not heat at the same rate."
        },
        {
          type: "table",
          caption: "Typical linear expansion coefficients at room temperature (order-of-magnitude values)",
          head: ["Material", "α (10⁻⁶ K⁻¹)", "Expansion of 0.5 m for ΔT = 10 K"],
          rows: [
            ["Aluminium", "23", "115 µm"],
            ["Copper", "17", "85 µm"],
            ["Steel", "12", "60 µm"],
            ["Fused silica", "0.55", "2.8 µm"],
            ["Invar", "1.2", "6 µm"]
          ],
          align: ["l", "r", "r"]
        },
        {
          type: "numeric",
          title: "Aluminium rod, 20 K rise",
          statement:
            "A 0.500 m aluminium rod is heated by 20.0 K and 730 fringes pass. What α does the interferometer report?",
          latex:
            "\\alpha=\\frac{730(632.8\\times10^{-9})}{2(0.500)(20.0)}=2.31\\times10^{-5}\\ \\text{K}^{-1}",
          result:
            "α = 2.31 × 10⁻⁵ K⁻¹, consistent with the tabulated 23 × 10⁻⁶ K⁻¹ for aluminium. If only 120 fringes were counted, the result would be 3.80 × 10⁻⁶ K⁻¹, which would indicate that most of the expansion was taken up by the mount or that the temperature rise was much larger than recorded."
        },
        {
          type: "callout",
          tone: "caution",
          title: "Heat, do not cook",
          body:
            "Use a low-power heater or a warm-water jacket, keep the beam path enclosed, and let the system reach equilibrium before each reading. A hot-air gun creates turbulence that ruins the fringe pattern and produces a temperature gradient that invalidates the single ΔT value."
        }
      ]
    },
    {
      id: "white-light",
      number: "10",
      title: "White-light fringes and the channeled spectrum",
      kicker: "Theory",
      blocks: [
        {
          type: "lead",
          text:
            "With a broadband source the fringes do not disappear; they become localised near zero path difference. That localisation is the most useful alignment signal in interferometry and the basis of a whole family of spectrometers."
        },
        {
          type: "p",
          text:
            "A white-light source contains many wavelengths. At a given path difference each wavelength produces its own fringe pattern, but the patterns have different periods and drift out of step as the path difference grows. Within one coherence length they still add constructively near Δ = 0; beyond it they average to a uniform intensity. The result is a few coloured fringes around a central fringe that is nearly white, with the contrast falling away on both sides."
        },
        {
          type: "p",
          text:
            "The central fringe is the place where all wavelengths are simultaneously at the same phase. It is therefore the best zero-order marker available: if you can identify it, you know the two arms are equal to within a fraction of a micrometre. This is how a Michelson interferometer is zeroed before a precision scan, and how the compensating plate is adjusted in a plate-splitter instrument."
        },
        {
          type: "p",
          text:
            "If the recombined light is dispersed by a grating or a prism instead of being imaged directly, the interference produces a channeled spectrum: a periodic modulation of intensity versus wavelength, with a period that depends on the path difference. The spectrum and the interferogram are a Fourier-transform pair. Measuring the interferogram and transforming it gives the source spectrum; this is the principle of Fourier-transform infrared spectroscopy."
        },
        {
          type: "callout",
          tone: "lab",
          title: "Finding white-light fringes",
          body:
            "Start with the laser, align for straight fringes, then replace the laser with the white-light source without touching the mirrors. Scan the micrometer slowly around the position where the arms are nearly equal. The white-light fringes occupy only a few micrometres of travel, so a fast scan can step over them. Use the micrometer's fine drive and watch for a sudden burst of coloured fringes on a uniform background."
        },
        {
          type: "numeric",
          title: "How wide is the white-light packet?",
          statement:
            "A white-light source has λ = 550 nm and Δλ = 200 nm. Estimate its coherence length and the mirror-travel range over which fringes survive.",
          latex: "L_c\\approx\\frac{(550\\ \\text{nm})^2}{200\\ \\text{nm}}=1.5\\ \\mu\\text{m}",
          result:
            "Lc ≈ 1.5 µm. Because the mirror moves half the optical path difference, the useful mirror-travel range is only about ±0.75 µm around zero OPD."
        }
      ]
    },
    {
      id: "spectral",
      number: "11",
      title: "From fringes to spectra and gravitational waves",
      kicker: "Applications",
      blocks: [
        {
          type: "lead",
          text:
            "The Michelson interferometer is not only a wavelength meter. It is a Fourier-transform engine, a displacement sensor and, at the largest scale, a gravitational-wave detector."
        },
        {
          type: "p",
          text:
            "The intensity at the output as a function of path difference is the interferogram. For a source with spectral density S(σ), where σ = 1/λ is the wavenumber, the interferogram is the cosine transform of S(σ). A narrow spectral line gives a long, slowly decaying oscillation; a broad spectrum gives a short packet. The maximum path difference sets the spectral resolution: the larger the scan, the finer the detail that can be recovered. Apodisation and phase correction are needed in practice because the interferogram is finite and not sampled at every possible path difference."
        },
        {
          type: "table",
          caption: "Where the same measurement appears",
          head: ["Application", "What is measured", "Typical scale"],
          rows: [
            ["Laser wavelength metrology", "Fringe count versus mirror travel", "Nanometres of wavelength"],
            ["Gas refractometry", "Fringe count on pressure change", "10⁻⁴ in n"],
            ["Dilatometry", "Fringe count versus temperature", "10⁻⁶ K⁻¹ in α"],
            ["FTIR spectroscopy", "Interferogram versus OPD", "Centimetres of OPD"],
            ["Optical coherence tomography", "Low-coherence interference versus depth", "Micrometres of depth"],
            ["Gravitational-wave detection", "Differential arm length", "10⁻¹⁹ m in a 4 km arm"]
          ],
          align: ["l", "l", "l"]
        },
        {
          type: "p",
          text:
            "In optical coherence tomography the short coherence length is an advantage: only light that has travelled almost exactly the same distance in the sample and the reference arm interferes, so the depth of the scattering layer is encoded in the position of the white-light packet. In LIGO the arms are kilometres long, the mirrors are suspended as pendulums, and the signal is a differential strain of order 10⁻²¹; the optical layout is still a Michelson, but the technical apparatus around it — vacuum, seismic isolation, squeezed light, resonant cavities — is what makes the measurement possible."
        },
        {
          type: "callout",
          tone: "note",
          title: "What this bench model does not do",
          body:
            "The simulation computes a monochromatic or Gaussian-spectrum interference pattern. It does not Fourier-transform a measured interferogram, model detector noise, or reproduce the multi-mode structure of a real laser. Those are separate exercises, and the FTIR and OCT links below are the places to continue."
        }
      ]
    },
    {
      id: "sensitivity",
      number: "12",
      title: "Sensitivity, precision and the error budget",
      kicker: "Metrology",
      blocks: [
        {
          type: "lead",
          text:
            "A Michelson interferometer can resolve a mirror displacement of a fraction of a nanometre in a quiet laboratory, but only if the error budget is understood. Counting fringes is the easy part; knowing what the count means is the measurement."
        },
        {
          type: "p",
          text:
            "The basic sensitivity is one fringe per λ/2 of mirror travel. At 632.8 nm that is 316.4 nm per fringe, or about 1.8 nm per degree of phase. A photodiode can interpolate between fringes to roughly 1/100 of a fringe in a teaching setup, and to 1/1000 or better with modulation and lock-in detection. The limit is not the optical wavelength but the stability of the path difference: air currents, table vibration, thermal expansion of mounts and laser frequency drift all move the phase."
        },
        {
          type: "p",
          text:
            "For a wavelength measurement, the relative uncertainty is the quadrature sum of the relative travel uncertainty and the relative fringe-count uncertainty. The travel term includes micrometer calibration, backlash and the finite resolution of the readout; the count term includes miscounts and the ambiguity of deciding when a fringe has completed. Both are reduced by measuring a long travel and many fringes, but only the random part averages down with repetition."
        },
        {
          type: "eq",
          latex:
            "\\frac{\\sigma_\\lambda}{\\lambda}=\\sqrt{\\left(\\frac{\\sigma_{\\Delta d}}{\\Delta d}\\right)^2+\\left(\\frac{\\sigma_N}{N}\\right)^2}",
          number: "12.1",
          note:
            "This treats σ_Δd and σ_N as independent standard uncertainties. A calibration error in the micrometer is systematic and should be quoted separately; it shifts all runs in the same direction."
        },
        {
          type: "numeric",
          title: "A realistic teaching budget",
          statement:
            "A scan of 0.500 mm has a travel uncertainty of 0.005 mm, and 1580 fringes are counted with an uncertainty of one fringe. What is the relative and absolute wavelength uncertainty?",
          latex:
            "\\frac{\\sigma_\\lambda}{\\lambda}=\\sqrt{(0.01)^2+(1/1580)^2}\\approx1.0\\times10^{-2}",
          result: "σλ/λ ≈ 1.0%, or about 6.3 nm at 632.8 nm. The travel term dominates; counting more fringes alone will not help until the micrometer is calibrated better."
        },
        {
          type: "table",
          caption: "Error budget for a teaching Michelson measurement",
          head: ["Source", "Type", "Typical size", "Control"],
          rows: [
            ["Micrometer calibration", "Systematic", "0.1–1% of travel", "Calibrate against a gauge block or a known stage"],
            ["Backlash and hysteresis", "Systematic", "1–10 µm", "Approach from one direction; repeat"],
            ["Fringe miscount", "Random", "1 fringe", "Count 500–1000; mark the reference point"],
            ["Air-index drift", "Systematic", "10⁻⁶–10⁻⁵ in n", "Enclose the path; measure quickly; monitor T and p"],
            ["Table vibration", "Random", "Fraction of a fringe", "Damped table; average; shorten exposure"],
            ["Thermal expansion of mounts", "Systematic", "Micrometres per kelvin", "Warm up; control room temperature"],
            ["Tilt and cosine error", "Systematic", "Second order in tilt", "Autocollimate; keep tilt below 1 mrad"],
            ["Detector nonlinearity", "Systematic", "1–5% of visibility", "Attenuate; calibrate against a power meter"]
          ],
          align: ["l", "l", "l", "l"]
        },
        {
          type: "callout",
          tone: "principle",
          title: "Precision is not accuracy",
          body:
            "Averaging a thousand scans can give a wavelength with a tiny statistical error and still be wrong by a percent because the micrometer reads 1% short. Always report the systematic budget alongside the random error, and check the result against an independent method — the source label, a grating spectrometer, or a second laser of known wavelength."
        }
      ]
    }
  ],
  equations: [
    {
      id: "eq-opd",
      latex: "\\Delta = 2\\,(d_2-d_1)",
      name: "Michelson optical path difference",
      symbols: [
        { symbol: "\\Delta", meaning: "Optical path difference between the recombined beams", unit: "m" },
        { symbol: "d_2", meaning: "Length of arm 2, from the splitter to mirror 2", unit: "m" },
        { symbol: "d_1", meaning: "Length of arm 1, from the splitter to mirror 1", unit: "m" }
      ],
      interpretation:
        "Each beam travels to its mirror and back, so the optical path difference is twice the difference in arm lengths. A positive Δ means arm 2 is longer.",
      assumptions: [
        "Both arms are in the same uniform medium, normally air with n ≈ 1.",
        "The beam splitter has no differential phase offset beyond a constant absorbed into the zero of Δ."
      ],
      usedIn: ["Wavelength measurement", "Refractive-index measurement", "Thermal expansion"],
      numericExample: {
        statement: "For d₂ − d₁ = 25.0 µm, the optical path difference is 50.0 µm.",
        latex: "\\Delta=2(25.0\\ \\mu\\text{m})=50.0\\ \\mu\\text{m}"
      }
    },
    {
      id: "eq-phase",
      latex: "\\delta=\\frac{2\\pi\\Delta}{\\lambda}=\\frac{4\\pi(d_2-d_1)}{\\lambda}",
      name: "Phase difference from optical path difference",
      symbols: [
        { symbol: "\\delta", meaning: "Relative phase of the two recombined fields", unit: "rad" },
        { symbol: "\\Delta", meaning: "Optical path difference", unit: "m" },
        { symbol: "\\lambda", meaning: "Vacuum wavelength of the source", unit: "m" }
      ],
      interpretation:
        "One wavelength of optical path difference corresponds to 2π of phase. The intensity depends on cos δ, so the pattern repeats every time Δ changes by λ.",
      assumptions: ["Quasi-monochromatic source", "Spatially coherent, well-overlapped beams"],
      usedIn: ["Two-beam interference", "Fringe order", "Visibility"],
      numericExample: {
        statement: "Δ = 50.0 µm at λ = 632.8 nm gives δ = 496 rad, or 79.0 × 2π.",
        latex: "\\delta=\\frac{2\\pi(50.0\\ \\mu\\text{m})}{632.8\\ \\text{nm}}=4.96\\times10^{2}\\ \\text{rad}"
      }
    },
    {
      id: "eq-intensity",
      latex: "I=I_1+I_2+2\\sqrt{I_1I_2}\\,\\cos\\delta",
      name: "Two-beam interference intensity",
      symbols: [
        { symbol: "I", meaning: "Total intensity at the observation point", unit: "W m⁻²" },
        { symbol: "I_1", meaning: "Intensity from arm 1 alone", unit: "W m⁻²" },
        { symbol: "I_2", meaning: "Intensity from arm 2 alone", unit: "W m⁻²" },
        { symbol: "\\delta", meaning: "Relative phase", unit: "rad" }
      ],
      interpretation:
        "The cross term carries the interference. Equal beams give I = 2I₀(1 + cos δ), ranging from 0 to 4I₀.",
      assumptions: [
        "Scalar fields with the same polarisation",
        "Mutual coherence close to one at the observed path difference",
        "Square-law detector averaging over many optical cycles"
      ],
      usedIn: ["Fringe pattern", "Visibility", "Simulation"],
      numericExample: {
        statement: "Two 1.0 mW beams give 4.0 mW at a bright fringe and 0 mW at a dark fringe.",
        latex: "I_{\\max}=4.0\\ \\text{mW},\\quad I_{\\min}=0"
      }
    },
    {
      id: "eq-visibility",
      latex:
        "V=\\frac{I_{\\max}-I_{\\min}}{I_{\\max}+I_{\\min}}=\\frac{2\\sqrt{I_1I_2}}{I_1+I_2}\\,|\\gamma|",
      name: "Fringe visibility",
      symbols: [
        { symbol: "V", meaning: "Fringe visibility, 0 to 1", unit: "dimensionless" },
        { symbol: "I_{\\max}", meaning: "Intensity at a bright fringe", unit: "W m⁻²" },
        { symbol: "I_{\\min}", meaning: "Intensity at a dark fringe", unit: "W m⁻²" },
        { symbol: "\\gamma", meaning: "Complex degree of coherence at the path difference", unit: "dimensionless" }
      ],
      interpretation:
        "Visibility measures how deeply the fringes modulate. Equal beams and full coherence give V = 1; unequal beams or partial coherence reduce it.",
      assumptions: ["Sinusoidal fringes", "Detector response linear over the fringe range"],
      usedIn: ["Coherence", "Alignment", "Error analysis"],
      numericExample: {
        statement: "For I₁ = 4I₂, the balance factor is 2√4/(4+1) = 0.8, so V ≤ 0.8 even with perfect coherence.",
        latex: "V=\\frac{2\\sqrt{4}}{5}=0.80"
      }
    },
    {
      id: "eq-coherence",
      latex: "L_c\\approx\\frac{\\lambda^2}{\\Delta\\lambda}",
      name: "Coherence length of a quasi-monochromatic source",
      symbols: [
        { symbol: "L_c", meaning: "Coherence length", unit: "m" },
        { symbol: "\\lambda", meaning: "Central wavelength", unit: "m" },
        { symbol: "\\Delta\\lambda", meaning: "Spectral full width at half maximum", unit: "m" }
      ],
      interpretation:
        "The broader the spectrum, the shorter the path-difference range over which fringes survive. A white-light source has Lc of a few micrometres; a stabilised laser can have Lc of many metres.",
      assumptions: [
        "Gaussian or smooth spectral line shape",
        "The prefactor is an order-of-magnitude convention; exact values depend on the line shape"
      ],
      usedIn: ["Temporal coherence", "White-light fringes", "Visibility envelope"],
      numericExample: {
        statement: "λ = 632.8 nm and Δλ = 0.002 nm give Lc ≈ 0.20 m.",
        latex: "L_c\\approx\\frac{(632.8\\ \\text{nm})^2}{0.002\\ \\text{nm}}=0.20\\ \\text{m}"
      }
    },
    {
      id: "eq-wavelength",
      latex: "\\lambda=\\frac{2\\,\\Delta d}{N}",
      name: "Wavelength from fringe count",
      symbols: [
        { symbol: "\\lambda", meaning: "Wavelength", unit: "m" },
        { symbol: "\\Delta d", meaning: "Magnitude of the mirror translation", unit: "m" },
        { symbol: "N", meaning: "Number of fringes crossing a fixed point", unit: "dimensionless" }
      ],
      interpretation:
        "One fringe corresponds to λ/2 of mirror travel. The relation is exact for a collimated, well-aligned beam and a translation measured along the beam direction.",
      assumptions: [
        "The mirror moves parallel to the beam axis",
        "No mode hopping or wavelength drift during the scan",
        "The same point in the pattern is monitored throughout"
      ],
      usedIn: ["Wavelength measurement", "Analysis task 1"],
      numericExample: {
        statement: "N = 1000 fringes over Δd = 0.3164 mm gives λ = 632.8 nm.",
        latex: "\\lambda=\\frac{2(0.3164\\ \\text{mm})}{1000}=632.8\\ \\text{nm}"
      }
    },
    {
      id: "eq-spacing",
      latex: "\\Delta x=\\frac{\\lambda}{2\\alpha}",
      name: "Straight-fringe spacing from mirror tilt",
      symbols: [
        { symbol: "\\Delta x", meaning: "Distance between adjacent bright fringes", unit: "m" },
        { symbol: "\\lambda", meaning: "Wavelength", unit: "m" },
        { symbol: "\\alpha", meaning: "Mirror tilt angle relative to the other arm", unit: "rad" }
      ],
      interpretation:
        "A tilt turns phase into a linear ramp across the beam. Doubling the tilt halves the fringe spacing; a tilt of zero gives a uniform field (or circular fringes if the wavefronts are curved).",
      assumptions: ["Small tilt, sin α ≈ α", "Uniform illumination over the observed field", "Flat wavefronts"],
      usedIn: ["Alignment", "Fringe geometry", "Simulation"],
      numericExample: {
        statement: "At 632.8 nm, a 200 µrad tilt gives fringes 1.58 mm apart.",
        latex: "\\Delta x=\\frac{632.8\\ \\text{nm}}{2(200\\ \\mu\\text{rad})}=1.58\\ \\text{mm}"
      }
    },
    {
      id: "eq-gas-index",
      latex: "n=1+\\frac{N\\lambda}{2t}",
      name: "Refractive index from gas-cell fringes",
      symbols: [
        { symbol: "n", meaning: "Refractive index of the gas", unit: "dimensionless" },
        { symbol: "N", meaning: "Fringes counted during evacuation or refill", unit: "dimensionless" },
        { symbol: "\\lambda", meaning: "Wavelength", unit: "m" },
        { symbol: "t", meaning: "Length of the gas column", unit: "m" }
      ],
      interpretation:
        "The round trip through the cell doubles the gas contribution. The window thickness does not appear because it is unchanged by evacuation and therefore common to both readings.",
      assumptions: [
        "The cell is fully evacuated or filled to a known pressure",
        "Temperature is constant during the count",
        "The windows are perpendicular and do not move"
      ],
      usedIn: ["Refractive-index measurement", "Analysis task 2"],
      numericExample: {
        statement: "N = 92, t = 100 mm and λ = 632.8 nm give n = 1.000291.",
        latex: "n=1+\\frac{92(632.8\\ \\text{nm})}{2(100\\ \\text{mm})}=1.000291"
      }
    },
    {
      id: "eq-thermal",
      latex: "\\alpha=\\frac{N\\lambda}{2L\\,\\Delta T}",
      name: "Linear thermal-expansion coefficient from fringes",
      symbols: [
        { symbol: "\\alpha", meaning: "Linear expansion coefficient", unit: "K⁻¹" },
        { symbol: "N", meaning: "Fringes counted during heating", unit: "dimensionless" },
        { symbol: "\\lambda", meaning: "Wavelength", unit: "m" },
        { symbol: "L", meaning: "Initial length of the sample", unit: "m" },
        { symbol: "\\Delta T", meaning: "Temperature rise of the sample", unit: "K" }
      ],
      interpretation:
        "The rod pushes the mirror by αLΔT. The round trip doubles that displacement, so Nλ = 2αLΔT.",
      assumptions: [
        "The sample is free to expand and pushes the mirror without slipping",
        "The temperature is uniform and measured on the sample",
        "Expansion of the mount and the mirror is negligible or calibrated"
      ],
      usedIn: ["Thermal-expansion measurement", "Analysis task 3"],
      numericExample: {
        statement: "N = 730, L = 0.500 m, ΔT = 20.0 K and λ = 632.8 nm give α = 2.31 × 10⁻⁵ K⁻¹.",
        latex: "\\alpha=\\frac{730(632.8\\ \\text{nm})}{2(0.500\\ \\text{m})(20.0\\ \\text{K})}=2.31\\times10^{-5}\\ \\text{K}^{-1}"
      }
    },
    {
      id: "eq-ring",
      latex: "r_m\\approx f\\sqrt{\\frac{m\\lambda}{d}}",
      name: "Radius of circular fringes",
      symbols: [
        { symbol: "r_m", meaning: "Radius of the m-th bright ring in the focal plane", unit: "m" },
        { symbol: "f", meaning: "Focal length of the imaging lens", unit: "m" },
        { symbol: "m", meaning: "Ring order counted from the centre", unit: "dimensionless" },
        { symbol: "d", meaning: "Effective air gap or wavefront sagitta scale", unit: "m" }
      ],
      interpretation:
        "Circular fringes of equal inclination grow as the square root of the order. The rings crowd together at larger radius, which is why a finite camera sensor captures only part of the pattern.",
      assumptions: [
        "Small-angle (paraxial) imaging",
        "Quadratic approximation to the wavefront curvature",
        "Uniform illumination and negligible aberrations"
      ],
      usedIn: ["Fringe geometry", "Alignment"],
      numericExample: {
        statement: "f = 100 mm, m = 1, λ = 632.8 nm and d = 1.0 mm give r₁ = 2.52 mm.",
        latex: "r_1=0.100\\sqrt{\\frac{632.8\\ \\text{nm}}{1.0\\ \\text{mm}}}=2.52\\ \\text{mm}"
      }
    },
    {
      id: "eq-sensitivity",
      latex: "\\frac{\\Delta d}{\\text{fringe}}=\\frac{\\lambda}{2}",
      name: "Displacement sensitivity per fringe",
      symbols: [
        { symbol: "\\Delta d", meaning: "Mirror displacement for one complete fringe", unit: "m" },
        { symbol: "\\lambda", meaning: "Wavelength", unit: "m" }
      ],
      interpretation:
        "A mirror displacement of half a wavelength changes the round-trip path by one wavelength. At 632.8 nm, one fringe is 316.4 nm of mirror travel.",
      assumptions: ["Collimated beam", "Translation along the beam axis", "No medium change in the arm"],
      usedIn: ["Sensitivity", "Fringe counting", "Simulation"],
      numericExample: {
        statement: "At 632.8 nm, a 1.00 µm translation produces 3.16 fringes.",
        latex: "\\frac{1.00\\ \\mu\\text{m}}{316.4\\ \\text{nm}}=3.16"
      }
    },
    {
      id: "eq-uncertainty",
      latex:
        "\\frac{\\sigma_\\lambda}{\\lambda}=\\sqrt{\\left(\\frac{\\sigma_{\\Delta d}}{\\Delta d}\\right)^2+\\left(\\frac{\\sigma_N}{N}\\right)^2}",
      name: "Uncertainty of the wavelength measurement",
      symbols: [
        { symbol: "\\sigma_\\lambda", meaning: "Standard uncertainty of the wavelength", unit: "m" },
        { symbol: "\\sigma_{\\Delta d}", meaning: "Standard uncertainty of the mirror travel", unit: "m" },
        { symbol: "\\sigma_N", meaning: "Standard uncertainty of the fringe count", unit: "dimensionless" }
      ],
      interpretation:
        "Relative errors add in quadrature. Counting more fringes reduces the second term; calibrating the stage reduces the first. The larger term dominates.",
      assumptions: [
        "Travel and count are independent",
        "Uncertainties are small compared with the values",
        "Systematic calibration errors are budgeted separately"
      ],
      usedIn: ["Error analysis", "Analysis task 4"],
      numericExample: {
        statement: "Δd = 0.500 mm ± 0.005 mm and N = 1580 ± 1 give σλ/λ ≈ 1.0%, or 6.3 nm.",
        latex:
          "\\frac{\\sigma_\\lambda}{\\lambda}=\\sqrt{(0.01)^2+(1/1580)^2}=1.0\\times10^{-2}"
      }
    }
  ],
  derivations: [
    {
      id: "two-beam-intensity",
      title: "Two-beam intensity from superposition",
      intro:
        "Start from the scalar fields of the two returning beams and average the square of their sum over an optical period. The result is the interference law used everywhere else in this experiment.",
      steps: [
        {
          label: "1",
          text: "Write the two fields at the detector with a common frequency and a relative phase δ.",
          latex: "E_1=E_{01}\\cos(\\omega t-\\phi_1),\\qquad E_2=E_{02}\\cos(\\omega t-\\phi_2)"
        },
        {
          label: "2",
          text: "Superpose the fields.",
          latex: "E=E_1+E_2"
        },
        {
          label: "3",
          text: "Square the total field and expand. The squared terms give the individual intensities; the cross term contains the phase difference.",
          latex: "E^2=E_1^2+E_2^2+2E_1E_2"
        },
        {
          label: "4",
          text: "Time-average over many optical cycles. The average of cos² is 1/2, and the average of the product of two cosines at the same frequency is (1/2)cos δ.",
          latex:
            "\\langle E^2\\rangle=\\frac{E_{01}^2}{2}+\\frac{E_{02}^2}{2}+E_{01}E_{02}\\cos\\delta"
        },
        {
          label: "5",
          text: "Identify I₁ ∝ E₀₁²/2 and I₂ ∝ E₀₂²/2, and use E₀₁E₀₂ = 2√(I₁I₂) in the same proportionality.",
          latex: "I=I_1+I_2+2\\sqrt{I_1I_2}\\,\\cos\\delta"
        }
      ],
      result: {
        latex: "I=I_1+I_2+2\\sqrt{I_1I_2}\\,\\cos\\delta",
        text:
          "The intensity is the sum of the individual intensities plus a cross term that oscillates with the relative phase. Equal beams give a visibility of one and a peak intensity of four times either beam alone."
      },
      assumptions: [
        "Both fields have the same optical frequency and polarisation",
        "The fields are mutually coherent over the averaging time",
        "The detector averages over many optical cycles but resolves the fringe pattern"
      ]
    },
    {
      id: "wavelength-from-fringes",
      title: "Wavelength from a fringe count",
      intro:
        "The mirror translation is measured in millimetres and the fringe count in whole fringes. The ratio gives the wavelength in nanometres.",
      steps: [
        {
          label: "1",
          text: "Let the movable mirror translate by Δd along the beam axis. Its round-trip path changes by twice that amount.",
          latex: "\\Delta(\\text{path})=2\\Delta d"
        },
        {
          label: "2",
          text: "One complete fringe passes the observation point when the round-trip path changes by one wavelength.",
          latex: "2\\Delta d_{\\text{one fringe}}=\\lambda"
        },
        {
          label: "3",
          text: "For N fringes the path change is N wavelengths.",
          latex: "2\\Delta d=N\\lambda"
        },
        {
          label: "4",
          text: "Solve for the wavelength.",
          latex: "\\lambda=\\frac{2\\Delta d}{N}"
        }
      ],
      result: {
        latex: "\\lambda=\\frac{2\\Delta d}{N}",
        text:
          "A 0.3164 mm translation with 1000 fringes gives 632.8 nm. The relation is exact only if the mirror moves along the beam and the source wavelength is constant during the scan."
      },
      assumptions: [
        "The mirror translates parallel to the beam",
        "The medium in the arm does not change during the scan",
        "The fringe count refers to one fixed observation point"
      ]
    },
    {
      id: "gas-cell-index",
      title: "Refractive index from gas-cell evacuation",
      intro:
        "The cell adds an optical path that disappears when the gas is removed. Counting the fringes during evacuation converts that path change into an index.",
      steps: [
        {
          label: "1",
          text: "With gas of index n in a cell of length t, the one-way optical path through the cell is nt instead of t.",
          latex: "\\Delta(\\text{one way})=(n-1)t"
        },
        {
          label: "2",
          text: "The beam traverses the cell twice, so the round-trip change is twice as large.",
          latex: "\\Delta(\\text{round trip})=2(n-1)t"
        },
        {
          label: "3",
          text: "Evacuating the cell changes the path difference by this amount. N fringes correspond to N wavelengths.",
          latex: "2(n-1)t=N\\lambda"
        },
        {
          label: "4",
          text: "Solve for n.",
          latex: "n=1+\\frac{N\\lambda}{2t}"
        }
      ],
      result: {
        latex: "n=1+\\frac{N\\lambda}{2t}",
        text:
          "The window thickness cancels because it is present in both the filled and evacuated states. A 100 mm cell with 92 fringes at 632.8 nm gives n = 1.000291."
      },
      assumptions: [
        "Complete evacuation or a known final pressure",
        "Constant temperature during the count",
        "No flexing of the cell windows or change in the cell length"
      ]
    }
  ],
  simulation: simulationSpec,
  procedure: [
    {
      id: "safety",
      title: "Safety and risk assessment",
      purpose:
        "Identify the laser class, set up the beam at a safe height and make the optical path safe before any alignment begins.",
      steps: [
        {
          title: "Read the laser label",
          detail:
            "Record the class, wavelength and maximum output power from the label. A 1–2 mW He–Ne is commonly Class 3R; a 532 nm DPSS module may be Class 3B. Do not assume a low-power label is accurate.",
          checkpoint: "The class and wavelength are written in the logbook and match the eyewear marking.",
          caution: "If the label is missing or unreadable, treat the laser as Class 3B or higher until a supervisor confirms otherwise."
        },
        {
          title: "Put on wavelength-specific eyewear",
          detail:
            "Use eyewear with adequate optical density at the source wavelength. Check that the marking covers the laser in use; 532 nm eyewear is not necessarily adequate for 633 nm.",
          checkpoint: "Every person in the room is wearing the correct eyewear before the shutter is opened."
        },
        {
          title: "Set the beam below eye level",
          detail:
            "Keep the beam at table height, typically 100 mm, and never bring it near eye level. Remove watches, rings and reflective jewellery from the beam plane.",
          caution: "Never look into the beam or its specular reflections, even with eyewear. Eyewear reduces but does not eliminate risk."
        },
        {
          title: "Block unused beams",
          detail:
            "Place a beam block at the unused splitter port and a second block for the main beam during adjustment. Use matt, non-reflective blocks, not paper or metal rulers.",
          checkpoint: "Both beam blocks are in place and the beam is contained on the table."
        },
        {
          title: "Control the room",
          detail:
            "Close the door, lower the lights if the source is bright, and remove unnecessary reflective objects. Know where the shutter and mains switch are.",
          caution: "Do not leave a live laser unattended. Block the beam before leaving the bench."
        }
      ]
    },
    {
      id: "inventory",
      title: "Inventory and bench layout",
      purpose:
        "Confirm the kit, plan the footprint and establish a stable, accessible layout before mounting optics.",
      steps: [
        {
          title: "Check the packing list",
          detail:
            "Compare the physical items with the kit list: source, splitter, two mirrors, two kinematic mounts, translation stage, micrometer, lens, screen, blocks and any gas cell or thermal sample.",
          checkpoint: "All required items are present and undamaged; the kit model and serial number are recorded."
        },
        {
          title: "Inspect optical surfaces",
          detail:
            "Look at the splitter and mirrors at a glancing angle under a lamp. Reject chipped, delaminated or heavily contaminated optics and ask for a replacement.",
          caution: "Do not clean a coated surface unless you have been trained; improper wiping can scratch the coating."
        },
        {
          title: "Plan the footprint",
          detail:
            "Lay out the source at one end, the splitter at the centre and the two arms at right angles. Leave room for the stage travel and for a camera or screen at the output.",
          checkpoint: "The stage can travel through its full range without colliding with posts or cables."
        },
        {
          title: "Set the beam height",
          detail:
            "Choose a working height, usually 100 mm, and check that every mount can reach it. Mark the height on a post with a pencil line or a label.",
          checkpoint: "All optic centres can be set to the same height within about 1 mm."
        }
      ]
    },
    {
      id: "source",
      title: "Source and beam height",
      purpose:
        "Launch a straight, stable beam along a defined line and verify that it stays at the working height.",
      steps: [
        {
          title: "Warm up the source",
          detail:
            "Allow the laser to warm up for the time stated in its manual, typically 10–20 minutes, so that the output power and pointing are stable.",
          checkpoint: "The output power changes by less than a few percent over a minute."
        },
        {
          title: "Align to two irises",
          detail:
            "Place an iris close to the source and another about 300 mm away. Adjust the source mount until the beam passes through both centres without clipping.",
          checkpoint: "The beam is centred in both irises and remains centred when the far iris is moved closer."
        },
        {
          title: "Check for beam walk",
          detail:
            "Slide the far iris along the bench and watch the spot. If the spot moves, the beam is not parallel to the table or the source is pointed off-axis.",
          caution: "Use a card or a beam block to find the beam; never use your hand or eye."
        },
        {
          title: "Expand only if needed",
          detail:
            "For circular fringes and camera work, insert the f = 100 mm lens to expand the beam. Keep the lens centred and do not focus the beam to a small spot on a mirror or the splitter.",
          checkpoint: "The expanded beam is centred on the splitter and does not clip on any mount."
        }
      ]
    },
    {
      id: "splitter-mirrors",
      title: "Beam splitter and mirror alignment",
      purpose:
        "Divide the beam at 45°, make each return beam retrace its outgoing path and overlap the two returns.",
      steps: [
        {
          title: "Mount the splitter",
          detail:
            "Place the cube so the incoming beam hits the centre of the diagonal at about 45°. The two outputs should be roughly perpendicular and at the same height.",
          checkpoint: "Both output beams are at the working height and the splitter is not tilted about the beam axis."
        },
        {
          title: "Block one arm at a time",
          detail:
            "Block arm 2 and work on arm 1. Adjust mirror 1 until its return spot lands on the source aperture or on a card at the source plane.",
          checkpoint: "The return spot from arm 1 is centred on the outgoing spot."
        },
        {
          title: "Repeat for the second arm",
          detail:
            "Move the block to arm 1 and align mirror 2 the same way.",
          checkpoint: "Both return spots independently retrace the outgoing beam."
        },
        {
          title: "Overlap the returns",
          detail:
            "Remove both blocks and place a white card at the output. Use the kinematic adjusters to bring the two spots together until they form a single spot with fine structure.",
          checkpoint: "A fringe pattern is visible on the card or camera."
        },
        {
          title: "Set equal arms",
          detail:
            "Measure the two arm lengths from the splitter to the mirrors and adjust the stage so they are equal to within a few millimetres. This is essential for white-light work and helpful for coherence.",
          checkpoint: "The arm lengths differ by less than the stage travel and preferably by less than 10 mm."
        },
        {
          title: "Protect the unused port",
          detail:
            "Keep a beam block at the unused splitter port throughout the experiment. The rejected beam is as bright as the measuring beam.",
          caution: "Do not rely on the beam block being out of the way for a later step; check it every time you change the layout."
        }
      ]
    },
    {
      id: "fringes",
      title: "Fringe optimisation",
      purpose:
        "Choose circular or straight fringes, maximise visibility and place the pattern where the detector can see it.",
      steps: [
        {
          title: "Reduce the tilt",
          detail:
            "Turn the kinematic adjusters in small increments until the fringe spacing is a few millimetres. Large tilts give many fine fringes that a camera may alias.",
          checkpoint: "The fringes are resolved by eye or camera and do not shimmer."
        },
        {
          title: "Try circular fringes",
          detail:
            "Adjust the axial position of one mirror slightly to introduce curvature. Circular fringes should appear when the wavefronts are curved but nearly parallel.",
          checkpoint: "The rings are centred in the beam and their number changes smoothly as the mirror moves."
        },
        {
          title: "Maximise visibility",
          detail:
            "Compare the bright and dark levels. If the dark fringe is not dark, the beams are unequal or not fully overlapped. Adjust the overlap and, if necessary, attenuate the stronger arm.",
          checkpoint: "The dark fringes are visibly darker than the bright ones, with V above about 0.5."
        },
        {
          title: "Position the detector",
          detail:
            "Place a photodiode behind a small aperture at the centre of the pattern, or focus the camera on the screen. Do not saturate the detector; use an ND filter if the signal clips.",
          checkpoint: "The detector signal is stable, unsaturated and responds visibly when a fringe moves."
        },
        {
          title: "Record a baseline",
          detail:
            "With the micrometer stationary, record the detector level for about 30 s. Slow drift is a warning that the table or air path is not stable enough for a long count.",
          checkpoint: "The baseline drift is small compared with one fringe over the planned scan time.",
          caution:
            "Do not stare into the bare beam while adjusting the pattern; use a card or the camera display and keep the beam blocked when it is not needed."
        }
      ]
    },
    {
      id: "wavelength",
      title: "Wavelength measurement",
      purpose:
        "Count fringes over a measured translation, repeat the scan and compute the wavelength with an uncertainty.",
      steps: [
        {
          title: "Zero the micrometer",
          detail:
            "Record the initial reading and choose a scan range that keeps the stage away from its end stops. Approach the start position from one direction.",
          checkpoint: "The micrometer reading is recorded and the stage is not at a hard stop."
        },
        {
          title: "Count a long scan",
          detail:
            "Move the mirror slowly and count every fringe crossing the chosen point. A count of 500–1500 fringes gives a good compromise between time and precision.",
          checkpoint: "The count is recorded together with the start and end readings."
        },
        {
          title: "Repeat from the same direction",
          detail:
            "Return to the start by moving beyond it, then approach the start from the same direction as before. Repeat the scan at least three times.",
          checkpoint: "The three counts agree within a few fringes."
        },
        {
          title: "Check for backlash",
          detail:
            "Approach the same nominal position from opposite directions and compare the readings. A difference larger than the micrometer resolution indicates backlash.",
          caution: "Never use the micrometer to push against a hard stop; this damages the thread and biases the reading."
        },
        {
          title: "Compute and compare",
          detail:
            "Calculate λ = 2Δd/N for each run, take the mean and compare with the source label. Quote the standard deviation and the systematic budget separately.",
          checkpoint: "The mean wavelength is within the combined uncertainty of the label, or the discrepancy is explained."
        }
      ]
    },
    {
      id: "gas-thermal",
      title: "Gas cell and thermal expansion",
      purpose:
        "Use the same fringe-counting apparatus to measure a refractive index and a thermal-expansion coefficient.",
      steps: [
        {
          title: "Insert the gas cell",
          detail:
            "Place the cell in one arm with its windows perpendicular to the beam. Re-optimise the overlap and confirm that fringes are still visible.",
          checkpoint: "Fringes are visible through the cell and the cell does not clip the beam."
        },
        {
          title: "Evacuate slowly and count",
          detail:
            "Pump the cell down slowly, counting fringes as the gas is removed. Wait for the pattern to stop drifting before recording the final count.",
          caution: "Stay within the cell's pressure rating and vent slowly to avoid window stress."
        },
        {
          title: "Refill and repeat",
          detail:
            "Vent the cell to atmosphere and count the fringes in the opposite direction. The two counts should agree within a few fringes.",
          checkpoint: "Evacuation and refill counts agree; a large difference suggests a leak or a temperature change."
        },
        {
          title: "Mount the thermal sample",
          detail:
            "Replace the cell with the metal rod, with one end against a fixed stop and the other against the mirror mount. Record the initial temperature and the rod length.",
          checkpoint: "The rod is straight, in contact at both ends and not pre-loading the mirror."
        },
        {
          title: "Heat slowly and record",
          detail:
            "Heat the rod gently, stirring the water bath or using a low-power heater. Record temperature and fringe count at several points as the system warms.",
          caution: "Do not touch the rod or the mirror mount with bare hands during the run; hand heat changes the result."
        },
        {
          title: "Cool and check reversibility",
          detail:
            "Let the rod cool and confirm that the fringes return approximately to their starting position. A permanent offset indicates slip or plastic deformation.",
          checkpoint: "The heating and cooling curves overlap within the experimental uncertainty."
        }
      ]
    },
    {
      id: "white-light-shutdown",
      title: "White-light fringes and shutdown",
      purpose:
        "Locate the zero-order fringe with a broadband source, then close the laboratory safely and leave the kit in a known state.",
      steps: [
        {
          title: "Switch to white light",
          detail:
            "Block the laser, replace it with the white-light source and re-check the beam height. Do not move the mirrors while changing the source if you can avoid it.",
          caution: "The white-light source may be hot; let it cool before handling the housing."
        },
        {
          title: "Find zero OPD",
          detail:
            "Scan the micrometer slowly around the equal-arm position. Look for a sudden packet of coloured fringes on a uniform background; the central fringe is nearly white.",
          checkpoint: "The white-light packet is found and its micrometer position is recorded."
        },
        {
          title: "Identify the central fringe",
          detail:
            "Compare the symmetry of the packet. The central fringe should be the brightest and least coloured; if it is not, adjust the compensating plate or the arm balance.",
          checkpoint: "A clear central fringe is identified and can be returned to repeatably."
        },
        {
          title: "Shut down in order",
          detail:
            "Block the beam, switch off the source, remove eyewear only after the beam is blocked, and cover the optics. Record the final micrometer position and any drift.",
          checkpoint: "The source is off, the beam is blocked and the bench is left tidy."
        },
        {
          title: "Store the kit",
          detail:
            "Return optics to their cases, cap the laser, and leave the stage in the middle of its travel. Report any damage or missing item to the supervisor.",
          checkpoint: "The inventory matches the packing list and the bench is ready for the next group."
        }
      ]
    }
  ],
  observations: [
    {
      id: "fringe-count",
      title: "Fringe count versus mirror displacement",
      purpose:
        "Provide the primary data for the wavelength measurement and its uncertainty.",
      columns: [
        { key: "trial", label: "Trial", type: "text" },
        { key: "startMm", label: "Start reading", unit: "mm", type: "number" },
        { key: "endMm", label: "End reading", unit: "mm", type: "number" },
        { key: "travelMm", label: "Travel Δd", unit: "mm", type: "number" },
        { key: "fringes", label: "Fringes N", type: "number" },
        { key: "wavelengthNm", label: "λ = 2Δd/N", unit: "nm", type: "number" },
        { key: "notes", label: "Notes", type: "text" }
      ],
      guidance:
        "Take at least five scans with N between 500 and 1500. Always approach the start from the same direction. Record the raw start and end readings, not only the difference, so that a later check can detect a transcription error. Note the room temperature and any drift observed.",
      formula: "\\lambda = 2\\Delta d/N"
    },
    {
      id: "gas-cell",
      title: "Gas-cell evacuation and refill",
      purpose:
        "Record the fringe count and the cell conditions needed to extract the refractive index of the gas.",
      columns: [
        { key: "trial", label: "Trial", type: "text" },
        { key: "condition", label: "Condition", type: "text" },
        { key: "pressureKPa", label: "Pressure", unit: "kPa", type: "number" },
        { key: "temperatureC", label: "Temperature", unit: "°C", type: "number" },
        { key: "fringes", label: "Fringes N", type: "number" },
        { key: "cellLengthMm", label: "Cell length t", unit: "mm", type: "number" },
        { key: "index", label: "n", type: "number" }
      ],
      guidance:
        "Run at least one evacuation and one refill cycle, ideally three. Record the pressure and temperature at the start and end of each count. A count that differs by more than a few fringes between evacuation and refill indicates a leak, a temperature change or a counting error. Reduce the result to a stated reference pressure and temperature.",
      formula: "n = 1 + N\\lambda/(2t)"
    },
    {
      id: "thermal",
      title: "Thermal expansion versus temperature",
      purpose:
        "Record the rod length, temperature rise and fringe count for the expansion coefficient.",
      columns: [
        { key: "trial", label: "Trial", type: "text" },
        { key: "material", label: "Material", type: "text" },
        { key: "lengthMm", label: "Length L", unit: "mm", type: "number" },
        { key: "tStartC", label: "T start", unit: "°C", type: "number" },
        { key: "tEndC", label: "T end", unit: "°C", type: "number" },
        { key: "deltaTK", label: "ΔT", unit: "K", type: "number" },
        { key: "fringes", label: "Fringes N", type: "number" },
        { key: "alpha", label: "α", unit: "K⁻¹", type: "number" }
      ],
      guidance:
        "Take five to eight points during slow heating and, if time allows, during cooling. Wait for the temperature reading to stabilise before recording each point. Plot N against ΔT; the slope should be constant if α is constant and the mount is not expanding significantly.",
      formula: "\\alpha = N\\lambda/(2L\\Delta T)"
    }
  ],
  analysis: [
    {
      id: "wavelength-regression",
      title: "Wavelength from a linear regression",
      method:
        "Plot the fringe count N against the mirror travel Δd. According to N = (2/λ)Δd, the slope is 2/λ, so λ = 2/slope. This uses all runs and gives a standard error on the slope.",
      formula: "N = \\frac{2}{\\lambda}\\Delta d",
      steps: [
        "Enter each trial's Δd in metres and N as a dimensionless count.",
        "Fit a straight line through the origin or with a free intercept; report which you chose and why.",
        "Take the slope and its standard error from the fit.",
        "Compute λ = 2/slope and propagate the slope uncertainty.",
        "Compare with the source label and with the mean of the individual λ values."
      ],
      expected:
        "For a He–Ne source, λ should be close to 632.8 nm. A slope near 3.16 × 10⁶ m⁻¹ corresponds to 632.8 nm. A discrepancy larger than the combined uncertainty usually points to a travel calibration error or a systematic miscount."
    },
    {
      id: "refractive-index",
      title: "Refractive index of air or another gas",
      method:
        "Use n = 1 + Nλ/(2t) for each evacuation or refill run, then average and compare with the expected value at the measured temperature and pressure.",
      formula: "n = 1 + \\frac{N\\lambda}{2t}",
      steps: [
        "Convert the cell length to metres and the wavelength to metres.",
        "Compute n for each run and then n − 1, which is the physically interesting small quantity.",
        "Estimate the uncertainty from the count, the cell length and the wavelength.",
        "If the pressure was not exactly 1 atm, scale n − 1 in proportion to pressure and inversely with absolute temperature.",
        "Compare with a tabulated value and discuss the difference."
      ],
      expected:
        "For dry air at about 20 °C and 101 kPa, n − 1 is approximately 2.7 × 10⁻⁴ to 2.9 × 10⁻⁴ near 633 nm. A 100 mm cell should give roughly 85–95 fringes. A result outside this range suggests a leak, a temperature difference or an incorrect cell length."
    },
    {
      id: "thermal-alpha",
      title: "Linear expansion coefficient",
      method:
        "Plot N against ΔT and use α = Nλ/(2LΔT). If several materials are available, compare the slopes for the same geometry.",
      formula: "\\alpha = \\frac{N\\lambda}{2L\\Delta T}",
      steps: [
        "Convert the rod length to metres and the temperature rise to kelvin.",
        "Compute α for each heating run.",
        "Fit N versus ΔT and obtain α from the slope.",
        "Compare with the tabulated value for the stated material.",
        "Check whether the cooling curve returns to the starting point."
      ],
      expected:
        "Aluminium is about 23 × 10⁻⁶ K⁻¹, copper about 17 × 10⁻⁶ K⁻¹ and steel about 12 × 10⁻⁶ K⁻¹. A measured value much lower than the tabulated value often means that the mount, not the rod, absorbed the expansion."
    },
    {
      id: "uncertainty-budget",
      title: "Uncertainty budget and dominant error",
      method:
        "Combine the random and systematic contributions to the wavelength and decide which term limits the experiment.",
      formula:
        "\\frac{\\sigma_\\lambda}{\\lambda}=\\sqrt{\\left(\\frac{\\sigma_{\\Delta d}}{\\Delta d}\\right)^2+\\left(\\frac{\\sigma_N}{N}\\right)^2}",
      steps: [
        "Estimate σ_Δd from the micrometer resolution, calibration and repeatability.",
        "Estimate σ_N from repeated counts and the difficulty of identifying a fringe.",
        "Compute the relative uncertainty for each run and for the mean.",
        "Identify the dominant term and state what would improve it.",
        "Separate systematic terms (calibration, index, tilt) from random terms (vibration, count)."
      ],
      expected:
        "In a typical teaching setup the travel term dominates. Counting more fringes improves the count term but not the calibration; the honest conclusion is often that the micrometer, not the optics, sets the accuracy."
    },
    {
      id: "visibility-coherence",
      title: "Visibility and coherence length",
      method:
        "Measure the maximum and minimum intensity at several path differences, compute V, and fit the decay to a Gaussian envelope.",
      formula: "V(\\Delta)=V_0\\exp[-(\\Delta/L_c)^2]",
      steps: [
        "Record I_max and I_min at each mirror position and compute V = (I_max − I_min)/(I_max + I_min).",
        "Plot V against the optical path difference Δ = 2(d₂ − d₁).",
        "Fit the envelope and extract Lc.",
        "Compare Lc with λ²/Δλ using the source bandwidth.",
        "Check whether the residual visibility at large Δ is limited by beam overlap or by the source spectrum."
      ],
      expected:
        "A narrow-line laser should keep V nearly constant over millimetres. An LED or white-light source should show a rapid decay over a few micrometres. A laser with several longitudinal modes may show a non-monotonic visibility rather than a simple Gaussian."
    }
  ],
  errors: [
    {
      source: "Micrometer backlash and hysteresis",
      type: "systematic",
      effect:
        "The stage position differs from the reading depending on the direction of approach, producing a travel error of several micrometres and a biased wavelength.",
      mitigation:
        "Always approach the measurement position from the same direction. Take up the backlash before recording the start. Repeat a scan in both directions to quantify the hysteresis."
    },
    {
      source: "Micrometer calibration error",
      type: "systematic",
      effect:
        "A scale error of 0.1–1% shifts every wavelength by the same relative amount and does not average away with repetition.",
      mitigation:
        "Check the micrometer against a gauge block, a calibrated stage or a known translation. Record the calibration factor and apply it to all runs."
    },
    {
      source: "Fringe miscount",
      type: "statistical",
      effect:
        "Missing or double-counting one fringe changes λ by 1/N; at N = 100 the error is 1%, at N = 1000 it is 0.1%.",
      mitigation:
        "Count at a fixed point, use a photodiode or camera to make the crossings unambiguous, count 500–1500 fringes, and repeat the scan several times."
    },
    {
      source: "Air refractive-index drift",
      type: "systematic",
      effect:
        "Temperature, pressure and humidity changes alter the optical path in the open arms and cause slow fringe drift, which is easily mistaken for mirror motion.",
      mitigation:
        "Enclose the beam path, let the room stabilise, measure quickly, and monitor temperature and pressure. Use a differential or common-path arrangement where possible."
    },
    {
      source: "Table vibration and acoustic noise",
      type: "random",
      effect:
        "High-frequency phase jitter blurs the fringes, reduces the apparent visibility and makes the crossing times uncertain.",
      mitigation:
        "Use a damped table, shorten the optical paths, avoid touching the bench during a count, and average several runs. A camera with a short exposure can freeze the pattern."
    },
    {
      source: "Mirror tilt and cosine error",
      type: "systematic",
      effect:
        "If the mirror moves at an angle to the beam, the effective path change is 2Δd cos θ rather than 2Δd; the error is second order in θ but can matter at large tilts.",
      mitigation:
        "Autocollimate the mirror and keep the tilt below about 1 mrad. Translate the stage along the beam axis and check that the return spot does not walk during the scan."
    },
    {
      source: "Thermal expansion of mounts and bench",
      type: "systematic",
      effect:
        "A temperature change of 1 K can move a mount by micrometres, adding or subtracting fringes unrelated to the mirror translation.",
      mitigation:
        "Warm up the apparatus, control the room temperature, use low-expansion mounts where possible, and record a baseline drift before and after each scan."
    },
    {
      source: "Detector nonlinearity and saturation",
      type: "systematic",
      effect:
        "A saturated or nonlinear detector compresses the bright fringes, reducing the measured visibility and shifting the inferred fringe positions.",
      mitigation:
        "Attenuate the beam, check the detector response against a power meter, and keep the signal within the linear range. Record the dark level and subtract it."
    }
  ],
  applications: [
    {
      title: "Wavelength and frequency metrology",
      body:
        "The fringe-count method is a direct, traceable way to compare a laser wavelength with a calibrated translation. With stabilised lasers and interferometric stages it reaches parts in 10⁹ and underpins length metrology, wavemeters and laser stabilisation."
    },
    {
      title: "Gas refractometry and pressure sensing",
      body:
        "A gas cell in one arm turns the interferometer into a sensitive refractometer. Because n − 1 is proportional to density, the fringe count can be used to measure pressure, leak rates or the composition of a gas mixture."
    },
    {
      title: "Dilatometry and materials characterisation",
      body:
        "The thermal-expansion measurement is a simple dilatometer. The same principle is used to test alloys, composites and optical materials, and to measure the coefficient of thermal expansion of thin films and coatings."
    },
    {
      title: "Fourier-transform infrared spectroscopy",
      body:
        "Scanning the path difference and recording the interferogram gives the spectrum by Fourier transformation. FTIR instruments use this principle because it combines high throughput with precise wavenumber calibration."
    },
    {
      title: "Optical coherence tomography",
      body:
        "Low-coherence interferometry localises interference to a thin depth slice. OCT uses this to image the retina and other tissue with micrometre resolution, without ionising radiation."
    },
    {
      title: "Gravitational-wave detection",
      body:
        "LIGO and Virgo are Michelson interferometers with kilometre-scale arms. A passing gravitational wave changes the differential arm length; the resulting phase shift is measured with suspended mirrors, vacuum and advanced noise reduction."
    }
  ],
  questions: [
    {
      id: "mcq-1",
      type: "mcq",
      difficulty: 1,
      topic: "Fringe period",
      prompt: "By how much must one mirror move to make the fringe pattern advance by exactly one fringe?",
      options: ["λ/4", "λ/2", "λ", "2λ"],
      answerIndex: 1,
      answer:
        "λ/2. The beam traverses the arm twice, so a mirror displacement d changes the optical path by 2d. One fringe corresponds to a path change of one wavelength, hence d = λ/2.",
      explanation:
        "The factor of two is the most common source of error in this experiment. At 632.8 nm one fringe is 316.4 nm of mirror travel.",
      marks: 1
    },
    {
      id: "mcq-2",
      type: "mcq",
      difficulty: 1,
      topic: "Coherence",
      prompt: "Why are white-light fringes visible only near zero optical path difference?",
      options: [
        "White light has no phase.",
        "The coherence length of white light is only a few micrometres.",
        "The beam splitter absorbs the other wavelengths.",
        "The fringes are too faint to see at large path difference."
      ],
      answerIndex: 1,
      answer:
        "A broadband source has a very short coherence length, Lc ≈ λ²/Δλ. Beyond about Lc the different wavelengths are out of step and their fringe patterns average to a uniform intensity.",
      explanation:
        "For λ = 550 nm and Δλ = 200 nm, Lc is about 1.5 µm. The mirror-travel window is half of that because the path difference is twice the mirror motion.",
      marks: 1
    },
    {
      id: "mcq-3",
      type: "mcq",
      difficulty: 2,
      topic: "Visibility",
      prompt:
        "One arm delivers four times the intensity of the other. With a perfectly coherent source and perfect overlap, what is the maximum fringe visibility?",
      options: ["0.40", "0.80", "0.90", "1.00"],
      answerIndex: 1,
      answer:
        "V = 2√(I₁I₂)/(I₁ + I₂). With I₁ = 4I₂ this is 2√4/(4 + 1) = 4/5 = 0.80. Perfect coherence cannot overcome an intensity imbalance.",
      explanation:
        "The dark fringe is not completely dark when the beams are unequal: I_min = (√I₁ − √I₂)². That residual sets the visibility deficit.",
      marks: 2
    },
    {
      id: "mcq-4",
      type: "mcq",
      difficulty: 2,
      topic: "Beam splitter",
      prompt:
        "A plate beam splitter without a compensating plate can produce a second, weaker fringe pattern. What is the main cause?",
      options: [
        "Reflection from the second (back) surface creates a second interferometer.",
        "The plate absorbs half the light.",
        "The plate changes the laser wavelength.",
        "The plate rotates the polarisation by 90°."
      ],
      answerIndex: 0,
      answer:
        "The back surface of a parallel plate reflects a weak beam in addition to the front-surface reflection. That beam follows a slightly different path and interferes with its own partner, giving a displaced fringe set. A wedge, a compensating plate or a cube suppresses the effect.",
      explanation:
        "The ghost is usually much weaker than the main pattern, but it can distort visibility measurements and make the white-light fringe harder to identify.",
      marks: 2
    },
    {
      id: "mcq-5",
      type: "mcq",
      difficulty: 2,
      topic: "Fringe geometry",
      prompt: "If the tilt between the two returned wavefronts is doubled, what happens to straight fringes?",
      options: ["The spacing doubles.", "The spacing halves.", "The spacing is unchanged.", "The fringes rotate by 90°."],
      answerIndex: 1,
      answer:
        "The spacing is Δx = λ/(2α). Doubling α halves the spacing. The orientation is set by the direction of the tilt, not its magnitude.",
      explanation:
        "A larger tilt increases the transverse phase gradient, so more fringes fit across the same beam diameter.",
      marks: 2
    },
    {
      id: "mcq-6",
      type: "mcq",
      difficulty: 2,
      topic: "Dispersion",
      prompt: "What is the purpose of a compensating plate in a Michelson interferometer with a plate beam splitter?",
      options: [
        "To increase the laser power",
        "To equalise the glass path and dispersion in the two arms",
        "To rotate the polarisation",
        "To block the unused output"
      ],
      answerIndex: 1,
      answer: "The compensating plate adds the same glass thickness to the other arm, so both beams experience similar dispersion and the white-light envelope is not broadened or shifted.",
      explanation:
        "Without compensation, one arm passes through the plate substrate an extra time, which matters when the source has a broad spectrum.",
      marks: 2
    },
    {
      id: "mcq-7",
      type: "mcq",
      difficulty: 2,
      topic: "Wavelength calculation",
      prompt: "A student counts 500 fringes while the mirror moves 0.1582 mm. What wavelength is implied?",
      options: ["532.0 nm", "589.3 nm", "632.8 nm", "1064 nm"],
      answerIndex: 2,
      answer:
        "λ = 2(0.1582 × 10⁻³ m)/500 = 6.328 × 10⁻⁷ m = 632.8 nm, consistent with a He–Ne laser.",
      explanation:
        "Check the factor of two: using Δd/N instead of 2Δd/N would give half the wavelength, 316.4 nm.",
      marks: 2
    },
    {
      id: "mcq-8",
      type: "mcq",
      difficulty: 3,
      topic: "Precision",
      prompt:
        "A student currently counts 100 fringes over 0.0316 mm. Which change most directly improves the precision of the wavelength?",
      options: [
        "Use a brighter source.",
        "Count 1000 fringes over 0.316 mm with the same apparatus.",
        "Increase the detector gain.",
        "Reduce the beam diameter."
      ],
      answerIndex: 1,
      answer: "Counting 1000 fringes reduces the relative counting error from 1% to 0.1% and also reduces the relative effect of the stage resolution. Brightness and gain affect signal-to-noise, not the scale calibration.",
      explanation:
        "The improvement is limited by the systematic calibration of the stage; a longer scan helps only until that term dominates.",
      marks: 3
    },
    {
      id: "num-1",
      type: "numerical",
      difficulty: 1,
      topic: "Fringe period",
      prompt:
        "How far must the mirror move to produce 1200 fringes at λ = 632.8 nm? Give the answer in metres.",
      answer: "Δd = Nλ/2 = 1200 × 632.8 × 10⁻⁹/2 = 3.7968 × 10⁻⁴ m, or 0.3797 mm.",
      numeric: { value: 3.7968e-4, tolerance: 1e-6, unit: "m" },
      hint: "One fringe is λ/2 of mirror travel, not λ.",
      marks: 2
    },
    {
      id: "num-2",
      type: "numerical",
      difficulty: 1,
      topic: "Wavelength calculation",
      prompt:
        "A mirror moves 0.250 mm while 790 fringes pass a fixed point. Calculate the wavelength in metres.",
      answer: "λ = 2(0.250 × 10⁻³)/790 = 6.329 × 10⁻⁷ m, or 632.9 nm.",
      numeric: { value: 6.329e-7, tolerance: 1e-9, unit: "m" },
      marks: 2
    },
    {
      id: "num-3",
      type: "numerical",
      difficulty: 2,
      topic: "Gas cell",
      prompt:
        "Evacuating a 50.0 mm gas cell at 632.8 nm produces 46 fringes. Calculate the refractive index of the gas.",
      answer: "n = 1 + Nλ/(2t) = 1 + 46 × 632.8 × 10⁻⁹/(2 × 0.0500) = 1.000291.",
      numeric: { value: 1.000291, tolerance: 2e-6, unit: "dimensionless" },
      hint: "Use the internal gas length, and remember the round trip.",
      marks: 2
    },
    {
      id: "num-4",
      type: "numerical",
      difficulty: 2,
      topic: "Thermal expansion",
      prompt:
        "A 0.400 m rod is heated by 25.0 K and 75 fringes pass. Calculate its linear expansion coefficient in K⁻¹.",
      answer: "α = Nλ/(2LΔT) = 75 × 632.8 × 10⁻⁹/(2 × 0.400 × 25.0) = 2.37 × 10⁻⁶ K⁻¹.",
      numeric: { value: 2.373e-6, tolerance: 1e-8, unit: "K^-1" },
      marks: 2
    },
    {
      id: "num-5",
      type: "numerical",
      difficulty: 2,
      topic: "Coherence",
      prompt:
        "Estimate the coherence length of a 532 nm source with a 0.10 nm spectral FWHM. Give the answer in metres.",
      answer: "Lc ≈ λ²/Δλ = (532 × 10⁻⁹)²/(0.10 × 10⁻⁹) = 2.83 × 10⁻³ m, or 2.8 mm.",
      numeric: { value: 2.83e-3, tolerance: 5e-5, unit: "m" },
      marks: 2
    },
    {
      id: "num-6",
      type: "numerical",
      difficulty: 2,
      topic: "Visibility",
      prompt:
        "Two beams have intensities in the ratio 0.36. Calculate the maximum fringe visibility for a perfectly coherent source.",
      answer: "V = 2√0.36/(1 + 0.36) = 1.2/1.36 = 0.882.",
      numeric: { value: 0.882, tolerance: 0.002, unit: "dimensionless" },
      hint: "Use the balance factor 2√r/(1 + r) with r = I₁/I₂.",
      marks: 2
    },
    {
      id: "num-7",
      type: "numerical",
      difficulty: 2,
      topic: "Fringe spacing",
      prompt:
        "A mirror is tilted by 200 µrad relative to the other arm. At 633 nm, what is the straight-fringe spacing in metres?",
      answer: "Δx = λ/(2α) = 633 × 10⁻⁹/(2 × 200 × 10⁻⁶) = 1.58 × 10⁻³ m, or 1.58 mm.",
      numeric: { value: 1.5825e-3, tolerance: 1e-5, unit: "m" },
      marks: 2
    },
    {
      id: "short-1",
      type: "short",
      difficulty: 1,
      topic: "Fringe counting",
      prompt: "Why is it better to count 1000 fringes than 100 fringes over the same apparatus?",
      answer:
        "The relative random uncertainty from a one-fringe count error is 1/N, so it falls from 1% at N = 100 to 0.1% at N = 1000. The longer travel also reduces the relative effect of the stage resolution. The systematic calibration error is unchanged and must be budgeted separately.",
      marks: 2
    },
    {
      id: "short-2",
      type: "short",
      difficulty: 2,
      topic: "Coherence",
      prompt: "Why should the two arms be nearly equal in length before looking for white-light fringes?",
      answer:
        "White-light fringes exist only within about one coherence length of zero optical path difference. If the arms differ by more than that, the spectral components are out of step and the pattern averages to a uniform intensity. Equal arms also reduce the effect of source frequency drift and make the zero-order fringe accessible within the stage travel.",
      marks: 2
    },
    {
      id: "short-3",
      type: "short",
      difficulty: 1,
      topic: "Laser safety",
      prompt: "State three rules that must be followed when aligning a visible laser beam on an open optical table.",
      answer:
        "Keep the beam below eye level and never look into it or its specular reflections; wear wavelength-appropriate eyewear and remove reflective jewellery; block every unused beam and the main beam when it is not needed; never leave a live laser unattended. Any three of these, with the reason, earn full marks.",
      marks: 2
    },
    {
      id: "short-4",
      type: "short",
      difficulty: 2,
      topic: "Fringe geometry",
      prompt: "What determines the orientation and spacing of straight fringes in a Michelson interferometer?",
      answer:
        "The direction of the mirror tilt sets the direction of the phase gradient and therefore the fringe orientation; the magnitude of the tilt sets the spacing Δx = λ/(2α). A tilt about a vertical axis gives vertical fringes, and a tilt about a horizontal axis gives horizontal fringes. Wavefront curvature adds a quadratic term and bends the fringes into arcs or rings.",
      marks: 2
    },
    {
      id: "viva-1",
      type: "viva",
      difficulty: 3,
      topic: "Beam-splitter phase",
      prompt: "Does the π phase shift on reflection at the beam splitter change the fringe spacing in a Michelson interferometer?",
      answer:
        "No. In the ideal symmetric Michelson each returning beam has undergone one reflection and one transmission at the splitter. Any reflection phase therefore enters both paths at most as a constant offset: it can shift which port is bright at zero path difference, but it cannot change the λ/2 period used to measure wavelength. An asymmetric plate or coating adds a constant relative phase, which shifts the white-light fringe but not the fringe spacing.",
      marks: 3
    },
    {
      id: "viva-2",
      type: "viva",
      difficulty: 2,
      topic: "Visibility",
      prompt: "Why does the visibility fall as the path difference increases, even for a laser that looks monochromatic?",
      answer:
        "No laser is perfectly monochromatic. A finite linewidth, multiple longitudinal modes or frequency drift give a finite coherence length. As the path difference approaches Lc, different spectral components accumulate different phases and their fringes move out of step, reducing the measured contrast. Spatial incoherence and imperfect beam overlap can reduce visibility at any path difference.",
      marks: 2
    },
    {
      id: "viva-3",
      type: "viva",
      difficulty: 2,
      topic: "Fringe order",
      prompt: "Distinguish the fringe order m from the number of fringes counted N.",
      answer:
        "The fringe order m = Δ/λ is the number of wavelengths in the optical path difference at a particular instant; it can be large and non-integer. N is the number of complete fringes that pass a fixed point during a scan, equal to the change in order, |Δm| = 2Δd/λ. Counting N does not require knowing the absolute order.",
      marks: 2
    },
    {
      id: "viva-4",
      type: "viva",
      difficulty: 3,
      topic: "Gas cell",
      prompt: "Why does the window thickness of the gas cell not appear in n = 1 + Nλ/(2t)?",
      answer:
        "The windows are present in both the filled and evacuated states, so their optical path is common to the two readings and cancels from the difference. What changes on evacuation is only the gas column of length t. The measurement is therefore a differential one; a constant window thickness or a constant window dispersion does not bias n, although window flexing or a temperature change during the count can.",
      marks: 3
    },
    {
      id: "derivation-1",
      type: "derivation",
      difficulty: 2,
      topic: "Visibility",
      prompt: "Derive V = 2√(I₁I₂)/(I₁ + I₂) for two coherent beams.",
      answer:
        "From I = I₁ + I₂ + 2√(I₁I₂) cos δ, the maximum is I_max = I₁ + I₂ + 2√(I₁I₂) and the minimum is I_min = I₁ + I₂ − 2√(I₁I₂). Then V = (I_max − I_min)/(I_max + I_min) = 4√(I₁I₂)/(2(I₁ + I₂)) = 2√(I₁I₂)/(I₁ + I₂).",
      marks: 4
    },
    {
      id: "derivation-2",
      type: "derivation",
      difficulty: 3,
      topic: "Thermal expansion",
      prompt: "Derive α = Nλ/(2LΔT) for a rod that pushes one mirror.",
      answer:
        "The rod expands by ΔL = αLΔT. The mirror moves by that amount, so the round-trip optical path in its arm changes by 2ΔL. N fringes correspond to a path change of Nλ, so Nλ = 2αLΔT. Rearranging gives α = Nλ/(2LΔT). The factor 2 is the round trip; L is the initial length and ΔT the temperature rise of the rod.",
      marks: 4
    },
    {
      id: "trouble-1",
      type: "troubleshooting",
      difficulty: 2,
      topic: "Alignment",
      prompt:
        "You see two separate spots at the output but no fringes. List the most likely causes and the order in which you would check them.",
      answer:
        "The return beams are not overlapped or not parallel. Check, in order: (1) both return spots independently retrace the outgoing beam (autocollimation); (2) the two spots overlap on a card at the output; (3) the beam splitter is at 45° and both outputs are at the same height; (4) neither beam is clipped by a mount or iris; (5) the path difference is within the coherence length of the source. Overlap first, then parallelism, then coherence.",
      marks: 2
    },
    {
      id: "trouble-2",
      type: "troubleshooting",
      difficulty: 2,
      topic: "Stability",
      prompt:
        "The fringes are visible but drift steadily across the field. What is happening and how would you distinguish air movement from mirror creep?",
      answer:
        "A steady drift means the optical path difference is changing. Air currents and temperature changes alter the refractive index of the open beam path; a loose mirror mount, a settling stage or thermal expansion changes the geometrical path. Distinguish them by enclosing the path or shielding one arm: if the drift slows dramatically, air is dominant. Tap the table gently or watch the drift direction after touching a mount to test for mechanical creep. Record the drift rate before and after a warm-up period.",
      marks: 2
    },
    {
      id: "trouble-3",
      type: "troubleshooting",
      difficulty: 3,
      topic: "White light",
      prompt:
        "The laser fringes are excellent, but replacing the laser with a white-light source gives a uniform field. What should you check?",
      answer:
        "The most likely cause is that the optical path difference is outside the coherence length (a few micrometres). Check that the arms are equal to within a millimetre and scan slowly around that position with the fine micrometer. Also check that the compensating plate is present and correctly oriented, that the white-light beam is actually entering the same aperture, and that the detector is not saturating on the brighter broadband background. The white-light packet occupies only about ±Lc/2 of mirror travel, so a fast scan can miss it.",
      marks: 3
    },
    {
      id: "instrument-1",
      type: "instrumentation",
      difficulty: 2,
      topic: "Detection",
      prompt:
        "When would you use a camera rather than a photodiode to record Michelson fringes?",
      answer:
        "Use a camera when you need the spatial pattern: circular versus straight fringes, fringe orientation, visibility across the field, or the shape of the white-light packet. Use a photodiode with a small aperture when you need a fast, linear, low-noise signal at one point for counting or for a lock-in measurement. A camera has finite frame rate and exposure and can alias fast fringe motion; a photodiode has no spatial information. For counting hundreds of fringes, the photodiode is usually the better choice.",
      marks: 2
    },
    {
      id: "instrument-2",
      type: "instrumentation",
      difficulty: 3,
      topic: "Translation stage",
      prompt:
        "How would you characterise the backlash and calibration of the micrometer stage before trusting a wavelength measurement?",
      answer:
        "Approach a series of nominal positions from one direction, record the reading, then approach the same positions from the opposite direction and record the difference; the average difference is the backlash. For calibration, compare the stage reading with an independent displacement sensor or a gauge block over the full travel, fit reading versus true displacement, and use the slope as a correction factor. Repeat at several temperatures and after taking up the backlash. Report the residual scatter as the stage repeatability.",
      marks: 3
    },
    {
      id: "mic-x1",
      type: "short",
      difficulty: 2,
      topic: "Coherence length",
      prompt:
        "With the white-light source you see only a few coloured fringes near zero OPD, while the He–Ne still shows fringes after millimetres of mirror travel. What limit have you reached in each case, and how would you use the white-light observation to estimate its coherence length?",
      answer:
        "The white-light fringes are limited by its short coherence length, of order 1.5 µm for a 550 nm source with a 200 nm FWHM; the He–Ne line is much narrower, so its coherence length is of order 0.2 m and the pattern survives millimetres of mirror travel. The white-light visibility falls because the spectral components accumulate different phases as the optical path difference grows; beyond about one coherence length their fringes average to a uniform background. The visible packet extends over roughly ±Lc/2 of mirror travel because Δ = 2Δd. Estimate Lc from twice the half-width of the packet in mirror travel, or, better, measure V at several positions and fit V = V0 exp[−(Δ/Lc)²] to find the 1/e point. A single visual disappearance is only an order-of-magnitude estimate.",
      marks: 3
    },
    {
      id: "mic-x2",
      type: "short",
      difficulty: 2,
      topic: "Bench practice",
      prompt:
        "While counting fringes you gently tighten a kinematic mount that was supposed to be locked, and the whole pattern suddenly walks sideways. What has happened, and why should you not simply continue the count?",
      answer:
        "Tightening the mount changed the mirror pointing and possibly its axial position, so the returned wavefront shifted and the fringe pattern moved. The count is no longer referenced to the same optical path difference: the jump adds or subtracts an unknown number of fringes and may also change the tilt and overlap. Stop the scan, block the beam, re-check autocollimation and overlap, let the mount settle, mark a new start position or re-zero, and repeat the measurement. If the mount moves again when touched, inspect the thread and the locking screw; a cross-threaded or loose mount must be fixed before taking data. Record the event in the notebook rather than hiding a discontinuity.",
      marks: 2
    },
    {
      id: "mic-x3",
      type: "short",
      difficulty: 2,
      topic: "Gas cell",
      prompt:
        "A gas cell sits in one arm. You evacuate it and count N fringes. Explain why the optical path change is 2(n − 1)t rather than (n − 1)t, and state the error in n if you forget the factor of two.",
      answer:
        "The beam passes through the cell twice — once on the way to the mirror and once on the return — so each pass contributes (n − 1)t of extra optical path. The round-trip change is therefore 2(n − 1)t, and Nλ = 2(n − 1)t gives n = 1 + Nλ/(2t). If you forget the factor of two and use n = 1 + Nλ/t, you double the inferred n − 1; for air with n − 1 ≈ 2.7 × 10⁻⁴ you would report about 5.4 × 10⁻⁴, nearly twice the correct value. The cell windows cancel because they are present in both the filled and evacuated states.",
      marks: 2
    },
    {
      id: "mic-x4",
      type: "troubleshooting",
      difficulty: 2,
      topic: "Visibility",
      prompt:
        "The fringes are visible but the dark fringes are grey rather than black, and the pattern is faint. List the likely causes in the order you would check them, and give a fix for each.",
      answer:
        "Start with beam overlap and arm balance, because they are the most common and easiest to correct. (1) The two return spots are not perfectly overlapped or are slightly different sizes: adjust the kinematic mounts and the beam expander to make the wavefronts coincide; check that neither beam is clipped by an iris or mount. (2) The arm intensities are unequal because the splitter is not exactly 50:50, one mirror has lower reflectivity, or one path suffers more loss: measure the two return powers separately and attenuate the stronger arm with a neutral-density filter rather than turning up the detector gain. (3) The source is spatially incoherent or the path difference is outside the coherence length: use a pinhole or a single transverse mode, and reduce the OPD. (4) The detector is saturating or nonlinear: attenuate the beam and check the signal against a power meter. Clean optics and a stable mount come last; a dirty or vibrating mount usually makes the fringes move rather than merely reducing their contrast.",
      marks: 2
    },
    {
      id: "mic-x5",
      type: "troubleshooting",
      difficulty: 3,
      topic: "Vibration",
      prompt:
        "The fringes look sharp on the card, but the photodiode trace is a blur of fast oscillations and the visibility reading jumps. What is the likely cause, how would you confirm it, and what practical fixes would you try?",
      answer:
        "The fringes are being modulated by mechanical or acoustic vibration, not by the micrometer. The interferometer is a sensitive displacement sensor: a table mode, a pump, a fan, a door, or a cable tug can change the arm length by a fraction of a wavelength at tens to hundreds of hertz. Confirm it by watching the photodiode trace with the beam blocked (electrical noise remains; optical vibration disappears), then with the beam open, gently tap the bench or stop nearby equipment and see whether the amplitude or frequency changes. Fix it by using a damped table, shortening the arms and posts, clamping cables, switching off unnecessary pumps and fans, and averaging several scans or using a camera with a short exposure. If the oscillation is periodic, identify the source from its frequency; if it is broadband, improve the isolation.",
      marks: 3
    },
    {
      id: "mic-x6",
      type: "short",
      difficulty: 2,
      topic: "Order-of-magnitude estimate",
      prompt:
        "Estimate how many fringes you expect when a 0.300 m brass rod (α ≈ 19 × 10⁻⁶ K⁻¹) is heated by 15.0 K in one arm of a Michelson interferometer at 633 nm. State your assumptions and give the answer to two significant figures.",
      answer:
        "The rod expands by ΔL = αLΔT = (19 × 10⁻⁶)(0.300)(15.0) = 8.55 × 10⁻⁵ m. The mirror moves by that amount, so the round-trip optical path changes by 2ΔL = 1.71 × 10⁻⁴ m. The number of fringes is N = 2ΔL/λ = 1.71 × 10⁻⁴/633 × 10⁻⁹ ≈ 2.7 × 10², i.e. about 270 fringes. This assumes the rod is free to expand, the mirror follows the rod without slip, the mount and bench expansion are negligible, and the rod reaches a uniform temperature. A real measurement would also include the expansion of the mount, which is why the result is an estimate rather than a calibration.",
      marks: 2
    },
    {
      id: "mic-x7",
      type: "mcq",
      difficulty: 1,
      topic: "Fringe period and units",
      prompt:
        "A mirror on a micrometer stage moves by 2.00 µm. At λ = 633 nm, how many fringes pass a fixed point?",
      options: ["1.58", "3.16", "6.32", "12.6"],
      answerIndex: 2,
      answer:
        "6.32 fringes. The round trip doubles the mirror travel: N = 2Δd/λ = 2(2.00 × 10⁻⁶ m)/(633 × 10⁻⁹ m) = 6.32. The common trap is to use Δd/λ, which gives 3.16 and corresponds to forgetting that the beam traverses the arm twice.",
      explanation:
        "Keep the units consistent: 2.00 µm is 2.00 × 10⁻⁶ m and 633 nm is 633 × 10⁻⁹ m. The factor of two is the round trip, not a unit conversion.",
      marks: 1
    },
    {
      id: "mic-x8",
      type: "numerical",
      difficulty: 1,
      topic: "Wavelength calculation",
      prompt:
        "A mirror translates by 0.180 mm while 569 fringes cross a fixed point. Calculate the wavelength in nanometres.",
      answer:
        "λ = 2Δd/N = 2(0.180 × 10⁻³ m)/569 = 3.60 × 10⁻⁴/569 = 6.327 × 10⁻⁷ m = 632.7 nm. The result is consistent with a He–Ne source. Using Δd/N instead of 2Δd/N would give 316.3 nm, the common factor-of-two error.",
      numeric: { value: 632.7, tolerance: 0.5, unit: "nm" },
      marks: 2
    },
    {
      id: "mic-x9",
      type: "numerical",
      difficulty: 2,
      topic: "Gas-cell refractive index",
      prompt:
        "A 75.0 mm gas cell filled with air is evacuated while the interferometer is illuminated at 532 nm. If 77 fringes pass, calculate the refractive index of the air. Give your answer to six decimal places.",
      answer:
        "n = 1 + Nλ/(2t) = 1 + 77(532 × 10⁻⁹ m)/(2 × 0.0750 m) = 1 + 4.0964 × 10⁻⁵/0.150 = 1.000273. The result corresponds to n − 1 = 2.73 × 10⁻⁴, a plausible value for air near room temperature and one atmosphere. The factor 2 is the double pass through the cell; the window thickness cancels because it is unchanged by evacuation.",
      numeric: { value: 1.000273, tolerance: 1e-6, unit: "dimensionless" },
      marks: 2
    },
    {
      id: "mic-x10",
      type: "viva",
      difficulty: 3,
      topic: "Uncertainty budget",
      prompt:
        "You measure λ = 632.8 nm from a scan with Δd = 0.500 mm ± 0.5% and N = 800 ± 1 fringe. Which uncertainty dominates, what is the combined relative uncertainty, and what would you improve first?",
      answer:
        "The relative travel uncertainty is 0.5% = 5 × 10⁻³. The relative count uncertainty is 1/800 = 1.25 × 10⁻³. Adding in quadrature gives σλ/λ = √[(5 × 10⁻³)² + (1.25 × 10⁻³)²] = √(2.5 × 10⁻⁵ + 1.56 × 10⁻⁶) ≈ 5.15 × 10⁻³, or about 0.52%. The travel term dominates by a factor of four, so counting more fringes will not help much: calibrating the micrometer against a gauge block or an independent displacement sensor, and approaching from one direction to remove backlash, attacks the limiting term. Only after the travel uncertainty is reduced below about 0.1% would the fringe count become the dominant contribution.",
      marks: 3
    }
  ],
  references: [
    refs.hecht!,
    refs.bornwolf!,
    refs.fowles!,
    refs.michelson1887!,
    refs.taylor!,
    refs.saleh!,
    refs.thorlabs_edu!,
    refs.thorlabs_kine!,
    refs.goodman!,
    refs.bevington!,
    refs.edmund_optics!
  ],
  related: ["mach-zehnder-interferometer", "fourier-optics", "optical-tweezers"],
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
