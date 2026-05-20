import { useCallback, useEffect, useMemo, useState } from "react";
import {
    fetchSystemPriceVersions,
    fetchBranchPriceVersions,
    fetchResolvedSystemPrices,
    fetchResolvedBranchPrices,
    createSystemPrice,
    createBranchPrice,
    deleteBranchPrice,
} from "@/src/api/pricing.api";
import { fetchBranches, fetchBranchCourtTypes } from "@/src/api/branch.api";
import { fetchAllCourtTypes } from "@/src/api/court-type.api";
import type { BranchDto, BranchCourtTypeDto } from "@/src/features/branch/shared/types/branch.types";
import { useToast } from "@/src/shared/hooks/useToast";
import {
    normalizeDateString,
    todayStr,
    transformCurrentApiData,
    transformEffectiveData,
} from "@/src/features/pricing/utils";
import type {
    CourtType,
    CurrentPriceDto,
    EffectivePriceDto,
    PriceRow,
    PriceVersionDto,
    TabId,
    TimeSlot,
    SavePriceDto,
    PriceConfig,
} from "@/src/features/pricing/shared/types/pricing.types";

function toApiDate(date: string) {
    return date.includes("T") ? date : `${date}T00:00:00`;
}

function toApiTime(time: string) {
    return time.length === 5 ? `${time}:00` : time;
}

