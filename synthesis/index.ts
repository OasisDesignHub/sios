/**
 * SIOS — Synthesis Layer
 *
 * Re-exports all synthesis modules for convenient consumption.
 */

export { analyzeConvergence } from "./convergence-engine.js";
export type { ConvergenceMatrix } from "./convergence-engine.js";

export { generateScenarios } from "./scenario-generator.js";

export { synthesize } from "./narrative-synthesizer.js";
