"use client";

import { useToastContext } from "@/src/contexts/ToastContext";

/**
 * Convenience hook for firing app-wide toast notifications.
 * Available in any component inside <ToastProvider>.
 *
 * @example
 * const { showToast } = useGlobalToast();
 * showToast("success", "Booking created!");
 * showToast("error", "Payment failed.");
 * showToast("info", "Checking in...");
 * showToast("warning", "Booking cancelled.");
 */
export function useGlobalToast() {
    const { showToast, dismissToast } = useToastContext();
    return { showToast, dismissToast };
}
