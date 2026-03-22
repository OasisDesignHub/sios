# SIOS — Strategic Intelligence Operating System
## Claude Code Project Configuration

### Project Overview
A multi-agent strategic intelligence system that routes world events through 12 analytical 
perspective lenses, synthesizes the outputs, and produces competitive intelligence assessments.

### Architecture
- `agents/` — 12 perspective agents with specialized system prompts
- `core/` — Analysis engine, synthesis, event structuring
- `ingestion/` — GDELT, MarineTraffic, news API connectors
- `competitive-intelligence/` — Scorecard engine, WHO-ARE-WE/THEY profiles
- `console/` — React monitoring dashboard
- `events/` — Event store and history

### Key Commands
```bash
# Run analysis on a single event
npx ts-node core/cli.ts analyze --event events/sample-hormuz.json

# Run all 12 agents in parallel
npx ts-node core/cli.ts analyze --event events/sample-hormuz.json --all-agents

# Start monitoring console
cd console && npm run dev

# Run ingestion (requires API keys)
npx ts-node ingestion/gdelt/gdelt-ingest.ts
```

### Environment Variables Required
```
ANTHROPIC_API_KEY=        # For perspective agents
GDELT_API_KEY=           # For event ingestion
MARINE_TRAFFIC_API_KEY=  # For shipping lane monitoring
NEWS_API_KEY=            # For news stream
```

### Agent Lenses
1. THUCYDIDES — Graham Allison hegemonic transition
2. LEE_KUAN_YEW — Singapore pragmatic realism
3. STONES — David Lai Go/wei qi strategic culture
4. NETWAR — John Arquilla network/swarm warfare
5. TECHNIUM — Kevin Kelly technology evolution
6. EURASIAN — Dugin civilizational geopolitics (adversary modeling)
7. NET_ASSESSMENT — Andrew Marshall long-range competition
8. SINGULARITY — Kurzweil exponential technology
9. NOOSPHERE — Teilhard de Chardin collective consciousness
10. EMERGENCE — Complex systems / phase transitions
11. CONSTRUCTAL — Bejan flow dynamics and rerouting
12. DIALECTICAL — Political form analysis (fascism ↔ democracy)

### The Worked Example: Hormuz → Helium → Chips → AI
US strike on Iran → IRGC Hormuz threat → Gulf helium disruption → 
Semiconductor yield reduction → AI compute bottleneck → Competitive position shift

This chain is the proof-of-concept for the system's analytical depth.
