import Image from "next/image";

/**
 * Logo TAS (fichiers générés par scripts/brand-assets.ps1 dans public/brand/).
 * tone="white" pour les fonds sombres (pied de page, bandeaux marine).
 */
export default function Logo({ tone = "color", height = 44 }: { tone?: "color" | "white"; height?: number }) {
  // Proportions du logo recadré : 480 x 300.
  const width = Math.round((height * 480) / 300);
  return (
    <Image
      src={tone === "white" ? "/brand/tas-logo-white-480.png" : "/brand/tas-logo-480.png"}
      alt=""
      width={width}
      height={height}
      className="brand-logo"
      priority={tone === "color"}
    />
  );
}
