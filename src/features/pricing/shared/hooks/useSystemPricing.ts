import { useState, useEffect, useCallback } from "react";

import {
    fetchSystemPrices,
    fetchSystemPriceVersions,
    fetchSystemPriceVersion,
    upsertSystemPriceVersion,
    deleteSystemPriceVersion,
} from "@/src/api/pricing.api";

import type {
    CurrentPriceDto,
    PriceVersionDto,
    SystemPriceVersionDetailDto,
    UpsertSystemPriceRequest,
} from "@/src/features/pricing/shared/types/pricing.types";

// ─── PARAMS ───────────────────────────────────────────────────────────────────

interface UseSystemPricingParams {
    /** Court type to scope all fetches to. Hook is idle when undefined. */
    courtTypeId: string | undefined;
    /**
     * Date for the current-prices fetch (yyyy-MM-dd).
     * Defaults to today if omitted.
     */
    date?: string;
}

// ─── RETURN ───────────────────────────────────────────────────────────────────

interface UseSystemPricingReturn {
    // ── Current prices (read-only snapshot) ──────────────────────────────────
    /** Effective prices for the given date, merged consecutive equal slots. */
    currentPrices: CurrentPriceDto[];
    isLoadingCurrentPrices: boolean;
    currentPricesError: string | null;
    /** Manually re-fetch current prices (e.g. after date change). */
    refetchCurrentPrices: () => void;

    // ── Version list ──────────────────────────────────────────────────────────
    /** All versions for the court type (ACTIVE / SCHEDULED / EXPIRED). */
    versions: PriceVersionDto[];
    isLoadingVersions: boolean;
    versionsError: string | null;
    refetchVersions: () => void;

    // ── Version detail ────────────────────────────────────────────────────────
    /** Detailed slot config for the currently selected version. */
    selectedVersionDetail: SystemPriceVersionDetailDto | null;
    isLoadingDetail: boolean;
    detailError: string | null;
    /**
     * Select a version to load its detail.
     * Pass `null` to deselect.
     */
    selectVersion: (effectiveFrom: string | null) => void;
    selectedEffectiveFrom: string | null;

    // ── Mutations ─────────────────────────────────────────────────────────────
    /**
     * Create or update a version (PATCH semantics).
     * Re-fetches versions + detail on success.
     * @returns the saved version detail, or null on failure.
     */
    upsertVersion: (
        effectiveFrom: string,
        dto: UpsertSystemPriceRequest,
    ) => Promise<SystemPriceVersionDetailDto | null>;
    isUpserting: boolean;
    upsertError: string | null;

