import type { Reference } from "./types";

/**
 * Curated reference catalogue.
 *
 * Only sources the editorial team can identify with confidence are listed.
 * DOIs are included where known. No URL, page number, SKU or specification is
 * invented. Manufacturer documents without a confirmed model-specific page
 * point to the manufacturer's document library and are marked as such.
 */

const ACCESSED = "2026-11-25";

export const REFERENCE_CATALOGUE: Record<string, Reference> = {
  hecht: {
    id: "hecht",
    authors: "E. Hecht",
    title: "Optics",
    year: "2017",
    source: "Pearson, 5th edition",
    kind: "textbook",
    note: "Interference, coherence, polarization, diffraction and Fourier optics chapters."
  },
  bornwolf: {
    id: "bornwolf",
    authors: "M. Born and E. Wolf",
    title: "Principles of Optics",
    year: "1999",
    source: "Cambridge University Press, 7th anniversary edition",
    kind: "textbook",
    note: "Electromagnetic theory, interference, diffraction and partially coherent light."
  },
  fowles: {
    id: "fowles",
    authors: "G. R. Fowles",
    title: "Introduction to Modern Optics",
    year: "1989",
    source: "Dover Publications, 2nd edition",
    kind: "textbook"
  },
  saleh: {
    id: "saleh",
    authors: "B. E. A. Saleh and M. C. Teich",
    title: "Fundamentals of Photonics",
    year: "2019",
    source: "Wiley, 3rd edition",
    kind: "textbook",
    note: "Gaussian beams, detectors, Fourier optics and quantum optics foundations."
  },
  goodman: {
    id: "goodman",
    authors: "J. W. Goodman",
    title: "Introduction to Fourier Optics",
    year: "2017",
    source: "W. H. Freeman, 4th edition",
    kind: "textbook",
    note: "Fraunhofer diffraction, lens transfer functions and 4f spatial filtering."
  },
  loudon: {
    id: "loudon",
    authors: "R. Loudon",
    title: "The Quantum Theory of Light",
    year: "2000",
    source: "Oxford University Press, 3rd edition",
    kind: "textbook",
    note: "Quantisation of the field, photon statistics and interference."
  },
  nielsen: {
    id: "nielsen",
    authors: "M. A. Nielsen and I. L. Chuang",
    title: "Quantum Computation and Quantum Information",
    year: "2010",
    source: "Cambridge University Press, 10th anniversary edition",
    kind: "textbook",
    note: "Qubits, density operators, measurement and quantum information protocols."
  },
  griffiths: {
    id: "griffiths",
    authors: "D. J. Griffiths and D. F. Schroeter",
    title: "Introduction to Quantum Mechanics",
    year: "2018",
    source: "Cambridge University Press, 3rd edition",
    kind: "textbook"
  },
  goldstein: {
    id: "goldstein",
    authors: "D. H. Goldstein",
    title: "Polarized Light",
    year: "2011",
    source: "CRC Press, 3rd edition",
    kind: "textbook",
    note: "Jones and Mueller calculus, Stokes parameters and the Poincaré sphere."
  },
  taylor: {
    id: "taylor",
    authors: "J. R. Taylor",
    title: "An Introduction to Error Analysis",
    year: "1997",
    source: "University Science Books, 2nd edition",
    kind: "textbook",
    note: "Uncertainty propagation, least squares and confidence intervals."
  },
  bevington: {
    id: "bevington",
    authors: "P. R. Bevington and D. K. Robinson",
    title: "Data Reduction and Error Analysis for the Physical Sciences",
    year: "2003",
    source: "McGraw-Hill, 3rd edition",
    kind: "textbook"
  },
  ashkin1970: {
    id: "ashkin1970",
    authors: "A. Ashkin",
    title: "Acceleration and trapping of particles by radiation pressure",
    year: "1970",
    source: "Physical Review Letters 24, 156",
    doi: "10.1103/PhysRevLett.24.156",
    kind: "paper"
  },
  ashkin1986: {
    id: "ashkin1986",
    authors: "A. Ashkin, J. M. Dziedzic, J. E. Bjorkholm and S. Chu",
    title: "Observation of a single-beam gradient force optical trap for dielectric particles",
    year: "1986",
    source: "Optics Letters 11, 288",
    doi: "10.1364/OL.11.000288",
    kind: "paper"
  },
  elitzur1993: {
    id: "elitzur1993",
    authors: "A. C. Elitzur and L. Vaidman",
    title: "Quantum mechanical interaction-free measurements",
    year: "1993",
    source: "Foundations of Physics 23, 987",
    doi: "10.1007/BF00736012",
    kind: "paper"
  },
  kwiat1995: {
    id: "kwiat1995",
    authors: "P. G. Kwiat, H. Weinfurter, T. Herzog, A. Zeilinger and M. A. Kasevich",
    title: "Interaction-free measurement",
    year: "1995",
    source: "Physical Review Letters 74, 4763",
    doi: "10.1103/PhysRevLett.74.4763",
    kind: "paper"
  },
  kim2000: {
    id: "kim2000",
    authors: "Y.-H. Kim, R. Yu, S. P. Kulik, Y. Shih and M. O. Scully",
    title: "A delayed choice quantum eraser",
    year: "2000",
    source: "Physical Review Letters 84, 1",
    doi: "10.1103/PhysRevLett.84.1",
    kind: "paper"
  },
  jacques2007: {
    id: "jacques2007",
    authors: "V. Jacques et al.",
    title: "Experimental realization of Wheeler's delayed-choice gedanken experiment",
    year: "2007",
    source: "Science 315, 966",
    doi: "10.1126/science.1136303",
    kind: "paper"
  },
  grangier1986: {
    id: "grangier1986",
    authors: "P. Grangier, G. Roger and A. Aspect",
    title: "Experimental evidence for a photon anticorrelation effect on a beam splitter",
    year: "1986",
    source: "Europhysics Letters 1, 173",
    doi: "10.1209/0295-5075/1/4/004",
    kind: "paper"
  },
  bennett1984: {
    id: "bennett1984",
    authors: "C. H. Bennett and G. Brassard",
    title: "Quantum cryptography: Public key distribution and coin tossing",
    year: "1984",
    source: "Proceedings of the IEEE International Conference on Computers, Systems and Signal Processing, Bangalore, 175–179",
    kind: "paper",
    note: "Reprinted in Theoretical Computer Science 560 (2014), 7–11, doi:10.1016/j.tcs.2014.05.025."
  },
  bennett1992: {
    id: "bennett1992",
    authors: "C. H. Bennett, G. Brassard and N. D. Mermin",
    title: "Quantum cryptography without Bell's theorem",
    year: "1992",
    source: "Physical Review Letters 68, 557",
    doi: "10.1103/PhysRevLett.68.557",
    kind: "paper"
  },
  scarani2009: {
    id: "scarani2009",
    authors: "V. Scarani, H. Bechmann-Pasquinucci, N. J. Cerf, M. Dušek, N. Lütkenhaus and M. Peev",
    title: "The security of practical quantum key distribution",
    year: "2009",
    source: "Reviews of Modern Physics 81, 1301",
    doi: "10.1103/RevModPhys.81.1301",
    kind: "paper"
  },
  shor2000: {
    id: "shor2000",
    authors: "P. W. Shor and J. Preskill",
    title: "Simple proof of security of the BB84 quantum key distribution protocol",
    year: "2000",
    source: "Physical Review Letters 85, 441",
    doi: "10.1103/PhysRevLett.85.441",
    kind: "paper"
  },
  michelson1887: {
    id: "michelson1887",
    authors: "A. A. Michelson and E. W. Morley",
    title: "On the relative motion of the Earth and the luminiferous ether",
    year: "1887",
    source: "American Journal of Science 34, 333",
    doi: "10.2475/ajs.s3-34.203.333",
    kind: "paper"
  },
  thorlabs_edu: {
    id: "thorlabs_edu",
    authors: "Thorlabs, Inc.",
    title: "Educational kits, user guides and application notes",
    year: "n.d.",
    source: "Thorlabs document library",
    url: "https://www.thorlabs.com/",
    accessed: ACCESSED,
    kind: "manual",
    note:
      "Consult the printed guide and packing list supplied with the physical kit. A model-specific document URL must be recorded after the kit label is verified; it is not asserted here."
  },
  thorlabs_kine: {
    id: "thorlabs_kine",
    authors: "Thorlabs, Inc.",
    title: "Kinematic mirror mount and optomechanics technical notes",
    year: "n.d.",
    source: "Thorlabs document library",
    url: "https://www.thorlabs.com/",
    accessed: ACCESSED,
    kind: "manual",
    note: "Generic mounting practice; verify the exact mount model in the inventory."
  },
  edmund_optics: {
    id: "edmund_optics",
    authors: "Edmund Optics",
    title: "Optics and optical instrumentation reference material",
    year: "n.d.",
    source: "Edmund Optics technical library",
    url: "https://www.edmundoptics.com/",
    accessed: ACCESSED,
    kind: "manual",
    note: "Independent supplier reference used only for generic optical definitions."
  },
  nist_sp800_22: {
    id: "nist_sp800_22",
    authors: "E. Barker and J. Kelsey",
    title: "Recommendation for Random Number Generation Using Deterministic Random Bit Generators",
    year: "2015",
    source: "NIST Special Publication 800-90A Revision 1",
    doi: "10.6028/NIST.SP.800-90Ar1",
    kind: "standard",
    note: "Referenced only to distinguish teaching pseudo-randomness from cryptographic randomness."
  }
};

/** Convenience alias: refs.hecht, refs.elitzur1993, … */
export const refs = REFERENCE_CATALOGUE;

export function getReference(id: string): Reference | undefined {
  return REFERENCE_CATALOGUE[id];
}
