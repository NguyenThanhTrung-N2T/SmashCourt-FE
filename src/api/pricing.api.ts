import { authProtectedFetch } from "@/src/api/auth.api";

import type {
    CurrentPriceDto,
    EffectivePriceDto,
    CreateSystemPriceDto,
    CreateBranchPriceDto,
    DeleteBranchPriceDto,
    CalculatePriceDto,
    CalculatePriceResultDto,
} from "@/src/shared/types/pricing.types";

// ─── SYSTEM PRICE APIs ───────────────────────────────────────────────────────

/**
 * GET /api/system-prices
 * Retrieve complete history of all system (global) price configurations.
 * Optionally filter by court type.
 */
export async function fetchSystemPriceHistory(
    courtTypeId?: string,
): Promise<CurrentPriceDto[]> {
    const params = courtTypeId ? `?courtTypeId=${courtTypeId}` : "";
    const response = await authProtectedFetch<CurrentPriceDto[]>(
        `/api/system-prices${params}`,
        { method: "GET" },
    );

    const data = response.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;

    return [];
}

/**
 * GET /api/system-prices/current
 * Retrieve the currently active system prices (effective as of today).
 * Returns the most recent price effective date <= today for each time slot.
 */
export async function fetchCurrentSystemPrices(
    courtTypeId?: string,
): Promise<CurrentPriceDto[]> {
    const params = courtTypeId ? `?courtTypeId=${courtTypeId}` : "";
    const response = await authProtectedFetch<CurrentPriceDto[]>(
        `/api/system-prices/current${params}`,
        { method: "GET" },
    );

    const data = response.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;

    return [];
}

/**
 * GET /api/system-prices/resolved
 * Fetch pricing snapshot at a specific date.
 */
export async function fetchResolvedSystemPrices(
    date: string,
    courtTypeId?: string,
): Promise<CurrentPriceDto[]> {
    const params = new URLSearchParams({ date });
    if (courtTypeId) params.append("courtTypeId", courtTypeId);

    const response = await authProtectedFetch<CurrentPriceDto[]>(
        `/api/system-prices/resolved?${params.toString()}`,
        { method: "GET" },
    );

    const data = response.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;

    return [];
}

/**
 * POST /api/system-prices
 * Create a new system price configuration.
 */
export async function createSystemPrice(
    dto: CreateSystemPriceDto,
): Promise<void> {
    await authProtectedFetch<null>(
        "/api/system-prices",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: dto,
        },
    );
}

// ─── BRANCH PRICE APIs ───────────────────────────────────────────────────────

/**
 * GET /api/branches/{branchId}/prices
 * Retrieve complete history of all price overrides (custom prices) for a branch.
 * Optionally filter by court type.
 */
export async function fetchBranchPriceHistory(
    branchId: string,
    courtTypeId?: string,
): Promise<CurrentPriceDto[]> {
    const params = courtTypeId ? `?courtTypeId=${courtTypeId}` : "";
    const response = await authProtectedFetch<CurrentPriceDto[]>(
        `/api/branches/${branchId}/prices${params}`,
        { method: "GET" },
    );

    const data = response.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;

    return [];
}

/**
 * GET /api/branches/{branchId}/prices/current
 * Retrieve the effective current prices for a branch (considering both branch
 * overrides and system prices).
 */
export async function fetchCurrentBranchPrices(
    branchId: string,
    courtTypeId?: string,
): Promise<EffectivePriceDto[]> {
    const params = courtTypeId ? `?courtTypeId=${courtTypeId}` : "";
    const response = await authProtectedFetch<EffectivePriceDto[]>(
        `/api/branches/${branchId}/prices/current${params}`,
        { method: "GET" },
    );

    const data = response.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;

    return [];
}

/**
 * GET /api/branches/{branchId}/prices/resolved
 * Fetch branch pricing snapshot at a specific date.
 */
export async function fetchResolvedBranchPrices(
    branchId: string,
    date: string,
    courtTypeId?: string,
): Promise<EffectivePriceDto[]> {
    const params = new URLSearchParams({ date });
    if (courtTypeId) params.append("courtTypeId", courtTypeId);

    const response = await authProtectedFetch<EffectivePriceDto[]>(
        `/api/branches/${branchId}/prices/resolved?${params.toString()}`,
        { method: "GET" },
    );

    const data = response.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;

    return [];
}

/**
 * POST /api/branches/{branchId}/prices
 * Create a new price override configuration for a branch.
 */
export async function createBranchPrice(
    branchId: string,
    dto: CreateBranchPriceDto,
): Promise<void> {
    await authProtectedFetch<null>(
        `/api/branches/${branchId}/prices`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: dto,
        },
    );
}

/**
 * DELETE /api/branches/{branchId}/prices
 * Delete a price override configuration for a branch.
 */
export async function deleteBranchPrice(
    branchId: string,
    dto: DeleteBranchPriceDto,
): Promise<void> {
    await authProtectedFetch<null>(
        `/api/branches/${branchId}/prices`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: dto,
        },
    );
}

/**
 * POST /api/branches/{branchId}/prices/calculate
 * Calculate the total price for a court booking based on selected time slots.
 */
export async function calculatePrice(
    branchId: string,
    dto: CalculatePriceDto,
): Promise<CalculatePriceResultDto | null> {
    const response = await authProtectedFetch<CalculatePriceResultDto>(
        `/api/branches/${branchId}/prices/calculate`,
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
