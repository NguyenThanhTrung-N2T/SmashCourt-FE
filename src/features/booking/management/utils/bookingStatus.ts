import { BookingStatus, InvoicePaymentStatus } from '../../types/booking.types';

export function getBookingStatusLabel(status: BookingStatus | string | number): string {
  const statusValue = typeof status === 'string' ? BookingStatus[status as keyof typeof BookingStatus] : status;
  
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
  status: BookingStatus | string | number
): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  const statusValue = typeof status === 'string' ? BookingStatus[status as keyof typeof BookingStatus] : status;
  
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

export function getPaymentStatusLabel(status: InvoicePaymentStatus | string | number): string {
  const statusValue = typeof status === 'string' ? InvoicePaymentStatus[status as keyof typeof InvoicePaymentStatus] : status;
  
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
  status: InvoicePaymentStatus | string | number
): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  const statusValue = typeof status === 'string' ? InvoicePaymentStatus[status as keyof typeof InvoicePaymentStatus] : status;
  
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
