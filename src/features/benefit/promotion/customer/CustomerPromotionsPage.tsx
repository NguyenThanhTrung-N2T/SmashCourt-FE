"use client";

import { useEffect, useState } from "react";
import { CalendarBlank, Ticket, Tag } from "@phosphor-icons/react";
import { fetchActivePromotion, formatDiscountDisplay } from "@/src/api/promotion.api";
import { type Promotion } from "@/src/features/benefit/promotion/shared/types/promotion.types";
import { SmartImage } from "@/src/shared/components/ui/SmartImage";
import {
  PromotionsPageLoading,
  PromotionsErrorState,
  PromotionsEmptyState
} from "./states";

export function CustomerPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchActivePromotion();
      setPromotions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    // Parse date format: "01 04 2026 07:00:00" (DD MM YYYY HH:mm:ss)
    const parts = dateString.trim().split(" ");
    if (parts.length >= 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      // Create date in ISO format for proper parsing
      const date = new Date(`${year}-${month}-${day}`);

      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
    }
    return dateString; // Fallback to original string if parsing fails
  };



  if (loading) {
    return <PromotionsPageLoading />;
  }

  if (error) {
    return <PromotionsErrorState message={error} onRetry={loadPromotions} />;
  }

  if (promotions.length === 0) {
    return <PromotionsEmptyState />;
  }

  return (
    <div className="min-h-screen bg-surface-0 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Mã khuyến mãi</h1>
          <p className="mt-2 text-sm text-muted">
            Các chương trình khuyến mãi đang có hiệu lực
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className="group relative flex flex-row items-center overflow-hidden rounded-2xl border border-border bg-surface-1 p-3 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5"
            >
              {/* Left Side: Square Image */}
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-border/50 bg-primary/5">
                {promotion.promoDisplayUrl ? (
                  <SmartImage
                    src={promotion.promoDisplayUrl}
                    alt={promotion.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary/40">
                    <div className="absolute inset-0 opacity-[0.08]"
                      style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '10px 10px' }}
                    />
                    <Ticket className="h-8 w-8 mb-1" weight="duotone" />
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Ưu đãi</span>
                  </div>
                )}
              </div>

              {/* Right Side: Content */}
              <div className="ml-4 flex flex-1 flex-col justify-center min-w-0">
                <div className="space-y-1">
                  <h3 className="line-clamp-2 text-[13px] font-bold text-foreground leading-snug" title={promotion.name}>
                    {promotion.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-primary leading-none">
                      {formatDiscountDisplay(promotion)}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                      Giảm giá
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2">
                  {promotion.code && (
                    <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-2 py-1 rounded-md">
                      <Tag className="h-3 w-3" weight="bold" />
                      <span className="font-mono text-[11px] font-bold tracking-tight">{promotion.code}</span>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground text-[11px]">
                    <CalendarBlank className="mr-1 h-3.5 w-3.5" />
                    <span className="truncate">Đến {formatDate(promotion.endDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-8 rounded-lg border border-border bg-surface-1 p-6 space-y-3">
          <h3 className="font-semibold text-foreground">Cách sử dụng mã khuyến mãi</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Áp dụng mã khi đặt sân để nhận ưu đãi</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Mỗi mã chỉ áp dụng trong thời gian quy định</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Không áp dụng đồng thời nhiều mã khuyến mãi</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
