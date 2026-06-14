import { authProtectedFetch } from "./auth.api";
import { appendReportFilterParams } from "@/src/api/helpers/helpers";
import { OwnerDashboardDto, OperationalManagerDashboardDto, ReportFilterDto } from "@/src/features/report/shared/report.types";

/**
 * Get owner dashboard data.
 */
export async function fetchOwnerDashboard(
    filter: ReportFilterDto = {}
): Promise<OwnerDashboardDto> {
    const params = new URLSearchParams();
    appendReportFilterParams(params, filter);

    const response = await authProtectedFetch<OwnerDashboardDto>(
        `/api/dashboard/owner?${params}`,
        { method: "GET" }
    );
    if (!response.data) throw new Error("Failed to fetch owner dashboard data");
    return response.data;
}

/**
 * Get operational manager dashboard data (real-time operations view).
 */
export async function fetchOperationalManagerDashboard(
    filter: ReportFilterDto = {}
): Promise<OperationalManagerDashboardDto> {
    const params = new URLSearchParams();
    appendReportFilterParams(params, filter);

    const response = await authProtectedFetch<OperationalManagerDashboardDto>(
        `/api/dashboard/branch?${params}`,
        { method: "GET" }
    );
    if (!response.data) throw new Error("Failed to fetch operational manager dashboard data");
    return response.data;
}
