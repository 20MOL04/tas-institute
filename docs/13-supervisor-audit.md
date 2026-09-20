# 13 — Audit superviseur (staff, zéro tolérance)

**Date :** 20 septembre 2026  
**Périmètre lu :** `app/` (site public), `app/os/` (Digital OS), `docs/`, `sources/spec-uiux-master.txt`, `sources/vision-master-brief.txt`, `CAHIER-DES-CHARGES.md`  
**Méthode :** lecture et grep des fichiers. Aucun écran inventé. Si une route du menu n’a pas de `page.tsx`, elle est marquée **GAP**.  
**Code applicatif :** non modifié.

---

## Verdict global : **FAIL**

Pas CONDITIONNEL. Un fondateur qui clique trois fois demain matin voit des millions différents, un menu qui 404, et un « moindre privilège » qui se contourne en collant une URL. Ce n’est pas un OS école. C’est un décor de dashboard avec des générateurs RNG indépendants collés derrière une sidebar.

Le commentaire de `app/os/_data/index.ts` (l.4–7) affirme que *« the totals on the CEO dashboard match the rows in the tables underneath »*. C’est faux. Vérifié.

Le MASTER (`sources/spec-uiux-master.txt` §39–56, §67–69) demandait : Phase A site public, Phase B 11 écrans admin *utilisables*, Phase C (portails, finance avancée, CRM, IA) **après validation**. Le prototype a inversé l’ordre : il a vendu Phase C dans le menu avant d’avoir une seule source de vérité chiffrée.

---

## Top 15 défauts

### P0-1 — Trois univers de revenu. Le fondateur voit trois « vérités ».

**Fichiers :** `app/os/_data/ops.ts` l.32–64 · `app/os/_data/growth.ts` l.31–57, 90–98 · `app/os/_data/index.ts` l.66–73 · `app/os/page.tsx` l.38–90 · `app/os/finance/page.tsx` l.19–27 · `app/os/marketing/page.tsx` l.25–61

**Pourquoi c’est inacceptable :**  
- `CEO_KPIS.revenue` = `REVENUE_TOTAL` = somme des 180 `PAYMENTS` RNG.  
- `TRAFFIC_TOTALS.revenue` = somme `SOURCES[i].enrollments × ARPU inventé` = **157 290 000 CFA**.  
- `MONTHLY.revenue` = `round((31 × saison + i×0,7) × 398 000)` — troisième générateur.  
Le KPI CEO « Revenu encaissé (12 mois) » et le classement « Sources classées par revenu » sur **le même écran** (`page.tsx` l.38 et l.87–90) ne viennent pas de la même addition. L’écran Finance le dit en petit (`finance/page.tsx` l.70) ; le centre de commandement, non.

**Correctif exact :** Une seule fonction `revenueOf(period)` qui somme `PAYMENTS` filtrés. `SOURCES.revenue` = somme des paiements des étudiants dont `student.source === source`. `MONTHLY.revenue[i]` = somme des paiements du mois `i`. `CEO_KPIS[revenue].raw` = cette somme. Interdire tout `enrollments * 380000` hardcodé. Si l’attribution marketing doit rester distincte, l’étiquette CEO ne peut plus dire « encaissé ».

---

### P0-2 — Volumes d’acquisition incohérents entre KPI, funnel, CRM et dossiers.

**Fichiers :** `app/os/_data/growth.ts` l.31–81, 221, 280 · `app/os/_data/index.ts` l.75–90 · `app/os/_data/people.ts` l.132 · `app/os/crm/page.tsx` l.12–15 · `app/os/applications/page.tsx` l.61–63

**Chiffres lus dans le code (pas estimés) :**

| Notion | Où | Valeur |
|---|---|---|
| Leads 12 mois | `TRAFFIC_TOTALS.leads` (somme `SOURCES`) | **1 568** |
| Leads nominatifs | `LEADS.length` | **96** |
| Candidatures funnel | `TRAFFIC_TOTALS.applications` | **638** |
| Candidatures nominatives | `APPLICATIONS.length` | **64** |
| Inscriptions funnel | `TRAFFIC_TOTALS.enrollments` | **386** |
| Dossiers étudiants | `STUDENTS.length` | **132** |
| Effectif déclaré des groupes | `GROUPS.reduce(students)` | **113** |
| Conversion CEO | `386 / 1568` | **24,6 %** |
| Conversion CRM | `(enrolled+paid) / 96` | autre % |

