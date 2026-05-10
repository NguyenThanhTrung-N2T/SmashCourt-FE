/**
 * Payment API
 * 
 * API endpoints for payment operations.
 */

import { authFetch } from "./core";
import type {
  ConfirmPaymentDto,
  PaymentConfirmationDto,
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
