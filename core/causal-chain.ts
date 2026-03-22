/**
 * SIOS — Causal Chain Assembly
 *
 * Links events into cause-effect chains, enabling downstream impact analysis
 * and critical path identification.
 */

import type { CausalNode, CausalEdge, CausalChain } from "./types.js";

// ── CausalChainBuilder ──

export class CausalChainBuilder {
  private eventId: string;
  private nodes: Map<string, CausalNode> = new Map();
  private edges: CausalEdge[] = [];

  constructor(eventId: string) {
    this.eventId = eventId;
  }

  /**
   * Adds a causal node to the chain.
   */
  addNode(node: CausalNode): this {
    this.nodes.set(node.id, node);
    return this;
  }

  /**
   * Adds a causal edge between two nodes.
   */
  addEdge(edge: CausalEdge): this {
    this.edges.push(edge);
    return this;
  }

  /**
   * Builds the final CausalChain object.
   */
  build(): CausalChain {
    return {
      event_id: this.eventId,
      nodes: Array.from(this.nodes.values()),
      edges: [...this.edges],
    };
  }

  /**
   * Returns all nodes reachable downstream from a given node (BFS).
   */
  getDownstream(nodeId: string): CausalNode[] {
    const visited = new Set<string>();
    const queue: string[] = [nodeId];
    const result: CausalNode[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      // Find all edges originating from current
      for (const edge of this.edges) {
        if (edge.from === current && !visited.has(edge.to)) {
          queue.push(edge.to);
          const node = this.nodes.get(edge.to);
          if (node) {
            result.push(node);
          }
        }
      }
    }

    return result;
  }

  /**
   * Returns the critical path — the longest chain of dependencies.
   * Uses DFS from all root nodes (nodes with no incoming edges) and
   * returns the longest path found.
   */
  getCriticalPath(): CausalNode[] {
    // Find root nodes (no incoming edges)
    const hasIncoming = new Set<string>();
    for (const edge of this.edges) {
      hasIncoming.add(edge.to);
    }

    const roots: string[] = [];
    for (const nodeId of this.nodes.keys()) {
      if (!hasIncoming.has(nodeId)) {
        roots.push(nodeId);
      }
    }

    // If no roots found (cycle or empty), start from all nodes
    const startNodes = roots.length > 0 ? roots : Array.from(this.nodes.keys());

    let longestPath: string[] = [];

    const dfs = (current: string, path: string[], visited: Set<string>): void => {
      if (path.length > longestPath.length) {
        longestPath = [...path];
      }

      for (const edge of this.edges) {
        if (edge.from === current && !visited.has(edge.to)) {
          visited.add(edge.to);
          path.push(edge.to);
          dfs(edge.to, path, visited);
          path.pop();
          visited.delete(edge.to);
        }
      }
    };

    for (const root of startNodes) {
      const visited = new Set<string>([root]);
      dfs(root, [root], visited);
    }

    return longestPath
      .map((id) => this.nodes.get(id))
      .filter((n): n is CausalNode => n !== undefined);
  }
}

// ── Worked Example: Hormuz Chain ──

function buildHormuzChain(): CausalChain {
  const builder = new CausalChainBuilder("hormuz-helium-chips-ai");

  builder
    .addNode({
      id: "US_STRIKE",
      entity: "United States",
      action: "Conducts military strike",
      effect: "Iranian nuclear facility damaged",
    })
    .addNode({
      id: "NATANZ_DAMAGED",
      entity: "Iran",
      action: "Natanz facility sustains damage",
      effect: "Nuclear program disrupted, escalation pressure builds",
    })
    .addNode({
      id: "IRAN_ESCALATION",
      entity: "Iran",
      action: "Signals retaliatory escalation",
      effect: "Regional military tension increases",
    })
    .addNode({
      id: "HORMUZ_THREAT",
      entity: "IRGC",
      action: "Threatens closure of Strait of Hormuz",
      effect: "Maritime shipping lanes at risk",
    })
    .addNode({
      id: "LNG_DISRUPTION",
      entity: "Global Energy Markets",
      action: "LNG and energy shipments disrupted",
      effect: "Qatar helium exports blocked",
    })
    .addNode({
      id: "HELIUM_SHORTAGE",
      entity: "Global Semiconductor Industry",
      action: "Helium supply critically reduced",
      effect: "Semiconductor cooling and manufacturing impacted",
    })
    .addNode({
      id: "CHIP_YIELD_DROP",
      entity: "TSMC/Samsung/Intel",
      action: "Chip fabrication yields decline",
      effect: "Advanced chip production decreases",
    })
    .addNode({
      id: "AI_COMPUTE_BOTTLENECK",
      entity: "AI Industry",
      action: "GPU and AI chip supply constrained",
      effect: "Training compute availability reduced",
    })
    .addNode({
      id: "COMPETITIVE_SHIFT",
      entity: "Great Powers",
      action: "AI capability gap widens or narrows",
      effect: "Strategic competitive position shifts",
    });

  builder
    .addEdge({ from: "US_STRIKE", to: "NATANZ_DAMAGED", relation: "damages" })
    .addEdge({ from: "NATANZ_DAMAGED", to: "IRAN_ESCALATION", relation: "signals" })
    .addEdge({ from: "IRAN_ESCALATION", to: "HORMUZ_THREAT", relation: "threatens" })
    .addEdge({ from: "HORMUZ_THREAT", to: "LNG_DISRUPTION", relation: "disrupts" })
    .addEdge({ from: "LNG_DISRUPTION", to: "HELIUM_SHORTAGE", relation: "disrupts" })
    .addEdge({ from: "HELIUM_SHORTAGE", to: "CHIP_YIELD_DROP", relation: "disrupts" })
    .addEdge({ from: "CHIP_YIELD_DROP", to: "AI_COMPUTE_BOTTLENECK", relation: "disrupts" })
    .addEdge({
      from: "AI_COMPUTE_BOTTLENECK",
      to: "COMPETITIVE_SHIFT",
      relation: "signals",
    });

  return builder.build();
}

/**
 * The worked example causal chain:
 * US strike on Iran -> Natanz damaged -> Iran escalation -> Hormuz threat ->
 * LNG disruption -> Helium shortage -> Chip yield drop -> AI compute bottleneck ->
 * Competitive position shift
 */
export const HORMUZ_CHAIN: CausalChain = buildHormuzChain();
