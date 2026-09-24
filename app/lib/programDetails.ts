/**
 * Pages détaillées des programmes (/programs/[slug]).
 * Texte court et concret, pour l'étudiant et ses parents. Les tarifs et les horaires
 * viennent de fees.ts, jamais recopiés ici.
 */

export type ProgramSlug = "intensive-english" | "long-english" | "computer-course";

interface Copy {
  title: string;
  tagline: string;
  intro: string;
  forWhom: string[];
  learn: { title: string; text: string }[];
  day: { title: string; text: string }[];
  progress: { title: string; text: string }[];
  faq: { q: string; a: string }[];
  metaDescription: string;
}

export interface ProgramDetail {
  slug: ProgramSlug;
  image: string;
  /** Photos réelles montrées sur la page, avec leur taille d'origine (affichées sans recadrage). */
  photos: { src: string; width: number; height: number }[];
  fr: Copy;
  en: Copy;
}

const ENGLISH_LEARN_FR = [
  { title: "Grammaire et vocabulaire", text: "Les bases solides de la langue, expliquées simplement puis utilisées tout de suite en situation." },
  { title: "Lecture et écriture", text: "Comprendre un texte, rédiger un e-mail, un paragraphe, puis un texte structuré." },
  { title: "Écoute", text: "Comprendre l'anglais parlé à vitesse normale, avec différents accents." },
  { title: "Oral et débat", text: "Prendre la parole chaque jour, défendre une idée, tenir une vraie conversation." },
];

const ENGLISH_LEARN_EN = [
  { title: "Grammar and vocabulary", text: "Solid language foundations, explained simply and used straight away in real situations." },
  { title: "Reading and writing", text: "Understand a text, write an email, a paragraph, then a structured piece." },
  { title: "Listening", text: "Understand spoken English at normal speed, with different accents." },
  { title: "Speaking and debate", text: "Speak every day, defend an idea, hold a real conversation." },
];

const ENGLISH_PROGRESS_FR = [
  { title: "Votre niveau de départ", text: "À l'arrivée, l'équipe pédagogique fait le point avec vous et vous place dans le groupe qui vous correspond." },
  { title: "Un groupe à votre niveau", text: "Vous avancez avec des étudiants du même niveau, de débutant à avancé." },
  { title: "Un suivi régulier", text: "Vos professeurs suivent vos progrès et vous indiquent ce qu'il reste à travailler." },
  { title: "Un certificat en fin de formation", text: "Votre parcours est validé par un certificat ou un diplôme TAS English Institute." },
];

const ENGLISH_PROGRESS_EN = [
  { title: "Your starting level", text: "On arrival, the teaching team assesses your level with you and places you in the right group." },
  { title: "A group at your level", text: "You progress with students at the same level, from beginner to advanced." },
  { title: "Regular follow-up", text: "Your teachers track your progress and tell you what still needs work." },
  { title: "A certificate at the end", text: "Your course is validated with a TAS English Institute certificate or diploma." },
];

