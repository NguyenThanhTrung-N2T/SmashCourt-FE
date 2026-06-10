/**
 * SignalR Usage Example Component
 * 
 * Đây là component mẫu để minh họa cách sử dụng SignalR trong ứng dụng.
 * Bạn có thể copy pattern này vào các component thực tế của bạn.
 */

"use client";

import { useSignalR } from "@/src/hooks/useSignalR";
import { SignalREvents } from "@/src/lib/signalr-events";
import { useSignalRContext } from "@/src/contexts/SignalRContext";

// Types tương ứng với Backend DTOs
interface BookingNotification {
  bookingId: string;
  customerId: string;
  customerName: string;
  branchId: string;
  branchName: string;
  status: string;
  message: string;
  timestamp: string;
}

interface PaymentNotification {
  bookingId: string;
  invoiceId: string;
  amount: number;
  status: string;
  message: string;
  timestamp: string;
}

export function SignalRExample() {
  const { connectionState, isConnected, error } = useSignalRContext();

  // Lắng nghe sự kiện Booking Created
  useSignalR<BookingNotification>(SignalREvents.BOOKING_CREATED, (data) => {
    console.log("📅 Booking mới được tạo:", data);
    // TODO: Hiển thị toast notification
    // toast.success(`Booking mới: ${data.customerName} tại ${data.branchName}`);
    
    // TODO: Refresh danh sách booking nếu đang ở trang booking list
    // queryClient.invalidateQueries(['bookings']);
  });

  // Lắng nghe sự kiện Check-in
  useSignalR<BookingNotification>(SignalREvents.BOOKING_CHECKED_IN, (data) => {
    console.log("✅ Khách hàng đã check-in:", data);
    // TODO: Update UI
    // toast.info(`${data.customerName} đã check-in`);
  });

  // Lắng nghe sự kiện Check-out
  useSignalR<BookingNotification>(SignalREvents.BOOKING_CHECKED_OUT, (data) => {
    console.log("🚪 Khách hàng đã check-out:", data);
    // TODO: Update UI
  });

  // Lắng nghe sự kiện Hủy booking
  useSignalR<BookingNotification>(SignalREvents.BOOKING_CANCELLED, (data) => {
    console.log("❌ Booking bị hủy:", data);
    // TODO: Update UI và hiển thị thông báo
    // toast.warning(`Booking ${data.bookingId} đã bị hủy`);
  });

  // Lắng nghe sự kiện Hoàn thành booking
  useSignalR<BookingNotification>(SignalREvents.BOOKING_COMPLETED, (data) => {
    console.log("🎉 Booking hoàn thành:", data);
    // TODO: Update UI
  });

  // Lắng nghe sự kiện Thanh toán thành công
  useSignalR<PaymentNotification>(SignalREvents.PAYMENT_SUCCESS, (data) => {
    console.log("💰 Thanh toán thành công:", data);
    // TODO: Hiển thị thông báo và refresh invoice
    // toast.success(`Thanh toán thành công: ${data.amount.toLocaleString('vi-VN')} VNĐ`);
    // queryClient.invalidateQueries(['invoices', data.invoiceId]);
  });

  // Lắng nghe sự kiện Thanh toán thất bại
  useSignalR<PaymentNotification>(SignalREvents.PAYMENT_FAILED, (data) => {
    console.log("❌ Thanh toán thất bại:", data);
    // TODO: Hiển thị thông báo lỗi
    // toast.error(`Thanh toán thất bại: ${data.message}`);
  });

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-bold mb-2">SignalR Connection Status</h3>
      <div className="space-y-2">
        <div>
          <span className="font-medium">Trạng thái: </span>
          <span
            className={`px-2 py-1 rounded text-sm ${
              isConnected
                ? "bg-green-100 text-green-800"
                : connectionState === "Connecting" || connectionState === "Reconnecting"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {connectionState}
          </span>
        </div>
        {error && (
          <div className="text-red-600 text-sm">
            <span className="font-medium">Lỗi: </span>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Wrap your app with SignalRProvider in layout.tsx:
 * 
 * ```tsx
 * import { SignalRProvider } from "@/src/contexts/SignalRContext";
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <SignalRProvider>
 *           {children}
 *         </SignalRProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * 2. Use the hook in any component:
 * 
 * ```tsx
 * import { useSignalR } from "@/src/hooks/useSignalR";
 * import { SignalREvents } from "@/src/lib/signalr-events";
 * 
 * function BookingPage() {
 *   useSignalR(SignalREvents.BOOKING_CREATED, (data) => {
 *     // Handle new booking
 *     console.log("New booking:", data);
 *   });
 * 
 *   return <div>Your booking UI</div>;
 * }
 * ```
 * 
 * 3. Check connection status:
 * 
 * ```tsx
 * import { useSignalRContext } from "@/src/contexts/SignalRContext";
 * 
 * function Header() {
 *   const { isConnected, connectionState } = useSignalRContext();
 *   
 *   return (
 *     <div>
 *       Status: {connectionState}
 *       {isConnected ? "🟢" : "🔴"}
 *     </div>
 *   );
 * }
 * ```
 */
