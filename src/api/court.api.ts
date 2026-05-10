/**
 * Court API
 * 
 * API endpoints for court management operations.
 */

import { authFetch, authProtectedFetch } from "./core";
import type { CourtDto, CourtListQuery } from "../features/court/types/court.types";

// ============================================================================
// Court Endpoints
// ============================================================================

/**
 * Get all courts in a branch
 * Public: Returns only AVAILABLE courts
 * Authenticated (Staff+): Returns all courts
 */
export async function fetchCourts(
  branchId: string,
  query?: CourtListQuery
): Promise<CourtDto[]> {
  let url = `/api/branches/${branchId}/courts`;
  if (query?.courtTypeId) {
    url += `?courtTypeId=${query.courtTypeId}`;
  }
  const response = await authFetch<CourtDto[]>(url, { method: "GET" });
  return response.data || [];
}

/**
 * Get a specific court by ID
 * Public: Can only view AVAILABLE courts
 * Authenticated (Staff+): Can view all courts
 */
export async function fetchCourtById(
  branchId: string,
  courtId: string
): Promise<CourtDto> {
  const response = await authFetch<CourtDto>(
    `/api/branches/${branchId}/courts/${courtId}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Court not found");
  return response.data;
}

/**
 * Create a new court (Owner/Manager only)
 */
export async function createCourt(
  branchId: string,
  data: {
    name: string;
    description?: string;
    avatarUrl?: string;
    courtTypeId: string;
  }
): Promise<CourtDto> {
  const response = await authProtectedFetch<CourtDto>(
    `/api/branches/${branchId}/courts`,
    {
      method: "POST",
      body: data,
    }
  );
  if (!response.data) throw new Error("Failed to create court");
  return response.data;
}

/**
 * Update a court (Owner/Manager only)
 */
export async function updateCourt(
  branchId: string,
  courtId: string,
  data: {
    name: string;
    description?: string;
    avatarUrl?: string;
    courtTypeId: string;
  }
): Promise<CourtDto> {
  const response = await authProtectedFetch<CourtDto>(
    `/api/branches/${branchId}/courts/${courtId}`,
    {
      method: "PUT",
      body: data,
    }
  );
  if (!response.data) throw new Error("Failed to update court");
  return response.data;
}

/**
 * Suspend a court (Owner/Manager only)
 */
export async function suspendCourt(
  branchId: string,
  courtId: string
): Promise<void> {
  await authProtectedFetch<null>(
    `/api/branches/${branchId}/courts/${courtId}/suspend`,
    { method: "POST" }
  );
}

/**
 * Activate a court (Owner/Manager only)
 */
export async function activateCourt(
  branchId: string,
  courtId: string
): Promise<void> {
  await authProtectedFetch<null>(
    `/api/branches/${branchId}/courts/${courtId}/activate`,
    { method: "POST" }
  );
}

/**
 * Delete a court (Owner/Manager only)
 */
export async function deleteCourt(
  branchId: string,
  courtId: string
): Promise<void> {
  await authProtectedFetch<null>(
    `/api/branches/${branchId}/courts/${courtId}`,
    { method: "DELETE" }
  );
}
