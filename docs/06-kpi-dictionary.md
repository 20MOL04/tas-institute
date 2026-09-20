# 06 — Dictionnaire de KPI

> **Statut : MODÉLISATION.** Aucun de ces indicateurs n'est calculé aujourd'hui.
> Ce document définit ce qui *devra* être mesuré, avec une formule exacte, une
> source, un propriétaire et une décision associée. Un indicateur qui ne change
> aucune décision n'a pas sa place dans un tableau de bord : c'est le critère
> d'admission appliqué ici.
>
> Les noms de tables et de colonnes référencés viennent de
> `05-database-schema.md`. Les notions de trafic et d'attribution sont définies
> dans `07-traffic-attribution.md`.
>
> **Aucune valeur cible n'est donnée comme un fait.** Les seuils proposés sont
> marqués « hypothèse » et devront être remplacés par les valeurs mesurées chez
> TAS après un premier trimestre d'observation.

---

## Sommaire

1. [Définitions normatives](#1-définitions-normatives-à-lire-avant-tout-le-reste)
2. [Conventions de lecture des tableaux](#2-conventions-de-lecture-des-tableaux)
3. [Domaine 1 — Website](#3-domaine-1--website-14-kpi)
4. [Domaine 2 — Acquisition](#4-domaine-2--acquisition-13-kpi)
5. [Domaine 3 — Sales / CRM](#5-domaine-3--sales--crm-14-kpi)
6. [Domaine 4 — Students](#6-domaine-4--students-11-kpi)
7. [Domaine 5 — Academic](#7-domaine-5--academic-11-kpi)
8. [Domaine 6 — Finance](#8-domaine-6--finance-14-kpi)
9. [Domaine 7 — Marketing](#9-domaine-7--marketing-11-kpi)
10. [Domaine 8 — Operations](#10-domaine-8--operations-10-kpi)
11. [Domaine 9 — IA](#11-domaine-9--ia-10-kpi)
12. [KPI de vanité à éviter](#12-kpi-de-vanité-à-éviter)
13. [Avertissement méthodologique sur l'évaluation des enseignants](#13-avertissement-méthodologique-sur-lévaluation-des-enseignants)
14. [Règles de gouvernance du dictionnaire](#14-règles-de-gouvernance-du-dictionnaire)

**Total : 108 indicateurs définis.**

---

## 1. Définitions normatives (à lire avant tout le reste)

Ces définitions sont **contraignantes**. Toute formule du document s'y réfère.
Si deux personnes dans l'école n'ont pas la même définition d'un « lead », leurs
chiffres ne sont pas comparables et toute réunion sur le sujet est une perte de
temps.

| Notion | Définition normative retenue | Ce que ce n'est PAS | Source technique |
|---|---|---|---|
| **Visiteur** | Un navigateur distinct identifié par un `visitor_id` sur une fenêtre glissante de 30 jours. | Ce n'est pas une personne. Une même personne sur téléphone et sur ordinateur compte deux fois. Un navigateur en navigation privée recompte à chaque visite. | `traffic_events.visitor_id` |
| **Session** | Suite d'événements d'un même `visitor_id` séparés de moins de 30 minutes d'inactivité. Une session se termine aussi à minuit (heure d'Accra) et au changement de source de campagne. | Ce n'est pas une visite de page unique, ni une durée fixe. | `traffic_events.session_id` |
| **Visiteur engagé** | Session qui remplit **au moins une** de ces conditions : durée ≥ 30 s, ou ≥ 2 pages vues, ou un événement de type `scroll_90`, `cta_click`, `whatsapp_click`, `phone_click`, `form_start`. | Ce n'est pas « quelqu'un d'intéressé ». C'est un seuil conventionnel qui écarte le rebond immédiat et le trafic accidentel. | `traffic_events` |
| **Lead** | Personne ayant volontairement laissé un moyen de contact exploitable (téléphone ou WhatsApp au minimum) et une intention exprimée, dédoublonnée sur le numéro de téléphone. | Ce n'est pas un clic sur WhatsApp. Ce n'est pas un « like ». Ce n'est pas un visiteur engagé. | `leads` où `status <> 'invalid'` |
| **Lead qualifié** | Lead dont un agent a vérifié **quatre** points : joignabilité réelle, intérêt pour un programme identifié, disponibilité sur une période d'entrée, et absence d'obstacle rédhibitoire connu (budget hors de portée, situation géographique incompatible). | Ce n'est pas un lead à qui on a simplement parlé. La qualification est une décision documentée, pas une impression. | `leads.status = 'qualified'` + `followups` |
| **Candidature** | Formulaire d'admission soumis (`applications.status >= 'submitted'`), avec au minimum nom, contact et programme visé. | Un formulaire commencé mais non envoyé (`draft`) n'est pas une candidature. | `applications` |
| **Inscription** | `enrollments` en état `confirmed` ou plus avancé, c'est-à-dire adossée à un premier paiement confirmé ou à une exonération approuvée. | Une candidature acceptée n'est **pas** une inscription tant que rien n'est payé ni formellement exonéré. C'est l'erreur de comptage la plus fréquente dans les écoles. | `enrollments.status IN ('confirmed','active','completed')` |
| **Étudiant actif** | Étudiant ayant une inscription en état `active` **et** au moins une présence enregistrée (`attendance.status IN ('present','late')`) au cours des 21 derniers jours. | Ce n'est pas « inscrit cette année ». Un inscrit qui ne vient plus depuis six semaines n'est pas actif, même s'il a payé. | `enrollments` + `attendance` |
| **Abandon (décrochage)** | Étudiant inscrit sans aucune présence depuis 21 jours consécutifs sur des séances où il était attendu, sans justificatif accepté. Passe en abandon confirmé à 42 jours ou sur déclaration. | Ce n'est pas une absence ponctuelle. Ce n'est pas non plus la fin normale d'un parcours (`completed`). | `attendance` + `enrollments.status = 'withdrawn'` |
| **Nouvel étudiant** | Étudiant dont c'est la première inscription confirmée dans l'école (`students.first_enrolled_on` = date de l'inscription considérée). | Un réinscrit n'est pas un nouvel étudiant. Les confondre gonfle artificiellement l'acquisition. | `students` + `enrollments` |
| **Revenu reconnu** | Montant encaissé et confirmé (`payments.status = 'confirmed'`, `direction = 'in'`), net des remboursements, converti en devise de référence de l'école au taux du jour du paiement. | Ce n'est pas le montant contractuel signé. Un contrat signé non payé n'est pas un revenu. | `payments` |
| **Revenu contractualisé** | Somme des `enrollments.tuition_amount - discount_amount` pour les inscriptions confirmées sur la période. | À ne jamais présenter comme du revenu réalisé. C'est une promesse. | `enrollments` |

**Fenêtre de rattachement par défaut : 90 jours** entre le premier contact et
l'inscription (voir `07-traffic-attribution.md`, §4). Tout KPI de conversion
inter-étapes utilise cette fenêtre sauf mention contraire.

**Une règle qui évite 80 % des erreurs de reporting :** un taux de conversion se
calcule toujours **par cohorte d'origine**, jamais en divisant des volumes de la
même période. Diviser les inscriptions de mars par les leads de mars donne un
chiffre faux dès que le délai de décision dépasse quelques jours — ce qui est
toujours le cas pour une décision de formation.

---

## 2. Conventions de lecture des tableaux

- **Granularité** : niveau de détail minimal auquel l'indicateur garde un sens
  (jour, semaine, mois, cohorte, campus, programme, source, enseignant).
- **Propriétaire** : rôle responsable du chiffre, pas celui qui le consulte.
  Un indicateur sans propriétaire n'est jamais corrigé quand il dérive.
- **Fréquence** : rythme de lecture recommandé. Lire un indicateur plus souvent
  que sa fréquence naturelle produit du bruit et des décisions erratiques.
- **Décision** : ce que l'on fait concrètement quand le chiffre bouge. Colonne
  la plus importante du tableau.
- Les noms de rôles renvoient à ceux de `05-database-schema.md` :
  `school_director` (la directrice), `admin`, `reception`, `finance`,
  `marketing`, `crm_agent`, `teacher`, `super_admin`.

---

## 3. Domaine 1 — Website (14 KPI)

| Nom | Définition | Formule exacte | Unité | Granularité | Source | Fréquence | Propriétaire | Décision permise | Pièges d'interprétation |
|---|---|---|---|---|---|---|---|---|---|
| W01 — Visiteurs uniques | Nombre de navigateurs distincts ayant chargé au moins une page. | `COUNT(DISTINCT visitor_id)` sur `traffic_events` où `event_type='page_view'` | visiteurs | jour / semaine / mois | `traffic_events` | hebdomadaire | marketing | Évaluer l'effet d'une campagne ou d'une publication sur la notoriété. | Surcompte les personnes multi-appareils, sous-compte celles qui bloquent les cookies. Jamais présenté comme « nombre de personnes ». |
| W02 — Sessions | Nombre de sessions au sens de la §1. | `COUNT(DISTINCT session_id)` | sessions | jour / mois | `traffic_events` | hebdomadaire | marketing | Mesurer le volume de trafic brut. | Une coupure réseau fréquente en Afrique de l'Ouest fragmente une visite en plusieurs sessions et gonfle le chiffre. |
| W03 — Pages vues | Nombre total d'affichages de page. | `COUNT(*)` où `event_type='page_view'` | pages | jour / page | `traffic_events` | hebdomadaire | marketing | Identifier les pages réellement consultées. | Indicateur de volume, pas de valeur. Une page rechargée en boucle à cause d'un bug gonfle le total. |
| W04 — Taux d'engagement des sessions | Part des sessions engagées au sens de la §1. | `sessions_engagées / sessions × 100` | % | semaine / source / page d'entrée | `traffic_events` | hebdomadaire | marketing | Juger la qualité du trafic acheté avant de juger la page. | Un taux élevé sur très peu de sessions n'est pas significatif : exiger un minimum de 100 sessions (hypothèse). |
| W05 — Taux de rebond corrigé | Part des sessions non engagées. | `100 − W04` | % | semaine / page d'entrée | `traffic_events` | hebdomadaire | marketing | Repérer une page d'atterrissage inadaptée à la promesse de l'annonce. | Le rebond n'est pas toujours un échec : une page « contact » consultée puis quittée après un appel téléphonique est un succès invisible. |
| W06 — Durée médiane de session | Durée médiane entre le premier et le dernier événement d'une session. | `percentile_cont(0.5)` de `max(occurred_at) − min(occurred_at)` par session | secondes | semaine / page | `traffic_events` | mensuelle | marketing | Détecter un contenu trop court ou illisible sur mobile. | Utiliser la médiane, jamais la moyenne : quelques onglets laissés ouverts faussent totalement une moyenne. |
| W07 — Profondeur de défilement | Part des sessions atteignant 90 % de la hauteur d'une page. | `sessions_avec_scroll_90 / sessions_sur_la_page × 100` | % | page | `traffic_events` | mensuelle | marketing | Décider de remonter un appel à l'action trop bas dans la page. | Une page courte atteint 90 % trivialement ; comparer uniquement des pages de longueur comparable. |
| W08 — Part de trafic mobile | Part des sessions sur téléphone. | `sessions_mobile / sessions × 100` | % | mois | `traffic_events.device_type` | mensuelle | marketing | Arbitrer les priorités de conception : si la part dépasse 80 %, tout arbitrage se tranche en faveur du mobile. | Le type d'appareil déduit de l'agent utilisateur est approximatif sur les navigateurs peu courants. |
| W09 — Taux de clic vers WhatsApp | Part des sessions générant un clic vers WhatsApp. | `sessions_avec_whatsapp_click / sessions × 100` | % | semaine / page / source | `traffic_events` | hebdomadaire | marketing | Identifier les pages qui déclenchent réellement le contact, et y concentrer l'effort. | Un clic n'est pas un message envoyé. L'écart entre clics et conversations reçues est souvent de 40 à 60 % (**hypothèse à mesurer**). |
| W10 — Taux de clic téléphone | Part des sessions avec un clic sur un numéro. | `sessions_avec_phone_click / sessions × 100` | % | semaine / page | `traffic_events` | hebdomadaire | marketing | Décider de la visibilité du numéro dans l'en-tête. | Sur ordinateur, le clic n'aboutit à aucun appel. Filtrer sur mobile. |
| W11 — Taux de début de formulaire | Part des sessions atteignant le formulaire et commençant à le remplir. | `sessions_avec_form_start / sessions_sur_/apply × 100` | % | semaine | `traffic_events` | hebdomadaire | marketing | Distinguer un problème d'attractivité (peu de débuts) d'un problème de formulaire (peu de fins). | Sans cette distinction, on refait la mauvaise moitié du travail. |
| W12 — Taux de complétion du formulaire | Part des formulaires commencés qui sont envoyés. | `form_submit / form_start × 100` | % | semaine | `traffic_events` | hebdomadaire | marketing | Supprimer un champ qui fait abandonner. | Un taux bas peut venir d'un champ obligatoire inadapté (adresse e-mail alors que le public utilise WhatsApp). |
| W13 — Pages d'entrée les plus performantes | Classement des pages d'atterrissage par nombre de leads générés. | `COUNT(leads)` groupé par `traffic_events.landing_path` du premier contact | leads / page | mois | `traffic_events` + `leads` | mensuelle | marketing | Décider quelle page mettre en avant dans les annonces. | Ne pas confondre avec la page la plus vue : la page la plus vue est souvent l'accueil, la plus efficace est souvent une page de programme. |
| W14 — Disponibilité du site | Part du temps où le site répond correctement. | `(minutes_totales − minutes_indisponibles) / minutes_totales × 100` | % | mois | supervision externe (**à mettre en place**) | mensuelle | super_admin | Changer d'hébergement, ajouter une surveillance. | Une indisponibilité de 30 minutes un samedi matin peut coûter plus qu'une de 3 heures la nuit. Pondérer par le trafic. |

---

## 4. Domaine 2 — Acquisition (13 KPI)

| Nom | Définition | Formule exacte | Unité | Granularité | Source | Fréquence | Propriétaire | Décision permise | Pièges d'interprétation |
|---|---|---|---|---|---|---|---|---|---|
| A01 — Leads générés | Nombre de leads créés, dédoublonnés. | `COUNT(leads)` où `status NOT IN ('duplicate','invalid')` | leads | jour / source / campagne | `leads` | quotidienne | marketing | Ajuster la pression publicitaire. | Sans dédoublonnage sur le téléphone, une relance multi-canal crée trois leads pour une personne. |
| A02 — Coût par lead (CPL) | Dépense publicitaire divisée par les leads attribués. | `SUM(campaigns.spend_amount) / COUNT(leads attribués)` | monnaie / lead | campagne / mois | `campaigns` + `conversions` | hebdomadaire | marketing | Couper une campagne dont le CPL dépasse le seuil de rentabilité. | Un CPL bas sur des leads non qualifiés coûte plus cher en temps d'agent qu'il ne rapporte. Toujours lire avec A04. |
| A03 — Taux de conversion visiteur → lead | Part des visiteurs uniques devenus leads. | `COUNT(DISTINCT leads.visitor_id) / COUNT(DISTINCT traffic_events.visitor_id) × 100` | % | mois / source | `leads` + `traffic_events` | mensuelle | marketing | Décider d'améliorer la page ou d'améliorer le ciblage. | Les leads arrivés hors site (WhatsApp direct, walk-in) n'ont pas de `visitor_id` : les exclure du numérateur, sinon le taux dépasse la réalité. |
| A04 — Taux de qualification | Part des leads qui deviennent qualifiés. | `leads_qualifiés / leads_contactés × 100` | % | source / campagne / mois | `leads` | hebdomadaire | crm_agent | Juger la qualité d'une source, pas seulement son volume. | Dépend fortement de la rigueur de l'agent qui qualifie. Une baisse peut venir d'un durcissement des critères, pas du marché. |
| A05 — Coût par lead qualifié | Dépense divisée par les leads qualifiés. | `SUM(spend) / COUNT(leads qualifiés)` | monnaie / lead | campagne / mois | `campaigns` + `leads` | hebdomadaire | marketing | Arbitrer entre deux canaux qui ont le même CPL mais pas la même qualité. | Indicateur plus honnête que A02, mais retardé : il faut attendre la qualification. |
| A06 — Coût par candidature | Dépense divisée par les candidatures attribuées. | `SUM(spend) / COUNT(applications attribuées)` | monnaie / candidature | campagne / mois | `campaigns` + `conversions` | mensuelle | marketing | Décider du budget d'une rentrée. | Ne pas comparer entre programmes de prix très différents sans rapporter au revenu. |
| A07 — Coût d'acquisition étudiant (CAC) | Coût complet pour obtenir un nouvel étudiant inscrit. | `(dépense_publicitaire + coûts_commerciaux_alloués) / nouveaux_étudiants_inscrits` | monnaie / étudiant | mois / programme / source | `campaigns` + `enrollments` | mensuelle | school_director | Décider si un canal est rentable, fixer un plafond d'enchère. | Omettre les coûts humains (temps des agents, commissions) donne un CAC optimiste de 30 à 50 % (**hypothèse**). |
| A08 — Ratio revenu / CAC | Revenu moyen par étudiant rapporté à son coût d'acquisition. | `revenu_moyen_par_étudiant / CAC` | ratio | programme / source | `payments` + `campaigns` | mensuelle | school_director | Décider d'augmenter ou de réduire l'investissement sur un canal. | Utiliser le revenu **encaissé**, pas contractualisé. Un ratio de 4 sur du contractualisé peut être de 1,5 sur de l'encaissé. |
| A09 — Part des leads par source | Répartition des leads entre les canaux. | `leads_par_source / leads_totaux × 100` | % | mois | `leads.lead_source_id` | mensuelle | marketing | Détecter une dépendance excessive à un seul canal. | Une source « inconnu » supérieure à 20 % rend toute l'analyse fragile ; corriger la collecte avant d'interpréter. |
| A10 — Part de trafic direct et inconnu | Part des sessions sans source identifiable. | `sessions_sans_utm_ni_referrer / sessions × 100` | % | mois | `traffic_events` | mensuelle | marketing | Décider de renforcer le balisage UTM et les codes courts hors ligne. | Un direct élevé signale souvent un défaut de balisage, pas une notoriété spontanée. |
| A11 — Délai médian premier contact → lead | Temps entre le premier point de contact et la création du lead. | médiane de `leads.created_at − first_touch.occurred_at` | heures / jours | source | `touchpoints` + `leads` | mensuelle | marketing | Calibrer la fenêtre d'attribution et le rythme de relance. | Ne se calcule que sur les leads tracés : biaise vers le numérique. |
| A12 — Leads par publication organique | Leads attribués à une publication sociale non payante. | `COUNT(leads)` joint sur `touchpoints.creative_id` d'un contenu organique | leads | publication | `content_calendar` + `conversions` | mensuelle | marketing | Décider quel type de contenu reproduire. | Le lien entre une publication et un lead est fragile sans lien tracé : utiliser des liens courts distincts par publication. |
| A13 — Taux de réponse WhatsApp entrant | Part des conversations WhatsApp entrantes ayant reçu une réponse. | `conversations_répondues / conversations_reçues × 100` | % | jour | `followups` (saisie manuelle en l'absence d'intégration) | quotidienne | crm_agent | Décider de renforcer l'effectif à l'accueil aux heures de pointe. | Sans intégration WhatsApp réelle, ce chiffre repose sur une saisie humaine : le noter comme déclaratif. |

---

## 5. Domaine 3 — Sales / CRM (14 KPI)

| Nom | Définition | Formule exacte | Unité | Granularité | Source | Fréquence | Propriétaire | Décision permise | Pièges d'interprétation |
|---|---|---|---|---|---|---|---|---|---|
| S01 — Délai de première réponse | Temps entre la création d'un lead et le premier contact sortant. | médiane de `MIN(followups.occurred_at WHERE direction='outbound') − leads.created_at` | minutes | jour / agent | `leads` + `followups` | quotidienne | crm_agent | Réorganiser les permanences. C'est le levier le plus rentable du CRM. | La médiane masque les cas extrêmes : suivre aussi le 90e centile, car ce sont les leads perdus. |
| S02 — Part des leads contactés sous 1 h | Proportion de leads touchés dans l'heure. | `leads_contactés_<60min / leads_créés × 100` | % | jour | `leads` + `followups` | quotidienne | crm_agent | Fixer un engagement de service interne. | Un lead créé à 23 h ne peut pas être traité en une heure : exclure les créations hors horaires d'ouverture. |
| S03 — Taux de joignabilité | Part des leads effectivement joints. | `leads_avec_followup_outcome='answered' / leads_tentés × 100` | % | source / agent | `followups` | hebdomadaire | crm_agent | Juger la qualité des numéros fournis par une source. | Un faux numéro est un problème de source, pas d'agent. Croiser avec A09 avant de conclure. |
| S04 — Nombre moyen de tentatives avant contact | Nombre d'appels ou messages avant une réponse. | `COUNT(followups) / leads_joints` | tentatives | source | `followups` | mensuelle | crm_agent | Définir une cadence de relance (nombre et espacement). | Beaucoup d'écoles abandonnent après 2 tentatives alors que la majorité des contacts aboutissent plus tard. Mesurer avant de fixer la règle. |
| S05 — Taux de conversion lead → candidature | Part des leads déposant une candidature. | `COUNT(applications avec lead_id) / COUNT(leads) × 100` (par cohorte) | % | cohorte mensuelle / source | `leads` + `applications` | mensuelle | crm_agent | Identifier où le tunnel casse. | Calcul par cohorte obligatoire. Un calcul période sur période sous-estime le taux quand le volume croît. |
| S06 — Taux de conversion candidature → inscription | Part des candidatures qui aboutissent à une inscription confirmée. | `enrollments_confirmés / applications_soumises × 100` (par cohorte) | % | cohorte / programme | `applications` + `enrollments` | mensuelle | admin | Décider de simplifier le dossier ou de revoir le prix. | Une baisse peut venir d'un durcissement des pièces exigées, pas d'un désintérêt. |
| S07 — Taux de conversion lead → inscription | Conversion de bout en bout. | `enrollments_confirmés_issus_de_leads / leads × 100` (par cohorte) | % | cohorte / source | `leads` + `enrollments` | mensuelle | school_director | Comparer les sources sur leur résultat final, seule comparaison qui compte. | Nécessite un rattachement fiable `lead → student`. Sans lui, ce KPI est invérifiable. |
| S08 — Durée médiane du cycle de vente | Temps entre la création du lead et l'inscription confirmée. | médiane de `enrollments.enrolled_on − leads.created_at` | jours | programme / source | `leads` + `enrollments` | mensuelle | crm_agent | Dimensionner la fenêtre d'attribution et le calendrier des campagnes avant une rentrée. | Les leads encore en cours ne sont pas dans le calcul : le chiffre est biaisé vers les décisions rapides. Publier aussi la part non encore convertie. |
| S09 — Leads en cours (pipeline) | Nombre de leads actifs non encore tranchés. | `COUNT(leads WHERE status IN ('new','contacted','qualified','nurturing','application_started'))` | leads | jour / agent | `leads` | quotidienne | crm_agent | Décider d'arrêter l'acquisition quand le pipeline dépasse la capacité de traitement. | Un pipeline gonflé de leads froids jamais nettoyés donne une fausse impression d'abondance. |
| S10 — Valeur du pipeline pondérée | Revenu potentiel du pipeline pondéré par la probabilité de l'étape. | `Σ (prix_programme × probabilité_étape)` | monnaie | mois | `leads` + `programs` | hebdomadaire | school_director | Prévoir la trésorerie de la prochaine rentrée. | Les probabilités par étape sont des **hypothèses** tant qu'aucun historique n'existe. Ne pas engager de dépense sur ce chiffre la première année. |
| S11 — Leads perdus par motif | Répartition des pertes selon `lost_reason`. | `COUNT(leads WHERE status='lost')` groupé par `lost_reason` | leads | mois | `leads` | mensuelle | crm_agent | Agir sur la cause dominante (prix, horaires, langue, localisation). | Si « autre » ou « pas de réponse » dépasse 50 %, le champ est mal rempli et l'analyse est inutilisable. |
| S12 — Taux de leads sans suite | Part des leads jamais contactés. | `leads_sans_aucun_followup / leads × 100` | % | semaine / agent | `leads` + `followups` | hebdomadaire | crm_agent | Déclencher une réaffectation immédiate. Tout lead non contacté est de l'argent publicitaire jeté. | Doit tendre vers zéro. Un chiffre supérieur à 5 % est un problème d'organisation, pas de performance. |
| S13 — Charge par agent | Nombre de leads actifs par agent CRM. | `COUNT(leads actifs) / COUNT(agents actifs)` | leads / agent | semaine | `leads.owner_user_id` | hebdomadaire | school_director | Décider d'un recrutement ou d'une réaffectation. | Un agent surchargé fait chuter S01 : lire les deux ensemble. |
| S14 — Taux de réactivation | Part des leads perdus ou dormants revenus dans le tunnel. | `leads_réactivés / leads_dormants_ciblés × 100` | % | campagne de réactivation | `leads` + `followups` | trimestrielle | crm_agent | Décider de lancer une campagne de réactivation avant une rentrée plutôt que d'acheter du trafic neuf. | Réactiver sans consentement marketing enregistré est un risque juridique, pas seulement une gêne. |

---

## 6. Domaine 4 — Students (11 KPI)

| Nom | Définition | Formule exacte | Unité | Granularité | Source | Fréquence | Propriétaire | Décision permise | Pièges d'interprétation |
|---|---|---|---|---|---|---|---|---|---|
| E01 — Étudiants actifs | Effectif réellement présent au sens de la §1. | `COUNT(DISTINCT students)` avec inscription active et présence < 21 jours | étudiants | jour / campus / programme | `enrollments` + `attendance` | hebdomadaire | school_director | Dimensionner les groupes, les salles, les enseignants. | Très différent du nombre d'inscrits. L'écart entre les deux est l'indicateur de santé le plus révélateur d'une école. |
| E02 — Nouveaux étudiants | Premières inscriptions confirmées sur la période. | `COUNT(students WHERE first_enrolled_on ∈ période)` | étudiants | mois / rentrée | `students` + `enrollments` | mensuelle | admin | Mesurer la croissance réelle. | Ne jamais additionner avec les réinscrits sous le mot « inscriptions » sans le préciser. |
| E03 — Taux de réinscription | Part des étudiants achevant un niveau qui se réinscrivent au suivant. | `réinscrits / étudiants_ayant_terminé × 100` | % | cohorte / programme | `enrollments` | par rentrée | school_director | Décider d'investir dans la rétention plutôt que dans l'acquisition — souvent trois à cinq fois plus rentable. | Exige une fenêtre : un étudiant qui revient six mois plus tard doit-il compter ? Fixer la règle (**90 jours proposés, hypothèse**) et s'y tenir. |
| E04 — Taux d'abandon | Part des inscrits qui décrochent avant la fin. | `enrollments_withdrawn / enrollments_confirmés × 100` (par cohorte) | % | cohorte / programme / groupe | `enrollments` | mensuelle | school_director | Déclencher une enquête sur un groupe ou un programme précis. | Un abandon non saisi reste « actif » dans le système et masque le problème. La qualité de ce KPI dépend entièrement de la rigueur de saisie. |
| E05 — Délai médian avant abandon | Temps entre l'inscription et le décrochage. | médiane de `date_dernière_présence − enrolled_on` pour les abandons | jours | programme | `attendance` + `enrollments` | trimestrielle | school_director | Placer l'intervention de rétention au bon moment (souvent les 3 premières semaines). | Une médiane globale masque deux populations très différentes : ceux qui ne commencent jamais et ceux qui décrochent en cours. Segmenter. |
| E06 — Étudiants à risque | Nombre d'étudiants cumulant des signaux de décrochage. | `COUNT` d'étudiants avec ≥ 3 absences non justifiées sur 14 jours **ou** échéance impayée > 15 jours | étudiants | semaine / groupe | `attendance` + `payment_plan_items` | hebdomadaire | admin | Déclencher un appel de suivi. C'est le seul KPI de cette liste qui sauve réellement des inscriptions. | Les seuils (3 absences, 15 jours) sont des **hypothèses** à calibrer sur l'historique réel. |
| E07 — Répartition par nationalité | Structure du corps étudiant par pays d'origine. | `COUNT(students)` groupé par `nationality_code` | % | trimestre | `students` | trimestrielle | marketing | Décider des marchés à travailler et des langues de communication. | L'hypothèse « public largement francophone » doit être vérifiée par ce chiffre, pas supposée. |
| E08 — Répartition par programme | Effectif actif par programme. | `COUNT(enrollments actifs)` groupé par `program_id` | étudiants | mois | `enrollments` | mensuelle | school_director | Arbitrer l'allocation d'enseignants entre anglais et informatique. | Un programme à 3 h/jour et un à 8 h/jour n'ont pas le même poids en charge : pondérer par les heures pour tout arbitrage de ressources. |
| E09 — Taux d'occupation des groupes | Remplissage moyen des groupes. | `Σ current_size / Σ max_size × 100` | % | groupe / campus | `groups` | mensuelle | admin | Décider d'ouvrir ou de fusionner un groupe. | `max_size` est **INCONNU** aujourd'hui : KPI inexploitable tant que les capacités ne sont pas renseignées. |
| E10 — Ancienneté moyenne des étudiants actifs | Durée moyenne depuis la première inscription. | `AVG(CURRENT_DATE − first_enrolled_on)` sur les actifs | jours | trimestre | `students` | trimestrielle | school_director | Évaluer la fidélité et estimer la valeur vie client. | Une ancienneté qui monte peut signaler une fidélité forte **ou** une stagnation du recrutement. Lire avec E02. |
| E11 — Ratio étudiants par enseignant | Charge moyenne d'encadrement. | `étudiants_actifs / enseignants_actifs` | ratio | campus / programme | `students` + `teachers` | mensuelle | school_director | Décider d'un recrutement d'enseignant. | Une moyenne globale sur 18 enseignants masque de grands écarts. Calculer par programme, pas globalement. |

---

## 7. Domaine 5 — Academic (11 KPI)

| Nom | Définition | Formule exacte | Unité | Granularité | Source | Fréquence | Propriétaire | Décision permise | Pièges d'interprétation |
|---|---|---|---|---|---|---|---|---|---|
| AC01 — Taux de présence global | Part des présences sur les présences attendues. | `(present + late) / (total_attendance_records − excused) × 100` | % | jour / groupe / programme | `attendance` | hebdomadaire | admin | Repérer un groupe en difficulté. | Ne mesure **pas** la qualité de l'enseignement (voir §13). Dépend fortement du programme : 8 h/jour est plus exigeant que 3 h/jour. |
| AC02 — Taux de présence par étudiant | Assiduité individuelle. | idem AC01 filtré par étudiant | % | étudiant | `attendance` | hebdomadaire | teacher | Déclencher un entretien individuel. | Donnée personnelle : ne pas afficher publiquement ni comparer nominativement en classe. |
| AC03 — Taux de ponctualité | Part des présences sans retard. | `present / (present + late) × 100` | % | groupe / créneau | `attendance` | hebdomadaire | admin | Ajuster l'heure de début d'un cours si les retards sont systématiques sur un créneau. | Un retard massif sur un créneau est souvent un problème de transport, pas de discipline. |
| AC04 — Séances effectivement tenues | Part des séances planifiées réellement tenues. | `classes_held / (classes_held + classes_cancelled) × 100` | % | mois / enseignant / groupe | `classes` | mensuelle | admin | Identifier un problème de couverture d'enseignants. | Une séance déplacée et non saisie comme telle apparaît comme annulée. Fiabilité dépendante de la saisie. |
| AC05 — Taux de couverture du programme | Part des modules prévus réellement traités. | `modules_avec_≥1_classe_held / modules_prévus × 100` | % | groupe / niveau | `classes` + `modules` | par période | school_director | Détecter un programme non terminé avant l'examen final. | Une séance tenue ne prouve pas que le contenu a été assimilé. Indicateur de couverture, pas de qualité. |
| AC06 — Taux de réussite aux évaluations | Part des notes atteignant le seuil de réussite. | `grades_avec_score >= pass_score / grades_notées × 100` | % | évaluation / module / niveau | `grades` | par période | school_director | Réviser la difficulté d'une épreuve ou renforcer un module. | Un taux de 100 % signale une épreuve trop facile aussi souvent qu'un bon enseignement. Lire avec la dispersion. |
| AC07 — Score moyen par module | Moyenne des scores normalisés. | `AVG(score / max_score) × 100` groupé par module | % | module / groupe | `grades` | par période | school_director | Identifier un module systématiquement faible sur plusieurs groupes. | Comparer des modules notés sur des échelles différentes sans normalisation est une erreur classique. |
| AC08 — Dispersion des notes | Écart-type des scores normalisés d'un groupe. | `stddev_pop(score / max_score)` | points | groupe / évaluation | `grades` | par période | teacher | Détecter un groupe hétérogène nécessitant un dédoublement. | Une dispersion forte n'est pas un défaut en soi : elle l'est si elle augmente au fil du niveau. |
| AC09 — Progression entre évaluations | Écart entre le score d'entrée et le score de sortie d'un même étudiant. | `score_final_normalisé − score_placement_normalisé` | points | étudiant / groupe | `grades` (type `placement` vs `final`) | par période | school_director | Mesurer l'effet réel de la formation, seul indicateur pédagogique défendable. | Exige un test de placement à l'entrée comparable au test final. **À CONFIRMER : ce dispositif existe-t-il chez TAS ?** |
| AC10 — Taux de passage de niveau | Part des étudiants validant leur niveau. | `étudiants_passés / étudiants_évalués × 100` | % | niveau / cohorte | `enrollments` + `grades` | par période | school_director | Ajuster la durée prévue d'un niveau. | Un taux très élevé peut refléter une pression à faire passer plutôt qu'une réussite. Croiser avec AC09. |
| AC11 — Délai de publication des notes | Temps entre la tenue d'une évaluation et la publication. | médiane de `grades.published_at − assessments.scheduled_on` | jours | enseignant / module | `assessments` + `grades` | mensuelle | admin | Fixer une règle de délai de correction. | Indicateur d'organisation, pas de compétence pédagogique. |

---

## 8. Domaine 6 — Finance (14 KPI)

| Nom | Définition | Formule exacte | Unité | Granularité | Source | Fréquence | Propriétaire | Décision permise | Pièges d'interprétation |
|---|---|---|---|---|---|---|---|---|---|
| F01 — Revenu encaissé | Somme des encaissements confirmés nets de remboursements. | `SUM(amount × fx_rate) WHERE direction='in' AND status='confirmed' − SUM(remboursements)` | monnaie | jour / mois / campus / programme | `payments` | quotidienne | finance | Piloter la trésorerie. | Sans `fx_rate_to_base`, mélanger GHS et CFA produit un total dénué de sens. |
| F02 — Revenu contractualisé | Montant des contrats signés sur la période. | `SUM(tuition_amount − discount_amount)` pour `enrollments` confirmées | monnaie | mois / rentrée | `enrollments` | mensuelle | finance | Prévoir les encaissements futurs. | Ne jamais communiquer ce chiffre comme du chiffre d'affaires réalisé. |
| F03 — Taux de recouvrement | Part du contractualisé effectivement encaissé. | `encaissé_sur_cohorte / contractualisé_sur_cohorte × 100` | % | cohorte / programme | `payments` + `enrollments` | mensuelle | finance | Décider de durcir la politique d'acompte. | Se calcule par cohorte d'inscription, pas par mois calendaire. |
| F04 — Impayés | Montant des échéances échues non réglées. | `SUM(amount_due − amount_paid) WHERE due_date < CURRENT_DATE AND status <> 'paid'` | monnaie | jour / étudiant / campus | `payment_plan_items` | hebdomadaire | finance | Déclencher les relances. | Un impayé de 2 jours et un de 90 jours n'ont pas la même gravité : toujours accompagner de F05. |
| F05 — Ancienneté des impayés | Répartition des impayés par tranche d'ancienneté. | Montants regroupés en 0–15 / 16–30 / 31–60 / 60+ jours | monnaie par tranche | mois | `payment_plan_items` | mensuelle | finance | Prioriser les relances et provisionner les créances douteuses. | Sans cette vue, la direction découvre les créances irrécouvrables trop tard. |
| F06 — Taux d'impayés | Part du dû échu non réglé. | `impayés / total_échu × 100` | % | mois / programme | `payment_plan_items` | mensuelle | finance | Décider d'exiger un acompte plus élevé sur un programme. | Un taux qui baisse parce qu'on a cessé d'échelonner n'est pas une amélioration du recouvrement. |
| F07 — Revenu moyen par étudiant | Revenu encaissé rapporté aux étudiants actifs. | `revenu_encaissé / étudiants_actifs` | monnaie / étudiant | mois / programme | `payments` + `enrollments` | mensuelle | school_director | Comparer la valeur des programmes. | Une moyenne écrase la différence entre un intensif et un cours à 3 h/jour. Toujours segmenter par programme. |
| F08 — Valeur vie client (LTV) | Revenu total attendu d'un étudiant sur l'ensemble de son parcours. | `revenu_moyen_par_inscription × nombre_moyen_d'inscriptions_par_étudiant` | monnaie | programme | `payments` + `enrollments` | trimestrielle | school_director | Fixer le budget maximal d'acquisition. | Sans historique pluriannuel, la LTV est une **hypothèse**. Ne pas engager de budget publicitaire sur une LTV estimée la première année. |
| F09 — Ratio LTV / CAC | Rentabilité de l'acquisition. | `F08 / A07` | ratio | programme / source | `payments` + `campaigns` | trimestrielle | school_director | Décider d'accélérer ou de freiner l'investissement marketing. | Un ratio de 3 est souvent cité comme sain : c'est une norme importée d'un autre secteur, à valider ici, pas à appliquer aveuglément. |
| F10 — Répartition par moyen de paiement | Structure des encaissements par méthode. | `SUM(amount)` groupé par `method` | % | mois | `payments` | mensuelle | finance | Négocier des frais, décider d'ouvrir un canal de paiement. | Une forte part d'espèces est un risque de contrôle interne autant qu'un choix client. |
| F11 — Délai médian d'encaissement | Temps entre l'échéance et le paiement effectif. | médiane de `paid_at − due_date` | jours | programme | `payments` + `payment_plan_items` | mensuelle | finance | Calibrer le besoin en fonds de roulement. | Une valeur négative (paiement anticipé) est normale et ne doit pas être écartée du calcul. |
| F12 — Revenu logement | Encaissements liés à l'hébergement. | `SUM(amount) WHERE payment_type='accommodation'` | monnaie | mois / formule | `payments` | mensuelle | finance | Évaluer la rentabilité des trois formules (130 000 / 100 000 / 60 000 CFA par mois). | Le revenu brut n'est pas une marge : sans les coûts d'hébergement associés, ce KPI ne permet aucune décision de tarification. |
| F13 — Taux de remise accordée | Part du chiffre d'affaires abandonnée en remises. | `SUM(discount_amount) / SUM(tuition_amount) × 100` | % | mois / agent | `enrollments` | mensuelle | finance | Encadrer la latitude de négociation des agents. | Une remise non saisie mais appliquée à la caisse rend ce KPI faux. Contrôler par recoupement avec F03. |
| F14 — Revenu par source d'acquisition | Chiffre d'affaires attribué à chaque canal. | `SUM(conversions.value_amount)` groupé par `attributed_channel`, à modèle d'attribution fixé | monnaie | mois / canal | `conversions` | mensuelle | school_director | Réallouer le budget marketing. C'est le seul arbitrage marketing réellement défendable. | Sommer plusieurs modèles d'attribution double le revenu. Filtrer impérativement sur un seul `attribution_model`. |

---

## 9. Domaine 7 — Marketing (11 KPI)

| Nom | Définition | Formule exacte | Unité | Granularité | Source | Fréquence | Propriétaire | Décision permise | Pièges d'interprétation |
|---|---|---|---|---|---|---|---|---|---|
| M01 — Dépense publicitaire | Montant investi sur la période. | `SUM(campaigns.spend_amount)` | monnaie | semaine / canal | `campaigns` | hebdomadaire | marketing | Suivre la consommation budgétaire. | Saisie manuelle tant qu'aucune API publicitaire n'est connectée : risque d'écart avec les factures réelles. |
| M02 — Retour sur dépense publicitaire (ROAS) | Revenu attribué rapporté à la dépense. | `revenu_attribué / dépense` | ratio | campagne / canal | `conversions` + `campaigns` | mensuelle | marketing | Arrêter ou amplifier une campagne. | Le revenu d'une inscription arrive souvent après la fin de la campagne : un ROAS lu trop tôt est toujours mauvais. Respecter le délai de S08. |
| M03 — Coût pour mille impressions (CPM) | Coût de mille affichages. | `dépense / impressions × 1000` | monnaie | campagne | `creatives` | hebdomadaire | marketing | Comparer le coût d'accès à une audience entre plateformes. | Indicateur de marché, pas de performance. Un CPM bas sur une audience non pertinente ne vaut rien. |
| M04 — Taux de clic (CTR) | Part des impressions donnant un clic. | `clicks / impressions × 100` | % | créatif | `creatives` | hebdomadaire | marketing | Tester un nouveau visuel ou une nouvelle accroche. | Un CTR élevé avec un taux de rebond élevé signale une promesse trompeuse, pas une bonne annonce. |
| M05 — Coût par clic (CPC) | Coût moyen d'un clic. | `dépense / clicks` | monnaie | campagne | `creatives` | hebdomadaire | marketing | Ajuster les enchères. | Optimiser le CPC conduit souvent à acheter du trafic bon marché et sans valeur. Ne jamais en faire un objectif principal. |
| M06 — Taux de conversion des créatifs | Leads générés par clic sur un créatif. | `leads_attribués / clicks × 100` | % | créatif | `conversions` + `creatives` | mensuelle | marketing | Décider quel créatif reproduire. | Exige un `utm_content` distinct par créatif ; sans discipline de balisage, ce KPI n'existe pas. |
| M07 — Publications réalisées vs planifiées | Respect du calendrier éditorial. | `published / scheduled × 100` | % | mois / canal | `content_calendar` | mensuelle | marketing | Redimensionner l'ambition éditoriale à la capacité réelle. | Publier 100 % d'un calendrier vide ne vaut rien. Lire avec le volume absolu. |
| M08 — Répartition par pilier de contenu | Équilibre entre les six piliers éditoriaux. | `publications_par_pilier / publications_totales × 100` | % | mois | `content_calendar` | mensuelle | marketing | Rééquilibrer si les publications d'offre dominent au détriment de la preuve sociale. | Un équilibre parfait n'est pas un objectif en soi ; c'est l'absence totale d'un pilier qui pose problème. |
| M09 — Leads par pilier de contenu | Efficacité commerciale de chaque type de contenu. | `COUNT(leads attribués)` groupé par `content_calendar.pillar` | leads | trimestre | `conversions` + `content_calendar` | trimestrielle | marketing | Réorienter la production de contenu. | Attribution fragile en organique : traiter le résultat comme une tendance, pas comme une mesure. |
| M10 — Taux de contenu généré par IA relu | Part des contenus IA validés par un humain avant publication. | `contenus_ai_approved / contenus_ai_generated × 100` | % | mois | `content_calendar` | mensuelle | marketing | Maintenir le contrôle éditorial. Doit valoir 100 %. | Tout écart à 100 % est un incident de processus, pas un indicateur à optimiser progressivement. |
| M11 — Part de voix locale | Position de l'école sur les recherches de marque et de catégorie. | mesure externe (**outil à définir**) | rang / % | trimestre | externe | trimestrielle | marketing | Décider d'un effort de référencement local. | Non mesurable avec les données internes. À marquer comme source externe, avec sa méthode. |

---

## 10. Domaine 8 — Operations (10 KPI)

| Nom | Définition | Formule exacte | Unité | Granularité | Source | Fréquence | Propriétaire | Décision permise | Pièges d'interprétation |
|---|---|---|---|---|---|---|---|---|---|
| O01 — Taux d'occupation des salles | Heures occupées sur heures ouvrables. | `Σ heures_classes_held / (salles × heures_ouvrables) × 100` | % | semaine / campus | `classes` + `rooms` | hebdomadaire | admin | Décider d'ouvrir un créneau ou de louer un espace. | Nécessite des horaires d'ouverture définis, **À CONFIRMER**. |
| O02 — Conflits de planning détectés | Nombre de chevauchements salle ou enseignant. | `COUNT` de chevauchements sur `(room_id, plage)` et `(teacher_id, plage)` | conflits | semaine | `classes` | hebdomadaire | admin | Corriger le planning avant qu'il ne produise une séance annulée. | Doit tendre vers zéro grâce à la contrainte d'exclusion en base ; un conflit résiduel signale un contournement manuel. |
| O03 — Charge horaire par enseignant | Heures réellement enseignées. | `Σ (ends_at − starts_at)` des `classes` tenues par enseignant | heures | semaine / enseignant | `classes` | hebdomadaire | admin | Rééquilibrer les affectations, prévenir l'épuisement. | Indicateur de charge, **jamais** de performance (voir §13). |
| O04 — Taux de remplacement | Part des séances assurées par un remplaçant. | `classes_avec_teacher <> lead_teacher / classes_held × 100` | % | mois | `classes` + `groups` | mensuelle | admin | Décider de constituer un vivier de remplaçants. | Un taux élevé peut refléter une souplesse organisationnelle saine autant qu'un problème d'absentéisme. |
| O05 — Délai de traitement d'une candidature | Temps entre soumission et décision. | médiane de `decision_at − submitted_at` | jours | mois / programme | `applications` | hebdomadaire | admin | Réduire le délai : c'est un facteur direct de perte de candidats. | Les candidatures jamais traitées n'ont pas de `decision_at` et sortent du calcul, ce qui embellit artificiellement le chiffre. Publier aussi le nombre en attente. |
| O06 — Dossiers incomplets | Candidatures bloquées par une pièce manquante. | `COUNT(applications WHERE status='documents_pending')` | dossiers | semaine | `applications` | hebdomadaire | reception | Simplifier la liste des pièces exigées ou mieux l'expliquer en amont. | Un dossier bloqué depuis 30 jours est un abandon déguisé : suivre l'ancienneté. |
| O07 — Documents expirant sous 60 jours | Passeports et visas arrivant à échéance. | `COUNT(student_documents WHERE expires_on < CURRENT_DATE + 60)` | documents | hebdomadaire | `student_documents` | hebdomadaire | admin | Anticiper les régularisations. Enjeu réel pour un public étranger. | Donnée sensible : accès restreint, notification ciblée. |
| O08 — Taux de saisie des présences | Part des séances tenues avec présence saisie. | `classes_held_avec_attendance / classes_held × 100` | % | semaine / enseignant | `classes` + `attendance` | hebdomadaire | admin | Corriger un défaut de processus. **Tous les KPI académiques dépendent de ce chiffre.** | Si ce taux est inférieur à 90 %, tous les KPI du domaine Academic doivent être présentés comme non fiables. |
| O09 — Incidents de sécurité ouverts | Incidents non clos. | `COUNT(security_incidents WHERE status IN ('open','investigating'))` | incidents | semaine | `security_incidents` | hebdomadaire | school_director | Prioriser le traitement. | Un registre vide signifie plus souvent « personne ne déclare » que « rien ne se passe ». |
| O10 — Délai de résolution des incidents | Temps de clôture. | médiane de `resolved_at − detected_at` | heures / jours | trimestre | `security_incidents` | trimestrielle | school_director | Ajuster les procédures. | Segmenter par gravité : mélanger un vol de téléphone et une fuite de données n'a aucun sens. |

---

## 11. Domaine 9 — IA (10 KPI)

| Nom | Définition | Formule exacte | Unité | Granularité | Source | Fréquence | Propriétaire | Décision permise | Pièges d'interprétation |
|---|---|---|---|---|---|---|---|---|---|
| I01 — Requêtes IA | Nombre d'actions IA exécutées. | `COUNT(ai_usage)` | requêtes | jour / rôle / action | `ai_usage` | hebdomadaire | super_admin | Dimensionner les packs de crédits. | Volume d'usage, pas de valeur. Une IA très utilisée et jamais utile reste inutile. |
| I02 — Crédits consommés | Crédits dépensés sur la période. | `SUM(credits_charged)` | crédits | jour / école / rôle | `ai_usage` | quotidienne | super_admin | Anticiper un rechargement avant blocage. | À rapprocher du coût fournisseur réel côté opérateur, invisible pour l'école. |
| I03 — Coût réel par requête | Coût fournisseur moyen d'une requête. | `SUM(provider_cost_usd) / COUNT(ai_usage)` | USD / requête | mois / type d'action | `ai_usage` | mensuelle | platform_operator | Ajuster la grille de crédits pour préserver la marge. | Visible par l'opérateur uniquement. Ne jamais exposer à l'école. |
| I04 — Marge sur crédits | Écart entre crédits facturés et coût réel. | `(revenu_crédits − coût_fournisseur) / revenu_crédits × 100` | % | mois | `ai_credit_transactions` + `ai_usage` | mensuelle | platform_operator | Réviser la tarification. | Une marge négative sur un type d'action précis peut être masquée par la moyenne : analyser par `action_code`. |
| I05 — Taux de réponses sourcées | Part des réponses appuyées sur au moins un document approuvé. | `COUNT(ai_usage WHERE grounded_on_sources > 0) / COUNT(ai_usage WHERE action nécessite une source) × 100` | % | semaine / assistant | `ai_usage` | hebdomadaire | super_admin | Enrichir la base de connaissances là où elle est insuffisante. **KPI de confiance central.** | Un document cité n'est pas un document pertinent. Compléter par un contrôle qualitative par échantillon. |
| I06 — Taux de refus pour donnée manquante | Part des requêtes où l'IA refuse de répondre faute de données. | `COUNT(refused_reason='missing_data') / COUNT(ai_usage) × 100` | % | semaine | `ai_usage` | hebdomadaire | super_admin | Identifier les trous de données à combler en priorité. | Un taux de refus **élevé est un bon signe** : cela signifie que l'IA n'invente pas. Un taux nul doit inquiéter. |
| I07 — Taux de refus pour permission | Requêtes bloquées par le cloisonnement. | `COUNT(refused_reason='permission_denied') / COUNT(ai_usage) × 100` | % | semaine / rôle | `ai_usage` | hebdomadaire | super_admin | Réviser les droits ou former l'utilisateur. | Une hausse brutale peut signaler une tentative d'accès indue : croiser avec `audit_logs`. |
| I08 — Taux d'adoption par rôle | Part des utilisateurs actifs utilisant l'IA. | `utilisateurs_ai_actifs / utilisateurs_actifs × 100` groupé par rôle | % | mois / rôle | `ai_usage` + `users` | mensuelle | school_director | Décider de former ou de retirer un assistant inutilisé. | Une adoption faible n'est pas forcément un rejet : ce peut être une méconnaissance ou un assistant mal conçu. Interroger avant de conclure. |
| I09 — Temps de réponse médian | Latence perçue. | médiane de `latency_ms` | ms | semaine / action | `ai_usage` | hebdomadaire | super_admin | Changer de modèle ou de fournisseur. | Au-delà de 8 à 10 secondes (**hypothèse**), l'usage s'effondre quelle que soit la qualité. |
| I10 — Temps économisé estimé | Gain de temps déclaré par les utilisateurs. | `Σ (temps_estimé_sans_IA − temps_réel)` par type de tâche, déclaratif | heures | trimestre | enquête interne | trimestrielle | school_director | Justifier ou arrêter l'investissement IA. | Purement **déclaratif** donc biaisé à la hausse. Toujours présenté comme une estimation, jamais comme une mesure. |

---

## 12. KPI de vanité à éviter

Un indicateur de vanité a trois propriétés : il monte presque toujours, il est
facile à améliorer sans créer de valeur, et personne ne sait quelle décision
prendre quand il varie. Les suivants sont explicitement exclus des tableaux de
bord de direction.

| Indicateur de vanité | Pourquoi il trompe | KPI de substitution |
|---|---|---|
| **Nombre d'abonnés** (Facebook, Instagram, TikTok) | Cumulatif et jamais décroissant, donc toujours « positif ». Achetable. Un compte à 50 000 abonnés inactifs génère moins d'inscriptions qu'un compte à 2 000 abonnés locaux. Aucune décision n'en découle. | **A12 — Leads par publication organique** et **F14 — Revenu par source**. Ce qui compte est le nombre de personnes qui poussent la porte, pas celles qui suivent. |
| **Vues brutes d'une vidéo** | Une « vue » dure 3 secondes sur certaines plateformes. Elle mesure la distribution algorithmique, pas l'intérêt. Une vidéo virale hors zone d'Accra n'apportera jamais un seul étudiant. | **Vues qualifiées locales** : vues de plus de 15 secondes provenant de la zone géographique cible, et surtout **M06 — Taux de conversion des créatifs**. |
| **Likes et réactions** | Coût psychologique nul pour l'utilisateur, donc signal très faible. Corrélation quasi nulle avec l'inscription. | **W09 — Taux de clic vers WhatsApp** et **A01 — Leads générés**. |
| **Pages vues totales** | Gonflables par un rechargement, un bug ou un robot. Un visiteur perdu qui cherche une information consulte beaucoup de pages : un chiffre élevé peut signaler un mauvais site. | **W04 — Taux d'engagement** et **W13 — Pages d'entrée les plus performantes**. |
| **Nombre de leads bruts** | Sans dédoublonnage ni qualification, on optimise le volume de bruit. Un formulaire sans validation double le chiffre en une semaine. | **A04 — Taux de qualification** et **A05 — Coût par lead qualifié**. |
| **Nombre d'inscrits cumulé (« plus de 1200 étudiants formés »)** | Excellent argument de communication, vérifié chez TAS, mais indicateur de pilotage nul : il ne peut que monter et ne dit rien sur le trimestre en cours. | **E01 — Étudiants actifs** et **E02 — Nombre de nouveaux étudiants**. |
| **Taux de réussite aux examens pris isolément** | Mesure la difficulté de l'épreuve autant que l'apprentissage. Améliorable en baissant le niveau. | **AC09 — Progression entre évaluations** (écart entrée/sortie). |
| **Nombre de requêtes IA** | Mesure l'agitation, pas la valeur. Une IA qui répond mal génère plus de requêtes qu'une IA qui répond bien. | **I05 — Taux de réponses sourcées** et **I10 — Temps économisé estimé**. |
| **Temps passé sur le site** | Ambigu : peut signifier intérêt ou confusion. Un utilisateur qui trouve l'information en 20 secondes a eu une meilleure expérience qu'un autre qui erre 4 minutes. | **W11 / W12 — Taux de début et de complétion du formulaire**. |
| **Nombre de publications réalisées** | Mesure l'activité, pas le résultat. Publier tous les jours sans effet est un coût, pas une performance. | **M09 — Leads par pilier de contenu**. |

**Règle de gouvernance associée :** un indicateur de vanité peut rester visible
dans une vue « notoriété », jamais dans le tableau de bord de décision de la
direction. La séparation doit être explicite dans l'interface, pas laissée à
l'appréciation du lecteur.

---

## 13. Avertissement méthodologique sur l'évaluation des enseignants

Cette section est volontairement placée en fin de document parce qu'elle
conditionne l'usage de plusieurs KPI qui la précèdent. Elle doit être lue par
toute personne qui envisagerait de classer les 18 enseignants de TAS sur un
tableau de bord.

### 13.1 Pourquoi le taux de présence d'un groupe ne mesure pas la qualité d'un enseignant

Le taux de présence (AC01) d'un groupe dépend en très grande partie de
variables sur lesquelles l'enseignant n'a aucune prise :

- **Le programme.** Un cours intensif de 8 h/jour produit mécaniquement plus
  d'absences qu'un cours de 3 h/jour. Comparer les deux est absurde.
- **Le créneau horaire.** Un cours du matin en saison des pluies, dans une ville
  où le transport est difficile, aura un taux de présence structurellement plus
  bas.
- **La composition du groupe.** Un groupe d'étudiants étrangers boursiers et un
  groupe d'actifs qui financent eux-mêmes leur formation n'ont pas la même
  assiduité, indépendamment de l'enseignant.
- **La situation financière.** Un étudiant en retard de paiement cesse souvent de
  venir avant de se déclarer. Sa disparition est comptée contre son enseignant.
- **L'attribution des groupes.** Si les groupes réputés difficiles sont confiés
  aux enseignants les plus expérimentés — ce qui est la pratique raisonnable —
  alors le classement par taux de présence pénalise précisément les meilleurs.

Ce dernier point est décisif : l'affectation des enseignants aux groupes n'est
pas aléatoire. Toute comparaison entre enseignants sur des groupes non
comparables mesure d'abord la difficulté du groupe, ensuite seulement
l'enseignant.

### 13.2 Pourquoi la moyenne de classe ne mesure pas davantage la qualité

- **Elle dépend du niveau d'entrée.** Une classe qui démarre à 40 et finit à 65 a
  beaucoup plus appris qu'une classe qui démarre à 70 et finit à 75. La moyenne
  finale dit l'inverse.
- **Elle est manipulable.** L'enseignant fixe ou influence souvent la difficulté
  de l'épreuve. Mesurer quelqu'un sur un chiffre qu'il contrôle lui-même est une
  erreur de conception, pas un problème d'honnêteté individuelle.
- **Elle subit une régression vers la moyenne.** Un groupe faible progressera
  davantage qu'un groupe fort quoi qu'il arrive. Interpréter cette variation
  comme un effet enseignant est une erreur statistique documentée.
- **Les effectifs sont petits.** Avec 12 à 20 étudiants par groupe (**taille
  réelle À CONFIRMER**), deux ou trois étudiants en difficulté déplacent la
  moyenne de plusieurs points. Le bruit domine le signal.

### 13.3 Ce qu'un chiffre de tableau de bord ne pourra jamais capter

La clarté d'une explication, la capacité à remettre en confiance un étudiant
francophone bloqué à l'oral, la gestion d'un conflit en classe, la patience avec
un débutant complet, la préparation effective des séances : aucune de ces
dimensions — qui constituent l'essentiel du métier — n'a de trace dans
`attendance` ou dans `grades`.

### 13.4 Méthodologie valide si l'école veut réellement évaluer ses enseignants

Une évaluation défendable repose sur **quatre sources croisées**, dont aucune ne
suffit seule :

| Source | Ce qu'elle mesure | Poids indicatif (**hypothèse**) | Condition de validité |
|---|---|---|---|
| **Progression normalisée (valeur ajoutée)** | Écart entre score d'entrée et de sortie, ajusté du niveau initial du groupe (AC09) | 30 % | Exige un test de placement standardisé à l'entrée et une épreuve finale commune, corrigée en aveugle par un autre enseignant. Sans correction croisée, la mesure est invalide. |
| **Observation de classe par un pair ou un responsable** | Pratique pédagogique réelle | 30 % | Grille d'observation écrite, connue à l'avance, au moins deux observations par période, par deux observateurs différents. |
| **Retour structuré des étudiants** | Clarté perçue, sentiment de progression, climat de classe | 20 % | Questionnaire anonyme, en français **et** en anglais, sur des comportements précis (« l'enseignant reformule quand je ne comprends pas ») et non sur la sympathie. Questionnaire administré à mi-parcours, pas après les notes. |
| **Fiabilité professionnelle** | Ponctualité, séances tenues, délai de correction (AC11, O04) | 20 % | Mesure objective, mais qui ne dit rien de la pédagogie. Plafonner son poids. |

**Trois garde-fous non négociables**

1. **Pas de classement public.** Une évaluation sert à accompagner et à former,
   pas à humilier. Un classement affiché détruit la coopération entre
   enseignants, qui est elle-même un facteur de qualité.
2. **Pas de décision individuelle sur une seule période.** Le bruit statistique
   sur de petits effectifs impose au minimum trois périodes d'observation avant
   toute conclusion sur une personne.
3. **Ajustement obligatoire au contexte du groupe.** Toute comparaison entre
   enseignants doit contrôler le programme, le niveau, le créneau et la taille
   du groupe. À défaut, ne pas comparer du tout.

**Recommandation finale.** Tant que les conditions ci-dessus ne sont pas
réunies — test de placement standardisé, grille d'observation, questionnaire
étudiant bilingue —, le système ne doit afficher **aucun indicateur nominatif de
performance enseignante**. Les indicateurs O03 (charge horaire), O04 (taux de
remplacement) et AC11 (délai de publication des notes) sont des indicateurs
**d'organisation** : ils doivent être étiquetés comme tels dans l'interface,
avec une mention explicite qu'ils ne mesurent pas la qualité pédagogique. Cette
mention doit être dans le produit, pas seulement dans ce document : c'est la
seule façon d'empêcher un usage abusif six mois plus tard, quand personne ne se
souviendra de cette page.

---

## 14. Règles de gouvernance du dictionnaire

1. **Une définition, un propriétaire.** Toute modification d'une formule passe
   par le propriétaire du KPI et est datée dans ce fichier.
2. **Pas de KPI sans décision.** Si la colonne « décision permise » ne peut pas
   être remplie de façon crédible, l'indicateur ne rentre pas dans le
   dictionnaire.
3. **Afficher la fiabilité avec le chiffre.** Tout indicateur dérivé d'une
   saisie humaine incomplète (présences, motifs de perte, dépense publicitaire)
   doit être affiché avec son taux de complétude. Un taux de présence calculé
   sur 60 % des séances saisies doit le dire.
4. **Jamais de chiffre sans dénominateur.** « 12 inscriptions » ne veut rien
   dire sans « sur 140 leads ».
5. **Distinguer mesuré, déclaré et estimé.** Cette distinction est portée en
   base par `touchpoints.evidence` et doit remonter jusqu'à l'affichage.
6. **Aucune cible chiffrée avant un trimestre d'observation.** Fixer un objectif
   sur une valeur inconnue produit soit un objectif trivial, soit un objectif
   décourageant. Les seuils marqués « hypothèse » dans ce document doivent tous
   être révisés après la première période complète de données réelles.

---

*Document de modélisation — aucun de ces indicateurs n'est implémenté.
Prérequis avant tout tableau de bord : les six questions bloquantes du §23.1 de
`05-database-schema.md`, en particulier les prix des programmes, sans lesquels
aucun KPI financier ni aucun coût d'acquisition n'est calculable.*
