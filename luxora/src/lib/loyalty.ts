export type LoyaltyTierId = "silver" | "gold" | "platinum";

export type LoyaltyTier = {
  id: LoyaltyTierId;
  name: string;
  minPoints: number;
  nextTier: LoyaltyTierId | null;
  nextTierName: string | null;
  nextTierPoints: number | null;
};

export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    id: "silver",
    name: "Silver Member",
    minPoints: 0,
    nextTier: "gold",
    nextTierName: "Gold Member",
    nextTierPoints: 1000,
  },
  {
    id: "gold",
    name: "Gold Member",
    minPoints: 1000,
    nextTier: "platinum",
    nextTierName: "Platinum Member",
    nextTierPoints: 5000,
  },
  {
    id: "platinum",
    name: "Platinum Member",
    minPoints: 5000,
    nextTier: null,
    nextTierName: null,
    nextTierPoints: null,
  },
];

export const LOYALTY_BENEFITS = [
  "Free shipping on all orders",
  "Early access to new releases",
  "Birthday gift & exclusive offers",
  "Priority customer support",
];

/** 2 loyalty points earned per $1 spent on qualifying orders */
export function computeLoyaltyPoints(totalSpent: number) {
  return Math.floor(totalSpent * 2);
}

export function getLoyaltyTier(points: number): LoyaltyTier {
  if (points >= 5000) return LOYALTY_TIERS[2];
  if (points >= 1000) return LOYALTY_TIERS[1];
  return LOYALTY_TIERS[0];
}

export function getLoyaltyProgress(points: number) {
  const tier = getLoyaltyTier(points);

  if (!tier.nextTierPoints) {
    return {
      tier,
      current: points,
      target: tier.minPoints,
      progressPercent: 100,
      pointsToNext: 0,
    };
  }

  const rangeStart = tier.minPoints;
  const rangeEnd = tier.nextTierPoints;
  const progress = Math.min(
    100,
    Math.round(((points - rangeStart) / (rangeEnd - rangeStart)) * 100)
  );

  return {
    tier,
    current: points,
    target: rangeEnd,
    progressPercent: progress,
    pointsToNext: Math.max(0, rangeEnd - points),
  };
}

export function getInitials(name: string, email: string) {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}
