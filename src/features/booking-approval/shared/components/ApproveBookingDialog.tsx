/**
 * ApproveBookingDialog Component
 * 
 * Dialog for approving a pending booking with a deposit percentage and reason.
 * Adheres strictly to contract §4.2, §5:
 * - Trap #18: integer math for deposit rate (Math.round(percent * 100) / 10000)
 * - Trap #19: Unicode code point count for reason ([...reason].length)
 * - Trap #12: 503 retry resends original payload
 * - Complete error code handling
 */

"use client";

import { useState, useId } from "react";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Textarea } from "@/src/shared/components/ui/Textarea";
import { Alert } from "@/src/shared/components/ui/Alert";
import { approveBooking } from "@/src/api/booking-approval.api";
import { AuthApiError } from "@/src/api/core";
import { formatCurrency } from "@/src/shared/utils/date";
import { useGlobalToast } from "@/src/shared/hooks/useGlobalToast";
import type {
  PendingApprovalBookingDto,
  BookingApprovalResultDto,
} from "@/src/features/booking-approval/shared/types/booking-approval.types";

interface ApproveBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: PendingApprovalBookingDto | null;
  onSuccess: (result: BookingApprovalResultDto) => void;
  onNeedReload: () => void;
}

export function ApproveBookingDialog({
  isOpen,
  onClose,
  booking,
  onSuccess,
  onNeedReload,
}: ApproveBookingDialogProps) {
  const percentInputId = useId();
  const reasonInputId = useId();
  const { showToast } = useGlobalToast();

  const [percent, setPercent] = useState("30");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    depositRate?: string;
    reason?: string;
  }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // 503 retry state (Trap #12: stores original submitted payload)
  const [retryPayload, setRetryPayload] = useState<{
    depositRate: number;
    reason: string;
  } | null>(null);

  if (!isOpen || !booking) return null;

  const finalTotal = booking.finalTotal || 0;
  const numPercent = parseFloat(percent) || 0;

  // Trap #18: Use integer math to prevent floating point inaccuracies
  // (e.g. 7.15 / 100 in JS gives 0.07150000000000001 which BE rejects)
  const calculatedRate = Math.round(numPercent * 100) / 10000;
  const calculatedDepositAmount = Math.round(finalTotal * calculatedRate);
  const remainingAmount = Math.max(0, finalTotal - calculatedDepositAmount);

  // Trap #19: Code point count for reason validation
  const codePointsCount = [...reason].length;

  const validate = (): boolean => {
    const errors: { depositRate?: string; reason?: string } = {};

    if (finalTotal > 0) {
      if (isNaN(numPercent) || numPercent < 0 || numPercent > 100) {
        errors.depositRate = "Mức cọc phải từ 0% đến 100%";
      } else if (calculatedDepositAmount > 0 && calculatedDepositAmount < 5000) {
        errors.depositRate = "Số tiền cọc tối thiểu là 5.000 đ, hoặc chọn 0% để miễn cọc (thu tại quầy).";
      }
    }

    if (!reason.trim()) {
      errors.reason = "Vui lòng nhập lý do duyệt.";
    } else if (codePointsCount < 5) {
      errors.reason = `Lý do phải có ít nhất 5 ký tự (hiện tại: ${codePointsCount}).`;
    } else if (codePointsCount > 500) {
      errors.reason = `Lý do không được vượt quá 500 ký tự (hiện tại: ${codePointsCount}).`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const executeApproval = async (payloadToSend: { depositRate: number; reason: string }) => {
    try {
      setIsSubmitting(true);
      setGeneralError(null);

      const result = await approveBooking(booking.bookingId, payloadToSend);

      showToast("success", "Duyệt đơn đặt sân thành công");
      onSuccess(result);
      handleClose();
    } catch (err) {
      if (err instanceof AuthApiError) {
        // Contract §5: Map error codes
        switch (err.code) {
          case "VALIDATION_ERROR": {
            const beErrors: { depositRate?: string; reason?: string } = {};
            if (err.errors?.DepositRate) {
              beErrors.depositRate = err.errors.DepositRate.join(" ");
            }
            if (err.errors?.Reason) {
              beErrors.reason = err.errors.Reason.join(" ");
            }
            setFieldErrors(beErrors);
            setGeneralError(err.message || "Dữ liệu đầu vào không hợp lệ");
            break;
          }

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
            // Trap #12: Keep dialog open and enable retry with the exact same payload
            setRetryPayload(payloadToSend);
            setGeneralError(
              "Hệ thống duyệt cọc tạm thời không phản hồi. Đơn vẫn đang chờ duyệt, vui lòng bấm 'Thử lại' sau ít phút."
            );
            break;

          default:
            setGeneralError(err.message || "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.");
            break;
        }
      } else {
        const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi duyệt đơn";
        setGeneralError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      depositRate: finalTotal === 0 ? 0 : calculatedRate,
      reason: reason.trim(),
    };

    await executeApproval(payload);
  };

  // Trap #12: Resend exact original submitted values on retry
  const handleRetry = async () => {
    if (!retryPayload) return;
    await executeApproval(retryPayload);
  };

  const handleClose = () => {
    setPercent("30");
    setReason("");
    setFieldErrors({});
    setGeneralError(null);
    setRetryPayload(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Duyệt đơn đặt sân"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
            <span className="text-muted">Chi nhánh:</span>
            <span className="font-medium text-foreground">{booking.branchName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Lịch chơi:</span>
            <span className="text-foreground">
              {booking.bookingDate} ({booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)})
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-medium">
            <span className="text-muted">Tổng tiền đơn:</span>
            <span className="text-base font-bold text-primary">{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        {/* Reason flagged by TADSS */}
        {booking.approvalReasons && booking.approvalReasons.length > 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs space-y-1">
            <span className="font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Lý do cần duyệt:
            </span>
            <ul className="list-disc pl-4 space-y-0.5 text-muted">
              {booking.approvalReasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* General Error / 503 Alert */}
        {generalError && (
          <Alert variant={retryPayload ? "warning" : "error"}>
            <div className="space-y-2">
              <p className="text-sm font-medium">{generalError}</p>
              {retryPayload && (
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

        {/* Deposit Rate Input */}
        {finalTotal === 0 ? (
          <Alert variant="info">
            Đơn đặt sân có giá trị 0 ₫: duyệt đơn là xác nhận miễn cọc, toàn bộ dịch vụ phát sinh (nếu có) thu tại quầy.
          </Alert>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label htmlFor={percentInputId} className="font-semibold text-foreground">
                Tỷ lệ cọc (%) <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-muted">Từ 0% đến 100%</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-32">
                <Input
                  id={percentInputId}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={percent}
                  onChange={(e) => {
                    setPercent(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, depositRate: undefined }));
                  }}
                  disabled={isSubmitting}
                  className="font-mono text-base text-right"
                />
              </div>

              {/* Quick % buttons */}
              <div className="flex items-center gap-1.5">
                {[0, 30, 50, 100].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => {
                      setPercent(String(quick));
                      setFieldErrors((prev) => ({ ...prev, depositRate: undefined }));
                    }}
                    disabled={isSubmitting}
                    className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-3 transition-colors"
                  >
                    {quick}%
                  </button>
                ))}
              </div>
            </div>

            {fieldErrors.depositRate && (
              <p className="text-xs text-red-500">{fieldErrors.depositRate}</p>
            )}

            {/* Financial Preview */}
            <div className="rounded-lg border border-border bg-surface-2/60 p-3 text-xs space-y-1.5 mt-2">
              <div className="flex justify-between">
                <span className="text-muted">Tiền cọc quy đổi:</span>
                <span className="font-bold text-primary">
                  {formatCurrency(calculatedDepositAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Còn lại thu tại quầy:</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Reason Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <label htmlFor={reasonInputId} className="font-semibold text-foreground">
              Lý do duyệt <span className="text-red-500">*</span>
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
              setFieldErrors((prev) => ({ ...prev, reason: undefined }));
            }}
            placeholder="Ví dụ: Khách quen của chi nhánh, đã liên hệ xác nhận sẽ đến chơi đúng giờ..."
            rows={3}
            disabled={isSubmitting}
          />

          {fieldErrors.reason && (
            <p className="text-xs text-red-500">{fieldErrors.reason}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || codePointsCount < 5 || codePointsCount > 500}
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận duyệt"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

