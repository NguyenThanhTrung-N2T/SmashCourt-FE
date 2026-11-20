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
        hours = parseInt(tp[0], 10) || 0;
        minutes = parseInt(tp[1], 10) || 0;
        seconds = parseInt(tp[2], 10) || 0;
      }
      const date = new Date(Number(y), Number(m) - 1, Number(d), hours, minutes, seconds);
      if (!isNaN(date.getTime())) return date;
    }

    // "DD MM YYYY" or "DD MM YYYY HH:mm:ss"
    const spaceParts = trimmed.split(' ');
    if (spaceParts.length >= 3 && spaceParts[0].length <= 2 && !spaceParts[0].includes('/')) {
      const day = parseInt(spaceParts[0], 10);
      const month = parseInt(spaceParts[1], 10) - 1;
      const year = parseInt(spaceParts[2], 10);
      let hours = 0, minutes = 0, seconds = 0;
      if (spaceParts[3]) {
        const tp = spaceParts[3].split(':');
        hours = parseInt(tp[0], 10) || 0;
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
 * Parse backend Vietnam datetime string ("DD/MM/YYYY HH:mm:ss" or ISO) into an absolute Date object with +07:00 offset.
 * Used for countdown timers to expiresAt/approvalExpiresAt to guarantee correct time across any browser timezone (contract §1.3, R-6).
 */
export function parseBackendDateVN(dateString: string): Date | null {
  try {
    const trimmed = dateString.trim();
    const slashParts = trimmed.split(' ');
    const slashDate = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(slashParts[0]);
    if (slashDate) {
      const [, d, m, y] = slashDate;
      const day = d.padStart(2, '0');
      const month = m.padStart(2, '0');
      let timePart = '00:00:00';
      if (slashParts[1]) {
        const tp = slashParts[1].split(':');
        const h = (tp[0] || '0').padStart(2, '0');
        const min = (tp[1] || '0').padStart(2, '0');
        const s = (tp[2] || '0').padStart(2, '0');
        timePart = `${h}:${min}:${s}`;
      }
      const isoStr = `${y}-${month}-${day}T${timePart}+07:00`;
      const date = new Date(isoStr);
      if (!isNaN(date.getTime())) return date;
    }
    // ISO không kèm múi giờ (dashboard BE trả "yyyy-MM-ddTHH:mm:ss" theo giờ VN): coi là +07:00, không theo múi giờ máy
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(trimmed)) {
      const vnDate = new Date(`${trimmed}+07:00`);
      if (!isNaN(vnDate.getTime())) return vnDate;
    }
    const standardDate = new Date(trimmed);
    if (!isNaN(standardDate.getTime())) return standardDate;
    return null;
  } catch {
    return null;
  }
}

// ─── Ngày giờ theo giờ Việt Nam (P6-22, T-7) ────────────────────────────────
// "Hôm nay" lấy bằng toISOString() là ngày UTC: từ 00:00 tới 06:59 giờ VN ra ngày hôm trước.
// Các hàm dưới luôn tính theo Asia/Ho_Chi_Minh, không phụ thuộc múi giờ máy; ngày dạng "yyyy-MM-dd" (khóa ngày).

const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const vnDatePartsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: VN_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function vnParts(date: Date): Record<'year' | 'month' | 'day' | 'hour' | 'minute', string> {
  const parts: Record<string, string> = {};
  for (const part of vnDatePartsFormatter.formatToParts(date)) parts[part.type] = part.value;
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    // Một số trình duyệt in nửa đêm là "24" dù hourCycle h23
    hour: parts.hour === '24' ? '00' : parts.hour,
    minute: parts.minute,
  };
}

/** Ngày lịch Việt Nam ("yyyy-MM-dd") của một thời điểm (mặc định: bây giờ). */
export function toDateKeyVN(date: Date = new Date()): string {
  const { year, month, day } = vnParts(date);
  return `${year}-${month}-${day}`;
}

/** "Hôm nay" theo giờ Việt Nam, dạng "yyyy-MM-dd" (gửi BE, gán cho input type="date"). */
export function getTodayVN(): string {
  return toDateKeyVN(new Date());
}

/** Cộng / trừ ngày trên khóa ngày "yyyy-MM-dd" (tính trên lịch, không qua múi giờ máy). */
export function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/**
 * Chuẩn hóa về khóa ngày "yyyy-MM-dd". Khóa ngày giữ nguyên: new Date("2026-11-20") là nửa đêm UTC,
 * format theo múi giờ máy có thể lùi một ngày (UTC−x). Chuỗi khác đọc qua parseBackendDate (dd/MM/yyyy).
 */
export function normalizeDateKey(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const date = parseBackendDate(trimmed);
  if (!date) return trimmed;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Số phút từ 00:00 của "bây giờ" theo giờ Việt Nam (so với giờ chơi "HH:mm"). */
export function getMinutesOfDayVN(date: Date = new Date()): number {
  const { hour, minute } = vnParts(date);
  return Number(hour) * 60 + Number(minute);
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
