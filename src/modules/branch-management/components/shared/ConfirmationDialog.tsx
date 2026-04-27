"use client";

import { useState } from 'react';
import { X, Warning } from '@phosphor-icons/react';

interface ConfirmationDialogProps {
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

  const handleConfirm = () => {
    onConfirm(showReasonInput ? reason : undefined);
  };

  const variantStyles = {
    danger: {
      icon: 'text-red-500',
      iconBg: 'bg-red-50',
      button: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: 'text-amber-500',
      iconBg: 'bg-amber-50',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    info: {
      icon: 'text-blue-500',
      iconBg: 'bg-blue-50',
      button: 'bg-[#1B5E38] hover:opacity-90 text-white',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles.iconBg}`}>
              <Warning className={`h-5 w-5 ${styles.icon}`} />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>

          {showReasonInput && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                {reasonLabel}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={reasonPlaceholder}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-colors hover:border-[#1B5E38] focus:border-[#1B5E38] focus:bg-white focus:ring-2 focus:ring-[#1B5E38]/20 resize-none"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 rounded-full px-5 py-2.5 text-sm font-bold shadow-md transition-all active:scale-95 ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
