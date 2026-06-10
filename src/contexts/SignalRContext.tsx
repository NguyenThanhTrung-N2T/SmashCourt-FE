"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { HubConnection } from "@microsoft/signalr";
import { createSignalRConnection } from "@/src/lib/signalr-client";
import { getAccessToken } from "@/src/features/auth/session/sessionStore";
import { usePathname } from "next/navigation";

export type ConnectionState = "Disconnected" | "Connecting" | "Connected" | "Reconnecting";

interface SignalRContextValue {
  connection: HubConnection | null;
  connectionState: ConnectionState;
  isConnected: boolean;
  error: string | null;
}

const SignalRContext = createContext<SignalRContextValue | undefined>(undefined);

export function useSignalRContext() {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalRContext must be used within a SignalRProvider");
  }
  return context;
}

interface SignalRProviderProps {
  children: React.ReactNode;
}

export function SignalRProvider({ children }: SignalRProviderProps) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("Disconnected");
  const [error, setError] = useState<string | null>(null);
  
  // Lưu trữ accessToken hiện tại trong ref để tránh việc effect re-run liên tục
  const tokenRef = useRef<string | null>(null);
  const pathname = usePathname();

  // Nhận diện sự thay đổi của accessToken để thực hiện kết nối
  useEffect(() => {
    // Chỉ chạy trên client
    if (typeof window === "undefined") return;

    const token = getAccessToken();

    // Nếu token không đổi, không làm gì cả
    if (token === tokenRef.current) return;
    tokenRef.current = token;

    let activeConnection: HubConnection | null = null;

    const startConnection = async (accessToken: string) => {
      try {
        setConnectionState("Connecting");
        setError(null);
        
        const conn = createSignalRConnection(accessToken);
        activeConnection = conn;
        setConnection(conn);

        conn.onclose((err) => {
          setConnectionState("Disconnected");
          if (err) {
            setError(`Kết nối bị đóng do lỗi: ${err.message}`);
          }
        });

        conn.onreconnecting((err) => {
          setConnectionState("Reconnecting");
          if (err) {
            setError(`Đang thử kết nối lại: ${err.message}`);
          }
        });

        conn.onreconnected(() => {
          setConnectionState("Connected");
          setError(null);
        });

        await conn.start();
        setConnectionState("Connected");
        setError(null);
      } catch (err: any) {
        setConnectionState("Disconnected");
        setError(`Lỗi khởi động kết nối SignalR: ${err?.message || err}`);
      }
    };

    const stopConnection = async () => {
      if (activeConnection) {
        try {
          await activeConnection.stop();
        } catch (err) {
          console.warn("Lỗi khi đóng kết nối SignalR cũ:", err);
        }
        setConnection(null);
        setConnectionState("Disconnected");
      }
    };

    if (token) {
      // Nếu đã có kết nối cũ thì ngắt kết nối trước khi khởi động kết nối mới (token refresh)
      stopConnection().then(() => startConnection(token));
    } else {
      stopConnection();
    }

    return () => {
      if (activeConnection) {
        activeConnection.stop().catch((err) => console.warn("Lỗi stop connection cũ khi unmount:", err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Lắng nghe pathname để check lại token cập nhật khi route thay đổi

  const value: SignalRContextValue = {
    connection,
    connectionState,
    isConnected: connectionState === "Connected",
    error,
  };

  return (
    <React.Fragment>
      <SignalRContext.Provider value={value}>
        {children}
      </SignalRContext.Provider>
    </React.Fragment>
  );
}
