/**
 * Témoignages réels d'anciens étudiants de TAS (textes transmis par l'école).
 * L'accueil et la page Parcours d'étudiants lisent cette liste. Objectif : 6 avis.
 * Ne jamais ajouter un avis inventé : seulement des textes et photos fournis par l'école.
 */

export interface Testimonial {
  id: string;
  name: string;
  photo: string;
  /** Cadrage de la photo dans la carte (object-position). */
  photoPosition?: string;
  programFr: string;
  programEn: string;
  badgeFr?: string;
  badgeEn?: string;
  /** Note sur 5, seulement si l'étudiant l'a donnée. */
  rating?: number;
  quoteFr: string;
  quoteEn: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "fatou-watarra",
    name: "Fatou Watarra",
    photo: "/images/tas/graduate-woman.webp",
    photoPosition: "50% 18%",
    programFr: "Anglais intensif, 3 mois",
    programEn: "Intensive English, 3 months",
    badgeFr: "Diplômée",
    badgeEn: "Graduate",
    quoteFr:
      "La formation intensive de 3 mois à TAS English Institute m'a donné l'opportunité de poursuivre mes études en France.",
    quoteEn:
      "The 3-month intensive course at TAS English Institute gave me the opportunity to continue my studies in France.",
  },
  {
    id: "jean-philippe",
    name: "Jean Philippe",
    photo: "/images/tas/graduate-man.webp",
    photoPosition: "50% 22%",
    programFr: "Anglais, 9 mois",
    programEn: "English, 9 months",
    badgeFr: "Diplômé",
    badgeEn: "Graduate",
    rating: 4,
    quoteFr:
      "L'un des points forts de mon stage chez TAS English Institute a été l'acquisition de compétences que je ne m'attendais pas à acquérir en anglais : parler, lire et écrire.",
    quoteEn:
      "One of the highlights of my time at TAS English Institute was gaining skills in English I did not expect to gain: speaking, reading and writing.",
  },
];

/** Photos réelles des remises de diplômes (sans témoignage écrit). */
export const GRADUATION_PHOTOS = [
  { src: "/images/tas/graduation-caps-yellow.jpg", altFr: "Des diplômés lancent leurs toques devant l'école", altEn: "Graduates throwing their caps outside the school" },
  { src: "/images/tas/graduate-duo.jpg", altFr: "Deux diplômés de TAS", altEn: "Two TAS graduates" },
  { src: "/images/tas/graduate-portrait-hijab.jpg", altFr: "Une diplômée de TAS", altEn: "A TAS graduate" },
  { src: "/images/tas/graduation-caps-group.jpg", altFr: "Une promotion de diplômés", altEn: "A graduating class" },
  { src: "/images/tas/graduation-diploma-1.jpg", altFr: "Remise de diplôme", altEn: "Diploma ceremony" },
  { src: "/images/tas/graduation-diploma-2.jpg", altFr: "Remise de diplôme", altEn: "Diploma ceremony" },
  { src: "/images/tas/graduation-diploma-3.jpg", altFr: "Remise de diplôme", altEn: "Diploma ceremony" },
  { src: "/images/tas/graduation-class-hall.jpg", altFr: "Une promotion réunie en salle", altEn: "A graduating class together" },
  { src: "/images/tas/graduation-class-night.jpg", altFr: "Des diplômés célèbrent en soirée", altEn: "Graduates celebrating in the evening" },
  { src: "/images/tas/graduation-handshake.jpg", altFr: "Remise de diplôme à TAS English Institute", altEn: "Graduation at TAS English Institute" },
  { src: "/images/tas/graduation-hijab.jpg", altFr: "Une diplômée reçoit son diplôme", altEn: "A graduate receives her diploma" },
  { src: "/images/tas/graduation-handshake-2.webp", altFr: "Un diplômé et son professeur", altEn: "A graduate with his teacher" },
];

/** Les 4 photos de la rangée « Nos diplômés » sous les avis de l'accueil. */
export const HOME_GRADUATES = GRADUATION_PHOTOS.slice(0, 4);
