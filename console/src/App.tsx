import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  WorldEvent,
  AgentAnalysis,
  SIOSAnalysis,
  SynthesisResult,
  EventListItem,
  SystemStatus,
  Scorecard,
  ScorecardDomainKey,
  DomainNetAssessment,
  WSMessage,
} from './types';

// =============================================================================
// Constants
// =============================================================================

const LENS_LABELS: Record<string, string> = {
  THUCYDIDES: 'Hegemonic Transition',
  LEE_KUAN_YEW: 'Pragmatic Realism',
  STONES: 'Wei Qi Strategic Culture',
  NETWAR: 'Network/Swarm Warfare',
  TECHNIUM: 'Technology Evolution',
  EURASIAN: 'Civilizational Geopolitics',
  NET_ASSESSMENT: 'Long-Range Competition',
  SINGULARITY: 'Exponential Technology',
  NOOSPHERE: 'Collective Consciousness',
  EMERGENCE: 'Complex Systems',
  CONSTRUCTAL: 'Flow Dynamics',
  DIALECTICAL: 'Political Form Analysis',
};

const DOMAIN_LABELS: Record<ScorecardDomainKey, string> = {
  military: 'Military Posture',
  economic: 'Economic Leverage',
  technology: 'AI / Compute',
  narrative: 'Information / Narrative',
  alliance: 'Alliance Network',
  supply_chain: 'Supply Chain',
  demographic: 'Demographic Vitality',
};

const HORMUZ_CASCADE = [
  'US Strike \u2192 Iran',
  'IRGC Hormuz Threat',
  'Gulf Helium Disruption',
  'Semiconductor Yield \u2193',
  'AI Compute Bottleneck',
  'Competitive Shift',
];

// =============================================================================
// Helpers
// =============================================================================

function useCurrentTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }) + 'Z'
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function confidenceLevel(c: number): 'high' | 'medium' | 'low' {
  if (c >= 0.8) return 'high';
  if (c >= 0.6) return 'medium';
  return 'low';
}

/** Convert backend -10..+10 score to 0..100 for display */
function normalizeScore(score: number): number {
  return Math.round((score + 10) * 5);
}

function domainSeverity(domain: string): string {
  switch (domain) {
    case 'military':
      return 'CRITICAL';
    case 'economic':
    case 'technological':
      return 'HIGH';
    default:
      return 'MODERATE';
  }
}

function trendFromGap(gap: number): 'IMPROVING' | 'STABLE' | 'DECLINING' {
  if (gap > 3) return 'IMPROVING';
  if (gap < -1) return 'DECLINING';
  return 'STABLE';
}

function trendArrow(trend: string): string {
  switch (trend) {
    case 'IMPROVING':
      return '\u25B2';
    case 'DECLINING':
      return '\u25BC';
    default:
      return '\u25C6';
  }
}

function trendColor(trend: string): string {
  switch (trend) {
    case 'IMPROVING':
      return 'var(--accent-teal)';
    case 'DECLINING':
      return 'var(--signal-critical)';
    default:
      return 'var(--text-muted)';
  }
}

// =============================================================================
// Hooks
// =============================================================================

function useWebSocket(onMessage: (msg: WSMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage;

  useEffect(() => {
    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        // Reconnect after 3s
        setTimeout(connect, 3000);
      };
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data) as WSMessage;
          callbackRef.current(msg);
        } catch {
          // ignore malformed messages
        }
      };
    }

    connect();
    return () => {
      wsRef.current?.close();
    };
  }, []);

  return connected;
}

