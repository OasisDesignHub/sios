/**
 * SIOS — Eurasian Geopolitics Agent
 * Lens: Aleksandr Dugin's civilizational geopolitics (adversary modeling)
 */

import { runAgent } from "./agent-runner.js";
import type { AgentConfig, WorldEvent, AgentAnalysis } from "../core/types.js";

export const config: AgentConfig = {
  key: "EURASIAN",
  name: "Eurasian Geopolitics",
  thinker: "Aleksandr Dugin",
  coreQuestion: "How does this serve or threaten Eurasian civilizational sovereignty?",
};

export function analyze(event: WorldEvent, context?: string): Promise<AgentAnalysis> {
  return runAgent(config.key, event, context);
}
