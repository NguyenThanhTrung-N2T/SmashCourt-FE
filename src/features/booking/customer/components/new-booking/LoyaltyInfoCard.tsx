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

const TIER_CONFIG: Record<string, { bg: string; text: string; border: string; gradient: string; bar: string }> = {
  Bronze: {
    bg: "bg-amber-900/10",
    text: "text-amber-600",
    border: "border-amber-600/20",
    gradient: "from-amber-600/10 via-amber-600/5 to-transparent",
    bar: "bg-amber-600"
  },
  Silver: {
    bg: "bg-slate-400/10",
    text: "text-slate-400",
    border: "border-slate-400/20",
    gradient: "from-slate-400/10 via-slate-400/5 to-transparent",
    bar: "bg-slate-400"
  },
  Gold: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-500",
    border: "border-yellow-500/20",
    gradient: "from-yellow-500/15 via-yellow-500/5 to-transparent",
    bar: "bg-yellow-500"
  },
  Platinum: {
    bg: "bg-cyan-400/10",
    text: "text-cyan-400",
    border: "border-cyan-400/20",
    gradient: "from-cyan-400/15 via-cyan-400/5 to-transparent",
    bar: "bg-cyan-400"
  },
  Diamond: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/20",
    gradient: "from-purple-500/15 via-purple-500/5 to-transparent",
    bar: "bg-purple-500"
  },
};

export function LoyaltyInfoCard({ loyaltyInfo, loyaltyDiscount }: LoyaltyInfoCardProps) {
  const tier = TIER_CONFIG[loyaltyInfo.tierName] || TIER_CONFIG.Bronze;

  return (
    <div className={`relative overflow-hidden rounded-xl border ${tier.border} bg-surface-2 p-3.5 shadow-sm transition-all duration-300`}>
      {/* Background Gradient Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} pointer-events-none`} />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <Crown className={`h-3.5 w-3.5 ${tier.text}`} weight="fill" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
              Hạng thành viên
            </h3>
          </div>

          <div className="flex items-baseline gap-2">
            <p className={`text-lg font-black tracking-tight ${tier.text}`}>
              {loyaltyInfo.tierName}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground/60">
              • Giảm {loyaltyInfo.discountRate}%
            </p>
          </div>

          {!loyaltyInfo.isMaxTier && loyaltyInfo.nextTierName && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/70">
                  <TrendUp className="h-3 w-3" />
                  <span>
                    Còn <span className="text-foreground font-semibold">{loyaltyInfo.pointsToNextTier}</span> điểm để lên <span className={tier.text}>{loyaltyInfo.nextTierName}</span>
                  </span>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground/40 tabular-nums">
                  {loyaltyInfo.progressPercent || 0}%
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-surface-0/50 ring-1 ring-white/5">
                <div
                  className={`h-full ${tier.bar} transition-all duration-500 ease-out shadow-[0_0_8px_rgba(0,0,0,0.2)]`}
                  style={{ width: `${loyaltyInfo.progressPercent || 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {loyaltyDiscount > 0 && (
          <div className="flex flex-col items-end justify-center self-stretch border-l border-border/40 pl-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-0.5">Tiết kiệm</p>
            <p className={`text-lg font-black ${tier.text} tabular-nums`}>
              -{loyaltyDiscount.toLocaleString("vi-VN")} đ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
