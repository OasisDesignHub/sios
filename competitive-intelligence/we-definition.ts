/**
 * SIOS — "WE" Coalition Definition
 *
 * Configurable definition of the allied coalition whose competitive position
 * the system is designed to monitor and improve.  The default baseline is the
 * Five Eyes core with concentric rings of alliance, economic, and institutional
 * partnerships.
 */

export interface WeDefinition {
  /** Core intelligence-sharing alliance (Five Eyes) */
  core: string[];
  /** Extended security alliance (NATO core + Indo-Pacific treaty allies) */
  extended: string[];
  /** Economic bloc (dollar system, SWIFT, semiconductor alliance) */
  economic: string[];
  /** Institutional order (multilateral bodies and normative frameworks) */
  institutional: string[];
}

export const DEFAULT_WE: WeDefinition = {
  core: [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "New Zealand",
  ],
  extended: [
    "France",
    "Germany",
    "Netherlands",
    "Poland",
    "Norway",
    "Denmark",
    "Italy",
    "Spain",
    "Japan",
    "South Korea",
    "Taiwan",
  ],
  economic: [
    "United States",
    "European Union",
    "Japan",
    "South Korea",
    "Taiwan",
    "United Kingdom",
    "Switzerland",
    "Singapore",
  ],
  institutional: [
    "UN Security Council (Western seats)",
    "NATO",
    "G7",
    "IMF / World Bank (Bretton Woods)",
    "SWIFT",
    "Liberal democratic normative order",
  ],
};

/**
 * Returns a prose summary of the WE coalition suitable for injection into
 * agent system prompts.
 */
export function getWeDescription(we: WeDefinition = DEFAULT_WE): string {
  const coreList = we.core.join(", ");
  const extendedList = we.extended.join(", ");
  const econList = we.economic.join(", ");
  const instList = we.institutional.join(", ");

  return [
    `Core alliance (Five Eyes): ${coreList}.`,
    `Extended security partners: ${extendedList}.`,
    `Economic bloc: ${econList}.`,
    `Institutional anchors: ${instList}.`,
    "",
    "Assess all events from the perspective of this coalition's competitive",
    "position — military, economic, technological, narrative, alliance,",
    "supply-chain, and demographic domains.",
  ].join("\n");
}
