/**
 * SIOS — Event Structuring Engine
 *
 * Entity resolution and event structuring: converts raw intelligence items
 * into structured WorldEvents with canonical entity names.
 */

import type {
  RawIntelligenceItem,
  WorldEvent,
  EventDomain,
  IngestionCategory,
} from "./types.js";

// ── Canonical Entity Map ──

const CANONICAL_ENTITIES: Record<string, string> = {
  // United States
  "united states": "United States",
  usa: "United States",
  "u.s.": "United States",
  us: "United States",
  america: "United States",
  washington: "United States",
  pentagon: "United States",
  "white house": "United States",
  "us military": "United States",
  "u.s. military": "United States",
  "us government": "United States",

  // China
  china: "China",
  prc: "China",
  "people's republic of china": "China",
  beijing: "China",
  ccp: "China",
  "chinese communist party": "China",
  "pla": "China",
  "people's liberation army": "China",

  // Russia
  russia: "Russia",
  "russian federation": "Russia",
  moscow: "Russia",
  kremlin: "Russia",
  "russian military": "Russia",

  // Iran
  iran: "Iran",
  "islamic republic": "Iran",
  "islamic republic of iran": "Iran",
  "tehran regime": "Iran",
  tehran: "Iran",

  // IRGC (kept as distinct actor)
  irgc: "IRGC",
  "islamic revolutionary guard corps": "IRGC",
  "revolutionary guard": "IRGC",
  "quds force": "IRGC",

  // NATO
  nato: "NATO",
  "north atlantic treaty organization": "NATO",
  "atlantic alliance": "NATO",

  // European Union
  eu: "European Union",
  "european union": "European Union",
  brussels: "European Union",

  // North Korea
  "north korea": "North Korea",
  dprk: "North Korea",
  "democratic people's republic of korea": "North Korea",
  pyongyang: "North Korea",

  // South Korea
  "south korea": "South Korea",
  "republic of korea": "South Korea",
  rok: "South Korea",
  seoul: "South Korea",

  // Japan
  japan: "Japan",
  tokyo: "Japan",

  // India
  india: "India",
  "new delhi": "India",

  // Taiwan
  taiwan: "Taiwan",
  "republic of china": "Taiwan",
  taipei: "Taiwan",

  // Israel
  israel: "Israel",
  "tel aviv": "Israel",
  idf: "Israel",

  // Key corporations
  tsmc: "TSMC",
  "taiwan semiconductor": "TSMC",
  samsung: "Samsung",
  intel: "Intel",

  // Key organizations
  "united nations": "United Nations",
  un: "United Nations",
  opec: "OPEC",
  "opec+": "OPEC+",
};

// ── Known Locations ──

const KNOWN_LOCATIONS: string[] = [
  // Strategic chokepoints
  "Strait of Hormuz",
  "South China Sea",
  "Taiwan Strait",
  "Suez Canal",
  "Strait of Malacca",
  "Bab el-Mandeb",
  "Panama Canal",
  "Bosporus",
  "Dardanelles",
  "Strait of Gibraltar",
  "GIUK Gap",
  "Luzon Strait",

  // Contested regions
  "Donbas",
  "Crimea",
  "Golan Heights",
  "Kashmir",
  "Aksai Chin",
  "Arunachal Pradesh",
  "Spratly Islands",
  "Paracel Islands",
  "Senkaku Islands",
  "Kuril Islands",

  // Countries — major geopolitical actors
  "United States",
  "China",
  "Russia",
  "Iran",
  "North Korea",
  "South Korea",
  "Japan",
  "India",
  "Pakistan",
  "Israel",
  "Turkey",
  "Saudi Arabia",
  "Ukraine",
  "Taiwan",
  "Germany",
  "France",
  "United Kingdom",
  "Australia",
  "Brazil",
  "Indonesia",
  "Philippines",
  "Vietnam",
  "Poland",
  "Romania",
  "Syria",
  "Iraq",
  "Afghanistan",
  "Yemen",
  "Libya",
  "Egypt",
  "Ethiopia",
  "Nigeria",
  "South Africa",
  "Canada",
  "Mexico",

  // Major cities with strategic significance
  "Tehran",
  "Beijing",
  "Moscow",
  "Washington",
  "Taipei",
  "Seoul",
  "Tokyo",
  "New Delhi",
  "Islamabad",
  "Riyadh",
  "Jerusalem",
  "Kyiv",
  "Ankara",
  "Shanghai",
  "Shenzhen",
  "Hsinchu",

  // Strategic sites
  "Natanz",
  "Fordow",
  "Bushehr",
  "Bandar Abbas",
  "Kharg Island",
  "Ras Laffan",
  "Diego Garcia",
  "Guam",
  "Okinawa",
  "Ramstein",
  "Incirlik",
  "Pearl Harbor",
  "Norfolk",
  "Sevastopol",
  "Tartus",
  "Djibouti",

  // Seas and oceans
  "Persian Gulf",
  "Arabian Sea",
  "Red Sea",
  "Mediterranean Sea",
  "Black Sea",
  "Baltic Sea",
  "East China Sea",
  "Sea of Japan",
  "Indian Ocean",
  "Pacific Ocean",
  "Atlantic Ocean",
  "Arctic Ocean",
];

