# 15 — Information Architecture LanaFarm (audit lecture seule)

**Date :** 20 septembre 2026  
**Sources :** `C:\Users\HP\LANAFARM` (code complet). `C:\Users\HP\LANFARM` : dossier vide — aucun fichier exploitable.  
**Méthode :** lecture layouts, routes, navigation, dashboard, responsive. Zéro modification du code LanaFarm.

---

## Synthèse exécutive

LanaFarm est **une seule application Next.js** (App Router), pas un couple `app.*` / `admin.*`. Toute l’UI authentifiée vit dans le route group `(app)` sous un **`AppShell` commun**. Il n’y a **pas de sélecteur de portail / espace** : déploiement **mono-ferme** (`getPublicFarmId()` dans `src/lib/farm-id.ts`). La « cuisine » opérationnelle (profil ferme, listes, seuils) est la route **`/parametres`** — même shell, même menu, pas de back-office séparé. Le mot « admin » dans le code désigne surtout le client Supabase service role (`src/lib/supabase/admin.ts`), pas une surface UI.

---

## 1. Arborescence des routes — app vs admin

### Routes publiques

| Chemin | Fichier | Rôle |
|---|---|---|
| `/` | `src/app/page.tsx` | Redirect → `site.defaultRoute` (`/dashboard`) |
| `/login` | `src/app/login/page.tsx` | Auth (layout dédié `src/app/login/layout.tsx`) |
| `/api/auth/login`, `/api/auth/logout` | `src/app/api/auth/*/route.ts` | Session cookie `lanafarm_session` |

### Routes applicatives `(app)` — **c’est l’« app » entière**

Groupe : `src/app/(app)/` · Layout : `src/app/(app)/layout.tsx` → `FarmStoreProvider` + `AppShell`.

| Chemin réel | Page | Module racine |
|---|---|---|
| `/dashboard` | `(app)/dashboard/page.tsx` | `DashboardModule` |
| `/production` | `(app)/production/page.tsx` | `ProductionModule` |
| `/ventes` | `(app)/ventes/page.tsx` | `SalesModule` |
| `/depenses` | `(app)/depenses/page.tsx` | `ExpensesModule` |
| `/tresorerie` | `(app)/tresorerie/page.tsx` | `TresorerieModule` |
| `/rapports` | `(app)/rapports/page.tsx` | `ReportsModule` |
| `/historique` | `(app)/historique/page.tsx` | `HistoryModule` |
| `/parametres` | `(app)/parametres/page.tsx` | `SettingsModule` |
| `/guide` | `(app)/guide/page.tsx` | `GuideModule` |
| `/depots` | `(app)/depots/page.tsx` | **Redirect** → `/tresorerie` |

### API métier (backend, pas UI)

| Chemin | Fichier |
|---|---|
| `/api/farm/state` | `src/app/api/farm/state/route.ts` |
| `/api/farm/notifications` | `src/app/api/farm/notifications/route.ts` |
| `/api/farm/reports` | `src/app/api/farm/reports/route.ts` |

### « Admin » LanaFarm — ce que ce n’est **pas**

- **Pas** de sous-domaine `admin.lanafarm.*`
- **Pas** de route group `(admin)` ni layout admin séparé
- **Pas** de switch multi-tenant dans l’UI
- **`/parametres`** = configuration opérationnelle (profil, préférences, seuils, listes) — équivalent métier d’une « cuisine », mais **même AppShell** que Production ou Dashboard
- **`middleware.ts`** (racine) : garde auth globale ; redirige non-auth → `/login`, auth sur `/login` → `/dashboard`

### Garde d’accès

```ts
// middleware.ts — chemins publics : AUTH_PUBLIC_PATHS = ["/login"]
// Tout le reste exige cookie lanafarm_session valide
```

Navigation déclarée une fois : **`src/config/navigation.ts`** (`navigation`, `assistanceNavigation`, `quickActions`).

---

## 2. Comment on « ouvre un espace » (portail)

### Constat : pas de portail au sens TAS

LanaFarm **ne propose pas** de choix d’espace après login. L’utilisateur authentifié accède directement à **sa ferme unique**.

