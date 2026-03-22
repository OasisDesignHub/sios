/**
 * SIOS — Complex Systems Agent
 * Lens: Emergence, phase transitions, and self-organization theory
 */

import { runAgent } from "./agent-runner.js";
import type { AgentConfig, WorldEvent, AgentAnalysis } from "../core/types.js";

export const config: AgentConfig = {
  key: "EMERGENCE",
  name: "Complex Systems",
  thinker: "Complex Systems Theory",
  coreQuestion: "What higher-order functions are appearing from lower-order interactions?",
};

export function analyze(event: WorldEvent, context?: string): Promise<AgentAnalysis> {
  return runAgent(config.key, event, context);
}
