// ============================================================================
// Helpers
// ============================================================================

import { ReportFilterDto } from "@/src/features/report/shared/report.types";

export function buildQuery(params: Record<string, string | undefined>): string {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
    if (entries.length === 0) return "";
    return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join("&");
}
/**
 * Append common report filters to URLSearchParams.
 */

export function appendReportFilterParams(params: URLSearchParams, filter: ReportFilterDto): void {
    if (filter.fromDate) params.append("fromDate", filter.fromDate);
    if (filter.toDate) params.append("toDate", filter.toDate);
    if (filter.branchId) params.append("branchId", filter.branchId);
    if (filter.groupBy) params.append("groupBy", filter.groupBy);
}