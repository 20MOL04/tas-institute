/**
 * Vidéos réelles des sorties TAS. Une seule liste : la vignette de l'accueil
 * (OutingReel) et la galerie la lisent.
 * Pour ajouter une vidéo : la déposer dans public/videos/, son aperçu dans
 * public/images/outings/<nom>-poster.jpg, puis l'ajouter ici.
 */

export interface OutingClip {
  id: string;
  src: string;
  poster: string;
  titleFr: string;
  titleEn: string;
  /** Vidéo filmée au téléphone en vertical. */
  vertical?: boolean;
}

const clip = (id: string, titleFr: string, titleEn: string, vertical = false, src = `/videos/${id}.mp4`): OutingClip => ({
  id,
  src,
  poster: `/images/outings/${id}-poster.jpg`,
  titleFr,
  titleEn,
  vertical,
});

export const OUTING_CLIPS: OutingClip[] = [
  clip("beach-tug-of-war", "Tir à la corde sur la plage", "Tug of war on the beach"),
  clip("beach-volleyball", "Volley sur la plage", "Beach volleyball"),
  clip("bus-arrival", "Arrivée en bus", "Arriving by bus"),
  clip("beach-walkway", "En route vers la plage", "Heading to the beach"),
  clip("beach-coast", "La côte", "The coast"),
  clip("beach-resort", "Pause au bord de la mer", "Break by the sea"),
  clip("beach-group", "Entre étudiants", "With classmates"),
  clip("kakum-canopy", "La canopée de Kakum", "The Kakum canopy", false, "/videos/kakum-canopy.mp4"),
  clip("kakum-bridge-selfie", "Sur les ponts de Kakum", "On the Kakum bridges", true),
  clip("beach-stalls", "Les stands de la plage", "Beach stalls", true),
  clip("beach-walk", "Balade sur le sable", "A walk on the sand", true),
];
