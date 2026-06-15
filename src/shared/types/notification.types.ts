import type { SignalREventName } from "@/src/lib/signalr-events";
import type {
    BookingNotificationDto,
    PaymentNotificationDto,
} from "@/src/shared/types/signalr.types";

/**
 * Unified notification item stored in the notification center.
 */
export interface NotificationItem {
    id: string;
    eventType: SignalREventName;
    category: "booking" | "payment";
    title: string;
    message: string;
    payload: BookingNotificationDto | PaymentNotificationDto;
    timestamp: string;
    read: boolean;
}

/**
 * Resources that can be refreshed reactively when a SignalR event fires.
 */
export type RefreshTarget =
    | "bookings"
    | "booking-detail"
    | "payments"
    | "dashboard"
    | "courts";

/**
 * Toast tone types (extends basic success/error with info and warning).
 */
export type ToastTone = "success" | "error" | "info" | "warning";

/**
 * A single toast message in the global toast queue.
 */
export interface ToastMessage {
    id: string;
    tone: ToastTone;
    message: string;
    createdAt: number;
}
