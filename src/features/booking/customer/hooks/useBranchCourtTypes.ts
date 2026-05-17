/**
 * useBranchCourtTypes Hook
 * 
 * Hook for fetching court types available at a specific branch.
 */

import { useState, useEffect, useCallback } from "react";
import { fetchBranchCourtTypes } from "@/src/api/branch.api";
import type { BranchCourtTypeDto } from "@/src/features/branch/types/branch.types";

interface UseBranchCourtTypesParams {
  branchId: string | null;
}

export function useBranchCourtTypes({ branchId }: UseBranchCourtTypesParams) {
  const [courtTypes, setCourtTypes] = useState<BranchCourtTypeDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourtTypes = useCallback(async () => {
    if (!branchId) {
      setCourtTypes([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchBranchCourtTypes(branchId);
      // Filter only active court types
      const activeCourtTypes = data.filter((ct) => ct.isActive);
      setCourtTypes(activeCourtTypes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách loại sân");
      setCourtTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

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
