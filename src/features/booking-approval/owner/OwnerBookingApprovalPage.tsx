/**
 * Owner Booking Approval Queue Page
 * 
 * Interface for Owners to view and process pending bookings across all branches or a selected branch.
 * Contract: DEPOSIT_APPROVAL_API.md §4.1, §4.2, §4.3, §6.
 */

"use client";

import { useState, useEffect } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { PageHeader } from "@/src/shared/components/layout/PageHeader";
import { BranchSelector } from "@/src/shared/components/layout/BranchSelector";
import { Alert } from "@/src/shared/components/ui/Alert";
import {
  PendingApprovalTable,
  ApproveBookingDialog,
  RejectBookingDialog,
} from "@/src/features/booking-approval/shared/components";
import { usePendingApprovals } from "@/src/features/booking-approval/shared/hooks/usePendingApprovals";
import { fetchBranches } from "@/src/api/branch.api";
import type { BranchDto } from "@/src/features/branch/shared/types/branch.types";
import type { PendingApprovalBookingDto } from "@/src/features/booking-approval/shared/types/booking-approval.types";

export function OwnerBookingApprovalPage() {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  // Load branch list for filtering
  useEffect(() => {
    let isMounted = true;
    const loadBranchList = async () => {
      try {
        const res = await fetchBranches(1, 50);
        if (isMounted) {
          setBranches(res.items || []);
        }
      } catch (err) {
        console.error("Failed to load branches:", err);
      } finally {
        if (isMounted) {
          setBranchesLoading(false);
        }
      }
    };

    loadBranchList();
    return () => {
      isMounted = false;
    };
  }, []);

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
  } = usePendingApprovals({
    branchId: selectedBranchId || undefined,
    pageSize: 10,
  });

  const [selectedForApprove, setSelectedForApprove] = useState<PendingApprovalBookingDto | null>(null);
  const [selectedForReject, setSelectedForReject] = useState<PendingApprovalBookingDto | null>(null);

  const handleRefresh = () => {
    refetch();
  };

  const handleActionSuccess = () => {
    refetch();
  };

  const branchOptions = [
    { id: "", name: "Tất cả chi nhánh" },
    ...branches.map((b) => ({ id: b.id, name: b.name })),
  ];

  return (
    <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Duyệt cọc đặt sân (Chủ sân)"
          description="Quản lý và phê duyệt hoặc từ chối các đơn đặt sân đang chờ xử lý cọc trên toàn hệ thống."
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

      {/* Branch Selector Filter */}
      {!branchesLoading && branchOptions.length > 1 && (
        <div className="max-w-md">
          <BranchSelector
            branches={branchOptions}
            selectedBranchId={selectedBranchId}
            onBranchChange={(id) => setSelectedBranchId(id)}
            label="Lọc theo chi nhánh"
            placeholder="Tất cả chi nhánh"
            showCard={true}
          />
        </div>
      )}

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
        showBranchColumn={true}
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
