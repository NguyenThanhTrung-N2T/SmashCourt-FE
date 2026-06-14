/**
 * TimeGridSelector Component
 * 
 * Component for displaying and selecting available time slots from a time grid.
 */

"use client";

import { useState, useEffect } from "react";
import { Clock, LockKey, XCircle } from "@phosphor-icons/react";
import { Spinner } from "@/src/shared/components/feedback/Spinner";
import { Alert } from "@/src/shared/components/ui/Alert";
import { useTimeGrid } from "../hooks/useTimeGrid";
import { formatTime, formatDuration, calculateDuration } from "../utils/timeFormat";
import { TimeSlotStatus } from "../types/timeslot.types";
import type { TimeGridSlotDto } from "../types/timeslot.types";

interface TimeGridSelectorProps {
  branchId: string;
  courtId: string;
  courtName: string;
  date: string; // YYYY-MM-DD
  selectedSlots: TimeGridSlotDto[];
  onSlotsChange: (slots: TimeGridSlotDto[]) => void;
}

export function TimeGridSelector({
  branchId,
  courtId,
  courtName,
  date,
  selectedSlots,
  onSlotsChange,
}: TimeGridSelectorProps) {
  const { slots, isLoading, error } = useTimeGrid({
    branchId,
    courtId,
    date,
  });

  const handleSlotClick = (slot: TimeGridSlotDto) => {
    if (slot.status !== TimeSlotStatus.AVAILABLE) return;

    const isSelected = selectedSlots.some((s) => s.startTime === slot.startTime);

    if (isSelected) {
      // Deselect
      onSlotsChange(selectedSlots.filter((s) => s.startTime !== slot.startTime));
    } else {
      // Select - keep sorted by time
      const newSlots = [...selectedSlots, slot].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
      onSlotsChange(newSlots);
    }
  };

  const isSlotSelected = (slot: TimeGridSlotDto) => {
    return selectedSlots.some((s) => s.startTime === slot.startTime);
  };

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

  if (slots.length === 0) {
    return (
      <Alert variant="info" title="Thông báo">
        Không có khung giờ nào khả dụng cho ngày này.
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Court Info */}
      <div className="rounded-xl border-2 border-border bg-surface-1 p-4">
        <h3 className="text-lg font-bold text-foreground">{courtName}</h3>
        <p className="text-sm text-muted">Chọn khung giờ bạn muốn đặt</p>
      </div>

      {/* Time Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {slots.map((slot) => (
          <TimeSlotButton
            key={slot.startTime}
            slot={slot}
            isSelected={isSlotSelected(slot)}
            onClick={() => handleSlotClick(slot)}
          />
        ))}
      </div>

      {/* Selection Summary */}
      {selectedSlots.length > 0 && (
        <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-foreground">
            Đã chọn
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Thời gian:</span>
              <span className="font-semibold text-foreground">
                {formatTime(selectedSlots[0].startTime)} -{" "}
                {formatTime(selectedSlots[selectedSlots.length - 1].endTime)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Thời lượng:</span>
              <span className="font-semibold text-foreground">
                {formatDuration(
                  calculateDuration(
                    selectedSlots[0].startTime,
                    selectedSlots[selectedSlots.length - 1].endTime
                  )
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-primary"></div>
          <span className="text-muted">Có sẵn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-amber-500"></div>
          <span className="text-muted">Đang giữ chỗ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-muted/30"></div>
          <span className="text-muted">Đã đặt</span>
        </div>
      </div>
    </div>
  );
}

interface TimeSlotButtonProps {
  slot: TimeGridSlotDto;
  isSelected: boolean;
  onClick: () => void;
}

function TimeSlotButton({ slot, isSelected, onClick }: TimeSlotButtonProps) {
  const isAvailable = slot.status === TimeSlotStatus.AVAILABLE;
  const isLocked = slot.status === TimeSlotStatus.LOCKED;
  const isInUse = slot.status === TimeSlotStatus.IN_USE;

  const [lockSeconds, setLockSeconds] = useState(slot.lockRemainingSeconds || 0);

  useEffect(() => {
    if (!isLocked || !slot.lockRemainingSeconds) return;

    const timer = setTimeout(() => {
      setLockSeconds(slot.lockRemainingSeconds || 0);
    }, 0);

    const interval = setInterval(() => {
      setLockSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isLocked, slot.lockRemainingSeconds]);

  const getButtonClass = () => {
    const baseClass =
      "relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all";

    if (isSelected) {
      return `${baseClass} border-primary bg-primary text-white shadow-md`;
    }

    if (isAvailable) {
      return `${baseClass} border-border bg-surface-1 hover:border-primary hover:bg-primary/10 cursor-pointer`;
    }

    if (isLocked) {
      return `${baseClass} border-amber-500/30 bg-amber-500/10 cursor-not-allowed opacity-70`;
    }

    if (isInUse) {
      return `${baseClass} border-border bg-muted/10 cursor-not-allowed opacity-50`;
    }

    return baseClass;
  };

  const getIcon = () => {
    if (isLocked) return <LockKey className="h-5 w-5 text-amber-500" />;
    if (isInUse) return <XCircle className="h-5 w-5 text-muted" />;
    return <Clock className="h-5 w-5 text-primary" />;
  };

  const getLabel = () => {
    if (isLocked) {
      const minutes = Math.ceil(lockSeconds / 60);
      return `Giữ chỗ (${minutes}p)`;
    }
    if (isInUse) return "Đã đặt";
    return "Có sẵn";
  };

  return (
    <button
      type="button"
      className={getButtonClass()}
      onClick={onClick}
      disabled={!isAvailable}
    >
      <div className="mb-2">{getIcon()}</div>
      <div className="text-sm font-bold">
        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
      </div>
      <div className="mt-1 text-xs opacity-80">{getLabel()}</div>
    </button>
  );
}
