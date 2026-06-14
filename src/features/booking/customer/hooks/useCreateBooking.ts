/**
 * useCreateBooking Hook
 * 
 * Hook for creating an online booking.
 */

import { useState, useCallback } from "react";
import { createOnlineBooking } from "@/src/api/booking.api";
import type { CreateOnlineBookingDto, OnlineBookingResponse } from "../../shared/types/booking.types";

export function useCreateBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(
    async (dto: CreateOnlineBookingDto): Promise<OnlineBookingResponse | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await createOnlineBooking(dto);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Không thể tạo đặt sân";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createBooking,
    isLoading,
    error,
    clearError,
  };
}
