"use client";

import { useRef, useEffect } from "react";
import { CalendarBlank, Clock } from "@phosphor-icons/react";
import { Skeleton } from "@/src/shared/components/feedback/Skeleton";
import { EmptyState } from "@/src/shared/components/layout";
import { CourtTimelineSlotStatus, type CourtManagementTimelineDto } from "@/src/features/court/shared/types/court.types";
import { formatTime, parseTimeToMinutes } from "@/src/features/timeslot/utils/timeFormat";
import { format } from "date-fns";
import { clsx } from "clsx";

interface CourtTimelineViewProps {
    data: CourtManagementTimelineDto | null;
    loading: boolean;
    now: Date | null;       // null = not today, hide indicator
    date: string;           // still needed to reset auto-scroll on date change
    onViewDetail: (courtId: string) => void;
    onBookingClick: (bookingId: string) => void;
    onSlotClick?: (courtId: string, startTime: string) => void;
}

const ROW_HEIGHT = 54;
const HOUR_WIDTH = 120;
const COURT_COLUMN_WIDTH = 200;

function getTimePosition(time: string, dayStartMinutes: number) {
    const minutes = parseTimeToMinutes(time);
    return (minutes - dayStartMinutes) * 2;
}

interface HourMarker {
    time: string;
    left: number;
    isFullHour: boolean;
}

