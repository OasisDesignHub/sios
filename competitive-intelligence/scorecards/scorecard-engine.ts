/**
 * SIOS — Scorecard Engine
 *
 * Maintains and updates competitive-position scorecards for the WE coalition
 * versus each competitor.  Agent analysis outputs are processed to derive
 * incremental score adjustments across the seven scorecard domains.
 */

import type {
  AgentAnalysis,
  CompetitorProfile,
  ScorecardDomain,
} from "../../core/types.js";
import type { WeDefinition } from "../we-definition.js";

// ── Public Types ──

export type ScorecardUpdate = Array<{
  competitorId: string;
  domain: ScorecardDomain;
  delta: number;
  reason: string;
}>;

export interface DomainNetAssessment {
  weScore: number;
  theyBestScore: number;
  gap: number;
}

export interface Scorecard {
  timestamp: string;
  we: WeDefinition;
  competitors: CompetitorProfile[];
  netAssessment: Record<ScorecardDomain, DomainNetAssessment>;
}

// ── Internal Constants ──

const ALL_DOMAINS: ScorecardDomain[] = [
  "military",
  "economic",
  "technology",
  "narrative",
  "alliance",
  "supply_chain",
  "demographic",
];

/**
 * Keywords that, when found in an agent interpretation, suggest relevance to
 * a particular scorecard domain.  Used for lightweight NLP-free signal
 * extraction.
 */
const DOMAIN_KEYWORDS: Record<ScorecardDomain, string[]> = {
  military: [
    "military", "naval", "missile", "defense", "army", "navy", "air force",
    "nuclear", "weapon", "war", "conflict", "A2/AD", "drone", "combat",
  ],
  economic: [
    "economic", "GDP", "trade", "tariff", "sanctions", "currency", "debt",
    "inflation", "BRI", "investment", "market", "export", "import",
  ],
  technology: [
    "technology", "semiconductor", "chip", "AI", "quantum", "cyber", "5G",
    "compute", "innovation", "R&D", "patent", "software", "hardware",
  ],
  narrative: [
    "narrative", "media", "propaganda", "disinformation", "influence",
    "public opinion", "soft power", "information warfare", "perception",
  ],
  alliance: [
    "alliance", "NATO", "treaty", "coalition", "partner", "SCO", "BRICS",
    "bilateral", "multilateral", "diplomatic", "diplomacy",
  ],
  supply_chain: [
    "supply chain", "rare earth", "shipping", "logistics", "chokepoint",
    "Hormuz", "Malacca", "port", "helium", "semiconductor supply",
    "manufacturing", "critical mineral",
  ],
  demographic: [
    "demographic", "population", "birth rate", "aging", "migration",
    "immigration", "workforce", "urbanization", "brain drain",
  ],
};

/** Baseline "WE" scores — a rough starting position for the coalition. */
const WE_BASELINE_SCORES: Record<ScorecardDomain, number> = {
  military: 8,
  economic: 8,
  technology: 8,
  narrative: 5,
  alliance: 7,
  supply_chain: 5,
  demographic: 3,
};

// ── Engine ──

export class ScorecardEngine {
  private we: WeDefinition;
  private competitors: CompetitorProfile[];
  private weAdjustments: Record<ScorecardDomain, number>;

  constructor(we: WeDefinition, competitors: CompetitorProfile[]) {
    this.we = we;
    this.competitors = competitors.map((c) => structuredClone(c));
    this.weAdjustments = {
      military: 0,
      economic: 0,
      technology: 0,
      narrative: 0,
      alliance: 0,
      supply_chain: 0,
      demographic: 0,
    };
  }

  // ── Public API ──

  /**
   * Process a set of agent analysis outputs and return incremental score
   * adjustments.  The engine looks for two signal types:
   *
   * 1. Explicit `competitive_update` fields in agent output.
   * 2. Keyword-based domain relevance in the agent interpretation text.
   */
  updateFromAnalysis(
    agentOutputs: Record<string, AgentAnalysis>,
  ): ScorecardUpdate {
    const updates: ScorecardUpdate = [];

    for (const [lens, analysis] of Object.entries(agentOutputs)) {
      // --- Explicit competitive updates ---
      const compUpdate = analysis["competitive_update"] as
        | Record<string, unknown>
        | undefined;

      if (compUpdate) {
        const extracted = this.extractExplicitUpdates(lens, compUpdate);
        updates.push(...extracted);
      }

      // --- Keyword-based domain signals ---
      const text = analysis.interpretation ?? "";
      const keywordUpdates = this.extractKeywordSignals(lens, text, analysis.confidence);
      updates.push(...keywordUpdates);
    }

    // Apply accumulated deltas
    for (const update of updates) {
      const competitor = this.competitors.find(
        (c) => c.id === update.competitorId,
      );
      if (competitor && competitor.domains[update.domain]) {
        competitor.domains[update.domain].score = clamp(
          competitor.domains[update.domain].score + update.delta,
          -10,
          10,
        );
      }
    }

    return updates;
  }

