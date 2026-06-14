/**
 * Promotions Page Loading State
 * 
 * Skeleton loading state for the promotions page.
 */

import { Skeleton } from "@/src/shared/components/feedback";

export function PromotionsPageLoading() {
  return (
    <div className="min-h-screen bg-surface-0 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Mã khuyến mãi</h1>
          <p className="mt-2 text-sm text-muted">
            Các chương trình khuyến mãi đang có hiệu lực
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface-1 p-6"
            >
              {/* Header with Badge */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton variant="circular" className="h-10 w-10" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>

              {/* Promotion Name */}
              <Skeleton className="mb-3 h-7 w-3/4" />

              {/* Discount Rate */}
              <div className="mb-4 flex items-center gap-2">
                <Skeleton variant="circular" className="h-5 w-5" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>

              {/* Date Range */}
              <div className="mb-4">
                <Skeleton className="h-5 w-full" />
              </div>

              {/* Copy Code Button */}
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* Info Section */}
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}