    /**
     * Delete a SCHEDULED version.
     * Re-fetches versions and deselects if the deleted version was selected.
     */
    deleteVersion: (effectiveFrom: string) => Promise<boolean>;
    isDeleting: boolean;
    deleteError: string | null;
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useSystemPricing({
    courtTypeId,
    date,
}: UseSystemPricingParams): UseSystemPricingReturn {

    // ── Current prices state ──────────────────────────────────────────────────
    const [currentPrices, setCurrentPrices] = useState<CurrentPriceDto[]>([]);
    const [isLoadingCurrentPrices, setIsLoadingCurrentPrices] = useState(false);
    const [currentPricesError, setCurrentPricesError] = useState<string | null>(null);

    // ── Versions state ────────────────────────────────────────────────────────
    const [versions, setVersions] = useState<PriceVersionDto[]>([]);
    const [isLoadingVersions, setIsLoadingVersions] = useState(false);
    const [versionsError, setVersionsError] = useState<string | null>(null);

    // ── Detail state ──────────────────────────────────────────────────────────
    const [selectedEffectiveFrom, setSelectedEffectiveFrom] = useState<string | null>(null);
    const [selectedVersionDetail, setSelectedVersionDetail] = useState<SystemPriceVersionDetailDto | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    // ── Mutation state ────────────────────────────────────────────────────────
    const [isUpserting, setIsUpserting] = useState(false);
    const [upsertError, setUpsertError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // ── Fetch: current prices ─────────────────────────────────────────────────
    const fetchCurrentPrices = useCallback(async () => {
        if (!courtTypeId) {
            setCurrentPrices([]);
            return;
        }
        setIsLoadingCurrentPrices(true);
        setCurrentPricesError(null);
        try {
            const data = await fetchSystemPrices(date, courtTypeId);
            setCurrentPrices(data);
        } catch (err) {
            setCurrentPricesError(err instanceof Error ? err.message : "Failed to load current prices");
            setCurrentPrices([]);
        } finally {
            setIsLoadingCurrentPrices(false);
        }
    }, [courtTypeId, date]);

    useEffect(() => {
        fetchCurrentPrices();
    }, [fetchCurrentPrices]);

    // ── Fetch: versions list ──────────────────────────────────────────────────
    const fetchVersions = useCallback(async () => {
        if (!courtTypeId) {
            setVersions([]);
            return;
        }
        setIsLoadingVersions(true);
        setVersionsError(null);
        try {
            const data = await fetchSystemPriceVersions(courtTypeId);
            setVersions(data);
        } catch (err) {
            setVersionsError(err instanceof Error ? err.message : "Failed to load versions");
            setVersions([]);
        } finally {
            setIsLoadingVersions(false);
        }
    }, [courtTypeId]);

    useEffect(() => {
        fetchVersions();
        // Reset selection when court type changes
        setSelectedEffectiveFrom(null);
        setSelectedVersionDetail(null);
    }, [fetchVersions]);

    // ── Fetch: version detail ─────────────────────────────────────────────────
    const fetchDetail = useCallback(async (effectiveFrom: string) => {
        if (!courtTypeId) return;
        setIsLoadingDetail(true);
        setDetailError(null);
        try {
            const data = await fetchSystemPriceVersion(effectiveFrom, courtTypeId);
            setSelectedVersionDetail(data);
        } catch (err) {
            setDetailError(err instanceof Error ? err.message : "Failed to load version detail");
            setSelectedVersionDetail(null);
        } finally {
            setIsLoadingDetail(false);
        }
    }, [courtTypeId]);

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
        dto: UpsertSystemPriceRequest,
    ): Promise<SystemPriceVersionDetailDto | null> => {
        if (!courtTypeId) return null;
        setIsUpserting(true);
        setUpsertError(null);
        try {
            const result = await upsertSystemPriceVersion(effectiveFrom, courtTypeId, dto);
            // Re-fetch versions list so status badges update correctly
            await fetchVersions();
            // If this version is currently selected, refresh its detail too
            if (selectedEffectiveFrom === effectiveFrom) {
                await fetchDetail(effectiveFrom);
            }
            return result;
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to save version";
            setUpsertError(msg);
            return null;
        } finally {
            setIsUpserting(false);
        }
    }, [courtTypeId, selectedEffectiveFrom, fetchVersions, fetchDetail]);

    // ── Mutation: delete ──────────────────────────────────────────────────────
    const deleteVersion = useCallback(async (
        effectiveFrom: string,
    ): Promise<boolean> => {
        if (!courtTypeId) return false;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await deleteSystemPriceVersion(effectiveFrom, courtTypeId);
            // Deselect if the deleted version was open
            if (selectedEffectiveFrom === effectiveFrom) {
                setSelectedEffectiveFrom(null);
                setSelectedVersionDetail(null);
            }
            // Re-fetch so the list reflects the deletion
            await fetchVersions();
            return true;
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to delete version";
            setDeleteError(msg);
            return false;
        } finally {
            setIsDeleting(false);
        }
    }, [courtTypeId, selectedEffectiveFrom, fetchVersions]);

    return {
        // Current prices
        currentPrices,
        isLoadingCurrentPrices,
        currentPricesError,
        refetchCurrentPrices: fetchCurrentPrices,

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