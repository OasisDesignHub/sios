/**
 * SIOS — Flow Dynamics Agent
 * Lens: Adrian Bejan's Constructal Law of flow system evolution
 */

import { runAgent } from "./agent-runner.js";
import type { AgentConfig, WorldEvent, AgentAnalysis } from "../core/types.js";

export const config: AgentConfig = {
  key: "CONSTRUCTAL",
  name: "Flow Dynamics",
  thinker: "Adrian Bejan",
  coreQuestion: "How is flow being redirected, and what new channels will form?",
};

export function analyze(event: WorldEvent, context?: string): Promise<AgentAnalysis> {
  return runAgent(config.key, event, context);
}
