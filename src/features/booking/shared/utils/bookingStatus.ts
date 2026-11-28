import {
  BookingStatus,
  InvoicePaymentStatus,
  type BookingCourtDto,
  type BookingDto,
  type BookingStatusKey,
  type BookingStatusValue,
  type CancelReason,
  type CancelSource,
  type DepositSource,
  type InvoicePaymentStatusKey,
  type InvoicePaymentStatusValue,
} from '@/src/features/booking/shared/types/booking.types';

export type BookingStatusInput = BookingStatusKey | BookingStatusValue | string | number | null | undefined;
export type InvoicePaymentStatusInput =
  | InvoicePaymentStatusKey
  | InvoicePaymentStatusValue
  | string
  | number
  | null
  | undefined;

function isEnumValue<T extends Record<string, number>>(
  map: T,
  value: unknown,
): value is T[keyof T] {
  return typeof value === 'number' && Object.values(map).includes(value);
}

export function toBookingStatusValue(status: BookingStatusInput): BookingStatusValue | undefined {
  if (isEnumValue(BookingStatus, status)) return status;

  if (typeof status === 'string') {
    const normalizedStatus = status.trim();
    if (!normalizedStatus) return undefined;

    if (normalizedStatus in BookingStatus) {
      return BookingStatus[normalizedStatus as BookingStatusKey];
    }

    const numericStatus = Number(normalizedStatus);
    if (isEnumValue(BookingStatus, numericStatus)) return numericStatus;
  }

  return undefined;
}

export function toInvoicePaymentStatusValue(
  status: InvoicePaymentStatusInput,
): InvoicePaymentStatusValue | undefined {
  if (isEnumValue(InvoicePaymentStatus, status)) return status;

  if (typeof status === 'string') {
    const normalizedStatus = status.trim();
    if (!normalizedStatus) return undefined;

    if (normalizedStatus in InvoicePaymentStatus) {
      return InvoicePaymentStatus[normalizedStatus as InvoicePaymentStatusKey];
    }

    const numericStatus = Number(normalizedStatus);
    if (isEnumValue(InvoicePaymentStatus, numericStatus)) return numericStatus;
  }

  return undefined;
}

export function getBookingStatusLabel(status: BookingStatusInput): string {
  const statusValue = toBookingStatusValue(status);

  switch (statusValue) {
    case BookingStatus.PENDING:
      return 'Chưa thanh toán';
    case BookingStatus.PENDING_APPROVAL:
      return 'Chờ duyệt cọc';
    case BookingStatus.CONFIRMED:
      return 'Đặt tại quầy';
    case BookingStatus.PAID_ONLINE:
      return 'Thanh toán 1 phần';
    case BookingStatus.IN_PROGRESS:
      return 'Đang chơi';
    case BookingStatus.PENDING_PAYMENT:
      return 'Chờ checkout';
    case BookingStatus.COMPLETED:
      return 'Đã thanh toán';
    case BookingStatus.CANCELLED:
      return 'Đã hủy';
    case BookingStatus.CANCELLED_PENDING_REFUND:
      return 'Chờ hoàn tiền';
    case BookingStatus.CANCELLED_REFUNDED:
      return 'Đã hoàn tiền';
    case BookingStatus.NO_SHOW:
      return 'Không đến';
    default:
      return 'Unknown';
  }
}

export function getBookingStatusVariant(
  status: BookingStatusInput
): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  const statusValue = toBookingStatusValue(status);

  switch (statusValue) {
    case BookingStatus.CONFIRMED:
    case BookingStatus.PAID_ONLINE:
      return 'info';
    case BookingStatus.PENDING_APPROVAL:
    case BookingStatus.IN_PROGRESS:
      return 'warning';
    case BookingStatus.COMPLETED:
      return 'success';
    case BookingStatus.CANCELLED:
    case BookingStatus.CANCELLED_REFUNDED:
    case BookingStatus.NO_SHOW:
      return 'error';
    case BookingStatus.CANCELLED_PENDING_REFUND:
      return 'warning';
    default:
      return 'neutral';
  }
}

export function getPaymentStatusLabel(status: InvoicePaymentStatusInput): string {
  const statusValue = toInvoicePaymentStatusValue(status);

  switch (statusValue) {
    case InvoicePaymentStatus.UNPAID:
      return 'Chưa thanh toán';
    case InvoicePaymentStatus.PARTIALLY_PAID:
      return 'Thanh toán 1 phần';
    case InvoicePaymentStatus.PAID:
      return 'Đã thanh toán';
    case InvoicePaymentStatus.REFUNDED:
      return 'Đã hoàn tiền';
    case InvoicePaymentStatus.EXPIRED:
      return 'Hết hạn';
    default:
      return 'Unknown';
  }
}

