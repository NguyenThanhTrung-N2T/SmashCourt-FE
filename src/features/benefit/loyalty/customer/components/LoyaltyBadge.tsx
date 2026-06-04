/**
 * Loyalty Badge Component
 * 
 * Displays tier name and discount rate in a colored badge.
 */

import type { TierName } from "@/src/features/benefit/loyalty/shared/types/loyalty.types";
import { getTierCfg } from "@/src/features/benefit/loyalty/shared/configs/loyalty-tier.config";

interface LoyaltyBadgeProps {
  tierName: TierName;
  discountRate: number;
}

export function LoyaltyBadge({ tierName, discountRate }: LoyaltyBadgeProps) {
  const tierConfig = getTierCfg(tierName);
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${tierConfig.gradient} text-white shadow-sm`}
    >
      <span className="font-bold text-sm">{tierName}</span>
      {discountRate > 0 && (
        <>
          <span className="text-white/60 opacity-40">•</span>
          <span className="text-sm font-semibold">-{discountRate}%</span>
        </>
      )}
    </div>
  );
}
