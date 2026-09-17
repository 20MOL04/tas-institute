// Simple monogram avatar used where no dedicated photo is mapped to this
// page in CAHIER-DES-CHARGES.md's image table (e.g. the Teachers preview
// on Home — the real teacher-1/2/3 photos are reserved for the Teachers
// page itself). Keeps the section fully styled and intentional-looking
// without pretending an image exists at a path nobody listed.

export default function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "var(--tas-navy)",
        color: "var(--tas-white)",
        fontWeight: 700,
        fontSize: "0.9rem",
        flex: "none",
      }}
    >
      {initials}
    </span>
  );
}
