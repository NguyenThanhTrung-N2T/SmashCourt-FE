"use client";

import { useState, useEffect } from 'react';
import { CourtBasketball, Plus, Trash, Warning } from '@phosphor-icons/react';
import type { BranchCourtTypeDto, AddCourtTypeToBranchDto } from '@/src/features/court-type/shared/types/court-type.types';
import { fetchBranchCourtTypes, addCourtTypeToBranch, removeCourtTypeFromBranch } from '@/src/api/court-type.api';
import { ConfirmationDialog } from '@/src/shared/components/ui';
import { BranchCourtTypesLoading } from '../states';
import { EmptyState } from '@/src/shared/components/layout';
import { handleApiError } from '../../utils/error-handling';
import { useToast } from '@/src/shared/hooks/useToast';
import { formatDate } from '@/src/shared/utils/date';
interface BranchCourtTypesTabProps {
    branchId: string;
    onToast?: (tone: 'success' | 'error', message: string) => void;
}

export function BranchCourtTypesTab({ branchId, onToast }: BranchCourtTypesTabProps) {
    const [branchCourtTypes, setBranchCourtTypes] = useState<BranchCourtTypeDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [courtTypeToRemove, setCourtTypeToRemove] = useState<BranchCourtTypeDto | null>(null);
    const { show: showToast } = useToast();

    const toast = onToast ?? showToast;

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
            await addCourtTypeToBranch(dto, branchId);
            toast('success', 'Thêm loại sân thành công');
            await loadData();
        } catch (err: unknown) {
            const message = handleApiError(err);
            toast('error', message);
        }
    };

    const handleRemoveCourtType = async () => {
        if (!courtTypeToRemove) return;
        try {
            await removeCourtTypeFromBranch(courtTypeToRemove.courtTypeId, branchId);
            toast('success', 'Gỡ loại sân thành công');
            setCourtTypeToRemove(null);
            await loadData();
        } catch (err: unknown) {
            const message = handleApiError(err);
            toast('error', message);
        }
    };

    const activeCourtTypes = branchCourtTypes.filter(ct => ct.id !== null && ct.isActive);
    const availableCourtTypes = branchCourtTypes.filter(ct => !ct.isActive);

    if (loading) {
        return <BranchCourtTypesLoading />;
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
                            <CourtBasketball className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-foreground">Loại sân</h3>
                            <p className="text-xs text-muted">Quản lý các loại sân có sẵn tại chi nhánh</p>
                        </div>
                    </div>
                </div>

                {/* Court Types List */}
                {activeCourtTypes.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {activeCourtTypes.map((courtType, index) => (
                            <div
                                key={courtType.id || `branch-court-type-${index}`}
                                className="flex items-start gap-4 p-4 rounded-xl bg-surface-2 border border-border hover:border-primary/50 transition-colors"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                                    <CourtBasketball className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-extrabold text-foreground truncate mb-1">
                                        {courtType.courtTypeName}
                                    </p>
                                    {courtType.courtTypeDescription && (
                                        <p className="text-xs text-muted line-clamp-2">
                                            {courtType.courtTypeDescription}
                                        </p>
                                    )}
                                    {courtType.createdAt && (
                                        <p className="text-xs text-muted mt-2">
                                            Thêm vào: {formatDate(courtType.createdAt)}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setCourtTypeToRemove(courtType)}
                                    className="rounded-full border border-red-500/30 bg-surface-1 p-2 text-red-500 shadow-sm hover:bg-red-500/10 transition-colors shrink-0"
                                >
                                    <Trash className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<CourtBasketball className="h-16 w-16 text-muted" />}
                        title="Chưa có loại sân"
                        description="Thêm loại sân để khách hàng có thể đặt sân"
                    />)}

                {/* Available Court Types to Add */}
                {availableCourtTypes.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                        <h4 className="text-sm font-bold text-foreground mb-4">Loại sân có thể thêm</h4>
                        <div className="grid gap-3 md:grid-cols-2">
                            {availableCourtTypes.map((courtType, index) => (
                                <button
                                    key={courtType.id || `available-court-type-${index}`}
                                    onClick={() => handleAddCourtType(courtType.courtTypeId)}
                                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-2 transition-colors text-left border border-border hover:border-primary"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-3 shrink-0">
                                        <CourtBasketball className="h-5 w-5 text-muted" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground">{courtType.courtTypeName}</p>
                                        {courtType.courtTypeDescription && (
                                            <p className="text-xs text-muted mt-1 line-clamp-2">
                                                {courtType.courtTypeDescription}
                                            </p>
                                        )}
                                    </div>
                                    <Plus className="h-5 w-5 text-primary shrink-0" />
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
