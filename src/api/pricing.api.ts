import { authProtectedFetch } from "@/src/api/auth.api";

import type {
    CurrentPriceDto,
    PriceVersionDto,
    DeleteBranchPriceDto,
    CalculatePriceDto,
    CalculatePriceResultDto,
    SystemPriceVersionDetailDto,
    PriceOverrideVersionDetailDto,
    EffectivePricesResponse,
    UpsertSystemPriceRequest,
    UpsertPriceOverrideRequest,
} from "@/src/features/pricing/shared/types/pricing.types";

// ─── SYSTEM PRICE APIs ───────────────────────────────────────────────────────

/**
 * GET /api/system-prices
 * Get effective system prices for a specific date.
 * 
 * NEW API - Replaces: fetchSystemPriceHistory, fetchCurrentSystemPrices, fetchResolvedSystemPrices
 * 
 * @param date - Target date in yyyy-MM-dd format. Defaults to today if not provided.
 * @param courtTypeId - Optional filter by specific court type
 * @returns List of CurrentPriceDto with effective prices for the date
 */
export async function fetchSystemPrices(
    date?: string,
    courtTypeId?: string,
): Promise<CurrentPriceDto[]> {
    const params = new URLSearchParams();

    // Ensure date is in YYYY-MM-DD format
    if (date) {
        // Validate and normalize date format
        let dateStr = typeof date === 'string' ? date : String(date);

        // If date is in DD/MM/YYYY format, convert to YYYY-MM-DD
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3 && parts[2].length === 4) {
                dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }

        // Validate YYYY-MM-DD format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            console.error('[fetchSystemPrices] Invalid date format:', dateStr);
            throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
        }

        params.append("date", dateStr);
    }

    if (courtTypeId) {
        const courtTypeIdStr = typeof courtTypeId === 'string' ? courtTypeId : String(courtTypeId);
        params.append("courtTypeId", courtTypeIdStr);
    }

    const queryString = params.toString();
    const response = await authProtectedFetch<CurrentPriceDto[]>(
        `/api/system-prices${queryString ? `?${queryString}` : ""}`,
        { method: "GET" },
    );

    const data = response.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;

    return [];
}

/**
 * GET /api/system-prices/versions
 * List all system price versions for a court type.
 */
export async function fetchSystemPriceVersions(
    courtTypeId: string,
): Promise<PriceVersionDto[]> {
    const params = new URLSearchParams({ courtTypeId });
    const response = await authProtectedFetch<{ courtTypeId: string; versions: PriceVersionDto[] }>(
        `/api/system-prices/versions?${params.toString()}`,
        { method: "GET" },
    );

    const data = response.data;
    if (!data || !data.versions) return [];
    if (Array.isArray(data.versions)) return data.versions;

    return [];
}

/**
 * GET /api/system-prices/versions/{effectiveFrom}
 * Get exact configuration for a specific version.
 * 
 * NEW API - Retrieves a specific version by effectiveFrom date
 * 
 * @param effectiveFrom - Date in yyyy-MM-dd format
 * @param courtTypeId - Court type ID (required)
 * @returns SystemPriceVersionDetailDto with slots configuration
 */
export async function fetchSystemPriceVersion(
    effectiveFrom: string,
    courtTypeId: string,
): Promise<SystemPriceVersionDetailDto | null> {
    const params = new URLSearchParams({ courtTypeId });
    const response = await authProtectedFetch<SystemPriceVersionDetailDto>(
        `/api/system-prices/versions/${effectiveFrom}?${params.toString()}`,
        { method: "GET" },
    );

    return response.data ?? null;
}

/**
 * PATCH /api/system-prices/versions/{effectiveFrom}
 * Create or update a system price version.
 * 
 * NEW API - Replaces: createSystemPrice (POST)
 * Uses PATCH semantics for partial updates
 * 
 * @param effectiveFrom - Date in yyyy-MM-dd format
 * @param courtTypeId - Court type ID (required)
 * @param dto - UpsertSystemPriceRequest with slots
 * @returns SystemPriceVersionDetailDto
 */
