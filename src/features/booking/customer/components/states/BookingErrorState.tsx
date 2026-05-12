"use client";

import { Warning } from "@phosphor-icons/react";

interface BookingErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function BookingErrorState({ message, onRetry }: BookingErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-1 rounded-2xl border border-red-500/30 shadow-sm">
      <Warning className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-lg font-bold text-red-600">Lỗi khi tải dữ liệu</p>
      <p className="text-sm text-red-500 mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}
