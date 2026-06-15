"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Cardholder,
  Warning,
  CheckCircle,
  Spinner,
} from "@phosphor-icons/react";
import { fetchCancellationInfo, cancelBookingByToken } from "@/src/api/booking.api";
import type { CancelTokenInfoDto } from "@/src/features/booking/shared/types/booking.types";
import { Button } from "@/src/shared/components/ui/Button";

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function CancelBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<CancelTokenInfoDto | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Mã token hủy sân không hợp lệ hoặc thiếu.");
      setIsLoading(false);
      return;
    }

    async function loadInfo() {
      try {
        const data = await fetchCancellationInfo(token!);
        setInfo(data);
      } catch (err: any) {
        setError(
          err?.message ||
            "Không thể tìm thấy thông tin đơn đặt sân hoặc token đã hết hạn."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadInfo();
  }, [token]);

  const handleCancel = async () => {
    if (!token) return;
    setIsCancelling(true);
    setError(null);
    try {
      await cancelBookingByToken(token);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi trong quá trình hủy đặt sân.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted">
          Đang truy xuất thông tin đặt sân...
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-10 space-y-6 max-w-md mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 mx-auto">
          <CheckCircle className="h-10 w-10" weight="fill" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Hủy đặt sân thành công</h1>
          <p className="text-sm text-muted">
            Đơn đặt sân của bạn đã được hủy bỏ thành công trên hệ thống.
          </p>
        </div>

        {info && info.refundAmount > 0 && (
          <div className="rounded-xl border-2 border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1.5 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Thông tin hoàn tiền
            </p>
            <p className="text-sm text-foreground">
              Số tiền được hoàn lại: <strong className="text-emerald-600 dark:text-emerald-400">{formatVND(info.refundAmount)}</strong> ({info.refundPercent}%)
            </p>
            <p className="text-xs text-muted leading-relaxed">
              * Quý khách vui lòng mang CCCD và mã Booking đến chi nhánh **{info.branchName}** trong giờ làm việc để nhận tiền mặt.
            </p>
          </div>
        )}

        <Button
          onClick={() => router.push("/")}
          variant="primary"
          className="w-full rounded-full py-2.5 font-bold"
        >
          Trở về Trang chủ
        </Button>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="text-center py-10 space-y-5 max-w-md mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30 text-red-500 mx-auto">
          <Warning className="h-10 w-10" weight="fill" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Lỗi xử lý yêu cầu</h1>
          <p className="text-sm text-muted">
            {error || "Yêu cầu hủy đặt sân không hợp lệ."}
          </p>
        </div>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="w-full rounded-full py-2.5"
        >
          Trở về Trang chủ
        </Button>
      </div>
    );
  }

  // Check if booking is already cancelled
  const isAlreadyCancelled =
    info.status === "CANCELLED" ||
    info.status === "CANCELLED_PENDING_REFUND" ||
    info.status === "CANCELLED_REFUNDED";

  if (isAlreadyCancelled) {
    return (
      <div className="text-center py-10 space-y-5 max-w-md mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-500 mx-auto">
          <Warning className="h-10 w-10" weight="fill" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Đặt sân đã được hủy trước đó</h1>
          <p className="text-sm text-muted">
            Đơn đặt sân này đã ở trạng thái hủy trên hệ thống.
          </p>
        </div>
        <Button
          onClick={() => router.push("/")}
          variant="primary"
          className="w-full rounded-full py-2.5"
        >
          Trở về Trang chủ
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Xác nhận hủy đặt sân</h1>
        <p className="text-sm text-muted">
          Vui lòng kiểm tra lại thông tin lịch chơi của bạn trước khi xác nhận hủy.
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted border-b border-border pb-2">
          Chi tiết đặt sân
        </h2>

        <div className="space-y-3.5">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-primary mt-0.5" weight="duotone" />
            <div>
              <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Chi nhánh</p>
              <p className="text-sm font-semibold text-foreground">{info.branchName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 shrink-0 text-primary mt-0.5" weight="duotone" />
            <div>
              <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Ngày chơi</p>
              <p className="text-sm font-semibold text-foreground">{info.bookingDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 shrink-0 text-primary mt-0.5" weight="duotone" />
            <div>
              <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Khung giờ</p>
              <p className="text-sm font-semibold text-foreground">
                {info.startTime} - {info.endTime}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-5 w-5 items-center justify-center text-primary shrink-0 font-bold text-lg leading-none">🏸</div>
            <div>
              <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Danh sách sân</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {info.courtNames.map((court, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-surface-2 border border-border px-2.5 py-0.5 text-xs font-semibold text-foreground"
                  >
                    {court}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation & Refund Policy Alert */}
      <div className="rounded-2xl border-2 border-red-500/20 bg-red-500/5 p-5 space-y-3">
        <div className="flex items-center gap-2 text-red-500">
          <Warning className="h-5 w-5 shrink-0" weight="fill" />
          <h3 className="font-bold text-sm">Chính sách hủy sân & hoàn tiền</h3>
        </div>

        <div className="space-y-2 text-xs text-muted leading-relaxed">
          {info.refundAmount > 0 ? (
            <>
              <p className="text-foreground">
                Theo quy định của chi nhánh, đơn đặt sân này đủ điều kiện được hoàn trả:
              </p>
              <div className="flex items-center gap-2 rounded-lg bg-surface-1 border border-emerald-500/20 p-2.5 text-sm my-2.5">
                <Cardholder className="h-5 w-5 text-emerald-500 shrink-0" weight="duotone" />
                <span className="text-muted">Số tiền hoàn trả:</span>
                <strong className="text-emerald-500 ml-auto">{formatVND(info.refundAmount)} ({info.refundPercent}%)</strong>
              </div>
              <p>
                * Sau khi xác nhận hủy, số tiền hoàn này sẽ được xử lý dưới hình thức **nhận tiền mặt tại chi nhánh**. Vui lòng liên hệ quầy lễ tân chi nhánh khi đến chơi hoặc lấy tiền hoàn.
              </p>
            </>
          ) : (
            <p className="text-red-600/90 dark:text-red-400 font-semibold">
              ⚠️ Đơn này không đủ điều kiện hoàn tiền (hoàn 0%) do hủy quá gần giờ chơi hoặc quá thời hạn quy định.
            </p>
          )}
          <p className="text-[11px] mt-1 italic">
            * Hành động hủy đặt sân là không thể hoàn tác. Một khi đã xác nhận hủy, lịch chơi này sẽ được mở lại cho khách hàng khác đặt.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 pt-2">
        <Button
          onClick={handleCancel}
          disabled={isCancelling}
          variant="danger"
          className="w-full rounded-full py-3 font-bold text-sm shadow-md"
        >
          {isCancelling ? "Đang xử lý hủy sân..." : "Xác nhận Hủy Đặt Sân"}
        </Button>
        <Button
          onClick={() => router.push("/")}
          disabled={isCancelling}
          variant="outline"
          className="w-full rounded-full py-3"
        >
          Giữ Lịch Chơi
        </Button>
      </div>
    </div>
  );
}

export default function CancelBookingPage() {
  return (
    <div className="container max-w-lg mx-auto px-4 py-12">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
            <Spinner className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-semibold text-muted">Đang tải...</p>
          </div>
        }
      >
        <CancelBookingContent />
      </Suspense>
    </div>
  );
}
