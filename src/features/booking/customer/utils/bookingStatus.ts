/**
 * Booking Status Utilities
 * 
 * Helper functions for booking status display and logic.
 */

import {
  BookingStatus,
  InvoicePaymentStatus,
} from "../../shared/types/booking.types";
import {
  toBookingStatusValue,
  toInvoicePaymentStatusValue,
  type BookingStatusInput,
  type InvoicePaymentStatusInput,
} from "../../shared/utils/bookingStatus";

export interface StatusConfig {
  label: string;
  variant: "success" | "warning" | "error" | "info" | "neutral";
  dot?: boolean;
}

export function getBookingStatusConfig(status: BookingStatusInput): StatusConfig {
  switch (toBookingStatusValue(status)) {
    case BookingStatus.PENDING:
      return { label: "Chờ thanh toán cọc", variant: "warning", dot: true };

    case BookingStatus.CONFIRMED:
      return { label: "Thanh toán tại quầy", variant: "info", dot: true };

    case BookingStatus.PAID_ONLINE:
      return { label: "Đã cọc", variant: "success", dot: true };

    case BookingStatus.PENDING_APPROVAL:
      return { label: "Chờ chi nhánh xác nhận", variant: "warning", dot: true };

    case BookingStatus.IN_PROGRESS:
      return { label: "Đang chơi", variant: "info", dot: true };

    case BookingStatus.PENDING_PAYMENT:
      return { label: "Chờ thanh toán", variant: "warning", dot: true };

    case BookingStatus.COMPLETED:
      return { label: "Hoàn thành", variant: "success", dot: true };

    case BookingStatus.CANCELLED:
      return { label: "Đã hủy", variant: "error", dot: true };

    case BookingStatus.CANCELLED_PENDING_REFUND:
      return { label: "Chờ nhận tiền hoàn", variant: "warning", dot: true };

    case BookingStatus.CANCELLED_REFUNDED:
      return { label: "Đã hoàn tiền", variant: "neutral", dot: true };

    case BookingStatus.NO_SHOW:
      return { label: "Không đến", variant: "error", dot: true };

    default:
      return { label: "Không xác định", variant: "neutral" };
  }
}

/**
 * Customer-facing label for who cancelled the booking (contract §2.2, P6-31).
 * Never shows staff names to customers.
 */
export function getCancelSourceText(source: string | null | undefined): string {
  switch (source) {
    case "CUSTOMER":
      return "Bạn đã hủy";
    case "LINK":
      return "Bạn đã hủy qua link trong email";
    case "STAFF":
      return "Chi nhánh đã hủy";
    case "SYSTEM":
      return "Hệ thống tự hủy";
    default:
      return "Đã hủy";
  }
}

/**
 * Customer-facing reason for cancellation (contract §2.2, plan §4.5).
 */
export function getCancelReasonText(reason: string | null | undefined): string | null {
  switch (reason) {
    case "PAYMENT_EXPIRED":
      return "Hết hạn thanh toán";
    case "APPROVAL_EXPIRED":
      return "Chi nhánh chưa xác nhận kịp, bạn chưa bị trừ tiền";
    case "SYSTEM_CLEANUP":
      return "Đơn chưa hoàn tất, sân đã được trả lại";
    case "POLICY_REJECTED":
    case "APPROVAL_REJECTED":
      return "Không được nhận";
    case "CUSTOMER_CANCELLED":
      return "Bạn đã hủy";
    case "STAFF_CANCELLED":
      return "Chi nhánh đã hủy";
    default:
      return null;
  }
}

export function getPaymentStatusConfig(status: InvoicePaymentStatusInput): StatusConfig {
  switch (toInvoicePaymentStatusValue(status)) {
    case InvoicePaymentStatus.UNPAID:
      return { label: "Chưa thanh toán", variant: "error" };
    case InvoicePaymentStatus.PARTIALLY_PAID:
      return { label: "Thanh toán một phần", variant: "warning" };
    case InvoicePaymentStatus.PAID:
      return { label: "Đã thanh toán", variant: "success" };
    case InvoicePaymentStatus.REFUNDED:
      return { label: "Đã hoàn tiền", variant: "neutral" };
    case InvoicePaymentStatus.EXPIRED:
      return { label: "Hết hạn", variant: "neutral" };
    default:
      return { label: "Không xác định", variant: "neutral" };
  }
}

export function canCancelBooking(
  status: BookingStatusInput,
  bookingDate?: string,
  startTime?: string
): boolean {
  const statusValue = toBookingStatusValue(status);
  if (statusValue === undefined) return false;

  const cancellableStatuses: number[] = [
    BookingStatus.PENDING,
    BookingStatus.PENDING_APPROVAL,
    BookingStatus.CONFIRMED,
    BookingStatus.PAID_ONLINE,
  ];

  if (!cancellableStatuses.includes(statusValue)) {
    return false;
  }

  // Contract §3.4, P6-23: Customer cannot cancel after earliest start time (+07:00)
  if (bookingDate && startTime) {
    const hours = calculateHoursUntil(bookingDate, startTime);
    return hours > 0;
  }

  return true;
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
 * @param totalAmount - Total amount already paid (contract §3.4, R-1)
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
 * Calculate hours until booking start time in Vietnam timezone (+07:00).
 * Handles the "20/11/2026 07:00:00" artifact safely (contract §1.3, R-6).
 */
export function calculateHoursUntil(bookingDate: string, startTime: string): number {
  try {
    const cleanDate = bookingDate.trim().split(" ")[0];
    let y = "", m = "", d = "";

    if (cleanDate.includes("/")) {
      const parts = cleanDate.split("/");
      d = parts[0].padStart(2, "0");
      m = parts[1].padStart(2, "0");
      y = parts[2];
    } else if (cleanDate.includes("-")) {
      const parts = cleanDate.split("-");
      y = parts[0];
      m = parts[1].padStart(2, "0");
      d = parts[2].padStart(2, "0");
    }

    if (!y || !m || !d) return 0;

    const [h, min, s = "00"] = startTime.split(":");
    const isoVN = `${y}-${m}-${d}T${h.padStart(2, "0")}:${min.padStart(2, "0")}:${s.padStart(2, "0")}+07:00`;
    const startInstant = new Date(isoVN).getTime();

    if (isNaN(startInstant)) return 0;

    const diffMs = startInstant - Date.now();
    return diffMs / (1000 * 60 * 60);
  } catch {
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

  // Handle "DD/MM/YYYY HH:mm:ss" or "DD/MM/YYYY"
  const slashMatch = dateString.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (slashMatch) {
    return `${slashMatch[1]}/${slashMatch[2]}/${slashMatch[3]}`;
  }

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

  // Handle "DD/MM/YYYY HH:mm:ss"
  const slashMatch = dateString.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
  if (slashMatch) {
    return `${slashMatch[4]}:${slashMatch[5]} ${slashMatch[1]}/${slashMatch[2]}/${slashMatch[3]}`;
  }

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
