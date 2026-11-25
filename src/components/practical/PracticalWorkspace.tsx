"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ExperimentContent } from "@/lib/content/types";
import { getHardware } from "@/lib/content/hardware";
import { saveDataset, saveNotebookRecord } from "@/lib/db";
import { parseCsv, toCsv, downloadText, timestampForFilename, slugifyFilename } from "@/lib/data/csv";
import { linearRegression, mean, sd, sem, formatSig } from "@/lib/physics/stats";
import { buildMarkdownReport, downloadReportHtml, printReport, type ReportInput } from "@/lib/data/report";
import { newNotebookId } from "@/lib/data/notebook-types";
import { useProgress } from "@/lib/store/progress";
import { LabScatter } from "@/components/viz/Plot";
import { Badge } from "@/components/ui/primitives";
import { ExperimentCalculator } from "./ExperimentCalculator";

type Tab = "equipment" | "procedure" | "measurements" | "analysis" | "report";
type Provenance = "actual" | "simulated";

interface TableDraft {
  columns: string[];
  rows: string[][];
  provenance: Provenance;
  note: string;
}

interface Draft {
  checklist: Record<string, boolean>;
  steps: Record<string, boolean>;
  tables: Record<string, TableDraft>;
  report: {
    studentName: string;
    date: string;
    objectives: string;
    apparatus: string;
    procedureNotes: string;
    calculations: string;
    uncertainties: string;
    errors: string;
    conclusion: string;
  };
}

function storageKey(slug: string) {
  return `qol-practical-v1:${slug}`;
}

function initDraft(content: ExperimentContent): Draft {
  const tables: Record<string, TableDraft> = {};
  for (const obs of content.observations) {
    tables[obs.id] = {
      columns: obs.columns.map((c) => (c.unit ? `${c.label} [${c.unit}]` : c.label)),
      rows: Array.from({ length: 5 }, () => obs.columns.map(() => "")),
      provenance: "actual",
      note: ""
    };
  }
  return {
    checklist: {},
    steps: {},
    tables,
    report: {
      studentName: "",
      date: new Date().toISOString().slice(0, 10),
      objectives: "",
      apparatus: content.hardware.map((h) => getHardware(h.itemId)?.name ?? h.itemId).join(", "),
      procedureNotes: "",
      calculations: "",
      uncertainties: "",
      errors: "",
      conclusion: ""
    }
  };
}