`FUNNEL` l.78–80 : `approved: 462` et `paid: 331` sont des littéraux. Ils ne dérivent ni de `APPLICATIONS` ni de `PAYMENTS`.

**Correctif exact :** `LEADS` / `APPLICATIONS` / `STUDENTS` deviennent les tables, pas des échantillons décoratifs. `TRAFFIC_TOTALS` = `reduce` de ces tables (ou `SOURCES` dérivé des mêmes lignes). `FUNNEL.approved` = `APPLICATIONS.filter(approved|enrolled).length`. `FUNNEL.paid` = étudiants `paymentStatus !== 'unpaid'` ou paiements distincts `studentId`. Un KPI, une `COUNT`.

---

### P0-3 — Moindre privilège = filtre de menu + `router.replace` client. Un teacher voit la finance.

**Fichiers :** `app/os/_components/Shell.tsx` l.16–43 · `app/os/_components/nav.ts` l.46–56 · `app/os/page.tsx` l.37–90 · `app/os/finance/page.tsx` (Server Component, **zéro** check rôle) · aucun `middleware.ts` dans le repo

**Ce qui existe :** `canAccess()` cache les liens. Un `useEffect` redirige vers `/os` si le rôle n’a pas le droit. Le menu teacher ne montre pas `/os/finance`.

**Ce qui ne tient pas :**

1. **Le teacher a le droit d’ouvrir `/os`** (`Shell.tsx` l.18–24). `/os` affiche `CEO_KPIS` dont le revenu, l’outstanding, le funnel, et `SOURCES_BY_REVENUE`. Moindre privilège violé **sans URL finance**.  
2. `/os/finance` est un Server Component : le HTML RSC contient **tous** les paiements **avant** l’effet client. Coller `/os/finance` en rôle teacher = fuite, puis redirect.  
3. `scopedStudents` n’est appelé que dans `StudentsTable.tsx`. Finance, CRM, Reports, Schools, Grades, Attendance, Documents : dump global.  
4. Le teacher demo n’a pas de `teacherId` (`core.ts` `OS_USERS` l.290). `StudentsTable.tsx` l.44–45 prend `TEACHERS.find(t => t.campusId === user.campusId)` — le premier d’Alajo, pas « cet » enseignant.  
5. Le tiroir notifications (`Shell.tsx` l.152–162) liste finance, caméras, crédits IA pour tous les rôles.

**Correctif exact :**  
- Middleware (ou layout serveur) : table `role → href[]`. 403, pas un flash.  
- `/os` : composer les KPI **après** le rôle (`useOs` côté serveur via cookie/query). Teacher : présences de ses groupes, pas le P&L.  
- Relier `u-tea` → `t-01` (ou équivalent) dans `OS_USERS`.  
- Filtrer `NOTIFICATIONS` par rôle.  
- Tant que ce n’est pas fait : retirer « Revenu » et « Sources par revenu » du dashboard teacher, pas les cacher dans la sidebar.

---

### P0-4 — Rôle étudiant : boucle infinie de redirection.

**Fichiers :** `app/os/_components/Shell.tsx` l.16–17, 37–43 · `app/os/_components/nav.ts` l.46 (le rôle `student` n’est **pas** dans `ALL`) · **GAP** `app/os/portal/student/` (aucun fichier)

`canAccess` pour `student` : uniquement `href.startsWith("/os/portal/student")`.  
`/os` n’est pas autorisé. Le `useEffect` fait `router.replace("/os")` — la page interdite. Boucle.

Le portail étudiant est dans le menu (`nav.ts` l.114) et **n’existe pas**.

**Correctif exact :** Si `role === "student"` → `replace("/os/portal/student")` **après** avoir créé cette page (notes, présence, solde, documents — **les siens**). En attendant : retirer le rôle « Étudiant » du `<select>` `OS_USERS`. Un sélecteur qui crash n’est pas une démo de rôles.

---

### P0-5 — Le menu vend un OS. Quatre familles d’écrans sont du 404.

**Fichiers :** `app/os/_components/nav.ts` l.52–117

**GAP confirmés** (aucun `page.tsx` au moment de l’audit) :

