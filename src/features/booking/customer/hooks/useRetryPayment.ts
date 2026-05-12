/**
 * useRetryPayment Hook
 * 
 * Hook for retrying payment on PENDING bookings.
 */

import { useState, useCallback } from "react";
import { retryBookingPayment } from "@/src/api/payment.api";
import type { RetryPaymentResponseDto } from "../../types/payment.types";

/**
 * Map backend error messages to user-friendly Vietnamese messages
 */
function getErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Không thể tạo liên kết thanh toán";
  }

  const message = error.message.toLowerCase();

  // Check for specific error patterns from backend
  if (message.includes("không tìm thấy") || message.includes("not found")) {
    return "Không tìm thấy đơn đặt sân";
  }
  
  if (message.includes("không có quyền") || message.includes("forbidden")) {
    return "Bạn không có quyền thực hiện thao tác này";
  }
  
  if (message.includes("đã hết hạn") || message.includes("expired")) {
    return "Đơn đặt sân đã hết hạn. Vui lòng tạo đơn mới.";
  }
  
  if (message.includes("đã được đặt") || message.includes("already booked")) {
    return "Sân đã được đặt bởi người khác. Vui lòng tạo đơn mới.";
  }
  
  if (message.includes("đang trong quá trình thanh toán") || message.includes("locked")) {
    return "Sân đang trong quá trình thanh toán. Vui lòng thử lại sau vài phút.";
  }
  
  if (message.includes("cancelled") || message.includes("đã hủy")) {
    return "Không thể thanh toán lại đơn đã hủy. Vui lòng tạo đơn mới.";
  }

  // Return original message if no pattern matches
  return error.message || "Không thể tạo liên kết thanh toán";
}

export function useRetryPayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retryPayment = useCallback(
    async (bookingId: string): Promise<RetryPaymentResponseDto | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await retryBookingPayment(bookingId);
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    retryPayment,
    isLoading,
    error,
    clearError,
  };
}
