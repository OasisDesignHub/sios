/**
 * SIOS — Agent Runner
 * Shared harness that runs any single perspective agent through the Claude API.
 */

import Anthropic from "@anthropic-ai/sdk";
import { AGENT_PROMPTS } from "./prompts/agent-prompts.js";
import type { WorldEvent, AgentAnalysis, AgentKey } from "../core/types.js";

const client = new Anthropic();

/**
 * Format a WorldEvent into a structured user message for the agent.
 */
function formatEventMessage(event: WorldEvent, contextData?: string): string {
  const lines: string[] = [
    `EVENT ANALYSIS REQUEST`,
    `======================`,
    `Title: ${event.title}`,
    `ID: ${event.id}`,
    `Timestamp: ${event.timestamp}`,
    `Domain: ${event.domain}`,
    `Geography: ${event.geography.join(", ")}`,
    `Actors: ${event.actors.join(", ")}`,
    ``,
    `Description:`,
    event.description,
  ];

  if (event.raw_text) {
    lines.push("", "Raw Source Text:", event.raw_text);
  }

  if (event.source_urls && event.source_urls.length > 0) {
    lines.push("", "Source URLs:", ...event.source_urls.map((u) => `  - ${u}`));
  }

  if (contextData) {
    lines.push("", "ADDITIONAL CONTEXT:", contextData);
  }

  lines.push(
    "",
    "Analyze this event through your specific lens. Respond with valid JSON only."
  );

  return lines.join("\n");
}

/**
 * Run a single perspective agent against a world event.
 *
 * @param agentKey - Which agent lens to use (e.g. "THUCYDIDES", "NETWAR")
 * @param event    - The structured world event to analyze
 * @param contextData - Optional additional context (e.g. prior analyses, background)
 * @returns Parsed AgentAnalysis, or a graceful fallback on error
 */
export async function runAgent(
  agentKey: AgentKey,
  event: WorldEvent,
  contextData?: string
): Promise<AgentAnalysis> {
  const systemPrompt = AGENT_PROMPTS[agentKey];
  if (!systemPrompt) {
    return {
      lens: agentKey,
      interpretation: `Error: No prompt defined for agent "${agentKey}".`,
      confidence: 0,
      error: true,
    };
  }

  const userMessage = formatEventMessage(event, contextData);

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    // Extract text content from the response
    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return {
        lens: agentKey,
        interpretation: "Error: No text content in API response.",
        confidence: 0,
        error: true,
      };
    }

    const rawText = textBlock.text.trim();

    // Parse JSON — handle possible markdown code fences
    let jsonStr = rawText;
    const fenceMatch = rawText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr) as AgentAnalysis;

    // Ensure the lens field is set correctly
    parsed.lens = agentKey;

    return parsed;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error(`[SIOS] Agent ${agentKey} failed: ${message}`);
    return {
      lens: agentKey,
      interpretation: `Agent ${agentKey} encountered an error: ${message}`,
      confidence: 0,
      error: true,
    };
  }
}
