/**
 * SIOS — PRC Competitor Profile
 *
 * Primary peer competitor.  Near-peer across military, economic, and
 * technology domains with significant supply-chain leverage.
 */

import type { CompetitorProfile } from "../../core/types.js";

export const CHINA_PROFILE: CompetitorProfile = {
  id: "PRC",
  name: "People's Republic of China",
  designation: "primary",
  domains: {
    military: {
      score: 6,
      trend: "improving",
      key_factors: [
        "Rapid naval expansion",
        "A2/AD capability",
        "Space/cyber investment",
      ],
    },
    economic: {
      score: 7,
      trend: "improving",
      key_factors: [
        "Second largest GDP",
        "BRI infrastructure",
        "Manufacturing dominance",
      ],
    },
    technology: {
      score: 6,
      trend: "improving",
      key_factors: [
        "AI investment",
        "Quantum research",
        "Semiconductor push",
        "5G deployment",
      ],
    },
    narrative: {
      score: 4,
      trend: "stable",
      key_factors: [
        "State media reach",
        "Wolf warrior diplomacy",
        "Diaspora networks",
      ],
    },
    alliance: {
      score: 3,
      trend: "improving",
      key_factors: [
        "SCO",
        "BRICS expansion",
        "Bilateral security deals",
      ],
    },
    supply_chain: {
      score: 7,
      trend: "improving",
      key_factors: [
        "Rare earth dominance",
        "Manufacturing base",
        "Port control via BRI",
      ],
    },
    demographic: {
      score: -2,
      trend: "declining",
      key_factors: [
        "Aging population",
        "Birth rate crisis",
        "Urbanization strain",
      ],
    },
  },
};