| Route menu | Statut |
|---|---|
| `/os/training` | GAP |
| `/os/security` | GAP |
| `/os/settings` | GAP |
| `/os/portal/student` | GAP |
| `/os/portal/teacher` | GAP |

La recherche topbar (`Shell.tsx` l.112–116) est `aria-hidden="true"` : décor. Le commentaire de `nav.ts` l.3–6 promet qu’un écran n’existe jamais sans chemin. C’est l’inverse : des chemins existent sans écran.

**Correctif exact :** Supprimer du `NAV` toute entrée sans `page.tsx`. Réintroduire uniquement avec une page qui a : titre, 3 KPI dérivés de la SSOT, un tableau filtrable, un empty state, un refus de rôle. Ne pas laisser « Sécurité / caméras » dans une démo fondateur — c’est du théâtre (et `ops.ts` l.176 le dit déjà : *nothing connected*).

---

### P1-6 — Spark « étudiants actifs » et KPI « étudiants actifs » se contredisent.

**Fichiers :** `app/os/_data/growth.ts` l.97 · `app/os/_data/index.ts` l.38–46 · `app/os/_data/people.ts` l.179

`CEO_KPIS.students.value` = `ACTIVE_STUDENTS.length` (filtre `status === "active"` sur 132 dossiers).  
`CEO_KPIS.students.spark` = `MONTHLY.students` = `168 + round(i × 7,4 + saison × 6)` → **dernier point = 255**.

La courbe dit que l’école a ~250 actifs ; le gros chiffre au-dessus dit ~100. Un CEO lit les deux en 3 secondes.

**Correctif exact :** Spark = historique **dérivé du même filtre** `status === "active"` (même si c’est une série fictive, elle doit finir sur `ACTIVE_STUDENTS.length`). Interdiction de partir d’un `168` magique.

---

### P1-7 — Occupation groupes ≠ registre étudiants.

**Fichiers :** `app/os/_data/core.ts` l.250–258 · `app/os/_data/people.ts` l.139 · `app/os/groups/page.tsx` l.4–31

`GROUPS[i].students` est une constante (17, 16, 15… total **113**).  
Chaque `STUDENT` tire un groupe au RNG (`people.ts` l.139). Les comptes réels par `groupId` ne matchent pas. L’écran Groupes affiche `g.students/g.capacity` comme occupation « réelle » (`groups/page.tsx` l.48, 94).

**Correctif exact :** `g.students` n’existe plus comme champ saisi. `students: STUDENTS.filter(s => s.groupId === g.id && s.status === "active").length`. Recalculer `full` et le KPI occupation là-dessus.

---

### P1-8 — Notes : distribution décorative + classement nominatif des étudiants.

**Fichiers :** `app/os/_data/people.ts` l.210–217 · `app/os/grades/page.tsx` l.10–13, 59–70, 80–114

`GRADE_DISTRIBUTION` : 6+14+31+38+25+11 = **125**, hardcodé, pas un histogramme de `averageGrade`. L’écran le reconnaît (`grades/page.tsx` l.118) au lieu de le corriger.

La page affiche une alerte « ne pas classer les enseignants » puis trie **tous les actifs par moyenne nominative**. Le MASTER et `docs/06` §13 interdisent ce genre de tableau de honte.

**Correctif exact :** `GRADE_DISTRIBUTION` = buckets sur `ACTIVE_STUDENTS.map(averageGrade)`. Retirer le tableau nominatif trié. Garder la distribution anonyme + un lien « ouvrir le dossier » depuis la liste étudiants, pas un classement.

---

### P1-9 — Campagnes et SOCIAL ne recollent pas sur SOURCES.

**Fichiers :** `app/os/_data/growth.ts` l.31–43, 121–138 · `app/os/marketing/campaigns/page.tsx` l.11–13 · `app/os/marketing/page.tsx` l.130–146

Exemples lus : Facebook `SOURCES.enrollments = 41` vs `SOCIAL.enrollments = 26` vs campagnes Facebook `26 + 8`. Dépense campagnes = **4 040 000** ; `TRAFFIC_TOTALS.spend` = **5 870 000**.

**Correctif exact :** `SOCIAL` et totaux campagnes = agrégats de `CAMPAIGNS` + organic rows, et `SOURCES[channel].spend` = `sum(campaigns where channel)`. Une ligne Facebook, un spend, un enroll.

---

