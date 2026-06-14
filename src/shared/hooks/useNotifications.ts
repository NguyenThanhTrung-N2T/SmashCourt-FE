"use client";

import { useNotificationContext } from "@/src/contexts/NotificationContext";

/**
 * Convenience hook for accessing the global notification store.
 * Use this in UI components (bell, drawer, etc.)
 */
export function useNotifications() {
    return useNotificationContext();
}
