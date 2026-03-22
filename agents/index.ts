/**
 * SIOS — Agents Index
 * Re-exports all agent modules, the shared runner, and an ALL_AGENTS registry.
 */

export { runAgent } from "./agent-runner.js";

export * as thucydides from "./thucydides.js";
export * as leeKuanYew from "./lee-kuan-yew.js";
export * as stones from "./stones.js";
export * as netwar from "./netwar.js";
export * as technium from "./technium.js";
export * as eurasian from "./eurasian.js";
export * as netAssessment from "./net-assessment.js";
export * as singularity from "./singularity.js";
export * as noosphere from "./noosphere.js";
export * as emergence from "./emergence.js";
export * as constructal from "./constructal.js";
export * as dialectical from "./dialectical.js";

import { config as thucydidesConfig } from "./thucydides.js";
import { config as leeKuanYewConfig } from "./lee-kuan-yew.js";
import { config as stonesConfig } from "./stones.js";
import { config as netwarConfig } from "./netwar.js";
import { config as techniumConfig } from "./technium.js";
import { config as eurasianConfig } from "./eurasian.js";
import { config as netAssessmentConfig } from "./net-assessment.js";
import { config as singularityConfig } from "./singularity.js";
import { config as noosphereConfig } from "./noosphere.js";
import { config as emergenceConfig } from "./emergence.js";
import { config as constructalConfig } from "./constructal.js";
import { config as dialecticalConfig } from "./dialectical.js";

import type { AgentConfig } from "../core/types.js";

export const ALL_AGENTS: AgentConfig[] = [
  thucydidesConfig,
  leeKuanYewConfig,
  stonesConfig,
  netwarConfig,
  techniumConfig,
  eurasianConfig,
  netAssessmentConfig,
  singularityConfig,
  noosphereConfig,
  emergenceConfig,
  constructalConfig,
  dialecticalConfig,
];
