export type CourtType = { id: string; name: string };

export interface CurrentPriceDto {
    courtTypeId: string;
    courtTypeName: string;
    startTime: string;
    endTime: string;
    weekdayPrice: number;
    weekendPrice: number;
    effectiveFrom: string;
}

export interface EffectivePriceDto extends CurrentPriceDto {
    priceSource: "SYSTEM_PRICE" | "BRANCH_OVERRIDE";
}

export interface PriceVersionDto {
    effectiveFrom: string;
    isCurrent: boolean;
}

export interface CalculatePriceResultDto {
    courtFee: number;
    breakdown: PriceBreakdownDto[];
}

export interface PriceBreakdownDto {
    startTime: string;
    endTime: string;
    unitPrice: number;
    hours: number;
    subTotal: number;
    priceSource: "SYSTEM_PRICE" | "BRANCH_OVERRIDE";
}

export interface SavePriceDto {
    courtTypeId: string;
    effectiveFrom: string;
    prices: {
        startTime: string;
        endTime: string;
        weekdayPrice: number;
        weekendPrice: number;
    }[];
}

export type CreateSystemPriceDto = SavePriceDto;

export type CreateBranchPriceDto = SavePriceDto;

export interface DeleteBranchPriceDto {
    courtTypeId: string;
    effectiveFrom: string;
    startTime: string;
    endTime: string;
}

export interface CalculatePriceDto {
    courtTypeId: string;
    bookingDate: string;
    slots: { startTime: string; endTime: string }[];
}

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
    effectiveFrom: string; // "YYYY-MM-DD HH:mm:ss"
    rows: PriceRow[];
};

export type WizardSlotPrice = {
    slotId: string;
    slotLabel: string;
    startTime: string;
    endTime: string;
    weekday: string;
    weekend: string;
};

export type TabId = "system" | "branch";
