"use client";

import { useRef, useEffect } from "react";
import type { RefreshTarget } from "@/src/types/notification.types";

const REFRESH_EVENT = "smashcourt:realtime-refresh";

/**
 * Publish a refresh signal for a given resource type.
 * Called by NotificationDispatcher when a relevant SignalR event arrives.
 */
export function publishRefresh(target: RefreshTarget): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
        new CustomEvent<{ target: RefreshTarget }>(REFRESH_EVENT, {
            detail: { target },
        }),
    );
}

/**
 * Subscribe to refresh signals for a specific resource type.
 * Call this in page components that need to refetch data in response to
 * real-time events — without coupling page logic to SignalR directly.
 *
 * @param target   Which resource(s) to watch (e.g. "bookings", ["bookings", "dashboard"])
 * @param callback Function to run when a refresh signal arrives (e.g. refetch())
 *
 * @example
 * useRealtimeRefresh("bookings", () => fetchBookings());
 * useRealtimeRefresh(["bookings", "dashboard"], () => router.refresh());
 */
export function useRealtimeRefresh(
    target: RefreshTarget | RefreshTarget[],
    callback: () => void,
): void {
    // Use ref pattern instead of useCallback([]) to always call latest callback
    const callbackRef = useRef(callback);
    useEffect(() => {
        callbackRef.current = callback;
    }); // no deps = always latest

    // Stabilize the target array with useMemo in the caller, or stringify here
    const targetKey = Array.isArray(target) ? target.join(",") : target;

    useEffect(() => {
        function handleEvent(e: Event) {
            const detail = (e as CustomEvent<{ target: RefreshTarget }>).detail;
            if (!detail) return;

            const targets = targetKey.split(",") as RefreshTarget[];
            const isMatch = targets.includes(detail.target);

            if (isMatch) {
                callbackRef.current(); // always calls latest, never stale
            }
        }

        window.addEventListener(REFRESH_EVENT, handleEvent);
        return () => window.removeEventListener(REFRESH_EVENT, handleEvent);
    }, [targetKey]); // stable string, not array reference
}