/**
 * useBranches Hook
 * 
 * Hook for fetching branches.
 */

import { useState, useEffect, useCallback } from "react";
import { fetchBranches } from "@/src/api/branch.api";
import type { BranchDto } from "../../types/branch.types";

export function useBranches() {
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchBranches(1, 50); // Get all branches
      setBranches(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách chi nhánh");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const refetch = useCallback(() => {
    loadBranches();
  }, [loadBranches]);

  return {
    branches,
    isLoading,
    error,
    refetch,
  };
}
