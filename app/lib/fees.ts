/**
 * Tarifs publiés sur l'affiche TAS 2024.
 * Une seule source pour le site. Ne pas recopier les montants ailleurs.
 */

export type MoneyCurrency = "CFA" | "GHC";

export function formatAmount(n: number) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatMoney(n: number, currency: MoneyCurrency) {
  return `${formatAmount(n)} ${currency}`;
}

export const INTENSIVE_HOURS = 8;

export const INTENSIVE_FEES = [
  { durationFr: "2 semaines", durationEn: "2 weeks", priceCfa: 209_000 },
  { durationFr: "3 semaines", durationEn: "3 weeks", priceCfa: 250_000 },
  { durationFr: "1 mois", durationEn: "1 month", priceCfa: 289_000 },
  { durationFr: "6 semaines", durationEn: "6 weeks", priceCfa: 320_000 },
  { durationFr: "2 mois", durationEn: "2 months", priceCfa: 394_000 },
  { durationFr: "10 semaines", durationEn: "10 weeks", priceCfa: 420_000 },
  { durationFr: "3 mois", durationEn: "3 months", priceCfa: 445_000 },
  { durationFr: "4 mois", durationEn: "4 months", priceCfa: 489_000 },
  { durationFr: "6 mois", durationEn: "6 months", priceCfa: 670_000 },
] as const;

export const REGULAR_HOURS = 5;

export const REGULAR_FEES = [
  { durationFr: "3 mois", durationEn: "3 months", withoutItCfa: 170_000, withItCfa: 215_000 },
  { durationFr: "6 mois", durationEn: "6 months", withoutItCfa: 210_000, withItCfa: 255_000 },
  { durationFr: "9 mois", durationEn: "9 months", withoutItCfa: 270_000, withItCfa: 315_000 },
  { durationFr: "1 an", durationEn: "1 year", withoutItCfa: 370_000, withItCfa: 415_000 },
] as const;

export const REGULAR_ENROLLMENT_CFA = 45_000;
export const REGULAR_CERTIFICATE_GHC = 40;
export const REGULAR_INCLUDED_FR = ["2 cahiers", "2 livres (lecture et vocabulaire)", "1 t-shirt TAS"] as const;
export const REGULAR_INCLUDED_EN = ["2 notebooks", "2 books (reading and vocabulary)", "1 TAS t-shirt"] as const;

export const EXAM_CLASS_CFA = 70_000;
export const EXAM_HOURS_FR = "1 h 30";
export const EXAM_HOURS_EN = "1 h 30";
export const EXAM_DAYS_FR = "Lundi au vendredi";
export const EXAM_DAYS_EN = "Monday to Friday";

export const EXAM_FEES = [
  { name: "TOEFL", examCfa: 85_000 },
  { name: "IELTS", examCfa: 90_000 },
  { name: "TOEIC", examCfa: 90_000 },
] as const;

export const COMPUTER_HOURS = 3;

export const COMPUTER_COURSES = [
  { id: "office", titleFr: "Microsoft Office Admin", titleEn: "Microsoft Office Admin", months: 3, priceGhc: 450 },
  { id: "graphic", titleFr: "Infographie", titleEn: "Graphic design", months: 3, priceGhc: 800 },
  { id: "hardware", titleFr: "Réparation d'ordinateurs", titleEn: "Laptop repair", months: 3, priceGhc: 1_500 },
  { id: "excel", titleFr: "Excel financier", titleEn: "Financial Excel", months: 2, priceGhc: 500 },
  { id: "vba", titleFr: "Programmation VBA sur Excel", titleEn: "VBA programming in Excel", months: 3, priceGhc: 500 },
  { id: "oracle", titleFr: "Base de données Oracle", titleEn: "Oracle Database", months: 6, priceGhc: 1_500 },
  { id: "mcitp", titleFr: "Réseaux MCITP", titleEn: "Networking MCITP", months: 6, priceGhc: 1_700 },
  { id: "web", titleFr: "Création de sites web", titleEn: "Website design", months: 6, priceGhc: 1_200 },
  { id: "cisco", titleFr: "Réseaux Cisco", titleEn: "Cisco networking", months: 3, priceGhc: 1_500 },
] as const;

export const COMPUTER_ENROLLMENT_GHC = 30;
export const COMPUTER_CERTIFICATE_GHC = 30;
