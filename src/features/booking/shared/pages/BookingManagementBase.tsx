"use client";

/**
 * Booking Management Base Presenter
 * 
 * Reusable presenter for booking dashboard. Used by both OwnerBookingPage and ManagerBookingPage.
 */

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  BookingDetailDrawer, BookingTableView,
  BookingScheduleView, BookingCalendarView,
  BookingFilterToolbar, BookingBranchSelector,
  BookingSummaryCards, RefundConfirmDrawer
} from '@/src/features/booking/shared/components/management';
import {
  createDefaultWalkInForm,
  type WalkInBookingFormState,
} from '@/src/features/booking/shared/types';
import { WalkInBookingWorkspace } from '@/src/features/booking/shared/components/new';
import { useBookingManagement, useBookingSchedule, useBookingCalendar } from '@/src/features/booking/shared/hooks';
import { Toast, ConfirmationDialog, Button } from '@/src/shared/components/ui';
import { PageHeader } from '@/src/shared/components/layout';
import type { BranchDto } from '@/src/features/branch/shared/types/branch.types';
import type { BookingDto } from '@/src/features/booking/shared/types/booking.types';
import { Table, GridNine, Calendar, Plus, X, FileText } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { consumePrefill, WalkInPrefill } from '@/src/lib/walkInPrefill';

type ViewTab = 'table' | 'schedule' | 'calendar';
type WorkspaceId = 'management' | string;

interface WalkInWorkspace {
  id: string;
  title: string;
  form: WalkInBookingFormState;
  dirty: boolean;
  branchId: string;
  branchName: string;
  selectedCourtTypeId: string;
}

interface BookingManagementBaseProps {
  isOwner: boolean;
  initialBranchId?: string;
  branchName?: string;
  branches?: BranchDto[];
  title?: string;
  description?: string;
  showCreateWalkIn?: boolean;
}

const MAX_WALK_IN_TAB_COUNT = 5;

