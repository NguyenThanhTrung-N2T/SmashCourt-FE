"use client";

import { useCallback, useEffect, useRef } from "react";
import { SignalREvents } from "@/src/lib/signalr-events";
import { useSignalRContext } from "@/src/contexts/SignalRContext";
import { useNotificationContext } from "@/src/contexts/NotificationContext";
import { useToastContext } from "@/src/contexts/ToastContext";
import { publishRefresh } from "@/src/shared/hooks/useRealtimeRefresh";
import { getAuthUser } from "@/src/features/auth/session/sessionStore";
import type {
    BookingNotificationDto,
    PaymentNotificationDto,
} from "@/src/types/signalr.types";
import type { NotificationItem } from "@/src/types/notification.types";
import type { SignalREventName } from "@/src/lib/signalr-events";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const courtRefreshEvents: SignalREventName[] = [
    SignalREvents.BOOKING_CHECKED_IN,
    SignalREvents.BOOKING_CHECKED_OUT,
];
const dashboardRefreshEvents: SignalREventName[] = [
    SignalREvents.BOOKING_CREATED,
    SignalREvents.BOOKING_COMPLETED,
    SignalREvents.BOOKING_CANCELLED,
    SignalREvents.BOOKING_EXPIRED,
    SignalREvents.BOOKING_UPDATED,
    SignalREvents.BOOKING_PENDING_PAYMENT,
    SignalREvents.BOOKING_REFUNDED,
    SignalREvents.BOOKING_NO_SHOW,
];

function generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getBookingTitle(eventName: SignalREventName): string {
    switch (eventName) {
        case SignalREvents.BOOKING_CREATED:
            return "Đặt sân mới";
        case SignalREvents.BOOKING_CHECKED_IN:
            return "Check-in";
        case SignalREvents.BOOKING_CHECKED_OUT:
            return "Check-out";
        case SignalREvents.BOOKING_CANCELLED:
            return "Huỷ đặt sân";
        case SignalREvents.BOOKING_COMPLETED:
            return "Hoàn tất";
        case SignalREvents.BOOKING_REFUNDED:
            return "Đã hoàn tiền";
        case SignalREvents.BOOKING_EXPIRED:
            return "Hết hạn";
        case SignalREvents.BOOKING_UPDATED:
            return "Cập nhật đặt sân";
        case SignalREvents.BOOKING_PENDING_PAYMENT:
            return "Chờ thanh toán";
        case SignalREvents.BOOKING_NO_SHOW:
            return "Khách không đến";
        default:
            return "Thông báo đặt sân";
    }
}

// ---------------------------------------------------------------------------
// NotificationDispatcher
// A headless component — registers all 7 SignalR event handlers.
// Must be mounted inside SignalRProvider + NotificationProvider + ToastProvider.
// ---------------------------------------------------------------------------

export function NotificationDispatcher() {
    const { connection, isConnected } = useSignalRContext();
    const { addNotification } = useNotificationContext();
    const { showToast } = useToastContext();

    // Keep latest values in refs — handlers never need to re-register
    // when these change, only when connection changes
    const addNotificationRef = useRef(addNotification);
    const showToastRef = useRef(showToast);
    useEffect(() => { addNotificationRef.current = addNotification; }, [addNotification]);
    useEffect(() => { showToastRef.current = showToast; }, [showToast]);

    useEffect(() => {
        if (!connection || !isConnected) return;

        const makeBookingHandler = (eventName: SignalREventName) =>
            (dto: BookingNotificationDto) => {
                const currentUser = getAuthUser();
                if (currentUser?.role === "CUSTOMER" && dto.customerId !== currentUser.id) return;

                const title = getBookingTitle(eventName);
                const tone =
                    eventName === SignalREvents.BOOKING_CANCELLED ||
                        eventName === SignalREvents.BOOKING_EXPIRED ||
                        eventName === SignalREvents.BOOKING_NO_SHOW
                        ? "warning"
                        : eventName === SignalREvents.BOOKING_COMPLETED ||
                            eventName === SignalREvents.BOOKING_CHECKED_OUT ||
                            eventName === SignalREvents.BOOKING_REFUNDED
                            ? "success"
                            : "info";
                const item: NotificationItem = {
                    id: generateId(),
                    eventType: eventName as NotificationItem["eventType"],
                    category: "booking",
                    title,
                    message: dto.message,
                    payload: dto,
                    timestamp: dto.timestamp,
                    read: false,
                };

                // Always uses latest via ref — no stale closures
                addNotificationRef.current(item);
                showToastRef.current(tone, dto.message);

                publishRefresh("bookings");
                if (courtRefreshEvents.includes(eventName)) {
                    publishRefresh("courts");
                }
                if (dashboardRefreshEvents.includes(eventName)) {
                    publishRefresh("dashboard");
                }
                publishRefresh("booking-detail");
            };

        const makePaymentHandler = (eventName: string) =>
            (dto: PaymentNotificationDto) => {
                const tone = eventName === SignalREvents.PAYMENT_SUCCESS ? "success" : "error";
                const item: NotificationItem = {
                    id: generateId(),
                    eventType: eventName as NotificationItem["eventType"],
                    category: "payment",
                    title:
                        eventName === SignalREvents.PAYMENT_SUCCESS
                            ? "Thanh toán thành công"
                            : "Thanh toán thất bại",
                    message: dto.message,
                    payload: dto,
                    timestamp: dto.timestamp,
                    read: false,
                };
                addNotificationRef.current(item);
                showToastRef.current(tone, dto.message);
                publishRefresh("payments");
                publishRefresh("booking-detail");
                publishRefresh("dashboard");
            };

        // Create handlers once per connection, not per render
        const handlers = {
            [SignalREvents.BOOKING_CREATED]: makeBookingHandler(SignalREvents.BOOKING_CREATED),
            [SignalREvents.BOOKING_CHECKED_IN]: makeBookingHandler(SignalREvents.BOOKING_CHECKED_IN),
            [SignalREvents.BOOKING_CHECKED_OUT]: makeBookingHandler(SignalREvents.BOOKING_CHECKED_OUT),
            [SignalREvents.BOOKING_CANCELLED]: makeBookingHandler(SignalREvents.BOOKING_CANCELLED),
            [SignalREvents.BOOKING_COMPLETED]: makeBookingHandler(SignalREvents.BOOKING_COMPLETED),
            [SignalREvents.BOOKING_REFUNDED]: makeBookingHandler(SignalREvents.BOOKING_REFUNDED),
            [SignalREvents.BOOKING_EXPIRED]: makeBookingHandler(SignalREvents.BOOKING_EXPIRED),
            [SignalREvents.BOOKING_UPDATED]: makeBookingHandler(SignalREvents.BOOKING_UPDATED),
            [SignalREvents.BOOKING_PENDING_PAYMENT]: makeBookingHandler(SignalREvents.BOOKING_PENDING_PAYMENT),
            [SignalREvents.BOOKING_NO_SHOW]: makeBookingHandler(SignalREvents.BOOKING_NO_SHOW),
            [SignalREvents.PAYMENT_SUCCESS]: makePaymentHandler(SignalREvents.PAYMENT_SUCCESS),
            [SignalREvents.PAYMENT_FAILED]: makePaymentHandler(SignalREvents.PAYMENT_FAILED),
        };

        Object.entries(handlers).forEach(([event, handler]) => connection.on(event, handler));

        return () => {
            Object.entries(handlers).forEach(([event, handler]) => connection.off(event, handler));
        };
    }, [connection, isConnected]); // ← only re-registers when connection actually changes

    return null;
}
