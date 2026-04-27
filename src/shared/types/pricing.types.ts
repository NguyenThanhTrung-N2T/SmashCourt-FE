// ─── Response DTOs ─────────────────────────────────────────────────────────

export interface CurrentPriceDto {
  courtTypeId: string;
  courtTypeName: string;
  startTime: string;     // "HH:mm:ss"
  endTime: string;       // "HH:mm:ss"
  weekdayPrice: number;
  weekendPrice: number;
  effectiveFrom: string; // "YYYY-MM-DD"
}

export interface EffectivePriceDto extends CurrentPriceDto {
  priceSource: "SYSTEM_PRICE" | "BRANCH_OVERRIDE";
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

// ─── Request DTOs ──────────────────────────────────────────────────────────

export interface CreateSystemPriceDto {
  courtTypeId: string;
  effectiveFrom: string; // "YYYY-MM-DD"
  prices: {
    startTime: string;   // "HH:mm:ss"
    endTime: string;     // "HH:mm:ss"
    weekdayPrice: number;
    weekendPrice: number;
  }[];
}

export interface CreateBranchPriceDto {
  courtTypeId: string;
  effectiveFrom: string;
  prices: {
    startTime: string;
    endTime: string;
    weekdayPrice: number;
    weekendPrice: number;
  }[];
}

export interface DeleteBranchPriceDto {
  courtTypeId: string;
  effectiveFrom: string;
  startTime: string;
  endTime: string;
}

export interface CalculatePriceDto {
  courtTypeId: string;
  bookingDate: string;   // "YYYY-MM-DD"
  slots: { startTime: string; endTime: string }[];
}
