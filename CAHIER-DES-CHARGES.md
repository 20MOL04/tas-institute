# TAS English Institute — cahier des charges d'exécution

Ce fichier est ma synthèse, pas une répétition des sources. Les documents
complets de Martin sont dans `sources/` (`vision-master-brief.txt`,
`spec-uiux-master.txt`) — à lire pour le contexte business et les 70
règles UI/UX détaillées. Ici : ce qu'on construit vraiment, dans quel
ordre, avec quels outils, en 48h.

**Projet totalement indépendant.** Aucune dépendance vers TUNAFRIK,
Shafrik ou Creafrik — ni lien de code, ni import, ni déploiement partagé.
On copie-colle des techniques CSS (halos, grilles, ombres, responsive)
depuis ces projets quand c'est utile, jamais le code lui-même tel quel
sans l'adapter à ce design system.

## Ce qu'on livre demain, honnêtement

Les 24 écrans du brief (12 pages × desktop + mobile) ne sont pas
réalistes en 48h solo, même avec de l'aide IA, si on veut vraiment tenir
la barre "CEO-level" du brief plutôt que remplir vite. Je préfère le
dire maintenant que le découvrir demain.

**Livré pour la deadline (site réel, en ligne, pas des images de
mockup) :**
1. Home
2. About
3. Programs (liste)
4. Program Detail (un template réutilisable, un seul programme rempli
   en exemple)
5. Teachers
6. Student Stories
7. Apply / Registration
8. Contact

Chaque page est **responsive** (un seul jeu de composants qui s'adapte,
pas deux versions séparées desktop/mobile à maintenir — plus rapide à
construire, plus facile à garder cohérent, et ça respecte quand même
la règle 58 du brief : le mobile a son propre comportement, pas un
desktop rétréci).

**En attente, si le temps le permet ensuite (pas promis pour demain) :**
Accommodation, University Guidance, Gallery, Resources/Blog — Phase B
(admin) et Phase C (futur) du brief restent hors scope, comme le brief
lui-même le prévoit ("ne pas construire avant validation").

## Décisions techniques

- **Framework** : Next.js 14 (App Router), comme les autres projets —
  outillage déjà maîtrisé, déploiement Vercel immédiat.
- **CSS** : pas de Tailwind. CSS brut avec variables de thème (custom
  properties), exactement l'approche qui a donné un rendu "pro agence"
  dans le nuancier TUNAFRIK cette semaine — bordures subtiles, ombres
  discrètes, halos de dégradé légers, grilles fines. Un seul fichier
  `design-system.css` avec les tokens, jamais de couleur en dur ailleurs.
- **Langue** : français par défaut, anglais en second — sélecteur dans
  le footer, comme sur Shafrik. (Le message de Martin dit "français...
  seconde langue en français", clairement une coquille — je prends
  français/anglais comme hypothèse la plus cohérente vu "comme sur
  shafrik" et le nom "TAS *English* Institute" qui vend de l'anglais à
  un public qui inclut des francophones. À confirmer, facile à inverser
  si c'est l'autre sens.)
- **Images** : voir liste ci-dessous, à faire générer par Gemini par
  Martin, déposées dans `public/images/`, noms de fichiers déjà fixés
  ici pour que le code les attende au bon endroit sans aller-retour.
- **Pas de statistiques ni témoignages inventés** — règle 9 du brief,
  reprise ici sans exception. Tout chiffre affiché est soit vérifié par
  Martin, soit remplacé par une formulation qualitative honnête.

## Design tokens (palette "No Saturation" du brief, valeurs fixées)

```css
--tas-navy: #0B1C33;       /* Deep Navy — texte fort, fonds sombres ponctuels */
--tas-blue: #1E5FBF;       /* TAS Blue — accent, jamais en fond plein large */
--tas-white: #FFFFFF;
--tas-bg: #F7F8FA;         /* Soft Gray — fond de page */
--tas-warm-gray: #EFEDE8;  /* Warm Gray — sections alternées */
--tas-text: #16202E;       /* Dark Text */
--tas-border: #E2E5EA;     /* Border Gray */
--tas-accent-2: #C9A24B;   /* léger accent secondaire, or discret — usage rare */
--radius: 10px;            /* 6-12px selon composant, jamais >16px */
--shadow: 0 1px 2px rgba(16,24,40,.04), 0 2px 8px rgba(16,24,40,.06);
```