function useApi<T>(url: string, deps: unknown[] = []): { data: T | null; loading: boolean; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(url);
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // API not available yet
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

// =============================================================================
// Header
// =============================================================================

function Header({
  status,
  connected,
}: {
  status: SystemStatus | null;
  connected: boolean;
}) {
  const now = useCurrentTime();

  const stateValue = status?.systemState ?? 'NOMINAL';
  const stateColor = {
    NOMINAL: 'nominal',
    ELEVATED: 'elevated',
    ALERT: 'alert',
  }[stateValue];

  return (
    <header className="sios-header">
      <div className="sios-header__title-group">
        <h1 className="sios-header__title">
          <span>SIOS</span> — Strategic Intelligence Operating System
        </h1>
        <div className="sios-header__subtitle">
          Layer 5 Monitoring Console — Multi-Agent Analytical Framework
        </div>
      </div>

      <div className="sios-header__status">
        <div className="sios-header__stat">
          <span className="sios-header__stat-label">UTC</span>
          <span className="sios-header__stat-value">
            {now.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
              timeZone: 'UTC',
            })}
            Z
          </span>
        </div>

        <div className="sios-header__stat">
          <span className="sios-header__stat-label">Agents</span>
          <span className="sios-header__stat-value sios-header__stat-value--teal">
            {status?.activeAgents ?? 12}/{status?.totalAgents ?? 12}
          </span>
        </div>

        <div className="sios-header__stat">
          <span className="sios-header__stat-label">Events</span>
          <span className="sios-header__stat-value">
            {status?.eventsProcessed ?? 0}
          </span>
        </div>

        <div className="sios-header__stat">
          <span className="sios-header__stat-label">Last Ingest</span>
          <span className="sios-header__stat-value">
            {status?.lastIngestion ? formatTimestamp(status.lastIngestion) : '--:--Z'}
          </span>
        </div>

        <div className="system-indicator">
          <div
            className={`system-indicator__dot system-indicator__dot--${stateColor}`}
            style={!connected ? { backgroundColor: 'var(--signal-critical)' } : undefined}
          />
          <span className="system-indicator__label">
            {connected ? stateValue : 'OFFLINE'}
          </span>
        </div>
      </div>
    </header>
  );
}

// =============================================================================
// Event Feed
// =============================================================================

