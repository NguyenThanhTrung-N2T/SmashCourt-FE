"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { HubConnection } from "@microsoft/signalr";
import { format } from "date-fns";
import { createSignalRConnection } from "@/src/lib/signalr-client";
import { getAccessToken } from "@/src/features/auth/session/sessionStore";
import { HubConnectionState } from "@microsoft/signalr";
// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ConnectionState =
  | "Disconnected"
  | "Connecting"
  | "Connected"
  | "Reconnecting";

interface SignalRContextValue {
  connection: HubConnection | null;
  connectionState: ConnectionState;
  isConnected: boolean;
  error: string | null;
  /**
   * Manually trigger reconnection.
   * Call this after login if you are not using the "auth:token-changed" event.
   */
  reconnect: () => void;
  /**
   * Ref-counted subscription to a granular TimeGrid group.
   * Only used by CUSTOMER role to receive availability updates.
   */
  subscribeToTimeGrid: (
    branchId: string,
    courtTypeId: string,
    date: string
  ) => Promise<() => void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const SignalRContext = createContext<SignalRContextValue | undefined>(undefined);

export function useSignalRContext(): SignalRContextValue {
  const ctx = useContext(SignalRContext);
  if (!ctx) {
    throw new Error("useSignalRContext must be used within <SignalRProvider>");
  }
  return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("Disconnected");
  const [error, setError] = useState<string | null>(null);

  /**
   * Holds the currently active HubConnection.
   * Using a ref avoids stale closures inside callbacks registered with
   * conn.onclose / conn.onreconnecting / conn.onreconnected.
   */
  const activeConnRef = useRef<HubConnection | null>(null);

  /**
   * Generation counter — incremented every time a new connect attempt begins
   * or the provider cleans up. Any pending attempt whose generation no longer
   * matches the current value knows it has been superseded and must not touch
   * React state or expose the connection to context.
   *
   * This is what prevents the "stopped during negotiation" error: instead of
   * calling conn.stop() on an in-flight start(), we just let start() finish
   * and silently discard the result if the generation has moved on.
   */
  const generationRef = useRef(0);

  // ── connect ────────────────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    // 1. Claim this generation slot.
    const myGeneration = ++generationRef.current;

    // 2. Tear down any existing connection before starting a new one.
    if (activeConnRef.current) {
      try {
        await activeConnRef.current.stop();
      } catch {
        // Ignore.
      }
      activeConnRef.current = null;
      setConnection(null);
    }

    // 3. Reset all subscription state for the new connection attempt.
    //    Client and server state must be perfectly synchronized.
    subscriptionsRef.current.clear();

    const token = getAccessToken();
    if (!token) {
      setConnectionState("Disconnected");
      return;
    }

    try {
      setConnectionState("Connecting");
      setError(null);

      const conn = createSignalRConnection();

      // Register lifecycle callbacks before starting so we never miss an event.
      conn.onclose((err) => {
        if (activeConnRef.current === conn) {
          activeConnRef.current = null;
          setConnection(null);
          setConnectionState("Disconnected");
          subscriptionsRef.current.clear();
        }
        if (err) setError(`Connection closed: ${err.message}`);
      });

      conn.onreconnecting((err) => {
        setConnectionState("Reconnecting");
        if (err) setError(`Reconnecting: ${err.message}`);
      });

      conn.onreconnected(() => {
        setConnectionState("Connected");
        setError(null);

        // ✅ IMPORTANT: Re-join all active groups upon reconnection.
        // SignalR server loses group memberships when a connection drops.
        console.log(`[SignalR] Reconnected. Re-joining ${subscriptionsRef.current.size} groups...`);
        subscriptionsRef.current.forEach((count, key) => {
          if (count > 0) {
            const parts = key.split(":");
            if (parts[0] === "timegrid" && parts.length === 4) {
              const [, branchId, courtTypeId, date] = parts;
              conn.invoke("JoinTimeGrid", branchId, courtTypeId, date).catch((err) => {
                console.error(`[SignalR] Failed to re-join group ${key}:`, err);
              });
            }
          }
        });
      });

      await conn.start();

      // By the time start() resolves, our generation may have been superseded
      // (e.g. the user navigated away, logged out, or called reconnect() again).
      // In that case, quietly discard this connection — do NOT update state.
      // This is the fix for: "The connection was stopped during negotiation."
      if (myGeneration !== generationRef.current) {
        conn.stop().catch(() => { });
        return;
      }

      // ✅ Happy path — expose the ready connection.
      activeConnRef.current = conn;
      setConnection(conn);
      setConnectionState("Connected");
      setError(null);
    } catch (err) {
      // Only surface the error if this attempt is still the active one.
      // If the generation moved on, the error was caused by an intentional
      // stop() call during cleanup — swallow it silently.
      if (myGeneration === generationRef.current) {
        setConnectionState("Disconnected");
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  }, []); // No deps — connect() is stable for the lifetime of the provider.

  // ── disconnect ─────────────────────────────────────────────────────────────

  const disconnect = useCallback(async () => {
    // Invalidate any in-progress connect() attempt.
    generationRef.current++;

    if (activeConnRef.current) {
      try {
        await activeConnRef.current.stop();
      } catch {
        // Ignore.
      }
      activeConnRef.current = null;
      setConnection(null);
      setConnectionState("Disconnected");
      setError(null);
    }
  }, []);

  // ── Mount / unmount ────────────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === "undefined") return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    connect();

    return () => {
      // Bump the generation so any pending connect() self-cancels.
      generationRef.current++;

      // Fire-and-forget — we cannot await in a cleanup function.
      if (activeConnRef.current) {
        activeConnRef.current.stop().catch(console.warn);
        activeConnRef.current = null;
        // Note: we intentionally do NOT call setConnection/setConnectionState
        // here because the component is unmounting and React will ignore them.
      }
    };
  }, [connect]);
  // ↑ [connect] is stable (empty useCallback deps), so this effect runs once.
  //   No pathname, no token ref — the connection persists across navigations.

  // ── Token change listener ──────────────────────────────────────────────────
  //
  // Your auth system should dispatch this event whenever the access token is
  // set or cleared, for example:
  //
  //   // After login (token stored):
  //   window.dispatchEvent(new CustomEvent("auth:token-changed"));
  //
  //   // After logout (token cleared):
  //   window.dispatchEvent(new CustomEvent("auth:token-changed"));
  //
  // This replaces the old [pathname] hack and fires only when auth actually
  // changes, not on every route navigation.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleTokenChanged = () => {
      const token = getAccessToken();
      if (token) {
        connect();    // Reconnect with the new token.
      } else {
        disconnect(); // Token removed — user logged out.
      }
    };

    window.addEventListener("auth:token-changed", handleTokenChanged);
    return () =>
      window.removeEventListener("auth:token-changed", handleTokenChanged);
  }, [connect, disconnect]);

  // ── Public API ─────────────────────────────────────────────────────────────

  const reconnect = useCallback(() => {
    connect();
  }, [connect]);

  // ── TimeGrid Subscriptions (Ref-counted) ───────────────────────────────────
  const subscriptionsRef = useRef<Map<string, number>>(new Map());

  const subscribeToTimeGrid = useCallback(
    async (branchId: string, courtTypeId: string, date: string) => {
      if (!activeConnRef.current || connectionState !== "Connected") return () => { };

      // Normalize date to yyyy-MM-dd to ensure consistent group keys
      const normalizedDate = format(new Date(date), "yyyy-MM-dd");
      const key = `timegrid:${branchId}:${courtTypeId}:${normalizedDate}`;
      const conn = activeConnRef.current;

      const currentCount = subscriptionsRef.current.get(key) || 0;
      subscriptionsRef.current.set(key, currentCount + 1);

      if (currentCount === 0) {
        console.log(`[SignalR] Joining TimeGrid group: ${key}`);
        conn.invoke("JoinTimeGrid", branchId, courtTypeId, normalizedDate).catch((err) => {
          console.error(`[SignalR] Failed to join TimeGrid group ${key}:`, err);
        });
      }

      return () => {
        const count = subscriptionsRef.current.get(key) || 0;

        if (count <= 1) {
          subscriptionsRef.current.delete(key);

          if (conn.state !== HubConnectionState.Connected) {
            return;
          }

          conn.invoke(
            "LeaveTimeGrid",
            branchId,
            courtTypeId,
            normalizedDate
          ).catch(() => {
            // ignore cleanup errors
          });
        } else {
          subscriptionsRef.current.set(key, count - 1);
        }
      };
    },
    [connectionState]
  );
  return (
    <SignalRContext.Provider
      value={{
        connection,
        connectionState,
        isConnected: connectionState === "Connected",
        error,
        reconnect,
        subscribeToTimeGrid,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
}