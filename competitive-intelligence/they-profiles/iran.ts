/**
 * SIOS — Iran Competitor Profile
 *
 * Regional spoiler.  Asymmetric capability through proxy networks,
 * drone/missile programs, and Hormuz chokepoint leverage.
 */

import type { CompetitorProfile } from "../../core/types.js";

export const IRAN_PROFILE: CompetitorProfile = {
  id: "IRN",
  name: "Islamic Republic of Iran",
  designation: "secondary",
  domains: {
    military: {
      score: 2,
      trend: "stable",
      key_factors: [
        "Proxy network (Hezbollah, Houthis, PMF)",
        "Drone/missile program",
        "Hormuz leverage",
      ],
    },
    economic: {
      score: -3,
      trend: "declining",
      key_factors: [
        "Sanctions-constrained",
        "Oil dependency",
        "Inflation crisis",
      ],
    },
    technology: {
      score: 1,
      trend: "improving",
      key_factors: [
        "Nuclear enrichment capacity",
        "Drone exports",
        "Cyber operations",
      ],
    },
    narrative: {
      score: 3,
      trend: "stable",
      key_factors: [
        "Axis of resistance brand",
        "IRNA/PressTV",
        "Regional Shia network",
      ],
    },
    alliance: {
      score: 2,
      trend: "stable",
      key_factors: [
        "Russia military cooperation",
        "China economic lifeline",
        "Proxy network",
      ],
    },
    supply_chain: {
      score: 1,
      trend: "stable",
      key_factors: [
        "Hormuz chokepoint leverage",
        "Limited diversification",
      ],
    },
    demographic: {
      score: 0,
      trend: "stable",
      key_factors: [
        "Young population but brain drain",
        "Urbanization challenges",
      ],
    },
  },
};
