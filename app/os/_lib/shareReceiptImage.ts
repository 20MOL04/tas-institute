import { palette } from "../../lib/theme";
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

/** Logo TAS pour le bandeau du reçu. Sans lui (hors ligne), le reçu reste valable. */
function loadLogo(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/brand/tas-icon-256.png";
  });
}

export async function renderReceiptPng(data: ReceiptSharePayload): Promise<Blob> {
  const logo = await loadLogo();
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1480;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = palette.navy;
  ctx.fillRect(0, 0, width, 220);
  ctx.fillStyle = palette.white;
  ctx.font = "700 42px system-ui, Segoe UI, sans-serif";
  ctx.fillText(data.school, 64, 92);
  ctx.font = "500 28px system-ui, Segoe UI, sans-serif";
  ctx.fillStyle = palette.blueLight;
  ctx.fillText(data.campus || "Accra", 64, 140);
  ctx.fillStyle = palette.white;
  ctx.font = "700 34px system-ui, Segoe UI, sans-serif";
  ctx.fillText(data.receipt, 64, 188);

  if (logo) ctx.drawImage(logo, width - 64 - 140, 40, 140, 140);

  roundRect(ctx, 48, 268, 984, 980, 24);
  ctx.fillStyle = palette.white;
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
      ctx.fillStyle = palette.bluePale;
      ctx.fillRect(72, y - 38, 936, 88);
    }
    ctx.fillStyle = palette.muted;
    ctx.font = "500 24px system-ui, Segoe UI, sans-serif";
    ctx.fillText(label, 96, y);
    ctx.fillStyle = palette.navy;
    ctx.font = i === 8 ? "700 36px system-ui, Segoe UI, sans-serif" : "700 28px system-ui, Segoe UI, sans-serif";
    ctx.fillText(value, 400, y);
    y += i === 8 ? 92 : 68;
  });

  ctx.fillStyle = palette.muted;
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
