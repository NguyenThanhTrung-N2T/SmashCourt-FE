/**
 * Parse backend date formats to a local Date object.
 * Handles:
 *   - "DD/MM/YYYY HH:mm:ss"  (slash-separated, API primary format)
 *   - "DD MM YYYY HH:mm:ss"  (space-separated)
 *   - "YYYY-MM-DD"           (ISO date-only → local midnight)
 *   - "YYYY-MM-DDTHH:mm:ss"  (ISO datetime)
 */
export function parseBackendDate(dateString: string): Date | null {
  try {
    const trimmed = dateString.trim();

    // "DD/MM/YYYY" or "DD/MM/YYYY HH:mm:ss"  ← actual API format
    const slashParts = trimmed.split(' ');
    const slashDate = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(slashParts[0]);
    if (slashDate) {
      const [, d, m, y] = slashDate;
      let hours = 0, minutes = 0, seconds = 0;
      if (slashParts[1]) {
        const tp = slashParts[1].split(':');
        hours   = parseInt(tp[0], 10) || 0;
        minutes = parseInt(tp[1], 10) || 0;
        seconds = parseInt(tp[2], 10) || 0;
      }
      const date = new Date(Number(y), Number(m) - 1, Number(d), hours, minutes, seconds);
      if (!isNaN(date.getTime())) return date;
    }

    // "DD MM YYYY" or "DD MM YYYY HH:mm:ss"
    const spaceParts = trimmed.split(' ');
    if (spaceParts.length >= 3 && spaceParts[0].length <= 2 && !spaceParts[0].includes('/')) {
      const day   = parseInt(spaceParts[0], 10);
      const month = parseInt(spaceParts[1], 10) - 1;
      const year  = parseInt(spaceParts[2], 10);
      let hours = 0, minutes = 0, seconds = 0;
      if (spaceParts[3]) {
        const tp = spaceParts[3].split(':');
        hours   = parseInt(tp[0], 10) || 0;
        minutes = parseInt(tp[1], 10) || 0;
        seconds = parseInt(tp[2], 10) || 0;
      }
      const date = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(date.getTime())) return date;
    }

    // ISO date-only "YYYY-MM-DD" — parse as local midnight to avoid UTC offset issues
    const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (isoDateOnly) {
      const [, y, m, d] = isoDateOnly;
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      if (!isNaN(date.getTime())) return date;
    }

    // ISO datetime "YYYY-MM-DDTHH:mm:ss" — standard parser handles timezone
    const standardDate = new Date(trimmed);
    if (!isNaN(standardDate.getTime())) return standardDate;

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
