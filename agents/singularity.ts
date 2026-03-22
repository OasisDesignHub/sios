/**
 * SIOS — Exponential Technology Agent
 * Lens: Ray Kurzweil's Law of Accelerating Returns and Singularity theory
 */

import { runAgent } from "./agent-runner.js";
import type { AgentConfig, WorldEvent, AgentAnalysis } from "../core/types.js";

export const config: AgentConfig = {
  key: "SINGULARITY",
  name: "Exponential Technology",
  thinker: "Ray Kurzweil",
  coreQuestion: "How does this affect the trajectory toward recursive self-improvement?",
};

export function analyze(event: WorldEvent, context?: string): Promise<AgentAnalysis> {
  return runAgent(config.key, event, context);
}
