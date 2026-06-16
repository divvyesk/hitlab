import type { HitTier } from "@/lib/prediction-schema";

export const TIER_CHART_WEEKS: Record<HitTier, string> = {
  SHORT: "1–2 weeks",
  MODERATE: "3–4 weeks",
  SUSTAINED: "5+ weeks",
};

export function formatTierLabel(tier: HitTier): string {
  const weeks = TIER_CHART_WEEKS[tier];
  return weeks ? `${tier} (${weeks})` : tier;
}
