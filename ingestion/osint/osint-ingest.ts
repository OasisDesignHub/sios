/**
 * SIOS — OSINT Feed Aggregator (Phase 2 Scaffold)
 *
 * Placeholder implementations for open-source intelligence feeds:
 * - ACLED (Armed Conflict Location & Event Data)
 * - ADS-B / FlightRadar flight tracking data
 *
 * Each method returns a structured IngestionResult with an error
 * noting that API credentials are needed. Full implementation is
 * planned for Phase 2.
 */

import type { IngestionResult } from "../types.js";

export class OSINTIngester {
  /**
   * Placeholder: Fetch conflict event data from ACLED.
   * Requires ACLED API credentials (https://acleddata.com).
   */
  async fetchACLED(): Promise<IngestionResult> {
    return {
      source: "osint:acled",
      items: [],
      fetchedAt: new Date().toISOString(),
      errors: [
        "ACLED integration not yet implemented. " +
        "Requires ACLED API key and email registration at https://acleddata.com. " +
        "Planned for Phase 2.",
      ],
    };
  }

  /**
   * Placeholder: Fetch aircraft position data from ADS-B Exchange / FlightRadar.
   * Useful for detecting military flight patterns and airspace anomalies.
   */
  async fetchFlightData(): Promise<IngestionResult> {
    return {
      source: "osint:flight-data",
      items: [],
      fetchedAt: new Date().toISOString(),
      errors: [
        "Flight data integration not yet implemented. " +
        "Requires ADS-B Exchange or FlightRadar24 API credentials. " +
        "Planned for Phase 2.",
      ],
    };
  }
}

/**
 * Factory function for creating an OSINT ingester.
 */
export function createOSINTIngester(): OSINTIngester {
  return new OSINTIngester();
}