### P1-10 — Site public : nav desktop amputée + i18n introuvable.

**Fichiers :** `app/components/Header.tsx` l.11–25, 64–77 · `app/components/Footer.tsx` l.87–93 · `app/design-system.css` l.893–894, 1056–1070

Desktop : 5 liens (`/`, `/programs`, `/accommodation`, `/about`, `/contact`).  
`NAV_MORE` (orientation, teachers, stories, gallery, resources) **uniquement dans le tiroir mobile** (`Header.tsx` l.146–160). Au-delà de 900px le hamburger est `display: none`. Ces pages n’existent dans le header que si on scrolle le footer.

Langue : toggle **uniquement footer**. Pas dans le header. `layout.tsx` l.33 force `<html lang="fr">` ; le provider corrige en client (`LangProvider.tsx` l.33–35). Metadata `layout.tsx` l.22–28 toujours en anglais.

**Correctif exact :** Header desktop : primaire + dropdown « Plus » (même `NAV_MORE`) + toggle FR/EN. Metadata via `lang`. Ne pas cacher 5 pages institutionnelles derrière le copyright.

---

### P1-11 — Invention IELTS / « Business English » sur la home FR.

**Fichiers :** `app/i18n.ts` l.119–120 · miroir EN l.802 · `app/i18n.ts` l.478 (teacher placeholder « IELTS ») · `app/lib/kpi.ts` (les 3 cours officiels : intensif 8h, long 5h, info 3h)

Le MASTER §9 et `i18n.ts` l.6–9 : ne jamais inventer un programme. L’école publie trois cours. « préparation IELTS et plus encore » est une offre fantôme sur la première section programmes.

**Correctif exact :** Remplacer par les trois cours de `TAS_KPIS` / pages Programmes. Retirer IELTS des bios teachers tant que ce n’est pas un fait école. Les cards teachers ont déjà `placeholder-note` — ne pas y glisser une certif inventée.

---

### P1-12 — Notifications et alertes hardcodées, pas branchées sur les comptes.

**Fichiers :** `app/os/_data/ops.ts` l.125–135 · `app/os/_data/index.ts` l.153–188

`n-02` : « 9 étudiants avec un solde impayé » / « 2,1M CFA » — littéral.  
`ALERTS` al-04 TikTok « 9 240 visites, 9 inscriptions » : **coïncide** avec `SOURCES` TikTok (le seul qui matche).  
`n-01` « 12 candidatures » vs `APPLICATIONS` status `reviewing` : non dérivé.

**Correctif exact :** Chaque notif = template + `COUNT` live (`unpaid.length`, `OUTSTANDING_TOTAL`, `applicationsByStatus("reviewing").length`). Si le compte change, le texte change.

---

### P1-13 — Docs 01–04 et 07–12 absents. 05 et 06 référencent des fichiers morts.

**Constat :** `docs/` ne contient que `05-database-schema.md` et `06-kpi-dictionary.md` (plus ce fichier 13).

`06-kpi-dictionary.md` l.11 et l.401–404 pointe vers `07-traffic-attribution.md` et `05` §23.1.  
`05-database-schema.md` pointe vers `08-ai-architecture.md` (l.1400 du schéma). Ces fichiers n’existent pas.

**05 et 06 sont de la vraie modélisation** (faits vs hypothèses marqués). Ça ne sauve pas un dossier docs tronqué : un nouvel arrivant croit à une série 01–12.

**Correctif exact :** Soit écrire 01 (vision / faits école), 02 (parcours utilisateur), 03 (IA), 04 (permissions), 07 (attribution), 08 (IA archi) en 1–2 pages chacun **sans inventer de chiffres**, soit renommer 05/06 en 01/02 et casser les liens morts. Ne pas laisser une numérotation qui ment.

---

### P2-14 — Deux design systems, hex en dur dans les charts, gradient interdit par le commentaire.

**Fichiers :** `app/design-system.css` (tokens `--tas-*`) · `app/os/os.css` l.1–7 (« no gradients ») vs l.857 `linear-gradient(90deg, var(--os-blue), #4a8bff)` · `app/os/_components/ui.tsx` l.257 `["#0b63f6", …]` · `app/os/page.tsx` l.52–53, 138

Le public a une palette. L’OS recopie des hex proches puis les hardcode dans les SVG. `student-stories-content.tsx` l.65 : `color: "#455061"`.

