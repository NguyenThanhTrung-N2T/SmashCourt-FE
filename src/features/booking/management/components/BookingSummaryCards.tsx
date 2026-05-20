/**
 * Booking Summary Cards
 * 
 * Dashboard-style summary cards for booking metrics.
 * Redesigned to match the modern owner dashboard style.
 */

import { CalendarCheck, Clock, CheckCircle, CurrencyDollar, ArrowCounterClockwise } from '@phosphor-icons/react';
import type { BookingDashboardSummaryDto } from '../../shared/types/booking.types';
import { formatCurrency } from '../utils/bookingStatus';

interface BookingSummaryCardsProps {
  summary: BookingDashboardSummaryDto | null;
  loading?: boolean;
}

export function BookingSummaryCards({ summary, loading }: BookingSummaryCardsProps) {
  const cards = [
    {
      label: 'Đơn đặt sân hôm nay',
      value: summary?.todayBookings ?? 0,
      sub: 'Đơn đặt sân hôm nay',
      icon: CalendarCheck,
      isPrimary: true,
    },
    {
      label: 'Đang chơi',
      value: summary?.activeBookings ?? 0,
      sub: 'Đang chơi',
      icon: Clock,
    },
    {
      label: 'Hoàn thành',
      value: summary?.completedBookings ?? 0,
      sub: 'Hoàn thành',
      icon: CheckCircle,
    },
    {
      label: 'Doanh thu',
      value: summary ? formatCurrency(summary.todayRevenue) : formatCurrency(0),
      sub: "Doanh thu",
      icon: CurrencyDollar,
      isAmount: true,
    },
    {
      label: 'Chờ hoàn tiền',
      value: summary?.pendingRefunds ?? 0,
      sub: 'Chờ hoàn tiền',
      icon: ArrowCounterClockwise,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse"
          >
            <div className="h-7 w-7 bg-slate-200 dark:bg-slate-700 rounded-full mb-3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-3" />
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-4" />
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`relative rounded-2xl p-6 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden ${card.isPrimary
                ? "text-white"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              }`}
            style={
              card.isPrimary
                ? { background: "linear-gradient(145deg, #2D7A50 0%, #1B5E38 100%)" }
                : {}
            }
          >
            <div className="flex items-start justify-between">
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${card.isPrimary ? "text-green-200" : "text-slate-500 dark:text-slate-400"
                  }`}
              >
                {card.label}
              </p>
              {/* Arrow circle */}
              <button
                className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${card.isPrimary
                    ? "border-white/30 text-white hover:bg-white/10"
                    : "border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <p
              className={`mt-3 text-4xl font-extrabold tracking-tight leading-none ${card.isPrimary ? "text-white" : "text-slate-900 dark:text-white"
                } ${card.isAmount ? 'text-2xl' : ''}`}
            >
              {card.value}
            </p>

            <div className="mt-4 flex items-center gap-1.5">
              <span
                className={`text-[11px] font-medium ${card.isPrimary ? "text-green-200/90" : "text-slate-400 dark:text-slate-500"
                  }`}
              >
                {card.sub}
              </span>
            </div>

            {/* Background icon watermark */}
            {card.isPrimary && (
              <Icon className="absolute right-4 bottom-4 h-16 w-16 text-white/10" weight="bold" />
            )}
          </div>
        );
      })}
    </div>
  );
}
