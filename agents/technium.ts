/**
 * SIOS — Technology Evolution Agent
 * Lens: Kevin Kelly's technium and evolutionary technology theory
 */

import { runAgent } from "./agent-runner.js";
import type { AgentConfig, WorldEvent, AgentAnalysis } from "../core/types.js";

export const config: AgentConfig = {
  key: "TECHNIUM",
  name: "Technology Evolution",
  thinker: "Kevin Kelly",
  coreQuestion: "What does technology WANT here? What is the evolutionary trajectory?",
};

export function analyze(event: WorldEvent, context?: string): Promise<AgentAnalysis> {
  return runAgent(config.key, event, context);
}
