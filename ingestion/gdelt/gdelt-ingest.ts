/**
 * SIOS — GDELT (Global Database of Events, Language, Tone) Connector
 *
 * Fetches articles and geopolitical events from the GDELT v2 DOC API.
 * GDELT v2 is partially free; an API key is optional for basic queries.
 */

import type { RawIntelligenceItem, IngestionCategory } from "../../core/types.js";
import type { IngestionResult } from "../types.js";

const GDELT_DOC_API = "https://api.gdeltproject.org/api/v2/doc/doc";
const DEFAULT_QUERY = "conflict OR military OR sanctions";

interface GDELTArticle {
  url?: string;
  title?: string;
  seendate?: string;
  domain?: string;
  language?: string;
  sourcecountry?: string;
  socialimage?: string;
  [key: string]: unknown;
}

interface GDELTResponse {
  articles?: GDELTArticle[];
  [key: string]: unknown;
}

export class GDELTIngester {
  private apiKey?: string;

  constructor(opts: { apiKey?: string } = {}) {
    this.apiKey = opts.apiKey;
  }

  /**
   * Fetch articles from the GDELT DOC API matching a keyword query.
   */
  async fetchEvents(query?: string): Promise<IngestionResult> {
    const searchQuery = query ?? DEFAULT_QUERY;
    const params = new URLSearchParams({
      query: searchQuery,
      mode: "ArtList",
      format: "json",
      maxrecords: "50",
    });

    if (this.apiKey) {
      params.set("apikey", this.apiKey);
    }

    const url = `${GDELT_DOC_API}?${params.toString()}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        return {
          source: "gdelt",
          items: [],
          fetchedAt: new Date().toISOString(),
          errors: [`GDELT API returned HTTP ${response.status}: ${response.statusText}`],
        };
      }

      const data = (await response.json()) as GDELTResponse;
      const articles = data.articles ?? [];
      const items = articles.map((a) => this.mapToIntelligenceItem(a));

      return {
        source: "gdelt",
        items,
        fetchedAt: new Date().toISOString(),
      };
    } catch (err) {
      return {
        source: "gdelt",
        items: [],
        fetchedAt: new Date().toISOString(),
        errors: [`GDELT fetch failed: ${err instanceof Error ? err.message : String(err)}`],
      };
    }
  }

  /**
   * Fetch events near a geographic location within a radius.
   */
  async fetchGeoEvents(lat: number, lon: number, radiusKm: number): Promise<IngestionResult> {
    const geoQuery = `near:${lat},${lon} within:${radiusKm}km`;
    return this.fetchEvents(geoQuery);
  }

  /**
   * Map a raw GDELT article object to a RawIntelligenceItem.
   */
  private mapToIntelligenceItem(article: GDELTArticle): RawIntelligenceItem {
    const geography: string[] = [];
    if (article.sourcecountry) {
      geography.push(article.sourcecountry);
    }

    const category = this.inferCategory(article.title ?? "");

    return {
      source: "gdelt",
      timestamp: article.seendate
        ? this.parseGDELTDate(article.seendate)
        : new Date().toISOString(),
      geography,
      entities: this.extractEntities(article.title ?? ""),
      raw_text: article.title ?? "",
      category,
      confidence: 0.6,
      source_url: article.url,
    };
  }

  /**
   * Parse GDELT's date format (YYYYMMDDHHmmss) into ISO 8601.
   */
  private parseGDELTDate(dateStr: string): string {
    const cleaned = dateStr.replace(/T/g, "").replace(/Z/g, "");
    if (cleaned.length >= 14) {
      const y = cleaned.slice(0, 4);
      const m = cleaned.slice(4, 6);
      const d = cleaned.slice(6, 8);
      const h = cleaned.slice(8, 10);
      const min = cleaned.slice(10, 12);
      const s = cleaned.slice(12, 14);
      return `${y}-${m}-${d}T${h}:${min}:${s}Z`;
    }
    return new Date().toISOString();
  }

  /**
   * Infer an ingestion category from article text.
   */
  private inferCategory(text: string): IngestionCategory {
    const lower = text.toLowerCase();
    if (/military|weapon|strike|attack|defense|troops/.test(lower)) return "military";
    if (/sanction|trade|tariff|economy|gdp|market/.test(lower)) return "economic";
    if (/cyber|ai\b|semiconductor|chip|tech/.test(lower)) return "technology";
    if (/propaganda|disinformation|narrative|media/.test(lower)) return "narrative";
    return "geopolitical";
  }

  /**
   * Naive entity extraction from a headline — pulls capitalized multi-word sequences.
   */
  private extractEntities(text: string): string[] {
    const matches = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g);
    return matches ? [...new Set(matches)] : [];
  }
}

/**
 * Factory function for creating a GDELT ingester.
 */
export function createGDELTIngester(apiKey?: string): GDELTIngester {
  return new GDELTIngester({ apiKey: apiKey ?? process.env.GDELT_API_KEY });
}
