"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";
import type { ToastMessage, ToastTone } from "@/src/shared/types/notification.types";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ToastContextValue {
    toasts: ToastMessage[];
    showToast: (tone: ToastTone, message: string, durationMs?: number) => void;
    dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const DEFAULT_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
        new Map(),
    );

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);

    const showToast = useCallback(
        (tone: ToastTone, message: string, durationMs = DEFAULT_DURATION_MS) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            const newToast: ToastMessage = { id, tone, message, createdAt: Date.now() };

            setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5

            const timer = setTimeout(() => {
                dismissToast(id);
            }, durationMs);

            timersRef.current.set(id, timer);
        },
        [dismissToast],
    );

    return (
        <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
            {children}
        </ToastContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useToastContext() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToastContext must be used inside <ToastProvider>");
    }
    return ctx;
}
