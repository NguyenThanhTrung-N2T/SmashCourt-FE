"use client";

import { Skeleton } from "@/src/shared/components/feedback";

export function CourtSelectionLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Court Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-lg shrink-0" />
        ))}
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="h-10 w-10" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton variant="circular" className="h-10 w-10" />
      </div>

      {/* Time Grid */}
      <div className="space-y-4">
        {/* Time header */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-16" />
          ))}
        </div>

        {/* Court rows */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-12 w-20" />
            {[...Array(8)].map((_, j) => (
              <Skeleton key={j} className="h-12 w-16" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
