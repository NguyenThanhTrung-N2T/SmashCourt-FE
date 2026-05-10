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

export function canCancelBooking(status: BookingStatus): boolean {
  return [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.PAID_ONLINE,
  ].includes(status);
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
