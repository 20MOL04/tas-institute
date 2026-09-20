/** Image du reçu. WhatsApp ouvre une image tout de suite, un PDF non. */

export type ReceiptSharePayload = {
  school: string;
  campus: string;
  receipt: string;
  student: string;
  matricule: string;
  program: string;
  month: string;
  date: string;
  time: string;
  purpose: string;
  method: string;
  amount: string;
  due: string;
  clerk: string;
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function renderReceiptPng(data: ReceiptSharePayload): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1480;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("canvas"));

  ctx.fillStyle = "#f4f7fb";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#0b2a5b";
  ctx.fillRect(0, 0, width, 220);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 42px system-ui, Segoe UI, sans-serif";
  ctx.fillText(data.school, 64, 92);
  ctx.font = "500 28px system-ui, Segoe UI, sans-serif";
  ctx.fillStyle = "#c5d4ea";
  ctx.fillText(data.campus || "Accra", 64, 140);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 34px system-ui, Segoe UI, sans-serif";
  ctx.fillText(data.receipt, 64, 188);

  roundRect(ctx, 48, 268, 984, 980, 24);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  const rows: [string, string][] = [
    ["Élève", data.student],
    ["Matricule", data.matricule],
    ["Programme", data.program],
    ["Mois", data.month],
    ["Date", data.date],
    ["Heure", data.time],
    ["Objet", data.purpose],
    ["Moyen", data.method],
    ["Montant reçu", data.amount],
    ["Reste à payer", data.due],
    ["Administration", data.clerk],
  ];

  let y = 330;
  rows.forEach(([label, value], i) => {
    if (i === 8) {
      ctx.fillStyle = "#e8eef7";
      ctx.fillRect(72, y - 38, 936, 88);
    }
    ctx.fillStyle = "#5b6b82";
    ctx.font = "500 24px system-ui, Segoe UI, sans-serif";
    ctx.fillText(label, 96, y);
    ctx.fillStyle = "#0b2a5b";
    ctx.font = i === 8 ? "700 36px system-ui, Segoe UI, sans-serif" : "700 28px system-ui, Segoe UI, sans-serif";
    ctx.fillText(value, 400, y);
    y += i === 8 ? 92 : 68;
  });

  ctx.fillStyle = "#5b6b82";
  ctx.font = "500 22px system-ui, Segoe UI, sans-serif";
  ctx.fillText("TAS English Institute, Accra", 64, 1420);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("image"));
      else resolve(blob);
    }, "image/png");
  });
}

export async function shareReceiptImage(data: ReceiptSharePayload) {
  const blob = await renderReceiptPng(data);
  const file = new File([blob], `${data.receipt}.png`, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] }) && navigator.share) {
    await navigator.share({
      files: [file],
      title: data.receipt,
      text: `Reçu ${data.receipt}, ${data.student}`,
    });
    return;
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${data.receipt}.png`;
  link.click();
  URL.revokeObjectURL(url);
}
