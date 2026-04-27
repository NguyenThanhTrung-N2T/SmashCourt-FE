export type CourtType = { id: string; name: string };

export type TimeSlot = {
    id: string;
    label: string;
    startTime: string; // "HH:mm:ss"
    endTime: string;   // "HH:mm:ss"
};

export type PriceRow = {
    slotId: string;
    slotLabel: string;
    startTime: string;
    endTime: string;
    weekdayPrice: number;
    weekendPrice: number;
    priceSource?: "SYSTEM_PRICE" | "BRANCH_OVERRIDE";
    /** Original system price – present only when branch tab shows an override */
    systemWeekdayPrice?: number;
    systemWeekendPrice?: number;
};

export type PriceConfig = {
    id: string;
    courtTypeId: string;
    courtTypeName: string;
    effectiveFrom: string; // "YYYY-MM-DD"
    rows: PriceRow[];
};

export interface VersionItem {
    effectiveFrom: string;
    isCurrent: boolean;
}

export type WizardSlotPrice = {
    slotId: string;
    slotLabel: string;
    startTime: string;
    endTime: string;
    weekday: string;
    weekend: string;
};

export type TabId = "system" | "branch";
