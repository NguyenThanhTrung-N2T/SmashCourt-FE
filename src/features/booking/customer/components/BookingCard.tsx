/**
 * BookingCard Component
 * 
 * Displays a booking summary card in the booking history list.
 */

import { CalendarBlank, Clock, MapPin, Receipt } from "@phosphor-icons/react";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Button } from "@/src/shared/components/ui/Button";
import type { BookingDto } from "../../types/booking.types";
import {
  getBookingStatusConfig,
  formatCurrency,
  formatDate,
  formatTime,
} from "../utils/bookingStatus";

interface BookingCardProps {
  booking: BookingDto;
  onViewDetail: (bookingId: string) => void;
}

export function BookingCard({ booking, onViewDetail }: BookingCardProps) {
  const statusConfig = getBookingStatusConfig(booking.status);
  const displayCode = booking.bookingCode || (booking.id || booking.bookingId)?.substring(0, 8).toUpperCase() || "Không xác định";
  const finalTotal = booking.finalTotal ?? booking.invoice?.finalTotal;

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
          {booking.courts.map((court, index) => (
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
              {court.price !== undefined && (
                <span className="font-bold text-primary">
                  {formatCurrency(court.price)}
                </span>
              )}
            </div>
          ))}
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

      {/* Actions */}
      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={() => onViewDetail(booking.id || booking.bookingId || "")}
      >
        Xem chi tiết
      </Button>
    </div>
  );
}
