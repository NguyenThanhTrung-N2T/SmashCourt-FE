"use client";

import { useState } from 'react';
import { X, LockOpen, CheckCircle } from '@phosphor-icons/react';
import { Button } from '@/src/shared/components/ui/Button';

interface UnlockCustomerModalProps {
    customerName: string;
    lockReason?: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export function UnlockCustomerModal({
    customerName,
    lockReason,
    onClose,
    onConfirm,
}: UnlockCustomerModalProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (err) {
            // Error handled by parent
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                            <LockOpen className="h-5 w-5 text-emerald-500" />
                        </div>
                        <h2 className="text-lg font-extrabold text-foreground">Mở khóa tài khoản</h2>
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
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold text-emerald-600">
                                Bạn đang mở khóa tài khoản của <span className="font-bold">{customerName}</span>
                            </p>
                            <p className="text-emerald-600/80 mt-1">
                                Khách hàng sẽ có thể đăng nhập và đặt sân trở lại.
                            </p>
                        </div>
                    </div>

                    {lockReason && (
                        <div className="p-4 rounded-xl bg-surface-2 border border-border">
                            <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1">
                                Lý do khóa trước đó
                            </p>
                            <p className="text-sm text-foreground">{lockReason}</p>
                        </div>
                    )}
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
                        variant="success"
                        className="flex-1"
                        isLoading={loading}
                    >
                        Mở khóa
                    </Button>
                </div>
            </div>
        </div>
    );
}