export async function upsertSystemPriceVersion(
    effectiveFrom: string,
    courtTypeId: string,
    dto: UpsertSystemPriceRequest,
): Promise<SystemPriceVersionDetailDto | null> {
    const params = new URLSearchParams({ courtTypeId });
    const response = await authProtectedFetch<SystemPriceVersionDetailDto>(
        `/api/system-prices/versions/${effectiveFrom}?${params.toString()}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: { slots: dto.slots },
        },
    );

    return response.data ?? null;
}

/**
 * DELETE /api/system-prices/versions/{effectiveFrom}
 * Delete a system price version.
 * 
 * NEW API - Deletes a SCHEDULED (future) version
 * 
 * @param effectiveFrom - Date in yyyy-MM-dd format
 * @param courtTypeId - Court type ID (required)
 */
export async function deleteSystemPriceVersion(
    effectiveFrom: string,
    courtTypeId: string,
): Promise<void> {
    const params = new URLSearchParams({ courtTypeId });
    await authProtectedFetch<null>(
        `/api/system-prices/versions/${effectiveFrom}?${params.toString()}`,
        { method: "DELETE" },
    );
}

// ─── BRANCH PRICE OVERRIDE APIs ──────────────────────────────────────────────

/**
 * GET /api/prices
 * Get effective pricing snapshot for a branch on a specific date.
 * 
 * NEW API - Replaces: fetchBranchPriceHistory, fetchCurrentBranchPrices, fetchResolvedBranchPrices
 * 
 * Authorization:
 * - Owner: must provide branchId query parameter
 * - Manager/Staff: branchId automatically resolved from user's assignment
 * 
 * @param branchId - Required for Owner, ignored for Manager/Staff
 * @param date - Target date in yyyy-MM-dd format. Defaults to today.
 * @param courtTypeId - Optional filter by specific court type
 * @returns EffectivePricesResponse with branch and system prices merged
 */
export async function fetchBranchPrices(
    branchId?: string,
    date?: string,
    courtTypeId?: string,
): Promise<EffectivePricesResponse | null> {
    const params = new URLSearchParams();

    if (branchId) {
        const branchIdStr = typeof branchId === 'string' ? branchId : String(branchId);
        params.append("branchId", branchIdStr);
    }

    // Ensure date is in YYYY-MM-DD format
    if (date) {
        // Validate and normalize date format
        let dateStr = typeof date === 'string' ? date : String(date);

        // If date is in DD/MM/YYYY format, convert to YYYY-MM-DD
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3 && parts[2].length === 4) {
                dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }

        // Validate YYYY-MM-DD format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            console.error('[fetchBranchPrices] Invalid date format:', dateStr);
            throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
        }

        params.append("date", dateStr);
    }

    if (courtTypeId) {
        const courtTypeIdStr = typeof courtTypeId === 'string' ? courtTypeId : String(courtTypeId);
        params.append("courtTypeId", courtTypeIdStr);
    }

    const queryString = params.toString();
    const response = await authProtectedFetch<EffectivePricesResponse>(
        `/api/prices${queryString ? `?${queryString}` : ""}`,
        { method: "GET" },
    );

    return response.data ?? null;
}

/**
 * GET /api/prices/overrides
 * List all branch price override versions for a court type.
 * 
 * NEW API - Replaces: fetchBranchPriceVersions
 * 
 * @param branchId - Required for Owner, ignored for Manager/Staff
 * @param courtTypeId - Court type to get versions for (required)
 * @returns PriceOverrideVersionsResponse
 */
export async function fetchBranchPriceOverrides(
    courtTypeId: string,
    branchId?: string,
): Promise<PriceVersionDto[]> {
    const params = new URLSearchParams({ courtTypeId });
    if (branchId) params.append("branchId", branchId);

    const response = await authProtectedFetch<{ branchId: string; courtTypeId: string; versions: PriceVersionDto[] }>(
        `/api/prices/overrides?${params.toString()}`,
        { method: "GET" },
    );

    const data = response.data;
    if (!data || !data.versions) return [];
    if (Array.isArray(data.versions)) return data.versions;

    return [];
}

/**
 * GET /api/prices/overrides/{effectiveFrom}
 * Get exact configuration for a specific override version.
 * 
 * NEW API - Retrieves a specific override version by effectiveFrom date
 * 
 * @param effectiveFrom - Date in yyyy-MM-dd format
 * @param courtTypeId - Court type ID (required)
 * @param branchId - Required for Owner, ignored for Manager/Staff
 * @returns PriceOverrideVersionDetailDto
 */
export async function fetchBranchPriceOverride(
    effectiveFrom: string,
    courtTypeId: string,
    branchId?: string,
): Promise<PriceOverrideVersionDetailDto | null> {
    const params = new URLSearchParams({ courtTypeId });
    if (branchId) params.append("branchId", branchId);

    const response = await authProtectedFetch<PriceOverrideVersionDetailDto>(
        `/api/prices/overrides/${effectiveFrom}?${params.toString()}`,
        { method: "GET" },
    );

    return response.data ?? null;
}

/**
 * PATCH /api/prices/overrides/{effectiveFrom}
 * Create or update a branch price override version.
 * 
 * NEW API - Replaces: createBranchPrice (POST)
 * Uses PATCH semantics for partial updates
 * 
 * @param effectiveFrom - Date in yyyy-MM-dd format
 * @param courtTypeId - Court type ID (required)
 * @param dto - UpsertPriceOverrideRequest with slots
 * @param branchId - Required for Owner, ignored for Manager
 * @returns PriceOverrideVersionDetailDto
 */
export async function upsertBranchPriceOverride(
    effectiveFrom: string,
    courtTypeId: string,
    dto: UpsertPriceOverrideRequest,
    branchId?: string,
): Promise<PriceOverrideVersionDetailDto | null> {
    const params = new URLSearchParams({ courtTypeId });
    if (branchId) params.append("branchId", branchId);

    const response = await authProtectedFetch<PriceOverrideVersionDetailDto>(
        `/api/prices/overrides/${effectiveFrom}?${params.toString()}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: { slots: dto.slots },
        },
    );

    return response.data ?? null;
}

