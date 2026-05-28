/**
 * CourtAndTimeSelectionStep Component
 * 
 * Step 3: Select court and time slots with drag-to-select time grid.
 */

"use client";

import { Calendar, Lightning } from "@phosphor-icons/react";
import { Spinner } from "@/src/shared/components/feedback/Spinner";
import { useCourts } from "@/src/features/court/shared/hooks/useCourts";
import { InteractiveTimeGrid } from '@/src/features/booking/shared/components/new';
import { CourtSelectionLoading, BookingErrorState, BookingEmptyState } from "../../states";
import type { CourtDto } from "@/src/features/court/shared/types/court.types";
import type { TimeGridSlotDto } from "@/src/features/timeslot/types";

interface CourtAndTimeSelectionStepProps {
  branchId: string;
  courtTypeId: string;
  selectedCourtId: string | null;
  selectedDate: string; // YYYY-MM-DD
  selectedSlots: TimeGridSlotDto[];
  onSelectCourt: (court: CourtDto) => void;
  onDateChange: (date: string) => void;
  onSlotsChange: (slots: TimeGridSlotDto[]) => void;
  totalAmount?: number;
  isCalculatingPrice?: boolean;
}

export function CourtAndTimeSelectionStep({
  branchId,
  courtTypeId,
  selectedCourtId,
  selectedDate,
  selectedSlots,
  onSelectCourt,
  onDateChange,
  onSlotsChange,
  totalAmount = 0,
  isCalculatingPrice = false,
}: CourtAndTimeSelectionStepProps) {
  const { courts, isLoading: courtsLoading, error: courtsError } = useCourts({
    branchId,
    courtTypeId,
  });

  if (courtsLoading) {
    return <CourtSelectionLoading />;
  }

  if (courtsError) {
    return <BookingErrorState message={courtsError} />;
  }

  if (courts.length === 0) {
    return (
      <BookingEmptyState
        title="Không có sân khả dụng"
        description="Không có sân nào khả dụng cho loại sân này."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="flex items-center gap-2.5 text-2xl font-bold text-foreground">
          Chọn sân và thời gian
        </h2>
        <p className="mt-2 text-sm text-muted">
          Kéo trực tiếp trên thanh thời gian để chọn khoảng giờ. Hệ thống sẽ tự động snap theo khung 30 phút.
        </p>
      </div>

      {/* Date Selector */}
      <div className="rounded-2xl border border-border bg-surface-1 p-6">
        <label className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
          <Calendar className="h-4 w-4" />
          Chọn ngày
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground outline-none transition-colors hover:border-primary focus:border-primary focus:bg-surface-1 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Interactive Time Grid */}
      <InteractiveTimeGrid
        branchId={branchId}
        courts={courts}
        selectedDate={selectedDate}
        selectedCourtId={selectedCourtId}
        selectedSlots={selectedSlots}
        onSelectCourt={onSelectCourt}
        onSlotsChange={onSlotsChange}
      />

      {/* Live Summary Bar */}
      {selectedSlots.length > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
              Tạm tính
            </h3>
            <p className="mt-1 font-medium text-foreground">
              {selectedSlots.length} khung giờ đã chọn
            </p>
          </div>
          <div className="text-right">
            {isCalculatingPrice ? (
              <div className="flex items-center justify-end gap-2 text-primary">
                <Spinner size="sm" />
                <span className="text-sm font-medium">Đang tính...</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-primary">
                {totalAmount.toLocaleString("vi-VN")} đ
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
