import { describe, expect, it } from "vitest";
import {
  HARDWARE_BY_ID,
  HARDWARE_CATEGORIES,
  HARDWARE_INVENTORY,
  getHardware,
  hardwareForExperiment,
  searchHardware,
  validateInventory
} from "./hardware";
import { HARDWARE_SEEDS } from "./hardware-ids";
import {
  INSTRUMENTS,
  INSTRUMENTS_BY_CATEGORY,
  INSTRUMENTS_BY_ID,
  INSTRUMENT_VERIFICATION,
  getInstrument
} from "./instruments";
import { EXPERIMENT_SLUGS } from "./registry";
import type { HardwareCategory } from "./types";

const HARDWARE_CATEGORY_SET = new Set<string>(HARDWARE_CATEGORIES);

describe("hardware inventory structure", () => {
  it("contains every seed id exactly once and no unknown id", () => {
    const validation = validateInventory();
    expect(validation.missing).toEqual([]);
    expect(validation.unknown).toEqual([]);
    expect(validation.duplicates).toEqual([]);
    expect(validation.ok).toBe(true);
    expect(validation.total).toBe(validation.seedCount);
  });

  it("has a unique id for every entry and an O(1) map of the same size", () => {
    expect(new Set(HARDWARE_INVENTORY.map((item) => item.id)).size).toBe(HARDWARE_INVENTORY.length);
    expect(Object.keys(HARDWARE_BY_ID)).toHaveLength(HARDWARE_INVENTORY.length);
    for (const item of HARDWARE_INVENTORY) {
      expect(HARDWARE_BY_ID[item.id]).toBe(item);
      expect(getHardware(item.id)).toBe(item);
    }
  });

  it("uses only canonical categories and canonical experiment slugs", () => {
    const validation = validateInventory();
    expect(validation.unknownCategories).toEqual([]);
    expect(validation.unknownExperimentSlugs).toEqual([]);

    const canonical = new Set<string>(EXPERIMENT_SLUGS);
    for (const item of HARDWARE_INVENTORY) {
      expect(HARDWARE_CATEGORY_SET.has(item.category)).toBe(true);
      expect(item.experiments.length).toBeGreaterThan(0);
      for (const slug of item.experiments) expect(canonical.has(slug)).toBe(true);
    }
  });

  it("matches every seed's id, name, category and kind exactly", () => {
    for (const seed of HARDWARE_SEEDS) {
      const item = HARDWARE_BY_ID[seed.id];
      expect(item, `missing seed ${seed.id}`).toBeDefined();
      expect(item?.name).toBe(seed.name);
      expect(item?.category).toBe(seed.category);
      expect(item?.kind).toBe(seed.kind);
    }
  });

  it("uses the Thorlabs landing page only for generic Thorlabs items", () => {
    for (const item of HARDWARE_INVENTORY) {
      if (item.manufacturer === "Thorlabs") {
        expect(item.docUrl).toBe("https://www.thorlabs.com/");
        expect(item.generic).toBe(true);
      } else {
        expect(item.docUrl).toBeUndefined();
      }
    }
  });

  it("keeps every category represented and exports all canonical categories", () => {
    expect(new Set(HARDWARE_CATEGORIES).size).toBe(HARDWARE_CATEGORIES.length);
    const used = new Set<HardwareCategory>(HARDWARE_INVENTORY.map((item) => item.category));
    for (const category of HARDWARE_CATEGORIES) expect(used.has(category)).toBe(true);
  });

  it("gives every item substantive, honest metadata", () => {
    for (const item of HARDWARE_INVENTORY) {
      expect(item.summary.length).toBeGreaterThan(80);
      expect(item.principle.length).toBeGreaterThan(80);
      expect(item.specs.length).toBeGreaterThanOrEqual(4);
      expect(item.specs.length).toBeLessThanOrEqual(8);
      expect(item.alignment.length).toBeGreaterThanOrEqual(3);
      expect(item.errors.length).toBeGreaterThanOrEqual(3);
      expect(item.applications.length).toBeGreaterThanOrEqual(2);
      expect(item.verification).toBe("unverified");
      expect(item.partNumber).toBeUndefined();
      expect(item.specs.some((row) => row.typical === true)).toBe(true);
      for (const row of item.specs) expect(row.label.length).toBeGreaterThan(0);
    }
  });
});

