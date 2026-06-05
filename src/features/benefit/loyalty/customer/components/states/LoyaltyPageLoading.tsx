/**
 * Loyalty Page Loading State
 * 
 * Skeleton loading state for the loyalty page.
 */

import { Skeleton } from "@/src/shared/components/feedback";

export function LoyaltyPageLoading() {
  return (
    <div className="min-h-screen bg-surface-0 p-6 space-y-6">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Điểm thưởng</h1>
          <p className="mt-2 text-sm text-muted">
            Tích điểm và nhận ưu đãi khi đặt sân tại SmashCourt
          </p>
        </div>

        {/* Loyalty Info Card */}
        <div className="rounded-2xl border border-border bg-surface-1 p-6 space-y-6">
          {/* Tier Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" className="h-12 w-12" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>

          {/* Points Display */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" className="h-6 w-6" />
            <Skeleton className="h-7 w-48" />
          </div>

          {/* Transaction List */}
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-surface-1 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton variant="circular" className="h-10 w-10" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}
