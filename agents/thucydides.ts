/**
 * SIOS — Thucydides Trap Agent
 * Lens: Graham Allison's hegemonic transition theory
 */

import { runAgent } from "./agent-runner.js";
import type { AgentConfig, WorldEvent, AgentAnalysis } from "../core/types.js";

export const config: AgentConfig = {
  key: "THUCYDIDES",
  name: "Thucydides Trap",
  thinker: "Graham Allison",
  coreQuestion: "Is this a symptom of hegemonic transition anxiety?",
};

export function analyze(event: WorldEvent, context?: string): Promise<AgentAnalysis> {
  return runAgent(config.key, event, context);
}
