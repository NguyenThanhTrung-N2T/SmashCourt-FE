"use client";

import { Skeleton } from "@/src/shared/components/feedback";

export function CourtTypeSelectionLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Court Type Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface-1 p-6 space-y-4 text-center">
            {/* Icon */}
            <div className="flex justify-center">
              <Skeleton variant="circular" className="h-16 w-16" />
            </div>
            
            {/* Title */}
            <Skeleton className="h-6 w-3/4 mx-auto" />
            
            {/* Description */}
            <div className="space-y-1">
              <Skeleton className="h-3 w-full mx-auto" />
              <Skeleton className="h-3 w-5/6 mx-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
