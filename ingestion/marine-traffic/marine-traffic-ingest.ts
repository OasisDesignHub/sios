/**
 * SIOS — MarineTraffic Shipping Lane Monitor
 *
 * Monitors vessel positions via the MarineTraffic API to detect
 * anomalous shipping patterns, chokepoint congestion, and military
 * vessel movements.
 */

import type { RawIntelligenceItem, IngestionCategory } from "../../core/types.js";
import type { IngestionResult } from "../types.js";

const MARINE_TRAFFIC_API = "https://services.marinetraffic.com/api/exportvessels/v:8";

/** Bounding box for an area query. */
interface AreaBounds {
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}

/** Strait of Hormuz approximate bounding box. */
const HORMUZ_BOUNDS: AreaBounds = {
  latMin: 26.5,
  latMax: 27.0,
  lonMin: 56.0,
  lonMax: 56.5,
};

interface MarineTrafficVessel {
  MMSI?: string;
  SHIPNAME?: string;
  SHIPTYPE?: number;
  LAT?: string;
  LON?: string;
  SPEED?: string;
  HEADING?: string;
  COURSE?: string;
  TIMESTAMP?: string;
  FLAG?: string;
  DESTINATION?: string;
  [key: string]: unknown;
}

export class MarineTrafficIngester {
  private apiKey: string;

  constructor(opts: { apiKey: string }) {
    this.apiKey = opts.apiKey;
  }

  /**
   * Fetch vessel positions within a geographic bounding box.
   */
  async fetchVesselPositions(area: AreaBounds): Promise<IngestionResult> {
    if (!this.apiKey) {
      return {
        source: "marine-traffic",
        items: [],
        fetchedAt: new Date().toISOString(),
        errors: ["MarineTraffic API key is required but was not provided."],
      };
    }

    const params = new URLSearchParams({
      v: "8",
      apikey: this.apiKey,
      LATMIN: String(area.latMin),
      LATMAX: String(area.latMax),
      LONMIN: String(area.lonMin),
      LONMAX: String(area.lonMax),
      msgtype: "simple",
      protocol: "jsono",
    });

    const url = `${MARINE_TRAFFIC_API}?${params.toString()}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        return {
          source: "marine-traffic",
          items: [],
          fetchedAt: new Date().toISOString(),
          errors: [`MarineTraffic API returned HTTP ${response.status}: ${response.statusText}`],
        };
      }

      const vessels = (await response.json()) as MarineTrafficVessel[];
      const items = vessels.map((v) => this.mapToIntelligenceItem(v, area));

      return {
        source: "marine-traffic",
        items,
        fetchedAt: new Date().toISOString(),
      };
    } catch (err) {
      return {
        source: "marine-traffic",
        items: [],
        fetchedAt: new Date().toISOString(),
        errors: [
          `MarineTraffic fetch failed: ${err instanceof Error ? err.message : String(err)}`,
        ],
      };
    }
  }

  /**
   * Convenience method: monitor vessel traffic in the Strait of Hormuz.
   */
  async monitorHormuz(): Promise<IngestionResult> {
    return this.fetchVesselPositions(HORMUZ_BOUNDS);
  }

  /**
   * Map a MarineTraffic vessel record to a RawIntelligenceItem.
   */
  private mapToIntelligenceItem(
    vessel: MarineTrafficVessel,
    area: AreaBounds,
  ): RawIntelligenceItem {
    const category = this.classifyVessel(vessel);
    const areaLabel = this.describeArea(area);

    const rawText = [
      `Vessel: ${vessel.SHIPNAME ?? "UNKNOWN"}`,
      `MMSI: ${vessel.MMSI ?? "N/A"}`,
      `Flag: ${vessel.FLAG ?? "N/A"}`,
      `Position: ${vessel.LAT ?? "?"}, ${vessel.LON ?? "?"}`,
      `Speed: ${vessel.SPEED ?? "?"} knots`,
      `Destination: ${vessel.DESTINATION ?? "N/A"}`,
      `Area: ${areaLabel}`,
    ].join(" | ");

    return {
      source: "marine-traffic",
      timestamp: vessel.TIMESTAMP ?? new Date().toISOString(),
      geography: [areaLabel],
      entities: vessel.SHIPNAME ? [vessel.SHIPNAME] : [],
      raw_text: rawText,
      category,
      confidence: 0.7,
    };
  }

  /**
   * Classify a vessel as military or economic based on ship type code.
   * MarineTraffic ship type codes: 35 = military, 70-79 = cargo, 80-89 = tanker.
   */
  private classifyVessel(vessel: MarineTrafficVessel): IngestionCategory {
    const shipType = vessel.SHIPTYPE ?? 0;
    if (shipType === 35) return "military";
    return "economic";
  }

  /**
   * Generate a human-readable label for an area bounding box.
   */
  private describeArea(area: AreaBounds): string {
    if (
      area.latMin === HORMUZ_BOUNDS.latMin &&
      area.latMax === HORMUZ_BOUNDS.latMax &&
      area.lonMin === HORMUZ_BOUNDS.lonMin &&
      area.lonMax === HORMUZ_BOUNDS.lonMax
    ) {
      return "Strait of Hormuz";
    }
    return `Area(${area.latMin}-${area.latMax}N, ${area.lonMin}-${area.lonMax}E)`;
  }
}

/**
 * Factory function for creating a MarineTraffic ingester.
 */
export function createMarineTrafficIngester(apiKey?: string): MarineTrafficIngester {
  const key = apiKey ?? process.env.MARINE_TRAFFIC_API_KEY;
  if (!key) {
    throw new Error(
      "MarineTraffic API key is required. Set MARINE_TRAFFIC_API_KEY or pass apiKey.",
    );
  }
  return new MarineTrafficIngester({ apiKey: key });
}
