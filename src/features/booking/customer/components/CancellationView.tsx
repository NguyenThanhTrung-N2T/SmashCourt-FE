/**
 * CancellationView Component
 * 
 * View for canceling a booking via token link.
 */

"use client";

import { useEffect, useState } from "react";
import { Warning, CheckCircle, XCircle, CalendarBlank, MapPin, Clock } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Spinner } from "@/src/shared/components/feedback/Spinner";
import { ConfirmationDialog } from "@/src/shared/components/ui/ConfirmationDialog";
import { fetchCancellationInfo, cancelBookingByToken } from "@/src/api/booking.api";
import { formatCurrency, formatDate, formatTime } from "../utils/bookingStatus";
import type { CancellationInfoDto } from "../../types/booking.types";

interface CancellationViewProps {
  token: string;
}

export function CancellationView({ token }: CancellationViewProps) {
  const [info, setInfo] = useState<CancellationInfoDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    const loadInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCancellationInfo(token);
        setInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải thông tin hủy đặt sân");
      } finally {
        setIsLoading(false);
      }
    };

    loadInfo();
  }, [token]);

  const handleCancelClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmCancel = async () => {
    try {
      setIsCanceling(true);
      await cancelBookingByToken(token);
      setCancelSuccess(true);
      setShowConfirmDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể hủy đặt sân");
      setShowConfirmDialog(false);
    } finally {
      setIsCanceling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-0 p-4">
        <div className="w-full max-w-md rounded-2xl border-2 border-border bg-surface-1 p-8 text-center shadow-lg">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">
            Đang tải thông tin...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-0 p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="rounded-2xl border-2 border-border bg-surface-1 p-8 text-center shadow-lg">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold text-foreground">Có lỗi xảy ra</h2>
            <p className="mt-2 text-sm text-muted">
              {error || "Không thể tải thông tin hủy đặt sân"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (cancelSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-0 p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="rounded-2xl border-2 border-border bg-surface-1 p-8 text-center shadow-lg">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Hủy đặt sân thành công!
            </h2>
            <p className="mt-2 text-sm text-muted">
              {info.refundAmount > 0
                ? `Bạn sẽ được hoàn ${formatCurrency(info.refundAmount)} (${info.refundPercent}%)`
                : "Đơn đặt sân của bạn đã được hủy"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!info.canCancel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-0 p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="rounded-2xl border-2 border-border bg-surface-1 p-8 text-center shadow-lg">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold text-foreground">
              Không thể hủy đặt sân
            </h2>
            <p className="mt-2 text-sm text-muted">
              {info.cancelTokenUsedAt
                ? "Link hủy này đã được sử dụng"
                : "Đơn đặt sân này không thể hủy"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-surface-0 p-4">
        <div className="w-full max-w-2xl space-y-4">
          <div className="rounded-2xl border-2 border-border bg-surface-1 p-8 shadow-lg">
            {/* Header */}
            <div className="mb-6 text-center">
              <Warning className="mx-auto mb-4 h-16 w-16 text-amber-500" />
              <h2 className="text-2xl font-bold text-foreground">
                Xác nhận hủy đặt sân
              </h2>
              <p className="mt-2 text-sm text-muted">
                Vui lòng xem lại thông tin trước khi hủy
              </p>
            </div>

            {/* Booking Info */}
            <div className="mb-6 space-y-4">
              <div className="rounded-lg bg-surface-2 p-4">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
                  Thông tin đặt sân
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted" />
                    <span className="font-semibold text-foreground">
                      {info.branchName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarBlank className="h-4 w-4 text-muted" />
                    <span className="text-muted">{formatDate(info.bookingDate)}</span>
                  </div>
                </div>
              </div>

              {/* Courts */}
              <div className="rounded-lg bg-surface-2 p-4">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
                  Sân đã đặt
                </h3>
                <div className="space-y-2">
                  {info.courts.map((court, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted" />
                        <span className="font-semibold text-foreground">
                          {court.courtName}
                        </span>
                        <span className="text-muted">
                          ({formatTime(court.startTime)} - {formatTime(court.endTime)})
                        </span>
                      </div>
                      {court.price !== undefined && (
                        <span className="font-bold text-primary">
                          {formatCurrency(court.price)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Refund Info */}
              {info.refundAmount > 0 && (
                <div className="rounded-lg border-2 border-amber-500/30 bg-amber-500/10 p-4">
                  <h3 className="mb-2 text-sm font-bold text-amber-600">
                    Thông tin hoàn tiền
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-amber-600/80">Tỷ lệ hoàn tiền</span>
                      <span className="font-bold text-amber-600">
                        {info.refundPercent}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-600/80">Số tiền hoàn lại</span>
                      <span className="text-lg font-bold text-amber-600">
                        {formatCurrency(info.refundAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Warning Alert */}
            <Alert variant="warning" title="Lưu ý" className="mb-6">
              Sau khi hủy, bạn không thể hoàn tác thao tác này. Số tiền hoàn lại sẽ
              được xử lý trong vòng 3-5 ngày làm việc.
            </Alert>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => window.close()}
              >
                Quay lại
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleCancelClick}
              >
                Xác nhận hủy
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <ConfirmationDialog
          onCancel={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmCancel}
          title="Xác nhận hủy đặt sân"
          message="Bạn có chắc chắn muốn hủy đặt sân này không?"
          confirmText="Xác nhận hủy"
          cancelText="Quay lại"
          variant="danger"
        />
      )}
    </>
  );
}
