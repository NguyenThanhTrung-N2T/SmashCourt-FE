import { useState, useCallback } from 'react';
import { fetchBranchById, updateBranch, suspendBranch, activateBranch } from '@/src/api/branch.api';
import type { BranchDto, UpdateBranchDto } from '@/src/shared/types/branch.types';
import { handleApiError } from '@/src/modules/branch-management/utils/error-handling';

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
      const message = handleApiError(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  const updateBranchInfo = useCallback(async (dto: UpdateBranchDto) => {
    if (!branchId) return;

    setLoading(true);
    setError(null);
    try {
      const updated = await updateBranch(branchId, dto);
      setBranch(updated);
      return updated;
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  const suspend = useCallback(async () => {
    if (!branchId) return;

    setLoading(true);
    setError(null);
    try {
      await suspendBranch(branchId);
      if (branch) {
        setBranch({ ...branch, status: 'SUSPENDED' });
      }
    } catch (err) {
      const message = handleApiError(err);
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
        setBranch({ ...branch, status: 'ACTIVE' });
      }
    } catch (err) {
      const message = handleApiError(err);
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