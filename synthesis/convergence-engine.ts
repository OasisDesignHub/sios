/**
 * SIOS — Convergence Engine
 *
 * Heuristic analysis of agreement and disagreement across agent outputs.
 * Extracts keywords/themes from interpretations and groups agents by
 * thematic agreement. No LLM call required.
 */

import type { AgentAnalysis } from "../core/types.js";

// ── Types ──

export interface ConvergenceMatrix {
  convergent: string[];
  divergent: string[];
  outliers: Array<{ agent: string; insight: string }>;
}

// ── Internal helpers ──

/** Stopwords excluded from keyword extraction. */
const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "must",
  "and", "but", "or", "nor", "not", "so", "yet", "both", "either",
  "neither", "each", "every", "all", "any", "few", "more", "most",
  "other", "some", "such", "no", "only", "own", "same", "than",
  "too", "very", "just", "also", "even", "still",
  "of", "in", "to", "for", "with", "on", "at", "from", "by", "about",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "under", "over", "again", "further",
  "this", "that", "these", "those", "it", "its", "they", "them", "their",
  "what", "which", "who", "whom", "how", "when", "where", "why",
  "he", "she", "his", "her", "we", "our", "us", "you", "your",
  "if", "then", "because", "while", "although", "unless", "until",
]);

/**
 * Extract meaningful keyword tokens from a text string.
 * Returns lowercased words with length > 3 that are not stopwords.
 */
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

/**
 * Compute Jaccard similarity between two keyword sets.
 */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const word of a) {
    if (b.has(word)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// ── Thresholds ──

/** Minimum Jaccard similarity to consider two agents "in agreement". */
const CONVERGENCE_THRESHOLD = 0.15;

/** Minimum fraction of agent pairs that must agree for a theme to be convergent. */
const CONVERGENT_PAIR_RATIO = 0.4;

/** If an agent's avg similarity to all others falls below this, it is an outlier. */
const OUTLIER_SIMILARITY_CEILING = 0.08;

// ── Public API ──

/**
 * Analyze convergence, divergence, and outliers across agent outputs.
 *
 * Convergent signals: themes (keywords) that appear across a high proportion
 * of agents, indicating broad analytical agreement.
 *
 * Divergent zones: themes where agents split roughly evenly, indicating
 * strategic ambiguity that warrants human review.
 *
 * Outliers: individual agents whose interpretation is substantially different
 * from all others -- potential novel risks.
 */
export function analyzeConvergence(
  agentOutputs: Record<string, AgentAnalysis>,
): ConvergenceMatrix {
  const agentKeys = Object.keys(agentOutputs);
  if (agentKeys.length === 0) {
    return { convergent: [], divergent: [], outliers: [] };
  }

  // ── 1. Extract keywords per agent ──
  const agentKeywords = new Map<string, Set<string>>();
  for (const key of agentKeys) {
    const analysis = agentOutputs[key];
    const words = extractKeywords(analysis.interpretation);
    agentKeywords.set(key, new Set(words));
  }

  // ── 2. Build global keyword frequency map ──
  const keywordAgentCount = new Map<string, Set<string>>();
  for (const [agent, keywords] of agentKeywords) {
    for (const word of keywords) {
      if (!keywordAgentCount.has(word)) {
        keywordAgentCount.set(word, new Set());
      }
      keywordAgentCount.get(word)!.add(agent);
    }
  }

  const totalAgents = agentKeys.length;
  const convergent: string[] = [];
  const divergent: string[] = [];

  // ── 3. Classify themes by agent agreement ratio ──
  for (const [keyword, agents] of keywordAgentCount) {
    const ratio = agents.size / totalAgents;

    if (ratio >= CONVERGENT_PAIR_RATIO) {
      // Theme appears across many agents -- convergent signal
      convergent.push(keyword);
    } else if (ratio >= 0.2 && ratio < CONVERGENT_PAIR_RATIO) {
      // Theme appears in a meaningful minority -- divergent zone
      divergent.push(keyword);
    }
    // Below 0.2 ratio: too sparse to be meaningful as a divergence signal
  }

  // Deduplicate and sort convergent/divergent by frequency (descending)
  const sortByFrequency = (a: string, b: string): number => {
    const fa = keywordAgentCount.get(a)?.size ?? 0;
    const fb = keywordAgentCount.get(b)?.size ?? 0;
    return fb - fa;
  };
  convergent.sort(sortByFrequency);
  divergent.sort(sortByFrequency);

  // ── 4. Identify outlier agents ──
  const outliers: Array<{ agent: string; insight: string }> = [];

  for (const agent of agentKeys) {
    const myKeywords = agentKeywords.get(agent)!;
    let totalSimilarity = 0;
    let comparisons = 0;

    for (const other of agentKeys) {
      if (other === agent) continue;
      const otherKeywords = agentKeywords.get(other)!;
      totalSimilarity += jaccardSimilarity(myKeywords, otherKeywords);
      comparisons++;
    }

    const avgSimilarity = comparisons > 0 ? totalSimilarity / comparisons : 0;

    if (avgSimilarity < OUTLIER_SIMILARITY_CEILING) {
      // This agent sees something substantially different from all others
      const analysis = agentOutputs[agent];
      outliers.push({
        agent: analysis.lens || agent,
        insight: analysis.interpretation,
      });
    }
  }

  // Weight outliers by inverse confidence -- low confidence outliers are less notable
  outliers.sort((a, b) => {
    const confA = agentOutputs[a.agent]?.confidence ?? 0.5;
    const confB = agentOutputs[b.agent]?.confidence ?? 0.5;
    return confB - confA;
  });

  return { convergent, divergent, outliers };
}
