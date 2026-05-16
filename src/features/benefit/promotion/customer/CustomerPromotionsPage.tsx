"use client";

import { useEffect, useState } from "react";
import { Tag, CalendarBlank, Percent, Sparkle } from "@phosphor-icons/react";
import { fetchActivePromotion } from "@/src/api/promotion.api";
import { DiscountType, type Promotion } from "@/src/shared/types/promotion.types";
import { Badge } from "@/src/shared/components/ui/Badge";
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

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
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
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Tag className="h-8 w-8 text-primary" weight="fill" />
          <h1 className="text-3xl font-bold text-foreground">Mã khuyến mãi</h1>
        </div>
        <p className="text-muted">
          Các chương trình khuyến mãi đang có hiệu lực
        </p>
      </div>

      {/* Promotions Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promotion) => (
          <div
            key={promotion.id}
            className="group relative overflow-hidden rounded-xl border border-border bg-surface-1 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            {/* Content */}
            <div className="relative p-6">
              {/* Header with Badge */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Sparkle className="h-5 w-5 text-primary" weight="fill" />
                  </div>
                  <Badge variant="success" size="sm">
                    Đang áp dụng
                  </Badge>
                </div>
              </div>

              {/* Promotion Name */}
              <h3 className="mb-3 text-xl font-bold text-foreground">
                {promotion.name}
              </h3>

              {/* Discount Rate */}
              <div className="mb-4 flex items-center gap-2">

                <span className="text-2xl font-bold text-primary">
                  {promotion.discountValue}
                </span>
                {promotion.discountType === DiscountType.PERCENT && (
                  <span className="text-sm text-muted">
                    %
                  </span>
                )}
                <span className="text-sm text-muted">
                  giảm giá
                </span>
              </div>

              {/* Date Range */}
              <div className="mb-4 flex items-center gap-2 text-sm text-muted">
                <CalendarBlank className="h-4 w-4" />
                <span>
                  {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                </span>
              </div>

              {/* Copy Code Button */}
              <button
                onClick={() => copyToClipboard(promotion.id)}
                className="w-full rounded-xl border-2 border-dashed border-primary bg-primary/5 px-4 py-3 text-center font-mono text-sm font-bold text-primary transition-all hover:bg-primary/10 hover:border-solid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-center justify-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span>Nhấn để sao chép mã</span>
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="rounded-lg border border-border bg-surface-1 p-6 space-y-3">
        <h3 className="font-semibold text-foreground">Cách sử dụng mã khuyến mãi</h3>
        <ul className="space-y-2 text-sm text-muted">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Nhấn vào mã khuyến mãi để sao chép</span>
          </li>
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
  );
}
