"use client";

import { Input } from "@/src/shared/components/ui/Input";
import { Select } from "@/src/shared/components/ui/Select";
import { MagnifyingGlass, FunnelSimple, SortAscending } from "@phosphor-icons/react";
import type { StaffUserStatus } from "@/src/features/staff/types/user.type";

interface StaffFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: StaffUserStatus | "";
  onStatusChange: (value: StaffUserStatus | "") => void;
  sortBy: "createdAt" | "fullName" | "email";
  onSortByChange: (value: "createdAt" | "fullName" | "email") => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
}

export function StaffFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: StaffFiltersProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface-1 p-4">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        {/* Left: Search */}
        <div className="w-full lg:w-auto lg:min-w-[320px] lg:max-w-md">
          <Input
            placeholder="Tìm kiếm theo tên, email, SĐT..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<MagnifyingGlass className="h-4 w-4" />}
          />
        </div>

        {/* Right: Status Filter and Sort */}
        <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FunnelSimple className="h-4 w-4 text-muted shrink-0" />
            <Select
              value={statusFilter}
              onChange={(value) => onStatusChange(value as StaffUserStatus | "")}
              placeholder="Trạng thái"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="LOCKED">Đã khóa</option>
              <option value="INACTIVE">Không hoạt động</option>
            </Select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortAscending className="h-4 w-4 text-muted shrink-0" />
            <Select
              value={`${sortBy}-${sortOrder}`}
              onChange={(value) => {
                const [newSortBy, newSortOrder] = value.split("-") as [
                  "createdAt" | "fullName" | "email",
                  "asc" | "desc"
                ];
                onSortByChange(newSortBy);
                onSortOrderChange(newSortOrder);
              }}
            >
              <option value="createdAt-desc">Mới nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
              <option value="fullName-asc">Tên A-Z</option>
              <option value="fullName-desc">Tên Z-A</option>
              <option value="email-asc">Email A-Z</option>
              <option value="email-desc">Email Z-A</option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
