/**
 * The three housing options exactly as the school publishes them on
 * tasenglishinstitut.com/courses (price + what's included). The site states no
 * billing period; the school confirmed the prices are monthly.
 *
 * Single source of truth: the home page teaser and /accommodation both read it.
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
    slug: "air-conditioned",
    image: "/images/accommodation-air-conditioned.png",
    price: "130 000",
    titleFr: "Chambre climatisée",
    titleEn: "Air-conditioned room",
    includesFr: ["Eau", "Climatisation", "Douche et toilette", "Cuisine", "TV"],
    includesEn: ["Water", "Air conditioning", "Shower and toilet", "Kitchen", "TV"],
  },
  {
    slug: "standard",
    image: "/images/accommodation-standard.png",
    price: "100 000",
    titleFr: "Chambre non climatisée",
    titleEn: "Non-air-conditioned room",
    includesFr: ["Eau", "Douche et toilette", "Cuisine", "TV"],
    includesEn: ["Water", "Shower and toilet", "Kitchen", "TV"],
  },
  {
    slug: "shared",
    image: "/images/accommodation-shared.png",
    price: "60 000",
    titleFr: "Deux par chambre",
    titleEn: "Two per room",
    includesFr: ["Eau", "Douche et toilette", "Cuisine"],
    includesEn: ["Water", "Shower and toilet", "Kitchen"],
  },
];
