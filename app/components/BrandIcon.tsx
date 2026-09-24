import Image from "next/image";

/** Icône carrée TAS (coins arrondis, fond transparent) pour l'app école, le Back office et les documents. */
export default function BrandIcon({ size = 30, className }: { size?: number; className?: string }) {
  const src = size <= 32 ? "/brand/tas-icon-64.png" : size <= 64 ? "/brand/tas-icon-128.png" : "/brand/tas-icon-256.png";
  return <Image src={src} alt="" width={size} height={size} className={className} unoptimized />;
}
