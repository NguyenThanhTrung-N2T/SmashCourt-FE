/**
 * Promotion Selector Component
 * 
 * Allows customers to select a promotion for their booking.
 */

"use client";

import { Tag, Check, Ticket, CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { formatDiscountDisplay } from "@/src/api/promotion.api";
import { formatDate } from "@/src/shared/utils/dateFormatter";
import type { ApplicablePromotion } from "@/src/features/benefit/promotion/shared/types/promotion.types";
import { SmartImage } from "@/src/shared/components/ui/SmartImage";

interface PromotionSelectorProps {
  promotions: ApplicablePromotion[];
  isLoading?: boolean;
  error?: string | null;
  selectedPromotionId: string | null;
  onSelectPromotion: (promotionId: string | null) => void;
  promotionDiscount: number;
}

export function PromotionSelector({
  promotions,
  isLoading = false,
  error,
  selectedPromotionId,
  onSelectPromotion,
  promotionDiscount,
}: PromotionSelectorProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface-2 p-6">
        <div className="flex flex-col items-center justify-center gap-3 text-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium">Đang tìm khuyến mãi phù hợp...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <div className="flex items-center gap-2 text-red-600">
          <Tag className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface-2 p-6 text-center">
        <div className="flex flex-col items-center gap-2 text-muted">
          <Tag className="h-8 w-8 opacity-20" weight="duotone" />
          <p className="text-sm">Hiện không có khuyến mãi khả dụng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" weight="fill" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
            Chọn mã khuyến mãi
          </h3>
        </div>
        {selectedPromotionId && promotionDiscount > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
            <Check className="h-3.5 w-3.5" weight="bold" />
            <span>Tiết kiệm {promotionDiscount.toLocaleString("vi-VN")} đ</span>
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {/* No promotion option */}
        <button
          type="button"
          onClick={() => onSelectPromotion(null)}
          className={`group flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${selectedPromotionId === null
            ? "border-primary bg-primary/5 ring-1 ring-primary"
            : "border-border bg-surface-1 hover:border-primary/50 hover:bg-surface-2"
            }`}
        >
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg border transition-colors ${selectedPromotionId === null ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-surface-2 text-muted"}`}>
              <Ticket className="h-6 w-6" weight={selectedPromotionId === null ? "fill" : "regular"} />
            </div>
            <div>
              <span className={`block font-bold ${selectedPromotionId === null ? "text-primary" : "text-foreground"}`}>
                Không sử dụng khuyến mãi
              </span>
              <p className="text-xs text-muted">Bỏ chọn các mã giảm giá hiện có</p>
            </div>
          </div>
          {selectedPromotionId === null && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
              <Check className="h-4 w-4" weight="bold" />
            </div>
          )}
        </button>

        {/* Promotion options */}
        {promotions.map((promotion) => (
          <button
            key={promotion.id}
            type="button"
            onClick={() => onSelectPromotion(promotion.id)}
            className={`group relative flex w-full flex-row items-center overflow-hidden rounded-2xl border transition-all duration-200 ${selectedPromotionId === promotion.id
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-border bg-surface-1 hover:border-primary/50 hover:bg-surface-2"
              } p-3 text-left`}
          >
            {/* Left Side: Square Image */}
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border/50 bg-primary/5">
              {promotion.promoDisplayUrl ? (
                <SmartImage
                  src={promotion.promoDisplayUrl}
                  alt={promotion.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary/40">
                  <div className="absolute inset-0 opacity-[0.08]"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '10px 10px' }}
                  />
                  <Ticket className="h-7 w-7 mb-0.5" weight="duotone" />
                  <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Ưu đãi</span>
                </div>
              )}
              {selectedPromotionId === promotion.id && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <div className="bg-primary text-white rounded-full p-1 shadow-lg">
                    <Check className="h-4 w-4" weight="bold" />
                  </div>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="ml-4 flex flex-1 flex-col justify-center min-w-0 pr-1">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="line-clamp-1 text-sm font-bold text-foreground" title={promotion.name}>
                  {promotion.name}
                </h3>
                {promotion.code && (
                  <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary border border-primary/20">
                    {promotion.code}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-primary leading-none">
                  {formatDiscountDisplay(promotion)}
                </span>
                <div className="h-3 w-[1px] bg-border" />
                <span className="text-xs font-semibold text-primary">
                  -{promotion.discountAmount.toLocaleString("vi-VN")} đ
                </span>
              </div>

              {promotion.description && (
                <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                  {promotion.description}
                </p>
              )}

              <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2">
                <div className="flex items-center text-muted-foreground text-[10px] font-medium">
                  <CalendarBlank className="mr-1 h-3 w-3" />
                  <span className="truncate">Hạn: {formatDate(promotion.endDate)}</span>
                </div>

                {promotion.usagePerUserLimit && (
                  <span className="text-[10px] font-bold text-primary/80">
                    {promotion.remainingUserUsage ?? "∞"} lượt mới
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
