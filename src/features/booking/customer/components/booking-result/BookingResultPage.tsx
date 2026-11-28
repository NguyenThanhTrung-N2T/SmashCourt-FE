"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Clock,
  Hourglass,
  XCircle,
  CreditCard,
  Receipt,
  CalendarBlank,
  MapPin,
  ArrowRight,
} from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { Alert } from "@/src/shared/components/ui/Alert";
import { ConfirmationDialog } from "@/src/shared/components/ui/ConfirmationDialog";
import { Spinner } from "@/src/shared/components/feedback/Spinner";
import { useSignalRContext } from "@/src/contexts/SignalRContext";
import { SignalREvents } from "@/src/lib/signalr-events";
import { fetchCustomerBookingById, cancelCustomerBooking } from "@/src/api/booking.api";
import { retryBookingPayment } from "@/src/api/payment.api";
import { AuthApiError } from "@/src/api/core";
import { formatCurrency, parseBackendDateVN } from "@/src/shared/utils/date";
import {
  getCancelSourceText,
  getCancelReasonText,
} from "@/src/features/booking/customer/utils/bookingStatus";
import { useGlobalToast } from "@/src/shared/hooks/useGlobalToast";
import type { BookingDto, OnlineBookingResponse } from "@/src/features/booking/shared/types/booking.types";
import type { BookingApprovalResolvedEvent } from "@/src/features/booking-approval/shared/types/booking-approval.types";

/**
 * Format remaining seconds into MM:ss
 */