**Correctif exact :** Charts : `stroke="var(--os-blue)"` etc. Une seule échelle de tokens. Supprimer le gradient l.857 ou le commentaire l.6 — pas les deux.

---

### P2-15 — Conversion publique inachevée + légal mort + tables OS = scroll horizontal.

**Fichiers :** `app/programs/programs-content.tsx` l.39–57 (cards **sans** `href` vers `/programs/general-english`) · `app/programs/[slug]/page.tsx` l.9 (`POPULATED_SLUGS = ["general-english"]`) · `app/components/Footer.tsx` l.83–84 `href="#"` · `app/apply/apply-content.tsx` l.67 `"invalid format"` en anglais dans le flux FR · `app/os/os.css` `.os-table-wrap { overflow-x: auto }` — 9–10 colonnes (`StudentsTable`, `sources`, `campaigns`, `attendance`)

**Correctif exact :** Card programme intensif → `/programs/general-english`. Pages légales stub ou retirer les liens. Message apply via `t.apply.emailInvalid`. Tables OS > 6 colonnes : cards empilées sous 768px, pas un tableau à glisser.

---

## Matrice des écrans

Légende densité démo : **haute** = on peut raconter une décision 2 min · **moyenne** = tableau + KPI · **faible** = coquille · **théâtre** = figé / disabled · **GAP** = pas de `page.tsx`.

« Données cohérentes » = le chiffre de cet écran = le même concept ailleurs. Non = FAIL local.

### Site public

| Route | Existe | Densité démo | Données cohérentes | Mobile | Notes |
|---|---|---|---|---|---|
| `/` | oui | haute | partielle | oui (hamburger <900px) | Trust SVG ok. IELTS inventé. Copy FR/EN dupliquée hors `i18n` (`home-content.tsx`). Cards programmes → `/programs`, pas le détail. |
| `/about` | oui | moyenne | oui (qualitatif) | oui | Pas de stats inventées. Correct. |
| `/programs` | oui | moyenne | oui (3 cours) | oui | **Aucun lien** vers le détail. Tableau comparatif : overflow-x. |
| `/programs/general-english` | oui | haute | oui | oui | Seul détail. Checks SVG `IconCheck`. Autres slugs → 404. |
| `/accommodation` | oui | haute | **oui** | oui | SSOT `lib/rooms.ts` (130k/100k/60k). Checks SVG. Map `LocationCard`. |
| `/university-guidance` | oui | faible | oui (TO CONFIRM partenariats) | oui | Absent du header desktop. |
| `/teachers` | oui | moyenne | honnête | oui | 3 cards + `placeholder-note`. Pas les 18. IELTS dans une bio. |
| `/student-stories` | oui | moyenne | honnête | oui | Exemples labellisés. Hex hardcodé. |
| `/gallery` | oui | faible | n/a | oui | Grid. Pas de lightbox spec. |
| `/apply` | oui | haute | n/a (pas de backend) | oui | Stepper réel, demoNote. Submit client-only. Erreur email EN. |
| `/contact` | oui | haute | oui | oui | Map embed + WhatsApp. |
| `/resources` | oui | faible | n/a | oui | Articles placeholder. Absent header desktop. |
| 404 | oui | — | — | oui | i18n. OS 404 tombe dans le chrome public (pas un 404 OS). |

### Digital OS

