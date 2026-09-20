/**
 * Contenu public éditable depuis le Back office.
 * Demain : une table pages / médias à la place de cette clé.
 */

import { readJson, writeJson } from "./persist";
import {
  TAS_ADDRESS,
  TAS_EMAIL,
  TAS_PHONE_DISPLAY,
  TAS_WHATSAPP_DISPLAY,
  TAS_WHATSAPP_URL,
} from "./contact";

export const SITE_CHANGED = "tas-site-changed";
const KEY = "tas-site-content";

export type GalleryPhoto = { id: string; src: string; alt: string };

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

export const SITE_GALLERY_BASE: GalleryPhoto[] = [
  { id: "base-1", src: "/images/gallery-1.jpg", alt: "" },
  { id: "base-2", src: "/images/gallery-2.jpg", alt: "" },
  { id: "base-3", src: "/images/classroom-1.jpg", alt: "" },
  { id: "base-4", src: "/images/gallery-3.jpg", alt: "" },
  { id: "base-5", src: "/images/group-outdoor.jpg", alt: "" },
  { id: "base-6", src: "/images/gallery-4.jpg", alt: "" },
  { id: "base-7", src: "/images/computer-lab.jpg", alt: "" },
  { id: "base-8", src: "/images/gallery-5.jpg", alt: "" },
  { id: "base-9", src: "/images/about-campus.jpg", alt: "" },
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
  homeLeadFr:
    "À Accra, TAS English Institute accompagne des étudiants africains et internationaux avec un enseignement structuré, des enseignants expérimentés et un cadre d'apprentissage sérieux.",
  homeLeadEn:
    "In Accra, TAS English Institute supports African and international students with structured teaching, experienced teachers and a serious learning setting.",
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

export function readSiteContent(): SiteContent {
  const saved = readJson<Partial<SiteContent> | null>(KEY, null);
  if (!saved) return SITE_DEFAULTS;
  return { ...SITE_DEFAULTS, ...saved, gallery: saved.gallery ?? [] };
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
