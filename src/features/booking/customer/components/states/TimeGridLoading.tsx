"use client";

import { Skeleton } from "@/src/shared/components/feedback";

export function TimeGridLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header with date navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Skeleton variant="circular" className="h-10 w-10" />
        <Skeleton className="h-10 flex-1 max-w-xs rounded-lg" />
        <Skeleton variant="circular" className="h-10 w-10" />
      </div>

      {/* Time Grid Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] space-y-3">
          {/* Time Header Row */}
          <div className="flex gap-2">
            <div className="w-32 shrink-0">
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="flex-1 flex gap-2">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="h-8 flex-1" />
              ))}
            </div>
          </div>

          {/* Court Tracks */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-2">
              {/* Court Name */}
              <div className="w-32 shrink-0">
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
              
              {/* Time Slots */}
              <div className="flex-1 flex gap-2">
                {[...Array(12)].map((_, j) => (
                  <Skeleton key={j} className="h-16 flex-1 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton variant="circular" className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