function EventFeed({
  events,
  selectedId,
  onSelect,
  analyzing,
}: {
  events: EventListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  analyzing: boolean;
}) {
  const critCount = events.filter(
    (e) => domainSeverity(e.event.domain) === 'CRITICAL',
  ).length;

  return (
    <div className="panel event-feed">
      <div className="panel__header">
        <span className="panel__title">Event Feed</span>
        <span className="panel__badge panel__badge--red">
          {critCount} CRIT
        </span>
      </div>
      <div className="panel__body">
        {events.length === 0 && !analyzing && (
          <div style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>
            No events yet. Submit an event for analysis.
          </div>
        )}
        {events.map(({ event, hasAnalysis }) => {
          const severity = domainSeverity(event.domain);
          return (
            <div
              key={event.id}
              className={`event-item ${event.id === selectedId ? 'event-item--active' : ''}`}
              onClick={() => onSelect(event.id)}
            >
              <div className="event-item__header">
                <span className="event-item__title">{event.title}</span>
                <span
                  className={`event-item__severity event-item__severity--${severity}`}
                />
              </div>
              <div className="event-item__meta">
                <span
                  className={`event-item__domain event-item__domain--${event.domain.toUpperCase()}`}
                >
                  {event.domain.replace('_', ' ').toUpperCase()}
                </span>
                <span className="event-item__time">
                  {formatDate(event.timestamp)} {formatTimestamp(event.timestamp)}
                </span>
              </div>
              <div className="event-item__description">
                {event.description.length > 200
                  ? event.description.slice(0, 200) + '...'
                  : event.description}
              </div>
              {!hasAnalysis && (
                <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  Awaiting analysis...
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// Agent Outputs
// =============================================================================

function AgentOutputs({
  agentOutputs,
  agentProgress,
}: {
  agentOutputs: Record<string, AgentAnalysis> | null;
  agentProgress: Record<string, 'pending' | 'running' | 'complete'>;
}) {
  const isStreaming = Object.values(agentProgress).some((s) => s !== 'complete' && s !== undefined);
  const agents = agentOutputs ? Object.entries(agentOutputs) : [];
  const allLenses = Object.keys(LENS_LABELS);

  return (
    <div className="panel agent-outputs">
      <div className="panel__header">
        <span className="panel__title">Agent Lens Outputs</span>
        <span className="panel__badge panel__badge--teal">
          {agents.length > 0 ? `${agents.length} ACTIVE` : isStreaming ? 'ANALYZING' : 'IDLE'}
        </span>
      </div>
      <div className="panel__body">
        {!agentOutputs && !isStreaming && (
          <div style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Select an analyzed event to view agent outputs.
          </div>
        )}

        {/* Show progress cards during streaming */}
        {isStreaming && agents.length === 0 && (
          <div className="agent-grid">
            {allLenses.map((lens) => {
              const status = agentProgress[lens] || 'pending';
              return (
                <div key={lens} className="agent-card agent-card--low" style={{ opacity: status === 'pending' ? 0.4 : 1 }}>
                  <div className="agent-card__header">
                    <span className="agent-card__lens">{lens.replace(/_/g, ' ')}</span>
                    <span className="agent-card__confidence agent-card__confidence--low">
                      {status === 'running' ? '...' : status === 'complete' ? '\u2713' : '--'}
                    </span>
                  </div>
                  <div className="agent-card__label">{LENS_LABELS[lens] ?? lens}</div>
                  <div className="confidence-bar">
                    <div
                      className={`confidence-bar__fill confidence-bar__fill--${status === 'running' ? 'medium' : 'low'}`}
                      style={{
                        width: status === 'complete' ? '100%' : status === 'running' ? '60%' : '0%',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                  <div className="agent-card__interpretation" style={{ fontStyle: 'italic' }}>
                    {status === 'running'
                      ? 'Analyzing through this lens...'
                      : status === 'complete'
                        ? 'Analysis complete'
                        : 'Waiting...'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Show actual results */}
        {agents.length > 0 && (
          <div className="agent-grid">
            {agents.map(([key, agent]) => {
              const level = confidenceLevel(agent.confidence);
              const timeHorizon = (agent.time_horizon as string) || (agent.timeframe as string) || '';
              const keySignal =
                (agent.watch_indicators as string[])?.[0] ||
                (agent.key_miscalculation_risks as string[])?.[0] ||
                '';

              return (
                <div key={key} className={`agent-card agent-card--${level}`}>
                  <div className="agent-card__header">
                    <span className="agent-card__lens">{key.replace(/_/g, ' ')}</span>
                    <span className={`agent-card__confidence agent-card__confidence--${level}`}>
                      {agent.error ? 'ERR' : `${Math.round(agent.confidence * 100)}%`}
                    </span>
                  </div>
                  <div className="agent-card__label">{LENS_LABELS[key] ?? key}</div>
                  <div className="confidence-bar">
                    <div
                      className={`confidence-bar__fill confidence-bar__fill--${level}`}
                      style={{ width: `${agent.confidence * 100}%` }}
                    />
                  </div>
                  <div className="agent-card__interpretation">
                    {agent.interpretation.length > 180
                      ? agent.interpretation.slice(0, 180) + '...'
                      : agent.interpretation}
                  </div>
                  {keySignal && (
                    <div className="agent-card__signal">
                      {'\u25C8'} {keySignal}
                    </div>
                  )}
                  {timeHorizon && (
                    <div className="agent-card__horizon">
                      {'\u23F1'} {timeHorizon}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Convergence Matrix
// =============================================================================

function ConvergenceMatrix({ synthesis }: { synthesis: SynthesisResult | null }) {
  if (!synthesis) {
    return (
      <div className="panel convergence-matrix">
        <div className="panel__header">
          <span className="panel__title">Convergence Matrix</span>
        </div>
        <div className="panel__body">
          <div style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Awaiting synthesis...
          </div>
        </div>
      </div>
    );
  }

  const convergenceSignals = synthesis.convergence_signals || [];
  const divergenceZones = synthesis.divergence_zones || [];

  return (
    <div className="panel convergence-matrix">
      <div className="panel__header">
        <span className="panel__title">Convergence Matrix</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span className="panel__badge panel__badge--teal">
            {convergenceSignals.length} CON
          </span>
          <span className="panel__badge panel__badge--orange">
            {divergenceZones.length} DIV
          </span>
        </div>
      </div>
      <div className="panel__body">
        {convergenceSignals.map((signal, i) => (
          <div key={`conv-${i}`} className="convergence-item">
            <div className="convergence-item__header">
              <span className="convergence-item__type convergence-item__type--CONVERGENCE">
                CONVERGENCE
              </span>
            </div>
            <div className="convergence-item__description">{signal}</div>
          </div>
        ))}
        {divergenceZones.map((zone, i) => (
          <div key={`div-${i}`} className="convergence-item">
            <div className="convergence-item__header">
              <span className="convergence-item__type convergence-item__type--DIVERGENCE">
                DIVERGENCE
              </span>
            </div>
            <div className="convergence-item__description">{zone}</div>
          </div>
        ))}
        {synthesis.novel_risks?.length > 0 && (
          <>
            {synthesis.novel_risks.map((risk, i) => (
              <div key={`risk-${i}`} className="convergence-item">
                <div className="convergence-item__header">
                  <span
                    className="convergence-item__type"
                    style={{ color: 'var(--signal-critical)' }}
                  >
                    NOVEL RISK
                  </span>
                </div>
                <div className="convergence-item__description">{risk}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Scorecard Panel
// =============================================================================

function ScorecardPanel({ scorecard }: { scorecard: Scorecard | null }) {
  if (!scorecard) {
    return (
      <div className="panel scorecard">
        <div className="panel__header">
          <span className="panel__title">Competitive Scorecard</span>
          <span className="panel__badge panel__badge--orange">WE vs THEY</span>
        </div>
        <div className="panel__body">
          <div style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Run an analysis to populate scorecard.
          </div>
        </div>
      </div>
    );
  }

  const domains = Object.entries(scorecard.netAssessment) as [
    ScorecardDomainKey,
    DomainNetAssessment,
  ][];

  return (
    <div className="panel scorecard">
      <div className="panel__header">
        <span className="panel__title">Competitive Scorecard</span>
        <span className="panel__badge panel__badge--orange">WE vs THEY</span>
      </div>
      <div className="panel__body">
        <div className="scorecard__legend">
          <div className="scorecard__legend-item">
            <span className="scorecard__legend-swatch scorecard__legend-swatch--we" />
            <span>WE (US/Allies)</span>
          </div>
          <div className="scorecard__legend-item">
            <span className="scorecard__legend-swatch scorecard__legend-swatch--they" />
            <span>THEY (China+)</span>
          </div>
        </div>
        {domains.map(([domainKey, assessment]) => {
          const weDisplay = normalizeScore(assessment.weScore);
          const theyDisplay = normalizeScore(assessment.theyBestScore);
          const delta = weDisplay - theyDisplay;
          const trend = trendFromGap(assessment.gap);

          return (
            <div key={domainKey} className="scorecard-row">
              <div className="scorecard-row__header">
                <span className="scorecard-row__domain">
                  {DOMAIN_LABELS[domainKey] ?? domainKey}
                </span>
                <span>
                  <span
                    className={`scorecard-row__delta scorecard-row__delta--${
                      delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral'
                    }`}
                  >
                    {delta > 0 ? '+' : ''}
                    {delta}
                  </span>
                  <span className="scorecard-row__trend" style={{ color: trendColor(trend) }}>
                    {trendArrow(trend)}
                  </span>
                </span>
              </div>
              <div className="scorecard-bar-container">
                <div className="scorecard-bar">
                  <span className="scorecard-bar__label">WE</span>
                  <div className="scorecard-bar__track">
                    <div
                      className="scorecard-bar__fill scorecard-bar__fill--we"
                      style={{ width: `${weDisplay}%` }}
                    />
                  </div>
                  <span className="scorecard-bar__value">{weDisplay}</span>
                </div>
                <div className="scorecard-bar">
                  <span className="scorecard-bar__label">THEY</span>
                  <div className="scorecard-bar__track">
                    <div
                      className="scorecard-bar__fill scorecard-bar__fill--they"
                      style={{ width: `${theyDisplay}%` }}
                    />
                  </div>
                  <span className="scorecard-bar__value">{theyDisplay}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// Cascade Banner
// =============================================================================

function CascadeBanner({ chain }: { chain: string[] }) {
  return (
    <div className="cascade-banner">
      <span className="cascade-banner__label">Cascade Chain</span>
      <div className="cascade-banner__chain">
        {chain.map((node, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="cascade-banner__arrow">{'\u2192'}</span>}
            <span className="cascade-banner__node">{node}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Analyze Panel — Submit events for analysis
// =============================================================================

function AnalyzePanel({
  onSubmitHormuz,
  analyzing,
  agentProgress,
}: {
  onSubmitHormuz: () => void;
  analyzing: boolean;
  agentProgress: Record<string, string>;
}) {
  const completed = Object.values(agentProgress).filter((s) => s === 'complete').length;
  const total = Object.keys(agentProgress).length;

  return (
    <div className="panel" style={{ gridColumn: '1 / -1' }}>
      <div className="panel__header">
        <span className="panel__title">Run Analysis</span>
      </div>
      <div className="panel__body" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={onSubmitHormuz}
            disabled={analyzing}
            style={{
              padding: '8px 20px',
              background: analyzing ? 'var(--bg-surface)' : 'var(--accent-teal)',
              color: analyzing ? 'var(--text-muted)' : '#000',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              cursor: analyzing ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {analyzing ? 'Analyzing...' : 'Analyze Hormuz Scenario'}
          </button>
          {analyzing && total > 0 && (
            <span style={{ color: 'var(--accent-teal)', fontSize: '13px' }}>
              Agents: {completed}/{total} complete
              {completed === total && ' — Running synthesis...'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Executive Brief Panel
// =============================================================================

function ExecutiveBrief({ synthesis }: { synthesis: SynthesisResult | null }) {
  if (!synthesis) return null;

  return (
    <div className="panel" style={{ gridColumn: '1 / -1' }}>
      <div className="panel__header">
        <span className="panel__title">Executive Brief</span>
      </div>
      <div className="panel__body" style={{ padding: '16px' }}>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '13px' }}>
          {synthesis.executive_brief}
        </div>
        {synthesis.scenarios?.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Scenarios
            </div>
            {synthesis.scenarios.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 0',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '13px',
                }}
              >
                <span>{s.label}</span>
                <span style={{ color: 'var(--accent-teal)' }}>
                  {Math.round(s.probability * 100)}% [{s.timeframe}]
                </span>
              </div>
            ))}
          </div>
        )}
        {synthesis.competitive_update && (
          <div style={{ marginTop: '16px', fontSize: '13px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Competitive Update
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong style={{ color: 'var(--accent-teal)' }}>WE:</strong>{' '}
              {synthesis.competitive_update.we_position}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong style={{ color: 'var(--signal-critical)' }}>THEY:</strong>{' '}
              {synthesis.competitive_update.they_position}
            </div>
            <div>
              <strong>NET:</strong> {synthesis.competitive_update.net_advantage_shift}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// App
// =============================================================================

export function App() {
  // ── API data ──
  const { data: eventList, refetch: refetchEvents } = useApi<EventListItem[]>('/api/events');
  const { data: scorecard, refetch: refetchScorecard } = useApi<Scorecard>('/api/scorecards');
  const { data: status, refetch: refetchStatus } = useApi<SystemStatus>('/api/status');

  // ── Selected event ──
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SIOSAnalysis | null>(null);

  // ── Analysis streaming state ──
  const [analyzing, setAnalyzing] = useState(false);
  const [agentProgress, setAgentProgress] = useState<Record<string, 'pending' | 'running' | 'complete'>>({});
  const [streamedOutputs, setStreamedOutputs] = useState<Record<string, AgentAnalysis>>({});

  // ── Load selected event's analysis ──
  useEffect(() => {
    if (!selectedEventId) {
      setSelectedAnalysis(null);
      return;
    }
    fetch(`/api/events/${selectedEventId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.analysis) {
          setSelectedAnalysis(data.analysis);
        }
      })
      .catch(() => {});
  }, [selectedEventId]);

  // Auto-select first event
  useEffect(() => {
    if (eventList && eventList.length > 0 && !selectedEventId) {
      setSelectedEventId(eventList[0].event.id);
    }
  }, [eventList, selectedEventId]);

  // ── WebSocket ──
  const wsConnected = useWebSocket(
    useCallback(
      (msg: WSMessage) => {
        switch (msg.type) {
          case 'analysis_started':
            setAnalyzing(true);
            setStreamedOutputs({});
            setAgentProgress(
              Object.fromEntries(msg.agents.map((a) => [a, 'pending' as const])),
            );
            break;

          case 'agent_started':
            setAgentProgress((prev) => ({ ...prev, [msg.agent]: 'running' }));
            break;

          case 'agent_completed':
            setAgentProgress((prev) => ({ ...prev, [msg.agent]: 'complete' }));
            setStreamedOutputs((prev) => ({ ...prev, [msg.agent]: msg.result }));
            break;

          case 'synthesis_started':
            // All agents done, synthesis running
            break;

          case 'analysis_complete':
            setAnalyzing(false);
            setSelectedAnalysis(msg.analysis);
            setSelectedEventId(msg.eventId);
            setAgentProgress({});
            setStreamedOutputs({});
            // Refresh lists
            refetchEvents();
            refetchScorecard();
            refetchStatus();
            break;

          case 'error':
            setAnalyzing(false);
            setAgentProgress({});
            break;
        }
      },
      [refetchEvents, refetchScorecard, refetchStatus],
    ),
  );

  // ── Submit Hormuz example ──
  const submitHormuz = async () => {
    if (analyzing) return;
    try {
      await fetch('/api/events/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `hormuz-${Date.now()}`,
          title: 'US Military Strike on Iranian Nuclear Facilities',
          description:
            'United States Air Force and Navy assets have conducted strikes on Iranian nuclear enrichment facilities at Natanz and Fordow. Iran has declared a state of emergency and the Islamic Revolutionary Guard Corps (IRGC) has issued warnings about consequences for regional shipping. The Strait of Hormuz has seen increased IRGC naval activity. Approximately 20% of global oil and LNG transits through the strait daily. US helium production from natural gas fields in Qatar and the Gulf region represents approximately 30% of global supply. Semiconductor manufacturers require helium for chip cooling during manufacturing — a sustained shortage would affect yields at TSMC, Samsung, and Intel fabs. Current AI training cluster deployments require 8-12 months of lead time for chip procurement.',
          timestamp: new Date().toISOString(),
          geography: ['Iran', 'Persian Gulf', 'Strait of Hormuz', 'Middle East', 'Global'],
          actors: ['United States', 'Iran', 'IRGC', 'Saudi Arabia', 'China', 'Russia', 'TSMC', 'Taiwan'],
          domain: 'military',
        }),
      });
    } catch {
      // broadcast will handle errors
    }
  };

  // ── Derive display data ──
  const events = eventList ?? [];
  const currentOutputs = selectedAnalysis?.agent_outputs ?? (analyzing ? streamedOutputs : null);
  const currentSynthesis = selectedAnalysis?.synthesis ?? null;

  return (
    <div className="sios-app">
      <Header status={status} connected={wsConnected} />

      <CascadeBanner chain={HORMUZ_CASCADE} />

      <AnalyzePanel
        onSubmitHormuz={submitHormuz}
        analyzing={analyzing}
        agentProgress={agentProgress}
      />

      <ExecutiveBrief synthesis={currentSynthesis} />

      <div className="sios-dashboard">
        <EventFeed
          events={events}
          selectedId={selectedEventId}
          onSelect={setSelectedEventId}
          analyzing={analyzing}
        />

        <AgentOutputs
          agentOutputs={currentOutputs && Object.keys(currentOutputs).length > 0 ? currentOutputs : null}
          agentProgress={agentProgress}
        />

        <div className="right-column">
          <ConvergenceMatrix synthesis={currentSynthesis} />
          <ScorecardPanel scorecard={scorecard} />
        </div>
      </div>
    </div>
  );
}
