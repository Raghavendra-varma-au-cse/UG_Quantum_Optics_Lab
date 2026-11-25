/**
 * CSV utilities. Output is deliberately plain UTF-8 RFC 4180 so files open in
 * Python (pandas.read_csv), Excel and Origin without conversion. Units are
 * carried in the header, e.g. "displacement_mm".
 */

export interface CsvTable {
  columns: string[];
  rows: string[][];
  errors: { line: number; message: string }[];
}

/** Parse RFC 4180 CSV with quoted fields, embedded commas/newlines and CRLF. */
export function parseCsv(text: string, maxRows = 20000): CsvTable {
  const errors: { line: number; message: string }[] = [];
  const clean = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  let line = 1;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
        if (ch === "\n") line++;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === "," || ch === ";" || ch === "\t") {
      row.push(field.trim());
      field = "";
    } else if (ch === "\n") {
      row.push(field.trim());
      if (row.some((c) => c !== "")) rows.push(row);
      row = [];
      field = "";
      line++;
      if (rows.length > maxRows) {
        errors.push({ line, message: `Stopped after ${maxRows} rows.` });
        break;
      }
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field.trim());
    if (row.some((c) => c !== "")) rows.push(row);
  }

  if (rows.length === 0) {
    return { columns: [], rows: [], errors: [{ line: 1, message: "No data rows found." }] };
  }
  const columns = rows[0]!.map((c, i) => c || `column_${i + 1}`);
  const body = rows.slice(1).map((r) => {
    if (r.length !== columns.length) {
      errors.push({ line: 0, message: `Row has ${r.length} fields; header has ${columns.length}. Padded.` });
    }
    const out = r.slice(0, columns.length);
    while (out.length < columns.length) out.push("");
    return out;
  });
  return { columns, rows: body, errors };
}

export function toCsv(columns: string[], rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined): string => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
}

/** Numeric columns from string rows; non-numeric cells become null. */
export function numericColumn(table: CsvTable, index: number): (number | null)[] {
  return table.rows.map((r) => {
    const raw = (r[index] ?? "").replace(/[^\d.eE+\-]/g, "");
    if (raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  });
}

/** Guess the number of header rows / units embedded in the first row. */
export function columnsWithUnits(columns: string[]): { name: string; unit: string }[] {
  return columns.map((c) => {
    const m = c.match(/^(.*?)[\s_]*[\[(]([^\])]+)[\])]\s*$/);
    if (m) return { name: m[1]!.trim(), unit: m[2]!.trim() };
    const u = c.match(/^(.*)_([a-zA-Z°µμ%]+)$/);
    if (u) return { name: u[1]!.replace(/_/g, " "), unit: u[2]! };
    return { name: c, unit: "" };
  });
}

export function downloadText(filename: string, text: string, mime = "text/csv;charset=utf-8"): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function slugifyFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function timestampForFilename(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}
