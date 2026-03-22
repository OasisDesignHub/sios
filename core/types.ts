/**
 * SIOS — Shared Type Definitions
 */

// ── Event Types ──

export interface WorldEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  geography: string[];
  actors: string[];
  domain: EventDomain;
  source_urls?: string[];
  raw_text?: string;
}

export type EventDomain =
  | "military"
  | "economic"
  | "political"
  | "technological"
  | "informational";

// ── Agent Types ──

export interface AgentAnalysis {
  lens: string;
  interpretation: string;
  confidence: number;
  [key: string]: unknown;
}

export type AgentKey =
  | "THUCYDIDES"
  | "LEE_KUAN_YEW"
  | "STONES"
  | "NETWAR"
  | "TECHNIUM"
  | "EURASIAN"
  | "NET_ASSESSMENT"
  | "SINGULARITY"
  | "NOOSPHERE"
  | "EMERGENCE"
  | "CONSTRUCTAL"
  | "DIALECTICAL";

export interface AgentConfig {
  key: AgentKey;
  name: string;
  thinker: string;
  coreQuestion: string;
}

// ── Synthesis Types ──

export interface Scenario {
  label: string;
  probability: number;
  timeframe: string;
}

export interface CompetitiveUpdate {
  we_position: string;
  they_position: string;
  net_advantage_shift: string;
}

export interface SynthesisResult {
  executive_brief: string;
  convergence_signals: string[];
  divergence_zones: string[];
  novel_risks: string[];
  scenarios: Scenario[];
  watch_indicators: string[];
  competitive_update: CompetitiveUpdate;
}

export interface SIOSAnalysis {
  event: WorldEvent;
  agent_outputs: Record<string, AgentAnalysis>;
  synthesis: SynthesisResult;
  timestamp: string;
}

// ── Ingestion Types ──

export type IngestionCategory =
  | "geopolitical"
  | "military"
  | "economic"
  | "technology"
  | "narrative"
  | "osint";

export interface RawIntelligenceItem {
  source: string;
  timestamp: string;
  geography: string[];
  entities: string[];
  raw_text: string;
  category: IngestionCategory;
  confidence: number;
  source_url?: string;
}

// ── Competitive Intelligence Types ──

export interface CompetitorProfile {
  id: string;
  name: string;
  designation: "primary" | "secondary" | "non-state";
  domains: Record<string, DomainAssessment>;
}

export interface DomainAssessment {
  score: number; // -10 to +10
  trend: "improving" | "stable" | "declining";
  key_factors: string[];
}

export type ScorecardDomain =
  | "military"
  | "economic"
  | "technology"
  | "narrative"
  | "alliance"
  | "supply_chain"
  | "demographic";

// ── Causal Chain Types ──

export interface CausalNode {
  id: string;
  entity: string;
  action: string;
  effect: string;
}

export interface CausalEdge {
  from: string;
  to: string;
  relation: "damages" | "disrupts" | "signals" | "threatens" | "enables" | "blocks";
}

export interface CausalChain {
  event_id: string;
  nodes: CausalNode[];
  edges: CausalEdge[];
}
