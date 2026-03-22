import React, { useState, useEffect } from 'react';
import type {
  WorldEvent,
  AgentAnalysis,
  ConvergenceSignal,
  ScorecardDomain,
  SystemStatus,
  SeverityLevel,
  AgentLens,
} from './types';

// =============================================================================
// Mock Data — Hormuz Cascade Worked Example
// =============================================================================

const MOCK_SYSTEM_STATUS: SystemStatus = {
  activeAgents: 12,
  totalAgents: 12,
  eventsProcessed: 847,
  lastIngestion: '2026-03-22T14:32:00Z',
  systemState: 'ELEVATED',
};

const MOCK_EVENTS: WorldEvent[] = [
  {
    id: 'evt-hormuz-001',
    title: 'US Precision Strike on IRGC Quds Force Facility — Isfahan Province',
    description:
      'US CENTCOM confirms targeted strike on IRGC-QF command node. Iranian state media reports "martyrdom of defenders." IRGC Navy repositioning fast-attack craft toward Strait of Hormuz.',
    domain: 'MILITARY',
    severity: 'CRITICAL',
    timestamp: '2026-03-22T08:15:00Z',
    source: 'CENTCOM / IRNA / OSINT',
    location: 'Isfahan, Iran',
    actors: ['US CENTCOM', 'IRGC-QF', 'IRGC Navy'],
    cascadeChain: [
      'US Strike → Iran',
      'IRGC Hormuz Threat',
      'Gulf Helium Disruption',
      'Semiconductor Yield ↓',
      'AI Compute Bottleneck',
      'Competitive Shift',
    ],
  },
  {
    id: 'evt-hormuz-002',
    title: 'Qatar Helium Exports Suspended — Shipping Insurance Rates Spike 340%',
    description:
      'Lloyd\'s market suspends transit coverage for Strait of Hormuz. Qatar — world\'s largest helium exporter — halts shipments. RasGas confirms force majeure declaration.',
    domain: 'ENERGY',
    severity: 'HIGH',
    timestamp: '2026-03-22T10:42:00Z',
    source: 'Lloyd\'s / Reuters / RasGas',
    location: 'Strait of Hormuz',
    actors: ['RasGas', 'Lloyd\'s of London', 'Qatar Energy'],
  },
  {
    id: 'evt-hormuz-003',
    title: 'TSMC Signals Helium Supply Risk — 3nm Yield Guidance Pulled',
    description:
      'TSMC investor relations withdraws Q2 yield guidance for N3E process node citing "supply chain disruption to critical process gases." Samsung Foundry issues similar advisory.',
    domain: 'TECHNOLOGY',
    severity: 'HIGH',
    timestamp: '2026-03-22T12:18:00Z',
    source: 'TSMC IR / Samsung Foundry / Bloomberg',
    location: 'Hsinchu, Taiwan',
    actors: ['TSMC', 'Samsung Foundry'],
  },
  {
    id: 'evt-hormuz-004',
    title: 'NVIDIA Emergency Board Session — H200 Allocation Review',
    description:
      'Sources confirm NVIDIA board convened emergency session to review H200/B100 allocation priorities given potential wafer supply constraints. Hyperscaler contracts under review.',
    domain: 'TECHNOLOGY',
    severity: 'MODERATE',
    timestamp: '2026-03-22T13:55:00Z',
    source: 'Bloomberg / Industry Sources',
    location: 'Santa Clara, CA',
    actors: ['NVIDIA', 'Microsoft', 'Google', 'Meta'],
  },
  {
    id: 'evt-hormuz-005',
    title: 'PLA Eastern Theater Command — Elevated Readiness Posture Detected',
    description:
      'Satellite imagery shows PLA Eastern Theater naval assets departing Ningbo and Zhanjiang. Assessment: opportunistic posturing during US force commitment to CENTCOM AOR.',
    domain: 'MILITARY',
    severity: 'HIGH',
    timestamp: '2026-03-22T14:10:00Z',
    source: 'Planet Labs / CSIS / Pentagon',
    location: 'South China Sea',
    actors: ['PLA Navy', 'US INDOPACOM'],
  },
  {
    id: 'evt-hormuz-006',
    title: 'EU Emergency Energy Council Convened — Strategic Reserve Activation',
    description:
      'European Council President calls emergency energy session. Germany activates Phase 2 gas emergency plan. Brent crude surges past $127/bbl.',
    domain: 'ECONOMIC',
    severity: 'MODERATE',
    timestamp: '2026-03-22T11:30:00Z',
    source: 'European Council / Reuters',
    location: 'Brussels, EU',
    actors: ['European Council', 'Germany BMWK'],
  },
];

