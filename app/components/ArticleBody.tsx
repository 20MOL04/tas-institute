import { Fragment, type ReactNode } from "react";
import type { ArticleBlock } from "../lib/articles";

/** **gras** et *italique*, rien d'autre : le texte vient de lib/articles.ts. */
function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="article-body">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return <h2 key={i}>{block.text}</h2>;
          case "p":
            return <p key={i}>{inline(block.text)}</p>;
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{inline(item)}</li>
                ))}
              </Tag>
            );
          }
          case "tip":
            return (
              <aside key={i} className="article-tip">
                {block.title ? <strong className="article-tip-title">{block.title}</strong> : null}
                <p>{inline(block.text)}</p>
              </aside>
            );
          case "table":
            return (
              <div key={i} className="article-table-wrap">
                <table className="article-table">
                  <thead>
                    <tr>
                      {block.head.map((h, j) => (
                        <th key={j} scope="col">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) =>
                          c === 0 ? <th key={c} scope="row">{inline(cell)}</th> : <td key={c}>{inline(cell)}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
