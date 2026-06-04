"use client";

import { useCallback, useEffect, useState } from "react";
import { Warning, CircleNotch, ArrowClockwise } from "@phosphor-icons/react";

import { fetchAllLoyaltyTiers } from "@/src/api/loyalty-tier.api";
import type { LoyaltyTier } from "@/src/features/benefit/loyalty/shared/types/loyalty-tier.types";
import { AuthApiError } from "@/src/api/auth.api";

import { Button } from "@/src/shared/components/ui/Button";
import { Flex } from "@/src/shared/components/layout/Flex";

import { LoyaltyTierStatsHeader } from "../shared/components/LoyaltyTierStatsHeader";
import { LoyaltyTierListCard } from "../shared/components/LoyaltyTierListCard";
import { LoyaltyTierDetailPanel } from "../shared/components/LoyaltyTierDetailPanel";

export function LoyaltyTierStaffManager() {
    const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const data = await fetchAllLoyaltyTiers();
            const sorted = [...data].sort((a, b) => a.minPoints - b.minPoints);
            setTiers(sorted);
            if (sorted.length > 0) {
                setSelectedId(sorted[0].id);
            }
        } catch (err) {
            setLoadError(err instanceof AuthApiError ? err.message : "Không tải được dữ liệu hệ thống.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const selectedTier = tiers.find((t) => t.id === selectedId) ?? null;

    return (
        <div className="space-y-6 w-full animate-slide-up">
            {/* 1. Header Card */}
            <LoyaltyTierStatsHeader
                tiers={tiers}
                loading={loading}
                onRefresh={load}
                readOnly={true}
            />

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
                            readOnly={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