| Concept | Implémentation LanaFarm |
|---|---|
| Identité ferme | `getPublicFarmId()` — env `NEXT_PUBLIC_LANAFARM_FARM_ID` ou `"local-farm-v1"` |
| État partagé | `FarmStoreProvider` (`src/contexts/farm-store.tsx`) — productions, ventes, config, notifications |
| Ouverture module | Navigation sidebar → `router.push(href)` avec `guardNavigation` (modifs non sauvées) |
| Deep link action | Query `?action=ajouter` ou `?action=generer` — ex. `/production?action=ajouter` ouvre le dialog |

### UX d’entrée dans un « espace » (= module métier)

1. **Login** → redirect middleware vers `/dashboard`
2. **Sidebar** (`SidebarLink`) — groupes « Vue d'ensemble », « Opérations », « Pilotage », « Assistance »
3. **Recherche globale** — `GlobalSearchProvider` + `GlobalSearchDialog` (⌘K / Ctrl+K)
4. **Actions rapides dashboard** — liens vers modules avec query action
5. **Paramètres** — sous-navigation interne `SettingsNav` (4 sections), pas un autre produit

### Fichiers clés portail / navigation

| Fichier | Symbole | Rôle |
|---|---|---|
| `src/config/navigation.ts` | `navigation`, `NavGroup`, `quickActions` | SSOT menu |
| `src/components/layout/sidebar.tsx` | `Sidebar`, `SidebarLink` | Menu latéral unique |
| `src/contexts/sidebar-context.tsx` | `SidebarProvider`, `useSidebar` | Collapse desktop + drawer mobile |
| `src/contexts/unsaved-navigation-context.tsx` | `guardNavigation` | Bloque navigation si formulaire dirty |
| `src/components/search/global-search-provider.tsx` | `GlobalSearchProvider` | Palette recherche |
| `src/lib/global-search/build-index.ts` | — | Index cross-modules |

---

## 3. Dashboard home — blocs, ordre, screenshot mental

**Orchestrateur :** `DashboardModule` (`src/components/dashboard/dashboard-module.tsx`)

### Ordre vertical (top → bottom)

```
┌─────────────────────────────────────────────────────────────┐
│ PageHeader                                                   │
│  titre "Dashboard"                                           │
│  description "Vue d'ensemble · cette semaine" (DateRange)    │
│  actions: [Générer rapport] [Nouvelle saisie → production]   │
├─────────────────────────────────────────────────────────────┤
│ KpiGrid — rangée 1 (4 cartes HERO, grid 2→4 cols)           │
│  Stock ferme | Stock vente | CA période | Profit période     │
├─────────────────────────────────────────────────────────────┤
│ KpiGrid — rangée 2 (4 cartes MINI, grid 2→4 cols)           │
│  Versé | Reste à verser | Dépenses | Œufs cassés             │
├─────────────────────────────────────────────────────────────┤
│ Grid xl: [ ActivityChart ~70% ] [ QuickActions ~30% ]       │
│  (mobile: empilé — graphique puis actions)                   │
├─────────────────────────────────────────────────────────────┤
│ RecentActivity — max 4 lignes + lien "Tout voir → historique" │
└─────────────────────────────────────────────────────────────┘
```

### Détail des blocs

| # | Composant | Fichier | Contenu |
|---|---|---|---|
| 1 | `PageHeader` | `src/components/shared/page-header.tsx` | Titre + sous-titre période + 2 CTA |
| 2 | `KpiGrid` | `src/components/dashboard/kpi-grid.tsx` | 8 KPI via `KpiCard` (4 hero + 4 mini) |
| 3 | `ActivityChart` | `src/components/dashboard/activity-chart.tsx` | **1** graphique area (Recharts), toggle 4 métriques |
| 4 | `QuickActions` | `src/components/dashboard/quick-actions.tsx` | 4 saisies + lien rapport |
| 5 | `RecentActivity` | `src/components/dashboard/recent-activity.tsx` | Journal `state.actions`, limit=4 |

### Calcul des données

- **SSOT lecture :** `buildDashboardKpis()` + `buildActivityTimeline()` — `src/lib/dashboard-calc.ts`
- **Hooks plage :** `useProductionsInRange`, `useSalesInRange`, `useExpensesInRange`, `useTresorerieInRange`
- **Store :** `useFarmConfig`, `useProductionStore`, etc. — `src/contexts/farm-store.tsx`
- **Période globale :** `useDateRange()` — `src/contexts/date-range-context.tsx`

### Topbar (hors page, mais pilote le dashboard)

