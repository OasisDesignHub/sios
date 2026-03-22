/**
 * SIOS — Narrative Synthesizer
 *
 * Produces the final SynthesisResult by calling Claude with all agent
 * outputs and the SYNTHESIS_PROMPT system instruction.
 */

import Anthropic from "@anthropic-ai/sdk";
import { SYNTHESIS_PROMPT } from "../agents/prompts/agent-prompts.js";
import type {
  WorldEvent,
  AgentAnalysis,
  SynthesisResult,
  CompetitiveUpdate,
} from "../core/types.js";

// ── Constants ──

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 4096;

// ── Internal helpers ──

/**
 * Distill an agent output to interpretation + up to 3 priority fields.
 * Keeps token count manageable so the synthesis prompt doesn't exceed limits.
 */
function distillAgentOutput(output: AgentAnalysis): Record<string, unknown> {
  const keep: Record<string, unknown> = {
    lens: output.lens,
    interpretation: output.interpretation,
    confidence: output.confidence,
  };

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
 * Format all agent outputs into a structured prompt block for the LLM.
 * Each output is distilled to interpretation + 3 priority fields to avoid
 * exceeding context limits.
 */
function formatAgentOutputs(
  agentOutputs: Record<string, AgentAnalysis>,
): string {
  const sections: string[] = [];

  for (const [agentKey, analysis] of Object.entries(agentOutputs)) {
    const distilled = distillAgentOutput(analysis);
    sections.push(
      `=== ${agentKey} (confidence: ${analysis.confidence}) ===\n${JSON.stringify(distilled, null, 2)}`,
    );
  }

  return sections.join("\n\n");
}

/**
 * Build the user message that combines the event context and agent outputs.
 */
function buildUserMessage(
  event: WorldEvent,
  agentOutputs: Record<string, AgentAnalysis>,
): string {
  return `WORLD EVENT:
${JSON.stringify(event, null, 2)}

AGENT ANALYSES (${Object.keys(agentOutputs).length} perspectives):

${formatAgentOutputs(agentOutputs)}

Produce your synthesis as a single JSON object with this exact structure:
{
  "executive_brief": "3-paragraph strategic summary",
  "convergence_signals": ["signal1", "signal2", ...],
  "divergence_zones": ["zone1", "zone2", ...],
  "novel_risks": ["risk1", "risk2", ...],
  "scenarios": [
    { "label": "scenario name", "probability": 0.0-1.0, "timeframe": "time range" }
  ],
  "watch_indicators": ["indicator1", "indicator2", ...],
  "competitive_update": {
    "we_position": "US/allied position assessment",
    "they_position": "Competitor position assessment",
    "net_advantage_shift": "Who gained/lost and how"
  }
}

Respond with ONLY a JSON code block — wrap the JSON in \`\`\`json and \`\`\` fences. No other text.`;
}

/**
 * Parse a raw LLM response string into a SynthesisResult.
 * Handles JSON extraction from potentially wrapped responses.
 */
function parseSynthesisResponse(raw: string): SynthesisResult {
  // Extract JSON from ```json ... ``` code block first
  const fenceMatch = raw.match(/```json\s*([\s\S]*?)\s*```/);
  let cleaned: string;
  if (fenceMatch) {
    cleaned = fenceMatch[1];
  } else {
    // Fallback: strip leading/trailing fences or find outermost braces
    cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }
    // If still not clean JSON, extract first complete object
    const braceStart = cleaned.indexOf("{");
    const braceEnd = cleaned.lastIndexOf("}");
    if (braceStart !== -1 && braceEnd > braceStart) {
      cleaned = cleaned.slice(braceStart, braceEnd + 1);
    }
  }

  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  // Validate and coerce to SynthesisResult
  return {
    executive_brief: String(parsed.executive_brief ?? ""),
    convergence_signals: asStringArray(parsed.convergence_signals),
    divergence_zones: asStringArray(parsed.divergence_zones),
    novel_risks: asStringArray(parsed.novel_risks),
    scenarios: asScenarioArray(parsed.scenarios),
    watch_indicators: asStringArray(parsed.watch_indicators),
    competitive_update: asCompetitiveUpdate(parsed.competitive_update),
  };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v));
}

function asScenarioArray(
  value: unknown,
): Array<{ label: string; probability: number; timeframe: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (v) =>
        v !== null &&
        typeof v === "object" &&
        "label" in (v as Record<string, unknown>),
    )
    .map((v) => {
      const obj = v as Record<string, unknown>;
      return {
        label: String(obj.label ?? ""),
        probability: Number(obj.probability ?? 0.5),
        timeframe: String(obj.timeframe ?? "unknown"),
      };
    });
}

function asCompetitiveUpdate(value: unknown): CompetitiveUpdate {
  if (value === null || typeof value !== "object") {
    return {
      we_position: "Unable to assess",
      they_position: "Unable to assess",
      net_advantage_shift: "Indeterminate",
    };
  }
  const obj = value as Record<string, unknown>;
  return {
    we_position: String(obj.we_position ?? "Unable to assess"),
    they_position: String(obj.they_position ?? "Unable to assess"),
    net_advantage_shift: String(obj.net_advantage_shift ?? "Indeterminate"),
  };
}

/**
 * Build a graceful fallback SynthesisResult when the LLM call fails.
 */
function buildFallbackSynthesis(
  event: WorldEvent,
  agentOutputs: Record<string, AgentAnalysis>,
  error: unknown,
): SynthesisResult {
  const agentCount = Object.keys(agentOutputs).length;
  const errorMessage =
    error instanceof Error ? error.message : String(error);

  return {
    executive_brief:
      `Automated synthesis failed for event "${event.title}". ` +
      `${agentCount} agent analyses were collected but the narrative synthesis ` +
      `could not be completed. Error: ${errorMessage}. ` +
      `Manual review of individual agent outputs is recommended.`,
    convergence_signals: [],
    divergence_zones: [],
    novel_risks: [
      `Synthesis engine failure — agent outputs available but unintegrated`,
    ],
    scenarios: [],
    watch_indicators: [],
    competitive_update: {
      we_position: "Assessment unavailable due to synthesis failure",
      they_position: "Assessment unavailable due to synthesis failure",
      net_advantage_shift: "Indeterminate — manual review required",
    },
  };
}

// ── Public API ──

/**
 * Produce a full SynthesisResult by sending all agent outputs to Claude
 * for narrative integration.
 *
 * On failure, returns a graceful fallback synthesis that flags the error
 * while preserving operability of downstream consumers.
 */
export async function synthesize(
  event: WorldEvent,
  agentOutputs: Record<string, AgentAnalysis>,
): Promise<SynthesisResult> {
  try {
    const client = new Anthropic();

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYNTHESIS_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserMessage(event, agentOutputs),
        },
      ],
    });

    // Extract text content from the response
    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in Claude response");
    }

    return parseSynthesisResponse(textBlock.text);
  } catch (error) {
    console.error("[narrative-synthesizer] Synthesis failed:", error);
    return buildFallbackSynthesis(event, agentOutputs, error);
  }
}
