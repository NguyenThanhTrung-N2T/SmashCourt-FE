/**
 * Customer Booking History Page
 * 
 * Page for displaying customer booking history.
 */

"use client";

import { BookingHistoryList } from "@/src/features/booking/customer/components";

export default function CustomerBookingsPage() {
  return (
    <div className="min-h-screen bg-surface-0 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Đặt sân của tôi</h1>
          <p className="mt-2 text-sm text-muted">
            Xem và quản lý các đặt sân của bạn
          </p>
        </div>

        {/* Booking List */}
        <BookingHistoryList />
      </div>
    </div>
  );
}
