/**
 * Contenu public éditable depuis le Back office.
 * Demain : une table pages / médias à la place de cette clé.
 */

import { readJson, writeJson } from "./persist";
import { OUTING_CLIPS } from "./outingMedia";
import { GRADUATION_PHOTOS } from "./testimonials";
import {
  TAS_ADDRESS,
  TAS_EMAIL,
  TAS_PHONE_DISPLAY,
  TAS_WHATSAPP_DISPLAY,
  TAS_WHATSAPP_URL,
} from "./contact";

export const SITE_CHANGED = "tas-site-changed";
const KEY = "tas-site-content";

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  kind?: "photo" | "video";
  poster?: string;
  titleFr?: string;
  titleEn?: string;
};

export type SiteContent = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hoursFr: string;
  hoursEn: string;
  homeHeroFr: string;
  homeHeroEn: string;
  homeLeadFr: string;
  homeLeadEn: string;
  gallery: GalleryPhoto[];
};

// Nouvelles vidéos des sorties d'abord (lib/outingMedia.ts), sans répéter celles déjà listées plus bas.
const OUTING_VIDEOS: GalleryPhoto[] = OUTING_CLIPS.filter((c) => c.id !== "kakum-canopy").map((c) => ({
  id: `v-${c.id}`,
  kind: "video",
  src: c.src,
  poster: c.poster,
  alt: "",
  titleFr: c.titleFr,
  titleEn: c.titleEn,
}));

export const SITE_GALLERY_BASE: GalleryPhoto[] = [
  ...OUTING_VIDEOS,
  { id: "out-beach-student", src: "/images/outings/beach-student.jpg", alt: "" },
  { id: "out-beach-fort", src: "/images/outings/beach-fort.jpg", alt: "" },
  { id: "out-cape-steps", src: "/images/outings/cape-coast-steps.jpg", alt: "" },
  ...GRADUATION_PHOTOS.map((p, i) => ({ id: `tas-grad-${i}`, src: p.src, alt: p.altFr })),
  {
    id: "v-kakum-walk",
    kind: "video",
    src: "/videos/kakum-walk.mp4",
    poster: "/images/outings/kakum-walk-poster.jpg",
    alt: "",
    titleFr: "Canopée, Kakum",
    titleEn: "Kakum canopy",
  },
  {
    id: "v-kakum-canopy",
    kind: "video",
    src: "/videos/kakum-canopy.mp4",
    poster: "/images/outings/kakum-canopy-poster.jpg",
    alt: "",
    titleFr: "Forêt de Kakum",
    titleEn: "Kakum forest",
  },
  {
    id: "v-kakum-entrance",
    kind: "video",
    src: "/videos/kakum-entrance.mp4",
    poster: "/images/outings/kakum-entrance-poster.jpg",
    alt: "",
    titleFr: "Arrivée à Kakum",
    titleEn: "Arriving at Kakum",
  },
  { id: "out-kakum-group", src: "/images/outings/kakum-group.jpg", alt: "" },
  { id: "out-kakum-selfie", src: "/images/outings/kakum-selfie.jpg", alt: "" },
  { id: "out-kakum-bridge", src: "/images/outings/kakum-bridge.jpg", alt: "" },
  { id: "out-kakum-walkway", src: "/images/outings/kakum-walkway.jpg", alt: "" },
  { id: "out-kakum-welcome", src: "/images/outings/kakum-welcome.jpg", alt: "" },
  { id: "out-kakum-span", src: "/images/outings/kakum-span.jpg", alt: "" },
  { id: "out-kakum-museum", src: "/images/outings/kakum-museum.jpg", alt: "" },
  { id: "out-kakum-forest", src: "/images/outings/kakum-forest.jpg", alt: "" },
  { id: "out-kakum-path", src: "/images/outings/kakum-path.jpg", alt: "" },
  { id: "out-kakum-bamboo", src: "/images/outings/kakum-bamboo.jpg", alt: "" },
  { id: "out-cape-group", src: "/images/outings/cape-coast-group.jpg", alt: "" },
  { id: "out-cape-castle", src: "/images/outings/cape-coast-castle.jpg", alt: "" },
  { id: "out-cape-court", src: "/images/outings/cape-coast-court.jpg", alt: "" },
  { id: "prog-intensive", src: "/images/programs/english-intensive.jpg", alt: "" },
  { id: "prog-long", src: "/images/programs/english-long.jpg", alt: "" },
  { id: "prog-computer", src: "/images/programs/computer.jpg", alt: "" },
  { id: "tas-class-red", src: "/images/tas/class-red.jpg", alt: "" },
  { id: "tas-class-white", src: "/images/tas/class-white.jpg", alt: "" },
  { id: "tas-class-poster", src: "/images/tas/class-poster.jpg", alt: "" },
  { id: "tas-computer-lab", src: "/images/tas/computer-lab.jpg", alt: "" },
  { id: "tas-graduate-woman", src: "/images/tas/graduate-woman.webp", alt: "" },
  { id: "tas-graduate-man", src: "/images/tas/graduate-man.webp", alt: "" },
  { id: "tas-advising", src: "/images/tas/advising-office.jpg", alt: "" },
  { id: "room-ac", src: "/images/rooms/room-ac.jpg", alt: "" },
  { id: "room-living", src: "/images/rooms/living-room.jpg", alt: "" },
  { id: "room-shared", src: "/images/rooms/room-shared.jpg", alt: "" },
  { id: "room-standard", src: "/images/rooms/room-standard.jpg", alt: "" },
  { id: "room-kitchen", src: "/images/rooms/kitchen.jpg", alt: "" },
  { id: "room-bathroom", src: "/images/rooms/bathroom.jpg", alt: "" },
  { id: "tas-hostel", src: "/images/tas/hostel.webp", alt: "" },
  { id: "tas-building-yellow", src: "/images/tas/building-yellow.webp", alt: "" },
  { id: "tas-building-grey", src: "/images/tas/building-grey.webp", alt: "" },
];

