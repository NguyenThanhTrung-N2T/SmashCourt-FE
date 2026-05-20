"use client";

/**
 * Owner Staff Page
 * 
 * Owner interface for managing all staff (STAFF and BRANCH_MANAGER) across branches
 */

import { useStaffManagement } from "@/src/features/staff/shared/hooks/useStaffManagement";
import { BranchSelector } from "@/src/shared/components/layout/BranchSelector";
import { PageLoadingState, TableLoadingState, EmptyState, ErrorState } from "../shared/components/states";
import { StaffTable } from "../shared/components/StaffTable";
import { StaffFilters } from "../shared/components/StaffFilters";
import { CreateStaffModal } from "../shared/components/CreateStaffModal";
import { EditStaffModal } from "../shared/components/EditStaffModal";
import { StaffDetailModal } from "../shared/components/StaffDetailModal";
import { Toast } from "@/src/shared/components/ui/Toast";
import { Button } from "@/src/shared/components/ui/Button";
import { Plus } from "@phosphor-icons/react";

export function OwnerStaffPage() {
  const {
    toast,
    initializing,
    tableLoading,
    error,
    branches,
    selectedBranchId,
    staffData,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    page,
    setPage,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDetailModal,
    setShowDetailModal,
    selectedStaff,
    setSelectedStaff,
    loadStaff,
    handleBranchChange,
    handleClearFilters,
    handleViewDetail,
    handleEdit,
    handleCreateSuccess,
    handleEditSuccess,
    handleActionSuccess,
    handleActionError,
  } = useStaffManagement({ isOwner: true });

  if (initializing) {
    return <PageLoadingState />;
  }

  if (error && branches.length === 0) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const hasFilters = searchTerm !== "" || roleFilter !== "" || statusFilter !== "";
  const isEmpty = !staffData || staffData.items.length === 0;

  return (
    <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Quản lý nhân viên</h1>
          <p className="text-sm text-muted mt-1">Quản lý nhân viên và quản lý chi nhánh</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowCreateModal(true)}
          disabled={!selectedBranchId}
        >
          Thêm nhân viên
        </Button>
      </div>

      {/* Branch Selector */}
      {branches.length > 0 && (
        <BranchSelector
          branches={branches}
          selectedBranchId={selectedBranchId}
          onBranchChange={handleBranchChange}
        />
      )}

      {/* Filters */}
      {selectedBranchId && (
        <StaffFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />
      )}

      {/* Content */}
      {!selectedBranchId ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface-1 py-16 px-6">
          <p className="text-sm text-muted">Vui lòng chọn chi nhánh để xem danh sách nhân viên</p>
        </div>
      ) : tableLoading ? (
        <TableLoadingState />
      ) : isEmpty ? (
        <EmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
      ) : (
        <StaffTable
          data={staffData!}
          page={page}
          onPageChange={setPage}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onActionSuccess={handleActionSuccess}
          onActionError={handleActionError}
          isOwner
        />
      )}

      {/* Modals */}
      {showCreateModal && selectedBranchId && (
        <CreateStaffModal
          branchId={selectedBranchId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          onError={handleActionError}
        />
      )}

      {showEditModal && selectedStaff && (
        <EditStaffModal
          staff={selectedStaff}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStaff(null);
          }}
          onSuccess={handleEditSuccess}
          onError={handleActionError}
        />
      )}

      {showDetailModal && selectedStaff && (
        <StaffDetailModal
          staff={selectedStaff}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedStaff(null);
          }}
          onEdit={() => {
            setShowDetailModal(false);
            setShowEditModal(true);
          }}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
