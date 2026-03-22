/**
 * SIOS — Anomaly Detection
 *
 * Detects deviations from baseline patterns using a Z-score approach.
 * Tracks rolling baselines per metric and flags values that exceed
 * configurable standard-deviation thresholds.
 */

// ── Types ──

export interface AnomalyResult {
  metric: string;
  currentValue: number;
  baselineAvg: number;
  deviationPercent: number;
  isAnomaly: boolean;
  severity: "low" | "medium" | "high" | "critical";
}

// ── AnomalyDetector ──

export class AnomalyDetector {
  private baselines: Map<string, number[]> = new Map();
  private windowSize: number;

  constructor(windowSize: number = 90) {
    this.windowSize = windowSize;
  }

  /**
   * Records a baseline value for a given metric.
   * Maintains a rolling window of the most recent values.
   */
  recordBaseline(metric: string, value: number): void {
    if (!this.baselines.has(metric)) {
      this.baselines.set(metric, []);
    }

    const values = this.baselines.get(metric)!;
    values.push(value);

    // Trim to window size
    if (values.length > this.windowSize) {
      values.splice(0, values.length - this.windowSize);
    }
  }

  /**
   * Checks whether the current value is anomalous relative to the baseline.
   * Uses Z-score: flags as anomaly if |z| > 2.
   *
   * Severity thresholds:
   *   |z| > 4  → critical
   *   |z| > 3  → high
   *   |z| > 2  → medium
   *   |z| > 1  → low (not flagged as anomaly, but deviation noted)
   */
  checkAnomaly(metric: string, currentValue: number): AnomalyResult {
    const values = this.baselines.get(metric);

    // If no baseline data, treat as non-anomalous with zero baseline
    if (!values || values.length === 0) {
      return {
        metric,
        currentValue,
        baselineAvg: 0,
        deviationPercent: 0,
        isAnomaly: false,
        severity: "low",
      };
    }

    const mean = this.computeMean(values);
    const stddev = this.computeStdDev(values, mean);

    // Compute deviation percentage
    const deviationPercent =
      mean !== 0 ? ((currentValue - mean) / Math.abs(mean)) * 100 : 0;

    // If stddev is zero (all values identical), any different value is anomalous
    if (stddev === 0) {
      const isAnomaly = currentValue !== mean;
      return {
        metric,
        currentValue,
        baselineAvg: mean,
        deviationPercent,
        isAnomaly,
        severity: isAnomaly ? "critical" : "low",
      };
    }

    const zScore = Math.abs((currentValue - mean) / stddev);
    const isAnomaly = zScore > 2;
    const severity = this.zScoreToSeverity(zScore);

    return {
      metric,
      currentValue,
      baselineAvg: mean,
      deviationPercent,
      isAnomaly,
      severity,
    };
  }

  // ── Private Helpers ──

  private computeMean(values: number[]): number {
    const sum = values.reduce((acc, v) => acc + v, 0);
    return sum / values.length;
  }

  private computeStdDev(values: number[], mean: number): number {
    const squaredDiffs = values.map((v) => (v - mean) ** 2);
    const variance =
      squaredDiffs.reduce((acc, v) => acc + v, 0) / values.length;
    return Math.sqrt(variance);
  }

  private zScoreToSeverity(
    zScore: number
  ): "low" | "medium" | "high" | "critical" {
    if (zScore > 4) return "critical";
    if (zScore > 3) return "high";
    if (zScore > 2) return "medium";
    return "low";
  }
}

// ── Factory ──

/**
 * Creates a new AnomalyDetector with the specified rolling window size.
 * @param windowSize Number of baseline values to retain (default: 90)
 */
export function createAnomalyDetector(windowSize?: number): AnomalyDetector {
  return new AnomalyDetector(windowSize);
}
