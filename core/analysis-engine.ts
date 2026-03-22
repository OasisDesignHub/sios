/**
 * SIOS — Core Analysis Engine
 * Routes events through all 12 perspective agents and synthesizes results
 */

import Anthropic from "@anthropic-ai/sdk";
import { AGENT_PROMPTS, SYNTHESIS_PROMPT } from "../agents/prompts/agent-prompts.js";
import type { WorldEvent, AgentAnalysis, SIOSAnalysis, SynthesisResult } from "./types.js";

export type { WorldEvent, AgentAnalysis, SIOSAnalysis };

const client = new Anthropic();

/**
 * Run a single agent analysis
 */
export async function runAgent(
  agentKey: string,
  event: WorldEvent,
  contextData?: string
): Promise<AgentAnalysis> {
  const systemPrompt = AGENT_PROMPTS[agentKey as keyof typeof AGENT_PROMPTS];
  
  if (!systemPrompt) {
    throw new Error(`Unknown agent: ${agentKey}`);
  }

  const userMessage = `ANALYZE THIS EVENT:

Title: ${event.title}
Time: ${event.timestamp}
Geography: ${event.geography.join(", ")}
Actors: ${event.actors.join(", ")}
Domain: ${event.domain}

Description:
${event.description}

${contextData ? `Additional Context:\n${contextData}` : ""}

Return your analysis as a valid JSON object matching your output format.
Be specific, analytical, and calibrated. Avoid vague language.`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`No JSON found in ${agentKey} response`);
    }

    return JSON.parse(jsonMatch[0]) as AgentAnalysis;
  } catch (error) {
    console.error(`Agent ${agentKey} failed:`, error);
    return {
      lens: agentKey,
      interpretation: `Analysis unavailable: ${error instanceof Error ? error.message : "Unknown error"}`,
      confidence: 0,
      error: true,
    };
  }
}

/**
 * Distill an agent output to the fields that matter for synthesis.
 * Keeps: lens, interpretation, confidence, plus up to 3 of the most
 * informative extra fields (arrays/strings only, truncated to 200 chars).
 */
function distillAgentOutput(output: AgentAnalysis): Record<string, unknown> {
  const keep: Record<string, unknown> = {
    lens: output.lens,
    interpretation: output.interpretation,
    confidence: output.confidence,
  };

  // Prioritised extra fields across all agent schemas
  const priorityKeys = [
    "scenarios",
    "watch_indicators",
    "key_miscalculation_risks",
    "competitive_update",
    "second_order_effects",
    "predicted_reroutings",
    "critical_nodes",
    "accelerated_trajectories",
    "fascism_indicators_present",
    "critical_threshold_indicators",
    "early_warning_signals",
    "implications",
    "time_horizon",
    "historical_parallel",
    "contrarian_finding",
    "shi_assessment",
    "compute_impact",
    "singularity_timeline_shift",
    "integration_vs_fragmentation",
    "phase_transition_proximity",
    "obstructed_flows",
  ];

  const baseKeys = new Set(["lens", "interpretation", "confidence", "error"]);
  let extras = 0;

  for (const key of priorityKeys) {
    if (extras >= 3) break;
    const val = output[key];
    if (val === undefined || val === null) continue;

    if (typeof val === "string") {
      keep[key] = val.length > 200 ? val.slice(0, 200) + "..." : val;
    } else if (Array.isArray(val)) {
      keep[key] = val.slice(0, 3);
    } else {
      keep[key] = val;
    }
    extras++;
  }

  // If we didn't find 3 priority keys, fill from remaining keys
  if (extras < 3) {
    for (const [key, val] of Object.entries(output)) {
      if (extras >= 3) break;
      if (baseKeys.has(key) || key in keep) continue;
      if (val === undefined || val === null) continue;

      if (typeof val === "string") {
        keep[key] = val.length > 200 ? val.slice(0, 200) + "..." : val;
      } else if (Array.isArray(val)) {
        keep[key] = val.slice(0, 3);
      } else {
        keep[key] = val;
      }
      extras++;
    }
  }

  return keep;
}

/**
 * Run synthesis across all agent outputs
 */
