"use client";

import { CalendarBlank } from "@phosphor-icons/react";
import { EmptyState } from "@/src/shared/components/layout";

interface BookingEmptyStateProps {
  action?: React.ReactNode;
  title?: string;
  description?: string;
}

export function BookingEmptyState({ 
  action,
  title = "Chưa có lịch đặt sân",
  description = "Bạn chưa có lịch đặt sân nào. Hãy đặt sân ngay để bắt đầu!"
}: BookingEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface-1 shadow-sm py-20">
      <EmptyState
        icon={<CalendarBlank className="h-16 w-16 text-muted" />}
        title={title}
        description={description}
        action={action}
      />
    </div>
  );
}
