"use client";

import { useState, useEffect } from 'react';
import { Storefront, MapPin, Phone, Clock, User, CheckCircle, Warning } from '@phosphor-icons/react';
import type { BranchDto, UpdateBranchDto } from '@/src/features/branch/types/branch.types';
import { useBranchManagement } from '@/src/shared/hooks/useBranchManagement';
import { validateBranchForm } from '../../utils/validation';
import { ConfirmationDialog } from '@/src/shared/components/ui';
import { BranchInfoLoading, BranchErrorState } from '../states';
import { Button } from '@/src/shared/components/ui/Button';
import { Badge } from '@/src/shared/components/ui/Badge';

interface BranchInfoTabProps {
    branchId: string;
    onUpdate?: () => void;
}

const inputCls = (hasError?: boolean) =>
    `w-full rounded-xl border ${hasError
        ? 'border-red-500/40 bg-red-500/10'
        : 'border-border bg-surface-2'
    } px-4 py-3 text-sm text-foreground outline-none transition-colors
 placeholder:text-muted
 hover:border-primary
 focus:border-primary
 focus:bg-surface-1
 focus:ring-2 focus:ring-primary/20`;

export function BranchInfoTab({ branchId, onUpdate }: BranchInfoTabProps) {
    const { branch, loading, error, loadBranch, updateBranchInfo, suspend, activate } = useBranchManagement(branchId);

    const [formData, setFormData] = useState<UpdateBranchDto>({
        name: '',
        address: '',
        phone: '',
        avatarUrl: '',
        latitude: undefined,
        longitude: undefined,
        openTime: '',
        closeTime: '',
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showSuspendDialog, setShowSuspendDialog] = useState(false);
    const [showActivateDialog, setShowActivateDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        loadBranch();
    }, [loadBranch]);

    useEffect(() => {
        if (branch) {
            setFormData({
                name: branch.name,
                address: branch.address,
                phone: branch.phone || '',
                avatarUrl: branch.avatarUrl || '',
                latitude: branch.latitude,
                longitude: branch.longitude,
                openTime: branch.openTime,
                closeTime: branch.closeTime,
            });
        }
    }, [branch]);

    const handleInputChange = (field: keyof UpdateBranchDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSave = async () => {
        const errors = validateBranchForm(formData);
        if (errors.length > 0) {
            const errorMap: Record<string, string> = {};
            errors.forEach(err => {
                errorMap[err.field] = err.message;
            });
            setValidationErrors(errorMap);
            return;
        }

        setSaving(true);
        setSuccessMessage('');
        try {
            await updateBranchInfo(formData);
            setSuccessMessage('Cập nhật thông tin chi nhánh thành công');
            onUpdate?.();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            // Error handled by hook
        } finally {
            setSaving(false);
        }
    };

    const handleSuspend = async () => {
        try {
            await suspend();
            setShowSuspendDialog(false);
            setSuccessMessage('Tạm khóa chi nhánh thành công');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            // Error handled by hook
        }
    };

    const handleActivate = async () => {
        try {
            await activate();
            setShowActivateDialog(false);
            setSuccessMessage('Kích hoạt chi nhánh thành công');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            // Error handled by hook
        }
    };

    if (loading && !branch) {
        return <BranchInfoLoading />;
    }

    if (error && !branch) {
        return <BranchErrorState message={error} />;
    }

    return (
        <div className="space-y-6">
            {successMessage && (
                <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 p-4 flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0" />
                    <p className="font-bold text-emerald-600">{successMessage}</p>
                </div>
            )}

            {error && (
                <div className="rounded-2xl border-2 border-red-500/40 bg-red-500/10 p-4 flex items-center gap-3">
                    <Warning className="h-6 w-6 text-red-500 shrink-0" />
                    <p className="font-bold text-red-600">{error}</p>
                </div>
            )}

            <div className="rounded-2xl border border-border bg-surface-1 shadow-sm p-6">
                {branch && (
                    <div className="flex items-center justify-between mb-6">
                        {(() => {
                            const isActive = branch.status === 0;
                            const isSuspended = branch.status === 1;
                            return (
                                <Badge
                                    variant={isActive ? 'success' : isSuspended ? 'warning' : 'neutral'}
                                    dot
                                >
                                    {isActive ? 'Đang hoạt động' : isSuspended ? 'Tạm khóa' : 'Đã xóa'}
                                </Badge>
                            );
                        })()}

                        {branch.managerName && (
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted shrink-0" />
                                <span className="text-muted">Quản lý hiện tại:</span>
                                <span className="font-bold text-foreground">{branch.managerName}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-2">
                            Tên chi nhánh *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={inputCls(!!validationErrors.name)}
                        />
                        {validationErrors.name && (
                            <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-2">
                            Số điện thoại
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className={`${inputCls(!!validationErrors.phone)} pl-11`}
                            />
                        </div>
                        {validationErrors.phone && (
                            <p className="mt-1 text-xs text-red-500">{validationErrors.phone}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-2">
                            URL ảnh đại diện
                        </label>
                        <input
                            type="text"
                            value={formData.avatarUrl}
                            onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                            placeholder="https://example.com/branch-logo.jpg"
                            className={inputCls()}
                        />
                        <p className="mt-1 text-xs text-muted">URL hình ảnh đại diện cho chi nhánh (tùy chọn)</p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-2">
                            Địa chỉ *
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-4 h-4 w-4 text-muted" />
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                rows={2}
                                className={`${inputCls(!!validationErrors.address)} pl-11 resize-none`}
                            />
                        </div>
                        {validationErrors.address && (
                            <p className="mt-1 text-xs text-red-500">{validationErrors.address}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-2">
                            Vĩ độ (Latitude)
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={formData.latitude || ''}
                            onChange={(e) => handleInputChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="10.762622"
                            className={inputCls()}
                        />
                        <p className="mt-1 text-xs text-muted">Tọa độ GPS (tùy chọn)</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-2">
                            Kinh độ (Longitude)
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={formData.longitude || ''}
                            onChange={(e) => handleInputChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="106.660172"
                            className={inputCls()}
                        />
                        <p className="mt-1 text-xs text-muted">Tọa độ GPS (tùy chọn)</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-2">
                            Giờ mở cửa *
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                            <input
                                type="time"
                                value={formData.openTime.substring(0, 5)}
                                onChange={(e) => handleInputChange('openTime', e.target.value + ':00')}
                                className={`${inputCls(!!validationErrors.openTime)} pl-11`}
                            />
                        </div>
                        {validationErrors.openTime && (
                            <p className="mt-1 text-xs text-red-500">{validationErrors.openTime}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-2">
                            Giờ đóng cửa *
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                            <input
                                type="time"
                                value={formData.closeTime.substring(0, 5)}
                                onChange={(e) => handleInputChange('closeTime', e.target.value + ':00')}
                                className={`${inputCls(!!validationErrors.closeTime)} pl-11`}
                            />
                        </div>
                        {validationErrors.closeTime && (
                            <p className="mt-1 text-xs text-red-500">{validationErrors.closeTime}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
                    <Button
                        onClick={handleSave}
                        disabled={saving || loading}
                        isLoading={saving}
                        className="flex-1 justify-center"
                    >
                        Lưu thay đổi
                    </Button>

                    {branch?.status === 0 ? (
                        <Button
                            variant="danger"
                            onClick={() => setShowSuspendDialog(true)}
                            disabled={loading}
                        >
                            Tạm khóa
                        </Button>
                    ) : (
                        <Button
                            variant="success"
                            onClick={() => setShowActivateDialog(true)}
                            disabled={loading}
                        >
                            Kích hoạt
                        </Button>
                    )}
                </div>
            </div>

            {showSuspendDialog && (
                <ConfirmationDialog
                    title="Tạm khóa chi nhánh"
                    message="Bạn có chắc chắn muốn tạm khóa chi nhánh này? Chi nhánh sẽ không thể hoạt động cho đến khi được kích hoạt lại."
                    confirmText="Tạm khóa"
                    cancelText="Hủy"
                    variant="danger"
                    onConfirm={handleSuspend}
                    onCancel={() => setShowSuspendDialog(false)}
                />
            )}

            {showActivateDialog && (
                <ConfirmationDialog
                    title="Kích hoạt chi nhánh"
                    message="Bạn có chắc chắn muốn kích hoạt lại chi nhánh này?"
                    confirmText="Kích hoạt"
                    cancelText="Hủy"
                    variant="info"
                    onConfirm={handleActivate}
                    onCancel={() => setShowActivateDialog(false)}
                />
            )}
        </div>
    );
}
