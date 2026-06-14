/**
 * Booking Schedule View
 * 
 * Timeline-based schedule view showing court occupancy.
 */

import { CalendarBlank, Buildings } from '@phosphor-icons/react';
import { Button } from '@/src/shared/components/ui/Button';
import { Skeleton } from '@/src/shared/components/feedback/Skeleton';
import { EmptyState } from '@/src/shared/components/layout';
import type { BookingScheduleCourtDto, BookingScheduleItemDto } from '../../types/booking.types';
import { BookingStatus } from '../../types/booking.types';
import { formatTime, toBookingStatusValue, type BookingStatusInput } from '../../utils/bookingStatus';

interface BookingScheduleViewProps {
  schedule: BookingScheduleCourtDto[];
  loading: boolean;
  onBookingClick: (bookingId: string) => void;
  hasBranch: boolean;
}

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

function getStatusColor(status: BookingStatusInput): string {
  const statusValue = toBookingStatusValue(status);
  switch (statusValue) {
    case BookingStatus.PENDING:
      return 'bg-amber-500 hover:bg-amber-600 border-amber-600';

    case BookingStatus.CONFIRMED:
      return 'bg-blue-500 hover:bg-blue-600 border-blue-600';

    case BookingStatus.PAID_ONLINE:
      return 'bg-sky-500 hover:bg-sky-600 border-sky-600';

    case BookingStatus.IN_PROGRESS:
      return 'bg-indigo-500 hover:bg-indigo-600 border-indigo-600';

    case BookingStatus.PENDING_PAYMENT:
      return 'bg-orange-500 hover:bg-orange-600 border-orange-600';

    case BookingStatus.COMPLETED:
      return 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600';

    case BookingStatus.CANCELLED:
      return 'bg-red-500 hover:bg-red-600 border-red-600';

    case BookingStatus.CANCELLED_PENDING_REFUND:
      return 'bg-rose-500 hover:bg-rose-600 border-rose-600';

    case BookingStatus.CANCELLED_REFUNDED:
      return 'bg-pink-500 hover:bg-pink-600 border-pink-600';

    case BookingStatus.NO_SHOW:
      return 'bg-slate-500 hover:bg-slate-600 border-slate-600';

    default:
      return 'bg-gray-500 hover:bg-gray-600 border-gray-600';
  }
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function calculatePosition(startTime: string, endTime: string) {
  const dayStart = timeToMinutes('06:00');
  const dayEnd = timeToMinutes('23:59');
  const totalMinutes = dayEnd - dayStart;

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  const left = ((start - dayStart) / totalMinutes) * 100;
  const width = ((end - start) / totalMinutes) * 100;

  return { left: `${left}%`, width: `${width}%` };
}

export function BookingScheduleView({
  schedule,
  loading,
  onBookingClick,
  hasBranch,
}: BookingScheduleViewProps) {

  // Show message if no branch is selected
  if (!hasBranch) {
    return (
      <EmptyState
        icon={<Buildings className="h-12 w-12 text-muted" />}
        title="Không có chi nhánh nào được chọn"
        description="Chọn 1 chi nhánh để thấy lịch đặt sân"
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (schedule.length === 0) {
    return (
      <EmptyState
        icon={<CalendarBlank className="h-12 w-12 text-muted" />}
        title="Không có sân"
        description="Không có lịch cho sân vào ngày được chọn"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Schedule Grid */}
      <div className="bg-surface-1 border border-border rounded-xl overflow-hidden">
        {/* Time Header */}
        <div className="flex border-b border-border bg-surface-2">
          <div className="w-32 shrink-0 px-4 py-3 font-bold text-xs text-muted uppercase">
            Sân
          </div>
          <div className="flex-1 relative h-10">
            {TIME_SLOTS.map((time, idx) => (
              <div
                key={time}
                className="absolute top-0 bottom-0 border-l border-border"
                style={{ left: `${(idx / TIME_SLOTS.length) * 100}%` }}
              >
                <span className="text-xs font-medium text-muted ml-2">
                  {time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Court Rows */}
        <div className="divide-y divide-border">
          {schedule.map((court) => (
            <div key={court.courtId} className="flex hover:bg-surface-2 transition-colors">
              <div className="w-32 shrink-0 px-4 py-4 font-bold text-sm text-foreground">
                {court.courtName}
              </div>
              <div className="flex-1 relative h-16 border-l border-border">
                {/* Time Grid Lines */}
                {TIME_SLOTS.map((_, idx) => (
                  <div
                    key={idx}
                    className="absolute top-0 bottom-0 border-l border-border/50"
                    style={{ left: `${(idx / TIME_SLOTS.length) * 100}%` }}
                  />
                ))}

                {/* Booking Blocks */}
                {court.bookings.map((booking, idx) => {
                  const position = calculatePosition(booking.startTime, booking.endTime);
                  return (
                    <div
                      key={idx}
                      className={`absolute top-2 bottom-2 rounded-lg border-2 ${getStatusColor(booking.status)} text-white text-xs font-bold flex items-center justify-center cursor-pointer transition-all shadow-sm`}
                      style={position}
                      onClick={() => onBookingClick(booking.bookingId)}
                      title={`${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
                    >
                      <span className="px-2 truncate">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Status Legend */}
      <div className="flex flex-wrap gap-4 justify-center bg-surface-1 border border-border rounded-xl p-4">

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500 border-2 border-amber-600" />
          <span className="text-xs font-medium text-muted">
            Chờ xác nhận
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500 border-2 border-blue-600" />
          <span className="text-xs font-medium text-muted">
            Đã xác nhận
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-sky-500 border-2 border-sky-600" />
          <span className="text-xs font-medium text-muted">
            Đã thanh toán online
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-indigo-500 border-2 border-indigo-600" />
          <span className="text-xs font-medium text-muted">
            Đang diễn ra
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500 border-2 border-orange-600" />
          <span className="text-xs font-medium text-muted">
            Chờ thanh toán
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500 border-2 border-emerald-600" />
          <span className="text-xs font-medium text-muted">
            Hoàn thành
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500 border-2 border-red-600" />
          <span className="text-xs font-medium text-muted">
            Đã hủy
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-500 border-2 border-rose-600" />
          <span className="text-xs font-medium text-muted">
            Chờ hoàn tiền
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-pink-500 border-2 border-pink-600" />
          <span className="text-xs font-medium text-muted">
            Đã hoàn tiền
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-500 border-2 border-slate-600" />
          <span className="text-xs font-medium text-muted">
            Không đến
          </span>
        </div>

      </div>
    </div>
  );
}