`Topbar` (`src/components/layout/topbar.tsx`) : burger mobile · recherche · **`GlobalDateRange`** · **`NotificationBell`**.

---

## 4. Chargement des KPI « perso » — pas de menu d’angle sur la carte

### Mécanisme réel (à ne pas confondre)

Les KPI **ne portent pas** de petit menu en coin de carte. La personnalisation temporelle est **centralisée dans la Topbar**.

| Couche | Fichier | Symbole | Comportement |
|---|---|---|---|
| Sélecteur global | `src/components/calendar/global-date-range.tsx` | `GlobalDateRange` | Popover : presets « Cette semaine », « Ce mois-ci », « Personnalisé » (Du/Au) |
| Contexte | `src/contexts/date-range-context.tsx` | `DateRangeProvider`, `useDateRange` | `presetId`, `range`, `setPreset`, `setCustomRange` |
| Presets | `src/lib/date-ranges.ts` | `dateRangePresets`, `DateRangePresetId` | Semaine (lun→dim FR), mois, custom |
| Labels KPI | `src/hooks/use-kpi-period-label.ts` | `useKpiPeriodLabel` | Appelle `kpiLabelWithPeriod()` |
| Règle labels | `src/lib/kpi-period.ts` | `kpiLabelWithPeriod`, `KpiPeriodKind` | Période **dans le titre** de la carte (« CA cette semaine »), pas sous le chiffre |
| KPI fixes | `kpi-period.ts` L59–66 | — | Stock ferme, Stock vente, Reste à verser : **jamais** suffixés par période |

### Chaîne de rendu (KpiGrid)

```tsx
// kpi-grid.tsx
const labelCa = useKpiPeriodLabel(KPI_LABEL.chiffreAffaires);        // kind "flow"
const labelRestantes = useKpiPeriodLabel(KPI_LABEL.stockFerme, "snapshot");

<KpiCard label={labelCa} amount={kpis.chiffreAffaires} size="hero" />
```

### Composant carte — `KpiCard`

**Fichier :** `src/components/shared/kpi-card.tsx`  
**Symboles :** `KpiCard`, `KpiCardProps`, `AdaptiveMetric`  
**Tailles :** `hero` | `compact` | `mini` — pas de dropdown, pas de menu contextuel.  
**Coin carte :** icône Lucide colorée selon `tone`, pas un sélecteur.

### Seul « toggle » sur une grande carte = graphique Activité

`ActivityChart` (`activity-chart.tsx` L97–110) : segment buttons `profit | ca | depenses | production` dans le **header** du graphique (`SectionHeader.actions`), pas sur les KPI cards.

### Sous-titre page

`moduleOverviewSubtitle(presetId, range)` — ex. « Vue d'ensemble · ce mois-ci » dans `PageHeader.description`.

---

## 5. Mobile — composants exacts

LanaFarm a **volontairement supprimé** une bottom nav (`AppShell` commentaire L18 : « plus de barre de navigation mobile en bas »).

| Composant | Fichier | Pattern mobile |
|---|---|---|
| `AppShell` | `src/components/layout/app-shell.tsx` | Flex : sidebar + colonne (topbar + main). Padding main `px-3 sm:px-4 lg:px-6` |
| `Sidebar` | `src/components/layout/sidebar.tsx` | `<md` : drawer fixe `w-[min(300px,88vw)]`, backdrop, slide `-translate-x-full` → `translate-x-0` |
| `SidebarProvider` | `src/contexts/sidebar-context.tsx` | `mobileOpen`, `openMobile`, `closeMobile`, Escape, body scroll lock |
| `Topbar` | `src/components/layout/topbar.tsx` | Burger `Button md:hidden` → `openMobile()` |
| `GlobalSearchTrigger` | `src/components/search/global-search-provider.tsx` | Variante `mobile` : barre pleine largeur `sm:hidden` ; desktop `hidden sm:flex` |
| `GlobalDateRange` | `src/components/calendar/global-date-range.tsx` | Popover `align="end"`, largeur `min(100vw-1.5rem, 18rem)` |
| `NotificationBell` | `src/components/notifications/notification-bell.tsx` | Popover 320px, badge unread |
| `MobileKeyboardFix` | `src/components/layout/mobile-keyboard-fix.tsx` | `--vvh` via `visualViewport`, reset scroll après clavier |
| `KpiGrid` | `src/components/dashboard/kpi-grid.tsx` | Hero `grid-cols-2 lg:grid-cols-4` ; mini `grid-cols-2 sm:grid-cols-4` |
| `ActivityChart` | `activity-chart.tsx` | Hauteur `h-[240px] sm:h-[280px]` ; toggle métriques `flex-wrap` |
| `SettingsNav` | `src/components/settings/settings-nav.tsx` | Desktop : nav verticale `hidden md:block` ; mobile : **pills scrollables** `md:hidden` |
| `PageHeader` | `src/components/shared/page-header.tsx` | Colonne mobile → row `sm:flex-row` |
| Root viewport | `src/app/layout.tsx` | `interactiveWidget: "resizes-content"` (clavier Android) |

