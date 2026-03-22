/**
 * SIOS — API Server
 *
 * Express + WebSocket server that wires the analysis engine, event store,
 * and scorecard engine to the React monitoring console.
 *
 * Endpoints:
 *   POST /api/events/analyze   — Submit a WorldEvent for full 12-lens analysis
 *   GET  /api/events           — List all stored events
 *   GET  /api/events/:id       — Retrieve event + analysis by ID
 *   GET  /api/scorecards       — Current competitive scorecard
 *   WS   /ws                   — Live agent progress during analysis
 */

import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";

import { runAgent, runSynthesis } from "../core/analysis-engine.js";
import { AGENT_PROMPTS } from "../agents/prompts/agent-prompts.js";
import type { WorldEvent, AgentAnalysis, SIOSAnalysis } from "../core/types.js";
import { eventStore } from "../events/event-store.js";
import { ScorecardEngine } from "../competitive-intelligence/scorecards/scorecard-engine.js";
import { DEFAULT_WE } from "../competitive-intelligence/we-definition.js";
import { ALL_COMPETITOR_PROFILES } from "../competitive-intelligence/they-profiles/index.js";

// ── Express App ──

const app = express();
app.use(cors());
app.use(express.json());

// ── HTTP + WebSocket Server ──

const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "connected" }));
});

function broadcast(data: unknown): void {
  const msg = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

// ── Scorecard Engine (singleton) ──

const scorecardEngine = new ScorecardEngine(DEFAULT_WE, ALL_COMPETITOR_PROFILES);

// Track running analyses so we don't double-run
const runningAnalyses = new Set<string>();

// ── POST /api/events/analyze ──

app.post("/api/events/analyze", async (req, res) => {
  const event = req.body as WorldEvent;

  if (!event.id || !event.title) {
    res.status(400).json({ error: "Event must have id and title" });
    return;
  }

  if (runningAnalyses.has(event.id)) {
    res.status(409).json({ error: "Analysis already in progress for this event" });
    return;
  }

  // Persist the event
  await eventStore.saveEvent(event);

  // Acknowledge immediately — analysis streams via WebSocket
  res.json({ analysisId: event.id, status: "started" });

  // Run analysis asynchronously
  runningAnalyses.add(event.id);
  const agents = Object.keys(AGENT_PROMPTS);

  broadcast({
    type: "analysis_started",
    eventId: event.id,
    agents,
  });

  try {
    const agentOutputs: Record<string, AgentAnalysis> = {};

    // Run all agents in parallel, broadcasting as each completes
    const agentPromises = agents.map(async (agentKey) => {
      broadcast({
        type: "agent_started",
        eventId: event.id,
        agent: agentKey,
      });

      const result = await runAgent(agentKey, event);
      agentOutputs[agentKey] = result;

      broadcast({
        type: "agent_completed",
        eventId: event.id,
        agent: agentKey,
        result,
      });

      return result;
    });

    await Promise.all(agentPromises);

    // Synthesis
    broadcast({ type: "synthesis_started", eventId: event.id });
    const synthesis = await runSynthesis(event, agentOutputs);

    const analysis: SIOSAnalysis = {
      event,
      agent_outputs: agentOutputs,
      synthesis,
      timestamp: new Date().toISOString(),
    };

    // Update scorecard from agent outputs
    scorecardEngine.updateFromAnalysis(agentOutputs);

    // Persist
    await eventStore.saveAnalysis(analysis);

    broadcast({
      type: "analysis_complete",
      eventId: event.id,
      analysis,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    broadcast({ type: "error", eventId: event.id, message });
  } finally {
    runningAnalyses.delete(event.id);
  }
});

// ── GET /api/events ──

app.get("/api/events", async (_req, res) => {
  const events = await eventStore.listEvents();
  const analysisIds = await eventStore.listAnalyses();
  const analysisSet = new Set(analysisIds);

  const result = events.map((event) => ({
    event,
    hasAnalysis: analysisSet.has(event.id),
  }));

  res.json(result);
});

// ── GET /api/events/:id ──

app.get("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  const event = await eventStore.getEvent(id);

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const analysis = await eventStore.getAnalysis(id);
  res.json({ event, analysis });
});

// ── GET /api/scorecards ──

app.get("/api/scorecards", (_req, res) => {
  const scorecard = scorecardEngine.getScorecard();
  res.json(scorecard);
});

// ── GET /api/status ──

app.get("/api/status", async (_req, res) => {
  const events = await eventStore.listEvents();
  const analyses = await eventStore.listAnalyses();

  res.json({
    activeAgents: 12,
    totalAgents: 12,
    eventsProcessed: analyses.length,
    lastIngestion: events.length > 0 ? events[0].timestamp : null,
    systemState: runningAnalyses.size > 0 ? "ELEVATED" : "NOMINAL",
    runningAnalyses: [...runningAnalyses],
    wsClients: wss.clients.size,
  });
});

// ── Start ──

const PORT = parseInt(process.env.PORT || process.env.API_PORT || "3001", 10);

server.listen(PORT, () => {
  console.log(`SIOS API server running on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint:  ws://localhost:${PORT}/ws`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/events/analyze   — Run 12-lens analysis`);
  console.log(`  GET  /api/events           — List events`);
  console.log(`  GET  /api/events/:id       — Event + analysis`);
  console.log(`  GET  /api/scorecards       — Competitive scorecard`);
  console.log(`  GET  /api/status           — System status`);
});
