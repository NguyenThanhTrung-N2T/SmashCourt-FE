/**
 * BookingFilters Component
 * 
 * Filters for booking history (status, date range, branch, search).
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { Funnel, X, MagnifyingGlass, Calendar, CaretDown, CirclesFour, CreditCard, Storefront } from "@phosphor-icons/react";
import { Button, Select } from "@/src/shared/components/ui";
import { BranchSelector } from "@/src/features/branch/customer/components/BranchSelector";
import { BookingStatus, InvoicePaymentStatus, BookingListQuery } from "../../../shared/types/booking.types";
import { getBookingStatusConfig, getPaymentStatusConfig } from "../../utils/bookingStatus";
import { useDebounce } from "@/src/shared/hooks/useDebounceSearch";

type BookingStatusFilter = BookingStatus | string;

interface BookingFiltersProps {
  onFilterChange: (filters: Partial<BookingListQuery>) => void;
  activeFilters: Partial<BookingListQuery> & { branchName?: string };
  isLoading?: boolean;
}

const DATE_PRESETS = [
  { value: "all", label: "Tất cả thời gian" },
  { value: "today", label: "Hôm nay" },
  { value: "yesterday", label: "Hôm qua" },
  { value: "this_week", label: "7 ngày qua" },
  { value: "this_month", label: "Tháng này" },
  { value: "last_month", label: "Tháng trước" },
];

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: BookingStatus.PENDING.toString(), label: "Chờ thanh toán" },
  { value: BookingStatus.PAID_ONLINE.toString(), label: "Đã thanh toán" },
  { value: BookingStatus.IN_PROGRESS.toString(), label: "Đang chơi" },
  { value: BookingStatus.COMPLETED.toString(), label: "Hoàn thành" },
  { value: BookingStatus.CANCELLED.toString(), label: "Đã hủy" },
];

export function BookingFilters({ onFilterChange, activeFilters, isLoading }: BookingFiltersProps) {
  const [searchValue, setSearchValue] = useState(activeFilters.customerKeyword || "");
  const [datePreset, setDatePreset] = useState("all");
  const isInitialMount = useRef(true);

  const { debouncedValue: debouncedSearch, isPending: isDebounceSearching } = useDebounce(searchValue, 400);

  // Sync debounced search to parent
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const currentSearch = debouncedSearch || undefined;
    const activeSearch = activeFilters.customerKeyword || undefined;

    if (currentSearch !== activeSearch) {
      onFilterChange({ customerKeyword: currentSearch });
    }
  }, [debouncedSearch, onFilterChange, activeFilters.customerKeyword]);

  // Sync internal search value with prop (for external resets/URL changes)
  useEffect(() => {
    const propValue = activeFilters.customerKeyword || "";
    if (propValue !== searchValue) {
      setSearchValue(propValue);
    }
  }, [activeFilters.customerKeyword]);

  const isActuallyLoading = isLoading || isDebounceSearching;

  const handleStatusChange = (value: string) => {
    onFilterChange({ status: value ? (parseInt(value) as BookingStatus) : undefined });
  };

  const calculateDateRange = (preset: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let fromDate: string | undefined;
    let toDate: string | undefined;

    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    switch (preset) {
      case "today":
        fromDate = toDate = formatLocalDate(today);
        break;

      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        fromDate = toDate = formatLocalDate(yesterday);
        break;

      case "this_week":
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        fromDate = formatLocalDate(sevenDaysAgo);
        toDate = formatLocalDate(today);
        break;

      case "this_month":
        const startOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );

        fromDate = formatLocalDate(startOfMonth);
        toDate = formatLocalDate(today);
        break;

      case "last_month":
        const startOfLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );

        const endOfLastMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        );

        fromDate = formatLocalDate(startOfLastMonth);
        toDate = formatLocalDate(endOfLastMonth);
        break;

      default:
        fromDate = toDate = undefined;
    }
    return { fromDate, toDate };
  };

  const handleDatePresetChange = (value: string) => {
    setDatePreset(value);
    const { fromDate, toDate } = calculateDateRange(value);
    onFilterChange({ fromDate, toDate });
  };

  const handleBranchChange = (branchId: string) => {
    onFilterChange({ branchId: branchId || undefined });
  };

  const handleClear = () => {
    setSearchValue("");
    setDatePreset("all");
    onFilterChange({
      status: undefined,
      fromDate: undefined,
      toDate: undefined,
      branchId: undefined,
      customerKeyword: undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 bg-surface-1 p-3 rounded-2xl border border-border/60 shadow-sm transition-all duration-300">
        {/* Left: Search */}
        <div className="relative flex-1 group">
          <MagnifyingGlass
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 transition-colors duration-200 ${isActuallyLoading ? 'text-primary animate-pulse' : 'text-muted-foreground/60 group-focus-within:text-primary'}`}
            weight="bold"
          />
          <input
            type="text"
            placeholder="Tìm theo mã đặt sân, tên khách hàng..."
            className="w-full bg-surface-2 border border-border/40 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:font-normal placeholder:text-muted-foreground/40"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {isActuallyLoading && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <div className="h-3.5 w-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
          {/* Date Preset */}
          <div className="relative flex-1 sm:flex-none min-w-[140px]">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 z-10" />
            <Select
              className="!pl-9 !text-[11px] !font-bold !uppercase !tracking-wider"
              value={datePreset}
              onChange={(val) => handleDatePresetChange(val)}
            >
              {DATE_PRESETS.map((p) => (
                <option key={p.value} value={p.value} className="text-sm font-medium uppercase">{p.label}</option>
              ))}
            </Select>
          </div>

          {/* Status Select */}
          <div className="relative flex-1 sm:flex-none min-w-[140px]">
            <CirclesFour className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 z-10" />
            <Select
              className="!pl-9 !text-[11px] !font-bold !uppercase !tracking-wider"
              value={activeFilters.status?.toString() || ""}
              onChange={(val) => handleStatusChange(val)}
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value} className="text-sm font-medium uppercase">{o.label}</option>
              ))}
            </Select>
          </div>

          {/* Branch Selector - Simplified internal layout */}
          <div className="flex-1 sm:flex-none min-w-[140px]">
            <BranchSelector
              value={activeFilters.branchId || ""}
              onChange={(id) => handleBranchChange(id)}
              className="!py-2 !h-auto !text-xs !bg-surface-2 !border-border/40 !rounded-xl !font-bold !uppercase !tracking-wider"
              hideLabel
            />
          </div>

          {/* Clear Filters */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-9 w-9 rounded-xl p-0 hover:bg-surface-2 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
          >
            <X className="h-4 w-4" weight="bold" />
          </Button>
        </div>
      </div>
    </div>
  );
}
