import {
  BookingStatus,
  InvoicePaymentStatus,
  type BookingCourtDto,
  type BookingStatusKey,
  type BookingStatusValue,
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

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateTime: string): string {
  return new Date(dateTime).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
