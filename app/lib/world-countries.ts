/** Tous les pays ISO. Une liste, site et app. Les noms viennent de l'appareil. */

export const WORLD_COUNTRY_CODES = [
  "AF", "AL", "DZ", "AD", "AO", "AG", "AR", "AM", "AU", "AT",
  "AZ", "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BT",
  "BO", "BA", "BW", "BR", "BN", "BG", "BF", "BI", "CV", "KH",
  "CM", "CA", "CF", "TD", "CL", "CN", "CO", "KM", "CG", "CD",
  "CR", "CI", "HR", "CU", "CY", "CZ", "DK", "DJ", "DM", "DO",
  "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FJ", "FI",
  "FR", "GA", "GM", "GE", "DE", "GH", "GR", "GD", "GT", "GN",
  "GW", "GY", "HT", "HN", "HU", "IS", "IN", "ID", "IR", "IQ",
  "IE", "IL", "IT", "JM", "JP", "JO", "KZ", "KE", "KI", "KP",
  "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI",
  "LT", "LU", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MR",
  "MU", "MX", "FM", "MD", "MC", "MN", "ME", "MA", "MZ", "MM",
  "NA", "NR", "NP", "NL", "NZ", "NI", "NE", "NG", "MK", "NO",
  "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PL",
  "PT", "QA", "RO", "RU", "RW", "KN", "LC", "VC", "WS", "SM",
  "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SK", "SI", "SB",
  "SO", "ZA", "SS", "ES", "LK", "SD", "SR", "SE", "CH", "SY",
  "TW", "TJ", "TZ", "TH", "TL", "TG", "TO", "TT", "TN", "TR",
  "TM", "TV", "UG", "UA", "AE", "GB", "US", "UY", "UZ", "VU",
  "VA", "VE", "VN", "YE", "ZM", "ZW",
] as const;

export type WorldCountryCode = (typeof WORLD_COUNTRY_CODES)[number];

/** Pays souvent tapés en premier à TAS. */
export const PINNED_COUNTRY_CODES: WorldCountryCode[] = [
  "CI", "BF", "SN", "ML", "GH", "GN", "TG", "BJ", "NE", "CM", "NG", "FR", "US",
];

const ALIASES: Record<string, WorldCountryCode> = {
  ci: "CI",
  civ: "CI",
  ivoire: "CI",
  ivory: "CI",
  ivorycoast: "CI",
  cotedivoire: "CI",
  cotedivoir: "CI",
  cotedivoare: "CI",
  bf: "BF",
  burkina: "BF",
  burkinafaso: "BF",
  sn: "SN",
  senagal: "SN",
  seneagal: "SN",
  senegal: "SN",
  ml: "ML",
  malie: "ML",
  gh: "GH",
  gana: "GH",
  ghana: "GH",
  gn: "GN",
  guinee: "GN",
  guinea: "GN",
  tg: "TG",
  togo: "TG",
  bj: "BJ",
  benin: "BJ",
  ne: "NE",
  niger: "NE",
  cm: "CM",
  cameroun: "CM",
  cameroon: "CM",
  ng: "NG",
  nigeria: "NG",
  usa: "US",
  us: "US",
  etatsunis: "US",
  states: "US",
  uk: "GB",
  gb: "GB",
  angleterre: "GB",
  britain: "GB",
  england: "GB",
  rdc: "CD",
  congo: "CD",
  za: "ZA",
  afriquedusud: "ZA",
};

export type CountryLang = "fr" | "en";

const nameCache = new Map<string, string>();

export function foldCountryQuery(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function countryName(code: string, lang: CountryLang) {
  const key = `${lang}:${code}`;
  const cached = nameCache.get(key);
  if (cached) return cached;
  const name = new Intl.DisplayNames([lang], { type: "region" }).of(code) ?? code;
  nameCache.set(key, name);
  return name;
}

export type CountryOption = {
  value: string;
  label: string;
  code: string;
};

export function worldCountryOptions(lang: CountryLang): CountryOption[] {
  return WORLD_COUNTRY_CODES.map((code) => ({
    value: countryName(code, lang),
    label: countryName(code, lang),
    code,
  }));
}

function distance(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i += 1) {
    let prev = i;
    row[0] = i + 1;
    for (let j = 0; j < b.length; j += 1) {
      const next = row[j + 1];
      const cost = a[i] === b[j] ? 0 : 1;
      row[j + 1] = Math.min(row[j + 1] + 1, row[j] + 1, prev + cost);
      prev = next;
    }
  }
  return row[b.length];
}

function scoreName(query: string, name: string, code: string) {
  const n = foldCountryQuery(name);
  const c = code.toLowerCase();
  if (!query) return PINNED_COUNTRY_CODES.includes(code as WorldCountryCode) ? 90 : 10;
  if (n === query || c === query) return 100;
  if (n.startsWith(query) || c.startsWith(query)) return 86;
  if (n.split(" ").some((word) => word.startsWith(query))) return 74;
  if (n.includes(query)) return 58;
  if (query.length >= 3 && (distance(query, n.slice(0, query.length)) <= 1 || distance(query, n) <= 2)) return 46;
  return 0;
}

export function filterCountries(query: string, lang: CountryLang): CountryOption[] {
  const q = foldCountryQuery(query);
  const alias = ALIASES[q.replace(/\s/g, "")];
  const rows = worldCountryOptions(lang)
    .map((row) => {
      const aliasBoost = alias === row.code ? 95 : 0;
      const score = Math.max(
        aliasBoost,
        scoreName(q, row.label, row.code),
        scoreName(q, countryName(row.code, lang === "fr" ? "en" : "fr"), row.code),
      );
      return { row, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.row.label.localeCompare(b.row.label, lang));
  return rows.map((item) => item.row);
}
