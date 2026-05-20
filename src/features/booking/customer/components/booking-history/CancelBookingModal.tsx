/**
 * CancelBookingModal Component
 * 
 * Modal for confirming booking cancellation with refund preview.
 */

"use client";

import { Warning, Receipt, CalendarBlank, Clock, MapPin, CurrencyCircleDollar } from "@phosphor-icons/react";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Button } from "@/src/shared/components/ui/Button";
import { Alert } from "@/src/shared/components/ui/Alert";
import { useCancelPolicies } from "../../hooks/useCancelPolicies";
import type { BookingDto } from "../../../shared/types/booking.types";
import {
  formatCurrency,
  formatDate,
  formatTime,
  calculateRefundInfo,
} from "../../utils/bookingStatus";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  booking: BookingDto;
  isLoading?: boolean;
}

export function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  booking,
  isLoading = false,
}: CancelBookingModalProps) {
  const { policies, isLoading: isPoliciesLoading } = useCancelPolicies();
  const finalTotal = booking.finalTotal ?? booking.invoice?.finalTotal ?? 0;
  const firstCourt = booking.courts[0];

  // Calculate refund info using dynamic policies
  const refundInfo = firstCourt
    ? calculateRefundInfo(
      booking.bookingDate,
      firstCourt.startTime,
      finalTotal,
      policies
    )
    : { refundPercent: 0, refundAmount: 0, canCancel: false };

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      // Error is handled by parent component
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận hủy đặt sân"
      subtitle="Vui lòng xác nhận"
      icon={<Warning className="h-5 w-5" />}
      maxWidth="lg"
    >
      <div className="space-y-6 p-6">
        {/* Warning Message */}
        <Alert variant="warning" title="Lưu ý">
          Bạn có chắc chắn muốn hủy đơn đặt sân này? Hành động này không thể hoàn tác.
        </Alert>

        {/* Booking Info */}
        <div className="rounded-lg border-2 border-border bg-surface-2 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Receipt className="h-4 w-4 text-muted" />
            <span className="font-bold text-foreground">
              Mã đặt sân: {booking.bookingCode || (booking.id || booking.bookingId)?.substring(0, 8).toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted" />
            <span className="text-foreground">{booking.branchName}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <CalendarBlank className="h-4 w-4 text-muted" />
            <span className="text-foreground">{formatDate(booking.bookingDate)}</span>
          </div>

          {firstCourt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted" />
              <span className="text-foreground">
                {formatTime(firstCourt.startTime)} - {formatTime(firstCourt.endTime)}
              </span>
            </div>
          )}

          {/* Courts List */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Sân đã đặt
            </p>
            <div className="space-y-1">
              {booking.courts.map((court, index) => (
                <div key={index} className="text-sm text-foreground">
                  • {court.courtName}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Refund Info */}
        {isPoliciesLoading ? (
          <div className="rounded-lg border-2 border-border bg-surface-2 p-4">
            <div className="flex items-center justify-center py-4">
              <div className="text-sm text-muted">Đang tải chính sách hoàn tiền...</div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-border bg-surface-2 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CurrencyCircleDollar className="h-5 w-5 text-muted" />
              <h3 className="font-bold text-foreground">Thông tin hoàn tiền</h3>
            </div>

            {refundInfo.refundAmount > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Tổng tiền đã thanh toán</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Tỷ lệ hoàn tiền</span>
                  <span className="font-semibold text-primary">
                    {refundInfo.refundPercent}%
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-bold text-foreground">Số tiền hoàn lại</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(refundInfo.refundAmount)}
                  </span>
                </div>

                <Alert variant="info" className="mt-3">
                  <p className="text-xs">
                    * Nhân viên sẽ xác nhận và hoàn tiền trong vòng 3-5 ngày làm việc
                  </p>
                </Alert>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Warning className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-amber-600">
                    Không được hoàn tiền theo chính sách hủy
                  </p>
                  <p className="text-xs text-muted">
                    Đơn đặt sân này không đủ điều kiện hoàn tiền do thời gian hủy quá gần giờ chơi.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading || isPoliciesLoading}
          >
            Quay lại
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={isLoading || isPoliciesLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận hủy"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
