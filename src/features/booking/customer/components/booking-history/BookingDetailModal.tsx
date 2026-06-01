/**
 * BookingDetailModal Component
 * 
 * Modal displaying detailed booking information with inline cancel functionality.
 */

"use client";

import { useState } from "react";
import { Receipt, CalendarBlank, MapPin, User, Phone, Clock, Tag, X, ArrowLeft, CreditCard } from "@phosphor-icons/react";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Button } from "@/src/shared/components/ui/Button";
import { Spinner } from "@/src/shared/components/feedback/Spinner";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Divider } from "@/src/shared/components/layout/Divider";
import { useCancelBooking } from "../../hooks/useCancelBooking";
import { useCancelPolicies } from "../../hooks/useCancelPolicies";
import { useRetryPayment } from "../../hooks/useRetryPayment";
import type { BookingDto } from "../../../shared/types/booking.types";
import {
  getBookingStatusConfig,
  getPaymentStatusConfig,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  canCancelBooking,
  calculateRefundInfo,
} from "../../utils/bookingStatus";

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDto | null;
  isLoading: boolean;
  error: string | null;
  onCancelSuccess?: () => void;
}

export function BookingDetailModal({
  isOpen,
  onClose,
  booking,
  isLoading,
  error,
  onCancelSuccess,
}: BookingDetailModalProps) {
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const { cancelBooking, isLoading: isCancelling, error: cancelError } = useCancelBooking();
  const { policies, isLoading: isPoliciesLoading } = useCancelPolicies();
  const { retryPayment, isLoading: isRetryingPayment, error: paymentError } = useRetryPayment();

  const handleCancelClick = () => {
    setShowCancelConfirmation(true);
  };

  const handleCancelBack = () => {
    setShowCancelConfirmation(false);
  };

  const handleRetryPayment = async () => {
    if (!booking?.id) return;

    const result = await retryPayment(booking.id || "");

    if (result) {
      // Redirect to payment URL
      window.location.href = result.paymentUrl;
    }
    // Error is handled by the hook and displayed via paymentError state
  };

  const handleCancelConfirm = async () => {
    if (!booking?.id) return;

    try {
      await cancelBooking(booking.id || "");
      setShowCancelConfirmation(false);
      onClose();
      onCancelSuccess?.();
    } catch {
      // Error is handled by the hook
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={showCancelConfirmation ? "Xác nhận hủy đặt sân" : "Chi tiết đặt sân"}
      subtitle={showCancelConfirmation ? "Vui lòng xác nhận" : "Thông tin"}
      icon={<Receipt className="h-5 w-5" />}
      maxWidth="2xl"
    >
      <div className="p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <Alert variant="error" title="Lỗi">
            {error}
          </Alert>
        )}

        {booking && !isLoading && !error && !showCancelConfirmation && (() => {
          const displayCode = booking.bookingCode || (booking.id)?.substring(0, 8).toUpperCase() || "Không xác định";
          const courtFee = booking.courtFee ?? booking.courtFee ?? 0;
          const serviceFee = booking.serviceFee ?? booking.serviceFee ?? 0;
          const loyaltyDiscount = booking.loyaltyDiscountAmount ?? booking.loyaltyDiscountAmount ?? 0;
          const promotionDiscount = booking.promotionDiscountAmount ?? booking.promotionDiscountAmount ?? 0;
          const finalTotal = booking.finalTotal ?? booking.finalTotal ?? 0;
          const paymentStatus = booking.paymentStatus ?? booking.paymentStatus;
          const services = booking.services ?? [];


          return (
            <div className="space-y-6">
              {/* Status & Code */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">
                    Mã đặt sân
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {displayCode}
                  </p>
                </div>
                <Badge
                  variant={getBookingStatusConfig(booking.status).variant}
                  size="md"
                  dot
                >
                  {getBookingStatusConfig(booking.status).label}
                </Badge>
              </div>

              <Divider />

              {/* Customer Info */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
                  Thông tin khách hàng
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted" />
                    <span className="font-semibold text-foreground">
                      {booking.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted" />
                    <span className="text-muted">{booking.customerPhone}</span>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Booking Info */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
                  Thông tin đặt sân
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted" />
                    <span className="font-semibold text-foreground">
                      {booking.branchName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarBlank className="h-4 w-4 text-muted" />
                    <span className="text-muted">{formatDate(booking.bookingDate)}</span>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Courts */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
                  Sân đã đặt
                </h3>

                <div className="space-y-3">
                  {booking.courts.map((court, index) => {
                    const courtHours = court.priceItems.reduce(
                      (sum, item) => sum + item.hours,
                      0
                    );

                    const courtPrice = court.priceItems.map(
                      (item) => item.unitPrice
                    ).reduce((sum, unitPrice) => sum + unitPrice, 0);

                    return (
                      <div
                        key={index}
                        className="rounded-lg border-2 border-border bg-surface-2 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-bold text-foreground">
                            {court.courtName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {formatTime(court.startTime)} - {formatTime(court.endTime)}
                            </span>

                            {courtHours > 0 && (
                              <span>({courtHours} giờ)</span>
                            )}
                          </div>

                          <span className="font-bold text-primary">
                            {formatCurrency(courtPrice)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Services */}
              {services.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
                      Dịch vụ
                    </h3>
                    <div className="space-y-2">
                      {services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg bg-surface-2 p-3 text-sm"
                        >
                          <div>
                            <span className="font-semibold text-foreground">
                              {service.serviceName}
                            </span>
                            <span className="ml-2 text-muted">x{service.quantity}</span>
                          </div>
                          <span className="font-bold text-foreground">
                            {formatCurrency(service.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Divider />

              {/* Invoice */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
                  Hóa đơn
                </h3>
                <div className="space-y-2 rounded-lg bg-surface-2 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Tiền sân</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(courtFee)}
                    </span>
                  </div>
                  {serviceFee > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Tiền dịch vụ</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(serviceFee)}
                      </span>
                    </div>
                  )}
                  {loyaltyDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Giảm giá thành viên</span>
                      <span className="font-semibold text-red-500">
                        -{formatCurrency(loyaltyDiscount)}
                      </span>
                    </div>
                  )}
                  {promotionDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5 text-muted" />
                        <span className="text-muted">Giảm giá khuyến mãi</span>
                      </div>
                      <span className="font-semibold text-red-500">
                        -{formatCurrency(promotionDiscount)}
                      </span>
                    </div>
                  )}
                  <Divider />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Tổng cộng</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Trạng thái thanh toán</span>
                    <Badge
                      variant={getPaymentStatusConfig(paymentStatus).variant}
                      size="sm"
                    >
                      {getPaymentStatusConfig(paymentStatus).label}
                    </Badge>
                  </div>
                </div>

                {/* Payment Pending Alert */}
                {paymentStatus === "UNPAID" && booking.status === "PENDING" && (
                  <Alert variant="warning" className="mt-3">
                    <div className="flex items-start gap-2">
                      <CreditCard className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          Chưa thanh toán
                        </p>
                        <p className="text-xs">
                          Vui lòng hoàn tất thanh toán để xác nhận đặt sân. Đơn đặt sân sẽ tự động hủy nếu không thanh toán trước {booking.expiresAt ? formatDateTime(booking.expiresAt) : "thời hạn"}.
                        </p>
                      </div>
                    </div>
                  </Alert>
                )}
              </div>

              {/* Note */}
              {booking.note && (
                <>
                  <Divider />
                  <div>
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted">
                      Ghi chú
                    </h3>
                    <p className="text-sm text-foreground">{booking.note}</p>
                  </div>
                </>
              )}

              {/* Timestamps & Pay Now Button */}
              <Divider />
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs text-muted">
                  {booking.createdAt && (
                    <p>Tạo lúc: {formatDateTime(booking.createdAt)}</p>
                  )}
                  {booking.expiresAt && (
                    <p>Hết hạn lúc: {formatDateTime(booking.expiresAt)}</p>
                  )}
                </div>

                {/* Pay Now Button - Inline with timestamps */}
                {paymentStatus === "UNPAID" && booking.status === "PENDING" && (
                  <Button
                    variant="primary"
                    onClick={handleRetryPayment}
                    disabled={isRetryingPayment}
                    isLoading={isRetryingPayment}
                    leftIcon={!isRetryingPayment ? <CreditCard className="h-4 w-4" /> : undefined}
                    className="shrink-0"
                  >
                    {isRetryingPayment ? "Đang xử lý..." : "Thanh toán ngay"}
                  </Button>
                )}
              </div>

              {/* Payment Error */}
              {paymentError && (
                <>
                  <Divider />
                  <Alert variant="error" title="Lỗi thanh toán">
                    {paymentError}
                  </Alert>
                </>
              )}

              {/* Cancel Button */}
              {canCancelBooking(booking.status) && (
                <>
                  <Divider />
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="danger"
                      onClick={handleCancelClick}
                      disabled={isCancelling || isRetryingPayment}
                      leftIcon={<X className="h-4 w-4" />}
                    >
                      Hủy đặt sân
                    </Button>
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* Cancel Confirmation View */}
        {booking && !isLoading && !error && showCancelConfirmation && (() => {
          const finalTotal = booking.finalTotal ?? booking.finalTotal ?? 0;
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

          return (
            <div className="space-y-6">
              {/* Warning Message */}
              <Alert variant="warning" title="Lưu ý">
                Bạn có chắc chắn muốn hủy đơn đặt sân này? Hành động này không thể hoàn tác.
              </Alert>

              {/* Booking Summary */}
              <div className="rounded-lg border-2 border-border bg-surface-2 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Receipt className="h-4 w-4 text-muted" />
                  <span className="font-bold text-foreground">
                    Mã đặt sân: {booking.bookingCode || (booking.id)?.substring(0, 8).toUpperCase()}
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
                    <Spinner size="sm" />
                    <span className="ml-2 text-sm text-muted">Đang tải chính sách hoàn tiền...</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-border bg-surface-2 p-4">
                  <h3 className="font-bold text-foreground mb-3">Thông tin hoàn tiền</h3>

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
                    <Alert variant="warning">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          Không được hoàn tiền theo chính sách hủy
                        </p>
                        <p className="text-xs">
                          Đơn đặt sân này không đủ điều kiện hoàn tiền do thời gian hủy quá gần giờ chơi.
                        </p>
                      </div>
                    </Alert>
                  )}
                </div>
              )}

              {/* Cancel Error */}
              {cancelError && (
                <Alert variant="error" title="Lỗi hủy đặt sân">
                  {cancelError}
                </Alert>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-border">
                <Button
                  variant="secondary"
                  onClick={handleCancelBack}
                  disabled={isCancelling || isPoliciesLoading}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Quay lại
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancelConfirm}
                  disabled={isCancelling || isPoliciesLoading}
                  isLoading={isCancelling}
                  leftIcon={!isCancelling ? <X className="h-4 w-4" /> : undefined}
                >
                  {isCancelling ? "Đang xử lý..." : "Xác nhận hủy"}
                </Button>
              </div>
            </div>
          );
        })()}
      </div>
    </Modal>
  );
}