function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function BookingResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const { showToast } = useGlobalToast();
  const { connection } = useSignalRContext();

  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [initialResponse, setInitialResponse] = useState<OnlineBookingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expiration countdown states
  const [remainingPaymentSeconds, setRemainingPaymentSeconds] = useState<number | null>(null);
  const [remainingApprovalSeconds, setRemainingApprovalSeconds] = useState<number | null>(null);

  // Cancellation dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRetryingPayment, startRetryTransition] = useTransition();

  // Load initial response from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("last_booking_result");
      if (raw) {
        const parsed = JSON.parse(raw) as OnlineBookingResponse;
        if (!bookingId || parsed.bookingId === bookingId) {
          setInitialResponse(parsed);
        }
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
  }, [bookingId]);

  // Fetch live booking details
  const loadBooking = useCallback(async (id: string, showLoadingSpinner = false) => {
    try {
      if (showLoadingSpinner) setIsLoading(true);
      setError(null);
      const data = await fetchCustomerBookingById(id);
      setBooking(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Không thể tải thông tin đặt sân";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!bookingId) {
      setIsLoading(false);
      setError("Không tìm thấy mã đơn đặt sân");
      return;
    }

    loadBooking(bookingId, true);

    // Reload on tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadBooking(bookingId, false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [bookingId, loadBooking]);

  // SignalR real-time listener for approval resolution & payment success
  useEffect(() => {
    if (!connection || !bookingId) return;

    const handleApprovalResolved = (event: BookingApprovalResolvedEvent) => {
      if (event.bookingId === bookingId) {
        showToast(
          event.approvalResult === "APPROVED" ? "success" : "warning",
          event.message || "Đơn đặt sân đã được xử lý"
        );
        loadBooking(bookingId, false);
      }
    };

    const handlePaymentSuccess = (event: { bookingId?: string; message?: string }) => {
      if (event.bookingId === bookingId) {
        showToast("success", event.message || "Thanh toán cọc thành công!");
        loadBooking(bookingId, false);
      }
    };

    connection.on(SignalREvents.BOOKING_APPROVAL_RESOLVED, handleApprovalResolved);
    connection.on(SignalREvents.PAYMENT_SUCCESS, handlePaymentSuccess);

    return () => {
      connection.off(SignalREvents.BOOKING_APPROVAL_RESOLVED, handleApprovalResolved);
      connection.off(SignalREvents.PAYMENT_SUCCESS, handlePaymentSuccess);
    };
  }, [connection, bookingId, loadBooking, showToast]);

  // Payment Countdown Timer (for expiresAt)
  const effectiveExpiresAt = booking?.expiresAt || initialResponse?.expiresAt;
  useEffect(() => {
    if (!effectiveExpiresAt) {
      setRemainingPaymentSeconds(null);
      return;
    }

    const targetDate = parseBackendDateVN(effectiveExpiresAt);
    if (!targetDate) return;

    const updateTimer = () => {
      const diff = Math.floor((targetDate.getTime() - Date.now()) / 1000);
      setRemainingPaymentSeconds(Math.max(0, diff));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [effectiveExpiresAt]);

  // Approval Countdown Timer (for approvalExpiresAt)
  const effectiveApprovalExpiresAt = booking?.approvalExpiresAt || initialResponse?.approvalExpiresAt;
  useEffect(() => {
    if (!effectiveApprovalExpiresAt) {
      setRemainingApprovalSeconds(null);
      return;
    }

    const targetDate = parseBackendDateVN(effectiveApprovalExpiresAt);
    if (!targetDate) return;

    const updateTimer = () => {
      const diff = Math.floor((targetDate.getTime() - Date.now()) / 1000);
      setRemainingApprovalSeconds(Math.max(0, diff));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [effectiveApprovalExpiresAt]);

  // Handle Pay Deposit Click (with paymentLinkExpiresAt check & auto retry)
  const handlePayDeposit = () => {
    const targetBookingId = booking?.id || initialResponse?.bookingId;
    if (!targetBookingId) return;

    startRetryTransition(async () => {
      try {
        const linkExpiresAt = initialResponse?.paymentLinkExpiresAt;
        const isLinkExpired = linkExpiresAt
          ? (parseBackendDateVN(linkExpiresAt)?.getTime() ?? 0) <= Date.now()
          : false;

        const currentPaymentUrl = initialResponse?.paymentUrl;

        // If link expired or not available, call retry-payment to generate a fresh one
        if (isLinkExpired || !currentPaymentUrl) {
          const fresh = await retryBookingPayment(targetBookingId);
          if (fresh.paymentUrl) {
            window.location.href = fresh.paymentUrl;
            return;
          }
        } else if (currentPaymentUrl) {
          window.location.href = currentPaymentUrl;
          return;
        }

        showToast("error", "Không thể lấy link thanh toán. Vui lòng thử lại sau.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Lỗi khi tạo lại link thanh toán";
        showToast("error", msg);
      }
    });
  };

  // Handle Cancel Booking
  const handleConfirmCancel = async () => {
    const targetBookingId = booking?.id || initialResponse?.bookingId;
    if (!targetBookingId) return;

    try {
      setIsCancelling(true);
      await cancelCustomerBooking(targetBookingId);
      showToast("success", "Đã hủy đơn đặt sân thành công");
      setShowCancelDialog(false);
      loadBooking(targetBookingId, true);
    } catch (err) {
      if (err instanceof AuthApiError && err.code === "BOOKING_ALREADY_STARTED") {
        showToast("error", "Đơn đã tới giờ chơi, không thể tự hủy. Vui lòng liên hệ chi nhánh.");
      } else {
        const msg = err instanceof Error ? err.message : "Không thể hủy đơn đặt sân";
        showToast("error", msg);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  // Derive current status
  const currentStatus = booking?.status || initialResponse?.status || "PENDING";
  const bookingCode = booking?.bookingCode || initialResponse?.bookingCode || "—";
  const finalTotal = booking?.finalTotal ?? initialResponse?.finalTotal ?? 0;
  const depositAmount = booking?.depositAmount ?? initialResponse?.depositAmount ?? null;
  const depositRate = booking?.depositRate ?? initialResponse?.depositRate ?? null;
  const remainingAmount = booking?.remainingAmount ?? initialResponse?.remainingAmount ?? null;

  if (isLoading && !initialResponse) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted">Đang tải kết quả đặt sân...</p>
        </div>
      </div>
    );
  }

  if (error && !booking && !initialResponse) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-2xl border border-border bg-surface-1 p-8 text-center shadow-sm">
          <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="text-2xl font-bold text-foreground">Không tìm thấy đơn đặt sân</h2>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="primary" onClick={() => router.push("/bookings/new")}>
              Đặt sân mới
            </Button>
            <Button variant="secondary" onClick={() => router.push("/bookings")}>
              Lịch sử đặt sân
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-sm">
        {/* Header / Status Banner */}
        {currentStatus === "PENDING" && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 p-6 text-center">
            <Clock className="mx-auto mb-3 h-14 w-14 text-amber-500" />
            <h1 className="text-2xl font-bold text-foreground">Đặt sân thành công!</h1>
            <p className="mt-1 text-sm text-muted">
              Vui lòng thanh toán tiền cọc để giữ chỗ cho đơn đặt sân của bạn.
            </p>
          </div>
        )}

        {currentStatus === "CONFIRMED" && (
          <div className="bg-green-500/10 border-b border-green-500/20 p-6 text-center">
            <CheckCircle className="mx-auto mb-3 h-14 w-14 text-green-500" />
            <h1 className="text-2xl font-bold text-foreground">Đặt sân thành công!</h1>
            <p className="mt-1 text-sm text-muted font-medium">
              Đặt sân thành công, vui lòng thanh toán tại quầy.
            </p>
          </div>
        )}

        {currentStatus === "PENDING_APPROVAL" && (
          <div className="bg-sky-500/10 border-b border-sky-500/20 p-6 text-center">
            <Hourglass className="mx-auto mb-3 h-14 w-14 text-sky-500 animate-pulse" />
            <h1 className="text-2xl font-bold text-foreground">Chờ chi nhánh xác nhận</h1>
            <p className="mt-1 text-sm text-muted">
              Đơn đặt sân đang chờ quản lý chi nhánh duyệt mức cọc.
            </p>
          </div>
        )}

        {currentStatus === "PAID_ONLINE" && (
          <div className="bg-green-500/10 border-b border-green-500/20 p-6 text-center">
            <CheckCircle className="mx-auto mb-3 h-14 w-14 text-green-500" />
            <h1 className="text-2xl font-bold text-foreground">Đã thanh toán cọc thành công!</h1>
            <p className="mt-1 text-sm text-muted">
              Đơn đặt sân của bạn đã được xác nhận giữ chỗ.
            </p>
          </div>
        )}

        {currentStatus.startsWith("CANCELLED") && (
          <div className="bg-red-500/10 border-b border-red-500/20 p-6 text-center">
            <XCircle className="mx-auto mb-3 h-14 w-14 text-red-500" />
            <h1 className="text-2xl font-bold text-foreground">Đơn đặt sân đã bị hủy</h1>
            <p className="mt-1 text-sm text-muted">
              {getCancelSourceText(booking?.cancelSource ?? null)}
              {getCancelReasonText(booking?.cancelReason ?? null) ? ` — ${getCancelReasonText(booking?.cancelReason ?? null)}` : ""}
            </p>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Booking Summary */}
          <div className="rounded-xl bg-surface-2 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Mã đơn đặt sân</span>
              <span className="font-mono font-bold text-foreground">{bookingCode}</span>
            </div>

            {booking?.branchName && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted">
                  <MapPin className="h-4 w-4" /> Chi nhánh
                </span>
                <span className="font-semibold text-foreground">{booking.branchName}</span>
              </div>
            )}

            {booking?.bookingDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted">
                  <CalendarBlank className="h-4 w-4" /> Ngày chơi
                </span>
                <span className="font-medium text-foreground">
                  {booking.bookingDate.split(" ")[0]}
                </span>
              </div>
            )}

            {booking?.courts && booking.courts.length > 0 && (
              <div className="border-t border-border pt-3 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Sân & Giờ chơi
                </span>
                {booking.courts.map((c, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{c.courtName}</span>
                    <span className="text-muted">
                      {c.startTime.slice(0, 5)} - {c.endTime.slice(0, 5)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deposit & Financial Breakdown */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Chi tiết thanh toán
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Tổng tiền đơn</span>
                <span className="font-semibold text-foreground">{formatCurrency(finalTotal)}</span>
              </div>

              {depositRate !== null && depositAmount !== null && (
                <div className="flex justify-between items-center text-primary font-medium">
                  <span>Tiền cọc ({Math.round(depositRate * 100)}%)</span>
                  <span className="text-lg font-bold">{formatCurrency(depositAmount)}</span>
                </div>
              )}

              {remainingAmount !== null && remainingAmount > 0 && (
                <div className="flex justify-between text-muted">
                  <span>Phần còn lại thu tại quầy</span>
                  <span className="font-medium text-foreground">{formatCurrency(remainingAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timers & Status Specific Alerts */}
          {currentStatus === "PENDING" && remainingPaymentSeconds !== null && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-amber-600 font-medium">
                <Clock className="h-5 w-5" />
                <span>Thời gian giữ chỗ còn lại:</span>
                <span className="font-mono text-xl font-bold tracking-wider">
                  {formatCountdown(remainingPaymentSeconds)}
                </span>
              </div>
              {remainingPaymentSeconds === 0 && (
                <p className="mt-2 text-xs text-red-500">
                  Thời gian thanh toán cọc đã hết. Đơn sẽ tự động hủy.
                </p>
              )}
            </div>
          )}

          {currentStatus === "PENDING_APPROVAL" && (
            <div className="space-y-3">
              <Alert variant="info" title="Thông tin chờ duyệt">
                Quản lý chi nhánh đang xem xét mức cọc cho đơn của bạn. Mức cọc sẽ được thông báo ngay khi duyệt. Sân của bạn đang được tạm giữ.
              </Alert>

              {remainingApprovalSeconds !== null && (
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-sky-600 font-medium">
                    <Hourglass className="h-5 w-5" />
                    <span>Thời hạn quản lý xử lý:</span>
                    <span className="font-mono text-xl font-bold tracking-wider">
                      {remainingApprovalSeconds > 0 ? formatCountdown(remainingApprovalSeconds) : "Đang chờ xử lý..."}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStatus === "CONFIRMED" && (
            <Alert variant="success" title="Không yêu cầu cọc online">
              Đơn đặt sân này được miễn cọc hoặc mức cọc dưới mức thanh toán online tối thiểu. Quý khách vui lòng đến đúng giờ và thanh toán toàn bộ tại quầy chi nhánh.
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            {currentStatus === "PENDING" && remainingPaymentSeconds !== 0 && (
              <Button
                variant="primary"
                size="lg"
                className="w-full text-base font-semibold"
                leftIcon={<CreditCard className="h-5 w-5" />}
                onClick={handlePayDeposit}
                isLoading={isRetryingPayment}
              >
                Thanh toán cọc ngay
              </Button>
            )}

            {(currentStatus === "PENDING" || currentStatus === "PENDING_APPROVAL") && (
              <Button
                variant="secondary"
                className="w-full text-red-600 hover:bg-red-500/10 border-red-500/30"
                onClick={() => setShowCancelDialog(true)}
                disabled={isCancelling}
              >
                Hủy đơn đặt sân
              </Button>
            )}

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                leftIcon={<Receipt className="h-4 w-4" />}
                onClick={() => router.push("/bookings")}
              >
                Lịch sử đặt sân
              </Button>

              <Button
                variant="secondary"
                className="flex-1"
                leftIcon={<ArrowRight className="h-4 w-4" />}
                onClick={() => router.push("/bookings/new")}
              >
                Đặt sân khác
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelDialog}
        variant="danger"
        title="Xác nhận hủy đơn đặt sân"
        message="Bạn có chắc chắn muốn hủy đơn đặt sân này? Slot sân sẽ được giải phóng cho khách hàng khác."
        confirmText={isCancelling ? "Đang hủy..." : "Hủy đơn ngay"}
        cancelText="Giữ lại đơn"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelDialog(false)}
      />
    </div>
  );
}
