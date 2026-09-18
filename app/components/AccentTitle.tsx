// Splits a headline on one keyword and wraps that word in the shared
// `.accent` (TAS Blue) treatment — the reference mockup highlights one
// word per hero ("Build Your Future.") and our headlines were flat
// single-color navy throughout. `word` must appear verbatim once in
// `title`; if it doesn't (e.g. a translation drifts), this falls back
// to the plain title so it never silently drops content.
export default function AccentTitle({ title, word }: { title: string; word: string }) {
  const i = title.indexOf(word);
  if (i === -1) return <>{title}</>;
  return (
    <>
      {title.slice(0, i)}
      <span className="accent">{word}</span>
      {title.slice(i + word.length)}
    </>
  );
}
