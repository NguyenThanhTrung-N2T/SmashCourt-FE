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
  isCandidate: boolean;          // ← NEW: not selected, but an active range exists
  selectedSlots: TimeGridSlotDto[];
  totalBlocks: number;
  dragging: { courtId: string; originIdx: number; startIdx: number; endIdx: number } | null;
  trackRef: (el: HTMLDivElement | null) => void;
  onMouseDown: (clientX: number) => void;
  onSlotsChange: (slots: TimeGridSlotDto[]) => void;
}

export function CourtTrack({
  court,
  branchId,
  selectedDate,
  isSelected,
  isCandidate,
  selectedSlots,
  totalBlocks,
  dragging,
  trackRef,
  onMouseDown,
  onSlotsChange,
}: CourtTrackProps) {
  const { slots, isLoading } = useTimeGrid({
    branchId,
    courtId: court.id,
    courtTypeId: court.courtTypeId,
    date: selectedDate,
  });

  // ─── blockToSlotMap (unchanged) ───────────────────────────────────────────
  const blockToSlotMap = useMemo(() => {
    const map = new Map<number, TimeGridSlotDto>();
    const now = new Date();
    const [year, month, day] = selectedDate.split("-").map(Number);
    const selectedDateObj = new Date(year, month - 1, day);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isToday = selectedDateObj.getTime() === today.getTime();
    const isPastDate = selectedDateObj < today;
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    slots.forEach((slot) => {
      const [startHours, startMinutes] = slot.startTime.split(":").map(Number);
      const [endHours, endMinutes] = slot.endTime.split(":").map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      const startMinutesBase = START_HOUR * 60;

      let effectiveStatus = slot.status;
      if (isPastDate) effectiveStatus = TimeSlotStatus.IN_USE;
      else if (isToday && startTotalMinutes < currentTotalMinutes) effectiveStatus = TimeSlotStatus.IN_USE;

      const effectiveSlot = { ...slot, status: effectiveStatus };
      const numBlocks = (endTotalMinutes - startTotalMinutes) / SLOT_STEP_MINUTES;
      const startBlockIdx = Math.floor((startTotalMinutes - startMinutesBase) / SLOT_STEP_MINUTES);
      for (let i = 0; i < numBlocks; i++) {
        const blockIdx = startBlockIdx + i;
        if (blockIdx >= 0 && blockIdx < totalBlocks) map.set(blockIdx, effectiveSlot);
      }
    });
    return map;
  }, [slots, totalBlocks, selectedDate]);

  // ─── blockedSlotRanges (unchanged) ────────────────────────────────────────
  const blockedSlotRanges = useMemo(() => {
    const ranges: Array<{ startIdx: number; endIdx: number; slot: TimeGridSlotDto }> = [];
    const processedSlots = new Set<TimeGridSlotDto>();

    blockToSlotMap.forEach((slot) => {
      if (slot.status !== TimeSlotStatus.AVAILABLE && !processedSlots.has(slot)) {
        processedSlots.add(slot);
        const slotBlocks: number[] = [];
        blockToSlotMap.forEach((s, i) => { if (s === slot) slotBlocks.push(i); });
        if (slotBlocks.length > 0) {
          slotBlocks.sort((a, b) => a - b);
          ranges.push({ startIdx: slotBlocks[0], endIdx: slotBlocks[slotBlocks.length - 1], slot });
        }
      }
    });
    return ranges;
  }, [blockToSlotMap]);

  // ─── Overlay positions ────────────────────────────────────────────────────

  /**
   * Shared block-index range derived from selectedSlots.
   * Used for both the "selected" (dark) and "candidate" (light) overlays
   * so both always show exactly the same range.
   */
  const timeRangeOverlay = useMemo(() => {
    if (selectedSlots.length === 0) return null;
    const [startH, startM] = selectedSlots[0].startTime.split(":").map(Number);
    const [endH, endM] = selectedSlots[selectedSlots.length - 1].endTime.split(":").map(Number);
    const base = START_HOUR * 60;
    return {
      startIdx: Math.floor((startH * 60 + startM - base) / SLOT_STEP_MINUTES),
      endIdx: Math.floor((endH * 60 + endM - base) / SLOT_STEP_MINUTES) - 1,
    };
  }, [selectedSlots]);

  /**
   * Candidate overlay is shown only when every block in the active range is
   * actually available on THIS court — prevents a light-green zone over
   * already-booked slots.
   */
  const isCandidateAvailable = useMemo(() => {
    if (!isCandidate || !timeRangeOverlay) return false;
    for (let i = timeRangeOverlay.startIdx; i <= timeRangeOverlay.endIdx; i++) {
      const slot = blockToSlotMap.get(i);
      if (!slot || slot.status !== TimeSlotStatus.AVAILABLE) return false;
    }
    return true;
  }, [isCandidate, timeRangeOverlay, blockToSlotMap]);

  const selectedOverlay = isSelected ? timeRangeOverlay : null;
  const candidateOverlay = isCandidateAvailable ? timeRangeOverlay : null;

  // ─── Dragging overlay (unchanged) ─────────────────────────────────────────
  const draggingOverlay = useMemo(() => {
    if (!dragging) return null;
    const isForward = dragging.endIdx >= dragging.originIdx;
    const step = isForward ? 1 : -1;
    const slotSet = new Set<TimeGridSlotDto>();
    for (let idx = dragging.originIdx; isForward ? idx <= dragging.endIdx : idx >= dragging.endIdx; idx += step) {
      const slot = blockToSlotMap.get(idx);
      if (!slot || slot.status !== TimeSlotStatus.AVAILABLE) break;
      slotSet.add(slot);
    }
    if (slotSet.size === 0) return null;
    let minIdx = 9999, maxIdx = -1;
    blockToSlotMap.forEach((slot, idx) => {
      if (slotSet.has(slot)) { minIdx = Math.min(minIdx, idx); maxIdx = Math.max(maxIdx, idx); }
    });
    return { startIdx: minIdx, endIdx: maxIdx };
  }, [dragging, blockToSlotMap]);

  // Dragging takes precedence over the persisted selection
  const overlay = draggingOverlay || selectedOverlay;

  // ─── Slot update during drag ───────────────────────────────────────────────
  useEffect(() => {
    if (!dragging) return; // fires for both clicks (1 block) and real drags

    const isForward = dragging.endIdx >= dragging.originIdx;
    const step = isForward ? 1 : -1;
    const slotSet = new Set<TimeGridSlotDto>();

    for (
      let idx = dragging.originIdx;
      isForward ? idx <= dragging.endIdx : idx >= dragging.endIdx;
      idx += step
    ) {
      const slot = blockToSlotMap.get(idx);
      if (!slot || slot.status !== TimeSlotStatus.AVAILABLE) break;
      slotSet.add(slot);
    }

    const nextSlots = Array.from(slotSet).sort((a, b) => a.startTime.localeCompare(b.startTime));
    const same =
      nextSlots.length === selectedSlots.length &&
      nextSlots.every((s, i) => s.startTime === selectedSlots[i]?.startTime && s.endTime === selectedSlots[i]?.endTime);
    if (same) return;
    onSlotsChange(nextSlots);
  }, [
    dragging?.originIdx,
    dragging?.endIdx,
    blockToSlotMap,
    selectedSlots,
    onSlotsChange,
  ]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex items-center gap-4">
      {/* Court name chip — tinted when selected or candidate */}
      <div
        className={`w-37.5 rounded-2xl border px-4 py-3.5 text-[15px] font-semibold shadow-sm transition-colors ${isSelected
          ? "border-primary/50 bg-primary/10 text-primary"
          : isCandidateAvailable
            ? "border-primary/20 bg-surface-1 text-foreground"
            : "border-border bg-surface-1 text-foreground"
          }`}
      >
        <div className="flex items-center gap-2">
          <span>{court.name}</span>
        </div>
      </div>

      <div
        ref={trackRef}
        onMouseDown={(e) => onMouseDown(e.clientX)}
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
        {blockedSlotRanges.map((range) => (
          <div
            key={`blocked-${range.startIdx}`}
            className={`pointer-events-none absolute inset-y-1 rounded-lg transition-all ${range.slot.status === TimeSlotStatus.LOCKED ? "bg-amber-500/70" : "bg-muted/50"
              }`}
            style={{
              left: `${(range.startIdx / totalBlocks) * 100}%`,
              width: `${((range.endIdx - range.startIdx + 1) / totalBlocks) * 100}%`,
            }}
          />
        ))}

        {/*
          Candidate overlay — light green.
          pointer-events-auto so the cursor becomes a pointer when hovering it,
          and hover: styles can apply directly. Mouse events still bubble up to
          the track, so dragging from within this zone works normally.
          Hidden when an active drag / selection overlay is already on this track.
        */}
        {candidateOverlay && !overlay && (
          <div
            className="absolute inset-y-1 cursor-pointer rounded-lg bg-primary/15 ring-1 ring-inset ring-primary/30 transition-all hover:bg-primary/25 hover:ring-primary/50"
            style={{
              left: `${(candidateOverlay.startIdx / totalBlocks) * 100}%`,
              width: `${((candidateOverlay.endIdx - candidateOverlay.startIdx + 1) / totalBlocks) * 100}%`,
            }}
          >
            <div className="pointer-events-none flex h-full items-center justify-center">
              <span className="select-none text-[10px] font-bold text-primary/50">
                + Thêm sân
              </span>
            </div>
          </div>
        )}

        {/* Selected / dragging overlay — dark green */}
        {overlay && (
          <div
            className="pointer-events-none absolute inset-y-1 rounded-lg bg-primary shadow-[0_0_0_2px_rgba(var(--primary-rgb),0.25)] transition-all"
            style={{
              left: `${(overlay.startIdx / totalBlocks) * 100}%`,
              width: `${((overlay.endIdx - overlay.startIdx + 1) / totalBlocks) * 100}%`,
            }}
          />
        )}

        {/* Time label — only on selected / dragging court */}
        {overlay && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-full border border-primary bg-surface-1 px-3 py-1 text-xs font-semibold text-primary shadow-sm"
            style={{
              left: `${(overlay.startIdx / totalBlocks) * 100}%`,
              transform: "translateX(-2px) translateY(-115%)",
            }}
          >
            {(() => {
              const startMins = START_HOUR * 60 + overlay.startIdx * SLOT_STEP_MINUTES;
              const endMins = START_HOUR * 60 + (overlay.endIdx + 1) * SLOT_STEP_MINUTES;
              const fmt = (m: number) =>
                `${Math.floor(m / 60).toString().padStart(2, "0")}:${(m % 60).toString().padStart(2, "0")}`;
              return `${fmt(startMins)} - ${fmt(endMins)}`;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}