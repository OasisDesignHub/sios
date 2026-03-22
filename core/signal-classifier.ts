/**
 * SIOS — Signal Classifier
 *
 * Classifies world events as signal vs. noise based on actor importance,
 * geographic significance, domain, and actor count. Produces a scored
 * classification with tier assignment.
 */

import type { WorldEvent } from "./types.js";

// ── Types ──

export interface SignalClassification {
  score: number;
  tier: "critical" | "high" | "medium" | "low" | "noise";
  factors: string[];
}

// ── Reference Lists ──

export const GREAT_POWERS: string[] = [
  "United States",
  "China",
  "Russia",
  "European Union",
  "NATO",
];

const REGIONAL_POWERS: string[] = [
  "Iran",
  "India",
  "Japan",
  "South Korea",
  "Turkey",
  "Saudi Arabia",
  "Israel",
  "Pakistan",
  "Brazil",
  "Australia",
  "United Kingdom",
  "France",
  "Germany",
  "Indonesia",
  "Egypt",
  "Nigeria",
  "South Africa",
];

const NON_STATE_ACTORS: string[] = [
  "IRGC",
  "Hezbollah",
  "Hamas",
  "Wagner Group",
  "TSMC",
  "Samsung",
  "Intel",
  "OPEC",
  "OPEC+",
];

export const STRATEGIC_CHOKEPOINTS: string[] = [
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
];

export const CONTESTED_REGIONS: string[] = [
  "Taiwan",
  "Ukraine",
  "Donbas",
  "Crimea",
  "Kashmir",
  "Golan Heights",
  "Aksai Chin",
  "Arunachal Pradesh",
  "Spratly Islands",
  "Paracel Islands",
  "Senkaku Islands",
  "Kuril Islands",
  "South China Sea",
  "Korean Peninsula",
  "North Korea",
  "Syria",
  "Yemen",
  "Libya",
];

// ── Classification Logic ──

/**
 * Classifies a WorldEvent as signal or noise.
 *
 * Scoring factors:
 *   - Actor importance: great powers +3, regional powers +2, non-state +1
 *   - Geography: strategic chokepoints +3, contested regions +2
 *   - Domain: military +2, economic +1
 *   - Actor count: 3+ actors → +1, 5+ actors → +2
 *
 * Tiers:
 *   critical >= 8, high >= 6, medium >= 4, low >= 2, noise < 2
 */
export function classifySignal(event: WorldEvent): SignalClassification {
  let score = 0;
  const factors: string[] = [];

  // ── Actor importance ──
  const actorScore = scoreActors(event.actors, factors);
  score += actorScore;

  // ── Geography significance ──
  const geoScore = scoreGeography(event.geography, factors);
  score += geoScore;

  // ── Domain scoring ──
  if (event.domain === "military") {
    score += 2;
    factors.push("military domain (+2)");
  } else if (event.domain === "economic") {
    score += 1;
    factors.push("economic domain (+1)");
  }

  // ── Actor count ──
  if (event.actors.length >= 5) {
    score += 2;
    factors.push(`multi-actor event: ${event.actors.length} actors (+2)`);
  } else if (event.actors.length >= 3) {
    score += 1;
    factors.push(`multi-actor event: ${event.actors.length} actors (+1)`);
  }

  const tier = scoreToTier(score);

  return { score, tier, factors };
}

// ── Internal Helpers ──

function scoreActors(actors: string[], factors: string[]): number {
  let maxScore = 0;

  for (const actor of actors) {
    if (GREAT_POWERS.includes(actor)) {
      if (maxScore < 3) maxScore = 3;
      factors.push(`great power actor: ${actor} (+3)`);
    } else if (REGIONAL_POWERS.includes(actor)) {
      if (maxScore < 2) maxScore = 2;
      factors.push(`regional power actor: ${actor} (+2)`);
    } else if (NON_STATE_ACTORS.includes(actor)) {
      if (maxScore < 1) maxScore = 1;
      factors.push(`non-state actor: ${actor} (+1)`);
    }
  }

  return maxScore;
}

function scoreGeography(geography: string[], factors: string[]): number {
  let maxScore = 0;

  for (const location of geography) {
    if (STRATEGIC_CHOKEPOINTS.includes(location)) {
      if (maxScore < 3) maxScore = 3;
      factors.push(`strategic chokepoint: ${location} (+3)`);
    } else if (CONTESTED_REGIONS.includes(location)) {
      if (maxScore < 2) maxScore = 2;
      factors.push(`contested region: ${location} (+2)`);
    }
  }

  return maxScore;
}

function scoreToTier(
  score: number
): "critical" | "high" | "medium" | "low" | "noise" {
  if (score >= 8) return "critical";
  if (score >= 6) return "high";
  if (score >= 4) return "medium";
  if (score >= 2) return "low";
  return "noise";
}
