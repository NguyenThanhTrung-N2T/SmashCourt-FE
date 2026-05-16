"use client";

import { useState } from 'react';
import { X, Lock, WarningCircle } from '@phosphor-icons/react';
import { Button } from '@/src/shared/components/ui/Button';
import type { LockCustomerDto } from '../../../types/customer.types';

interface LockCustomerModalProps {
    customerName: string;
    onClose: () => void;
    onConfirm: (data: LockCustomerDto) => Promise<void>;
}

export function LockCustomerModal({ customerName, onClose, onConfirm }: LockCustomerModalProps) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        if (!reason.trim()) {
            setError('Vui lòng nhập lý do khóa tài khoản');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await onConfirm({ reason: reason.trim() });
            onClose();
        } catch (err) {
            setError('Đã xảy ra lỗi khi khóa tài khoản');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in backdrop-blur-sm">
            <div className="bg-surface-1 rounded-3xl shadow-2xl w-full max-w-md mx-4 animate-slide-up border border-border">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                            <Lock className="h-5 w-5 text-red-500" />
                        </div>
                        <h2 className="text-lg font-extrabold text-foreground">Khóa tài khoản khách hàng</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <WarningCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold text-red-600">
                                Bạn đang khóa tài khoản của <span className="font-bold">{customerName}</span>
                            </p>
                            <p className="text-red-600/80 mt-1">
                                Khách hàng sẽ không thể đăng nhập và đặt sân cho đến khi được mở khóa.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-2">
                            Lý do khóa tài khoản *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setError('');
                            }}
                            placeholder="Nhập lý do khóa tài khoản (ví dụ: Vi phạm chính sách, hành vi không phù hợp...)"
                            rows={4}
                            className={`w-full rounded-xl border ${
                                error ? 'border-red-500/40 bg-red-500/10' : 'border-border bg-surface-2'
                            } px-4 py-3 text-sm text-foreground outline-none transition-colors hover:border-primary focus:border-primary focus:bg-surface-1 focus:ring-2 focus:ring-primary/20 placeholder:text-muted resize-none`}
                        />
                        {error && (
                            <p className="mt-1 text-xs text-red-500">{error}</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 p-6 border-t border-border">
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        className="flex-1"
                        disabled={loading}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant="danger"
                        className="flex-1"
                        isLoading={loading}
                    >
                        Khóa tài khoản
                    </Button>
                </div>
            </div>
        </div>
    );
}
