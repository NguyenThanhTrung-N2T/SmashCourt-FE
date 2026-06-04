import { useState, useEffect, useCallback } from "react";

import {
    fetchBranchPrices,
    fetchBranchPriceOverrides,
    fetchBranchPriceOverride,
    upsertBranchPriceOverride,
    deleteBranchPriceOverride,
} from "@/src/api/pricing.api";

import type {
    EffectivePricesResponse,
    PriceVersionDto,
    PriceOverrideVersionDetailDto,
    UpsertPriceOverrideRequest,
} from "@/src/features/pricing/shared/types/pricing.types";

// ─── PARAMS ───────────────────────────────────────────────────────────────────

interface UseBranchPricingParams {
    /** Court type to scope all fetches to. Hook is idle when undefined. */
    courtTypeId: string | undefined;
    /**
     * Required for Owner role. Omit for Manager/Staff — backend resolves
     * the branch automatically from the user's assignment.
     */
    branchId?: string;
    /**
     * Date for the effective-prices fetch (yyyy-MM-dd).
     * Defaults to today if omitted.
     */
    date?: string;
}

// ─── RETURN ───────────────────────────────────────────────────────────────────

interface UseBranchPricingReturn {
    // ── Effective prices (system + branch merged snapshot) ────────────────────
    /**
     * The merged snapshot for the branch on the given date.
     * Each slot has a `priceSource` of "BRANCH" or "SYSTEM".
     */
    effectivePrices: EffectivePricesResponse | null;
    isLoadingEffectivePrices: boolean;
    effectivePricesError: string | null;
    refetchEffectivePrices: () => void;

    // ── Override version list ─────────────────────────────────────────────────
    /** All override versions for this branch + court type. */
    versions: PriceVersionDto[];
    isLoadingVersions: boolean;
    versionsError: string | null;
    refetchVersions: () => void;

    // ── Override version detail ───────────────────────────────────────────────
    /** Slot config for the currently selected override version. */
    selectedVersionDetail: PriceOverrideVersionDetailDto | null;
    isLoadingDetail: boolean;
    detailError: string | null;
    /**
     * Select an override version to load its detail.
     * Pass `null` to deselect.
     */
    selectVersion: (effectiveFrom: string | null) => void;
    selectedEffectiveFrom: string | null;

    // ── Mutations ─────────────────────────────────────────────────────────────
    /**
     * Create or update an override version (PATCH semantics).
     * Re-fetches versions + detail on success.
     * @returns the saved override detail, or null on failure.
     */
    upsertVersion: (
        effectiveFrom: string,
        dto: UpsertPriceOverrideRequest,
    ) => Promise<PriceOverrideVersionDetailDto | null>;
    isUpserting: boolean;
    upsertError: string | null;

