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
    image: "/images/accommodation-living.jpg",
    price: "260 000",
    titleFr: "Appartement deux chambres, Alajo",
    titleEn: "Two bedroom apartment, Alajo",
    includesFr: ["Eau", "Poubelle", "Climatisation", "Douche et toilette", "Cuisine", "TV"],
    includesEn: ["Water", "Waste collection", "Air conditioning", "Shower and toilet", "Kitchen", "TV"],
  },
  {
    slug: "air-conditioned",
    image: "/images/accommodation-air-conditioned.png",
    price: "130 000",
    titleFr: "Chambre climatisée, Kotobabi",
    titleEn: "Air conditioned room, Kotobabi",
    includesFr: ["Eau", "Poubelle", "Climatisation", "Douche et toilette", "Cuisine", "TV"],
    includesEn: ["Water", "Waste collection", "Air conditioning", "Shower and toilet", "Kitchen", "TV"],
  },
  {
    slug: "standard",
    image: "/images/accommodation-standard.png",
    price: "100 000",
    titleFr: "Chambre sans climatisation, Kotobabi",
    titleEn: "Room without air conditioning, Kotobabi",
    includesFr: ["Eau", "Poubelle", "Ventilateur", "Douche et toilette", "Cuisine", "TV"],
    includesEn: ["Water", "Waste collection", "Fan", "Shower and toilet", "Kitchen", "TV"],
  },
  {
    slug: "shared",
    image: "/images/accommodation-shared.png",
    price: "60 000",
    titleFr: "Deux personnes par chambre, Kotobabi",
    titleEn: "Two people per room, Kotobabi",
    includesFr: ["Eau", "Poubelle", "Ventilateur", "Cuisine", "Toilette"],
    includesEn: ["Water", "Waste collection", "Fan", "Kitchen", "Toilet"],
  },
];