Typo : **Plus Jakarta Sans** (Google Fonts, dispo sur le CDN autorisé)
pour tout — titres et corps, avec graisses 500/600/700 pour les titres,
400/500 pour le corps. Un seul choix de police pour tenir la règle de
cohérence (63).

## Liste des images à générer (Gemini)

Martin donne cette liste telle quelle à Gemini, une image à la fois ou
en lot. Direction photo pour toutes : **naturelle, lumière de jour
réaliste, expressions non forcées, contexte ghanéen/africain crédible,
jamais l'esthétique "banque d'images" lisse.** Déposer dans un dossier
que Martin me communique ; je les branche ensuite aux bons endroits
listés ici.

| Fichier attendu | Contenu | Utilisé sur |
|---|---|---|
| `hero-home.jpg` | Trois étudiants africains souriants naturellement, livres/sac à dos, devant un bâtiment moderne clair, lumière de jour | Home, hero |
| `about-campus.jpg` | Extérieur du bâtiment de l'école, angle large, ciel dégagé | About |
| `classroom-1.jpg` | Salle de classe réelle, étudiants engagés dans une discussion de groupe | Home, About |
| `classroom-2.jpg` | Enseignant devant un tableau blanc, étudiants qui prennent des notes | Programs, Program Detail |
| `teacher-1.jpg` | Portrait professionnel, femme, souriante, fond neutre clair | Teachers |
| `teacher-2.jpg` | Portrait professionnel, homme, souriant, fond neutre clair | Teachers |
| `teacher-3.jpg` | Portrait professionnel, un troisième enseignant, fond neutre clair | Teachers |
| `student-story-1.jpg` | Portrait d'un(e) étudiant(e), cadre naturel (extérieur ou bibliothèque) | Student Stories |
| `student-story-2.jpg` | Portrait d'un(e) second(e) étudiant(e), cadre différent | Student Stories |
| `library-study.jpg` | Espace bibliothèque ou salle d'étude, étudiants concentrés | Programs, About |
| `computer-lab.jpg` | Salle informatique, étudiants sur ordinateur | Programs (Computer & Professional) |
| `group-outdoor.jpg` | Groupe d'étudiants en extérieur, ambiance décontractée | Home, Apply |
| `contact-office.jpg` | Accueil / bureau administratif, ambiance accueillante | Contact |
| `favicon-source.png` | Logo TAS seul, fond transparent, haute résolution (déjà fourni par Martin si disponible — sinon à extraire du logo existant visible sur les captures partagées) | favicon, header |

14 images. Formats réels de photo (pas de mockup d'écran/laptop/
téléphone — c'est le site réel qui les affiche, pas une présentation).
Ratio proche de 4:3 ou 3:2 pour les photos de contenu, 1:1 pour les
portraits d'enseignants — je recadre proprement au besoin en CSS
(`object-fit: cover`) donc pas besoin d'un cadrage pixel-parfait.

## Contenu texte — statut

Tous les titres, sous-titres et boutons visibles dans les deux images
que Martin a partagées (produites par ChatGPT) sont réutilisables comme
point de départ — ils suivent déjà l'esprit du brief. Je les reprends et
les ajuste, je ne réinvente pas ce qui marche déjà.

## Structure de dossier

```
TAS-INSTITUT/
  sources/                 (documents originaux, ne jamais éditer)
  CAHIER-DES-CHARGES.md    (ce fichier)
  app/                     (Next.js App Router — créé par le scaffold)
    layout.tsx
    page.tsx               (Home)
    about/page.tsx
    programs/page.tsx
    programs/[slug]/page.tsx
    teachers/page.tsx
    student-stories/page.tsx
    apply/page.tsx
    contact/page.tsx
    design-system.css
  public/images/           (photos Gemini déposées ici par Martin)
```

## Prochaine étape

Un agent scaffolde le projet Next.js avec le design system CSS et les
8 pages en placeholders responsives, prêtes à recevoir le vrai contenu
et les vraies photos. Je reprends la main ensuite pour le contenu fin,
la cohérence et le déploiement local (test avant push, comme demandé).
