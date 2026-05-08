"use client";

/**
 * Manager Staff Page
 * 
 * Branch manager interface for managing staff in their assigned branch
 */

import { useState, useEffect, useCallback } from "react";
import { fetchUsers, fetchUserById } from "@/src/api/user-management.api";
import type { StaffUserSummary, StaffUserDetail, StaffUserStatus } from "@/src/features/staff/types/user.type";
import type { PaginatedData } from "@/src/shared/types/api.types";
import { TableLoadingState, EmptyState, ErrorState } from "../shared/states";
import { StaffTable } from "./components/StaffTable";
import { StaffFilters } from "./components/StaffFilters";
import { CreateStaffModal } from "./components/CreateStaffModal";
import { EditStaffModal } from "./components/EditStaffModal";
import { StaffDetailModal } from "./components/StaffDetailModal";
import { useToast } from "@/src/shared/hooks/useToast";
import { Toast } from "@/src/shared/components/ui/Toast";
import { Button } from "@/src/shared/components/ui/Button";
import { Plus } from "@phosphor-icons/react";

export function ManagerStaffPage() {
  const { toast, show } = useToast();
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [staffData, setStaffData] = useState<PaginatedData<StaffUserSummary> | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StaffUserStatus | "">("");
  const [sortBy, setSortBy] = useState<"createdAt" | "fullName" | "email">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10; 
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUserDetail | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load staff list
  // Note: Backend automatically filters by manager's branch and STAFF role
  const loadStaff = useCallback(async () => {
    setTableLoading(true);
    try {
      const data = await fetchUsers({
        searchTerm: debouncedSearch || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
        page,
        pageSize,
      });

      setStaffData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách nhân viên");
      show("error", "Không thể tải danh sách nhân viên");
    } finally {
      setTableLoading(false);
    }
  }, [debouncedSearch, statusFilter, sortBy, sortOrder, page, pageSize, show]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const handleViewDetail = async (userId: string) => {
    try {
      const detail = await fetchUserById(userId);
      setSelectedStaff(detail);
      setShowDetailModal(true);
    } catch {
      show("error", "Không thể tải thông tin nhân viên");
    }
  };

  const handleEdit = async (userId: string) => {
    try {
      const detail = await fetchUserById(userId);
      setSelectedStaff(detail);
      setShowEditModal(true);
    } catch {
      show("error", "Không thể tải thông tin nhân viên");
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    show("success", "Tạo nhân viên thành công");
    loadStaff();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedStaff(null);
    show("success", "Cập nhật nhân viên thành công");
    loadStaff();
  };

  const handleActionSuccess = (message: string) => {
    show("success", message);
    loadStaff();
  };

  const handleActionError = (message: string) => {
    show("error", message);
  };

  // Show error if data fetch failed
  if (error && !staffData) {
    return <ErrorState message={error} onRetry={loadStaff} />;
  }

  const hasFilters = debouncedSearch !== "" || statusFilter !== "";
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
