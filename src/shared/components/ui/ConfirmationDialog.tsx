"use client";

import { useState } from 'react';
import { X, Warning, CheckCircle } from '@phosphor-icons/react';

interface ConfirmationDialogProps {
    isOpen?: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    showReasonInput?: boolean;
    reasonLabel?: string;
    reasonPlaceholder?: string;
    onConfirm: (reason?: string) => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationDialog({
    isOpen = true,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    showReasonInput = false,
    reasonLabel = 'Lý do',
    reasonPlaceholder = 'Nhập lý do (tùy chọn)',
    onConfirm,
    onCancel,
    variant = 'warning',
}: ConfirmationDialogProps) {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(showReasonInput ? reason : undefined);
    };

    const variantStyles = {
        danger: {
            icon: 'text-red-500',
            iconBg: 'bg-red-500/10',
            iconComponent: Warning,
            button: 'bg-red-600 hover:bg-red-700 text-white',
            buttonStyle: undefined as React.CSSProperties | undefined,
        },
        warning: {
            icon: 'text-amber-500',
            iconBg: 'bg-amber-500/10',
            iconComponent: Warning,
            button: 'bg-amber-600 hover:bg-amber-700 text-white',
            buttonStyle: undefined as React.CSSProperties | undefined,
        },
        info: {
            icon: 'text-primary',
            iconBg: 'bg-primary/10',
            iconComponent: CheckCircle,
            button: 'text-white shadow-md hover:opacity-90',
            buttonStyle: {
                background: 'linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)',
                boxShadow: '0 4px 14px rgba(27, 94, 56, 0.35)',
            } as React.CSSProperties,
        },
    };

    const styles = variantStyles[variant];
    const IconComponent = styles.iconComponent;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
            <div className="bg-surface-1 rounded-3xl shadow-2xl border border-border w-full max-w-md mx-4 animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles.iconBg}`}>
                            <IconComponent className={`h-5 w-5 ${styles.icon}`} />
                        </div>
                        <h2 className="text-lg font-extrabold text-foreground">{title}</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-muted leading-relaxed">{message}</p>

                    {showReasonInput && (
                        <div>
                            <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-2">
                                {reasonLabel}
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder={reasonPlaceholder}
                                rows={3}
                                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors hover:border-primary focus:border-primary focus:bg-surface-1 focus:ring-2 focus:ring-primary/20 resize-none"
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 p-6 border-t border-border">
                    <button
                        onClick={onCancel}
                        className="flex-1 rounded-full border border-border bg-surface-1 px-5 py-2.5 text-sm font-bold text-foreground shadow-sm hover:bg-surface-2 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 rounded-full px-5 py-2.5 text-sm font-bold shadow-md transition-all active:scale-95 ${styles.button}`}
                        style={styles.buttonStyle}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