export function PracticalWorkspace({ content }: { content: ExperimentContent }) {
  const [tab, setTab] = useState<Tab>("equipment");
  const [draft, setDraft] = useState<Draft>(() => initDraft(content));
  const [activeTable, setActiveTable] = useState(content.observations[0]?.id ?? "");
  const [hydrated, setHydrated] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [xCol, setXCol] = useState(0);
  const [yCol, setYCol] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const recordPracticalStep = useProgress((s) => s.recordPracticalStep);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(content.slug));
      if (raw) setDraft((d) => ({ ...d, ...(JSON.parse(raw) as Partial<Draft>) }));
    } catch {
      /* ignore corrupt local drafts */
    }
    setHydrated(true);
  }, [content.slug]);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey(content.slug), JSON.stringify(draft));
      } catch {
        /* storage quota */
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [draft, hydrated, content.slug]);

  const equipmentDone = content.hardware.filter((h) => draft.checklist[h.itemId]).length;
  const totalSteps = content.procedure.reduce((s, p) => s + p.steps.length, 0);
  const stepsDone = Object.values(draft.steps).filter(Boolean).length;

  useEffect(() => {
    if (stepsDone > 0) recordPracticalStep(content.slug, stepsDone);
  }, [stepsDone, content.slug, recordPracticalStep]);

  const table = draft.tables[activeTable];
  const numeric = useMemo(() => {
    if (!table) return { xs: [] as number[], ys: [] as number[], rows: [] as { x: number; y: number }[] };
    const toNum = (s: string) => {
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };
    const pairs: { x: number; y: number }[] = [];
    for (const row of table.rows) {
      const x = toNum(row[xCol] ?? "");
      const y = toNum(row[yCol] ?? "");
      if (x !== null && y !== null) pairs.push({ x, y });
    }
    return { xs: pairs.map((p) => p.x), ys: pairs.map((p) => p.y), rows: pairs };
  }, [table, xCol, yCol]);

  const regression = numeric.rows.length >= 3 ? linearRegression(numeric.xs, numeric.ys) : null;

  function setProvenance(provenance: Provenance) {
    setDraft((d) => {
      const t = d.tables[activeTable];
      if (!t) return d;
      return { ...d, tables: { ...d.tables, [activeTable]: { ...t, provenance } } };
    });
  }

  function setCell(rowIndex: number, colIndex: number, value: string) {
    setDraft((d) => {
      const t = d.tables[activeTable];
      if (!t) return d;
      const rows = t.rows.map((r, ri) => (ri === rowIndex ? r.map((c, ci) => (ci === colIndex ? value : c)) : r));
      return { ...d, tables: { ...d.tables, [activeTable]: { ...t, rows } } };
    });
  }

  function addRow() {
    setDraft((d) => {
      const t = d.tables[activeTable];
      if (!t) return d;
      return { ...d, tables: { ...d.tables, [activeTable]: { ...t, rows: [...t.rows, t.columns.map(() => "")] } } };
    });
  }

  function removeRow(index: number) {
    setDraft((d) => {
      const t = d.tables[activeTable];
      if (!t || t.rows.length <= 1) return d;
      return { ...d, tables: { ...d.tables, [activeTable]: { ...t, rows: t.rows.filter((_, i) => i !== index) } } };
    });
  }

  function importCsv(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const parsed = parseCsv(text);
      if (parsed.columns.length === 0) {
        setImportMessage("No columns found. Check that the file is comma-separated with a header row.");
        return;
      }
      setDraft((d) => {
        const t = d.tables[activeTable];
        if (!t) return d;
        // Preserve the template's units; map by position and keep the file's
        // first row as data only if it is not a header.
        const rows = parsed.rows.map((r) => t.columns.map((_, i) => r[i] ?? ""));
        return {
          ...d,
          tables: {
            ...d.tables,
            [activeTable]: {
              ...t,
              rows: rows.length ? rows : t.rows,
              note: `Imported ${file.name} (${parsed.rows.length} rows). Raw values preserved; mismatched rows were padded, not cleaned. ${t.note}`.trim()
            }
          }
        };
      });
      setImportMessage(
        `Imported ${parsed.rows.length} rows from ${file.name}.` +
          (parsed.errors.length ? ` ${parsed.errors[0]?.message}` : " Values were not modified.")
      );
    };
    reader.readAsText(file);
  }

  const reportInput: ReportInput = {
    content,
    studentName: draft.report.studentName,
    date: draft.report.date,
    objectives: draft.report.objectives,
    apparatus: draft.report.apparatus,
    procedureNotes: draft.report.procedureNotes,
    measurements: Object.entries(draft.tables)
      .filter(([, t]) => t.rows.some((r) => r.some((c) => c.trim() !== "")))
      .map(([id, t]) => ({
        title: content.observations.find((o) => o.id === id)?.title ?? id,
        columns: t.columns,
        rows: t.rows.filter((r) => r.some((c) => c.trim() !== "")),
        provenance: t.provenance,
        note: t.note
      })),
    calculations: draft.report.calculations,
    uncertainties: draft.report.uncertainties,
    errors: draft.report.errors,
    conclusion: draft.report.conclusion
  };

  async function saveRecord() {
    const now = new Date().toISOString();
    await saveNotebookRecord({
      id: newNotebookId(),
      experimentSlug: content.slug,
      title: `${content.title} — ${draft.report.date}`,
      date: draft.report.date,
      studentName: draft.report.studentName,
      apparatus: draft.report.apparatus,
      objectives: draft.report.objectives,
      theory: "",
      observations: "",
      calculations: draft.report.calculations,
      uncertainties: draft.report.uncertainties,
      errors: draft.report.errors,
      conclusion: draft.report.conclusion,
      measurements: reportInput.measurements,
      tags: ["practical", content.family],
      createdAt: now,
      updatedAt: now
    });
    setSavedMessage("Saved to the laboratory notebook (this browser).");
    setTimeout(() => setSavedMessage(null), 4000);
  }

  const TABS: { id: Tab; label: string; meta: string }[] = [
    { id: "equipment", label: "Equipment", meta: `${equipmentDone}/${content.hardware.length}` },
    { id: "procedure", label: "Procedure", meta: `${stepsDone}/${totalSteps}` },
    { id: "measurements", label: "Measurements", meta: `${Object.values(draft.tables).reduce((s, t) => s + t.rows.filter((r) => r.some((c) => c.trim())).length, 0)} rows` },
    { id: "analysis", label: "Analysis", meta: "fit & uncertainty" },
    { id: "report", label: "Report", meta: "export" }
  ];

  return (
    <div className="shell py-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="label mb-1 text-vermilion">Practical mode</p>
          <h2 className="display-lg">Your measurements. Your uncertainty. Your report.</h2>
          <p className="mt-2 max-w-2xl text-[0.82rem] leading-relaxed text-muted">
            This workspace is for real laboratory data. It stores everything in this browser and never invents a value.
            Simulated data must be labelled <span className="font-mono text-vermilion">simulated</span> and must not be
            submitted as a measurement.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-right">
          <div>
            <p className="num text-[1.1rem] leading-none">{equipmentDone}/{content.hardware.length}</p>
            <p className="label mt-1 !text-[0.55rem]">checked</p>
          </div>
          <div>
            <p className="num text-[1.1rem] leading-none">{stepsDone}/{totalSteps}</p>
            <p className="label mt-1 !text-[0.55rem]">steps</p>
          </div>
          <div>
            <p className="num text-[1.1rem] leading-none">{reportInput.measurements.length}</p>
            <p className="label mt-1 !text-[0.55rem]">tables</p>
          </div>
        </div>
      </div>

      <div className="flex gap-0 overflow-x-auto border-b border-line no-scrollbar" role="tablist" aria-label="Practical workspace">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`relative shrink-0 px-4 py-3 text-left ${tab === t.id ? "text-ink" : "text-muted hover:text-ink"}`}
          >
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.1em]">{t.label}</span>
            <span className="mt-0.5 block text-[0.58rem] text-muted">{t.meta}</span>
            {tab === t.id ? <span className="absolute inset-x-0 bottom-0 h-[2px] bg-vermilion" /> : null}
          </button>
        ))}
      </div>

      {tab === "equipment" ? (
        <div className="mt-7 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="label">Equipment checklist</p>
              <button type="button" className="font-mono text-[0.6rem] uppercase tracking-wide text-muted hover:text-ink" onClick={() => setDraft((d) => ({ ...d, checklist: {} }))}>
                clear
              </button>
            </div>
            <ul className="border-t border-line">
              {content.hardware.map((h) => {
                const item = getHardware(h.itemId);
                const checked = Boolean(draft.checklist[h.itemId]);
                return (
                  <li key={h.itemId} className="border-b border-line py-3">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 accent-ink"
                        checked={checked}
                        onChange={(e) => setDraft((d) => ({ ...d, checklist: { ...d.checklist, [h.itemId]: e.target.checked } }))}
                      />
                      <span className="flex-1">
                        <span className={`flex flex-wrap items-center gap-2 text-[0.82rem] ${checked ? "text-muted line-through" : "text-ink"}`}>
                          {item?.name ?? h.itemId}
                          {h.quantity ? <span className="font-mono text-[0.6rem] text-muted">×{h.quantity}</span> : null}
                          <Badge tone={(item?.verification ?? "unverified") === "verified" ? "petrol" : "vermilion"}>{item?.verification ?? "unverified"}</Badge>
                        </span>
                        <span className="mt-0.5 block text-[0.7rem] leading-relaxed text-muted">{h.note ?? item?.summary ?? "Verify against the physical kit."}</span>
                      </span>
                      <Link href={`/components/${h.itemId}`} className="mt-1 font-mono text-[0.6rem] text-muted hover:text-vermilion" onClick={(e) => e.stopPropagation()}>
                        details ↗
                      </Link>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
          <aside>
            <div className="border border-vermilion/40 bg-vermilion-soft/20 p-4">
              <p className="label mb-2 !text-vermilion">Laser safety</p>
              <ul className="space-y-1.5">
                {content.procedure.flatMap((p) => p.steps.flatMap((s) => (s.caution ? [s.caution] : []))).slice(0, 6).map((c, i) => (
                  <li key={i} className="text-[0.72rem] leading-relaxed text-ink-2">— {c}</li>
                ))}
                <li className="text-[0.72rem] leading-relaxed text-ink-2">
                  — Confirm the laser class, wavelength and rated eyewear with the laboratory supervisor before powering the source.
                </li>
              </ul>
            </div>
            <div className="mt-4 border border-line bg-paper-2 p-4">
              <p className="label mb-2">Kit verification</p>
              <p className="text-[0.75rem] leading-relaxed text-ink-2">
                <span className="font-mono text-[0.6rem] uppercase tracking-wide text-vermilion">{content.kit.verification}</span>
                <br />
                {content.kit.name}
              </p>
              <p className="mt-2 text-[0.7rem] leading-relaxed text-muted">{content.kit.note}</p>
              {content.kit.documentation?.map((d) => (
                <p key={d.title} className="mt-2 text-[0.68rem] text-muted">
                  {d.url ? (
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="link-underline">
                      {d.title} ↗
                    </a>
                  ) : (
                    d.title
                  )}
                </p>
              ))}
            </div>
          </aside>
        </div>
      ) : null}

      {tab === "procedure" ? (
        <div className="mt-7 max-w-4xl">
          <div className="mb-4 flex items-center justify-between">
            <p className="label">Alignment and measurement sequence</p>
            <p className="font-mono text-[0.6rem] text-muted">{stepsDone}/{totalSteps} complete</p>
          </div>
          <div className="space-y-6">
            {content.procedure.map((phase, pi) => (
              <section key={phase.id} className="border border-line bg-paper-2">
                <div className="border-b border-line px-4 py-3">
                  <p className="font-mono text-[0.6rem] uppercase tracking-wide text-vermilion">Phase {String(pi + 1).padStart(2, "0")}</p>
                  <p className="text-[0.88rem] font-medium text-ink">{phase.title}</p>
                  {phase.purpose ? <p className="mt-0.5 text-[0.7rem] text-muted">{phase.purpose}</p> : null}
                </div>
                <ul className="divide-y divide-line">
                  {phase.steps.map((s, si) => {
                    const key = `${phase.id}:${si}`;
                    return (
                      <li key={key} className="px-4 py-3">
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1 accent-ink"
                            checked={Boolean(draft.steps[key])}
                            onChange={(e) => setDraft((d) => ({ ...d, steps: { ...d.steps, [key]: e.target.checked } }))}
                          />
                          <span>
                            <span className={`block text-[0.8rem] font-medium ${draft.steps[key] ? "text-muted line-through" : "text-ink"}`}>{s.title}</span>
                            <span className="mt-0.5 block text-[0.74rem] leading-relaxed text-ink-2">{s.detail}</span>
                            {s.checkpoint ? <span className="mt-1 block text-[0.68rem] text-petrol">Checkpoint: {s.checkpoint}</span> : null}
                            {s.caution ? <span className="mt-1 block text-[0.68rem] text-vermilion">Caution: {s.caution}</span> : null}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
          <div className="mt-4 grid gap-3 border border-line bg-paper-2 p-4 sm:grid-cols-2">
            <div>
              <p className="label mb-1">Diagnostic if the expected observation is absent</p>
              <p className="text-[0.72rem] leading-relaxed text-ink-2">
                Check beam height and centring first, then the last optic you touched, then source power and detector gain.
                Use the alignment trainer for a guided diagnosis.
              </p>
            </div>
            <div className="sm:text-right">
              <Link href="/alignment" className="arrow-link">
                Alignment trainer →
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "measurements" ? (
        <div className="mt-7">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {content.observations.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setActiveTable(o.id)}
                aria-pressed={activeTable === o.id}
                className={`border px-2.5 py-1.5 text-[0.68rem] ${activeTable === o.id ? "border-ink bg-ink text-paper-2" : "border-line text-muted hover:text-ink"}`}
              >
                {o.title}
              </button>
            ))}
          </div>
          {table ? (
            <div className="border border-line bg-paper-2">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
                <div>
                  <p className="text-[0.84rem] font-medium text-ink">{content.observations.find((o) => o.id === activeTable)?.title}</p>
                  <p className="mt-0.5 text-[0.68rem] text-muted">{content.observations.find((o) => o.id === activeTable)?.guidance}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="seg" role="group" aria-label="Data provenance">
                    <button type="button" aria-pressed={table.provenance === "actual"} onClick={() => setProvenance("actual")}>
                      Actual
                    </button>
                    <button type="button" aria-pressed={table.provenance === "simulated"} onClick={() => setProvenance("simulated")}>
                      Simulated
                    </button>
                  </div>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addRow}>Add row</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>Import CSV</button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) importCsv(f);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => downloadText(`${content.slug}-${activeTable}.csv`, toCsv(table.columns, table.rows), "text/csv;charset=utf-8")}
                  >
                    Export CSV
                  </button>
                </div>
              </div>
              {table.provenance === "simulated" ? (
                <p className="border-b border-vermilion/30 bg-vermilion-soft/30 px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-vermilion">
                  This table is marked simulated. It will be labelled as such in the report.
                </p>
              ) : null}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr>
                      <th className="w-8 border-b border-ink px-2 py-2 text-left font-mono text-[0.55rem] uppercase tracking-wide text-muted">#</th>
                      {table.columns.map((c) => (
                        <th key={c} className="border-b border-ink px-2 py-2 text-left font-mono text-[0.55rem] uppercase tracking-wide text-muted">{c}</th>
                      ))}
                      <th className="w-8 border-b border-ink" />
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, ri) => (
                      <tr key={ri}>
                        <td className="border-b border-line px-2 py-1 font-mono text-[0.6rem] text-muted">{ri + 1}</td>
                        {row.map((cell, ci) => (
                          <td key={ci} className="border-b border-line p-0">
                            <input
                              value={cell}
                              onChange={(e) => setCell(ri, ci, e.target.value)}
                              className="w-full border-0 bg-transparent px-2 py-1.5 font-mono text-[0.72rem] text-ink focus:bg-paper-3 focus:outline-none"
                              aria-label={`${table.columns[ci]}, row ${ri + 1}`}
                            />
                          </td>
                        ))}
                        <td className="border-b border-line px-1">
                          <button type="button" onClick={() => removeRow(ri)} aria-label={`Delete row ${ri + 1}`} className="font-mono text-[0.7rem] text-muted hover:text-vermilion">
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {importMessage ? <p className="border-t border-line px-4 py-2 text-[0.68rem] text-petrol">{importMessage}</p> : null}
              {table.note ? <p className="border-t border-line px-4 py-2 text-[0.66rem] text-muted">{table.note}</p> : null}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5">
                <div className="flex flex-wrap gap-3">
                  {table.columns.map((c, i) => {
                    const vals = table.rows.map((r) => Number(r[i])).filter((n) => Number.isFinite(n));
                    return vals.length > 0 ? (
                      <span key={c} className="font-mono text-[0.6rem] text-muted">
                        {c}: mean {formatSig(mean(vals))}, sd {formatSig(sd(vals))}, n={vals.length}
                      </span>
                    ) : null;
                  })}
                </div>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={async () => {
                    await saveDataset({
                      id: `ds_${Date.now()}`,
                      name: `${content.slug}-${activeTable}`,
                      experimentSlug: content.slug,
                      source: table.provenance,
                      columns: table.columns,
                      rows: table.rows.filter((r) => r.some((c) => c.trim())),
                      createdAt: new Date().toISOString()
                    });
                    setSavedMessage("Dataset saved locally.");
                    setTimeout(() => setSavedMessage(null), 3000);
                  }}
                >
                  Save dataset
                </button>
              </div>
            </div>
          ) : null}
          {savedMessage ? <p className="mt-3 border border-petrol/40 bg-petrol-soft/30 px-3 py-2 text-[0.7rem] text-petrol">{savedMessage}</p> : null}
        </div>
      ) : null}

      {tab === "analysis" ? (
        <div className="mt-7 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="border border-line bg-paper-2">
              <div className="border-b border-line px-4 py-3">
                <p className="label">Linear regression on your active table</p>
                <p className="mt-0.5 text-[0.7rem] text-muted">{table ? content.observations.find((o) => o.id === activeTable)?.title : "No table"}</p>
              </div>
              {table ? (
                <div className="p-4">
                  <div className="mb-4 flex flex-wrap gap-3">
                    <label className="text-[0.7rem] text-muted">
                      x column
                      <select className="field ml-2 inline-block h-7 w-auto text-[0.68rem]" value={xCol} onChange={(e) => setXCol(Number(e.target.value))}>
                        {table.columns.map((c, i) => <option key={c} value={i}>{c}</option>)}
                      </select>
                    </label>
                    <label className="text-[0.7rem] text-muted">
                      y column
                      <select className="field ml-2 inline-block h-7 w-auto text-[0.68rem]" value={yCol} onChange={(e) => setYCol(Number(e.target.value))}>
                        {table.columns.map((c, i) => <option key={c} value={i}>{c}</option>)}
                      </select>
                    </label>
                  </div>
                  {numeric.rows.length >= 3 ? (
                    <>
                      <LabScatter
                        data={numeric.rows}
                        xLabel={table.columns[xCol]}
                        yLabel={table.columns[yCol]}
                        fit={regression ? { intercept: regression.intercept, slope: regression.slope } : undefined}
                        height={240}
                      />
                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 sm:grid-cols-4">
                        <div><p className="label !text-[0.55rem]">slope</p><p className="num text-[0.85rem]">{formatSig(regression?.slope ?? NaN)}</p><p className="text-[0.6rem] text-muted">± {formatSig(regression?.slopeSE ?? NaN)}</p></div>
                        <div><p className="label !text-[0.55rem]">intercept</p><p className="num text-[0.85rem]">{formatSig(regression?.intercept ?? NaN)}</p><p className="text-[0.6rem] text-muted">± {formatSig(regression?.interceptSE ?? NaN)}</p></div>
                        <div><p className="label !text-[0.55rem]">R²</p><p className="num text-[0.85rem]">{regression?.r2.toFixed(4) ?? "—"}</p></div>
                        <div><p className="label !text-[0.55rem]">n</p><p className="num text-[0.85rem]">{numeric.rows.length}</p></div>
                      </div>
                      <p className="mt-3 text-[0.7rem] leading-relaxed text-muted">
                        Ordinary least squares with standard errors. Residual standard deviation s<sub>y·x</sub> ={" "}
                        {formatSig(regression?.syx ?? NaN)}. Check the residual plot before quoting the fit; a high R² does not
                        prove a linear model.
                      </p>
                    </>
                  ) : (
                    <p className="text-[0.74rem] text-muted">Enter at least three numeric x–y pairs in the measurements tab to fit a line.</p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="mt-5">
              <p className="label mb-2">Experiment-specific calculation</p>
              <ExperimentCalculator content={content} table={table} />
            </div>
          </div>

          <aside>
            <div className="border border-line bg-paper-2 p-4">
              <p className="label mb-2">Uncertainty protocol</p>
              <ol className="space-y-2">
                {[
                  "Write the measurement equation explicitly.",
                  "Differentiate with respect to each measured quantity.",
                  "Combine independent contributions in quadrature.",
                  "Quote the result with the same precision as its uncertainty.",
                  "State the dominant uncertainty and how to reduce it."
                ].map((s, i) => (
                  <li key={i} className="flex gap-2 text-[0.72rem] leading-relaxed text-ink-2">
                    <span className="font-mono text-[0.58rem] text-vermilion">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
              <p className="mt-3 border-t border-line pt-2 text-[0.68rem] text-muted">
                The analysis tab calculates statistical uncertainties from your repeated values. It does not know your
                systematic errors; you must add those in the report.
              </p>
            </div>
            <Link href="/analysis" className="arrow-link mt-4 inline-flex">
              Open the full data workspace →
            </Link>
          </aside>
        </div>
      ) : null}

      {tab === "report" ? (
        <div className="mt-7 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label mb-1 block">Student name</span>
                <input className="field" value={draft.report.studentName} onChange={(e) => setDraft((d) => ({ ...d, report: { ...d.report, studentName: e.target.value } }))} />
              </label>
              <label className="block">
                <span className="label mb-1 block">Date</span>
                <input type="date" className="field" value={draft.report.date} onChange={(e) => setDraft((d) => ({ ...d, report: { ...d.report, date: e.target.value } }))} />
              </label>
            </div>
            {(
              [
                ["objectives", "Objectives"],
                ["apparatus", "Apparatus"],
                ["procedureNotes", "Procedure notes"],
                ["calculations", "Calculations and working"],
                ["uncertainties", "Uncertainty budget"],
                ["errors", "Systematic and random errors"],
                ["conclusion", "Conclusion"]
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="label mb-1 block">{label}</span>
                <textarea
                  rows={key === "conclusion" ? 3 : 2}
                  className="field resize-y"
                  value={draft.report[key]}
                  placeholder={key === "objectives" ? content.objectives.join(" ") : ""}
                  onChange={(e) => setDraft((d) => ({ ...d, report: { ...d.report, [key]: e.target.value } }))}
                />
              </label>
            ))}
          </div>
          <aside>
            <div className="border border-line bg-paper-2">
              <div className="border-b border-line px-4 py-3">
                <p className="label">Report contents</p>
                <p className="mt-1 text-[0.7rem] text-muted">
                  {reportInput.measurements.length} measurement table{reportInput.measurements.length === 1 ? "" : "s"} ·{" "}
                  {reportInput.measurements.some((m) => m.provenance !== "actual") ? "contains simulated data (labelled)" : "all actual data"}
                </p>
              </div>
              <div className="space-y-2 p-4">
                <button type="button" className="btn w-full" onClick={() => printReport(reportInput)}>
                  Print / save PDF
                </button>
                <button
                  type="button"
                  className="btn btn-ghost w-full"
                  onClick={() => downloadReportHtml(reportInput, `${slugifyFilename(content.slug)}-${timestampForFilename()}.html`)}
                >
                  Download HTML report
                </button>
                <button
                  type="button"
                  className="btn btn-ghost w-full"
                  onClick={() =>
                    downloadText(
                      `${slugifyFilename(content.slug)}-${timestampForFilename()}.md`,
                      buildMarkdownReport(reportInput),
                      "text/markdown;charset=utf-8"
                    )
                  }
                >
                  Download Markdown
                </button>
                <button type="button" className="btn btn-ghost w-full" onClick={saveRecord}>
                  Save to notebook
                </button>
                {savedMessage ? <p className="text-[0.68rem] text-petrol">{savedMessage}</p> : null}
              </div>
              <div className="border-t border-line px-4 py-3">
                <p className="text-[0.65rem] leading-relaxed text-muted">
                  The report lists every measured value exactly as entered. Blank fields are not filled in by the platform.
                </p>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}


