"use client";

import { useState, useEffect } from 'react';
import { UserCircle, User, Plus, Trash, Warning } from '@phosphor-icons/react';
import type { BranchManagerDto, AssignManagerDto, UserSearchResultDto } from '@/src/features/branch/shared/types/branch.types';
import { getCurrentManager, assignManager, removeManager } from '@/src/api/branch.api';
import { useUserSearch } from '@/src/shared/hooks/useUserSearch';
import { SearchInput } from '../shared/SearchInput';
import { ConfirmationDialog } from '@/src/shared/components/ui';
import { BranchManagerLoading } from '../states';
import { EmptyState } from '@/src/shared/components/layout';
import { Button } from '@/src/shared/components/ui/Button';
import { handleApiError } from '../../utils/error-handling';
import { useToast } from '@/src/shared/hooks/useToast';

interface BranchManagerTabProps {
    branchId: string;
    onToast?: (tone: 'success' | 'error', message: string) => void;
}

export function BranchManagerTab({ branchId, onToast }: BranchManagerTabProps) {
    const [manager, setManager] = useState<BranchManagerDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const { show: showToast } = useToast();
    const toast = onToast ?? showToast;

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
            toast('success', 'Gán quản lý chi nhánh thành công');
            setShowAssignModal(false);
            await loadManager();
        } catch (err) {
            const message = handleApiError(err);
            toast('error', message);
        }
    };

    const handleRemoveManager = async () => {
        try {
            await removeManager(branchId, {
                reason: 'Removed via branch management screen',
            });
            toast('success', 'Gỡ quản lý chi nhánh thành công');
            setShowRemoveDialog(false);
            await loadManager();
        } catch (err) {
            const message = handleApiError(err);
            toast('error', message);
        }
    };

    if (loading) {
        return <BranchManagerLoading />;
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3">
                    <Warning className="h-6 w-6 text-red-500" />
                    <p className="font-bold text-red-600">{error}</p>
                </div>
            )}

            <div className="rounded-2xl border border-border bg-surface-1 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <UserCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-foreground">Quản lý chi nhánh</h3>
                            <p className="text-xs text-muted">Gán hoặc thay đổi người quản lý chi nhánh</p>
                        </div>
                    </div>
                </div>

                {manager ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-2 border border-border">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-base font-extrabold text-foreground">{manager.fullName}</p>
                                <p className="text-sm text-muted">{manager.email}</p>
                                {manager.phone && (
                                    <p className="text-sm text-muted mt-1">{manager.phone}</p>
                                )}
                                <p className="text-xs text-muted mt-2">
                                    Được gán: {new Date(manager.assignedAt).toLocaleDateString('vi-VN')}
                                    {manager.assignedByName && ` bởi ${manager.assignedByName}`}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowRemoveDialog(true)}
                                className="rounded-full border border-red-500/30 bg-surface-1 px-4 py-2 text-sm font-bold text-red-500 shadow-sm hover:bg-red-500/10 transition-colors"
                            >
                                <Trash className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <EmptyState
                        icon={<UserCircle className="h-16 w-16 text-muted" />}
                        title="Chưa có quản lý"
                        description="Chi nhánh này chưa được gán quản lý"
                        action={
                            <Button onClick={() => setShowAssignModal(true)}>
                                <Plus className="h-4 w-4" />
                                Gán quản lý
                            </Button>
                        }
                    />
                )}
            </div>

            {/* Assign Manager Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in backdrop-blur-sm">
                    <div className="bg-surface-1 rounded-3xl shadow-2xl w-full max-w-lg mx-4 animate-slide-up border border-border">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                    <UserCircle className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-lg font-extrabold text-foreground">Gán quản lý chi nhánh</h2>
                            </div>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 transition-colors"
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
                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 transition-colors text-left border border-border"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-3">
                                            <User className="h-5 w-5 text-muted" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-foreground">{user.fullName}</p>
                                            <p className="text-xs text-muted">{user.email}</p>
                                        </div>
                                        <span className="text-xs bg-emerald-500/15 text-emerald-600 px-2 py-1 rounded-full border border-emerald-500/30">
                                            Đủ điều kiện
                                        </span>
                                    </button>
                                ))}

                                {users?.items.filter(u => u.isEligibleForManager).length === 0 && (
                                    <p className="text-sm text-muted text-center py-8">
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
