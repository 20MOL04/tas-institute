function lastWordParts(title: string): { head: string; accent: string } {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return { head: "", accent: title };
  const accent = words.pop() as string;
  return { head: words.join(" "), accent };
}

export function LastWordAccent({ title }: { title: string }) {
  const { head, accent } = lastWordParts(title);
  return (
    <>
      {head ? `${head} ` : null}
      <span className="accent">{accent}</span>
    </>
  );
}

/** Two sentences become two lines; the last word stays in accent color. */
export function TwoLineHeroTitle({ title }: { title: string }) {
  const lines = title.trim().split(/(?<=\.)\s+/).filter(Boolean);
  const first = lines.length >= 2 ? lines.slice(0, -1).join(" ") : "";
  const last = lines.length >= 2 ? lines[lines.length - 1] : title;
  return (
    <>
      {first ? <span className="home-hero-line">{first}</span> : null}
      <span className="home-hero-line">
        <LastWordAccent title={last} />
      </span>
    </>
  );
}

export default function AccentTitle({ title, word }: { title: string; word: string }) {
  const i = title.indexOf(word);
  if (i === -1) return <LastWordAccent title={title} />;
  return (
    <>
      {title.slice(0, i)}
      <span className="accent">{word}</span>
      {title.slice(i + word.length)}
    </>
  );
}
