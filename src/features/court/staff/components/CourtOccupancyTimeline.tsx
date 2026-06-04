"use client";

/**
 * CourtOccupancyTimeline
 *
 * Renders scheduleTimeline as a proportional segmented strip.
 * Window: 06:00 – 22:00 (960 minutes total).
 * Colors: AVAILABLE=neutral, BOOKED=blue, PLAYING=orange.
 * Tooltip on hover shows time range + Vietnamese status label.
 */

import { useState } from "react";
import {
    CourtTimelineSlotStatus,
    type CourtTimelineSlotDto,
} from "@/src/features/court/shared/types/court.types";

const WINDOW_START = 6 * 60;  // 06:00
const WINDOW_END = 22 * 60; // 22:00
const WINDOW_TOTAL = WINDOW_END - WINDOW_START;

function toMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

const STATUS_LABEL: Record<CourtTimelineSlotStatus, string> = {
    [CourtTimelineSlotStatus.AVAILABLE]: "Còn trống",
    [CourtTimelineSlotStatus.COMPLETED]: "Đã hoàn thành",
    [CourtTimelineSlotStatus.BOOKED]: "Đã đặt",
    [CourtTimelineSlotStatus.PLAYING]: "Đang chơi",
};

const STATUS_CLASS: Record<CourtTimelineSlotStatus, string> = {
    [CourtTimelineSlotStatus.AVAILABLE]:
        "bg-surface-2",
    [CourtTimelineSlotStatus.BOOKED]:
        "bg-blue-500 dark:bg-blue-600",
    [CourtTimelineSlotStatus.PLAYING]:
        "bg-amber-500",
    [CourtTimelineSlotStatus.COMPLETED]:
        "bg-green-500"
};

const LEGEND_DOT_CLASS: Record<CourtTimelineSlotStatus, string> = {
    [CourtTimelineSlotStatus.AVAILABLE]:
        "bg-surface-2 border-border",
    [CourtTimelineSlotStatus.BOOKED]:
        "bg-blue-500 border-blue-600 dark:border-blue-400/30",
    [CourtTimelineSlotStatus.PLAYING]:
        "bg-amber-500 border-amber-600 dark:border-amber-400/30",
    [CourtTimelineSlotStatus.COMPLETED]:
        "bg-green-500 border-green-600 dark:border-green-400/30"
};

interface TooltipState {
    visible: boolean;
    x: number;
    y: number;
    label: string;
    timeRange: string;
}

interface CourtOccupancyTimelineProps {
    slots: CourtTimelineSlotDto[];
}

export function CourtOccupancyTimeline({ slots }: CourtOccupancyTimelineProps) {
    const [tooltip, setTooltip] = useState<TooltipState>({
        visible: false,
        x: 0,
        y: 0,
        label: "",
        timeRange: "",
    });

    function handleMouseEnter(
        e: React.MouseEvent<HTMLDivElement>,
        slot: CourtTimelineSlotDto
    ) {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.top - 8,
            timeRange: slot.isEarlyCheckout
                ? `${slot.startTime} – ${slot.endTime}`
                : `${slot.startTime} – ${slot.endTime}`,
            label: slot.isEarlyCheckout
                ? "Trả sân sớm"
                : STATUS_LABEL[slot.status],
        });
    }

    function handleMouseLeave() {
        setTooltip((p) => ({ ...p, visible: false }));
    }

    // Compute segments within the 06:00–22:00 window
    const segments = slots
        .map((slot) => {
            const start = Math.max(toMinutes(slot.startTime), WINDOW_START);
            const end = Math.min(toMinutes(slot.endTime), WINDOW_END);
            if (end <= start) return null;
            const left = ((start - WINDOW_START) / WINDOW_TOTAL) * 100;
            const width = ((end - start) / WINDOW_TOTAL) * 100;
            return { slot, left, width };
        })
        .filter(Boolean) as { slot: CourtTimelineSlotDto; left: number; width: number }[];

    return (
        <div className="mt-3">
            {/* Time axis labels */}
            <div className="flex justify-between mb-1.5 px-0.5">
                <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">06:00</span>
                <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">14:00</span>
                <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">22:00</span>
            </div>

            {/* Strip */}
            <div className="relative h-2.5 w-full rounded-full bg-surface-2 border border-border/50 overflow-hidden">
                {segments.map(({ slot, left, width }, i) => (
                    <div
                        key={i}
                        className={`absolute top-0 h-full transition-all hover:brightness-110 cursor-pointer ${STATUS_CLASS[slot.status]} ${i === 0 ? "rounded-l-full" : ""
                            } ${i === segments.length - 1 ? "rounded-r-full" : ""}`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        onMouseEnter={(e) => handleMouseEnter(e, slot)}
                        onMouseLeave={handleMouseLeave}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3">
                <LegendDot
                    status={CourtTimelineSlotStatus.AVAILABLE}
                    label="Trống"
                />
                <LegendDot
                    status={CourtTimelineSlotStatus.BOOKED}
                    label="Đã đặt"
                />
                <LegendDot
                    status={CourtTimelineSlotStatus.PLAYING}
                    label="Đang chơi"
                />
                <LegendDot
                    status={CourtTimelineSlotStatus.COMPLETED}
                    label="Hoàn tất"
                />
            </div>

            {/* Tooltip */}
            {tooltip.visible && (
                <div
                    className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in duration-200"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    <div className="rounded-xl bg-slate-900 dark:bg-slate-800 text-white px-3 py-2 text-[11px] font-bold shadow-2xl border border-white/10">
                        <p className="tracking-tight">{tooltip.timeRange}</p>
                        <p className="text-white/60 font-medium mt-0.5">{tooltip.label}</p>
                    </div>
                    {/* Arrow */}
                    <div className="mx-auto h-2 w-2 border-l border-t border-white/10 rotate-[225deg] bg-slate-900 dark:bg-slate-800 -mt-1 shadow-xl" />
                </div>
            )}
        </div>
    );
}

function LegendDot({ status, label }: { status: CourtTimelineSlotStatus; label: string }) {
    return (
        <div className="flex items-center gap-1.5 transition-opacity hover:opacity-80 cursor-default">
            <span className={`h-2 w-2 rounded-[2px] border ${LEGEND_DOT_CLASS[status]}`} />
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{label}</span>
        </div>
    );
}
