/**
 * InteractiveTimeGrid Component
 * 
 * Drag-to-select time grid for booking courts.
 */

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Cursor, Info, CheckCircle } from "@phosphor-icons/react";
import { Alert } from "@/src/shared/components/ui/Alert";
import { formatTime, formatDuration, calculateDuration } from "@/src/features/timeslot/utils";
import { CourtTrack } from "./CourtTrack";
import type { CourtDto } from "@/src/features/court/types/court.types";
import type { TimeGridSlotDto } from "@/src/features/timeslot/types";

const START_HOUR = 6;
const END_HOUR = 22;
const SLOT_STEP_MINUTES = 30;

interface InteractiveTimeGridProps {
  branchId: string;
  courts: CourtDto[];
  selectedDate: string;
  selectedCourtId: string | null;
  selectedSlots: TimeGridSlotDto[];
  onSelectCourt: (court: CourtDto) => void;
  onSlotsChange: (slots: TimeGridSlotDto[]) => void;
}

export function InteractiveTimeGrid({
  branchId,
  courts,
  selectedDate,
  selectedCourtId,
  selectedSlots,
  onSelectCourt,
  onSlotsChange,
}: InteractiveTimeGridProps) {
  const [dragging, setDragging] = useState<{
    courtId: string;
    originIdx: number;
    startIdx: number;
    endIdx: number;
  } | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const courtTrackRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
    setDragging({ courtId: court.id, originIdx: idx, startIdx: idx, endIdx: idx });
    onSelectCourt(court);
  }

  function onTrackMouseMove(courtId: string, clientX: number) {
    if (!dragging || dragging.courtId !== courtId) return;
    const idx = getBlockIdxFromClientX(courtId, clientX);
    setDragging({ ...dragging, endIdx: idx });

    const container = scrollContainerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const scrollThreshold = 80;
      if (clientX > rect.right - scrollThreshold) {
        container.scrollBy({ left: 30, behavior: "auto" });
      } else if (clientX < rect.left + scrollThreshold) {
        container.scrollBy({ left: -30, behavior: "auto" });
      }
    }
  }

  function onTrackMouseUp() {
    // Don't clear dragging immediately - let the CourtTrack component
    // process the selection first, then clear on next tick
    if (dragging) {
      setTimeout(() => setDragging(null), 0);
    }
  }

  useEffect(() => {
    if (!dragging) return;
    const handleUp = () => onTrackMouseUp();
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
  }, [dragging]);

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

      {/* Time Grid */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto custom-scrollbar rounded-3xl border border-border bg-gradient-to-b from-surface-1 to-surface-2 p-5 shadow-inner"
      >
        <div className="min-w-[1200px]">
          {/* Hour markers */}
          <div className="mb-3 flex items-end gap-4">
            <div className="w-[150px]" />
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
                isSelected={selectedCourtId === court.id}
                selectedSlots={selectedCourtId === court.id ? selectedSlots : []}
                totalBlocks={totalBlocks}
                dragging={dragging?.courtId === court.id ? dragging : null}
                trackRef={(el) => {
                  courtTrackRefs.current[court.id] = el;
                }}
                onMouseDown={(clientX) => onTrackMouseDown(court, clientX)}
                onMouseMove={(clientX) => onTrackMouseMove(court.id, clientX)}
                onSlotsChange={onSlotsChange}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedCourtId && selectedSlots.length > 0 && (
        <div className="rounded-2xl border-2 border-primary bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1">
              <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-foreground">
                Đã chọn
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Sân:</span>
                  <span className="font-semibold text-foreground">
                    {courts.find((c) => c.id === selectedCourtId)?.name}
                  </span>
                </div>
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
          </div>
        </div>
      )}

      {!selectedCourtId && (
        <Alert variant="info" title="Hướng dẫn">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0" />
            <span>
              Kéo trên thanh timeline của sân để chọn khoảng giờ. Hệ thống sẽ tự động snap theo khung 30 phút.
            </span>
          </div>
        </Alert>
      )}
    </div>
  );
}
