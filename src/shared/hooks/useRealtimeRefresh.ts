"use client";

import { useRef, useEffect } from "react";
import type { RefreshTarget } from "@/src/shared/types/notification.types";

const REFRESH_EVENT = "smashcourt:realtime-refresh";

/**
 * Publish a refresh signal for a given resource type.
 * Called by NotificationDispatcher when a relevant SignalR event arrives.
 */
export function publishRefresh(target: RefreshTarget, payload?: unknown): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
        new CustomEvent<{ target: RefreshTarget; payload?: unknown }>(REFRESH_EVENT, {
            detail: { target, payload },
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
export function useRealtimeRefresh<TPayload = unknown>(
    target: RefreshTarget | RefreshTarget[],
    callback: (target: RefreshTarget, payload?: TPayload) => void,
): void {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    });

    const targetKey = Array.isArray(target) ? target.join(",") : target;

    useEffect(() => {
        function handleEvent(e: Event) {
            const detail = (
                e as CustomEvent<{
                    target: RefreshTarget;
                    payload?: TPayload;
                }>
            ).detail;

            if (!detail) return;

            const targets = targetKey.split(",") as RefreshTarget[];

            if (targets.includes(detail.target)) {
                callbackRef.current(detail.target, detail.payload);
            }
        }

        window.addEventListener(REFRESH_EVENT, handleEvent);
        return () => window.removeEventListener(REFRESH_EVENT, handleEvent);
    }, [targetKey]);
}