| Route | Existe | Densité démo | Données cohérentes | Mobile | Notes |
|---|---|---|---|---|---|
| `/os` | oui | haute **piégée** | **NON** | KPI 2 col / table scroll | Le seul écran « wow ». Totaux vs sources vs spark : FAIL. Teacher y voit la finance. |
| `/os/schools` | oui | moyenne | partielle | table scroll | ABLA fictive marquée. Revenu = `PAYMENTS` (ok localement). |
| `/os/reports` | oui | moyenne | **NON** | 2 col → 1 | Boutons « Aperçu — pas un PDF » disabled. Mélange `MONTHLY` et `APPLICATIONS` 64. |
| `/os/crm` | oui | haute | **NON** vs funnel | kanban + table | 96 leads. Conversion ≠ CEO. Empty states : oui. |
| `/os/applications` | oui | moyenne | **NON** vs 638 | table | 64 dossiers. Détail `[id]` existe. |
| `/os/applications/[id]` | oui | moyenne | locale | ok | Timeline. Pas de garde rôle serveur. |
| `/os/intakes` | oui | moyenne | **NON** vs STUDENTS | ok | `enrolled` constants. Somme 132 par hasard ≠ affectation groupes. |
| `/os/students` | oui | haute | KPI = `STUDENTS` | table 10 col | KPI **globaux** même si table scoped. Teacher : route interdite (OPS). |
| `/os/students/[id]` | oui | haute | locale | tabs | Onglet paiements sans check finance. `generateStaticParams` 132 ids. |
| `/os/groups` | oui | moyenne | **NON** vs STUDENTS | table | Effectif déclaré ≠ filtre réel. |
| `/os/attendance` | oui | moyenne | ≠ spark CEO | table 14j×8 | `ATTENDANCE_TREND` sinus (`index.ts` l.131–134) ≠ ces séances. Teacher autorisé. |
| `/os/grades` | oui | moyenne | **NON** (125 vs 132) | classement long | Alerte anti-classement + classement nominatif. Teacher autorisé. |
| `/os/teachers` | oui | moyenne | 18 = fait école | table | Noms fictifs ok. 8 groupes, donc ~10 teachers « sans affectation » — artefact GROUPS trop court. |
| `/os/finance` | oui | haute | **NON** vs SOURCES | table 40 lignes | Empty state filtre : oui. Pas de garde serveur. |
| `/os/documents` | oui | faible | n/a | ok | 48 pièces RNG. |
| `/os/marketing` | oui | haute | **NON** vs campagnes | table SOCIAL | Bon discours anti-vanité. Mauvais chiffres. |
| `/os/marketing/sources` | oui | haute | interne SOURCES **oui** | 9 col scroll | Le meilleur écran produit. Totaux pied de table = `TRAFFIC_TOTALS`. |
| `/os/marketing/campaigns` | oui | moyenne | **NON** vs SOURCES | 10 col | UTM affichés : bien. Totaux : pas la même dépense. |
| `/os/marketing/content` | oui | faible | n/a | ok | 7 lignes calendrier. |
| `/os/ai` | oui | théâtre | n/a | ok | Chat figé, input disabled. Filtre actions par rôle (UI). Foot : « pas serveur ». |
| `/os/ai/knowledge` | oui | faible | n/a | ok | Liste docs fictifs. |
| `/os/ai/credits` | oui | faible | interne 230/1250 | ok | Grille packs = hypothèse (marquée dans `ops.ts`). |
| `/os/training` | **GAP** | — | — | — | Dans le menu ALL. |
| `/os/security` | **GAP** | — | — | — | Caméras dans `ops.ts` mais pas d’écran. |
| `/os/settings` | **GAP** | — | — | — | Rôles = un `<select>` topbar. |
| `/os/portal/student` | **GAP** | — | — | — | Crash student (P0-4). |
| `/os/portal/teacher` | **GAP** | — | — | — | Menu ALL. |

---

## Cinq choses réellement bonnes

1. **Bannière de démo et distinction TAS vs ABLA.** `DemoBanner` + `isReal` sur les écoles. Le prototype dit qu’il est fictif. Rare, et correct.  
2. **SSOT logement public.** `app/lib/rooms.ts` : 130 000 / 100 000 / 60 000 CFA, inclus listés, `IconCheck` SVG, home et `/accommodation` lisent la même constante.  
3. **Carte et contact.** `LocationCard` + `lib/contact.ts` (Polo Junction, tel, WhatsApp, embed sans clé API). Un visiteur peut venir.  
4. **Écran Sources.** Discours juste (TikTok volume vs bouche-à-oreille revenu), totaux de pied de table = `reduce(SOURCES)`, signal vanité/valeur. C’est de la pensée produit. Les autres écrans n’ont pas suivi cette discipline.  
5. **Docs 05 et 06.** Modélisation réelle, faits école vs hypothèses, refus des KPI de vanité, §13 enseignants. Qualité staff. Le reste de `docs/` n’existe pas.

Si on enlève 4 : le reste du OS ne mérite pas « rien », mais 4 est le seul écran interne que je montrerais sans grogner — et seulement si on n’ouvre pas Finance juste après.

---

## Théâtre vs utilisable demain matin (fondateur)

**Montrable (script fermé, 12 minutes, ne pas sortir du sentier) :**

