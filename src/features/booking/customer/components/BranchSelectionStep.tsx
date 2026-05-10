/**
 * BranchSelectionStep Component
 * 
 * Step 1: Select a branch for booking.
 */

"use client";

import { MapPin, Phone, Clock } from "@phosphor-icons/react";
import { Spinner } from "@/src/shared/components/feedback/Spinner";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Badge } from "@/src/shared/components/ui/Badge";
import { useBranches } from "@/src/features/branch/customer/hooks/useBranches";
import type { BranchDto } from "@/src/features/branch/types/branch.types";
import { SmartImage } from "@/src/shared/components/ui";

interface BranchSelectionStepProps {
  selectedBranchId: string | null;
  onSelectBranch: (branch: BranchDto) => void;
}

export function BranchSelectionStep({
  selectedBranchId,
  onSelectBranch,
}: BranchSelectionStepProps) {
  const { branches, isLoading, error } = useBranches();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Lỗi">
        {error}
      </Alert>
    );
  }

  if (branches.length === 0) {
    return (
      <Alert variant="info" title="Thông báo">
        Hiện tại chưa có chi nhánh nào khả dụng.
      </Alert>
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
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border bg-surface-1 hover:border-primary/50 hover:shadow-md"
                }
              `}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute -top-2 -right-2">
                  <Badge variant="success" dot>
                    Đã chọn
                  </Badge>
                </div>
              )}

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
                </div>
              )}

              {/* Branch Name */}
              <h3 className="mb-3 text-lg font-bold text-foreground">
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
                  absolute inset-0 rounded-2xl transition-opacity
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
    </div>
  );
}
