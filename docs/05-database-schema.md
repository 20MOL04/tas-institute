# 05 — Schéma de base de données (modèle conceptuel et logique)

> **Statut du document : MODÉLISATION. Rien n'est appliqué.**
> Aucune migration, aucune table réelle, aucune base de données provisionnée.
> Ce document décrit ce qu'il *faudrait* créer, orienté PostgreSQL, pour un
> « Education Digital Operating System » multi-écoles. Il sert de contrat de
> conception avant la moindre ligne de SQL.
>
> Toute valeur métier non vérifiée auprès de TAS est explicitement marquée
> **À CONFIRMER** ou **hypothèse**. Les seuls faits tenus pour acquis sont ceux
> validés par l'école : 3 cours (anglais intensif 8 h/jour, anglais longue durée
> 5 h/jour même programme, informatique 3 h/jour), 7 compétences anglais,
> 5 modules informatique, 18 enseignants, plus de 1200 étudiants formés,
> logement à 130 000 / 100 000 / 60 000 CFA par mois, public largement
> francophone d'Afrique de l'Ouest.

---

## Sommaire

1. [Principes de conception](#1-principes-de-conception)
2. [Conventions communes à toutes les tables](#2-conventions-communes-à-toutes-les-tables)
3. [Cartographie des domaines](#3-cartographie-des-domaines)
4. [Domaine 1 — Tenant et organisation](#4-domaine-1--tenant-et-organisation)
5. [Domaine 2 — Identité, rôles et permissions](#5-domaine-2--identité-rôles-et-permissions)
6. [Domaine 3 — Étudiants](#6-domaine-3--étudiants)
7. [Domaine 4 — Enseignants](#7-domaine-4--enseignants)
8. [Domaine 5 — Offre pédagogique](#8-domaine-5--offre-pédagogique)
9. [Domaine 6 — Calendrier, groupes et salles](#9-domaine-6--calendrier-groupes-et-salles)
10. [Domaine 7 — Candidature et inscription](#10-domaine-7--candidature-et-inscription)
11. [Domaine 8 — Vie académique](#11-domaine-8--vie-académique)
12. [Domaine 9 — Finance](#12-domaine-9--finance)
13. [Domaine 10 — CRM et acquisition](#13-domaine-10--crm-et-acquisition)
14. [Domaine 11 — Marketing, contenu et attribution](#14-domaine-11--marketing-contenu-et-attribution)
15. [Domaine 12 — Formation en ligne et médias](#15-domaine-12--formation-en-ligne-et-médias)
16. [Domaine 13 — Sécurité physique et caméras](#16-domaine-13--sécurité-physique-et-caméras)
17. [Domaine 14 — Notifications et audit](#17-domaine-14--notifications-et-audit)
18. [Domaine 15 — Couche IA](#18-domaine-15--couche-ia)
19. [Diagrammes de relations (ASCII)](#19-diagrammes-de-relations-ascii)
20. [Règles de multi-tenant et cloisonnement](#20-règles-de-multi-tenant-et-cloisonnement)
21. [Machines à états](#21-machines-à-états)
22. [Matricule étudiant et numérotation des reçus](#22-matricule-étudiant-et-numérotation-des-reçus)
23. [Ce qui reste à valider sur le terrain](#23-ce-qui-reste-à-valider-sur-le-terrain-avant-création-réelle-des-tables)

---

## 1. Principes de conception

| # | Principe | Conséquence concrète |
|---|---|---|
| P1 | **Multi-tenant par ligne, pas par base** | Chaque table métier porte `school_id`. Une seule base, un seul schéma, isolation par politique de sécurité au niveau ligne (RLS décrite en §20). |
| P2 | **Le campus est une dimension, pas un tenant** | `campus_id` est présent mais nullable sur les entités transverses. Une école à un seul campus fonctionne sans rien changer. |
| P3 | **Séparer identité et rôle métier** | `users` = compte de connexion. `students` / `teachers` = entités métier. Un enseignant qui suit une formation interne reste un seul `user`. |
| P4 | **Événements immuables, états mutables** | `traffic_events`, `touchpoints`, `ai_usage`, `audit_logs`, `payments` sont append-only. `applications`, `enrollments` portent un état modifiable. |
| P5 | **Aucune suppression physique des données réglementaires** | `deleted_at` (soft delete) pour étudiants, paiements, notes, documents. Suppression physique réservée aux brouillons et aux données marketing anonymes. |
| P6 | **L'argent n'est jamais un `float`** | `numeric(14,2)` + code devise ISO sur trois lettres. Multi-devise obligatoire : GHS au Ghana, XOF pour les frais annoncés en CFA. |
| P7 | **Toute valeur chiffrée affichée doit être traçable** | Chaque agrégat du tableau de bord doit pouvoir être redescendu jusqu'aux lignes sources (exigence reprise dans `08-ai-architecture.md`). |
| P8 | **Les libellés d'état sont des chaînes contraintes, pas des entiers** | `status text NOT NULL CHECK (status IN (...))` : lisible dans un `SELECT` brut, migrable sans `ALTER TYPE` risqué. |

---

## 2. Conventions communes à toutes les tables

Sauf mention contraire, **toutes** les tables métier portent ces colonnes. Elles
ne sont pas répétées dans chaque définition ci-dessous.

| Colonne | Type | Contraintes | Rôle |
|---|---|---|---|
| `id` | `uuid` | PK, `DEFAULT gen_random_uuid()` | Identifiant technique. Jamais exposé comme référence métier lisible. |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id) ON DELETE RESTRICT` | Clé de cloisonnement multi-tenant. Absente uniquement de `organizations`, `schools`, `permissions`, et des tables de plateforme. |
| `campus_id` | `uuid` | `NULL REFERENCES campuses(id) ON DELETE SET NULL` | Présente sur les entités localisées (groupes, salles, présences, caméras…). `NULL` = transverse à l'école. |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()` | Horodatage de création, toujours en UTC, conversion à l'affichage. |
| `updated_at` | `timestamptz` | `NOT NULL DEFAULT now()` | Mis à jour par trigger. |
| `created_by` | `uuid` | `NULL REFERENCES users(id)` | Traçabilité. `NULL` si créé par un processus système ou un visiteur anonyme. |
| `deleted_at` | `timestamptz` | `NULL` | Soft delete. Toutes les vues applicatives filtrent `deleted_at IS NULL`. |

**Autres conventions**

- Types monétaires : `amount numeric(14,2) NOT NULL CHECK (amount >= 0)` + `currency char(3) NOT NULL DEFAULT 'GHS'`.
- Téléphone : `text` au format E.164 (`+233...`, `+225...`), contrainte `CHECK (phone ~ '^\+[1-9][0-9]{7,14}$')`.
- Email : `citext` (extension `citext`) pour comparaison insensible à la casse.
- Dates civiles sans heure : `date`. Instants : `timestamptz`. Jamais `timestamp` nu.
- Champs semi-structurés : `jsonb` avec index `GIN` si interrogé. Réservé à ce qui est réellement variable (métadonnées de fournisseur, payload d'événement), jamais utilisé pour éviter de modéliser.
- Nommage : tables au pluriel en `snake_case`, clés étrangères `<entité_singulier>_id`, index `idx_<table>_<colonnes>`, contraintes uniques `uq_<table>_<colonnes>`, contraintes de contrôle `ck_<table>_<règle>`.
- Extensions PostgreSQL attendues : `pgcrypto` (UUID), `citext`, `pg_trgm` (recherche floue sur les noms), `btree_gist` (exclusion de chevauchement d'occupation de salle).

---

## 3. Cartographie des domaines

```
+--------------------------------------------------------------------------+
|                        PLATEFORME (opérateur)                            |
|   organizations · permissions · ai_credits · ai_credit_transactions      |
+--------------------------------------------------------------------------+
                                   |
+--------------------------------------------------------------------------+
|                        TENANT = schools                                   |
|                                                                          |
|  [1] Organisation      [2] Identité        [3] Étudiants   [4] Enseignants|
|  schools, campuses     users, roles,       students,       teachers,     |
|                        permissions,        student_*       teacher_      |
|                        role_assignments                    assignments   |
|                                                                          |
|  [5] Offre             [6] Planning        [7] Admission                 |
|  programs, levels,     academic_periods,   intakes, applications,        |
|  modules               groups, classes,    enrollments                   |
|                        rooms                                             |
|                                                                          |
|  [8] Académique        [9] Finance         [10] CRM                      |
|  attendance,           payments,           leads, lead_sources,          |
|  assessments,          payment_plans,      followups                     |
|  grades, certificates  receipts                                          |
|                                                                          |
|  [11] Marketing        [12] Formation      [13] Sécurité                 |
|  campaigns, creatives, training_*,         cameras,                      |
|  touchpoints,          media_assets        camera_permissions,           |
|  traffic_events,                           security_incidents            |
|  conversions,                                                            |
|  content_calendar,     [14] Transverse     [15] IA                       |
|  social_channels       notifications,      ai_conversations, ai_usage,   |
|                        audit_logs          knowledge_documents           |
+--------------------------------------------------------------------------+
```

---

## 4. Domaine 1 — Tenant et organisation

### `organizations`

**Rôle :** entité juridique ou groupe propriétaire d'une ou plusieurs écoles ; c'est le niveau de facturation de la plateforme et le porteur du solde de crédits IA.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | `NOT NULL` |
| `slug` | `text` | `NOT NULL`, `uq_organizations_slug` |
| `legal_name` | `text` | `NULL` |
| `country_code` | `char(2)` | `NOT NULL DEFAULT 'GH'` |
| `default_currency` | `char(3)` | `NOT NULL DEFAULT 'GHS'` |
| `default_timezone` | `text` | `NOT NULL DEFAULT 'Africa/Accra'` |
| `billing_email` | `citext` | `NULL` |
| `plan_code` | `text` | `NOT NULL DEFAULT 'trial'`, `CHECK (plan_code IN ('trial','starter','growth','network'))` — **hypothèse commerciale** |
| `status` | `text` | `NOT NULL DEFAULT 'active'`, `CHECK (status IN ('active','suspended','archived'))` |

- **Index :** `uq_organizations_slug (slug)`.
- **Note :** pas de `school_id` — c'est le parent du tenant. Pour TAS, une seule organisation contenant une seule école dans un premier temps.

### `schools`

**Rôle :** le tenant. Unité d'isolation de toutes les données métier ; une école = une marque, un jeu de programmes, un jeu d'utilisateurs.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `organization_id` | `uuid` | `NOT NULL REFERENCES organizations(id)` |
| `name` | `text` | `NOT NULL` — ex. « TAS English Institute » |
| `slug` | `text` | `NOT NULL`, `uq_schools_org_slug (organization_id, slug)` |
| `code` | `text` | `NOT NULL`, `uq_schools_code (code)` — 3 lettres, entre dans le matricule (ex. `TAS`) |
| `default_locale` | `text` | `NOT NULL DEFAULT 'fr'`, `CHECK (default_locale IN ('fr','en'))` |
| `supported_locales` | `text[]` | `NOT NULL DEFAULT '{fr,en}'` |
| `currency` | `char(3)` | `NOT NULL DEFAULT 'GHS'` |
| `timezone` | `text` | `NOT NULL DEFAULT 'Africa/Accra'` |
| `public_site_domain` | `text` | `NULL` |
| `logo_media_id` | `uuid` | `NULL REFERENCES media_assets(id)` |
| `settings` | `jsonb` | `NOT NULL DEFAULT '{}'` — préférences d'affichage, options activées |
| `status` | `text` | `NOT NULL DEFAULT 'active'`, `CHECK (status IN ('active','suspended','archived'))` |

- **Index :** `uq_schools_code`, `idx_schools_organization (organization_id)`.

### `campuses`

**Rôle :** site physique d'une école (bâtiment, quartier). Porte l'adresse, les salles et les caméras. **À CONFIRMER : TAS a-t-il un ou plusieurs sites à Alajo/Kotobabi ?**

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `name` | `text` | `NOT NULL` |
| `code` | `text` | `NOT NULL`, `uq_campuses_school_code (school_id, code)` — 2–3 lettres, entre dans le matricule |
| `address_line` | `text` | `NULL` |
| `district` | `text` | `NULL` — ex. « Alajo », « Kotobabi » |
| `city` | `text` | `NOT NULL DEFAULT 'Accra'` |
| `country_code` | `char(2)` | `NOT NULL DEFAULT 'GH'` |
| `geo_lat` | `numeric(9,6)` | `NULL` |
| `geo_lng` | `numeric(9,6)` | `NULL` |
| `phone` | `text` | `NULL` |
| `whatsapp_number` | `text` | `NULL` |
| `opening_hours` | `jsonb` | `NULL` — **À CONFIRMER** |
| `capacity_students` | `integer` | `NULL CHECK (capacity_students > 0)` — **INCONNU, à mesurer** |
| `is_primary` | `boolean` | `NOT NULL DEFAULT false` |
| `status` | `text` | `NOT NULL DEFAULT 'active'`, `CHECK (status IN ('active','paused','closed'))` |

- **Index :** `uq_campuses_school_code`, `idx_campuses_school_status (school_id, status)`.
- **Contrainte métier :** un seul `is_primary = true` par école → index unique partiel `uq_campuses_primary (school_id) WHERE is_primary`.

---

## 5. Domaine 2 — Identité, rôles et permissions

### `users`

**Rôle :** compte de connexion unique, toutes personnes confondues (personnel, enseignant, étudiant, prospect converti). L'identité est séparée du rôle métier.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `email` | `citext` | `NULL`, `uq_users_school_email (school_id, email) WHERE email IS NOT NULL` |
| `phone` | `text` | `NULL`, `uq_users_school_phone (school_id, phone) WHERE phone IS NOT NULL` |
| `first_name` | `text` | `NOT NULL` |
| `last_name` | `text` | `NOT NULL` |
| `display_name` | `text` | `NULL` |
| `avatar_media_id` | `uuid` | `NULL REFERENCES media_assets(id)` |
| `locale` | `text` | `NOT NULL DEFAULT 'fr'` |
| `auth_provider` | `text` | `NOT NULL DEFAULT 'password'`, `CHECK (auth_provider IN ('password','magic_link','google','phone_otp'))` |
| `password_hash` | `text` | `NULL` — jamais de mot de passe en clair, jamais renvoyé par l'API |
| `mfa_enabled` | `boolean` | `NOT NULL DEFAULT false` |
| `last_login_at` | `timestamptz` | `NULL` |
| `failed_login_count` | `integer` | `NOT NULL DEFAULT 0` |
| `status` | `text` | `NOT NULL DEFAULT 'invited'`, `CHECK (status IN ('invited','active','suspended','disabled'))` |

- **Index :** les deux uniques partiels ci-dessus, `idx_users_school_status (school_id, status)`, `idx_users_name_trgm` en GIN `pg_trgm` sur `first_name || ' ' || last_name` pour la recherche à l'accueil.
- **Contrainte :** `ck_users_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)` — au Ghana beaucoup de prospects n'ont pas d'adresse e-mail active ; le téléphone doit suffire.

### `roles`

**Rôle :** rôle nommé, propre à une école (ou global si `school_id IS NULL` pour les rôles de plateforme). Regroupe un ensemble de permissions.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NULL REFERENCES schools(id)` — `NULL` = rôle système fourni par la plateforme |
| `code` | `text` | `NOT NULL`, `uq_roles_scope_code (COALESCE(school_id,'00000000-...'), code)` |
| `name` | `text` | `NOT NULL` |
| `description` | `text` | `NULL` |
| `scope_level` | `text` | `NOT NULL`, `CHECK (scope_level IN ('platform','organization','school','campus','group','self'))` |
| `is_system` | `boolean` | `NOT NULL DEFAULT false` — un rôle système n'est ni modifiable ni supprimable |

Rôles prévus (repris du brief de vision, complétés) : `platform_operator`, `super_admin`, `school_director`, `admin`, `reception`, `finance`, `marketing`, `crm_agent`, `teacher`, `student`. **`school_director` correspond à la directrice ; `platform_operator` est l'opérateur du logiciel, extérieur à l'école.**

### `permissions`

**Rôle :** catalogue global et figé des actions possibles dans le système. Table de référence, sans `school_id` : une permission a le même sens partout.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `code` | `text` | `NOT NULL`, `uq_permissions_code (code)` — format `<domaine>.<ressource>.<action>` |
| `domain` | `text` | `NOT NULL` — `students`, `finance`, `marketing`, `ai`, `security`… |
| `action` | `text` | `NOT NULL`, `CHECK (action IN ('read','create','update','delete','export','approve'))` |
| `sensitivity` | `text` | `NOT NULL DEFAULT 'normal'`, `CHECK (sensitivity IN ('normal','sensitive','critical'))` |
| `description` | `text` | `NOT NULL` |

Exemples : `students.record.read`, `students.grade.update`, `finance.payment.create`, `finance.report.export`, `security.camera.view_live`, `ai.assistant.use`, `ai.credits.purchase`.

### `role_permissions` *(table de jonction, implicite mais nécessaire)*

**Rôle :** relie un rôle aux permissions qu'il accorde.

| Colonne | Type | Contraintes |
|---|---|---|
| `role_id` | `uuid` | `NOT NULL REFERENCES roles(id) ON DELETE CASCADE` |
| `permission_id` | `uuid` | `NOT NULL REFERENCES permissions(id) ON DELETE CASCADE` |
| — | — | PK composite `(role_id, permission_id)` |

### `role_assignments`

**Rôle :** attribue un rôle à un utilisateur, avec une portée précise (toute l'école, un campus, un groupe). C'est ici que se joue le cloisonnement réel.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `user_id` | `uuid` | `NOT NULL REFERENCES users(id) ON DELETE CASCADE` |
| `role_id` | `uuid` | `NOT NULL REFERENCES roles(id) ON DELETE RESTRICT` |
| `scope_type` | `text` | `NOT NULL`, `CHECK (scope_type IN ('school','campus','group','self'))` |
| `scope_id` | `uuid` | `NULL` — `campuses.id` ou `groups.id` selon `scope_type` |
| `starts_on` | `date` | `NULL` |
| `ends_on` | `date` | `NULL` |
| `granted_by` | `uuid` | `NULL REFERENCES users(id)` |

- **Unicité :** `uq_role_assignments (user_id, role_id, scope_type, COALESCE(scope_id,'0000...'))`.
- **Index :** `idx_role_assignments_user (user_id)`, `idx_role_assignments_scope (scope_type, scope_id)`.
- **Contrainte :** `ck_role_assignments_scope CHECK ((scope_type = 'school' AND scope_id IS NULL) OR (scope_type <> 'school' AND scope_id IS NOT NULL))`.

---

## 6. Domaine 3 — Étudiants

### `students`

**Rôle :** dossier étudiant, distinct du compte de connexion ; c'est l'entité durable qui survit à plusieurs inscriptions successives.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `primary_campus_id` | `uuid` | `NULL REFERENCES campuses(id)` |
| `user_id` | `uuid` | `NULL REFERENCES users(id)` — `NULL` tant que l'étudiant n'a pas d'accès en ligne |
| `student_number` | `text` | `NOT NULL`, `uq_students_school_number (school_id, student_number)` — voir §22 |
| `first_name` | `text` | `NOT NULL` |
| `last_name` | `text` | `NOT NULL` |
| `gender` | `text` | `NULL CHECK (gender IN ('f','m','other','undisclosed'))` |
| `birth_date` | `date` | `NULL` |
| `nationality_code` | `char(2)` | `NULL` — forte proportion de CI, BF, ML, TG, BJ, NE, GN (**hypothèse à quantifier**) |
| `primary_language` | `text` | `NULL` — `fr` majoritaire |
| `phone` | `text` | `NULL` |
| `whatsapp_number` | `text` | `NULL` |
| `email` | `citext` | `NULL` |
| `address_line` | `text` | `NULL` |
| `photo_media_id` | `uuid` | `NULL REFERENCES media_assets(id)` |
| `lead_id` | `uuid` | `NULL REFERENCES leads(id)` — lien vers l'origine commerciale, clé de l'attribution revenu |
| `entry_english_level` | `text` | `NULL` — **À CONFIRMER : TAS utilise-t-il le CECRL (A1–C2) ou une échelle maison ?** |
| `status` | `text` | `NOT NULL DEFAULT 'prospect'`, `CHECK (status IN ('prospect','admitted','active','on_hold','graduated','withdrawn','alumni'))` |
| `first_enrolled_on` | `date` | `NULL` |
| `last_activity_on` | `date` | `NULL` — dernière présence ou paiement, sert au calcul d'abandon |
| `notes` | `text` | `NULL` |

- **Index :** `uq_students_school_number`, `idx_students_school_status (school_id, status)`, `idx_students_name_trgm` (GIN), `idx_students_lead (lead_id)`.
- **Vie privée :** `birth_date`, `nationality_code`, `photo_media_id` sont des données personnelles ; accès conditionné à `students.record.read` et journalisé.

### `student_contacts`

**Rôle :** contacts rattachés à un étudiant (parent, tuteur, garant, contact d'urgence, employeur) ; indispensable pour les mineurs et pour le recouvrement.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `student_id` | `uuid` | `NOT NULL REFERENCES students(id) ON DELETE CASCADE` |
| `relation` | `text` | `NOT NULL CHECK (relation IN ('parent','guardian','sponsor','emergency','employer','other'))` |
| `full_name` | `text` | `NOT NULL` |
| `phone` | `text` | `NULL` |
| `whatsapp_number` | `text` | `NULL` |
| `email` | `citext` | `NULL` |
| `country_code` | `char(2)` | `NULL` — souvent le pays d'origine, payeur à distance |
| `is_primary` | `boolean` | `NOT NULL DEFAULT false` |
| `is_payer` | `boolean` | `NOT NULL DEFAULT false` |
| `can_receive_grades` | `boolean` | `NOT NULL DEFAULT false` — consentement explicite requis |

- **Index :** `idx_student_contacts_student (student_id)`, unique partiel `uq_student_contacts_primary (student_id) WHERE is_primary`.

### `student_documents`

**Rôle :** pièces du dossier (passeport, visa, diplôme, photo d'identité, contrat de logement) avec leur statut de vérification et leur date d'expiration.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `student_id` | `uuid` | `NOT NULL REFERENCES students(id) ON DELETE CASCADE` |
| `application_id` | `uuid` | `NULL REFERENCES applications(id)` |
| `doc_type` | `text` | `NOT NULL CHECK (doc_type IN ('passport','visa','id_card','diploma','transcript','photo','residence_proof','payment_proof','other'))` |
| `media_id` | `uuid` | `NOT NULL REFERENCES media_assets(id)` |
| `issued_on` | `date` | `NULL` |
| `expires_on` | `date` | `NULL` |
| `verification_status` | `text` | `NOT NULL DEFAULT 'pending'`, `CHECK (verification_status IN ('pending','verified','rejected','expired'))` |
| `verified_by` | `uuid` | `NULL REFERENCES users(id)` |
| `verified_at` | `timestamptz` | `NULL` |
| `rejection_reason` | `text` | `NULL` |

- **Index :** `idx_student_documents_student_type (student_id, doc_type)`, `idx_student_documents_expiry (school_id, expires_on) WHERE expires_on IS NOT NULL` — alerte visa expirant, enjeu réel pour un public étranger.

---

## 7. Domaine 4 — Enseignants

### `teachers`

**Rôle :** dossier enseignant ou formateur (18 personnes chez TAS, chiffre validé), avec spécialités et disponibilité.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `user_id` | `uuid` | `NOT NULL REFERENCES users(id)` — un enseignant a toujours un compte |
| `employee_number` | `text` | `NOT NULL`, `uq_teachers_school_number (school_id, employee_number)` |
| `hire_date` | `date` | `NULL` |
| `contract_type` | `text` | `NULL CHECK (contract_type IN ('full_time','part_time','freelance','volunteer'))` — **À CONFIRMER** |
| `specialties` | `text[]` | `NOT NULL DEFAULT '{}'` — valeurs tirées des compétences et modules réels : `grammar`, `vocabulary`, `reading`, `writing`, `listening`, `speaking`, `debate`, `ms_office`, `graphic_design`, `databases`, `digital_marketing`, `networking` |
| `languages` | `text[]` | `NOT NULL DEFAULT '{}'` — capacité à encadrer un public francophone |
| `weekly_hours_target` | `numeric(5,2)` | `NULL` — **À CONFIRMER** |
| `bio` | `text` | `NULL` |
| `photo_media_id` | `uuid` | `NULL REFERENCES media_assets(id)` |
| `is_public_profile` | `boolean` | `NOT NULL DEFAULT false` — affichage sur la page publique `/teachers` |
| `status` | `text` | `NOT NULL DEFAULT 'active'`, `CHECK (status IN ('active','on_leave','inactive'))` |

- **Index :** `uq_teachers_school_number`, `idx_teachers_specialties` GIN sur `specialties`.

### `teacher_assignments`

**Rôle :** affectation d'un enseignant à un groupe (ou à un module) sur une période donnée ; base du calcul de charge et du planning.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `teacher_id` | `uuid` | `NOT NULL REFERENCES teachers(id) ON DELETE CASCADE` |
| `group_id` | `uuid` | `NULL REFERENCES groups(id) ON DELETE CASCADE` |
| `module_id` | `uuid` | `NULL REFERENCES modules(id)` |
| `role_in_group` | `text` | `NOT NULL DEFAULT 'lead'`, `CHECK (role_in_group IN ('lead','assistant','substitute'))` |
| `starts_on` | `date` | `NOT NULL` |
| `ends_on` | `date` | `NULL` |
| `hourly_rate` | `numeric(14,2)` | `NULL` — **INCONNU, sensible, accès `finance.*` uniquement** |
| `currency` | `char(3)` | `NULL` |

- **Unicité :** `uq_teacher_assignments (teacher_id, group_id, module_id, starts_on)`.
- **Index :** `idx_teacher_assignments_group (group_id)`, `idx_teacher_assignments_period (school_id, starts_on, ends_on)`.
- **Contrainte :** `ck_teacher_assignments_target CHECK (group_id IS NOT NULL OR module_id IS NOT NULL)`.

---

## 8. Domaine 5 — Offre pédagogique

### `programs`

**Rôle :** produit pédagogique vendu. Chez TAS, trois entrées vérifiées : anglais intensif 8 h/jour, anglais longue durée 5 h/jour (même contenu, rythme différent), informatique 3 h/jour.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `code` | `text` | `NOT NULL`, `uq_programs_school_code (school_id, code)` — `ENG-INT`, `ENG-LT`, `ICT-STD` |
| `slug` | `text` | `NOT NULL`, `uq_programs_school_slug (school_id, slug)` — sert l'URL publique `/programs/[slug]` |
| `name_fr` | `text` | `NOT NULL` |
| `name_en` | `text` | `NOT NULL` |
| `discipline` | `text` | `NOT NULL CHECK (discipline IN ('english','ict','other'))` |
| `pace` | `text` | `NOT NULL CHECK (pace IN ('intensive','long_track','standard'))` |
| `hours_per_day` | `numeric(4,2)` | `NOT NULL CHECK (hours_per_day > 0)` — 8 / 5 / 3, valeurs vérifiées |
| `days_per_week` | `integer` | `NULL CHECK (days_per_week BETWEEN 1 AND 7)` — **À CONFIRMER** |
| `duration_weeks` | `integer` | `NULL` — **INCONNU** |
| `curriculum_shared_with_program_id` | `uuid` | `NULL REFERENCES programs(id)` — matérialise le fait que l'intensif et le longue durée partagent le même programme |
| `description_fr` | `text` | `NULL` |
| `description_en` | `text` | `NULL` |
| `base_price` | `numeric(14,2)` | `NULL` — **INCONNU : les prix des cours ne sont pas communiqués, ne rien afficher tant qu'ils ne sont pas validés** |
| `currency` | `char(3)` | `NULL` |
| `is_published` | `boolean` | `NOT NULL DEFAULT false` |
| `status` | `text` | `NOT NULL DEFAULT 'draft'`, `CHECK (status IN ('draft','active','retired'))` |

- **Index :** `uq_programs_school_code`, `uq_programs_school_slug`, `idx_programs_published (school_id, is_published)`.
- **Point de conception important :** `curriculum_shared_with_program_id` évite de dupliquer les niveaux et modules entre l'intensif et le longue durée. Le contenu est déclaré une fois, le rythme diffère.

### `levels`

**Rôle :** palier de progression à l'intérieur d'un programme (débutant → avancé), utilisé pour le placement à l'entrée et le passage de niveau.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `program_id` | `uuid` | `NOT NULL REFERENCES programs(id) ON DELETE CASCADE` |
| `code` | `text` | `NOT NULL`, `uq_levels_program_code (program_id, code)` |
| `name_fr` / `name_en` | `text` | `NOT NULL` |
| `sequence` | `integer` | `NOT NULL CHECK (sequence > 0)`, `uq_levels_program_sequence (program_id, sequence)` |
| `cefr_equivalent` | `text` | `NULL CHECK (cefr_equivalent IN ('A1','A2','B1','B2','C1','C2'))` — **À CONFIRMER** |
| `expected_duration_weeks` | `integer` | `NULL` — **INCONNU** |
| `exit_criteria` | `text` | `NULL` |

### `modules`

**Rôle :** unité de contenu enseignée et évaluée. Pour l'anglais : grammaire, vocabulaire, lecture, écriture, écoute, oral, débat. Pour l'informatique : MS Office, graphisme, bases de données, marketing digital, réseaux. Ces douze valeurs sont vérifiées.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `program_id` | `uuid` | `NOT NULL REFERENCES programs(id) ON DELETE CASCADE` |
| `level_id` | `uuid` | `NULL REFERENCES levels(id)` — `NULL` = module transverse à tous les niveaux |
| `code` | `text` | `NOT NULL`, `uq_modules_program_code (program_id, code)` |
| `name_fr` / `name_en` | `text` | `NOT NULL` |
| `skill_area` | `text` | `NOT NULL CHECK (skill_area IN ('grammar','vocabulary','reading','writing','listening','speaking','debate','ms_office','graphic_design','databases','digital_marketing','networking'))` |
| `weight_in_level` | `numeric(5,2)` | `NOT NULL DEFAULT 1 CHECK (weight_in_level > 0)` — pondération dans la moyenne de niveau |
| `sequence` | `integer` | `NOT NULL DEFAULT 1` |
| `hours_total` | `numeric(6,2)` | `NULL` — **À CONFIRMER** |

- **Index :** `idx_modules_program_level (program_id, level_id)`, `idx_modules_skill (school_id, skill_area)`.

---

## 9. Domaine 6 — Calendrier, groupes et salles

### `academic_periods`

**Rôle :** découpage temporel officiel (session, trimestre, mois) servant de cadre aux inscriptions, aux évaluations et à tous les rapports comparatifs.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `code` | `text` | `NOT NULL`, `uq_academic_periods_school_code (school_id, code)` — ex. `2026-S1` |
| `name` | `text` | `NOT NULL` |
| `period_type` | `text` | `NOT NULL CHECK (period_type IN ('year','term','session','month'))` — **À CONFIRMER : quel découpage TAS utilise réellement** |
| `starts_on` | `date` | `NOT NULL` |
| `ends_on` | `date` | `NOT NULL` |
| `is_current` | `boolean` | `NOT NULL DEFAULT false` |
| `status` | `text` | `NOT NULL DEFAULT 'planned'`, `CHECK (status IN ('planned','open','closed','archived'))` |

- **Contraintes :** `ck_academic_periods_dates CHECK (ends_on > starts_on)` ; unique partiel `uq_academic_periods_current (school_id) WHERE is_current`.

### `intakes`

**Rôle :** rentrée ou session d'admission concrète pour un programme donné : c'est l'objet que l'on remplit, qui a une capacité et une date limite. **Le rythme des rentrées de TAS est INCONNU (rentrée mensuelle ? continue ?) — question bloquante, voir §23.**

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `campus_id` | `uuid` | `NULL REFERENCES campuses(id)` |
| `program_id` | `uuid` | `NOT NULL REFERENCES programs(id)` |
| `academic_period_id` | `uuid` | `NULL REFERENCES academic_periods(id)` |
| `code` | `text` | `NOT NULL`, `uq_intakes_school_code (school_id, code)` — ex. `ENG-INT-2026-03` |
| `starts_on` | `date` | `NOT NULL` |
| `ends_on` | `date` | `NULL` |
| `application_deadline` | `date` | `NULL` |
| `capacity` | `integer` | `NULL CHECK (capacity > 0)` — **INCONNU** |
| `seats_taken` | `integer` | `NOT NULL DEFAULT 0 CHECK (seats_taken >= 0)` — dénormalisation maintenue par trigger, source de vérité = `enrollments` |
| `price_override` | `numeric(14,2)` | `NULL` |
| `currency` | `char(3)` | `NULL` |
| `status` | `text` | `NOT NULL DEFAULT 'planned'`, `CHECK (status IN ('planned','open','closing_soon','full','closed','cancelled'))` |

- **Index :** `idx_intakes_open (school_id, status, starts_on)`, `idx_intakes_program (program_id, starts_on)`.
- **Contrainte :** `ck_intakes_capacity CHECK (capacity IS NULL OR seats_taken <= capacity)`.

### `rooms`

**Rôle :** salle physique d'un campus, avec sa capacité et son équipement ; permet de détecter les conflits d'occupation.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `campus_id` | `uuid` | `NOT NULL REFERENCES campuses(id) ON DELETE CASCADE` |
| `code` | `text` | `NOT NULL`, `uq_rooms_campus_code (campus_id, code)` |
| `name` | `text` | `NOT NULL` |
| `room_type` | `text` | `NOT NULL DEFAULT 'classroom'`, `CHECK (room_type IN ('classroom','computer_lab','library','office','meeting','other'))` |
| `capacity` | `integer` | `NULL CHECK (capacity > 0)` — **INCONNU** |
| `equipment` | `text[]` | `NOT NULL DEFAULT '{}'` — `projector`, `whiteboard`, `pcs`, `ac` |
| `status` | `text` | `NOT NULL DEFAULT 'active'`, `CHECK (status IN ('active','maintenance','retired'))` |

### `groups`

**Rôle :** cohorte stable d'étudiants suivant un programme à un niveau donné avec un enseignant principal ; c'est l'unité de vie quotidienne (« la classe » au sens humain).

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `campus_id` | `uuid` | `NOT NULL REFERENCES campuses(id)` |
| `program_id` | `uuid` | `NOT NULL REFERENCES programs(id)` |
| `level_id` | `uuid` | `NULL REFERENCES levels(id)` |
| `intake_id` | `uuid` | `NULL REFERENCES intakes(id)` |
| `academic_period_id` | `uuid` | `NULL REFERENCES academic_periods(id)` |
| `code` | `text` | `NOT NULL`, `uq_groups_school_code (school_id, code)` |
| `name` | `text` | `NOT NULL` |
| `lead_teacher_id` | `uuid` | `NULL REFERENCES teachers(id)` |
| `default_room_id` | `uuid` | `NULL REFERENCES rooms(id)` |
| `max_size` | `integer` | `NULL CHECK (max_size > 0)` — **INCONNU** |
| `current_size` | `integer` | `NOT NULL DEFAULT 0` — dénormalisation par trigger |
| `schedule_pattern` | `jsonb` | `NULL` — récurrence hebdomadaire (jours, heure de début, durée) |
| `starts_on` / `ends_on` | `date` | `starts_on NOT NULL` |
| `status` | `text` | `NOT NULL DEFAULT 'planned'`, `CHECK (status IN ('planned','running','completed','cancelled'))` |

### `classes`

**Rôle :** séance concrète et datée (une occurrence du planning d'un groupe) ; c'est l'objet auquel se rattachent la présence et le contenu réellement traité.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `campus_id` | `uuid` | `NOT NULL REFERENCES campuses(id)` |
| `group_id` | `uuid` | `NOT NULL REFERENCES groups(id) ON DELETE CASCADE` |
| `module_id` | `uuid` | `NULL REFERENCES modules(id)` |
| `teacher_id` | `uuid` | `NULL REFERENCES teachers(id)` — l'enseignant réellement présent, qui peut différer de l'affectation |
| `room_id` | `uuid` | `NULL REFERENCES rooms(id)` |
| `session_date` | `date` | `NOT NULL` |
| `starts_at` | `timestamptz` | `NOT NULL` |
| `ends_at` | `timestamptz` | `NOT NULL` |
| `topic` | `text` | `NULL` |
| `status` | `text` | `NOT NULL DEFAULT 'scheduled'`, `CHECK (status IN ('scheduled','held','cancelled','postponed'))` |
| `cancellation_reason` | `text` | `NULL` |

- **Index :** `idx_classes_group_date (group_id, session_date)`, `idx_classes_teacher_date (teacher_id, session_date)`, `idx_classes_room_time (room_id, starts_at)`.
- **Contrainte forte recommandée :** exclusion de chevauchement d'occupation de salle avec `btree_gist` :
  `EXCLUDE USING gist (room_id WITH =, tstzrange(starts_at, ends_at) WITH &&) WHERE (status <> 'cancelled')`.
  C'est la seule façon fiable d'empêcher deux groupes dans la même salle à la même heure.

---

## 10. Domaine 7 — Candidature et inscription

### `applications`

**Rôle :** demande d'admission déposée par un prospect (formulaire public `/apply`, saisie à l'accueil, ou conversion d'un lead) ; objet d'instruction avec un état.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `campus_id` | `uuid` | `NULL REFERENCES campuses(id)` |
| `reference` | `text` | `NOT NULL`, `uq_applications_school_reference (school_id, reference)` — ex. `APP-2026-000412` |
| `lead_id` | `uuid` | `NULL REFERENCES leads(id)` |
| `student_id` | `uuid` | `NULL REFERENCES students(id)` — renseigné à l'admission |
| `program_id` | `uuid` | `NOT NULL REFERENCES programs(id)` |
| `intake_id` | `uuid` | `NULL REFERENCES intakes(id)` |
| `first_name` / `last_name` | `text` | `NOT NULL` |
| `phone` | `text` | `NULL` |
| `whatsapp_number` | `text` | `NULL` |
| `email` | `citext` | `NULL` |
| `nationality_code` | `char(2)` | `NULL` |
| `current_country_code` | `char(2)` | `NULL` — distingue une candidature depuis l'étranger (visa, logement) d'une candidature locale |
| `needs_accommodation` | `boolean` | `NOT NULL DEFAULT false` |
| `accommodation_tier` | `text` | `NULL CHECK (accommodation_tier IN ('tier_130k','tier_100k','tier_60k'))` — 130 000 / 100 000 / 60 000 CFA par mois, tarifs vérifiés |
| `declared_source` | `text` | `NULL` — réponse à « Comment avez-vous entendu parler de nous ? », à croiser avec `touchpoints` (voir `07-traffic-attribution.md`) |
| `status` | `text` | `NOT NULL DEFAULT 'draft'`, `CHECK (status IN ('draft','submitted','in_review','documents_pending','accepted','rejected','withdrawn','expired'))` |
| `submitted_at` | `timestamptz` | `NULL` |
| `decision_at` | `timestamptz` | `NULL` |
| `decided_by` | `uuid` | `NULL REFERENCES users(id)` |
| `rejection_reason` | `text` | `NULL` |

- **Index :** `idx_applications_status (school_id, status, submitted_at)`, `idx_applications_intake (intake_id)`, `idx_applications_lead (lead_id)`.
- **Anti-doublon :** index unique partiel `uq_applications_dedup (school_id, phone, program_id) WHERE status IN ('submitted','in_review','documents_pending')` — évite les candidatures multiples du même prospect relancé plusieurs fois.

### `enrollments`

**Rôle :** contrat d'inscription effectif d'un étudiant sur un programme et une rentrée, rattaché à un groupe ; c'est l'objet qui génère le chiffre d'affaires attendu.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `campus_id` | `uuid` | `NOT NULL REFERENCES campuses(id)` |
| `student_id` | `uuid` | `NOT NULL REFERENCES students(id)` |
| `application_id` | `uuid` | `NULL REFERENCES applications(id)` |
| `program_id` | `uuid` | `NOT NULL REFERENCES programs(id)` |
| `level_id` | `uuid` | `NULL REFERENCES levels(id)` |
| `intake_id` | `uuid` | `NULL REFERENCES intakes(id)` |
| `group_id` | `uuid` | `NULL REFERENCES groups(id)` |
| `academic_period_id` | `uuid` | `NULL REFERENCES academic_periods(id)` |
| `reference` | `text` | `NOT NULL`, `uq_enrollments_school_reference (school_id, reference)` |
| `enrolled_on` | `date` | `NOT NULL DEFAULT CURRENT_DATE` |
| `starts_on` / `ends_on` | `date` | `NULL` |
| `tuition_amount` | `numeric(14,2)` | `NOT NULL DEFAULT 0` — montant contractualisé, figé à la signature |
| `discount_amount` | `numeric(14,2)` | `NOT NULL DEFAULT 0 CHECK (discount_amount >= 0)` |
| `discount_reason` | `text` | `NULL` |
| `currency` | `char(3)` | `NOT NULL DEFAULT 'GHS'` |
| `status` | `text` | `NOT NULL DEFAULT 'pending'`, `CHECK (status IN ('pending','confirmed','active','suspended','completed','withdrawn','cancelled'))` |
| `withdrawal_reason` | `text` | `NULL` |
| `completed_on` | `date` | `NULL` |

- **Unicité :** `uq_enrollments_active (student_id, program_id, intake_id) WHERE status NOT IN ('cancelled','withdrawn')` — un étudiant ne s'inscrit pas deux fois à la même rentrée du même programme.
- **Index :** `idx_enrollments_group (group_id)`, `idx_enrollments_status (school_id, status)`, `idx_enrollments_period (school_id, enrolled_on)`.
- **Règle :** `tuition_amount` est copié depuis `programs.base_price` ou `intakes.price_override` au moment de la signature et **ne suit pas** les changements de tarif ultérieurs. Un contrat ne se réécrit pas rétroactivement.

---

## 11. Domaine 8 — Vie académique

### `attendance`

**Rôle :** présence d'un étudiant à une séance. Table la plus volumineuse du système (un enregistrement par étudiant et par séance) ; c'est le signal avancé d'abandon le plus fiable.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `campus_id` | `uuid` | `NOT NULL REFERENCES campuses(id)` |
| `class_id` | `uuid` | `NOT NULL REFERENCES classes(id) ON DELETE CASCADE` |
| `student_id` | `uuid` | `NOT NULL REFERENCES students(id)` |
| `enrollment_id` | `uuid` | `NULL REFERENCES enrollments(id)` |
| `status` | `text` | `NOT NULL CHECK (status IN ('present','late','absent_justified','absent_unjustified','excused'))` |
| `minutes_late` | `integer` | `NULL CHECK (minutes_late >= 0)` |
| `recorded_by` | `uuid` | `NULL REFERENCES users(id)` |
| `recorded_at` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `comment` | `text` | `NULL` |

- **Unicité :** `uq_attendance (class_id, student_id)`.
- **Index :** `idx_attendance_student_date (student_id, recorded_at DESC)`, `idx_attendance_school_status (school_id, status)`.
- **Volumétrie :** à 300 étudiants actifs × 20 séances par mois, environ 72 000 lignes par an. Partitionnement par année envisageable mais non nécessaire à court terme.

### `assessments`

**Rôle :** épreuve ou devoir défini au niveau d'un module ou d'un groupe (test de placement, contrôle continu, examen final) ; c'est le contenant, les notes sont dans `grades`.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `group_id` | `uuid` | `NULL REFERENCES groups(id)` |
| `module_id` | `uuid` | `NULL REFERENCES modules(id)` |
| `academic_period_id` | `uuid` | `NULL REFERENCES academic_periods(id)` |
| `title` | `text` | `NOT NULL` |
| `assessment_type` | `text` | `NOT NULL CHECK (assessment_type IN ('placement','quiz','assignment','midterm','final','oral','project'))` |
| `max_score` | `numeric(6,2)` | `NOT NULL CHECK (max_score > 0)` — **À CONFIRMER : échelle sur 20, sur 100 ou lettres ?** |
| `pass_score` | `numeric(6,2)` | `NULL` |
| `weight` | `numeric(5,2)` | `NOT NULL DEFAULT 1` |
| `scheduled_on` | `date` | `NULL` |
| `created_by_teacher_id` | `uuid` | `NULL REFERENCES teachers(id)` |
| `status` | `text` | `NOT NULL DEFAULT 'draft'`, `CHECK (status IN ('draft','scheduled','held','graded','published','cancelled'))` |

### `grades`

**Rôle :** note obtenue par un étudiant à une évaluation. Donnée sensible : jamais visible par un autre étudiant, jamais par un enseignant hors de son groupe.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `assessment_id` | `uuid` | `NOT NULL REFERENCES assessments(id) ON DELETE CASCADE` |
| `student_id` | `uuid` | `NOT NULL REFERENCES students(id)` |
| `enrollment_id` | `uuid` | `NULL REFERENCES enrollments(id)` |
| `score` | `numeric(6,2)` | `NULL CHECK (score >= 0)` — `NULL` = non rendu |
| `is_absent` | `boolean` | `NOT NULL DEFAULT false` |
| `letter_grade` | `text` | `NULL` |
| `feedback` | `text` | `NULL` |
| `graded_by` | `uuid` | `NULL REFERENCES users(id)` |
| `graded_at` | `timestamptz` | `NULL` |
| `published_at` | `timestamptz` | `NULL` — tant que `NULL`, invisible côté étudiant |

- **Unicité :** `uq_grades (assessment_id, student_id)`.
- **Contrainte :** `ck_grades_score_max` — vérification `score <= assessments.max_score` via trigger (une contrainte `CHECK` ne peut pas lire une autre table).
- **Historique :** toute modification d'une note publiée doit produire une ligne dans `audit_logs` avec l'ancienne et la nouvelle valeur. Non négociable.

### `certificates`

**Rôle :** attestation ou certificat délivré en fin de parcours, avec un code de vérification publique pour éviter les faux.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `student_id` | `uuid` | `NOT NULL REFERENCES students(id)` |
| `enrollment_id` | `uuid` | `NULL REFERENCES enrollments(id)` |
| `program_id` | `uuid` | `NULL REFERENCES programs(id)` |
| `level_id` | `uuid` | `NULL REFERENCES levels(id)` |
| `certificate_number` | `text` | `NOT NULL`, `uq_certificates_number (school_id, certificate_number)` |
| `verification_code` | `text` | `NOT NULL`, `uq_certificates_verification (verification_code)` — unique globalement, exposé sur une page publique de vérification |
| `title` | `text` | `NOT NULL` |
| `issued_on` | `date` | `NOT NULL` |
| `final_score` | `numeric(6,2)` | `NULL` |
| `media_id` | `uuid` | `NULL REFERENCES media_assets(id)` — PDF généré |
| `status` | `text` | `NOT NULL DEFAULT 'issued'`, `CHECK (status IN ('draft','issued','revoked','reissued'))` |
| `revoked_reason` | `text` | `NULL` |

---

## 12. Domaine 9 — Finance

### `payment_plans`

**Rôle :** échéancier négocié pour une inscription (paiement intégral, en deux fois, mensuel) ; base des relances et du calcul des impayés.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `enrollment_id` | `uuid` | `NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE` |
| `student_id` | `uuid` | `NOT NULL REFERENCES students(id)` |
| `plan_type` | `text` | `NOT NULL CHECK (plan_type IN ('full','two_installments','monthly','custom'))` |
| `total_amount` | `numeric(14,2)` | `NOT NULL CHECK (total_amount >= 0)` |
| `currency` | `char(3)` | `NOT NULL DEFAULT 'GHS'` |
| `installments_count` | `integer` | `NOT NULL DEFAULT 1 CHECK (installments_count >= 1)` |
| `status` | `text` | `NOT NULL DEFAULT 'active'`, `CHECK (status IN ('draft','active','completed','defaulted','cancelled'))` |
| `approved_by` | `uuid` | `NULL REFERENCES users(id)` |

### `payment_plan_items` *(échéances — nécessaire, sinon les relances sont impossibles)*

**Rôle :** une échéance datée d'un échéancier, avec son montant attendu et son état de règlement.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `payment_plan_id` | `uuid` | `NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE` |
| `sequence` | `integer` | `NOT NULL`, `uq_plan_items (payment_plan_id, sequence)` |
| `due_date` | `date` | `NOT NULL` |
| `amount_due` | `numeric(14,2)` | `NOT NULL CHECK (amount_due > 0)` |
| `amount_paid` | `numeric(14,2)` | `NOT NULL DEFAULT 0` |
| `status` | `text` | `NOT NULL DEFAULT 'pending'`, `CHECK (status IN ('pending','partial','paid','overdue','waived'))` |

- **Index :** `idx_plan_items_due (school_id, due_date, status)` — requête quotidienne des échéances à relancer.

### `payments`

**Rôle :** encaissement réel. Table append-only : une erreur se corrige par une ligne de remboursement ou d'annulation, jamais par une modification.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `campus_id` | `uuid` | `NULL REFERENCES campuses(id)` |
| `student_id` | `uuid` | `NOT NULL REFERENCES students(id)` |
| `enrollment_id` | `uuid` | `NULL REFERENCES enrollments(id)` |
| `payment_plan_item_id` | `uuid` | `NULL REFERENCES payment_plan_items(id)` |
| `payment_type` | `text` | `NOT NULL CHECK (payment_type IN ('tuition','registration','accommodation','exam','material','other','refund'))` |
| `direction` | `text` | `NOT NULL DEFAULT 'in'`, `CHECK (direction IN ('in','out'))` |
| `amount` | `numeric(14,2)` | `NOT NULL CHECK (amount > 0)` |
| `currency` | `char(3)` | `NOT NULL DEFAULT 'GHS'` |
| `fx_rate_to_base` | `numeric(16,6)` | `NULL` — obligatoire si `currency <> schools.currency` ; sans cela un paiement en CFA est incomparable à un paiement en GHS |
| `method` | `text` | `NOT NULL CHECK (method IN ('cash','mobile_money','bank_transfer','card','cheque','other'))` |
| `provider_reference` | `text` | `NULL` — référence Mobile Money ou bancaire |
| `paid_at` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `received_by` | `uuid` | `NULL REFERENCES users(id)` |
| `payer_contact_id` | `uuid` | `NULL REFERENCES student_contacts(id)` — le payeur est souvent un parent à l'étranger |
| `status` | `text` | `NOT NULL DEFAULT 'confirmed'`, `CHECK (status IN ('pending','confirmed','failed','refunded','cancelled'))` |
| `reversal_of_payment_id` | `uuid` | `NULL REFERENCES payments(id)` |
| `notes` | `text` | `NULL` |

- **Index :** `idx_payments_student (student_id, paid_at DESC)`, `idx_payments_school_date (school_id, paid_at)`, `idx_payments_method (school_id, method)`, `uq_payments_provider_ref (school_id, provider_reference) WHERE provider_reference IS NOT NULL` (idempotence Mobile Money).
- **Règle :** `UPDATE` interdit hors passage `pending → confirmed/failed`. Appliqué par trigger, pas par convention orale.

### `receipts`

**Rôle :** document de reçu remis à l'étudiant, numéroté de façon séquentielle et sans trou — exigence comptable élémentaire.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `campus_id` | `uuid` | `NULL REFERENCES campuses(id)` |
| `payment_id` | `uuid` | `NOT NULL REFERENCES payments(id)`, `uq_receipts_payment (payment_id)` |
| `receipt_number` | `text` | `NOT NULL`, `uq_receipts_number (school_id, receipt_number)` — voir §22 |
| `sequence_year` | `integer` | `NOT NULL` |
| `sequence_value` | `bigint` | `NOT NULL`, `uq_receipts_sequence (school_id, campus_id, sequence_year, sequence_value)` |
| `issued_at` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `issued_by` | `uuid` | `NULL REFERENCES users(id)` |
| `pdf_media_id` | `uuid` | `NULL REFERENCES media_assets(id)` |
| `snapshot` | `jsonb` | `NOT NULL` — copie figée des informations imprimées (nom, programme, montant) pour que le reçu reste fidèle même si la fiche évolue |
| `status` | `text` | `NOT NULL DEFAULT 'issued'`, `CHECK (status IN ('issued','cancelled','replaced'))` |

---

## 13. Domaine 10 — CRM et acquisition

### `lead_sources`

**Rôle :** référentiel normalisé des origines de prospects ; sans lui, le champ « comment nous avez-vous connus » se transforme en texte libre inexploitable.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `code` | `text` | `NOT NULL`, `uq_lead_sources_school_code (school_id, code)` — `facebook_ads`, `instagram_organic`, `tiktok_organic`, `google_search`, `whatsapp_direct`, `referral_student`, `walk_in`, `flyer`, `agent`, `radio` |
| `label_fr` / `label_en` | `text` | `NOT NULL` |
| `category` | `text` | `NOT NULL CHECK (category IN ('paid','organic','referral','offline','direct','partner','unknown'))` |
| `is_online` | `boolean` | `NOT NULL DEFAULT true` |
| `is_active` | `boolean` | `NOT NULL DEFAULT true` |

### `leads`

**Rôle :** prospect identifié (a laissé un moyen de contact), avec son état d'avancement commercial et son origine attribuée. Cœur du CRM.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `campus_id` | `uuid` | `NULL REFERENCES campuses(id)` |
| `visitor_id` | `uuid` | `NULL` — identifiant anonyme du navigateur, clé de la réconciliation avec `touchpoints` |
| `first_name` | `text` | `NULL` |
| `last_name` | `text` | `NULL` |
| `phone` | `text` | `NULL` |
| `whatsapp_number` | `text` | `NULL` |
| `email` | `citext` | `NULL` |
| `country_code` | `char(2)` | `NULL` |
| `preferred_language` | `text` | `NULL DEFAULT 'fr'` |
| `interest_program_id` | `uuid` | `NULL REFERENCES programs(id)` |
| `interest_intake_id` | `uuid` | `NULL REFERENCES intakes(id)` |
| `lead_source_id` | `uuid` | `NULL REFERENCES lead_sources(id)` — source **attribuée** (issue du tracking) |
| `declared_source_text` | `text` | `NULL` — source **déclarée** par la personne, conservée brute |
| `first_touch_id` | `uuid` | `NULL REFERENCES touchpoints(id)` |
| `last_touch_id` | `uuid` | `NULL REFERENCES touchpoints(id)` |
| `owner_user_id` | `uuid` | `NULL REFERENCES users(id)` — agent CRM responsable |
| `score` | `integer` | `NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100)` — **méthode de scoring à définir, hypothèse** |
| `status` | `text` | `NOT NULL DEFAULT 'new'`, `CHECK (status IN ('new','contacted','qualified','nurturing','application_started','converted','lost','duplicate','invalid'))` |
| `lost_reason` | `text` | `NULL CHECK (lost_reason IN ('price','location','timing','language','competitor','no_response','not_serious','other'))` |
| `converted_student_id` | `uuid` | `NULL REFERENCES students(id)` |
| `first_contact_at` | `timestamptz` | `NULL` |
| `last_contact_at` | `timestamptz` | `NULL` |
| `next_action_at` | `timestamptz` | `NULL` |
| `consent_marketing` | `boolean` | `NOT NULL DEFAULT false` |

- **Index :** `idx_leads_status_owner (school_id, status, owner_user_id)`, `idx_leads_next_action (school_id, next_action_at) WHERE status NOT IN ('converted','lost')`, `idx_leads_phone (school_id, phone)`, `idx_leads_visitor (visitor_id)`.
- **Anti-doublon :** `uq_leads_phone_open (school_id, phone) WHERE phone IS NOT NULL AND status NOT IN ('lost','duplicate','invalid')`. Le téléphone est la clé naturelle réelle dans ce contexte, pas l'e-mail.

### `followups`

**Rôle :** trace de chaque interaction commerciale (appel, message WhatsApp, visite, e-mail) et de la relance planifiée ; permet de mesurer le délai de première réponse.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `lead_id` | `uuid` | `NULL REFERENCES leads(id) ON DELETE CASCADE` |
| `student_id` | `uuid` | `NULL REFERENCES students(id)` |
| `application_id` | `uuid` | `NULL REFERENCES applications(id)` |
| `channel` | `text` | `NOT NULL CHECK (channel IN ('whatsapp','phone','sms','email','in_person','social_dm','other'))` |
| `direction` | `text` | `NOT NULL CHECK (direction IN ('inbound','outbound'))` |
| `occurred_at` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `duration_seconds` | `integer` | `NULL` |
| `summary` | `text` | `NULL` |
| `outcome` | `text` | `NULL CHECK (outcome IN ('answered','no_answer','wrong_number','interested','not_interested','callback_requested','visit_scheduled','converted'))` |
| `next_action` | `text` | `NULL` |
| `next_action_at` | `timestamptz` | `NULL` |
| `performed_by` | `uuid` | `NULL REFERENCES users(id)` |

- **Contrainte :** `ck_followups_target CHECK (lead_id IS NOT NULL OR student_id IS NOT NULL OR application_id IS NOT NULL)`.
- **Index :** `idx_followups_lead_time (lead_id, occurred_at DESC)`, `idx_followups_agent (performed_by, occurred_at)`.

---

## 14. Domaine 11 — Marketing, contenu et attribution

### `campaigns`

**Rôle :** campagne marketing (payante ou organique) avec son budget et sa période ; unité de comparaison du coût d'acquisition.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `campus_id` | `uuid` | `NULL REFERENCES campuses(id)` |
| `name` | `text` | `NOT NULL` |
| `utm_campaign` | `text` | `NOT NULL`, `uq_campaigns_utm (school_id, utm_campaign)` — clé de jointure avec le trafic réel |
| `channel` | `text` | `NOT NULL CHECK (channel IN ('facebook','instagram','tiktok','youtube','google','whatsapp','email','offline','other'))` |
| `objective` | `text` | `NOT NULL CHECK (objective IN ('awareness','traffic','leads','applications','enrollments','retention'))` |
| `target_program_id` | `uuid` | `NULL REFERENCES programs(id)` |
| `target_intake_id` | `uuid` | `NULL REFERENCES intakes(id)` |
| `budget_amount` | `numeric(14,2)` | `NULL` |
| `spend_amount` | `numeric(14,2)` | `NOT NULL DEFAULT 0` — saisi manuellement tant qu'aucune API publicitaire n'est branchée |
| `currency` | `char(3)` | `NOT NULL DEFAULT 'GHS'` |
| `starts_on` / `ends_on` | `date` | `starts_on NOT NULL` |
| `status` | `text` | `NOT NULL DEFAULT 'draft'`, `CHECK (status IN ('draft','running','paused','completed','cancelled'))` |
| `owner_user_id` | `uuid` | `NULL REFERENCES users(id)` |

### `creatives`

**Rôle :** visuel ou vidéo publicitaire concret rattaché à une campagne ; permet de savoir *quel contenu* génère des inscriptions, pas seulement quelle campagne.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `campaign_id` | `uuid` | `NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE` |
| `name` | `text` | `NOT NULL` |
| `utm_content` | `text` | `NOT NULL`, `uq_creatives_utm (campaign_id, utm_content)` |
| `format` | `text` | `NOT NULL CHECK (format IN ('image','video','carousel','story','reel','text','flyer','qr'))` |
| `language` | `text` | `NOT NULL DEFAULT 'fr'` |
| `media_id` | `uuid` | `NULL REFERENCES media_assets(id)` |
| `hook_text` | `text` | `NULL` |
| `landing_url` | `text` | `NULL` |
| `impressions` / `clicks` | `bigint` | `NOT NULL DEFAULT 0` — saisie manuelle, données déclarées par la plateforme publicitaire |
| `spend_amount` | `numeric(14,2)` | `NOT NULL DEFAULT 0` |
| `status` | `text` | `NOT NULL DEFAULT 'draft'`, `CHECK (status IN ('draft','live','paused','archived'))` |

### `traffic_events`

**Rôle :** événement brut de navigation sur le site public (page vue, clic sortant, soumission de formulaire). Append-only, forte volumétrie, anonyme par défaut.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `bigserial` | PK — un `bigint` séquentiel est préférable à un UUID sur une table à fort débit |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `visitor_id` | `uuid` | `NOT NULL` — identifiant de premier niveau stocké côté client, durée de vie limitée |
| `session_id` | `uuid` | `NOT NULL` |
| `user_id` | `uuid` | `NULL REFERENCES users(id)` — renseigné après identification |
| `event_type` | `text` | `NOT NULL CHECK (event_type IN ('page_view','scroll_50','scroll_90','time_30s','cta_click','outbound_click','whatsapp_click','phone_click','form_start','form_submit','file_download','video_play'))` |
| `occurred_at` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `page_path` | `text` | `NULL` |
| `referrer_host` | `text` | `NULL` |
| `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` / `utm_term` | `text` | `NULL` |
| `landing_path` | `text` | `NULL` |
| `device_type` | `text` | `NULL CHECK (device_type IN ('mobile','tablet','desktop','unknown'))` |
| `country_code` | `char(2)` | `NULL` — dérivé de l'IP, l'IP elle-même n'est pas stockée |
| `locale` | `text` | `NULL` |
| `consent_state` | `text` | `NOT NULL DEFAULT 'unknown'`, `CHECK (consent_state IN ('granted','denied','unknown'))` |
| `payload` | `jsonb` | `NULL` |

- **Index :** `idx_traffic_events_school_time (school_id, occurred_at DESC)`, `idx_traffic_events_session (session_id)`, `idx_traffic_events_visitor (visitor_id)`, `idx_traffic_events_utm (school_id, utm_source, utm_medium, utm_campaign)`.
- **Rétention :** purge ou agrégation au-delà de 14 mois (comparaison année sur année possible, pas de conservation indéfinie).
- **Partitionnement :** par mois (`PARTITION BY RANGE (occurred_at)`) dès que le volume dépasse quelques millions de lignes.

### `touchpoints`

**Rôle :** point de contact qualifié et durable d'un visiteur ou d'un lead avec un canal. Version consolidée et interprétable de `traffic_events`, enrichie des contacts hors ligne.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `visitor_id` | `uuid` | `NULL` |
| `lead_id` | `uuid` | `NULL REFERENCES leads(id)` |
| `student_id` | `uuid` | `NULL REFERENCES students(id)` |
| `channel` | `text` | `NOT NULL CHECK (channel IN ('facebook','instagram','tiktok','youtube','google','whatsapp','direct','referral','flyer','agent','walk_in','radio','other'))` |
| `lead_source_id` | `uuid` | `NULL REFERENCES lead_sources(id)` |
| `campaign_id` | `uuid` | `NULL REFERENCES campaigns(id)` |
| `creative_id` | `uuid` | `NULL REFERENCES creatives(id)` |
| `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` / `utm_term` | `text` | `NULL` |
| `short_code` | `text` | `NULL` — code court d'un flyer ou d'un QR code |
| `occurred_at` | `timestamptz` | `NOT NULL` |
| `touch_position` | `text` | `NOT NULL DEFAULT 'middle'`, `CHECK (touch_position IN ('first','middle','last'))` — recalculé par traitement, non saisi |
| `is_offline` | `boolean` | `NOT NULL DEFAULT false` |
| `evidence` | `text` | `NULL CHECK (evidence IN ('tracked','declared','inferred'))` — distingue une mesure d'une déclaration, essentiel pour l'honnêteté du reporting |

- **Index :** `idx_touchpoints_lead_time (lead_id, occurred_at)`, `idx_touchpoints_visitor (visitor_id, occurred_at)`, `idx_touchpoints_campaign (campaign_id)`.

### `conversions`

**Rôle :** enregistrement d'une étape franchie du tunnel, avec la valeur économique associée et la source attribuée. C'est la table qui permet de dire « cette source a rapporté X ».

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `conversion_type` | `text` | `NOT NULL CHECK (conversion_type IN ('lead','qualified_lead','application','enrollment','first_payment','full_payment','active_student'))` |
| `lead_id` | `uuid` | `NULL REFERENCES leads(id)` |
| `application_id` | `uuid` | `NULL REFERENCES applications(id)` |
| `enrollment_id` | `uuid` | `NULL REFERENCES enrollments(id)` |
| `student_id` | `uuid` | `NULL REFERENCES students(id)` |
| `payment_id` | `uuid` | `NULL REFERENCES payments(id)` |
| `occurred_at` | `timestamptz` | `NOT NULL` |
| `value_amount` | `numeric(14,2)` | `NOT NULL DEFAULT 0` |
| `currency` | `char(3)` | `NOT NULL DEFAULT 'GHS'` |
| `attribution_model` | `text` | `NOT NULL CHECK (attribution_model IN ('first_touch','last_touch','linear','position_based','declared'))` |
| `attributed_channel` | `text` | `NULL` |
| `attributed_campaign_id` | `uuid` | `NULL REFERENCES campaigns(id)` |
| `attributed_creative_id` | `uuid` | `NULL REFERENCES creatives(id)` |
| `attribution_weight` | `numeric(5,4)` | `NOT NULL DEFAULT 1 CHECK (attribution_weight > 0 AND attribution_weight <= 1)` |

- **Unicité :** `uq_conversions (conversion_type, COALESCE(lead_id,...), COALESCE(enrollment_id,...), attribution_model)` — évite de compter deux fois la même conversion.
- **Point clé :** plusieurs lignes par conversion en multi-touch, une par canal, avec des poids dont la somme vaut 1. Toute somme de revenu doit donc toujours filtrer sur un seul `attribution_model`. Piège classique de double comptage, détaillé dans `07-traffic-attribution.md`.

### `social_channels`

**Rôle :** compte social de l'école (page Facebook, compte Instagram, TikTok, chaîne YouTube, numéro WhatsApp Business) et ses métriques déclarées.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `platform` | `text` | `NOT NULL CHECK (platform IN ('facebook','instagram','tiktok','youtube','linkedin','whatsapp','x','other'))` |
| `handle` | `text` | `NOT NULL`, `uq_social_channels (school_id, platform, handle)` |
| `profile_url` | `text` | `NULL` |
| `followers_count` | `integer` | `NOT NULL DEFAULT 0` — **indicateur de vanité, voir `06-kpi-dictionary.md`** |
| `followers_updated_at` | `timestamptz` | `NULL` |
| `is_primary` | `boolean` | `NOT NULL DEFAULT false` |
| `managed_by_user_id` | `uuid` | `NULL REFERENCES users(id)` |
| `status` | `text` | `NOT NULL DEFAULT 'active'`, `CHECK (status IN ('active','paused','archived'))` |

### `content_calendar`

**Rôle :** calendrier éditorial : ce qui doit être publié, où, quand, par qui, et avec quel résultat. Relie la production de contenu aux six piliers marketing du brief.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `campus_id` | `uuid` | `NULL REFERENCES campuses(id)` |
| `title` | `text` | `NOT NULL` |
| `pillar` | `text` | `NOT NULL CHECK (pillar IN ('social_proof','education','school_life','transformation','offers','international'))` |
| `content_type` | `text` | `NOT NULL CHECK (content_type IN ('post','reel','story','video','article','carousel','live','flyer'))` |
| `social_channel_id` | `uuid` | `NULL REFERENCES social_channels(id)` |
| `campaign_id` | `uuid` | `NULL REFERENCES campaigns(id)` |
| `media_id` | `uuid` | `NULL REFERENCES media_assets(id)` |
| `language` | `text` | `NOT NULL DEFAULT 'fr'` |
| `copy_text` | `text` | `NULL` |
| `scheduled_for` | `timestamptz` | `NULL` |
| `published_at` | `timestamptz` | `NULL` |
| `published_url` | `text` | `NULL` |
| `assignee_user_id` | `uuid` | `NULL REFERENCES users(id)` |
| `approval_status` | `text` | `NOT NULL DEFAULT 'draft'`, `CHECK (approval_status IN ('draft','pending_review','approved','rejected'))` |
| `status` | `text` | `NOT NULL DEFAULT 'idea'`, `CHECK (status IN ('idea','in_production','scheduled','published','archived'))` |
| `ai_generated` | `boolean` | `NOT NULL DEFAULT false` — tout contenu produit par l'IA est marqué et relu par un humain avant publication |

- **Index :** `idx_content_calendar_schedule (school_id, scheduled_for)`, `idx_content_calendar_pillar (school_id, pillar)`.

---

## 15. Domaine 12 — Formation en ligne et médias

> Ce domaine couvre les contenus pédagogiques diffusés par la plateforme
> (support de cours, révisions, éventuelle offre à distance). **Aucune décision
> n'est prise sur l'existence réelle d'une offre en ligne chez TAS : à confirmer.**

### `training_courses`

**Rôle :** cours en ligne publiable, indépendant du planning en présentiel ; sert de support de révision ou de produit distinct.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `program_id` | `uuid` | `NULL REFERENCES programs(id)` |
| `slug` | `text` | `NOT NULL`, `uq_training_courses_slug (school_id, slug)` |
| `title_fr` / `title_en` | `text` | `NOT NULL` |
| `summary` | `text` | `NULL` |
| `cover_media_id` | `uuid` | `NULL REFERENCES media_assets(id)` |
| `level_hint` | `text` | `NULL` |
| `access_mode` | `text` | `NOT NULL DEFAULT 'enrolled_only'`, `CHECK (access_mode IN ('public','enrolled_only','paid','staff_only'))` |
| `price_amount` | `numeric(14,2)` | `NULL` |
| `currency` | `char(3)` | `NULL` |
| `status` | `text` | `NOT NULL DEFAULT 'draft'`, `CHECK (status IN ('draft','published','archived'))` |

### `training_modules`

**Rôle :** chapitre d'un cours en ligne, ordonné ; regroupe des leçons.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `training_course_id` | `uuid` | `NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE` |
| `title` | `text` | `NOT NULL` |
| `sequence` | `integer` | `NOT NULL`, `uq_training_modules_seq (training_course_id, sequence)` |
| `summary` | `text` | `NULL` |
| `is_published` | `boolean` | `NOT NULL DEFAULT false` |

### `training_lessons`

**Rôle :** unité atomique de contenu (vidéo, texte, quiz, document) consommée par l'apprenant.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `training_module_id` | `uuid` | `NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE` |
| `title` | `text` | `NOT NULL` |
| `sequence` | `integer` | `NOT NULL`, `uq_training_lessons_seq (training_module_id, sequence)` |
| `lesson_type` | `text` | `NOT NULL CHECK (lesson_type IN ('video','text','pdf','quiz','audio','link'))` |
| `media_id` | `uuid` | `NULL REFERENCES media_assets(id)` |
| `body` | `text` | `NULL` |
| `duration_seconds` | `integer` | `NULL` |
| `is_free_preview` | `boolean` | `NOT NULL DEFAULT false` |
| `is_published` | `boolean` | `NOT NULL DEFAULT false` |

### `media_assets`

**Rôle :** référentiel unique de tous les fichiers (photos du site, documents étudiants, PDF de reçus, vidéos de cours, exports de caméra). Aucune autre table ne stocke d'URL de fichier en dur.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `storage_provider` | `text` | `NOT NULL DEFAULT 'local'`, `CHECK (storage_provider IN ('local','s3','supabase','cloudinary','other'))` |
| `storage_key` | `text` | `NOT NULL`, `uq_media_assets_key (storage_provider, storage_key)` |
| `mime_type` | `text` | `NOT NULL` |
| `byte_size` | `bigint` | `NOT NULL CHECK (byte_size >= 0)` |
| `width` / `height` | `integer` | `NULL` |
| `duration_seconds` | `integer` | `NULL` |
| `checksum_sha256` | `text` | `NULL` — détection de doublons |
| `visibility` | `text` | `NOT NULL DEFAULT 'private'`, `CHECK (visibility IN ('public','private','restricted'))` |
| `category` | `text` | `NOT NULL CHECK (category IN ('site','student_doc','receipt','certificate','course','marketing','camera','avatar','other'))` |
| `alt_text_fr` / `alt_text_en` | `text` | `NULL` — accessibilité, obligatoire pour `category = 'site'` |
| `uploaded_by` | `uuid` | `NULL REFERENCES users(id)` |
| `retention_until` | `date` | `NULL` — purge automatique des exports de caméra |

---

## 16. Domaine 13 — Sécurité physique et caméras

> **Avertissement de conception.** La vidéosurveillance dans un établissement
> scolaire touche à la vie privée d'étudiants dont certains sont mineurs. Le
> modèle ci-dessous encadre l'accès plutôt qu'il ne le facilite : pas de flux
> visible sans permission nommée, pas de visionnage non journalisé, pas de
> caméra dans les espaces privés. **Le cadre légal ghanéen applicable
> (Data Protection Act 2012) est À CONFIRMER avec un conseil local.**

### `cameras`

**Rôle :** inventaire des caméras d'un campus avec leur zone de couverture et leur statut technique.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `campus_id` | `uuid` | `NOT NULL REFERENCES campuses(id) ON DELETE CASCADE` |
| `room_id` | `uuid` | `NULL REFERENCES rooms(id)` |
| `code` | `text` | `NOT NULL`, `uq_cameras_campus_code (campus_id, code)` |
| `label` | `text` | `NOT NULL` |
| `zone_type` | `text` | `NOT NULL CHECK (zone_type IN ('entrance','corridor','classroom','lab','courtyard','reception','perimeter'))` |
| `stream_reference` | `text` | `NULL` — identifiant opaque du flux, jamais une URL avec identifiants |
| `records_audio` | `boolean` | `NOT NULL DEFAULT false` — l'audio est un cran plus intrusif, doit être explicite |
| `retention_days` | `integer` | `NOT NULL DEFAULT 30 CHECK (retention_days BETWEEN 1 AND 90)` — **durée à valider juridiquement** |
| `is_privacy_sensitive` | `boolean` | `NOT NULL DEFAULT false` |
| `installed_on` | `date` | `NULL` |
| `status` | `text` | `NOT NULL DEFAULT 'active'`, `CHECK (status IN ('active','offline','maintenance','decommissioned'))` |

### `camera_permissions`

**Rôle :** autorisation nominative et bornée dans le temps d'accéder à une caméra ou à une zone ; le visionnage n'est jamais un droit implicite d'un rôle.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `camera_id` | `uuid` | `NULL REFERENCES cameras(id) ON DELETE CASCADE` |
| `campus_id` | `uuid` | `NULL REFERENCES campuses(id)` — permission de zone si `camera_id IS NULL` |
| `user_id` | `uuid` | `NOT NULL REFERENCES users(id) ON DELETE CASCADE` |
| `access_level` | `text` | `NOT NULL CHECK (access_level IN ('live_view','playback','export','manage'))` |
| `granted_by` | `uuid` | `NOT NULL REFERENCES users(id)` |
| `reason` | `text` | `NOT NULL` — motif obligatoire, y compris pour la direction |
| `starts_at` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `expires_at` | `timestamptz` | `NULL` — une permission permanente doit être un choix explicite |
| `revoked_at` | `timestamptz` | `NULL` |

- **Unicité :** `uq_camera_permissions (user_id, COALESCE(camera_id,'0...'), COALESCE(campus_id,'0...'), access_level) WHERE revoked_at IS NULL`.
- **Règle :** chaque visionnage effectif écrit une ligne dans `audit_logs` (`action = 'camera.view'`). Une permission sans journal d'usage n'a aucune valeur de contrôle.

### `security_incidents`

**Rôle :** registre des incidents (physiques ou numériques) : intrusion, vol, accident, bagarre, fuite de données ; base du suivi et du traitement.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `campus_id` | `uuid` | `NULL REFERENCES campuses(id)` |
| `reference` | `text` | `NOT NULL`, `uq_security_incidents_ref (school_id, reference)` |
| `incident_type` | `text` | `NOT NULL CHECK (incident_type IN ('intrusion','theft','accident','altercation','harassment','fire','data_breach','account_compromise','other'))` |
| `severity` | `text` | `NOT NULL CHECK (severity IN ('low','medium','high','critical'))` |
| `occurred_at` | `timestamptz` | `NOT NULL` |
| `detected_at` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `location_text` | `text` | `NULL` |
| `camera_id` | `uuid` | `NULL REFERENCES cameras(id)` |
| `reported_by` | `uuid` | `NULL REFERENCES users(id)` |
| `involves_student_ids` | `uuid[]` | `NOT NULL DEFAULT '{}'` — accès très restreint |
| `description` | `text` | `NOT NULL` |
| `actions_taken` | `text` | `NULL` |
| `status` | `text` | `NOT NULL DEFAULT 'open'`, `CHECK (status IN ('open','investigating','resolved','closed','escalated'))` |
| `resolved_at` | `timestamptz` | `NULL` |

---

## 17. Domaine 14 — Notifications et audit

### `notifications`

**Rôle :** message sortant ou interne destiné à un utilisateur ou à un contact (rappel d'échéance, absence répétée, relance de lead, alerte de crédits IA).

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `recipient_user_id` | `uuid` | `NULL REFERENCES users(id)` |
| `recipient_contact_id` | `uuid` | `NULL REFERENCES student_contacts(id)` |
| `recipient_address` | `text` | `NULL` — numéro ou e-mail figé au moment de l'envoi |
| `channel` | `text` | `NOT NULL CHECK (channel IN ('in_app','email','sms','whatsapp','push'))` |
| `category` | `text` | `NOT NULL CHECK (category IN ('payment_due','payment_received','attendance_alert','grade_published','application_update','lead_followup','ai_credits','security','system','marketing'))` |
| `title` | `text` | `NOT NULL` |
| `body` | `text` | `NOT NULL` |
| `related_entity_type` | `text` | `NULL` |
| `related_entity_id` | `uuid` | `NULL` |
| `scheduled_for` | `timestamptz` | `NULL` |
| `sent_at` | `timestamptz` | `NULL` |
| `read_at` | `timestamptz` | `NULL` |
| `status` | `text` | `NOT NULL DEFAULT 'queued'`, `CHECK (status IN ('queued','sent','delivered','failed','read','cancelled'))` |
| `failure_reason` | `text` | `NULL` |

- **Index :** `idx_notifications_recipient (recipient_user_id, created_at DESC)`, `idx_notifications_pending (school_id, status, scheduled_for) WHERE status = 'queued'`.
- **Contrainte :** `ck_notifications_recipient CHECK (recipient_user_id IS NOT NULL OR recipient_contact_id IS NOT NULL OR recipient_address IS NOT NULL)`.
- **Conformité :** une notification de `category = 'marketing'` exige `leads.consent_marketing = true`. Vérification applicative, à documenter comme règle non contournable.

### `audit_logs`

**Rôle :** journal immuable de tout accès ou modification sensible. C'est la pièce qui rend le système défendable en cas de contestation (note modifiée, paiement disparu, dossier consulté).

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `bigserial` | PK |
| `school_id` | `uuid` | `NULL REFERENCES schools(id)` — `NULL` pour les actions de plateforme |
| `actor_user_id` | `uuid` | `NULL REFERENCES users(id)` |
| `actor_role_code` | `text` | `NULL` — rôle effectif au moment de l'action, figé |
| `action` | `text` | `NOT NULL` — `student.view`, `grade.update`, `payment.create`, `camera.view`, `ai.query`, `export.run` |
| `entity_type` | `text` | `NOT NULL` |
| `entity_id` | `uuid` | `NULL` |
| `occurred_at` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `ip_hash` | `text` | `NULL` — empreinte, pas l'IP en clair |
| `user_agent` | `text` | `NULL` |
| `before_state` | `jsonb` | `NULL` |
| `after_state` | `jsonb` | `NULL` |
| `result` | `text` | `NOT NULL DEFAULT 'success'`, `CHECK (result IN ('success','denied','error'))` |
| `context` | `jsonb` | `NULL` |

- **Index :** `idx_audit_logs_entity (entity_type, entity_id, occurred_at DESC)`, `idx_audit_logs_actor (actor_user_id, occurred_at DESC)`, `idx_audit_logs_school_action (school_id, action, occurred_at DESC)`.
- **Règle :** table en écriture seule. Aucun `UPDATE`, aucun `DELETE`, y compris pour un super administrateur. Rétention longue (**durée à définir : 5 ans proposés, hypothèse**).

---

## 18. Domaine 15 — Couche IA

> Détail fonctionnel complet dans `08-ai-architecture.md`. Ici, uniquement le modèle de données.

### `knowledge_documents`

**Rôle :** document de la base de connaissances approuvée que l'IA est autorisée à citer (règlement intérieur, descriptif de programme, FAQ, grille tarifaire validée). Sans approbation humaine, pas d'utilisation.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `title` | `text` | `NOT NULL` |
| `doc_category` | `text` | `NOT NULL CHECK (doc_category IN ('program','pricing','policy','faq','script','procedure','marketing','legal'))` |
| `language` | `text` | `NOT NULL DEFAULT 'fr'` |
| `body` | `text` | `NULL` |
| `media_id` | `uuid` | `NULL REFERENCES media_assets(id)` |
| `source_url` | `text` | `NULL` |
| `version` | `integer` | `NOT NULL DEFAULT 1` |
| `is_authoritative` | `boolean` | `NOT NULL DEFAULT false` — seul un document approuvé peut fonder une réponse chiffrée |
| `approved_by` | `uuid` | `NULL REFERENCES users(id)` |
| `approved_at` | `timestamptz` | `NULL` |
| `valid_from` / `valid_until` | `date` | `NULL` |
| `visible_to_roles` | `text[]` | `NOT NULL DEFAULT '{}'` — un document financier n'alimente pas l'assistant d'un enseignant |
| `status` | `text` | `NOT NULL DEFAULT 'draft'`, `CHECK (status IN ('draft','in_review','approved','outdated','archived'))` |

- **Unicité :** `uq_knowledge_documents (school_id, title, version)`.
- **Note :** les vecteurs d'embedding vivraient dans une table dédiée (`knowledge_chunks` avec `pgvector`), hors périmètre de cette modélisation.

### `ai_conversations`

**Rôle :** fil de discussion entre un utilisateur et un assistant IA, rattaché à un rôle et à un périmètre de données ; conteneur des messages et des consommations.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `user_id` | `uuid` | `NOT NULL REFERENCES users(id)` |
| `assistant_code` | `text` | `NOT NULL CHECK (assistant_code IN ('ceo','director','admin','marketing','crm','teacher','student'))` |
| `effective_role_code` | `text` | `NOT NULL` — rôle utilisé pour filtrer les données, figé à l'ouverture |
| `title` | `text` | `NULL` |
| `started_at` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `last_message_at` | `timestamptz` | `NULL` |
| `message_count` | `integer` | `NOT NULL DEFAULT 0` |
| `total_credits_spent` | `numeric(12,4)` | `NOT NULL DEFAULT 0` |
| `contains_student_data` | `boolean` | `NOT NULL DEFAULT false` — déclenche une rétention plus courte |
| `status` | `text` | `NOT NULL DEFAULT 'open'`, `CHECK (status IN ('open','closed','archived','flagged'))` |

*(Les messages eux-mêmes vivraient dans `ai_messages`, non demandé ici mais nécessaire à l'implémentation.)*

### `ai_usage`

**Rôle :** journal append-only de chaque action IA facturable, avec son coût en crédits et sa traçabilité technique. Source unique du décompte.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `bigserial` | PK |
| `school_id` | `uuid` | `NOT NULL REFERENCES schools(id)` |
| `organization_id` | `uuid` | `NOT NULL REFERENCES organizations(id)` |
| `user_id` | `uuid` | `NULL REFERENCES users(id)` |
| `conversation_id` | `uuid` | `NULL REFERENCES ai_conversations(id)` |
| `action_code` | `text` | `NOT NULL CHECK (action_code IN ('chat_short','chat_long','document_summary','document_generation','translation','caption_generation','image_generation','data_analysis','lead_scoring','embedding_index'))` |
| `model_provider` | `text` | `NOT NULL` |
| `model_name` | `text` | `NOT NULL` |
| `input_tokens` / `output_tokens` | `integer` | `NOT NULL DEFAULT 0` |
| `latency_ms` | `integer` | `NULL` |
| `credits_charged` | `numeric(12,4)` | `NOT NULL CHECK (credits_charged >= 0)` |
| `provider_cost_usd` | `numeric(12,6)` | `NULL` — coût réel côté opérateur, invisible pour l'école |
| `grounded_on_sources` | `integer` | `NOT NULL DEFAULT 0` — nombre de documents de la base de connaissances réellement cités |
| `refused_reason` | `text` | `NULL` — `missing_data`, `permission_denied`, `out_of_scope` |
| `occurred_at` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `result` | `text` | `NOT NULL DEFAULT 'success'`, `CHECK (result IN ('success','refused','error'))` |

- **Index :** `idx_ai_usage_school_time (school_id, occurred_at DESC)`, `idx_ai_usage_user (user_id, occurred_at DESC)`, `idx_ai_usage_action (school_id, action_code)`.

### `ai_credits`

**Rôle :** solde courant de crédits IA d'une organisation (ou d'une école si l'allocation est déléguée). Une ligne de solde, dont la valeur doit toujours être recalculable depuis `ai_credit_transactions`.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK |
| `organization_id` | `uuid` | `NOT NULL REFERENCES organizations(id)` |
| `school_id` | `uuid` | `NULL REFERENCES schools(id)` — `NULL` = solde mutualisé |
| `balance` | `numeric(14,4)` | `NOT NULL DEFAULT 0` |
| `reserved` | `numeric(14,4)` | `NOT NULL DEFAULT 0 CHECK (reserved >= 0)` — réservation pendant un traitement en cours |
| `lifetime_purchased` | `numeric(14,4)` | `NOT NULL DEFAULT 0` |
| `lifetime_consumed` | `numeric(14,4)` | `NOT NULL DEFAULT 0` |
| `low_balance_threshold` | `numeric(14,4)` | `NOT NULL DEFAULT 100` — **hypothèse** |
| `hard_stop_at_zero` | `boolean` | `NOT NULL DEFAULT true` |
| `monthly_cap` | `numeric(14,4)` | `NULL` — plafond anti-dérapage |
| `last_alert_at` | `timestamptz` | `NULL` |

- **Unicité :** `uq_ai_credits (organization_id, COALESCE(school_id,'0...'))`.
- **Règle :** `balance` est une dénormalisation de performance. Une tâche de contrôle doit vérifier périodiquement l'égalité avec la somme des transactions et lever une alerte en cas d'écart.

### `ai_credit_transactions`

**Rôle :** grand livre des mouvements de crédits (achat, consommation, offre commerciale, remboursement, expiration). Append-only, seule source de vérité du solde.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `bigserial` | PK |
| `organization_id` | `uuid` | `NOT NULL REFERENCES organizations(id)` |
| `school_id` | `uuid` | `NULL REFERENCES schools(id)` |
| `ai_credit_id` | `uuid` | `NOT NULL REFERENCES ai_credits(id)` |
| `transaction_type` | `text` | `NOT NULL CHECK (transaction_type IN ('purchase','grant','consumption','refund','expiry','adjustment','reservation','reservation_release'))` |
| `amount` | `numeric(14,4)` | `NOT NULL CHECK (amount <> 0)` — positif = entrée, négatif = sortie |
| `balance_after` | `numeric(14,4)` | `NOT NULL` — solde figé après mouvement, contrôle de cohérence |
| `ai_usage_id` | `bigint` | `NULL REFERENCES ai_usage(id)` |
| `pack_code` | `text` | `NULL` — voir grille tarifaire (hypothèse) dans `08-ai-architecture.md` |
| `money_amount` | `numeric(14,2)` | `NULL` |
| `currency` | `char(3)` | `NULL` |
| `performed_by` | `uuid` | `NULL REFERENCES users(id)` |
| `idempotency_key` | `text` | `NULL`, `uq_ai_credit_tx_idem (organization_id, idempotency_key) WHERE idempotency_key IS NOT NULL` |
| `occurred_at` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `notes` | `text` | `NULL` |

- **Index :** `idx_ai_credit_tx_org_time (organization_id, occurred_at DESC)`, `idx_ai_credit_tx_usage (ai_usage_id)`.

---

## 19. Diagrammes de relations (ASCII)

### 19.1 Colonne vertébrale : tenant → personnes

```
  organizations
       | 1
       | n
    schools ------------------------------+
       | 1                                 | 1
       | n                                 | n
   campuses                              users
       | 1                                 | 1
       | n                                 | n
     rooms                         role_assignments
                                           | n
                                           | 1
                                         roles
                                           | n         n |
                                           +--- role_permissions ---+
                                                                    |
                                                             permissions
```

### 19.2 Offre, planning et inscription

```
  programs
    | 1                \ 1
    | n                 \ n
  levels               modules
    |                     |
    | (référencés par)    |
    v                     v
  +---------------------------------------------+
  |                  groups                     |
  |  group.program_id / level_id / intake_id    |
  +---------------------------------------------+
        | 1                    ^ n
        | n                    |
     classes           teacher_assignments
        | 1                    | n
        | n                    | 1
   attendance               teachers
        | n                    | 1
        | 1                    |
    students <-----------------+ (via users)


  intakes ----1---n----> applications ----1---1----> enrollments
     ^                        |                          |
     | 1                      | (student créé/rattaché)   | 1
     | n                      v                          | n
  programs                students <-------------------- +
```

### 19.3 Tunnel commercial et attribution

```
  traffic_events (brut, anonyme, fort volume)
        |
        | consolidation
        v
   touchpoints ------------------+
        | n                      | n
        | 1                      | 1
      leads                  campaigns ---1---n--- creatives
        | 1                      ^                      ^
        | n                      |                      |
    followups                    +------- conversions --+
        |                                   | n
        |                                   | 1
        +--> applications --> enrollments --> payments --> receipts
                                   |
                                   v
                              payment_plans --1--n-- payment_plan_items
```

### 19.4 Transverse : médias, IA, audit, sécurité

```
                     media_assets
        +-----------------+-----------------+--------------+
        |                 |                 |              |
  student_documents   certificates    training_lessons   creatives
                                                          |
   cameras --1--n--> camera_permissions                    |
      |                                                    |
      +--n--> security_incidents                           |
                                                           |
  knowledge_documents --> (contexte) --> ai_conversations --+
                                              | 1
                                              | n
                                          ai_usage --n--1--> ai_credit_transactions
                                                                    | n
                                                                    | 1
                                                                ai_credits

  audit_logs : écrit par TOUTES les tables sensibles (students, grades,
               payments, cameras, ai_*, exports) — aucune flèche dessinée,
               c'est un puits transverse.
```

---

## 20. Règles de multi-tenant et cloisonnement

### 20.1 Portage de la clé de tenant

| Niveau | Colonne | Présence | Justification |
|---|---|---|---|
| Organisation | `organization_id` | `schools`, `ai_credits`, `ai_credit_transactions`, `ai_usage` | Facturation et crédits se gèrent au niveau du groupe. |
| École (tenant) | `school_id` | **Toutes** les tables métier | Clé unique de cloisonnement, jamais nullable sur ces tables. |
| Campus | `campus_id` | `rooms`, `groups`, `classes`, `attendance`, `cameras`, `payments`, `leads`, `intakes`, `applications`, `enrollments`, `security_incidents` | Dimension d'analyse et de restriction, nullable quand l'objet est transverse. |

**Règle de dénormalisation assumée.** `attendance.school_id` est redondant avec
`classes.group_id → groups.school_id`. Cette redondance est volontaire : elle
permet à la politique de sécurité de filtrer sans jointure, ce qui change tout
en performance et en lisibilité. Elle est protégée par un trigger qui recopie
le `school_id` du parent et interdit toute incohérence.

### 20.2 Principe de cloisonnement par ligne (RLS — décrit, non implémenté)

Le contexte de la requête porterait trois variables de session :

```
app.current_user_id      uuid
app.current_school_id    uuid
app.current_scope        jsonb   -- { campus_ids: [...], group_ids: [...] }
```

Trois couches de filtrage se superposent :

1. **Couche tenant.** Toute table active une politique de base :
   `USING (school_id = current_setting('app.current_school_id')::uuid)`.
   Aucune requête applicative ne peut voir une autre école, quelle que soit
   l'erreur de code en amont. C'est la seule protection qui tient quand le
   développeur oublie un `WHERE`.

2. **Couche portée.** Pour les entités localisées, une politique additionnelle
   restreint au périmètre du rôle : un administrateur de campus ne voit que
   `campus_id = ANY(scope.campus_ids)` ; un enseignant ne voit que les `classes`
   dont le `group_id` figure dans ses affectations actives.

3. **Couche colonne.** Certaines colonnes ne relèvent pas du filtrage par ligne
   mais du masquage : `teacher_assignments.hourly_rate`, `users.password_hash`,
   `security_incidents.involves_student_ids`. Elles sont exclues des vues
   exposées aux rôles non habilités, et jamais sélectionnées par l'API générique.

### 20.3 Matrice indicative rôle × portée

| Rôle | Portée par défaut | Voit les notes | Voit les montants | Voit les caméras | Voit les données d'un autre campus |
|---|---|---|---|---|---|
| `platform_operator` | plateforme | non (métadonnées seulement) | agrégats de facturation | non | non |
| `super_admin` | école entière | oui | oui | sur permission nommée | oui |
| `school_director` | école entière | oui | oui | sur permission nommée | oui |
| `admin` | campus | oui | partiel | non | non |
| `reception` | campus | non | montants dus uniquement | non | non |
| `finance` | école entière | non | oui | non | oui |
| `marketing` | école entière | non | revenus agrégés seulement | non | oui |
| `crm_agent` | campus | non | montants dus uniquement | non | non |
| `teacher` | ses groupes | ses groupes uniquement | non | non | non |
| `student` | lui-même | ses notes publiées | ses paiements | non | non |

Deux points à retenir : l'opérateur de la plateforme **ne doit pas** avoir accès
aux dossiers étudiants d'une école cliente par simple statut technique, et le
marketing n'a aucune raison de voir une note ou un dossier nominatif.

### 20.4 Rétention et effacement

| Donnée | Rétention proposée (hypothèse) | Mode |
|---|---|---|
| `traffic_events` | 14 mois | Purge + agrégats conservés |
| `touchpoints` d'un lead perdu | 24 mois | Anonymisation du contact |
| Dossier étudiant | Durée du parcours + 10 ans | Archivage, jamais suppression |
| Enregistrements caméra | 30 jours | Purge automatique |
| `ai_conversations` avec données étudiantes | 90 jours | Purge du contenu, métadonnées d'usage conservées |
| `audit_logs` | 5 ans | Immuable |

---

## 21. Machines à états

### 21.1 `applications`

```
  [draft] --submit--> [submitted] --start_review--> [in_review]
     |                     |                            |
     |                     |                            +--request_docs--> [documents_pending]
     |                     |                            |                        |
     |                     |                            |<---docs_received-------+
     |                     |                            |
     |                     |                            +--accept--> [accepted] --> (crée enrollment)
     |                     |                            +--reject--> [rejected]
     |                     |
     |                     +--no_activity_30d--> [expired]
     +--withdraw-----------+--withdraw---------------> [withdrawn]
```

| Transition | Déclencheur | Condition | Effet |
|---|---|---|---|
| `draft → submitted` | Envoi du formulaire | Champs obligatoires remplis, téléphone valide | `submitted_at`, création ou rattachement du `lead` |
| `submitted → in_review` | Prise en charge par un admin | — | Affectation d'un responsable |
| `in_review → documents_pending` | Pièce manquante | Au moins un `student_documents` en `pending` | Notification au candidat |
| `in_review → accepted` | Décision | Place disponible sur l'`intake` | Création de `students` si absent, `enrollments` en `pending` |
| `in_review → rejected` | Décision | `rejection_reason` obligatoire | Notification, lead en `lost` |
| `* → expired` | Traitement planifié | Aucune activité depuis 30 jours (**hypothèse**) | Libère la place réservée |

États terminaux : `accepted`, `rejected`, `withdrawn`, `expired`.

### 21.2 `enrollments`

```
  [pending] --first_payment_or_waiver--> [confirmed] --intake_starts--> [active]
      |                                       |                            |
      |                                       |                            +--suspend--> [suspended]
      |                                       |                            |                 |
      |                                       |                            |<----resume------+
      |                                       |                            |
      |                                       |                            +--complete--> [completed]
      |                                       |                            +--withdraw--> [withdrawn]
      +--cancel--> [cancelled] <--cancel------+
```

Règles : `pending → confirmed` exige au moins un `payments` confirmé rattaché à
l'inscription **ou** une exonération tracée (`discount_reason` renseigné et
approuvée par un rôle finance). `active → completed` exige que toutes les
évaluations obligatoires du niveau soient en état `published`. Le passage en
`withdrawn` doit poser un `withdrawal_reason` : sans motif, le taux d'abandon
est un chiffre sans valeur d'action.

### 21.3 `payments`

```
  [pending] --provider_confirms--> [confirmed] --refund_request--> [refunded]
      |                                 |
      |                                 +--(aucune modification possible)
      +--provider_fails--> [failed]
      +--operator_cancels--> [cancelled]
```

`confirmed` est un état quasi terminal : un remboursement crée une **nouvelle**
ligne `direction = 'out'` avec `reversal_of_payment_id`, plus un passage du
paiement d'origine en `refunded`. On ne réécrit jamais un encaissement, on
l'annule par une écriture contraire. Le reçu associé passe alors en `cancelled`
et un reçu de remboursement est émis avec son propre numéro.

### 21.4 `intakes`

```
  [planned] --open_applications--> [open] --seats>=80%--> [closing_soon]
                                     |                          |
                                     |                          +--seats=capacity--> [full]
                                     |                          |
                                     +--deadline_passed---------+--> [closed]
                                     |
  [planned|open] --cancel--> [cancelled]
```

Le seuil de 80 % est une **hypothèse** de pilotage : il déclenche l'alerte
« dernières places » côté marketing. `full` reste réversible vers `open` en cas
de désistement, ce qui impose que `seats_taken` soit recalculé depuis
`enrollments` et non simplement incrémenté.

### 21.5 `leads` (rappel, détaillé dans `07-traffic-attribution.md`)

```
  [new] --first_contact--> [contacted] --qualifies--> [qualified] --starts_form--> [application_started]
    |          |                             |                                            |
    |          |                             +--not_ready--> [nurturing] --reactivates----+
    |          |                                                                          |
    |          +--no_response_x3--> [lost]                                                v
    +--duplicate_detected--> [duplicate]                                            [converted]
    +--fake_number--> [invalid]
```

---

## 22. Matricule étudiant et numérotation des reçus

### 22.1 Matricule étudiant (`students.student_number`)

**Format proposé (hypothèse, à valider avec l'administration) :**

```
TAS-26-ENG-0147
 |    |   |    |
 |    |   |    +-- séquence à 4 chiffres, remise à zéro chaque année
 |    |   +------- discipline : ENG (anglais) ou ICT (informatique)
 |    +----------- année d'entrée sur 2 chiffres
 +---------------- code école (schools.code)
```

Justification des choix :

| Choix | Raison | Alternative écartée |
|---|---|---|
| Préfixe école | Rend le matricule lisible dans un contexte multi-écoles et sur un document papier | UUID exposé : illisible, non dictable au téléphone |
| Année sur 2 chiffres | Permet de connaître l'ancienneté d'un dossier d'un coup d'œil | Année sur 4 chiffres : plus long à dicter, sans gain |
| Discipline | Le personnel d'accueil sait immédiatement de quel parcours il s'agit | Aucun segment : perte d'information utile au guichet |
| Séquence à 4 chiffres | Couvre 9 999 entrées par an et par discipline, très au-delà du volume actuel (plus de 1200 étudiants formés au total) | Séquence globale continue : numéros longs, pas de lecture d'année |
| Pas de segment campus | Un étudiant peut changer de campus ; l'identifiant ne doit pas mentir | `TAS-26-ALJ-...` : périmé dès un transfert |

**Règles d'unicité et de génération**

- Unicité garantie par `uq_students_school_number (school_id, student_number)`.
- Attribution par une séquence dédiée par `(school_id, année, discipline)`, dans
  la même transaction que la création du dossier, via `SELECT ... FOR UPDATE`
  sur une table de compteurs — jamais par `MAX(...) + 1`, qui produit des
  collisions dès que deux inscriptions sont saisies simultanément à l'accueil.
- Le matricule est **immuable** après émission. Une erreur de saisie se corrige
  sur le nom, jamais sur le numéro.
- Ambiguïtés de lecture : les chiffres seuls évitent la confusion `O`/`0` et
  `I`/`1`. Si un segment alphabétique devait être ajouté, exclure ces lettres.
- Le matricule ne doit **pas** encoder la nationalité, le genre ou la situation
  financière. Un identifiant qui révèle une caractéristique personnelle devient
  un problème de confidentialité dès qu'il est affiché sur un badge.

### 22.2 Numéro de reçu (`receipts.receipt_number`)

**Format proposé (hypothèse) :**

```
TAS/ALJ/2026/000482
 |    |    |     |
 |    |    |     +-- séquence continue SANS TROU, par campus et par année
 |    |    +-------- année civile sur 4 chiffres (exigence comptable)
 |    +------------- code campus (lieu d'encaissement, information comptable)
 +------------------ code école
```

**Exigences non négociables**

1. **Pas de trou dans la séquence.** Un numéro sauté se justifie ou fait naître
   un soupçon. Conséquence technique : le numéro est attribué **au moment de
   l'émission du reçu**, jamais réservé à l'avance. Une séquence PostgreSQL
   classique ne convient pas, car elle laisse des trous en cas de rollback. Il
   faut une table de compteurs verrouillée dans la transaction d'émission.
2. **Pas de réutilisation.** Un reçu annulé garde son numéro et passe en
   `cancelled` ; le reçu de remplacement en reçoit un nouveau et référence le
   précédent.
3. **Contenu figé.** `receipts.snapshot` conserve les informations imprimées.
   Si l'étudiant change de nom ou de programme plus tard, le reçu déjà remis
   reste conforme à ce qui a été signé.
4. **Unicité forte.** `uq_receipts_sequence (school_id, campus_id, sequence_year,
   sequence_value)` en plus de l'unicité du numéro formaté.
5. **Certificats.** Même logique pour `certificates.certificate_number`, avec en
   plus un `verification_code` aléatoire (par exemple 10 caractères
   alphanumériques sans caractères ambigus), unique globalement et non
   devinable, exposé sur une page publique de vérification. Un numéro
   séquentiel seul permettrait de deviner un autre certificat valide.

---

## 23. Ce qui reste à valider sur le terrain avant création réelle des tables

Les questions ci-dessous ne sont pas des détails de confort : chacune peut
invalider une partie du modèle. Tant qu'elles ne sont pas tranchées, aucune
migration ne doit être écrite.

### 23.1 Bloquant — le modèle ne peut pas être figé sans ces réponses

| # | Question | Pourquoi c'est bloquant | Table concernée |
|---|---|---|---|
| 1 | Comment fonctionnent les rentrées ? Sessions fixes, rentrée mensuelle, ou entrée continue ? | Si l'entrée est continue, `intakes` devient un artefact artificiel et `groups` doit accepter des arrivées en cours de route. Deux modèles très différents. | `intakes`, `groups`, `enrollments` |
| 2 | Quels sont les prix réels des trois cours ? | Sans prix, aucun revenu attendu, aucun coût d'acquisition, aucun retour sur investissement publicitaire calculable. Le KPI central du projet est inaccessible. | `programs`, `enrollments`, `conversions` |
| 3 | Combien de campus, et quelle est la nature exacte du site d'Alajo/Kotobabi ? | Détermine si `campus_id` est une dimension réelle ou du code mort. | `campuses`, toutes les tables localisées |
| 4 | Quelle est la capacité par salle et par groupe ? | Sans capacité, pas de taux de remplissage, donc pas de pilotage de l'ouverture des groupes. | `rooms`, `groups`, `intakes` |
| 5 | Quelle devise contractuelle : GHS, CFA, ou les deux ? | Le logement est annoncé en CFA, l'école est au Ghana. Un modèle mono-devise serait faux dès le premier paiement. | `payments`, `enrollments`, `payment_plans` |
| 6 | Quelle échelle de notation ? Sur 20, sur 100, en lettres, par compétence ? | Change le type et les contraintes de `grades.score` et toute la logique de moyenne. | `assessments`, `grades` |

### 23.2 Important — impacte des fonctionnalités entières

| # | Question | Impact |
|---|---|---|
| 7 | Durée standard d'un parcours par programme, et nombre de niveaux en anglais ? | Dimensionne `levels`, le calcul d'avancement et la prévision de revenu. |
| 8 | Un test de placement existe-t-il à l'entrée ? Selon quelle grille ? | Détermine l'utilité de `entry_english_level` et du type d'évaluation `placement`. |
| 9 | Quelle est la politique d'absence : seuil d'exclusion, justificatifs acceptés ? | Sans règle, `attendance.status` est du reporting sans conséquence. |
| 10 | Le logement est-il géré par l'école ou par un tiers ? Facturé avec la scolarité ou séparément ? | Détermine s'il faut une table `accommodations` distincte plutôt qu'un simple champ sur `applications`. |
| 11 | Existe-t-il des agents ou rabatteurs rémunérés à l'inscription ? | Impose une table de commissionnement et change le calcul du coût d'acquisition réel. |
| 12 | Qui encaisse, et selon quel circuit de validation ? Mobile Money personnel ou compte de l'école ? | Détermine le niveau de contrôle nécessaire sur `payments` et la séparation des rôles. |
| 13 | Y a-t-il une comptabilité existante (cahier, Excel, logiciel) à reprendre ? | Détermine le volume et la qualité de la reprise de données, souvent le vrai risque du projet. |
| 14 | Quelle est la répartition réelle des étudiants par nationalité et par programme ? | Permet de valider ou d'invalider l'hypothèse « public largement francophone » par des chiffres plutôt que par une impression. |

### 23.3 À clarifier — moins urgent mais structurant

| # | Question | Conséquence |
|---|---|---|
| 15 | Combien de caméras, dans quelles zones, et qui y accède aujourd'hui ? | Sans cet inventaire, le modèle de sécurité reste théorique. |
| 16 | Quel cadre légal s'applique aux données étudiantes au Ghana (Data Protection Act 2012) et pour les ressortissants UEMOA ? | Détermine les durées de rétention, le consentement, les droits d'accès. Réponse à obtenir d'un conseil local, pas d'une hypothèse technique. |
| 17 | Une offre de formation en ligne est-elle réellement prévue ? | Si non, le domaine 12 reste dormant et ne doit pas être construit. |
| 18 | Quels comptes sociaux existent réellement et qui les gère ? | Conditionne tout le domaine marketing et l'attribution. |
| 19 | Quel est le délai de réponse actuel à une demande WhatsApp ? | Point de référence indispensable avant de promettre une amélioration. |
| 20 | Qui sera réellement l'administrateur du système au quotidien, et avec quel niveau d'aisance informatique ? | Détermine la complexité acceptable de l'interface. Un modèle parfait utilisé par personne ne vaut rien. |

### 23.4 Ce que ce document n'a délibérément pas tranché

- **Pas de table `accommodations`** : le logement apparaît comme attribut de
  candidature et comme type de paiement. S'il s'avère que l'école gère
  réellement des chambres, des colocataires et des baux, il faudra un domaine
  dédié. Décision suspendue à la question 10.
- **Pas de table de commissions d'agents** : suspendue à la question 11.
- **Pas de modèle de paie enseignant** : `hourly_rate` est posé sur
  `teacher_assignments`, mais la paie complète (heures validées, retenues,
  bulletins) est un sous-système à part entière, hors périmètre.
- **Pas de tables de vecteurs pour l'IA** (`knowledge_chunks`, embeddings) :
  relèvent de l'implémentation, pas de la modélisation métier.
- **Pas de `ai_messages`** : la table existera nécessairement, mais son contenu
  (conservation ou non des messages, durée) dépend de la réponse à la
  question 16.

---

*Document de modélisation — aucune table créée, aucune migration écrite.
Prochaine étape recommandée : entretien de cadrage avec la direction de TAS sur
les six questions bloquantes du §23.1 avant toute décision technique.*
