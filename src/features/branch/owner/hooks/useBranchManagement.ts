/**
 * useBranchManagement Hook
 * 
 * Hook for managing a single branch (load, update, suspend, activate).
 */

import { useState, useCallback } from "react";
import { fetchBranchById, updateBranch, suspendBranch, activateBranch } from "@/src/api/branch.api";
import type { BranchDto, UpdateBranchDto } from "../../types/branch.types";

export function useBranchManagement(branchId: string) {
  const [branch, setBranch] = useState<BranchDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBranch = useCallback(async () => {
    if (!branchId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchBranchById(branchId);
      setBranch(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tải thông tin chi nhánh";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  const updateBranchInfo = useCallback(
    async (dto: UpdateBranchDto) => {
      if (!branchId) return;

      setLoading(true);
      setError(null);
      try {
        const updated = await updateBranch(branchId, dto);
        setBranch(updated);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Không thể cập nhật chi nhánh";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [branchId]
  );

  const suspend = useCallback(async () => {
    if (!branchId) return;

    setLoading(true);
    setError(null);
    try {
      await suspendBranch(branchId);
      if (branch) {
        setBranch({ ...branch, status: 1 });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tạm ngưng chi nhánh";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [branchId, branch]);

  const activate = useCallback(async () => {
    if (!branchId) return;

    setLoading(true);
    setError(null);
    try {
      await activateBranch(branchId);
      if (branch) {
        setBranch({ ...branch, status: 0 });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể kích hoạt chi nhánh";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [branchId, branch]);

  return {
    branch,
    loading,
    error,
    loadBranch,
    updateBranchInfo,
    suspend,
    activate,
  };
}
