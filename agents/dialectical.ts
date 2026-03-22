/**
 * SIOS — Political Form Analysis Agent
 * Lens: Dialectical theory of political-economic form transformation
 */

import { runAgent } from "./agent-runner.js";
import type { AgentConfig, WorldEvent, AgentAnalysis } from "../core/types.js";

export const config: AgentConfig = {
  key: "DIALECTICAL",
  name: "Political Form Analysis",
  thinker: "Dialectical Theory",
  coreQuestion: "What political-economic form is this event accelerating toward?",
};

export function analyze(event: WorldEvent, context?: string): Promise<AgentAnalysis> {
  return runAgent(config.key, event, context);
}
