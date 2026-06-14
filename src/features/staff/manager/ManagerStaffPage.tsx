"use client";

import { useStaffManagement } from "@/src/features/staff/shared/hooks/useStaffManagement";
import { TableLoadingState, EmptyState, ErrorState } from "../shared/components/states";
import { StaffTable } from "../shared/components/StaffTable";
import { StaffFilters } from "../shared/components/StaffFilters";
import { CreateStaffModal, StaffDetailModal, EditStaffModal } from "../shared/components";
import { Toast, Button } from "@/src/shared/components/ui";
import { Plus } from "@phosphor-icons/react";

export function ManagerStaffPage() {
  const {
    toast,
    tableLoading,
    error,
    staffData,
    searchTerm,
    setSearchTerm,
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
    handleClearFilters,
    handleViewDetail,
    handleEdit,
    handleCreateSuccess,
    handleEditSuccess,
    handleActionSuccess,
    handleActionError,
  } = useStaffManagement({ isOwner: false });

  // Show error if data fetch failed
  if (error && !staffData) {
    return <ErrorState message={error} onRetry={loadStaff} />;
  }

  const hasFilters = searchTerm !== "" || statusFilter !== "";
  const isEmpty = !staffData || staffData.items.length === 0;

  return (
    <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Quản lý nhân viên</h1>
          <p className="text-sm text-muted mt-1">Quản lý nhân viên trong chi nhánh của bạn</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          Thêm nhân viên
        </Button>
      </div>

      {/* Filters */}
      <StaffFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      {/* Content */}
      {tableLoading ? (
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
        />
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateStaffModal
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
