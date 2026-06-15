"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
    ChartLineUp,
    Calendar,
    Users,
    TrendUp,
    WarningCircle,
    Clock,
    DeviceMobile,
    Warning,
    CaretDown,
    Faders,
    Money
} from "@phosphor-icons/react";
import { BranchSelector } from "@/src/shared/components/layout/BranchSelector";
import { fetchBasicBranches } from "@/src/api/branch.api";
import {
    KpiCard,
    InsightCard,
    StatusBreakdown,
    LeaderboardRow,
    TrendBarChart,
    TrendLineChart,
    DashboardLoading,
    DashboardError,
    DashboardEmpty,
    DashboardKpiLoading,
    DashboardChartLoading,
    DashboardStatusLoading,
    DashboardInsightLoading,
    DashboardLeaderboardLoading,
} from "@/src/features/dashboard/owner/components";
import { useOwnerDashboard } from "@/src/features/dashboard/owner/hooks/useOwnerDashboard";
import { getFilterDates, FilterOption, getRevenueGroupBy, getGroupByLabel } from "@/src/features/dashboard/owner/utils/dashboard-filters";
import { getTierCfg } from "@/src/features/benefit/loyalty/shared/configs/loyalty-tier.config";
import { formatDisplayPeriod } from "@/src/features/report/shared/utils/reportUtils";
import { ReportFilterDto } from "@/src/features/dashboard/shared/dashboard.types";
import { AIPanelSection } from "@/src/features/ai/shared/components/AIPanelSection";
import { StrategicInsightsPanel } from "@/src/features/ai/shared/components/StrategicInsightsPanel";
import { useRealtimeRefresh } from "@/src/shared/hooks/useRealtimeRefresh";
import { BookingNotificationDto, PaymentNotificationDto } from "@/src/shared/types/signalr.types";

