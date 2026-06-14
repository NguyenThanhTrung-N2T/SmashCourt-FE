import type { PriceVersionDto, SystemPriceVersionDetailDto, PriceOverrideVersionDetailDto } from "../../shared/types/pricing.types";

/**
 * Sort versions by timeline: SCHEDULED (future) → ACTIVE (current) → EXPIRED (past)
 * Within each status group, sort by date (newest first)
 */
export function sortVersionsByTimeline(versions: PriceVersionDto[]): PriceVersionDto[] {
    return versions.sort((a, b) => {
        // Sort by status priority first
        const statusOrder = {
            SCHEDULED: 0,  // Future (top)
            ACTIVE: 1,     // Current (middle)
            EXPIRED: 2,    // Past (bottom)
        };

        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;

        // Within same status, sort by date
        // SCHEDULED: newest first (2026-07-01 before 2026-06-15)
        // ACTIVE: only one active
        // EXPIRED: newest first (most recent expired at top)
        return b.effectiveFrom.localeCompare(a.effectiveFrom);
    });
}

/**
 * Merged price range interface for displaying consecutive slots with same prices
 */
export interface MergedPriceRange {
    startTime: string;
    endTime: string;
    weekdayPrice: number;
    weekendPrice: number;
}

/**
 * Merge consecutive time slots that have identical prices
 * This creates cleaner display by combining adjacent slots
 */
export function mergeConsecutiveSlots(
    slots: { startTime: string; endTime: string; weekdayPrice: number; weekendPrice: number }[]
): MergedPriceRange[] {
    if (!slots || slots.length === 0) return [];

    // Sort slots by start time to ensure they're in order
    const sortedSlots = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    const merged: MergedPriceRange[] = [];

    for (const slot of sortedSlots) {
        const last = merged[merged.length - 1];

        // Check if can merge with previous
        if (
            last &&
            last.endTime === slot.startTime &&
            last.weekdayPrice === slot.weekdayPrice &&
            last.weekendPrice === slot.weekendPrice
        ) {
            // Extend the range
            last.endTime = slot.endTime;
        } else {
            // Start new range
            merged.push({
                startTime: slot.startTime,
                endTime: slot.endTime,
                weekdayPrice: slot.weekdayPrice,
                weekendPrice: slot.weekendPrice,
            });
        }
    }

    return merged;
}

/**
 * Get version status configuration for UI display
 */
export function getVersionStatusConfig(status: "ACTIVE" | "SCHEDULED" | "EXPIRED") {
    const configs = {
        ACTIVE: {
            bg: "bg-green-500/15",
            text: "text-green-600",
            icon: "CheckCircle",
            label: "Đang áp dụng",
        },
        SCHEDULED: {
            bg: "bg-blue-500/15",
            text: "text-blue-600",
            icon: "CalendarCheck",
            label: "Đã lên lịch",
        },
        EXPIRED: {
            bg: "bg-gray-500/15",
            text: "text-gray-600",
            icon: "ClockCounterClockwise",
            label: "Đã hết hạn",
        },
    };

    return configs[status];
}
