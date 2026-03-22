/**
 * SIOS — Competitor Profile Registry
 *
 * Re-exports all competitor profiles and provides lookup utilities.
 */

import type { CompetitorProfile } from "../../core/types.js";

export { CHINA_PROFILE } from "./china.js";
export { RUSSIA_PROFILE } from "./russia.js";
export { IRAN_PROFILE } from "./iran.js";

import { CHINA_PROFILE } from "./china.js";
import { RUSSIA_PROFILE } from "./russia.js";
import { IRAN_PROFILE } from "./iran.js";

/** All registered competitor profiles. */
export const ALL_COMPETITOR_PROFILES: CompetitorProfile[] = [
  CHINA_PROFILE,
  RUSSIA_PROFILE,
  IRAN_PROFILE,
];

/** Look up a competitor profile by its short id (e.g. "PRC", "RUS", "IRN"). */
export function getProfileById(id: string): CompetitorProfile | undefined {
  return ALL_COMPETITOR_PROFILES.find((p) => p.id === id);
}
