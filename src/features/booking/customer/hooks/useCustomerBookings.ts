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
  const [lastInitialQuery, setLastInitialQuery] = useState<string>(JSON.stringify(initialQuery));

  // Sync state with URL changes (when initialQuery changes)
  useEffect(() => {
    const currentInitialQueryStr = JSON.stringify(initialQuery);
    if (currentInitialQueryStr !== lastInitialQuery) {
      setQuery(initialQuery);
      setLastInitialQuery(currentInitialQueryStr);
    }
  }, [initialQuery, lastInitialQuery]);

  const loadBookings = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCustomerBookings(query);

      if (signal?.aborted) return;

      setBookings(data);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : "Không thể tải danh sách đặt sân");
    } finally {
      if (signal?.aborted) return;
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    loadBookings(controller.signal);
    return () => controller.abort();
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
