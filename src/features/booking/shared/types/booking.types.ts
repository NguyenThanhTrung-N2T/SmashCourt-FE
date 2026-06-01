import type { EnumKey, EnumValue } from "@/src/shared/utils/enum.util";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export const BookingStatus = {
  PENDING: 0,
  CONFIRMED: 1,
  PAID_ONLINE: 2,
  IN_PROGRESS: 3,
  PENDING_PAYMENT: 4,
  COMPLETED: 5,
  CANCELLED: 6,
  CANCELLED_PENDING_REFUND: 7,
  CANCELLED_REFUNDED: 8,
  NO_SHOW: 9,
} as const;

export const InvoicePaymentStatus = {
  UNPAID: 0,
  PARTIALLY_PAID: 1,
  PAID: 2,
  REFUNDED: 3,
  EXPIRED: 4,
} as const;

export const BookingSource = {
  ONLINE: 0,
  WALK_IN: 1,
} as const;

export const PaymentTiming = {
  /** Thanh toán trước – khách thanh toán khi đặt sân */
  PREPAID: 0,
  /** Thanh toán sau – khách thanh toán sau khi chơi xong */
  POSTPAID: 1,
} as const;

export const PaymentTxMethod = {
  CASH: 0,
  VNPAY: 1,
  MOMO: 2,
} as const;

export const PaymentTxStatus = {
  PENDING: 0,
  SUCCESS: 1,
  FAILED: 2,
  REFUNDED: 3,
} as const;

// ─────────────────────────────────────────────
// Derived types
//
//  *Key   → string the API returns   e.g. "IN_PROGRESS"
//  *Value → number the API expects   e.g. 3
// ─────────────────────────────────────────────

export type BookingStatusKey = EnumKey<typeof BookingStatus>;
export type BookingStatusValue = EnumValue<typeof BookingStatus>;

export type InvoicePaymentStatusKey = EnumKey<typeof InvoicePaymentStatus>;
export type InvoicePaymentStatusValue = EnumValue<typeof InvoicePaymentStatus>;

export type BookingSourceKey = EnumKey<typeof BookingSource>;
export type BookingSourceValue = EnumValue<typeof BookingSource>;

export type PaymentTimingKey = EnumKey<typeof PaymentTiming>;
export type PaymentTimingValue = EnumValue<typeof PaymentTiming>;

export type PaymentTxMethodKey = EnumKey<typeof PaymentTxMethod>;
export type PaymentTxMethodValue = EnumValue<typeof PaymentTxMethod>;

export type PaymentTxStatusKey = EnumKey<typeof PaymentTxStatus>;
export type PaymentTxStatusValue = EnumValue<typeof PaymentTxStatus>;

// ─────────────────────────────────────────────
// Request DTOs
// ─────────────────────────────────────────────

export interface CourtSlotDto {
  courtId: string;
  startTime: string; // "HH:mm:ss"
  endTime: string;
}

export interface AddBookingServiceDto {
  serviceId: string;
  quantity: number; // 1–100
}

export interface CreateOnlineBookingDto {
  bookingDate: string; // ISO datetime
  courts: CourtSlotDto[];
  promotionId?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
  note?: string | null;
  notifyIfUnavailable?: boolean;
}

export interface CreateWalkInBookingDto {
  bookingDate: string; // ISO datetime
  courts: CourtSlotDto[];
  customerId?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
  promotionId?: string | null;
  note?: string | null;
  /** true → PREPAID (pay now), false → POSTPAID (pay later, default) */
  payNow?: boolean;
}

// ─────────────────────────────────────────────
// Query DTOs  (numeric values — sent to the API)
// ─────────────────────────────────────────────

export interface BookingListQuery {
  page?: number;
  pageSize?: number;
  branchId?: string | null;
  courtId?: string | null;
  status?: BookingStatusValue | null;
  paymentStatus?: InvoicePaymentStatusValue | null;
  date?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  customerKeyword?: string | null;
  bookingCode?: string | null;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BookingScheduleQuery {
  branchId?: string | null;
  date: string;
}

export interface BookingCalendarHeatmapQuery {
  year: number;
  month: number;
  branchId?: string | null;
}

export interface BookingDashboardSummaryQuery {
  branchId?: string | null;
}

// ─────────────────────────────────────────────
// Response DTOs  (string keys — received from the API)
// ─────────────────────────────────────────────

export interface BookingPriceItemDto {
  startTime: string;
  endTime: string;
  unitPrice: number;
  hours: number;
  subTotal: number;
}

export interface BookingCourtDto {
  courtId: string;
  courtName: string;
  startTime: string;
  endTime: string;
  priceItems: BookingPriceItemDto[];
}

export interface BookingServiceDto {
  id: string;
  serviceId: string;
  serviceName: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface BookingDto {
  id: string;
  bookingCode: string;
  invoiceCode?: string | null;
  branchId: string;
  branchName: string;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
  bookingDate: string;
  status: BookingStatusKey;
  source: BookingSourceKey;
  note?: string | null;
  createdAt: string;
  updatedAt: string;

  // Invoice
  courtFee: number;
  serviceFee: number;
  loyaltyDiscountAmount: number;
  promotionDiscountAmount: number;
  finalTotal: number;
  paymentStatus: InvoicePaymentStatusKey;
  expiresAt?: string | null;

  courts: BookingCourtDto[];
  services: BookingServiceDto[];
  refundAmount: number | null;
}

export interface OnlineBookingResponse {
  bookingId: string;
  paymentUrl: string;
  expiresAt: string;
  finalTotal: number;
}

export interface BookingScheduleItemDto {
  bookingId: string;
  startTime: string; // "HH:mm"
  endTime: string;
  status: BookingStatusKey;
}

export interface BookingScheduleCourtDto {
  courtId: string;
  courtName: string;
  bookings: BookingScheduleItemDto[];
}

export interface BookingCalendarHeatmapDto {
  date: string; // "yyyy-MM-dd"
  bookingCount: number;
  occupancyRate: number; // 0.0–1.0
  revenue: number;
}

export interface BookingDashboardSummaryDto {
  todayBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  todayRevenue: number;
  pendingRefunds: number;
}

export interface CancelTokenInfoDto {
  bookingId: string;
  branchName: string;
  courtNames: string[];
  bookingDate: string;
  startTime: string;
  endTime: string;
  refundAmount: number;
  refundPercent: number;
  status: BookingStatusKey;
}

export interface TimeGridSlotDto {
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "LOCKED" | "IN_USE";
  lockRemainingSeconds?: number | null;
}
