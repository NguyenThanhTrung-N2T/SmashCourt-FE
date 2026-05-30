/**
 * Booking Filter Toolbar
 * 
 * Dynamic filter controls that adapt based on the active view.
 * - Table view: Search, date presets, status, payment filters
 * - Schedule view: Date navigation only (branch selector shown separately)
 * - Calendar view: Month/year navigation only (branch selector shown separately)
 */

import { useState, useEffect } from 'react';
import { CalendarBlank, CaretLeft, CaretRight, X, ArrowCounterClockwise } from '@phosphor-icons/react';
import { Select, Button, Input } from '@/src/shared/components/ui';
import { BookingStatus, InvoicePaymentStatus } from '../../types/booking.types';
import type { BookingTableFilters } from '@/src/features/booking/shared/types/filter.types';

type ViewMode = 'table' | 'schedule' | 'calendar';

interface BookingFilterToolbarProps {
  viewMode: ViewMode;

  // Table view props
  tableFilters?: BookingTableFilters;
  onTableFilterChange?: (filters: Partial<BookingTableFilters>) => void;
  onCreateWalkIn?: () => void;

  // Schedule view props
  scheduleDate?: string;
  onScheduleDateChange?: (date: string) => void;
  onSchedulePreviousDay?: () => void;
  onScheduleNextDay?: () => void;

  // Calendar view props
  calendarYear?: number;
  calendarMonth?: number;
  onCalendarPreviousMonth?: () => void;
  onCalendarNextMonth?: () => void;

  // Shared props
  branches?: Array<{ id: string; name: string }>;
  courts?: Array<{ id: string; name: string }>;
}

