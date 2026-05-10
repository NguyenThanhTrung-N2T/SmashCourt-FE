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
  amount: number;
  message: string;
}
