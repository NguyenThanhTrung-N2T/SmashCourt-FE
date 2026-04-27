"use client";

import { useState, useEffect } from 'react';
import { UserCircle, User, Plus, Trash, Warning } from '@phosphor-icons/react';
import type { BranchManagerDto, AssignManagerDto, UserSearchResultDto } from '@/src/shared/types/branch.types';
import { getCurrentManager, assignManager, removeManager } from '@/src/api/branch.api';
import { useUserSearch } from '@/src/shared/hooks/useUserSearch';
import { SearchInput } from '../shared/SearchInput';
import { ConfirmationDialog } from '../shared/ConfirmationDialog';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { handleApiError } from '../../utils/error-handling';
import { useToast } from '@/src/shared/hooks/useToast';

interface BranchManagerTabProps {
  branchId: string;
}

export function BranchManagerTab({ branchId }: BranchManagerTabProps) {
  const [manager, setManager] = useState<BranchManagerDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const { show: showToast } = useToast();

  const { users, loading: searchLoading, setSearchTerm } = useUserSearch({
    eligibleForManager: true,
    excludeBranchId: branchId,
    pageSize: 5,
  });

  const loadManager = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCurrentManager(branchId);
      setManager(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManager();
  }, [branchId]);

  const handleAssignManager = async (user: UserSearchResultDto) => {
    try {
      const dto: AssignManagerDto = {
        userId: user.id,
        reason: 'Assigned via branch management screen',
      };
      await assignManager(branchId, dto);
      showToast('success', 'Gán quản lý chi nhánh thành công');
      setShowAssignModal(false);
      await loadManager();
    } catch (err) {
      const message = handleApiError(err);
      showToast('error', message);
    }
  };

  const handleRemoveManager = async () => {
    try {
      await removeManager(branchId, {
        reason: 'Removed via branch management screen',
      });
      showToast('success', 'Gỡ quản lý chi nhánh thành công');
      setShowRemoveDialog(false);
      await loadManager();
    } catch (err) {
      const message = handleApiError(err);
      showToast('error', message);
    }
  };

  if (loading) {
    return <LoadingSkeleton variant="card" rows={3} />;
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
              <UserCircle className="h-5 w-5 text-[#1B5E38]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Quản lý chi nhánh</h3>
              <p className="text-xs text-slate-500">Gán hoặc thay đổi người quản lý chi nhánh</p>
            </div>
          </div>

          {!manager && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
                boxShadow: "0 4px 14px rgba(27, 94, 56, 0.35)",
              }}
            >
              <Plus className="h-4 w-4" />
              Gán quản lý
            </button>
          )}
        </div>

        {manager ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E38]/10">
                <User className="h-8 w-8 text-[#1B5E38]" />
              </div>
              <div className="flex-1">
                <p className="text-base font-extrabold text-slate-900">{manager.fullName}</p>
                <p className="text-sm text-slate-600">{manager.email}</p>
                {manager.phone && (
                  <p className="text-sm text-slate-500 mt-1">{manager.phone}</p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Được gán: {new Date(manager.assignedAt).toLocaleDateString('vi-VN')}
                  {manager.assignedByName && ` bởi ${manager.assignedByName}`}
                </p>
              </div>
              <button
                onClick={() => setShowRemoveDialog(true)}
                className="rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-600 shadow-sm hover:bg-red-50 transition-colors"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <UserCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-base font-bold text-slate-700">Chưa có quản lý</p>
            <p className="text-sm text-slate-500 mt-2">Chi nhánh này chưa được gán quản lý</p>
          </div>
        )}
      </div>

      {/* Assign Manager Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B5E38]/10">
                  <UserCircle className="h-5 w-5 text-[#1B5E38]" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">Gán quản lý chi nhánh</h2>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>

            <div className="p-6">
              <SearchInput
                placeholder="Tìm kiếm người dùng..."
                onSearch={setSearchTerm}
                loading={searchLoading}
              />

              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                {users?.items.filter(u => u.isEligibleForManager).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleAssignManager(user)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left border border-slate-200"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Đủ điều kiện
                    </span>
                  </button>
                ))}

                {users?.items.filter(u => u.isEligibleForManager).length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Không tìm thấy người dùng phù hợp
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Manager Dialog */}
      {showRemoveDialog && (
        <ConfirmationDialog
          title="Gỡ quản lý chi nhánh"
          message="Bạn có chắc chắn muốn gỡ người quản lý này khỏi chi nhánh?"
          confirmText="Gỡ quản lý"
          cancelText="Hủy"
          variant="danger"
          onConfirm={handleRemoveManager}
          onCancel={() => setShowRemoveDialog(false)}
        />
      )}
    </div>
  );
}
