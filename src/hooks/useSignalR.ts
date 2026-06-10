import { useEffect, useRef } from "react";
import { useSignalRContext } from "@/src/contexts/SignalRContext";

/**
 * Custom hook để đăng ký lắng nghe sự kiện SignalR
 * 
 * @param eventName - Tên sự kiện SignalR (dùng constants từ signalr-events.ts)
 * @param handler - Callback function xử lý khi nhận được sự kiện
 * 
 * @example
 * ```tsx
 * import { useSignalR } from "@/src/hooks/useSignalR";
 * import { SignalREvents } from "@/src/lib/signalr-events";
 * 
 * function MyComponent() {
 *   useSignalR(SignalREvents.BOOKING_CREATED, (data) => {
 *     toast.success(`Booking mới: ${data.customerName}`);
 *   });
 * 
 *   useSignalR(SignalREvents.PAYMENT_SUCCESS, (data) => {
 *     toast.success(`Thanh toán thành công: ${data.amount} VNĐ`);
 *   });
 * }
 * ```
 */
export function useSignalR<T = any>(
  eventName: string,
  handler: (data: T) => void
): void {
  const { connection, isConnected } = useSignalRContext();
  const handlerRef = useRef(handler);

  // Cập nhật handler ref khi handler thay đổi (tránh stale closure)
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!connection || !isConnected) return;

    // Wrapper để gọi handler hiện tại từ ref
    const wrappedHandler = (data: T) => {
      handlerRef.current(data);
    };

    // Đăng ký event listener
    connection.on(eventName, wrappedHandler);

    // Cleanup: Hủy đăng ký khi unmount hoặc dependencies thay đổi
    return () => {
      connection.off(eventName, wrappedHandler);
    };
  }, [connection, isConnected, eventName]);
}
