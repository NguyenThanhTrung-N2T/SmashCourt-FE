/**
 * BranchSelectionStep Component
 * 
 * Step 1: Select a branch for booking.
 */

"use client";

import { useState } from "react";
import { MapPin, Phone, Clock } from "@phosphor-icons/react";
import { useBranches } from "@/src/features/branch/customer/hooks/useBranches";
import type { BranchBasicDto } from "@/src/features/branch/shared/types/branch.types";
import { SmartImage, Pagination } from "@/src/shared/components/ui";
import { BranchSelectionLoading, BookingErrorState, BookingEmptyState } from "../../states";

const PAGE_SIZE = 9;

interface BranchSelectionStepProps {
  selectedBranchId: string | null;
  onSelectBranch: (branch: BranchBasicDto) => void;
}

export function BranchSelectionStep({
  selectedBranchId,
  onSelectBranch,
}: BranchSelectionStepProps) {
  const [page, setPage] = useState(1);
  const { branches, totalItems, totalPages, isLoading, error } = useBranches(page, PAGE_SIZE);

  if (isLoading) {
    return <BranchSelectionLoading />;
  }

  if (error) {
    return <BookingErrorState message={error} />;
  }

  if (branches.length === 0) {
    return (
      <BookingEmptyState
        title="Chưa có chi nhánh"
        description="Hiện tại chưa có chi nhánh nào khả dụng."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Chọn chi nhánh</h2>
        <p className="mt-1 text-sm text-muted">
          Chọn chi nhánh bạn muốn đặt sân
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => {
          const isSelected = selectedBranchId === branch.id;

          return (
            <button
              key={branch.id}
              onClick={() => onSelectBranch(branch)}
              className={`
                group relative rounded-2xl border-2 p-6 text-left transition-all
                ${isSelected
                  ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                  : "border-border bg-surface-1 hover:border-primary/50 hover:shadow-md"
                }
              `}
            >
              {/* Branch Avatar */}
              {branch.avatarUrl && (
                <div className="relative mb-4 h-32 w-full overflow-hidden rounded-xl">
                  <SmartImage
                    src={branch.avatarUrl}
                    alt={branch.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                  {/* Selected Overlay on Image */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    </div>
                  )}
                </div>
              )}

              {/* Branch Name */}
              <h3 className={`mb-3 text-lg font-bold transition-colors ${isSelected ? "text-primary" : "text-foreground"}`}>
                {branch.name}
              </h3>

              {/* Branch Details */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                  <span className="text-muted line-clamp-2">{branch.address}</span>
                </div>

                {branch.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 shrink-0 text-muted" />
                    <span className="text-muted">{branch.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 shrink-0 text-muted" />
                  <span className="text-muted">
                    {branch.openTime.substring(0, 5)} - {branch.closeTime.substring(0, 5)}
                  </span>
                </div>
              </div>

              {/* Hover Effect */}
              <div
                className={`
                  absolute inset-0 rounded-2xl transition-opacity pointer-events-none
                  ${isSelected ? "opacity-0" : "opacity-0 group-hover:opacity-100"}
                `}
                style={{
                  background: "linear-gradient(135deg, rgba(42, 157, 92, 0.05) 0%, rgba(27, 94, 56, 0.05) 100%)",
                }}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="chi nhánh"
        />
      </div>
    </div>
  );
}
