import Link from "next/link";
import PagesEditor from "../_components/PagesEditor";

const PAGES = [
  { href: "/", title: "Accueil" },
  { href: "/programs", title: "Programmes" },
  { href: "/about", title: "À propos" },
  { href: "/teachers", title: "Enseignants" },
  { href: "/accommodation", title: "Logement" },
  { href: "/contact", title: "Contact" },
  { href: "/apply", title: "Candidature" },
  { href: "/gallery", title: "Galerie" },
];

export default function AdminPages() {
  return (
    <>
      <div className="os-page-head">
        <div>
          <h1>Pages du site</h1>
        </div>
      </div>
      <section className="os-section">
        <div className="os-section-body" style={{ padding: 0 }}>
          <div className="os-table-wrap">
            <table className="os-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Adresse</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {PAGES.map((p) => (
                  <tr key={p.href}>
                    <td className="os-table-strong">{p.title}</td>
                    <td>{p.href}</td>
                    <td>
                      <span className="os-badge os-badge-green">Publié</span>
                    </td>
                    <td>
                      <Link href={p.href} className="os-btn os-btn-sm">
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <PagesEditor />
    </>
  );
}
