// ─── BACKEND API TYPES (FROM pricing-system.md) ────────────────────────────

/**
 * GET /api/system-prices response
 * Current effective system prices for a specific date
 */
export interface CurrentPriceDto {
    courtTypeId: string;
    courtTypeName: string;
    startTime: string;
    endTime: string;
    weekdayPrice: number;
    weekendPrice: number;
    effectiveFrom: string;
}

/**
 * Version summary in system and branch price version lists
 * Used in GET /api/system-prices/versions and GET /api/prices/overrides responses
 */
export interface PriceVersionDto {
    effectiveFrom: string;
    status: "ACTIVE" | "SCHEDULED" | "EXPIRED";
}

/**
 * GET /api/system-prices/versions/{effectiveFrom} response
 * Exact configuration for a specific system price version
 */
export interface SystemPriceVersionDetailDto {
    courtTypeId: string;
    courtTypeName: string;
    effectiveFrom: string;
    status: "ACTIVE" | "SCHEDULED" | "EXPIRED";
    slots: {
        startTime: string;
        endTime: string;
        weekdayPrice: number;
        weekendPrice: number;
    }[];
}

/**
 * GET /api/prices/overrides/{effectiveFrom} response
 * Exact configuration for a specific branch price override version
 */
export interface PriceOverrideVersionDetailDto {
    branchId: string;
    courtTypeId: string;
    courtTypeName: string;
    effectiveFrom: string;
    status: "ACTIVE" | "SCHEDULED" | "EXPIRED";
    slots: {
        startTime: string;
        endTime: string;
        weekdayPrice: number;
        weekendPrice: number;
    }[];
}

/**
 * GET /api/prices response
 * Effective pricing snapshot for a branch (system + branch overrides merged)
 */
export interface EffectivePricesResponse {
    branchId: string;
    date: string;
    courtTypes: {
        courtTypeId: string;
        courtTypeName: string;
        slots: {
            startTime: string;
            endTime: string;
            weekdayPrice: number;
            weekendPrice: number;
            effectiveFrom: string;
            priceSource: "BRANCH" | "SYSTEM";
        }[];
    }[];
}

/**
 * PATCH /api/prices/calculate response
 * Price calculation result with breakdown
 */
export interface CalculatePriceResultDto {
    courtFee: number;
    breakdown: PriceBreakdownDto[];
}

/**
 * Individual price breakdown item in CalculatePriceResultDto
 */
export interface PriceBreakdownDto {
    startTime: string;
    endTime: string;
    unitPrice: number;
    hours: number;
    subTotal: number;
    priceSource: "SYSTEM_PRICE" | "BRANCH_OVERRIDE";
}

/**
 * POST /api/prices/calculate request
 * Calculate total price for a court booking
 */
export interface CalculatePriceDto {
    courtId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
}

/**
 * DELETE /api/prices/overrides/{effectiveFrom} request body
 * Delete specific time slots from a branch price override version
 */
export interface DeleteBranchPriceDto {
    courtTypeId: string;
    effectiveFrom: string;
    startTime: string;
    endTime: string;
}

/**
 * PATCH /api/system-prices/versions/{effectiveFrom} request body
 * Create or update a system price version
 */
export interface UpsertSystemPriceItem {
    startTime: string;
    endTime: string;
    weekdayPrice: number;
    weekendPrice: number;
}
export interface UpsertSystemPriceRequest {
    slots: UpsertSystemPriceItem[];
}

/**
 * PATCH /api/prices/overrides/{effectiveFrom} request body
 * Create or update a branch price override version
 */
export interface UpsertPriceOverrideRequest {
    slots: {
        startTime: string;
        endTime: string;
        weekdayPrice: number;
        weekendPrice: number;
    }[];
}