- Site : home → programmes → hébergement (prix) → apply stepper → WhatsApp.  
- OS **uniquement** `/os/marketing/sources` + disclaimer « données fictives, un seul tableau ».  
- Changer de rôle **director → finance** pour montrer que le **menu** se filtre. Ne pas coller d’URL. Ne pas choisir Étudiant.

**Ne pas ouvrir :** `/os` (totaux vs sources), `/os/crm` après le funnel, `/os/finance` après le marketing, `/os/grades`, caméras, IA « conversation », portails, Rapports (boutons morts).

**Verdict démo :** vendable comme *maquette de direction d’art + une thèse d’attribution*. Pas vendable comme *OS que l’école pourrait utiliser lundi*. Le cahier (`CAHIER-DES-CHARGES.md` l.15–20) l’avait déjà dit : 24 écrans CEO-level en 48h = mensonge. L’équipe a quand même empilé 20 routes OS sur des RNG non liés.

---

## Docs 01–12

| Fichier | Statut |
|---|---|
| 01–04 | **Absents** |
| 05-database-schema.md | Présent. Qualité haute. **Rien n’est appliqué** (le doc le dit). Liens vers 08 morts. |
| 06-kpi-dictionary.md | Présent. 108 KPI, aucun calculé (le doc le dit). Liens vers 07 morts. L’OS affiche des KPI **incompatibles** avec ces définitions (E01 « actif » ≠ présence 21 jours ; F01 ≠ `PAYMENTS` sans `status/direction`). |
| 07–12 | **Absents** (07 et 08 cités comme s’ils existaient) |
| 13 | Ce fichier |

---

## Ordre d’exécution aujourd’hui (10 max)

1. **Casser les RNG parallèles.** Une table `STUDENTS`, une `PAYMENTS`, une `LEADS`. Tout agrégat = `reduce`. Cible : CEO = Finance = Sources pour le **encaissé** ; l’attribué marketing étiqueté autrement. (P0-1, P0-2)  
2. **Retirer du NAV** training, security, settings, portails tant que GAP. Retirer le rôle Étudiant du select. (P0-4, P0-5)  
3. **Garde serveur** : layout OS ou middleware, 403 par rôle. Dashboard teacher sans P&L. (P0-3)  
4. **Brancher sparks et FUNNEL** sur les mêmes `COUNT`. Spark étudiants finit sur `ACTIVE_STUDENTS.length`. (P1-6, P0-2)  
5. **`GROUPS.students` dérivé.** Recalcul occupation. (P1-7)  
6. **Header public :** dropdown Plus + FR/EN. Tuer IELTS home. Linker la card intensif → `/programs/general-english`. (P1-10, P1-11, P2-15)  
7. **Notifs = COUNT live.** Filtrer par rôle. (P1-12, P0-3)  
8. **Grades :** histogramme réel, plus de ranking nominatif. (P1-8)  
9. **Campagnes / SOCIAL** agrégés depuis les mêmes lignes que SOURCES. (P1-9)  
10. **Docs :** 01 faits école (1 page) + supprimer ou créer les stubs 07/08 cités. Ne plus numéroter dans le vide.

Pas d’IA, pas de caméras, pas de PDF reports tant que 1–4 ne passent pas un test manuel : *changer un paiement → le KPI CEO et la ligne source bougent du même montant*.

---

## Auto-critique de cet audit

- Script `tsx` de totaux `PAYMENTS` / `ACTIVE_STUDENTS.length` exact : **non abouti** (commande bloquée). Les totaux SOURCES / FUNNEL / LONGUEURS de tableaux / formules MONTHLY sont lus dans le source, pas « environ ». `REVENUE_TOTAL` n’est pas chiffré ici au franc près — l’indépendance des générateurs suffit à FAIL.  
- L’arbre `app/os/` grossissait pendant la lecture (pages marketing, puis finance, puis IA). La matrice est un **instantané**. Un `page.tsx` apparu après coup n’invalide pas les P0 data/permissions.  
- Pas de passe navigateur (mandat docs-only). Mobile OS jugé sur CSS (`overflow-x`, grille 6→2).  
- Staff reviewer : **FAIL maintenu**. Un PASS CONDITIONNEL exigerait une SSOT unique *et* zéro lien 404 dans le menu *et* un teacher sans P&L. Aucun des trois n’est vrai.
