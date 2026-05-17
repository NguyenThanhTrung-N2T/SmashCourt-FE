/**
 * Promotion Selector Component
 * 
 * Allows customers to select a promotion for their booking.
 */

"use client";

import { Tag, Check } from "@phosphor-icons/react/dist/ssr";
import { formatDiscountDisplay } from "@/src/api/promotion.api";
import { formatDate } from "@/src/shared/utils/dateFormatter";
import type { ApplicablePromotion } from "@/src/shared/types/promotion.types";

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
      <div className="rounded-xl border border-border bg-surface-2 p-4">
        <div className="flex items-center gap-2 text-muted">
          <Tag className="h-5 w-5" />
          <p className="text-sm">Đang tìm khuyến mãi phù hợp...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <div className="flex items-center gap-2 text-red-600">
          <Tag className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface-2 p-4">
        <div className="flex items-center gap-2 text-muted">
          <Tag className="h-5 w-5" />
          <p className="text-sm">Hiện không có khuyến mãi khả dụng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" weight="fill" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
            Chọn khuyến mãi
          </h3>
        </div>
        {selectedPromotionId && promotionDiscount > 0 && (
          <span className="text-sm font-bold text-primary">
            -{promotionDiscount.toLocaleString("vi-VN")} đ
          </span>
        )}
      </div>

      {/* No promotion option */}
      <button
        type="button"
        onClick={() => onSelectPromotion(null)}
        className={`w-full rounded-xl border p-3 text-left transition-all ${
          selectedPromotionId === null
            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
            : "border-border bg-surface-2 hover:border-primary/50"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Không sử dụng khuyến mãi
          </span>
          {selectedPromotionId === null && (
            <Check className="h-5 w-5 text-primary" weight="bold" />
          )}
        </div>
      </button>

      {/* Promotion options */}
      {promotions.map((promotion) => (
        <button
          key={promotion.id}
          type="button"
          onClick={() => onSelectPromotion(promotion.id)}
          className={`w-full rounded-xl border p-3 text-left transition-all ${
            selectedPromotionId === promotion.id
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border bg-surface-2 hover:border-primary/50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-foreground">{promotion.name}</p>
                {promotion.code && (
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {promotion.code}
                  </span>
                )}
              </div>
              
              {promotion.description && (
                <p className="text-xs text-muted">{promotion.description}</p>
              )}
              
              <div className="flex items-center gap-3 text-xs text-muted">
                <span>Giảm: {formatDiscountDisplay(promotion)}</span>
                <span>•</span>
                <span>Tiết kiệm: {promotion.discountAmount.toLocaleString("vi-VN")} đ</span>
                <span>•</span>
                <span>
                  HSD: {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                </span>
              </div>

              <p className="text-xs font-medium text-primary">
                Sau giảm: {promotion.finalAmount.toLocaleString("vi-VN")} đ
              </p>

              {promotion.usagePerUserLimit && (
                <p className="text-xs text-muted">
                  Còn {promotion.remainingUserUsage ?? "không giới hạn"} lượt cho bạn
                </p>
              )}
            </div>

            {selectedPromotionId === promotion.id && (
              <Check className="h-5 w-5 flex-shrink-0 text-primary" weight="bold" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
