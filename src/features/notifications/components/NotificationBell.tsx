"use client";

import { Bell } from "@phosphor-icons/react";
import { useNotifications } from "@/src/shared/hooks/useNotifications";

interface NotificationBellProps {
    onClick: () => void;
    className?: string;
}

/**
 * Bell icon button with animated unread badge.
 * Replaces the static Bell in all role headers.
 */
export function NotificationBell({ onClick, className = "" }: NotificationBellProps) {
    const { unreadCount } = useNotifications();
    const hasUnread = unreadCount > 0;
    const displayCount = unreadCount > 99 ? "99+" : unreadCount;

    return (
        <button
            onClick={onClick}
            aria-label={
                hasUnread
                    ? `Thông báo — ${unreadCount} chưa đọc`
                    : "Thông báo"
            }
            className={`relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-1 text-muted hover:text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
        >
            <Bell
                className={`h-[18px] w-[18px] transition-transform ${hasUnread ? "animate-wiggle" : ""}`}
                weight={hasUnread ? "fill" : "regular"}
            />

            {/* Unread badge */}
            {hasUnread && (
                <span
                    className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white border-2 border-surface-1 leading-none"
                    aria-hidden="true"
                >
                    {displayCount}
                </span>
            )}
        </button>
    );
}
