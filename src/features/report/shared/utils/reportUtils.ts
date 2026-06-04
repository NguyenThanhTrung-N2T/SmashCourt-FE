import { format, parse, isValid } from 'date-fns';

const DAY_LABELS: Record<string, string> = {
    'Monday': 'Thứ 2',
    'Tuesday': 'Thứ 3',
    'Wednesday': 'Thứ 4',
    'Thursday': 'Thứ 5',
    'Friday': 'Thứ 6',
    'Saturday': 'Thứ 7',
    'Sunday': 'Chủ Nhật',
};

/**
 * Formats a period string from the API (yyyy-MM-dd, yyyy-MM, or day name) 
 * to a human-friendly Vietnamese format.
 */
export function formatDisplayPeriod(period: string): string {
    if (!period) return '';

    // Handle Day Names (Localization)
    if (DAY_LABELS[period]) {
        return DAY_LABELS[period];
    }

    // Handle yyyy-MM-dd (Day)
    if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
        const date = parse(period, 'yyyy-MM-dd', new Date());
        return isValid(date) ? format(date, 'dd-MM-yyyy') : period;
    }

    // Handle yyyy-MM (Month)
    if (/^\d{4}-\d{2}$/.test(period)) {
        const date = parse(period, 'yyyy-MM', new Date());
        return isValid(date) ? format(date, 'MM-yyyy') : period;
    }

    // Handle numeric strings (Year or ID) - return as is
    if (/^\d+$/.test(period)) {
        return period;
    }

    return period;
}