export function CourtTimelineView({
    data,
    loading,
    now,
    date,
    onViewDetail,
    onBookingClick,
    onSlotClick,
}: CourtTimelineViewProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const hasAutoScrolledRef = useRef(false);

    // Keep a ref so auto-scroll reads the latest `now` without being
    // triggered by every 60-second tick.
    const nowRef = useRef(now);
    useEffect(() => { nowRef.current = now; });

    // Reset scroll flag whenever the user picks a different date
    useEffect(() => {
        hasAutoScrolledRef.current = false;
    }, [date]);

    // Auto-scroll to current time once when data first loads (today only)
    useEffect(() => {
        if (hasAutoScrolledRef.current || !data || !scrollContainerRef.current) return;
        const currentNow = nowRef.current;
        if (!currentNow) return; // not today

        const dayStartMinutes = parseTimeToMinutes(data.operatingHours.open);
        const dayEndMinutes = parseTimeToMinutes(data.operatingHours.close);
        const nowMinutes = currentNow.getHours() * 60 + currentNow.getMinutes();

        if (nowMinutes < dayStartMinutes || nowMinutes > dayEndMinutes) return;

        hasAutoScrolledRef.current = true;

        const nowPosition = (nowMinutes - dayStartMinutes) * 2;
        const container = scrollContainerRef.current;
        container.scrollTo({
            left: Math.max(0, COURT_COLUMN_WIDTH + nowPosition - container.clientWidth / 2),
            behavior: "smooth",
        });
    }, [data, date]); // `date` re-triggers after hasAutoScrolledRef resets

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <Skeleton className="h-12 w-full rounded-xl" />
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (!data || data.courts.length === 0) {
        return (
            <EmptyState
                icon={<CalendarBlank className="h-12 w-12 text-muted" />}
                title="Không có dữ liệu timeline"
                description="Không tìm thấy sân nào cho bộ lọc hiện tại."
            />
        );
    }

    const dayStartMinutes = parseTimeToMinutes(data.operatingHours.open);
    const dayEndMinutes = parseTimeToMinutes(data.operatingHours.close);
    const totalMinutes = dayEndMinutes - dayStartMinutes;
    const timelineWidth = (totalMinutes / 60) * HOUR_WIDTH;

    const hourMarkers: HourMarker[] = [];
    for (let m = dayStartMinutes; m <= dayEndMinutes; m += 30) {
        const hours = Math.floor(m / 60);
        const minutes = m % 60;
        hourMarkers.push({
            time: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
            left: (m - dayStartMinutes) * 2,
            isFullHour: minutes === 0,
        });
    }

    // Derived from `now` prop — no internal state needed
    const nowMinutes = now ? now.getHours() * 60 + now.getMinutes() : 0;
    const showNowIndicator = now !== null && nowMinutes >= dayStartMinutes && nowMinutes <= dayEndMinutes;
    const nowPosition = showNowIndicator ? (nowMinutes - dayStartMinutes) * 2 : 0;

    const getBookingStyles = (status: CourtTimelineSlotStatus) => {
        switch (status) {
            case CourtTimelineSlotStatus.PLAYING: return "bg-[#9FE1CB] text-[#085041] border-[#7BCDB3]";
            case CourtTimelineSlotStatus.COMPLETED: return "bg-[#C0DD97] text-[#27500A] border-[#A8C97A]";
            case CourtTimelineSlotStatus.BOOKED:
            default: return "bg-[#B5D4F4] text-[#0C447C] border-[#92BEEB]";
        }
    };

    return (
        <div className="flex flex-col h-full bg-surface-1 border border-border rounded-2xl overflow-hidden shadow-sm relative">
            <div className="flex items-center gap-4 px-6 py-3 border-b border-border bg-surface-2/30">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#B5D4F4]" />
                    <span className="text-[11px] font-bold text-muted">Đã xác nhận</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#9FE1CB]" />
                    <span className="text-[11px] font-bold text-muted">Đang chơi</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FAC775]" />
                    <span className="text-[11px] font-bold text-muted">Chờ xác nhận</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EAF3DE] border border-[#D1E1BB]" />
                    <span className="text-[11px] font-bold text-muted">Trống (Click để đặt)</span>
                </div>
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-auto custom-scrollbar relative">
                <div className="relative" style={{ width: COURT_COLUMN_WIDTH + timelineWidth }}>
                    {showNowIndicator && (
                        <div
                            className="absolute top-0 bottom-0 z-[45] pointer-events-none"
                            style={{ left: COURT_COLUMN_WIDTH + nowPosition }}
                        >
                            <div className="absolute z-[46]" style={{ top: 48, transform: "translate(-50%, -50%)" }}>
                                <div className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-md whitespace-nowrap">
                                    <Clock size={10} weight="fill" />
                                    {format(now, "HH:mm")}
                                </div>
                            </div>
                            <div className="absolute left-0 bottom-0 w-[1.5px] bg-red-500/60" style={{ top: 48 }} />
                        </div>
                    )}

                    <div className="sticky top-0 z-40 flex bg-surface-2 border-b border-border">
                        <div
                            className="sticky left-0 z-50 bg-surface-2 border-r border-border shrink-0 flex items-center px-6 py-3"
                            style={{ width: COURT_COLUMN_WIDTH }}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted">Sân / Giờ</span>
                        </div>
                        <div className="relative h-12" style={{ width: timelineWidth }}>
                            {hourMarkers.map((marker) => (
                                <div
                                    key={marker.time}
                                    className={clsx("absolute top-0 bottom-0 border-l transition-colors", marker.isFullHour ? "border-border" : "border-border/30")}
                                    style={{ left: marker.left }}
                                >
                                    {marker.isFullHour && (
                                        <span className="absolute top-2 left-2 text-[10px] font-bold text-muted/80 whitespace-nowrap">
                                            {marker.time}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        {data.courts.map((court) => (
                            <div
                                key={court.id}
                                className="flex group border-b border-border/50 last:border-0 hover:bg-surface-2/20 transition-colors"
                                style={{ height: ROW_HEIGHT }}
                            >
                                <div
                                    className="sticky left-0 z-20 bg-surface-1 border-r border-border group-hover:bg-surface-2/90 shrink-0 px-6 flex flex-col justify-center gap-0.5 cursor-pointer transition-colors"
                                    style={{ width: COURT_COLUMN_WIDTH }}
                                    onClick={() => onViewDetail(court.id)}
                                >
                                    <span className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                        {court.name}
                                    </span>
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                                        {court.typeName}
                                    </span>
                                </div>

                                <div className="relative flex-1" style={{ width: timelineWidth }}>
                                    {hourMarkers.map((marker) => (
                                        <div
                                            key={marker.time}
                                            className={clsx("absolute top-0 bottom-0 border-l pointer-events-none", marker.isFullHour ? "border-border/50" : "border-border/10")}
                                            style={{ left: marker.left }}
                                        />
                                    ))}
                                    {hourMarkers.slice(0, -1).map((marker, i) => (
                                        <div
                                            key={`empty-${i}`}
                                            className="absolute top-0 bottom-0 hover:bg-[#EAF3DE] cursor-cell transition-colors z-0"
                                            style={{ left: marker.left, width: hourMarkers[i + 1].left - marker.left }}
                                            onClick={() => onSlotClick?.(court.id, marker.time)}
                                        />
                                    ))}
                                    {court.slots.map((slot, idx) => {
                                        if (slot.status === CourtTimelineSlotStatus.AVAILABLE) return null;
                                        const left = getTimePosition(slot.startTime, dayStartMinutes);
                                        const width = getTimePosition(slot.endTime, dayStartMinutes) - left;
                                        return (
                                            <div
                                                key={idx}
                                                title={slot.isEarlyCheckout ? `Trả sân sớm — kết thúc ${slot.actualEndTime}, dự kiến ${slot.endTime}` : undefined}
                                                className={clsx(
                                                    "absolute top-[7px] bottom-[7px] border rounded-lg px-3 flex items-center justify-between cursor-pointer transition-all shadow-sm hover:z-50 hover:scale-[1.01] hover:shadow-md overflow-hidden z-10",
                                                    getBookingStyles(slot.status)
                                                )}
                                                style={{ left, width }}
                                                onClick={(e) => { e.stopPropagation(); if (slot.bookingId) onBookingClick(slot.bookingId); }}
                                            >
                                                <span className="text-[11px] font-black truncate mr-1">
                                                    {slot.playerName || "Khách vãng lai"}
                                                </span>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    {slot.isEarlyCheckout && (
                                                        <span className="text-[9px] font-black opacity-60 border border-current rounded px-1">Sớm</span>
                                                    )}
                                                    <span className="text-[10px] font-bold opacity-70">{formatTime(slot.startTime)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}