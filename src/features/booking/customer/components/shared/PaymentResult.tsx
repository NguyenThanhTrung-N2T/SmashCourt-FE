/**
 * PaymentResult Component
 * 
 * Displays payment result after VNPay callback according to contract §3.6 & plan §4.4.
 * Branches on bookingStatus first, handles pending IPN polling, cancelled bookings with refund notices,
 * and mapped VNPay error codes ("24", "79", "13", "15").
 */

"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Warning,
  Receipt,
  ArrowCounterClockwise,
  Hourglass,
  House,
} from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { ConfirmationDialog } from "@/src/shared/components/ui/ConfirmationDialog";
import { Spinner } from "@/src/shared/components/feedback/Spinner";
import { usePaymentConfirmation } from "../../hooks/usePaymentConfirmation";
import { formatCurrency } from "@/src/shared/utils/date";
import { fetchCustomerBookingById, cancelCustomerBooking } from "@/src/api/booking.api";
import { retryBookingPayment } from "@/src/api/payment.api";
import { resolveRetryPaymentError } from "../../hooks/useRetryPayment";
import { useGlobalToast } from "@/src/shared/hooks/useGlobalToast";
import type { PaymentConfirmationDto, VNPayCallbackParams } from "../../../shared/types/payment.types";

const SUCCESS_STATUSES = [
  "PAID_ONLINE",
  "CONFIRMED",
  "IN_PROGRESS",
  "PENDING_PAYMENT",
  "COMPLETED",
];

