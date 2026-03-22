/**
 * SIOS — Network Warfare Agent
 * Lens: John Arquilla's netwar and swarming doctrine
 */

import { runAgent } from "./agent-runner.js";
import type { AgentConfig, WorldEvent, AgentAnalysis } from "../core/types.js";

export const config: AgentConfig = {
  key: "NETWAR",
  name: "Network Warfare",
  thinker: "John Arquilla",
  coreQuestion: "How is network structure determining this conflict's outcome?",
};

export function analyze(event: WorldEvent, context?: string): Promise<AgentAnalysis> {
  return runAgent(config.key, event, context);
}
