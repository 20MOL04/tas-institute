# 14 — Système visuel LanaFarm (extrait pour reproduction)

**Date :** 20 septembre 2026  
**Source auditée :** `C:\Users\HP\LANAFARM` (Next.js 15 + Tailwind CSS v4)  
**Note :** `C:\Users\HP\LANFARM` est vide ou absent — seul LANAFARM contient le code.  
**Méthode :** lecture directe de `globals.css`, tokens TS, layout, dashboard, composants UI. Aucun code propriétaire copié mot pour mot — extraction de tokens, patterns et structure.

---

## Sommaire

1. [Palette (hex réels)](#1--palette-hex-réels)
2. [Typographie](#2--typographie)
3. [Rayons et ombres](#3--rayons-et-ombres)
4. [Layout desktop](#4--layout-desktop)
5. [Layout mobile](#5--layout-mobile)
6. [Pattern carte](#6--pattern-carte)
7. [Pattern KPI](#7--pattern-kpi)
8. [Menus et contrôles](#8--menus-et-contrôles)
9. [Ce qui rend le dashboard PRO](#9--ce-qui-rend-le-dashboard-pro-vs-générique-ia)
10. [8 extraits CSS/TS critiques](#10--8-extraits-csssts-critiques)

---

## 1 — Palette (hex réels)

Source unique : `src/app/globals.css` (`:root`).

### Marque et surfaces

| Token CSS | Hex / valeur | Usage |
|-----------|--------------|-------|
| `--color-primary` | `#0f172a` | Texte fort, boutons primary |
| `--color-secondary` | `#1e293b` | Hover primary |
| `--color-accent-blue` | `#1d4ed8` | CTA, icônes actives, focus, item sidebar actif |
| `--color-accent-blue-soft` | `#dbeafe` | Hover lignes table, fond bouton outline |
| `--color-accent-blue-hover` | `rgba(29, 78, 216, 0.06)` | Fond hover léger |
| `--color-background` | `#f8fafc` | Fond page (slate-50) |
| `--color-card` | `#ffffff` | Surfaces cartes, topbar |
| `--color-card-muted` | `#f1f5f9` | Fond segment control, en-tête table |
| `--color-border` | `#e2e8f0` | Bordures cartes |
| `--color-border-strong` | `#cbd5e1` | Bordure topbar |

### Texte

| Token | Hex |
|-------|-----|
| `--color-foreground` | `#0f172a` |
| `--color-muted` | `#64748b` |
| `--color-muted-foreground` | `#94a3b8` |

### Statuts

| Token | Hex | Soft |
|-------|-----|------|
| `--color-success` | `#10b981` | `#d1fae5` |
| `--color-danger` | `#ef4444` | `#fee2e2` |
| `--color-warning` | `#f59e0b` | `#fef3c7` |
| `--color-info` | `#0ea5e9` | `#e0f2fe` |

### Sidebar (bleu profond brand)

| Token | Hex / valeur |
|-------|--------------|
| `--color-sidebar` | `#1e3a8a` |
| `--color-sidebar-foreground` | `#e0e7ff` |
| `--color-sidebar-muted` | `#93c5fd` |
| `--color-sidebar-hover` | `rgba(255, 255, 255, 0.08)` |
| `--color-sidebar-active` | `#1d4ed8` |
| `--color-sidebar-active-foreground` | `#ffffff` |
| `--color-sidebar-border` | `rgba(255, 255, 255, 0.10)` |

### Couleurs graphique Activité (via tokens, pas hardcodées)

| Métrique | Token | Hex effectif |
|----------|-------|--------------|
| Profit | `--color-success` | `#10b981` |
| CA | `--color-accent-blue` | `#1d4ed8` |
| Dépenses | `--color-danger` | `#ef4444` |
| Production | `--color-warning` | `#f59e0b` |

### Autres hex repérés dans les composants

| Contexte | Valeur |
|----------|--------|
| Backdrop drawer mobile | `bg-black/40` + `backdrop-blur-sm` |
| Topbar shadow inline | `rgb(15 23 42 / 0.06)` + `rgb(15 23 42 / 0.10)` |
| Bouton primary shadow | `rgba(15,23,42,0.08)` |
| Bouton accent shadow | `rgba(29,78,216,0.18)` |
| Viewport themeColor | `#1d4ed8` |

---

## 2 — Typographie

### Famille

- **Police principale :** Inter (Google Fonts), variable CSS `--font-inter`
- **Fallback :** `system-ui, -apple-system, sans-serif`
- **Features OpenType :** `"cv02", "cv03", "cv04", "cv11"`
- **Antialiasing :** activé desktop ; `auto` sur mobile (`<768px`)

### Poids sémantiques (tokens)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--font-weight-body` | 500 | Corps, labels |
| `--font-weight-label` | 500 | Labels formulaires |
| `--font-weight-heading` | 600 | h1, h2, titres section |
| `--font-weight-strong` | 700 | Valeurs KPI (via `font-bold`) |

### Échelle de tailles (tokens CSS → classes Tailwind)

| Token | rem | px | Classe Tailwind | Usage |
|-------|-----|-----|-----------------|-------|
| `--text-micro` | 0.6875 | 11 | `text-micro` | Badges, labels mini-KPI |
| `--text-caption` | 0.6875 | 11 | `text-caption` | Labels KPI, hints |
| `--text-label` | 0.75 | 12 | `text-label` | Champs, hints |
| `--text-body-sm` | 0.8125 | 13 | `text-body-sm` | Cellules table, descriptions |
| `--text-body` | 0.875 | 14 | `text-body` | Corps base |
| `--text-nav` | 0.875 | 14 | `text-nav` | Liens sidebar desktop |
| `--text-title` | 0.9375 | 15 | `text-title` | Titres section (h2) |
| `--text-page` | 1.375 | 22 | `text-page` | Titre page (h1) |

### Hiérarchie HTML native

- **h1 :** `text-page`, weight 600, `letter-spacing: -0.01em`
- **h2 :** `text-title`, weight 600
- **h3 :** `text-body-sm`, weight 600, uppercase, `letter-spacing: 0.04em`, couleur muted

### KPI — tailles responsives (clamp, pas tokens fixes)

| Taille carte | Classe valeur |
|--------------|---------------|
| hero | `text-[clamp(1.125rem,5vw,1.75rem)]` (18–28 px) |
| compact | `text-[clamp(0.9375rem,3.5vw,1.125rem)]` |
| mini | `text-[clamp(0.8125rem,2.75vw,0.9375rem)]` |

Chiffres : `font-bold tabular-nums tracking-tight`. Unités : `text-caption` / `text-label`, couleur muted.

---

## 3 — Rayons et ombres

### Rayons (tokens)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--radius-card` | `12px` | Cartes, sections, popovers |
| `--radius-button` | `10px` | Boutons, triggers |
| `--radius-input` | `8px` | Champs |
| `--radius-sm` | `6px` | Liens sidebar, petits boutons |
| `--radius-pill` | `9999px` | Scrollbar thumb, badges |

### Ombres (box-shadow réelles)

```css
--shadow-card:
  0 1px 2px 0 rgb(15 23 42 / 0.06),
  0 4px 14px -2px rgb(15 23 42 / 0.1);

--shadow-hover:
  0 2px 6px 0 rgb(15 23 42 / 0.08),
  0 8px 20px -4px rgb(15 23 42 / 0.14);

--shadow-modal:
  0 20px 40px -12px rgb(15 23 42 / 0.20);

--shadow-sidebar:
  4px 0 16px -4px rgb(15 23 42 / 0.25);
```

Topbar utilise la même ombre que `--shadow-card` (inline dans le composant).

---

## 4 — Layout desktop

### Structure globale (`AppShell`)

```
┌─────────────┬──────────────────────────────────────────┐
│  Sidebar    │  Topbar (sticky, h=56px)                 │
│  232px      ├──────────────────────────────────────────┤
│  (ou 64px   │  Main content                            │
│  collapsed) │  max-width: 1280px, centré               │
│             │  page-stack gap: 1rem (16px)             │
└─────────────┴──────────────────────────────────────────┘
```

### Dimensions exactes

| Élément | Valeur | Source |
|---------|--------|--------|
| Sidebar expanded | `232px` (`--sidebar-width`) | globals.css |
| Sidebar collapsed | `64px` (`--sidebar-width-collapsed`) | globals.css |
| Topbar height | `56px` (`--topbar-height`) | globals.css |
| Content max-width | `1280px` (`--content-max-width`) | globals.css |
| Main padding X | `24px` (`lg:px-6`) | app-shell |
| Main padding Y | `20px` (`lg:py-5`) | app-shell |
| Page gutter token | `20px` (`--page-gutter-x`) | globals.css (référence) |
| Vertical stack gap | `16px` (`gap-4` via `.page-stack`) | globals.css |

### Sidebar desktop

- Position : `sticky top-0`, hauteur viewport
- Fond : `--color-sidebar`, ombre `--shadow-sidebar`
- Nav padding : `px-2 py-2`
- Liens : `rounded-sm`, padding `px-2 py-[0.4375rem]`, icônes `16×16`
- Groupes : séparateur Assistance via `border-t border-sidebar-border`
- État actif : fond `#1d4ed8`, texte blanc
- Repli : persiste dans `localStorage` (`lanafarm:sidebar-collapsed`)

### Topbar desktop

- Fond blanc (`bg-card`), bordure basse `border-border-strong/60`
- Contenu : recherche globale | calendrier plage | cloche notifications
- Pas de titre de page dans la topbar (titre dans le contenu)

### Dashboard desktop (≥1280px / xl)

```
PageHeader (titre + 2 boutons actions)
    ↓ gap 16px
KpiGrid
  ├─ Rangée hero : 4 colonnes, gap 12px
  └─ Rangée mini : 4 colonnes, gap 8px
    ↓ gap 16px
Grid xl : [ ActivityChart 1.7fr | QuickActions minmax(0,16.5rem) ]
    ↓ gap 16px
RecentActivity (pleine largeur)
```

- Ratio chart/actions : `xl:grid-cols-[1.7fr_minmax(0,16.5rem)]`, gap `16px`
- Chart height : `280px` (sm+)

---

## 5 — Layout mobile

### Breakpoints Tailwind utilisés

| Breakpoint | px | Rôle principal |
|------------|-----|----------------|
| default | <640 | Base mobile |
| `sm` | ≥640 | Padding content, chart height, mini-KPI 4 cols |
| `md` | ≥768 | Sidebar persistante / drawer OFF, topbar sans burger |
| `lg` | ≥1024 | KPI hero 4 cols, padding content 24px |
| `xl` | ≥1280 | Chart + actions côte à côte |

### Topbar mobile (<md)

- Hauteur : **64px** (override CSS `@media max-width: 767px`)
- Burger menu à gauche → ouvre drawer sidebar
- Pas de bottom navigation (supprimée volontairement)

### Sidebar mobile = drawer overlay

| Propriété | Valeur |
|-----------|--------|
| Largeur | `min(300px, 88vw)` |
| Animation | `translate-x` 200ms ease-out |
| Backdrop | `black/40` + blur |
| z-index | backdrop 40, sidebar 50 |
| Scroll body | bloqué quand ouvert |
| Fermeture | backdrop click, Escape, navigation |
| Touch targets | liens `min-h-[2.75rem]`, texte `text-lg font-semibold`, icônes 24×24 |

### Content mobile

- Padding : `px-3 py-4` (12px / 16px)
- Inputs : `font-size: 16px !important` (anti-zoom iOS)
- KPI hero : grille **2 colonnes** (`grid-cols-2`)
- KPI mini : **2 colonnes** mobile, **4 colonnes** dès sm
- Chart + QuickActions : **empilés** (1 colonne) jusqu'à xl
- Chart height : `240px` mobile, `280px` sm+

### Empilement cards mobile

Ordre vertical strict via `.page-stack` :
1. En-tête page
2. 4 KPI hero (2×2)
3. 4 KPI mini (2×2 puis 1×4)
4. Graphique Activité (pleine largeur)
5. Actions rapides (pleine largeur)
6. Activité récente (pleine largeur)

---

## 6 — Pattern carte

### Surface standard (`surfaceCardClass`)

```
rounded-card + border border-border + bg-card + shadow-card
```

→ **1 bordure légère + 1 ombre card**. Pas de barre latérale colorée sur le dashboard.

### Variantes observées

| Composant | Bordure | Ombre | Padding | Hover |
|-----------|---------|-------|---------|-------|
| `KpiCard` hero | oui | oui (`shadow-card`) | `p-4` | transition shadow 150ms, **pas** de shadow-hover |
| `KpiCard` mini | oui | oui | `p-2` | idem |
| `SectionCard` | oui | oui | via header/body | non |
| Boutons quick-action | oui (outline) | oui + **`hover:shadow-hover`** | sm | oui |
| Tables (wrapper) | oui | oui | — | lignes : `hover:bg-accent-blue-soft/40` |

### Ce qu'il NE FAUT PAS reproduire (dashboard LanaFarm)

- Pas de barre rouge/verte à gauche sur les KPI (`border-l-*` absent du dashboard ; présent seulement dans rapports archivés et guide)
- Pas de 6 mini-KPI uniformes en grille unique : hiérarchie **4 hero + 4 mini** sur **deux rangées distinctes**
- Pas de cartes sans bordure flottant sur fond gris sans ombre

### SectionCard — sous-pattern en-tête + corps

- Header : `border-b border-border`, padding `px-4 py-3` (ou compact `px-3 py-2`)
- Titre : `font-semibold text-title` (ou `text-sm` compact)
- Body : `px-4 py-3` (ou compact `px-3 pb-2.5 pt-3`)

---

## 7 — Pattern KPI

### Où vivent les KPI

Les KPI ne sont **pas** dans un grand panneau unique. Chaque indicateur est une **carte autonome** (`KpiCard`) assemblée par `KpiGrid`.

### Hiérarchie à deux niveaux

**Rangée 1 — Hero (4 KPI opérationnels)**

- Taille `hero`, padding `p-4`, gap interne `gap-2`
- Grille : `grid-cols-2 lg:grid-cols-4`, gap `12px`
- Métriques : stock ferme, stock vente, CA, profit
- Icône en coin supérieur droit (16×16), colorée par tone

**Rangée 2 — Mini (4 KPI financiers secondaires)**

- Taille `mini`, padding `p-2`, gap `gap-1`
- Grille : `grid-cols-2 sm:grid-cols-4`, gap `8px`
- Métriques : versé, reste à verser, dépenses, casses
- Labels en `text-micro`, icônes 12×12

### Tonalité des valeurs

| Tone | Couleur valeur | Couleur icône |
|------|----------------|---------------|
| neutral | `text-foreground` | `text-accent-blue` |
| success | `text-success` | `text-success` |
| danger | `text-danger` | `text-danger` |
| warning | `text-warning` | `text-warning` |

### Sélecteur de métrique (≠ sélecteur KPI)

Le dashboard n'a **pas** de menu pour choisir quels KPI afficher. En revanche, le **graphique Activité** propose un **segmented control** dans le coin du header de section pour basculer entre Profit / CA / Dépenses / Production.

La plage temporelle globale (topbar, popover aligné à droite) filtre **tous** les KPI et le graphique.

---

## 8 — Menus et contrôles

### Popover d'angle (topbar droite)

Pattern : `Popover` Radix + `align="end"` + `shadow-modal`

| Élément | Trigger | Contenu |
|---------|---------|---------|
| `GlobalDateRange` | bouton bordure, icône calendrier | presets + custom Du/Au |
| `NotificationBell` | bouton ghost icon | panel notifications `w-80` |

PopoverContent par défaut : `rounded-card border border-border bg-card p-2 shadow-modal`, offset 8px.

### Segmented control (header de section)

Utilisé dans `ActivityChart` :

- Conteneur : `rounded-button bg-card-muted p-1`
- Boutons ghost sm avec classes `segmentToggleClass(active)`
- Actif : fond `accent-blue`, texte blanc, `shadow-sm`
- Inactif : `text-muted`, hover `bg-card`

Dimensions bouton segment : `h-7 px-3 text-label font-semibold`

### Tabs

Pas de composant Tabs Radix sur le dashboard. Navigation principale = sidebar.

### Dropdown / Menu contextuel

`Menu` (wrapper Popover) pour actions par ligne dans les modules data — `align="end"`, `w-56`, items `rounded-sm px-2.5 py-2`.

### Boutons (variantes clés dashboard)

| Variant | Apparence |
|---------|-----------|
| `accent` | bg `#1d4ed8`, texte blanc, shadow bleue légère |
| `outline` | bordure border, fond card, icône bleue |
| `ghost` | transparent, hover fond bleu soft |

Tailles : sm `h-8`, md `h-9`, lg `h-10`

---

## 9 — Ce qui rend le dashboard PRO vs générique IA

Liste concrète observée dans le code :

1. **Une seule source de tokens CSS** (`globals.css`) — pas de couleurs `#xxx` éparpillées dans les composants dashboard
2. **Palette slate + bleu profond** — pas de dégradés violet/rosa « startup IA »
3. **Un seul graphique** avec toggle métrique — pas une grille de 4 charts colorés
4. **Hiérarchie KPI double** (4 hero + 4 mini) — pas 6–8 cartes identiques en grille plate
5. **Pas de bottom nav mobile** — drawer sidebar + topbar compacte
6. **Densité maîtrisée** : `page-stack` gap 16px, padding contenu modéré, max-width 1280px centré
7. **Surfaces cohérentes** : toute carte = bordure 1px + shadow-card (pas de mélange bordered/shadowless)
8. **Pas de barre d'accent gauche** sur les KPI dashboard
9. **Typographie plancher mobile** (11px minimum) + clamp sur les chiffres KPI
10. **Plage date globale** dans la topbar — un seul filtre temporel pour tout le module
11. **Sidebar repliable** avec persistance localStorage — gain de place desktop
12. **Tables data** : hover ligne bleu soft, en-tête sur fond muted/30, pas de zebra agressif
13. **Segment control intégré au header de section** — pas un dropdown caché pour changer la métrique du chart
14. **Empty states** explicites dans le chart — pas de graphique vide sans message
15. **Zéro bruit visuel** : PageHeader minimal (titre + 1 ligne description + 2 actions max)

---

## 10 — 8 extraits CSS/TS critiques

### Extrait 1 — Tokens racine (couleurs, layout, ombres)

**Fichier :** `C:\Users\HP\LANAFARM\src\app\globals.css` (l.10–88)

```css
:root {
  --color-primary: #0f172a;
  --color-accent-blue: #1d4ed8;
  --color-background: #f8fafc;
  --color-card: #ffffff;
  --color-border: #e2e8f0;
  --color-sidebar: #1e3a8a;
  --color-sidebar-active: #1d4ed8;
  --radius-card: 12px;
  --radius-button: 10px;
  --shadow-card:
    0 1px 2px 0 rgb(15 23 42 / 0.06),
    0 4px 14px -2px rgb(15 23 42 / 0.1);
  --shadow-hover:
    0 2px 6px 0 rgb(15 23 42 / 0.08),
    0 8px 20px -4px rgb(15 23 42 / 0.14);
  --sidebar-width: 232px;
  --sidebar-width-collapsed: 64px;
  --topbar-height: 56px;
  --content-max-width: 1280px;
}
```

### Extrait 2 — Pont Tailwind v4 @theme inline

**Fichier :** `C:\Users\HP\LANAFARM\src\app\globals.css` (l.95–162)

```css
@theme inline {
  --color-accent-blue: var(--color-accent-blue);
  --color-background: var(--color-background);
  --color-card: var(--color-card);
  --color-sidebar: var(--color-sidebar);
  --font-sans: var(--font-inter, "Inter"), system-ui, -apple-system, sans-serif;
  --text-body: var(--text-body);
  --text-page: var(--text-page);
  --radius-card: var(--radius-card);
  --shadow-card: var(--shadow-card);
  --shadow-hover: var(--shadow-hover);
}
```

### Extrait 3 — Page stack + grilles contenues

**Fichier :** `C:\Users\HP\LANAFARM\src\app\globals.css` (l.275–301)

```css
.page-stack {
  display: flex;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  flex-direction: column;
  gap: 1rem;
}

.grid-contained {
  display: grid;
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.grid-contained > * {
  min-width: 0;
  max-width: 100%;
}
```

### Extrait 4 — Surface carte (token TS)

**Fichier :** `C:\Users\HP\LANAFARM\src\lib\display-tokens.ts` (l.12–14)

```typescript
export const surfaceCardClass =
  "rounded-card border border-border bg-card shadow-card" as const;
```

### Extrait 5 — Layout AppShell

**Fichier :** `C:\Users\HP\LANAFARM\src\components\layout\app-shell.tsx` (l.27–39)

```tsx
<div className="flex min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip bg-background">
  <Sidebar />
  <div className="flex min-w-0 flex-1 flex-col overflow-x-clip">
    <Topbar />
    <main className="flex-1 overflow-x-clip px-3 sm:px-4 lg:px-6 py-4 lg:py-5">
      <div className="page-stack mx-auto w-full max-w-[var(--content-max-width)]">
        {children}
      </div>
    </main>
  </div>
</div>
```

### Extrait 6 — Sidebar dimensions + drawer mobile

**Fichier :** `C:\Users\HP\LANAFARM\src\components\layout\sidebar.tsx` (l.42–53)

```tsx
<aside
  className={cn(
    "fixed inset-y-0 left-0 z-50 flex max-h-[100dvh] flex-col",
    "bg-sidebar text-sidebar-foreground shadow-sidebar",
    "transition-[width,transform] duration-200 ease-out",
    "w-[min(300px,88vw)] -translate-x-full md:translate-x-0",
    mobileOpen && "translate-x-0",
    "md:sticky md:top-0 md:h-screen",
    collapsed ? "md:w-[var(--sidebar-width-collapsed)]" : "md:w-[var(--sidebar-width)]"
  )}
>
```

### Extrait 7 — KpiCard structure

**Fichier :** `C:\Users\HP\LANAFARM\src\components\shared\kpi-card.tsx` (l.80–89)

```tsx
<div
  className={cn(
    "@container flex w-full min-w-0 max-w-full flex-col",
    isHero ? "gap-2" : isMini ? "gap-1" : "gap-2",
    surfaceCardClass,
    "transition-[box-shadow,color] duration-150",
    isHero ? "p-4" : isMini ? "p-2" : "p-3"
  )}
>
```

### Extrait 8 — Segmented control graphique Activité

**Fichier :** `C:\Users\HP\LANAFARM\src\components\dashboard\activity-chart.tsx` (l.94–111)

```tsx
<SectionHeader
  title="Activité"
  actions={
    <div className="flex flex-wrap items-center gap-1.5 rounded-button bg-card-muted p-1">
      {(Object.keys(METRICS) as MetricKey[]).map((key) => (
        <Button
          key={key}
          size="sm"
          variant="ghost"
          onClick={() => setMetric(key)}
          className={segmentToggleClass(metric === key)}
        >
          {METRICS[key].label}
        </Button>
      ))}
    </div>
  }
/>
```

---

## Annexe — Checklist reproduction TAS

Pour reproduire le look LanaFarm sans copier le code :

- [ ] Créer un `:root` identique (ou équivalent design tokens)
- [ ] Inter 500/600/700, base 14px
- [ ] AppShell flex : sidebar + (topbar + main)
- [ ] Cartes : `12px` radius, bordure `#e2e8f0`, shadow-card
- [ ] Dashboard : 4+4 KPI, 1 chart, 1 panneau actions, 1 flux activité
- [ ] Mobile : drawer sidebar, pas de tab bar basse
- [ ] Popovers topbar alignés à droite
- [ ] Segmented control dans le header du chart, pas un 2e graphique

---

*Document généré par audit read-only. LanaFarm non modifié.*
