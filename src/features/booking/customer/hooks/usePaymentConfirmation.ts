/**
 * usePaymentConfirmation Hook
 * 
 * Hook for confirming VNPay payment.
 */

import { useState, useCallback } from "react";
import { confirmVNPayPayment } from "@/src/api/payment.api";
import type { VNPayCallbackParams, PaymentConfirmationDto } from "../../types/payment.types";

export function usePaymentConfirmation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmPayment = useCallback(
    async (queryParams: VNPayCallbackParams): Promise<PaymentConfirmationDto | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await confirmVNPayPayment({ queryParams });
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Không thể xác nhận thanh toán";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    confirmPayment,
    isLoading,
    error,
  };
}
