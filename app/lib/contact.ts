/** Numéro principal de l'école, affiché partout (aussi le WhatsApp). */
export const TAS_PHONE_DISPLAY = "+233 570 259 279";
/** Autres lignes : le fondateur, puis les deux numéros du flyer 2024. */
export const TAS_SCHOOL_PHONES = ["+233 256 272 220", "+233 573 295 477", "+233 533 454 418"] as const;

/** Lien tel: pour un numéro affiché. */
export function telLink(display: string) {
  return `tel:${display.replace(/\s/g, "")}`;
}

export const TAS_WHATSAPP_DISPLAY = "+233 570 259 279";
export const TAS_WHATSAPP_URL = "https://wa.me/233570259279";

/** Same thread, with the message already typed for the visitor. */
export function whatsappLink(message: string) {
  return `${TAS_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}
/** Adresse du site imprimée sur le flyer. */
export const TAS_WEBSITE = "www.tasenglishinstitut.com";
export const TAS_EMAIL = "tasghana@gmail.com";
export const TAS_ADDRESS = "Accra, Alajo, Kotobabi, Ghana";

/** Pages publiées par l'école sur tasenglishinstitut.com. */
export const TAS_SOCIAL = [
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/TasEnglishInstitut" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/tasenglishinstitute/" },
  { id: "youtube", label: "YouTube", href: "https://www.youtube.com/watch?v=2FteX9oWgSw" },
] as const;

/**
 * Location as published by the school: "Alajo Polo Junction, Accra Ghana" on the
 * 2024 flyer, "Accra, Ghana, Alajo, Kotobabi, New Town" on the contact page.
 * Coordinates are Alajo Polo Junction itself — the landmark the school gives.
 */
export const TAS_LOCATION = {
  landmarkFr: "Alajo Polo Junction, Accra",
  landmarkEn: "Alajo Polo Junction, Accra",
  addressFr: "Alajo Polo Junction, Kotobabi New Town, Accra, Ghana",
  addressEn: "Alajo Polo Junction, Kotobabi New Town, Accra, Ghana",
  lat: 5.59835,
  lng: -0.21223,
  /** Nearby stops, from public transit data for Polo Junction. */
  transitFr: "Arrêts proches : Polo Junction, Kotobabi Down, Alajo T-Junction",
  transitEn: "Nearby stops: Polo Junction, Kotobabi Down, Alajo T-Junction",
} as const;

const MAPS_QUERY = encodeURIComponent("Alajo Polo Junction, Accra, Ghana");

/** Keyless Google Maps embed, so no API key ends up in the client bundle. */
export const TAS_MAP_EMBED_URL = `https://www.google.com/maps?q=${MAPS_QUERY}&z=16&hl=fr&output=embed`;

export const TAS_MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;

export const TAS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAPS_QUERY}`;

/** Instant street poster while the live map finishes. One Carto tile, no key. */
export const TAS_MAP_STATIC_URL =
  "https://basemaps.cartocdn.com/rastertiles/voyager/16/32729/31747@2x.png";
