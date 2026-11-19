/**
 * RejectBookingDialog Component
 * 
 * Dialog for rejecting a pending booking with a mandatory reason.
 * Adheres strictly to contract §4.3, §5:
 * - Code point count for reason validation ([...reason].length between 5 and 500)
 * - Lock button on submit
 * - Complete error handling (including 503 retry with exact original reason)
 */

"use client";

import { useState, useId } from "react";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Button } from "@/src/shared/components/ui/Button";
import { Textarea } from "@/src/shared/components/ui/Textarea";
import { Alert } from "@/src/shared/components/ui/Alert";
import { rejectBooking } from "@/src/api/booking-approval.api";
import { AuthApiError } from "@/src/api/core";
import { formatCurrency } from "@/src/shared/utils/date";
import { useGlobalToast } from "@/src/shared/hooks/useGlobalToast";
import type {
  PendingApprovalBookingDto,
  BookingApprovalResultDto,
} from "@/src/features/booking-approval/shared/types/booking-approval.types";

interface RejectBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: PendingApprovalBookingDto | null;
  onSuccess: (result: BookingApprovalResultDto) => void;
  onNeedReload: () => void;
}

export function RejectBookingDialog({
  isOpen,
  onClose,
  booking,
  onSuccess,
  onNeedReload,
}: RejectBookingDialogProps) {
  const reasonInputId = useId();
  const { showToast } = useGlobalToast();

  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // 503 retry state (resends exact original reason)
  const [retryReason, setRetryReason] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const codePointsCount = [...reason].length;

  const validate = (): boolean => {
    if (!reason.trim()) {
      setReasonError("Vui lòng nhập lý do từ chối.");
      return false;
    }
    if (codePointsCount < 5) {
      setReasonError(`Lý do từ chối phải có ít nhất 5 ký tự (hiện tại: ${codePointsCount}).`);
      return false;
    }
    if (codePointsCount > 500) {
      setReasonError(`Lý do từ chối không được vượt quá 500 ký tự (hiện tại: ${codePointsCount}).`);
      return false;
    }
    setReasonError(null);
    return true;
  };

  const executeReject = async (reasonToSend: string) => {
    try {
      setIsSubmitting(true);
      setGeneralError(null);

      const result = await rejectBooking(booking.bookingId, { reason: reasonToSend });

      showToast("success", "Đã từ chối đơn đặt sân và giải phóng sân.");
      onSuccess(result);
      handleClose();
    } catch (err) {
      if (err instanceof AuthApiError) {
        switch (err.code) {
          case "VALIDATION_ERROR":
            if (err.errors?.Reason) {
              setReasonError(err.errors.Reason.join(" "));
            } else {
              setGeneralError(err.message || "Dữ liệu không hợp lệ");
            }
            break;

          case "FORBIDDEN":
            setGeneralError("Bạn không có quyền xử lý đơn của chi nhánh này.");
            break;

          case "BOOKING_NOT_PENDING_APPROVAL":
            showToast("warning", "Đơn không còn ở trạng thái chờ duyệt.");
            onNeedReload();
            handleClose();
            break;

          case "APPROVAL_ALREADY_RESOLVED":
            showToast("warning", "Đơn này đã được xử lý trước đó.");
            onNeedReload();
            handleClose();
            break;

          case "APPROVAL_EXPIRED":
            showToast("warning", "Đơn đã hết hạn duyệt và sẽ được hệ thống hủy tự động.");
            onNeedReload();
            handleClose();
            break;

          case "APPROVAL_DECISION_NOT_FOUND":
            showToast(
              "error",
              "Không tìm thấy quyết định cọc của đơn; đơn sẽ tự hủy khi hết hạn duyệt, vui lòng báo quản trị."
            );
            onNeedReload();
            handleClose();
            break;

          case "TADSS_UNAVAILABLE":
            setRetryReason(reasonToSend);
            setGeneralError(
              "Hệ thống duyệt cọc tạm thời không phản hồi. Đơn vẫn đang chờ duyệt, vui lòng bấm 'Thử lại' sau ít phút."
            );
            break;

          default:
            setGeneralError(err.message || "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.");
            break;
        }
      } else {
        const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi từ chối đơn";
        setGeneralError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await executeReject(reason.trim());
  };

  const handleRetry = async () => {
    if (!retryReason) return;
    await executeReject(retryReason);
  };

  const handleClose = () => {
    setReason("");
    setReasonError(null);
    setGeneralError(null);
    setRetryReason(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Từ chối đơn đặt sân"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Booking Summary */}
        <div className="rounded-xl bg-surface-2 p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted">Mã đơn:</span>
            <span className="font-mono font-bold text-foreground">{booking.bookingCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Khách hàng:</span>
            <span className="font-semibold text-foreground">
              {booking.customerName} ({booking.customerPhone})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Lịch chơi:</span>
            <span className="text-foreground">
              {booking.bookingDate} ({booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Tổng tiền:</span>
            <span className="font-bold text-foreground">{formatCurrency(booking.finalTotal)}</span>
          </div>
        </div>

        <Alert variant="warning" title="Lưu ý">
          Khi từ chối, đơn đặt sân sẽ chuyển sang trạng thái <strong>Đã hủy</strong> và các slot sân liên quan sẽ được giải phóng cho khách hàng khác đặt.
        </Alert>

        {/* General Error / 503 Alert */}
        {generalError && (
          <Alert variant={retryReason ? "warning" : "error"}>
            <div className="space-y-2">
              <p className="text-sm font-medium">{generalError}</p>
              {retryReason && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  Thử lại ngay
                </Button>
              )}
            </div>
          </Alert>
        )}

        {/* Reason Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <label htmlFor={reasonInputId} className="font-semibold text-foreground">
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-xs ${
                codePointsCount > 500
                  ? "text-red-500 font-bold"
                  : codePointsCount >= 5
                  ? "text-green-600"
                  : "text-muted"
              }`}
            >
              {codePointsCount} / 500 ký tự (tối thiểu 5)
            </span>
          </div>

          <Textarea
            id={reasonInputId}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setReasonError(null);
            }}
            placeholder="Ví dụ: Khung giờ đã được chi nhánh dành cho giải đấu nội bộ..."
            rows={3}
            disabled={isSubmitting}
          />

          {reasonError && <p className="text-xs text-red-500">{reasonError}</p>}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Quay lại
          </Button>

          <Button
            type="submit"
            variant="danger"
            disabled={isSubmitting || codePointsCount < 5 || codePointsCount > 500}
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận từ chối"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

