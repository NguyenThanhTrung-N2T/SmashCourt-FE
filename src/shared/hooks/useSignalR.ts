import { useEffect } from "react";
import { useSignalRContext } from "@/src/contexts/SignalRContext";

/**
 * Custom hook giúp các component dễ dàng đăng ký nhận các sự kiện SignalR realtime.
 * Tự động hủy đăng ký (cleanup listener) khi component unmount.
 * 
 * @param eventName Tên sự kiện SignalR cần lắng nghe (vd: SignalREvents.BOOKING_CREATED)
 * @param handler Hàm callback xử lý dữ liệu nhận được
 */
export function useSignalR<T>(
  eventName: string,
  handler: (data: T) => void
): void {
  const { connection, isConnected } = useSignalRContext();

  useEffect(() => {
    if (!connection || !isConnected) return;

    // Đăng ký nhận event
    connection.on(eventName, handler);

    // Cleanup khi component unmount hoặc connection thay đổi
    return () => {
      connection.off(eventName, handler);
    };
  }, [connection, isConnected, eventName, handler]);
}
