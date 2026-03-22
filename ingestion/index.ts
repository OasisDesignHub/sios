/**
 * SIOS — Ingestion Module
 *
 * Re-exports all ingesters, the message bus, and ingestion types.
 */

// Types
export type { IngestionSource, IngestionResult } from "./types.js";

// Message Bus
export { MessageBus, messageBus } from "./message-bus.js";

// Ingesters
export { GDELTIngester, createGDELTIngester } from "./gdelt/gdelt-ingest.js";
export {
  MarineTrafficIngester,
  createMarineTrafficIngester,
} from "./marine-traffic/marine-traffic-ingest.js";
export { NewsIngester, createNewsIngester } from "./news-api/news-ingest.js";
export { OSINTIngester, createOSINTIngester } from "./osint/osint-ingest.js";