export const PROGRAM_DETAILS: ProgramDetail[] = [
  {
    slug: "intensive-english",
    image: "/images/programs/english-intensive.jpg",
    photos: [{ src: "/images/tas/class-red.jpg", width: 1536, height: 1024 }, { src: "/images/tas/class-poster.jpg", width: 1448, height: 1086 }, { src: "/images/tas/graduation-diploma-1.jpg", width: 1331, height: 1182 }],
    fr: {
      title: "Anglais intensif",
      tagline: "Toute la journée en anglais, pour progresser vite.",
      intro:
        "Le programme le plus complet de TAS : 8 heures d'anglais par jour, de 2 semaines à 6 mois. En quelques semaines, l'anglais devient une langue que vous utilisez, pas seulement une matière que vous étudiez.",
      forWhom: [
        "Vous devez parler anglais rapidement : études, travail, voyage ou examen.",
        "Vous pouvez vous consacrer à plein temps à votre formation.",
        "Vous partez de zéro ou vous voulez passer au niveau supérieur.",
        "Vous préparez des études dans un pays anglophone.",
      ],
      learn: ENGLISH_LEARN_FR,
      day: [
        { title: "Le matin : les bases", text: "Grammaire, vocabulaire et lecture, avec des exercices pour fixer ce que vous apprenez." },
        { title: "Le midi : pause", text: "Un moment pour souffler… et parler anglais avec les autres étudiants." },
        { title: "L'après-midi : la pratique", text: "Écoute, écriture, oral et débats. Vous utilisez ce que vous avez appris le matin." },
        { title: "Le soir : l'immersion", text: "À Accra, l'anglais est partout : au marché, dans les transports, entre amis." },
      ],
      progress: ENGLISH_PROGRESS_FR,
      faq: [
        { q: "Faut-il déjà parler anglais ?", a: "Non. Le cours accueille les débutants complets comme les étudiants qui ont déjà des bases." },
        { q: "Quelle durée choisir ?", a: "Pour un vrai changement à l'oral, comptez au moins 1 à 3 mois. Pour passer de débutant à un niveau à l'aise, 4 à 6 mois. Écrivez-nous sur WhatsApp, nous vous conseillons selon votre objectif." },
        { q: "Peut-on ajouter l'informatique ?", a: "Oui. Les cours d'informatique se suivent en complément, 3 heures par jour." },
        { q: "Et le logement ?", a: "L'école propose des chambres et un appartement à Alajo et Kotobabi, près des cours." },
      ],
      metaDescription:
        "Anglais intensif à Accra : 8 heures par jour, de 2 semaines à 6 mois, du niveau débutant à avancé. Programme, journée type, progression et tarifs.",
    },
    en: {
      title: "Intensive English",
      tagline: "English all day long, to progress fast.",
      intro:
        "TAS's most complete programme: 8 hours of English a day, from 2 weeks to 6 months. Within a few weeks, English becomes a language you use, not just a subject you study.",
      forWhom: [
        "You need to speak English quickly: studies, work, travel or an exam.",
        "You can dedicate yourself full-time to your course.",
        "You are starting from scratch or want to reach the next level.",
        "You are preparing to study in an English-speaking country.",
      ],
      learn: ENGLISH_LEARN_EN,
      day: [
        { title: "Morning: the foundations", text: "Grammar, vocabulary and reading, with exercises to lock in what you learn." },
        { title: "Midday: break", text: "Time to breathe… and speak English with the other students." },
        { title: "Afternoon: practice", text: "Listening, writing, speaking and debates. You use what you learned in the morning." },
        { title: "Evening: immersion", text: "In Accra, English is everywhere: at the market, on the bus, with friends." },
      ],
      progress: ENGLISH_PROGRESS_EN,
      faq: [
        { q: "Do I need to speak English already?", a: "No. The course welcomes complete beginners as well as students who already have some basics." },
        { q: "Which length should I choose?", a: "For a real change in speaking, allow at least 1 to 3 months. To go from beginner to comfortable, 4 to 6 months. Message us on WhatsApp and we'll advise you based on your goal." },
        { q: "Can I add computer courses?", a: "Yes. Computer courses can be taken on top, 3 hours a day." },
        { q: "What about housing?", a: "The school offers rooms and an apartment in Alajo and Kotobabi, close to class." },
      ],
      metaDescription:
        "Intensive English in Accra: 8 hours a day, from 2 weeks to 6 months, beginner to advanced. Programme, typical day, progress and fees.",
    },
  },
  {
    slug: "long-english",
    image: "/images/programs/english-long.jpg",
    photos: [{ src: "/images/tas/class-white.jpg", width: 1536, height: 1024 }, { src: "/images/tas/advising-office.jpg", width: 1386, height: 1135 }, { src: "/images/tas/graduation-caps-group.jpg", width: 1254, height: 1254 }],
    fr: {
      title: "Anglais longue durée",
      tagline: "Le même programme, à un rythme qui laisse de la place au reste.",
      intro:
        "5 heures d'anglais par jour, sur 3 mois à 1 an. Le contenu est le même que le cours intensif, sur plus de temps : idéal pour avancer régulièrement, avec la possibilité d'ajouter l'informatique.",
      forWhom: [
        "Vous voulez apprendre sur la durée, sans vous épuiser.",
        "Vous voulez garder du temps pour une autre activité.",
        "Vous voulez repartir avec deux compétences : l'anglais et l'informatique.",
        "Vous visez un niveau solide et durable, pas seulement un examen.",
      ],
      learn: ENGLISH_LEARN_FR,
      day: [
        { title: "Les cours : 5 heures", text: "Grammaire, vocabulaire, lecture, écriture, écoute, oral et débat, chaque jour." },
        { title: "Option informatique", text: "Ajoutez un module d'informatique à votre formation, 3 heures par jour." },
        { title: "Du temps pour réviser", text: "Le rythme laisse le temps de revoir les cours et de pratiquer seul." },
        { title: "La vie à Accra", text: "Sorties, rencontres, vie quotidienne : l'anglais s'installe naturellement." },
      ],
      progress: ENGLISH_PROGRESS_FR,
      faq: [
        { q: "Quelle différence avec le cours intensif ?", a: "Le programme est identique. Seul le nombre d'heures par jour change : 5 heures au lieu de 8, sur une période plus longue." },
        { q: "Qu'est-ce qui est offert ?", a: "2 cahiers, 2 livres (lecture et vocabulaire) et un t-shirt TAS." },
        { q: "Comment fonctionne l'option informatique ?", a: "Vous choisissez la formule « avec informatique » : un module d'informatique s'ajoute à vos cours d'anglais, au tarif indiqué dans le tableau." },
        { q: "Peut-on changer de durée en cours de route ?", a: "Parlez-en avec l'équipe TAS : elle vous indique les possibilités selon les sessions." },
      ],
      metaDescription:
        "Anglais longue durée à Accra : 5 heures par jour, de 3 mois à 1 an, avec ou sans informatique. Programme, progression, ce qui est offert et tarifs.",
    },
    en: {
      title: "Long-duration English",
      tagline: "The same programme, at a pace that leaves room for the rest.",
      intro:
        "5 hours of English a day, over 3 months to 1 year. The content is the same as the intensive course, spread over more time: ideal for steady progress, with the option to add computer training.",
      forWhom: [
        "You want to learn over time, without burning out.",
        "You want to keep time for another activity.",
        "You want to leave with two skills: English and computing.",
        "You are aiming for a solid, lasting level, not just an exam.",
      ],
      learn: ENGLISH_LEARN_EN,
      day: [
        { title: "Classes: 5 hours", text: "Grammar, vocabulary, reading, writing, listening, speaking and debate, every day." },
        { title: "Computer option", text: "Add a computer module to your course, 3 hours a day." },
        { title: "Time to review", text: "The pace leaves time to go over your lessons and practise on your own." },
        { title: "Life in Accra", text: "Outings, new friends, daily life: English settles in naturally." },
      ],
      progress: ENGLISH_PROGRESS_EN,
      faq: [
        { q: "How is it different from the intensive course?", a: "The programme is the same. Only the hours per day change: 5 hours instead of 8, over a longer period." },
        { q: "What is included?", a: "2 notebooks, 2 books (reading and vocabulary) and a TAS t-shirt." },
        { q: "How does the computer option work?", a: "Choose the \"with computer\" option: a computer module is added to your English classes, at the price shown in the table." },
        { q: "Can I change the length along the way?", a: "Talk to the TAS team: they will tell you what is possible depending on the sessions." },
      ],
      metaDescription:
        "Long-duration English in Accra: 5 hours a day, 3 months to 1 year, with or without computer training. Programme, progress, what's included and fees.",
    },
  },
  {
    slug: "computer-course",
    image: "/images/programs/computer.jpg",
    photos: [{ src: "/images/tas/computer-lab.jpg", width: 1448, height: 1086 }, { src: "/images/programs/computer.jpg", width: 1200, height: 1200 }, { src: "/images/tas/graduation-diploma-3.jpg", width: 1381, height: 1140 }],
    fr: {
      title: "Formations en informatique",
      tagline: "Des compétences concrètes, demandées par les employeurs.",
      intro:
        "9 formations de 2 à 6 mois, 3 heures par jour, pour apprendre un vrai savoir-faire : bureautique, graphisme, Excel, programmation, bases de données, réseaux, création de sites web ou réparation d'ordinateurs. À suivre seules ou en plus d'un cours d'anglais.",
      forWhom: [
        "Vous voulez un métier ou une compétence recherchée sur le marché du travail.",
        "Vous voulez compléter votre anglais par une compétence technique.",
        "Vous débutez en informatique ou vous voulez vous spécialiser.",
        "Vous voulez un certificat à ajouter à votre CV.",
      ],
      learn: [
        { title: "Bureautique", text: "Word, Excel, PowerPoint et la gestion de documents, pour travailler efficacement dans un bureau." },
        { title: "Création et graphisme", text: "Infographie et création de sites web, pour concevoir des visuels et des pages professionnelles." },
        { title: "Données et programmation", text: "Excel financier, programmation VBA et base de données Oracle." },
        { title: "Réseaux et matériel", text: "Réseaux Cisco et MCITP, réparation d'ordinateurs portables." },
      ],
      day: [
        { title: "3 heures de cours", text: "Explications du formateur, puis pratique directe sur ordinateur." },
        { title: "Des exercices concrets", text: "Chaque notion est appliquée à un cas réel : un tableau, une affiche, un réseau, une page web." },
        { title: "Compatible avec l'anglais", text: "Le rythme permet de suivre en même temps un cours d'anglais." },
        { title: "En salle informatique", text: "Les cours ont lieu dans la salle informatique de l'école." },
      ],
      progress: [
        { title: "Choisir sa formation", text: "L'équipe vous aide à choisir le module adapté à votre projet." },
        { title: "Apprendre en pratiquant", text: "Vous avancez étape par étape, toujours sur ordinateur." },
        { title: "Un projet à la fin", text: "Vous terminez avec des réalisations concrètes à montrer." },
        { title: "Un certificat", text: "Votre formation est validée par un certificat TAS English Institute." },
      ],
      faq: [
        { q: "Faut-il déjà savoir utiliser un ordinateur ?", a: "Non pour la bureautique : on part des bases. Pour les réseaux ou la programmation, parlez-en à l'équipe pour choisir le bon module." },
        { q: "Les cours sont-ils en anglais ?", a: "Les formations ont lieu au Ghana, pays anglophone : c'est aussi une excellente pratique de l'anglais technique." },
        { q: "Peut-on combiner avec l'anglais ?", a: "Oui, c'est même conseillé : l'anglais et une compétence technique forment un profil très recherché." },
        { q: "Comment payer ?", a: "Les tarifs des formations informatiques sont en cedis (GHC). L'équipe vous indique les modalités sur WhatsApp." },
      ],
      metaDescription:
        "Formations en informatique à Accra : bureautique, infographie, Excel, VBA, Oracle, réseaux Cisco et MCITP, sites web, réparation. 3 heures par jour, 2 à 6 mois.",
    },
    en: {
      title: "Computer courses",
      tagline: "Practical skills that employers are looking for.",
      intro:
        "9 courses of 2 to 6 months, 3 hours a day, to learn real know-how: office tools, graphic design, Excel, programming, databases, networking, website design or laptop repair. Take them on their own or alongside an English course.",
      forWhom: [
        "You want a job-ready skill.",
        "You want to add a technical skill to your English.",
        "You are new to computing or want to specialise.",
        "You want a certificate to add to your CV.",
      ],
      learn: [
        { title: "Office tools", text: "Word, Excel, PowerPoint and document management, to work efficiently in an office." },
        { title: "Design", text: "Graphic design and website design, to create professional visuals and pages." },
        { title: "Data and programming", text: "Financial Excel, VBA programming and Oracle Database." },
        { title: "Networks and hardware", text: "Cisco and MCITP networking, laptop repair." },
      ],
      day: [
        { title: "3 hours of class", text: "The trainer explains, then you practise straight away on a computer." },
        { title: "Real exercises", text: "Each topic is applied to a real case: a spreadsheet, a poster, a network, a web page." },
        { title: "Fits with English", text: "The pace lets you take an English course at the same time." },
        { title: "In the computer lab", text: "Classes take place in the school's computer lab." },
      ],
      progress: [
        { title: "Choose your course", text: "The team helps you pick the module that fits your plans." },
        { title: "Learn by doing", text: "You move forward step by step, always on a computer." },
        { title: "A project at the end", text: "You finish with concrete work to show." },
        { title: "A certificate", text: "Your course is validated with a TAS English Institute certificate." },
      ],
      faq: [
        { q: "Do I need computer skills already?", a: "Not for office tools: we start from the basics. For networking or programming, talk to the team to choose the right module." },
        { q: "Are classes in English?", a: "The courses take place in Ghana, an English-speaking country: it is also great practice for technical English." },
        { q: "Can I combine it with English?", a: "Yes, and we recommend it: English plus a technical skill is a highly sought-after profile." },
        { q: "How do I pay?", a: "Computer course fees are in cedis (GHC). The team explains how to pay on WhatsApp." },
      ],
      metaDescription:
        "Computer courses in Accra: office tools, graphic design, Excel, VBA, Oracle, Cisco and MCITP networking, website design, laptop repair. 3 hours a day, 2 to 6 months.",
    },
  },
];

export function getProgramDetail(slug: string) {
  return PROGRAM_DETAILS.find((p) => p.slug === slug);
}
