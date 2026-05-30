"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarBlank, User, Clock } from "@phosphor-icons/react";
import { Skeleton } from "@/src/shared/components/feedback/Skeleton";
import { EmptyState } from "@/src/shared/components/layout";
import { fetchCourtManagementTimeline } from "@/src/api/court.api";
import { CourtTimelineSlotStatus, type CourtManagementTimelineDto } from "@/src/features/court/shared/types/court.types";
import { formatTime, parseTimeToMinutes } from "@/src/features/timeslot/utils/timeFormat";
import { format } from "date-fns";
import { clsx } from "clsx";

interface CourtTimelineViewProps {
    date: string;
    typeId?: string;
    onViewDetail: (courtId: string) => void;
    onBookingClick: (bookingId: string) => void;
    onSlotClick?: (courtId: string, startTime: string) => void;
}

// Layout constants
const ROW_HEIGHT = 54;
const HOUR_WIDTH = 120; // 2px per minute
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
    date,
    typeId,
    onViewDetail,
    onBookingClick,
    onSlotClick,
}: CourtTimelineViewProps) {
    const [data, setData] = useState<CourtManagementTimelineDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleSlotClick = (courtId: string, time: string) => {
        onSlotClick?.(courtId, time);
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const result = await fetchCourtManagementTimeline({ date, typeId });
                setData(result);
            } catch (err) {
                console.error("Failed to load timeline", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [date, typeId]);

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

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

    // Generate hour markers
    const hourMarkers: HourMarker[] = [];
    for (let m = dayStartMinutes; m <= dayEndMinutes; m += 30) {
        const hours = Math.floor(m / 60);
        const minutes = m % 60;
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        hourMarkers.push({
            time: timeStr,
            left: (m - dayStartMinutes) * 2,
            isFullHour: minutes === 0
        });
    }

    const isToday = date === new Date().toISOString().split("T")[0];
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const showNowIndicator = isToday && nowMinutes >= dayStartMinutes && nowMinutes <= dayEndMinutes;
    const nowPosition = (nowMinutes - dayStartMinutes) * 2;

    const getBookingStyles = (status: string | null) => {
        switch (status) {
            case "PLAYING":
                return "bg-[#9FE1CB] text-[#085041] border-[#7BCDB3]";
            case "PENDING":
                return "bg-[#FAC775] text-[#633806] border-[#E5B562]";
            case "CONFIRMED":
            default:
                return "bg-[#B5D4F4] text-[#0C447C] border-[#92BEEB]";
        }
    };

    return (
        <div className="flex flex-col h-full bg-surface-1 border border-border rounded-2xl overflow-hidden shadow-sm relative">
            {/* Legend (Floating or Above) */}
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

            {/* Scrollable Container */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-auto custom-scrollbar relative"
            >
                <div className="relative" style={{ width: COURT_COLUMN_WIDTH + timelineWidth }}>
                    {/* CURRENT TIME INDICATOR (Across header and content) */}
                    {showNowIndicator && (
                        <div
                            className="absolute top-0 bottom-0 z-[45] pointer-events-none flex flex-col items-center"
                            style={{ left: COURT_COLUMN_WIDTH + nowPosition }}
                        >
                            <div className="sticky top-[24px] z-[46]">
                                <div className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-md -translate-y-1/2">
                                    <Clock size={10} weight="fill" />
                                    {format(currentTime, 'HH:mm')}
                                </div>
                            </div>
                            <div className="w-[1.5px] h-full bg-red-500/60" />
                        </div>
                    )}

                    {/* Header Row (Sticky top) */}
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
                                    className={clsx(
                                        "absolute top-0 bottom-0 border-l transition-colors",
                                        marker.isFullHour ? "border-border" : "border-border/30"
                                    )}
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

                    {/* Timeline Content */}
                    <div className="relative">

                        {data.courts.map((court) => (
                            <div
                                key={court.id}
                                className="flex group border-b border-border/50 last:border-0 hover:bg-surface-2/20 transition-colors"
                                style={{ height: ROW_HEIGHT }}
                            >
                                {/* Court Header (Sticky left) */}
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

                                {/* Timeline Row */}
                                <div className="relative flex-1" style={{ width: timelineWidth }}>
                                    {/* Grid Lines */}
                                    {hourMarkers.map((marker) => (
                                        <div
                                            key={marker.time}
                                            className={clsx(
                                                "absolute top-0 bottom-0 border-l pointer-events-none",
                                                marker.isFullHour ? "border-border/50" : "border-border/10"
                                            )}
                                            style={{ left: marker.left }}
                                        />
                                    ))}

                                    {/* Empty Slots Interactivity (behind bookings) */}
                                    {hourMarkers.slice(0, -1).map((marker, i) => (
                                        <div
                                            key={`empty-${i}`}
                                            className="absolute top-0 bottom-0 hover:bg-[#EAF3DE] cursor-cell transition-colors group/cell z-0"
                                            style={{
                                                left: marker.left,
                                                width: hourMarkers[i + 1].left - marker.left
                                            }}
                                            onClick={() => {
                                                handleSlotClick(court.id, marker.time);
                                            }}
                                        />
                                    ))}

                                    {/* Bookings */}
                                    {court.slots.map((slot, idx) => {
                                        if (slot.status === CourtTimelineSlotStatus.AVAILABLE) return null;

                                        const left = getTimePosition(slot.startTime, dayStartMinutes);
                                        const endLeft = getTimePosition(slot.endTime, dayStartMinutes);
                                        const width = endLeft - left;

                                        return (
                                            <div
                                                key={idx}
                                                className={clsx(
                                                    "absolute top-[7px] bottom-[7px] border rounded-lg px-3 flex items-center justify-between cursor-pointer transition-all shadow-sm hover:z-50 hover:scale-[1.01] hover:shadow-md overflow-hidden z-10",
                                                    getBookingStyles(slot.bookingStatus)
                                                )}
                                                style={{ left, width }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (slot.bookingId) onBookingClick(slot.bookingId);
                                                }}
                                            >
                                                <span className="text-[11px] font-black truncate mr-1">
                                                    {slot.playerName || "Khách vãng lai"}
                                                </span>
                                                <span className="text-[10px] font-bold opacity-70 shrink-0">
                                                    {formatTime(slot.startTime)}
                                                </span>
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
