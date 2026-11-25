"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { parseCsv, toCsv, downloadText, numericColumn, type CsvTable } from "@/lib/data/csv";
import { linearRegression, mean, sd, sem, median, histogram, formatSig, correlation, confidenceInterval95 } from "@/lib/physics/stats";
import { loadDatasets, saveDataset, deleteDataset } from "@/lib/db";
import { LabBarChart, LabScatter, LabLineChart } from "@/components/viz/Plot";
import { Badge } from "@/components/ui/primitives";

interface DatasetRow {
  id: string;
  name: string;
  experimentSlug: string;
  source: string;
  columns: string[];
  rows: string[][];
  createdAt: string;
}

type Stage = "data" | "analyse" | "export";

export function AnalysisWorkspace() {
  const [table, setTable] = useState<CsvTable>({ columns: [], rows: [], errors: [] });
  const [name, setName] = useState("Untitled dataset");
  const [stage, setStage] = useState<Stage>("data");
  const [paste, setPaste] = useState("");
  const [xCol, setXCol] = useState(0);
  const [yCol, setYCol] = useState(1);
  const [histCol, setHistCol] = useState(0);
  const [datasets, setDatasets] = useState<DatasetRow[]>([]);
  const [saved, setSaved] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadDatasets<DatasetRow>().then((rows) => setDatasets(rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))));
  }, []);

  const numericCols = table.columns.map((c, i) => ({ c, i, values: numericColumn(table, i) }));
  const xValues = numericCols[xCol]?.values ?? [];
  const yValues = numericCols[yCol]?.values ?? [];
  const pairs = useMemo(() => {
    const out: { x: number; y: number; i: number }[] = [];
    for (let i = 0; i < Math.min(xValues.length, yValues.length); i++) {
      const x = xValues[i];
      const y = yValues[i];
      if (x !== null && x !== undefined && y !== null && y !== undefined) out.push({ x, y, i });
    }
    return out;
  }, [xValues, yValues]);

  const fit = pairs.length >= 3 ? linearRegression(pairs.map((p) => p.x), pairs.map((p) => p.y)) : null;
  const hist = histCol >= 0 && numericCols[histCol] ? histogram(numericCols[histCol]!.values.filter((v): v is number => v !== null), 16) : [];
  const fitCurve = useMemo(() => {
    if (!fit || pairs.length === 0) return [];
    const xs = pairs.map((p) => p.x);
    const lo = Math.min(...xs);
    const hi = Math.max(...xs);
    return Array.from({ length: 40 }, (_, i) => {
      const x = lo + ((hi - lo) * i) / 39;
      return { x, y: fit.intercept + fit.slope * x };
    });
  }, [fit, pairs]);

  function loadText(text: string, sourceName: string) {
    const parsed = parseCsv(text);
    if (parsed.columns.length === 0) {
      setMessage("Could not find columns. The first non-empty row is treated as the header.");
      return;
    }
    setTable(parsed);
    setName(sourceName.replace(/\.csv$/i, ""));
    setMessage(`Loaded ${parsed.rows.length} rows, ${parsed.columns.length} columns. Raw values preserved as text; numeric parsing happens per column.`);
    setStage("data");
    setXCol(0);
    setYCol(Math.min(1, parsed.columns.length - 1));
    setHistCol(0);
  }

  function setCell(r: number, c: number, value: string) {
    setTable((t) => ({ ...t, rows: t.rows.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row)) }));
  }

  async function save() {
    if (table.columns.length === 0) return;
    const record: DatasetRow = {
      id: `ds_${Date.now()}`,
      name,
      experimentSlug: "general",
      source: "imported",
      columns: table.columns,
      rows: table.rows,
      createdAt: new Date().toISOString()
    };
    await saveDataset(record);
    setDatasets((d) => [record, ...d]);
    setSaved("Dataset saved locally.");
    setTimeout(() => setSaved(null), 3000);
  }

  const columnStats = numericCols.map((col) => {
    const vals = col.values.filter((v): v is number => v !== null);
    const ci = vals.length >= 2 ? confidenceInterval95(vals) : null;
    return { name: col.c, n: vals.length, mean: mean(vals), sd: sd(vals), sem: sem(vals), median: median(vals), ci };
  });

  return (
    <div className="border border-line-strong bg-paper-2">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper-3/40 px-4 py-3">
        <div>
          <p className="label">Data workspace</p>
          <p className="text-[0.65rem] text-muted">Import, inspect, fit, export. Nothing is uploaded.</p>
        </div>
        <div className="seg" role="group" aria-label="Workspace stage">
          {(
            [
              ["data", "1 · Data"],
              ["analyse", "2 · Analyse"],
              ["export", "3 · Export"]
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" aria-pressed={stage === id} onClick={() => setStage(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {stage === "data" ? (
        <div className="grid gap-0 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 border-b border-line lg:border-b-0 lg:border-r">
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>Import CSV</button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () => loadText(String(reader.result ?? ""), f.name);
                  reader.readAsText(f);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => downloadText(`${name.replace(/\s+/g, "-").toLowerCase()}.csv`, toCsv(table.columns, table.rows))}
                disabled={table.columns.length === 0}
              >
                Export raw CSV
              </button>
              <button type="button" className="btn btn-sm" onClick={save} disabled={table.columns.length === 0}>Save dataset</button>
              {saved ? <span className="text-[0.65rem] text-petrol">{saved}</span> : null}
              <span className="ml-auto font-mono text-[0.58rem] text-muted">{table.rows.length} rows × {table.columns.length} columns</span>
            </div>

            {table.columns.length === 0 ? (
              <div className="p-6">
                <div className="border border-dashed border-line-strong p-6">
                  <p className="text-[0.85rem] font-medium text-ink">Paste data or import a CSV</p>
                  <p className="mt-1 max-w-lg text-[0.72rem] leading-relaxed text-muted">
                    The first row must contain column names. Units in brackets or after an underscore are detected, e.g.
                    <span className="font-mono"> displacement_mm</span> or <span className="font-mono">angle [deg]</span>. Values are
                    kept as text until a numeric column is analysed, so leading zeros and instrument strings survive.
                  </p>
                  <textarea
                    className="field mt-4 h-36 resize-y font-mono text-[0.7rem]"
                    placeholder={"angle_deg,intensity_mV\n0,1000\n15,933\n30,750\n45,500\n60,250\n75,67\n90,2"}
                    value={paste}
                    onChange={(e) => setPaste(e.target.value)}
                    aria-label="Paste CSV data"
                  />
                  <button type="button" className="btn btn-sm mt-2" onClick={() => loadText(paste, "pasted-data.csv")}>
                    Load pasted data
                  </button>
                </div>
                {message ? <p className="mt-3 text-[0.7rem] text-vermilion">{message}</p> : null}
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="w-8 border-b border-ink px-2 py-2 text-left font-mono text-[0.55rem] text-muted">#</th>
                        {table.columns.map((c, i) => (
                          <th key={`${c}-${i}`} className="border-b border-ink px-2 py-1 text-left">
                            <input
                              value={c}
                              onChange={(e) => setTable((t) => ({ ...t, columns: t.columns.map((x, xi) => (xi === i ? e.target.value : x)) }))}
                              className="w-full bg-transparent font-mono text-[0.58rem] uppercase tracking-wide text-ink focus:outline-none"
                              aria-label={`Column ${i + 1} name`}
                            />
                          </th>
                        ))}
                        <th className="w-6 border-b border-ink" />
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, ri) => (
                        <tr key={ri}>
                          <td className="border-b border-line px-2 py-0.5 font-mono text-[0.58rem] text-muted">{ri + 1}</td>
                          {row.map((cell, ci) => (
                            <td key={ci} className="border-b border-line p-0">
                              <input
                                value={cell}
                                onChange={(e) => setCell(ri, ci, e.target.value)}
                                className="w-full min-w-[80px] border-0 bg-transparent px-2 py-1.5 font-mono text-[0.68rem] focus:bg-paper-3 focus:outline-none"
                                aria-label={`${table.columns[ci]}, row ${ri + 1}`}
                              />
                            </td>
                          ))}
                          <td className="border-b border-line px-1">
                            <button type="button" onClick={() => setTable((t) => ({ ...t, rows: t.rows.filter((_, i) => i !== ri) }))} className="text-[0.7rem] text-muted hover:text-vermilion" aria-label={`Delete row ${ri + 1}`}>×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-line px-3 py-2">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTable((t) => ({ ...t, rows: [...t.rows, t.columns.map(() => "")] }))}>Add row</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTable((t) => ({ ...t, columns: [...t.columns, `column_${t.columns.length + 1}`], rows: t.rows.map((r) => [...r, ""]) }))}>Add column</button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      if (!window.confirm("Clear all rows? The columns remain. Export first if you need the raw data.")) return;
                      setTable((t) => ({ ...t, rows: t.rows.map((r) => r.map(() => "")) }));
                    }}
                  >
                    Clear values
                  </button>
                </div>
                {message ? <p className="border-t border-line px-3 py-2 text-[0.68rem] text-petrol">{message}</p> : null}
                {table.errors.length > 0 ? (
                  <p className="border-t border-line px-3 py-2 text-[0.68rem] text-vermilion">
                    Import notes: {table.errors.slice(0, 2).map((e) => e.message).join(" ")}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <aside className="p-4">
            <label className="mb-3 block">
              <span className="label mb-1 block">Dataset name</span>
              <input className="field h-8 text-[0.7rem]" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <p className="label mb-2">Saved datasets</p>
            {datasets.length === 0 ? (
              <p className="text-[0.68rem] leading-relaxed text-muted">None yet. Save an imported dataset to keep it in this browser.</p>
            ) : (
              <ul className="max-h-[300px] divide-y divide-line overflow-y-auto border-t border-line">
                {datasets.map((d) => (
                  <li key={d.id} className="py-2">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        className="text-left text-[0.7rem] text-ink-2 hover:text-vermilion"
                        onClick={() => {
                          setTable({ columns: d.columns, rows: d.rows, errors: [] });
                          setName(d.name);
                          setStage("data");
                        }}
                      >
                        {d.name}
                      </button>
                      <button type="button" onClick={async () => { await deleteDataset(d.id); setDatasets((x) => x.filter((y) => y.id !== d.id)); }} className="text-[0.6rem] text-muted hover:text-vermilion" aria-label={`Delete ${d.name}`}>×</button>
                    </div>
                    <p className="font-mono text-[0.52rem] text-muted">{d.rows.length} rows · {new Date(d.createdAt).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 border-t border-line pt-3">
              <p className="label mb-1">Data integrity</p>
              <p className="text-[0.65rem] leading-relaxed text-muted">
                Import does not drop rows or “fix” values. Non-numeric cells become missing in a numeric analysis; the raw
                text remains in the table and in the exported CSV.
              </p>
            </div>
          </aside>
        </div>
      ) : null}

      {stage === "analyse" ? (
        <div className="grid gap-0 lg:grid-cols-[1fr_310px]">
          <div className="min-w-0 border-b border-line lg:border-b-0 lg:border-r">
            {table.columns.length === 0 ? (
              <p className="p-6 text-[0.8rem] text-muted">Load a dataset first.</p>
            ) : (
              <div className="space-y-6 p-4">
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="label">Linear regression</p>
                    <div className="flex flex-wrap gap-2">
                      <label className="text-[0.65rem] text-muted">
                        x
                        <select className="field ml-1 inline-block h-7 w-auto text-[0.65rem]" value={xCol} onChange={(e) => setXCol(Number(e.target.value))}>
                          {table.columns.map((c, i) => <option key={c} value={i}>{c}</option>)}
                        </select>
                      </label>
                      <label className="text-[0.65rem] text-muted">
                        y
                        <select className="field ml-1 inline-block h-7 w-auto text-[0.65rem]" value={yCol} onChange={(e) => setYCol(Number(e.target.value))}>
                          {table.columns.map((c, i) => <option key={c} value={i}>{c}</option>)}
                        </select>
                      </label>
                    </div>
                  </div>
                  {pairs.length >= 3 && fit ? (
                    <>
                      <LabScatter
                        data={pairs.map((p) => ({ x: p.x, y: p.y }))}
                        xLabel={table.columns[xCol]}
                        yLabel={table.columns[yCol]}
                        fit={{ intercept: fit.intercept, slope: fit.slope }}
                        height={250}
                      />
                      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 sm:grid-cols-4">
                        <div><p className="label !text-[0.52rem]">slope</p><p className="num text-[0.8rem]">{formatSig(fit.slope)}</p><p className="text-[0.58rem] text-muted">± {formatSig(fit.slopeSE)}</p></div>
                        <div><p className="label !text-[0.52rem]">intercept</p><p className="num text-[0.8rem]">{formatSig(fit.intercept)}</p><p className="text-[0.58rem] text-muted">± {formatSig(fit.interceptSE)}</p></div>
                        <div><p className="label !text-[0.52rem]">R²</p><p className="num text-[0.8rem]">{fit.r2.toFixed(5)}</p></div>
                        <div><p className="label !text-[0.52rem]">Pearson r</p><p className="num text-[0.8rem]">{formatSig(correlation(pairs.map((p) => p.x), pairs.map((p) => p.y)))}</p></div>
                      </div>
                      <div className="mt-4">
                        <p className="label mb-1">Residuals</p>
                        <LabLineChart
                          data={pairs.map((p, i) => ({ x: p.x, residual: fit.residuals[i] ?? 0 }))}
                          series={[{ key: "residual", label: "residual", color: "#3D4A55" }]}
                          xLabel={table.columns[xCol]}
                          yLabel="residual"
                          referenceY={0}
                          height={150}
                        />
                        <p className="mt-1 text-[0.62rem] text-muted">
                          Residual standard deviation s<sub>y·x</sub> = {formatSig(fit.syx)}. Structure in the residuals means
                          the straight line is the wrong model, even if R² is high.
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-[0.72rem] text-muted">Need at least three rows with numeric values in both selected columns.</p>
                  )}
                </div>

                <div className="border-t border-line pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="label">Distribution</p>
                    <select className="field h-7 w-auto text-[0.65rem]" value={histCol} onChange={(e) => setHistCol(Number(e.target.value))} aria-label="Histogram column">
                      {table.columns.map((c, i) => <option key={c} value={i}>{c}</option>)}
                    </select>
                  </div>
                  {hist.length ? <LabBarChart data={hist.map((h) => ({ x: Number(h.x.toPrecision(3)), y: h.count }))} height={180} xLabel={table.columns[histCol]} yLabel="count" /> : <p className="text-[0.7rem] text-muted">No numeric values in this column.</p>}
                </div>
              </div>
            )}
          </div>

          <aside className="p-4">
            <p className="label mb-2">Column statistics</p>
            {columnStats.length === 0 ? <p className="text-[0.68rem] text-muted">No numeric columns.</p> : null}
            <div className="space-y-3">
              {columnStats.map((s) => (
                <div key={s.name} className="border-b border-line pb-2">
                  <p className="font-mono text-[0.62rem] text-ink">{s.name}</p>
                  <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[0.58rem] text-muted">
                    <span>n {s.n}</span>
                    <span>mean {formatSig(s.mean, 3)}</span>
                    <span>sd {formatSig(s.sd, 3)}</span>
                    <span>sem {formatSig(s.sem, 3)}</span>
                    <span>median {formatSig(s.median, 3)}</span>
                    {s.ci ? <span>95% ±{formatSig(s.ci.halfWidth, 2)}</span> : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border border-line bg-paper p-3">
              <p className="label mb-1">Uncertainty propagation</p>
              <p className="text-[0.64rem] leading-relaxed text-muted">
                For z = x·y or x/y: u(z)/z = √[(u(x)/x)² + (u(y)/y)²]. For sums: u(z) = √[u(x)² + u(y)²]. Do not add
                relative errors linearly.
              </p>
            </div>
          </aside>
        </div>
      ) : null}

      {stage === "export" ? (
        <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
          <div className="border-b border-line p-5 lg:border-b-0 lg:border-r">
            <p className="label mb-2">Export</p>
            <p className="max-w-xl text-[0.8rem] leading-relaxed text-ink-2">
              The raw CSV preserves every cell as entered. The fit summary is a separate text file so that transformed or
              fitted values can never be mistaken for measurements.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn" disabled={table.columns.length === 0} onClick={() => downloadText(`${name.replace(/\s+/g, "-").toLowerCase()}-raw.csv`, toCsv(table.columns, table.rows))}>
                Download raw CSV
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={!fit}
                onClick={() => {
                  const lines = [
                    `# Fit summary — ${name}`,
                    `Generated: ${new Date().toISOString()}`,
                    `Model: y = a + b x`,
                    `x: ${table.columns[xCol]}`,
                    `y: ${table.columns[yCol]}`,
                    `n = ${fit?.n}`,
                    `slope = ${fit?.slope} ± ${fit?.slopeSE}`,
                    `intercept = ${fit?.intercept} ± ${fit?.interceptSE}`,
                    `R^2 = ${fit?.r2}`,
                    `residual sd = ${fit?.syx}`,
                    `Note: fitted parameters are derived from the raw data and are not measurements.`
                  ].join("\n");
                  downloadText(`${name.replace(/\s+/g, "-").toLowerCase()}-fit.txt`, lines, "text/plain;charset=utf-8");
                }}
              >
                Download fit summary
              </button>
            </div>
            <div className="mt-6 border-t border-line pt-4">
              <p className="label mb-2">Python-compatible note</p>
              <p className="text-[0.7rem] leading-relaxed text-muted">
                Exported CSVs are UTF-8 with a comma delimiter and a single header row. Units remain in the header. In
                Python: <span className="font-mono">pandas.read_csv(path)</span> will load the columns directly.
              </p>
            </div>
          </div>
          <aside className="p-4">
            <p className="label mb-2">Summary</p>
            <div className="space-y-1.5 font-mono text-[0.65rem] text-muted">
              <p>dataset <span className="text-ink">{name}</span></p>
              <p>rows <span className="text-ink">{table.rows.length}</span></p>
              <p>columns <span className="text-ink">{table.columns.length}</span></p>
              <p>fit points <span className="text-ink">{pairs.length}</span></p>
              <p>R² <span className="text-ink">{fit ? fit.r2.toFixed(4) : "—"}</span></p>
            </div>
            <Badge tone="petrol" className="mt-3">local only</Badge>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
