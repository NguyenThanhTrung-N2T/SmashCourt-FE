"use client";

import { Skeleton } from "@/src/shared/components/feedback";

export function BookingFormLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Step Indicator */}
      <div className="flex items-center justify-between gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <Skeleton variant="circular" className="h-10 w-10" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="rounded-2xl border border-border bg-surface-1 p-6 space-y-6">
        {/* Header */}
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Grid of cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border p-6 space-y-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Skeleton className="h-11 w-32 rounded-lg" />
        <Skeleton className="h-11 w-32 rounded-lg" />
      </div>
    </div>
  );
}
