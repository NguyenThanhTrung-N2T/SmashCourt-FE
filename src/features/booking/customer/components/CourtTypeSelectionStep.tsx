/**
 * CourtTypeSelectionStep Component
 * 
 * Step 2: Select a court type.
 */

"use client";

import { CourtBasketball } from "@phosphor-icons/react";
import { useCourtTypes } from "@/src/features/court/customer/hooks/useCourtTypes";
import { CourtTypeSelectionLoading } from "./states/CourtTypeSelectionLoading";
import { BookingErrorState } from "./states/BookingErrorState";
import { BookingEmptyState } from "./states/BookingEmptyState";
import type { CourtType } from "@/src/shared/types/court-type.types";

interface CourtTypeSelectionStepProps {
  selectedCourtTypeId: string | null;
  onSelectCourtType: (courtType: CourtType) => void;
}

export function CourtTypeSelectionStep({
  selectedCourtTypeId,
  onSelectCourtType,
}: CourtTypeSelectionStepProps) {
  const { courtTypes, isLoading, error } = useCourtTypes();

  if (isLoading) {
    return <CourtTypeSelectionLoading />;
  }

  if (error) {
    return <BookingErrorState message={error} />;
  }

  if (courtTypes.length === 0) {
    return (
      <BookingEmptyState
        title="Chưa có loại sân"
        description="Hiện tại chưa có loại sân nào khả dụng."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Chọn loại sân</h2>
        <p className="mt-1 text-sm text-muted">
          Chọn loại sân bạn muốn đặt
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {courtTypes.map((courtType) => {
          const isSelected = selectedCourtTypeId === courtType.id;

          return (
            <button
              key={courtType.id}
              onClick={() => onSelectCourtType(courtType)}
              className={`
                group relative rounded-2xl border-2 p-6 text-center transition-all
                ${isSelected
                  ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                  : "border-border bg-surface-1 hover:border-primary/50 hover:shadow-md"
                }
              `}
            >
              {/* Court Type Icon */}
              <div className="mb-4 flex justify-center">
                <div
                  className={`
                    flex h-16 w-16 items-center justify-center rounded-2xl transition-all relative
                    ${isSelected ? "bg-primary/20" : "bg-surface-2 group-hover:bg-primary/10"}
                  `}
                >
                  <CourtBasketball className={`h-8 w-8 ${isSelected ? "text-primary" : "text-muted"}`} />
                  {/* Selected Checkmark */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Court Type Name */}
              <h3 className={`mb-2 text-lg font-bold transition-colors ${isSelected ? "text-primary" : "text-foreground"}`}>
                {courtType.name}
              </h3>

              {/* Court Type Description */}
              {courtType.description && (
                <p className="text-xs text-muted line-clamp-2">
                  {courtType.description}
                </p>
              )}

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
    </div>
  );
}
