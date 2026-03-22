/**
 * SIOS — Go/Wei Qi Strategy Agent
 * Lens: David Lai's positional/shi strategic analysis
 */

import { runAgent } from "./agent-runner.js";
import type { AgentConfig, WorldEvent, AgentAnalysis } from "../core/types.js";

export const config: AgentConfig = {
  key: "STONES",
  name: "Go/Wei Qi Strategy",
  thinker: "David Lai",
  coreQuestion: "Who is building structural position vs. who is making tactical moves?",
};

export function analyze(event: WorldEvent, context?: string): Promise<AgentAnalysis> {
  return runAgent(config.key, event, context);
}
