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
  bookingId: string;
  bookingCode: string;
  amount: number;
  message: string;
}

// ============================================================================
// Retry Payment Types
// ============================================================================

/**
 * Response from retry payment endpoint
 * 
 * Returned when customer retries payment for a PENDING booking.
 * Contains new payment URL and extended expiration time.
 */
export interface RetryPaymentResponseDto {
  bookingId: string;
  paymentUrl: string;
  expiresAt: string; // ISO 8601 datetime
  finalTotal: number;
}
