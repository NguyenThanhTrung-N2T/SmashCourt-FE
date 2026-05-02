"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Warning,
    CheckCircle,
    CircleNotch,
    Megaphone,
    Plus,
    ArrowClockwise,
    Tag,
} from "@phosphor-icons/react";

import { fetchAllPromotions } from "@/src/api/promotion.api";
import { PromotionStatus } from "@/src/shared/types/promotion.types";
import type { Promotion } from "@/src/shared/types/promotion.types";
import { AuthApiError } from "@/src/api/auth.api";
import { useToast } from "@/src/shared/hooks/useToast";

import { Button } from "@/src/shared/components/ui/Button";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Stack } from "@/src/shared/components/layout/Stack";
import { CreatePromotionModal } from "./modals/CreatePromotionModal";

import { PromotionStatsHeader } from "./PromotionStatsHeader";
import { PromotionListCard } from "./PromotionListCard";
import { PromotionDetailPanel } from "./PromotionDetailPanel";

export default function PromotionManager() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { toast, show: showToast } = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const data = await fetchAllPromotions(1, 50);
            // Sort: ACTIVE first, then by createdAt desc
            const sorted = [...data.items].sort((a, b) => {
                if (a.status === PromotionStatus.ACTIVE && b.status !== PromotionStatus.ACTIVE) return -1;
                if (a.status !== PromotionStatus.ACTIVE && b.status === PromotionStatus.ACTIVE) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setPromotions(sorted);
            if (sorted.length > 0 && !selectedId) {
                setSelectedId(sorted[0].id);
            }
        } catch (err) {
            setLoadError(
                err instanceof AuthApiError ? err.message : "Không tải được dữ liệu khuyến mãi.",
            );
        } finally {
            setLoading(false);
        }
    }, [selectedId]);

    useEffect(() => {
        void load();
    }, [load]);

    function handleSaved(updated: Promotion) {
        setPromotions((prev) => {
            const next = prev.map((p) => (p.id === updated.id ? updated : p));
            return next.sort((a, b) => {
                if (a.status === PromotionStatus.ACTIVE && b.status !== PromotionStatus.ACTIVE) return -1;
                if (a.status !== PromotionStatus.ACTIVE && b.status === PromotionStatus.ACTIVE) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        });
    }

    function handleDeleted(id: string) {
        setPromotions((prev) => {
            const next = prev.filter((p) => p.id !== id);
            if (selectedId === id) {
                setSelectedId(next.length > 0 ? next[0].id : null);
            }
            return next;
        });
    }

    function handleCreated(p: Promotion) {
        setPromotions((prev) => {
            const next = [p, ...prev].sort((a, b) => {
                if (a.status === PromotionStatus.ACTIVE && b.status !== PromotionStatus.ACTIVE) return -1;
                if (a.status !== PromotionStatus.ACTIVE && b.status === PromotionStatus.ACTIVE) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            return next;
        });
        setSelectedId(p.id);
    }

    const selectedPromotion = promotions.find((p) => p.id === selectedId) ?? null;

    return (
        <div className="space-y-6 w-full animate-slide-up">
            {/* Header */}
            <PromotionStatsHeader
                promotions={promotions}
                loading={loading}
                onRefresh={load}
                onCreateNew={() => setShowCreateModal(true)}
            />

            {/* States */}
            {loading && (
                <Stack align="center" justify="center" spacing="md" className="my-20 w-full">
                    <CircleNotch className="h-8 w-8 animate-spin text-primary" />
                    <p className="font-semibold text-muted">Đang đồng bộ dữ liệu khuyến mãi...</p>
                </Stack>
            )}

            {!loading && loadError && (
                <Alert variant="error" className="my-10 py-12 flex flex-col items-center text-center">
                    <Warning className="mb-4 h-12 w-12 text-red-500" />
                    <h3 className="text-xl font-bold text-red-600">Lỗi đồng bộ dữ liệu</h3>
                    <p className="mt-2 text-red-500">{loadError}</p>
                    <Button
                        onClick={load}
                        variant="danger"
                        className="mt-6"
                        leftIcon={<ArrowClockwise className="h-5 w-5" />}
                    >
                        Thử lại
                    </Button>
                </Alert>
            )}

            {/* Empty State */}
            {!loading && !loadError && promotions.length === 0 && (
                <Stack align="center" className="my-10 rounded-[2rem] border-2 border-dashed border-primary/25 bg-primary/5 p-16 text-center w-full">
                    <div
                        className="flex h-20 w-20 items-center justify-center rounded-2xl mb-4 shadow-inner"
                        style={{ background: "linear-gradient(145deg, #2D7A50 0%, #1B5E38 100%)" }}
                    >
                        <Megaphone className="h-10 w-10 text-white drop-shadow" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Chưa có chương trình khuyến mãi</h3>
                    <p className="mt-2 text-sm text-muted max-w-sm">
                        Tạo chương trình khuyến mãi đầu tiên để khách hàng có thể tận hưởng ưu đãi khi đặt sân.
                    </p>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        variant="primary"
                        className="mt-6 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        leftIcon={<Plus className="h-5 w-5" />}
                    >
                        Tạo khuyến mãi đầu tiên
                    </Button>
                </Stack>
            )}

            {/* Content Layout */}
            {!loading && !loadError && promotions.length > 0 && (
                <div className="grid grid-cols-5 gap-6 w-full h-[600px] min-h-[600px]">
                    {/* Left: List */}
                    <div className="col-span-2 h-full">
                        <PromotionListCard
                            promotions={promotions}
                            selectedId={selectedId}
                            onSelect={(id) => {
                                if (id !== selectedId) setSelectedId(id);
                            }}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                        />
                    </div>

                    {/* Right: Detail */}
                    <div className="col-span-3 h-full relative">
                        {selectedPromotion ? (
                            <PromotionDetailPanel
                                key={selectedPromotion.id}
                                promotion={selectedPromotion}
                                onSaved={handleSaved}
                                onDeleted={handleDeleted}
                                showToast={showToast}
                            />
                        ) : (
                            <Stack align="center" justify="center" className="h-full rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                                <Tag className="mx-auto h-12 w-12 text-slate-300" />
                                <p className="mt-3 font-semibold text-slate-400">
                                    Chọn một khuyến mãi để xem chi tiết
                                </p>
                            </Stack>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreatePromotionModal
                    onCreated={handleCreated}
                    onClose={() => setShowCreateModal(false)}
                    showToast={showToast}
                />
            )}

            {/* Global Toast within page scope */}
            {toast.visible && (
                <div className="fixed bottom-8 right-8 z-[100] transition-all duration-300 animate-slide-up">
                    <div
                        className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-5 py-3.5 shadow-xl ${toast.tone === "success" ? "border-emerald-200" : "border-red-200"
                            }`}
                    >
                        {toast.tone === "success" ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                            <Warning className="h-5 w-5 text-red-500" />
                        )}
                        <p
                            className={`text-sm font-bold ${toast.tone === "success" ? "text-emerald-800" : "text-red-800"
                                }`}
                        >
                            {toast.message}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
