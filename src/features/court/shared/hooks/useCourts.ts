/**
 * useCourts Hook
 * 
 * Hook for fetching courts by branch and optional court type filter.
 */

import { useState, useEffect, useCallback } from "react";
import { fetchCourts } from "@/src/api/court.api";
import type { CourtDto } from "../types/court.types";

interface UseCourtsParams {
  branchId: string;
  courtTypeId?: string;
}

export function useCourts({ branchId, courtTypeId }: UseCourtsParams) {
  const [courts, setCourts] = useState<CourtDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourts = useCallback(async () => {
    if (!branchId) {
      setCourts([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCourts(branchId, { typeId: courtTypeId });

      // Backend now handles court type filtering and public status visibility
      // (AVAILABLE, LOCKED, IN_USE are returned for public users, all others are filtered out)
      setCourts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách sân");
    } finally {
      setIsLoading(false);
    }
  }, [branchId, courtTypeId]);

  useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  const refetch = useCallback(() => {
    loadCourts();
  }, [loadCourts]);

  return {
    courts,
    isLoading,
    error,
    refetch,
  };
}
