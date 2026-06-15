"use client";

import {
    CalendarCheck,
    CalendarX,
    CalendarBlank,
    CheckCircle,
    CurrencyCircleDollar,
    XCircle,
} from "@phosphor-icons/react";
import { SignalREvents } from "@/src/lib/signalr-events";
import type { NotificationItem } from "@/src/shared/types/notification.types";

interface NotificationCardProps {
    item: NotificationItem;
    onRead: (id: string) => void;
}

function getIcon(eventType: string) {
    switch (eventType) {
        case SignalREvents.BOOKING_CREATED:
            return <CalendarBlank className="h-5 w-5 text-blue-500" weight="fill" />;
        case SignalREvents.BOOKING_CHECKED_IN:
            return <CalendarCheck className="h-5 w-5 text-emerald-500" weight="fill" />;
        case SignalREvents.BOOKING_CHECKED_OUT:
            return <CheckCircle className="h-5 w-5 text-teal-500" weight="fill" />;
        case SignalREvents.BOOKING_CANCELLED:
            return <CalendarX className="h-5 w-5 text-amber-500" weight="fill" />;
        case SignalREvents.BOOKING_COMPLETED:
            return <CheckCircle className="h-5 w-5 text-emerald-600" weight="fill" />;
        case SignalREvents.PAYMENT_SUCCESS:
            return <CurrencyCircleDollar className="h-5 w-5 text-emerald-500" weight="fill" />;
        case SignalREvents.PAYMENT_FAILED:
            return <XCircle className="h-5 w-5 text-red-500" weight="fill" />;
        default:
            return <CalendarBlank className="h-5 w-5 text-muted" />;
    }
}

function timeAgo(isoTimestamp: string): string {
    const diff = Date.now() - new Date(isoTimestamp).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
}

export function NotificationCard({ item, onRead }: NotificationCardProps) {
    return (
        <button
            onClick={() => onRead(item.id)}
            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2 rounded-xl ${!item.read ? "bg-primary/5" : ""
                }`}
        >
            {/* Icon */}
            <div className="mt-0.5 shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-surface-2">
                {getIcon(item.eventType)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-snug">
                    {item.title}
                </p>
                <p className="text-xs text-muted mt-0.5 leading-snug line-clamp-2">
                    {item.message}
                </p>
                <p className="text-[11px] text-muted/70 mt-1">{timeAgo(item.timestamp)}</p>
            </div>

            {/* Unread dot */}
            {!item.read && (
                <span className="mt-2 shrink-0 h-2 w-2 rounded-full bg-primary" aria-label="Chưa đọc" />
            )}
        </button>
    );
}
