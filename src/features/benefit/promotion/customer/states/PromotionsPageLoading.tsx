/**
 * Promotions Page Loading State
 * 
 * Skeleton loading state for the promotions page.
 */

import { Skeleton } from "@/src/shared/components/feedback";

export function PromotionsPageLoading() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8 animate-pulse">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="h-8 w-8" />
          <Skeleton className="h-9 w-48" />
        </div>
        <Skeleton className="h-4 w-96" />
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
  );
}