const DATE_PRESETS = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Ngày mai', value: 'tomorrow' },
  { label: 'Tuần này', value: 'week' },
  { label: 'Tháng này', value: 'month' },
  { label: 'Tất cả', value: 'all' },
];

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export function BookingFilterToolbar({
  viewMode,
  tableFilters,
  onTableFilterChange,
  onCreateWalkIn,
  scheduleDate,
  onScheduleDateChange,
  onSchedulePreviousDay,
  onScheduleNextDay,
  calendarYear,
  calendarMonth,
  onCalendarPreviousMonth,
  onCalendarNextMonth,
  courts = [],
}: BookingFilterToolbarProps) {
  const [searchTerm, setSearchTerm] = useState(tableFilters?.customerKeyword || '');
  const [datePreset, setDatePreset] = useState('today');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debounce search (table view only)
  useEffect(() => {
    if (viewMode !== 'table' || !tableFilters || !onTableFilterChange) return;

    const timeoutId = setTimeout(() => {
      if (searchTerm !== tableFilters.customerKeyword) {
        onTableFilterChange({ customerKeyword: searchTerm || undefined });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, tableFilters?.customerKeyword, onTableFilterChange, viewMode]);

  const handleDatePresetChange = (preset: string) => {
    if (!onTableFilterChange) return;

    setDatePreset(preset);
    const today = new Date();

    switch (preset) {
      case 'today':
        onTableFilterChange({
          date: today.toISOString().split('T')[0],
          fromDate: undefined,
          toDate: undefined,
        });
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        onTableFilterChange({
          date: tomorrow.toISOString().split('T')[0],
          fromDate: undefined,
          toDate: undefined,
        });
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        onTableFilterChange({
          date: undefined,
          fromDate: weekStart.toISOString().split('T')[0],
          toDate: weekEnd.toISOString().split('T')[0],
        });
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        onTableFilterChange({
          date: undefined,
          fromDate: monthStart.toISOString().split('T')[0],
          toDate: monthEnd.toISOString().split('T')[0],
        });
        break;
      case 'all':
        onTableFilterChange({
          date: undefined,
          fromDate: undefined,
          toDate: undefined,
        });
        break;
    }
  };

  const formatScheduleDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ============================================================================
  // TABLE VIEW FILTERS
  // ============================================================================

  if (viewMode === 'table') {
    if (!tableFilters || !onTableFilterChange) return null;

    return (
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 sticky top-0 z-10 shadow-sm space-y-3">
        {/* Primary Filters Row */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 min-w-50">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                type="text"
                placeholder="Tìm kiếm bằng mã khách hàng, tên, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Date Preset */}
          <div className="w-full lg:w-40">
            <Select
              value={datePreset}
              onChange={handleDatePresetChange}
            >
              {DATE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-40">
            <Select
              value={tableFilters.status?.toString() || ''}
              onChange={(value) => onTableFilterChange({ status: value || undefined })}
            >
              <option value="">Tất cả</option>
              <option value={BookingStatus.PENDING}>Đặt online, chưa thanh toán</option>
              <option value={BookingStatus.PAID_ONLINE}>Đã thanh toán online</option>
              <option value={BookingStatus.CONFIRMED}>Đặt tại quầy, chưa thanh toán</option>
              <option value={BookingStatus.IN_PROGRESS}>Đang chơi</option>
              <option value={BookingStatus.PENDING_PAYMENT}>Chờ checkout</option>
              <option value={BookingStatus.COMPLETED}>Đã hoàn thành</option>
              <option value={BookingStatus.CANCELLED}>Đã hủy</option>
              <option value={BookingStatus.CANCELLED_PENDING_REFUND}>Chờ hoàn tiền</option>
              <option value={BookingStatus.CANCELLED_REFUNDED}>Đã hoàn tiền</option>
              <option value={BookingStatus.NO_SHOW}>Không đến</option>
            </Select>
          </div>

          {/* Payment Status Filter */}
          <div className="w-full lg:w-40">
            <Select
              value={tableFilters.paymentStatus?.toString() || ''}
              onChange={(value) => onTableFilterChange({ paymentStatus: value || undefined })}
            >
              <option value="">Tất cả</option>
              <option value={InvoicePaymentStatus.UNPAID}>Chưa thanh toán</option>
              <option value={InvoicePaymentStatus.PARTIALLY_PAID}>Thanh toán 1 phần</option>
              <option value={InvoicePaymentStatus.PAID}>Đã thanh toán</option>
              <option value={InvoicePaymentStatus.REFUNDED}>Đã hoàn tiền</option>
            </Select>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="whitespace-nowrap"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showAdvancedFilters ? (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </Button>
        </div>

        {/* Advanced Filters (Collapsible) */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Court Filter */}
              <div className="w-full lg:w-48">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Sân
                </label>
                <Select
                  value={tableFilters.courtId || ''}
                  onChange={(value) => onTableFilterChange({ courtId: value || undefined })}
                >
                  <option value="">Tất cả các sân</option>
                  {courts.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Date Range - From */}
              <div className="w-full lg:w-48">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Từ ngày
                </label>

                <Input
                  type="date"
                  value={tableFilters.fromDate || ''}
                  max={tableFilters.toDate || undefined}
                  onChange={(e) => {
                    const newFromDate = e.target.value || undefined;

                    onTableFilterChange({
                      fromDate: newFromDate,
                      date: undefined,
                      // Reset toDate if invalid
                      toDate:
                        tableFilters.toDate &&
                          newFromDate &&
                          tableFilters.toDate < newFromDate
                          ? undefined
                          : tableFilters.toDate,
                    });
                  }}
                />
              </div>

              {/* Date Range - To */}
              <div className="w-full lg:w-48">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Đến ngày
                </label>

                <Input
                  type="date"
                  value={tableFilters.toDate || ''}
                  min={tableFilters.fromDate || undefined}
                  onChange={(e) => {
                    const newToDate = e.target.value || undefined;

                    // Prevent invalid range
                    if (
                      tableFilters.fromDate &&
                      newToDate &&
                      newToDate < tableFilters.fromDate
                    ) {
                      return;
                    }

                    onTableFilterChange({
                      toDate: newToDate,
                      date: undefined,
                    });
                  }}
                />
              </div>

              {/* Sort By */}
              <div className="w-full lg:w-48">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Sắp theo
                </label>
                <Select
                  value={tableFilters.sortBy || 'bookingDate'}
                  onChange={(value) => onTableFilterChange({
                    sortBy: value as BookingTableFilters['sortBy']
                  })}
                >
                  <option value="bookingDate">Ngày chơi</option>
                  <option value="createdAt">Ngày đặt</option>
                  <option value="customerName">Tên khách hàng</option>
                  <option value="status">Trạng thái</option>
                  <option value="finalTotal">Tổng tiền</option>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="w-full lg:w-40">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Thứ tự
                </label>
                <Select
                  value={tableFilters.sortOrder || 'desc'}
                  onChange={(value) => onTableFilterChange({
                    sortOrder: value as 'asc' | 'desc'
                  })}
                >
                  <option value="desc">Giảm</option>
                  <option value="asc">Tăng</option>
                </Select>
              </div>

              {/* Reset Filters */}
              <div className="w-full lg:w-auto lg:ml-auto flex items-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setDatePreset('today');

                    onTableFilterChange({
                      customerKeyword: undefined,
                      courtId: undefined,
                      status: undefined,
                      paymentStatus: undefined,
                      date: new Date().toISOString().split('T')[0],
                      fromDate: undefined,
                      toDate: undefined,
                      sortBy: 'bookingDate',
                      sortOrder: 'desc',
                    });
                  }}
                >
                  <ArrowCounterClockwise
                    className="h-4 w-4"
                    weight="bold"
                  />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // SCHEDULE VIEW FILTERS
  // ============================================================================

  if (viewMode === 'schedule') {
    if (!scheduleDate || !onScheduleDateChange || !onSchedulePreviousDay || !onScheduleNextDay) {
      return null;
    }

    return (
      <div className="bg-surface-1 border border-border rounded-xl p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          {/* Date Navigation */}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={onSchedulePreviousDay}
            >
              <CaretLeft className="h-4 w-4" weight="bold" />
            </Button>

            <div className="flex items-center gap-2 min-w-70">
              <CalendarBlank className="h-5 w-5 text-primary" weight="bold" />
              <span className="text-sm font-semibold text-foreground">
                {formatScheduleDate(scheduleDate)}
              </span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={onScheduleNextDay}
            >
              <CaretRight className="h-4 w-4" weight="bold" />
            </Button>
          </div>

          {/* Date Picker */}
          <Input
            type="date"
            value={scheduleDate}
            onChange={(e) => onScheduleDateChange(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>
    );
  }

  // ============================================================================
  // CALENDAR VIEW FILTERS
  // ============================================================================

  if (viewMode === 'calendar') {
    if (
      calendarYear === undefined ||
      calendarMonth === undefined ||
      !onCalendarPreviousMonth ||
      !onCalendarNextMonth
    ) {
      return null;
    }

    return (
      <div className="bg-surface-1 border border-border rounded-xl p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCalendarPreviousMonth}
          >
            <CaretLeft className="h-4 w-4" weight="bold" />
          </Button>

          <div className="flex items-center gap-2 min-w-50 justify-center">
            <CalendarBlank className="h-5 w-5 text-primary" weight="bold" />
            <span className="text-lg font-bold text-foreground">
              {MONTH_NAMES[calendarMonth - 1]} {calendarYear}
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onCalendarNextMonth}
          >
            <CaretRight className="h-4 w-4" weight="bold" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
