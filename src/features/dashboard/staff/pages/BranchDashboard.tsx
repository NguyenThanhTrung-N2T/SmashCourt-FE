"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    ChartLineUp,
    CourtBasketball,
    Calendar,
    Clock,
    Warning,
    ArrowRight,
    ArrowsClockwise,
} from "@phosphor-icons/react";
import {
    KpiCard,
    LiveCourtCard,
    UpcomingBookingCard,
    ActionQueueItem,
    OccupancyForecastChart,
    DashboardKpiLoading,
    DashboardCourtCardsLoading,
    DashboardListLoading,
    DashboardChartLoading,
    DashboardError,
} from "@/src/features/dashboard/staff/components";
import { PageHeader } from "@/src/shared/components/layout";
import { useManagerDashboard } from "@/src/features/dashboard/staff/hooks/useManagerDashboard";
import { sortCourtsByPriority } from "@/src/features/dashboard/staff/utils/dashboard-helpers";
import { EmptyState } from "@/src/shared/components/feedback/EmptyState";

export function BranchDashboard() {
    const router = useRouter();
    const { data, isLoading, error, refetch } = useManagerDashboard();

    // ── KPI Cards Data ──
    const kpis = useMemo(() => {
        if (!data) return [];
        const kpiData = data.kpis;

        return [
            {
                label: "Doanh thu hôm nay",
                value: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(kpiData.revenueToday),
                sub: "Tính đến hiện tại",
                icon: ChartLineUp,
                isPrimary: true,
            },
            {
                label: "Sân đang dùng",
                value: `${kpiData.courtsInUse}/${data.totalCourts}`,
                sub: `${Math.round((kpiData.courtsInUse / Math.max(data.totalCourts, 1)) * 100)}% công suất`,
                icon: CourtBasketball,
            },
            {
                label: "Lượt đặt hôm nay",
                value: kpiData.todayBookingsCount.toString(),
                sub: "Tổng số lượt đặt",
                icon: Calendar,
            },
            {
                label: "Sắp check-in",
                value: kpiData.upcomingCheckInsCount.toString(),
                sub: "Trong 30 phút tới",
                icon: Clock,
            },
            {
                label: "Cần xử lý",
                value: kpiData.needsActionCount.toString(),
                sub: `${kpiData.pendingPaymentCount} thanh toán, ${kpiData.pendingRefundCount} hoàn tiền`,
                icon: Warning,
                trend: (kpiData.needsActionCount > 0 ? "up" : "neutral") as "up" | "down" | "neutral",
            },
        ];
    }, [data]);

    const liveCourts = data?.liveCourts;
    // ── Live Courts (sorted by priority, show max 8) ──
    const displayCourts = useMemo(() => {
        if (!liveCourts) return [];
        const sorted = sortCourtsByPriority(liveCourts);
        return sorted.slice(0, 8);
    }, [liveCourts]);

    const upcomingBookingsList = data?.upcomingBookings;
    // ── Upcoming Bookings (max 10) ──
    const upcomingBookings = useMemo(() => {
        if (!upcomingBookingsList) return [];
        return upcomingBookingsList.slice(0, 10);
    }, [upcomingBookingsList]);

    const actionQueueList = data?.actionQueue;
    // ── Action Queue ──
    const actionQueue = useMemo(() => {
        if (!actionQueueList) return [];
        return actionQueueList;
    }, [actionQueueList]);

    const occupancyForecastList = data?.occupancyForecast;
    // ── Occupancy Forecast (next 8 hours) ──
    const occupancyForecast = useMemo(() => {
        if (!occupancyForecastList) return [];
        return occupancyForecastList.slice(0, 8);
    }, [occupancyForecastList]);

    // ── Error State ──
    if (error) {
        return (
            <div className="w-full px-8 pt-6 pb-10">
                <DashboardError message={error} onRetry={refetch} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader
                    title="Tổng quan"
                    description="Tổng quan hoạt động của chi nhánh hôm nay."
                />

                <button
                    onClick={refetch}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50"
                >
                    <ArrowsClockwise size={18} className={`text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
                    Làm mới
                </button>
            </div>

            {/* ── KPI Cards ── */}
            {isLoading ? (
                <DashboardKpiLoading />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {kpis.map((kpi, idx) => (
                        <KpiCard key={idx} {...kpi} />
                    ))}
                </div>
            )}

            {/* ── Live Courts Requiring Attention ── */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                            Sân cần chú ý
                        </h2>
                    </div>
                    {data && data.totalCourts > 0 && (
                        <button
                            onClick={() => router.push('/manager/courts')}
                            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-secondary transition-colors"
                        >
                            Xem tất cả {data.totalCourts} sân
                            <ArrowRight size={16} weight="bold" />
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <DashboardCourtCardsLoading />
                ) : displayCourts.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {displayCourts.map((court) => (
                            <LiveCourtCard
                                key={court.courtId}
                                court={court}
                                onClick={() => {
                                    if (court.bookingId) {
                                        router.push(`/manager/bookings?bookingId=${court.bookingId}`);
                                    }
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<CourtBasketball size={48} weight="duotone" />}
                        title="Không có sân cần chú ý"
                        description="Tất cả các sân đang hoạt động bình thường"
                    />
                )}
            </div>

            {/* ── Upcoming Bookings & Action Queue (Side by Side) ── */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Upcoming Bookings */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                                Lượt đặt sắp tới
                            </h2>
                            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                                Lượt đặt sân tiếp theo trong ngày
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/manager/bookings')}
                            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-secondary transition-colors"
                        >
                            Xem tất cả
                            <ArrowRight size={16} weight="bold" />
                        </button>
                    </div>

                    {isLoading ? (
                        <DashboardListLoading />
                    ) : upcomingBookings.length > 0 ? (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {upcomingBookings.map((booking) => (
                                <UpcomingBookingCard
                                    key={booking.bookingId}
                                    booking={booking}
                                    onClick={() => {
                                        router.push(`/manager/bookings/${booking.bookingId}`);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={<Calendar size={48} weight="duotone" />}
                            title="Không có lượt đặt sắp tới"
                            description="Chưa có lượt đặt nào trong thời gian tới"
                        />
                    )}
                </div>

                {/* Action Queue */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                                Hàng đợi xử lý
                            </h2>
                            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                                Các tác vụ cần xử lý ngay
                            </p>
                        </div>
                        {data && actionQueue.length > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                                <Warning size={16} weight="fill" className="text-amber-600 dark:text-amber-400" />
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                    {actionQueue.length} việc
                                </span>
                            </div>
                        )}
                    </div>

                    {isLoading ? (
                        <DashboardListLoading />
                    ) : actionQueue.length > 0 ? (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {actionQueue.map((action) => (
                                <ActionQueueItem
                                    key={action.bookingId}
                                    action={action}
                                    onClick={() => {
                                        router.push(`/manager/bookings?bookingId=${action.bookingId}`);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={<Warning size={48} weight="duotone" />}
                            title="Không có việc cần xử lý"
                            description="Tất cả các tác vụ đã được hoàn thành"
                        />
                    )}
                </div>
            </div>

            {/* ── Occupancy Forecast Chart ── */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Dự báo công suất
                    </h2>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                        Tỉ lệ lắp đầy sân trong vòng 8 giờ tới
                    </p>
                </div>

                {isLoading ? (
                    <DashboardChartLoading />
                ) : occupancyForecast.length > 0 ? (
                    <OccupancyForecastChart data={occupancyForecast} height="h-72" />
                ) : (
                    <EmptyState
                        icon={<ChartLineUp size={48} weight="duotone" />}
                        title="Không có dữ liệu dự báo"
                        description="Chưa có đủ dữ liệu để dự báo công suất"
                    />
                )}
            </div>
        </div>
    );
}
