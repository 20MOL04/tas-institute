# 16 — Pouvoirs CEO, administration, enseignant, élève

> **Statut : CONTRAT PRODUIT.** Aucune implémentation. Ce document tranche qui
> peut faire quoi dans le Digital OS, pour TAS English Institute (Accra) comme
> premier terrain, et pour un fondateur qui verra **plusieurs écoles**.
>
> Quatre rôles opérationnels seulement. Les rôles annexes du modèle
> (`school_director`, `finance`, `reception`, `marketing` — voir
> `05-database-schema.md` §5) existent dans la vision longue ; ils ne
> diluent pas les quatre colonnes ci-dessous.
>
> **Faits TAS tenus pour acquis :** trois cours (anglais intensif 8 h/jour,
> anglais longue durée 5 h/jour, informatique 3 h/jour), 7 compétences anglais,
> 5 modules informatique, **18 enseignants**, plus de 1 200 étudiants formés,
> public largement francophone d’Afrique de l’Ouest, français par défaut /
> anglais en second. Tout le reste chiffré est **hypothèse** ou **À CONFIRMER**.

---

## Sommaire

1. [Légende et périmètres](#1-légende-et-périmètres)
2. [Matrice des actions](#2-matrice-des-actions)
3. [Connexion](#3-connexion)
4. [CEO : devoir vs délégation](#4-ceo--devoir-vs-délégation)
5. [Transferts de groupe et de campus](#5-transferts-de-groupe-et-de-campus)
6. [Évaluations enseignant](#6-évaluations-enseignant)
7. [Notifications et badges](#7-notifications-et-badges)
8. [Impression admin → fiche enseignant](#8-impression-admin--fiche-enseignant)
9. [i18n FR / EN — login et portails](#9-i18n-fr--en--login-et-portails)
10. [Interdits et hypothèses](#10-interdits-et-hypothèses)

---

## 1. Légende et périmètres

### 1.1 Valeurs de la matrice

| Valeur | Sens |
|---|---|
| **oui** | Autorisé, sans restriction de campus. Pour le CEO : toutes les écoles. Pour le Prof : **ses groupes seulement**. Pour l’élève : **son dossier seulement**. |
| **campus** | Autorisé uniquement sur le campus d’affectation de l’acteur. N’apparaît que pour l’Admin (et jamais pour l’élève). |
| **non** | Interdit. L’écran n’existe pas dans le portail. Coller l’URL = refus serveur, pas un menu caché. |

Un Prof n’a **jamais** « campus » : un campus entier n’est pas son métier. S’il
enseigne sur deux sites, ses groupes suivent ses affectations, pas le bâtiment.

### 1.2 Identifiants de connexion (matricules)

| Personne | Identifiant de login | Source modèle (`05`) |
|---|---|---|
| Élève | Matricule étudiant (`students.student_number`) | Immuable après émission. **Ne code pas le campus** — un transfert ne le change pas. Format proposé `TAS-26-ENG-0147` : **hypothèse**, à valider avec l’administration. |
| Enseignant | Matricule enseignant (`teachers.employee_number`) | Un enseignant a toujours un compte. Format proposé `TAS-T-xxxx` : **hypothèse**. |
| Admin / CEO | Matricule staff, même famille que l’enseignant | **Hypothèse.** Pas d’e-mail obligatoire : au Ghana le téléphone doit suffire (`05` §5, contrainte `email OR phone`). |

Le login n’est **pas** l’e-mail. Le matricule se dicte au guichet, se lit sur
une fiche papier, se tape sur un téléphone. Un UUID n’entre jamais dans un
écran de connexion.

### 1.3 Ce que chaque rôle *est*

| Rôle | Portée | Métier |
|---|---|---|
| **CEO** (Fondateur) | Toutes les écoles | Créer les administrateurs, donner et retirer les autorisations, **trancher** inscriptions et transferts qui sortent du quotidien, voir l’ensemble. Il n’est pas le secrétariat. |
| **Admin** (Administration scolaire) | Un campus (plusieurs campus = plusieurs affectations, jamais « toutes les écoles » par défaut) | Dossiers, pièces, impressions, listes pour les profs, saisie d’accueil. Traite le quotidien. Ne s’invente pas de pouvoir CEO. |
| **Prof** (Enseignant, 18 personnes chez TAS — chiffre validé) | Ses groupes, via `teacher_assignments` actives | Présence, notes, appréciation **de ses étudiants**. Pas le voisin, pas la finance, pas le ranking des 18. |
| **Élève** | Lui-même | Son dossier, ses notes **publiées**, ses présences, ses pièces. Rien d’un camarade, rien d’un autre groupe. |

Le prototype OS mélange encore fondateur, directrice, finance, marketing dans
un même sélecteur (`docs/13-supervisor-audit.md`). Ce contrat **refuse** cette
confusion : quatre colonnes, quatre portails, un refus serveur.

---

## 2. Matrice des actions

Lecture : une ligne = une action métier. Pas une route. Si une action n’est
pas dans cette table, elle est **non** pour tout le monde jusqu’à amendement
écrit de ce document.

### 2.1 Identité, comptes, autorisations

| Action | CEO | Admin | Prof | Élève |
|---|---|---|---|---|
| Voir toutes les écoles | oui | non | non | non |
| Créer / inscrire un administrateur | oui | non | non | non |
| Suspendre / désactiver un administrateur | oui | non | non | non |
| Donner ou retirer une autorisation nommée | oui | non | non | non |
| Créer un compte enseignant (dossier + matricule) | oui | campus | non | non |
| Créer un compte élève (après inscription validée) | oui | campus | non | non |
| Réinitialiser le mot de passe d’un tiers (guichet) | oui | campus | non | non |
| Changer son propre mot de passe | oui | oui | oui | oui |
| Voir l’annuaire staff de toute l’école | oui | campus | non | non |
| Voir la liste des 18 enseignants (noms, groupes) | oui | campus | non | non |
| Modifier les rôles système | oui | non | non | non |

Créer un admin **n’est pas** « cocher enseignant puis admin ». C’est un acte
CEO, journalisé (`audit_logs`), avec portée campus ou école explicite.

### 2.2 Inscriptions et dossiers

| Action | CEO | Admin | Prof | Élève |
|---|---|---|---|---|
| Saisir une candidature / un dossier d’accueil | oui | campus | non | non |
| Compléter les pièces d’un dossier (scan, statut) | oui | campus | non | son dossier, dépôt seulement |
| **Valider une inscription** (`pending` → effet utile) | oui | non | non | non |
| Préparer une inscription (brouillon, pièces, groupe proposé) | oui | campus | non | non |
| Voir tous les dossiers de toutes les écoles | oui | non | non | non |
| Voir les dossiers du campus | oui | campus | non | non |
| Voir les dossiers de ses groupes | oui | campus | oui | non |
| Voir **son** dossier | oui | campus | si l’élève est dans son groupe | oui |
| Voir le dossier d’un autre élève | oui | campus | non (hors ses groupes) | non |
| Imprimer fiche élève / liste de groupe | oui | campus | ses groupes, liste seulement | non |
| Exporter un fichier nominatif hors OS | oui | non | non | non |

**Règle d’inscription.** L’admin instruit. Le CEO **valide**. Une inscription
n’est pas « l’accueil a encaissé et a noté ça dans un cahier ». Dans `05` §21.2,
`pending → confirmed` exige un paiement confirmé **ou** une exonération
tracée. La colonne CEO ci-dessus est la **décision d’admettre dans un groupe**,
distincte de l’encaissement. L’encaissement n’est pas le métier des quatre
rôles de ce document (rôle `finance` hors matrice). **Hypothèse de processus :**
tant que TAS n’a pas de rôle finance nommé dans l’OS, le CEO reste le seul
à confirmer une exonération.

### 2.3 Groupes, planning, transferts

| Action | CEO | Admin | Prof | Élève |
|---|---|---|---|---|
| Créer / fermer un groupe | oui | non | non | non |
| Affecter un enseignant à un groupe | oui | campus | non | non |
| Demander un transfert de groupe (même campus) | oui | campus | oui (ses élèves) | non |
| **Valider un transfert de groupe** | oui | non | non | non |
| Demander un transfert de campus | oui | campus (départ) | non | non |
| **Valider un transfert de campus** | oui | non | non | non |
| Voir le planning de l’école / des écoles | oui | campus | ses groupes | son groupe |
| Déplacer une séance (salle, horaire) | oui | campus | non | non |

Détail du flux : §5.

### 2.4 Vie académique (présence, notes)

| Action | CEO | Admin | Prof | Élève |
|---|---|---|---|---|
| Saisir la présence d’une séance | oui (secours) | campus (secours) | oui (ses séances) | non |
| Saisir / modifier une note **avant** publication | oui (secours, journalisé) | non | oui (son évaluation) | non |
| Publier des notes vers l’élève | oui | non | oui (ses évaluations) | non |
| Voir les notes publiées | oui | campus | ses groupes | les siennes |
| Voir les notes d’un autre élève / autre groupe | oui | campus | non | non |
| Classer les enseignants par moyenne ou présence | non | non | non | non |
| Afficher un « score de performance enseignant » | non | non | non | non |

Le CEO **peut** corriger une note en secours (erreur, contestation). Ce n’est
pas son quotidien. Toute modification d’une note déjà publiée écrit
`audit_logs` avec avant / après (`05` §11). Non négociable.

### 2.5 Documents, cartes, impressions

| Action | CEO | Admin | Prof | Élève |
|---|---|---|---|---|
| Imprimer la **fiche enseignant** (matricule, groupes, 1re connexion) | oui | campus | non | non |
| Imprimer listes de présence vierges pour un groupe | oui | campus | non | non |
| Imprimer carte / attestation élève | oui | campus | non | voir / télécharger la sienne |
| Remettre une fiche papier à un prof | — (acte physique) | campus | reçoit | non |
| Voir les pièces d’identité / visa | oui | campus | non | les siennes |

Le prof **ne saisit pas** et **n’imprime pas** les dossiers administratifs. Il
reçoit une feuille. C’est volontaire : l’accueil a l’imprimante, le tampon, le
tiroir. Le prof a un groupe à 8 h.

### 2.6 Ce qui est hors des quatre portails

| Action | Décision |
|---|---|
| Caméras, live, replay | **non** pour Admin, Prof, Élève. CEO : hors de ce contrat (permission nommée distincte, `05` §16). Ne pas poser de badge caméra sur un portail scolaire. |
| Finance nominative, reçus d’encaissement, relances d’impayés | Hors matrice. Un Prof ne voit **aucun** montant. Un élève voit **ses** paiements s’ils existent plus tard ; pas dans le MVP pédagogique. |
| CRM, marketing, crédits IA, site public | Hors des quatre portails. Un badge « leads » sur le portail prof est du bruit (`docs/13`). |
| Cuisine CMS `/admin` (pages du site) | N’est **pas** l’administration scolaire. Ne pas confondre les deux mots. |

---

## 3. Connexion

Un seul écran de login pour les quatre rôles. Après authentification, **redirection
par rôle** vers le portail : CEO, Admin, Prof, Élève. Pas de sélecteur de
persona. Pas de page `/os` commune qui fuit le P&L aux enseignants
(échec déjà documenté dans `docs/13`).

Identifiant unique : **matricule**. Pas d’e-mail comme identifiant principal.

### 3.1 Première connexion — créer le mot de passe

Condition : le compte existe (`users.status = 'invited'`), un matricule a été
émis, **aucun** `password_hash` n’est encore posé.

```
[Saisir le matricule]
        │
        ▼
[Lookup]  matricule inconnu → message générique, pas « ce numéro n’existe pas
          chez tel campus » (énumération). Attendre. Ne pas distinguer
          « inconnu » et « déjà activé » trop tôt — voir anti-énumération.
        │
        ▼
[Afficher le nom]  prénom + initiale du nom, ou nom complet selon ce qui est
          déjà public sur une carte. L’utilisateur confirme : « Oui, c’est moi ».
          Si ce n’est pas lui → stop. Il n’essaie pas un autre nom.
        │
        ▼
[Créer un mot de passe]  + confirmation (deux champs).
        │
        ▼
[Compte actif]  `invited` → `active`. Prochaine visite = flux habituel.
```

Règles :

1. **Le lookup montre un nom, pas un dossier.** Pas de notes, pas de téléphone
   des parents, pas de solde, pas de photo HD avant mot de passe. Juste de quoi
   reconnaître que le matricule n’est pas celui du voisin.
2. **Le mot de passe n’est jamais imprimé en clair** sur la fiche enseignant.
   La fiche dit *comment* activer, pas *quel* secret.
3. **Confirmation obligatoire.** Un seul champ « mot de passe » sans
   confirmation produit des comptes bloqués dès le lundi matin.
4. **Complexité : suffisante, pas théâtrale.** **Hypothèse :** 8 caractères
   minimum, pas de composition imposée type « 12 caractères, majuscule, symbole »
   — barrière inutile pour un public mixte et des téléphones partagés. À
   confirmer avec l’administration. Un mot de passe trop dur sera collé sur un
   Post-it. C’est pire.
5. **Anti-énumération.** Après N échecs de lookup (**hypothèse : 5 / 15 min /
   IP**), temporiser. Le message reste le même.

### 3.2 Connexion habituelle

```
Matricule + mot de passe → portail du rôle.
```

Pas de « rester connecté » de 90 jours sur un poste d’accueil partagé.
**Hypothèse de session :** poste staff (accueil, CEO) = session courte,
fermeture du navigateur = fin. Téléphone personnel élève / prof = session
plus longue. Durées exactes : **À CONFIRMER**.

Échecs : compteur `failed_login_count` (`05` §5). Verrouillage temporaire
après répétition. Message unique : *Matricule ou mot de passe incorrect.*

### 3.3 Mot de passe oublié

Canal principal **À CONFIRMER**. Beaucoup d’étudiants n’ont pas d’e-mail
actif (`05` §5). Ordre produit proposé (**hypothèse**) :

1. **Guichet admin (campus)** — l’admin authentifié réinitialise le compte
   vers `invited` (ou équivalent « doit recréer le mot de passe »). L’élève
   ou le prof refait le flux §3.1. C’est le chemin le plus réel à Accra.
2. **WhatsApp / SMS vers le numéro du dossier** — lien ou code à usage unique,
   si un téléphone est enregistré. Pas de code envoyé si le numéro a changé
   sans mise à jour du dossier.
3. **E-mail** — seulement si une adresse est présente et vérifiée. Jamais
   comme unique chemin.

Le CEO peut tout réinitialiser, y compris un admin. Un admin **ne**
réinitialise **pas** un autre admin. Un prof **ne** réinitialise **pas** un
élève : il l’envoie à l’accueil. Un élève ne réinitialise que lui-même, via
le flux oublié, jamais le compte d’un camarade.

Ce que « mot de passe oublié » n’est pas : un écran qui redemande le nom pour
« aider » et révèle si le matricule existe. Même lookup, même sobriété.

---

## 4. CEO : devoir vs délégation

Le fondateur **doit pouvoir** tout ce que la matrice marque « oui ». Il ne
**doit pas faire** tout cela lui-même. Un OS qui oblige le CEO à valider
chaque arrivée du lundi est un OS que personne n’ouvrira.

### 4.1 Le CEO DOIT faire (non déléguable)

| Acte | Pourquoi ce n’est pas déléguable |
|---|---|
| Créer le premier administrateur d’une école, et chaque admin suivant | C’est la clé de la maison. Déléguer la création d’admins, c’est déléguer le pouvoir de tout voir. |
| Donner et retirer les autorisations nommées des admins | Un admin qui s’ajoute `approve` sur les inscriptions n’est plus un admin. |
| Suspendre un administrateur | Conflit, départ, abus. |
| Voir toutes les écoles (et ne pas pouvoir s’aveugler) | Le multi-écoles est la raison d’être du rôle. Un filtre « cacher cette école » n’existe pas pour le CEO. |
| Valider un transfert **inter-campus** ou **inter-écoles** | Change le lieu de vie, parfois le logement, toujours la charge d’un autre site. |
| Trancher une inscription **exceptionnelle** : exonération, conflit de pièces, cas hors procédure | Ce qui sort du quotidien n’est plus du secrétariat. |
| Lire l’audit des actes sensibles (notes publiées modifiées, permissions, validations) | Sans ça, la délégation est une fiction. |

« Doit faire » = **doit rester le seul à pouvoir le faire**, pas « doit cliquer
chaque matin ». Les files d’attente (inscriptions, transferts) s’affichent
comme **vrais compteurs** (§7). S’il n’y a rien à trancher, le badge est vide.
Un badge vide est un succès.

### 4.2 Le CEO PEUT déléguer (le pouvoir reste, le geste quotidien non)

| Acte | Délégué à | Garde-fou |
|---|---|---|
| Instruction des dossiers, scans, relances de pièces | Admin du campus | L’admin prépare ; il ne bascule pas `enrollment` en effet utile. |
| Création du dossier enseignant et émission du matricule prof | Admin du campus | L’admin ne donne pas de permission `approve`. |
| Impression des fiches prof / listes de groupes | Admin du campus | Papier. Pas de pouvoir nouveau. |
| Proposition de groupe à l’inscription | Admin du campus | Le groupe proposé n’est pas le groupe **validé**. |
| Saisie de présence de secours si le prof est absent | Admin du campus | Marquée « saisie admin », pas « saisie prof ». |
| Réinitialisation mot de passe élève / prof du campus | Admin du campus | Pas les comptes admin. |

### 4.3 Ce que le CEO ne doit **pas** devenir

- Le correcteur des 18 enseignants.
- Le standardiste WhatsApp.
- Un troisième admin d’Alajo.
- Le producteur d’un classement pédagogique.

S’il ouvre l’OS et que tout est rouge sauf les inscriptions, le produit a
échoué : on a mis le bruit du monde sur le bureau du seul humain qui doit
trancher les clés et les exceptions.

---

## 5. Transferts de groupe et de campus

Un transfert n’est **pas** une édition silencieuse de `enrollments.group_id`.
C’est une demande, une validation, un avant / après, un papier pour le prof
qui reçoit, un papier pour le prof qui perd.

Le matricule élève **ne change pas** (`05` §22.1). Le campus n’y figure pas
précisément pour ça.

**À CONFIRMER sur le terrain :** TAS a-t-il un ou plusieurs sites à
Alajo / Kotobabi (`05` §4) ? Le produit gère le transfert de campus **même si**
l’école n’en a qu’un aujourd’hui. Ne pas affirmer deux campus comme un fait.

### 5.1 Deux natures, deux gravités

| Nature | Ce qui bouge | Qui demande | Qui valide | Effet |
|---|---|---|---|---|
| **Groupe, même campus** | `group_id`, éventuellement `level_id` | Admin du campus, **ou** le prof actuel (pour un élève de son groupe) | **CEO** | L’élève disparaît de la liste du prof A, apparaît chez le prof B. Présences futures sur le nouveau groupe. |
| **Campus** | `campus_id` d’inscription + `primary_campus_id` + groupe d’arrivée | Admin du campus **de départ** | **CEO** uniquement | Même chose, plus : autre bâtiment, autre admin, éventuellement autre logement (**hypothèse** si l’élève est hébergé). |

L’élève **ne** demande **pas** dans l’OS. Il passe à l’accueil. Un bouton
« me transférer » sur le portail élève est une invitation au désordre.

Le prof **demande** un changement de groupe pour un élève mal placé (niveau,
langue, conflit). Il ne valide pas. Il ne voit pas les groupes d’arrivée
comme un catalogue à piller : il motive, l’admin complète le groupe cible,
le CEO tranche.

### 5.2 Machine à états (contrat)

```
[draft] --soumettre--> [pending_ceo]
                            │
                            +--valider--> [applied]  (écritures atomiques)
                            +--refuser--> [rejected] (motif obligatoire)
                            +--retirer--> [cancelled] (demandeur, avant décision)
```

Pas d’état `applied` sans ligne d’audit. Pas de double affectation active
sur deux groupes du même programme en même temps (**hypothèse de règle métier**,
à confirmer s’il existe des cours parallèles anglais + informatique pour la
même personne — alors deux inscriptions, pas un « transfert »).

### 5.3 Ce qui est imprimé à la validation

Trois feuilles. Pas un PDF de 12 pages. L’accueil les met dans la main.

| Feuille | Destinataire | Contenu |
|---|---|---|
| **1. Sortie de groupe** | Prof qui **perd** l’élève | Date d’effet, nom, matricule élève, ancien groupe, « ne plus l’appeler sur la liste de présence à partir de… ». |
| **2. Entrée de groupe** | Prof qui **reçoit** | Date d’effet, nom, matricule élève, nouveau groupe, niveau, consigne : l’ajouter sur la feuille de présence dès cette date. |
| **3. Accusé campus** (transfert de campus seulement) | Admin du campus d’arrivée | Nom, matricule (inchangé), campus départ → arrivée, groupe d’arrivée, pièces dossier à récupérer. |

On n’imprime **pas** les notes sur ces feuilles. On n’imprime **pas** le motif
familial. Le prof a besoin d’un nom et d’une date, pas d’un roman.

Tant que le CEO n’a pas validé : **rien n’est imprimé comme fait**. Une
« pré-feuille » de travail admin est possible ; elle porte la mention
**EN ATTENTE DE VALIDATION** — sinon le prof croit que c’est déjà vrai.

---

## 6. Évaluations enseignant

Le Prof note et évalue **ses groupes**. Point. Cette section empêche le
produit de transformer ces saisies en tableau de honte pour les 18 enseignants.
Le fondement méthodologique est `docs/06-kpi-dictionary.md` §13. Ici : ce que
l’écran **fait** et **ne fait pas**.

### 6.1 Ce que le prof saisit (données d’étudiant, pas de jugement sur le prof)

| Saisie | Objet | Visible élève | Visible autres profs |
|---|---|---|---|
| Présence de séance (`present`, `late`, absences) | L’étudiant, ce jour-là | Ses propres lignes | Non |
| Épreuve (`assessments`) : titre, type, barème, date | Le groupe | Après publication, le titre et **sa** note | Non |
| Note (`grades.score`), absence à l’épreuve, commentaire | L’étudiant | Après `published_at` | Non |
| Appréciation qualitative courte | L’étudiant | Si publiée | Non |

Échelle de note (20, 100, lettres) : **À CONFIRMER** (`05` §11 `max_score`).
Le produit n’invente pas de « GPA TAS ».

Le prof **ne saisit pas** : un auto-score, un smiley de performance, une
moyenne « moi vs les 17 autres », un commentaire sur un collègue.

### 6.2 Ce qui n’est PAS un score de performance enseignant

Interdit d’afficher, de trier, de colorer au rouge, de mettre en badge, de
mettre dans un e-mail hebdo au CEO, **nominativement** :

- taux de présence du groupe du prof ;
- moyenne de classe du prof ;
- nombre d’absents « chez » le prof ;
- délai de saisie des notes présenté comme qualité pédagogique ;
- charge horaire présentée comme mérite ;
- tout classement des 18.

Pourquoi, en une phrase chacune : le programme (8 h vs 3 h) change
l’assiduité ; le créneau et la pluie aussi ; les groupes difficiles vont aux
expérimentés ; la moyenne finale ignore le niveau d’entrée ; l’épreuve est
souvent écrite par le même humain qu’on prétend mesurer ; les effectifs sont
petits — le bruit mange le signal. Détail : `06` §13.

Les indicateurs d’**organisation** (séances tenues, délai de publication des
notes, charge horaire) peuvent exister **plus tard** pour l’admin / le CEO,
étiquetés *organisation, pas pédagogie*, **sans** classement public. Ils ne
vivent pas sur le portail prof comme un trophée ou une sanction.

### 6.3 Ce que le CEO voit sans trahir §13

Le CEO voit que les notes de tel groupe sont **saisies** ou **en retard**
(processus). Il ne voit pas un podium. Il peut ouvrir un dossier élève. Il
n’a pas d’écran « Teachers leaderboard ».

Si un jour TAS veut une vraie évaluation des 18 : quatre sources croisées
(`06` §13.4), pas un graphe. Ce n’est **pas** ce contrat. Tant que les
conditions (test de placement commun, observation de classe, questionnaire
étudiant bilingue) n’existent pas, **aucun** indicateur nominatif de
performance enseignante.

---

## 7. Notifications et badges

Un badge est un **compteur d’actes en attente**, ou ce n’est pas un badge.
Le tiroir qui mélange finance, caméras et crédits IA pour tous les rôles
(`docs/13`) est du théâtre. Il est interdit ici.

### 7.1 Vrais compteurs (le chiffre = des dossiers qu’un humain doit traiter)

| Badge | Qui le voit | Formule | Clique vers |
|---|---|---|---|
| Inscriptions à valider | CEO | `COUNT` des inscriptions / candidatures en attente de décision CEO | File de validation |
| Transferts à valider | CEO | `COUNT` des transferts `pending_ceo` | File transferts |
| Dossiers pièces incomplètes | Admin (campus) | `COUNT` dossiers du campus avec pièce `pending` / manquante, hors brouillons morts | File dossiers |
| Transferts demandés (préparer le groupe cible) | Admin (campus) | Demandes du campus pas encore soumises au CEO, ou en attente d’info | File transferts campus |
| Présences non saisies (séances tenues, J-0/J-1) | Prof | Séances **de ses groupes** sans feuille de présence | Ses séances du jour |
| Notes à publier | Prof | Évaluations `graded` non `published`, **ses** épreuves | Ses évaluations |
| Note publiée / transfert appliqué / pièce validée | Élève | Événements **le concernant**, non lus | Son dossier |

Zéro = pas de pastille. Jamais « 0 » rouge. Un compteur qui ne descend pas
quand on traite la file est un bug produit, pas un détail UI.

### 7.2 Bruit (interdit en pastille, éventuellement listé dans un journal discret)

| Signal | Pourquoi c’est du bruit |
|---|---|
| Crédits IA, « l’assistant a une idée » | Pas un acte scolaire. |
| Caméras, incidents sécurité | Pas le portail prof / élève / admin de campus. |
| Leads, campagnes, CPM | Pas ces quatre rôles. |
| « Bienvenue », tips, nouveautés produit | Un bandeau une fois, pas un badge à vie. |
| Marketing, newsletters | Consentement à part ; jamais un rouge sur le login. |
| Classement, « votre groupe est 3e » | Interdit §6. |
| Compteur global d’étudiants de l’école sur le portail prof | Vanité. Le prof a ses effectifs de groupe, point. |

### 7.3 Règle de lecture pour un directeur produit

Si le CEO a 40 badges et l’admin 2, on a inversé les métiers. Le CEO a **deux**
files : inscriptions, transferts. Le reste est délégable et ne clignote pas
chez lui, sauf escalade explicite (un admin clique « remonter au fondateur »).

**Hypothèse :** pas d’escalade automatique au CEO avant N jours. À définir
après un premier mois d’usage réel, pas avant.

---

## 8. Impression admin → fiche enseignant

L’admin n’envoie pas un « lien magique » dans le vide. Il imprime **une fiche
A4 recto**, la met dans la main du prof (ou dans le casier). C’est le rituel
d’entrée des 18, et de tout nouvel enseignant ensuite.

### 8.1 Contenu obligatoire de la fiche

| Zone | Contenu | Interdit |
|---|---|---|
| En-tête | Nom de l’école, campus d’affectation, date d’impression | Logo surchargé, QR vers la finance |
| Personne | Nom affiché, **matricule enseignant** (gros, dictable) | Mot de passe, salaire, `hourly_rate` |
| Groupes | Code groupe, programme, niveau, créneau, salle si connue, effectif **à la date d’impression** | Historique des 1 200 anciens, notes des élèves |
| Première connexion | URL du login, les 4 étapes en français **et** en anglais : (1) saisir ce matricule (2) vérifier que le nom affiché est le vôtre (3) créer un mot de passe (4) le confirmer | Le mot de passe lui-même, un QR de session déjà ouverte |
| Habituel | « Les fois suivantes : matricule + mot de passe » | — |
| Oubli | « Mot de passe oublié : passer à l’accueil, ne pas partager le matricule sur un groupe WhatsApp d’étudiants » | Numéro perso du CEO |
| Rappel métier | « Vous voyez uniquement vos groupes. Vous ne voyez pas les notes des autres enseignants. » | Classement, objectifs de moyenne |

Effectif du groupe sur la fiche = instantané papier. Il **vieillit**. La
ligne « imprimé le … » est obligatoire. Un transfert validé le lendemain
n’est pas une erreur de la fiche ; c’est le flux §5.

### 8.2 Ce que l’admin imprime **en plus**, pour le quotidien

- Listes de présence du groupe (noms + matricules élèves, cases vides).
- Rien d’autre par défaut. Pas le dossier médical, pas le solde, pas le
  passeport.

Le prof qui n’a pas encore fait la première connexion **peut quand même**
faire l’appel sur papier. L’OS ne prend pas l’école en otage.

### 8.3 Ce que la fiche n’est pas

Ce n’est pas un contrat de travail. Ce n’est pas une évaluation. Ce n’est
pas un badge d’accès caméra. Si une information n’aide pas le lundi 7 h 45,
elle n’est pas sur la feuille.

---

## 9. i18n FR / EN — login et portails

Le site public a déjà un dictionnaire (`app/i18n.ts`). Les **portails** et le
**login matricule** n’en sont pas une copie marketing. Chaînes **minimales**
à exister dans les deux langues, clés stables, pas de français orphelin sur
un bouton critique.

Langue par défaut : **français** (public francophone). Sélecteur FR/EN sur
login **et** dans chaque portail. `users.locale` mémorise le choix (`05` §5,
défaut `fr`).

### 9.1 Login (écran unique)

| Clé logique | FR (intention) | EN (intention) |
|---|---|---|
| `login.title` | Connexion | Sign in |
| `login.matricule` | Matricule | Student / staff ID |
| `login.password` | Mot de passe | Password |
| `login.submit` | Entrer | Sign in |
| `login.first_time` | Première connexion | First sign-in |
| `login.forgot` | Mot de passe oublié | Forgot password |
| `login.lookup_confirm_name` | Est-ce bien vous ? | Is this you? |
| `login.yes_its_me` | Oui, c’est moi | Yes, that’s me |
| `login.not_me` | Non | No |
| `login.create_password` | Créer un mot de passe | Create a password |
| `login.confirm_password` | Confirmer le mot de passe | Confirm password |
| `login.mismatch` | Les deux mots de passe ne correspondent pas | Passwords do not match |
| `login.generic_error` | Matricule ou mot de passe incorrect | Incorrect ID or password |
| `login.forgot_help` | Passez par l’accueil de votre campus | Please go to your campus reception |
| `login.language` | Langue | Language |

Aucune chaîne du login n’invente un chiffre TAS, un tarif, un effectif.

### 9.2 Commun portails (chrome)

| Clé logique | Intention FR | Intention EN |
|---|---|---|
| `role.ceo` | Fondateur | Founder |
| `role.admin` | Administration | School admin |
| `role.teacher` | Enseignant | Teacher |
| `role.student` | Élève | Student |
| `nav.files` | Dossiers | Records |
| `nav.transfers` | Transferts | Transfers |
| `nav.groups` | Groupes | Groups |
| `nav.attendance` | Présences | Attendance |
| `nav.grades` | Notes | Grades |
| `nav.print` | Impressions | Print |
| `badge.pending_enrollments` | Inscriptions à valider | Enrollments to approve |
| `badge.pending_transfers` | Transferts à valider | Transfers to approve |
| `badge.incomplete_files` | Dossiers incomplets | Incomplete records |
| `action.approve` | Valider | Approve |
| `action.reject` | Refuser | Reject |
| `action.print` | Imprimer | Print |
| `empty.none_pending` | Rien en attente | Nothing pending |
| `denied.title` | Accès refusé | Access denied |
| `scope.own_groups_only` | Vos groupes uniquement | Your groups only |
| `scope.self_only` | Votre dossier uniquement | Your record only |
| `teacher.not_a_ranking` | Ceci n’est pas un classement des enseignants | This is not a teacher ranking |

### 9.3 Fiche imprimée enseignant (§8)

La fiche est **bilingue sur la même page** (colonne FR / EN, ou phrase FR puis
EN). Un prof anglophone arrivant à Accra ne doit pas dépendre d’un collègue
pour la première connexion. Chaînes : matricule enseignant, groupes, les 4
étapes, mot de passe oublié = accueil, rappel « vos groupes seulement ».

### 9.4 Ce qui n’a pas besoin d’être traduit dans le MVP portail

Blog, galerie, pitch marketing, légendes caméra, tooltips finance. Si une
chaîne n’est pas sur login ou sur un des quatre portails, elle n’entre pas
dans ce contrat.

---

## 10. Interdits et hypothèses

### 10.1 Interdits (faits TAS)

Ne pas écrire, ni dans ce document ni à l’écran, comme **faits d’école** :

- un effectif actuel d’étudiants, un nombre de groupes, un nombre de salles ;
- un tarif de cours (les prix des formations ne sont pas communiqués) ;
- un nombre de campus comme vérité (Alajo / Kotobabi : **localisation
  vérifiée**, découpage administratif en N campus : **À CONFIRMER**) ;
- une moyenne de classe, un taux de réussite, un taux de présence « officiel » ;
- un classement des 18 enseignants ;
- des témoignages nominatifs inventés ;
- des durées de programme non validées.

Les **18 enseignants** et « plus de 1 200 étudiants formés » sont des faits
d’institution déjà repris dans `05` / `06`. Ne pas les « préciser » avec un
chiffre plus fin (ex. « 18 dont 11 d’anglais ») tant que l’école ne l’a pas dit.

### 10.2 Hypothèses de ce contrat (à valider, pas à coder comme vérité)

| # | Hypothèse | Impact si fausse |
|---|---|---|
| H1 | Format matricule élève `TAS-AA-DIS-####` | Changer le masque de saisie login, pas la règle d’immuabilité. |
| H2 | Format matricule enseignant distinct, famille `TAS-T-…` | Idem. |
| H3 | Mot de passe oublié : guichet d’abord, WhatsApp ensuite, e-mail en dernier | Inverser les canaux si l’école impose l’e-mail staff. |
| H4 | 8 caractères min., sans théâtre de complexité | Si l’école veut plus dur pour le CEO seulement : exception de rôle, pas pour les élèves. |
| H5 | Un élève = un groupe actif par programme ; anglais + informatique = deux inscriptions, pas un transfert | Sinon le flux §5 casse. |
| H6 | L’élève ne dépose pas de demande de transfert dans l’OS | Si l’accueil est saturé, on pourra ajouter une demande **lue par l’admin**, jamais auto-validée. |
| H7 | Durées de session courtes sur poste d’accueil | Sinon fuite de dossiers sur un PC partagé. |
| H8 | Pas d’escalade auto des dossiers vers le CEO | Le CEO ouvre l’OS quand le badge inscriptions / transferts est non vide. |
| H9 | Découpage multi-campus possible même à un seul site physique aujourd’hui | Le transfert de campus peut rester rare. Le bouton existe. Il n’invente pas un second bâtiment. |

### 10.3 Amendement

Toute nouvelle action (exonérer un frais, voir une caméra, publier un
certificat) s’ajoute **par une ligne** dans la matrice §2, avec oui / campus /
non, ou elle n’existe pas. Un écran livré sans ligne est une régression
produit, pas une surprise agréable.

---

*Fin du contrat 16. Aligné sur `05` (identité, inscriptions, notes, audit,
matricule), `06` §13 (enseignants), `13` (moindre privilège réel, pas un
filtre de menu).*