export function BookingManagementBase({
  isOwner,
  initialBranchId,
  branchName,
  branches = [],
  title = 'Đặt sân',
  description = 'Quản lý và vận hành việc đặt sân',
  showCreateWalkIn = true,
}: BookingManagementBaseProps) {
  const [activeView, setActiveView] = useState<ViewTab>('table');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<WorkspaceId>('management');
  const [walkInWorkspaces, setWalkInWorkspaces] = useState<WalkInWorkspace[]>([]);
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
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
    handleCompletePayment,
    handleCancel,
    handleConfirmRefund,
    refresh,
    toast,
    showToast,
  } = useBookingManagement(initialBranchId, activeView === 'table');
  // ── URL helpers ──────────────────────────────────────────
  const pushParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname, searchParams]);
  // ── Wrap openBookingDetail ────────────────────────────────
  const handleOpenBookingDetail = useCallback((bookingId: string) => {
    pushParam('bookingId', bookingId);
    openBookingDetail(bookingId);
  }, [openBookingDetail, pushParam]);

  // ── Wrap closeDrawer ─────────────────────────────────────
  const handleCloseDrawer = useCallback(() => {
    pushParam('bookingId', null);
    closeDrawer();
  }, [closeDrawer, pushParam]);

  // ── Restore drawer on page load / back-forward ────────────
  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    if (bookingId) {
      openBookingDetail(bookingId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount
  const [refundDrawerOpen, setRefundDrawerOpen] = useState(false);

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

  const handleCompletePaymentWithConfirm = (bookingId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận hoàn tất thanh toán',
      message: 'Bạn có chắc chắn muốn xác nhận thanh toán cho đơn này?',
      onConfirm: () => {
        handleCompletePayment(bookingId);
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
    updateTableFilters({ date, fromDate: date, toDate: date });
    setActiveView('table');
  }, [updateTableFilters]);

  const selectedBranch = branches.find((branch) => branch.id === branchId);
  const activeBranchName = isOwner ? (selectedBranch?.name || "") : (branchName || "");

  const handleCreateWalkIn = useCallback((prefill?: WalkInPrefill) => {
    if (!branchId) {
      if (!prefill) {
        showToast('error', 'Chọn chi nhánh trước khi tạo đơn tại quầy');
      }
      return;
    }

    if (walkInWorkspaces.length >= MAX_WALK_IN_TAB_COUNT) {
      showToast('error', 'Đóng một tab tạo đơn tại quầy trước khi mở một tab mới.');
      return;
    }

    const form = createDefaultWalkInForm();
    if (prefill) {
      if (prefill.bookingDate) form.bookingDate = prefill.bookingDate;
      if (prefill.courtId) form.courtId = prefill.courtId;
      if (prefill.startTime) form.startTime = prefill.startTime;
      if (prefill.endTime) form.endTime = prefill.endTime;
    }

    const workspace: WalkInWorkspace = {
      id: `walk-in-${Date.now()}`,
      title: 'Đặt tại quầy',
      form,
      dirty: false,
      branchId,
      branchName: activeBranchName,
      selectedCourtTypeId: "all"
    };

    setWalkInWorkspaces((prev) => [...prev, workspace]);
    setActiveWorkspaceId(workspace.id);
  }, [branchId, walkInWorkspaces.length, activeBranchName, showToast]);

  // Handle Walk-in Prefill on Mount
  useEffect(() => {
    const prefill = consumePrefill();
    if (prefill && branchId) {
      handleCreateWalkIn(prefill);
    }
  }, [branchId, handleCreateWalkIn]);

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
      title: 'Đóng tab tạo đơn tại quầy',
      message: 'Tạo đơn tại quầy chưa hoàn thành. Bạn vẫn muốn đóng?',
      onConfirm: () => {
        closeWalkInWorkspace(workspace.id);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleWalkInCreated = async (workspaceId: string, booking: BookingDto) => {
    showToast('success', 'Tạo đơn đặt sân tại quầy thành công');
    await refresh();
    closeWalkInWorkspace(workspaceId);
    setActiveWorkspaceId('management');
    setActiveView('table');

    const bookingId = booking.id;
    if (bookingId) {
      openBookingDetail(bookingId);
    }
  };

  const activeWalkInWorkspace = walkInWorkspaces.find(
    (workspace) => workspace.id === activeWorkspaceId,
  );

  return (
    <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title={title}
          description={description}
        />
        <div className="flex items-center gap-3 shrink-0">
          {/* Export Button */}
          <Button
            onClick={() => { }} // TODO
            variant="secondary"
            size="md"
            leftIcon={<FileText className="h-4 w-4" />}>
            Xuất dữ liệu
          </Button>
          {/* Create Walk-in Button */}
          {showCreateWalkIn && (
            <Button
              onClick={() => handleCreateWalkIn()}
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}>
              Đặt tại quầy
            </Button>
          )}
        </div>
      </div>

      {/* Workspace Tabs + Branch Selector (same row) */}
      <div className="flex items-center justify-between gap-4">
        {/* Tabs – left side */}
        <div className="booking-workspace-tabs overflow-x-auto custom-scrollbar flex-1 min-w-0">
          <button
            onClick={() => setActiveWorkspaceId('management')}
            className={`booking-workspace-tab ${activeWorkspaceId === 'management' ? 'booking-workspace-tab-active' : ''}`}
          >
            Trang chủ
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
              onClick={() => handleCreateWalkIn()}
              className="booking-workspace-add"
              aria-label="Open walk-in booking workspace"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Branch Selector – right side */}
        {isOwner && branches.length > 0 ? (
          <div className="shrink-0 min-w-64 max-w-xs">
            <BookingBranchSelector
              branches={branches}
              selectedBranchId={branchId}
              onBranchChange={updateBranchId}
              label="Chi nhánh"
              placeholder="-- Chọn chi nhánh --"
              showAllOption={true}
            />
          </div>
        ) : (
          !isOwner && activeBranchName && (
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Chi nhánh:</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{activeBranchName}</span>
            </div>
          )
        )}
      </div>

      {activeWorkspaceId === 'management' && (
        <>

          {/* Summary Cards */}
          <BookingSummaryCards summary={summary} loading={loading} onPendingRefundClick={() => setRefundDrawerOpen(true)} />

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
                  onRowClick={handleOpenBookingDetail}
                  onCheckIn={handleCheckInWithConfirm}
                  onCheckout={handleCheckoutWithConfirm}
                  onCompletePayment={handleCompletePaymentWithConfirm}
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
          selectedCourtTypeId={activeWalkInWorkspace.selectedCourtTypeId}
          onCourtTypeChange={(selectedCourtTypeId) =>
            updateWalkInWorkspace(activeWalkInWorkspace.id, {
              selectedCourtTypeId,
            })
          }
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
        onClose={handleCloseDrawer}
        onCheckIn={handleCheckInWithConfirm}
        onCheckout={handleCheckoutWithConfirm}
        onCompletePayment={handleCompletePaymentWithConfirm}
        onCancel={handleCancelWithConfirm}
        onConfirmRefund={handleConfirmRefundWithConfirm}
        onServiceUpdated={(updated) => {
          // Refresh the booking in drawer and the list
          refresh();
          openBookingDetail(updated.id || '');
        }}
        onError={(message) => showToast('error', message)}
      />

      {/* Refund Confirmation Drawer (opened from summary card) */}
      <RefundConfirmDrawer
        isOpen={refundDrawerOpen}
        branchId={branchId}
        onClose={() => setRefundDrawerOpen(false)}
        onConfirmRefund={handleConfirmRefund}
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
