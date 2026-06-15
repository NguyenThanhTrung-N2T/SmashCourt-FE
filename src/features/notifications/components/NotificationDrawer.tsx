"use client";

import { useRef, useEffect } from "react";
import { X, BellSlash, Checks } from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import { useNotifications } from "@/src/shared/hooks/useNotifications";
import { NotificationCard } from "./NotificationCard";
import { useSignalRContext } from "@/src/contexts/SignalRContext";

interface NotificationDrawerProps {
    open: boolean;
    onClose: () => void;
}

function ConnectionStatusPill() {
    const { connectionState } = useSignalRContext();

    const styles: Record<string, string> = {
        Connected: "",
        Reconnecting: "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        Connecting: "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
        Disconnected: "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    };

    const labels: Record<string, string> = {
        Connected: "",
        Reconnecting: "Đang kết nối lại...",
        Connecting: "Đang kết nối...",
        Disconnected: "Mất kết nối",
    };

    return (
        <span
            className={`${styles[connectionState] ?? styles.Disconnected}`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {labels[connectionState] ?? connectionState}
        </span>
    );
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
        useNotifications();
    const drawerRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    // Trap scroll when open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[1000] bg-black/50"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer panel */}
            <div
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-label="Trung tâm thông báo"
                className="fixed right-0 top-0 bottom-0 z-[1001] flex flex-col w-[380px] max-w-full bg-surface-1 shadow-2xl border-l border-border animate-slide-in-right"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-foreground">Thông báo</h2>
                        <ConnectionStatusPill />
                    </div>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                title="Đánh dấu tất cả đã đọc"
                                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                            >
                                <Checks className="h-4 w-4" />
                                Đọc tất cả
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAll}
                                title="Xoá tất cả thông báo"
                                className="rounded-lg px-2 py-1.5 text-xs font-semibold text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
                            >
                                Xoá tất cả
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            aria-label="Đóng ngăn thông báo"
                            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-2 text-muted hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Notification list */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center">
                            <BellSlash className="h-12 w-12 text-muted/40" />
                            <p className="text-sm font-semibold text-muted">
                                Chưa có thông báo nào
                            </p>
                            <p className="text-xs text-muted/60">
                                Các sự kiện đặt sân và thanh toán sẽ xuất hiện ở đây.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-0.5">
                            {notifications.map((item) => (
                                <NotificationCard
                                    key={item.id}
                                    item={item}
                                    onRead={markAsRead}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-border shrink-0">
                    <p className="text-[11px] text-muted text-center">
                        {notifications.length > 0
                            ? `${notifications.length} thông báo gần đây`
                            : ""}
                    </p>
                </div>
            </div>
        </>,
        document.body,
    );
}
