/**
 * useBookingDetail Hook
 * 
 * Hook for fetching a specific booking detail.
 */

import { useState, useEffect, useCallback } from "react";
import { fetchCustomerBookingById } from "@/src/api/booking.api";
import type { BookingDto } from "../../types/booking.types";

export function useBookingDetail(bookingId: string | null) {
  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBooking = useCallback(async () => {
    if (!bookingId) {
      setBooking(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCustomerBookingById(bookingId);
      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thông tin đặt sân");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const refetch = useCallback(() => {
    loadBooking();
  }, [loadBooking]);

  return {
    booking,
    isLoading,
    error,
    refetch,
  };
}
