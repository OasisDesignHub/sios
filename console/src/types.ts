// =============================================================================
// SIOS Console Types — Aligned with backend API responses
// =============================================================================

// ── Backend-native types (match core/types.ts) ──

export type EventDomain =
  | 'military'
  | 'economic'
  | 'political'
  | 'technological'
  | 'informational';

export interface WorldEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  geography: string[];
  actors: string[];
  domain: EventDomain;
  source_urls?: string[];
}

export interface AgentAnalysis {
  lens: string;
  interpretation: string;
  confidence: number;
  error?: boolean;
  [key: string]: unknown;
}

export interface Scenario {
  label: string;
  probability: number;
  timeframe: string;
}

export interface SynthesisResult {
  executive_brief: string;
  convergence_signals: string[];
  divergence_zones: string[];
  novel_risks: string[];
  scenarios: Scenario[];
  watch_indicators: string[];
  competitive_update: {
    we_position: string;
    they_position: string;
    net_advantage_shift: string;
  };
}

export interface SIOSAnalysis {
  event: WorldEvent;
  agent_outputs: Record<string, AgentAnalysis>;
  synthesis: SynthesisResult;
  timestamp: string;
}

// ── API response shapes ──

export interface EventListItem {
  event: WorldEvent;
  hasAnalysis: boolean;
}

export interface EventDetail {
  event: WorldEvent;
  analysis: SIOSAnalysis | null;
}

export interface SystemStatus {
  activeAgents: number;
  totalAgents: number;
  eventsProcessed: number;
  lastIngestion: string | null;
  systemState: 'NOMINAL' | 'ELEVATED' | 'ALERT';
  runningAnalyses: string[];
  wsClients: number;
}

// ── Scorecard types (from backend ScorecardEngine) ──

export interface DomainNetAssessment {
  weScore: number;
  theyBestScore: number;
  gap: number;
}

export type ScorecardDomainKey =
  | 'military'
  | 'economic'
  | 'technology'
  | 'narrative'
  | 'alliance'
  | 'supply_chain'
  | 'demographic';

export interface Scorecard {
  timestamp: string;
  netAssessment: Record<ScorecardDomainKey, DomainNetAssessment>;
}

// ── WebSocket message types ──

export type WSMessage =
  | { type: 'connected' }
  | { type: 'analysis_started'; eventId: string; agents: string[] }
  | { type: 'agent_started'; eventId: string; agent: string }
  | { type: 'agent_completed'; eventId: string; agent: string; result: AgentAnalysis }
  | { type: 'synthesis_started'; eventId: string }
  | { type: 'analysis_complete'; eventId: string; analysis: SIOSAnalysis }
  | { type: 'error'; eventId: string; message: string };

// ── Display helpers ──

export type AgentLens =
  | 'THUCYDIDES'
  | 'LEE_KUAN_YEW'
  | 'STONES'
  | 'NETWAR'
  | 'TECHNIUM'
  | 'EURASIAN'
  | 'NET_ASSESSMENT'
  | 'SINGULARITY'
  | 'NOOSPHERE'
  | 'EMERGENCE'
  | 'CONSTRUCTAL'
  | 'DIALECTICAL';
