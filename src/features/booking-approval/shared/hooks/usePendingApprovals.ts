/**
 * Custom hook for fetching and managing the pending approvals queue in real-time.
 * Synchronizes with SignalR events: BookingPendingApproval, PendingApprovalQueueChanged, BookingApprovalResolved.
 * Contract: DEPOSIT_APPROVAL_API.md §4.1, §6.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchPendingApprovals } from "@/src/api/booking-approval.api";
import { useSignalRContext } from "@/src/contexts/SignalRContext";
import { SignalREvents } from "@/src/lib/signalr-events";
import type { PaginatedData } from "@/src/shared/types/api.types";
import type {
  PendingApprovalBookingDto,
  BookingPendingApprovalEvent,
  PendingApprovalQueueChangedEvent,
  BookingApprovalResolvedEvent,
} from "@/src/features/booking-approval/shared/types/booking-approval.types";

interface UsePendingApprovalsOptions {
  branchId?: string;
  initialPage?: number;
  pageSize?: number;
}

export function usePendingApprovals(options: UsePendingApprovalsOptions = {}) {
  const { branchId: initialBranchId, initialPage = 1, pageSize = 10 } = options;

  const [branchId, setBranchId] = useState<string | undefined>(initialBranchId);
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<PaginatedData<PendingApprovalBookingDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { connection } = useSignalRContext();
  const isMounted = useRef(true);

  // Sync initialBranchId prop changes (e.g. from branch selector)
  useEffect(() => {
    setBranchId(initialBranchId);
    setPage(1);
  }, [initialBranchId]);

  const loadApprovals = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      const result = await fetchPendingApprovals({
        branchId: branchId || undefined,
        page,
        pageSize,
      });
      if (isMounted.current) {
        setData(result);
      }
    } catch (err) {
      if (isMounted.current) {
        const msg = err instanceof Error ? err.message : "Không thể tải danh sách đơn chờ duyệt";
        setError(msg);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [branchId, page, pageSize]);

  // Initial load & dependency load
  useEffect(() => {
    isMounted.current = true;
    loadApprovals(true);

    return () => {
      isMounted.current = false;
    };
  }, [loadApprovals]);

  // Tab visibility change reload (contract §6: SignalR is best-effort)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadApprovals(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadApprovals]);

  // SignalR real-time event listeners
  useEffect(() => {
    if (!connection) return;

    const handleNewPending = (_event: BookingPendingApprovalEvent) => {
      loadApprovals(false);
    };

    const handleQueueChanged = (_event: PendingApprovalQueueChangedEvent) => {
      loadApprovals(false);
    };

    const handleResolved = (_event: BookingApprovalResolvedEvent) => {
      loadApprovals(false);
    };

    connection.on(SignalREvents.BOOKING_PENDING_APPROVAL, handleNewPending);
    connection.on(SignalREvents.PENDING_APPROVAL_QUEUE_CHANGED, handleQueueChanged);
    connection.on(SignalREvents.BOOKING_APPROVAL_RESOLVED, handleResolved);

    return () => {
      connection.off(SignalREvents.BOOKING_PENDING_APPROVAL, handleNewPending);
      connection.off(SignalREvents.PENDING_APPROVAL_QUEUE_CHANGED, handleQueueChanged);
      connection.off(SignalREvents.BOOKING_APPROVAL_RESOLVED, handleResolved);
    };
  }, [connection, loadApprovals]);

  return {
    approvals: data?.items ?? [],
    totalItems: data?.totalItems ?? 0,
    totalPages: data?.totalPages ?? 1,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
    setPage,
    branchId,
    setBranchId,
    isLoading,
    error,
    refetch: () => loadApprovals(true),
  };
}

