"use client";

import { CardSkeleton } from "@/src/shared/components/feedback";

export function BookingHistoryLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <CardSkeleton key={i} hasHeader hasFooter />
      ))}
    </div>
  );
}
