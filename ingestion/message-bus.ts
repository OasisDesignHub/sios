/**
 * SIOS — In-Process Message Bus
 *
 * Simple pub/sub event bus for routing RawIntelligenceItems by category.
 * Phase 1: in-process only (no Kafka dependency).
 */

import type { IngestionCategory, RawIntelligenceItem } from "../core/types.js";

export class MessageBus {
  private handlers: Map<IngestionCategory, Set<(item: RawIntelligenceItem) => void>> = new Map();

  /**
   * Subscribe to intelligence items of a specific category.
   */
  subscribe(category: IngestionCategory, handler: (item: RawIntelligenceItem) => void): void {
    const existing = this.handlers.get(category);
    if (existing) {
      existing.add(handler);
    } else {
      this.handlers.set(category, new Set([handler]));
    }
  }

  /**
   * Publish a single intelligence item, routing to all handlers
   * registered for the item's category.
   */
  publish(item: RawIntelligenceItem): void {
    const categoryHandlers = this.handlers.get(item.category);
    if (!categoryHandlers) return;

    for (const handler of categoryHandlers) {
      try {
        handler(item);
      } catch (err) {
        console.error(
          `[MessageBus] Handler error for category "${item.category}":`,
          err,
        );
      }
    }
  }

  /**
   * Publish a batch of intelligence items. Each item is routed
   * to handlers matching its category.
   */
  publishBatch(items: RawIntelligenceItem[]): void {
    for (const item of items) {
      this.publish(item);
    }
  }
}

/** Singleton message bus instance for the ingestion pipeline. */
export const messageBus = new MessageBus();