const MOCK_AGENT_OUTPUTS: AgentAnalysis[] = [
  {
    lens: 'THUCYDIDES',
    lensLabel: 'Hegemonic Transition',
    confidence: 0.92,
    interpretation:
      'Classic Thucydides Trap acceleration. US kinetic action against Iran creates opening for China to exploit — the rising power benefits from the ruling power\'s overextension in a secondary theater.',
    implications: [
      'US force commitment to CENTCOM reduces INDOPACOM posture',
      'China gains strategic window for Taiwan gray-zone operations',
    ],
    timeHorizon: '6-18 months',
    keySignal: 'PLA Eastern Theater elevated readiness concurrent with US CENTCOM ops',
  },
  {
    lens: 'LEE_KUAN_YEW',
    lensLabel: 'Pragmatic Realism',
    confidence: 0.88,
    interpretation:
      'Small state vulnerability exposed. Singapore, Taiwan, and Gulf states face immediate pressure to hedge. Expect quiet bilateral overtures to Beijing as insurance against US overcommitment.',
    implications: [
      'ASEAN neutrality under pressure',
      'Gulf states accelerate China energy corridor',
    ],
    timeHorizon: '3-6 months',
    keySignal: 'Saudi-China refinery JV timeline accelerated',
  },
  {
    lens: 'STONES',
    lensLabel: 'Wei Qi Strategic Culture',
    confidence: 0.85,
    interpretation:
      'Iran\'s Hormuz threat is a classic wei qi "ko fight" — a forced exchange to distract from the main board. China reads the whole-board position: US stones are overconcentrated in the Middle East quadrant.',
    implications: [
      'China may play "tenuki" — ignore the local fight and seize initiative elsewhere',
      'Taiwan Strait probing likely within 90 days',
    ],
    timeHorizon: '3-12 months',
    keySignal: 'Whole-board position favors the patient player',
  },
  {
    lens: 'NETWAR',
    lensLabel: 'Network/Swarm Warfare',
    confidence: 0.79,
    interpretation:
      'IRGC proxy network activation imminent. Expect asymmetric swarming: Houthi anti-ship missiles, Hezbollah cyber ops, Iraqi militia drone attacks on Gulf infrastructure. The network fights, not the node.',
    implications: [
      'Multi-vector asymmetric response across 4+ theaters',
      'Conventional force structure disadvantaged against distributed threat',
    ],
    timeHorizon: '1-4 weeks',
    keySignal: 'Houthi maritime attack tempo increase',
  },
  {
    lens: 'TECHNIUM',
    lensLabel: 'Technology Evolution',
    confidence: 0.91,
    interpretation:
      'Helium disruption exposes the hidden substrate dependency of the AI revolution. The technium\'s growth curve depends on physical supply chains that are geographically concentrated and strategically vulnerable.',
    implications: [
      'Accelerates alternative cooling R&D (cryogen-free dilution refrigerators)',
      'Semiconductor industry forced toward helium recycling infrastructure',
    ],
    timeHorizon: '12-36 months',
    keySignal: 'TSMC 3nm yield deviation from baseline',
  },
  {
    lens: 'EURASIAN',
    lensLabel: 'Civilizational Geopolitics',
    confidence: 0.73,
    interpretation:
      'US strike validates Dugin\'s thesis: the Atlantic thalassocracy must project force into the Heartland but cannot hold it. Iran is the pivot — control of the Hormuz rimland determines Eurasian integration.',
    implications: [
      'Russia-Iran-China axis consolidation accelerates',
      'Eurasian land corridor alternatives to maritime chokepoints',
    ],
    timeHorizon: '2-5 years',
    keySignal: 'Iran SCO full membership activation of mutual defense clause',
  },
  {
    lens: 'NET_ASSESSMENT',
    lensLabel: 'Long-Range Competition',
    confidence: 0.94,
    interpretation:
      'Marshall-framework assessment: US wins the battle, loses the competition. Every dollar and carrier group committed to CENTCOM is a dollar not competing with China. The competitive balance shifts by 0.3-0.5 sigma.',
    implications: [
      'US defense industrial base stretched across two major contingencies',
      'China\'s peacetime military modernization continues unimpeded',
    ],
    timeHorizon: '5-10 years',
    keySignal: 'Competitive balance metric shift toward adversary',
  },
  {
    lens: 'SINGULARITY',
    lensLabel: 'Exponential Technology',
    confidence: 0.87,
    interpretation:
      'AI compute bottleneck delays the capability curve by 6-18 months. On an exponential trajectory, even small delays compound. This is not a linear disruption — it\'s a phase delay in the approach to transformative AI.',
    implications: [
      'Frontier model training runs delayed or compute-constrained',
      'China\'s domestic fab investment gets relative advantage',
    ],
    timeHorizon: '6-24 months',
    keySignal: 'GPU allocation per frontier training run declining',
  },
  {
    lens: 'NOOSPHERE',
    lensLabel: 'Collective Consciousness',
    confidence: 0.66,
    interpretation:
      'Information environment will bifurcate into two incompatible narratives. Western noosphere sees "defensive strike." Global South noosphere sees "imperial aggression." This perception gap becomes structural.',
    implications: [
      'UN Security Council paralysis deepens',
      'Global information commons fragments further',
    ],
    timeHorizon: '1-3 months',
    keySignal: 'Narrative divergence index exceeds 2020 baseline',
  },
  {
    lens: 'EMERGENCE',
    lensLabel: 'Complex Systems',
    confidence: 0.89,
    interpretation:
      'System is near a phase transition boundary. The cascade from kinetic strike → Hormuz closure → helium disruption → semiconductor impact → AI compute constraint represents a criticality propagation across coupled complex systems.',
    implications: [
      'Non-linear effects will surprise linear planners',
      'Cascade amplification through tightly coupled supply networks',
    ],
    timeHorizon: '1-6 months',
    keySignal: 'Cross-domain cascade velocity exceeding historical baseline',
  },
  {
    lens: 'CONSTRUCTAL',
    lensLabel: 'Flow Dynamics',
    confidence: 0.82,
    interpretation:
      'Hormuz blockage forces flow rerouting. Constructal law predicts: systems will redesign to restore flow. Expect Cape of Good Hope rerouting (energy), helium airlift corridors, and accelerated overland pipeline construction.',
    implications: [
      'Shipping transit times increase 40-60% for Gulf cargo',
      'New flow architectures become permanent even after crisis resolves',
    ],
    timeHorizon: '3-18 months',
    keySignal: 'Alternative flow channel establishment rate',
  },
  {
    lens: 'DIALECTICAL',
    lensLabel: 'Political Form Analysis',
    confidence: 0.76,
    interpretation:
      'Crisis drives democratic polities toward executive centralization. War powers invocations, emergency economic authorities, information controls — the democratic form bends under security pressure. Watch for the ratchet effect.',
    implications: [
      'Emergency authorities rarely fully rescinded post-crisis',
      'Autocratic competitors face no equivalent institutional friction',
    ],
    timeHorizon: '6-36 months',
    keySignal: 'War powers act invocation scope',
  },
];

