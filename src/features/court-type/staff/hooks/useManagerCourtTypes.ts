"use client";

import { useCallback, useEffect, useState } from "react";
import {
    fetchBranchCourtTypes,
    addCourtTypeToBranch,
    removeCourtTypeFromBranch,
} from "@/src/api/court-type.api";
import { AuthApiError } from "@/src/api/auth.api";
import type { BranchCourtTypeDto, AddCourtTypeToBranchDto } from "@/src/features/court-type/shared/types/court-type.types";

interface UseManagerCourtTypesOptions {
    branchId?: string;
}

export function useManagerCourtTypes({ branchId }: UseManagerCourtTypesOptions = {}) {
    const [allBranchCourtTypes, setAllBranchCourtTypes] = useState<BranchCourtTypeDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchBranchCourtTypes(branchId);
            setAllBranchCourtTypes(data);
        } catch (err) {
            setError(
                err instanceof AuthApiError
                    ? err.message
                    : "Không tải được danh sách loại sân"
            );
            setAllBranchCourtTypes([]);
        } finally {
            setLoading(false);
        }
    }, [branchId]);

    useEffect(() => {
        load();
    }, [load]);

    const refresh = useCallback(async () => {
        await load();
    }, [load]);

    const addCourtType = useCallback(async (courtTypeId: string) => {
        setActionLoading(true);
        try {
            const dto: AddCourtTypeToBranchDto = { courtTypeId };
            await addCourtTypeToBranch(dto, branchId);
            await load();
        } finally {
            setActionLoading(false);
        }
    }, [branchId, load]);

    const removeCourtType = useCallback(async (courtTypeId: string) => {
        setActionLoading(true);
        try {
            await removeCourtTypeFromBranch(courtTypeId, branchId);
            await load();
        } finally {
            setActionLoading(false);
        }
    }, [branchId, load]);

    // Derived from a single API response via isActive flag
    const branchCourtTypes = allBranchCourtTypes.filter((ct) => ct.isActive);
    const availableCourtTypes = allBranchCourtTypes.filter((ct) => !ct.isActive);

    return {
        branchCourtTypes,
        availableCourtTypes,
        loading,
        actionLoading,
        error,
        refresh,
        addCourtType,
        removeCourtType,
    };
}