  /** Return the current scorecard snapshot. */
  getScorecard(): Scorecard {
    const netAssessment = {} as Record<ScorecardDomain, DomainNetAssessment>;

    for (const domain of ALL_DOMAINS) {
      const weScore = clamp(
        WE_BASELINE_SCORES[domain] + this.weAdjustments[domain],
        -10,
        10,
      );

      let theyBestScore = -10;
      for (const c of this.competitors) {
        const domainData = c.domains[domain];
        if (domainData && domainData.score > theyBestScore) {
          theyBestScore = domainData.score;
        }
      }

      netAssessment[domain] = {
        weScore,
        theyBestScore,
        gap: weScore - theyBestScore,
      };
    }

    return {
      timestamp: new Date().toISOString(),
      we: this.we,
      competitors: this.competitors,
      netAssessment,
    };
  }

  /** Identify the leader (WE or a named competitor) in a given domain. */
  getDomainLeader(
    domain: ScorecardDomain,
  ): { leader: string; score: number } {
    const weScore =
      WE_BASELINE_SCORES[domain] + this.weAdjustments[domain];

    let bestCompetitor = { leader: "WE", score: weScore };

    for (const c of this.competitors) {
      const domainData = c.domains[domain];
      if (domainData && domainData.score > bestCompetitor.score) {
        bestCompetitor = { leader: c.name, score: domainData.score };
      }
    }

    return bestCompetitor;
  }

  // ── Private Helpers ──

  private extractExplicitUpdates(
    lens: string,
    compUpdate: Record<string, unknown>,
  ): ScorecardUpdate {
    const updates: ScorecardUpdate = [];

    // Convention: competitive_update may contain per-competitor adjustments
    // shaped as { competitorId: { domain: delta } } or a flat
    // { domain: delta } that applies to the first competitor.
    for (const [key, value] of Object.entries(compUpdate)) {
      if (isDomain(key) && typeof value === "number") {
        // Flat format — apply to all competitors as a signal
        for (const c of this.competitors) {
          updates.push({
            competitorId: c.id,
            domain: key,
            delta: clamp(value, -2, 2),
            reason: `Explicit competitive_update from ${lens} agent`,
          });
        }
      } else if (typeof value === "object" && value !== null) {
        // Nested format — key is a competitor id
        const nested = value as Record<string, unknown>;
        for (const [dom, delta] of Object.entries(nested)) {
          if (isDomain(dom) && typeof delta === "number") {
            updates.push({
              competitorId: key,
              domain: dom,
              delta: clamp(delta, -2, 2),
              reason: `Explicit competitive_update from ${lens} agent`,
            });
          }
        }
      }
    }

    return updates;
  }

  private extractKeywordSignals(
    lens: string,
    text: string,
    confidence: number,
  ): ScorecardUpdate {
    const updates: ScorecardUpdate = [];
    const lowerText = text.toLowerCase();

    for (const domain of ALL_DOMAINS) {
      const keywords = DOMAIN_KEYWORDS[domain];
      const matchCount = keywords.filter((kw) =>
        lowerText.includes(kw.toLowerCase()),
      ).length;

      if (matchCount === 0) continue;

      // Scale the signal by match density and agent confidence
      const signal = Math.min(matchCount / keywords.length, 1.0);
      const rawDelta = signal * confidence * 0.5; // small incremental nudges

      // Determine direction from sentiment heuristics
      const negative = /declin|degrad|weaken|loss|threat|risk|crisis|fail/i.test(
        text,
      );
      const delta = negative ? -roundTo(rawDelta, 2) : roundTo(rawDelta, 2);

      if (Math.abs(delta) < 0.01) continue;

      // Attribute to competitors mentioned in the text
      for (const c of this.competitors) {
        const nameLower = c.name.toLowerCase();
        const idLower = c.id.toLowerCase();
        if (lowerText.includes(nameLower) || lowerText.includes(idLower)) {
          updates.push({
            competitorId: c.id,
            domain,
            delta: clamp(delta, -1, 1),
            reason: `Keyword signal from ${lens} agent (${matchCount} keyword hits in ${domain})`,
          });
        }
      }
    }

    return updates;
  }
}

// ── Utility Functions ──

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function isDomain(value: string): value is ScorecardDomain {
  return (ALL_DOMAINS as string[]).includes(value);
}
