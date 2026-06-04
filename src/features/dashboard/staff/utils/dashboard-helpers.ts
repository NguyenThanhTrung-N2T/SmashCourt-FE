/**
 * Manager Dashboard Utility Helpers
 * 
 * Helper functions for status mapping, time formatting, and data transformations.
 */

import { LiveCourtAttentionDto } from "@/src/features/report/shared/report.types";

/**
 * Get attention status priority (lower = higher priority)
 */
export function getAttentionPriority(status: string): number {
    const priorities: Record<string, number> = {
        'PENDING_PAYMENT': 1,
        'UPCOMING_CHECK_IN': 2,
        'NO_SHOW_RISK': 3,
        'PLAYING': 4,
        'AVAILABLE': 5,
    };
    return priorities[status] || 999;
}

/**
 * Sort courts by attention priority
 */
export function sortCourtsByPriority(courts: LiveCourtAttentionDto[]): LiveCourtAttentionDto[] {
    return [...courts].sort((a, b) => {
        const priorityA = getAttentionPriority(a.attentionStatus);
        const priorityB = getAttentionPriority(b.attentionStatus);
        return priorityA - priorityB;
    });
}

/**
 * Get attention status display config
 */
export function getAttentionStatusConfig(status: string) {
    const configs: Record<string, { label: string; color: string; bgColor: string }> = {
        'PENDING_PAYMENT': {
            label: 'Chờ thanh toán',
            color: '#DC2626',
            bgColor: '#FEE2E2',
        },
        'UPCOMING_CHECK_IN': {
            label: 'Sắp check-in',
            color: '#F59E0B',
            bgColor: '#FEF3C7',
        },
        'NO_SHOW_RISK': {
            label: 'Nguy cơ vắng',
            color: '#EA580C',
            bgColor: '#FFEDD5',
        },
        'PLAYING': {
            label: 'Đang chơi',
            color: '#16A34A',
            bgColor: '#DCFCE7',
        },
        'AVAILABLE': {
            label: 'Sẵn sàng',
            color: '#64748B',
            bgColor: '#F1F5F9',
        },
    };
    return configs[status] || configs['AVAILABLE'];
}
export const CourtStatusVietnameseMap: Record<string, string> = {
  AVAILABLE: "Trống",
  LOCKED: "Đang khóa",
  IN_USE: "Đang sử dụng",
  SUSPENDED: "Tạm ngưng",
  INACTIVE: "Không hoạt động",
};
export function getCourtStatusVietnamese(status?: string): string {
  if (!status) return "Không xác định";
  return CourtStatusVietnameseMap[status] ?? "Không xác định";
}
/**
 * Format relative time (e.g., "in 15 min", "5 min ago")
 */
export function formatRelativeTime(minutes: number | null): string {
    if (minutes === null) return '';
    
    if (minutes === 0) return 'Ngay bây giờ';
    
    const absMinutes = Math.abs(minutes);
    
    if (absMinutes < 60) {
        if (minutes > 0) {
            return `Còn ${absMinutes} phút`;
        } else {
            return `${absMinutes} phút trước`;
        }
    }
    
    const hours = Math.floor(absMinutes / 60);
    const remainingMinutes = absMinutes % 60;
    
    if (minutes > 0) {
        return remainingMinutes > 0 
            ? `Còn ${hours}h ${remainingMinutes}p`
            : `Còn ${hours} giờ`;
    } else {
        return remainingMinutes > 0
            ? `${hours}h ${remainingMinutes}p trước`
            : `${hours} giờ trước`;
    }
}

/**
 * Format time from ISO string to HH:mm
 */
export function formatTime(isoString: string | null): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format time range
 */
export function formatTimeRange(startTime: string | null, endTime: string | null): string {
    if (!startTime || !endTime) return '';
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

/**
 * Get booking status display config
 */
export function getBookingStatusConfig(status: string) {
    const configs: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' }> = {
        'CONFIRMED': { label: 'Đã xác nhận', variant: 'success' },
        'PENDING': { label: 'Chờ xử lý', variant: 'warning' },
        'CHECKED_IN': { label: 'Đã check-in', variant: 'info' },
        'COMPLETED': { label: 'Hoàn thành', variant: 'success' },
        'CANCELLED': { label: 'Đã hủy', variant: 'error' },
        'NO_SHOW': { label: 'Vắng mặt', variant: 'error' },
    };
    return configs[status] || { label: status, variant: 'neutral' as const };
}

/**
 * Get payment status display config
 */
export function getPaymentStatusConfig(status: string) {
    const configs: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' }> = {
        'PAID': { label: 'Đã thanh toán', variant: 'success' },
        'PENDING': { label: 'Chờ thanh toán', variant: 'warning' },
        'REFUNDED': { label: 'Đã hoàn tiền', variant: 'info' },
        'FAILED': { label: 'Thất bại', variant: 'error' },
    };
    return configs[status] || { label: status, variant: 'neutral' as const };
}

/**
 * Get action type display config
 */
export function getActionTypeConfig(actionType: string) {
    const configs: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' }> = {
        'PENDING_PAYMENT': { label: 'Thu tiền', variant: 'warning' },
        'CANCELLED_PENDING_REFUND': { label: 'Hoàn tiền', variant: 'info' },
    };
    return configs[actionType] || { label: actionType, variant: 'neutral' as const };
}

/**
 * Format currency (VND)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}

/**
 * Get occupancy level color
 */
export function getOccupancyColor(rate: number): string {
    if (rate >= 0.8) return '#DC2626'; // High - Red
    if (rate >= 0.6) return '#F59E0B'; // Medium - Amber
    return '#16A34A'; // Low - Green
}
