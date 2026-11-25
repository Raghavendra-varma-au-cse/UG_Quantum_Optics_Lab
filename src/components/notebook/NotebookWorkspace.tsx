"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EXPERIMENTS } from "@/lib/content/registry";
import type { ExperimentSlug } from "@/lib/content/types";
import { deleteNotebookRecord, loadNotebookRecords, saveNotebookRecord } from "@/lib/db";
import { emptyNotebookRecord, newNotebookId, type NotebookRecord } from "@/lib/data/notebook-types";
import { downloadText, slugifyFilename, timestampForFilename } from "@/lib/data/csv";
import { Badge } from "@/components/ui/primitives";

function recordMarkdown(r: NotebookRecord): string {
  const lines = [
    `# ${r.title}`,
    "",
    `**Experiment:** ${r.experimentSlug}  `,
    `**Date:** ${r.date}  `,
    `**Student:** ${r.studentName || "—"}`,
    "",
    "## Objectives",
    r.objectives || "—",
    "",
    "## Apparatus",
    r.apparatus || "—",
    "",
    "## Theory",
    r.theory || "—",
    "",
    "## Observations",
    r.observations || "—",
    ""
  ];
  for (const m of r.measurements) {
    lines.push(`### ${m.title}`);
    lines.push(`_Provenance: ${m.provenance}${m.note ? ` — ${m.note}` : ""}_`);
    lines.push("");
    lines.push(`| ${m.columns.join(" | ")} |`);
    lines.push(`| ${m.columns.map(() => "---").join(" | ")} |`);
    for (const row of m.rows) lines.push(`| ${row.join(" | ")} |`);
    lines.push("");
  }
  lines.push("## Calculations", r.calculations || "—", "");
  lines.push("## Uncertainties", r.uncertainties || "—", "");
  lines.push("## Errors", r.errors || "—", "");
  lines.push("## Conclusion", r.conclusion || "—", "");
  lines.push(`Tags: ${r.tags.join(", ") || "—"}`);
  lines.push("");
  lines.push("_Generated locally by the Quantum Optics Laboratory. Simulated data is labelled._");
  return lines.join("\n");
}

function printRecord(r: NotebookRecord) {
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const tables = r.measurements
    .map(
      (m) =>
        `<h2>${esc(m.title)}</h2><p class="prov">${esc(m.provenance)}${m.note ? ` — ${esc(m.note)}` : ""}</p><table><thead><tr>${m.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${m.rows.map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`
    )
    .join("");
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(r.title)}</title><style>
  @page{size:A4;margin:18mm}body{font-family:Georgia,serif;max-width:760px;margin:32px auto;padding:0 24px;line-height:1.55;color:#171713}h1{font-size:26px;font-weight:500}h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;border-top:1px solid #bbb;padding-top:8px;margin-top:24px}.meta,.prov{font-family:ui-monospace,monospace;font-size:10px;color:#555}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border-bottom:1px solid #ddd;padding:5px;text-align:left}th{border-bottom:1px solid #111;font-size:10px;text-transform:uppercase}</style></head><body>
  <h1>${esc(r.title)}</h1><p class="meta">${esc(r.experimentSlug)} · ${esc(r.date)} · ${esc(r.studentName || "Student")}</p>
  <h2>Objectives</h2><p>${esc(r.objectives)}</p><h2>Apparatus</h2><p>${esc(r.apparatus)}</p><h2>Theory</h2><p>${esc(r.theory)}</p><h2>Observations</h2><p>${esc(r.observations)}</p>${tables}
  <h2>Calculations</h2><p>${esc(r.calculations)}</p><h2>Uncertainties</h2><p>${esc(r.uncertainties)}</p><h2>Errors</h2><p>${esc(r.errors)}</p><h2>Conclusion</h2><p>${esc(r.conclusion)}</p>
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 300);
}

