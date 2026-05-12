/**
 * Booking Status Utilities
 * 
 * Helper functions for booking status display and logic.
 */

import { BookingStatus, InvoicePaymentStatus } from "../../types/booking.types";

export interface StatusConfig {
  label: string;
  variant: "success" | "warning" | "error" | "info" | "neutral";
  dot?: boolean;
}

export function getBookingStatusConfig(status: any): StatusConfig {
  const statusStr = typeof status === "number" ? BookingStatus[status] : String(status);
  switch (statusStr?.toUpperCase()) {
    case "PENDING":
    case "0":
      return { label: "Chờ thanh toán", variant: "warning", dot: true };
    case "CONFIRMED":
    case "1":
      return { label: "Đã xác nhận", variant: "info", dot: true };
    case "PAID_ONLINE":
    case "2":
      return { label: "Đã thanh toán", variant: "success", dot: true };
    case "IN_PROGRESS":
    case "3":
      return { label: "Đang chơi", variant: "info", dot: true };
    case "PENDING_PAYMENT":
    case "4":
      return { label: "Chờ thanh toán", variant: "warning", dot: true };
    case "COMPLETED":
    case "5":
      return { label: "Hoàn thành", variant: "success", dot: true };
    case "CANCELLED":
    case "6":
      return { label: "Đã hủy", variant: "error", dot: true };
    case "CANCELLED_PENDING_REFUND":
    case "7":
      return { label: "Chờ hoàn tiền", variant: "warning", dot: true };
    case "CANCELLED_REFUNDED":
    case "8":
      return { label: "Đã hoàn tiền", variant: "neutral", dot: true };
    case "NO_SHOW":
    case "9":
      return { label: "Không đến", variant: "error", dot: true };
    default:
      return { label: "Không xác định", variant: "neutral" };
  }
}

export function getPaymentStatusConfig(status: any): StatusConfig {
  const statusStr = typeof status === "number" ? InvoicePaymentStatus[status] : String(status);
  switch (statusStr?.toUpperCase()) {
    case "UNPAID":
    case "0":
      return { label: "Chưa thanh toán", variant: "error" };
    case "PARTIALLY_PAID":
    case "1":
      return { label: "Thanh toán một phần", variant: "warning" };
    case "PAID":
    case "2":
      return { label: "Đã thanh toán", variant: "success" };
    case "REFUNDED":
    case "3":
      return { label: "Đã hoàn tiền", variant: "neutral" };
    default:
      return { label: "Không xác định", variant: "neutral" };
  }
}

export function canCancelBooking(status: BookingStatus | number | string): boolean {
  // Handle different status formats
  let statusValue: number;
  
  if (typeof status === "string") {
    // If it's a string like "CONFIRMED" or "PAID_ONLINE"
    const statusStr = status.toUpperCase();
    if (statusStr === "CONFIRMED" || statusStr === "1") {
      statusValue = BookingStatus.CONFIRMED;
    } else if (statusStr === "PAID_ONLINE" || statusStr === "2") {
      statusValue = BookingStatus.PAID_ONLINE;
    } else {
      return false;
    }
  } else if (typeof status === "number") {
    statusValue = status;
  } else {
    statusValue = status as number;
  }
  
  return [
    BookingStatus.CONFIRMED,
    BookingStatus.PAID_ONLINE,
  ].includes(statusValue);
}

interface RefundInfo {
  refundPercent: number;
  refundAmount: number;
  canCancel: boolean;
}

/**
 * Calculate refund information based on cancellation policies
 * @param bookingDate - Booking date string
 * @param startTime - Start time string (HH:mm:ss)
 * @param totalAmount - Total booking amount
 * @param cancelPolicies - Array of cancellation policies from API (sorted by hoursBefore DESC)
 */
export function calculateRefundInfo(
  bookingDate: string,
  startTime: string,
  totalAmount: number,
  cancelPolicies: Array<{ hoursBefore: number; refundPercent: number }>
): RefundInfo {
  const hoursUntilStart = calculateHoursUntil(bookingDate, startTime);
  
  // Find the applicable policy based on hours until start
  // Policies should be sorted by hoursBefore in descending order
  let refundPercent = 0;
  
  if (cancelPolicies && cancelPolicies.length > 0) {
    // Find the first policy where hoursUntilStart >= hoursBefore
    const applicablePolicy = cancelPolicies.find(
      policy => hoursUntilStart >= policy.hoursBefore
    );
    
    if (applicablePolicy) {
      refundPercent = applicablePolicy.refundPercent;
    }
  } else {
    // Fallback to hardcoded policy if API policies not available
    if (hoursUntilStart >= 24) {
      refundPercent = 100;
    } else if (hoursUntilStart >= 12) {
      refundPercent = 50;
    } else if (hoursUntilStart >= 6) {
      refundPercent = 25;
    }
  }
  
  const refundAmount = Math.round(totalAmount * refundPercent / 100);
  const canCancel = hoursUntilStart > 0;
  
  return { refundPercent, refundAmount, canCancel };
}

/**
 * Calculate hours until booking start time
 */
function calculateHoursUntil(bookingDate: string, startTime: string): number {
  try {
    // Parse booking date and time
    // bookingDate formats we need to handle:
    // - "12 05 2026 07:00:00" (DD MM YYYY HH:mm:ss with spaces)
    // - "12/05/2026" (DD/MM/YYYY)
    // - "2026-05-12" (ISO format)
    let dateStr = bookingDate;
    
    // Handle "12 05 2026 07:00:00" format (space-separated with timestamp)
    if (bookingDate.includes(' ') && !bookingDate.includes('-') && !bookingDate.includes('/')) {
      const parts = bookingDate.split(' ');
      if (parts.length >= 3) {
        // parts[0] = DD, parts[1] = MM, parts[2] = YYYY
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        dateStr = `${year}-${month}-${day}`;
      }
    }
    // Handle DD/MM/YYYY format
    else if (bookingDate.includes('/')) {
      const parts = bookingDate.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        dateStr = `${year}-${month}-${day}`;
      }
    }
    
    const bookingDateTime = new Date(`${dateStr}T${startTime}`);
    const now = new Date();
    
    // Validate the parsed date
    if (isNaN(bookingDateTime.getTime())) {
      console.error("Invalid date parsed:", { bookingDate, startTime, dateStr, bookingDateTime });
      return 0;
    }
    
    // Calculate difference in hours
    const diffMs = bookingDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return diffHours;
  } catch (e) {
    console.error("Error in calculateHoursUntil:", e);
    return 0;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";

  if (/^\d{2} \d{2} \d{4} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
    const parts = dateString.split(" ");
    return `${parts[0]}/${parts[1]}/${parts[2]}`;
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return "";

  if (/^\d{2} \d{2} \d{4} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
    const parts = dateString.split(" ");
    const time = parts[3].substring(0, 5); // HH:mm
    return `${time} ${parts[0]}/${parts[1]}/${parts[2]}`;
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function formatTime(timeString: string): string {
  // timeString format: HH:mm:ss
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
}
