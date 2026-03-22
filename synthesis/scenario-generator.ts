/**
 * SIOS — Scenario Generator
 *
 * Extracts scenario objects from agent outputs, merges similar scenarios
 * by label similarity, and produces a weighted probability list.
 */

import type { AgentAnalysis, Scenario } from "../core/types.js";

// ── Internal helpers ──

/**
 * Extract scenario-like objects from an agent's arbitrary output fields.
 * Agents may embed scenarios under various keys; this checks all top-level
 * values that look like scenario arrays or single scenario objects.
 */
function extractScenariosFromAgent(
  agentKey: string,
  analysis: AgentAnalysis,
): Array<Scenario & { sourceConfidence: number }> {
  const results: Array<Scenario & { sourceConfidence: number }> = [];
  const confidence = typeof analysis.confidence === "number" ? analysis.confidence : 0.5;

  for (const [key, value] of Object.entries(analysis)) {
    // Skip known non-scenario fields
    if (["lens", "interpretation", "confidence"].includes(key)) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (isScenarioLike(item)) {
          results.push({
            label: String(item.label),
            probability: normalizedProbability(item.probability),
            timeframe: String(item.timeframe ?? "unknown"),
            sourceConfidence: confidence,
          });
        }
      }
    } else if (value !== null && typeof value === "object" && isScenarioLike(value)) {
      results.push({
        label: String((value as Record<string, unknown>).label),
        probability: normalizedProbability((value as Record<string, unknown>).probability),
        timeframe: String((value as Record<string, unknown>).timeframe ?? "unknown"),
        sourceConfidence: confidence,
      });
    }
  }

  return results;
}

/**
 * Type guard: does this object look like a scenario?
 * Requires at minimum a `label` and `probability`.
 */
function isScenarioLike(obj: unknown): obj is Record<string, unknown> {
  if (obj === null || typeof obj !== "object") return false;
  const rec = obj as Record<string, unknown>;
  return (
    typeof rec.label === "string" &&
    rec.label.length > 0 &&
    (typeof rec.probability === "number" || typeof rec.probability === "string")
  );
}

/**
 * Normalize a probability value to 0-1 range.
 * Handles percentages (0-100) and string representations.
 */
function normalizedProbability(raw: unknown): number {
  let num: number;
  if (typeof raw === "number") {
    num = raw;
  } else if (typeof raw === "string") {
    num = parseFloat(raw);
  } else {
    return 0.5; // fallback
  }
  if (Number.isNaN(num)) return 0.5;
  // If > 1, assume it's a percentage
  if (num > 1) num = num / 100;
  return Math.max(0, Math.min(1, num));
}

/**
 * Compute normalized bigram set from a label for fuzzy matching.
 */
function labelBigrams(label: string): Set<string> {
  const normalized = label.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const bigrams = new Set<string>();
  for (let i = 0; i < normalized.length - 1; i++) {
    bigrams.add(normalized.substring(i, i + 2));
  }
  return bigrams;
}

/**
 * Dice coefficient similarity between two strings using bigrams.
 * Returns 0-1 where 1 is identical.
 */
function labelSimilarity(a: string, b: string): number {
  const bigramsA = labelBigrams(a);
  const bigramsB = labelBigrams(b);
  if (bigramsA.size === 0 && bigramsB.size === 0) return 1;
  if (bigramsA.size === 0 || bigramsB.size === 0) return 0;

  let intersection = 0;
  for (const bg of bigramsA) {
    if (bigramsB.has(bg)) intersection++;
  }
  return (2 * intersection) / (bigramsA.size + bigramsB.size);
}

/** Similarity threshold above which two scenario labels are considered "the same". */
const MERGE_THRESHOLD = 0.45;

// ── Merge bucket ──

interface ScenarioBucket {
  label: string;
  timeframe: string;
  entries: Array<{ probability: number; weight: number }>;
}

// ── Public API ──

/**
 * Generate weighted, merged scenarios from all agent outputs.
 *
 * 1. Extract scenario objects from every agent's JSON output.
 * 2. Merge scenarios with similar labels (Dice coefficient > threshold).
 * 3. Average probabilities weighted by source agent confidence.
 * 4. Return sorted by probability descending.
 */
export function generateScenarios(
  agentOutputs: Record<string, AgentAnalysis>,
): Scenario[] {
  // ── 1. Collect all raw scenarios ──
  const rawScenarios: Array<Scenario & { sourceConfidence: number }> = [];

  for (const [agentKey, analysis] of Object.entries(agentOutputs)) {
    const extracted = extractScenariosFromAgent(agentKey, analysis);
    rawScenarios.push(...extracted);
  }

  if (rawScenarios.length === 0) {
    return [];
  }

  // ── 2. Merge similar scenarios into buckets ──
  const buckets: ScenarioBucket[] = [];

  for (const scenario of rawScenarios) {
    let merged = false;

    for (const bucket of buckets) {
      if (labelSimilarity(bucket.label, scenario.label) >= MERGE_THRESHOLD) {
        bucket.entries.push({
          probability: scenario.probability,
          weight: scenario.sourceConfidence,
        });
        // Keep the longer (more descriptive) label
        if (scenario.label.length > bucket.label.length) {
          bucket.label = scenario.label;
        }
        // Keep the more specific timeframe
        if (bucket.timeframe === "unknown" && scenario.timeframe !== "unknown") {
          bucket.timeframe = scenario.timeframe;
        }
        merged = true;
        break;
      }
    }

    if (!merged) {
      buckets.push({
        label: scenario.label,
        timeframe: scenario.timeframe,
        entries: [
          {
            probability: scenario.probability,
            weight: scenario.sourceConfidence,
          },
        ],
      });
    }
  }

  // ── 3. Compute weighted average probability per bucket ──
  const results: Scenario[] = buckets.map((bucket) => {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const entry of bucket.entries) {
      weightedSum += entry.probability * entry.weight;
      totalWeight += entry.weight;
    }

    const avgProbability = totalWeight > 0 ? weightedSum / totalWeight : 0.5;

    return {
      label: bucket.label,
      probability: Math.round(avgProbability * 1000) / 1000, // 3 decimal places
      timeframe: bucket.timeframe,
    };
  });

  // ── 4. Sort by probability descending ──
  results.sort((a, b) => b.probability - a.probability);

  return results;
}
