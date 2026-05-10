/**
 * useTimeSlots Hook
 * 
 * Hook for fetching and managing time slots.
 */

import { useState, useEffect, useCallback } from "react";
import { fetchTimeSlots } from "@/src/api/timeslot.api";
import type { TimeSlotDto } from "../types/timeslot.types";

export function useTimeSlots() {
  const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTimeSlots = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchTimeSlots();
      setTimeSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách khung giờ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimeSlots();
  }, [loadTimeSlots]);

  const refetch = useCallback(() => {
    loadTimeSlots();
  }, [loadTimeSlots]);

  return {
    timeSlots,
    isLoading,
    error,
    refetch,
  };
}
