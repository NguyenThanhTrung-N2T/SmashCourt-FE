/**
 * Time Slot API
 * 
 * API endpoints for time slot management.
 */

import { authProtectedFetch } from "./core";
import type {
  TimeSlotDto,
  CreateTimeSlotDto,
  UpdateTimeSlotDto,
} from "../features/timeslot/types/timeslot.types";

// ============================================================================
// Time Slot CRUD Endpoints
// ============================================================================

/**
 * Get all time slots
 * Authorization: STAFF, BRANCH_MANAGER, OWNER
 */
export async function fetchTimeSlots(): Promise<TimeSlotDto[]> {
  const response = await authProtectedFetch<TimeSlotDto[]>(
    "/api/time-slots",
    { method: "GET" }
  );
  return response.data || [];
}

/**
 * Create a new time slot (creates both WEEKDAY and WEEKEND variants)
 * Authorization: OWNER only
 */
export async function createTimeSlot(dto: CreateTimeSlotDto): Promise<TimeSlotDto> {
  const response = await authProtectedFetch<TimeSlotDto>(
    "/api/time-slots",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: dto,
    }
  );
  if (!response.data) throw new Error("Failed to create time slot");
  return response.data;
}

/**
 * Update a time slot (updates both WEEKDAY and WEEKEND variants)
 * Authorization: OWNER only
 * @param id - Either weekdaySlotId or weekendSlotId (both will be updated)
 */
export async function updateTimeSlot(
  id: string,
  dto: UpdateTimeSlotDto
): Promise<TimeSlotDto> {
  const response = await authProtectedFetch<TimeSlotDto>(
    `/api/time-slots/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: dto,
    }
  );
  if (!response.data) throw new Error("Failed to update time slot");
  return response.data;
}

/**
 * Delete a time slot (deletes both WEEKDAY and WEEKEND variants)
 * Authorization: OWNER only
 * @param id - Either weekdaySlotId or weekendSlotId (both will be deleted)
 */
export async function deleteTimeSlot(id: string): Promise<void> {
  await authProtectedFetch<null>(`/api/time-slots/${id}`, {
    method: "DELETE",
  });
}
