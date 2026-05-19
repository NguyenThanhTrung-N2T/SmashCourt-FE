"use client";

/**
 * Booking Management Page
 * 
 * Comprehensive booking management with table, schedule, and calendar views.
 * Used by OWNER, MANAGER, and STAFF roles.
 * 
 * Filter Strategy:
 * - Shared filters (branchId) persist across all tabs
 * - Table filters (status, payment, search, pagination) only apply to table view
 * - Schedule filters (date) only apply to schedule view
 * - Calendar filters (year, month) only apply to calendar view
 * - Smart tab switching: converts date context when switching between views
 */

import { useState, useCallback, useEffect } from 'react';
import { BookingBranchSelector } from '../components/BookingBranchSelector';
import { BookingSummaryCards } from '../components/BookingSummaryCards';
import { BookingFilterToolbar } from '../components/BookingFilterToolbar';
import { BookingTableView } from '../components/BookingTableView';
import { BookingScheduleView } from '../components/BookingScheduleView';
import { BookingCalendarView } from '../components/BookingCalendarView';
import { BookingDetailDrawer } from '../components/BookingDetailDrawer';
import { useBookingManagement } from '../hooks/useBookingManagement';
import { useBookingSchedule } from '../hooks/useBookingSchedule';
import { useBookingCalendar } from '../hooks/useBookingCalendar';
import { ConfirmationDialog } from '@/src/shared/components/ui/ConfirmationDialog';
import { fetchBranches } from '@/src/api/branch.api';
import { fetchCourts } from '@/src/api/court.api';
import type { BranchDto } from '@/src/features/branch/types/branch.types';
import type { CourtDto } from '@/src/features/court/types/court.types';
import { Table, GridNine, Calendar } from '@phosphor-icons/react';

type ViewTab = 'table' | 'schedule' | 'calendar';

interface BookingManagementPageProps {
  title?: string;
  description?: string;
  showCreateWalkIn?: boolean;
}

