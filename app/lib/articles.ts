/**
 * Articles de la page Ressources (/resources/[slug]).
 * Une seule source : la liste, la page article, l'accueil et le sitemap lisent ce fichier.
 * Les montants viennent de fees.ts, jamais recopiés à la main.
 *
 * Mise en forme du texte : **gras** est accepté dans les paragraphes, listes et encadrés.
 */

import {
  EXAM_CLASS_CFA,
  EXAM_FEES,
  INTENSIVE_FEES,
  INTENSIVE_HOURS,
  REGULAR_FEES,
  formatMoney,
} from "./fees";

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "tip"; title?: string; text: string }
  | { type: "table"; head: string[]; rows: string[][] };

export interface ArticleCopy {
  tag: string;
  title: string;
  excerpt: string;
  imageAlt: string;
  /** Message pré-rempli quand un lecteur partage l'article sur WhatsApp. */
  shareText: string;
  blocks: ArticleBlock[];
}

export interface Article {
  slug: string;
  image: string;
  /** ISO date, AAAA-MM-JJ. */
  publishedAt: string;
  /** À renseigner quand on modifie un article déjà publié : Google affiche la date de mise à jour. */
  updatedAt?: string;
  readMinutes: number;
  fr: ArticleCopy;
  en: ArticleCopy;
}

const exam = (name: (typeof EXAM_FEES)[number]["name"]) =>
  EXAM_FEES.find((e) => e.name === name)!.examCfa;
const intensive1Month = INTENSIVE_FEES.find((f) => f.durationEn === "1 month")!.priceCfa;
const regular3Months = REGULAR_FEES[0].withoutItCfa;

