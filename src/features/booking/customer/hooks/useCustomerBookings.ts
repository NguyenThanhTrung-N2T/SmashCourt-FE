/**
 * useCustomerBookings Hook
 * 
 * Hook for fetching customer booking history.
 */
"use client"
import { useState, useEffect, useCallback } from "react";
import { fetchCustomerBookings } from "@/src/api/booking.api";
import type { BookingDto, BookingListQuery } from "../../shared/types/booking.types";
import type { PaginatedData } from "@/src/shared/types/api.types";

export function useCustomerBookings(initialQuery: BookingListQuery = {}) {
  const [bookings, setBookings] = useState<PaginatedData<BookingDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<BookingListQuery>(initialQuery);

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCustomerBookings(query);
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách đặt sân");
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const refetch = useCallback(() => {
    loadBookings();
  }, [loadBookings]);

  const updateQuery = useCallback((newQuery: Partial<BookingListQuery>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  }, []);

  return {
    bookings,
    isLoading,
    error,
    refetch,
    updateQuery,
    query,
  };
}
