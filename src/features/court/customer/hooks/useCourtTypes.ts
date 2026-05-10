/**
 * useCourtTypes Hook
 * 
 * Hook for fetching all active court types.
 */

import { useState, useEffect, useCallback } from "react";
import { fetchAllCourtTypes } from "@/src/api/court-type.api";
import type { CourtType } from "@/src/shared/types/court-type.types";

export function useCourtTypes() {
  const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourtTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAllCourtTypes();
      setCourtTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách loại sân");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourtTypes();
  }, [loadCourtTypes]);

  const refetch = useCallback(() => {
    loadCourtTypes();
  }, [loadCourtTypes]);

  return {
    courtTypes,
    isLoading,
    error,
    refetch,
  };
}
