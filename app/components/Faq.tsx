"use client";

// Accessible FAQ accordion shared by the home page and the content pages.
// Built on <details>/<summary> so it works without JS and is keyboard-operable
// by default; the chevron and the open state are styled in design-system.css.

interface FaqItem {
  q: string;
  a: string;
}

export default function Faq({ items, columns = 1 }: { items: readonly FaqItem[]; columns?: 1 | 2 }) {
  return (
    <div className={`faq${columns === 2 ? " faq-2col" : ""}`}>
      {items.map((item) => (
        <details key={item.q} className="faq-item">
          <summary>
            <span>{item.q}</span>
            <svg className="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
