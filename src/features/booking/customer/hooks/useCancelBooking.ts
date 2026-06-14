/**
 * useCancelBooking Hook
 * 
 * Hook for canceling customer bookings with loading and error states.
 */

"use client";

import { useState, useCallback } from "react";
import { cancelCustomerBooking } from "@/src/api/booking.api";

interface UseCancelBookingResult {
  cancelBooking: (bookingId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useCancelBooking(): UseCancelBookingResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await cancelCustomerBooking(bookingId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể hủy đặt sân";
      setError(errorMessage);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    cancelBooking,
    isLoading,
    error,
    clearError,
  };
}
