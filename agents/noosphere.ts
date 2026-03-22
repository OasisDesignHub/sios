/**
 * SIOS — Collective Consciousness Agent
 * Lens: Teilhard de Chardin's noosphere and Omega Point theory
 */

import { runAgent } from "./agent-runner.js";
import type { AgentConfig, WorldEvent, AgentAnalysis } from "../core/types.js";

export const config: AgentConfig = {
  key: "NOOSPHERE",
  name: "Collective Consciousness",
  thinker: "Teilhard de Chardin",
  coreQuestion: "Is collective consciousness integrating or fragmenting?",
};

export function analyze(event: WorldEvent, context?: string): Promise<AgentAnalysis> {
  return runAgent(config.key, event, context);
}