export async function runSynthesis(
  event: WorldEvent,
  agentOutputs: Record<string, AgentAnalysis>
): Promise<SynthesisResult> {
  const agentSummary = Object.entries(agentOutputs)
    .map(([key, output]) => `## ${key}\n${JSON.stringify(distillAgentOutput(output), null, 2)}`)
    .join("\n\n");

  const userMessage = `EVENT: ${event.title}
${event.description}

AGENT ANALYSES:
${agentSummary}

Produce a synthesis as a JSON code block (wrap in \`\`\`json and \`\`\` fences). Use this exact structure:
\`\`\`json
{
  "executive_brief": "3 paragraphs for a senior official",
  "convergence_signals": ["what multiple agents agree on"],
  "divergence_zones": ["where agents disagree — flag ambiguity"],
  "novel_risks": ["what single outlier agents see that others miss"],
  "scenarios": [
    {"label": "scenario name", "probability": 0.0-1.0, "timeframe": "90 days"}
  ],
  "watch_indicators": ["specific things to monitor"],
  "competitive_update": {
    "we_position": "US+allies position assessment",
    "they_position": "Adversary position assessment",
    "net_advantage_shift": "Who gained/lost competitive advantage"
  }
}
\`\`\`
Respond with ONLY the JSON code block. No other text.`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      system: SYNTHESIS_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    // Extract JSON from ```json ... ``` code block first
    const fenceMatch = content.text.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonStr: string;
    if (fenceMatch) {
      jsonStr = fenceMatch[1];
    } else {
      // Fallback: find outermost braces
      const braceStart = content.text.indexOf("{");
      const braceEnd = content.text.lastIndexOf("}");
      if (braceStart === -1 || braceEnd <= braceStart) {
        throw new Error("No synthesis JSON found");
      }
      jsonStr = content.text.slice(braceStart, braceEnd + 1);
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    return {
      executive_brief: `Synthesis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      convergence_signals: [],
      divergence_zones: [],
      novel_risks: [],
      scenarios: [],
      watch_indicators: [],
      competitive_update: {
        we_position: "Assessment unavailable",
        they_position: "Assessment unavailable",
        net_advantage_shift: "Unknown",
      },
    };
  }
}

/**
 * Full SIOS analysis: run all 12 agents in parallel, then synthesize
 */
export async function analyzeSIOSEvent(
  event: WorldEvent,
  agentsToRun?: string[],
  contextData?: string
): Promise<SIOSAnalysis> {
  const agents = agentsToRun || Object.keys(AGENT_PROMPTS);
  
  console.log(`🔍 SIOS: Analyzing "${event.title}" through ${agents.length} lenses...`);

  // Run all agents in parallel
  const agentPromises = agents.map(async (agentKey) => {
    console.log(`  → Running ${agentKey} agent...`);
    const result = await runAgent(agentKey, event, contextData);
    return [agentKey, result] as [string, AgentAnalysis];
  });

  const agentResults = await Promise.all(agentPromises);
  const agentOutputs = Object.fromEntries(agentResults);

  console.log(`✓ All agents complete. Running synthesis...`);

  // Run synthesis
  const synthesis = await runSynthesis(event, agentOutputs);

  console.log(`✓ SIOS analysis complete for: ${event.title}`);

  return {
    event,
    agent_outputs: agentOutputs,
    synthesis,
    timestamp: new Date().toISOString(),
  };
}

/**
 * WORKED EXAMPLE: The Hormuz → Helium → Chips → AI chain
 */
export const HORMUZ_EXAMPLE_EVENT: WorldEvent = {
  id: "US-IR-STRIKE-2026-01",
  title: "US Military Strike on Iranian Nuclear Facilities",
  description: `United States Air Force and Navy assets have conducted strikes on Iranian nuclear 
enrichment facilities at Natanz and Fordow. Iran has declared a state of emergency and the 
Islamic Revolutionary Guard Corps (IRGC) has issued warnings about consequences for regional 
shipping. The Strait of Hormuz has seen increased IRGC naval activity. 

Approximately 20% of global oil and LNG transits through the strait daily. US helium 
production from natural gas fields in Qatar and the Gulf region represents approximately 
30% of global supply. Semiconductor manufacturers require helium for chip cooling during 
manufacturing — a sustained shortage would affect yields at TSMC, Samsung, and Intel fabs.
Current AI training cluster deployments require 8-12 months of lead time for chip procurement.`,
  timestamp: new Date().toISOString(),
  geography: ["Iran", "Persian Gulf", "Strait of Hormuz", "Middle East", "Global"],
  actors: ["United States", "Iran", "IRGC", "Saudi Arabia", "China", "Russia", "TSMC", "Taiwan"],
  domain: "military",
};
