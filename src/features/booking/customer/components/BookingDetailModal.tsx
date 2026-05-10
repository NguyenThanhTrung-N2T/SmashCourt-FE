/**
 * BookingDetailModal Component
 * 
 * Modal displaying detailed booking information.
 */

import { Receipt, CalendarBlank, MapPin, User, Phone, Clock, Tag } from "@phosphor-icons/react";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Spinner } from "@/src/shared/components/feedback/Spinner";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Divider } from "@/src/shared/components/layout/Divider";
import type { BookingDto } from "../../types/booking.types";
import {
  getBookingStatusConfig,
  getPaymentStatusConfig,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
} from "../utils/bookingStatus";

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDto | null;
  isLoading: boolean;
  error: string | null;
}

export function BookingDetailModal({
  isOpen,
  onClose,
  booking,
  isLoading,
  error,
}: BookingDetailModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết đặt sân"
      subtitle="Thông tin"
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

        {booking && !isLoading && !error && (() => {
          const displayCode = booking.bookingCode || (booking.id || booking.bookingId)?.substring(0, 8).toUpperCase() || "Không xác định";
          const courtFee = booking.courtFee ?? booking.invoice?.courtFee ?? 0;
          const serviceFee = booking.serviceFee ?? booking.invoice?.serviceFee ?? 0;
          const loyaltyDiscount = booking.loyaltyDiscountAmount ?? booking.invoice?.loyaltyDiscount ?? 0;
          const promotionDiscount = booking.promotionDiscountAmount ?? booking.invoice?.promotionDiscount ?? 0;
          const finalTotal = booking.finalTotal ?? booking.invoice?.finalTotal ?? 0;
          const paymentStatus = booking.paymentStatus ?? booking.invoice?.paymentStatus;

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
                {booking.courts.map((court, index) => (
                  <div
                    key={index}
                    className="rounded-lg border-2 border-border bg-surface-2 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        {court.courtName}
                      </span>
                      {court.courtTypeName && (
                        <Badge variant="info" size="sm">
                          {court.courtTypeName}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {formatTime(court.startTime)} - {formatTime(court.endTime)}
                        </span>
                        {court.duration && <span>({court.duration} phút)</span>}
                      </div>
                      {court.price !== undefined && (
                        <span className="font-bold text-primary">
                          {formatCurrency(court.price)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            {booking.services.length > 0 && (
              <>
                <Divider />
                <div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
                    Dịch vụ
                  </h3>
                  <div className="space-y-2">
                    {booking.services.map((service, index) => (
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
                          {formatCurrency(service.totalPrice)}
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

            {/* Timestamps */}
            <Divider />
            <div className="text-xs text-muted">
              <p>Tạo lúc: {formatDateTime(booking.createdAt)}</p>
              {booking.expiresAt && (
                <p>Hết hạn lúc: {formatDateTime(booking.expiresAt)}</p>
              )}
            </div>
          </div>
          );
        })()}
      </div>
    </Modal>
  );
}
