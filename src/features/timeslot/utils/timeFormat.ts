/**
 * Time Formatting Utilities
 * 
 * Utilities for formatting and parsing time values.
 */

/**
 * Format time from HH:mm:ss to HH:mm
 * @example "08:00:00" -> "08:00"
 */
export function formatTime(timeString: string): string {
  if (!timeString) return "";
  return timeString.substring(0, 5);
}

/**
 * Format time to 12-hour format with AM/PM
 * @example "08:00:00" -> "8:00 AM"
 */
export function formatTime12Hour(timeString: string): string {
  if (!timeString) return "";
  
  const [hoursStr, minutesStr] = timeString.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;
  
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Format time for API (ensure HH:mm:ss format)
 * @example "08:00" -> "08:00:00"
 */
export function formatTimeForApi(timeString: string): string {
  if (!timeString) return "";
  
  // If already in HH:mm:ss format, return as is
  if (timeString.split(":").length === 3) {
    return timeString;
  }
  
  // Add seconds if missing
  return `${timeString}:00`;
}

/**
 * Parse time string to minutes since midnight
 * @example "08:00:00" -> 480
 */
export function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if end time is after start time
 */
export function isEndTimeAfterStartTime(
  startTime: string,
  endTime: string
): boolean {
  return parseTimeToMinutes(endTime) > parseTimeToMinutes(startTime);
}

/**
 * Check if two time ranges overlap
 */
export function doTimeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Minutes = parseTimeToMinutes(start1);
  const end1Minutes = parseTimeToMinutes(end1);
  const start2Minutes = parseTimeToMinutes(start2);
  const end2Minutes = parseTimeToMinutes(end2);
  
  return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
}

/**
 * Calculate duration in hours between two times
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  return (endMinutes - startMinutes) / 60;
}

/**
 * Format duration in hours
 * @example 1.5 -> "1.5 giờ"
 * @example 1 -> "1 giờ"
 */
export function formatDuration(hours: number): string {
  if (hours === 1) return "1 giờ";
  return `${hours} giờ`;
}
