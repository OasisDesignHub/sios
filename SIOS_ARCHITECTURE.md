# SIOS — Strategic Intelligence Operating System
## Architecture Blueprint v0.1

---

## CONCEPTUAL FOUNDATION

This system is built on a core epistemological premise:
**World events are not facts — they are signals. Their meaning depends entirely on the interpretive lens applied.**

A single event (e.g., US strike on Iranian nuclear facility) generates radically different 
intelligence depending on whether you read it through:
- Thucydides Trap (great power transition anxiety)
- Dugin (Eurasian civilizational resistance to unipolar hegemony)
- Arquilla (network/swarm warfare escalation dynamics)
- Constructal Law (flow obstruction and systemic rerouting)
- Technium (technology diffusion and innovation shock)

The system's value is NOT in any single lens — it's in the CONVERGENCE or DIVERGENCE 
of interpretations. Where all lenses agree: high-confidence signal. Where they diverge: 
fertile zone of strategic ambiguity requiring human judgment.

---

## LAYER ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 5: COMPETITIVE INTELLIGENCE CONSOLE               │
│  "Who are WE? Who are THEY? Who is winning?"             │
│  Noospheric synthesis + emergence detection              │
├─────────────────────────────────────────────────────────┤
│  LAYER 4: SYNTHESIS ENGINE                               │
│  Cross-lens convergence/divergence analysis              │
│  Scenario generation + probability weighting             │
├─────────────────────────────────────────────────────────┤
│  LAYER 3: PERSPECTIVE AGENTS (12 Lenses)                 │
│  Each agent interprets events through its framework      │
├─────────────────────────────────────────────────────────┤
│  LAYER 2: EVENT STRUCTURING ENGINE                       │
│  Entity extraction, causal mapping, timeline assembly    │
├─────────────────────────────────────────────────────────┤
│  LAYER 1: INGESTION BUS                                  │
│  Open source feeds, news APIs, academic streams          │
└─────────────────────────────────────────────────────────┘
```

---

## LAYER 1: INGESTION BUS

### Data Sources
**Open Source Intelligence (OSINT)**
- Bellingcat feed + methodology replication
- ACLED (Armed Conflict Location & Event Data)
- GDELT (Global Database of Events, Language, Tone)
- UN Comtrade (trade flow anomalies)
- FlightRadar24/ADS-B (military aircraft movement)
- MarineTraffic (shipping lane disruptions — critical for Hormuz)
- USGS/NASA earth observation feeds
- BIS/IMF financial flow data

**Narrative Streams**
- Reuters, AP, AFP wire services (raw, pre-editorial)
- State media: Xinhua, RT, IRNA, TASS, Global Times
  (what adversaries are SAYING is as important as what they're doing)
- Academic preprint servers (SSRN, arXiv for dual-use tech)
- Think tank outputs: RAND, Brookings, IISS, CSIS, Carnegie

**Technical/Economic Streams**
- SEMI (semiconductor industry data)
- USGS mineral resource reports (helium, rare earths)
- Patent filings in strategic domains
- Export control violation reports

### Ingestion Architecture
```
Kafka message bus → topic per source category
  ├── raw.geopolitical
  ├── raw.military
  ├── raw.economic
  ├── raw.technology
  ├── raw.narrative (state media)
  └── raw.osint