### Breakpoint pivot

- **`md` (768px)** : sidebar persistante vs drawer ; burger caché ; menu desktop repliable (`collapsed` → 64px).

---

## 6. Ce qu’il NE FAUT PAS faire — et comment LanaFarm l’évite

### Anti-pattern visé : « mur de dashboard »

Grille 6 KPI + 4 graphes côte à côte + bandeaux alertes rouges = bruit, fausse précision, scroll infini.

### Contre-mesures LanaFarm (avec preuves fichiers)

| Anti-pattern | Évitement LanaFarm |
|---|---|
| 6+ KPI same size | **Hiérarchie 4+4** : hero (`size="hero"`) puis mini (`size="mini"`) — `kpi-grid.tsx` |
| 4 graphiques simultanés | **1 seul** `ActivityChart` ; 4 séries via toggle segment, une visible — `activity-chart.tsx` |
| Alertes rouges partout | Pas de bannière alerte sur dashboard ; seuils configurés dans **`SectionSeuils`** (`parametres`), notifications via **`NotificationBell`** popover — pas de flood visuel |
| Période par carte | **Un** calendrier global topbar — évite 8 sélecteurs redondants |
| KPI décoratifs | `buildDashboardKpis()` réutilise `kpi-sources.ts` — même logique que modules Production/Ventes |
| Bottom nav + sidebar | **Une** sidebar, 3 états (desktop expanded/collapsed, mobile drawer) — pas de double navigation |
| Dashboard = rapport | Rapports isolés dans `/rapports` (`ReportsModule`) ; dashboard = opérationnel + 4 activités récentes |
| Empty chart bruyant | `EmptyState` sobre si pas de données — pas de fausses courbes |

### Tonalité visuelle des « alertes »

- KPI négatifs : `tone="danger"` sur **valeur** (profit, cassés), pas bandeau page entière
- `montantEnAttente` : `warning` si > 0, pas rouge systématique — `kpi-grid.tsx` L28–33

---

## 7. Mapping TAS — `app.tas.*` vs `admin.tas.*`

### État TAS actuel (référence)

- Site public : `app/` (/, /programs, /apply…)
- Prototype interne : `app/os/*` — tout sous `/os`, rôles filtrés menu client (`Shell.tsx`, `nav.ts`)
- Portails déjà amorcés : `/os/portal/student`, `/os/portal/teacher`
- Audit 13 : FAIL — trop de Phase C dans le menu, pas de split app/admin, KPI incohérents

### Proposition d’architecture cible (1 page de reco)

#### Principe emprunté à LanaFarm

| Pattern LanaFarm | Application TAS |
|---|---|
| SSOT navigation (`navigation.ts`) | `src/config/navigation-app.ts` + `navigation-admin.ts` |
| Un calendrier / filtre global | Contexte période ou année scolaire en topbar APP ops |
| Dashboard = 4 KPI hero + 4 mini + 1 graph + actions + activité | Portail prof/admissions : même densité, pas 12 tuiles |
| Paramètres = cuisine opérationnelle same shell | **Admin** : config école, pas mélangée aux portails |
| Middleware auth simple | Middleware par hostname + rôle |

#### Découpage recommandé

