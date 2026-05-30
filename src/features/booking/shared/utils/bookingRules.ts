import { BookingDto, BookingStatus } from '../types/booking.types';
import { parseBackendDate } from '@/src/shared/utils/date';

/**
 * Helper to get numeric status value from booking status.
 */
export function getStatusValue(status: any): number {
  if (typeof status === 'number') return status;
  if (typeof status === 'string') {
    return BookingStatus[status as keyof typeof BookingStatus] ?? 0;
  }
  return 0;
}

/**
 * Combines bookingDate and a time string into a single Date object.
 * bookingDate format: "17 05 2026 07:00:00"
 * timeStr format: "20:00:00" or "20:00"
 */
export function combineDateAndTime(bookingDate: string, timeStr: string): Date | null {
  const dateObj = parseBackendDate(bookingDate);
  if (!dateObj) return null;

  const timeParts = timeStr.trim().split(':');
  if (timeParts.length < 2) return null;

  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

  const combined = new Date(dateObj);
  combined.setHours(hours, minutes, seconds, 0);
  return combined;
}

/**
 * Condition: Allows check-in from startTime - 15 minutes to endTime.
 * Also checks if the status is CONFIRMED or PAID_ONLINE.
 */
export function canCheckIn(booking: BookingDto): boolean {
  const status = getStatusValue(booking.status);
  const isCorrectStatus = status === BookingStatus.CONFIRMED || status === BookingStatus.PAID_ONLINE;
  if (!isCorrectStatus) return false;

  if (!booking.courts || booking.courts.length === 0) return true;

  const startTime = booking.courts[0]?.startTime;
  const endTime = booking.courts[booking.courts.length - 1]?.endTime || booking.courts[0]?.endTime;

  if (!startTime || !endTime) return true;

  const startDateTime = combineDateAndTime(booking.bookingDate, startTime);
  const endDateTime = combineDateAndTime(booking.bookingDate, endTime);

  if (!startDateTime || !endDateTime) return true;

  const now = new Date();
  const allowedStart = new Date(startDateTime.getTime() - 15 * 60 * 1000); // 15 minutes before startTime
  const allowdEnd = new Date(startDateTime.getTime() + 15 * 60 * 60 * 1000);
  return now >= allowedStart && now <= allowdEnd;
}

/**
 * Condition: Allows checkout if status is IN_PROGRESS.
 */
export function canCheckout(booking: BookingDto): boolean {
  const status = getStatusValue(booking.status);
  return status === BookingStatus.IN_PROGRESS;
}

/**
 * Condition: Allows cancellation if status is CONFIRMED, PAID_ONLINE, or PENDING.
 */
export function canCancel(booking: BookingDto): boolean {
  const status = getStatusValue(booking.status);
  return status === BookingStatus.CONFIRMED ||
    status === BookingStatus.PAID_ONLINE ||
    status === BookingStatus.PENDING;
}

/**
 * Condition: Allows refund confirmation if status is CANCELLED_PENDING_REFUND.
 */
export function canConfirmRefund(booking: BookingDto): boolean {
  const status = getStatusValue(booking.status);
  return status === BookingStatus.CANCELLED_PENDING_REFUND;
}

/**
 * Condition: Allows complete payment if status is PENDING_PAYMENT.
 */
export function canCompletePayment(booking: BookingDto): boolean {
  const status = getStatusValue(booking.status);
  return status === BookingStatus.PENDING_PAYMENT;
}
