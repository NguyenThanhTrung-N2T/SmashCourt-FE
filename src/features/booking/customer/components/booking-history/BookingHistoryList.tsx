"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { CalendarBlank } from "@phosphor-icons/react";
import { Alert, Pagination } from "@/src/shared/components/ui";
import { EmptyState } from "@/src/shared/components/layout";
import { BookingCard } from "./BookingCard";
import { BookingDetailModal } from "./BookingDetailModal";
import { BookingFilters } from "./BookingFilters";
import { BookingHistoryLoading, BookingErrorState } from "../states";
import { useCustomerBookings, useRetryPayment, useBookingDetail } from "@/src/features/booking/customer/hooks";
import type { BookingListQuery } from "@/src/features/booking/shared/types/booking.types";
import {
  toBookingStatusValue,
  toInvoicePaymentStatusValue,
} from "@/src/features/booking/shared/utils/bookingStatus";
import { useRealtimeRefresh } from "@/src/shared/hooks/useRealtimeRefresh";

const PAGE_SIZE = 12;

export function BookingHistoryList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize query from URL - memoize to prevent unnecessary re-renders
  const queryFromUrl = useMemo((): BookingListQuery => {
    const params = Object.fromEntries(searchParams.entries());

    return {
      page: params.page ? parseInt(params.page) : 1,
      pageSize: PAGE_SIZE,
      status: toBookingStatusValue(params.status),
      paymentStatus: toInvoicePaymentStatusValue(params.paymentStatus),
      branchId: params.branchId,
      date: params.date,
      fromDate: params.fromDate,
      toDate: params.toDate,
      customerKeyword: params.search,
    };
  }, [searchParams]);

  const { bookings, isLoading, error, updateQuery, query, refetch } = useCustomerBookings(queryFromUrl);

  // Subscribe to realtime refreshes
  useRealtimeRefresh("bookings", () => {
    refetch();
  });

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const { retryPayment, isLoading: isRetryingPayment, error: paymentError, clearError } = useRetryPayment();

  const {
    booking: selectedBooking,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useBookingDetail(selectedBookingId);

  // Sync state to URL when query changes
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value.toString());
      }
    });

    // Use replace to avoid filling history with every keystroke (if debounced)
    // or push if we want back button to work for filters
    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    // Only update if URL actually changed to avoid loops
    const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    if (currentUrl !== url) {
      router.replace(url, { scroll: false });
    }
  }, [query, pathname, router, searchParams]);

  const handleViewDetail = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    clearError();
  };

  const handleCloseDetail = () => {
    setSelectedBookingId(null);
    clearError();
  };

  const handlePayNow = async (bookingId: string) => {
    const result = await retryPayment(bookingId);

    if (result) {
      // Redirect to payment URL
      window.location.href = result.paymentUrl;
    }
  };

  const handleCancelSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePageChange = useCallback((page: number) => {
    updateQuery({ page });
  }, [updateQuery]);

  const handleFilterChange = useCallback((filters: Partial<BookingListQuery>) => {
    // Merge filters and reset to page 1
    updateQuery({ ...filters, page: 1 });
  }, [updateQuery]);

  if (error) {
    return <BookingErrorState message={error} onRetry={refetch} />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filters */}
        <BookingFilters
          onFilterChange={handleFilterChange}
          activeFilters={query}
          isLoading={isLoading}
        />

        {/* Payment Error Alert */}
        {paymentError && (
          <Alert variant="error" title="Lỗi thanh toán">
            {paymentError}
          </Alert>
        )}

        {/* Booking Cards / Loading State */}
        {isLoading && !bookings ? (
          <BookingHistoryLoading />
        ) : !bookings || bookings.items.length === 0 ? (
          <EmptyState
            icon={<CalendarBlank className="h-12 w-12 text-muted" />}
            title="Chưa có đặt sân nào"
            description="Không tìm thấy lịch sử đặt sân nào phù hợp với bộ lọc của bạn."
          />
        ) : (
          <div className={`grid gap-5 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {bookings.items.map((booking, index) => (
              <BookingCard
                key={booking.id || `booking-${index}`}
                booking={booking}
                onViewDetail={handleViewDetail}
                onPayNow={handlePayNow}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {bookings && bookings.totalPages > 1 && (
          <div className="flex justify-center pt-6">
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
        onCancelSuccess={handleCancelSuccess}
      />
    </>
  );
}
