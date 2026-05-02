"use client";

import { useState, useEffect } from 'react';
import { Storefront, MapPin, Phone, Clock, User, CheckCircle, Warning } from '@phosphor-icons/react';
import type { BranchDto, UpdateBranchDto } from '@/src/shared/types/branch.types';
import { useBranchManagement } from '@/src/shared/hooks/useBranchManagement';
import { validateBranchForm } from '../../utils/validation';
import { ConfirmationDialog } from '@/src/shared/components/ui';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';

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
        return <LoadingSkeleton variant="form" rows={6} />;
    }

    if (error && !branch) {
        return (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                <Warning className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-red-600">{error}</p>
            </div>
        );
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
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Storefront className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base font-extrabold text-foreground">Thông tin chi nhánh</h3>
                        <p className="text-xs text-muted">Cập nhật thông tin cơ bản của chi nhánh</p>
                    </div>
                </div>

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

                {branch?.managerName && (
                    <div className="mt-6 pt-6 border-t border-border">
                        <div className="flex items-center gap-3 text-sm">
                            <User className="h-4 w-4 text-muted" />
                            <span className="text-muted">Quản lý hiện tại:</span>
                            <span className="font-bold text-foreground">{branch.managerName}</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex-1 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
                            boxShadow: "0 4px 14px rgba(27, 94, 56, 0.35)",
                        }}
                    >
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>

                    {branch?.status === 'ACTIVE' ? (
                        <button
                            onClick={() => setShowSuspendDialog(true)}
                            disabled={loading}
                            className="rounded-full border border-red-500/40 bg-surface-1 px-5 py-2.5 text-sm font-bold text-red-500 shadow-sm hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Tạm khóa
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowActivateDialog(true)}
                            disabled={loading}
                            className="rounded-full border border-emerald-500/40 bg-surface-1 px-5 py-2.5 text-sm font-bold text-emerald-500 shadow-sm hover:bg-emerald-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Kích hoạt
                        </button>
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
