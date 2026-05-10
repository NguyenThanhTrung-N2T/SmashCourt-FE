/**
 * useTimeGrid Hook
 * 
 * Hook for fetching court availability time grid.
 */

import { useState, useEffect, useCallback } from "react";
import { fetchTimeGrid } from "@/src/api/timegrid.api";
import type { TimeGridSlotDto } from "../types/timeslot.types";

interface UseTimeGridParams {
  branchId: string;
  courtId: string;
  date: string; // YYYY-MM-DD or ISO 8601
  autoRefresh?: boolean; // Auto-refresh every 30 seconds
  refreshInterval?: number; // Custom refresh interval in ms
}

export function useTimeGrid({
  branchId,
  courtId,
  date,
  autoRefresh = false,
  refreshInterval = 30000,
}: UseTimeGridParams) {
  const [slots, setSlots] = useState<TimeGridSlotDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTimeGrid = useCallback(async () => {
    if (!branchId || !courtId || !date) {
      setSlots([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchTimeGrid(branchId, courtId, { date });
      setSlots(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải lịch trống của sân"
      );
    } finally {
      setIsLoading(false);
    }
  }, [branchId, courtId, date]);

  useEffect(() => {
    loadTimeGrid();
  }, [loadTimeGrid]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadTimeGrid();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadTimeGrid]);

  // Refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadTimeGrid();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadTimeGrid]);

  const refetch = useCallback(() => {
    loadTimeGrid();
  }, [loadTimeGrid]);

  return {
    slots,
    isLoading,
    error,
    refetch,
  };
}
