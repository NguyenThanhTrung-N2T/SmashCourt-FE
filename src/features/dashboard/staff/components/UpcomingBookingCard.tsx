import React from "react";
import { UpcomingBookingDashboardItemDto } from "@/src/features/report/shared/report.types";
import { formatTimeRange, formatCurrency, getBookingStatusConfig, getPaymentStatusConfig } from "../utils/dashboard-helpers";
import { User, Phone, CourtBasketball, Clock } from "@phosphor-icons/react";
import { Badge } from "@/src/shared/components/ui/Badge";

interface UpcomingBookingCardProps {
    booking: UpcomingBookingDashboardItemDto;
    onClick?: () => void;
}

export function UpcomingBookingCard({ booking, onClick }: UpcomingBookingCardProps) {
    const bookingStatus = getBookingStatusConfig(booking.bookingStatus);
    const paymentStatus = getPaymentStatusConfig(booking.paymentStatus);

    return (
        <div
            onClick={onClick}
            className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-all duration-200 ${
                onClick ? 'cursor-pointer hover:shadow-md hover:border-primary' : ''
            }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="text-sm font-extrabold text-primary">
                        {booking.bookingCode}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant={bookingStatus.variant} size="sm">
                            {bookingStatus.label}
                        </Badge>
                        <Badge variant={paymentStatus.variant} size="sm">
                            {paymentStatus.label}
                        </Badge>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(booking.finalTotal)}
                    </p>
                </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                    <User size={16} weight="duotone" className="text-slate-400 flex-shrink-0" />
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                        {booking.customerName}
                    </span>
                </div>

                {booking.customerPhone && (
                    <div className="flex items-center gap-2 text-sm">
                        <Phone size={16} weight="duotone" className="text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-500 dark:text-slate-400">
                            {booking.customerPhone}
                        </span>
                    </div>
                )}
            </div>

            {/* Courts */}
            {booking.courts.length > 0 && (
                <div className="mb-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-start gap-2">
                        <CourtBasketball size={16} weight="duotone" className="text-slate-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-1.5">
                                {booking.courts.map((court, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded"
                                    >
                                        {court.courtName}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Time */}
            <div className="flex items-center gap-2 text-sm">
                <Clock size={16} weight="duotone" className="text-slate-400 flex-shrink-0" />
                <span className="font-bold text-slate-600 dark:text-slate-400">
                    {formatTimeRange(booking.startTime, booking.endTime)}
                </span>
            </div>
        </div>
    );
}
