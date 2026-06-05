import { useState, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseAISuggestionReturn<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    trigger: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Minimum interval (ms) between successive `trigger()` calls.
 * Set to 3 000 ms to stay safely within the `ai-management` rate limit of
 * 10 req/min (one request every 6 s absolute max; 3 s debounce is a
 * reasonable client-side guard for burst prevention).
 */
const DEBOUNCE_MS = 3_000;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * `useAISuggestion` — a generic, on-demand hook for all non-chat AI
 * suggestion endpoints (pricing, promotions, analytics, strategic, booking).
 *
 * @param fetcher - An async function that calls the relevant AI API endpoint.
 *   Pass a stable reference (e.g. wrap in `useCallback`) to avoid
 *   unintentional re-renders, though the hook itself always uses the latest
 *   reference via a ref.
 *
 * @returns `{ data, isLoading, error, trigger }`
 *
 * ### Debounce behaviour
 * `trigger()` is guarded by a 3-second cooldown.  Calls made within 3 s of
 * the previous successful dispatch are silently ignored (no error is thrown).
 * This respects the `ai-management` rate limit of 10 req/min without any
 * server-round-trip penalty.
 *
 * @example — pricing suggestions
 * ```tsx
 * const { data, isLoading, error, trigger } = useAISuggestion(
 *   () => getPricingSuggestions({ fromDate: "2026-05-01", toDate: "2026-05-31" })
 * );
 *
 * // Call trigger() in response to a user action, not on mount
 * <button onClick={trigger} disabled={isLoading}>Get suggestions</button>
 * ```
 */
export function useAISuggestion<T>(
    fetcher: () => Promise<T>
): UseAISuggestionReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Always hold the latest fetcher without making it a trigger dependency.
     * This pattern avoids requiring callers to memoize the fetcher prop.
     */
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    /** Timestamp (ms) of the last dispatched request. */
    const lastCalledAt = useRef<number>(0);

    const trigger = useCallback(async () => {
        // Debounce guard — respect the management rate limit
        const now = Date.now();
        if (now - lastCalledAt.current < DEBOUNCE_MS) {
            return;
        }

        // Prevent concurrent in-flight requests
        if (isLoading) return;

        lastCalledAt.current = now;
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcherRef.current();
            setData(result);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "An unknown error occurred.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    return { data, isLoading, error, trigger };
}