const MOCK_CONVERGENCE: ConvergenceSignal[] = [
  {
    id: 'conv-001',
    type: 'CONVERGENCE',
    description:
      'US strategic overextension creates Chinese window of opportunity',
    lenses: ['THUCYDIDES', 'NET_ASSESSMENT', 'STONES'],
    strength: 0.94,
  },
  {
    id: 'conv-002',
    type: 'CONVERGENCE',
    description:
      'Supply chain cascade will bottleneck AI compute within 90 days',
    lenses: ['TECHNIUM', 'SINGULARITY', 'EMERGENCE', 'CONSTRUCTAL'],
    strength: 0.91,
  },
  {
    id: 'conv-003',
    type: 'CONVERGENCE',
    description:
      'Asymmetric proxy network activation across multiple theaters',
    lenses: ['NETWAR', 'EURASIAN', 'LEE_KUAN_YEW'],
    strength: 0.83,
  },
  {
    id: 'div-001',
    type: 'DIVERGENCE',
    description:
      'Timeline disagreement: NETWAR sees weeks, CONSTRUCTAL sees months for peak impact',
    lenses: ['NETWAR', 'CONSTRUCTAL'],
    strength: 0.72,
  },
  {
    id: 'div-002',
    type: 'DIVERGENCE',
    description:
      'NOOSPHERE\'s narrative bifurcation thesis at odds with DIALECTICAL\'s institutional convergence prediction',
    lenses: ['NOOSPHERE', 'DIALECTICAL'],
    strength: 0.65,
  },
  {
    id: 'conv-004',
    type: 'CONVERGENCE',
    description:
      'Small states forced into hedging behavior — neutrality no longer viable',
    lenses: ['LEE_KUAN_YEW', 'THUCYDIDES', 'EURASIAN'],
    strength: 0.80,
  },
];

