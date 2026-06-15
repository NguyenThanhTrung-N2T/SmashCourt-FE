/**
 * CourtSummaryCards
 *
 * KPI summary cards for the court management dashboard.
 * Matches the style of BookingSummaryCards exactly.
 */

import { CheckCircle, CalendarDots, PlayCircle, Warning } from "@phosphor-icons/react";
import type { CourtManagementDashboardStats } from "@/src/features/court/shared/types/court.types";

interface CourtSummaryCardsProps {
    stats: CourtManagementDashboardStats | null;
    loading?: boolean;
}

export function CourtSummaryCards({ stats, loading }: CourtSummaryCardsProps) {
    const cards = [
        {
            label: "Sẵn sàng",
            value: stats?.ready ?? 0,
            sub: "Sân có thể sử dụng",
            icon: CheckCircle,
            isPrimary: true,
        },
        {
            label: "Đã đặt",
            value: stats?.booked ?? 0,
            sub: "Có lịch đặt trong ngày",
            icon: CalendarDots,
        },
        {
            label: "Đang chơi",
            value: stats?.playing ?? 0,
            sub: "Đang được sử dụng",
            icon: PlayCircle,
        },
        {
            label: "Tạm ngưng",
            value: stats?.suspended ?? 0,
            sub: "Đang bảo trì hoặc khóa",
            icon: Warning,
        },
    ];

    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="rounded-2xl bg-surface-1 p-6 shadow-sm border border-border animate-pulse"
                    >
                        <div className="h-7 w-7 bg-muted/20 rounded-full mb-3" />
                        <div className="h-3 bg-muted/20 rounded w-20 mb-3" />
                        <div className="h-8 bg-muted/20 rounded w-16 mb-4" />
                        <div className="h-2 bg-muted/20 rounded w-24" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.label}
                        className={`relative rounded-2xl p-6 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden ${card.isPrimary
                            ? "text-white"
                            : "bg-surface-1 border border-border text-foreground"
                            }`}
                        style={
                            card.isPrimary
                                ? { background: "linear-gradient(145deg, #2D7A50 0%, #1B5E38 100%)" }
                                : {}
                        }
                    >
                        <div className="flex items-center justify-between">
                            <p
                                className={`text-xs font-bold uppercase tracking-wide ${card.isPrimary ? "text-green-100/80" : "text-muted"
                                    }`}
                            >
                                {card.label}
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 opacity-60">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${card.isPrimary ? "text-white" : "text-muted"}`}>Live</span>
                                </div>
                                <button
                                    className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${card.isPrimary
                                        ? "border-white/30 text-white hover:bg-white/10"
                                        : "border-border text-muted hover:bg-surface-2"
                                        }`}
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <p
                            className={`mt-3 text-4xl font-black tracking-tight leading-none ${card.isPrimary ? "text-white" : "text-foreground"
                                }`}
                        >
                            {card.value}
                        </p>

                        <div className="mt-4 flex items-center gap-1.5">
                            <span
                                className={`text-[11px] font-bold ${card.isPrimary ? "text-green-100/60" : "text-muted"
                                    }`}
                            >
                                {card.sub}
                            </span>
                        </div>

                        {/* Background icon watermark */}
                        {card.isPrimary && (
                            <Icon className="absolute right-4 bottom-4 h-16 w-16 text-white/10" weight="bold" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
