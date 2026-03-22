/**
 * SIOS — Russia Competitor Profile
 *
 * Revisionist disruptor.  Nuclear parity maintained but conventional
 * capability and economic position degraded by the Ukraine conflict.
 */

import type { CompetitorProfile } from "../../core/types.js";

export const RUSSIA_PROFILE: CompetitorProfile = {
  id: "RUS",
  name: "Russian Federation",
  designation: "secondary",
  domains: {
    military: {
      score: 4,
      trend: "declining",
      key_factors: [
        "Nuclear parity maintained",
        "Conventional forces degraded post-Ukraine",
      ],
    },
    economic: {
      score: -1,
      trend: "declining",
      key_factors: [
        "Sanctions impact",
        "Brain drain",
        "Resource dependency",
      ],
    },
    technology: {
      score: 2,
      trend: "declining",
      key_factors: [
        "Space legacy",
        "Cyber capability",
        "But talent exodus",
      ],
    },
    narrative: {
      score: 5,
      trend: "stable",
      key_factors: [
        "RT/Sputnik reach",
        "Disinformation expertise",
        "Exploitation of Western divisions",
      ],
    },
    alliance: {
      score: 2,
      trend: "declining",
      key_factors: [
        "Central Asia drift",
        "China junior partner dynamic",
      ],
    },
    supply_chain: {
      score: 3,
      trend: "stable",
      key_factors: [
        "Energy leverage (diminishing)",
        "Grain exports",
        "Arctic route",
      ],
    },
    demographic: {
      score: -4,
      trend: "declining",
      key_factors: [
        "Population decline",
        "War casualties",
        "Emigration wave",
      ],
    },
  },
};
