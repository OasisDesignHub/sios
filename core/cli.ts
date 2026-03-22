#!/usr/bin/env ts-node
/**
 * SIOS Command Line Interface
 * Usage: npx ts-node core/cli.ts analyze --event path/to/event.json
 */

import { analyzeSIOSEvent, HORMUZ_EXAMPLE_EVENT } from "./analysis-engine.js";
import type { WorldEvent } from "./types.js";
import * as fs from "fs";
import * as path from "path";

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  if (command === "analyze") {
    const eventFlag = args.indexOf("--event");
    const allAgents = args.includes("--all-agents");
    
    let event: WorldEvent;
    
    if (eventFlag !== -1 && args[eventFlag + 1]) {
      const eventPath = path.resolve(args[eventFlag + 1]);
      event = JSON.parse(fs.readFileSync(eventPath, "utf-8"));
    } else {
      console.log("No event file specified — using Hormuz example event\n");
      event = HORMUZ_EXAMPLE_EVENT;
    }
    
    // Select agents
    const agentsToRun = allAgents 
      ? undefined  // All 12
      : ["THUCYDIDES", "NET_ASSESSMENT", "CONSTRUCTAL", "SINGULARITY"]; // Fast subset
    
    console.log("\n╔══════════════════════════════════════════════════════╗");
    console.log("║     SIOS — STRATEGIC INTELLIGENCE OPERATING SYSTEM   ║");
    console.log("╚══════════════════════════════════════════════════════╝\n");
    
    const analysis = await analyzeSIOSEvent(event, agentsToRun);
    
    // Print summary
    console.log("\n═══ SYNTHESIS COMPLETE ═══\n");
    console.log(analysis.synthesis.executive_brief);
    
    console.log("\n═══ CONVERGENCE SIGNALS ═══");
    analysis.synthesis.convergence_signals.forEach(s => console.log(`  ✓ ${s}`));
    
    console.log("\n═══ DIVERGENCE ZONES ═══");
    analysis.synthesis.divergence_zones.forEach(s => console.log(`  ⚡ ${s}`));
    
    console.log("\n═══ SCENARIOS ═══");
    analysis.synthesis.scenarios.forEach(s => 
      console.log(`  ${Math.round(s.probability * 100)}% — ${s.label} [${s.timeframe}]`)
    );
    
    console.log("\n═══ COMPETITIVE UPDATE ═══");
    console.log(`  WE: ${analysis.synthesis.competitive_update.we_position}`);
    console.log(`  THEY: ${analysis.synthesis.competitive_update.they_position}`);
    console.log(`  NET: ${analysis.synthesis.competitive_update.net_advantage_shift}`);
    
    // Save full output
    const outputPath = `sios-analysis-${Date.now()}.json`;
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
    console.log(`\n✓ Full analysis saved to: ${outputPath}\n`);
    
  } else if (command === "example") {
    console.log("Example event (Hormuz):");
    console.log(JSON.stringify(HORMUZ_EXAMPLE_EVENT, null, 2));
    
  } else {
    console.log(`
SIOS — Strategic Intelligence Operating System

Commands:
  analyze           Run multi-lens analysis on an event
  example           Print example event JSON

Flags:
  --event path      Path to event JSON file (optional, defaults to Hormuz example)
  --all-agents      Run all 12 agents (default: fast subset of 4)
  
Examples:
  npx ts-node core/cli.ts analyze
  npx ts-node core/cli.ts analyze --event events/my-event.json --all-agents
  npx ts-node core/cli.ts example > events/my-event.json
    `);
  }
}

main().catch(console.error);
