import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { fetchTimeGrid } from "@/src/api/timegrid.api";
import { useRealtimeRefresh } from "@/src/shared/hooks/useRealtimeRefresh";
import { useSignalRContext } from "@/src/contexts/SignalRContext";
import { getAuthUser } from "@/src/features/auth/session/sessionStore";
import { SignalREvents } from "@/src/lib/signalr-events";
import type { TimeGridSlotDto } from "../types/timeslot.types";
import { RefreshTarget } from "@/src/shared/types/notification.types";
import { debounce } from "lodash";

interface UseTimeGridParams {
  branchId: string;
  courtId: string;
  courtTypeId: string;
  date: string; // YYYY-MM-DD or ISO 8601
}
const TIMEGRID_REFRESH_TARGETS: RefreshTarget[] = ["bookings", "courts", "payments"];

export function useTimeGrid({
  branchId,
  courtId,
  courtTypeId,
  date,
}: UseTimeGridParams) {
  const { isConnected, connection, subscribeToTimeGrid } = useSignalRContext();
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

  // Use generic broadcast refresh (primarily for Staff already in branch group)
  useRealtimeRefresh(TIMEGRID_REFRESH_TARGETS, debouncedLoad);

  // Granular SignalR Refresh for Customers
  useEffect(() => {
    if (!isConnected || !connection || !branchId || !courtTypeId || !date) return;

    const user = getAuthUser();
    const isCustomer = user?.role === "CUSTOMER";
    if (!isCustomer) return;

    // Normalize date to ensure consistency with the SignalR group key
    const normalizedDate = format(new Date(date), "yyyy-MM-dd");

    let unsubscribed = false;
    let cleanupFn: (() => void) | null = null;

    // 1. Join/Leave group
    subscribeToTimeGrid(branchId, courtId ? courtTypeId : "", normalizedDate).then((unsub) => {
      if (unsubscribed) {
        unsub();
      } else {
        cleanupFn = unsub;
      }
    });

    // 2. Listen for availability-changing events
    const availabilityEvents = [
      SignalREvents.BOOKING_CREATED,
      SignalREvents.BOOKING_CANCELLED,
      SignalREvents.BOOKING_EXPIRED,
      SignalREvents.BOOKING_NO_SHOW,
    ];

    availabilityEvents.forEach((evt) => {
      connection.on(evt, debouncedLoad);
    });

    return () => {
      unsubscribed = true;
      if (cleanupFn) cleanupFn();

      availabilityEvents.forEach((evt) => {
        connection.off(evt, debouncedLoad);
      });
    };
  }, [
    isConnected,
    connection,
    branchId,
    courtTypeId,
    courtId,
    date,
    subscribeToTimeGrid,
    debouncedLoad,
  ]);

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
