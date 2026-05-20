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
import {
  WalkInBookingWorkspace,
  createDefaultWalkInForm,
  type WalkInBookingFormState,
} from '../components/WalkInBookingWorkspace';
import { useBookingManagement } from '../hooks/useBookingManagement';
import { useBookingSchedule } from '../hooks/useBookingSchedule';
import { useBookingCalendar } from '../hooks/useBookingCalendar';
import { ConfirmationDialog } from '@/src/shared/components/ui/ConfirmationDialog';
import { Toast } from '@/src/shared/components/ui/Toast';
import { useToast } from '@/src/shared/hooks/useToast';
import { fetchBranches } from '@/src/api/branch.api';

import type { BranchDto } from '@/src/features/branch/shared/types/branch.types';

import type { BookingDto } from '../../shared/types/booking.types';
import { Table, GridNine, Calendar, Plus, X } from '@phosphor-icons/react';

type ViewTab = 'table' | 'schedule' | 'calendar';
type WorkspaceId = 'management' | string;

interface WalkInWorkspace {
  id: string;
  title: string;
  form: WalkInBookingFormState;
  dirty: boolean;
  branchId: string;
  branchName: string;
}

interface BookingManagementPageProps {
  title?: string;
  description?: string;
  showCreateWalkIn?: boolean;
}

export function BookingManagementPage({
  title = 'Đặt sân',
  description = 'Quản lý và vận hành việc đặt sân',
  showCreateWalkIn = true,
}: BookingManagementPageProps) {
  const [activeView, setActiveView] = useState<ViewTab>('table');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<WorkspaceId>('management');
  const [walkInWorkspaces, setWalkInWorkspaces] = useState<WalkInWorkspace[]>([]);
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const { toast, show: showToast } = useToast();
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
        const data = await fetchBranches(1, 50); // Get first 50 branches
        setBranches(data.items || []);
      } catch (error) {
        console.error('Failed to load branches:', error);
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
    refresh,
  } = useBookingManagement(undefined, activeView === 'table');

  const schedule = useBookingSchedule(branchId, activeView === 'schedule');
  const calendar = useBookingCalendar(branchId, activeView === 'calendar');

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
    if (!branchId) {
      showToast('error', 'Select a branch before creating a walk-in booking');
      return;
    }

    if (walkInWorkspaces.length >= 5) {
      showToast('error', 'Close an existing walk-in workspace before opening another one');
      return;
    }

    const workspace: WalkInWorkspace = {
      id: `walk-in-${Date.now()}`,
      title: 'Walk-in booking',
      form: createDefaultWalkInForm(),
      dirty: false,
      branchId,
      branchName: selectedBranch?.name || ""
    };

    setWalkInWorkspaces((prev) => [...prev, workspace]);
    setActiveWorkspaceId(workspace.id);
  };

  const updateWalkInWorkspace = useCallback(
    (workspaceId: string, patch: Partial<WalkInWorkspace>) => {
      setWalkInWorkspaces((prev) =>
        prev.map((workspace) => {
          if (workspace.id !== workspaceId) return workspace;

          const nextWorkspace = {
            ...workspace,
            ...patch,
          };

          const unchanged =
            JSON.stringify(workspace) === JSON.stringify(nextWorkspace);

          return unchanged ? workspace : nextWorkspace;
        }),
      );
    },
    [],
  );

  const closeWalkInWorkspace = (workspaceId: string) => {
    setWalkInWorkspaces((prev) => prev.filter((workspace) => workspace.id !== workspaceId));
    setActiveWorkspaceId((current) => (current === workspaceId ? 'management' : current));
  };

  const requestCloseWalkInWorkspace = (workspace: WalkInWorkspace) => {
    if (!workspace.dirty) {
      closeWalkInWorkspace(workspace.id);
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Close walk-in workspace',
      message: 'This walk-in booking has unsaved changes. Close it anyway?',
      onConfirm: () => {
        closeWalkInWorkspace(workspace.id);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleWalkInCreated = async (workspaceId: string, booking: BookingDto) => {
    showToast('success', 'Walk-in booking created successfully');
    await refresh();
    closeWalkInWorkspace(workspaceId);
    setActiveWorkspaceId('management');
    setActiveView('table');

    const bookingId = booking.id || booking.bookingId;
    if (bookingId) {
      openBookingDetail(bookingId);
    }
  };

  const selectedBranch = branches.find((branch) => branch.id === branchId);
  const activeWalkInWorkspace = walkInWorkspaces.find(
    (workspace) => workspace.id === activeWorkspaceId,
  );

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
              <Plus className="h-4 w-4" />
              Walk-in Booking
            </button>
          )}
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="booking-workspace-tabs">
        <button
          onClick={() => setActiveWorkspaceId('management')}
          className={`booking-workspace-tab ${activeWorkspaceId === 'management' ? 'booking-workspace-tab-active' : ''}`}
        >
          Bookings
        </button>
        {walkInWorkspaces.map((workspace) => (
          <button
            key={workspace.id}
            onClick={() => setActiveWorkspaceId(workspace.id)}
            className={`booking-workspace-tab group ${activeWorkspaceId === workspace.id ? 'booking-workspace-tab-active' : ''}`}
          >
            <span className="max-w-44 truncate">{workspace.title}</span>
            {workspace.dirty && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
            <span
              role="button"
              tabIndex={0}
              aria-label={`Close ${workspace.title}`}
              onClick={(event) => {
                event.stopPropagation();
                requestCloseWalkInWorkspace(workspace);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  requestCloseWalkInWorkspace(workspace);
                }
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-3 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
        {showCreateWalkIn && (
          <button
            onClick={handleCreateWalkIn}
            className="booking-workspace-add"
            aria-label="Open walk-in booking workspace"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {activeWorkspaceId === 'management' && (
        <>
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
            // courts={courts.map(c => ({ id: c.id, name: c.name }))}
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
        </>
      )}

      {activeWalkInWorkspace && (
        <WalkInBookingWorkspace
          key={activeWalkInWorkspace.id}
          branchId={activeWalkInWorkspace.branchId}
          branchName={activeWalkInWorkspace.branchName}
          form={activeWalkInWorkspace.form}
          onChange={(form) => updateWalkInWorkspace(activeWalkInWorkspace.id, { form })}
          onDirtyChange={(dirty) => updateWalkInWorkspace(activeWalkInWorkspace.id, { dirty })}
          onTitleChange={(title) => updateWalkInWorkspace(activeWalkInWorkspace.id, { title })}
          onCreated={(booking) => handleWalkInCreated(activeWalkInWorkspace.id, booking)}
          onError={(message) => showToast('error', message)}
        />
      )}

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
      <Toast toast={toast} />
    </div>
  );
}
