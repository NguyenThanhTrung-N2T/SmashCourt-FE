/**
 * Loyalty Progress Component
 * 
 * Displays loyalty tier information and progress to next tier.
 */

"use client";

import type { MyLoyaltyDto } from "@/src/shared/types/loyalty.types";
import { LoyaltyBadge } from "./LoyaltyBadge";
import { formatPoints } from "../utils";
import { getTierCfg } from "@/src/features/benefit/loyalty/owner/LoyaltyTierConfig";

interface LoyaltyProgressProps {
  loyalty: MyLoyaltyDto;
}

export function LoyaltyProgress({ loyalty }: LoyaltyProgressProps) {
  const tierConfig = getTierCfg(loyalty.tierName);
  const TierIcon = tierConfig.icon;

  return (
    <div 
      className={`rounded-xl border ${tierConfig.cardBorder} ${tierConfig.cardBg} p-6 space-y-6 shadow-sm`}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Hạng thành viên</h3>
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${tierConfig.pillBg}`}>
              <TierIcon className={`h-6 w-6 ${tierConfig.pillText}`} weight="fill" />
            </div>
            <LoyaltyBadge 
              tierName={loyalty.tierName} 
              discountRate={loyalty.discountRate} 
            />
          </div>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold bg-gradient-to-r ${tierConfig.gradientText} bg-clip-text text-transparent`}>
            {formatPoints(loyalty.totalPoints)}
          </p>
          <p className="text-sm text-muted">điểm</p>
        </div>
      </div>
      
      {/* Progress Section */}
      {!loyalty.isMaxTier && loyalty.nextTierName && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Tiến độ lên {loyalty.nextTierName}</span>
            <span className="font-medium text-foreground">{loyalty.progressPercent}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${tierConfig.gradient} transition-all duration-500 ease-out`}
              style={{ width: `${loyalty.progressPercent || 0}%` }}
            />
          </div>
          
          <p className="text-sm text-muted">
            Còn <span className="font-semibold text-foreground">{formatPoints(loyalty.pointsToNextTier || 0)}</span> điểm để lên hạng {loyalty.nextTierName}
          </p>
        </div>
      )}
      
      {/* Max Tier Message */}
      {loyalty.isMaxTier && (
        <div className={`flex items-center gap-3 rounded-lg ${tierConfig.pillBg} p-4`}>
          <TierIcon className={`h-6 w-6 ${tierConfig.pillText}`} weight="fill" />
          <p className={`font-semibold ${tierConfig.pillText}`}>Bạn đã đạt hạng cao nhất!</p>
        </div>
      )}
    </div>
  );
}
