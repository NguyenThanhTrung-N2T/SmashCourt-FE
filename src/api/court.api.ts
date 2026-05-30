/**
 * Court API
 *
 * API endpoints for court management operations.
 * Base path: /api/courts  (flat structure — branchId is passed as a query param)
 */

import { authFetch, authProtectedFetch } from "./core";
import type {
  CourtDto,
  CourtListQuery,
  CourtManagementCardDto,
  CourtManagementDashboardStats,
  CourtManagementDashboardQuery,
  CourtManagementDetailDto,
  CourtManagementTimelineDto,
  PagedResult,
} from "../features/court/shared/types/court.types";

// ============================================================================
// Helpers
// ============================================================================

function buildQuery(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join("&");
}

// ============================================================================
// Public / Authenticated Endpoints
// ============================================================================

/**
 * GET /api/courts
 * Public (requires branchId) or authenticated (auto-resolves branch for staff+).
 * Returns courts filtered by optional typeId.
 */
export async function fetchCourts(
  branchId: string,
  query?: CourtListQuery
): Promise<CourtDto[]> {
  const url = `/api/courts` + buildQuery({ branchId, typeId: query?.typeId });
  const response = await authFetch<CourtDto[]>(url, { method: "GET" });
  return response.data || [];
}

/**
 * GET /api/courts/{id}
 * Public: requires branchId query param.
 * Authenticated (Staff+): branchId is optional.
 */
export async function fetchCourtById(
  courtId: string,
  branchId?: string
): Promise<CourtDto> {
  const url = `/api/courts/${courtId}` + buildQuery({ branchId });
  const response = await authFetch<CourtDto>(url, { method: "GET" });
  if (!response.data) throw new Error("Court not found");
  return response.data;
}

// ============================================================================
// Management Dashboard (Owner / Manager)
// ============================================================================

/**
 * GET /api/courts/management-dashboard/stats
 * Returns aggregate summary stats.
 */
export async function fetchCourtManagementStats(query?: {
  branchId?: string;
  date?: string;
}): Promise<CourtManagementDashboardStats> {
  const url =
    `/api/courts/management-dashboard/stats` +
    buildQuery({ branchId: query?.branchId, date: query?.date });
  const response = await authProtectedFetch<CourtManagementDashboardStats>(url, {
    method: "GET",
  });
  if (!response.data) throw new Error("Failed to load court stats");
  return response.data;
}

/**
 * GET /api/courts/management-dashboard/courts
 * Returns paginated court cards.
 */
export async function fetchCourtManagementCourts(
  query?: CourtManagementDashboardQuery
): Promise<PagedResult<CourtManagementCardDto>> {
  const url =
    `/api/courts/management-dashboard/courts` +
    buildQuery({
      branchId: query?.branchId,
      date: query?.date,
      search: query?.search,
      typeId: query?.typeId,
      page: query?.page?.toString(),
      pageSize: query?.pageSize?.toString(),
    });
  const response = await authProtectedFetch<PagedResult<CourtManagementCardDto>>(
    url,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to load court cards");
  return response.data;
}

/**
 * GET /api/courts/management-timeline
 * Returns rich timeline view data.
 */
export async function fetchCourtManagementTimeline(query: {
  branchId?: string;
  date: string;
  typeId?: string;
}): Promise<CourtManagementTimelineDto> {
  const url =
    `/api/courts/management-timeline` +
    buildQuery({ branchId: query.branchId, date: query.date, typeId: query.typeId });
  const response = await authProtectedFetch<CourtManagementTimelineDto>(url, {
    method: "GET",
  });
  if (!response.data) throw new Error("Failed to load management timeline");
  return response.data;
}

/**
 * GET /api/courts/{id}/management-details
 * Returns rich operational detail for a single court.
 * Auth: Owner / Manager policy.
 */
export async function fetchCourtManagementDetail(
  courtId: string,
  date?: string
): Promise<CourtManagementDetailDto> {
  const url = `/api/courts/${courtId}/management-details` + buildQuery({ date });
  const response = await authProtectedFetch<CourtManagementDetailDto>(url, {
    method: "GET",
  });
  if (!response.data) throw new Error("Failed to load court detail");
  return response.data;
}

// ============================================================================
// Mutations (Owner / Manager)
// ============================================================================

/**
 * POST /api/courts
 * branchId is optional for Owner (auto-resolved); required for Manager.
 */
export async function createCourt(
  data: {
    name: string;
    description?: string;
    avatarUrl?: string;
    courtTypeId: string;
  },
  branchId?: string
): Promise<CourtDto> {
  const url = `/api/courts` + buildQuery({ branchId });
  const response = await authProtectedFetch<CourtDto>(url, {
    method: "POST",
    body: data,
  });
  if (!response.data) throw new Error("Failed to create court");
  return response.data;
}

/**
 * PUT /api/courts/{id}
 */
export async function updateCourt(
  courtId: string,
  data: {
    name: string;
    description?: string;
    avatarUrl?: string;
    courtTypeId: string;
  }
): Promise<CourtDto> {
  const response = await authProtectedFetch<CourtDto>(`/api/courts/${courtId}`, {
    method: "PUT",
    body: data,
  });
  if (!response.data) throw new Error("Failed to update court");
  return response.data;
}

/**
 * POST /api/courts/{id}/suspend
 */
export async function suspendCourt(courtId: string): Promise<void> {
  await authProtectedFetch<null>(`/api/courts/${courtId}/suspend`, {
    method: "POST",
  });
}

/**
 * POST /api/courts/{id}/activate
 */
export async function activateCourt(courtId: string): Promise<void> {
  await authProtectedFetch<null>(`/api/courts/${courtId}/activate`, {
    method: "POST",
  });
}

/**
 * DELETE /api/courts/{id}
 */
export async function deleteCourt(courtId: string): Promise<void> {
  await authProtectedFetch<null>(`/api/courts/${courtId}`, {
    method: "DELETE",
  });
}
