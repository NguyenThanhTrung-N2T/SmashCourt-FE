import React from 'react';
import { WarningCircle } from '@phosphor-icons/react';

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    message = "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
    onRetry,
    className = ''
}: ErrorStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
                <WarningCircle size={48} className="text-red-500" weight="fill" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Không thể tải dữ liệu
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm shadow-md hover:opacity-90 transition-all active:scale-95"
                >
                    Thử lại
                </button>
            )}
        </div>
    );
}