// ── Category-to-Domain Mapping ──

const CATEGORY_TO_DOMAIN: Record<IngestionCategory, EventDomain> = {
  geopolitical: "political",
  military: "military",
  economic: "economic",
  technology: "technological",
  narrative: "informational",
  osint: "military",
};

// ── Public API ──

/**
 * Resolves an entity name to its canonical form.
 * Returns the original name if no canonical mapping exists.
 */
export function resolveEntity(name: string): string {
  const lower = name.toLowerCase().trim();
  return CANONICAL_ENTITIES[lower] ?? name;
}

/**
 * Extracts entities from text by matching against the canonical entities map.
 * Returns an array of canonical entity names found in the text.
 */
export function extractEntities(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();

  // Sort keys by length descending so longer matches take priority
  const sortedKeys = Object.keys(CANONICAL_ENTITIES).sort(
    (a, b) => b.length - a.length
  );

  for (const alias of sortedKeys) {
    // Use word-boundary-aware matching: check that the alias is surrounded
    // by non-alphanumeric characters (or string boundaries)
    const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?<![a-z])${escapedAlias}(?![a-z])`, "i");
    if (pattern.test(lower)) {
      found.add(CANONICAL_ENTITIES[alias]);
    }
  }

  return Array.from(found);
}

/**
 * Converts a RawIntelligenceItem into a structured WorldEvent.
 */
export function structureEvent(raw: RawIntelligenceItem): WorldEvent {
  const id = generateEventId(raw.source, raw.timestamp);
  const geography = extractGeography(raw);
  const actors = extractActors(raw);
  const domain = CATEGORY_TO_DOMAIN[raw.category];
  const title = deriveTitle(raw.raw_text);

  return {
    id,
    title,
    description: raw.raw_text,
    timestamp: raw.timestamp,
    geography,
    actors,
    domain,
    source_urls: raw.source_url ? [raw.source_url] : undefined,
    raw_text: raw.raw_text,
  };
}

// ── Internal Helpers ──

function generateEventId(source: string, timestamp: string): string {
  const sourceSlug = source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const timeSlug = timestamp.replace(/[^0-9]/g, "").slice(0, 14);
  return `${sourceSlug}-${timeSlug}`;
}

function extractGeography(raw: RawIntelligenceItem): string[] {
  const found = new Set<string>(raw.geography);
  const text = raw.raw_text;

  for (const location of KNOWN_LOCATIONS) {
    if (text.toLowerCase().includes(location.toLowerCase())) {
      found.add(location);
    }
  }

  return Array.from(found);
}

function extractActors(raw: RawIntelligenceItem): string[] {
  const actors = new Set<string>();

  // Resolve entities from the entities[] array
  for (const entity of raw.entities) {
    actors.add(resolveEntity(entity));
  }

  // Extract additional entities from raw_text
  const textEntities = extractEntities(raw.raw_text);
  for (const entity of textEntities) {
    actors.add(entity);
  }

  return Array.from(actors);
}

function deriveTitle(text: string): string {
  // Take the first sentence or first 120 characters, whichever is shorter
  const firstSentence = text.split(/[.!?]\s/)[0];
  if (firstSentence.length <= 120) {
    return firstSentence;
  }
  return text.slice(0, 117) + "...";
}
