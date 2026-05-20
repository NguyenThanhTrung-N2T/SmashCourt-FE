/**
 * CourtTrack Component
 * 
 * Individual court timeline track for drag-to-select booking.
 */

"use client";

import { useEffect, useMemo } from "react";
import { Spinner } from "@/src/shared/components/feedback/Spinner";
import { useTimeGrid } from "@/src/features/timeslot/hooks/useTimeGrid";
import { TimeSlotStatus } from "@/src/features/timeslot/types";
import type { CourtDto } from "@/src/features/court/shared/types/court.types";
import type { TimeGridSlotDto } from "@/src/features/timeslot/types";

const START_HOUR = 6;
const SLOT_STEP_MINUTES = 30;

interface CourtTrackProps {
  court: CourtDto;
  branchId: string;
  selectedDate: string;
  isSelected: boolean;
  selectedSlots: TimeGridSlotDto[];
  totalBlocks: number;
  dragging: { courtId: string; originIdx: number; startIdx: number; endIdx: number } | null;
  trackRef: (el: HTMLDivElement | null) => void;
  onMouseDown: (clientX: number) => void;
  onMouseMove: (clientX: number) => void;
  onSlotsChange: (slots: TimeGridSlotDto[]) => void;
}

export function CourtTrack({
  court,
  branchId,
  selectedDate,
  isSelected,
  selectedSlots,
  totalBlocks,
  dragging,
  trackRef,
  onMouseDown,
  onMouseMove,
  onSlotsChange,
}: CourtTrackProps) {
  const { slots, isLoading } = useTimeGrid({
    branchId,
    courtId: court.id,
    date: selectedDate,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  // Create a map of block index to slot for quick lookup
  const blockToSlotMap = useMemo(() => {
    const map = new Map<number, TimeGridSlotDto>();

    const now = new Date();
    const [year, month, day] = selectedDate.split("-").map(Number);
    const selectedDateObj = new Date(year, month - 1, day);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isToday = selectedDateObj.getTime() === today.getTime();
    const isPastDate = selectedDateObj < today;

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    slots.forEach((slot) => {
      const [startHours, startMinutes] = slot.startTime.split(":").map(Number);
      const [endHours, endMinutes] = slot.endTime.split(":").map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      const startMinutesBase = START_HOUR * 60;

      let effectiveStatus = slot.status;
      if (isPastDate) {
        effectiveStatus = TimeSlotStatus.IN_USE;
      } else if (isToday && startTotalMinutes < currentTotalMinutes) {
        effectiveStatus = TimeSlotStatus.IN_USE;
      }

      const effectiveSlot = { ...slot, status: effectiveStatus };

      // Each slot may span multiple 30-min blocks — map all of them
      const slotDurationMinutes = endTotalMinutes - startTotalMinutes;
      const numBlocks = slotDurationMinutes / SLOT_STEP_MINUTES;
      const startBlockIdx = Math.floor((startTotalMinutes - startMinutesBase) / SLOT_STEP_MINUTES);

      for (let i = 0; i < numBlocks; i++) {
        const blockIdx = startBlockIdx + i;
        if (blockIdx >= 0 && blockIdx < totalBlocks) {
          map.set(blockIdx, effectiveSlot);
        }
      }
    });

    return map;
  }, [slots, totalBlocks, selectedDate]);

  // Group consecutive blocked indices by slot for rendering
  const blockedSlotRanges = useMemo(() => {
    const ranges: Array<{ startIdx: number; endIdx: number; slot: TimeGridSlotDto }> = [];
    const processedSlots = new Set<TimeGridSlotDto>();

    blockToSlotMap.forEach((slot, idx) => {
      if (slot.status !== TimeSlotStatus.AVAILABLE && !processedSlots.has(slot)) {
        processedSlots.add(slot);

        // Find all blocks for this slot
        const slotBlocks: number[] = [];
        blockToSlotMap.forEach((s, i) => {
          if (s === slot) {
            slotBlocks.push(i);
          }
        });

        if (slotBlocks.length > 0) {
          slotBlocks.sort((a, b) => a - b);
          ranges.push({
            startIdx: slotBlocks[0],
            endIdx: slotBlocks[slotBlocks.length - 1],
            slot,
          });
        }
      }
    });

    return ranges;
  }, [blockToSlotMap]);

  // Convert selected slots to overlay range
  const selectedOverlay = useMemo(() => {
    if (!isSelected || selectedSlots.length === 0) return null;

    const firstSlot = selectedSlots[0];
    const lastSlot = selectedSlots[selectedSlots.length - 1];

    const [startHours, startMinutes] = firstSlot.startTime.split(":").map(Number);
    const [endHours, endMinutes] = lastSlot.endTime.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const startMinutesBase = START_HOUR * 60;

    const startIdx = Math.floor((startTotalMinutes - startMinutesBase) / SLOT_STEP_MINUTES);
    // endIdx is the last block covered by the last slot (endTime - 1 block)
    const endIdx = Math.floor((endTotalMinutes - startMinutesBase) / SLOT_STEP_MINUTES) - 1;

    return { startIdx, endIdx };
  }, [isSelected, selectedSlots]);

  // Convert dragging to overlay
  const draggingOverlay = useMemo(() => {
    if (!dragging) return null;

    const isForward = dragging.endIdx >= dragging.originIdx;
    const step = isForward ? 1 : -1;

    const slotSet = new Set<TimeGridSlotDto>();

    for (let idx = dragging.originIdx; isForward ? idx <= dragging.endIdx : idx >= dragging.endIdx; idx += step) {
      const slot = blockToSlotMap.get(idx);
      if (!slot || slot.status !== TimeSlotStatus.AVAILABLE) {
        break;
      }
      slotSet.add(slot);
    }

    if (slotSet.size === 0) return null;

    let expandedMinIdx = 9999;
    let expandedMaxIdx = -1;

    blockToSlotMap.forEach((slot, idx) => {
      if (slotSet.has(slot)) {
        expandedMinIdx = Math.min(expandedMinIdx, idx);
        expandedMaxIdx = Math.max(expandedMaxIdx, idx);
      }
    });

    return {
      startIdx: expandedMinIdx,
      endIdx: expandedMaxIdx,
    };
  }, [dragging, blockToSlotMap]);

  const overlay = draggingOverlay || selectedOverlay;

  // Handle dragging to select slots (updates in real-time during drag)
  useEffect(() => {
    if (!dragging || !isSelected) return;

    const isForward = dragging.endIdx >= dragging.originIdx;
    const step = isForward ? 1 : -1;

    const slotSet = new Set<TimeGridSlotDto>();

    for (
      let idx = dragging.originIdx;
      isForward ? idx <= dragging.endIdx : idx >= dragging.endIdx;
      idx += step
    ) {
      const slot = blockToSlotMap.get(idx);

      if (!slot || slot.status !== TimeSlotStatus.AVAILABLE) {
        break;
      }

      slotSet.add(slot);
    }

    const nextSlots = Array.from(slotSet).sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    const same =
      nextSlots.length === selectedSlots.length &&
      nextSlots.every(
        (slot, index) =>
          slot.startTime === selectedSlots[index]?.startTime &&
          slot.endTime === selectedSlots[index]?.endTime
      );

    if (same) return;

    onSlotsChange(nextSlots);
  }, [
    dragging?.originIdx,
    dragging?.endIdx,
    isSelected,
    blockToSlotMap,
    selectedSlots,
    onSlotsChange,
  ]);

  return (
    <div className="flex items-center gap-4">
      <div className="w-[150px] rounded-2xl border border-border bg-surface-1 px-4 py-3.5 text-[15px] font-semibold text-foreground shadow-sm">
        <div className="flex items-center gap-2">
          <span>{court.name}</span>
        </div>
      </div>

      <div
        ref={trackRef}
        onMouseDown={(e) => onMouseDown(e.clientX)}
        onMouseMove={(e) => onMouseMove(e.clientX)}
        className="relative h-14 flex-1 cursor-crosshair rounded-2xl border border-border bg-surface-1 shadow-sm transition-all hover:border-primary/50"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(148,163,184,0.2) 1px, transparent 1px)`,
          backgroundSize: `${100 / totalBlocks}% 100%`,
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-1/80">
            <Spinner size="sm" />
          </div>
        )}

        {/* Blocked slots */}
        {blockedSlotRanges.map((range) => {
          const isLocked = range.slot.status === TimeSlotStatus.LOCKED;
          const key = `blocked-${range.startIdx}`;

          return (
            <div
              key={key}
              className={`pointer-events-none absolute inset-y-1 rounded-lg transition-all ${isLocked ? "bg-amber-500/70" : "bg-muted/50"
                }`}
              style={{
                left: `${(range.startIdx / totalBlocks) * 100}%`,
                width: `${((range.endIdx - range.startIdx + 1) / totalBlocks) * 100}%`,
              }}
            />
          );
        })}

        {/* Selection overlay */}
        {overlay && (
          <div
            className="pointer-events-none absolute inset-y-1 rounded-lg bg-primary shadow-[0_0_0_2px_rgba(var(--primary-rgb),0.25)] transition-all"
            style={{
              left: `${(overlay.startIdx / totalBlocks) * 100}%`,
              width: `${((overlay.endIdx - overlay.startIdx + 1) / totalBlocks) * 100}%`,
            }}
          />
        )}

        {/* Time label */}
        {overlay && (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-y-[115%] rounded-full border border-primary bg-surface-1 px-3 py-1 text-xs font-semibold text-primary shadow-sm"
            style={{
              left: `${(overlay.startIdx / totalBlocks) * 100}%`,
              transform: "translateX(-2px) translateY(-115%)",
            }}
          >
            {(() => {
              const startMinutes = START_HOUR * 60 + overlay.startIdx * SLOT_STEP_MINUTES;
              const endMinutes = START_HOUR * 60 + (overlay.endIdx + 1) * SLOT_STEP_MINUTES;
              const startHours = Math.floor(startMinutes / 60);
              const startMins = startMinutes % 60;
              const endHours = Math.floor(endMinutes / 60);
              const endMins = endMinutes % 60;
              return `${startHours.toString().padStart(2, "0")}:${startMins.toString().padStart(2, "0")} - ${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
