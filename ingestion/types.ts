/**
 * SIOS — Ingestion-Specific Type Definitions
 */

import type { RawIntelligenceItem } from "../core/types.js";

export interface IngestionSource {
  name: string;
  type: "api" | "webhook" | "rss" | "scrape";
  endpoint: string;
  pollIntervalMs: number;
  enabled: boolean;
}

export interface IngestionResult {
  source: string;
  items: RawIntelligenceItem[];
  fetchedAt: string;
  errors?: string[];
}
