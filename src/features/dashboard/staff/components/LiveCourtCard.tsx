import { useEffect, useState } from "react";
import { LiveCourtAttentionDto } from "@/src/features/report/shared/report.types";
import { getAttentionStatusConfig, formatTimeRange, formatRelativeTime, formatCurrency, getCourtStatusVietnamese } from "../utils/dashboard-helpers";
import { User, Phone, Clock } from "@phosphor-icons/react";
import { differenceInMinutes } from "date-fns";

interface LiveCourtCardProps {
    court: LiveCourtAttentionDto;
    onClick?: () => void;
}

export function LiveCourtCard({ court, onClick }: LiveCourtCardProps) {
    const statusConfig = getAttentionStatusConfig(court.attentionStatus);
    const isAvailable = court.attentionStatus === 'AVAILABLE';
    const isPendingPayment = court.attentionStatus === 'PENDING_PAYMENT';
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const minutesSinceStart = court.startTime
        ? differenceInMinutes(now, new Date(court.startTime))
        : null;

    const minutesUntilStart = court.startTime
        ? differenceInMinutes(new Date(court.startTime), now)
        : null;

    return (
        <div
            onClick={onClick}
            className={`relative bg-white dark:bg-slate-800 border-2 rounded-2xl p-5 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''
                }`}
            style={{ borderColor: statusConfig.color }}
        >
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
                <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.color,
                    }}
                >
                    <span>{statusConfig.label}</span>
                </div>

                {/* Court Status */}
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {getCourtStatusVietnamese(court.courtStatus)}
                </span>
            </div>

            {/* Court Name */}
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3">
                {court.courtName}
            </h3>

            {/* Booking Details */}
            {!isAvailable && court.bookingCode && (
                <div className="space-y-2.5">
                    {/* Booking Code */}
                    <div className="text-xs font-bold text-primary">
                        {court.bookingCode}
                    </div>

                    {/* Customer Info */}
                    {court.customerName && (
                        <div className="flex items-center gap-2 text-sm">
                            <User size={16} weight="duotone" className="text-slate-400 flex-shrink-0" />
                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                                {court.customerName}
                            </span>
                        </div>
                    )}

                    {court.customerPhone && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone size={16} weight="duotone" className="text-slate-400 flex-shrink-0" />
                            <span className="font-medium text-slate-500 dark:text-slate-400">
                                {court.customerPhone}
                            </span>
                        </div>
                    )}

                    {/* Time Info */}
                    {court.startTime && court.endTime && (
                        <div className="flex items-center gap-2 text-sm">
                            <Clock size={16} weight="duotone" className="text-slate-400 flex-shrink-0" />
                            <span className="font-medium text-slate-600 dark:text-slate-400">
                                {formatTimeRange(court.startTime, court.endTime)}
                            </span>
                        </div>
                    )}

                    {/* Relative Time */}
                    {(minutesUntilStart !== null || minutesSinceStart !== null) && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {minutesUntilStart !== null && minutesUntilStart > 0
                                    ? formatRelativeTime(minutesUntilStart)
                                    : formatRelativeTime(
                                        minutesSinceStart !== null
                                            ? -minutesSinceStart
                                            : null
                                    )}
                            </span>
                        </div>
                    )}

                    {/* Amount Due (for pending payment) */}
                    {isPendingPayment && court.amountDue !== null && court.amountDue > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    Cần thu:
                                </span>
                                <span className="text-base font-extrabold text-red-600 dark:text-red-400">
                                    {formatCurrency(court.amountDue)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Available State */}
            {isAvailable && (
                <div className="text-center py-4">
                    <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                        Sẵn sàng cho khách hàng
                    </p>
                </div>
            )}
        </div>
    );
}
