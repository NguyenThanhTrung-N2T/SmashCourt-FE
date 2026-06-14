/**
 * PaymentResult Component
 * 
 * Displays payment result after VNPay callback.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Receipt } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { Spinner } from "@/src/shared/components/feedback/Spinner";
import { usePaymentConfirmation } from "../../hooks/usePaymentConfirmation";
import { formatCurrency } from "../../utils/bookingStatus";
import type { VNPayCallbackParams } from "../../../shared/types/payment.types";

export function PaymentResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmPayment, isLoading } = usePaymentConfirmation();

  const [result, setResult] = useState<{
    isSuccess: boolean;
    bookingId: string;
    bookingCode: string;
    amount: number;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      // Extract VNPay params from URL
      const queryParams: VNPayCallbackParams = {
        vnp_Amount: searchParams.get("vnp_Amount") || "",
        vnp_BankCode: searchParams.get("vnp_BankCode") || "",
        vnp_ResponseCode: searchParams.get("vnp_ResponseCode") || "",
        vnp_TransactionNo: searchParams.get("vnp_TransactionNo") || "",
        vnp_TxnRef: searchParams.get("vnp_TxnRef") || "",
        vnp_SecureHash: searchParams.get("vnp_SecureHash") || "",
      };

      // Add all other params
      searchParams.forEach((value, key) => {
        if (!queryParams[key]) {
          queryParams[key] = value;
        }
      });

      // Confirm payment
      const response = await confirmPayment(queryParams);

      if (response) {
        setResult(response);
      } else {
        setError("Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.");
      }
    };

    processPayment();
  }, [searchParams, confirmPayment]);

  const handleViewBooking = () => {
    if (result?.bookingId) {
      router.push(`/bookings`);
    }
  };

  const handleBackHome = () => {
    router.push("/bookings/new");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-0 p-4">
        <div className="w-full max-w-md rounded-2xl border-2 border-border bg-surface-1 p-8 text-center shadow-lg">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">
            Đang xác nhận thanh toán...
          </h2>
          <p className="mt-2 text-sm text-muted">
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-0 p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="rounded-2xl border-2 border-border bg-surface-1 p-8 text-center shadow-lg">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold text-foreground">Có lỗi xảy ra</h2>
            <p className="mt-2 text-sm text-muted">{error}</p>
          </div>
          <Button variant="primary" className="w-full" onClick={handleBackHome}>
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="rounded-2xl border-2 border-border bg-surface-1 p-8 shadow-lg">
          {/* Icon & Title */}
          <div className="mb-6 text-center">
            {result.isSuccess ? (
              <>
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  Thanh toán thành công!
                </h2>
                <p className="mt-2 text-sm text-muted">{result.message}</p>
              </>
            ) : (
              <>
                <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
                <h2 className="text-2xl font-bold text-foreground">
                  Thanh toán thất bại
                </h2>
                <p className="mt-2 text-sm text-muted">{result.message}</p>
              </>
            )}
          </div>

          {/* Payment Details */}
          {result.isSuccess && (
            <div className="space-y-3 rounded-lg bg-surface-2 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Mã đặt sân</span>
                <span className="font-semibold text-foreground">
                  {result.bookingCode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Số tiền</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(result.amount)}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="space-y-2">
          {result.isSuccess ? (
            <>
              <Button
                variant="primary"
                className="w-full"
                leftIcon={<Receipt className="h-4 w-4" />}
                onClick={handleViewBooking}
              >
                Xem lịch sử đặt sân
              </Button>
              <Button variant="secondary" className="w-full" onClick={handleBackHome}>
                Về trang chủ
              </Button>
            </>
          ) : (
            <Button variant="primary" className="w-full" onClick={handleBackHome}>
              Về trang chủ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
