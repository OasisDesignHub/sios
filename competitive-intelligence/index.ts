/**
 * SIOS — Competitive Intelligence Module
 *
 * Re-exports all competitive-intelligence primitives: WE definition,
 * competitor profiles, and the scorecard engine.
 */

// ── WE Definition ──
export {
  DEFAULT_WE,
  getWeDescription,
} from "./we-definition.js";
export type { WeDefinition } from "./we-definition.js";

// ── Competitor Profiles ──
export {
  CHINA_PROFILE,
  RUSSIA_PROFILE,
  IRAN_PROFILE,
  ALL_COMPETITOR_PROFILES,
  getProfileById,
} from "./they-profiles/index.js";

// ── Scorecard Engine ──
export { ScorecardEngine } from "./scorecards/scorecard-engine.js";
export type {
  ScorecardUpdate,
  Scorecard,
  DomainNetAssessment,
} from "./scorecards/scorecard-engine.js";