```
┌──────────────────────────────────────────────────────────────────┐
│  tas-institut.com (site public — Phase A, CMS)                   │
│  Pages marketing, programmes, candidature publique /apply          │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  app.tas-institut.com — APP (portails, LanaFarm-like shell)      │
├──────────────────────────────────────────────────────────────────┤
│  /login                                                          │
│  /etudiant/*     → portail étudiant (dossier, notes, docs)       │
│  /prof/*         → portail enseignant (groupes, présences)       │
│  /admissions/*   → portail admissions (pipeline, dossiers)       │
│  Layout : AppShell partagé, nav filtrée par rôle (comme Sidebar  │
│  + canAccess), PAS de finance/CRM/caméras pour étudiant          │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  admin.tas-institut.com — ADMIN (cuisine)                        │
├──────────────────────────────────────────────────────────────────┤
│  /dashboard      → KPI direction (source unique DB, pas RNG)     │
│  /cms/*          → contenu site public (programmes, pages)       │
│  /ecoles/*       → campus, sessions, programmes                  │
│  /utilisateurs/* → comptes, rôles                                │
│  /integrations/* → dynamisation app (notifications, seuils)      │
│  /rapports/*     → exports                                       │
│  Même patterns UI LanaFarm : PageHeader, KpiGrid hiérarchique,   │
│  SettingsNav pour sous-sections admin                            │
└──────────────────────────────────────────────────────────────────┘
```

#### Table de correspondance routes

| LanaFarm (mono-app) | TAS APP (`app.*`) | TAS ADMIN (`admin.*`) |
|---|---|---|
| `/dashboard` | `/etudiant` home, `/prof` home, `/admissions` home (3 dashboards légers) | `/dashboard` direction |
| `/production`, `/ventes`… | Modules métier par rôle | — |
| `/parametres` | Profil utilisateur minimal | `/ecoles`, `/cms`, `/integrations` |
| `/rapports` | Exports limités au scope rôle | `/rapports` global |
| `/guide` | Aide contextuelle portail | Doc admin interne |
| `middleware.ts` cookie | Auth portail + rôle | Auth staff + RBAC serveur |
| `FarmStoreProvider` | Stores par domaine (student, teacher…) | CMS + config école |

#### Règles non négociables (leçons audit 13 + LanaFarm)

1. **Séparer hostname** avant d’empiler 30 entrées menu dans `/os`
2. **Un KPI = une requête** — jamais 3 générateurs RNG (erreur TAS actuelle)
3. **Dashboard portail** : max 8 KPI hiérarchisés + 1 graph toggle + actions + 4 activités — copier `dashboard-module.tsx`, pas `CEO_KPIS` + 4 charts
4. **Alertes** : cloche + config seuils admin, pas bandeaux rouges sur chaque portail
5. **Mobile** : drawer sidebar LanaFarm, pas bottom nav 5 icônes + sidebar 40 liens (double nav TAS actuelle)
6. **Portail ≠ back-office** : message explicite comme `portal/student/page.tsx` TAS — séparation physique `app.*` / `admin.*`

#### Migration progressive depuis `/os`

| Étape | Action |
|---|---|
| 1 | Extraire `nav.ts` → deux SSOT ; garder composants Shell/KpiCard compatibles |
| 2 | Déplacer `/os/portal/*` → `app.tas/etudiant`, `app.tas/prof` |
| 3 | Déplacer CRM, finance, marketing, CMS → `admin.tas/*` |
| 4 | Middleware : `Host` header → layout root ; 403 serveur, pas `router.replace` client seul |
| 5 | Remplacer `_data/*.ts` RNG par vues Supabase — pattern `buildDashboardKpis` LanaFarm |

---

## Annexe — index fichiers cités

| Domaine | Chemins absolus |
|---|---|
| Routes | `C:\Users\HP\LANAFARM\src\app\(app)\*\page.tsx` |
| Layout app | `C:\Users\HP\LANAFARM\src\app\(app)\layout.tsx` |
| Shell | `C:\Users\HP\LANAFARM\src\components\layout\app-shell.tsx` |
| Nav SSOT | `C:\Users\HP\LANAFARM\src\config\navigation.ts` |
| Dashboard | `C:\Users\HP\LANAFARM\src\components\dashboard\dashboard-module.tsx` |
| KPI | `C:\Users\HP\LANAFARM\src\components\dashboard\kpi-grid.tsx`, `kpi-card.tsx` |
| Période | `C:\Users\HP\LANAFARM\src\components\calendar\global-date-range.tsx` |
| Auth | `C:\Users\HP\LANAFARM\middleware.ts` |
| Paramètres | `C:\Users\HP\LANAFARM\src\components\settings\settings-module.tsx` |

---

*Document généré par audit lecture seule — aucune modification du dépôt LanaFarm.*
