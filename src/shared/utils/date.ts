/**
 * Parse backend date format "DD MM YYYY HH:mm:ss" to Date object
 */
export function parseBackendDate(dateString: string): Date | null {
  try {
    const cleaned = dateString.trim();

    // Check if it matches DD/MM/YYYY format with optional time
    const slashMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2}):(\d{1,2}))?$/);
    if (slashMatch) {
      const day = parseInt(slashMatch[1], 10);
      const month = parseInt(slashMatch[2], 10) - 1;
      const year = parseInt(slashMatch[3], 10);
      const hours = parseInt(slashMatch[4], 10) || 0;
      const minutes = parseInt(slashMatch[5], 10) || 0;
      const seconds = parseInt(slashMatch[6], 10) || 0;
      return new Date(year, month, day, hours, minutes, seconds);
    }

    // Backend format: "12 05 2026 23:42:37" (DD MM YYYY HH:mm:ss)
    const parts = cleaned.split(' ');
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      
      let hours = 0, minutes = 0, seconds = 0;
      if (parts.length >= 4) {
        const timeParts = parts[3].split(':');
        hours = parseInt(timeParts[0], 10) || 0;
        minutes = parseInt(timeParts[1], 10) || 0;
        seconds = parseInt(timeParts[2], 10) || 0;
      }
      
      const date = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Fallback to standard Date parsing
    const standardDate = new Date(dateString);
    if (!isNaN(standardDate.getTime())) {
      return standardDate;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Format a date string to DD/MM/YYYY format
 */
export function formatDate(dateString: string): string {
  try {
    const date = parseBackendDate(dateString);
    if (!date) return dateString;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Format a date string to include time (DD/MM/YYYY HH:mm)
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = parseBackendDate(dateString);
    if (!date) return dateString;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

/**
 * Format a time string (TimeOnly format)
 */
export function formatTime(timeString: string): string {
  try {
    // TimeOnly format is "HH:mm:ss"
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  } catch {
    return timeString;
  }
}

/**
 * Format currency in VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
