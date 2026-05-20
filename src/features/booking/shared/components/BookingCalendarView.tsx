/**
 * Booking Calendar Heatmap View
 * 
 * GitHub-style calendar heatmap for booking analytics.
 */

import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Button } from '@/src/shared/components/ui/Button';
import { Skeleton } from '@/src/shared/components/feedback/Skeleton';
import type { BookingCalendarHeatmapDto } from '../types/booking.types';
import { formatCurrency } from '../utils/bookingStatus';

interface BookingCalendarViewProps {
  heatmapData: BookingCalendarHeatmapDto[];
  loading: boolean;
  selectedYear: number;
  selectedMonth: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (date: string) => void;
}

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function getHeatmapColor(occupancyRate: number): string {
  if (occupancyRate === 0) return 'bg-surface-2 border-border';
  if (occupancyRate <= 20) return 'bg-[#d9f99d] border-[#d9f99d]';
  if (occupancyRate <= 40) return 'bg-[#86efac] border-[#86efac]';
  if (occupancyRate <= 60) return 'bg-[#4ade80] border-[#4ade80]';
  if (occupancyRate <= 80) return 'bg-[#22c55e] border-[#22c55e]';
  return 'bg-[#15803d] border-[#15803d]';
}

export function BookingCalendarView({
  heatmapData,
  loading,
  selectedYear,
  selectedMonth,
  onPreviousMonth,
  onNextMonth,
  onDayClick,
}: BookingCalendarViewProps) {
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);

  // Create calendar grid
  const calendarDays: (BookingCalendarHeatmapDto | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = heatmapData.find((d) => d.date === dateStr);
    calendarDays.push(dayData || {
      date: dateStr,
      bookingCount: 0,
      occupancyRate: 0,
      revenue: 0,
    });
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-surface-1 border border-border rounded-xl p-4">
        <Button variant="ghost" size="sm" onClick={onPreviousMonth}>
          <CaretLeft className="h-5 w-5" weight="bold" />
        </Button>
        <h3 className="text-lg font-bold text-foreground">
          {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
        </h3>
        <Button variant="ghost" size="sm" onClick={onNextMonth}>
          <CaretRight className="h-5 w-5" weight="bold" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-surface-1 border border-border rounded-xl p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-muted uppercase py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const dayNumber = new Date(day.date).getDate();
            const isToday = day.date === new Date().toISOString().split('T')[0];

            return (
              <button
                key={day.date}
                onClick={() => onDayClick(day.date)}
                className={`
                  aspect-square rounded-lg border-2 transition-all hover:scale-105 hover:shadow-md
                  ${getHeatmapColor(day.occupancyRate)}
                  ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                  group relative
                `}
                title={`${day.date}\nBookings: ${day.bookingCount}\nOccupancy: ${day.occupancyRate.toFixed(1)}%\nRevenue: ${formatCurrency(day.revenue)}`}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-sm font-bold text-foreground">
                    {dayNumber}
                  </span>
                  {day.bookingCount > 0 && (
                    <span className="text-[10px] font-bold text-muted">
                      {day.bookingCount}
                    </span>
                  )}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-surface-inverse text-inverse px-3 py-2 rounded-lg shadow-lg text-xs whitespace-nowrap">
                    <div className="font-bold">{day.date}</div>
                    <div>Đơn: {day.bookingCount}</div>
                    <div>Lắp đầy: {day.occupancyRate.toFixed(1)}%</div>
                    <div>Doanh thu: {formatCurrency(day.revenue)}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-surface-1 border border-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-muted">Tỉ lệ lắp đầy</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">0%</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-surface-2 border border-border" />
              <div className="w-4 h-4 rounded bg-[#d9f99d]" />
              <div className="w-4 h-4 rounded bg-[#86efac]" />
              <div className="w-4 h-4 rounded bg-[#4ade80]" />
              <div className="w-4 h-4 rounded bg-[#22c55e]" />
              <div className="w-4 h-4 rounded bg-[#15803d]" />
            </div>
            <span className="text-xs text-muted">100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