export const SITE_DEFAULTS: SiteContent = {
  phone: TAS_PHONE_DISPLAY,
  whatsapp: TAS_WHATSAPP_DISPLAY,
  email: TAS_EMAIL,
  address: TAS_ADDRESS,
  hoursFr: "Lundi à vendredi, 8 h à 17 h",
  hoursEn: "Monday to Friday, 8 am to 5 pm",
  homeHeroFr: "Apprenez l'anglais. Construisez votre avenir.",
  homeHeroEn: "Learn English. Build your future.",
  homeLeadFr: "Cours à Accra. 18 enseignants. Réponse sur WhatsApp.",
  homeLeadEn: "Classes in Accra. 18 teachers. We reply on WhatsApp.",
  gallery: [],
};

function digits(phone: string) {
  return phone.replace(/\D/g, "").replace(/^0/, "233");
}

export function whatsappUrlFromDisplay(display: string) {
  const n = digits(display);
  return n ? `https://wa.me/${n}` : TAS_WHATSAPP_URL;
}

export function whatsappLinkFromDisplay(display: string, message: string) {
  return `${whatsappUrlFromDisplay(display)}?text=${encodeURIComponent(message)}`;
}

const STALE_HOME_LEAD_FR = [
  "À Accra, TAS English Institute accompagne des étudiants africains et internationaux avec un enseignement structuré, des enseignants expérimentés et un cadre d'apprentissage sérieux.",
  "Huit heures d'anglais par jour à Accra. 18 enseignants. Une chambre près des salles. WhatsApp pour commencer.",
];
const STALE_HOME_LEAD_EN = [
  "In Accra, TAS English Institute supports African and international students with structured teaching, experienced teachers and a serious learning setting.",
  "In Accra, TAS English Institute supports African and international students with structured teaching, experienced instructors and a serious learning environment.",
  "Eight hours of English a day in Accra. 18 teachers. A room near class. WhatsApp to start.",
];

export function readSiteContent(): SiteContent {
  const saved = readJson<Partial<SiteContent> | null>(KEY, null);
  if (!saved) return SITE_DEFAULTS;
  const homeLeadFr = saved.homeLeadFr && !STALE_HOME_LEAD_FR.includes(saved.homeLeadFr)
    ? saved.homeLeadFr
    : SITE_DEFAULTS.homeLeadFr;
  const homeLeadEn = saved.homeLeadEn && !STALE_HOME_LEAD_EN.includes(saved.homeLeadEn)
    ? saved.homeLeadEn
    : SITE_DEFAULTS.homeLeadEn;
  return { ...SITE_DEFAULTS, ...saved, homeLeadFr, homeLeadEn, gallery: saved.gallery ?? [] };
}

export function writeSiteContent(next: SiteContent) {
  writeJson(KEY, next, SITE_CHANGED);
}

export function patchSiteContent(patch: Partial<SiteContent>) {
  writeSiteContent({ ...readSiteContent(), ...patch });
}

export function liveGallery(): GalleryPhoto[] {
  const extras = readSiteContent().gallery;
  const ids = new Set(extras.map((p) => p.id));
  return [...extras, ...SITE_GALLERY_BASE.filter((p) => !ids.has(p.id))];
}

export function addGalleryPhoto(src: string, alt: string) {
  const site = readSiteContent();
  const photo: GalleryPhoto = { id: `g-${Date.now()}`, src, alt };
  writeSiteContent({ ...site, gallery: [photo, ...site.gallery] });
  return photo;
}

export function removeGalleryPhoto(id: string) {
  const site = readSiteContent();
  writeSiteContent({ ...site, gallery: site.gallery.filter((p) => p.id !== id) });
}
