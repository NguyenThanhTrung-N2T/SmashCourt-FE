/**
 * Loyalty Info Card Component
 * 
 * Displays customer's loyalty tier information and discount rate.
 */

"use client";

import { Crown, TrendUp } from "@phosphor-icons/react/dist/ssr";
import type { MyLoyaltyDto } from "@/src/features/benefit/loyalty/shared/types/loyalty.types";

interface LoyaltyInfoCardProps {
  loyaltyInfo: MyLoyaltyDto;
  loyaltyDiscount: number;
}

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: "bg-amber-900/10", text: "text-amber-700", border: "border-amber-700/30" },
  Silver: { bg: "bg-gray-400/10", text: "text-gray-600", border: "border-gray-400/30" },
  Gold: { bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-yellow-500/30" },
  Platinum: { bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-cyan-500/30" },
  Diamond: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/30" },
};

export function LoyaltyInfoCard({ loyaltyInfo, loyaltyDiscount }: LoyaltyInfoCardProps) {
  const tierColor = TIER_COLORS[loyaltyInfo.tierName] || TIER_COLORS.Bronze;

  return (
    <div className={`rounded-xl border ${tierColor.border} ${tierColor.bg} p-4`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Crown className={`h-5 w-5 ${tierColor.text}`} weight="fill" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Hạng thành viên
            </h3>
          </div>
          <p className={`text-xl font-bold ${tierColor.text}`}>
            {loyaltyInfo.tierName}
          </p>
          <p className="mt-1 text-sm text-muted">
            Giảm giá: {loyaltyInfo.discountRate}%
          </p>

          {!loyaltyInfo.isMaxTier && loyaltyInfo.nextTierName && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted">
                <TrendUp className="h-3 w-3" />
                <span>
                  Còn {loyaltyInfo.pointsToNextTier} điểm để lên {loyaltyInfo.nextTierName}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-0">
                <div
                  className={`h-full ${tierColor.bg} transition-all duration-300`}
                  style={{ width: `${loyaltyInfo.progressPercent || 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {loyaltyDiscount > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted">Giảm giá</p>
            <p className={`text-lg font-bold ${tierColor.text}`}>
              -{loyaltyDiscount.toLocaleString("vi-VN")} đ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
