/**
 * walkInPrefill.ts
 * 
 * A singleton module to hand off pre-fill data from the Court Timeline
 * to the Booking Management workspace without complex state management.
 */

export interface WalkInPrefill {
    courtIds: string[];
    bookingDate?: string;
    startTime?: string;
    endTime?: string;
}

let pending: WalkInPrefill | null = null;

export function setPrefill(p: WalkInPrefill) {
    pending = p;
}

export function consumePrefill(): WalkInPrefill | null {
    const p = pending;
    pending = null;
    return p;
}
