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
import { createSignalRConnection } from "@/src/lib/signalr-client";
import { getAccessToken } from "@/src/features/auth/session/sessionStore";

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
    // Claim this generation slot.
    const myGeneration = ++generationRef.current;

    // Tear down any existing connection before starting a new one.
    if (activeConnRef.current) {
      try {
        await activeConnRef.current.stop();
      } catch {
        // Ignore — we're replacing it anyway.
      }
      activeConnRef.current = null;
      setConnection(null);
    }

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
        // Only update state if this is still the active connection.
        if (activeConnRef.current === conn) {
          activeConnRef.current = null;
          setConnection(null);
          setConnectionState("Disconnected");
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
      });

      // ✅ Fully start the connection BEFORE exposing it to context.
      //    This prevents consumers from receiving a connection that is still
      //    in the "Connecting" state and cannot accept .on() registrations yet.
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

  return (
    <SignalRContext.Provider
      value={{
        connection,
        connectionState,
        isConnected: connectionState === "Connected",
        error,
        reconnect,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
}