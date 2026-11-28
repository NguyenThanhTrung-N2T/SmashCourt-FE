/**
 * useRetryPayment Hook
 * 
 * Hook for retrying payment on PENDING bookings.
 * Handles error codes per contract §3.3 & §5 (V5).
 */

import { useState, useCallback } from "react";
import { retryBookingPayment } from "@/src/api/payment.api";
import { AuthApiError } from "@/src/api/core";
import type { RetryPaymentResponseDto } from "../../shared/types/payment.types";

export interface RetryPaymentErrorResolution {
  message: string;
  shouldReload: boolean;
  suggestRebook: boolean;
}

/**
 * Pure error mapper for POST /api/me/bookings/{id}/retry-payment (V5, trap #8).
 */
export function resolveRetryPaymentError(error: unknown): RetryPaymentErrorResolution {
  if (error instanceof AuthApiError) {
    switch (error.code) {
      case "PAYMENT_HOLD_EXPIRED":
        return {
          message:
            error.message ||
            "Đã hết thời gian giữ chỗ hoặc không còn đủ thời gian thanh toán, vui lòng đặt lại.",
          shouldReload: true,
          suggestRebook: true,
        };
      case "BAD_REQUEST":
        return {
          message: "Đơn đã hết hạn thanh toán, vui lòng đặt lại.",
          shouldReload: true,
          suggestRebook: true,
        };
      case "CONFLICT":
        return {
          message:
            error.message || "Trạng thái đơn vừa thay đổi, vui lòng tải lại thông tin.",
          shouldReload: true,
          suggestRebook: false,
        };
      case "NOT_FOUND":
        return {
          message: error.message || "Không tìm thấy đơn đặt sân.",
          shouldReload: false,
          suggestRebook: false,
        };
      case "FORBIDDEN":
        return {
          message: error.message || "Bạn không có quyền thực hiện thao tác này.",
          shouldReload: false,
          suggestRebook: false,
        };
      default:
        return {
          message: error.message || "Không thể tạo liên kết thanh toán",
          shouldReload: false,
          suggestRebook: false,
        };
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message || "Không thể tạo liên kết thanh toán",
      shouldReload: false,
      suggestRebook: false,
    };
  }

  return {
    message: "Không thể tạo liên kết thanh toán",
    shouldReload: false,
    suggestRebook: false,
  };
}

export function useRetryPayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorMeta, setErrorMeta] = useState<RetryPaymentErrorResolution | null>(null);

  const retryPayment = useCallback(
    async (bookingId: string): Promise<RetryPaymentResponseDto | null> => {
      setIsLoading(true);
      setError(null);
      setErrorMeta(null);

      try {
        const result = await retryBookingPayment(bookingId);
        return result;
      } catch (err) {
        const resolution = resolveRetryPaymentError(err);
        setError(resolution.message);
        setErrorMeta(resolution);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
    setErrorMeta(null);
  }, []);

  return {
    retryPayment,
    isLoading,
    error,
    errorMeta,
    clearError,
  };
}
