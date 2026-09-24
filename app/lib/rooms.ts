/**
 * Logements de l'affiche TAS 2024. Tarifs mensuels.
 * Accueil et /accommodation lisent cette liste.
 */
export type Room = {
  slug: string;
  image: string;
  price: string;
  titleFr: string;
  titleEn: string;
  includesFr: string[];
  includesEn: string[];
};

export const TAS_ROOMS: Room[] = [
  {
    slug: "apartment",
    image: "/images/rooms/living-room.jpg",
    price: "260 000",
    titleFr: "Appartement deux chambres, Alajo",
    titleEn: "Two bedroom apartment, Alajo",
    includesFr: ["Eau", "Poubelle", "Climatisation", "Douche et toilette", "Cuisine", "TV"],
    includesEn: ["Water", "Waste collection", "Air conditioning", "Shower and toilet", "Kitchen", "TV"],
  },
  {
    slug: "air-conditioned",
    image: "/images/rooms/room-ac.jpg",
    price: "130 000",
    titleFr: "Chambre climatisée, Kotobabi",
    titleEn: "Air conditioned room, Kotobabi",
    includesFr: ["Eau", "Poubelle", "Climatisation", "Douche et toilette", "Cuisine", "TV"],
    includesEn: ["Water", "Waste collection", "Air conditioning", "Shower and toilet", "Kitchen", "TV"],
  },
  {
    slug: "standard",
    image: "/images/rooms/room-standard.jpg",
    price: "100 000",
    titleFr: "Chambre sans climatisation, Kotobabi",
    titleEn: "Room without air conditioning, Kotobabi",
    includesFr: ["Eau", "Poubelle", "Ventilateur", "Douche et toilette", "Cuisine", "TV"],
    includesEn: ["Water", "Waste collection", "Fan", "Shower and toilet", "Kitchen", "TV"],
  },
  {
    slug: "shared",
    image: "/images/rooms/room-shared.jpg",
    price: "60 000",
    titleFr: "Deux personnes par chambre, Kotobabi",
    titleEn: "Two people per room, Kotobabi",
    includesFr: ["Eau", "Poubelle", "Ventilateur", "Cuisine", "Toilette"],
    includesEn: ["Water", "Waste collection", "Fan", "Kitchen", "Toilet"],
  },
];

/** Photos réelles des résidences, par quartier. */
export const TAS_RESIDENCES = [
  { image: "/images/tas/hostel.webp", areaFr: "Alajo", areaEn: "Alajo", labelFr: "Hostel TAS Institute", labelEn: "TAS Institute Hostel" },
  { image: "/images/tas/building-grey.webp", areaFr: "Alajo", areaEn: "Alajo", labelFr: "Résidence TAS", labelEn: "TAS residence" },
  { image: "/images/tas/building-yellow.webp", areaFr: "Kotobabi", areaEn: "Kotobabi", labelFr: "Résidence TAS", labelEn: "TAS residence" },
] as const;

/**
 * Frais d'installation, payés une fois par étudiant (flyer 2024).
 * Affichés sur le flyer seulement. Le flyer 2024 ne les indique pas pour la chambre partagée.
 */
export const ROOM_INSTALLATION_CFA = 30_000;
export const ROOM_INSTALLATION_SLUGS = ["apartment", "air-conditioned", "standard"] as const;

/** Équipements communs des logements (photos réelles). */
export const ROOM_AMENITY_PHOTOS = [
  { src: "/images/rooms/kitchen.jpg", labelFr: "Cuisine équipée", labelEn: "Equipped kitchen" },
  { src: "/images/rooms/bathroom.jpg", labelFr: "Douche et toilette", labelEn: "Shower and toilet" },
  { src: "/images/rooms/living-room.jpg", labelFr: "Salon", labelEn: "Living room" },
] as const;
