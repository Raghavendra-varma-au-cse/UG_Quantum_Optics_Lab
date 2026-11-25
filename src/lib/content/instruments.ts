/**
 * Instrument database for the Quantum Optics Laboratory.
 *
 * These entries describe how a measurement instrument works internally, how it
 * is used, and what limits its honesty. Every numeric specification is a
 * typical/educational figure (`typical: true`); none is a datasheet value for a
 * specific model, and no instrument is assumed to be present in the laboratory.
 *
 * `InstrumentEntry` intentionally has no verification field, so the runtime
 * records carry one in `InstrumentRecord` and expose it separately through
 * `INSTRUMENT_VERIFICATION`. Every entry here is `unverified`.
 *
 * Power measurement and photon counting are different measurements:
 * a photodiode or power meter integrates many photons and reports average
 * power, while a SPAD plus counter registers discrete detection events. No
 * entry may be used to claim photon counting unless it is a SPAD/counter chain.
 */

import type { ExperimentSlug, InstrumentEntry, SpecRow, Verification } from "./types";

const THORLABS_DOC = "https://www.thorlabs.com/";

function spec(label: string, value: string): SpecRow {
  return { label, value, typical: true };
}

/** InstrumentEntry plus the honesty label required by the inventory. */
export interface InstrumentRecord extends InstrumentEntry {
  verification: Verification;
}

type InstrumentCategory = InstrumentEntry["category"];

