/**
 * InteractiveTimeGrid — multi-court
 *
 * UX contract:
 *   • Drag on any track  → sets the time range; that court becomes the sole selection.
 *   • Click any track    → toggles it in/out of the active time range.
 *   • Drag again         → resets to the new court + new range.
 */
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Cursor, CheckCircle } from "@phosphor-icons/react";
import { Alert } from "@/src/shared/components/ui/Alert";
import { formatTime, formatDuration, calculateDuration } from "@/src/features/timeslot/utils";
import { CourtTrack } from "@/src/features/booking/shared/components/new/CourtTrack";
import type { CourtDto } from "@/src/features/court/shared/types/court.types";
import type { TimeGridSlotDto } from "@/src/features/timeslot/types";

const START_HOUR = 6;
const END_HOUR = 22;
const SLOT_STEP_MINUTES = 30;

interface InteractiveTimeGridProps {
  branchId: string;
  courts: CourtDto[];
  selectedDate: string;
  selectedCourtIds: string[];
  selectedSlots: TimeGridSlotDto[];
  onDragCourt: (court: CourtDto) => void;            // ← drag ended; reset to this court
  onToggleCourt: (court: CourtDto) => void;
  onSlotsChange: (slots: TimeGridSlotDto[]) => void;
}

export function InteractiveTimeGrid({
  branchId,
  courts,
  selectedDate,
  selectedCourtIds,
  selectedSlots,
  onDragCourt,
  onToggleCourt,
  onSlotsChange,
}: InteractiveTimeGridProps) {
  const [dragging, setDragging] = useState<{
    courtId: string;
    originIdx: number;
    startIdx: number;
    endIdx: number;
  } | null>(null);
  // True once the cursor has moved ≥1 block. Distinguishes drag from click.
  // Only the ref is needed now — no re-render required for this flag.
  const isDragActionRef = useRef(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const courtTrackRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Stable callback refs so the global mouseup listener is never stale
  const draggingCourtRef = useRef<CourtDto | null>(null);
  const onDragCourtRef = useRef(onDragCourt);
  const onToggleCourtRef = useRef(onToggleCourt);
  useEffect(() => { onDragCourtRef.current = onDragCourt; }, [onDragCourt]);
  useEffect(() => { onToggleCourtRef.current = onToggleCourt; }, [onToggleCourt]);

  // Slots saved at mousedown so a toggle-click can restore them unchanged
  const savedSlotsRef = useRef<TimeGridSlotDto[]>([]);
  // Stable ref so the global mouseup closure can call onSlotsChange without going stale
  const onSlotsChangeRef = useRef(onSlotsChange);
  useEffect(() => { onSlotsChangeRef.current = onSlotsChange; }, [onSlotsChange]);

  // Calculate time range dynamically based on START_HOUR and END_HOUR
  // These should ideally come from the actual slot data, but for now we use constants
  const hourMarks = useMemo(
    () =>
      Array.from(
        { length: END_HOUR - START_HOUR + 1 },
        (_, idx) => START_HOUR + idx,
      ),
    [],
  );

  // Calculate total blocks based on time range
  const totalBlocks = useMemo(() => {
    const totalMinutes = (END_HOUR - START_HOUR) * 60;
    return totalMinutes / SLOT_STEP_MINUTES;
  }, []);
  // Stable refs so the mouseup closure never reads stale state
  const selectedCourtIdsRef = useRef(selectedCourtIds);
  useEffect(() => { selectedCourtIdsRef.current = selectedCourtIds; }, [selectedCourtIds]);

  const selectedSlotsRef = useRef(selectedSlots);
  useEffect(() => { selectedSlotsRef.current = selectedSlots; }, [selectedSlots]);

  /** Convert a slot array into block-index start/end, matching CourtTrack's computation. */
  function slotsToBlockRange(slots: TimeGridSlotDto[]) {
    if (slots.length === 0) return null;
    const [sH, sM] = slots[0].startTime.split(":").map(Number);
    const [eH, eM] = slots[slots.length - 1].endTime.split(":").map(Number);
    const base = START_HOUR * 60;
    return {
      startIdx: Math.floor((sH * 60 + sM - base) / SLOT_STEP_MINUTES),
      endIdx: Math.floor((eH * 60 + eM - base) / SLOT_STEP_MINUTES) - 1,
    };
  }
  function getBlockIdxFromClientX(courtId: string, clientX: number) {
    const track = courtTrackRefs.current[courtId];
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const clampedX = Math.max(rect.left, Math.min(rect.right, clientX));
    const ratio = (clampedX - rect.left) / rect.width;
    const idx = Math.floor(ratio * totalBlocks);
    return Math.max(0, Math.min(totalBlocks - 1, idx));
  }

  function onTrackMouseDown(court: CourtDto, clientX: number) {
    const idx = getBlockIdxFromClientX(court.id, clientX);
    draggingCourtRef.current = court;
    isDragActionRef.current = false;
    savedSlotsRef.current = [...selectedSlotsRef.current];
    setDragging({ courtId: court.id, originIdx: idx, startIdx: idx, endIdx: idx });
  }

  /**
   * Fix for Bug 2: attach mousemove to window (not just the track div) so dragging
   * continues to work even when the cursor leaves the track element.
   * Effect is re-registered only when a new court starts dragging (courtId changes),
   * not on every setDragging call, to avoid stale-closure churn.
   */
  useEffect(() => {
    if (!dragging) return;
    const { courtId, originIdx } = dragging; // originIdx never changes during a drag

    const handleMouseMove = (e: MouseEvent) => {
      const idx = getBlockIdxFromClientX(courtId, e.clientX);

      if (!isDragActionRef.current && Math.abs(idx - originIdx) >= 1) {
        isDragActionRef.current = true;
      }

      // Functional update avoids reading stale dragging state from the closure
      setDragging((prev) => (prev ? { ...prev, endIdx: idx } : null));

      const container = scrollContainerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const t = 80;
        if (e.clientX > rect.right - t) container.scrollBy({ left: 30, behavior: "auto" });
        else if (e.clientX < rect.left + t) container.scrollBy({ left: -30, behavior: "auto" });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging?.courtId]); // re-register only on drag start / drag end

  function onTrackMouseUp() {
    const court = draggingCourtRef.current;
    const clickIdx = dragging?.originIdx ?? -1;

    if (!court) {
      draggingCourtRef.current = null;
      isDragActionRef.current = false;
      setDragging(null);
      return;
    }

    const currentCourtSelected = selectedCourtIdsRef.current.includes(court.id);
    const selectedCourtCount = selectedCourtIdsRef.current.length;

    const range = slotsToBlockRange(savedSlotsRef.current);
    const clickedInsideCommittedRange =
      range !== null && clickIdx >= range.startIdx && clickIdx <= range.endIdx;

    if (isDragActionRef.current) {
      onDragCourtRef.current(court);
    } else {
      if (clickedInsideCommittedRange) {
        onToggleCourtRef.current(court);

        // Restore the original range unless this was the last selected court
        if (!currentCourtSelected || selectedCourtCount > 1) {
          onSlotsChangeRef.current([...savedSlotsRef.current]);
        }
      } else {
        onDragCourtRef.current(court);
      }
    }

    draggingCourtRef.current = null;
    isDragActionRef.current = false;
    setDragging(null);
  }

  useEffect(() => {
    if (!dragging) return;
    const handleUp = () => onTrackMouseUp();
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging?.courtId]); // re-register only on drag start / end, not on every endIdx change

  const hasTimeRange = selectedSlots.length > 0;

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-surface-1 px-5 py-4">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
          <span className="h-4 w-6 rounded border border-border bg-surface-2" />
          Còn trống
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <span className="h-4 w-6 rounded bg-primary" />
          Đang chọn
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
          <span className="h-4 w-6 rounded bg-muted/50" />
          Đã đặt
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600">
          <span className="h-4 w-6 rounded bg-amber-500" />
          Đang giữ chỗ
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
          <Cursor className="h-4 w-4" />
          Kéo để chọn range
        </span>
      </div>
      {/* {hasTimeRange && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm">
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-primary" />
          <span className="font-semibold text-primary">
            {formatTime(selectedSlots[0].startTime)} – {formatTime(selectedSlots[selectedSlots.length - 1].endTime)}
          </span>
          <span className="text-border">·</span>
          <span className="text-muted">
            Nhấp vào vùng sáng xanh trên các sân khác để đặt cùng khung giờ
          </span>
        </div>
      )} */}
      {/* Time Grid */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto custom-scrollbar rounded-3xl border border-border bg-linear-to-b from-surface-1 to-surface-2 p-5 shadow-inner"
      >
        <div className="min-w-300">
          {/* Hour markers */}
          <div className="mb-3 flex items-end gap-4">
            <div className="w-37.5" />
            <div className="relative h-8 flex-1">
              {hourMarks.map((hour) => {
                // Calculate the block index for this hour
                const minutesFromStart = (hour - START_HOUR) * 60;
                const blockIdx = minutesFromStart / SLOT_STEP_MINUTES;
                const left = (blockIdx / totalBlocks) * 100;
                return (
                  <div
                    key={`hour-${hour}`}
                    className="absolute top-0 -translate-x-1/2 text-sm font-semibold text-muted"
                    style={{ left: `${left}%` }}
                  >
                    {`${hour.toString().padStart(2, "0")}:00`}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Court tracks */}
          <div className="mt-5 space-y-5">
            {courts.map((court) => (
              <CourtTrack
                key={court.id}
                court={court}
                branchId={branchId}
                selectedDate={selectedDate}
                isSelected={selectedCourtIds.includes(court.id)}
                isCandidate={!selectedCourtIds.includes(court.id) && hasTimeRange}
                selectedSlots={selectedSlots}
                totalBlocks={totalBlocks}
                dragging={dragging?.courtId === court.id ? dragging : null}
                trackRef={(el) => {
                  courtTrackRefs.current[court.id] = el;
                }}
                onMouseDown={(clientX) => onTrackMouseDown(court, clientX)}
                onSlotsChange={onSlotsChange}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedCourtIds.length > 0 && hasTimeRange && (
        <div className="rounded-2xl border-2 border-primary bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1 space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Đã chọn
              </h4>
              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="shrink-0 text-muted">
                  {selectedCourtIds.length > 1 ? `Sân (${selectedCourtIds.length}):` : "Sân:"}
                </span>
                <span className="text-right font-semibold text-foreground">
                  {courts
                    .filter((c) => selectedCourtIds.includes(c.id))
                    .map((c) => c.name)
                    .join(", ")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Thời gian:</span>
                <span className="font-semibold text-foreground">
                  {formatTime(selectedSlots[0].startTime)} –{" "}
                  {formatTime(selectedSlots[selectedSlots.length - 1].endTime)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Thời lượng:</span>
                <span className="font-semibold text-foreground">
                  {formatDuration(
                    calculateDuration(
                      selectedSlots[0].startTime,
                      selectedSlots[selectedSlots.length - 1].endTime,
                    ),
                  )}
                </span>
              </div>
              <p className="text-xs text-muted font-semibold">
                Nhấp vào sân khác để đặt cùng khung giờ · Kéo lại để đổi giờ
              </p>
            </div>
          </div>
        </div>
      )}

      {!hasTimeRange && (
        <Alert variant="info" title="Hướng dẫn">
          Kéo trên thanh thời gian để chọn khung giờ. Các sân có thể thêm sẽ hiển thị vùng sáng xanh — nhấp vào đó để đặt cùng lúc.
        </Alert>
      )}
    </div>
  );
}