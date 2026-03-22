/**
 * SIOS — Dependency Graph
 *
 * Builds and queries dependency graphs across supply chain, political,
 * military, and economic domains. Identifies vulnerabilities and models
 * disruption cascades.
 */

type DependencyType = "supply_chain" | "political" | "military" | "economic";

interface DependencyEdge {
  from: string;
  to: string;
  type: DependencyType;
}

// ── DependencyGraph ──

export class DependencyGraph {
  /** Edges: from → to means "to depends on from" */
  private edges: DependencyEdge[] = [];

  /** Adjacency list: from → [to] (forward: what depends on this node) */
  private forwardAdj: Map<string, Set<string>> = new Map();

  /** Adjacency list: to → [from] (reverse: what this node depends on) */
  private reverseAdj: Map<string, Set<string>> = new Map();

  /** All known nodes */
  private nodes: Set<string> = new Set();

  /**
   * Adds a dependency: `to` depends on `from`.
   * Semantics: "from" provides/enables "to".
   */
  addDependency(
    from: string,
    to: string,
    type: DependencyType
  ): void {
    this.edges.push({ from, to, type });
    this.nodes.add(from);
    this.nodes.add(to);

    if (!this.forwardAdj.has(from)) {
      this.forwardAdj.set(from, new Set());
    }
    this.forwardAdj.get(from)!.add(to);

    if (!this.reverseAdj.has(to)) {
      this.reverseAdj.set(to, new Set());
    }
    this.reverseAdj.get(to)!.add(from);
  }

  /**
   * Returns all nodes that depend on the given node (direct dependents).
   */
  getDependents(node: string): string[] {
    const dependents = this.forwardAdj.get(node);
    return dependents ? Array.from(dependents) : [];
  }

  /**
   * Returns all nodes that the given node depends on (direct dependencies).
   */
  getDependencies(node: string): string[] {
    const dependencies = this.reverseAdj.get(node);
    return dependencies ? Array.from(dependencies) : [];
  }

  /**
   * Identifies vulnerability nodes — those with the most dependents.
   * Sorted by dependent count descending. These are the highest
   * disruption-potential nodes in the graph.
   */
  findVulnerabilities(): Array<{ node: string; dependentCount: number }> {
    const results: Array<{ node: string; dependentCount: number }> = [];

    for (const node of this.nodes) {
      // Count all reachable dependents (transitive), not just direct
      const allDependents = this.getImpactCascade(node);
      if (allDependents.length > 0) {
        results.push({ node, dependentCount: allDependents.length });
      }
    }

    results.sort((a, b) => b.dependentCount - a.dependentCount);
    return results;
  }

  /**
   * BFS traversal of all nodes affected by the disruption of a given node.
   * Returns all transitively dependent nodes.
   */
  getImpactCascade(disruptedNode: string): string[] {
    const visited = new Set<string>();
    const queue: string[] = [disruptedNode];
    const affected: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const dependents = this.forwardAdj.get(current);
      if (dependents) {
        for (const dep of dependents) {
          if (!visited.has(dep)) {
            affected.push(dep);
            queue.push(dep);
          }
        }
      }
    }

    return affected;
  }
}

// ── Pre-built Graph: Semiconductor Supply Chain ──

function buildSemiconductorSupplyChain(): DependencyGraph {
  const graph = new DependencyGraph();

  // Helium supply chain
  graph.addDependency("helium", "chip_cooling", "supply_chain");
  graph.addDependency("chip_cooling", "semiconductor_yield", "supply_chain");

  // Semiconductor manufacturing
  graph.addDependency("semiconductor_yield", "TSMC", "supply_chain");
  graph.addDependency("semiconductor_yield", "Samsung", "supply_chain");
  graph.addDependency("semiconductor_yield", "Intel", "supply_chain");

  // Advanced chip production
  graph.addDependency("TSMC", "AI_chips", "supply_chain");
  graph.addDependency("Samsung", "AI_chips", "supply_chain");
  graph.addDependency("Intel", "AI_chips", "supply_chain");

  // AI compute infrastructure
  graph.addDependency("AI_chips", "training_clusters", "supply_chain");

  // Frontier AI
  graph.addDependency("training_clusters", "frontier_AI", "supply_chain");

  // Additional upstream dependencies
  graph.addDependency("neon_gas", "EUV_lithography", "supply_chain");
  graph.addDependency("EUV_lithography", "semiconductor_yield", "supply_chain");
  graph.addDependency("rare_earths", "chip_components", "supply_chain");
  graph.addDependency("chip_components", "TSMC", "supply_chain");
  graph.addDependency("chip_components", "Samsung", "supply_chain");
  graph.addDependency("chip_components", "Intel", "supply_chain");

  // Energy dependencies
  graph.addDependency("taiwan_power_grid", "TSMC", "economic");
  graph.addDependency("south_korea_power_grid", "Samsung", "economic");

  // Geopolitical dependencies
  graph.addDependency("taiwan_sovereignty", "TSMC", "political");
  graph.addDependency("US_chip_act", "Intel", "political");

  return graph;
}

/**
 * Pre-built semiconductor supply chain dependency graph.
 * Models the chain: helium -> chip_cooling -> semiconductor_yield ->
 * TSMC/Samsung/Intel -> AI_chips -> training_clusters -> frontier_AI
 */
export const SEMICONDUCTOR_SUPPLY_CHAIN: DependencyGraph =
  buildSemiconductorSupplyChain();
