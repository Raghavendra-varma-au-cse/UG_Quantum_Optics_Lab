import type { ExperimentContent } from "@/lib/content/types";
import { FOURIER_SIMULATION_SPEC } from "./physics";

/**
 * Experiment 06 — Fourier optics and 4f spatial filtering.
 *
 * Provenance: a 4f processor is genuine undergraduate apparatus. The numbers,
 * images and tables produced by the interactive bench are numerical model
 * outputs, not measurements, and are labelled as such wherever they appear.
 */
export const fourierOpticsContent: ExperimentContent = {
  slug: "fourier-optics",
  number: "06",
  title: "Fourier Optics & Spatial Filtering",
  shortTitle: "Fourier Optics",
  subtitle: "A lens as a Fourier transformer in a 4f processor",
  summary:
    "Place an object in a 4f system, inspect its numerical Fourier plane and reconstruct the image after low- and high-pass filtering.",
  principle:
    "A converging lens produces the Fraunhofer diffraction pattern — the spatial Fourier transform — at its focal plane.",
  family: "Fourier optics",
  difficulty: 3,
  duration: "3–5 h",
  evidence: {
    implementation: "actual",
    headline: "A 4f spatial-filtering bench is real, standard undergraduate apparatus",
    detail:
      "Two converging lenses of matched focal length, an object transparency (or spatial light modulator) in the front focal plane, a mask in the shared focal plane and a camera or screen at the output are sufficient to demonstrate Fourier-plane filtering. The interactive bench on this page is a numerical simulation of that arrangement: every image is a computed scalar field, not a camera frame, and no simulated number should be reported as a laboratory measurement."
  },
  kit: {
    name: "Undergraduate Fourier-optics / 4f spatial-filtering kit",
    manufacturer: "Thorlabs (educational kit, model unverified)",
    verification: "unverified",
    documentation: [
      {
        title: "Thorlabs document library",
        url: "https://www.thorlabs.com/",
        note:
          "Consult the printed guide and packing list supplied with the physical kit. A model-specific document URL must be recorded after the kit label is verified; it is not asserted here."
      }
    ],
    note:
      "The parts list below is a plausible teaching-laboratory configuration assembled from catalogue categories, not a verified bill of materials. Confirm focal lengths, lens clear apertures, mount threads and the source wavelength against the labels on the hardware before planning the layout."
  },
  hardware: [
    { itemId: "src-he-ne", quantity: "1", role: "kit", note: "632.8 nm, TEM₀₀. The wavelength sets the Fourier-plane scale λf." },
    { itemId: "lens-convex", quantity: "2 (matched f)", role: "kit", note: "L1 and L2, nominally equal focal length for unit magnification." },
    { itemId: "lens-achromat", quantity: "1", role: "recommended", note: "Substitute where chromatic focal shift or spherical aberration is visible." },
    { itemId: "aperture-slit", quantity: "1–2", role: "kit", note: "Object transparency: adjustable double slit, or a fixed pair of slits." },
    { itemId: "aperture-iris", quantity: "2", role: "kit", note: "Beam centring and a variable pupil at the Fourier plane." },
    { itemId: "grating-ruled", quantity: "1", role: "kit", note: "Known period for calibrating the frequency scale." },
    { itemId: "screen-white", quantity: "1", role: "kit", note: "White card for locating the focal and image planes before the camera." },
    { itemId: "det-camera", quantity: "1", role: "kit", note: "USB camera, linear response, no gamma, adjustable exposure." },
    { itemId: "lens-tube-mount", quantity: "2", role: "kit", note: "SM1 lens mounts on the cage axis." },
    { itemId: "cage-system", quantity: "1", role: "kit", note: "Keeps L1, the filter and L2 coaxial and at fixed separation." },
    { itemId: "translation-stage", quantity: "1", role: "kit", note: "Moves the object through the front focal plane and the filter across the axis." },
    { itemId: "optical-table", quantity: "1", role: "kit", note: "Damped surface; the 4f axis should be at a comfortable beam height." },
    { itemId: "beam-block", quantity: "1", role: "kit", note: "Blocks the beam at the output while filters are changed." },
    { itemId: "filter-nd", quantity: "1 set", role: "kit", note: "Keeps the camera below saturation without changing the exposure." }
  ],
  objectives: [
    "Explain why a converging lens forms the spatial Fourier transform of a transparency at its back focal plane, and state the approximations that make the statement true.",
    "Convert between Fourier-plane position, spatial frequency, wavelength and focal length, and calibrate the scale with a known grating.",
    "Distinguish Fresnel from Fraunhofer propagation using the Fresnel number, and explain what the lens changes about that distinction.",
    "Interpret amplitude and phase spectra, including the effect of translation, symmetry and a phase-only object.",
    "Assemble and align a 4f processor, locating the object plane, the shared focal plane and the image plane.",
    "Predict and demonstrate low-pass, high-pass, directional, annulus, dark-field and phase-contrast filtering.",
    "Measure a cutoff spatial frequency and connect it to numerical aperture, point-spread function width and the Abbe resolution limit.",
    "Identify coherence, sampling and alignment limits, and report measured quantities with defensible uncertainties."
  ],
  concepts: [
    "Spatial frequency",
    "Fraunhofer diffraction",
    "Fourier transform",
    "Convolution and impulse response",
    "Spatial filtering",
    "Point-spread function",
    "Numerical aperture",
    "Abbe resolution limit",
    "Coherence",
    "Phase contrast"
  ],
  prerequisites: [
    "Complex numbers, Euler's formula and phasors.",
    "The one- and two-dimensional Fourier transform, convolution and Parseval's theorem.",
    "Thin-lens imaging: focal length, conjugate planes and magnification.",
    "Wave optics: superposition, interference and the diffraction integral.",
    "Basic uncertainty propagation and linear least squares."
  ],
  sections: [
    {
      id: "spatial-frequency",
      number: "01",
      title: "Spatial frequency: the spectrum of a picture",
      kicker: "What a lens sorts",
      blocks: [
        {
          type: "lead",
          text: "A lens does not merely bend light. At its focal plane it sorts a field by how rapidly the field varies across the aperture. A slowly varying background lands near the axis; fine detail lands far away. That sorting is a Fourier transform, and it is the physical basis of every spatial filter in this experiment."
        },
        {
          type: "p",
          text: "Take a transparency with amplitude transmittance U₀(x, y) and illuminate it with a plane wave. A sinusoidal grating of period Λ (in millimetres) varies as cos(2πx/Λ). Its spatial frequency is f_x = 1/Λ cycles per millimetre. A sharp edge is not periodic, so it contains a continuous band of spatial frequencies: the edge is the superposition of many gratings whose amplitudes fall off slowly with frequency. The two-dimensional Fourier transform assigns a complex amplitude to every pair (f_x, f_y) and therefore contains the complete information about the field, apart from the finite window and the finite sampling."
        },
        {
          type: "eq",
          latex:
            "\\tilde{U}(f_x,f_y)=\\iint_{-\\infty}^{\\infty} U(x,y)\\,e^{-i2\\pi(f_x x+f_y y)}\\,\\mathrm{d}x\\,\\mathrm{d}y",
          number: "1",
          note: "The spatial spectrum. f_x and f_y are cycles per millimetre when x and y are in millimetres."
        },
        {
          type: "p",
          text: "The inverse relation reconstructs the field from its spectrum. Nothing is lost in the forward transform: amplitude and phase together carry the object. An image is therefore a sum of plane-wave components, each arriving from a different direction. The angle θ of a component is set by its spatial frequency through sin θ = λ f, which is why the focal plane can separate components that overlap in the object plane."
        },
        {
          type: "eq",
          latex:
            "U(x,y)=\\iint_{-\\infty}^{\\infty}\\tilde{U}(f_x,f_y)\\,e^{+i2\\pi(f_x x+f_y y)}\\,\\mathrm{d}f_x\\,\\mathrm{d}f_y",
          number: "2",
          note: "The inverse transform. A physical field is real, so the spectrum obeys \\tilde U(−f) = \\tilde U*(f); only half the plane is independent."
        },
        {
          type: "p",
          text: "Two consequences will be used repeatedly. First, a translation of the object multiplies the spectrum by a linear phase but leaves its magnitude unchanged. Second, a narrow feature in the object produces a broad spectrum, and a broad feature produces a narrow spectrum. A delta function has a constant spectrum; a constant field has a spectrum concentrated at zero frequency."
        },
        {
          type: "definition",
          term: "Spatial frequency",
          body:
            "The number of cycles of a periodic variation per unit length in the object plane, measured in cycles per millimetre (mm⁻¹) or line pairs per millimetre. It is the conjugate variable to position in the Fourier-transform pair."
        },
        {
          type: "numeric",
          title: "Where a 1 mm grating lands",
          statement:
            "A He–Ne beam at 632.8 nm passes through a grating of period Λ = 1.0 mm and a lens of focal length f = 150 mm. The first-order spatial frequency is f_x = 1/Λ = 1.0 mm⁻¹.",
          latex: "x_f=\\lambda f f_x=(632.8\\times10^{-6}\\,\\mathrm{mm})(150\\,\\mathrm{mm})(1.0\\,\\mathrm{mm}^{-1})=0.095\\,\\mathrm{mm}",
          result: "The first order appears 95 µm from the axis, so the focal-plane scale is roughly 0.1 mm per mm⁻¹ for this lens."
        },
        {
          type: "callout",
          tone: "principle",
          title: "An image is a superposition of gratings",
          body:
            "Every object can be decomposed into sinusoidal gratings of different periods, orientations and phases. A lens focuses each grating to a separate spot or line in its focal plane. Filtering is nothing more than selecting which of those gratings are allowed to recombine."
        }
      ]
    },
    {
      id: "wavefronts",
      number: "02",
      title: "Wavefronts, Huygens–Fresnel and the diffraction integral",
      kicker: "From apertures to fields",
      blocks: [
        {
          type: "p",
          text: "Huygens–Fresnel treats every point of an illuminated aperture as the source of a spherical wavelet. The field beyond the aperture is the coherent sum of those wavelets, each with the phase accumulated over its path and an obliquity factor that suppresses backward propagation. This is not a separate law of optics; it is the Kirchhoff diffraction integral evaluated in the paraxial limit, and it follows from the scalar wave equation."
        },
        {
          type: "p",
          text: "For a field U₀(ξ, η) in the plane z = 0, observed at (x, y, z), the Fresnel (paraxial) form of the integral is a convolution with a quadratic phase kernel. It is the workhorse of this experiment because it is accurate whenever the propagation distance is large compared with the wavelength and the angles are small."
        },
        {
          type: "eq",
          latex:
            "U(x,y,z)=\\frac{e^{ikz}}{i\\lambda z}\\iint U_0(\\xi,\\eta)\\,\\exp\\!\\left\\{\\frac{ik}{2z}\\left[(x-\\xi)^2+(y-\\eta)^2\\right]\\right\\}\\mathrm{d}\\xi\\,\\mathrm{d}\\eta",
          number: "3",
          note: "Fresnel diffraction integral; k = 2π/λ. The quadratic phase is what a lens can cancel."
        },
        {
          type: "p",
          text: "Expand the square in the exponent. The term (x² + y²) does not depend on the source coordinates and comes outside the integral. The cross term −2(xξ + yη) is the kernel of a Fourier transform. The remaining term ξ² + η² is the obstacle: it prevents a plain propagation from being an exact Fourier transform unless it is negligible. This single observation explains both the far-field approximation and the function of a lens."
        },
        {
          type: "steps",
          items: [
            {
              title: "Aperture",
              body:
                "The transparency multiplies the incident field point by point. A binary slit transmits 1 inside the opening and 0 outside; a phase object transmits unit magnitude with a spatially varying phase."
            },
            {
              title: "Propagation",
              body:
                "Each point radiates a wavelet whose phase is quadratic in the transverse distance. The wavelets interfere, producing the Fresnel pattern."
            },
            {
              title: "Far field",
              body:
                "When the quadratic source term is negligible, the integral becomes a Fourier transform. A lens makes that happen at a finite distance by adding the opposite quadratic phase."
            }
          ]
        },
        {
          type: "callout",
          tone: "misconception",
          title: "Diffraction is not a small correction at edges",
          body:
            "Geometric optics is the short-wavelength limit of diffraction, not the other way round. Every finite aperture, every lens rim and every object feature diffracts. A lens can concentrate light, but it cannot remove the finite extent of the pupil, and that finite extent is what ultimately limits resolution."
        }
      ]
    },
    {
      id: "regimes",
      number: "03",
      title: "Fresnel and Fraunhofer: which approximation, when",
      kicker: "One number decides",
      blocks: [
        {
          type: "p",
          text: "The Fresnel number compares the transverse size of the aperture to the size of the first Fresnel zone at the observation distance. Let a be a characteristic half-width of the object or aperture, λ the wavelength and z the propagation distance. Then N_F = a²/(λz). Large N_F means many Fresnel zones contribute and the pattern is a near-field diffraction pattern. Small N_F means the quadratic source phase is negligible and the field is the Fraunhofer (far-field) transform."
        },
        {
          type: "eq",
          latex: "N_F=\\frac{a^2}{\\lambda z}",
          number: "4",
          note: "Fresnel number for a characteristic transverse half-width a. The definition is conventional; state which a you use."
        },
        {
          type: "eq",
          latex:
            "z\\gg\\frac{a^2}{\\lambda}\\quad\\Longleftrightarrow\\quad N_F\\ll1\\quad\\text{(Fraunhofer)}",
          number: "5",
          note: "The far-field condition. It is a strong inequality: at N_F = 0.1 the residual quadratic phase is still visible in careful interferometry."
        },
        {
          type: "table",
          caption: "Regimes for a 3 mm half-width aperture at 632.8 nm",
          head: ["Regime", "Fresnel number", "What is observed", "Typical distance"],
          rows: [
            ["Geometric / near field", "N_F ≫ 1", "Sharp shadow with Fresnel fringes at the edge", "z ≪ 14 m"],
            ["Fresnel diffraction", "N_F ≈ 1", "Curved fringes, pattern changes rapidly with z", "z ≈ 14 m"],
            ["Fraunhofer diffraction", "N_F ≪ 1", "Scaled Fourier transform, fixed shape", "z ≫ 14 m"]
          ],
          align: ["l", "r", "l", "l"]
        },
        {
          type: "numeric",
          title: "Why a lens is not optional",
          statement:
            "For a = 3 mm and λ = 632.8 nm, the Fraunhofer distance is a²/λ = (3 mm)²/(632.8 × 10⁻⁶ mm) ≈ 14.2 m. A teaching bench is about 1 m long.",
          latex: "z_{\\mathrm{Fraunhofer}}\\sim\\frac{(3\\,\\mathrm{mm})^2}{632.8\\times10^{-6}\\,\\mathrm{mm}}=1.42\\times10^{4}\\,\\mathrm{mm}",
          result: "Free-space propagation cannot reach the far field on a bench. A lens of focal length 100–300 mm synthesises the same transform at its back focal plane."
        },
        {
          type: "p",
          text: "The lens does not repeal the diffraction integral. It adds a quadratic phase that cancels the quadratic phase of the propagation from the front focal plane, leaving the Fourier kernel. The focal length can therefore be much shorter than a²/λ. The price is that the lens aperture, not the propagation distance, now sets the maximum spatial frequency that reaches the focal plane."
        },
        {
          type: "callout",
          tone: "note",
          title: "Two different apertures",
          body:
            "The object has a finite window and the lens has a finite clear aperture. The Fourier transform is mathematically exact only for an infinitely wide lens. In practice the lens rim is a hard aperture in the Fourier plane and is the first limitation to check when a predicted high-frequency order is missing."
        }
      ]
    },
    {
      id: "lens-transform",
      number: "04",
      title: "Why a converging lens computes a Fourier transform",
      kicker: "The quadratic phase cancels",
      blocks: [
        {
          type: "p",
          text: "Place a transparency at the front focal plane of a converging lens of focal length f. The field at the back focal plane is, up to a quadratic phase factor and a constant, the Fourier transform of the transparency evaluated at f_x = x_f/(λf). The derivation is short and worth doing once: propagate from the object to the lens, multiply by the thin-lens phase, propagate one focal length to the back focal plane, and watch the quadratic terms cancel."
        },
        {
          type: "derivation",
          derivationId: "lens-ft"
        },
        {
          type: "eq",
          latex:
            "U_f(x_f,y_f)=\\frac{e^{ikf}}{i\\lambda f}\\,e^{\\,i\\frac{k}{2f}\\left(1-\\frac{d}{f}\\right)(x_f^2+y_f^2)}\\,\\tilde{U}_0\\!\\left(\\frac{x_f}{\\lambda f},\\frac{y_f}{\\lambda f}\\right)",
          number: "6",
          note: "Field at the back focal plane for an object a distance d in front of the lens. At d = f the quadratic prefactor is unity."
        },
        {
          type: "p",
          text: "At d = f the prefactor is exactly one: the back focal plane holds the Fourier transform itself. At d ≠ f the magnitude in that plane is unchanged but a quadratic phase remains. A camera records intensity and therefore does not see that phase; a subsequent lens does, and the residual phase becomes defocus in the final image. This is why the object must sit at the front focal plane for a clean 4f system, and why the object-distance control in the simulation changes the sharpness of the reconstruction rather than the size of the spectrum."
        },
        {
          type: "p",
          text: "The physically important statement is the mapping between angle and position. A plane-wave component arriving at angle θ has f_x = sin θ/λ, so it focuses at x_f = λf f_x = f sin θ. The focal plane is a linear angle-to-position converter. That is why the Fourier plane is also called the pupil plane: it is where ray angles become positions."
        },
        {
          type: "callout",
          tone: "lab",
          title: "The quadratic phase is real",
          body:
            "If you place a screen at the back focal plane you see the transform intensity. If you instead relay that plane to a camera, the quadratic phase can affect interferometric measurements. For the intensity filtering in this experiment it drops out, but do not conclude that it does not exist."
        }
      ]
    },
    {
      id: "fourier-plane",
      number: "05",
      title: "Coordinates and scales in the Fourier plane",
      kicker: "Millimetres to inverse millimetres",
      blocks: [
        {
          type: "p",
          text: "For an object of width L sampled on N points, the sampled spectrum has frequency pitch Δf = 1/L and a maximum representable frequency f_max = N/(2L). The focal plane converts those frequencies to positions through x_f = λf f_x, so the physical pitch in the Fourier plane is Δx_f = λf/L and the half-width of the sampled plane is λf N/(2L). The last relation is the one to write on the whiteboard before aligning anything."
        },
        {
          type: "eq",
          latex:
            "f_x=\\frac{x_f}{\\lambda f},\\qquad f_y=\\frac{y_f}{\\lambda f},\\qquad \\Delta x_f=\\frac{\\lambda f}{L},\\qquad f_{\\max}=\\frac{N}{2L}",
          number: "7",
          note: "The scale relations used by the simulator and by the laboratory calibration."
        },
        {
          type: "p",
          text: "Notice how small the Fourier plane is for a macroscopic object. With L = 12 mm, N = 128, λ = 632.8 nm and f = 150 mm, the frequency pitch is 0.083 mm⁻¹, the maximum frequency is 5.33 mm⁻¹, and the physical pixel in the focal plane is only 7.9 µm. The whole half-plane is about 0.51 mm across. A camera can sample that plane only if its pixel pitch is well below 8 µm and the lens mount leaves room at the focus; in practice a short-focal-length relay lens images the plane onto a more accessible sensor."
        },
        {
          type: "table",
          caption: "Sampling of the same 12 mm object window at two FFT sizes",
          head: ["Quantity", "N = 128", "N = 256", "Relation"],
          rows: [
            ["Frequency pitch Δf", "0.0833 mm⁻¹", "0.0833 mm⁻¹", "1/L"],
            ["Maximum frequency f_max", "5.33 mm⁻¹", "10.67 mm⁻¹", "N/(2L)"],
            ["Fourier-plane pitch", "7.91 µm", "7.91 µm", "λf/L"],
            ["Fourier-plane half-width", "0.506 mm", "1.013 mm", "λfN/(2L)"],
            ["Object pixel", "93.8 µm", "46.9 µm", "L/N"]
          ],
          align: ["l", "r", "r", "l"]
        },
        {
          type: "p",
          text: "Two sampling cautions follow. First, increasing N while keeping L fixed does not change the frequency pitch; it extends the frequency range and shrinks the object pixel. Second, the discrete transform treats the object as one period of a periodic tiling. A high-pass filter that removes the mean can therefore produce wrap-around structure at the window edges. Apodising the object or zero-padding the array reduces the artefact, but neither creates information that was not sampled."
        },
        {
          type: "callout",
          tone: "lab",
          title: "Calibrate with a known period",
          body:
            "Put a ruled grating of known period in the object plane and measure the separation of its first orders in the focal plane. The relation Δx = λf/Λ then gives λf, and hence the scale for every other object. Do this before measuring an unknown period."
        }
      ]
    },
    {
      id: "amplitude-phase",
      number: "06",
      title: "Amplitude and phase spectra",
      kicker: "Two numbers per frequency",
      blocks: [
        {
          type: "p",
          text: "The Fourier transform is complex. Its magnitude says how strongly a given grating is present; its phase says where that grating sits. A translation of the object by (x₀, y₀) multiplies the spectrum by exp[−i2π(f_x x₀ + f_y y₀)]. The magnitude image is unchanged, which is why a camera placed at the Fourier plane sees the same pattern when the object is translated sideways. The phase image, by contrast, acquires a linear ramp whose slope encodes the shift."
        },
        {
          type: "p",
          text: "For a real, non-negative transparency the spectrum is Hermitian: the magnitude is centrosymmetric and the phase changes sign under inversion. That symmetry is broken by an asymmetric object such as the letter Q, by a phase object, or by an off-axis aperture. The phase spectrum is therefore a sensitive probe of structure that intensity alone cannot reveal."
        },
        {
          type: "list",
          items: [
            "Magnitude: which spatial frequencies carry energy. A sharp edge has a broad, slowly falling magnitude spectrum.",
            "Phase: the relative alignment of those frequencies. A linear phase is a translation; a quadratic phase is a focus or defocus; a vortex is a phase dislocation.",
            "Symmetry: a centrosymmetric object has a real, even spectrum up to a global phase; asymmetry appears as phase structure.",
            "Energy: Parseval's theorem lets the fraction of energy passed by a filter be computed from the spectrum alone."
          ]
        },
        {
          type: "callout",
          tone: "misconception",
          title: "The bright Fourier photograph is only half the story",
          body:
            "A camera at the Fourier plane records |E|² and loses the phase. Two completely different objects can have the same Fourier magnitude; this is the basis of phase retrieval, and the reason holography or interferometry is needed to measure phase directly. The simulation can display the phase because it has the complex field, not because a camera could."
        },
        {
          type: "p",
          text: "Phase matters physically because a lens recombines amplitudes, not intensities. If the phase of one frequency is changed by a plate, the interference that forms the image changes. That is the mechanism of phase contrast, of aberration correction and of the dark-field image: the filter acts on the complex spectrum, and the camera sees the result after recombination."
        }
      ]
    },
    {
      id: "fourf",
      number: "07",
      title: "The 4f processor and the double diffraction",
      kicker: "Transform, filter, inverse transform",
      blocks: [
        {
          type: "p",
          text: "Place the object at the front focal plane of L1. Its Fourier transform appears at the back focal plane of L1. Put a mask there. A second lens L2, one focal length beyond the mask, forms an image at its back focal plane. The two lenses are separated by f₁ + f₂, hence the name 4f when the focal lengths are equal: object-to-L1 is f, L1-to-filter is f, filter-to-L2 is f, L2-to-image is f. The first lens performs the forward transform; the second performs the inverse transform, and the mask multiplies the spectrum in between."
        },
        {
          type: "diagram",
          kind: "fourier-4f",
          caption:
            "A 4f processor. The object transparency sits at the front focal plane of L1; the filter mask sits at the shared focal plane; L2 forms the filtered image at its back focal plane. The label f_u = x/(λf) is the calibration of the filter plane.",
          height: 300
        },
        {
          type: "p",
          text: "The double diffraction is the whole idea. The first transform spreads the object into its angular components; the mask removes or phase-shifts selected components; the second transform recombines what remains. If the mask is transparent everywhere, the two transforms undo each other and the image is the object (inverted and possibly magnified). If the mask blocks the high frequencies, the image is a blurred version of the object. If it blocks the centre, the image shows edges on a dark background."
        },
        {
          type: "eq",
          latex:
            "U_i(x_i,y_i)=\\frac{1}{M}\\,\\mathcal{F}^{-1}\\!\\left\\{\\mathcal{F}\\{U_0\\}(f_x,f_y)\\,H(f_x,f_y)\\right\\}\\!\\left(\\frac{x_i}{M},\\frac{y_i}{M}\\right),\\qquad M=\\frac{f_2}{f_1}",
          number: "8",
          note: "Image field of an ideal 4f processor. The image is inverted and magnified by M = f₂/f₁; H is the complex pupil function."
        },
        {
          type: "derivation",
          derivationId: "fourf-cascade"
        },
        {
          type: "p",
          text: "The magnification is a geometric consequence of the two focal lengths, not of the filter. With f₂ = f₁ the image has unit magnification and is inverted. With f₂ ≠ f₁ the image is scaled but the frequency cutoff set by the filter in the shared plane is unchanged, because that cutoff is fixed by f₁ and the mask radius. This separation — filter scale set by L1, image scale set by the ratio — is worth checking experimentally."
        },
        {
          type: "callout",
          tone: "principle",
          title: "A 4f processor is an analogue convolution engine",
          body:
            "Multiplication in the Fourier plane is convolution in the image plane. A mask with transfer function H produces an image equal to the object convolved with the inverse transform of H. Low-pass filtering convolves with a broad blur; high-pass filtering convolves with a derivative-like kernel. The lens does the convolution at the speed of light, but only for the field it actually collects."
        }
      ]
    },
    {
      id: "filtering",
      number: "08",
      title: "Spatial filtering: disks, stops, slits and phase plates",
      kicker: "Choosing which gratings survive",
      blocks: [
        {
          type: "p",
          text: "A spatial filter is a complex mask H(f_x, f_y) placed in the Fourier plane. Its action is easiest to read from its shape. A disk centred on the axis is a low-pass filter: it keeps the background and the coarse structure, and removes the fine detail that would have landed outside the disk. A central block is a high-pass filter: it removes the uniform background and the lowest frequencies, leaving edges and fine texture. A narrow slit keeps one direction of frequencies and smears structure in the perpendicular direction. A ring keeps a band of frequencies and produces isotropic edge enhancement. A phase plate of π/2 inside a disk converts a weak phase object into an intensity image."
        },
        {
          type: "eq",
          latex:
            "H(f_x,f_y)=\\begin{cases}1, & \\sqrt{f_x^2+f_y^2}\\le f_c\\\\[2pt] 0, & \\text{otherwise}\\end{cases}\\qquad\\text{(ideal low-pass)}",
          number: "9",
          note: "The ideal disk. Real masks have soft edges, finite thickness and a finite aperture; an apodised edge reduces ringing."
        },
        {
          type: "table",
          caption: "Filter families and their image-domain effect",
          head: ["Mask", "Transmits", "Image effect", "Typical use"],
          rows: [
            ["Open pupil", "All collected frequencies", "Object image, inverted", "Reference and alignment"],
            ["Disk (low-pass)", "|f| ≤ f_c", "Blur; fine detail removed", "Smoothing, noise reduction"],
            ["Central block (high-pass)", "|f| ≥ f_c", "Edges on a dark background", "Edge detection, dark field"],
            ["Vertical slit", "|f_x| ≤ f_c", "Smears along x; keeps horizontal-running structure", "Directional filtering"],
            ["Horizontal slit", "|f_y| ≤ f_c", "Smears along y; keeps vertical-running structure", "Directional filtering"],
            ["Annulus", "f_c ≤ |f| ≤ f_c + Δ", "Isotropic band-pass edges", "Edge enhancement"],
            ["Phase plate", "Unit magnitude, phase step inside f_c", "Phase gradients become intensity", "Phase contrast"]
          ],
          align: ["l", "l", "l", "l"]
        },
        {
          type: "eq",
          latex:
            "f_c=\\frac{a}{\\lambda f}=r\\,f_{\\max},\\qquad f_{\\max}=\\frac{N}{2L}",
          number: "10",
          note: "Cutoff of a circular pupil of radius a in the Fourier plane, expressed through the normalised radius r used by the simulator."
        },
        {
          type: "p",
          text: "The sharp cutoff of an ideal disk is a mathematical convenience. Its impulse response is an Airy pattern with slowly decaying rings, so a hard-edged low-pass filter produces ringing around bright features. A real iris is hard-edged on the scale of its blades and its polygon shape adds diffraction spikes, which is why stopping a lens down changes both the resolution and the character of the point-spread function. Apodising the mask, or using a Gaussian filter, trades a less abrupt cutoff for a cleaner image."
        },
        {
          type: "derivation",
          derivationId: "lowpass-blur"
        },
        {
          type: "numeric",
          title: "A small disk is a strong blur",
          statement:
            "With f_max = 5.33 mm⁻¹, a normalised radius r = 0.2 gives f_c = 1.07 mm⁻¹, a period cutoff of 0.94 mm. The corresponding numerical aperture is NA ≈ λf_c = 6.8 × 10⁻⁴. The axial coherent limit is λ/NA = 0.94 mm; the conventional Abbe value λ/(2NA) = 0.47 mm assumes oblique illumination or incoherent imaging.",
          latex: "f_c=0.2\\times5.33=1.07\\,\\mathrm{mm}^{-1},\\qquad \\Lambda_c=1/f_c=0.94\\,\\mathrm{mm}",
          result: "Features finer than about 1 mm disappear. On a 12 mm object window this is a visible, easily measured blur. The coherent model cuts off at 0.94 mm, not at the factor-of-two smaller Abbe value."
        },
        {
          type: "callout",
          tone: "caution",
          title: "The filter plane is small and the beam is bright",
          body:
            "The focused beam at the Fourier plane can reach high irradiance even from a milliwatt laser. Use the beam block, keep the filter mounted on a translation stage, and never look into the beam while inserting a mask. A misplaced metal stop can scatter light out of the plane and produce a misleading image."
        }
      ]
    },
    {
      id: "reconstruction",
      number: "09",
      title: "Image reconstruction and the meaning of the convolution",
      kicker: "What the second lens does",
      blocks: [
        {
          type: "p",
          text: "Multiplication by H in the Fourier plane is equivalent to convolution with its inverse transform h in the image plane. The function h is the amplitude point-spread function of the system. For an open pupil it is a narrow Airy-like peak; for a low-pass disk it is broad; for a high-pass mask it is a Mexican-hat-like kernel with a negative surround. The image is the object convolved with h, so the filter's effect can be read either in frequency space (which band survives) or in image space (what shape the blur or edge response has)."
        },
        {
          type: "eq",
          latex:
            "\\mathcal{F}\\{U_0*h\\}(f_x,f_y)=\\tilde{U}_0(f_x,f_y)\\,\\tilde{h}(f_x,f_y),\\qquad U_i=U_0*h",
          number: "11",
          note: "The convolution theorem. In the 4f processor the mask H plays the role of \\tilde h."
        },
        {
          type: "p",
          text: "The convolution is coherent: amplitudes add before the detector. Two nearby points do not simply add their intensities; their fields interfere, and the resulting image can show fringes or a phase-dependent response. An incoherent system would convolve intensities and use |h|², doubling the effective cutoff frequency. The simulation is coherent, so its cutoff is the coherent one, f_c = NA/λ, not the incoherent 2NA/λ. State which one you are comparing when you quote a resolution."
        },
        {
          type: "p",
          text: "A high-pass filter is often described as a derivative. For a one-dimensional edge, removing the zero frequency and weighting the remaining frequencies approximately linearly produces a bipolar response: a bright line on one side of the edge and a dark line on the other. That is edge enhancement, and it is also why a high-pass image can look like it has been embossed. A directional slit produces the same effect only for edges perpendicular to the slit direction."
        },
        {
          type: "callout",
          tone: "note",
          title: "Filtering cannot recover unsampled information",
          body:
            "A 4f mask can suppress frequencies that the pupil collected, but it cannot restore frequencies that never entered the pupil. If a feature is smaller than the diffraction limit, no combination of amplitude and phase masks at the Fourier plane will make it reappear with correct contrast. Super-resolution methods use prior knowledge, nonlinearity or multiple measurements; they are not passive filters."
        },
        {
          type: "p",
          text: "The reconstruction panel in the simulation is the normalised intensity |U_i|² after the inverse transform and the f₂/f₁ magnification. A line profile across the centre makes the blur or the edge overshoot quantitative. The profile is the quantity to compare with a model, not the subjective sharpness of the displayed image."
        }
      ]
    },
    {
      id: "resolution",
      number: "10",
      title: "Resolution, numerical aperture and the Abbe limit",
      kicker: "The pupil is a band limit",
      blocks: [
        {
          type: "p",
          text: "A finite pupil transmits a finite band of spatial frequencies. Abbe's argument turns that band limit into a resolution limit. A grating of period d diffracts a normally incident wave into orders at angles sin θ_m = mλ/d. To form an image with contrast, the pupil must collect at least the zeroth and one first order. If the largest collected angle corresponds to a numerical aperture NA = n sin θ_max, then axial coherent illumination gives d_min = λ/NA. Oblique illumination at the optimum angle, or incoherent detection, halves this to the conventional Abbe value λ/(2NA)."
        },
        {
          type: "eq",
          latex: "NA=n\\sin\\theta_{\\max}\\approx\\frac{a}{f}",
          number: "12",
          note: "Numerical aperture of a lens with pupil radius a and focal length f in air (n ≈ 1). The approximation is paraxial."
        },
        {
          type: "eq",
          latex: "d_{\\min}=\\frac{\\lambda}{2\\,NA}",
          number: "13",
          note: "Conventional Abbe limit, valid for oblique illumination at the optimum angle or for incoherent imaging. With axial coherent illumination the cutoff is λ/NA, twice as coarse. The Rayleigh two-point criterion for a circular pupil gives 0.61λ/NA."
        },
        {
          type: "derivation",
          derivationId: "abbe-limit"
        },
        {
          type: "p",
          text: "In the 4f processor the relevant NA is not the f-number of the object illumination; it is the angle subtended by the pupil at the object, which is set by the clear aperture of L1 (or by a smaller iris in the Fourier plane). For the full sampled band of a 12 mm window at f = 150 mm, the paraxial NA is only about 3.4 × 10⁻³, so the coherent cutoff is about 0.19 mm and the conventional Abbe limit about 0.09 mm. That is why a macroscopic 4f bench demonstrates the principle rather than high resolution. A microscope objective reaches NA ≈ 1 by using a short focal length and a large collection angle, and the same relations then give limits near half a wavelength."
        },
        {
          type: "numeric",
          title: "A microscope objective",
          statement:
            "A 0.25 NA objective with 532 nm illumination has a conventional Abbe limit d_min = 532 nm/(2 × 0.25) = 1.06 µm, a Rayleigh two-point limit of 0.61 × 532/0.25 = 1.30 µm, and an axial coherent cutoff of 532/0.25 = 2.13 µm.",
          latex: "d_{\\min}=\\frac{532\\,\\mathrm{nm}}{2(0.25)}=1.064\\,\\mu\\mathrm{m}",
          result: "The conventions differ by factors of two and 1.22. Always state the illumination and the criterion before comparing a measured resolution with a prediction."
        },
        {
          type: "table",
          caption: "Resolution conventions for the same pupil",
          head: ["System", "NA", "λ", "Coherent λ/NA", "Abbe λ/(2NA)", "Rayleigh 0.61λ/NA"],
          rows: [
            ["Macroscopic 4f, f = 150 mm, pupil a ≈ 0.51 mm", "≈ 3.4 × 10⁻³", "632.8 nm", "≈ 188 µm", "≈ 94 µm", "≈ 114 µm"],
            ["10× objective", "0.25", "532 nm", "2.13 µm", "1.06 µm", "1.30 µm"],
            ["Oil immersion", "1.40", "532 nm", "0.38 µm", "0.19 µm", "0.23 µm"]
          ],
          align: ["l", "r", "r", "r", "r", "r"]
        },
        {
          type: "p",
          text: "The camera adds a second sampling limit. If the image is magnified so that the diffraction spot covers at least two pixels, the detector does not dominate. If it covers less, the measured profile is pixel-limited and the fitted width is an upper bound on the optical resolution, not a measurement of it. Report both the optical and the pixel limit."
        }
      ]
    },
    {
      id: "coherence",
      number: "11",
      title: "Coherence: why a laser, and how good is good enough",
      kicker: "The field must be predictable",
      blocks: [
        {
          type: "p",
          text: "The Fourier-plane argument assumes a complex field with a well-defined phase across the object. Temporal coherence controls the path-length range over which that phase is predictable; spatial coherence controls the transverse area over which it is predictable. A single-mode He–Ne laser is excellent on both counts over a teaching bench. A white LED is not: each wavelength produces a differently scaled Fourier plane, and each source point produces a shifted one. The camera sums those intensities, washing out the high-frequency structure and softening the filter edge."
        },
        {
          type: "diagram",
          kind: "gaussian-beam",
          caption:
            "A collimated Gaussian beam is the practical approximation to the plane-wave illumination assumed by the Fourier model. The wavefront is flat only over the central part of the beam and only within the Rayleigh range; the object must sit in that region.",
          height: 260
        },
        {
          type: "p",
          text: "Temporal coherence is characterised by the coherence length l_c ≈ λ²/Δλ for a source of bandwidth Δλ. At 632.8 nm with Δλ = 1 nm, l_c ≈ 0.40 mm. A 4f system with equal arm lengths is well inside that, but a white-light source with Δλ ≈ 300 nm has l_c of order a wavelength and will not produce a stable Fourier plane at all. Spatial coherence is characterised by a coherence area; a focused beam waist or a pinhole can increase it by selecting a single transverse mode."
        },
        {
          type: "numeric",
          title: "Coherence length of a filtered laser",
          statement:
            "A 633 nm laser with a 1 nm bandwidth has l_c ≈ λ²/Δλ = (633 nm)²/(1 nm) ≈ 0.40 mm.",
          latex: "l_c\\approx\\frac{(632.8\\times10^{-9}\\,\\mathrm{m})^2}{1\\times10^{-9}\\,\\mathrm{m}}=4.0\\times10^{-4}\\,\\mathrm{m}",
          result: "Path differences in a compact 4f are usually much smaller, so the transform is stable. A Michelson arm difference of metres would not be."
        },
        {
          type: "p",
          text: "There is a practical coherence penalty too. A coherent laser produces speckle from dust, scratches and window reflections. Those speckles are not the object; they are a coherent artefact of the illumination. A spatial filter (a pinhole at the focus of a beam expander) cleans the wavefront, and a slight defocus or a rotating diffuser can average speckle at the cost of coherence. State which compromise you made."
        },
        {
          type: "callout",
          tone: "caution",
          title: "Coherence is not the same as brightness",
          body:
            "A bright LED can saturate the camera and still be useless for Fourier filtering if its spatial coherence is poor. Conversely, a low-power laser can be perfectly coherent. Judge the source by its coherence, not by its luminous output."
        }
      ]
    },
    {
      id: "phase-matters",
      number: "12",
      title: "Why the phase spectrum matters",
      kicker: "The invisible object",
      blocks: [
        {
          type: "p",
          text: "A pure phase object — a glass plate with a shallow relief, a living cell, a wavefront error — transmits unit amplitude. With uniform illumination and no reference, its image is uniformly bright: the intensity carries no information about the phase. The information is in the spectrum's phase, and the 4f processor gives physical access to it. Zernike's phase-contrast microscope places a small phase plate at the Fourier plane so that the undiffracted background acquires a π/2 phase shift relative to the diffracted light. The two then interfere in the image, and a phase gradient becomes an intensity gradient."
        },
        {
          type: "p",
          text: "The same idea underlies dark-field imaging, where the background is blocked entirely and only scattered light forms the image, and differential interference contrast, where a phase gradient is converted to intensity by interfering two sheared copies of the field. In all three cases the filter acts on the complex spectrum; the camera never sees phase directly."
        },
        {
          type: "callout",
          tone: "principle",
          title: "Phase is measured by interference",
          body:
            "No detector measures phase directly. Every phase measurement is a comparison: with a reference beam (holography, interferometry), with a neighbouring part of the same field (DIC, phase contrast), or with a computational model (phase retrieval, ptychography). The 4f filter is a way of arranging that comparison optically."
        },
        {
          type: "p",
          text: "In the simulation, a phase plate of radius r and phase step φ multiplies the low-frequency disk by e^{iφ}. With φ = π/2 and a weak phase object, the image intensity becomes approximately linear in the object phase, which is the small-signal limit of Zernike phase contrast. With φ = π the plate reverses the background instead, producing a different contrast; both are instructive to compare. The optimal step depends on the object and on the amount of background light."
        },
        {
          type: "p",
          text: "The deeper lesson is that amplitude and phase are not independent properties of an image. They are two representations of the same complex field, and a filter that changes one changes the other after propagation. This is why phase retrieval algorithms can reconstruct an image from far-field intensities alone, given enough prior constraints, and why the phase spectrum is a central object in modern computational imaging."
        }
      ]
    },
    {
      id: "information-processing",
      number: "13",
      title: "Optical information processing and its modern limits",
      kicker: "Analogue computation at the speed of light",
      blocks: [
        {
          type: "p",
          text: "The 4f processor is one of the oldest optical computers. A matched filter in the Fourier plane implements a correlation; multiplying the input spectrum by the conjugate of a reference spectrum produces a bright peak when the two match. Vander Lugt correlators, joint-transform correlators and optical character-recognition systems were built on this principle in the 1960s and 1970s. The attraction is parallelism: a lens performs an N²-point transform in the time light takes to cross the bench, with no clock and no memory access."
        },
        {
          type: "eq",
          latex:
            "\\iint |U(x,y)|^2\\,\\mathrm{d}x\\,\\mathrm{d}y=\\iint |\\tilde{U}(f_x,f_y)|^2\\,\\mathrm{d}f_x\\,\\mathrm{d}f_y",
          number: "14",
          note: "Parseval's theorem. It makes the transmitted energy fraction measurable from the spectrum and is the basis of the energy-passed readout."
        },
        {
          type: "p",
          text: "The limits are equally instructive. A spatial light modulator has finite pixels, finite fill factor and limited phase or amplitude range; it cannot represent an arbitrary complex mask. The optical system has a finite aperture and a finite field, so the space-bandwidth product is bounded. Alignment tolerances are at the wavelength scale for phase filters, and the detector adds noise after the computation. A digital computer, by contrast, has enormous precision and memory but pays a serial cost per operation. The modern revival of optical computing — diffractive neural networks, optical convolvers, Fourier ptychography — is largely an argument about where the space-bandwidth product and the energy cost are best spent."
        },
        {
          type: "p",
          text: "For an undergraduate laboratory the honest conclusion is narrower. The 4f processor demonstrates, with visible and quantitative results, that a lens computes a transform, that a mask multiplies the spectrum, and that a second lens returns an image. Those three facts are the foundation of microscopy, coronagraphy, diffractive optics and coherent imaging. The fact that a laptop can compute the same transform faster is not a refutation; it is a reminder that the optical system is a physical implementation of a mathematical operation, with physical limits that the mathematics does not show."
        },
        {
          type: "callout",
          tone: "note",
          title: "What this experiment does and does not demonstrate",
          body:
            "It demonstrates Fourier-plane filtering, cutoff and resolution with a real optical arrangement, and it lets you compute the same quantities from a declared scalar model. It does not demonstrate aberration correction, polarisation control, partially coherent imaging or quantum imaging. Those require additional hardware and a different model."
        }
      ]
    }
  ],
  equations: [
    {
      id: "ft-pair",
      latex:
        "\\tilde{U}(f_x,f_y)=\\iint_{-\\infty}^{\\infty} U(x,y)\\,e^{-i2\\pi(f_x x+f_y y)}\\,\\mathrm{d}x\\,\\mathrm{d}y",
      name: "Two-dimensional Fourier transform",
      symbols: [
        { symbol: "U(x,y)", meaning: "complex field in the object plane", unit: "V m⁻¹ (arb.)" },
        { symbol: "\\tilde{U}(f_x,f_y)", meaning: "spatial spectrum", unit: "V m" },
        { symbol: "f_x,f_y", meaning: "spatial frequencies conjugate to x and y", unit: "mm⁻¹" }
      ],
      interpretation:
        "Decomposes the field into sinusoidal gratings. The magnitude gives the strength of each grating and the phase gives its position.",
      assumptions: ["Scalar field", "Square-integrable over the window", "Transform limits taken over the object window in practice"],
      usedIn: ["Theory 01", "Simulation"],
      numericExample: {
        statement: "A 1 mm grating has f_x = 1 mm⁻¹ and appears 95 µm from the axis with f = 150 mm at 632.8 nm.",
        latex: "x_f=\\lambda f f_x=0.095\\,\\mathrm{mm}"
      }
    },
    {
      id: "inverse-ft",
      latex:
        "U(x,y)=\\iint_{-\\infty}^{\\infty}\\tilde{U}(f_x,f_y)\\,e^{+i2\\pi(f_x x+f_y y)}\\,\\mathrm{d}f_x\\,\\mathrm{d}f_y",
      name: "Inverse Fourier transform",
      symbols: [
        { symbol: "\\tilde{U}", meaning: "spatial spectrum" },
        { symbol: "U", meaning: "reconstructed field" }
      ],
      interpretation:
        "Recombines the spectral components into an image. The second lens of a 4f system implements this operation optically, up to inversion and scale.",
      assumptions: ["Same conventions as the forward transform", "No clipping of the spectrum"]
    },
    {
      id: "fresnel-integral",
      latex:
        "U(x,y,z)=\\frac{e^{ikz}}{i\\lambda z}\\iint U_0(\\xi,\\eta)\\,\\exp\\!\\left\\{\\frac{ik}{2z}\\left[(x-\\xi)^2+(y-\\eta)^2\\right]\\right\\}\\mathrm{d}\\xi\\,\\mathrm{d}\\eta",
      name: "Fresnel diffraction integral",
      symbols: [
        { symbol: "U_0(\\xi,\\eta)", meaning: "field at the aperture plane" },
        { symbol: "k", meaning: "wavenumber 2π/λ", unit: "mm⁻¹" },
        { symbol: "z", meaning: "propagation distance", unit: "mm" },
        { symbol: "\\lambda", meaning: "wavelength", unit: "mm" }
      ],
      interpretation:
        "Each point of the aperture radiates a quadratic-phase wavelet; the observed field is their coherent sum. The quadratic phase is what a lens cancels.",
      assumptions: ["Paraxial (small angles)", "Scalar wave", "No aperture inside the propagation interval", "z ≫ λ"],
      usedIn: ["Theory 02", "Derivation lens-ft"]
    },
    {
      id: "fresnel-number",
      latex: "N_F=\\frac{a^2}{\\lambda z}",
      name: "Fresnel number",
      symbols: [
        { symbol: "a", meaning: "characteristic transverse half-width", unit: "mm" },
        { symbol: "\\lambda", meaning: "wavelength", unit: "mm" },
        { symbol: "z", meaning: "propagation distance", unit: "mm" }
      ],
      interpretation:
        "Counts the number of Fresnel zones that fit across the aperture. N_F ≫ 1 is near field; N_F ≪ 1 is far field.",
      assumptions: ["a and z refer to the same propagation problem", "The definition of a must be stated"]
    },
    {
      id: "fraunhofer-condition",
      latex:
        "z\\gg\\frac{a^2}{\\lambda}\\quad\\Longleftrightarrow\\quad N_F\\ll1",
      name: "Fraunhofer condition",
      symbols: [
        { symbol: "z", meaning: "distance from object to observation plane", unit: "mm" },
        { symbol: "a", meaning: "object half-width", unit: "mm" }
      ],
      interpretation:
        "The quadratic source phase is negligible, so propagation alone performs a Fourier transform. A lens achieves the same transform at f instead of a²/λ.",
      assumptions: ["Free-space propagation", "No lens", "Paraxial"]
    },
    {
      id: "lens-ft",
      latex:
        "U_f(x_f,y_f)=\\frac{e^{ikf}}{i\\lambda f}\\,e^{\\,i\\frac{k}{2f}\\left(1-\\frac{d}{f}\\right)(x_f^2+y_f^2)}\\,\\tilde{U}_0\\!\\left(\\frac{x_f}{\\lambda f},\\frac{y_f}{\\lambda f}\\right)",
      name: "Lens Fourier-transform relation",
      symbols: [
        { symbol: "d", meaning: "object distance in front of the lens", unit: "mm" },
        { symbol: "f", meaning: "focal length", unit: "mm" },
        { symbol: "x_f,y_f", meaning: "coordinates in the back focal plane", unit: "mm" }
      ],
      interpretation:
        "At d = f the back focal plane holds the exact Fourier transform. At d ≠ f a quadratic phase remains; intensity is unchanged but the image is defocused.",
      assumptions: ["Thin lens", "Paraxial", "Infinite lens aperture", "Object at or near the front focal plane"],
      usedIn: ["Theory 04", "Simulation"]
    },
    {
      id: "spatial-frequency",
      latex:
        "f_x=\\frac{x_f}{\\lambda f},\\qquad \\Delta x_f=\\frac{\\lambda f}{L},\\qquad f_{\\max}=\\frac{N}{2L}",
      name: "Fourier-plane coordinates and sampling",
      symbols: [
        { symbol: "x_f", meaning: "position in the back focal plane", unit: "mm" },
        { symbol: "L", meaning: "object window width", unit: "mm" },
        { symbol: "N", meaning: "number of samples per side" }
      ],
      interpretation:
        "Converts a position in the focal plane to a spatial frequency. Fixes the physical pixel and the maximum frequency of a sampled object.",
      assumptions: ["Object centred on the axis", "Uniform sampling", "N even for the centred display"]
    },
    {
      id: "fourf-image",
      latex:
        "U_i(x_i,y_i)=\\frac{1}{M}\\,\\mathcal{F}^{-1}\\!\\left\\{\\mathcal{F}\\{U_0\\}(f_x,f_y)\\,H(f_x,f_y)\\right\\}\\!\\left(-\\frac{x_i}{M},-\\frac{y_i}{M}\\right),\\qquad M=\\frac{f_2}{f_1}",
      name: "4f image relation",
      symbols: [
        { symbol: "H", meaning: "complex pupil (filter) function" },
        { symbol: "M", meaning: "image magnification", unit: "dimensionless" },
        { symbol: "f_1,f_2", meaning: "focal lengths of L1 and L2", unit: "mm" }
      ],
      interpretation:
        "The image is the inverse transform of the filtered spectrum, inverted and magnified by f₂/f₁. With H = 1 the two transforms cancel.",
      assumptions: ["Object at the front focal plane of L1", "Filter at the shared focal plane", "Thin lenses", "Coherent illumination"],
      usedIn: ["Theory 07", "Derivation fourf-cascade"]
    },
    {
      id: "filter-transfer",
      latex:
        "H(f_x,f_y)=\\begin{cases}1, & \\sqrt{f_x^2+f_y^2}\\le f_c\\\\[2pt] 0, & \\text{otherwise}\\end{cases}",
      name: "Ideal low-pass transfer function",
      symbols: [
        { symbol: "f_c", meaning: "cutoff spatial frequency", unit: "mm⁻¹" },
        { symbol: "H", meaning: "amplitude transfer function" }
      ],
      interpretation:
        "Transmits frequencies inside the disk and blocks the rest. Other masks replace the indicator function with a slit, an annulus or a phase factor.",
      assumptions: ["Ideal infinitely thin mask", "Perfectly centred on the optical axis", "Coherent field"]
    },
    {
      id: "cutoff",
      latex: "f_c=\\frac{a}{\\lambda f}=r\\,f_{\\max}",
      name: "Cutoff frequency of a circular pupil",
      symbols: [
        { symbol: "a", meaning: "pupil radius in the Fourier plane", unit: "mm" },
        { symbol: "r", meaning: "normalised filter radius", unit: "dimensionless" },
        { symbol: "f_{\\max}", meaning: "maximum sampled spatial frequency", unit: "mm⁻¹" }
      ],
      interpretation:
        "Maps the physical mask radius to a spatial-frequency cutoff. A smaller disk or iris passes a narrower band.",
      assumptions: ["Circular pupil", "Uniform illumination", "Paraxial NA"]
    },
    {
      id: "convolution",
      latex:
        "\\mathcal{F}\\{U_0*h\\}=\\tilde{U}_0\\cdot\\tilde{h},\\qquad U_i=U_0*h",
      name: "Convolution theorem",
      symbols: [
        { symbol: "*", meaning: "two-dimensional convolution" },
        { symbol: "h", meaning: "amplitude point-spread function" }
      ],
      interpretation:
        "A filter multiplies in the Fourier plane and convolves in the image plane. The point-spread function is the inverse transform of the pupil.",
      assumptions: ["Linear shift-invariant system", "Coherent field amplitudes", "Infinite aperture for exact shift invariance"]
    },
    {
      id: "na",
      latex: "NA=n\\sin\\theta_{\\max}\\approx\\frac{a}{f}",
      name: "Numerical aperture",
      symbols: [
        { symbol: "n", meaning: "refractive index of the image space" },
        { symbol: "\\theta_{\\max}", meaning: "largest collected half-angle" },
        { symbol: "a", meaning: "pupil radius", unit: "mm" }
      ],
      interpretation:
        "Measures the light-collection cone. In the paraxial 4f it is approximately the pupil radius divided by the focal length.",
      assumptions: ["Paraxial angles", "Circular pupil", "n uniform in the image space"]
    },
    {
      id: "abbe",
      latex: "d_{\\min}=\\frac{\\lambda}{2\\,NA}",
      name: "Abbe resolution limit",
      symbols: [
        { symbol: "d_{\\min}", meaning: "smallest resolvable period", unit: "mm" },
        { symbol: "NA", meaning: "numerical aperture", unit: "dimensionless" }
      ],
      interpretation:
        "Conventional Abbe limit: the pupil must collect at least the zeroth and one first order. With axial coherent illumination the cutoff is λ/NA; oblique illumination at the optimum angle, or incoherent imaging, halves it to λ/(2NA).",
      assumptions: [
        "Oblique illumination at the optimum angle, or incoherent imaging, for the λ/(2NA) form",
        "Axial coherent illumination gives λ/NA",
        "Grating object and circular pupil",
        "NA includes the medium refractive index"
      ],
      usedIn: ["Theory 10", "Derivation abbe-limit"]
    },
    {
      id: "parseval",
      latex:
        "\\iint |U(x,y)|^2\\,\\mathrm{d}x\\,\\mathrm{d}y=\\iint |\\tilde{U}(f_x,f_y)|^2\\,\\mathrm{d}f_x\\,\\mathrm{d}f_y",
      name: "Parseval's theorem",
      symbols: [
        { symbol: "|U|^2", meaning: "spatial intensity" },
        { symbol: "|\\tilde{U}|^2", meaning: "spectral energy density" }
      ],
      interpretation:
        "Energy is conserved by the transform. The fraction of spectral energy passed by a mask is therefore a well-defined measure of throughput.",
      assumptions: ["Square-integrable field", "Unitary transform convention (the discrete implementation includes the 1/N² normalisation)"],
      usedIn: ["Theory 13", "Simulation energy readout"]
    }
  ],
  derivations: [
    {
      id: "lens-ft",
      title: "A lens as a Fourier transformer",
      intro:
        "Propagate from the object to the lens, apply the thin-lens phase, then propagate one focal length to the back focal plane.",
      steps: [
        {
          label: "1 · Object to lens",
          text: "Fresnel propagation over the distance d gives the field just before the lens.",
          latex:
            "U_L(\\xi,\\eta)=\\frac{e^{ikd}}{i\\lambda d}\\iint U_0(x,y)\\exp\\!\\left\\{\\frac{ik}{2d}\\left[(\\xi-x)^2+(\\eta-y)^2\\right]\\right\\}\\mathrm{d}x\\,\\mathrm{d}y"
        },
        {
          label: "2 · Thin lens",
          text: "The lens multiplies the field by a quadratic phase with the opposite sign.",
          latex: "t_L(\\xi,\\eta)=\\exp\\!\\left[-\\frac{ik}{2f}(\\xi^2+\\eta^2)\\right]"
        },
        {
          label: "3 · Lens to focal plane",
          text: "Propagate a distance f. Expanding the square in the Fresnel kernel produces three groups of terms.",
          latex:
            "U_f(x_f,y_f)=\\frac{e^{ikf}}{i\\lambda f}\\iint U_L(\\xi,\\eta)\\,e^{-\\frac{ik}{2f}(\\xi^2+\\eta^2)}\\exp\\!\\left\\{\\frac{ik}{2f}\\left[(x_f-\\xi)^2+(y_f-\\eta)^2\\right]\\right\\}\\mathrm{d}\\xi\\,\\mathrm{d}\\eta"
        },
        {
          label: "4 · Cancellation",
          text: "The lens phase cancels the ξ² + η² term from the final propagation exactly. What remains is a constant, the quadratic term in x_f, y_f, and the Fourier kernel exp[−i2π(x_f ξ + y_f η)/(λf)].",
          latex:
            "U_f(x_f,y_f)=\\frac{e^{ikf}}{i\\lambda f}e^{\\,i\\frac{k}{2f}(x_f^2+y_f^2)}\\iint U_L(\\xi,\\eta)\\,e^{-i2\\pi\\left(\\frac{x_f}{\\lambda f}\\xi+\\frac{y_f}{\\lambda f}\\eta\\right)}\\mathrm{d}\\xi\\,\\mathrm{d}\\eta"
        },
        {
          label: "5 · Object distance",
          text: "Repeating the bookkeeping with the object at distance d rather than f leaves the residual quadratic factor (1 − d/f) in front of the transform. At d = f it is unity.",
          latex:
            "U_f\\propto e^{\\,i\\frac{k}{2f}\\left(1-\\frac{d}{f}\\right)(x_f^2+y_f^2)}\\,\\tilde{U}_0\\!\\left(\\frac{x_f}{\\lambda f},\\frac{y_f}{\\lambda f}\\right)"
        },
        {
          label: "6 · Intensity",
          text: "A camera records |U_f|², so the quadratic phase drops out. The visible Fourier pattern is therefore independent of d in this plane, even though the complex field is not.",
          latex: "I_f(x_f,y_f)=|U_f|^2\\propto\\left|\\tilde{U}_0\\!\\left(\\frac{x_f}{\\lambda f},\\frac{y_f}{\\lambda f}\\right)\\right|^2"
        }
      ],
      result: {
        latex:
          "U_f(x_f,y_f)\\propto\\tilde{U}_0\\!\\left(\\frac{x_f}{\\lambda f},\\frac{y_f}{\\lambda f}\\right)\\quad(d=f)",
        text: "The back focal plane holds the spatial Fourier transform, with the position-to-frequency scale λf. A residual quadratic phase appears when d ≠ f but does not change the intensity in that plane."
      },
      assumptions: [
        "Paraxial scalar diffraction and a thin lens.",
        "The lens aperture is wide enough not to truncate the field of interest.",
        "The object is coherently illuminated and the medium is uniform."
      ]
    },
    {
      id: "fourf-cascade",
      title: "The 4f cascade and the filtered image",
      intro: "Apply the lens transform twice and insert a complex mask between the transforms.",
      steps: [
        {
          label: "1 · First transform",
          text: "L1 produces the spectrum at the filter plane, with coordinates (u, v) and scale λf₁.",
          latex: "U_f(u,v)\\propto\\tilde{U}_0\\!\\left(\\frac{u}{\\lambda f_1},\\frac{v}{\\lambda f_1}\\right)"
        },
        {
          label: "2 · Filter",
          text: "The mask multiplies the spectrum by its complex transfer function.",
          latex: "U_f'(u,v)=H\\!\\left(\\frac{u}{\\lambda f_1},\\frac{v}{\\lambda f_1}\\right)U_f(u,v)"
        },
        {
          label: "3 · Second transform",
          text: "L2 performs another Fourier transform, with scale λf₂, on the filtered field. Two forward transforms give an inverted image.",
          latex:
            "U_i(x_i,y_i)\\propto\\tilde{U}_f'\\!\\left(\\frac{x_i}{\\lambda f_2},\\frac{y_i}{\\lambda f_2}\\right)=\\mathcal{F}\\{U_f'\\}\\left(\\frac{x_i}{\\lambda f_2},\\frac{y_i}{\\lambda f_2}\\right)"
        },
        {
          label: "4 · Substitute",
          text: "Using the Fourier inversion theorem, the double transform returns the object convolved with the inverse transform of H.",
          latex:
            "U_i(x_i,y_i)=\\frac{1}{M}\\mathcal{F}^{-1}\\{H\\}\\big|_{(x_i/M,\\,y_i/M)}*U_0\\!\\left(-\\frac{x_i}{M},-\\frac{y_i}{M}\\right)"
        },
        {
          label: "5 · Magnification",
          text: "The two focal lengths enter only through M = f₂/f₁. The filter cutoff is set by f₁ and by the mask radius, not by f₂.",
          latex: "M=\\frac{f_2}{f_1},\\qquad x_i=-M x_0"
        }
      ],
      result: {
        latex:
          "U_i=\\frac{1}{M}\\mathcal{F}^{-1}\\left\\{\\mathcal{F}\\{U_0\\}\\,H\\right\\}",
        text: "The image is the inverse transform of the filtered spectrum, inverted and magnified by f₂/f₁. With H = 1 the image is the object."
      },
      assumptions: [
        "Object at the front focal plane of L1 and filter at the shared focal plane.",
        "Thin lenses and paraxial propagation.",
        "The mask is thin and centred; its own diffraction is neglected.",
        "Coherent, monochromatic illumination."
      ]
    },
    {
      id: "lowpass-blur",
      title: "Low-pass filtering and the blur width",
      intro: "A disk in the Fourier plane is a convolution with an Airy-like point-spread function.",
      steps: [
        {
          label: "1 · Pupil",
          text: "The ideal low-pass mask is a disk of radius a.",
          latex: "H(f)=1\\ \\text{for}\\ |f|\\le a/(\\lambda f),\\quad 0\\ \\text{otherwise}"
        },
        {
          label: "2 · Point-spread function",
          text: "Its inverse transform is the Airy amplitude pattern of a circular aperture.",
          latex:
            "h(r)\\propto\\frac{2J_1(2\\pi a r/(\\lambda f))}{2\\pi a r/(\\lambda f)}"
        },
        {
          label: "3 · First zero",
          text: "The first zero of J₁ occurs at argument 3.832, which gives the radius of the central lobe.",
          latex: "r_0=0.61\\,\\frac{\\lambda f}{a}"
        },
        {
          label: "4 · Convolution",
          text: "The image is the object convolved with h. Two points closer than the central-lobe width merge into one blurred feature.",
          latex: "U_i=U_0*h"
        },
        {
          label: "5 · Aperture relation",
          text: "Using NA ≈ a/f, the same width is written in terms of the numerical aperture.",
          latex: "r_0\\approx\\frac{0.61\\lambda}{NA}"
        }
      ],
      result: {
        latex: "r_0\\approx\\frac{0.61\\,\\lambda f}{a}=\\frac{0.61\\,\\lambda}{NA}",
        text: "A low-pass pupil broadens every point into an Airy-like spot. The central-lobe radius scales inversely with the pupil radius, which is the spatial-frequency expression of the resolution limit. The coefficient differs from the Abbe λ/(2NA) because the criteria differ: first zero of the Airy pattern versus the first collected grating order."
      },
      assumptions: [
        "Coherent illumination and an amplitude point-spread function.",
        "Ideal circular pupil with uniform transmission.",
        "Paraxial NA and an object small enough that shift invariance holds."
      ]
    },
    {
      id: "abbe-limit",
      title: "Abbe's resolution limit",
      intro: "A grating is resolved only if the pupil collects at least one diffracted order besides the zeroth.",
      steps: [
        {
          label: "1 · Grating orders",
          text: "A grating of period d illuminated at normal incidence diffracts orders at angles given by the grating equation.",
          latex: "\\sin\\theta_m=\\frac{m\\lambda}{d}"
        },
        {
          label: "2 · Collection",
          text: "The pupil collects orders up to the maximum angle θ_max set by its numerical aperture.",
          latex: "|\\sin\\theta_m|\\le NA"
        },
        {
          label: "3 · At least one order",
          text: "For contrast, the first order must enter: sin θ₁ = λ/d ≤ NA.",
          latex: "\\frac{\\lambda}{d}\\le NA"
        },
        {
          label: "4 · Axial coherent cutoff",
          text: "Rearranging gives the smallest period that can be reconstructed with the zeroth and first orders under axial coherent illumination.",
          latex: "d_{\\min}=\\frac{\\lambda}{NA}"
        },
        {
          label: "5 · Conventional Abbe value",
          text: "Illuminating obliquely at the optimum angle centres one first order on the pupil and allows a period twice as fine. Incoherent imaging reaches the same 2NA/λ cutoff.",
          latex: "d_{\\min}=\\frac{\\lambda}{2\\,NA}"
        }
      ],
      result: {
        latex: "d_{\\min}=\\frac{\\lambda}{2\\,NA}\\quad\\text{(oblique or incoherent)}",
        text: "Resolution improves linearly with NA and worsens linearly with wavelength. Axial coherent illumination gives λ/NA; oblique illumination or incoherent detection gives the conventional λ/(2NA). State the convention."
      },
      assumptions: [
        "Oblique illumination at the optimum angle, or incoherent imaging, for the λ/(2NA) form.",
        "Axial coherent illumination gives λ/NA.",
        "A grating object and a circular pupil.",
        "The medium index is included in NA.",
        "No super-resolution or prior information."
      ]
    }
  ],
  simulation: FOURIER_SIMULATION_SPEC,
  procedure: [
    {
      id: "safety-inventory",
      title: "Safety and inventory",
      purpose: "Establish the optical axis, verify the kit and eliminate the two dominant risks: direct exposure and stray reflections.",
      steps: [
        {
          title: "Laser safety",
          detail:
            "Put on wavelength-appropriate eyewear before energising the He–Ne laser. Keep the beam below eye level, terminate it in a beam block, and remove reflective watches or jewellery from the beam path.",
          caution: "Never look into the beam or its specular reflection. A 1 mW He–Ne is still a Class 3R hazard for direct viewing."
        },
        {
          title: "Inventory against the packing list",
          detail:
            "Identify L1 and L2, record their focal lengths from the labels, and check that the two lens mounts have the same optical height. Confirm the camera is linear and that the iris and slit open and close smoothly.",
          checkpoint: "Both lens labels are legible and their focal lengths are recorded in the logbook before anything is mounted."
        },
        {
          title: "Lay out the axis",
          detail:
            "Place the laser, L1, the filter stage, L2 and the camera on one line at a comfortable beam height. Leave at least 150 mm between adjacent mounts so that the translation stage can move without colliding.",
          checkpoint: "A ruler along the bench shows all mounts within 1 mm of the same line."
        },
        {
          title: "Record the bench state",
          detail:
            "Photograph the layout, note the room temperature, and record the laser wavelength and any filters already in the beam. These details matter when a result later looks anomalous."
        }
      ]
    },
    {
      id: "beam-expansion",
      title: "Beam expansion and collimation",
      purpose: "Produce a beam whose wavefront is flat over the object and whose diameter fills the object window without clipping.",
      steps: [
        {
          title: "Clean the beam",
          detail:
            "Expand the laser with a short-focal-length lens and focus through a pinhole (a spatial filter) if one is available. This removes high-frequency wavefront noise and produces a clean Gaussian-like beam.",
          checkpoint: "The far-field spot is round and free of dust rings."
        },
        {
          title: "Collimate",
          detail:
            "Place a collimating lens one focal length from the pinhole. Check collimation by translating a screen several hundred millimetres and confirming that the beam diameter does not change.",
          checkpoint: "Beam diameter changes by less than 5% over 300 mm of travel."
        },
        {
          title: "Set the polarisation and power",
          detail:
            "Use a half-wave plate and polariser if available to set a stable linear polarisation, then an ND filter to bring the camera below saturation. Record the ND value.",
          caution: "Do not rely on the camera's automatic exposure; it will hide saturation and distort the measured contrast."
        },
        {
          title: "Check the wavefront over the object",
          detail:
            "Place the object mount in the beam and confirm that the illuminated patch is uniform to the eye and does not clip on the mount. A Gaussian illumination is acceptable if its variation over the object is recorded.",
          checkpoint: "The object is fully illuminated and no part of the beam hits the lens mount."
        }
      ]
    },
    {
      id: "object-plane",
      title: "Object at the front focal plane",
      purpose: "Place the transparency exactly one focal length in front of L1 so that the Fourier plane is at the back focal plane.",
      steps: [
        {
          title: "Measure the focal length",
          detail:
            "Focus a distant object onto a screen with L1 and measure the lens-to-screen distance. Alternatively use the manufacturer's value and record it with its tolerance.",
          checkpoint: "The measured focal length agrees with the label within 2%."
        },
        {
          title: "Set the object distance",
          detail:
            "Mount the object on the translation stage and set the stage so that the object plane is f₁ in front of L1's principal plane. Use the stage micrometer, not the mount base, for the final adjustment.",
          checkpoint: "The stage reading is recorded and the object can be moved ±5 mm without touching the lens."
        },
        {
          title: "Centre the object",
          detail:
            "Adjust the object's transverse position until the illuminated feature is centred on the lens axis. An iris immediately in front of L1 helps define the axis.",
          checkpoint: "The object's centre is within 1 mm of the beam centre."
        },
        {
          title: "Verify with a known object",
          detail:
            "Insert the ruled grating and observe the Fourier plane on a white card. The first orders should be symmetric about the axis and should move symmetrically when the grating is rotated.",
          checkpoint: "Order positions are symmetric to better than 5%."
        }
      ]
    },
    {
      id: "fourier-plane",
      title: "Locate the Fourier plane and insert the filter",
      purpose: "Find the plane where the spectrum is sharpest, then insert a mask without disturbing the alignment.",
      steps: [
        {
          title: "Scan for the focal plane",
          detail:
            "Place a white card on a translation stage after L1 and move it along the axis. The spectrum is sharpest at the back focal plane; away from it the pattern is a blurred Fresnel diffraction pattern.",
          checkpoint: "The sharpest plane is within 2 mm of the measured f₁ position."
        },
        {
          title: "Record the scale",
          detail:
            "With the grating in place, measure the separation of the ±1 orders. Use Δx = λf/Λ to compute λf and compare with the label value.",
          checkpoint: "The computed λf agrees with λ × f within 5%."
        },
        {
          title: "Mount the filter on a translation stage",
          detail:
            "Mount the iris or mask in the Fourier plane on a stage with two transverse axes. Centre it on the zeroth order by maximising the transmitted power or by observing the shadow on a card.",
          caution: "Keep the beam blocked while changing a metal mask; a reflected beam can leave the bench."
        },
        {
          title: "Check the open-pupil image",
          detail:
            "With the mask fully open, place the camera at the image plane of L2 and confirm that a sharp inverted image of the object appears.",
          checkpoint: "The image is sharp and the expected inversion is visible."
        }
      ]
    },
    {
      id: "image-reconstruction",
      title: "Image plane, reconstruction and filter survey",
      purpose: "Establish the reference image and observe the qualitative effect of each filter family.",
      steps: [
        {
          title: "Focus L2",
          detail:
            "With L2 one focal length after the filter plane, translate the camera to the sharpest image. Record the camera position and the L1–L2 separation.",
          checkpoint: "The image is sharp at the centre and the magnification is close to f₂/f₁."
        },
        {
          title: "Capture the open-pupil reference",
          detail:
            "Save a background-subtracted image with the pupil fully open. This is the reference for every contrast and energy comparison.",
          checkpoint: "The reference is not saturated and the background is recorded separately."
        },
        {
          title: "Insert the low-pass disk",
          detail:
            "Close the iris symmetrically about the zeroth order in small steps. Observe the image soften; record the iris diameter at which the finest features disappear.",
          checkpoint: "The image remains centred as the iris closes."
        },
        {
          title: "Insert the high-pass stop",
          detail:
            "Replace the disk with a central block that covers the zeroth order. The background should go dark and edges should brighten.",
          caution: "A central block can scatter light; check that the bright edge is not a reflection from the block surface."
        },
        {
          title: "Survey the directional and phase filters",
          detail:
            "Insert the vertical slit, rotate it to horizontal, then insert the annulus and the phase plate. Record which features are enhanced or suppressed in each case.",
          checkpoint: "The qualitative effect of each mask matches the prediction in the filter table."
        }
      ]
    },
    {
      id: "quantitative",
      title: "Quantitative cutoff and resolution",
      purpose: "Turn the qualitative survey into measurements with uncertainties.",
      steps: [
        {
          title: "Calibrate the camera",
          detail:
            "Measure the image scale with a ruler or a known grating. Check linearity by varying exposure or ND and confirming that the background-subtracted peak scales linearly.",
          checkpoint: "The camera response is linear within 3% over the used range."
        },
        {
          title: "Measure the cutoff",
          detail:
            "For a series of iris radii, record the normalised radius, the transmitted energy and the contrast of a known grating. Fit the cutoff frequency against radius.",
          checkpoint: "The cutoff grows linearly with radius and extrapolates to zero at zero radius."
        },
        {
          title: "Measure the resolution",
          detail:
            "Use a grating of known period and find the smallest period that still shows visible contrast. Compare with the axial coherent prediction λ/NA from the measured NA; if the illumination is oblique, compare instead with the conventional Abbe λ/(2NA).",
          checkpoint: "The measured and predicted limits agree within the combined uncertainty, or the discrepancy is explained."
        },
        {
          title: "Repeat and record",
          detail:
            "Repeat each measurement at least three times, re-centring the filter between runs. Record the mean, standard deviation and the resolution of the stage.",
          checkpoint: "Repeated cutoffs agree within the stage resolution."
        }
      ]
    },
    {
      id: "shutdown",
      title: "Shutdown and record",
      purpose: "Leave the bench safe and the data traceable.",
      steps: [
        {
          title: "Block and switch off",
          detail:
            "Insert the beam block, close the shutter, and switch off the laser. Do not rely on the key switch alone if the shutter is available.",
          caution: "Allow the laser to cool before moving it; a hot plasma tube is fragile."
        },
        {
          title: "Remove filters and cap optics",
          detail:
            "Remove the mask from the Fourier plane, cap the lenses and camera, and return the filters to their case. A fingerprint on a Fourier-plane optic is a phase error.",
          checkpoint: "All optics are capped and the filter case is closed."
        },
        {
          title: "Archive the data",
          detail:
            "Export the camera frames, the recorded table and the calibration images with a timestamp and the bench configuration. Note any anomaly, even if unexplained.",
          checkpoint: "A second person can identify every file from its metadata."
        },
        {
          title: "Restore the bench",
          detail:
            "Return the translation stages to their mid-travel, remove loose cables from the walkway, and record the next user's starting configuration."
        }
      ]
    }
  ],
  observations: [
    {
      id: "filter-radius-contrast",
      title: "Filter radius, transmitted energy and contrast",
      purpose:
        "Map how a circular low-pass pupil changes the image. The energy falls as the square of the field amplitude passed; the contrast of a grating falls when its fundamental no longer fits inside the disk.",
      columns: [
        { key: "radius", label: "Normalised radius r", type: "number" },
        { key: "cutoff", label: "Cutoff f_c", unit: "mm⁻¹", type: "number" },
        { key: "energy", label: "Energy passed", unit: "%", type: "number" },
        { key: "contrast", label: "Contrast (σ/μ)", type: "number" },
        { key: "note", label: "Observation", type: "text" }
      ],
      guidance:
        "Vary r from 0.05 to 0.60 in at least eight steps with the grating in place. Keep the camera exposure fixed and subtract a dark frame. Record the radius from the iris micrometer, not from the nominal setting."
    },
    {
      id: "slit-separation",
      title: "Slit separation and the dominant spatial frequency",
      purpose:
        "Test the reciprocal relation between object separation and spatial frequency. A double slit of separation s has spectral maxima at f_x = m/s, so the first peak lies at 1/s and its reciprocal recovers s. The same maxima are spaced by λf/s in the focal plane — the relation seen as a length rather than a frequency.",
      columns: [
        { key: "separation", label: "Slit separation s", unit: "mm", type: "number" },
        { key: "peakFrequency", label: "Peak frequency", unit: "mm⁻¹", type: "number" },
        { key: "measuredPeriod", label: "1 / f_peak", unit: "mm", type: "number" },
        { key: "ratio", label: "(1 / f_peak) / s", type: "number" },
        { key: "note", label: "Note", type: "text" }
      ],
      guidance:
        "Use at least five slit separations spanning a factor of three. Measure the order positions on both sides of the axis and use half the separation to remove a centring offset. Compare 1/f_peak with s, not with λf/s: the first is the object period and the second is the spacing between adjacent maxima in the focal plane.",
      formula: "s = 1/f_{peak}, \\quad \\Delta x_{f} = \\lambda f/s"
    },
    {
      id: "aperture-resolution",
      title: "Pupil radius, NA and the smallest resolved period",
      purpose:
        "Connect the geometrical pupil to the axial coherent cutoff and to the observed disappearance of a known grating.",
      columns: [
        { key: "aperture", label: "Aperture radius r", type: "number" },
        { key: "cutoff", label: "Cutoff f_c", unit: "mm⁻¹", type: "number" },
        { key: "na", label: "NA ≈ λ f_c", type: "number" },
        { key: "resolution", label: "Coherent λ/NA limit", unit: "µm", type: "number" },
        { key: "resolved", label: "Grating visible? (yes/no)", type: "text" },
        { key: "note", label: "Note", type: "text" }
      ],
      guidance:
        "Use a fixed grating and reduce the iris until the first orders are cut off. Record the radius at which contrast falls to the noise floor. The transition should be abrupt for a hard aperture and gradual for a soft one.",
      formula: "d_{\\min}=\\lambda/NA\\ \\text{(axial coherent)},\\quad NA\\approx a/f"
    }
  ],
  analysis: [
    {
      id: "period-from-spectrum",
      title: "Object period from the measured peak frequency",
      method:
        "Locate the dominant peak of the Fourier magnitude away from DC. Convert its position to a spatial frequency with the calibrated scale, then invert to a period. For a grating the period is the ruling period; for a double slit it is the slit separation.",
      formula: "s=\\frac{1}{f_{peak}},\\qquad f_{peak}=\\frac{x_{peak}}{\\lambda f}",
      steps: [
        "Calibrate λf from a grating of known period using the ±1 order separation.",
        "Measure the peak position on both sides of the axis and average their magnitudes to cancel a centring offset.",
        "Convert to f_peak and take the reciprocal.",
        "Compare with the nominal period and compute the fractional difference.",
        "Estimate the uncertainty from the peak centroid and the calibration."
      ],
      expected:
        "Agreement within a few percent, limited by the order centroid and the calibration. A systematic offset that grows with order number indicates a scale error."
    },
    {
      id: "cutoff-linear",
      title: "Cutoff frequency versus filter radius",
      method:
        "For each iris radius, measure the highest surviving order of a known grating or the half-contrast point of a swept edge. Fit f_c against r through the origin and compare the slope with f_max.",
      formula: "f_c=r f_{\\max},\\qquad f_{\\max}=\\frac{N}{2L}",
      steps: [
        "Record the iris radius in normalised units using the calibrated half-width.",
        "Measure the cutoff by the order-disappearance or half-contrast criterion; state which.",
        "Fit a straight line with fixed zero intercept and report the slope and its standard error.",
        "Compare the slope with the predicted f_max from the object window and FFT size.",
        "Inspect residuals for curvature caused by a soft aperture edge."
      ],
      expected:
        "A linear relation with a slope close to f_max. A slope below prediction suggests the effective pupil is smaller than the mechanical iris because of lens clear aperture."
    },
    {
      id: "contrast-knee",
      title: "Contrast versus filter radius",
      method:
        "Plot the grating contrast against normalised radius. Identify the knee where the fundamental order is cut and compare it with the predicted radius r = f_1/f_max for the grating fundamental.",
      formula: "r_{knee}=\\frac{1/\\Lambda}{f_{\\max}}",
      steps: [
        "Use the table from the first observation template.",
        "Normalise contrast to the open-pupil value.",
        "Locate the knee by the intersection of the flat low-radius and falling high-radius trends.",
        "Compare with the predicted radius for the known grating period.",
        "Discuss the finite aperture edge and the camera MTF as broadening mechanisms."
      ],
      expected:
        "The knee should occur when the first order leaves the pupil. A knee at a larger radius than predicted indicates that the effective pupil is smaller than the iris."
    },
    {
      id: "edge-enhancement",
      title: "Edge enhancement and the high-pass kernel",
      method:
        "Extract a line profile across a sharp edge for the open pupil and for a high-pass mask. Compare the high-pass profile with the numerical derivative of the open-pupil profile.",
      formula: "I_{HP}(x)\\approx -C\\,\\frac{\\mathrm{d}I_{open}}{\\mathrm{d}x}*h_{smooth}",
      steps: [
        "Align the edge vertically in the object plane and take a horizontal profile.",
        "Normalise both profiles to the same background level.",
        "Compute a smoothed numerical derivative of the open-pupil profile.",
        "Compare the sign, width and peak-to-peak amplitude with the high-pass profile.",
        "Report the filter radius and the smoothing width used in the derivative."
      ],
      expected:
        "The high-pass image is approximately bipolar, with a bright overshoot on one side of the edge and a dark undershoot on the other. The sign depends on the mask and on image inversion."
    },
    {
      id: "uncertainty",
      title: "Uncertainty budget for the cutoff and the resolution",
      method:
        "Propagate the uncertainties in the scale calibration, the peak position, the iris radius and the camera sampling into the cutoff and the Abbe limit. Identify the dominant term.",
      formula:
        "\\frac{\\delta f_c}{f_c}=\\sqrt{\\left(\\frac{\\delta x}{x}\\right)^2+\\left(\\frac{\\delta(\\lambda f)}{\\lambda f}\\right)^2},\\qquad \\delta d_{\\min}=d_{\\min}\\frac{\\delta NA}{NA}",
      steps: [
        "List every input with its standard uncertainty and source (stage resolution, pixel size, calibration fit).",
        "Propagate through the products and quotients using relative uncertainties.",
        "Compare the propagated uncertainty with the run-to-run scatter.",
        "If the scatter exceeds the propagated value, add a run-to-run term and state why.",
        "Report the final value with the dominant term named."
      ],
      expected:
        "The calibration of λf usually dominates the cutoff uncertainty; the stage resolution dominates the radius. Pixel sampling dominates the resolution limit when the image is not oversampled."
    }
  ],
  errors: [
    {
      source: "Lens aberrations (spherical, coma, chromatic focal shift)",
      type: "systematic",
      effect:
        "The Fourier plane is not a perfect transform: high-frequency orders are blurred or displaced, and the image point-spread function is asymmetric. Chromatic shift changes the effective focal length with wavelength.",
      mitigation:
        "Use achromatic doublets for broadband work, stop down the lens to reduce spherical aberration, keep the object on axis, and calibrate the scale with the same lens and wavelength used for the measurement."
    },
    {
      source: "Finite lens clear aperture and pupil truncation",
      type: "systematic",
      effect:
        "High spatial frequencies never reach the filter plane. The measured cutoff is smaller than the mask prediction, and the apparent resolution is worse than the coherent λ/NA limit for the nominal NA.",
      mitigation:
        "Measure the clear aperture, separate the lens rim from the iris in the model, use a lens with a larger aperture, and correct the predicted cutoff for the effective pupil."
    },
    {
      source: "Incomplete coherence and multimode illumination",
      type: "systematic",
      effect:
        "Each wavelength and each source point produces a differently scaled or shifted spectrum. The sum washes out high-frequency fringes, lowers contrast and softens the filter edge.",
      mitigation:
        "Use a single-mode laser, spatial-filter the beam, equalise path lengths, and record the coherence length. If a LED is used, treat the result as an incoherent sum and change the model accordingly."
    },
    {
      source: "Alignment: object not at f₁, filter off-axis, camera off the image plane",
      type: "systematic",
      effect:
        "A longitudinal object error adds quadratic phase and defocuses the image; a transverse filter error makes the cutoff asymmetric and can mimic a directional filter; a camera error broadens the profile and biases the resolution.",
      mitigation:
        "Use the translation stage and a known grating to locate both conjugate planes, centre the filter on the zeroth order by maximising transmission, and check the image sharpness on both sides of focus."
    },
    {
      source: "Camera sampling, gamma, saturation and fixed-pattern noise",
      type: "systematic",
      effect:
        "Undersampling aliases high frequencies; gamma compresses contrast nonlinearly; saturation clips peaks and biases the centroid; fixed-pattern noise adds a spurious background.",
      mitigation:
        "Set the camera to linear response, keep the peak below 80% of full scale, use ND filters rather than exposure changes, subtract a dark frame, and bin or magnify so that the diffraction spot covers at least two pixels."
    },
    {
      source: "Stray light, multiple reflections and dust",
      type: "systematic",
      effect:
        "A background pedestal reduces the measured contrast and can produce ghost orders. Dust in the Fourier plane scatters light and adds speckle.",
      mitigation:
        "Use beam blocks and baffles, keep the bench clean and capped, subtract a background frame with the object removed, and inspect the Fourier plane for dust before recording."
    }
  ],
  applications: [
    {
      title: "Image processing and edge detection",
      body:
        "High-pass and directional masks perform analogue edge enhancement and directional filtering. The same operations are implemented digitally, but the optical version shows directly that an edge is a band of high spatial frequencies."
    },
    {
      title: "Phase-contrast and dark-field microscopy",
      body:
        "Zernike phase contrast places a phase plate in the objective's back focal plane; dark field blocks the illumination. Both are 4f filters, and both make transparent or weakly scattering samples visible."
    },
    {
      title: "Optical correlation and computing",
      body:
        "Matched filters and joint-transform correlators use a 4f geometry to compute correlations at the speed of light. Modern diffractive neural networks and optical convolvers inherit the same Fourier-plane architecture."
    },
    {
      title: "Coronagraphy and apodisation",
      body:
        "A coronagraph is a focal-plane mask plus a pupil stop designed to suppress starlight while preserving a faint companion. The Lyot stop is a spatial filter chosen to reject diffracted light from the telescope aperture."
    },
    {
      title: "Diffractive optics and wavefront sensing",
      body:
        "Diffractive optical elements, grating period metrology and Shack–Hartmann or phase-retrieval wavefront sensors all rely on the Fourier relation between a pupil and its focal-plane intensity."
    }
  ],
  questions: [
    {
      id: "q01",
      type: "mcq",
      difficulty: 1,
      topic: "Spatial frequency",
      prompt: "A grating has a period of 0.5 mm. What is its fundamental spatial frequency?",
      options: ["0.25 mm⁻¹", "0.5 mm⁻¹", "1 mm⁻¹", "2 mm⁻¹"],
      answerIndex: 3,
      answer: "2 mm⁻¹",
      explanation: "Spatial frequency is the reciprocal of the period: f = 1/Λ = 1/0.5 mm = 2 mm⁻¹.",
      marks: 1
    },
    {
      id: "q02",
      type: "mcq",
      difficulty: 1,
      topic: "Lens Fourier transform",
      prompt:
        "A plane wave enters a lens of focal length f at a small angle θ to the axis. Where does it focus in the back focal plane?",
      options: ["At x = fθ", "At x = λ/θ", "At x = fλθ", "At x = θ/(λf)"],
      answerIndex: 0,
      answer: "At x = fθ",
      explanation:
        "The transverse spatial frequency of a tilted plane wave is f_x = sin θ/λ ≈ θ/λ, so x_f = λf f_x = f sin θ ≈ fθ.",
      marks: 1
    },
    {
      id: "q03",
      type: "mcq",
      difficulty: 1,
      topic: "Spatial filtering",
      prompt: "What does an ideal low-pass filter in the Fourier plane do to an image?",
      options: ["Sharpens edges", "Blurs the image", "Inverts the contrast", "Rotates the image"],
      answerIndex: 1,
      answer: "Blurs the image",
      explanation:
        "Removing high spatial frequencies removes fine detail. In the image plane this is convolution with a broad point-spread function, i.e. blur.",
      marks: 1
    },
    {
      id: "q04",
      type: "mcq",
      difficulty: 1,
      topic: "Phase contrast",
      prompt: "A phase plate that retards the undiffracted background by π/2 is the basis of which technique?",
      options: ["Dark-field microscopy", "Zernike phase contrast", "Confocal microscopy", "Polarimetry"],
      answerIndex: 1,
      answer: "Zernike phase contrast",
      explanation:
        "The π/2 phase step makes the background and the diffracted light interfere in the image, converting phase gradients into intensity.",
      marks: 1
    },
    {
      id: "q05",
      type: "mcq",
      difficulty: 2,
      topic: "Fourier-plane scale",
      prompt: "If the focal length of L1 is doubled while the wavelength and object are unchanged, what happens to the Fourier-plane pattern?",
      options: ["It halves in size", "It is unchanged", "It doubles in size", "It quadruples in size"],
      answerIndex: 2,
      answer: "It doubles in size",
      explanation: "x_f = λf f_x, so the position of every order is proportional to f.",
      marks: 1
    },
    {
      id: "q06",
      type: "mcq",
      difficulty: 2,
      topic: "Diffraction regimes",
      prompt: "In which limit does free-space propagation alone produce a Fraunhofer diffraction pattern?",
      options: ["N_F ≫ 1", "N_F = 1", "N_F ≪ 1", "N_F < 0"],
      answerIndex: 2,
      answer: "N_F ≪ 1",
      explanation:
        "N_F = a²/(λz) ≪ 1 means the quadratic source phase is negligible, leaving the Fourier kernel.",
      marks: 1
    },
    {
      id: "q07",
      type: "short",
      difficulty: 2,
      topic: "Lens Fourier transform",
      prompt: "Explain in physical terms why a converging lens forms a Fourier transform at its back focal plane.",
      answer:
        "The lens adds a quadratic phase exp[−ikr²/(2f)]. When the object is at the front focal plane, this phase cancels the quadratic phase accumulated in propagating to the lens and to the focal plane. What remains is a linear phase exp[−i2π(x_f ξ + y_f η)/(λf)] under the integral, which is exactly the Fourier kernel. The focal length replaces the far-field distance a²/λ.",
      hint: "Write the Fresnel integral, insert the lens phase, and collect the quadratic terms.",
      marks: 4
    },
    {
      id: "q08",
      type: "short",
      difficulty: 2,
      topic: "Phase spectrum",
      prompt: "What information is carried by the phase of the Fourier spectrum, and why is it invisible in a direct photograph of the Fourier plane?",
      answer:
        "The phase records the relative alignment (position) of the sinusoidal components. A translation adds a linear phase ramp; a focus error adds a quadratic phase; an asymmetric object produces a non-centrosymmetric phase pattern. A camera measures intensity |E|² and discards the phase, so two fields with the same magnitude but different phase look identical.",
      marks: 3
    },
    {
      id: "q09",
      type: "short",
      difficulty: 2,
      topic: "High-pass filtering",
      prompt: "Why does removing the zero order enhance edges?",
      answer:
        "The zero order is the uniform background (the mean). Removing it leaves only the variations. For a step edge the remaining spectrum is dominated by high frequencies, and its inverse transform is approximately the derivative of the edge: a bipolar bright-dark response. The image therefore shows the edge with enhanced contrast on a dark background.",
      marks: 3
    },
    {
      id: "q10",
      type: "short",
      difficulty: 2,
      topic: "4f architecture",
      prompt: "Why is a second lens needed after the filter plane? What would a single lens give?",
      answer:
        "A single lens produces the Fourier transform at its back focal plane but no real image of the object there. The second lens performs a second Fourier transform, which is an inversion, and forms a real image at its back focal plane. It also allows the filter to sit in a plane where the field is a spectrum while the camera sits in a conjugate image plane.",
      marks: 3
    },
    {
      id: "q11",
      type: "short",
      difficulty: 2,
      topic: "Calibration",
      prompt: "How would you calibrate the spatial-frequency scale of the Fourier plane experimentally?",
      answer:
        "Insert a grating of known period Λ, measure the separation Δx between the +1 and −1 orders (or between the zeroth and first order), and use Δx = λf/Λ or x₁ = λf/Λ. This determines the product λf. Repeat at a second known period to confirm linearity, and record the camera pixel size if the plane is imaged rather than viewed on a card.",
      marks: 3
    },
    {
      id: "q12",
      type: "short",
      difficulty: 2,
      topic: "Resolution",
      prompt: "Why does a finite pupil limit resolution?",
      answer:
        "A finite pupil collects only a finite range of diffraction angles, hence a finite band of spatial frequencies. To reconstruct a grating period d with contrast, at least one first order must enter the pupil. If d is small enough that all first orders fall outside, only the uniform zeroth order remains and the image is flat.",
      marks: 3
    },
    {
      id: "q13",
      type: "numerical",
      difficulty: 2,
      topic: "Fourier-plane position",
      prompt:
        "At λ = 633 nm and f = 200 mm, where does the first order of a grating with period 0.25 mm appear relative to the axis?",
      answer:
        "f_x = 1/0.25 mm = 4 mm⁻¹; x = λf f_x = (633 × 10⁻⁶ mm)(200 mm)(4 mm⁻¹) = 0.506 mm.",
      numeric: { value: 0.506, tolerance: 0.01, unit: "mm" },
      marks: 3
    },
    {
      id: "q14",
      type: "numerical",
      difficulty: 2,
      topic: "Cutoff frequency",
      prompt:
        "A circular pupil of radius a = 1.0 mm sits in the Fourier plane of a lens with f = 150 mm at λ = 632.8 nm. What is the cutoff spatial frequency and the corresponding period?",
      answer:
        "f_c = a/(λf) = 1.0/(632.8 × 10⁻⁶ × 150) = 10.5 mm⁻¹. The period is 1/f_c = 0.095 mm.",
      numeric: { value: 10.5, tolerance: 0.2, unit: "mm⁻¹" },
      marks: 3
    },
    {
      id: "q15",
      type: "numerical",
      difficulty: 2,
      topic: "Abbe limit",
      prompt: "What is the conventional Abbe resolution limit of a 0.25 NA objective at 532 nm?",
      answer:
        "Using the conventional λ/(2NA) form: d_min = 532 nm/(2 × 0.25) = 1064 nm = 1.06 µm. With axial coherent illumination the cutoff period is twice as large, 2.13 µm; the λ/(2NA) value assumes oblique illumination or incoherent imaging.",
      numeric: { value: 1.064, tolerance: 0.01, unit: "µm" },
      marks: 2
    },
    {
      id: "q16",
      type: "numerical",
      difficulty: 2,
      topic: "Fresnel number",
      prompt:
        "An aperture of half-width 2 mm is observed 1 m away at 633 nm. Compute the Fresnel number and state the regime.",
      answer:
        "N_F = a²/(λz) = (2 mm)²/(633 × 10⁻⁶ mm × 1000 mm) = 4/0.633 = 6.3. Since N_F > 1, this is the Fresnel (near-field) regime, not Fraunhofer.",
      numeric: { value: 6.3, tolerance: 0.1, unit: "" },
      marks: 2
    },
    {
      id: "q17",
      type: "numerical",
      difficulty: 3,
      topic: "Sampling",
      prompt:
        "An object window of 12 mm is sampled on 256 points. What are the frequency pitch and the maximum spatial frequency?",
      answer: "Δf = 1/L = 1/12 mm = 0.0833 mm⁻¹. f_max = N/(2L) = 256/24 = 10.67 mm⁻¹.",
      numeric: { value: 10.67, tolerance: 0.02, unit: "mm⁻¹" },
      marks: 3
    },
    {
      id: "q18",
      type: "numerical",
      difficulty: 3,
      topic: "Filter and resolution",
      prompt:
        "With f_max = 5.33 mm⁻¹, a normalised low-pass radius r = 0.2, and λ = 632.8 nm, compute f_c, the period cutoff, the paraxial NA, the axial coherent limit and the conventional Abbe limit.",
      answer:
        "f_c = 0.2 × 5.33 = 1.07 mm⁻¹; period = 0.94 mm; NA ≈ λ f_c = 6.8 × 10⁻⁴; axial coherent limit λ/NA = 0.94 mm; conventional Abbe λ/(2NA) = 0.47 mm.",
      numeric: { value: 0.47, tolerance: 0.03, unit: "mm" },
      marks: 4
    },
    {
      id: "q19",
      type: "numerical",
      difficulty: 2,
      topic: "Magnification",
      prompt:
        "A 4f system has f₁ = 100 mm and f₂ = 250 mm. What is the magnification, and how large is the image of a 1.0 mm feature?",
      answer: "M = f₂/f₁ = 2.5. The image of a 1.0 mm feature is 2.5 mm across, inverted.",
      numeric: { value: 2.5, tolerance: 0.01, unit: "" },
      marks: 2
    },
    {
      id: "q20",
      type: "derivation",
      difficulty: 3,
      topic: "Lens Fourier transform",
      prompt: "Derive the field at the back focal plane of a thin lens for an object at the front focal plane.",
      answer:
        "Start with the Fresnel integral from the object to the lens, multiply by the thin-lens phase exp[−ik(ξ²+η²)/(2f)], and propagate a distance f. Expanding the square in the final Fresnel kernel gives a term in ξ²+η² that cancels the lens phase exactly, a term in x_f²+y_f² outside the integral, and the cross term −2(x_f ξ+y_f η)/(λf). The result is a constant times the Fourier transform of the object at frequencies (x_f/λf, y_f/λf), with a residual quadratic phase that is unity when d = f.",
      marks: 6
    },
    {
      id: "q21",
      type: "derivation",
      difficulty: 3,
      topic: "Resolution",
      prompt: "Derive the coherent cutoff and the conventional Abbe resolution limit.",
      answer:
        "A grating of period d diffracts at sin θ_m = mλ/d. The pupil collects angles up to θ_max with NA = sin θ_max. For an image with contrast, at least one first order must be collected: λ/d ≤ NA. Hence the axial coherent limit is d ≥ λ/NA. Illuminating obliquely at the optimum angle centres one first order on the pupil and allows d ≥ λ/(2NA); incoherent imaging has the same 2NA/λ cutoff. The factor of two is therefore a statement about illumination and detection, not about axial coherent imaging.",
      marks: 6
    },
    {
      id: "q22",
      type: "derivation",
      difficulty: 3,
      topic: "Point-spread function",
      prompt: "Show that a circular low-pass pupil produces an Airy-like point-spread function and estimate its central-lobe radius.",
      answer:
        "The pupil is a disk of radius a. Its inverse Fourier transform is proportional to J₁(2πar/(λf))/(2πar/(λf)). The first zero of J₁ is at 3.832, so the central lobe radius is r₀ = 0.61λf/a = 0.61λ/NA. A point object is therefore imaged as this pattern, and two points closer than r₀ are not cleanly separated.",
      marks: 6
    },
    {
      id: "q23",
      type: "long",
      difficulty: 3,
      topic: "Double diffraction",
      prompt:
        "Explain the double diffraction in a 4f processor. Why does the second lens produce an image rather than another spectrum?",
      answer:
        "The first lens maps object position to spatial frequency at the filter plane. The field there is the Fourier transform of the object. The second lens performs another Fourier transform of that field. The Fourier inversion theorem states that two forward transforms return the original function with an inversion, so the second transform produces a real image (inverted and magnified by f₂/f₁) rather than a new spectrum. The filter between the transforms multiplies the spectrum, which is equivalent to convolving the image with the inverse transform of the mask. If the filter is open, the two transforms cancel and the image is the object.",
      marks: 8
    },
    {
      id: "q24",
      type: "long",
      difficulty: 3,
      topic: "Coherent versus incoherent",
      prompt:
        "Compare coherent and incoherent 4f spatial filtering. Which quantities change, and which conclusions remain valid?",
      answer:
        "In the coherent case the filter multiplies complex amplitudes and the image is the convolution of the object amplitude with the amplitude point-spread function. In the incoherent case intensities add, the filter acts on the optical transfer function, and the image is a convolution of intensities with |h|². The incoherent cutoff is twice the coherent cutoff for the same pupil. The geometry, the Fourier-plane scale λf and the qualitative effects of low- and high-pass masks remain valid. Contrast, edge shape, speckle and the interpretation of the point-spread function change. A laser experiment is coherent; an LED experiment is closer to incoherent and must be modelled as a sum over wavelengths and source points.",
      marks: 8
    },
    {
      id: "q25",
      type: "long",
      difficulty: 3,
      topic: "Coherence",
      prompt:
        "What coherence conditions does a 4f processor require? What happens with a white-light LED?",
      answer:
        "The field must have a predictable phase across the object (spatial coherence) and over the measurement time (temporal coherence). A single-mode laser satisfies both over a teaching bench. A white LED has a short coherence length (tens of wavelengths) and a small coherence area: each wavelength produces a differently scaled Fourier plane because x_f = λf f_x, and each source point produces a shifted one. The camera sums the intensities, so high-frequency orders overlap and wash out, the filter edge softens and the measured contrast falls. A narrow-band filter and a pinhole can restore partial coherence at the cost of power.",
      marks: 8
    },
    {
      id: "q26",
      type: "long",
      difficulty: 3,
      topic: "Phase",
      prompt:
        "Why does the phase spectrum matter, and how can it be measured or exploited?",
      answer:
        "The phase determines how the spectral components align when they recombine. It carries translation, focus, asymmetry and the structure of phase objects. A camera at the Fourier plane measures only intensity, so phase must be accessed by interference (holography, interferometry), by a phase plate that converts phase to intensity (Zernike phase contrast), by shearing the field against itself (DIC), or computationally from one or more intensity measurements with constraints (phase retrieval, ptychography). Phase matters because a lens recombines amplitudes: changing one component's phase changes the image even when no intensity is absorbed.",
      marks: 8
    },
    {
      id: "q27",
      type: "viva",
      difficulty: 2,
      topic: "Alignment",
      prompt: "What happens if the filter is not exactly in the Fourier plane?",
      answer:
        "The mask then acts on a Fresnel diffraction pattern rather than a pure spectrum. The image is multiplied by a residual quadratic phase and is defocused, the effective filter profile is blurred, and the cutoff is no longer sharp. A small longitudinal error mainly defocuses; a large one changes the pattern entirely. The filter should be positioned by maximising the sharpness of the spectrum on a card or by maximising the transmitted power through a small aperture.",
      marks: 4
    },
    {
      id: "q28",
      type: "viva",
      difficulty: 2,
      topic: "Phase contrast",
      prompt: "Why does a phase object become visible when a phase plate is inserted?",
      answer:
        "The undiffracted background and the diffracted light are coherent. A phase plate changes their relative phase. In the image plane they interfere, and the intensity becomes a function of the object phase. Without the plate the background and the weak scattered light are approximately in quadrature, so the intensity change is second order and nearly invisible.",
      marks: 4
    },
    {
      id: "q29",
      type: "viva",
      difficulty: 2,
      topic: "Dark field",
      prompt: "What is the difference between dark-field and phase-contrast imaging?",
      answer:
        "Dark field blocks the zeroth order entirely, so only scattered light forms the image on a dark background; it is sensitive to scattering strength. Phase contrast keeps the zeroth order but shifts its phase, so background and scattered light interfere; it is sensitive to phase gradients and can be quantitative for weak objects. Both are Fourier-plane filters, but their transfer functions differ.",
      marks: 4
    },
    {
      id: "q30",
      type: "viva",
      difficulty: 2,
      topic: "Calibration",
      prompt: "How would you check that the Fourier plane is centred on the optical axis?",
      answer:
        "Insert a symmetric object such as a grating or a double slit. The +1 and −1 orders should be equidistant from the axis and should have equal intensity. Rotate the object by 180°; a centred system gives the same pattern. Translate the object sideways: the Fourier pattern should not move (only its phase changes). If the pattern moves, the object or the detection plane is off-axis.",
      marks: 4
    },
    {
      id: "q31",
      type: "troubleshooting",
      difficulty: 2,
      topic: "No image",
      prompt: "The camera shows a bright uniform field but no image. List the likely causes in order of probability.",
      answer:
        "Check that the object is actually in the beam and that the camera is at the image plane of L2, not at the Fourier plane. Check that L2 is present and that the L1–filter–L2 spacing is f₁ + f₂. Verify that the iris is open and that a filter is not blocking the zeroth order. Finally check that the camera exposure is not saturated: a saturated uniform field can hide a low-contrast image.",
      marks: 4
    },
    {
      id: "q32",
      type: "troubleshooting",
      difficulty: 2,
      topic: "Low contrast",
      prompt: "The fringes or orders are visible but the contrast is much lower than expected. What should you investigate?",
      answer:
        "Look for stray light or a background pedestal (subtract a dark frame), camera gamma or saturation, partial coherence (use a narrower band or a pinhole), a filter that is off-centre or tilted, an object that is not at the front focal plane, and a lens aperture that is truncating the beam. Compare the open-pupil contrast with the expected value before blaming the filter.",
      marks: 4
    },
    {
      id: "q33",
      type: "troubleshooting",
      difficulty: 3,
      topic: "Ghost images",
      prompt: "A faint shifted copy of the image appears alongside the main image. What could cause it?",
      answer:
        "Multiple reflections between the lens surfaces, the filter substrate or the camera window produce a weak secondary beam with a small angle. A dust particle or a scratch in the Fourier plane scatters light into a halo. A mismatch between f₁ and f₂ or a filter that is not normal to the axis can also produce a shifted ghost. Tilt the filter slightly, use anti-reflection-coated optics, clean the plane, and check the alignment of the two lenses.",
      marks: 5
    },
    {
      id: "q34",
      type: "instrumentation",
      difficulty: 2,
      topic: "Camera settings",
      prompt: "Which camera settings matter for quantitative Fourier-plane measurements?",
      answer:
        "Use a linear response (gamma = 1), fixed exposure and gain, no automatic white balance or contrast, and keep the peak below saturation. Subtract a dark frame, correct for fixed-pattern noise if necessary, and record the bit depth and pixel size. If the camera has binning, state it, because it changes the sampling. Avoid exposure changes between the reference and filtered images; use ND filters instead.",
      marks: 4
    },
    {
      id: "q35",
      type: "instrumentation",
      difficulty: 2,
      topic: "Lens alignment",
      prompt: "How do you align a lens so that its axis coincides with the beam?",
      answer:
        "Use two irises to define the beam axis, then adjust the lens mount until the beam passes through both without deflection. Check for a back-reflection: with the lens normal to the beam, the reflected spot should return to the source. A shear plate or an autocollimator gives a more sensitive check. Finally, confirm that the focal spot is centred and symmetric when a plane wave is focused.",
      marks: 4
    },
    {
      id: "fourier-x01",
      type: "short",
      difficulty: 2,
      topic: "Locating the Fourier plane",
      prompt:
        "You have a lens, a grating and a white card but no camera. Describe how you locate the back focal plane and how you distinguish it from a Fresnel diffraction pattern. What happens to the pattern as you close an iris placed at that plane?",
      answer:
        "Translate the card along the axis after L1. At the back focal plane the diffraction orders are sharpest and their positions are fixed; away from it the pattern changes scale and shape, with curved Fresnel fringes and a bright axial caustic. Confirm the plane with a known grating: the ±1 orders must be symmetric about the axis and their separation must scale as 1/Λ, and rotating the grating must rotate the orders. Measure the distance from the lens principal plane and compare it with f₁ (measured by focusing a distant object). Closing an iris at the plane truncates the spectrum: the high orders disappear, the transmitted energy falls, and any image formed downstream becomes blurred. It does not move the surviving orders, whose positions are set by λf/Λ. Check the lens rim as well: the clear aperture can clip the orders before the iris does.",
      marks: 4
    },
    {
      id: "fourier-x02",
      type: "short",
      difficulty: 2,
      topic: "4f alignment and inversion",
      prompt:
        "List the alignment sequence for a 4f processor and explain why the final image is inverted. What would the camera see if L2 were removed?",
      answer:
        "Define the axis with two irises and a fixed beam height. Mount the object one focal length f₁ in front of L1 using the translation stage; place the filter one focal length behind L1; place L2 one focal length f₂ after the filter; place the camera f₂ behind L2. Check back-reflections or autocollimation, confirm that the object and image planes are conjugate, and centre the filter on the zeroth order. Each lens performs a forward Fourier transform, and two forward transforms invert the transverse coordinates (and magnify by f₂/f₁), so the image is rotated by 180°. Without L2 the camera at the filter plane sees the spatial spectrum, not an image; moving it farther would show a Fresnel pattern, not a real image of the object.",
      marks: 4
    },
    {
      id: "fourier-x03",
      type: "mcq",
      difficulty: 1,
      topic: "Choosing a filter mask",
      prompt:
        "A transparency carries fine vertical stripes (intensity varying along x) on a broad uniform background. You want to suppress the stripes while keeping the broad structure. Which mask in the Fourier plane is the best choice?",
      options: [
        "A vertical slit that keeps |f_x| small",
        "A horizontal slit that keeps |f_y| small",
        "A phase plate of π/2",
        "An annulus centred on the axis"
      ],
      answerIndex: 0,
      answer: "A vertical slit that keeps |f_x| small",
      explanation:
        "Vertical stripes vary rapidly along x, so their energy sits at large |f_x|. A vertical slit transmits only small |f_x| and blocks those components; it also smears structure along x. A horizontal slit would keep the stripe frequencies and remove vertical detail instead. A phase plate changes phase without removing amplitude, and an annulus enhances edges rather than selecting one orientation.",
      marks: 2
    },
    {
      id: "fourier-x04",
      type: "short",
      difficulty: 2,
      topic: "Camera measurement of fringe spacing",
      prompt:
        "You image the Fourier plane onto a camera. How do you measure the separation of the first orders reliably, and how do you convert it to an object period? Include two precautions specific to the camera.",
      answer:
        "Focus the relay and camera on the Fourier plane, record a background frame and keep the peak below saturation (fixed exposure, linear gamma, ND rather than exposure changes). Find the centroids of the +1 and −1 orders by fitting a peak or using an intensity centroid, not by eye, and average the two sides to cancel a centring offset. Convert the order position x₁ to a spatial frequency with f_x = x₁/(λf₁); the object period is 1/f_x for the corresponding spectral maximum. For a grating, the ±1 separation is 2λf₁/Λ, so Λ = 2λf₁/Δx. Precautions: calibrate the effective pixel scale with a known grating, and avoid blooming or saturation, which bias the centroids; also account for the relay magnification and check that the orders are not clipped by the sensor.",
      marks: 4
    },
    {
      id: "fourier-x05",
      type: "mcq",
      difficulty: 2,
      topic: "No spectrum visible",
      prompt:
        "With the object roughly 40 mm behind the front focal plane of L1, the camera at the nominal Fourier plane shows a broad, low-contrast blur instead of sharp orders. What is the most likely cause?",
      options: [
        "The object is not at the front focal plane, so the plane contains a Fresnel pattern with a residual quadratic phase.",
        "The laser is unpolarised.",
        "The camera exposure is too short.",
        "A phase plate has been inserted."
      ],
      answerIndex: 0,
      answer:
        "The object is not at the front focal plane, so the plane contains a Fresnel pattern with a residual quadratic phase.",
      explanation:
        "The exact lens Fourier transform requires d₁ = f₁. A longitudinal displacement adds a quadratic phase and moves the effective transform plane, so the intensity at the nominal plane is a defocused, Fresnel-like pattern. Restore d₁ with the stage and check the sharpness on a card. Polarisation and exposure do not produce this defocus, and a phase plate would still leave a sharp spectrum.",
      marks: 2
    },
    {
      id: "fourier-x06",
      type: "short",
      difficulty: 3,
      topic: "Ringing and a missing image",
      prompt:
        "Two problems appear in the same session: (i) after closing a hard-edged low-pass iris, the image shows strong concentric ringing around bright features; (ii) after moving L2 to make room for a mount, the camera shows no image at all. Diagnose both and give the fix.",
      answer:
        "(i) A hard disk pupil has an Airy amplitude point-spread function with slowly decaying sidelobes; truncating the spectrum therefore produces Gibbs ringing. It is a diffraction effect, not camera noise. Use a softer or apodised mask, a Gaussian low-pass, or a larger radius; the ringing trades against the desired blur. (ii) The image plane is f₂ behind L2 only when the filter is at the front focal plane of L2 and L2 is f₂ from it. Moving L2 changes the conjugate plane, so the camera is no longer at the image. Restore the L1–filter–L2 spacing, refocus the camera, and check that the object is at f₁ and the filter is centred. If the camera sits at the Fourier plane it will show a spectrum, not an image.",
      marks: 5
    },
    {
      id: "fourier-x07",
      type: "mcq",
      difficulty: 2,
      topic: "Convolution theorem and applications",
      prompt:
        "A mask with complex transfer function H(f_x, f_y) is placed in the Fourier plane of a 4f processor. Which statement correctly describes the image field?",
      options: [
        "It is the object field multiplied by H(x, y).",
        "It is the object field convolved with the inverse Fourier transform of H.",
        "It is the Fourier transform of H only.",
        "It is the object field plus H."
      ],
      answerIndex: 1,
      answer: "It is the object field convolved with the inverse Fourier transform of H.",
      explanation:
        "Multiplication in the Fourier plane corresponds to convolution in the image plane (the convolution theorem). A high-pass H gives a derivative-like kernel and enhances edges; a coronagraph combines a focal-plane mask with a Lyot stop to suppress diffracted starlight. Options A and D confuse the domains, and C discards the object.",
      marks: 3
    },
    {
      id: "fourier-x08",
      type: "short",
      difficulty: 3,
      topic: "Units and optical computing",
      prompt:
        "Why is the Fourier-plane axis calibrated in mm⁻¹, and why can a 4f optical processor perform a large convolution quickly yet not replace a digital computer for precision work?",
      answer:
        "The conjugate variable to position x in millimetres is spatial frequency f_x in cycles per millimetre, mm⁻¹. The lens maps that frequency to a position x_f = λf f_x, so a measured focal-plane distance divided by λf gives mm⁻¹. The optical processor performs the transform and convolution in parallel at the speed of light, with no clock or memory access. Its precision is limited by the space-bandwidth product of the object or SLM, the finite pupil, aberrations, wavelength-scale alignment for phase masks, coherence, and detector noise and dynamic range. A digital computer has much higher numerical precision and memory, and it can iterate; the 4f system is an analogue, fixed-geometry convolution engine.",
      marks: 4
    },
    {
      id: "fourier-x09",
      type: "numerical",
      difficulty: 3,
      topic: "Position, period and cutoff",
      prompt:
        "The +1 and −1 orders of a grating are separated by 0.95 mm in the Fourier plane (each 0.475 mm from the axis) with λ = 632.8 nm and f = 150 mm. Find the spatial frequency, the grating period, and the cutoff frequency of a circular pupil of radius 1.0 mm. Enter the grating period in mm.",
      answer:
        "f_x = x/(λf) = 0.475 mm/[(632.8 × 10⁻⁶ mm)(150 mm)] = 5.00 mm⁻¹. The grating period is 1/f_x = 0.200 mm. The pupil cutoff is f_c = a/(λf) = 1.0 mm/0.09492 mm² = 10.5 mm⁻¹, so the first order at 5.00 mm⁻¹ passes comfortably.",
      numeric: { value: 0.2, tolerance: 0.005, unit: "mm" },
      marks: 4
    },
    {
      id: "fourier-x10",
      type: "viva",
      difficulty: 3,
      topic: "Resolution convention and camera sampling",
      prompt:
        "In a viva: a 4f system uses a coherent laser. Why is the cutoff λ/NA rather than the Abbe λ/(2NA), and how would you show that a camera with 3.45 µm pixels behind a 2× relay is not limiting the measurement?",
      answer:
        "For axial coherent illumination the pupil collects spatial frequencies up to NA/λ. The first grating order enters when λ/d ≤ NA, so the smallest period is d_min = λ/NA. The Abbe value λ/(2NA) assumes oblique illumination at the optimum angle or incoherent imaging, where the cutoff is 2NA/λ. State the convention before comparing with a prediction. The 2× relay makes the effective pixel pitch at the Fourier plane 3.45/2 = 1.725 µm, so the Nyquist spatial frequency is 1/(2p) = 290 mm⁻¹. That is far above the optical cutoff for the sampled 12 mm window at 128² (about 5.3 mm⁻¹), so the camera oversamples the Fourier plane. For an image-plane measurement, check instead that the point-spread function spans at least two pixels; otherwise the fitted width is pixel-limited. Record the relay magnification and any binning.",
      marks: 6
    }
  ],
  references: [
    { id: "goodman", authors: "J. W. Goodman", title: "Introduction to Fourier Optics", year: "2017", source: "W. H. Freeman, 4th edition", kind: "textbook", note: "The standard treatment of Fraunhofer diffraction, lens transfer functions and 4f spatial filtering." },
    { id: "hecht", authors: "E. Hecht", title: "Optics", year: "2017", source: "Pearson, 5th edition", kind: "textbook", note: "Diffraction, coherence and Fourier-optics chapters; useful for the undergraduate derivation." },
    { id: "bornwolf", authors: "M. Born and E. Wolf", title: "Principles of Optics", year: "1999", source: "Cambridge University Press, 7th anniversary edition", kind: "textbook", note: "Rigorous diffraction theory and partially coherent light." },
    { id: "saleh", authors: "B. E. A. Saleh and M. C. Teich", title: "Fundamentals of Photonics", year: "2019", source: "Wiley, 3rd edition", kind: "textbook", note: "Fourier optics, Gaussian beams and detector models." },
    { id: "fowles", authors: "G. R. Fowles", title: "Introduction to Modern Optics", year: "1989", source: "Dover Publications, 2nd edition", kind: "textbook", note: "Concise treatment of diffraction and image formation." },
    { id: "loudon", authors: "R. Loudon", title: "The Quantum Theory of Light", year: "2000", source: "Oxford University Press, 3rd edition", kind: "textbook", note: "Coherence and photon statistics; background for the coherence discussion." },
    { id: "thorlabs_edu", authors: "Thorlabs, Inc.", title: "Educational kits, user guides and application notes", year: "n.d.", source: "Thorlabs document library", url: "https://www.thorlabs.com/", accessed: "2026-11-25", kind: "manual", note: "Consult the printed guide and packing list supplied with the physical kit. A model-specific document URL must be recorded after the kit label is verified; it is not asserted here." },
    { id: "thorlabs_kine", authors: "Thorlabs, Inc.", title: "Kinematic mirror mount and optomechanics technical notes", year: "n.d.", source: "Thorlabs document library", url: "https://www.thorlabs.com/", accessed: "2026-11-25", kind: "manual", note: "Generic mounting practice; verify the exact mount model in the inventory." },
    { id: "edmund_optics", authors: "Edmund Optics", title: "Optics and optical instrumentation reference material", year: "n.d.", source: "Edmund Optics technical library", url: "https://www.edmundoptics.com/", accessed: "2026-11-25", kind: "manual", note: "Independent supplier reference for generic optical definitions and catalogue categories." },
    { id: "taylor", authors: "J. R. Taylor", title: "An Introduction to Error Analysis", year: "1997", source: "University Science Books, 2nd edition", kind: "textbook", note: "Uncertainty propagation used in the analysis tasks." },
    { id: "bevington", authors: "P. R. Bevington and D. K. Robinson", title: "Data Reduction and Error Analysis for the Physical Sciences", year: "2003", source: "McGraw-Hill, 3rd edition", kind: "textbook", note: "Least-squares fitting of the cutoff and contrast trends." }
  ],
  related: ["michelson-interferometer", "optical-tweezers", "polarization-3d-cinema"],
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

export const content = fourierOpticsContent;
export default fourierOpticsContent;
