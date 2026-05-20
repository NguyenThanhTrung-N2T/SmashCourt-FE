"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchUsers, fetchUserById } from "@/src/api/user-management.api";
import { fetchBranches } from "@/src/api/branch.api";
import type {
  StaffUserSummary,
  StaffUserDetail,
  StaffUserStatus,
  StaffUserRole,
} from "@/src/features/staff/shared/types/user.type";
import type { PaginatedData } from "@/src/shared/types/api.types";
import { useToast } from "@/src/shared/hooks/useToast";

interface UseStaffManagementProps {
  isOwner?: boolean;
}

interface Branch {
  id: string;
  name: string;
  status?: 0 | 1 | 2;
}

export function useStaffManagement({ isOwner = false }: UseStaffManagementProps = {}) {
  const { toast, show } = useToast();
  const [initializing, setInitializing] = useState(isOwner);
  const [tableLoading, setTableLoading] = useState(!isOwner);
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

  // Load branches on mount (Owner only)
  useEffect(() => {
    if (!isOwner) return;

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
  }, [isOwner]);

  // Load staff list
  const loadStaff = useCallback(async () => {
    if (isOwner && !selectedBranchId) {
      setStaffData(null);
      return;
    }

    setTableLoading(true);
    try {
      const data = await fetchUsers({
        branchId: isOwner ? selectedBranchId : undefined,
        role: isOwner ? (roleFilter || undefined) : undefined,
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
  }, [isOwner, selectedBranchId, roleFilter, debouncedSearch, statusFilter, sortBy, sortOrder, page, pageSize, show]);

  useEffect(() => {
    if (!initializing && (!isOwner || selectedBranchId)) {
      loadStaff();
    }
  }, [initializing, isOwner, selectedBranchId, loadStaff]);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    if (isOwner) {
      setRoleFilter("");
    }
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

  return {
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
    pageSize,
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
  };
}
