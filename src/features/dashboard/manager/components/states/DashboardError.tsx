import React from "react";
import { WarningCircle } from "@phosphor-icons/react";

interface DashboardErrorProps {
    message: string;
    onRetry?: () => void;
}

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <WarningCircle size={32} weight="duotone" className="text-red-500" />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Không thể tải dữ liệu
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        {message}
                    </p>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
                        style={{
                            background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
                            boxShadow: "0 4px 14px rgba(27, 94, 56, 0.35)"
                        }}
                    >
                        Thử lại
                    </button>
                )}
            </div>
        </div>
    );
}
