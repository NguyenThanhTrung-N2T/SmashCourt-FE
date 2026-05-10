/**
 * BookingFilters Component
 * 
 * Filters for booking history (status, date range).
 */

"use client";

import { useState } from "react";
import { Funnel, X } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { Select } from "@/src/shared/components/ui/Select";
import { Input } from "@/src/shared/components/ui/Input";
import { Badge } from "@/src/shared/components/ui/Badge";
import { BookingStatus } from "../../types/booking.types";
import { getBookingStatusConfig } from "../utils/bookingStatus";

interface BookingFiltersProps {
  onFilterChange: (filters: {
    status?: BookingStatus;
    date?: string;
  }) => void;
  activeFilters: {
    status?: BookingStatus;
    date?: string;
  };
}

export function BookingFilters({ onFilterChange, activeFilters }: BookingFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(activeFilters);

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: BookingStatus.PENDING.toString(), label: "Chờ thanh toán" },
    { value: BookingStatus.PAID_ONLINE.toString(), label: "Đã thanh toán" },
    { value: BookingStatus.IN_PROGRESS.toString(), label: "Đang chơi" },
    { value: BookingStatus.COMPLETED.toString(), label: "Hoàn thành" },
    { value: BookingStatus.CANCELLED.toString(), label: "Đã hủy" },
  ];

  const handleStatusChange = (value: string) => {
    const status = value ? parseInt(value) as BookingStatus : undefined;
    setLocalFilters((prev) => ({ ...prev, status }));
  };

  const handleDateChange = (value: string) => {
    setLocalFilters((prev) => ({ ...prev, date: value || undefined }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    setIsExpanded(false);
  };

  const handleClear = () => {
    setLocalFilters({});
    onFilterChange({});
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="rounded-xl border-2 border-border bg-surface-1 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Funnel className="h-5 w-5 text-muted" />
          <span className="font-bold text-foreground">Bộ lọc</span>
          {activeFilterCount > 0 && (
            <Badge variant="info" size="sm">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Thu gọn" : "Mở rộng"}
        </Button>
      </div>

      {/* Active Filters Summary */}
      {!isExpanded && activeFilterCount > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilters.status !== undefined && (
            <Badge variant="info" size="sm">
              {getBookingStatusConfig(activeFilters.status).label}
            </Badge>
          )}
          {activeFilters.date && (
            <Badge variant="info" size="sm">
              {new Date(activeFilters.date).toLocaleDateString("vi-VN")}
            </Badge>
          )}
        </div>
      )}

      {/* Filter Controls */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted">
              Trạng thái
            </label>
            <Select
              value={localFilters.status?.toString() || ""}
              onChange={handleStatusChange}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Ngày đặt"
            type="date"
            value={localFilters.date || ""}
            onChange={(e) => handleDateChange(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={handleClear}
              leftIcon={<X className="h-4 w-4" />}
            >
              Xóa bộ lọc
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={handleApply}
            >
              Áp dụng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
