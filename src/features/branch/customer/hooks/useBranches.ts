/**
 * useBranches Hook
 * 
 * Hook for fetching branches.
 */

import { useState, useEffect, useCallback } from "react";
import { fetchBasicBranches } from "@/src/api/branch.api";
import type { BranchBasicDto } from "../../shared/types/branch.types";

export function useBranches(page = 1, pageSize = 50) {
  const [branches, setBranches] = useState<BranchBasicDto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchBasicBranches(page, pageSize);
      setBranches(data.items);
      setTotalItems(data.totalItems);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách chi nhánh");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const refetch = useCallback(() => {
    loadBranches();
  }, [loadBranches]);

  return {
    branches,
    totalItems,
    totalPages,
    isLoading,
    error,
    refetch,
  };
}
