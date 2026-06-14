/**
 * Shared Staff Page States
 * 
 * Loading, empty, and error states for staff management pages
 * Used by both Manager and Owner staff pages
 */

import { TableSkeleton } from "@/src/shared/components/feedback";
import { Button } from "@/src/shared/components/ui/Button";
import { Users, MagnifyingGlassPlus } from "@phosphor-icons/react";

/**
 * Page loading state - shown during initial page load
 */
export function PageLoadingState() {
  return (
    <div className="w-full animate-slide-up space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-surface-2 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-surface-2 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-40 bg-surface-2 rounded-full animate-pulse" />
      </div>

      {/* Filters Skeleton */}
      <div className="rounded-2xl border border-border bg-surface-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-10 bg-surface-2 rounded-xl animate-pulse" />
          <div className="h-10 bg-surface-2 rounded-xl animate-pulse" />
          <div className="h-10 bg-surface-2 rounded-xl animate-pulse" />
          <div className="h-10 bg-surface-2 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={5} columns={5} />
    </div>
  );
}

/**
 * Table loading state - shown when fetching staff list
 */
export function TableLoadingState() {
  return (
    <div className="w-full animate-slide-up">
      <TableSkeleton rows={5} columns={5} />
    </div>
  );
}

/**
 * Empty state - shown when no staff members found
 */
interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface-1 py-16 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
        {hasFilters ? (
          <MagnifyingGlassPlus className="h-8 w-8 text-muted" />
        ) : (
          <Users className="h-8 w-8 text-muted" />
        )}
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">
        {hasFilters ? "Không tìm thấy nhân viên" : "Chưa có nhân viên"}
      </h3>
      <p className="mt-2 text-center text-sm text-muted max-w-md">
        {hasFilters
          ? "Không tìm thấy nhân viên nào phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm."
          : "Bạn chưa có nhân viên nào trong chi nhánh. Hãy thêm nhân viên đầu tiên."}
      </p>
      {hasFilters && onClearFilters && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onClearFilters}
          className="mt-4"
        >
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );
}

/**
 * Error state - shown when API request fails
 */
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 py-16 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
        <svg
          className="h-8 w-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">Đã xảy ra lỗi</h3>
      <p className="mt-2 text-center text-sm text-muted max-w-md">{message}</p>
      <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">
        Thử lại
      </Button>
    </div>
  );
}