Each message: {
  source, timestamp, geography[], entities[], 
  raw_text, embedding_vector, confidence
}
```

---

## LAYER 2: EVENT STRUCTURING ENGINE

### Functions
1. **Entity Resolution** — Named entity recognition → canonical IDs
   (Iran ≡ IR ≡ Islamic Republic ≡ Tehran regime)

2. **Causal Chain Assembly** — Events linked by actor/action/object/effect
   US_STRIKE → [damages] NATANZ_FACILITY → [disrupts] IR_ENRICHMENT
   → [signals] REGIONAL_ESCALATION → [threatens] HORMUZ_TRANSIT

3. **Dependency Graph Builder** — Supply chain + political + military graphs
   HORMUZ_CLOSURE → [blocks] LNG_TANKERS → [disrupts] HELIUM_SUPPLY
   → [reduces] SEMICONDUCTOR_YIELD → [slows] AI_CHIP_PRODUCTION
   → [degrades] FRONTIER_AI_CAPABILITY (US + allies)

4. **Anomaly Detector** — Deviations from baseline patterns
   "Shipping density in Hormuz Strait -47% vs 90-day baseline"

5. **Signal vs. Noise Classifier** — Not all events are equal
   Uses historical significance scoring + network centrality

---

## LAYER 3: PERSPECTIVE AGENTS

### Agent Specifications

**AGENT-01: THUCYDIDES [Graham Allison]**
- Core question: "Is this a symptom of hegemonic transition anxiety?"
- Pattern library: 16 historical cases of rising/ruling power collision
- Outputs: War probability scores, miscalculation risk, red line proximity
- Key variables: Relative power trajectory, third-party entanglement,
  domestic political pressures in both powers

**AGENT-02: LEE KUAN YEW [Singaporean Realism]**
- Core question: "What does this mean for small/middle powers caught between giants?"
- Framework: Pragmatic multipolarity, ASEAN-centric, economic interdependence
- Outputs: Alignment shift predictions, hedge strategy maps
- Key variables: Trade dependencies, security guarantees, demographic trends
- Special capability: Southeast Asian escalation topology

**AGENT-03: STONES [David Lai / Go Strategy]**
- Core question: "Who is building structural position vs. who is making tactical moves?"
- Framework: Chinese strategic culture — shi (positional force), wei qi encirclement
- Outputs: Position assessments (territory held, surrounded, in-between)
- Key variables: BRI node control, port access, diplomatic encirclement
- Special capability: Detects "slow strangulation" strategies invisible to Western analysts

**AGENT-04: NETWAR [John Arquilla]**
- Core question: "How is network structure determining this conflict's outcome?"
- Framework: Networks vs. hierarchies, swarming doctrine, information warfare
- Outputs: Network topology maps, swarm potential assessments
- Key variables: Node density, redundancy, kill-chain length, C2 structure
- Special capability: Drone/UAS ecosystem analysis, hybrid warfare signatures

**AGENT-05: TECHNIUM [Kevin Kelly]**
- Core question: "What does technology WANT here? What is the evolutionary trajectory?"
- Framework: Technology as quasi-biological system with own directional momentum
- Outputs: Technology diffusion forecasts, inevitability assessments
- Key variables: Convergence of capabilities, exaptation potential, cost curves
- Special capability: Dual-use technology trajectory mapping

**AGENT-06: EURASIAN [Aleksandr Dugin]**
- Core question: "How does this serve or threaten Eurasian civilizational sovereignty?"
- Framework: Fourth Political Theory, Heartland geopolitics, multipolar world order
- Outputs: Russian strategic logic interpretation, information warfare intent
- Key variables: NATO encroachment, Orthodox civilizational markers, Eurasian integration
- Special capability: Decodes Russian state media subtext and strategic messaging
- ⚠️ Note: Dugin lens is descriptive, not prescriptive — used to MODEL adversary logic

**AGENT-07: NET ASSESSMENT [Andrew Marshall / ONA methodology]**
- Core question: "Who has competitive advantage across the long-term competition?"
- Framework: Multi-decade competitive assessment, asymmetric strengths/weaknesses
- Outputs: Net advantage scores by domain (military, economic, tech, demographic)
- Key variables: Trend lines over 20-50 year horizons, second/third order effects
- Special capability: The "grown-up in the room" — corrects short-termism in other agents

**AGENT-08: SINGULARITY [Ray Kurzweil]**
- Core question: "How does this affect the trajectory toward recursive self-improvement?"
- Framework: Exponential growth, Law of Accelerating Returns, technology convergence
- Outputs: AI capability timeline impacts, chip shortage effects on singularity ETA
- Key variables: Compute availability, algorithmic efficiency, energy constraints
- Special capability: Converts geopolitical events into AI development timeline impacts

**AGENT-09: NOOSPHERE [Teilhard de Chardin]**
- Core question: "Is collective consciousness integrating or fragmenting?"
- Framework: Evolutionary complexification toward Omega Point, planetary mind emergence
- Outputs: Global coherence metrics, narrative convergence/divergence
- Key variables: Information flow rates, shared epistemic frameworks, polarization indices
- Special capability: Long-arc civilizational trajectory assessment

**AGENT-10: EMERGENCE [Complex Systems]**
- Core question: "What higher-order functions are appearing from lower-order interactions?"
- Framework: Cities-as-organisms, network effects, phase transitions
- Outputs: Emergence event detection, threshold proximity alerts
- Key variables: Network density, feedback loop identification, critical mass indicators
- Special capability: Detects regime changes BEFORE they manifest as visible events

**AGENT-11: CONSTRUCTAL [Adrian Bejan]**
- Core question: "How is flow being redirected, and what new channels will form?"
- Framework: All systems evolve to maximize flow; obstruction creates new pathways
- Outputs: Supply chain rerouting predictions, narrative flow maps
- Key variables: Flow rate changes, obstruction points, pressure differentials
- Special capability: Predicts HOW systems will adapt to disruption (not if, but where)
- Example: Hormuz closure → Constructal agent predicts new helium sources + routes

**AGENT-12: DIALECTICAL [Fascism ↔ Democracy ↔ Alternatives]**
- Core question: "What political-economic form is this event accelerating toward?"
- Framework: Historical analysis of regime type transitions, authoritarian appeal
- Outputs: Regime trajectory scores, democratic backsliding indicators
- Key variables: Information control, economic anxiety, scapegoating patterns
- Special capability: Early warning for authoritarian consolidation

---

## LAYER 4: SYNTHESIS ENGINE

### Cross-Lens Analysis Protocol

For each significant event, all 12 agents produce structured outputs:
```json
{
  "agent": "THUCYDIDES",
  "event_id": "US-IR-2026-STRIKE-01",
  "interpretation": "...",
  "confidence": 0.78,
  "key_variables": {...},
  "scenarios": [
    {"label": "Controlled Escalation", "probability": 0.45},
    {"label": "Regional War", "probability": 0.25},
    {"label": "Negotiated Pause", "probability": 0.30}
  ],
  "watch_indicators": ["Iranian naval movements", "Chinese diplomatic positioning"],
  "time_horizon": "90 days"
}
```

### Convergence/Divergence Matrix
Where 8+ agents agree: **HIGH CONFIDENCE SIGNAL**
Where agents split: **Strategic Ambiguity Zone** → human review required
Where single outlier disagrees: **Novel Risk Signal** → investigate outlier's logic

### Narrative Synthesis
Synthesis agent produces: 
- Executive brief (3 paragraphs)
- Key uncertainties (ranked)
- Recommended watching indicators
- Competitive intelligence update

---

## LAYER 5: COMPETITIVE INTELLIGENCE CONSOLE

### The Core Question: WHO ARE WE? WHO ARE THEY?

**WE (Current definition — configurable)**
- USA + Five Eyes + NATO core
- Semiconductor alliance (TSMC-complex, ASML)
- Dollar-denominated financial system
- Liberal democratic institutional order

**THEY (Primary competitors)**
- THEY-1: China (PRC) — primary peer competitor
- THEY-2: Russia — revisionist disruptor  
- THEY-3: Iran — regional spoiler with nuclear ambitions
- THEY-4: Non-state actors (various)

### Competitive Scorecards (Updated continuously)
Domains assessed:
- Military capability trajectory
- Economic momentum and resilience
- Technology frontier position (esp. AI, quantum, biotech)
- Narrative/information environment control
- Alliance cohesion and expansion
- Supply chain sovereignty
- Demographic and institutional vitality

### The Hormuz→Helium→Chips→AI Chain (Live Monitor)
This is the worked example that proves the system:
```
EVENT: US strike on Iran
  ↓ [NETWAR agent]: Iranian asymmetric response options
  ↓ [CONSTRUCTAL agent]: Hormuz flow obstruction probability
  ↓ [TECHNIUM agent]: Helium supply chain vulnerability mapping
  ↓ [SINGULARITY agent]: AI compute impact assessment
  ↓ [NET ASSESSMENT agent]: Long-term competitive position shift
  ↓ [SYNTHESIS]: "US strikes may accelerate Chinese chip independence 
                   faster than it degrades Iranian nuclear program"