describe("hardware search and experiment mapping", () => {
  it("matches by exact id and by name", () => {
    const byId = searchHardware("bs-cube-50");
    expect(byId[0]?.id).toBe("bs-cube-50");

    const byName = searchHardware("polarizing beam-splitter");
    expect(byName.some((item) => item.id === "bs-polarizing")).toBe(true);
  });

  it("is case-insensitive and requires all terms", () => {
    const upper = searchHardware("HELIUM NEON");
    expect(upper.some((item) => item.id === "src-he-ne")).toBe(true);

    const impossible = searchHardware("helium tweezers");
    expect(impossible).toEqual([]);
  });

  it("filters by category without leaking other categories", () => {
    const mirrors = searchHardware("", "Mirrors");
    expect(mirrors.length).toBeGreaterThan(0);
    expect(mirrors.every((item) => item.category === "Mirrors")).toBe(true);
  });

  it("filters by experiment and every experiment has at least five items", () => {
    for (const slug of EXPERIMENT_SLUGS) {
      const items = hardwareForExperiment(slug);
      expect(items.length).toBeGreaterThanOrEqual(5);
      expect(items.every((item) => item.experiments.includes(slug))).toBe(true);
      expect(searchHardware("", "all", [slug])).toHaveLength(items.length);
    }
  });

  it("returns the whole inventory for an empty query", () => {
    expect(searchHardware("")).toHaveLength(HARDWARE_INVENTORY.length);
  });
});

describe("instrument database", () => {
  it("has unique ids and resolvable lookups", () => {
    expect(new Set(INSTRUMENTS.map((instrument) => instrument.id)).size).toBe(INSTRUMENTS.length);
    expect(Object.keys(INSTRUMENTS_BY_ID)).toHaveLength(INSTRUMENTS.length);
    for (const instrument of INSTRUMENTS) {
      expect(getInstrument(instrument.id)).toBe(instrument);
    }
  });

  it("populates every required array", () => {
    for (const instrument of INSTRUMENTS) {
      expect(instrument.specs.length).toBeGreaterThanOrEqual(4);
      expect(instrument.measurementProcedure.length).toBeGreaterThanOrEqual(4);
      expect(instrument.measurementProcedure.length).toBeLessThanOrEqual(6);
      expect(instrument.noise.length).toBeGreaterThanOrEqual(3);
      expect(instrument.noise.length).toBeLessThanOrEqual(5);
      expect(instrument.calibration.length).toBeGreaterThanOrEqual(3);
      expect(instrument.calibration.length).toBeLessThanOrEqual(5);
      expect(instrument.commonErrors.length).toBeGreaterThanOrEqual(3);
      expect(instrument.commonErrors.length).toBeLessThanOrEqual(5);
      expect(instrument.links.length).toBeGreaterThanOrEqual(3);
      expect(instrument.links.length).toBeLessThanOrEqual(5);
      expect(instrument.experiments.length).toBeGreaterThan(0);
      expect(instrument.summary.length).toBeGreaterThan(60);
      expect(instrument.principle.length).toBeGreaterThan(80);
    }
  });

  it("marks every instrument unverified and uses valid experiment slugs", () => {
    const canonical = new Set<string>(EXPERIMENT_SLUGS);
    for (const instrument of INSTRUMENTS) {
      expect(INSTRUMENT_VERIFICATION[instrument.id]).toBe("unverified");
      for (const slug of instrument.experiments) expect(canonical.has(slug)).toBe(true);
    }
  });

  it("groups instruments by all six categories", () => {
    expect(Object.keys(INSTRUMENTS_BY_CATEGORY)).toHaveLength(6);
    const groupedTotal = Object.values(INSTRUMENTS_BY_CATEGORY).reduce(
      (sum, list) => sum + list.length,
      0
    );
    expect(groupedTotal).toBe(INSTRUMENTS.length);
  });

  it("keeps power measurement and photon counting as distinct entries", () => {
    const powerMeter = getInstrument("power-meter");
    const spad = getInstrument("spad");
    const counter = getInstrument("photon-counter");

    expect(powerMeter).toBeDefined();
    expect(spad).toBeDefined();
    expect(counter).toBeDefined();
    expect(powerMeter?.summary.toLowerCase()).toContain("average");
    expect(spad?.summary.toLowerCase()).toContain("photon");
    expect(counter?.measurementProcedure.length).toBeGreaterThanOrEqual(4);
  });
});
