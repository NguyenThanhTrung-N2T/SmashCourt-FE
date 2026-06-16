import {
  BookingDto,
  BookingStatus,
} from '../types/booking.types';
import { toBookingStatusValue, type BookingStatusInput } from './bookingStatus';
import { parseBackendDate } from '@/src/shared/utils/date';

/**
 * Helper to get numeric status value from booking status.
 */
export function getStatusValue(status: BookingStatusInput): number {
  return toBookingStatusValue(status) ?? 0;
}

/**
 * Combines bookingDate and a time string into a single Date object.
 * Supports formats: "DD MM YYYY", "DD MM YYYY HH:mm:ss", "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss"
 * timeStr format: "HH:mm:ss" or "HH:mm"
 */
export function combineDateAndTime(bookingDate: string, timeStr: string): Date | null {
  const dateObj = parseBookingDate(bookingDate);
  if (!dateObj) return null;

  const timeParts = timeStr.trim().split(':');
  if (timeParts.length < 2) return null;

  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

  if (isNaN(hours) || isNaN(minutes)) return null;

  const combined = new Date(dateObj);
  combined.setHours(hours, minutes, seconds, 0);
  return combined;
}

/**
 * Parses a bookingDate string from the API into a local Date.
 * Supports: "DD MM YYYY", "DD MM YYYY HH:mm:ss", "YYYY-MM-DD", ISO datetime strings.
 */
function parseBookingDate(dateString: string): Date | null {
  if (!dateString) return null;
  // Try the "DD MM YYYY" backend format first (parseBackendDate handles this)
  const fromBackend = parseBackendDate(dateString);
  if (fromBackend) return fromBackend;

  // Try ISO date-only "YYYY-MM-DD" — parse as local midnight, not UTC
  const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (isoDateOnly) {
    const [, y, m, d] = isoDateOnly;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  return null;
}

/**
 * Condition: Allows check-in within the window [startTime - 15m, startTime + 15m].
 * Also checks if the status is CONFIRMED or PAID_ONLINE.
 */
export function canCheckIn(booking: BookingDto): boolean {
  const status = getStatusValue(booking.status);
  const isCorrectStatus = status === BookingStatus.CONFIRMED || status === BookingStatus.PAID_ONLINE;
  if (!isCorrectStatus) return false;

  if (!booking.courts || booking.courts.length === 0) return false;

  const startTime = booking.courts[0]?.startTime;

  if (!startTime) return false;

  const startDateTime = combineDateAndTime(booking.bookingDate, startTime);

  if (!startDateTime) return false;

  const now = new Date();
  const allowedStart = new Date(startDateTime.getTime() - 15 * 60 * 1000); // 15 minutes before startTime
  const allowedEnd = new Date(startDateTime.getTime() + 15 * 60 * 1000);   // 15 minutes after startTime
  return now >= allowedStart && now <= allowedEnd;
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

/**
 * Condition: Allows adding a service if status is IN_PROGRESS or PENDING_PAYMENT.
 */
export function canAddService(booking: BookingDto): boolean {
  const status = getStatusValue(booking.status);
  return status === BookingStatus.IN_PROGRESS || status === BookingStatus.PENDING_PAYMENT;
}
