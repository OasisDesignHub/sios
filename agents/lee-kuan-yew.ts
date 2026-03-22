/**
 * SIOS — Singaporean Realism Agent
 * Lens: Lee Kuan Yew's pragmatic small-state geopolitics
 */

import { runAgent } from "./agent-runner.js";
import type { AgentConfig, WorldEvent, AgentAnalysis } from "../core/types.js";

export const config: AgentConfig = {
  key: "LEE_KUAN_YEW",
  name: "Singaporean Realism",
  thinker: "Lee Kuan Yew",
  coreQuestion: "What does this mean for small/middle powers caught between giants?",
};

export function analyze(event: WorldEvent, context?: string): Promise<AgentAnalysis> {
  return runAgent(config.key, event, context);
}
