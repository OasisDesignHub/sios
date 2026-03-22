/**
 * SIOS — Net Assessment Agent
 * Lens: Andrew Marshall's long-range competitive assessment
 */

import { runAgent } from "./agent-runner.js";
import type { AgentConfig, WorldEvent, AgentAnalysis } from "../core/types.js";

export const config: AgentConfig = {
  key: "NET_ASSESSMENT",
  name: "Net Assessment",
  thinker: "Andrew Marshall",
  coreQuestion: "Who has competitive advantage across the long-term competition?",
};

export function analyze(event: WorldEvent, context?: string): Promise<AgentAnalysis> {
  return runAgent(config.key, event, context);
}
