"use client";

import { useCallback, useEffect, useState } from "react";
import { Warning, CheckCircle, CircleNotch, ArrowClockwise } from "@phosphor-icons/react";

import { fetchAllLoyaltyTiers } from "@/src/api/loyalty-tier.api";
import type { LoyaltyTier } from "@/src/shared/types/loyalty-tier.types";
import { AuthApiError } from "@/src/api/auth.api";
import { useToast } from "@/src/shared/hooks/useToast";

import { Button } from "@/src/shared/components/ui/Button";
import { Flex } from "@/src/shared/components/layout/Flex";

import { LoyaltyTierStatsHeader } from "./LoyaltyTierStatsHeader";
import { LoyaltyTierListCard } from "./LoyaltyTierListCard";
import { LoyaltyTierDetailPanel } from "./LoyaltyTierDetailPanel";

export default function LoyaltyTierManager() {
    const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { toast, show: showToast } = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const data = await fetchAllLoyaltyTiers();
            const sorted = [...data].sort((a, b) => a.minPoints - b.minPoints);
            setTiers(sorted);
            if (sorted.length > 0) {
                setSelectedId(sorted[0].id); // Tự động chọn hạng đầu tiên, giải quyết UX "form trống"
            }
        } catch (err) {
            setLoadError(err instanceof AuthApiError ? err.message : "Không tải được dữ liệu hệ thống.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    function handleSaved(updated: LoyaltyTier) {
        setTiers((prev) =>
            [...prev.map((t) => (t.id === updated.id ? updated : t))].sort((a, b) => a.minPoints - b.minPoints)
        );
    }

    // Luôn có 1 tier được chọn nhờ auto-select
    const selectedTier = tiers.find((t) => t.id === selectedId) ?? null;

    return (
        <div className="space-y-6 w-full animate-slide-up">
            {/* 1. Header Card */}
            <LoyaltyTierStatsHeader tiers={tiers} loading={loading} onRefresh={load} />

            {/* States */}
            {loading && (
                <Flex justify="center" align="center" spacing="md" className="my-20 flex-col">
                    <CircleNotch className="h-8 w-8 animate-spin text-primary" />
                    <p className="font-semibold text-muted">Đang tải dữ liệu hạng...</p>
                </Flex>
            )}

            {!loading && loadError && (
                <div className="my-10 flex flex-col items-center rounded-[2rem] border-2 border-red-500/30 bg-red-500/10 p-12 text-center shadow-sm w-full">
                    <Warning className="mb-4 h-12 w-12 text-red-500" />
                    <h3 className="text-xl font-bold text-red-600">Lỗi đồng bộ dữ liệu</h3>
                    <p className="mt-2 text-red-500">{loadError}</p>
                    <Button variant="danger" onClick={load} className="mt-6" leftIcon={<ArrowClockwise className="h-5 w-5" />}>
                        Thử lại
                    </Button>
                </div>
            )}

            {/* 2. Content Layout */}
            {!loading && !loadError && tiers.length > 0 && selectedTier && (
                <div className="grid grid-cols-5 gap-6 w-full h-[600px] min-h-[600px]">
                    {/* Left: List Card */}
                    <div className="col-span-2 h-full">
                        <LoyaltyTierListCard
                            tiers={tiers}
                            selectedId={selectedId}
                            onSelect={(id) => {
                                if (id !== selectedId) setSelectedId(id);
                            }}
                        />
                    </div>

                    {/* Right: Detail Card */}
                    <div className="col-span-3 h-full">
                        <LoyaltyTierDetailPanel
                            key={selectedTier.id}
                            tier={selectedTier}
                            onSaved={handleSaved}
                            showToast={showToast}
                        />
                    </div>
                </div>
            )}

            {/* Global Toast */}
            <div
                className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${toast.visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
                    }`}
            >
                <div className={`flex items-center gap-3 rounded-2xl border-2 bg-surface-1 px-5 py-4 shadow-2xl ${toast.tone === "success" ? "border-emerald-500/40" : "border-red-500/40"}
 }`}>
                    {toast.tone === "success"
                        ? <CheckCircle className="h-6 w-6 text-emerald-500" />
                        : <Warning className="h-6 w-6 text-red-500" />}
                    <p className={`font-bold ${toast.tone === "success" ? "text-emerald-600" : "text-red-600"}`}>
                        {toast.message}
                    </p>
                </div>
            </div>
        </div>
    );
}
