"use client";

import { CardSkeleton } from "@/src/shared/components/feedback";

export function BookingHistoryLoading() {
  return (
    <div className="space-y-4">
      {/* Filter Skeleton */}
      <div className="flex flex-wrap gap-2 animate-pulse">
        <div className="h-10 w-32 bg-surface-2 rounded-md" />
        <div className="h-10 w-40 bg-surface-2 rounded-md" />
        <div className="h-10 w-24 bg-surface-2 rounded-md" />
      </div>

      {/* Booking Cards Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <CardSkeleton key={i} hasHeader hasFooter />
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center pt-4 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-surface-2 rounded-md" />
          <div className="h-10 w-10 bg-surface-2 rounded-md" />
          <div className="h-10 w-10 bg-surface-2 rounded-md" />
          <div className="h-10 w-10 bg-surface-2 rounded-md" />
        </div>
      </div>
    </div>
  );
}
