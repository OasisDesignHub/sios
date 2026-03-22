/**
 * SIOS — News API Aggregator
 *
 * Fetches headlines from wire services and state media via NewsAPI.org.
 * Used for narrative analysis, event detection, and cross-referencing
 * with other intelligence sources.
 */

import type { RawIntelligenceItem, IngestionCategory } from "../../core/types.js";
import type { IngestionResult } from "../types.js";

const NEWS_API_BASE = "https://newsapi.org/v2";

const DEFAULT_SOURCES = ["reuters", "associated-press", "bbc-news"];

const STATE_MEDIA_SOURCES = ["rt", "xinhua-net", "al-jazeera-english"];

interface NewsAPIArticle {
  title?: string;
  description?: string;
  url?: string;
  publishedAt?: string;
  source?: { id?: string; name?: string };
  author?: string;
  content?: string;
  [key: string]: unknown;
}

interface NewsAPIResponse {
  status: string;
  totalResults?: number;
  articles?: NewsAPIArticle[];
  code?: string;
  message?: string;
}

export class NewsIngester {
  private apiKey: string;

  constructor(opts: { apiKey: string }) {
    this.apiKey = opts.apiKey;
  }

  /**
   * Fetch top headlines matching a query, optionally filtered by sources.
   */
  async fetchHeadlines(query?: string, sources?: string[]): Promise<IngestionResult> {
    if (!this.apiKey) {
      return {
        source: "news-api",
        items: [],
        fetchedAt: new Date().toISOString(),
        errors: ["NewsAPI key is required but was not provided."],
      };
    }

    const sourceList = (sources ?? DEFAULT_SOURCES).join(",");
    const params = new URLSearchParams({
      sources: sourceList,
      apiKey: this.apiKey,
      pageSize: "50",
    });

    if (query) {
      params.set("q", query);
    }

    const url = `${NEWS_API_BASE}/top-headlines?${params.toString()}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        return {
          source: "news-api",
          items: [],
          fetchedAt: new Date().toISOString(),
          errors: [`NewsAPI returned HTTP ${response.status}: ${response.statusText}`],
        };
      }

      const data = (await response.json()) as NewsAPIResponse;

      if (data.status !== "ok") {
        return {
          source: "news-api",
          items: [],
          fetchedAt: new Date().toISOString(),
          errors: [`NewsAPI error: ${data.code ?? "unknown"} — ${data.message ?? ""}`],
        };
      }

      const articles = data.articles ?? [];
      const items = articles.map((a) => this.mapToIntelligenceItem(a));

      return {
        source: "news-api",
        items,
        fetchedAt: new Date().toISOString(),
      };
    } catch (err) {
      return {
        source: "news-api",
        items: [],
        fetchedAt: new Date().toISOString(),
        errors: [`NewsAPI fetch failed: ${err instanceof Error ? err.message : String(err)}`],
      };
    }
  }

  /**
   * Fetch headlines from known state media sources for narrative analysis.
   */
  async fetchStateMedia(): Promise<IngestionResult> {
    return this.fetchHeadlines(undefined, STATE_MEDIA_SOURCES);
  }

  /**
   * Map a NewsAPI article to a RawIntelligenceItem.
   */
  private mapToIntelligenceItem(article: NewsAPIArticle): RawIntelligenceItem {
    const sourceName = article.source?.name ?? article.source?.id ?? "unknown";
    const isStateMedia = this.isStateMedia(article.source?.id);
    const text = article.title ?? article.description ?? "";
    const category = this.inferCategory(text, isStateMedia);

    return {
      source: `news-api:${sourceName}`,
      timestamp: article.publishedAt ?? new Date().toISOString(),
      geography: this.extractGeography(text),
      entities: this.extractEntities(text),
      raw_text: text,
      category,
      confidence: isStateMedia ? 0.4 : 0.7,
      source_url: article.url,
    };
  }

  /**
   * Check if a source ID belongs to a state-controlled media outlet.
   */
  private isStateMedia(sourceId?: string): boolean {
    if (!sourceId) return false;
    return STATE_MEDIA_SOURCES.includes(sourceId);
  }

  /**
   * Infer the intelligence category from article text.
   */
  private inferCategory(text: string, isStateMedia: boolean): IngestionCategory {
    if (isStateMedia) return "narrative";

    const lower = text.toLowerCase();
    if (/military|weapon|strike|attack|defense|troops|war/.test(lower)) return "military";
    if (/sanction|trade|tariff|economy|gdp|market|oil|gas/.test(lower)) return "economic";
    if (/cyber|ai\b|semiconductor|chip|tech|quantum/.test(lower)) return "technology";
    if (/propaganda|disinformation|narrative|influence/.test(lower)) return "narrative";
    return "geopolitical";
  }

  /**
   * Naive geography extraction — looks for known region/country keywords.
   */
  private extractGeography(text: string): string[] {
    const regions = [
      "China", "Russia", "Iran", "Taiwan", "Ukraine", "Israel",
      "North Korea", "Saudi Arabia", "India", "Pakistan", "Syria",
      "United States", "EU", "NATO", "Middle East", "South China Sea",
      "Strait of Hormuz", "Arctic", "Africa",
    ];
    return regions.filter((r) => text.includes(r));
  }

  /**
   * Naive entity extraction from headlines.
   */
  private extractEntities(text: string): string[] {
    const matches = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g);
    return matches ? [...new Set(matches)] : [];
  }
}

/**
 * Factory function for creating a News ingester.
 */
export function createNewsIngester(apiKey?: string): NewsIngester {
  const key = apiKey ?? process.env.NEWS_API_KEY;
  if (!key) {
    throw new Error("NewsAPI key is required. Set NEWS_API_KEY or pass apiKey.");
  }
  return new NewsIngester({ apiKey: key });
}
