/**
 * Time Slot Types
 * 
 * Type definitions for time slot entities and DTOs.
 */

// ============================================================================
// DTOs
// ============================================================================

export interface TimeSlotDto {
  weekdaySlotId: string;
  weekendSlotId: string;
  startTime: string; // HH:mm:ss
  endTime: string;   // HH:mm:ss
}

export interface CreateTimeSlotDto {
  startTime: string; // HH:mm:ss
  endTime: string;   // HH:mm:ss
}

export interface UpdateTimeSlotDto {
  startTime: string; // HH:mm:ss
  endTime: string;   // HH:mm:ss
}

// ============================================================================
// Time Grid Types
// ============================================================================

export enum TimeSlotStatus {
  AVAILABLE = "AVAILABLE",
  LOCKED = "LOCKED",
  IN_USE = "IN_USE",
}

export interface TimeGridSlotDto {
  startTime: string; // HH:mm:ss
  endTime: string;   // HH:mm:ss
  status: TimeSlotStatus;
  lockRemainingSeconds: number | null;
}

export interface TimeGridQuery {
  date: string; // YYYY-MM-DD or ISO 8601
}
