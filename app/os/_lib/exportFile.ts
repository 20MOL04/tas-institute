/** Téléchargement tableau (Excel ouvre le CSV) et impression / PDF via le dialogue du navigateur. */

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (cell: string | number) => {
    const text = String(cell);
    if (/[",;\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  };
  const body = [headers, ...rows].map((line) => line.map(escape).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printSheet(title: string, html: string) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) {
    document.body.removeChild(frame);
    return;
  }
  doc.open();
  doc.write(`<!doctype html><html><head><title>${title}</title>
<style>
  body { font-family: Segoe UI, sans-serif; color: #16202e; padding: 24px; }
  h1 { font-size: 18px; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e2e5ea; }
  th { color: #64748b; font-weight: 600; }
</style></head><body><h1>${title}</h1>${html}</body></html>`);
  doc.close();
  frame.contentWindow?.focus();
  frame.contentWindow?.print();
  setTimeout(() => document.body.removeChild(frame), 1000);
}

export function printTable(title: string, headers: string[], rows: (string | number)[][]) {
  const head = headers.map((h) => `<th>${h}</th>`).join("");
  const body = rows
    .map((line) => `<tr>${line.map((c) => `<td>${String(c)}</td>`).join("")}</tr>`)
    .join("");
  printSheet(title, `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`);
}
