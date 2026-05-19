/**
 * Booking Types
 * 
 * Type definitions for booking-related entities and DTOs.
 */

// ============================================================================
// Enums
// ============================================================================

export enum BookingStatus {
  PENDING = 0,
  CONFIRMED = 1,
  PAID_ONLINE = 2,
  IN_PROGRESS = 3,
  PENDING_PAYMENT = 4,
  COMPLETED = 5,
  CANCELLED = 6,
  CANCELLED_PENDING_REFUND = 7,
  CANCELLED_REFUNDED = 8,
  NO_SHOW = 9,
}

export enum BookingSource {
  ONLINE = 0,
  WALK_IN = 1,
}

export enum InvoicePaymentStatus {
  UNPAID = 0,
  PARTIALLY_PAID = 1,
  PAID = 2,
  REFUNDED = 3,
}

export enum PaymentTiming {
  PREPAID = 0,
  POSTPAID = 1,
}

export enum PaymentMethod {
  CASH = 0,
  VNPAY = 1,
}

export enum PaymentStatus {
  PENDING = 0,
  SUCCESS = 1,
  FAILED = 2,
}

export type BookingStatusName = keyof typeof BookingStatus;
export type BookingSourceName = keyof typeof BookingSource;
export type InvoicePaymentStatusName = keyof typeof InvoicePaymentStatus;
export type SortOrder = "asc" | "desc";
export type BookingListSortBy =
  | "createdAt"
  | "bookingDate"
  | "date"
  | "status"
  | "customerName"
  | "customer"
  | "finalTotal"
  | "total";

// ============================================================================
// DTOs
// ============================================================================

export interface CourtSlotDto {
  courtId: string;
  startTime: string; // HH:mm:ss
  endTime: string;   // HH:mm:ss
}

export interface CreateOnlineBookingDto {
  courts: CourtSlotDto[];
  bookingDate: string; // ISO 8601
  promotionId?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  note?: string;
}

export interface CreateWalkInBookingDto {
  courts: CourtSlotDto[];
  bookingDate: string; // YYYY-MM-DD
  customerId?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
  promotionId?: string | null;
  note?: string | null;
  payNow: boolean;
}

export interface OnlineBookingResponseDto {
  bookingId: string;
  paymentUrl: string;
  expiresAt: string; // ISO 8601
  finalTotal: number;
}

export interface BookingCourtDto {
  courtId: string;
  courtName: string;
  courtTypeName?: string;
  startTime: string; // HH:mm:ss
  endTime: string;   // HH:mm:ss
  duration?: number;  // minutes
  price?: number;
  priceItems?: any[];
}

export interface BookingServiceDto {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BookingInvoiceDto {
  invoiceId: string;
  courtFee: number;
  serviceFee: number;
  subtotal: number;
  loyaltyDiscount: number;
  promotionDiscount: number;
  finalTotal: number;
  paymentStatus: InvoicePaymentStatus;
  paymentTiming: PaymentTiming;
}

export interface BookingDto {
  id?: string;
  bookingId?: string;
  bookingCode?: string;
  bookingDate: string; // ISO 8601
  status: BookingStatus | BookingStatusName | string;
  source?: BookingSource | BookingSourceName | string;
  customerName: string | null;
  customerPhone?: string | null;
  customerEmail?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  branchId: string;
  branchName: string;
  note?: string;
  courts: BookingCourtDto[];
  services?: BookingServiceDto[];
  invoice?: BookingInvoiceDto;
  courtFee?: number;
  serviceFee?: number;
  loyaltyDiscountAmount?: number;
  promotionDiscountAmount?: number;
  finalTotal?: number;
  paymentStatus?: InvoicePaymentStatus | InvoicePaymentStatusName | string;
  createdAt?: string; // ISO 8601
  expiresAt?: string; // ISO 8601
}

export interface CancellationInfoDto {
  bookingId: string;
  branchName: string;
  bookingDate: string;
  courtNames?: string[];
  courts?: BookingCourtDto[];
  startTime?: string;
  endTime?: string;
  refundPercent: number;
  refundAmount: number;
  status?: BookingStatus | BookingStatusName | string;
  canCancel?: boolean;
  cancelTokenUsedAt?: string;
}

export interface BookingScheduleItemDto {
  bookingId: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: BookingStatus | BookingStatusName | string;
}

export interface BookingScheduleCourtDto {
  courtId: string;
  courtName: string;
  bookings: BookingScheduleItemDto[];
}

export interface BookingDashboardSummaryDto {
  todayBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  todayRevenue: number;
  pendingRefunds: number;
}

export interface BookingCalendarHeatmapDto {
  date: string; // YYYY-MM-DD
  bookingCount: number;
  occupancyRate: number;
  revenue: number;
}

export interface AddBookingServiceDto {
  serviceId: string;
  quantity: number;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface BookingListQuery {
  page?: number;
  pageSize?: number;
  status?: BookingStatus | BookingStatusName | string;
  paymentStatus?: InvoicePaymentStatus | InvoicePaymentStatusName | string;
  branchId?: string;
  courtId?: string;
  customerId?: string;
  date?: string; // YYYY-MM-DD
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  source?: BookingSource;
  search?: string; // Search by customer name, phone, guest info, or booking ID
  customerKeyword?: string;
  sortBy?: BookingListSortBy;
  sortOrder?: SortOrder;
}

export interface BookingScheduleQuery {
  branchId?: string;
  date: string; // YYYY-MM-DD
}

export interface BookingDashboardSummaryQuery {
  branchId?: string;
}

export interface BookingCalendarHeatmapQuery {
  year?: number;
  month?: number;
  branchId?: string;
}
