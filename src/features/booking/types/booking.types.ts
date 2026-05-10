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
  status: any;
  source: any;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  branchId: string;
  branchName: string;
  note?: string;
  courts: BookingCourtDto[];
  services: BookingServiceDto[];
  invoice?: BookingInvoiceDto;
  courtFee?: number;
  serviceFee?: number;
  loyaltyDiscountAmount?: number;
  promotionDiscountAmount?: number;
  finalTotal?: number;
  paymentStatus?: any;
  createdAt: string; // ISO 8601
  expiresAt?: string; // ISO 8601
}

export interface CancellationInfoDto {
  bookingId: string;
  branchName: string;
  bookingDate: string;
  courts: BookingCourtDto[];
  refundPercent: number;
  refundAmount: number;
  canCancel: boolean;
  cancelTokenUsedAt?: string;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface BookingListQuery {
  page?: number;
  pageSize?: number;
  status?: BookingStatus;
  branchId?: string;
  customerId?: string;
  date?: string; // YYYY-MM-DD
  source?: BookingSource;
}