export const ARTICLES: Article[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "premier-mois-a-accra",
    image: "/images/blog/blog-first-month-accra.jpg",
    publishedAt: "2026-09-02",
    readMinutes: 7,
    fr: {
      tag: "Vie étudiante",
      title: "Comment préparer votre premier mois à Accra",
      excerpt: "Papiers, argent, téléphone, transport, santé : la check-list pour arriver sereinement et démarrer votre formation dès la première semaine.",
      imageAlt: "Étudiant avec sac à dos et valise qui consulte son téléphone dans une rue d'Accra",
      shareText: "Tu pars étudier l'anglais à Accra ? Voici la check-list complète pour ton premier mois 👇",
      blocks: [
        { type: "p", text: "Le premier mois décide souvent de tout le reste. Un étudiant qui arrive avec ses papiers en ordre, un peu d'argent local et un téléphone qui marche se concentre sur l'anglais dès le lundi. Celui qui arrive sans préparation passe sa première semaine à courir. Voici tout ce que nous répétons aux nouveaux étudiants de TAS avant leur arrivée." },
        { type: "h2", text: "Avant le départ : les papiers" },
        { type: "list", items: [
          "**Passeport** valide au moins 6 mois après la date de retour prévue.",
          "**Carnet de vaccination avec la fièvre jaune** : il est exigé à l'entrée au Ghana. Sans lui, vous risquez d'être bloqué à l'aéroport ou à la frontière.",
          "**Visa** : les ressortissants des pays de la CEDEAO (Côte d'Ivoire, Togo, Bénin, Burkina Faso, Sénégal, Mali, Niger, Guinée…) entrent au Ghana sans visa pour un séjour de courte durée. Les autres nationalités (Cameroun, Congo, Gabon, Tchad…) doivent demander un visa à l'ambassade du Ghana avant de partir. Nous pouvons vous fournir une lettre d'admission pour appuyer la demande.",
          "**Assurance santé voyage** couvrant toute la durée du séjour.",
          "Des **copies** de tous ces documents : une version papier dans le sac, une version en photo sur votre téléphone et dans votre e-mail.",
        ] },
        { type: "tip", title: "Bon à savoir", text: "Consultez un médecin avant le départ pour la prévention du paludisme. Le risque existe toute l'année au Ghana, comme dans la plupart des pays de la région." },
        { type: "h2", text: "L'argent : cedis et Mobile Money" },
        { type: "p", text: "La monnaie du Ghana est le **cedi (GH₵)**. Le franc CFA n'est pas accepté dans les boutiques. Changez une petite somme à l'arrivée pour les premiers jours (taxi, eau, repas), puis utilisez les bureaux de change agréés ou les distributeurs en ville pour le reste." },
        { type: "p", text: "Au quotidien, tout le monde paie avec le **Mobile Money** (MoMo) : marchés, taxis, restaurants, recharges. Dès que vous avez une carte SIM ghanéenne, activez un compte Mobile Money. C'est plus sûr que de transporter beaucoup d'espèces." },
        { type: "h2", text: "Le téléphone : une SIM locale dès le premier jour" },
        { type: "p", text: "Les principaux opérateurs sont **MTN**, **Telecel** et **AT**. La carte SIM s'enregistre avec votre passeport, dans une boutique officielle de l'opérateur. Achetez un forfait internet : vous en aurez besoin pour les applis de transport, les cartes et WhatsApp." },
        { type: "h2", text: "Se déplacer dans Accra" },
        { type: "list", items: [
          "**Uber, Bolt et Yango** fonctionnent bien à Accra et affichent le prix avant la course. C'est la solution la plus simple les premières semaines.",
          "Le **trotro** (minibus collectif) est le transport local le moins cher. Demandez à un camarade ou à l'équipe TAS de vous accompagner la première fois : c'est aussi un excellent exercice d'anglais.",
          "Enregistrez l'adresse de l'école dans votre téléphone : **Alajo Polo Junction, Kotobabi, Accra**.",
        ] },
        { type: "h2", text: "La vie quotidienne" },
        { type: "list", items: [
          "**Prises électriques** : le Ghana utilise surtout la prise à trois broches rectangulaires (type G, comme au Royaume-Uni). Prévoyez un adaptateur.",
          "**Climat** : chaud et humide toute l'année. La grande saison des pluies va environ d'avril à juin, une plus petite revient vers septembre-octobre. Un parapluie léger et des vêtements en coton suffisent.",
          "**Eau** : buvez de l'eau en bouteille ou en sachet scellé.",
          "**Politesse** : on salue avant toute demande (« Good morning, how are you? »), et on donne ou reçoit un objet de la main droite.",
        ] },
        { type: "h2", text: "Votre plan semaine par semaine" },
        { type: "table", head: ["Semaine", "Objectif"], rows: [
          ["Semaine 1", "Test de niveau, installation au logement, SIM et Mobile Money actifs, repérage du trajet école-logement."],
          ["Semaine 2", "Routine fixe : cours, révisions du soir, 15 minutes d'écoute par jour. Commander seul au restaurant, en anglais."],
          ["Semaine 3", "Participer à une sortie ou une activité du week-end. Se faire au moins un ami qui ne parle pas français."],
          ["Semaine 4", "Faire le point avec votre professeur : ce qui a progressé, ce qu'il reste à travailler le mois suivant."],
        ] },
        { type: "tip", title: "Le conseil de l'équipe TAS", text: "La règle d'or du premier mois : **ne restez pas seulement entre francophones**. C'est confortable, mais c'est le moyen le plus sûr de rentrer avec le même niveau. Chaque conversation en anglais, même maladroite, compte." },
        { type: "p", text: "Vous préparez votre arrivée et vous avez une question précise (logement, visa, date de rentrée) ? Écrivez-nous sur WhatsApp : l'équipe répond en français." },
      ],
    },
    en: {
      tag: "Student life",
      title: "How to prepare for your first month in Accra",
      excerpt: "Papers, money, phone, transport, health: the checklist to arrive with confidence and start learning from week one.",
      imageAlt: "Student with a backpack and suitcase checking a phone on a street in Accra",
      shareText: "Going to Accra to study English? Here's the full checklist for your first month 👇",
      blocks: [
        { type: "p", text: "Your first month often sets the tone for everything else. A student who arrives with papers in order, some local money and a working phone can focus on English from Monday. A student who arrives unprepared spends the first week running around. Here is everything we tell new TAS students before they arrive." },
        { type: "h2", text: "Before you leave: documents" },
        { type: "list", items: [
          "**Passport** valid for at least 6 months after your planned return date.",
          "**Vaccination card with yellow fever**: it is required to enter Ghana. Without it, you may be stopped at the airport or the border.",
          "**Visa**: citizens of ECOWAS countries (Côte d'Ivoire, Togo, Benin, Burkina Faso, Senegal, Mali, Niger, Guinea…) can enter Ghana without a visa for a short stay. Other nationalities (Cameroon, Congo, Gabon, Chad…) must apply for a visa at the Ghana embassy before leaving. We can provide an admission letter to support your application.",
          "**Travel health insurance** covering your whole stay.",
          "**Copies** of every document: one on paper in your bag, one as a photo on your phone and in your email.",
        ] },
        { type: "tip", title: "Good to know", text: "See a doctor before you leave about malaria prevention. The risk exists all year round in Ghana, as in most countries in the region." },
        { type: "h2", text: "Money: cedis and Mobile Money" },
        { type: "p", text: "Ghana's currency is the **cedi (GH₵)**. CFA francs are not accepted in shops. Change a small amount on arrival for the first days (taxi, water, meals), then use licensed forex bureaus or ATMs in town." },
        { type: "p", text: "Day to day, everyone pays with **Mobile Money** (MoMo): markets, taxis, restaurants, top-ups. As soon as you have a Ghanaian SIM card, open a Mobile Money account. It is safer than carrying a lot of cash." },
        { type: "h2", text: "Your phone: a local SIM on day one" },
        { type: "p", text: "The main networks are **MTN**, **Telecel** and **AT**. You register the SIM with your passport in an official shop. Buy a data bundle: you will need it for ride apps, maps and WhatsApp." },
        { type: "h2", text: "Getting around Accra" },
        { type: "list", items: [
          "**Uber, Bolt and Yango** work well in Accra and show the price before the ride. It is the easiest option for your first weeks.",
          "The **trotro** (shared minibus) is the cheapest local transport. Ask a classmate or the TAS team to go with you the first time: it is also great English practice.",
          "Save the school's address in your phone: **Alajo Polo Junction, Kotobabi, Accra**.",
        ] },
        { type: "h2", text: "Daily life" },
        { type: "list", items: [
          "**Power sockets**: Ghana mostly uses the three rectangular pin plug (type G, as in the UK). Bring an adapter.",
          "**Weather**: hot and humid all year. The main rainy season runs roughly from April to June, with a smaller one around September-October. A light umbrella and cotton clothes are enough.",
          "**Water**: drink bottled water or sealed sachet water.",
          "**Manners**: greet people before asking anything (\"Good morning, how are you?\"), and give or receive things with your right hand.",
        ] },
        { type: "h2", text: "Your week-by-week plan" },
        { type: "table", head: ["Week", "Goal"], rows: [
          ["Week 1", "Placement test, settle into your room, SIM and Mobile Money active, learn the route between school and home."],
          ["Week 2", "A fixed routine: classes, evening review, 15 minutes of listening a day. Order food on your own, in English."],
          ["Week 3", "Join a weekend outing or activity. Make at least one friend who doesn't speak French."],
          ["Week 4", "Review progress with your teacher: what improved, and what to work on next month."],
        ] },
        { type: "tip", title: "Advice from the TAS team", text: "The golden rule for month one: **don't only spend time with French speakers**. It feels comfortable, but it is the surest way to go home at the same level. Every conversation in English counts, even a clumsy one." },
        { type: "p", text: "Preparing your arrival and have a specific question (housing, visa, start date)? Message us on WhatsApp: the team answers in French and English." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "5-habitudes-pour-progresser-en-anglais",
    image: "/images/blog/blog-5-habits-english.jpg",
    publishedAt: "2026-09-05",
    readMinutes: 6,
    fr: {
      tag: "Apprentissage",
      title: "5 habitudes pour progresser plus vite en anglais",
      excerpt: "Les cours ne suffisent pas. Ces 5 routines de 10 à 20 minutes font la différence entre ceux qui stagnent et ceux qui décollent.",
      imageAlt: "Étudiante avec des écouteurs qui écrit dans un carnet, dans une cour arborée",
      shareText: "5 habitudes simples pour progresser vite en anglais (la n°4 change tout) 👇",
      blocks: [
        { type: "p", text: "En classe, vous apprenez les règles. Mais c'est ce que vous faites **entre les cours** qui transforme ces règles en réflexes. Nos professeurs le voient chaque session : à niveau égal, les étudiants qui progressent le plus vite ne sont pas les plus « doués », ce sont ceux qui ont installé quelques habitudes quotidiennes. En voici cinq, testées et approuvées." },
        { type: "h2", text: "1. Écouter 15 minutes par jour, sans exception" },
        { type: "p", text: "Votre oreille doit s'habituer au rythme de l'anglais avant que votre bouche puisse le reproduire. Choisissez un podcast ou une chaîne adaptée à votre niveau (BBC Learning English, 6 Minute English, ou des vidéos YouTube sur un sujet qui vous passionne) et écoutez-les pendant vos trajets, en cuisinant, avant de dormir." },
        { type: "tip", text: "Astuce : écoutez **deux fois** le même extrait. La première fois pour le sens général, la deuxième en notant 3 mots ou expressions nouvelles." },
        { type: "h2", text: "2. Parler chaque jour, même mal" },
        { type: "p", text: "La peur de faire des fautes est le premier frein des francophones. Or on n'apprend à parler qu'en parlant. Fixez-vous un minimum : **une vraie conversation en anglais par jour**, avec un camarade, un vendeur, un chauffeur. À Accra, les occasions ne manquent pas : l'anglais est la langue de tous les jours." },
        { type: "p", text: "Pas d'interlocuteur ? Pratiquez le **shadowing** : lancez un audio, et répétez chaque phrase juste après le locuteur, en imitant son intonation. Cinq minutes suffisent pour sentir la différence." },
        { type: "h2", text: "3. Noter le vocabulaire en phrases, pas en listes" },
        { type: "p", text: "« Achieve = réussir » s'oublie en deux jours. « I want to **achieve** a band 6.5 in IELTS » reste. Tenez un carnet (ou une application de cartes mémoire comme Anki) où chaque nouveau mot est écrit **dans une phrase qui vous concerne**. Relisez-le 5 minutes chaque matin." },
        { type: "h2", text: "4. Passer votre téléphone en anglais" },
        { type: "p", text: "C'est l'habitude la plus simple et la plus sous-estimée. Mettez votre téléphone, vos réseaux sociaux et Netflix en anglais. Vous passez déjà plusieurs heures par jour sur ces écrans : autant qu'elles deviennent des heures d'exposition à l'anglais, sans effort supplémentaire. Suivez aussi quelques comptes anglophones sur les sujets qui vous intéressent (foot, mode, tech, business)." },
        { type: "h2", text: "5. Écrire 5 lignes chaque soir" },
        { type: "p", text: "Avant de dormir, écrivez 5 phrases en anglais sur votre journée : ce que vous avez fait, appris, ressenti. C'est court, mais cela vous oblige à chercher vos mots et à utiliser le passé. Montrez votre texte à votre professeur une fois par semaine pour corriger les erreurs qui reviennent." },
        { type: "h2", text: "Votre routine en un coup d'œil" },
        { type: "table", head: ["Moment", "Habitude", "Durée"], rows: [
          ["Matin", "Relire le carnet de vocabulaire", "5 min"],
          ["Trajet", "Écoute (podcast, vidéo)", "15 min"],
          ["Journée", "Une vraie conversation en anglais", "10 min et plus"],
          ["Toute la journée", "Téléphone et réseaux en anglais", "0 min en plus"],
          ["Soir", "Écrire 5 lignes sur sa journée", "10 min"],
        ] },
        { type: "tip", title: "À retenir", text: "Moins de **45 minutes par jour** en plus des cours. Tenues pendant 3 mois, ces 5 habitudes valent mieux qu'un week-end de révision intensive par mois. La régularité bat l'intensité." },
      ],
    },
    en: {
      tag: "Learning",
      title: "5 habits to improve your English faster",
      excerpt: "Classes aren't enough. These 5 routines of 10 to 20 minutes separate the students who stall from those who take off.",
      imageAlt: "Student with earphones writing in a notebook in a leafy courtyard",
      shareText: "5 simple habits to improve your English fast (number 4 changes everything) 👇",
      blocks: [
        { type: "p", text: "In class, you learn the rules. But what you do **between classes** turns those rules into reflexes. Our teachers see it every term: at the same level, the fastest learners aren't the most \"gifted\", they are the ones who built a few daily habits. Here are five, tried and tested." },
        { type: "h2", text: "1. Listen for 15 minutes a day, no exceptions" },
        { type: "p", text: "Your ear has to get used to the rhythm of English before your mouth can reproduce it. Pick a podcast or channel at your level (BBC Learning English, 6 Minute English, or YouTube videos on a topic you love) and listen on the bus, while cooking, before bed." },
        { type: "tip", text: "Tip: listen to the same clip **twice**. The first time for the general meaning, the second time noting 3 new words or phrases." },
        { type: "h2", text: "2. Speak every day, even badly" },
        { type: "p", text: "Fear of mistakes is the number one obstacle for French speakers. But you only learn to speak by speaking. Set a minimum: **one real conversation in English a day**, with a classmate, a shopkeeper, a driver. In Accra there are plenty of chances: English is the everyday language." },
        { type: "p", text: "Nobody to talk to? Try **shadowing**: play an audio clip and repeat each sentence right after the speaker, copying their intonation. Five minutes is enough to feel the difference." },
        { type: "h2", text: "3. Write vocabulary in sentences, not lists" },
        { type: "p", text: "\"Achieve = réussir\" is forgotten in two days. \"I want to **achieve** a band 6.5 in IELTS\" sticks. Keep a notebook (or a flashcard app like Anki) where every new word goes **into a sentence about your own life**. Read it for 5 minutes every morning." },
        { type: "h2", text: "4. Switch your phone to English" },
        { type: "p", text: "The simplest and most underrated habit. Set your phone, social media and Netflix to English. You already spend hours a day on these screens: make them hours of English exposure, with no extra effort. Follow a few English-speaking accounts on topics you care about (football, fashion, tech, business)." },
        { type: "h2", text: "5. Write 5 lines every evening" },
        { type: "p", text: "Before bed, write 5 sentences in English about your day: what you did, learned, felt. It's short, but it forces you to search for words and use the past tense. Show your text to your teacher once a week to fix the mistakes that keep coming back." },
        { type: "h2", text: "Your routine at a glance" },
        { type: "table", head: ["When", "Habit", "Time"], rows: [
          ["Morning", "Read your vocabulary notebook", "5 min"],
          ["Commute", "Listening (podcast, video)", "15 min"],
          ["Daytime", "One real conversation in English", "10 min or more"],
          ["All day", "Phone and social media in English", "0 extra min"],
          ["Evening", "Write 5 lines about your day", "10 min"],
        ] },
        { type: "tip", title: "Key takeaway", text: "Under **45 minutes a day** on top of classes. Kept up for 3 months, these 5 habits beat one intensive revision weekend a month. Consistency beats intensity." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "ielts-par-ou-commencer",
    image: "/images/blog/blog-ielts-where-to-start.jpg",
    publishedAt: "2026-09-08",
    readMinutes: 7,
    fr: {
      tag: "Examens",
      title: "IELTS : par où commencer ?",
      excerpt: "Academic ou General, les 4 épreuves, le score à viser et un plan de préparation sur 8 semaines. Le guide clair pour démarrer.",
      imageAlt: "Étudiante qui rédige un essai d'examen, avec un chronomètre et des manuels sur la table",
      shareText: "Tu dois passer l'IELTS ? Voici par où commencer, épreuve par épreuve 👇",
      blocks: [
        { type: "p", text: "L'IELTS (International English Language Testing System) est l'un des tests d'anglais les plus demandés au monde : universités britanniques, australiennes, canadiennes, programmes de bourses, immigration. Bonne nouvelle : c'est un examen très **prévisible**. Le format ne change pas, et une préparation structurée fait gagner facilement un demi-point à un point de score." },
        { type: "h2", text: "Étape 1 : choisir la bonne version" },
        { type: "list", items: [
          "**IELTS Academic** : pour les études supérieures (licence, master) et certaines inscriptions professionnelles.",
          "**IELTS General Training** : pour l'immigration (Canada, Australie, Royaume-Uni) et certains emplois.",
        ] },
        { type: "p", text: "L'écoute et l'oral sont identiques dans les deux versions ; la lecture et l'écriture diffèrent. **Vérifiez toujours auprès de l'université ou de l'organisme** quelle version et quel score sont exigés avant de vous inscrire." },
        { type: "h2", text: "Étape 2 : comprendre les 4 épreuves" },
        { type: "table", head: ["Épreuve", "Durée", "Ce qu'on vous demande"], rows: [
          ["Listening", "Environ 30 min", "4 enregistrements, 40 questions. On n'entend chaque enregistrement qu'une fois."],
          ["Reading", "60 min", "3 textes longs, 40 questions. La gestion du temps est la clé."],
          ["Writing", "60 min", "Tâche 1 : décrire un graphique (Academic) ou écrire une lettre (General). Tâche 2 : un essai argumenté d'au moins 250 mots."],
          ["Speaking", "11 à 14 min", "Un entretien en face à face avec un examinateur, en 3 parties."],
        ] },
        { type: "h2", text: "Étape 3 : connaître son score cible" },
        { type: "p", text: "L'IELTS se note en **bandes de 0 à 9**, par demi-point. La plupart des universités demandent entre **6.0 et 7.0** au total, parfois avec un minimum par épreuve (par exemple « 6.5 overall, no band below 6.0 »). Notez votre objectif exact : il guidera toute votre préparation." },
        { type: "h2", text: "Étape 4 : faire un test blanc, tout de suite" },
        { type: "p", text: "Avant de réviser quoi que ce soit, passez un test complet en conditions réelles (chronomètre, sans dictionnaire). Vous saurez précisément où vous en êtes et quelle épreuve vous coûte le plus de points. Chez les francophones, c'est souvent **le Writing** (structure de l'essai) et **le Speaking** (fluidité)." },
        { type: "h2", text: "Étape 5 : un plan sur 8 semaines" },
        { type: "table", head: ["Semaines", "Priorité"], rows: [
          ["1 et 2", "Test blanc, apprendre le format de chaque épreuve, identifier ses points faibles."],
          ["3 et 4", "Travail ciblé sur l'épreuve la plus faible. Un essai Writing corrigé par semaine au minimum."],
          ["5 et 6", "Techniques : repérage rapide en Reading, anticipation des réponses en Listening, structure en 4 paragraphes en Writing."],
          ["7", "Deux tests blancs complets en conditions réelles."],
          ["8", "Révisions légères, simulations d'oral, repos la veille de l'examen."],
        ] },
        { type: "h2", text: "Les 4 erreurs qui coûtent le plus de points" },
        { type: "list", items: [
          "En Listening, **oublier les fautes d'orthographe** : une réponse mal écrite est une réponse fausse.",
          "En Reading, **lire chaque texte en entier** avant les questions : vous manquerez de temps.",
          "En Writing, **ne pas répondre exactement à la question posée**, ou écrire moins de 250 mots dans la tâche 2.",
          "En Speaking, **réciter des réponses apprises par cœur** : les examinateurs le repèrent immédiatement.",
        ] },
        { type: "tip", title: "Se préparer avec TAS", text: `Nos classes de préparation aux examens ont lieu du lundi au vendredi, 1 h 30 par jour, pour ${formatMoney(EXAM_CLASS_CFA, "CFA")} par mois. À titre indicatif, les frais d'examen IELTS sont de ${formatMoney(exam("IELTS"), "CFA")}.` },
      ],
    },
    en: {
      tag: "Exams",
      title: "IELTS: where should you start?",
      excerpt: "Academic or General, the 4 papers, the score to aim for and an 8-week study plan. A clear guide to get started.",
      imageAlt: "Student writing an exam essay, with a stopwatch and textbooks on the desk",
      shareText: "Need to take IELTS? Here's where to start, paper by paper 👇",
      blocks: [
        { type: "p", text: "IELTS (International English Language Testing System) is one of the most requested English tests in the world: UK, Australian and Canadian universities, scholarship programmes, immigration. Good news: it is a very **predictable** exam. The format doesn't change, and structured preparation can easily add half a band to a full band to your score." },
        { type: "h2", text: "Step 1: choose the right version" },
        { type: "list", items: [
          "**IELTS Academic**: for higher education (bachelor's, master's) and some professional registrations.",
          "**IELTS General Training**: for immigration (Canada, Australia, UK) and some jobs.",
        ] },
        { type: "p", text: "Listening and Speaking are the same in both versions; Reading and Writing differ. **Always check with the university or organisation** which version and score they require before you register." },
        { type: "h2", text: "Step 2: understand the 4 papers" },
        { type: "table", head: ["Paper", "Time", "What you do"], rows: [
          ["Listening", "About 30 min", "4 recordings, 40 questions. You hear each recording only once."],
          ["Reading", "60 min", "3 long texts, 40 questions. Time management is key."],
          ["Writing", "60 min", "Task 1: describe a chart (Academic) or write a letter (General). Task 2: an argumentative essay of at least 250 words."],
          ["Speaking", "11 to 14 min", "A face-to-face interview with an examiner, in 3 parts."],
        ] },
        { type: "h2", text: "Step 3: know your target score" },
        { type: "p", text: "IELTS is scored in **bands from 0 to 9**, in half bands. Most universities ask for **6.0 to 7.0** overall, sometimes with a minimum per paper (for example \"6.5 overall, no band below 6.0\"). Write down your exact goal: it will guide your whole preparation." },
        { type: "h2", text: "Step 4: take a mock test right away" },
        { type: "p", text: "Before revising anything, take a full test under real conditions (timer, no dictionary). You will know exactly where you stand and which paper costs you the most points. For French speakers, it is often **Writing** (essay structure) and **Speaking** (fluency)." },
        { type: "h2", text: "Step 5: an 8-week plan" },
        { type: "table", head: ["Weeks", "Focus"], rows: [
          ["1 and 2", "Mock test, learn each paper's format, identify weak points."],
          ["3 and 4", "Targeted work on your weakest paper. At least one corrected Writing essay a week."],
          ["5 and 6", "Techniques: fast scanning in Reading, predicting answers in Listening, 4-paragraph structure in Writing."],
          ["7", "Two full mock tests under real conditions."],
          ["8", "Light review, speaking simulations, rest the day before the exam."],
        ] },
        { type: "h2", text: "The 4 mistakes that cost the most points" },
        { type: "list", items: [
          "In Listening, **ignoring spelling**: a misspelled answer is a wrong answer.",
          "In Reading, **reading every text in full** before the questions: you will run out of time.",
          "In Writing, **not answering the exact question**, or writing under 250 words in Task 2.",
          "In Speaking, **reciting memorised answers**: examiners spot it immediately.",
        ] },
        { type: "tip", title: "Preparing with TAS", text: `Our exam preparation classes run Monday to Friday, 1 h 30 a day, for ${formatMoney(EXAM_CLASS_CFA, "CFA")} a month. For reference, IELTS exam fees are ${formatMoney(exam("IELTS"), "CFA")}.` },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "10-erreurs-des-francophones-en-anglais",
    image: "/images/blog/blog-mistakes-french-english.jpg",
    publishedAt: "2026-09-12",
    readMinutes: 6,
    fr: {
      tag: "Apprentissage",
      title: "10 erreurs que font presque tous les francophones en anglais",
      excerpt: "« I am agree », « since 3 years », « actually »… Ces erreurs trahissent un francophone en une phrase. Voici comment les corriger pour de bon.",
      imageAlt: "Étudiants qui rient en classe devant un tableau blanc plein de corrections",
      shareText: "« I am agree » 😅 Les 10 erreurs que font presque tous les francophones en anglais. Tu en fais combien ?",
      blocks: [
        { type: "p", text: "Le français et l'anglais partagent des milliers de mots. C'est une chance… et un piège. Beaucoup d'erreurs viennent de la traduction mot à mot. Nos professeurs les entendent chaque jour en classe. Comptez combien vous en faites, puis corrigez-les une par une." },
        { type: "h2", text: "1. « I am agree »" },
        { type: "p", text: "En anglais, *agree* est un verbe, pas un adjectif. On dit **I agree** (je suis d'accord) et **I don't agree** / **I disagree**." },
        { type: "h2", text: "2. « I have 20 years »" },
        { type: "p", text: "L'âge se dit avec le verbe *to be* : **I am 20** ou **I am 20 years old**." },
        { type: "h2", text: "3. « I live here since 3 years »" },
        { type: "p", text: "Deux erreurs en une. On utilise le present perfect et *for* pour une durée : **I have lived here for 3 years**. *Since* s'utilise avec un point de départ : **since 2023**, **since January**." },
        { type: "h2", text: "4. Actually ≠ actuellement" },
        { type: "p", text: "*Actually* veut dire **en fait**. « Actuellement » se dit **currently** ou **at the moment**. Dans la même famille : *eventually* veut dire **finalement**, pas « éventuellement » (qui se dit *possibly*)." },
        { type: "h2", text: "5. « Informations », « advices », « furnitures »" },
        { type: "p", text: "Ces mots sont **indénombrables** en anglais : pas de *s*, pas de *a*. On dit **some information**, **a piece of advice**, **some furniture**. Idem pour *news*, *luggage*, *homework*." },
        { type: "h2", text: "6. Les faux amis les plus courants" },
        { type: "table", head: ["Mot anglais", "Veut dire", "Et pas"], rows: [
          ["library", "bibliothèque", "librairie (= bookshop)"],
          ["to attend", "assister à (un cours)", "attendre (= to wait)"],
          ["to assist", "aider", "assister à"],
          ["sensible", "raisonnable", "sensible (= sensitive)"],
          ["a formation", "une formation géologique ou militaire", "une formation (= training)"],
          ["to deceive", "tromper", "décevoir (= to disappoint)"],
        ] },
        { type: "h2", text: "7. « Make a photo »" },
        { type: "p", text: "En anglais, on **take** une photo : **take a photo**, **take a picture**. De même : **take a decision** ou **make a decision** (les deux se disent), mais toujours **do homework** et **make a mistake**." },
        { type: "h2", text: "8. « People is »" },
        { type: "p", text: "*People* est pluriel : **people are**, **people think**. Et *the police* aussi : **the police are coming**." },
        { type: "h2", text: "9. Oublier le « h »… ou l'ajouter partout" },
        { type: "p", text: "En français, le *h* ne se prononce pas. En anglais, si : **hungry** (affamé) et **angry** (en colère) ne sont pas le même mot ! Entraînez-vous avec « **h**appy », « **h**ouse », « **h**ello » en sentant l'air sortir de votre bouche. Et le *th* ? Placez la langue entre les dents : **think**, **three**, **the**." },
        { type: "h2", text: "10. Traduire « je suis habitué » par « I am used »" },
        { type: "p", text: "« Je suis habitué à parler anglais » se dit **I am used to speaking English** (avec *-ing*). Alors que **I used to speak** veut dire « je parlais avant » (et plus maintenant)." },
        { type: "tip", title: "Le défi", text: "Choisissez **2 erreurs** de cette liste que vous faites vraiment. Écrivez la bonne phrase sur un papier collé au miroir. Dans une semaine, prenez-en deux autres. En 5 semaines, les 10 sont réglées." },
        { type: "p", text: "Envoyez cet article à un ami francophone qui apprend l'anglais : on parie qu'il en fait au moins trois ?" },
      ],
    },
    en: {
      tag: "Learning",
      title: "10 mistakes almost every French speaker makes in English",
      excerpt: "\"I am agree\", \"since 3 years\", \"actually\"… These give away a French speaker in one sentence. Here's how to fix them for good.",
      imageAlt: "Students laughing in class in front of a whiteboard full of corrections",
      shareText: "\"I am agree\" 😅 The 10 mistakes almost every French speaker makes in English. How many do you make?",
      blocks: [
        { type: "p", text: "French and English share thousands of words. That's a gift… and a trap. Many mistakes come from word-for-word translation. Our teachers hear them in class every day. Count how many you make, then fix them one by one." },
        { type: "h2", text: "1. \"I am agree\"" },
        { type: "p", text: "In English, *agree* is a verb, not an adjective. Say **I agree** and **I don't agree** / **I disagree**." },
        { type: "h2", text: "2. \"I have 20 years\"" },
        { type: "p", text: "Age uses the verb *to be*: **I am 20** or **I am 20 years old**." },
        { type: "h2", text: "3. \"I live here since 3 years\"" },
        { type: "p", text: "Two mistakes in one. Use the present perfect and *for* with a length of time: **I have lived here for 3 years**. Use *since* with a starting point: **since 2023**, **since January**." },
        { type: "h2", text: "4. Actually ≠ actuellement" },
        { type: "p", text: "*Actually* means **in fact**. French \"actuellement\" is **currently** or **at the moment**. Same family: *eventually* means **in the end**, not \"éventuellement\" (which is *possibly*)." },
        { type: "h2", text: "5. \"Informations\", \"advices\", \"furnitures\"" },
        { type: "p", text: "These nouns are **uncountable** in English: no *s*, no *a*. Say **some information**, **a piece of advice**, **some furniture**. Same for *news*, *luggage*, *homework*." },
        { type: "h2", text: "6. The most common false friends" },
        { type: "table", head: ["English word", "Means", "Not"], rows: [
          ["library", "bibliothèque", "librairie (= bookshop)"],
          ["to attend", "assister à (a class)", "attendre (= to wait)"],
          ["to assist", "to help", "assister à"],
          ["sensible", "reasonable", "sensible (= sensitive)"],
          ["a formation", "a rock or military formation", "une formation (= training)"],
          ["to deceive", "to trick", "décevoir (= to disappoint)"],
        ] },
        { type: "h2", text: "7. \"Make a photo\"" },
        { type: "p", text: "In English you **take** a photo: **take a photo**, **take a picture**. Likewise, **make a decision** (or *take a decision*), but always **do homework** and **make a mistake**." },
        { type: "h2", text: "8. \"People is\"" },
        { type: "p", text: "*People* is plural: **people are**, **people think**. So is *the police*: **the police are coming**." },
        { type: "h2", text: "9. Dropping the \"h\"… or adding it everywhere" },
        { type: "p", text: "In French, *h* is silent. In English it isn't: **hungry** and **angry** are different words! Practise \"**h**appy\", \"**h**ouse\", \"**h**ello\", feeling the air leave your mouth. And *th*? Put your tongue between your teeth: **think**, **three**, **the**." },
        { type: "h2", text: "10. Translating \"je suis habitué\" as \"I am used\"" },
        { type: "p", text: "\"I'm used to it\" is **I am used to speaking English** (with *-ing*). But **I used to speak** means \"I spoke in the past\" (and no longer do)." },
        { type: "tip", title: "The challenge", text: "Pick **2 mistakes** from this list that you really make. Write the correct sentence on a note stuck to your mirror. Next week, pick two more. In 5 weeks, all 10 are fixed." },
        { type: "p", text: "Send this article to a French-speaking friend learning English: bet they make at least three?" },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "toefl-ielts-ou-toeic",
    image: "/images/blog/blog-toefl-ielts-toeic.jpg",
    publishedAt: "2026-09-15",
    readMinutes: 6,
    fr: {
      tag: "Examens",
      title: "TOEFL, IELTS ou TOEIC : lequel choisir ?",
      excerpt: "Trois tests, trois usages. Études à l'étranger, immigration ou carrière : le bon choix dépend de votre projet. Comparatif simple.",
      imageAlt: "Étudiante qui compare trois livres à la bibliothèque, ordinateur ouvert",
      shareText: "TOEFL, IELTS ou TOEIC ? Avant de payer un examen, lis ce comparatif 👇",
      blocks: [
        { type: "p", text: "C'est une des questions qu'on nous pose le plus. Et la mauvaise réponse coûte cher : passer le mauvais test, c'est payer les frais d'inscription pour un certificat que votre université ou votre employeur n'accepte pas. La règle est simple : **c'est votre projet qui choisit le test, pas l'inverse.**" },
        { type: "h2", text: "Le comparatif en un tableau" },
        { type: "table", head: ["", "IELTS", "TOEFL iBT", "TOEIC"], rows: [
          ["Usage principal", "Études, immigration (Royaume-Uni, Canada, Australie)", "Études, surtout aux États-Unis", "Monde professionnel, entreprises, écoles de commerce et d'ingénieurs"],
          ["Compétences", "Écoute, lecture, écriture, oral", "Écoute, lecture, écriture, oral", "Écoute et lecture (l'oral et l'écrit se passent à part)"],
          ["Notation", "Bandes de 0 à 9", "Échelle de 1 à 6 (l'ancien score sur 120 reste affiché pendant la transition)", "10 à 990 points"],
          ["Oral", "Face à face avec un examinateur", "Sur ordinateur, enregistré", "Épreuve séparée (Speaking & Writing)"],
          [`Frais d'examen via TAS`, formatMoney(exam("IELTS"), "CFA"), formatMoney(exam("TOEFL"), "CFA"), formatMoney(exam("TOEIC"), "CFA")],
        ] },
        { type: "h2", text: "Choisissez l'IELTS si…" },
        { type: "list", items: [
          "Vous visez une université au **Royaume-Uni**, en **Australie** ou au **Canada**.",
          "Vous préparez une **demande d'immigration** (dans ce cas, souvent la version General Training).",
          "Vous êtes plus à l'aise à l'oral **face à une personne** que devant un micro.",
        ] },
        { type: "h2", text: "Choisissez le TOEFL si…" },
        { type: "list", items: [
          "Vous visez une université **américaine** (même si beaucoup acceptent aussi l'IELTS).",
          "Vous êtes à l'aise avec **l'ordinateur** et le clavier : tout se passe sur écran.",
          "Vous préférez les accents **nord-américains**.",
        ] },
        { type: "h2", text: "Choisissez le TOEIC si…" },
        { type: "list", items: [
          "Votre objectif est **professionnel** : recrutement, promotion, dossier d'entreprise.",
          "Votre école (commerce, ingénieurs) exige un score minimum pour valider le diplôme. En France, de nombreuses écoles d'ingénieurs demandent l'équivalent du niveau **B2**, souvent attesté par un TOEIC autour de 785.",
          "Vous voulez un test plus **court et centré sur l'anglais du travail** : réunions, e-mails, téléphone.",
        ] },
        { type: "tip", title: "La vérification qui évite les mauvaises surprises", text: "Avant de vous inscrire, écrivez à l'université ou à l'employeur et demandez **par écrit** : quel test, quelle version, quel score minimum, et depuis combien de temps le résultat doit dater. La plupart des résultats sont considérés valables **2 ans**." },
        { type: "h2", text: "Et si je ne sais pas encore ?" },
        { type: "p", text: "Si votre projet n'est pas encore fixé, l'**IELTS Academic** est le choix le plus polyvalent : il est accepté par un très grand nombre d'universités dans le monde, y compris aux États-Unis. Mais commencez surtout par améliorer votre anglais général : les trois tests récompensent le même socle de compétences." },
        { type: "p", text: `Chez TAS, la classe de préparation aux examens coûte ${formatMoney(EXAM_CLASS_CFA, "CFA")} par mois (du lundi au vendredi, 1 h 30 par jour). Un test de niveau à l'arrivée vous dit si vous êtes prêt à passer directement à la préparation ou s'il vaut mieux consolider d'abord votre anglais.` },
      ],
    },
    en: {
      tag: "Exams",
      title: "TOEFL, IELTS or TOEIC: which one should you take?",
      excerpt: "Three tests, three purposes. Study abroad, immigration or career: the right choice depends on your plan. A simple comparison.",
      imageAlt: "Student comparing three books in a library, laptop open",
      shareText: "TOEFL, IELTS or TOEIC? Read this comparison before you pay for an exam 👇",
      blocks: [
        { type: "p", text: "It's one of the questions we hear most. And the wrong answer is expensive: taking the wrong test means paying fees for a certificate your university or employer doesn't accept. The rule is simple: **your plan chooses the test, not the other way round.**" },
        { type: "h2", text: "The comparison in one table" },
        { type: "table", head: ["", "IELTS", "TOEFL iBT", "TOEIC"], rows: [
          ["Main use", "Study, immigration (UK, Canada, Australia)", "Study, especially in the USA", "Work, companies, business and engineering schools"],
          ["Skills", "Listening, reading, writing, speaking", "Listening, reading, writing, speaking", "Listening and reading (speaking and writing are a separate test)"],
          ["Scoring", "Bands from 0 to 9", "1 to 6 scale (the old score out of 120 is still shown during the transition)", "10 to 990 points"],
          ["Speaking", "Face to face with an examiner", "On computer, recorded", "Separate test (Speaking & Writing)"],
          ["Exam fees via TAS", formatMoney(exam("IELTS"), "CFA"), formatMoney(exam("TOEFL"), "CFA"), formatMoney(exam("TOEIC"), "CFA")],
        ] },
        { type: "h2", text: "Choose IELTS if…" },
        { type: "list", items: [
          "You are aiming for a university in the **UK**, **Australia** or **Canada**.",
          "You are preparing an **immigration application** (often the General Training version).",
          "You feel more comfortable speaking **to a person** than into a microphone.",
        ] },
        { type: "h2", text: "Choose TOEFL if…" },
        { type: "list", items: [
          "You are aiming for a **US** university (though many accept IELTS too).",
          "You are comfortable with a **computer** and keyboard: everything happens on screen.",
          "You prefer **North American** accents.",
        ] },
        { type: "h2", text: "Choose TOEIC if…" },
        { type: "list", items: [
          "Your goal is **professional**: hiring, promotion, company records.",
          "Your school (business, engineering) requires a minimum score to graduate. In France, many engineering schools require a **B2** level, often shown with a TOEIC score around 785.",
          "You want a **shorter test focused on workplace English**: meetings, emails, phone calls.",
        ] },
        { type: "tip", title: "The check that avoids bad surprises", text: "Before registering, email the university or employer and ask **in writing**: which test, which version, what minimum score, and how recent the result must be. Most results are treated as valid for **2 years**." },
        { type: "h2", text: "What if I'm not sure yet?" },
        { type: "p", text: "If your plan isn't fixed yet, **IELTS Academic** is the most versatile choice: a very large number of universities worldwide accept it, including in the USA. But start by improving your general English: all three tests reward the same core skills." },
        { type: "p", text: `At TAS, the exam preparation class costs ${formatMoney(EXAM_CLASS_CFA, "CFA")} a month (Monday to Friday, 1 h 30 a day). A placement test on arrival tells you whether you're ready to go straight into exam prep or should strengthen your English first.` },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "apprendre-anglais-au-ghana",
    image: "/images/blog/blog-english-ghana.jpg",
    publishedAt: "2026-09-18",
    readMinutes: 6,
    fr: {
      tag: "Étudier au Ghana",
      title: "Apprendre l'anglais au Ghana plutôt qu'à Londres ou au Canada : le vrai calcul",
      excerpt: "Pas de visa pour la CEDEAO, quelques heures de route, un budget maîtrisé et une immersion totale. Pourquoi de plus en plus de francophones choisissent Accra.",
      imageAlt: "Trois étudiants qui se promènent devant le château de Cape Coast, au Ghana",
      shareText: "Pourquoi aller jusqu'à Londres pour apprendre l'anglais quand le Ghana est à côté ? 🇬🇭 Le vrai calcul 👇",
      blocks: [
        { type: "p", text: "Quand on pense « apprendre l'anglais à l'étranger », on pense d'abord à Londres, Toronto ou New York. Pour un étudiant d'Afrique francophone, pourtant, le pays anglophone le plus accessible est souvent **juste à côté**. Le Ghana partage ses frontières avec la Côte d'Ivoire, le Burkina Faso et le Togo. Voici pourquoi le calcul mérite d'être fait." },
        { type: "h2", text: "1. L'anglais est la langue officielle, partout" },
        { type: "p", text: "Au Ghana, l'anglais est la langue de l'école, de l'administration, des médias, du commerce. Au marché, dans le trotro, à la banque : vous pratiquez **du matin au soir**, sans chercher les occasions. C'est la définition même de l'immersion." },
        { type: "h2", text: "2. Pas de visa pour les pays de la CEDEAO" },
        { type: "p", text: "Les citoyens des pays de la CEDEAO entrent au Ghana **sans visa** pour un court séjour. Pas de dossier de plusieurs semaines, pas de justificatifs bancaires, pas de refus à la dernière minute. Comparez avec un visa étudiant pour le Royaume-Uni ou le Canada : frais, délais et incertitude." },
        { type: "h2", text: "3. Proche de chez vous" },
        { type: "p", text: "Depuis Abidjan, Lomé ou Cotonou, Accra est accessible **par la route**. Depuis Ouagadougou, Dakar ou Douala, les vols sont courts. Le Ghana vit à l'heure GMT : le même fuseau horaire qu'Abidjan, Dakar ou Lomé. Appeler la famille ne demande aucun calcul." },
        { type: "h2", text: "4. Un budget maîtrisé" },
        { type: "p", text: `Les frais de scolarité et de vie à Accra n'ont rien à voir avec ceux d'une grande capitale européenne ou nord-américaine. À titre d'exemple, un mois de cours intensif chez TAS (${INTENSIVE_HOURS} h par jour) coûte ${formatMoney(intensive1Month, "CFA")}, et 3 mois de cours réguliers ${formatMoney(regular3Months, "CFA")}. Avec le même budget, on étudie plus longtemps, et c'est la durée qui fait progresser.` },
        { type: "h2", text: "5. Une culture proche… et une vraie découverte" },
        { type: "p", text: "La cuisine, la musique, la chaleur humaine : vous ne serez pas perdu. Mais le Ghana a aussi son histoire, ses langues (le twi, le ga, l'ewe…) et ses lieux uniques, comme le château de Cape Coast ou la canopée de Kakum, que nos étudiants visitent pendant les sorties." },
        { type: "h2", text: "Ce que Londres ou Toronto offrent en plus (soyons honnêtes)" },
        { type: "list", items: [
          "Un **accent britannique ou nord-américain** au quotidien. L'anglais ghanéen a son propre accent, parfaitement compris partout, et nos cours travaillent aussi l'écoute des accents internationaux.",
          "La possibilité de **rester travailler** sur place après les études, selon les règles du pays.",
          "Un réseau dans ce pays précis, utile si votre carrière s'y trouve.",
        ] },
        { type: "tip", title: "La stratégie gagnante", text: "Beaucoup de nos étudiants font les deux : ils **atteignent un bon niveau et obtiennent leur IELTS ou TOEFL au Ghana**, à coût maîtrisé, puis partent en master à l'étranger avec un dossier solide. L'anglais appris à Accra est le même qui ouvre les portes de Londres." },
        { type: "p", text: "Vous voulez faire le calcul pour votre propre projet ? Envoyez-nous votre pays, votre niveau estimé et votre objectif sur WhatsApp : nous vous proposons une durée et un budget réalistes." },
      ],
    },
    en: {
      tag: "Study in Ghana",
      title: "Learning English in Ghana instead of London or Canada: the real maths",
      excerpt: "No visa for ECOWAS citizens, a few hours by road, a controlled budget and full immersion. Why more and more French speakers choose Accra.",
      imageAlt: "Three students walking in front of Cape Coast Castle, Ghana",
      shareText: "Why go all the way to London to learn English when Ghana is next door? 🇬🇭 The real maths 👇",
      blocks: [
        { type: "p", text: "When people think \"learning English abroad\", they think London, Toronto or New York. Yet for a student from French-speaking Africa, the most accessible English-speaking country is often **right next door**. Ghana borders Côte d'Ivoire, Burkina Faso and Togo. Here's why the maths is worth doing." },
        { type: "h2", text: "1. English is the official language, everywhere" },
        { type: "p", text: "In Ghana, English is the language of school, government, media and business. At the market, in the trotro, at the bank: you practise **from morning to night**, without looking for chances. That is what immersion means." },
        { type: "h2", text: "2. No visa for ECOWAS countries" },
        { type: "p", text: "ECOWAS citizens enter Ghana **without a visa** for a short stay. No weeks-long application, no bank statements, no last-minute refusal. Compare that with a student visa for the UK or Canada: fees, delays and uncertainty." },
        { type: "h2", text: "3. Close to home" },
        { type: "p", text: "From Abidjan, Lomé or Cotonou, Accra is reachable **by road**. From Ouagadougou, Dakar or Douala, flights are short. Ghana runs on GMT: the same time zone as Abidjan, Dakar and Lomé. Calling family takes no maths at all." },
        { type: "h2", text: "4. A controlled budget" },
        { type: "p", text: `Tuition and living costs in Accra are nothing like those of a major European or North American capital. For example, one month of intensive classes at TAS (${INTENSIVE_HOURS} hours a day) costs ${formatMoney(intensive1Month, "CFA")}, and 3 months of regular classes ${formatMoney(regular3Months, "CFA")}. With the same budget you study longer, and time is what makes you progress.` },
        { type: "h2", text: "5. A familiar culture… and a real discovery" },
        { type: "p", text: "The food, the music, the warmth: you won't feel lost. But Ghana also has its own history, languages (Twi, Ga, Ewe…) and unique places, like Cape Coast Castle or the Kakum canopy walk, which our students visit on outings." },
        { type: "h2", text: "What London or Toronto offer on top (let's be honest)" },
        { type: "list", items: [
          "A **British or North American accent** every day. Ghanaian English has its own accent, understood everywhere, and our classes also train you to understand international accents.",
          "The chance to **stay and work** after your studies, depending on that country's rules.",
          "A network in that specific country, useful if your career is there.",
        ] },
        { type: "tip", title: "The winning strategy", text: "Many of our students do both: they **reach a strong level and get their IELTS or TOEFL in Ghana** on a controlled budget, then go abroad for a master's with a solid application. The English you learn in Accra is the same English that opens doors in London." },
        { type: "p", text: "Want to run the numbers for your own plan? Send us your country, your estimated level and your goal on WhatsApp: we'll suggest a realistic length of stay and budget." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "anglais-et-carriere-en-afrique",
    image: "/images/tas/advising-office.jpg",
    publishedAt: "2026-09-20",
    readMinutes: 6,
    fr: {
      tag: "Carrière",
      title: "Parler anglais en Afrique francophone : les portes que ça ouvre vraiment",
      excerpt: "Commerce régional, organisations internationales, tech, tourisme : pourquoi un francophone bilingue a une longueur d'avance, et comment le montrer sur son CV.",
      imageAlt: "Un conseiller accompagne une étudiante devant un ordinateur",
      shareText: "Francophone + anglais = ? 💼 Les métiers et opportunités qui s'ouvrent vraiment quand tu es bilingue 👇",
      blocks: [
        { type: "p", text: "En Afrique de l'Ouest et du Centre, la plupart des jeunes diplômés parlent français. Parmi eux, ceux qui parlent **aussi** un bon anglais restent minoritaires. Sur un marché du travail compétitif, c'est exactement ce genre de différence qui fait sortir un CV de la pile." },
        { type: "h2", text: "Pourquoi l'anglais compte autant dans la région" },
        { type: "list", items: [
          "**Le commerce régional** : le Nigeria et le Ghana, deux des plus grandes économies d'Afrique de l'Ouest, sont anglophones. Importer, exporter, négocier avec eux se fait en anglais.",
          "**La ZLECAf** (Zone de libre-échange continentale africaine) a son secrétariat à **Accra**. L'intégration du commerce africain crée des besoins en profils capables de travailler dans les deux langues.",
          "**Les organisations internationales** : la CEDEAO travaille en anglais, en français et en portugais. L'Union africaine, les agences des Nations unies et les grandes ONG recrutent en priorité des profils bilingues.",
          "**Le numérique** : la documentation technique, les formations en ligne et la majorité des outils sont d'abord en anglais.",
        ] },
        { type: "h2", text: "Les métiers où le bilinguisme fait la différence" },
        { type: "table", head: ["Secteur", "Exemples de postes"], rows: [
          ["Commerce et logistique", "Import-export, achats, transit, commercial régional"],
          ["Organisations et ONG", "Chargé de projet, assistant administratif, suivi-évaluation"],
          ["Tourisme et hôtellerie", "Réception, guide, agence de voyage, événementiel"],
          ["Tech et digital", "Développement web, support client, community management, graphisme"],
          ["Langues", "Traduction, interprétariat, enseignement de l'anglais ou du français"],
          ["Banque et finance", "Relation clientèle internationale, conformité, analyse"],
        ] },
        { type: "h2", text: "Anglais + compétence technique : le combo gagnant" },
        { type: "p", text: "L'anglais seul est un atout. L'anglais **associé à une compétence concrète** est un métier. Un comptable qui maîtrise Excel et l'anglais, un graphiste capable de travailler pour des clients anglophones, un technicien réseau qui lit la documentation Cisco sans traduire : ces profils sont recherchés. C'est pour cela que TAS propose aussi des formations en informatique (bureautique, Excel financier, création de sites web, réseaux), qu'on peut suivre en même temps que les cours d'anglais." },
        { type: "h2", text: "Comment prouver votre niveau aux recruteurs" },
        { type: "list", items: [
          "**Indiquez un niveau précis** sur votre CV (par exemple B2, C1 selon le Cadre européen), jamais seulement « anglais : bon ».",
          "**Ajoutez un certificat reconnu** : TOEIC pour le monde de l'entreprise, IELTS ou TOEFL pour les études et les organisations internationales.",
          "**Préparez une version anglaise de votre CV** et de votre profil LinkedIn.",
          "**Entraînez-vous à l'entretien en anglais** : se présenter en 2 minutes, parler de ses expériences, poser des questions.",
        ] },
        { type: "tip", title: "Exercice pour aujourd'hui", text: "Rédigez en anglais votre présentation en 5 phrases : qui vous êtes, ce que vous savez faire, ce que vous cherchez. Lisez-la à voix haute trois fois. Vous venez de préparer la première question de tout entretien : **« Tell me about yourself. »**" },
      ],
    },
    en: {
      tag: "Career",
      title: "Speaking English in French-speaking Africa: the doors it really opens",
      excerpt: "Regional trade, international organisations, tech, tourism: why a bilingual French speaker has an edge, and how to show it on your CV.",
      imageAlt: "An adviser helping a student at a computer",
      shareText: "French + English = ? 💼 The jobs and opportunities that really open up when you're bilingual 👇",
      blocks: [
        { type: "p", text: "In West and Central Africa, most young graduates speak French. Among them, those who **also** speak good English are still a minority. In a competitive job market, that is exactly the kind of difference that pulls a CV out of the pile." },
        { type: "h2", text: "Why English matters so much in the region" },
        { type: "list", items: [
          "**Regional trade**: Nigeria and Ghana, two of the largest economies in West Africa, are English-speaking. Importing, exporting and negotiating with them happens in English.",
          "**AfCFTA** (the African Continental Free Trade Area) has its secretariat in **Accra**. African trade integration creates demand for people who can work in both languages.",
          "**International organisations**: ECOWAS works in English, French and Portuguese. The African Union, UN agencies and major NGOs favour bilingual candidates.",
          "**Digital**: technical documentation, online courses and most tools come in English first.",
        ] },
        { type: "h2", text: "Jobs where being bilingual makes the difference" },
        { type: "table", head: ["Sector", "Example roles"], rows: [
          ["Trade and logistics", "Import-export, purchasing, freight forwarding, regional sales"],
          ["Organisations and NGOs", "Project officer, administrative assistant, monitoring and evaluation"],
          ["Tourism and hospitality", "Front desk, guide, travel agency, events"],
          ["Tech and digital", "Web development, customer support, community management, graphic design"],
          ["Languages", "Translation, interpreting, teaching English or French"],
          ["Banking and finance", "International client relations, compliance, analysis"],
        ] },
        { type: "h2", text: "English + a technical skill: the winning combo" },
        { type: "p", text: "English alone is an asset. English **combined with a concrete skill** is a career. An accountant who masters Excel and English, a designer who can work for English-speaking clients, a network technician who reads Cisco documentation without translating: these profiles are in demand. That's why TAS also offers computer courses (office tools, financial Excel, website design, networking) that you can take alongside your English classes." },
        { type: "h2", text: "How to prove your level to recruiters" },
        { type: "list", items: [
          "**State a precise level** on your CV (for example B2 or C1 on the European framework), never just \"English: good\".",
          "**Add a recognised certificate**: TOEIC for business, IELTS or TOEFL for study and international organisations.",
          "**Prepare an English version of your CV** and LinkedIn profile.",
          "**Practise interviews in English**: introduce yourself in 2 minutes, talk about your experience, ask questions.",
        ] },
        { type: "tip", title: "Exercise for today", text: "Write a 5-sentence introduction in English: who you are, what you can do, what you're looking for. Read it aloud three times. You've just prepared the first question of every interview: **\"Tell me about yourself.\"**" },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "expressions-anglaises-accra",
    image: "/images/outings/kakum-selfie.jpg",
    publishedAt: "2026-09-23",
    readMinutes: 5,
    fr: {
      tag: "Vie étudiante",
      title: "« Chale », « Akwaaba », « I'm coming » : le petit lexique pour survivre à Accra",
      excerpt: "L'anglais du Ghana a ses expressions. Les connaître avant d'arriver, c'est se faire des amis dès le premier jour (et éviter quelques malentendus).",
      imageAlt: "Étudiants de TAS qui prennent un selfie à Kakum",
      shareText: "« I'm coming » au Ghana ne veut PAS dire « j'arrive » 😂 Le lexique à connaître avant d'aller à Accra 👇",
      blocks: [
        { type: "p", text: "Vous avez appris l'anglais des manuels. Puis vous arrivez à Accra, et quelqu'un vous lance « **Chale, how far?** ». Pas de panique. L'anglais ghanéen est le même anglais, avec quelques expressions locales et des mots empruntés au twi, la langue la plus parlée du pays. Les connaître, c'est montrer du respect… et faire sourire tout le monde." },
        { type: "h2", text: "Les salutations" },
        { type: "table", head: ["Expression", "Sens", "Quand l'utiliser"], rows: [
          ["Akwaaba", "Bienvenue (twi)", "Vous l'entendrez dès l'aéroport."],
          ["Ɛte sɛn? (« eh-tee-sen »)", "Comment ça va ? (twi)", "Pour saluer. Réponse : « Ɛyɛ » (ça va)."],
          ["Medaase", "Merci (twi)", "Toujours apprécié, au marché comme au restaurant."],
          ["Chale", "Mon ami, mon pote", "Entre amis : « Chale, let's go! »"],
          ["How far?", "Quoi de neuf ? Ça va ?", "Salutation décontractée entre jeunes."],
        ] },
        { type: "h2", text: "Les « faux amis » de l'anglais ghanéen" },
        { type: "list", items: [
          "**« I'm coming »** : au Ghana, cela veut souvent dire « **je reviens tout de suite** », pas « j'arrive ». Si quelqu'un vous le dit en partant, attendez-le !",
          "**« Please »** en début de phrase : « Please, where is the bus station? » C'est simplement poli, comme « s'il vous plaît, excusez-moi ».",
          "**« Small small »** : petit à petit. « I'm learning English small small. »",
          "**« Light off »** : coupure de courant. On entend aussi le mot twi **dumsor**.",
          "**« Chop »** : manger. Un **chop bar** est un restaurant local où l'on mange bien et pas cher.",
        ] },
        { type: "h2", text: "Pour se déplacer et faire ses courses" },
        { type: "list", items: [
          "**Trotro** : le minibus collectif. Le **mate** est l'assistant qui annonce la destination et encaisse.",
          "**Drop** : un taxi pour vous seul (par opposition au taxi partagé).",
          "**« Where are you going? »** / **« I'm dropping at… »** : où descendez-vous / je descends à…",
          "**« How much? »** puis **« Reduce it small »** : combien ? Faites-moi un petit prix. Au marché, négocier avec le sourire fait partie du jeu.",
          "**Obroni** : étranger (surtout pour une personne à la peau claire). Ce n'est pas une insulte, souvent juste une façon de vous interpeller.",
        ] },
        { type: "h2", text: "Pourquoi c'est utile pour votre anglais" },
        { type: "p", text: "Ces expressions ne remplacent pas l'anglais standard que vous apprenez en classe. Mais elles vous ouvrent les conversations. Et **chaque conversation est un cours gratuit** : plus vous échangez avec les Ghanéens, plus votre écoute et votre aisance progressent." },
        { type: "tip", title: "Mini-défi", text: "Votre premier jour à Accra, utilisez « **Akwaaba** », « **Medaase** » et « **Chale** » au moins une fois chacun. Racontez-nous la réaction des gens !" },
        { type: "p", text: "Partagez ce lexique avec celui ou celle qui part avec vous : vous serez deux à comprendre les blagues." },
      ],
    },
    en: {
      tag: "Student life",
      title: "\"Chale\", \"Akwaaba\", \"I'm coming\": the little survival glossary for Accra",
      excerpt: "Ghanaian English has its own expressions. Learn them before you arrive to make friends from day one (and avoid a few misunderstandings).",
      imageAlt: "TAS students taking a selfie at Kakum",
      shareText: "\"I'm coming\" in Ghana does NOT mean what you think 😂 The glossary to know before going to Accra 👇",
      blocks: [
        { type: "p", text: "You learned textbook English. Then you land in Accra and someone says \"**Chale, how far?**\". Don't panic. Ghanaian English is the same English, with a few local expressions and words borrowed from Twi, the most widely spoken language in the country. Knowing them shows respect… and makes everyone smile." },
        { type: "h2", text: "Greetings" },
        { type: "table", head: ["Expression", "Meaning", "When to use it"], rows: [
          ["Akwaaba", "Welcome (Twi)", "You'll hear it from the airport on."],
          ["Ɛte sɛn? (\"eh-tee-sen\")", "How are you? (Twi)", "To greet someone. Answer: \"Ɛyɛ\" (I'm fine)."],
          ["Medaase", "Thank you (Twi)", "Always appreciated, at the market or in a restaurant."],
          ["Chale", "My friend, mate", "Among friends: \"Chale, let's go!\""],
          ["How far?", "What's up? How are you?", "Casual greeting among young people."],
        ] },
        { type: "h2", text: "Ghanaian English \"false friends\"" },
        { type: "list", items: [
          "**\"I'm coming\"**: in Ghana it often means \"**I'll be right back**\", not \"I'm on my way\". If someone says it while leaving, wait for them!",
          "**\"Please\"** at the start of a sentence: \"Please, where is the bus station?\" It's simply polite, like \"excuse me\".",
          "**\"Small small\"**: little by little. \"I'm learning English small small.\"",
          "**\"Light off\"**: power cut. You'll also hear the Twi word **dumsor**.",
          "**\"Chop\"**: to eat. A **chop bar** is a local restaurant where you eat well and cheaply.",
        ] },
        { type: "h2", text: "Getting around and shopping" },
        { type: "list", items: [
          "**Trotro**: the shared minibus. The **mate** is the assistant who calls the destination and collects fares.",
          "**Drop**: a taxi just for you (as opposed to a shared taxi).",
          "**\"Where are you going?\"** / **\"I'm dropping at…\"**: where are you getting off / I'm getting off at…",
          "**\"How much?\"** then **\"Reduce it small\"**: how much? Give me a better price. At the market, bargaining with a smile is part of the game.",
          "**Obroni**: foreigner (especially a light-skinned person). It isn't an insult, often just a way to call out to you.",
        ] },
        { type: "h2", text: "Why this helps your English" },
        { type: "p", text: "These expressions don't replace the standard English you learn in class. But they open conversations. And **every conversation is a free lesson**: the more you talk with Ghanaians, the faster your listening and fluency improve." },
        { type: "tip", title: "Mini challenge", text: "On your first day in Accra, use \"**Akwaaba**\", \"**Medaase**\" and \"**Chale**\" at least once each. Tell us how people react!" },
        { type: "p", text: "Share this glossary with whoever is travelling with you: that way you'll both get the jokes." },
      ],
    },
  },
];

/** Plus récent en premier. */
export const ARTICLES_BY_DATE = [...ARTICLES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}

export function relatedArticles(slug: string, count = 3) {
  const current = getArticle(slug);
  const others = ARTICLES_BY_DATE.filter((a) => a.slug !== slug);
  if (!current) return others.slice(0, count);
  const sameTag = others.filter((a) => a.fr.tag === current.fr.tag);
  const rest = others.filter((a) => a.fr.tag !== current.fr.tag);
  return [...sameTag, ...rest].slice(0, count);
}

/** Texte brut d'un bloc, pour les descriptions et le JSON-LD. */
export function plainText(text: string) {
  return text.replace(/\*\*/g, "").replace(/\*/g, "");
}

export function formatArticleDate(iso: string, lang: "fr" | "en") {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Aperçu de partage 1200 x 630, généré par scripts/og-images.ps1. */
export function ogImagePath(slug: string) {
  return `/images/og/article-${slug}.jpg`;
}

/** Texte complet d'un article en Markdown simple, pour le flux RSS et llms-full.txt. */
export function articleToMarkdown(copy: ArticleCopy) {
  return copy.blocks
    .map((b) => {
      switch (b.type) {
        case "h2":
          return `## ${b.text}`;
        case "p":
          return b.text;
        case "list":
          return b.items.map((item, i) => (b.ordered ? `${i + 1}. ${item}` : `- ${item}`)).join("\n");
        case "tip":
          return `> ${b.title ? `**${b.title}** : ` : ""}${b.text}`;
        case "table":
          return [
            `| ${b.head.join(" | ")} |`,
            `| ${b.head.map(() => "---").join(" | ")} |`,
            ...b.rows.map((r) => `| ${r.join(" | ")} |`),
          ].join("\n");
      }
    })
    .join("\n\n");
}

/** Texte complet d'un article en HTML simple, pour le flux RSS. */
export function articleToHtml(copy: ArticleCopy) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) =>
    esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return copy.blocks
    .map((b) => {
      switch (b.type) {
        case "h2":
          return `<h2>${esc(b.text)}</h2>`;
        case "p":
          return `<p>${inline(b.text)}</p>`;
        case "list": {
          const tag = b.ordered ? "ol" : "ul";
          return `<${tag}>${b.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${tag}>`;
        }
        case "tip":
          return `<blockquote>${b.title ? `<strong>${esc(b.title)}</strong> : ` : ""}${inline(b.text)}</blockquote>`;
        case "table":
          return `<table><thead><tr>${b.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${b.rows
            .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
            .join("")}</tbody></table>`;
      }
    })
    .join("\n");
}
