/**
 * SIOS — File-Based Event Store
 *
 * Persists WorldEvents and SIOSAnalysis results as JSON files on disk.
 */

import { readFileSync } from "node:fs";
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { WorldEvent, SIOSAnalysis } from "../core/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class EventStore {
  private eventsDir: string;
  private analysesDir: string;

  constructor(storePath?: string) {
    const base = storePath ?? join(__dirname, "store");
    this.eventsDir = join(base, "events");
    this.analysesDir = join(base, "analyses");
  }

  /** Ensure store directories exist. */
  private async ensureDirs(): Promise<void> {
    await mkdir(this.eventsDir, { recursive: true });
    await mkdir(this.analysesDir, { recursive: true });
  }

  /** Persist a WorldEvent as a JSON file named by event.id. */
  async saveEvent(event: WorldEvent): Promise<void> {
    await this.ensureDirs();
    const filePath = join(this.eventsDir, `${event.id}.json`);
    await writeFile(filePath, JSON.stringify(event, null, 2), "utf-8");
  }

  /** Persist a full SIOSAnalysis output. */
  async saveAnalysis(analysis: SIOSAnalysis): Promise<void> {
    await this.ensureDirs();
    const filePath = join(this.analysesDir, `${analysis.event.id}.json`);
    await writeFile(filePath, JSON.stringify(analysis, null, 2), "utf-8");
  }

  /** Retrieve a WorldEvent by ID, or null if not found. */
  async getEvent(id: string): Promise<WorldEvent | null> {
    try {
      const filePath = join(this.eventsDir, `${id}.json`);
      const raw = await readFile(filePath, "utf-8");
      return JSON.parse(raw) as WorldEvent;
    } catch {
      return null;
    }
  }

  /** Retrieve a SIOSAnalysis by event ID, or null if not found. */
  async getAnalysis(eventId: string): Promise<SIOSAnalysis | null> {
    try {
      const filePath = join(this.analysesDir, `${eventId}.json`);
      const raw = await readFile(filePath, "utf-8");
      return JSON.parse(raw) as SIOSAnalysis;
    } catch {
      return null;
    }
  }

  /** List all stored events, sorted by timestamp descending. */
  async listEvents(): Promise<WorldEvent[]> {
    await this.ensureDirs();
    const files = await readdir(this.eventsDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const events: WorldEvent[] = [];
    for (const file of jsonFiles) {
      const raw = await readFile(join(this.eventsDir, file), "utf-8");
      events.push(JSON.parse(raw) as WorldEvent);
    }

    events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return events;
  }

  /** List all analysis IDs (event IDs that have a saved analysis). */
  async listAnalyses(): Promise<string[]> {
    await this.ensureDirs();
    const files = await readdir(this.analysesDir);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
  }
}

/** Default singleton instance. */
export const eventStore = new EventStore();

/** Load the sample Hormuz event from the bundled JSON fixture. */
export function loadSampleEvent(): WorldEvent {
  const jsonPath = join(__dirname, "sample-hormuz.json");
  const raw = readFileSync(jsonPath, "utf-8");
  return JSON.parse(raw) as WorldEvent;
}
