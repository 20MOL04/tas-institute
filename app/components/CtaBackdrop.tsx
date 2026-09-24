import FadeImage from "./FadeImage";

/** Photo de fond (assombrie) d'un appel à l'action : à placer en premier enfant d'une section `.cta-photo`. */
export default function CtaBackdrop({ src, position = "50% 35%" }: { src: string; position?: string }) {
  return (
    <div className="cta-photo-media" aria-hidden="true">
      <FadeImage src={src} alt="" fill sizes="100vw" style={{ objectFit: "cover", objectPosition: position }} />
    </div>
  );
}
