"use client";

import { Skeleton } from "@/src/shared/components/feedback";

export function BranchSelectionLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Branch Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface-1 p-6 space-y-4">
            {/* Image */}
            <Skeleton className="h-32 w-full rounded-xl" />
            
            {/* Title */}
            <Skeleton className="h-6 w-3/4" />
            
            {/* Details */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Skeleton variant="circular" className="h-4 w-4 shrink-0" />
                <Skeleton className="h-4 flex-1" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" className="h-4 w-4 shrink-0" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" className="h-4 w-4 shrink-0" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
