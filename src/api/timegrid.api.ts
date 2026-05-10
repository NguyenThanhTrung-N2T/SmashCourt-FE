/**
 * Time Grid API
 * 
 * API endpoints for court availability time grid.
 */

import { authFetch } from "./core";
import type {
  TimeGridSlotDto,
  TimeGridQuery,
} from "../features/timeslot/types/timeslot.types";

// ============================================================================
// Time Grid Endpoints
// ============================================================================

/**
 * Get time grid (availability) for a specific court on a specific date
 * Public endpoint - no authentication required
 * 
 * @param branchId - Branch ID
 * @param courtId - Court ID
 * @param query - Query parameters including date
 */
export async function fetchTimeGrid(
  branchId: string,
  courtId: string,
  query: TimeGridQuery
): Promise<TimeGridSlotDto[]> {
  const params = new URLSearchParams({
    date: query.date,
  });

  const response = await authFetch<TimeGridSlotDto[]>(
    `/api/branches/${branchId}/courts/${courtId}/time-grid?${params}`,
    { method: "GET" }
  );
  return response.data || [];
}