export function NotebookWorkspace() {
  const [records, setRecords] = useState<NotebookRecord[]>([]);
  const [active, setActive] = useState<NotebookRecord | null>(null);
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadNotebookRecords<NotebookRecord>().then((rows) => setRecords(rows.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))));
  }, []);

  const filtered = useMemo(
    () => records.filter((r) => `${r.title} ${r.experimentSlug} ${r.tags.join(" ")} ${r.conclusion}`.toLowerCase().includes(query.toLowerCase())),
    [records, query]
  );

  function create() {
    const r = emptyNotebookRecord();
    r.title = "New experiment record";
    setActive(r);
    setDirty(false);
  }

  function update<K extends keyof NotebookRecord>(key: K, value: NotebookRecord[K]) {
    setActive((r) => (r ? { ...r, [key]: value } : r));
    setDirty(true);
  }

  async function save() {
    if (!active) return;
    const now = new Date().toISOString();
    const record = { ...active, updatedAt: now };
    await saveNotebookRecord(record);
    setRecords((rows) => [record, ...rows.filter((r) => r.id !== record.id)]);
    setActive(record);
    setDirty(false);
    setSaved("Saved locally.");
    setTimeout(() => setSaved(null), 3000);
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this notebook record permanently? Export it first if needed.")) return;
    await deleteNotebookRecord(id);
    setRecords((rows) => rows.filter((r) => r.id !== id));
    if (active?.id === id) setActive(null);
  }

  const measurement = active?.measurements[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside>
        <button type="button" className="btn mb-3 w-full" onClick={create}>+ New record</button>
        <label className="mb-3 flex items-center gap-2 border border-line bg-paper-2 px-2 py-1.5">
          <span className="font-mono text-[0.55rem] uppercase tracking-wide text-muted">Search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent font-mono text-[0.68rem] focus:outline-none" aria-label="Search notebook" placeholder="title, tag…" />
        </label>
        <ul className="divide-y divide-line border-y border-line">
          {filtered.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => {
                  if (dirty && !window.confirm("Discard unsaved changes to the current record?")) return;
                  setActive(r);
                  setDirty(false);
                }}
                className={`w-full py-2.5 text-left ${active?.id === r.id ? "bg-paper-3/60" : "hover:bg-paper-2"}`}
              >
                <p className="line-clamp-1 text-[0.74rem] text-ink">{r.title}</p>
                <p className="mt-0.5 font-mono text-[0.55rem] text-muted">{r.date} · {r.experimentSlug === "general" ? "general" : r.experimentSlug.split("-")[0]}</p>
              </button>
            </li>
          ))}
        </ul>
        {records.length === 0 ? <p className="mt-3 text-[0.7rem] leading-relaxed text-muted">No records yet. Create one here or save from a practical workspace.</p> : null}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm w-full"
            disabled={records.length === 0}
            onClick={() => downloadText(`notebook-${timestampForFilename()}.json`, JSON.stringify(records, null, 2), "application/json")}
          >
            Export all (JSON)
          </button>
          <p className="text-[0.6rem] leading-relaxed text-muted">Records live in this browser only. Export a copy before clearing site data.</p>
        </div>
      </aside>

      <div className="min-w-0">
        {!active ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center border border-dashed border-line-strong px-6 text-center">
            <p className="font-display text-[1.4rem] text-ink">A notebook is a dated argument.</p>
            <p className="mt-2 max-w-md text-[0.75rem] leading-relaxed text-muted">
              Create a record, or open a practical workspace and save the measurement table directly. Each record keeps
              the apparatus, the raw values, the uncertainty and the conclusion together.
            </p>
            <button type="button" className="btn mt-4" onClick={create}>Create the first record</button>
          </div>
        ) : (
          <div className="border border-line bg-paper-2">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5">
              <div className="flex items-center gap-2">
                <p className="label">{records.some((r) => r.id === active.id) ? "Editing record" : "New record"}</p>
                {dirty ? <Badge tone="brass">unsaved</Badge> : <Badge tone="petrol">saved</Badge>}
                {saved ? <span className="text-[0.62rem] text-petrol">{saved}</span> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-sm" onClick={save}>Save</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => printRecord(active)}>Print / PDF</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => downloadText(`${slugifyFilename(active.title)}.md`, recordMarkdown(active), "text/markdown;charset=utf-8")}>Markdown</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(active.id)}>Delete</button>
              </div>
            </div>

            <div className="space-y-4 p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_180px_130px]">
                <label>
                  <span className="label mb-1 block">Title</span>
                  <input className="field" value={active.title} onChange={(e) => update("title", e.target.value)} />
                </label>
                <label>
                  <span className="label mb-1 block">Experiment</span>
                  <select className="field" value={active.experimentSlug} onChange={(e) => update("experimentSlug", e.target.value as ExperimentSlug | "general")}>
                    <option value="general">General</option>
                    {EXPERIMENTS.map((e) => <option key={e.slug} value={e.slug}>{e.number} · {e.shortTitle}</option>)}
                  </select>
                </label>
                <label>
                  <span className="label mb-1 block">Date</span>
                  <input type="date" className="field" value={active.date} onChange={(e) => update("date", e.target.value)} />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="label mb-1 block">Student</span>
                  <input className="field" value={active.studentName} onChange={(e) => update("studentName", e.target.value)} />
                </label>
                <label>
                  <span className="label mb-1 block">Tags (comma separated)</span>
                  <input className="field" value={active.tags.join(", ")} onChange={(e) => update("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
                </label>
              </div>

              {(
                [
                  ["objectives", "Objectives", 3],
                  ["apparatus", "Apparatus and component details", 2],
                  ["theory", "Theory and equations used", 3],
                  ["observations", "Observations", 3],
                  ["calculations", "Calculations and working", 3],
                  ["uncertainties", "Uncertainties", 2],
                  ["errors", "Errors and anomalies", 2],
                  ["conclusion", "Conclusion", 3]
                ] as const
              ).map(([key, label, rows]) => (
                <label key={key} className="block">
                  <span className="label mb-1 block">{label}</span>
                  <textarea rows={rows} className="field resize-y" value={active[key]} onChange={(e) => update(key, e.target.value)} />
                </label>
              ))}

              <div className="border-t border-line pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="label">Measurement table</p>
                  <div className="flex gap-2">
                    <select
                      className="field h-7 w-auto text-[0.64rem]"
                      value={measurement?.provenance ?? "actual"}
                      onChange={(e) => {
                        const prov = e.target.value as "actual" | "simulated" | "mixed";
                        update("measurements", [
                          {
                            title: measurement?.title ?? "Measurement table",
                            columns: measurement?.columns ?? ["x", "y"],
                            rows: measurement?.rows ?? [["", ""]],
                            provenance: prov,
                            note: measurement?.note
                          }
                        ]);
                      }}
                      aria-label="Measurement provenance"
                    >
                      <option value="actual">Actual data</option>
                      <option value="simulated">Simulated data</option>
                      <option value="mixed">Mixed data</option>
                    </select>
                    <button
                      type="button"
                      className="border border-line-strong px-2 py-1 font-mono text-[0.58rem] uppercase tracking-wide text-ink-2 hover:bg-paper-3"
                      onClick={() =>
                        update("measurements", [
                          {
                            title: measurement?.title ?? "Measurement table",
                            columns: measurement?.columns ?? ["x", "y"],
                            rows: [...(measurement?.rows ?? []), (measurement?.columns ?? ["x", "y"]).map(() => "")],
                            provenance: measurement?.provenance ?? "actual",
                            note: measurement?.note
                          }
                        ])
                      }
                    >
                      Add row
                    </button>
                  </div>
                </div>
                {measurement ? (
                  <div className="mt-2">
                    <input
                      className="field mb-2 h-8 text-[0.72rem]"
                      value={measurement.title}
                      onChange={(e) => update("measurements", [{ ...measurement, title: e.target.value }])}
                      aria-label="Measurement table title"
                    />
                    <div className="overflow-x-auto border border-line">
                      <table className="w-full min-w-[420px]">
                        <thead>
                          <tr>
                            {measurement.columns.map((c, ci) => (
                              <th key={ci} className="border-b border-line p-0">
                                <input
                                  className="w-full bg-transparent px-2 py-1 font-mono text-[0.55rem] uppercase tracking-wide focus:bg-paper-3 focus:outline-none"
                                  value={c}
                                  onChange={(e) => update("measurements", [{ ...measurement, columns: measurement.columns.map((x, i) => (i === ci ? e.target.value : x)) }])}
                                  aria-label={`Column ${ci + 1}`}
                                />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {measurement.rows.map((row, ri) => (
                            <tr key={ri}>
                              {row.map((cell, ci) => (
                                <td key={ci} className="border-b border-line p-0">
                                  <input
                                    className="w-full min-w-[70px] bg-transparent px-2 py-1 font-mono text-[0.65rem] focus:bg-paper-3 focus:outline-none"
                                    value={cell}
                                    onChange={(e) =>
                                      update("measurements", [
                                        { ...measurement, rows: measurement.rows.map((r, rri) => (rri === ri ? r.map((x, xi) => (xi === ci ? e.target.value : x)) : r)) }
                                      ])
                                    }
                                    aria-label={`Row ${ri + 1}, ${measurement.columns[ci]}`}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-1 text-[0.62rem] text-muted">
                      Provenance: <strong className="text-ink">{measurement.provenance}</strong>. Simulated values must not be
                      submitted as laboratory measurements.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="mt-2 border border-line px-2 py-1 font-mono text-[0.58rem] uppercase tracking-wide text-muted hover:text-ink"
                    onClick={() => update("measurements", [{ title: "Measurement table", columns: ["x", "y"], rows: [["", ""]], provenance: "actual" }])}
                  >
                    Add measurement table
                  </button>
                )}
              </div>

              <div className="border-t border-line pt-4">
                <div className="flex items-center justify-between">
                  <p className="label">Attachments</p>
                  <button type="button" className="font-mono text-[0.58rem] uppercase tracking-wide text-muted hover:text-ink" onClick={() => fileRef.current?.click()}>+ attach file</button>
                  <input
                    ref={fileRef}
                    type="file"
                    className="sr-only"
                    accept=".csv,.png,.jpg,.jpeg,.pdf,.txt"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > 1_500_000) {
                        setSaved("Attachment skipped: files must be under 1.5 MB for local storage.");
                        setTimeout(() => setSaved(null), 4000);
                        e.target.value = "";
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        update("attachments", [...(active.attachments ?? []), { name: f.name, type: f.type, size: f.size, dataUrl: String(reader.result ?? "") }]);
                      };
                      reader.readAsDataURL(f);
                      e.target.value = "";
                    }}
                  />
                </div>
                {active.attachments?.length ? (
                  <ul className="mt-2 divide-y divide-line border-y border-line">
                    {active.attachments.map((a, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 py-1.5">
                        <span className="text-[0.68rem] text-ink-2">{a.name} <span className="font-mono text-[0.55rem] text-muted">{(a.size / 1024).toFixed(0)} kB</span></span>
                        <button type="button" onClick={() => update("attachments", active.attachments!.filter((_, ai) => ai !== i))} className="text-[0.6rem] text-muted hover:text-vermilion">remove</button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-[0.65rem] text-muted">Attach a small CSV, plot or image. Large files should stay in the laboratory folder.</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5">
              <p className="font-mono text-[0.55rem] text-muted">Last updated {new Date(active.updatedAt).toLocaleString()}</p>
              <div className="flex gap-2">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { const copy = { ...active, id: newNotebookId(), title: `${active.title} (copy)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; setActive(copy); setDirty(true); }}>Duplicate</button>
                <button type="button" className="btn btn-sm" onClick={save}>Save record</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