const MOCK_SCORECARD: ScorecardDomain[] = [
  { domain: 'Military Posture', weScore: 82, theyScore: 61, trend: 'DECLINING', delta: 21 },
  { domain: 'AI / Compute', weScore: 74, theyScore: 68, trend: 'DECLINING', delta: 6 },
  { domain: 'Semiconductor Supply', weScore: 45, theyScore: 58, trend: 'DECLINING', delta: -13 },
  { domain: 'Energy Security', weScore: 71, theyScore: 53, trend: 'STABLE', delta: 18 },
  { domain: 'Alliance Network', weScore: 78, theyScore: 65, trend: 'DECLINING', delta: 13 },
  { domain: 'Economic Leverage', weScore: 63, theyScore: 70, trend: 'DECLINING', delta: -7 },
  { domain: 'Information / Narrative', weScore: 55, theyScore: 62, trend: 'DECLINING', delta: -7 },
  { domain: 'Industrial Base', weScore: 51, theyScore: 79, trend: 'DECLINING', delta: -28 },
];

// =============================================================================
// Helper Components
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
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }) + 'Z';
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

function trendArrow(trend: string): string {
  switch (trend) {
    case 'IMPROVING': return '\u25B2';
    case 'DECLINING': return '\u25BC';
    default: return '\u25C6';
  }
}

function trendColor(trend: string): string {
  switch (trend) {
    case 'IMPROVING': return 'var(--accent-teal)';
    case 'DECLINING': return 'var(--signal-critical)';
    default: return 'var(--text-muted)';
  }
}

// =============================================================================
// Header
// =============================================================================