```

---

## IMPLEMENTATION PHASES

### Phase 1 (Build now): Foundation + Console UI
- Claude Code repository structure
- Perspective agent prompts (all 12)
- Event ingestion simulator
- Monitoring console (React app)
- Hormuz→Chips worked example

### Phase 2 (Next sprint): Live Data Integration
- GDELT API integration
- MarineTraffic webhook
- News API aggregation
- Automated agent invocation pipeline

### Phase 3: Full Agentic Loop
- Claude Code agents running on schedule
- Cross-agent synthesis automation  
- Alert system for threshold events
- Competitive scorecard auto-update

---

## REPOSITORY STRUCTURE

```
sios/
├── agents/
│   ├── prompts/          # Agent system prompts
│   ├── thucydides.ts
│   ├── lee-kuan-yew.ts
│   ├── stones.ts
│   ├── netwar.ts
│   ├── technium.ts
│   ├── eurasian.ts
│   ├── net-assessment.ts
│   ├── singularity.ts
│   ├── noosphere.ts
│   ├── emergence.ts
│   ├── constructal.ts
│   └── dialectical.ts
├── ingestion/
│   ├── gdelt/
│   ├── marine-traffic/
│   ├── news-api/
│   └── osint/
├── synthesis/
│   ├── convergence-engine.ts
│   ├── scenario-generator.ts
│   └── narrative-synthesizer.ts
├── competitive-intelligence/
│   ├── scorecards/
│   ├── we-definition.ts
│   └── they-profiles/
├── console/              # React monitoring UI
├── events/               # Event store
└── ARCHITECTURE.md
```
