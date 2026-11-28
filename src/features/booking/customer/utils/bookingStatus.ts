/**
 * Booking Status Utilities
 * 
 * Helper functions for booking status display and logic.
 */

import {
  BookingStatus,
  InvoicePaymentStatus,
  type BookingDto,
} from "../../shared/types/booking.types";
import {
  getCancelReasonText,
  toBookingStatusValue,
  toInvoicePaymentStatusValue,
  type BookingStatusInput,
  type InvoicePaymentStatusInput,
} from "../../shared/utils/bookingStatus";

export { getCancelReasonText };

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
 * Return the amount actually paid online for refund preview calculation (contract §3.4, R-1, V4).
 * Pre-Phase 6 PAID_ONLINE bookings with depositAmount=null paid 100% (finalTotal).
 */
export function getPaidAmountForRefund(
  booking: Pick<BookingDto, "status" | "depositAmount" | "finalTotal">
): number {
  if (toBookingStatusValue(booking.status) !== BookingStatus.PAID_ONLINE) {
    return 0;
  }
  return booking.depositAmount ?? booking.finalTotal ?? 0;
}

/**
 * Calculate refund information based on cancellation policies (order-independent, no hardcoded fallback).
 * @param bookingDate - Booking date string
 * @param startTime - Start time string (HH:mm:ss)
 * @param paidAmount - Total amount already paid (contract §3.4, R-1)
 * @param cancelPolicies - Array of cancellation policies from API (any order)
 */
export function calculateRefundInfo(
  bookingDate: string,
  startTime: string,
  paidAmount: number,
  cancelPolicies: Array<{ hoursBefore: number; refundPercent: number }>
): RefundInfo {
  const hoursUntilStart = calculateHoursUntil(bookingDate, startTime);
  const canCancel = hoursUntilStart > 0;

  if (!canCancel || paidAmount <= 0 || !cancelPolicies || cancelPolicies.length === 0) {
    return { refundPercent: 0, refundAmount: 0, canCancel };
  }

  let bestPolicy: { hoursBefore: number; refundPercent: number } | null = null;
  for (const policy of cancelPolicies) {
    if (hoursUntilStart >= policy.hoursBefore) {
      if (!bestPolicy || policy.hoursBefore > bestPolicy.hoursBefore) {
        bestPolicy = policy;
      }
    }
  }

  const refundPercent = bestPolicy ? bestPolicy.refundPercent : 0;
  const refundAmount = Math.round((paidAmount * refundPercent) / 100);

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