export function useOwnerPricing() {
    const [tab, setTab] = useState<TabId>("system");
    const [selectedCourtType, setSelectedCourtType] = useState("");
    const [selectedVersionDate, setSelectedVersionDate] = useState("");
    const [versions, setVersions] = useState<PriceVersionDto[]>([]);

    const [systemCourtTypes, setSystemCourtTypes] = useState<CourtType[]>([]);
    const [branches, setBranches] = useState<BranchDto[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState("");
    const [branchCourtTypes, setBranchCourtTypes] = useState<BranchCourtTypeDto[]>([]);

    const [updateRow, setUpdateRow] = useState<PriceRow | null>(null);
    const [showWizard, setShowWizard] = useState(false);

    const [resolvedSystemPrices, setResolvedSystemPrices] = useState<CurrentPriceDto[]>([]);
    const [resolvedBranchPrices, setResolvedBranchPrices] = useState<EffectivePriceDto[]>([]);

    const [loading, setLoading] = useState(true);
    const [versionsLoading, setVersionsLoading] = useState(false);
    const [resolving, setResolving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast, show: showToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [courtTypesData, branchesData] = await Promise.all([
                    fetchAllCourtTypes(),
                    fetchBranches(1, 50),
                ]);
                const activeCourtTypes = courtTypesData.map((ct) => ({ id: ct.id, name: ct.name }));

                setSystemCourtTypes(activeCourtTypes);
                setBranches(branchesData.items);
                setSelectedCourtType(activeCourtTypes[0]?.id ?? "");
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to fetch pricing data";
                setError(message);
                showToast("error", message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [showToast]);

    useEffect(() => {
        if (tab === "branch" && selectedBranchId) {
            fetchBranchCourtTypes(selectedBranchId)
                .then((data) => setBranchCourtTypes(data))
                .catch(() => showToast("error", "Lỗi tải danh sách loại sân chi nhánh"));
        } else {
            setBranchCourtTypes([]);
        }
    }, [tab, selectedBranchId, showToast]);

    const handleRefetchBranchCourtTypes = useCallback(async () => {
        if (tab === "branch" && selectedBranchId) {
            try {
                const data = await fetchBranchCourtTypes(selectedBranchId);
                setBranchCourtTypes(data);
            } catch {
                showToast("error", "Lỗi tải loại sân chi nhánh");
            }
        }
    }, [tab, selectedBranchId, showToast]);

    const displayCourtTypes = useMemo(() => {
        if (tab === "system") {
            return systemCourtTypes;
        }
        const activeAtBranch = branchCourtTypes.filter((ct) => ct.isActive);
        return systemCourtTypes.filter((sct) => activeAtBranch.some((bct) => bct.courtTypeId === sct.id));
    }, [tab, systemCourtTypes, branchCourtTypes]);

    useEffect(() => {
        if (displayCourtTypes.length === 0) {
            if (selectedCourtType) setSelectedCourtType("");
            return;
        }
        if (!selectedCourtType || !displayCourtTypes.find((ct) => ct.id === selectedCourtType)) {
            setSelectedCourtType(displayCourtTypes[0].id);
        }
    }, [displayCourtTypes, selectedCourtType]);

    const loadVersions = useCallback(async (preferredDate?: string) => {
        if (!selectedCourtType) {
            setVersions([]);
            setSelectedVersionDate("");
            return "";
        }

        if (tab === "branch" && !selectedBranchId) {
            setVersions([]);
            setSelectedVersionDate("");
            return "";
        }

        try {
            setVersionsLoading(true);
            const versionData: PriceVersionDto[] = tab === "system"
                ? await fetchSystemPriceVersions(selectedCourtType)
                : await fetchBranchPriceVersions(selectedBranchId, selectedCourtType);
            const normalizedVersions = versionData.map((version) => ({
                ...version,
                effectiveFrom: normalizeDateString(version.effectiveFrom),
            }));
            const normalizedPreferredDate = preferredDate ? normalizeDateString(preferredDate) : "";
            const nextSelectedDate =
                normalizedVersions.find((version) => version.effectiveFrom === normalizedPreferredDate)?.effectiveFrom ??
                normalizedVersions[0]?.effectiveFrom ??
                todayStr();

            setVersions(normalizedVersions);
            setSelectedVersionDate(nextSelectedDate);
            return nextSelectedDate;
        } catch {
            setVersions([]);
            setSelectedVersionDate("");
            showToast("error", "Failed to load price versions");
            return "";
        } finally {
            setVersionsLoading(false);
        }
    }, [selectedCourtType, selectedBranchId, tab, showToast]);

    useEffect(() => {
        loadVersions();
    }, [loadVersions]);

    const fetchResolved = useCallback(async (dateOverride?: string) => {
        const date = dateOverride ?? selectedVersionDate;
        if (!date || !selectedCourtType) return;
        if (tab === "branch" && !selectedBranchId) return;

        try {
            setResolving(true);
            if (tab === "system") {
                const sysData = await fetchResolvedSystemPrices(date, selectedCourtType);
                setResolvedSystemPrices(sysData);
                setResolvedBranchPrices([]);
            } else {
                const [sysData, branchData] = await Promise.all([
                    fetchResolvedSystemPrices(date, selectedCourtType),
                    fetchResolvedBranchPrices(selectedBranchId, date, selectedCourtType),
                ]);
                setResolvedSystemPrices(sysData);
                setResolvedBranchPrices(branchData);
            }
        } catch {
            showToast("error", "Failed to resolve prices");
        } finally {
            setResolving(false);
        }
    }, [tab, selectedVersionDate, selectedCourtType, selectedBranchId, showToast]);

    useEffect(() => {
        fetchResolved();
    }, [fetchResolved]);

    const activeConfig = useMemo(() => {
        if (tab === "system") {
            const map = transformCurrentApiData(resolvedSystemPrices);
            return map.get(selectedCourtType) ?? null;
        }

        const { configs } = transformEffectiveData(resolvedBranchPrices);
        const config = configs.get(selectedCourtType);
        if (!config) return null;

        const configCopy = { ...config, rows: [...config.rows] };
        const sysConfig = transformCurrentApiData(resolvedSystemPrices).get(selectedCourtType) ?? null;
        if (sysConfig) {
            configCopy.rows = configCopy.rows.map((row) => {
                if (row.priceSource !== "BRANCH_OVERRIDE") return row;
                const sysRow = sysConfig.rows.find((systemRow) => systemRow.slotId === row.slotId);
                return sysRow
                    ? {
                        ...row,
                        systemWeekdayPrice: sysRow.weekdayPrice,
                        systemWeekendPrice: sysRow.weekendPrice,
                    }
                    : row;
            });
        }
        return configCopy;
    }, [tab, resolvedSystemPrices, resolvedBranchPrices, selectedCourtType]);

    // Keep the last non-null config to avoid UI flicker when switching court types
    const [staleConfig, setStaleConfig] = useState<PriceConfig | null>(null);
    useEffect(() => {
        if (activeConfig) setStaleConfig(activeConfig);
    }, [activeConfig]);

    const isEditable = useMemo(() => {
        if (versions.length === 0) return true;
        return selectedVersionDate >= versions[0].effectiveFrom;
    }, [versions, selectedVersionDate]);

    const isBranchCourtTypeActive = useMemo(() => {
        if (tab === "system") return true;
        const bct = branchCourtTypes.find((ct) => ct.courtTypeId === selectedCourtType);
        return bct ? bct.isActive : false;
    }, [tab, branchCourtTypes, selectedCourtType]);

    const selectedCT = useMemo(() => {
        if (tab === "branch" && displayCourtTypes.length === 0) {
            return undefined;
        }
        return systemCourtTypes.find((ct) => ct.id === selectedCourtType) ?? displayCourtTypes[0];
    }, [tab, displayCourtTypes, selectedCourtType, systemCourtTypes]);

    // Keep last visible selected court type to avoid flicker during refresh
    const [staleSelectedCT, setStaleSelectedCT] = useState<CourtType | undefined>(selectedCT);
    useEffect(() => {
        if (selectedCT) setStaleSelectedCT(selectedCT);
    }, [selectedCT]);

    const timeSlots: TimeSlot[] = useMemo(() => {
        return (activeConfig?.rows ?? []).map((row) => ({
            id: row.slotId,
            label: row.slotLabel,
            startTime: row.startTime,
            endTime: row.endTime,
        }));
    }, [activeConfig]);

    const refreshAfterSave = async (savedDate: string) => {
        const nextDate = await loadVersions(savedDate);
        if (nextDate) await fetchResolved(nextDate);
    };

    const handleUpdatePrice = async (patch: { applyAll: boolean; effectiveFrom: string; weekday: number; weekend: number }) => {
        try {
            if (!activeConfig) return;
            const pricesToSave = activeConfig.rows
                .filter((row) => patch.applyAll || row.slotId === updateRow?.slotId)
                .map((row) => ({
                    startTime: toApiTime(row.startTime),
                    endTime: toApiTime(row.endTime),
                    weekdayPrice: patch.weekday,
                    weekendPrice: patch.weekend,
                }));

            const payload: SavePriceDto = {
                courtTypeId: selectedCourtType,
                effectiveFrom: toApiDate(patch.effectiveFrom),
                prices: pricesToSave,
            };

            if (tab === "system") {
                await createSystemPrice(payload);
                showToast("success", "Cập nhật bảng giá chi nhánh thành công");
            } else if (selectedBranchId) {
                await createBranchPrice(selectedBranchId, payload);
                showToast("success", "Cập nhật bảng giá chi nhánh thành công");
            }

            await refreshAfterSave(patch.effectiveFrom);
            setUpdateRow(null);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
            showToast("error", msg);
            if (tab === "branch") {
                handleRefetchBranchCourtTypes();
            }
        }
    };

    const handleCreatePrice = async (data: SavePriceDto) => {
        try {
            if (tab === "system") {
                await createSystemPrice(data);
                showToast("success", "Tao bang gia he thong thanh cong");
            } else if (selectedBranchId) {
                await createBranchPrice(selectedBranchId, data);
                showToast("success", "Tao bang gia chi nhanh thanh cong");
            }
            await refreshAfterSave(data.effectiveFrom);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Co loi xay ra";
            showToast("error", msg);
            if (tab === "branch") {
                handleRefetchBranchCourtTypes();
            }
            throw err;
        }
    };

    const handleResetOverride = async (row: PriceRow) => {
        if (tab !== "branch" || !selectedBranchId || row.priceSource !== "BRANCH_OVERRIDE") return;
        const ok = window.confirm("Dat lai khung gio nay ve gia he thong?");
        if (!ok) return;

        try {
            await deleteBranchPrice(selectedBranchId, {
                courtTypeId: selectedCourtType,
                effectiveFrom: toApiDate(selectedVersionDate),
                startTime: toApiTime(row.startTime),
                endTime: toApiTime(row.endTime),
            });
            showToast("success", "Da dat lai gia chi nhanh ve gia he thong");
            const nextDate = await loadVersions(selectedVersionDate);
            if (nextDate) await fetchResolved(nextDate);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Co loi xay ra";
            showToast("error", msg);
        }
    };

    const handleOpenWizard = () => {
        if (tab === "branch" && !selectedBranchId) {
            showToast("error", "Vui long chon chi nhanh truoc khi tao bang gia");
            return;
        }
        if (tab === "branch" && displayCourtTypes.length === 0) {
            showToast("error", "Loai san chua duoc bat tai chi nhanh");
            return;
        }
        setShowWizard(true);
    };

    return {
        tab,
        setTab,
        selectedCourtType,
        setSelectedCourtType,
        selectedVersionDate,
        setSelectedVersionDate,
        versions,
        systemCourtTypes,
        branches,
        selectedBranchId,
        setSelectedBranchId,
        branchCourtTypes,
        updateRow,
        setUpdateRow,
        showWizard,
        setShowWizard,
        resolvedSystemPrices,
        resolvedBranchPrices,
        loading,
        versionsLoading,
        resolving,
        error,
        toast,
        staleConfig,
        staleSelectedCT,
        displayCourtTypes,
        activeConfig,
        isEditable,
        isBranchCourtTypeActive,
        selectedCT,
        timeSlots,
        handleUpdatePrice,
        handleCreatePrice,
        handleResetOverride,
        handleOpenWizard,
        fetchResolved,
    };
}
