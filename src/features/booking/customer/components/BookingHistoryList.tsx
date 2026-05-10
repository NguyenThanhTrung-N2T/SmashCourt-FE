/**
 * BookingHistoryList Component
 * 
 * Displays a paginated list of customer bookings.
 */

"use client";

import { useState } from "react";
import { Pagination } from "@/src/shared/components/ui/Pagination";
import { EmptyState } from "@/src/shared/components/layout/EmptyState";
import { Spinner } from "@/src/shared/components/feedback/Spinner";
import { Alert } from "@/src/shared/components/ui/Alert";
import { BookingCard } from "./BookingCard";
import { BookingDetailModal } from "./BookingDetailModal";
import { BookingFilters } from "./BookingFilters";
import { useCustomerBookings } from "../hooks/useCustomerBookings";
import { useBookingDetail } from "../hooks/useBookingDetail";
import { Receipt } from "@phosphor-icons/react";
import type { BookingStatus } from "../../types/booking.types";

export function BookingHistoryList() {
  const { bookings, isLoading, error, updateQuery, query, refetch } = useCustomerBookings({
    page: 1,
    pageSize: 10,
  });

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const {
    booking: selectedBooking,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useBookingDetail(selectedBookingId);

  const handleViewDetail = (bookingId: string) => {
    setSelectedBookingId(bookingId);
  };

  const handleCloseDetail = () => {
    setSelectedBookingId(null);
  };

  const handlePageChange = (page: number) => {
    updateQuery({ page });
  };

  const handleFilterChange = (filters: { status?: BookingStatus; date?: string }) => {
    updateQuery({ ...filters, page: 1 });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Lỗi">
        {error}
      </Alert>
    );
  }

  if (!bookings || bookings.items.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="h-12 w-12" />}
        title="Chưa có đặt sân nào"
        description="Bạn chưa có lịch sử đặt sân. Hãy đặt sân ngay để bắt đầu!"
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <BookingFilters
          onFilterChange={handleFilterChange}
          activeFilters={{
            status: query.status,
            date: query.date,
          }}
        />

        {/* Booking Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookings.items.map((booking, index) => (
            <BookingCard
              key={booking.bookingId || `booking-${index}`}
              booking={booking}
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>

        {/* Pagination */}
        {bookings.totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination
              currentPage={query.page || 1}
              totalPages={bookings.totalPages}
              totalItems={bookings.totalItems}
              pageSize={bookings.pageSize}
              onPageChange={handlePageChange}
              itemLabel="đặt sân"
            />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <BookingDetailModal
        isOpen={selectedBookingId !== null}
        onClose={handleCloseDetail}
        booking={selectedBooking}
        isLoading={isLoadingDetail}
        error={detailError}
      />
    </>
  );
}
