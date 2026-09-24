/**
 * SOURCE UNIQUE DES COULEURS — site, app école (/os) et Back office (/admin).
 *
 * C'est le seul fichier du projet qui contient des valeurs de couleur.
 * - Les feuilles CSS utilisent les variables générées ici :
 *     var(--c-blue)                  couleur pleine
 *     rgb(var(--c-blue-rgb) / 0.1)   même couleur, transparente
 * - Le code TypeScript (graphiques, reçu partagé, manifeste…) importe `palette`.
 *
 * Pour changer une couleur partout : modifier sa valeur ici, et rien d'autre.
 */

export const palette = {
  /* Marque (logo TAS) */
  blue: "#00379f", // bleu du logo
  blueLight: "#85afff", // même teinte, éclaircie pour les fonds sombres
  bluePale: "#e0e7f4", // même teinte, très pâle (fonds actifs)
  navy: "#0b2a5b",
  ink: "#071020", // marine le plus sombre (voiles sur photos, ombres)
  white: "#ffffff",

  /* Neutres */
  text: "#10213a",
  text2: "#455061",
  muted: "#5b6b82",
  faint: "#8a93a3",
  borderStrong: "#c3d2e8",
  border: "#e3e9f2",
  surface: "#f1f6ff",
  bg: "#f7f9fc",

  /* Accents */
  whatsapp: "#25d366",
  whatsappDeep: "#1ebe57",
  gold: "#c9a24b",
  goldDeep: "#8a6c26",
  star: "#f5b301",

  /* États (app et Back office) */
  success: "#10b981",
  successDeep: "#047857",
  successSoft: "#d1fae5",
  successLight: "#34d399",
  danger: "#dc2626",
  dangerDeep: "#b91c1c",
  dangerSoft: "#fee2e2",
  dangerLight: "#f87171",
  warning: "#f59e0b",
  warningDeep: "#b45309",
  warningSoft: "#fef3c7",
  warningLight: "#fbbf24",
  violet: "#6d28d9",
  violetSoft: "#ede9fe",

  /* Thème sombre de l'app */
  darkBg: "#0b1220",
  darkCard: "#111827",
  darkRaised: "#263246",
  darkBorder: "#1f2a3d",
  darkBorderStrong: "#3d4d64",
  darkSidebar: "#0c1736",
} as const;

export type PaletteName = keyof typeof palette;

/** Couleurs des séries de graphiques, dans l'ordre. */
export const CHART_COLORS = [palette.blue, palette.success, palette.warning, palette.violet] as const;

function kebab(name: string) {
  return name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

function rgbTriplet(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** Les variables CSS, injectées une fois dans <head> par app/layout.tsx. */
export function themeCss() {
  const vars = Object.entries(palette)
    .map(([name, hex]) => `--c-${kebab(name)}:${hex};--c-${kebab(name)}-rgb:${rgbTriplet(hex)};`)
    .join("");
  return `:root{${vars}}`;
}
