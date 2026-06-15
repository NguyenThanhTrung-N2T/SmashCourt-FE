/**
 * Manager Dashboard Hook
 * 
 * Custom hook for fetching and managing operational manager dashboard data.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchOperationalManagerDashboard } from "@/src/api/dashboard.api";
import { OperationalManagerDashboardDto, ReportFilterDto } from "@/src/features/report/shared/report.types";

interface UseManagerDashboardResult {
    data: OperationalManagerDashboardDto | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useManagerDashboard(filter: ReportFilterDto = {}): UseManagerDashboardResult {
    const [data, setData] = useState<OperationalManagerDashboardDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Serialize filter to prevent infinite loops from object reference changes
    const filterKey = JSON.stringify(filter);

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            const dashboardData = await fetchOperationalManagerDashboard(filter);
            setData(dashboardData);
        } catch (err: unknown) {
            console.error("Error fetching manager dashboard:", err);
            const errMsg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu dashboard";
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterKey]); // Use serialized filter key instead of filter object

    // Initial fetch
    useEffect(() => {
        setIsLoading(true);
        fetchData();
    }, [fetchData]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchData,
    };
}
