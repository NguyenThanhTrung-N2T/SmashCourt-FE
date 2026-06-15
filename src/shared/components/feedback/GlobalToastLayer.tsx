"use client";

import { X, CheckCircle, XCircle, Info, Warning } from "@phosphor-icons/react";
import { useToastContext } from "@/src/contexts/ToastContext";
import type { ToastMessage, ToastTone } from "@/src/shared/types/notification.types";

// ---------------------------------------------------------------------------
// Individual Toast Item
// ---------------------------------------------------------------------------

const toastStyles: Record<
    ToastTone,
    { container: string; icon: React.ReactNode }
> = {
    success: {
        container:
            "border-emerald-200 bg-emerald-50/95 dark:border-emerald-900/30 dark:bg-emerald-950/90",
        icon: (
            <CheckCircle
                className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                weight="fill"
            />
        ),
    },
    error: {
        container:
            "border-red-200 bg-red-50/95 dark:border-red-900/30 dark:bg-red-950/90",
        icon: (
            <XCircle
                className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
                weight="fill"
            />
        ),
    },
    info: {
        container:
            "border-blue-200 bg-blue-50/95 dark:border-blue-900/30 dark:bg-blue-950/90",
        icon: (
            <Info
                className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
                weight="fill"
            />
        ),
    },
    warning: {
        container:
            "border-amber-200 bg-amber-50/95 dark:border-amber-900/30 dark:bg-amber-950/90",
        icon: (
            <Warning
                className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
                weight="fill"
            />
        ),
    },
};

const textStyles: Record<ToastTone, string> = {
    success: "text-emerald-900 dark:text-emerald-200",
    error: "text-red-900 dark:text-red-200",
    info: "text-blue-900 dark:text-blue-200",
    warning: "text-amber-900 dark:text-amber-200",
};

function ToastItem({
    toast,
    onDismiss,
}: {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}) {
    const style = toastStyles[toast.tone];

    return (
        <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm animate-slide-up ${style.container}`}
            role="alert"
            aria-live="assertive"
        >
            {style.icon}
            <p className={`flex-1 text-sm font-semibold ${textStyles[toast.tone]}`}>
                {toast.message}
            </p>
            <button
                onClick={() => onDismiss(toast.id)}
                aria-label="Đóng thông báo"
                className="ml-1 shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

// ---------------------------------------------------------------------------
// GlobalToastLayer — renders stacked toasts, mounted once in each layout
// ---------------------------------------------------------------------------

export function GlobalToastLayer() {
    const { toasts, dismissToast } = useToastContext();

    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)]"
            aria-label="Thông báo hệ thống"
        >
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
            ))}
        </div>
    );
}
