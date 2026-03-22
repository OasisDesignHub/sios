// =============================================================================
// SIOS Console Types — Self-contained type definitions for the monitoring UI
// =============================================================================

/** Domain categories for world events */
export type EventDomain =
  | 'MILITARY'
  | 'ECONOMIC'
  | 'TECHNOLOGY'
  | 'POLITICAL'
  | 'ENERGY'
  | 'SUPPLY_CHAIN'
  | 'CYBER'
  | 'DIPLOMATIC';

/** Severity / urgency classification */
export type SeverityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

/** The 12 analytical perspective lenses */
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

/** A structured world event ingested by the system */
export interface WorldEvent {
  id: string;
  title: string;
  description: string;
  domain: EventDomain;
  severity: SeverityLevel;
  timestamp: string;
  source: string;
  location?: string;
  actors?: string[];
  cascadeChain?: string[];
}

/** Output from a single analytical agent */
export interface AgentAnalysis {
  lens: AgentLens;
  lensLabel: string;
  confidence: number;          // 0.0 – 1.0
  interpretation: string;
  implications: string[];
  timeHorizon: string;
  keySignal?: string;
}

/** A convergence or divergence signal across agents */
export interface ConvergenceSignal {
  id: string;
  type: 'CONVERGENCE' | 'DIVERGENCE';
  description: string;
  lenses: AgentLens[];
  strength: number;            // 0.0 – 1.0
}

/** Scorecard domain entry for competitive assessment */
export interface ScorecardDomain {
  domain: string;
  weScore: number;             // 0 – 100
  theyScore: number;           // 0 – 100
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  delta: number;               // positive = WE advantage
}

/** Synthesized result from all agent outputs */
export interface SynthesisResult {
  eventId: string;
  overallAssessment: string;
  convergenceSignals: ConvergenceSignal[];
  dominantNarrative: string;
  riskLevel: SeverityLevel;
  cascadeRisk: number;         // 0.0 – 1.0
  agentOutputs: AgentAnalysis[];
  scorecard: ScorecardDomain[];
  timestamp: string;
}

/** System status for the header display */
export interface SystemStatus {
  activeAgents: number;
  totalAgents: number;
  eventsProcessed: number;
  lastIngestion: string;
  systemState: 'NOMINAL' | 'ELEVATED' | 'ALERT';
}
