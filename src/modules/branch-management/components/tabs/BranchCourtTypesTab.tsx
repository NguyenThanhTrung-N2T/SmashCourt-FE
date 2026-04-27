"use client";

import { useState, useEffect } from 'react';
import { CourtBasketball, Plus, Trash, Warning } from '@phosphor-icons/react';
import type { BranchCourtTypeDto, AddCourtTypeToBranchDto } from '@/src/shared/types/branch.types';
import { fetchBranchCourtTypes, addCourtTypeToBranch, removeCourtTypeFromBranch } from '@/src/api/branch.api';
import { ConfirmationDialog } from '../shared/ConfirmationDialog';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { handleApiError } from '../../utils/error-handling';
import { useToast } from '@/src/shared/hooks/useToast';

interface BranchCourtTypesTabProps {
  branchId: string;
}

export function BranchCourtTypesTab({ branchId }: BranchCourtTypesTabProps) {
  const [branchCourtTypes, setBranchCourtTypes] = useState<BranchCourtTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courtTypeToRemove, setCourtTypeToRemove] = useState<BranchCourtTypeDto | null>(null);
  const { show: showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const branchTypes = await fetchBranchCourtTypes(branchId);
      setBranchCourtTypes(branchTypes);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [branchId]);

  const handleAddCourtType = async (courtTypeId: string) => {
    try {
      const dto: AddCourtTypeToBranchDto = {
        courtTypeId,
      };
      await addCourtTypeToBranch(branchId, dto);
      showToast('success', 'Thêm loại sân thành công');
      await loadData();
    } catch (err) {
      const message = handleApiError(err);
      showToast('error', message);
    }
  };

  const handleRemoveCourtType = async () => {
    if (!courtTypeToRemove) return;
    try {
      await removeCourtTypeFromBranch(branchId, courtTypeToRemove.courtTypeId);
      showToast('success', 'Gỡ loại sân thành công');
      setCourtTypeToRemove(null);
      await loadData();
    } catch (err) {
      const message = handleApiError(err);
      showToast('error', message);
    }
  };
  
  const activeCourtTypes = branchCourtTypes.filter(ct => ct.id !== null && ct.isActive);
  const availableCourtTypes = branchCourtTypes.filter(ct => !ct.isActive);

  if (loading) {
    return <LoadingSkeleton variant="card" rows={4} />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 flex items-center gap-3">
          <Warning className="h-6 w-6 text-red-500" />
          <p className="font-bold text-red-800">{error}</p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B5E38]/10">
              <CourtBasketball className="h-5 w-5 text-[#1B5E38]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Loại sân</h3>
              <p className="text-xs text-slate-500">Quản lý các loại sân có sẵn tại chi nhánh</p>
            </div>
          </div>
        </div>

        {/* Court Types List */}
        {activeCourtTypes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {activeCourtTypes.map((courtType, index) => (
              <div
                key={courtType.id || `branch-court-type-${index}`}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B5E38]/10 shrink-0">
                  <CourtBasketball className="h-6 w-6 text-[#1B5E38]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-slate-900 truncate mb-1">
                    {courtType.courtTypeName}
                  </p>
                  {courtType.courtTypeDescription && (
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {courtType.courtTypeDescription}
                    </p>
                  )}
                  {courtType.createdAt && (
                    <p className="text-xs text-slate-400 mt-2">
                      Thêm vào: {new Date(courtType.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setCourtTypeToRemove(courtType)}
                  className="rounded-full border border-red-300 bg-white p-2 text-red-600 shadow-sm hover:bg-red-50 transition-colors shrink-0"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CourtBasketball className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-base font-bold text-slate-700">Chưa có loại sân</p>
            <p className="text-sm text-slate-500 mt-2">Thêm loại sân để khách hàng có thể đặt sân</p>
          </div>
        )}

        {/* Available Court Types to Add */}
        {availableCourtTypes.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-700 mb-4">Loại sân có thể thêm</h4>
            <div className="grid gap-3 md:grid-cols-2">
              {availableCourtTypes.map((courtType, index) => (
                <button
                  key={courtType.id || `available-court-type-${index}`}
                  onClick={() => handleAddCourtType(courtType.courtTypeId)}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left border border-slate-200 hover:border-[#1B5E38]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 shrink-0">
                    <CourtBasketball className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">{courtType.courtTypeName}</p>
                    {courtType.courtTypeDescription && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {courtType.courtTypeDescription}
                      </p>
                    )}
                  </div>
                  <Plus className="h-5 w-5 text-[#1B5E38] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Remove Court Type Dialog */}
      {courtTypeToRemove && (
        <ConfirmationDialog
          title="Gỡ loại sân"
          message={`Bạn có chắc chắn muốn gỡ loại sân "${courtTypeToRemove.courtTypeName}" khỏi chi nhánh này?`}
          confirmText="Gỡ loại sân"
          cancelText="Hủy"
          variant="danger"
          onConfirm={handleRemoveCourtType}
          onCancel={() => setCourtTypeToRemove(null)}
        />
      )}
    </div>
  );
}
