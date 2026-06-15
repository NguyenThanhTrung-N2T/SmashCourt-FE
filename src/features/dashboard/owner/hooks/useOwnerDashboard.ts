import { useState, useEffect, useCallback } from "react";
import {

    fetchCourtUtilizationReport
} from "@/src/api/report.api";
import { fetchOwnerDashboard } from "@/src/api/dashboard.api";
import {
    OwnerDashboardDto,
    ReportFilterDto,
    CourtUtilizationReportDto,
    BookingTrendDto
} from "@/src/features/dashboard/shared/dashboard.types";

interface UseOwnerDashboardResult {
    data: OwnerDashboardDto | null;
    utilization: CourtUtilizationReportDto | null;
    bookingTrend: BookingTrendDto[] | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useOwnerDashboard(filter: ReportFilterDto): UseOwnerDashboardResult {
    const [data, setData] = useState<OwnerDashboardDto | null>(null);
    const [utilization, setUtilization] = useState<CourtUtilizationReportDto | null>(null);
    const [bookingTrend, setBookingTrend] = useState<BookingTrendDto[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Serialize to prevent infinite loops from object reference churn
    const filterKey = JSON.stringify(filter);

    const fetchData = useCallback(async () => {
        // No setIsLoading(true) here — background refetches stay silent
        setError(null);
        try {
            const [dashboardRes, utilizationRes] = await Promise.all([
                fetchOwnerDashboard(filter),
                fetchCourtUtilizationReport({
                    fromDate: filter.fromDate,
                    toDate: filter.toDate,
                    branchId: filter.branchId
                })
            ]);
            setData(dashboardRes);
            setUtilization(utilizationRes);
            setBookingTrend(dashboardRes.bookingTrend);
        } catch (err: unknown) {
            console.error("Error fetching owner dashboard:", err);
            setError((err as Error).message || "Đã xảy ra lỗi khi tải dữ liệu dashboard");
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterKey]);

    useEffect(() => {
        setIsLoading(true); // Only shown on mount + filter/branch changes
        fetchData();
    }, [fetchData]);

    return { data, utilization, bookingTrend, isLoading, error, refetch: fetchData };
}
