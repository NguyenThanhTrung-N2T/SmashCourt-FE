/**
 * Payment API
 * 
 * API endpoints for payment operations.
 */

import { authFetch, authProtectedFetch } from "./core";
import type {
  ConfirmPaymentDto,
  PaymentConfirmationDto,
  RetryPaymentResponseDto,
} from "../features/booking/types/payment.types";

// ============================================================================
// VNPay Payment APIs
// ============================================================================

/**
 * Confirm payment after VNPay callback
 */
export async function confirmVNPayPayment(
  dto: ConfirmPaymentDto
): Promise<PaymentConfirmationDto> {
  const response = await authFetch<PaymentConfirmationDto>(
    "/api/payments/vnpay/confirm",
    {
      method: "POST",
      body: dto,
    }
  );
  if (!response.data) throw new Error("Failed to confirm payment");
  return response.data;
}

/**
 * Retry payment for an existing PENDING booking
 * 
 * Generates a new payment URL and extends the expiration time by 10 minutes.
 * Only works for PENDING bookings that haven't expired yet.
 * 
 * @param bookingId - The ID of the booking to retry payment for
 * @returns Payment URL and updated booking details
 * @throws Error if booking is not found, expired, cancelled, or courts are no longer available
 */
export async function retryBookingPayment(
  bookingId: string
): Promise<RetryPaymentResponseDto> {
  const response = await authProtectedFetch<RetryPaymentResponseDto>(
    `/api/me/bookings/${bookingId}/retry-payment`,
    {
      method: "POST",
    }
  );
  if (!response.data) throw new Error("Failed to get payment URL");
  return response.data;
}
