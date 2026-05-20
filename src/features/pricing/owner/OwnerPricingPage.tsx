"use client";

import { useOwnerPricing } from "./hooks/useOwnerPricing";
import { PricingStats } from "./components/stats/PricingStats";
import { UpdatePriceModal, CreateWizardModal } from "./dialogs";
import { PricingHeader, PricingGridTab, PricingTabs } from "./components/layout";
import { OwnerPricingLoading, PricingErrorState, PricingTableLoading, PricingEmptyState } from "./components/states";
import { CalendarDots, Clock, ClockCounterClockwise, Tag, Storefront, CaretDown } from "@phosphor-icons/react";
import { Toast } from "@/src/shared/components/ui/Toast";

export default function OwnerPricingPage() {
    const {
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
        displayCourtTypes,
        updateRow,
        setUpdateRow,
        showWizard,
        setShowWizard,
        loading,
        versionsLoading,
        resolving,
        error,
        toast,
        staleConfig,
        staleSelectedCT,
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
    } = useOwnerPricing();

    const stats = [
        { icon: Tag, label: "Loại sân", val: systemCourtTypes.length },
        { icon: Clock, label: "Khung giờ", val: timeSlots.length },
        { icon: CalendarDots, label: "Bảng giá hiện hành", val: versions.filter((version) => version.isCurrent).length },
        { icon: ClockCounterClockwise, label: "Tổng phiên bản", val: versions.length },
    ];

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
