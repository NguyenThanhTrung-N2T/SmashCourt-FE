"use client";

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
import type { BranchDto, BranchCourtTypeDto } from "@/src/features/branch/types/branch.types";
import { useToast } from "@/src/shared/hooks/useToast";
import {
    normalizeDateString,
    todayStr,
    transformCurrentApiData,
    transformEffectiveData,
} from "../utils";
import type { CourtType, CurrentPriceDto, EffectivePriceDto, PriceRow, PriceVersionDto, TabId, TimeSlot, SavePriceDto, PriceConfig } from "../types/pricing.types";
import { UpdatePriceModal } from "./dialogs/UpdatePriceModal";
import { CreateWizardModal } from "./dialogs/CreateWizardModal";
import { PricingHeader } from "./components/layout/PricingHeader";
import { PricingStats } from "./components/stats/PricingStats";
import { PricingTabs } from "./components/layout/PricingTabs";
import { PricingGridTab } from "./components/layout/PricingGridTab";
import { OwnerPricingLoading } from "./components/states/OwnerPricingLoading";
import { PricingErrorState } from "./components/states/PricingErrorState";
import { PricingTableLoading } from "./components/states/PricingTableLoading";
import { PricingEmptyState } from "./components/states/PricingEmptyState";
import {
    CalendarDots,
    Clock,
    ClockCounterClockwise,
    Tag,
    Storefront,
    CaretDown,
} from "@phosphor-icons/react";
import { Toast } from "@/src/shared/components/ui/Toast";

function toApiDate(date: string) {
    return date.includes("T") ? date : `${date}T00:00:00`;
}

function toApiTime(time: string) {
    return time.length === 5 ? `${time}:00` : time;
}

export default function OwnerPricingPage() {
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

    const stats = [
        { icon: Tag, label: "Loại sân", val: systemCourtTypes.length },
        { icon: Clock, label: "Khung giờ", val: timeSlots.length },
        { icon: CalendarDots, label: "Bảng giá hiện hành", val: versions.filter((version) => version.isCurrent).length },
        { icon: ClockCounterClockwise, label: "Tổng phiên bản", val: versions.length },
    ];

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

    if (loading) return <OwnerPricingLoading />;
    if (error) return <PricingErrorState message={error} />;

    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            <PricingHeader onCreateClick={handleOpenWizard} />

            <PricingStats stats={stats} />

            <PricingTabs
                activeTab={tab}
                onTabChange={setTab}
                courtTypes={displayCourtTypes}
                selectedCourtType={selectedCourtType}
                onCourtTypeChange={setSelectedCourtType}
            />

            {tab === "branch" && (
                <div className="flex items-center gap-3 bg-surface-1 p-4 rounded-2xl border border-border shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2">
                        <Storefront className="h-5 w-5 text-muted" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-muted uppercase tracking-wide">Chi nhánh</p>
                        <div className="relative mt-1">
                            <select
                                value={selectedBranchId}
                                onChange={(e) => setSelectedBranchId(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-border bg-surface-2 px-4 py-2 pr-10 text-sm font-bold text-foreground outline-none transition-colors hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="" disabled>-- Chọn chi nhánh --</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name} {branch.status === 1 ? "(Tam khoa)" : ""}
                                    </option>
                                ))}
                            </select>
                            <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        </div>
                    </div>
                </div>
            )}

            {tab === "branch" && !selectedBranchId ? (
                <PricingEmptyState type="branch" />
            ) : (tab === "branch" && selectedBranchId && displayCourtTypes.length === 0) ? (
                <PricingEmptyState type="courtType" />
            ) : (!activeConfig && (resolving || versionsLoading) && staleConfig) ? (
                <PricingTableLoading />
            ) : (
                <PricingGridTab
                    selectedCT={activeConfig ? selectedCT : staleSelectedCT}
                    currentConfig={activeConfig ?? staleConfig}
                    isEditable={isEditable}
                    versions={versions}
                    selectedVersion={selectedVersionDate}
                    onVersionChange={setSelectedVersionDate}
                    onCreateClick={handleOpenWizard}
                    onEditRow={setUpdateRow}
                    onRefresh={fetchResolved}
                    isCourtTypeActive={isBranchCourtTypeActive}
                    onResetOverride={handleResetOverride}
                    fallbackVersionDate={tab === "branch" && versions.length === 0 ? selectedVersionDate : undefined}
                />
            )}

            {updateRow && (
                <UpdatePriceModal
                    row={updateRow}
                    onClose={() => setUpdateRow(null)}
                    onSave={handleUpdatePrice}
                />
            )}

            {showWizard && (
                <CreateWizardModal
                    onClose={() => setShowWizard(false)}
                    courtTypes={tab === "system" ? systemCourtTypes : displayCourtTypes}
                    timeSlots={timeSlots}
                    onSave={handleCreatePrice}
                />
            )}

            <Toast toast={toast} />
        </div>
    );
}
