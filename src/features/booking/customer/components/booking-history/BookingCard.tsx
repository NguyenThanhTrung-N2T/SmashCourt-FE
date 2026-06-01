/**
 * BookingCard Component
 * 
 * Displays a booking summary card in the booking history list.
 */
"use client"
import { CalendarBlank, Clock, MapPin, Receipt, CreditCard } from "@phosphor-icons/react";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Button } from "@/src/shared/components/ui/Button";
import type { BookingDto } from "../../../shared/types/booking.types";
import {
  getBookingStatusConfig,
  formatCurrency,
  formatDate,
  formatTime,
} from "../../utils/bookingStatus";
import { getCourtTotal } from "../../../shared/utils/bookingStatus";

interface BookingCardProps {
  booking: BookingDto;
  onViewDetail: (bookingId: string) => void;
  onPayNow?: (bookingId: string) => void;
}

export function BookingCard({ booking, onViewDetail, onPayNow }: BookingCardProps) {
  const statusConfig = getBookingStatusConfig(booking.status);
  const displayCode = booking.bookingCode || (booking.id)?.substring(0, 8).toUpperCase() || "Không xác định";
  const finalTotal = booking.finalTotal ?? booking.finalTotal;
  const paymentStatus = booking.paymentStatus;

  // Check if payment is pending (UNPAID = 0) and booking is pending
  const isPendingPayment =
    paymentStatus === 'UNPAID' &&
    booking.status === 'PENDING';

  return (
    <div className="rounded-xl border-2 border-border bg-surface-1 p-4 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            Mã đặt sân
          </p>
          <p className="text-lg font-bold text-foreground">{displayCode}</p>
        </div>
        <Badge variant={statusConfig.variant} dot={statusConfig.dot}>
          {statusConfig.label}
        </Badge>
      </div>

      {/* Branch & Date */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted" />
          <span className="font-semibold text-foreground">{booking.branchName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CalendarBlank className="h-4 w-4 text-muted" />
          <span className="text-muted">{formatDate(booking.bookingDate)}</span>
        </div>
      </div>

      {/* Courts */}
      <div className="mb-3 rounded-lg bg-surface-2 p-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
          Sân đã đặt
        </p>
        <div className="space-y-1.5">
          {booking.courts.map((court, index) => {
            const courtTotal = getCourtTotal(court);

            return (
            <div key={`${court.courtId || court.courtName}-${index}`} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted" />
                <span className="font-semibold text-foreground">
                  {court.courtName}
                </span>
                <span className="text-muted">
                  ({formatTime(court.startTime)} - {formatTime(court.endTime)})
                </span>
              </div>
              {courtTotal > 0 && (
                <span className="font-bold text-primary">
                  {formatCurrency(courtTotal)}
                </span>
              )}
            </div>
            );
          })}
        </div>
      </div>

      {/* Total */}
      <div className="mb-3 flex items-center justify-between border-t-2 border-border pt-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-muted" />
          <span className="text-sm font-bold text-muted">Tổng tiền</span>
        </div>
        <span className="text-lg font-bold text-primary">
          {finalTotal !== undefined ? formatCurrency(finalTotal) : "N/A"}
        </span>
      </div>

      {/* Refund Amount - Show only for cancelled bookings with refund
      {booking.refundAmount !== null && booking.refundAmount !== undefined && 
       (booking.status === 'CANCELLED_REFUNDED' || booking.status === 'CANCELLED_PENDING_REFUND') && (
        <div className={`mb-3 rounded-lg p-3 ${
          booking.status === 'CANCELLED_REFUNDED' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-orange-50 border border-orange-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold ${
              booking.status === 'CANCELLED_REFUNDED' 
                ? 'text-green-800' 
                : 'text-orange-800'
            }`}>
              {booking.status === 'CANCELLED_REFUNDED' ? 'Đã hoàn tiền' : 'Chờ hoàn tiền'}
            </span>
            <span className={`text-lg font-bold ${
              booking.status === 'CANCELLED_REFUNDED' 
                ? 'text-green-600' 
                : 'text-orange-600'
            }`}>
              {formatCurrency(booking.refundAmount)}
            </span>
          </div>
        </div>
      )} */}

      {/* Actions */}
      <div className="flex gap-2">
        {isPendingPayment && onPayNow && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onPayNow(booking.id || "")}
            leftIcon={<CreditCard className="h-4 w-4" />}
          >
            Thanh toán
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          className={isPendingPayment ? "flex-1" : "w-full"}
          onClick={() => onViewDetail(booking.id || "")}
        >
          Xem chi tiết
        </Button>
      </div>
    </div>
  );
}
