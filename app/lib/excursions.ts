/**
 * School outings TAS organizes during a stay. Destinations are the usual
 * Ghana student trips (Cape Coast, Kakum, Accra, the coast). Dates are
 * given in class, not invented here.
 */
export type Outing = {
  slug: string;
  image: string;
  titleFr: string;
  titleEn: string;
  textFr: string;
  textEn: string;
};

export const TAS_OUTINGS: Outing[] = [
  {
    slug: "cape-coast",
    image: "/images/outings/cape-coast-group.jpg",
    titleFr: "Cape Coast",
    titleEn: "Cape Coast",
    textFr: "Le château, l'histoire, et une journée hors d'Accra avec le groupe.",
    textEn: "The castle, the history, and a day out of Accra with the group.",
  },
  {
    slug: "kakum",
    image: "/images/outings/kakum-group.jpg",
    titleFr: "Kakum",
    titleEn: "Kakum",
    textFr: "La canopée en forêt, une sortie nature pendant la formation.",
    textEn: "The forest canopy walk, a nature outing during the course.",
  },
  {
    slug: "accra",
    image: "/images/gallery-campus.png",
    titleFr: "Accra",
    titleEn: "Accra",
    textFr: "La ville, les marchés, les lieux à connaître autour du campus.",
    textEn: "The city, the markets, and places worth knowing around campus.",
  },
  {
    slug: "mer",
    image: "/images/gallery-1.jpg",
    titleFr: "La mer",
    titleEn: "The coast",
    textFr: "Une journée sur la côte, avec les autres étudiants.",
    textEn: "A day on the coast, with the other students.",
  },
];