function Header({ status }: { status: SystemStatus }) {
  const now = useCurrentTime();

  const stateColor = {
    NOMINAL: 'nominal',
    ELEVATED: 'elevated',
    ALERT: 'alert',
  }[status.systemState];

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
            })}Z
          </span>
        </div>

        <div className="sios-header__stat">
          <span className="sios-header__stat-label">Agents</span>
          <span className="sios-header__stat-value sios-header__stat-value--teal">
            {status.activeAgents}/{status.totalAgents}
          </span>
        </div>

        <div className="sios-header__stat">
          <span className="sios-header__stat-label">Events</span>
          <span className="sios-header__stat-value">
            {status.eventsProcessed.toLocaleString()}
          </span>
        </div>

        <div className="sios-header__stat">
          <span className="sios-header__stat-label">Last Ingest</span>
          <span className="sios-header__stat-value">
            {formatTimestamp(status.lastIngestion)}
          </span>
        </div>

        <div className="system-indicator">
          <div className={`system-indicator__dot system-indicator__dot--${stateColor}`} />
          <span className="system-indicator__label">{status.systemState}</span>
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
}: {
  events: WorldEvent[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="panel event-feed">
      <div className="panel__header">
        <span className="panel__title">Event Feed</span>
        <span className="panel__badge panel__badge--red">
          {events.filter((e) => e.severity === 'CRITICAL').length} CRIT
        </span>
      </div>
      <div className="panel__body">
        {events.map((event) => (
          <div
            key={event.id}
            className={`event-item ${event.id === selectedId ? 'event-item--active' : ''}`}
            onClick={() => onSelect(event.id)}
          >
            <div className="event-item__header">
              <span className="event-item__title">{event.title}</span>
              <span
                className={`event-item__severity event-item__severity--${event.severity}`}
              />
            </div>
            <div className="event-item__meta">
              <span className={`event-item__domain event-item__domain--${event.domain}`}>
                {event.domain.replace('_', ' ')}
              </span>
              <span className="event-item__time">
                {formatDate(event.timestamp)} {formatTimestamp(event.timestamp)}
              </span>
            </div>
            <div className="event-item__description">{event.description}</div>
            {event.cascadeChain && (
              <div className="event-item__cascade">
                {event.cascadeChain.slice(0, 4).map((node, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="cascade-arrow">{'\u2192'}</span>}
                    <span className="cascade-node">{node}</span>
                  </React.Fragment>
                ))}
                {event.cascadeChain.length > 4 && (
                  <span className="cascade-node">+{event.cascadeChain.length - 4}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Agent Outputs
// =============================================================================

function AgentOutputs({ agents }: { agents: AgentAnalysis[] }) {
  return (
    <div className="panel agent-outputs">
      <div className="panel__header">
        <span className="panel__title">Agent Lens Outputs</span>
        <span className="panel__badge panel__badge--teal">
          {agents.length} ACTIVE
        </span>
      </div>
      <div className="panel__body">
        <div className="agent-grid">
          {agents.map((agent) => {
            const level = confidenceLevel(agent.confidence);
            return (
              <div key={agent.lens} className={`agent-card agent-card--${level}`}>
                <div className="agent-card__header">
                  <span className="agent-card__lens">{agent.lens.replace(/_/g, ' ')}</span>
                  <span className={`agent-card__confidence agent-card__confidence--${level}`}>
                    {Math.round(agent.confidence * 100)}%
                  </span>
                </div>
                <div className="agent-card__label">{agent.lensLabel}</div>
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
                {agent.keySignal && (
                  <div className="agent-card__signal">
                    {'\u25C8'} {agent.keySignal}
                  </div>
                )}
                <div className="agent-card__horizon">
                  {'\u23F1'} {agent.timeHorizon}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Convergence Matrix
// =============================================================================

function ConvergenceMatrix({ signals }: { signals: ConvergenceSignal[] }) {
  const convergenceCount = signals.filter((s) => s.type === 'CONVERGENCE').length;
  const divergenceCount = signals.filter((s) => s.type === 'DIVERGENCE').length;

  return (
    <div className="panel convergence-matrix">
      <div className="panel__header">
        <span className="panel__title">Convergence Matrix</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span className="panel__badge panel__badge--teal">{convergenceCount} CON</span>
          <span className="panel__badge panel__badge--orange">{divergenceCount} DIV</span>
        </div>
      </div>
      <div className="panel__body">
        {signals.map((signal) => (
          <div key={signal.id} className="convergence-item">
            <div className="convergence-item__header">
              <span
                className={`convergence-item__type convergence-item__type--${signal.type}`}
              >
                {signal.type}
              </span>
              <span className="convergence-item__strength">
                {Math.round(signal.strength * 100)}%
              </span>
            </div>
            <div className="convergence-item__description">{signal.description}</div>
            <div className="convergence-item__lenses">
              {signal.lenses.map((lens) => (
                <span key={lens} className="lens-tag">
                  {lens.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Scorecard Panel
// =============================================================================

function ScorecardPanel({ domains }: { domains: ScorecardDomain[] }) {
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
        {domains.map((d) => (
          <div key={d.domain} className="scorecard-row">
            <div className="scorecard-row__header">
              <span className="scorecard-row__domain">{d.domain}</span>
              <span>
                <span
                  className={`scorecard-row__delta scorecard-row__delta--${
                    d.delta > 0 ? 'positive' : d.delta < 0 ? 'negative' : 'neutral'
                  }`}
                >
                  {d.delta > 0 ? '+' : ''}
                  {d.delta}
                </span>
                <span
                  className="scorecard-row__trend"
                  style={{ color: trendColor(d.trend) }}
                >
                  {trendArrow(d.trend)}
                </span>
              </span>
            </div>
            <div className="scorecard-bar-container">
              <div className="scorecard-bar">
                <span className="scorecard-bar__label">WE</span>
                <div className="scorecard-bar__track">
                  <div
                    className="scorecard-bar__fill scorecard-bar__fill--we"
                    style={{ width: `${d.weScore}%` }}
                  />
                </div>
                <span className="scorecard-bar__value">{d.weScore}</span>
              </div>
              <div className="scorecard-bar">
                <span className="scorecard-bar__label">THEY</span>
                <div className="scorecard-bar__track">
                  <div
                    className="scorecard-bar__fill scorecard-bar__fill--they"
                    style={{ width: `${d.theyScore}%` }}
                  />
                </div>
                <span className="scorecard-bar__value">{d.theyScore}</span>
              </div>
            </div>
          </div>
        ))}
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
      <div className="risk-indicator risk-indicator--CRITICAL">
        {'\u26A0'} CASCADE RISK: 87%
      </div>
    </div>
  );
}

// =============================================================================
// App
// =============================================================================

export function App() {
  const [selectedEventId, setSelectedEventId] = useState(MOCK_EVENTS[0].id);
  const selectedEvent = MOCK_EVENTS.find((e) => e.id === selectedEventId) || MOCK_EVENTS[0];

  return (
    <div className="sios-app">
      <Header status={MOCK_SYSTEM_STATUS} />

      <CascadeBanner
        chain={
          selectedEvent.cascadeChain || [
            'US Strike \u2192 Iran',
            'IRGC Hormuz Threat',
            'Gulf Helium Disruption',
            'Semiconductor Yield \u2193',
            'AI Compute Bottleneck',
            'Competitive Shift',
          ]
        }
      />

      <div className="sios-dashboard">
        <EventFeed
          events={MOCK_EVENTS}
          selectedId={selectedEventId}
          onSelect={setSelectedEventId}
        />

        <AgentOutputs agents={MOCK_AGENT_OUTPUTS} />

        <div className="right-column">
          <ConvergenceMatrix signals={MOCK_CONVERGENCE} />
          <ScorecardPanel domains={MOCK_SCORECARD} />
        </div>
      </div>
    </div>
  );
}