/**
 * DELETE /api/prices/overrides/{effectiveFrom}
 * Delete a branch price override version.
 * 
 * NEW API - Replaces: deleteBranchPrice (DELETE with body)
 * Deletes SCHEDULED (future) versions only
 * 
 * @param effectiveFrom - Date in yyyy-MM-dd format
 * @param courtTypeId - Court type ID (required)
 * @param branchId - Required for Owner, ignored for Manager
 */
export async function deleteBranchPriceOverride(
    effectiveFrom: string,
    courtTypeId: string,
    branchId?: string,
): Promise<void> {
    const params = new URLSearchParams({ courtTypeId });
    if (branchId) params.append("branchId", branchId);

    await authProtectedFetch<null>(
        `/api/prices/overrides/${effectiveFrom}?${params.toString()}`,
        { method: "DELETE" },
    );
}

/**
 * DELETE /api/prices/overrides/{effectiveFrom} (with time range)
 * Delete specific time slots from a branch price override version.
 * 
 * This is a specialized version for deleting individual slots within a version.
 * Used when resetting specific time slots back to system prices.
 * 
 * @param dto - Contains effectiveFrom, courtTypeId, startTime, endTime
 * @param branchId - Required for Owner, ignored for Manager
 */
export async function deleteBranchPriceSlot(
    dto: DeleteBranchPriceDto,
    branchId?: string,
): Promise<void> {
    const params = new URLSearchParams({ courtTypeId: dto.courtTypeId });
    if (branchId) params.append("branchId", branchId);

    // Extract date from effectiveFrom (remove time if present)
    const effectiveFromDate = dto.effectiveFrom.includes("T")
        ? dto.effectiveFrom.split("T")[0]
        : dto.effectiveFrom.split(" ")[0];

    await authProtectedFetch<null>(
        `/api/prices/overrides/${effectiveFromDate}?${params.toString()}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: {
                startTime: dto.startTime,
                endTime: dto.endTime,
            },
        },
    );
}

// ─── PRICE CALCULATION API ───────────────────────────────────────────────────

/**
 * POST /api/prices/calculate
 * Calculate the total price for multi-court booking based on selected time slots.
 * 
 */
export async function calculatePrice(
    branchId: string,
    dto: CalculatePriceDto,
): Promise<CalculatePriceResultDto | null> {
    const response = await authProtectedFetch<CalculatePriceResultDto>(
        `/api/prices/calculate?branchId=${branchId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: dto,
        },
    );

    return response.data ?? null;
}
