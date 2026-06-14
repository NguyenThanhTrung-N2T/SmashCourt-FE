import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchTimeGrid } from "@/src/api/timegrid.api";
import { useRealtimeRefresh } from "@/src/shared/hooks/useRealtimeRefresh";
import type { TimeGridSlotDto } from "../types/timeslot.types";
import { RefreshTarget } from "@/src/types/notification.types";
import { debounce } from "lodash";

interface UseTimeGridParams {
  branchId: string;
  courtId: string;
  date: string; // YYYY-MM-DD or ISO 8601
}
const TIMEGRID_REFRESH_TARGETS: RefreshTarget[] = ["bookings", "courts", "payments"];

export function useTimeGrid({
  branchId,
  courtId,
  date,
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
  const debouncedLoad = useMemo(
    () => debounce(() => loadTimeGrid(), 300),
    [loadTimeGrid]
  );
  // Clean up debounce timer on unmount
  useEffect(() => () => debouncedLoad.cancel(), [debouncedLoad]);
  useRealtimeRefresh(TIMEGRID_REFRESH_TARGETS, debouncedLoad);

  useEffect(() => {
    loadTimeGrid();
  }, [loadTimeGrid]);

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
