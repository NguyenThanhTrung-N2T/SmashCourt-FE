/**
 * Time Slot Validation Utilities
 * 
 * Utilities for validating time slot data.
 */

import { isEndTimeAfterStartTime, doTimeRangesOverlap } from "./timeFormat";
import type { TimeSlotDto } from "../types/timeslot.types";

/**
 * Validate time slot times
 */
export function validateTimeSlotTimes(
  startTime: string,
  endTime: string
): string | null {
  if (!startTime || !endTime) {
    return "Vui lòng nhập thời gian bắt đầu và kết thúc";
  }
  
  if (!isEndTimeAfterStartTime(startTime, endTime)) {
    return "Thời gian kết thúc phải sau thời gian bắt đầu";
  }
  
  return null;
}

/**
 * Check if a new time slot overlaps with existing slots
 */
export function checkTimeSlotOverlap(
  startTime: string,
  endTime: string,
  existingSlots: TimeSlotDto[],
  excludeSlotId?: string
): string | null {
  for (const slot of existingSlots) {
    // Skip the slot being edited
    if (
      excludeSlotId &&
      (slot.weekdaySlotId === excludeSlotId ||
        slot.weekendSlotId === excludeSlotId)
    ) {
      continue;
    }
    
    if (doTimeRangesOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
      return `Khung giờ trùng với khung giờ ${slot.startTime} - ${slot.endTime}`;
    }
  }
  
  return null;
}

/**
 * Validate time format (HH:mm or HH:mm:ss)
 */
export function validateTimeFormat(timeString: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  return timeRegex.test(timeString);
}