export function BookingManagementPage({
  title = 'Đặt sân',
  description = 'Quản lý và vận hành việc đặt sân',
  showCreateWalkIn = false,
}: BookingManagementPageProps) {
  const [activeView, setActiveView] = useState<ViewTab>('table');
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [courts, setCourts] = useState<CourtDto[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  // Load branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoadingBranches(true);
        const data = await fetchBranches(1, 50); // Get first 50 branches
        setBranches(data.items || []);
      } catch (error) {
        console.error('Failed to load branches:', error);
      } finally {
        setLoadingBranches(false);
      }
    };

    loadBranches();
  }, []);

  const {
    bookings,
    summary,
    loading,
    tableFilters,
    branchId,
    updateTableFilters,
    updateBranchId,
    selectedBooking,
    drawerOpen,
    openBookingDetail,
    closeDrawer,
    handleCheckIn,
    handleCheckout,
    handleCancel,
    handleConfirmRefund,
  } = useBookingManagement(undefined, activeView === 'table');

  const schedule = useBookingSchedule(branchId, activeView === 'schedule');
  const calendar = useBookingCalendar(branchId, activeView === 'calendar');

  // Load courts when branch changes
  useEffect(() => {
    const loadCourts = async () => {
      if (!branchId) {
        setCourts([]);
        return;
      }

      try {
        setLoadingCourts(true);
        const data = await fetchCourts(branchId);
        setCourts(data || []);
      } catch (error) {
        console.error('Failed to load courts:', error);
        setCourts([]);
      } finally {
        setLoadingCourts(false);
      }
    };

    loadCourts();
  }, [branchId]);

  const handleCheckInWithConfirm = (bookingId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận khách đến - Check in',
      message: 'Bạn có chắc chắn muốn xác nhận đến cho đơn này?',
      onConfirm: () => {
        handleCheckIn(bookingId);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleCheckoutWithConfirm = (bookingId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận rời - Check out',
      message: 'Bạn có chắc chắn muốn xác nhận khách đã chơi xong?',
      onConfirm: () => {
        handleCheckout(bookingId);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleCancelWithConfirm = (bookingId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hủy đơn đặt',
      message: 'Bạn có chắc chắn muốn hủy đơn này? Hành động này không thể hoàn tác.',
      onConfirm: () => {
        handleCancel(bookingId);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleConfirmRefundWithConfirm = (bookingId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận hoàn tiền',
      message: 'Bạn có chắc chắn muốn xác nhận hoàn tiền?',
      onConfirm: () => {
        handleConfirmRefund(bookingId);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Smart tab switching with date context conversion
  const handleTabChange = useCallback((newTab: ViewTab) => {
    if (newTab === 'schedule' && activeView === 'table') {
      // Table → Schedule: Use table's date filter if available, otherwise today
      const targetDate = tableFilters.date || new Date().toISOString().split('T')[0];
      schedule.setSelectedDate(targetDate);
    } else if (newTab === 'calendar' && activeView === 'schedule') {
      // Schedule → Calendar: Convert schedule date to month/year
      const scheduleDate = new Date(schedule.selectedDate);
      calendar.setSelectedYear(scheduleDate.getFullYear());
      calendar.setSelectedMonth(scheduleDate.getMonth() + 1);
    } else if (newTab === 'calendar' && activeView === 'table') {
      // Table → Calendar: Convert table date to month/year if available
      if (tableFilters.date) {
        const tableDate = new Date(tableFilters.date);
        calendar.setSelectedYear(tableDate.getFullYear());
        calendar.setSelectedMonth(tableDate.getMonth() + 1);
      }
    }

    setActiveView(newTab);
  }, [activeView, tableFilters.date, schedule, calendar]);

  // Calendar day click: switch to table view with selected date
  const handleCalendarDayClick = useCallback((date: string) => {
    updateTableFilters({ date, fromDate: undefined, toDate: undefined });
    setActiveView('table');
  }, [updateTableFilters]);

  const handleCreateWalkIn = () => {
    // TODO: Implement walk-in booking modal
    console.log('Create walk-in booking');
  };

  return (
    <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Export Button */}
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Xuất dữ liệu
          </button>
          {/* Create Walk-in Button */}
          {showCreateWalkIn && (
            <button
              onClick={handleCreateWalkIn}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
                boxShadow: "0 4px 14px rgba(27, 94, 56, 0.35)",
              }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Walk-in Booking
            </button>
          )}
        </div>
      </div>

      {/* Branch Selector */}
      {branches.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <BookingBranchSelector
            branches={branches}
            selectedBranchId={branchId}
            onBranchChange={updateBranchId}
            label="Chi nhánh"
            placeholder="-- Chọn chi nhánh --"
            showAllOption={true}
            className="!bg-transparent !border-0 !shadow-none !p-0"
          />
        </div>
      )}

      {/* Summary Cards */}
      <BookingSummaryCards summary={summary} loading={loading} />

      {/* Dynamic Filter Toolbar - Changes based on active view */}
      <BookingFilterToolbar
        viewMode={activeView}
        // Table view props
        tableFilters={tableFilters}
        onTableFilterChange={updateTableFilters}
        onCreateWalkIn={undefined} // Moved to header
        courts={courts.map(c => ({ id: c.id, name: c.name }))}
        // Schedule view props
        scheduleDate={schedule.selectedDate}
        onScheduleDateChange={schedule.setSelectedDate}
        onSchedulePreviousDay={schedule.goToPreviousDay}
        onScheduleNextDay={schedule.goToNextDay}
        // Calendar view props
        calendarYear={calendar.selectedYear}
        calendarMonth={calendar.selectedMonth}
        onCalendarPreviousMonth={calendar.goToPreviousMonth}
        onCalendarNextMonth={calendar.goToNextMonth}
        // Shared props
        branches={branches}
      />

      {/* View Tabs */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-border bg-surface-1 border-1">
          <nav className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => handleTabChange('table')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeView === 'table'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground hover:border-border'
                }`}
            >
              <Table className="h-5 w-5" />
              Bảng
            </button>
            <button
              onClick={() => handleTabChange('schedule')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeView === 'schedule'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground hover:border-border'
                }`}
            >
              <GridNine className="h-5 w-5" />
              Lịch đặt sân
            </button>
            <button
              onClick={() => handleTabChange('calendar')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeView === 'calendar'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground hover:border-border'
                }`}
            >
              <Calendar className="h-5 w-5" />
              Lịch biểu
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Table View */}
          {activeView === 'table' && (
            <BookingTableView
              bookings={bookings}
              loading={loading}
              onRowClick={openBookingDetail}
              onCheckIn={handleCheckInWithConfirm}
              onCheckout={handleCheckoutWithConfirm}
              onCancel={handleCancelWithConfirm}
              onConfirmRefund={handleConfirmRefundWithConfirm}
              onPageChange={(page) => updateTableFilters({ page })}
            />
          )}

          {/* Schedule View */}
          {activeView === 'schedule' && (
            <BookingScheduleView
              schedule={schedule.schedule}
              loading={schedule.loading}
              onBookingClick={openBookingDetail}
              hasBranch={schedule.hasBranch}
            />
          )}

          {/* Calendar View */}
          {activeView === 'calendar' && (
            <BookingCalendarView
              heatmapData={calendar.heatmapData}
              loading={calendar.loading}
              selectedYear={calendar.selectedYear}
              selectedMonth={calendar.selectedMonth}
              onPreviousMonth={calendar.goToPreviousMonth}
              onNextMonth={calendar.goToNextMonth}
              onDayClick={handleCalendarDayClick}
            />
          )}
        </div>
      </div>

      {/* Booking Detail Drawer */}
      <BookingDetailDrawer
        isOpen={drawerOpen}
        booking={selectedBooking}
        onClose={closeDrawer}
        onCheckIn={handleCheckInWithConfirm}
        onCheckout={handleCheckoutWithConfirm}
        onCancel={handleCancelWithConfirm}
        onConfirmRefund={handleConfirmRefundWithConfirm}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
