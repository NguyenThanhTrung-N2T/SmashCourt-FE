import type { OnlineBookingResponse } from "./booking.types";

/**
 * Payment Types
 * 
 * Type definitions for payment-related entities and DTOs.
 */

// ============================================================================
// VNPay Types
// ============================================================================

export interface VNPayCallbackParams {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_ResponseCode: string;
  vnp_TransactionNo: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  [key: string]: string;
}

export interface ConfirmPaymentDto {
  queryParams: VNPayCallbackParams;
}

export interface PaymentConfirmationDto {
  isSuccess: boolean;
  message: string;
  bookingId: string | null;
  bookingCode: string | null;
  amount: number | null;
  transactionRef: string | null;
  responseCode: string | null;
  bookingStatus: string | null;
}

// ============================================================================
// Retry Payment Types
// ============================================================================

/**
 * Response from retry payment endpoint
 * 
 * Returned when customer retries payment for a PENDING booking.
 * Shares the exact 12-field contract as OnlineBookingResponse (contract §3.1, §3.3).
 */
export type RetryPaymentResponseDto = OnlineBookingResponse;