export function PaymentResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmPayment, isLoading: isConfirming } = usePaymentConfirmation();
  const { showToast } = useGlobalToast();

  const [result, setResult] = useState<PaymentConfirmationDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Live status polled when initial status is PENDING with isSuccess true
  const [polledStatus, setPolledStatus] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const pollAttempts = useRef(0);

  // Cancellation and retry state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRetrying, startRetryTransition] = useTransition();

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

      // Confirm payment with BE
      const response = await confirmPayment(queryParams);

      if (response) {
        setResult(response);
      } else {
        setError("Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ hoặc xem lịch sử đặt sân.");
      }
    };

    processPayment();
  }, [searchParams, confirmPayment]);

  // Polling effect when bookingStatus is PENDING and isSuccess is true
  useEffect(() => {
    if (!result?.isSuccess || result?.bookingStatus !== "PENDING" || !result?.bookingId) {
      return;
    }

    const bookingId = result.bookingId;
    setIsPolling(true);
    pollAttempts.current = 0;

    const interval = setInterval(async () => {
      pollAttempts.current += 1;
      try {
        const liveBooking = await fetchCustomerBookingById(bookingId);
        if (SUCCESS_STATUSES.includes(liveBooking.status)) {
          setPolledStatus(liveBooking.status);
          setIsPolling(false);
          clearInterval(interval);
          return;
        }
      } catch {
        // Ignore single poll error
      }

      // Stop after ~60 seconds (24 attempts x 2.5s)
      if (pollAttempts.current >= 24) {
        setIsPolling(false);
        setPollTimedOut(true);
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [result]);

  // Handle Retry Payment
  const handleRetryPayment = () => {
    if (!result?.bookingId) return;
    startRetryTransition(async () => {
      try {
        const fresh = await retryBookingPayment(result.bookingId!);
        if (fresh.status === "PENDING" && fresh.paymentUrl) {
          window.location.href = fresh.paymentUrl;
        } else {
          router.push(`/bookings/result?bookingId=${fresh.bookingId}`);
        }
      } catch (err) {
        const resolution = resolveRetryPaymentError(err);
        showToast("error", resolution.message);
        if (resolution.suggestRebook) {
          router.push(`/bookings/result?bookingId=${result.bookingId}`);
        }
      }
    });
  };

  // Handle Cancel Booking
  const handleConfirmCancel = async () => {
    if (!result?.bookingId) return;
    try {
      setIsCancelling(true);
      await cancelCustomerBooking(result.bookingId);
      showToast("success", "Đã hủy đơn đặt sân thành công");
      setShowCancelDialog(false);
      router.push("/bookings");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Không thể hủy đơn";
      showToast("error", msg);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isConfirming) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-surface-0 p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-8 text-center shadow-lg">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">Đang xác nhận kết quả thanh toán...</h2>
          <p className="mt-2 text-sm text-muted">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-surface-0 p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="rounded-2xl border border-border bg-surface-1 p-8 text-center shadow-lg">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold text-foreground">Có lỗi xảy ra</h2>
            <p className="mt-2 text-sm text-muted">{error}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="w-full" onClick={() => router.push("/bookings")}>
              Lịch sử đặt sân
            </Button>
            <Button variant="primary" className="w-full" onClick={() => router.push("/bookings/new")}>
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const currentStatus = polledStatus || result.bookingStatus;
  const isConfirmedSuccess =
    result.isSuccess && currentStatus && SUCCESS_STATUSES.includes(currentStatus);
  const isPendingRefund =
    result.isSuccess && currentStatus === "CANCELLED_PENDING_REFUND";
  const isOtherCancelled =
    result.isSuccess && currentStatus && currentStatus.startsWith("CANCELLED") && !isPendingRefund;
  const isStillPending = result.isSuccess && currentStatus === "PENDING";

  // Mapped error messages for failed transactions
  const getFailureTitleAndMessage = () => {
    switch (result.responseCode) {
      case "24":
        return {
          title: "Bạn đã hủy giao dịch",
          message: "Giao dịch thanh toán đã bị hủy bởi người dùng.",
        };
      case "79":
      case "13":
        return {
          title: "Sai thông tin OTP / thẻ",
          message: "Thông tin xác thực OTP hoặc thông tin thẻ không chính xác.",
        };
      case "15":
        return {
          title: "Giao dịch đã quá thời gian chờ",
          message: "Giao dịch đã quá thời gian chờ thanh toán. Vui lòng bấm 'Thanh toán lại' để lấy liên kết mới.",
        };
      default:
        return {
          title: "Thanh toán thất bại",
          message: result.message || "Giao dịch thanh toán không thành công.",
        };
    }
  };

  const failureInfo = !result.isSuccess ? getFailureTitleAndMessage() : null;

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-surface-0 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-lg">
          {/* Header Banner */}
          {isConfirmedSuccess && (
            <div className="bg-green-500/10 border-b border-green-500/20 p-6 text-center">
              <CheckCircle className="mx-auto mb-3 h-16 w-16 text-green-500" />
              <h2 className="text-2xl font-bold text-foreground">Thanh toán thành công!</h2>
              <p className="mt-2 text-sm text-muted">
                Đặt sân của bạn đã được xác nhận thành công.
              </p>
            </div>
          )}

          {isPendingRefund && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 p-6 text-center">
              <Warning className="mx-auto mb-3 h-16 w-16 text-amber-500" />
              <h2 className="text-xl font-bold text-foreground">Đã nhận thanh toán (Quá hạn giữ chỗ)</h2>
              <p className="mt-2 text-sm text-muted">
                Đã nhận thanh toán nhưng đơn đặt sân đã hết thời gian giữ chỗ trước khi tiền về. Khoản tiền này sẽ được hoàn đủ bằng tiền mặt tại chi nhánh.
              </p>
            </div>
          )}

          {isOtherCancelled && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 p-6 text-center">
              <Warning className="mx-auto mb-3 h-16 w-16 text-amber-500" />
              <h2 className="text-xl font-bold text-foreground">Đơn đặt sân đã bị hủy</h2>
              <p className="mt-2 text-sm text-muted">
                Đơn đặt sân đã bị hủy. Hệ thống đang đối soát giao dịch này, vui lòng xem chi tiết trong lịch sử đặt sân.
              </p>
            </div>
          )}

          {isStillPending && (
            <div className="bg-sky-500/10 border-b border-sky-500/20 p-6 text-center">
              <Hourglass className="mx-auto mb-3 h-16 w-16 text-sky-500 animate-pulse" />
              <h2 className="text-xl font-bold text-foreground">
                {pollTimedOut ? "Chưa nhận được xác nhận" : "Hệ thống đang xác nhận..."}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {pollTimedOut
                  ? "Hệ thống chưa nhận được kết quả cuối cùng từ cổng thanh toán. Vui lòng kiểm tra lại trong Lịch sử đặt sân."
                  : "Đã nhận kết quả từ VNPay, hệ thống đang đồng bộ trạng thái đơn đặt sân..."}
              </p>
              {isPolling && <Spinner size="sm" className="mx-auto mt-3" />}
            </div>
          )}

          {!result.isSuccess && failureInfo && (
            <div className="bg-red-500/10 border-b border-red-500/20 p-6 text-center">
              <XCircle className="mx-auto mb-3 h-16 w-16 text-red-500" />
              <h2 className="text-2xl font-bold text-foreground">{failureInfo.title}</h2>
              <p className="mt-2 text-sm text-muted">{failureInfo.message}</p>
            </div>
          )}

          {/* Details Body */}
          <div className="p-6 space-y-4">
            <div className="space-y-3 rounded-lg bg-surface-2 p-4 text-sm">
              {result.bookingCode && (
                <div className="flex items-center justify-between">
                  <span className="text-muted">Mã đặt sân</span>
                  <span className="font-mono font-semibold text-foreground">
                    {result.bookingCode}
                  </span>
                </div>
              )}

              {result.amount !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-muted">Số tiền thanh toán</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(result.amount)}
                  </span>
                </div>
              )}

              {result.transactionRef && (
                <div className="flex items-center justify-between">
                  <span className="text-muted">Mã giao dịch</span>
                  <span className="font-mono text-xs text-muted">
                    {result.transactionRef}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {isConfirmedSuccess && (
                <>
                  <Button
                    variant="primary"
                    className="w-full"
                    leftIcon={<Receipt className="h-4 w-4" />}
                    onClick={() => router.push("/bookings")}
                  >
                    Xem lịch sử đặt sân
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    leftIcon={<House className="h-4 w-4" />}
                    onClick={() => router.push("/bookings/new")}
                  >
                    Đặt sân mới
                  </Button>
                </>
              )}

              {(isPendingRefund || isOtherCancelled || isStillPending) && (
                <>
                  <Button
                    variant="primary"
                    className="w-full"
                    leftIcon={<Receipt className="h-4 w-4" />}
                    onClick={() => router.push("/bookings")}
                  >
                    Xem chi tiết trong lịch sử đặt sân
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => router.push("/bookings/new")}
                  >
                    Về trang chủ
                  </Button>
                </>
              )}

              {!result.isSuccess && (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    className="w-full"
                    leftIcon={<ArrowCounterClockwise className="h-4 w-4" />}
                    onClick={handleRetryPayment}
                    isLoading={isRetrying}
                  >
                    Thanh toán lại
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full text-red-600 hover:bg-red-500/10 border-red-500/30"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isCancelling}
                  >
                    Hủy đơn đặt sân
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => router.push("/bookings/new")}
                  >
                    Về trang chủ
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelDialog}
        variant="danger"
        title="Xác nhận hủy đơn đặt sân"
        message="Bạn có chắc chắn muốn hủy đơn đặt sân này? Slot sân sẽ được giải phóng ngay lập tức."
        confirmText={isCancelling ? "Đang hủy..." : "Hủy đơn ngay"}
        cancelText="Giữ lại"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelDialog(false)}
      />
    </div>
  );
}
