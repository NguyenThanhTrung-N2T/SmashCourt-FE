"use client";

import { SignalRProvider } from "@/src/contexts/SignalRContext";
import { NotificationProvider } from "@/src/contexts/NotificationContext";
import { ToastProvider } from "@/src/contexts/ToastContext";
import { NotificationDispatcher } from "@/src/features/notifications/NotificationDispatcher";
import { GlobalToastLayer } from "@/src/shared/components/feedback/GlobalToastLayer";

/**
 * RealtimeProviders
 *
 * Wraps authenticated layouts with all real-time infrastructure:
 * - SignalRProvider   → manages WebSocket lifecycle
 * - NotificationProvider → maintains notification list + unread count
 * - ToastProvider    → manages global toast queue
 * - NotificationDispatcher → registers all 7 SignalR event handlers (headless)
 * - GlobalToastLayer → renders stacked toast notifications
 *
 * Mount this at the root of every authenticated layout (manager, staff, owner, customer).
 */
export function RealtimeProviders({ children }: { children: React.ReactNode }) {
    return (
        <SignalRProvider>
            <NotificationProvider>
                <ToastProvider>
                    <NotificationDispatcher />
                    {children}
                    <GlobalToastLayer />
                </ToastProvider>
            </NotificationProvider>
        </SignalRProvider>
    );
}
