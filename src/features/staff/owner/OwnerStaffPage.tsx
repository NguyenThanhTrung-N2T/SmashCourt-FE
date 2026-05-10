"use client";

/**
 * Owner Staff Page
 * 
 * Owner interface for managing all staff (STAFF and BRANCH_MANAGER) across branches
 */

import { useState, useEffect, useCallback } from "react";
import { fetchUsers, fetchUserById } from "@/src/api/user-management.api";
import { fetchBranches } from "@/src/api/branch.api";
import type { StaffUserSummary, StaffUserDetail, StaffUserStatus, StaffUserRole } from "@/src/features/staff/types/user.type";
import type { PaginatedData } from "@/src/shared/types/api.types";
import { BranchSelector } from "@/src/shared/components/layout/BranchSelector";
import { PageLoadingState, TableLoadingState, EmptyState, ErrorState } from "../shared/states";
import { OwnerStaffTable } from "./components/OwnerStaffTable";
import { OwnerStaffFilters } from "./components/OwnerStaffFilters";
import { CreateStaffModal } from "./components/CreateStaffModal";
import { EditStaffModal } from "../manager/components/EditStaffModal";
import { StaffDetailModal } from "../manager/components/StaffDetailModal";
import { useToast } from "@/src/shared/hooks/useToast";
import { Toast } from "@/src/shared/components/ui/Toast";
import { Button } from "@/src/shared/components/ui/Button";
import { Plus } from "@phosphor-icons/react";

interface Branch {
  id: string;
  name: string;
  status?: 0 | 1 | 2;
}

export function OwnerStaffPage() {
  const { toast, show } = useToast();
  const [initializing, setInitializing] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [staffData, setStaffData] = useState<PaginatedData<StaffUserSummary> | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<StaffUserRole | "">("");
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

  // Load branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchesData = await fetchBranches(1, 50); // Get first 50 branches
        const branchList = branchesData.items || [];
        setBranches(branchList);
        
        // Auto-select first branch if available
        if (branchList.length > 0) {
          setSelectedBranchId(branchList[0].id);
        }
        
        setInitializing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải danh sách chi nhánh");
        setInitializing(false);
      }
    };

    loadBranches();
  }, []);

  // Load staff list when branch or filters change
  const loadStaff = useCallback(async () => {
    if (!selectedBranchId) {
      setStaffData(null);
      return;
    }

    setTableLoading(true);
    try {
      const data = await fetchUsers({
        branchId: selectedBranchId,
        role: roleFilter || undefined,
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
  }, [selectedBranchId, roleFilter, debouncedSearch, statusFilter, sortBy, sortOrder, page, pageSize, show]);

  useEffect(() => {
    if (!initializing && selectedBranchId) {
      loadStaff();
    }
  }, [initializing, selectedBranchId, loadStaff]);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setRoleFilter("");
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

  if (initializing) {
    return <PageLoadingState />;
  }

  if (error && branches.length === 0) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const hasFilters = debouncedSearch !== "" || roleFilter !== "" || statusFilter !== "";
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
        <OwnerStaffFilters
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
        <OwnerStaffTable
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
