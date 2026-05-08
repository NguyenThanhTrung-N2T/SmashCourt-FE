"use client";

import { useState, useEffect } from 'react';
import { Users, User, Plus, Trash, MagnifyingGlass, Warning } from '@phosphor-icons/react';
import type { BranchStaffDto, AddStaffDto, UserSearchResultDto, UserBranchRole } from '@/src/features/branch/types/branch.types';
import { useStaffManagement } from '@/src/shared/hooks/useStaffManagement';
import { useUserSearch } from '@/src/shared/hooks/useUserSearch';
import { SearchInput } from '../shared/SearchInput';
import { Pagination } from "@/src/shared/components/ui/Pagination";
import { ConfirmationDialog } from '@/src/shared/components/ui';
import { BranchStaffLoading } from '../states';
import { EmptyState } from '@/src/shared/components/layout';
import { Button } from '@/src/shared/components/ui/Button';
import { useToast } from '@/src/shared/hooks/useToast';

interface BranchStaffTabProps {
    branchId: string;
    onToast?: (tone: 'success' | 'error', message: string) => void;
}

export function BranchStaffTab({ branchId, onToast }: BranchStaffTabProps) {
    const {
        staff,
        loading,
        error,
        filters,
        updateFilters,
        addStaffMember,
        removeStaffMember,
    } = useStaffManagement(branchId);

    const [showAddModal, setShowAddModal] = useState(false);
    const [staffToRemove, setStaffToRemove] = useState<BranchStaffDto | null>(null);
    const [selectedRole, setSelectedRole] = useState<UserBranchRole>(1); // Default to STAFF
    const { show: showToast } = useToast();
    const toast = onToast ?? showToast;

    const { users, loading: searchLoading, setSearchTerm: setUserSearchTerm } = useUserSearch({
        eligibleForStaff: true,
        excludeBranchId: branchId,
        pageSize: 5,
    });

    const handleSearchChange = (searchTerm: string) => {
        updateFilters({ ...filters, searchTerm, page: 1 });
    };

    const handlePageChange = (page: number) => {
        updateFilters({ ...filters, page });
    };

    const handleAddStaff = async (user: UserSearchResultDto) => {
        try {
            const dto: AddStaffDto = {
                userId: user.id,
                role: selectedRole,
                reason: 'Added via branch management screen',
            };
            await addStaffMember(dto);
            toast('success', 'Thêm nhân viên thành công');
            setShowAddModal(false);
        } catch (err) {
            // Error handled by hook
        }
    };

    const handleRemoveStaff = async () => {
        if (!staffToRemove) return;
        try {
            await removeStaffMember(staffToRemove.userId, {
                reason: 'Removed via branch management screen',
            });
            toast('success', 'Gỡ nhân viên thành công');
            setStaffToRemove(null);
        } catch (err) {
            // Error handled by hook
        }
    };

    const getRoleBadge = (role: UserBranchRole) => {
        if (role === 0) {
            return (
                <span className="text-xs bg-purple-500/15 text-purple-600 px-2 py-1 rounded-full font-bold border border-purple-500/30">
                    Quản lý
                </span>
            );
        }
        return (
            <span className="text-xs bg-blue-500/15 text-blue-600 px-2 py-1 rounded-full font-bold border border-blue-500/30">
                Nhân viên
            </span>
        );
    };

    const getStatusBadge = (isActive: boolean) => {
        if (isActive) {
            return (
                <span className="text-xs bg-emerald-500/15 text-emerald-600 px-2 py-1 rounded-full font-bold border border-emerald-500/30">
                    Đang làm việc
                </span>
            );
        }
        return (
            <span className="text-xs bg-surface-2 text-muted px-2 py-1 rounded-full font-bold border border-border">
                Đã nghỉ
            </span>
        );
    };

    if (loading && !staff) {
        return <BranchStaffLoading />;
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
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-foreground">Nhân viên chi nhánh</h3>
                            <p className="text-xs text-muted">Quản lý danh sách nhân viên làm việc tại chi nhánh</p>
                        </div>
                    </div>

                    <Button onClick={() => setShowAddModal(true)}>
                        <Plus className="h-4 w-4" />
                        Thêm nhân viên
                    </Button>
                </div>

                <div className="mb-4">
                    <div className="relative">
                        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm nhân viên..."
                            value={filters.searchTerm || ''}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full rounded-xl border border-border bg-surface-2 pl-11 pr-4 py-3 text-sm text-foreground outline-none transition-colors hover:border-primary focus:border-primary focus:bg-surface-1 focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                {/* Staff List */}
                {staff && staff.items.length > 0 ? (
                    <div className="space-y-3">
                        {staff.items.map((member) => (
                            <div
                                key={member.userId}
                                className="flex items-center gap-4 p-4 rounded-xl bg-surface-2 border border-border hover:border-primary/50 transition-colors"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-3">
                                    <User className="h-6 w-6 text-muted" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-extrabold text-foreground">{member.fullName}</p>
                                        {getRoleBadge(member.role)}
                                        {getStatusBadge(member.isActive)}
                                    </div>
                                    <p className="text-xs text-muted">{member.email}</p>
                                    {member.phone && (
                                        <p className="text-xs text-muted mt-1">{member.phone}</p>
                                    )}
                                    <p className="text-xs text-muted mt-1">
                                        Tham gia: {new Date(member.assignedAt).toLocaleDateString('vi-VN')}
                                        {member.assignedByName && ` • Được thêm bởi ${member.assignedByName}`}
                                    </p>
                                </div>
                                {member.isActive && (
                                    <button
                                        onClick={() => setStaffToRemove(member)}
                                        className="rounded-full border border-red-500/30 bg-surface-1 p-2 text-red-500 shadow-sm hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<Users className="h-16 w-16 text-muted" />}
                        title="Chưa có nhân viên"
                        description="Thêm nhân viên để bắt đầu quản lý"
                    />
                )}

                {/* Pagination */}
                {staff && staff.totalPages > 1 && (
                    <div className="mt-6 pt-6 border-t border-border">
                        <Pagination
                            currentPage={staff.page}
                            totalPages={staff.totalPages}
                            totalItems={staff.totalItems}
                            pageSize={staff.pageSize}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in backdrop-blur-sm">
                    <div className="bg-surface-1 rounded-3xl shadow-2xl w-full max-w-lg mx-4 animate-slide-up border border-border">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                    <Users className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-lg font-extrabold text-foreground">Thêm nhân viên</h2>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 transition-colors"
                            >
                                <Plus className="h-5 w-5 rotate-45" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Role Selection */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-2">
                                    Vai trò
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(parseInt(e.target.value) as UserBranchRole)}
                                    className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground outline-none transition-colors hover:border-primary focus:border-primary focus:bg-surface-1 focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value={1}>Nhân viên</option>
                                    <option value={0}>Quản lý</option>
                                </select>
                            </div>

                            <SearchInput
                                placeholder="Tìm kiếm người dùng..."
                                onSearch={setUserSearchTerm}
                                loading={searchLoading}
                            />

                            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                                {users?.items.filter(u => u.isEligibleForStaff).map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleAddStaff(user)}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 transition-colors text-left border border-border hover:border-primary"
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

                                {users?.items.filter(u => u.isEligibleForStaff).length === 0 && (
                                    <p className="text-sm text-muted text-center py-8">
                                        Không tìm thấy người dùng phù hợp
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Staff Dialog */}
            {staffToRemove && (
                <ConfirmationDialog
                    title="Gỡ nhân viên"
                    message={`Bạn có chắc chắn muốn gỡ ${staffToRemove.fullName} khỏi chi nhánh này?`}
                    confirmText="Gỡ nhân viên"
                    cancelText="Hủy"
                    variant="danger"
                    onConfirm={handleRemoveStaff}
                    onCancel={() => setStaffToRemove(null)}
                />
            )}
        </div>
    );
}
