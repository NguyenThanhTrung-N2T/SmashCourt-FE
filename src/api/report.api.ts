/**
 * Reports API
 * 
 * API endpoints for report and dashboard data.
 */

import { authProtectedFetch } from "./core";
import {
    ReportFilterDto,
    OwnerDashboardDto,
    ManagerDashboardDto,
    RevenueReportDto,
    BookingReportDto,
    CourtUtilizationReportDto,
    CustomerStatisticsReportDto,
    TopSpendersReportDto,
    ServicePerformanceReportDto,
    PromotionEffectivenessReportDto
} from "../features/report/shared/report.types";

/**
 * Append common report filters to URLSearchParams.
 */
function appendReportFilterParams(params: URLSearchParams, filter: ReportFilterDto): void {
    if (filter.fromDate) params.append("fromDate", filter.fromDate);
    if (filter.toDate) params.append("toDate", filter.toDate);
    if (filter.branchId) params.append("branchId", filter.branchId);
    if (filter.groupBy) params.append("groupBy", filter.groupBy);
}

/**
 * Get owner dashboard data.
 */
export async function fetchOwnerDashboard(
    filter: ReportFilterDto = {}
): Promise<OwnerDashboardDto> {
    const params = new URLSearchParams();
    appendReportFilterParams(params, filter);

    const response = await authProtectedFetch<OwnerDashboardDto>(
        `/api/reports/dashboard/owner?${params}`,
        { method: "GET" }
    );
    if (!response.data) throw new Error("Failed to fetch owner dashboard data");
    return response.data;
}

/**
 * Get manager dashboard data.
 */
export async function fetchManagerDashboard(
    filter: ReportFilterDto = {}
): Promise<ManagerDashboardDto> {
    const params = new URLSearchParams();
    appendReportFilterParams(params, filter);

    const response = await authProtectedFetch<ManagerDashboardDto>(
        `/api/reports/dashboard/manager?${params}`,
        { method: "GET" }
    );
    if (!response.data) throw new Error("Failed to fetch manager dashboard data");
    return response.data;
}

/**
 * Get revenue report data.
 */
export async function fetchRevenueReport(
    filter: ReportFilterDto = {}
): Promise<RevenueReportDto> {
    const params = new URLSearchParams();
    appendReportFilterParams(params, filter);

    const response = await authProtectedFetch<RevenueReportDto>(
        `/api/reports/revenue?${params}`,
        { method: "GET" }
    );
    if (!response.data) throw new Error("Failed to fetch revenue report data");
    return response.data;
}

/**
 * Get booking report data.
 */
export async function fetchBookingReport(
    filter: ReportFilterDto = {}
): Promise<BookingReportDto> {
    const params = new URLSearchParams();
    appendReportFilterParams(params, filter);

    const response = await authProtectedFetch<BookingReportDto>(
        `/api/reports/bookings?${params}`,
        { method: "GET" }
    );
    if (!response.data) throw new Error("Failed to fetch booking report data");
    return response.data;
}

/**
 * Get court utilization report data.
 */
export async function fetchCourtUtilizationReport(
    filter: ReportFilterDto = {}
): Promise<CourtUtilizationReportDto> {
    const params = new URLSearchParams();
    appendReportFilterParams(params, filter);

    const response = await authProtectedFetch<CourtUtilizationReportDto>(
        `/api/reports/courts/utilization?${params}`,
        { method: "GET" }
    );
    if (!response.data) throw new Error("Failed to fetch court utilization report data");
    return response.data;
}

/**
 * Get customer statistics report data.
 */
export async function fetchCustomerStatisticsReport(
    filter: ReportFilterDto = {}
): Promise<CustomerStatisticsReportDto> {
    const params = new URLSearchParams();
    appendReportFilterParams(params, filter);

    const response = await authProtectedFetch<CustomerStatisticsReportDto>(
        `/api/reports/customers?${params}`,
        { method: "GET" }
    );
    if (!response.data) throw new Error("Failed to fetch customer statistics report data");
    return response.data;
}

/**
 * Get top spenders report data (paginated).
 */
export async function fetchTopSpendersReport(
    filter: ReportFilterDto & { page?: number; pageSize?: number } = {}
): Promise<TopSpendersReportDto> {
    const params = new URLSearchParams({
        page: (filter.page || 1).toString(),
        pageSize: (filter.pageSize || 20).toString(),
    });
    appendReportFilterParams(params, filter);

    const response = await authProtectedFetch<TopSpendersReportDto>(
        `/api/reports/customers/top-spenders?${params}`,
        { method: "GET" }
    );
    if (!response.data) throw new Error("Failed to fetch top spenders report data");
    return response.data;
}

/**
 * Get service performance report data.
 */
export async function fetchServicePerformanceReport(
    filter: ReportFilterDto = {}
): Promise<ServicePerformanceReportDto> {
    const params = new URLSearchParams();
    appendReportFilterParams(params, filter);

    const response = await authProtectedFetch<ServicePerformanceReportDto>(
        `/api/reports/services?${params}`,
        { method: "GET" }
    );
    if (!response.data) throw new Error("Failed to fetch service performance report data");
    return response.data;
}

/**
 * Get promotion effectiveness report data.
 */
export async function fetchPromotionEffectivenessReport(
    filter: ReportFilterDto = {}
): Promise<PromotionEffectivenessReportDto> {
    const params = new URLSearchParams();
    appendReportFilterParams(params, filter);

    const response = await authProtectedFetch<PromotionEffectivenessReportDto>(
        `/api/reports/promotions?${params}`,
        { method: "GET" }
    );
    if (!response.data) throw new Error("Failed to fetch promotion effectiveness report data");
    return response.data;
}
