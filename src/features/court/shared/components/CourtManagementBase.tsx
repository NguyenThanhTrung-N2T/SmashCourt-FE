"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { PageHeader } from "@/src/shared/components/layout";
import { Button, Toast, ConfirmationDialog } from "@/src/shared/components/ui";
import { Pagination } from "@/src/shared/components/ui/Pagination";
import { useCourtManagement } from "@/src/features/court/staff/hooks/useCourtManagement";
import { useCourtTypes } from "@/src/features/court-type/shared/hooks/useCourtTypes";
import { setPrefill } from "@/src/lib/walkInPrefill";
import { useRouter } from "next/navigation";
import {
    CourtDetailModal,
    CourtFilters,
    CourtCardsGrid,
    CourtSummaryCards,
    CourtTimelineView,
    BookingDetailModal,
    CreateCourtModal,
    EditCourtModal,
} from "@/src/features/court/staff/components";

interface CourtManagementBaseProps {
    allowManagement: boolean;
    bookingPath: string;
}

export function CourtManagementBase({ allowManagement, bookingPath }: CourtManagementBaseProps) {
    const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
    const {
        stats,
        courtsPaged,
        loading,
        date,
        setDate,
        search,
        setSearch,
        typeId,
        setTypeId,
        page,
        setPage,
        handleSuspend,
        handleActivate,
        handleDelete,
        confirmDialog,
        closeConfirmDialog,
        drawerOpen,
        drawerCourtId,
        openDrawer,
        closeDrawer,
        bookingDetailId,
        setBookingDetailId,
        refresh,
        toast,
        showToast,
        setConfirmDialog,
    } = useCourtManagement();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editCourtId, setEditCourtId] = useState<string | null>(null);

    const router = useRouter();

    const { courtTypes } = useCourtTypes();

    const courts = courtsPaged?.items ?? [];

    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            {/* Header */}
            <PageHeader
                title="Sân"
                description={allowManagement
                    ? "Quản lý trạng thái và lịch sử dụng sân trong ngày"
                    : "Xem trạng thái và lịch sử dụng sân trong ngày"}
                action={
                    allowManagement && (
                        <>
                            <Button
                                variant="primary"
                                size="md"
                                leftIcon={<Plus className="h-4 w-4" />}
                                onClick={() => setShowCreateModal(true)}
                            >
                                Thêm sân
                            </Button>
                        </>
                    )
                }
            />

            {/* KPI Summary Cards */}
            <CourtSummaryCards stats={stats} loading={loading} />

            {/* Filters */}
            <CourtFilters
                date={date}
                onDateChange={setDate}
                search={search}
                onSearchChange={setSearch}
                typeId={typeId}
                onTypeIdChange={setTypeId}
                courtTypes={courtTypes}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {/* Content View */}
            {viewMode === "grid" ? (
                <div className="space-y-6">
                    <CourtCardsGrid
                        courts={courts}
                        loading={loading}
                        onViewDetail={openDrawer}
                        onEdit={allowManagement ? (courtId) => setEditCourtId(courtId) : undefined}
                        onSuspend={allowManagement ? handleSuspend : undefined}
                        onActivate={allowManagement ? handleActivate : undefined}
                        onDelete={allowManagement ? handleDelete : undefined}
                        onAddCourt={() => { }}
                    />

                    {courtsPaged && (
                        <Pagination
                            currentPage={page}
                            totalPages={courtsPaged.totalPages}
                            totalItems={courtsPaged.totalItems}
                            pageSize={courtsPaged.pageSize ?? 10}
                            onPageChange={setPage}
                            itemLabel="sân"
                        />
                    )}
                </div>
            ) : (
                <CourtTimelineView
                    date={date}
                    typeId={typeId || undefined}
                    onViewDetail={openDrawer}
                    onBookingClick={setBookingDetailId}
                    onSlotClick={(courtId, time) => {
                        setConfirmDialog({
                            isOpen: true,
                            title: "Xác nhận đặt sân",
                            message: `Bạn có muốn đặt sân vào lúc ${time}? Hệ thống sẽ chuyển sang trang Đặt tại quầy.`,
                            onConfirm: () => {
                                const bookingDate = date;
                                const startTime = time;
                                const [h, m] = time.split(':').map(Number);
                                const endHours = h + 1;
                                const endTime = `${endHours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

                                setPrefill({
                                    courtId,
                                    bookingDate,
                                    startTime,
                                    endTime
                                });
                                // Staff or Manager layout?
                                router.push(bookingPath);
                            }
                        });
                    }}
                />
            )}

            {/* Detail Drawer */}
            <CourtDetailModal
                isOpen={drawerOpen}
                courtId={drawerCourtId}
                onClose={closeDrawer}
                date={date}
            />

            {showCreateModal && allowManagement && (
                <CreateCourtModal
                    courtTypes={courtTypes}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={(c) => {
                        setShowCreateModal(false);
                        refresh();
                        showToast?.("success", "Đã tạo sân");
                    }}
                />
            )}

            {editCourtId && allowManagement && (
                <EditCourtModal
                    courtId={editCourtId}
                    courtTypes={courtTypes}
                    onClose={() => setEditCourtId(null)}
                    onSaved={(c) => {
                        setEditCourtId(null);
                        refresh();
                        showToast?.("success", "Đã cập nhật sân");
                    }}
                />
            )}

            {/* Booking Detail Modal */}
            <BookingDetailModal
                isOpen={!!bookingDetailId}
                bookingId={bookingDetailId}
                onClose={() => setBookingDetailId(null)}
                onRefresh={refresh}
            />

            {/* Confirm Dialog */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={closeConfirmDialog}
                variant="warning"
            />

            {/* Toast */}
            <Toast toast={toast} />
        </div>
    );
}