    /**
     * Delete a SCHEDULED override version.
     * After deletion the affected slots fall back to system prices.
     * Re-fetches versions + effective prices on success.
     */
    deleteVersion: (effectiveFrom: string) => Promise<boolean>;
    isDeleting: boolean;
    deleteError: string | null;
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useBranchPricing({
    courtTypeId,
    branchId,
    date,
}: UseBranchPricingParams): UseBranchPricingReturn {

    // ── Effective prices state ────────────────────────────────────────────────
    const [effectivePrices, setEffectivePrices] = useState<EffectivePricesResponse | null>(null);
    const [isLoadingEffectivePrices, setIsLoadingEffectivePrices] = useState(false);
    const [effectivePricesError, setEffectivePricesError] = useState<string | null>(null);

    // ── Versions state ────────────────────────────────────────────────────────
    const [versions, setVersions] = useState<PriceVersionDto[]>([]);
    const [isLoadingVersions, setIsLoadingVersions] = useState(false);
    const [versionsError, setVersionsError] = useState<string | null>(null);

    // ── Detail state ──────────────────────────────────────────────────────────
    const [selectedEffectiveFrom, setSelectedEffectiveFrom] = useState<string | null>(null);
    const [selectedVersionDetail, setSelectedVersionDetail] = useState<PriceOverrideVersionDetailDto | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    // ── Mutation state ────────────────────────────────────────────────────────
    const [isUpserting, setIsUpserting] = useState(false);
    const [upsertError, setUpsertError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // ── Fetch: effective prices ───────────────────────────────────────────────
    const fetchEffectivePrices = useCallback(async () => {
        if (!courtTypeId) {
            setEffectivePrices(null);
            return;
        }
        setIsLoadingEffectivePrices(true);
        setEffectivePricesError(null);
        try {
            const data = await fetchBranchPrices(branchId, date, courtTypeId);
            setEffectivePrices(data);
        } catch (err) {
            setEffectivePricesError(err instanceof Error ? err.message : "Failed to load effective prices");
            setEffectivePrices(null);
        } finally {
            setIsLoadingEffectivePrices(false);
        }
    }, [courtTypeId, branchId, date]);

    useEffect(() => {
        fetchEffectivePrices();
    }, [fetchEffectivePrices]);

    // ── Fetch: override versions list ─────────────────────────────────────────
    const fetchVersions = useCallback(async () => {
        if (!courtTypeId) {
            setVersions([]);
            return;
        }
        setIsLoadingVersions(true);
        setVersionsError(null);
        try {
            const data = await fetchBranchPriceOverrides(courtTypeId, branchId);
            setVersions(data);
        } catch (err) {
            setVersionsError(err instanceof Error ? err.message : "Failed to load override versions");
            setVersions([]);
        } finally {
            setIsLoadingVersions(false);
        }
    }, [courtTypeId, branchId]);

    useEffect(() => {
        fetchVersions();
        // Reset selection when court type or branch changes
        setSelectedEffectiveFrom(null);
        setSelectedVersionDetail(null);
    }, [fetchVersions]);

    // ── Fetch: override version detail ────────────────────────────────────────
    const fetchDetail = useCallback(async (effectiveFrom: string) => {
        if (!courtTypeId) return;
        setIsLoadingDetail(true);
        setDetailError(null);
        try {
            const data = await fetchBranchPriceOverride(effectiveFrom, courtTypeId, branchId);
            setSelectedVersionDetail(data);
        } catch (err) {
            setDetailError(err instanceof Error ? err.message : "Failed to load version detail");
            setSelectedVersionDetail(null);
        } finally {
            setIsLoadingDetail(false);
        }
    }, [courtTypeId, branchId]);

    // Fetch detail whenever selected version changes
    useEffect(() => {
        if (selectedEffectiveFrom) {
            fetchDetail(selectedEffectiveFrom);
        } else {
            setSelectedVersionDetail(null);
            setDetailError(null);
        }
    }, [selectedEffectiveFrom, fetchDetail]);

    const selectVersion = useCallback((effectiveFrom: string | null) => {
        setSelectedEffectiveFrom(effectiveFrom);
    }, []);

    // ── Mutation: upsert ──────────────────────────────────────────────────────
    const upsertVersion = useCallback(async (
        effectiveFrom: string,
        dto: UpsertPriceOverrideRequest,
    ): Promise<PriceOverrideVersionDetailDto | null> => {
        if (!courtTypeId) return null;
        setIsUpserting(true);
        setUpsertError(null);
        try {
            const result = await upsertBranchPriceOverride(effectiveFrom, courtTypeId, dto, branchId);
            // Re-fetch versions list so status badges stay accurate
            await fetchVersions();
            // Refresh detail if this version is currently open
            if (selectedEffectiveFrom === effectiveFrom) {
                await fetchDetail(effectiveFrom);
            }
            return result;
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to save override version";
            setUpsertError(msg);
            return null;
        } finally {
            setIsUpserting(false);
        }
    }, [courtTypeId, branchId, selectedEffectiveFrom, fetchVersions, fetchDetail]);

    // ── Mutation: delete ──────────────────────────────────────────────────────
    const deleteVersion = useCallback(async (
        effectiveFrom: string,
    ): Promise<boolean> => {
        if (!courtTypeId) return false;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await deleteBranchPriceOverride(effectiveFrom, courtTypeId, branchId);
            // Deselect if the deleted version was open
            if (selectedEffectiveFrom === effectiveFrom) {
                setSelectedEffectiveFrom(null);
                setSelectedVersionDetail(null);
            }
            // Re-fetch both lists — deletion causes fallback to system prices
            await Promise.all([fetchVersions(), fetchEffectivePrices()]);
            return true;
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to delete override version";
            setDeleteError(msg);
            return false;
        } finally {
            setIsDeleting(false);
        }
    }, [courtTypeId, branchId, selectedEffectiveFrom, fetchVersions, fetchEffectivePrices]);

    return {
        // Effective prices
        effectivePrices,
        isLoadingEffectivePrices,
        effectivePricesError,
        refetchEffectivePrices: fetchEffectivePrices,

        // Versions
        versions,
        isLoadingVersions,
        versionsError,
        refetchVersions: fetchVersions,

        // Detail
        selectedVersionDetail,
        isLoadingDetail,
        detailError,
        selectVersion,
        selectedEffectiveFrom,

        // Mutations
        upsertVersion,
        isUpserting,
        upsertError,
        deleteVersion,
        isDeleting,
        deleteError,
    };
}