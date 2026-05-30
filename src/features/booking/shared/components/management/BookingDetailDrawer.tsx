import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, SignIn, SignOut, XCircle, CheckCircle, User, Phone, Envelope, CurrencyDollar, CreditCard } from '@phosphor-icons/react';
import { Button, Badge } from '@/src/shared/components/ui';
import type { BookingDto } from '@/src/features/booking/shared/types/booking.types';
import {
  canCheckIn,
  canCheckout,
  canCancel,
  canConfirmRefund,
  canCompletePayment
} from '@/src/features/booking/shared/utils/bookingRules';
import {
  getBookingStatusLabel,
  getBookingStatusVariant,
  getPaymentStatusLabel,
  getPaymentStatusVariant,
  formatCurrency,
  formatTime
} from '../../utils/bookingStatus';
import { formatDate, formatDateTime } from '@/src/shared/utils/date';

interface BookingDetailDrawerProps {
  isOpen: boolean;
  booking: BookingDto | null;
  onClose: () => void;
  onCheckIn: (bookingId: string) => void;
  onCheckout: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onConfirmRefund: (bookingId: string) => void;
  onCompletePayment: (bookingId: string) => void;
}

export function BookingDetailDrawer({
  isOpen,
  booking,
  onClose,
  onCheckIn,
  onCheckout,
  onCancel,
  onConfirmRefund,
  onCompletePayment,
}: BookingDetailDrawerProps) {
  // Prevent SSR hydration mismatch issues in Next.js
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !booking || !mounted) return null;

  const bookingId = booking.id || booking.bookingId || booking.bookingCode || '';

  const checkInAllowed = canCheckIn(booking);
  const checkoutAllowed = canCheckout(booking);
  const cancelAllowed = canCancel(booking);
  const confirmRefundAllowed = canConfirmRefund(booking);
  const completePaymentAllowed = canCompletePayment(booking);

  // Render the drawer elements outside the animated tree into document.body
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-surface-2 shadow-2xl z-55 animate-slide-in-right overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-[#1B5E38] to-[#2A9D5C] px-6 py-5 flex items-center justify-between z-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">
              Chi tiết đơn
            </p>
            <h2 className="text-lg font-bold text-white">
              {booking.bookingCode || bookingId.substring(0, 8)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Info */}
          <section className="bg-surface-1 rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wide">
              Thông tin đơn đặt sân
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted mb-1">Mã đơn</p>
                <p className="text-sm font-bold text-foreground">
                  {booking.bookingCode || bookingId}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Chi nhánh</p>
                <p className="text-sm font-bold text-foreground">{booking.branchName}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Ngày</p>
                <p className="text-sm font-bold text-foreground">
                  {formatDate(booking.bookingDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Thời gian</p>
                <p className="text-sm font-bold text-foreground">
                  {booking.courts[0] && formatTime(booking.courts[0].startTime)} -{' '}
                  {booking.courts[0] && formatTime(booking.courts[0].endTime)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Trạng thái</p>
                <Badge variant={getBookingStatusVariant(booking.status)}>
                  {getBookingStatusLabel(booking.status)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Thanh toán</p>
                {booking.paymentStatus !== undefined && (
                  <Badge variant={getPaymentStatusVariant(booking.paymentStatus)}>
                    {getPaymentStatusLabel(booking.paymentStatus)}
                  </Badge>
                )}
              </div>
            </div>
            {booking.createdAt && (
              <div>
                <p className="text-xs text-muted mb-1">Thời điểm đặt</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDateTime(booking.createdAt)}
                </p>
              </div>
            )}
          </section>

          {/* Customer Info */}
          <section className="bg-surface-1 rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wide">
              Thông tin khách hàng
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted" />
                <span className="text-sm font-bold text-foreground">
                  {booking.customerName || booking.guestName || 'Guest'}
                </span>
              </div>
              {(booking.customerPhone || booking.guestPhone) && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted" />
                  <span className="text-sm font-medium text-foreground">
                    {booking.customerPhone || booking.guestPhone}
                  </span>
                </div>
              )}
              {(booking.customerEmail || booking.guestEmail) && (
                <div className="flex items-center gap-2">
                  <Envelope className="h-4 w-4 text-muted" />
                  <span className="text-sm font-medium text-foreground">
                    {booking.customerEmail || booking.guestEmail}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Courts */}
          <section className="bg-surface-1 rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wide">
              Sân
            </h3>
            <div className="space-y-2">
              {booking.courts.map((court, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-surface-2 rounded-lg p-3"
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">{court.courtName}</p>
                    {court.courtTypeName && (
                      <p className="text-xs text-muted">{court.courtTypeName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      {formatTime(court.startTime)} - {formatTime(court.endTime)}
                    </p>
                    {court.price !== undefined && (
                      <p className="text-xs text-muted">{formatCurrency(court.price)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Services */}
          {booking.services && booking.services.length > 0 && (
            <section className="bg-surface-1 rounded-xl p-4 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wide">
                Dịch vụ
              </h3>
              <div className="space-y-2">
                {booking.services.map((service, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-surface-2 rounded-lg p-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground">{service.serviceName}</p>
                      <p className="text-xs text-muted">Số lượng: {service.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {formatCurrency(service.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Financial Summary */}
          {booking.invoice && (
            <section className="bg-surface-1 rounded-xl p-4 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wide flex items-center gap-2">
                <CurrencyDollar className="h-4 w-4" />
                Tính tiền
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Tiền thuê sân</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(booking.invoice.courtFee)}
                  </span>
                </div>
                {booking.invoice.serviceFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Tiền dịch vụ</span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(booking.invoice.serviceFee)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Tạm tính</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(booking.invoice.subtotal)}
                  </span>
                </div>
                {booking.invoice.loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Giảm giá theo hạng thành viên</span>
                    <span className="font-bold">
                      -{formatCurrency(booking.invoice.loyaltyDiscount)}
                    </span>
                  </div>
                )}
                {booking.invoice.promotionDiscount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Giảm giá theo mã khuyến mãi</span>
                    <span className="font-bold">
                      -{formatCurrency(booking.invoice.promotionDiscount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-bold text-foreground">Tổng tiền</span>
                  <span className="text-lg font-extrabold text-primary">
                    {formatCurrency(booking.invoice.finalTotal)}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Note */}
          {booking.note && (
            <section className="bg-surface-1 rounded-xl p-4 space-y-2 shadow-xs">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wide">
                Ghi chú
              </h3>
              <p className="text-sm text-foreground">{booking.note}</p>
            </section>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {checkInAllowed && (
              <Button
                onClick={() => onCheckIn(bookingId)}
                className="flex-1"
              >
                <SignIn className="h-4 w-4" weight="bold" />
                Xác nhận đến
              </Button>
            )}
            {checkoutAllowed && (
              <Button
                onClick={() => onCheckout(bookingId)}
                className="flex-1"
              >
                <SignOut className="h-4 w-4" weight="bold" />
                Rời sân
              </Button>
            )}
            {cancelAllowed && (
              <Button
                variant="danger"
                onClick={() => onCancel(bookingId)}
                className="flex-1"
              >
                <XCircle className="h-4 w-4" weight="bold" />
                Hủy đơn
              </Button>
            )}
            {confirmRefundAllowed && (
              <Button
                variant="secondary"
                onClick={() => onConfirmRefund(bookingId)}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4" weight="bold" />
                Xác nhận hoàn tiền
              </Button>
            )}
            {completePaymentAllowed && (
              <Button
                variant="primary"
                onClick={() => onCompletePayment(bookingId)}
                className="flex-1"
              >
                <CreditCard className="h-4 w-4" weight="bold" />
                Hoàn tất thanh toán
              </Button>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}