export function getPaymentStatusVariant(
  status: InvoicePaymentStatusInput
): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  const statusValue = toInvoicePaymentStatusValue(status);

  switch (statusValue) {
    case InvoicePaymentStatus.PAID:
      return 'success';
    case InvoicePaymentStatus.PARTIALLY_PAID:
      return 'warning';
    case InvoicePaymentStatus.EXPIRED:
    case InvoicePaymentStatus.UNPAID:
      return 'error';
    case InvoicePaymentStatus.REFUNDED:
      return 'info';
    default:
      return 'neutral';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function formatTime(time: string): string {
  // Assumes time is in HH:mm:ss format
  return time.substring(0, 5); // Returns HH:mm
}

export function getCourtTotal(court: BookingCourtDto): number {
  return court.priceItems.reduce((total, item) => total + item.subTotal, 0);
}

export function getCourtDurationMinutes(court: BookingCourtDto): number | null {
  const [startHour, startMinute] = court.startTime.split(':').map(Number);
  const [endHour, endMinute] = court.endTime.split(':').map(Number);

  if (
    Number.isNaN(startHour) ||
    Number.isNaN(startMinute) ||
    Number.isNaN(endHour) ||
    Number.isNaN(endMinute)
  ) {
    return null;
  }

  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  const duration = endTotal - startTotal;

  return duration >= 0 ? duration : duration + 24 * 60;
}

/**
 * Staff-facing label for who cancelled the booking (contract §2.2, P6-31).
 */
export function getCancelSourceText(
  source?: CancelSource | string | null,
  cancelledByName?: string | null,
): string {
  if (!source) return '—';
  switch (source.toUpperCase()) {
    case 'SYSTEM':
      return 'Hệ thống';
    case 'STAFF':
      return cancelledByName?.trim() || 'Nhân viên';
    case 'CUSTOMER':
      return 'Khách hàng';
    case 'LINK':
      return 'Khách hàng (link email)';
    default:
      return source;
  }
}

/**
 * Shared cancellation reason label mapped to BE BookingCancelReason enum (contract §2.2).
 */
export function getCancelReasonText(reason?: CancelReason | string | null): string | null {
  if (!reason) return null;
  switch (reason.toUpperCase()) {
    case 'PAYMENT_EXPIRED':
      return 'Hết hạn thanh toán';
    case 'APPROVAL_EXPIRED':
      return 'Chi nhánh chưa xác nhận kịp, bạn chưa bị trừ tiền';
    case 'SYSTEM_CLEANUP':
      return 'Đơn chưa hoàn tất, sân đã được trả lại';
    case 'POLICY_REJECTED':
    case 'APPROVAL_REJECTED':
      return 'Không được nhận';
    case 'CUSTOMER_CANCELLED':
      return 'Bạn đã hủy';
    case 'STAFF_CANCELLED':
      return 'Chi nhánh đã hủy';
    default:
      return reason;
  }
}

/**
 * Staff-facing deposit source label mapped to BE DepositSource enum (contract §2.2).
 */
export function getDepositSourceText(source?: DepositSource | string | null): string {
  if (!source) return '—';
  switch (source.toUpperCase()) {
    case 'TADSS':
      return 'Hệ thống (TADSS)';
    case 'MANAGER':
      return 'Quản lý chỉ định';
    case 'FULL_PAYMENT_FALLBACK':
      return 'Dự phòng cọc 100%';
    default:
      return source;
  }
}

/**
 * Format decimal deposit rate (0..1, up to 4 decimals) as percentage up to 2 decimals.
 * Avoids rounding 0.0715 to "7%" (trap #21).
 */
export function formatDepositPercent(depositRate?: number | null): string {
  if (depositRate == null || !Number.isFinite(depositRate)) return '';
  const percent = Math.round(depositRate * 10000) / 100;
  return `${Number(percent.toFixed(2))}%`;
}

export interface StaffDepositSummary {
  isPaid: boolean;
  depositLabel: string;
  depositAmount: number;
  rateLabel: string;
  sourceLabel: string | null;
  remainingLabel: string | null;
  remainingAmount: number | null;
}

/**
 * Build consistent deposit breakdown lines for staff views based on invoice paymentStatus (V3, trap #15).
 */
export function getStaffDepositSummary(
  booking: Pick<
    BookingDto,
    'depositAmount' | 'depositRate' | 'depositSource' | 'remainingAmount' | 'finalTotal' | 'paymentStatus'
  >,
): StaffDepositSummary | null {
  if (booking.depositAmount == null && booking.depositSource == null) {
    return null;
  }

  const depositAmount = booking.depositAmount ?? 0;
  if (depositAmount <= 0 && booking.depositSource == null) {
    return null;
  }

  const paymentStatusValue = toInvoicePaymentStatusValue(booking.paymentStatus);
  const isUnpaid = paymentStatusValue === InvoicePaymentStatus.UNPAID;
  const rateLabel = formatDepositPercent(booking.depositRate);
  const sourceLabel = booking.depositSource ? getDepositSourceText(booking.depositSource) : null;

  if (isUnpaid) {
    return {
      isPaid: false,
      depositLabel: 'Cọc phải trả',
      depositAmount,
      rateLabel,
      sourceLabel,
      remainingLabel: null,
      remainingAmount: null,
    };
  }

  const remainingAmount =
    booking.remainingAmount ?? Math.max(0, (booking.finalTotal ?? 0) - depositAmount);

  return {
    isPaid: true,
    depositLabel: 'Đã cọc',
    depositAmount,
    rateLabel,
    sourceLabel,
    remainingLabel: 'Còn phải thu khi check-out',
    remainingAmount,
  };
}

