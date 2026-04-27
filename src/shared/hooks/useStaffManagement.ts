import { useState, useCallback, useEffect } from 'react';
import { getBranchStaff, addStaff, removeStaff, bulkStaffOperation } from '@/src/api/branch.api';
import type { PaginatedData } from '@/src/shared/types/api.types';
import type {
  BranchStaffDto,
  AddStaffDto,
  RemoveStaffDto,
  StaffFilterQuery,
  BulkStaffOperationDto,
  BulkStaffOperationResultDto,
} from '@/src/shared/types/branch.types';
import { handleApiError } from '@/src/modules/branch-management/utils/error-handling';
import { branchCache } from '@/src/modules/branch-management/utils/caching';

export function useStaffManagement(branchId: string) {
  const [staff, setStaff] = useState<PaginatedData<BranchStaffDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StaffFilterQuery>({ page: 1, pageSize: 10 });

  const getCacheKey = useCallback((query: StaffFilterQuery) => {
    return `staff-${branchId}-${JSON.stringify(query)}`;
  }, [branchId]);

  const loadStaff = useCallback(async (query: StaffFilterQuery = filters) => {
    if (!branchId) return;

    const cacheKey = getCacheKey(query);
    const cached = branchCache.get<PaginatedData<BranchStaffDto>>(cacheKey);

    if (cached) {
      setStaff(cached);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getBranchStaff(branchId, query);
      setStaff(data);
      branchCache.set(cacheKey, data);
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [branchId, filters, getCacheKey]);

  const addStaffMember = useCallback(async (dto: AddStaffDto) => {
    if (!branchId) return;

    setLoading(true);
    setError(null);
    try {
      const newStaff = await addStaff(branchId, dto);
      branchCache.invalidate(`staff-${branchId}`);
      await loadStaff(filters);
      return newStaff;
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [branchId, filters, loadStaff]);

  const removeStaffMember = useCallback(async (userId: string, dto: RemoveStaffDto) => {
    if (!branchId) return;

    setLoading(true);
    setError(null);
    try {
      await removeStaff(branchId, userId, dto);
      branchCache.invalidate(`staff-${branchId}`);
      await loadStaff(filters);
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [branchId, filters, loadStaff]);

  const bulkOperation = useCallback(async (dto: BulkStaffOperationDto): Promise<BulkStaffOperationResultDto> => {
    if (!branchId) throw new Error('Branch ID is required');

    setLoading(true);
    setError(null);
    try {
      const result = await bulkStaffOperation(branchId, dto);
      branchCache.invalidate(`staff-${branchId}`);
      await loadStaff(filters);
      return result;
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [branchId, filters, loadStaff]);

  const updateFilters = useCallback((newFilters: StaffFilterQuery) => {
    setFilters(newFilters);
  }, []);

  useEffect(() => {
    if (branchId) {
      loadStaff(filters);
    }
  }, [branchId, filters, loadStaff]);

  return {
    staff,
    loading,
    error,
    filters,
    updateFilters,
    loadStaff,
    addStaffMember,
    removeStaffMember,
    bulkOperation,
  };
}