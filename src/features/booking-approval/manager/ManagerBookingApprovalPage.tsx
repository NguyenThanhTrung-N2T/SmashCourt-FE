/**
 * Manager Booking Approval Queue Page
 * 
 * Interface for Branch Managers to view and process (approve/reject) pending bookings.
 * Auto-scoped to the manager's assigned branch by backend authorization.
 * Contract: DEPOSIT_APPROVAL_API.md §4.1, §4.2, §4.3, §6.
 */

"use client";

import { useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { PageHeader } from "@/src/shared/components/layout/PageHeader";
import { Alert } from "@/src/shared/components/ui/Alert";
import {
  PendingApprovalTable,
  ApproveBookingDialog,
  RejectBookingDialog,
} from "@/src/features/booking-approval/shared/components";
import { usePendingApprovals } from "@/src/features/booking-approval/shared/hooks/usePendingApprovals";
import type { PendingApprovalBookingDto } from "@/src/features/booking-approval/shared/types/booking-approval.types";

export function ManagerBookingApprovalPage() {
  const {
    approvals,
    totalItems,
    totalPages,
    isLoading,
    error,
    page,
    pageSize,
    setPage,
    refetch,
  } = usePendingApprovals({ pageSize: 10 });

  const [selectedForApprove, setSelectedForApprove] = useState<PendingApprovalBookingDto | null>(null);
  const [selectedForReject, setSelectedForReject] = useState<PendingApprovalBookingDto | null>(null);

  const handleRefresh = () => {
    refetch();
  };

  const handleActionSuccess = () => {
    refetch();
  };

  return (
    <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Duyệt cọc đặt sân"
          description="Xem và phê duyệt hoặc từ chối các đơn đặt sân đang chờ xác nhận cọc từ hệ thống."
        />
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <ArrowClockwise className={`h-4 w-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="error">
          <p className="font-semibold text-sm">Không thể tải danh sách đơn chờ duyệt</p>
          <p className="text-xs text-muted mt-1">{error}</p>
        </Alert>
      )}

      {/* Pending Approvals Table */}
      <PendingApprovalTable
        approvals={approvals}
        isLoading={isLoading}
        totalItems={totalItems}
        totalPages={totalPages}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onApproveClick={(booking) => setSelectedForApprove(booking)}
        onRejectClick={(booking) => setSelectedForReject(booking)}
        showBranchColumn={false}
      />

      {/* Approve Dialog */}
      <ApproveBookingDialog
        isOpen={Boolean(selectedForApprove)}
        booking={selectedForApprove}
        onClose={() => setSelectedForApprove(null)}
        onSuccess={handleActionSuccess}
        onNeedReload={refetch}
      />

      {/* Reject Dialog */}
      <RejectBookingDialog
        isOpen={Boolean(selectedForReject)}
        booking={selectedForReject}
        onClose={() => setSelectedForReject(null)}
        onSuccess={handleActionSuccess}
        onNeedReload={refetch}
      />
    </div>
  );
}