const DATA: InstrumentRecord[] = [
  {
    id: "photodiode",
    name: "Photodiode detection channel",
    category: "Detection",
    summary:
      "A photodiode channel converts optical power into a voltage through a transimpedance amplifier, giving a continuous, linear measurement of average power or a modulated waveform. It is the correct instrument for fringe signals, transmission ratios and position sensing, and the wrong instrument for counting photons. At room temperature its dark current and amplifier noise are many orders of magnitude larger than a single photoelectron.",
    principle:
      "Photons absorbed in the depletion region of a reverse-biased silicon p–i–n junction create electron–hole pairs. The junction field sweeps the carriers to the contacts, producing a photocurrent I = R·P, where the responsivity R depends on wavelength and is typically 0.35–0.5 A/W near 633 nm. A transimpedance amplifier with feedback resistor R_f converts current to voltage, V = I·R_f; the feedback capacitance and diode capacitance set the bandwidth, while R_f sets both gain and input-referred noise.",
    specs: [
      spec("Detector", "silicon p–i–n photodiode"),
      spec("Spectral range", "320–1100 nm; peak near 900 nm"),
      spec("Responsivity", "0.35–0.5 A/W at 633 nm"),
      spec("Active area", "1–10 mm²"),
      spec("Bandwidth", "DC–10 MHz at moderate gain"),
      spec("Transimpedance gain", "10³–10⁷ V/A, switchable"),
      spec("Noise equivalent power", "pW/√Hz range"),
      spec("Output", "BNC voltage, ± 10 V")
    ],
    measurementProcedure: [
      "Block the beam and record the dark offset with the same gain and bandwidth that will be used for the measurement.",
      "Centre the beam on the active area and attenuate until the output is below clipping at the chosen gain.",
      "Set the bandwidth just wide enough for the signal; reducing it lowers noise but can distort fast fringes.",
      "Record the transimpedance gain, load impedance and any optical attenuation with the voltage.",
      "Convert voltage to power using the measured responsivity at the actual wavelength, not a nominal value."
    ],
    noise: [
      "Shot noise from the photocurrent, which grows as √(2qIB) and dominates at high optical power.",
      "Johnson noise of the feedback resistor, which grows as √(4kTB/R_f) and dominates at low power.",
      "Dark current and its shot noise, especially at high reverse bias or elevated temperature.",
      "1/f drift from temperature changes in the diode and amplifier.",
      "Pickup and ground loops on the high-impedance input."
    ],
    calibration: [
      "Measure the transimpedance gain with a known input current or a calibrated source.",
      "Determine responsivity at the operating wavelength against a calibrated power meter.",
      "Record the dark offset versus temperature and gain.",
      "Check linearity over the intended power range with a stepped attenuator.",
      "Verify the bandwidth with a modulated source or a fast LED pulse."
    ],
    commonErrors: [
      "Saturating the amplifier and reading a clipped or compressed signal as a real measurement.",
      "Using the photodiode to count photons; it cannot resolve single-photon events at room temperature.",
      "Quoting a responsivity at the wrong wavelength.",
      "Ignoring the gain–bandwidth trade-off when increasing transimpedance."
    ],
    links: [
      "Shot noise and Poisson photon statistics",
      "Malus's law and transmission measurements",
      "Interference fringe intensity",
      "Gaussian beam power and waist"
    ],
    experiments: [
      "michelson-interferometer",
      "mach-zehnder-interferometer",
      "polarization-3d-cinema",
      "fourier-optics"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified"
  },
  {
    id: "power-meter",
    name: "Optical power meter",
    category: "Detection",
    summary:
      "A power meter reports the time-averaged optical power on a calibrated sensor, usually a photodiode for microwatts to milliwatts or a thermopile for higher power. It is the reference for beam power, attenuation and detector saturation, and it deliberately averages over enormous numbers of photons. It cannot report photon statistics, g⁽²⁾ or a single-photon count rate.",
    principle:
      "A photodiode head converts absorbed power to current and the meter applies a wavelength-dependent calibration factor to display watts. A thermopile head absorbs the beam on a blackened surface and measures the resulting temperature difference, giving a broad, nearly wavelength-independent response at the cost of speed and sensitivity. The calibration is traceable at specified wavelengths and power levels; outside those conditions the displayed value is an extrapolation.",
    specs: [
      spec("Sensor", "calibrated photodiode or thermopile head"),
      spec("Wavelength range", "200–1100 nm for silicon; wider for thermopile"),
      spec("Power range", "1 nW–10 W depending on head"),
      spec("Accuracy", "± 3–5% with a valid calibration"),
      spec("Resolution", "0.1% of full scale on the display"),
      spec("Response time", "sub-second for photodiode; seconds for thermopile"),
      spec("Aperture", "5–10 mm"),
      spec("Interface", "head connector with calibration data")
    ],
    measurementProcedure: [
      "Block the beam, zero the meter, and select the wavelength closest to the source.",
      "Start on the highest range and step down so the sensor is not saturated or damaged.",
      "Position the head so the beam fills the aperture without spilling over the edge.",
      "Wait for the reading to settle, then record power, range, wavelength setting and head identifier.",
      "Cross-check at a second range or with a second head when the result matters."
    ],
    noise: [
      "Sensor drift with ambient temperature and self-heating.",
      "Photodiode dark current and amplifier noise at the lowest ranges.",
      "Thermopile zero drift and air-current sensitivity.",
      "Spatial non-uniformity of the sensor response across the aperture.",
      "Wavelength calibration error when the source differs from the calibration points."
    ],
    calibration: [
      "Use a head with a current calibration certificate and record its serial number.",
      "Verify zero with the beam blocked and the head at operating temperature.",
      "Check linearity with a stepped attenuator or a calibrated source.",
      "Confirm the wavelength setting matches the actual source spectrum.",
      "Cross-calibrate heads against each other at the working wavelength."
    ],
    commonErrors: [
      "Overfilling the aperture and under-reading the power.",
      "Using the wrong wavelength setting and applying the wrong correction.",
      "Exceeding the head's maximum power and damaging the sensor.",
      "Reporting average power as if it were a photon count."
    ],
    links: [
      "Average power and photon flux",
      "Attenuation and optical density",
      "Beam-splitter ratios",
      "Detector saturation"
    ],
    experiments: [
      "michelson-interferometer",
      "mach-zehnder-interferometer",
      "quantum-bomb-tester",
      "quantum-eraser",
      "polarization-3d-cinema",
      "fourier-optics",
      "quantum-key-distribution",
      "optical-tweezers"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified"
  },
  {
    id: "spad",
    name: "Single-photon avalanche diode (SPAD)",
    category: "Detection",
    summary:
      "A SPAD is biased above breakdown so that one absorbed photon can trigger a macroscopic avalanche and a logic pulse. It is a binary detector with dead time and afterpulsing, not a linear power sensor, and it is the front end of any genuine photon-counting measurement. The SPAD alone does not count photons: it produces pulses that a counter or time tagger must record.",
    principle:
      "In Geiger mode the diode bias exceeds the breakdown voltage, so the depletion region has an extremely high field. A single photo-generated carrier can start an impact-ionization avalanche that becomes self-sustaining. A quenching circuit lowers the bias below breakdown to terminate the avalanche and then restores it after a dead time. Photon detection efficiency, dark-count rate, afterpulsing and timing jitter are the parameters that determine what the device can honestly measure.",
    specs: [
      spec("Mode", "Geiger mode, reverse bias above breakdown"),
      spec("Material / range", "silicon, 400–1000 nm"),
      spec("Photon detection efficiency", "30–70% at 650 nm"),
      spec("Dark count rate", "10–1000 Hz for a small area"),
      spec("Dead time", "20–100 ns"),
      spec("Timing jitter", "100–500 ps FWHM"),
      spec("Active area", "10–100 µm diameter"),
      spec("Output", "TTL/NIM pulse per detection")
    ],
    measurementProcedure: [
      "Verify the bias supply and quenching circuit against the diode's rating before powering it.",
      "Block the beam and measure the dark-count rate at the operating temperature.",
      "Focus a heavily attenuated beam onto the active area and keep the count rate well below saturation.",
      "Record counts over a known integration time and subtract the dark rate.",
      "Correct for dead time only within the model's valid range, and state the correction explicitly."
    ],
    noise: [
      "Dark counts from thermally generated carriers.",
      "Afterpulses from carriers trapped during a previous avalanche.",
      "Crosstalk between adjacent detectors in an array.",
      "Ambient light and pump scatter reaching the active area.",
      "Dead-time loss at high count rates, which biases the measured distribution."
    ],
    calibration: [
      "Measure the dark-count rate versus bias and temperature.",
      "Determine photon detection efficiency against a calibrated attenuated source.",
      "Measure the timing jitter with a pulsed source and a time tagger.",
      "Characterise afterpulsing with a pulsed source and inter-pulse arrival histogram.",
      "Record the dead time and the saturation behaviour."
    ],
    commonErrors: [
      "Exposing the SPAD to room light and saturating or damaging it.",
      "Treating the count rate as linear at high illumination.",
      "Ignoring afterpulsing when interpreting correlation measurements.",
      "Assuming the detection efficiency is uniform across the active area and spectrum."
    ],
    links: [
      "Poissonian photon statistics",
      "g⁽²⁾ and antibunching",
      "BB84 and single-photon detection",
      "Avalanche breakdown"
    ],
    experiments: ["quantum-key-distribution", "quantum-eraser"],
    docUrl: THORLABS_DOC,
    verification: "unverified"
  },
  {
    id: "photon-counter",
    name: "Photon counter / time tagger",
    category: "Detection",
    summary:
      "A photon counter or time tagger records detector pulse arrival times and builds count rates, histograms and coincidences. It is the instrument that turns SPAD pulses into photon statistics, and it is what distinguishes a photon-counting experiment from a dim-light power measurement. Its dead time, timing resolution and coincidence window set the limits of every derived quantity.",
    principle:
      "A discriminator converts each detector pulse into a digital edge at a fixed threshold. A time-to-digital converter timestamps the edge with picosecond-to-nanosecond resolution, and firmware bins intervals into histograms or streams time tags. Coincidence logic counts pairs within a window set by detector jitter and cable delay; accidental coincidences grow with the product of the singles rates and the window width, so they must be measured and subtracted.",
    specs: [
      spec("Channels", "2–8"),
      spec("Timing resolution", "10–1000 ps depending on mode"),
      spec("Maximum count rate", "1–100 MHz per channel"),
      spec("Input", "TTL/NIM from SPAD or PMT"),
      spec("Coincidence window", "set by firmware or cable delay"),
      spec("Histogram depth", "thousands of bins"),
      spec("Interface", "USB or Ethernet"),
      spec("Dead time", "mode dependent; measure it")
    ],
    measurementProcedure: [
      "Match the detector output levels and cable impedance to the counter inputs.",
      "Measure the cable delay between channels using a common electrical pulse.",
      "Set the discriminator threshold just above the detector noise floor.",
      "Record singles, accidentals and coincidences separately for the same integration time.",
      "Compute g⁽²⁾ or the QBER from the raw numbers and report the correction terms."
    ],
    noise: [
      "Accidental coincidences from uncorrelated detector counts.",
      "Counter dead time at high singles rates.",
      "Clock jitter and timebase drift.",
      "Pickup on long signal cables.",
      "Discriminator threshold instability."
    ],
    calibration: [
      "Measure the internal timebase against a known frequency reference.",
      "Determine the channel-to-channel delay with a split electrical pulse.",
      "Characterise dead time with a double-pulse source.",
      "Verify the coincidence window against a known correlated source.",
      "Record the discriminator threshold and input attenuation."
    ],
    commonErrors: [
      "Reporting raw coincidences without subtracting accidentals.",
      "Using a coincidence window much larger than the detector jitter.",
      "Ignoring dead time when the singles rate is high.",
      "Forgetting that cable length differences shift arrival times."
    ],
    links: [
      "Coincidence detection and g⁽²⁾",
      "Hanbury Brown–Twiss effect",
      "QBER and secret-key rate",
      "Time-correlated single-photon counting"
    ],
    experiments: ["quantum-key-distribution", "quantum-eraser"],
    docUrl: THORLABS_DOC,
    verification: "unverified"
  },
  {
    id: "oscilloscope",
    name: "Digital oscilloscope",
    category: "Electrical",
    summary:
      "A digital oscilloscope digitizes a voltage waveform so amplitude, timing and noise can be inspected. It is used for fringe signals, detector pulses, shutter sync and quadrant-detector differences. Its bandwidth, sampling rate and 8-bit vertical resolution define what can be measured without distortion.",
    principle:
      "The input passes through an attenuator and amplifier, then an analogue-to-digital converter samples it at a fixed rate into a buffer. Trigger logic aligns repeated events, and the display reconstructs the waveform. Bandwidth limits the fastest edge, sample rate limits the time resolution, and vertical resolution limits the smallest feature that can be seen on a large offset.",
    specs: [
      spec("Bandwidth", "100–500 MHz"),
      spec("Sample rate", "1–5 GS/s"),
      spec("Vertical resolution", "8 bits"),
      spec("Channels", "2–4"),
      spec("Input impedance", "1 MΩ // 10–20 pF"),
      spec("Time base", "1 ns/div to 10 s/div"),
      spec("Trigger", "edge, pulse, video"),
      spec("Coupling", "DC, AC, ground")
    ],
    measurementProcedure: [
      "Compensate the probe or verify the coax termination before connecting the signal.",
      "Set the vertical scale so the waveform fills most of the screen without clipping.",
      "Choose a time base showing several periods and trigger on a stable edge.",
      "Use averaging only for repetitive signals; state the number of averages.",
      "Record bandwidth limit, coupling, probe attenuation and sample rate with the trace."
    ],
    noise: [
      "Quantization noise from the 8-bit ADC.",
      "Front-end amplifier noise and input offset.",
      "Aliasing when the sample rate is too low for the signal bandwidth.",
      "Ground-loop pickup from long probe leads.",
      "Trigger jitter on noisy or slow edges."
    ],
    calibration: [
      "Compensate a 10× probe against the built-in calibration square wave.",
      "Verify vertical gain with a known DC source.",
      "Check the timebase against a known frequency.",
      "Measure the noise floor with the input terminated.",
      "Record the bandwidth limit setting."
    ],
    commonErrors: [
      "Trusting an amplitude that exceeds the scope's bandwidth.",
      "Using a long ground lead that picks up interference.",
      "Forgetting that AC coupling removes the DC component.",
      "Confusing display interpolation with real samples."
    ],
    links: [
      "Fourier analysis of measured signals",
      "Shot noise and amplifier noise",
      "Interference fringe motion",
      "Detector bandwidth"
    ],
    experiments: [
      "michelson-interferometer",
      "quantum-eraser",
      "optical-tweezers"
    ],
    verification: "unverified"
  },
  {
    id: "function-generator",
    name: "Function generator",
    category: "Electrical",
    summary:
      "A function generator produces sine, square, triangle and arbitrary waveforms for driving piezo scanners, acousto-optic modulators, shutters and stage controllers. It provides the dither and reference signals used in lock-in detection and trap calibration. Its 50 Ω output impedance means the delivered amplitude depends on the load.",
    principle:
      "Direct digital synthesis accumulates a phase at each sample clock and maps it through a waveform table to a digital-to-analogue converter. The analogue output is filtered and amplified. Frequency is set by the phase increment, so it can be tuned finely and swept continuously; amplitude accuracy depends on the output stage and on the load impedance.",
    specs: [
      spec("Frequency range", "1 µHz–20 MHz"),
      spec("Waveforms", "sine, square, triangle, ramp, arbitrary"),
      spec("Amplitude", "10 mV–10 V peak-to-peak into 50 Ω"),
      spec("DC offset", "± 5 V"),
      spec("Output impedance", "50 Ω"),
      spec("Channels", "1–2"),
      spec("Resolution", "µHz frequency, mV amplitude")
    ],
    measurementProcedure: [
      "Set waveform, frequency and amplitude before connecting a sensitive load.",
      "Measure the actual amplitude at the load with the oscilloscope.",
      "Verify the DC offset and the load's voltage rating.",
      "Use a shielded BNC cable and a proper termination.",
      "Record the settings and the measured load waveform."
    ],
    noise: [
      "Phase noise and clock jitter.",
      "Digital-to-analogue quantization and reconstruction spurs.",
      "Output amplifier distortion at high amplitude.",
      "Ground-loop pickup on the output cable.",
      "Amplitude drift with temperature."
    ],
    calibration: [
      "Verify frequency against a counter or the scope timebase.",
      "Measure amplitude into a known 50 Ω load.",
      "Check DC offset with a multimeter.",
      "Measure harmonic distortion at the working frequency.",
      "Confirm the waveform shape at the load, not just on the display."
    ],
    commonErrors: [
      "Assuming the displayed amplitude is delivered into a high-impedance load.",
      "Overdriving a piezo or modulator beyond its rating.",
      "Using a fast square wave on a long cable and accepting ringing.",
      "Changing frequency without rechecking amplitude."
    ],
    links: [
      "Piezoelectric actuation",
      "Lock-in detection",
      "Trap stiffness calibration",
      "Acousto-optic modulation"
    ],
    experiments: ["michelson-interferometer", "optical-tweezers"],
    verification: "unverified"
  },
  {
    id: "spectrum-analyzer",
    name: "Electrical spectrum analyser",
    category: "Electrical",
    summary:
      "An electrical spectrum analyser displays the power spectral density of a detector voltage, revealing noise, periodic interference and the Lorentzian corner of a trapped Brownian particle. It is not an optical spectrometer: the input is a voltage waveform, not light. Resolution bandwidth and input attenuation must be chosen deliberately, or the displayed noise density is wrong.",
    principle:
      "A swept superheterodyne analyser mixes the input with a local oscillator and filters the intermediate frequency with a narrow resolution-bandwidth filter while the oscillator sweeps. An FFT analyser digitizes the waveform and computes its discrete Fourier transform. In both cases the power per displayed bin depends on the resolution bandwidth, so noise must be normalized to dBm/Hz or V²/Hz.",
    specs: [
      spec("Frequency range", "DC–1 GHz or higher"),
      spec("Resolution bandwidth", "1 Hz–1 MHz"),
      spec("Displayed average noise", "−120 to −160 dBm/Hz"),
      spec("Input impedance", "50 Ω"),
      spec("Input attenuation", "0–30 dB"),
      spec("Dynamic range", "70–100 dB"),
      spec("Reference level", "adjustable")
    ],
    measurementProcedure: [
      "Connect the detector through a DC block if the analyser input cannot tolerate bias.",
      "Set input attenuation so the largest signal does not overload the mixer.",
      "Choose a resolution bandwidth narrow enough to resolve the feature of interest.",
      "Average enough traces to reduce the variance of the noise estimate.",
      "Normalize the displayed power by the resolution bandwidth before comparing with a model."
    ],
    noise: [
      "Analyser front-end noise and mixer conversion loss.",
      "Resolution-bandwidth-dependent variance of the noise estimate.",
      "Spurious responses and harmonics from input overload.",
      "Phase noise of the internal local oscillator.",
      "Pickup on the input cable."
    ],
    calibration: [
      "Verify amplitude accuracy with a known reference signal.",
      "Check frequency accuracy against a known tone.",
      "Measure the displayed average noise floor with a terminated input.",
      "Confirm the resolution-bandwidth normalization.",
      "Record input attenuation and reference level."
    ],
    commonErrors: [
      "Reading a noise floor in dBm without converting to dBm/Hz.",
      "Overloading the input and mistaking harmonics for real features.",
      "Using a resolution bandwidth so wide that a Lorentzian corner is smeared.",
      "Treating an electrical spectrum as an optical spectrum."
    ],
    links: [
      "Brownian motion and the Lorentzian PSD",
      "Fluctuation–dissipation relation",
      "Shot noise and amplifier noise",
      "Trap stiffness from the corner frequency"
    ],
    experiments: ["optical-tweezers"],
    verification: "unverified"
  },
  {
    id: "beam-profiler",
    name: "Beam profiler",
    category: "Imaging",
    summary:
      "A beam profiler measures the transverse intensity distribution of a beam and derives width, position, ellipticity and M². Camera-based and scanning-slit instruments are both common. The reported width depends on the analysis definition, so the method must be stated with the number.",
    principle:
      "A camera profiler records the irradiance pattern and computes moments of the distribution. The ISO 11146 second-moment width (D4σ) is standard for Gaussian-like beams, while a Gaussian fit or 1/e² width gives different values for real beams. A scanning-slit profiler moves a narrow slit through the beam and reconstructs the profile from transmitted power versus position; the slit convolution limits the resolution.",
    specs: [
      spec("Type", "camera or scanning slit"),
      spec("Wavelength range", "350–1100 nm with a silicon sensor"),
      spec("Width range", "tens of µm to several mm"),
      spec("Sensor resolution", "a few µm per pixel"),
      spec("Frame rate", "up to tens of Hz"),
      spec("Attenuation", "built-in or external ND filters"),
      spec("Analysis", "D4σ, Gaussian fit, 1/e²")
    ],
    measurementProcedure: [
      "Attenuate the beam so the peak pixel is well below saturation.",
      "Place the profiler at the plane of interest and centre the beam on the sensor.",
      "Record a background frame with the beam blocked and subtract it.",
      "Capture several frames and check repeatability.",
      "Report the width definition, fit residuals and any clipping."
    ],
    noise: [
      "Sensor read noise and dark current.",
      "Fixed-pattern noise and pixel non-uniformity.",
      "Background light and stray reflections.",
      "Clipping at the sensor edges or in the aperture.",
      "Speckle or interference fringes from coherent illumination."
    ],
    calibration: [
      "Measure the pixel scale with a known target.",
      "Flat-field the sensor with uniform illumination.",
      "Verify the background subtraction.",
      "Check the width algorithm against a known pinhole or slit.",
      "Record the attenuation used."
    ],
    commonErrors: [
      "Measuring a saturated beam and reporting its width.",
      "Comparing a D4σ width with a 1/e² width from another instrument.",
      "Ignoring windowing or truncation at the sensor edge.",
      "Profiling a pulsed beam with an exposure that averages many pulses."
    ],
    links: [
      "Gaussian beam propagation",
      "M² beam quality",
      "Diffraction-limited focus",
      "Fibre mode field diameter"
    ],
    experiments: [
      "michelson-interferometer",
      "fourier-optics",
      "optical-tweezers"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified"
  },
  {
    id: "camera",
    name: "Scientific / machine-vision camera",
    category: "Imaging",
    summary:
      "A camera images beam profiles, fringes, diffraction patterns and trapped particles over a two-dimensional field. Its exposure, gain and gamma must be controlled deliberately, because automatic settings change between frames and destroy quantitative comparison. A camera is an imaging detector, not a calibrated power meter unless it has been flat-fielded and calibrated.",
    principle:
      "Each pixel integrates photogenerated charge over the exposure time and converts it to a digital value through an amplifier and ADC. Gain multiplies the signal before digitization; exposure sets the integration window. A colour sensor overlays a Bayer filter and interpolates missing colours, which corrupts quantitative colour measurements unless raw data are used. Rolling-shutter sensors read rows sequentially, so fast moving fringes can be distorted.",
    specs: [
      spec("Sensor", "CMOS, mono or colour"),
      spec("Resolution", "1–12 megapixels"),
      spec("Pixel size", "2–6 µm"),
      spec("Frame rate", "10–60 fps at full resolution"),
      spec("Exposure", "microseconds to seconds"),
      spec("Bit depth", "8–12 bits"),
      spec("Interface", "USB 3.0 or GigE"),
      spec("Shutter", "rolling or global")
    ],
    measurementProcedure: [
      "Mount the camera at the intended image or Fourier plane and square it to the beam.",
      "Start with a short exposure and low gain, then increase exposure until the brightest region is below saturation.",
      "Disable automatic exposure, gain and white balance.",
      "Record a dark frame and a flat field for quantitative work.",
      "Save raw data with exposure, gain and binning metadata."
    ],
    noise: [
      "Read noise and dark current.",
      "Photon shot noise.",
      "Fixed-pattern noise and hot pixels.",
      "Ambient light and stray reflections.",
      "Quantization noise at low signal."
    ],
    calibration: [
      "Acquire a dark frame at the working exposure and gain.",
      "Flat-field with a uniform source.",
      "Verify the pixel scale with a graticule.",
      "Check linearity with a stepped light source.",
      "Record gamma and colour processing settings."
    ],
    commonErrors: [
      "Saturating the sensor and measuring a flat-topped beam.",
      "Leaving auto-exposure or auto-gain on during a comparison.",
      "Ignoring gamma or colour interpolation.",
      "Using a rolling-shutter camera to freeze a fast fringe pattern."
    ],
    links: [
      "Fourier-plane imaging",
      "Interference fringe analysis",
      "Particle tracking and Brownian motion",
      "Beam profiling"
    ],
    experiments: [
      "michelson-interferometer",
      "fourier-optics",
      "optical-tweezers"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified"
  },
  {
    id: "translation-stage-controller",
    name: "Translation stage controller",
    category: "Positioning",
    summary:
      "A translation-stage controller drives a stepper or servo stage and reports its position, turning a manual micrometer into a remotely scanned axis. It is used for delay scans, focus adjustment and sample positioning where repeatability matters. The controller's resolution is not the same as its accuracy: backlash, lead-screw error and encoder quality all contribute.",
    principle:
      "A stepper controller sends current pulses to the motor coils, moving the stage by a fixed number of steps per revolution; a servo controller closes a loop on an encoder. The lead screw converts rotation to linear travel, so the commanded position is steps × pitch / steps-per-revolution. Closed-loop operation corrects for lost steps and backlash only if the encoder is on the moving carriage, not on the motor shaft.",
    specs: [
      spec("Motor", "stepper or DC servo"),
      spec("Travel", "12–100 mm depending on stage"),
      spec("Resolution", "0.1–1 µm with a fine lead screw"),
      spec("Accuracy", "a few µm over full travel"),
      spec("Repeatability", "sub-µm to a few µm"),
      spec("Interface", "USB, RS-232 or TTL"),
      spec("Feedback", "open loop or encoder"),
      spec("Backlash", "present in open loop; measure it")
    ],
    measurementProcedure: [
      "Home the stage and record the reference position.",
      "Measure backlash by approaching a target from both directions.",
      "Command a series of positions and verify them with an independent scale or interferometer.",
      "Set speed and acceleration below the stage's limits to avoid lost steps.",
      "Record the controller's units, steps/mm and any software offset."
    ],
    noise: [
      "Lost steps in open-loop operation.",
      "Backlash and hysteresis in the lead screw.",
      "Encoder quantization and interpolation error.",
      "Thermal expansion of the stage and frame.",
      "Vibration transmitted through the motor and coupling."
    ],
    calibration: [
      "Measure steps per millimetre against a known displacement.",
      "Characterise backlash in both directions.",
      "Check repeatability over many cycles.",
      "Verify the home switch position.",
      "Compare commanded and measured positions at the working temperature."
    ],
    commonErrors: [
      "Assuming the commanded position is the actual position.",
      "Ignoring backlash after a direction reversal.",
      "Driving the stage beyond its travel and losing steps.",
      "Confusing motor-shaft encoder counts with carriage position."
    ],
    links: [
      "Optical path difference and fringe counting",
      "Michelson displacement measurement",
      "Focus and depth of field",
      "Sampling and scan linearity"
    ],
    experiments: [
      "michelson-interferometer",
      "quantum-eraser",
      "fourier-optics",
      "optical-tweezers"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified"
  },
  {
    id: "rotation-stage",
    name: "Motorized rotation stage",
    category: "Positioning",
    summary:
      "A rotation stage turns a polarizer, wave plate, prism or sample about a defined axis with an encoded angular readout. Motorized versions allow automated Malus scans, basis switching and angle-dependent measurements. The absolute accuracy depends on the encoder and on how well the optic is centred on the rotation axis.",
    principle:
      "A worm gear, a harmonic drive or a direct-drive motor turns the platform, while an encoder measures the angle. A worm drive gives high reduction and self-locking but has backlash; a direct-drive motor has no gear backlash but needs a high-resolution encoder and careful thermal management. The optic's centring error converts rotation into a small lateral translation of the beam.",
    specs: [
      spec("Travel", "continuous 360° or ± 180°"),
      spec("Resolution", "0.001–0.01° with an encoder"),
      spec("Accuracy", "0.01–0.1°"),
      spec("Repeatability", "0.001–0.01°"),
      spec("Load", "0.5–5 kg"),
      spec("Drive", "worm gear or direct drive"),
      spec("Interface", "USB or TTL"),
      spec("Clear aperture", "12.7–50 mm")
    ],
    measurementProcedure: [
      "Home the stage and define the zero against a known polarization or reference surface.",
      "Centre the optic on the rotation axis and check for beam translation during rotation.",
      "Scan the angle in small steps and record the detector signal at each point.",
      "Approach each angle from the same direction to avoid backlash.",
      "Fit the expected angular dependence and report residuals."
    ],
    noise: [
      "Encoder quantization and interpolation error.",
      "Worm-gear backlash and periodic transmission error.",
      "Axis wobble and runout.",
      "Thermal drift of the stage and mount.",
      "Motor vibration coupling into the optic."
    ],
    calibration: [
      "Verify the zero with an autocollimator or a known polarizer.",
      "Measure backlash by reversing direction.",
      "Check angular accuracy against an external encoder or autocollimator.",
      "Measure axis runout with a dial indicator.",
      "Record the load and any deflection."
    ],
    commonErrors: [
      "Zeroing the scale without a physical reference.",
      "Ignoring backlash when scanning back and forth.",
      "Mounting the optic off-centre so rotation steers the beam.",
      "Overloading the stage and losing angular accuracy."
    ],
    links: [
      "Malus's law",
      "Jones calculus and wave-plate axes",
      "Polarization basis selection",
      "Grating and prism dispersion"
    ],
    experiments: [
      "polarization-3d-cinema",
      "quantum-eraser",
      "quantum-key-distribution"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified"
  },
  {
    id: "motorized-actuator",
    name: "Motorized linear actuator",
    category: "Positioning",
    summary:
      "A motorized actuator pushes a stage, mirror mount or probe with controlled linear motion, replacing a manual micrometer with remote or software control. It is used for slow scans, focus adjustments and automated alignment. The actuator's push force, travel and backlash determine whether it can replace a micrometer without introducing creep.",
    principle:
      "A stepper or servo motor turns a lead screw or a planetary roller screw, and the nut translates a push rod. Limit switches or a hard stop protect the mechanism. The actuator must be spring-loaded against the load so that reversing direction does not leave a gap; without preload, backlash appears as lost motion at the push rod.",
    specs: [
      spec("Travel", "12–50 mm"),
      spec("Resolution", "0.05–1 µm per step depending on gearing"),
      spec("Push force", "10–100 N"),
      spec("Speed", "0.1–10 mm/s"),
      spec("Motor", "stepper or servo"),
      spec("Feedback", "limit switches; encoder optional"),
      spec("Interface", "USB or TTL"),
      spec("Backlash", "measure and preload")
    ],
    measurementProcedure: [
      "Mount the actuator coaxially with the stage's motion and leave room for full travel.",
      "Set the soft limits before running the actuator to its hard stops.",
      "Preload the stage spring and measure backlash in both directions.",
      "Command a step sequence and verify displacement independently.",
      "Record the actuator's position and the actual stage position separately."
    ],
    noise: [
      "Backlash and compliance in the push rod.",
      "Lost steps in open-loop operation.",
      "Motor vibration and acoustic noise.",
      "Thermal expansion of the actuator body.",
      "Limit-switch repeatability."
    ],
    calibration: [
      "Measure travel per step against a known scale.",
      "Characterise backlash and preload.",
      "Verify the limit switches and soft limits.",
      "Check repeatability over many cycles.",
      "Measure the push force against a load cell if the load is delicate."
    ],
    commonErrors: [
      "Driving the actuator into a hard stop and stalling the motor.",
      "Ignoring backlash when reversing direction.",
      "Using an actuator with too little force for a stiff stage.",
      "Assuming the actuator position equals the optic position."
    ],
    links: [
      "Delay-line scanning",
      "Focus control",
      "Automated alignment",
      "Fringe counting"
    ],
    experiments: [
      "michelson-interferometer",
      "quantum-eraser",
      "optical-tweezers"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified"
  },
  {
    id: "optical-shutter",
    name: "Optical shutter and controller",
    category: "Optical",
    summary:
      "An optical shutter blocks and unblocks a beam under electronic control, defining exposure intervals and protecting a detector between measurements. It is a timed beam block, not a modulator: transit times are milliseconds and repetition rates are limited. A shutter should fail closed and be interlocked with the source for safety.",
    principle:
      "A solenoid or stepper moves a blade across the aperture. The controller accepts a TTL trigger and returns a sync pulse when the blade reaches its open or closed position. The transit time and the bounce at the end stop set the timing uncertainty, which matters when the shutter defines the start of an exposure or a count window.",
    specs: [
      spec("Aperture", "1–25 mm"),
      spec("Opening time", "5–50 ms"),
      spec("Actuation", "solenoid or stepper"),
      spec("Control", "TTL 5 V trigger"),
      spec("Duty cycle", "limited by actuator heating"),
      spec("Fail state", "closed on power loss, verify"),
      spec("Mounting", "SM1 or post"),
      spec("Sync output", "open/closed status")
    ],
    measurementProcedure: [
      "Place the shutter in a collimated section, not at a focus.",
      "Adjust the blade so it fully clears the beam when open and fully covers it when closed.",
      "Connect the sync output to the acquisition so exposure timing is recorded.",
      "Measure the open and close transit times with a photodiode and scope.",
      "Test the fail state by removing power and confirming the beam is blocked."
    ],
    noise: [
      "Trigger-to-open delay jitter.",
      "Blade bounce at the end stop.",
      "Actuator heating and duty-cycle limitation.",
      "Vibration transmitted to the table.",
      "Incomplete closure at the beam edge."
    ],
    calibration: [
      "Measure opening and closing times with a fast photodiode.",
      "Verify the sync pulse timing relative to the blade position.",
      "Check that the closed state leaks no measurable light.",
      "Test the fail-closed behaviour.",
      "Record the duty cycle and repetition rate."
    ],
    commonErrors: [
      "Using the shutter as a fast modulator.",
      "Placing it at a focus and burning the blade.",
      "Ignoring the trigger delay when timing an exposure.",
      "Assuming fail-safe operation without testing."
    ],
    links: [
      "Exposure and integration time",
      "Dark-count and background measurement",
      "Detector protection",
      "Timed acquisition"
    ],
    experiments: [
      "polarization-3d-cinema",
      "fourier-optics",
      "optical-tweezers"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified"
  },
  {
    id: "laser-source",
    name: "Laser source and driver",
    category: "Source",
    summary:
      "A laser source combines a gain medium, a resonator and a driver that controls current, temperature and sometimes an intracavity element. The source determines wavelength, coherence, polarization and beam quality, so every downstream measurement inherits its stability and noise. The driver's current noise and temperature stability are as important as the optical head.",
    principle:
      "Diode lasers emit by stimulated recombination in a semiconductor gain region, while diode-pumped solid-state lasers pump a crystal that lases between atomic levels. In both cases the resonator selects longitudinal and transverse modes, and the driver sets the injection current and temperature. Current noise modulates the output power directly; temperature changes the gain wavelength, the cavity length and the doubling phase-matching condition.",
    specs: [
      spec("Type", "diode, DPSS or gas laser"),
      spec("Wavelength", "405–1064 nm depending on source"),
      spec("Output power", "0.5 mW–1 W"),
      spec("Beam quality", "TEM₀₀, M² < 1.3 for a good source"),
      spec("Coherence length", "millimetres to metres depending on laser type"),
      spec("Polarization", "linear or unpolarized"),
      spec("Power stability", "0.5–5% over hours"),
      spec("Driver", "current + temperature control")
    ],
    measurementProcedure: [
      "Allow the specified warm-up before recording power or wavelength.",
      "Measure output power after any built-in filter and record the driver current.",
      "Check the beam profile and polarization at the actual operating point.",
      "Monitor power stability over the intended measurement duration.",
      "Record wavelength, coherence length and safety class with every data set."
    ],
    noise: [
      "Driver current noise and ripple.",
      "Temperature drift and mode hops.",
      "Relative intensity noise and relaxation oscillations.",
      "Mechanical vibration of the resonator.",
      "Optical feedback from downstream surfaces."
    ],
    calibration: [
      "Measure power versus driver current without saturating the meter.",
      "Verify wavelength with a spectrometer or a known transition.",
      "Measure coherence length with an interferometer.",
      "Check polarization extinction.",
      "Record the warm-up time and stability."
    ],
    commonErrors: [
      "Using a laser before it reaches thermal equilibrium.",
      "Ignoring optical feedback that destabilizes the output.",
      "Assuming the wavelength printed on the head is exact.",
      "Setting power by driver current instead of measuring at the sample."
    ],
    links: [
      "Coherence and interference",
      "Gaussian beam propagation",
      "Laser safety and classification",
      "Noise and stability"
    ],
    experiments: [
      "michelson-interferometer",
      "mach-zehnder-interferometer",
      "quantum-key-distribution",
      "optical-tweezers"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified"
  },
  {
    id: "optical-filter-selector",
    name: "Optical filter / wavelength selector",
    category: "Optical",
    summary:
      "A filter wheel or monochromator selects a wavelength band from a broadband or multi-line source. It is the optical counterpart of an electrical spectrum analyser: it acts on light, not on a voltage. Bandwidth, out-of-band rejection and angle sensitivity determine whether the selected light is really monochromatic.",
    principle:
      "An interference filter transmits a band around a design wavelength through a Fabry–Perot-like dielectric stack; a monochromator disperses light with a grating or prism and images a narrow spectral slice onto an exit slit. In both cases the transmitted band has a finite width, and the centre wavelength shifts with angle in an interference filter or with the dispersion calibration in a monochromator.",
    specs: [
      spec("Type", "filter wheel or grating monochromator"),
      spec("Bandwidth", "3–10 nm for an interference filter"),
      spec("Wavelength range", "visible to near-infrared"),
      spec("Peak transmission", "40–70% for an interference filter"),
      spec("Out-of-band rejection", "OD 3–4"),
      spec("Angle sensitivity", "blue shift with tilt"),
      spec("Interface", "manual wheel or motorized"),
      spec("Calibration", "wavelength scale for a monochromator")
    ],
    measurementProcedure: [
      "Select the band closest to the source line and verify it with a spectrometer if possible.",
      "Measure the transmitted power and compare with the filter's specified peak transmission.",
      "Check for out-of-band leakage with a second filter or a known blocking test.",
      "For a monochromator, calibrate the wavelength scale with a known line.",
      "Record the band, bandwidth and angle of incidence."
    ],
    noise: [
      "Out-of-band leakage and stray light.",
      "Filter fluorescence under short-wavelength excitation.",
      "Angle-dependent band shift.",
      "Monochromator stray light and grating ghosts.",
      "Detector response variation across the band."
    ],
    calibration: [
      "Measure the transmission curve with a spectrometer.",
      "Verify the centre wavelength at normal incidence.",
      "Check blocking with a broadband source.",
      "Calibrate a monochromator against known spectral lines.",
      "Record the bandwidth and any tilt."
    ],
    commonErrors: [
      "Tilting an interference filter and shifting the band off the line.",
      "Assuming the filter blocks all out-of-band light.",
      "Using a monochromator with the wrong slit width and losing resolution.",
      "Ignoring detector response when comparing wavelengths."
    ],
    links: [
      "Spectral bandwidth and coherence",
      "Interference filters and thin films",
      "Grating dispersion",
      "Fluorescence and absorption"
    ],
    experiments: [
      "michelson-interferometer",
      "quantum-key-distribution",
      "optical-tweezers"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified"
  }
];

/** Public list, typed as the content model expects. */
export const INSTRUMENTS: InstrumentEntry[] = DATA;

/**
 * Same records with the verification field visible. Use this in the UI when a
 * provenance badge is needed; `INSTRUMENTS` keeps the shared content type.
 */
export const INSTRUMENTS_DETAILED: InstrumentRecord[] = DATA;

/** O(1) lookup by id. */
export const INSTRUMENTS_BY_ID: Record<string, InstrumentEntry> = Object.fromEntries(
  INSTRUMENTS.map((instrument) => [instrument.id, instrument])
);

export function getInstrument(id: string): InstrumentEntry | undefined {
  return INSTRUMENTS_BY_ID[id];
}

const CATEGORY_ORDER: InstrumentCategory[] = [
  "Source",
  "Detection",
  "Electrical",
  "Imaging",
  "Positioning",
  "Optical"
];

export const INSTRUMENTS_BY_CATEGORY: Record<InstrumentCategory, InstrumentEntry[]> = (() => {
  const grouped = {} as Record<InstrumentCategory, InstrumentEntry[]>;
  for (const category of CATEGORY_ORDER) grouped[category] = [];
  for (const instrument of INSTRUMENTS) grouped[instrument.category].push(instrument);
  return grouped;
})();

/**
 * Verification label per instrument, kept outside `InstrumentEntry` because
 * the shared content model has no verification field for instruments.
 * Every entry is currently `unverified`: no instrument has been inspected.
 */
export const INSTRUMENT_VERIFICATION: Record<string, Verification> = Object.fromEntries(
  DATA.map((instrument) => [instrument.id, instrument.verification])
);

/** Experiment slugs referenced by at least one instrument. */
export const INSTRUMENT_EXPERIMENT_SLUGS: ExperimentSlug[] = [
  ...new Set(INSTRUMENTS.flatMap((instrument) => instrument.experiments))
];
