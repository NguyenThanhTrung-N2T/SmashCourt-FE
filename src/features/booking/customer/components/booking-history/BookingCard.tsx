/**
 * BookingCard Component
 * 
 * Displays a booking summary card in the booking history list.
 */
"use client"
import { useState, useEffect } from "react";
import { CalendarBlank, MapPin, Receipt, CreditCard, Circle } from "@phosphor-icons/react";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Button } from "@/src/shared/components/ui/Button";
import type { BookingDto } from "../../../shared/types/booking.types";
import {
  getBookingStatusConfig,
  formatCurrency,
  formatDate,
  formatTime,
} from "../../utils/bookingStatus";
import { parseBackendDateVN } from "@/src/shared/utils/date";
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

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!booking.expiresAt) return;
    const targetDate = parseBackendDateVN(booking.expiresAt);
    if (!targetDate) return;

    const interval = setInterval(() => {
      setIsExpired(Date.now() >= targetDate.getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [booking.expiresAt]);

  // Check if payment is pending (UNPAID) and booking is PENDING before expiration
  const isPendingPayment =
    paymentStatus === 'UNPAID' &&
    booking.status === 'PENDING' &&
    !isExpired;

  return (
    <div className="flex h-full flex-col rounded-xl border-2 border-border bg-surface-1 p-4 shadow-sm transition-all hover:shadow-md">
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
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            Sân đã đặt
          </p>

          <span className="text-sm font-bold text-muted">
            ({formatTime(booking.courts[0]?.startTime)} - {formatTime(booking.courts[0]?.endTime)})
          </span>
        </div>
        <div className="space-y-1.5">
          {booking.courts.map((court, index) => {
            const courtTotal = getCourtTotal(court);

            return (
              <div key={`${court.courtId || court.courtName}-${index}`} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Circle className="h-3.5 w-3.5 text-muted" />
                  <span className="font-semibold text-foreground">
                    {court.courtName}
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

      {/* Stick to the bottom */}
      <div className="mt-auto">
        {/* Total & Deposit Breakdown */}
        <div className="mb-3 border-t-2 border-border pt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted" />
              <span className="text-sm font-bold text-muted">Tổng tiền</span>
            </div>
            <span className="text-lg font-bold text-primary">
              {finalTotal !== undefined ? formatCurrency(finalTotal) : "N/A"}
            </span>
          </div>

          {booking.depositAmount !== null && booking.depositAmount > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">
                {booking.paymentStatus === "UNPAID" ? "Cọc phải trả:" : "Đã cọc:"}
              </span>
              <span className="font-semibold text-foreground">
                {formatCurrency(booking.depositAmount)}
              </span>
            </div>
          )}

          {booking.remainingAmount !== null && booking.remainingAmount > 0 && booking.paymentStatus !== "UNPAID" && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Thu tại quầy:</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(booking.remainingAmount)}
              </span>
            </div>
          )}
        </div>

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
              Thanh toán cọc
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
    </div>
  );
}