export function OwnerDashboard() {
    const [filter, setFilter] = useState<FilterOption>("Tháng này");
    const [branches, setBranches] = useState<Array<{ id: string; name: string; status?: 0 | 1 | 2 }>>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>("");

    useEffect(() => {
        const loadBranches = async () => {
            try {
                const res = await fetchBasicBranches(1, 50);
                const allBranches = [{ id: "", name: "Tất cả chi nhánh" }, ...res.items];
                setBranches(allBranches);
            } catch (err) {
                console.error("Failed to fetch branches", err);
            }
        };
        loadBranches();
    }, []);

    const filterDates = useMemo<ReportFilterDto>(() => ({
        ...getFilterDates(filter),
        groupBy: getRevenueGroupBy(filter),
        branchId: selectedBranchId || undefined
    }), [filter, selectedBranchId]);
    const groupByLabel = getGroupByLabel(filter);
    const { data, utilization, bookingTrend: trendData, isLoading, error, refetch } = useOwnerDashboard(filterDates);

    const refetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedRefetch = useCallback(() => {
        if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
        refetchTimerRef.current = setTimeout(() => refetch(), 2000);
    }, [refetch]);

    useEffect(() => {
        return () => {
            if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
        };
    }, []);

    // ── Realtime (replace existing useRealtimeRefresh) ───────────────────
    useRealtimeRefresh(["bookings", "payments"], (target, payload) => {
        if (filter === "Tất cả") return;

        if (target === "bookings") {
            const booking = payload as BookingNotificationDto;

            if (
                booking?.branchId &&
                selectedBranchId &&
                booking.branchId !== selectedBranchId
            ) {
                return;
            }
        }

        debouncedRefetch();
    }
    );

    // ── Data Mapping ──
    const dashboardData = data?.summary;
    const dayLabels: Record<string, string> = {
        "Monday": "T2",
        "Tuesday": "T3",
        "Wednesday": "T4",
        "Thursday": "T5",
        "Friday": "T6",
        "Saturday": "T7",
        "Sunday": "CN"
    };

    const kpis = useMemo(() => {
        if (!dashboardData) return [];
        return [
            {
                label: "Tổng doanh thu",
                value: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(dashboardData.totalRevenue),
                sub: dashboardData.revenueChangePercent !== null ? `${dashboardData.revenueChangePercent > 0 ? "+" : ""}${dashboardData.revenueChangePercent}% so với trước` : "Dữ liệu tổng quát",
                trend: (dashboardData.revenueChangePercent === null ? "neutral" : dashboardData.revenueChangePercent > 0 ? "up" : "down") as "up" | "down" | "neutral",
                icon: ChartLineUp,
                isPrimary: true,
            },
            {
                label: "Tổng lượt đặt",
                value: dashboardData.totalBookings.toLocaleString(),
                sub: dashboardData.bookingChangePercent !== null ? `${dashboardData.bookingChangePercent > 0 ? "+" : ""}${dashboardData.bookingChangePercent}% so với trước` : "Dữ liệu tổng quát",
                trend: (dashboardData.bookingChangePercent === null ? "neutral" : dashboardData.bookingChangePercent > 0 ? "up" : "down") as "up" | "down" | "neutral",
                icon: Calendar,
            },
            {
                label: "Tỷ lệ lấp sân",
                value: `${Math.round(dashboardData.occupancyRate * 100)}%`,
                sub: dashboardData.occupancyChangePercent !== null ? `${dashboardData.occupancyChangePercent > 0 ? "+" : ""}${dashboardData.occupancyChangePercent}% so với trước` : "Tất cả thời gian",
                trend: (dashboardData.occupancyChangePercent === null ? "neutral" : dashboardData.occupancyChangePercent > 0 ? "up" : "down") as "up" | "down" | "neutral",
                icon: ChartLineUp,
            },
            {
                label: "Khách hàng mới",
                value: dashboardData.newCustomers.toLocaleString(),
                sub: dashboardData.newCustomerChangePercent !== null ? `${dashboardData.newCustomerChangePercent > 0 ? "+" : ""}${dashboardData.newCustomerChangePercent}% so với trước` : "Trong kỳ này",
                trend: (dashboardData.newCustomerChangePercent === null ? "neutral" : dashboardData.newCustomerChangePercent > 0 ? "up" : "down") as "up" | "down" | "neutral",
                icon: Users,
            },
            {
                label: "Tỷ lệ hủy",
                value: `${Math.round((dashboardData.cancelledBookings / Math.max(dashboardData.totalBookings, 1)) * 100)}%`,
                sub: "Dựa trên lượt đặt",
                trend: "neutral" as const,
                icon: WarningCircle,
            },
            {
                label: "Doanh thu TB",
                value: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                    Math.round(dashboardData.totalRevenue / Math.max(dashboardData.completedBookings, 1))
                ),
                sub: "Mỗi lượt hoàn thành",
                trend: "neutral" as const,
                icon: TrendUp,
            },
        ];
    }, [dashboardData]);

    const revenueTrendData = data?.revenueTrend?.map(i => i.revenue) || [];
    const revenueLabels = data?.revenueTrend?.filter((_, i, arr) => i % Math.max(1, Math.floor(arr.length / 6)) === 0).map(i => formatDisplayPeriod(i.period)) || [];

    const bookingTrend = trendData?.map(i => {
        const isHour = !isNaN(Number(i.period));
        return {
            totalCount: i.totalCount,
            completedCount: i.completedCount,
            label: isHour ? `${i.period}h` : (dayLabels[i.period] || formatDisplayPeriod(i.period)),
            isToday: isHour
                ? Number(i.period) === new Date().getHours()
                : i.period === new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date())
        };
    }) || [];

    const statusItems = dashboardData ? [
        { label: "Hoàn thành", value: dashboardData.completedBookings, percent: Math.round((dashboardData.completedBookings / dashboardData.totalBookings) * 100) || 0, color: "#1D9E75" },
        { label: "Đã hủy", value: dashboardData.cancelledBookings, percent: Math.round((dashboardData.cancelledBookings / dashboardData.totalBookings) * 100) || 0, color: "#D85A30" },
        { label: "Vắng mặt", value: dashboardData.noShowBookings, percent: Math.round((dashboardData.noShowBookings / dashboardData.totalBookings) * 100) || 0, color: "#EF9F27" },
    ] : [];

    const peakHour = utilization?.peakHours?.[0];
    const onlinePercent = dashboardData ? Math.round((dashboardData.onlinePaymentRevenue / Math.max(dashboardData.totalRevenue, 1)) * 100) : 0;
    const cashPercent = dashboardData ? Math.round((dashboardData.cashPaymentRevenue / Math.max(dashboardData.totalRevenue, 1)) * 100) : 0;

    const insights = [
        {
            icon: Clock,
            label: "Giờ cao điểm",
            value: peakHour ? `${peakHour.hour}:00 - ${peakHour.hour + 1}:00` : "Chưa có dữ liệu",
            bgColor: "var(--insight-green-bg)",
            iconColor: "var(--insight-green-icon)",
        },
        {
            icon: DeviceMobile,
            label: "Thanh toán Online",
            value: `${onlinePercent}% doanh thu`,
            bgColor: "var(--insight-blue-bg)",
            iconColor: "var(--insight-blue-icon)",
        },
        {
            icon: Money,
            label: "Thanh toán tại quầy",
            value: `${cashPercent}% doanh thu`,
            bgColor: "var(--insight-yellow-bg)",
            iconColor: "var(--insight-yellow-icon)",
        },
    ];

    const filterOptions: FilterOption[] = ["Hôm nay", "7 ngày qua", "30 ngày qua", "Tháng này", "Tất cả"];

    if (error) {
        return <DashboardError message={error} />;
    }

    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Tổng quan
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Xin chào Owner. Dưới đây là hiệu suất kinh doanh của hệ thống.
                    </p>
                </div>

                <div className="flex items-end gap-3 shrink-0">
                    <div className="relative group">
                        <button className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shrink-0 whitespace-nowrap">
                            <Faders size={18} className="text-slate-400" />
                            {filter}
                            <CaretDown size={18} className="text-slate-400 transition-transform group-hover:rotate-180" />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                            {filterOptions.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setFilter(opt)}
                                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <BranchSelector
                        branches={branches}
                        selectedBranchId={selectedBranchId}
                        onBranchChange={setSelectedBranchId}
                        className="min-w-[240px]"
                        showCard={false}
                    />
                </div>
            </div>

            {isLoading ? <DashboardKpiLoading /> : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {kpis.map((kpi, idx) => <KpiCard key={idx} {...kpi} />)}
                </div>
            )}

            {/* ── Charts & Content ── */}
            <div className="grid gap-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-8">
                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                            Xu hướng doanh thu
                        </h2>

                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                            {`(${groupByLabel})`}
                        </p>
                    </div>
                    {isLoading ? <DashboardChartLoading /> :
                        revenueTrendData.length > 0 ? <TrendLineChart data={revenueTrendData} labels={revenueLabels} height="h-[180px]" /> :
                            <DashboardEmpty title="Không có dữ liệu xu hướng" />}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-8">Xu hướng đặt sân</h2>
                        {isLoading ? <DashboardChartLoading /> :
                            bookingTrend.length > 0 ? <TrendBarChart data={bookingTrend} height="h-[160px]" /> :
                                <DashboardEmpty title="Không có dữ liệu đặt sân" icon="calendar" />}
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-8">Phân bổ trạng thái</h2>
                        {isLoading ? <DashboardStatusLoading /> :
                            <StatusBreakdown items={statusItems} />}
                    </div>
                </div>

                {isLoading ? <DashboardInsightLoading /> : (
                    <div className="grid gap-6 md:grid-cols-3">
                        {insights.map((insight, idx) => <InsightCard key={idx} {...insight} />)}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-6">Chi nhánh hàng đầu</h2>
                        <div className="space-y-1">
                            {isLoading ? <DashboardLeaderboardLoading /> :
                                data?.topBranches.map((branch, idx) => (
                                    <LeaderboardRow key={idx} index={idx + 1} name={branch.branchName} value={new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(branch.revenue)} progress={(branch.revenue / Math.max(...data.topBranches.map(b => b.revenue), 1)) * 100} />
                                ))}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-6">Khách hàng thân thiết</h2>
                        <div className="space-y-1">
                            {isLoading ? <DashboardLeaderboardLoading /> :
                                data?.topCustomers.map((cust, idx) => {
                                    const cfg = getTierCfg(cust.loyaltyTier);
                                    return (
                                        <LeaderboardRow
                                            key={idx}
                                            index={idx + 1}
                                            name={cust.fullName}
                                            value={new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(cust.totalRevenue)}
                                            subLabel={cust.loyaltyTier}
                                            avatarInitials={cust.fullName.split(' ').map(s => s[0]).join('').slice(0, 2)}
                                            avatarColor={cfg.pillBg}
                                            avatarTextColor={cfg.pillText}
                                        />
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div>

            <AIPanelSection
                title="Tầm nhìn chiến lược - AI"
                accentClass="text-amber-500 border-amber-500/40"
                maxHeight="780px"
            >
                <StrategicInsightsPanel />
            </AIPanelSection>
        </div>
    );
}
