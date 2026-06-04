"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Warning,
    CircleNotch,
    Megaphone,
    ArrowClockwise,
} from "@phosphor-icons/react";

import { fetchAllPromotions } from "@/src/api/promotion.api";
import { PromotionStatus } from "@/src/features/benefit/promotion/shared/types/promotion.types";
import type { Promotion } from "@/src/features/benefit/promotion/shared/types/promotion.types";
import { AuthApiError } from "@/src/api/auth.api";
import { useToast } from "@/src/shared/hooks/useToast";

import { Button } from "@/src/shared/components/ui/Button";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Stack } from "@/src/shared/components/layout/Stack";
import { Toast } from "@/src/shared/components/ui/Toast";

import { PromotionCard } from "../shared/components/PromotionCard";
import { PromotionDetailModal } from "./dialogs/PromotionDetailModal";
import { PageHeader } from "@/src/shared/components/layout";

export function StaffPromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
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
        } catch (err) {
            setLoadError(
                err instanceof AuthApiError ? err.message : "Không tải được dữ liệu khuyến mãi.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <div className="space-y-6 w-full animate-slide-up">
            <PageHeader
                title="Mã huyến mãi"
                description="Danh sách mã khuyến mãi hiện có"
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
                        Hiện chưa có chương trình khuyến mãi nào đang diễn ra.
                    </p>
                </Stack>
            )}

            {/* Content Layout - Modern Horizontal Card Grid */}
            {!loading && !loadError && promotions.length > 0 && (
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {promotions.map((promotion) => (
                        <PromotionCard
                            key={promotion.id}
                            promotion={promotion}
                            readOnly={true}
                            onClick={setSelectedPromotion}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {selectedPromotion && (
                <PromotionDetailModal
                    promotion={selectedPromotion}
                    onClose={() => setSelectedPromotion(null)}
                />
            )}

            {/* Global Toast */}
            <Toast toast={toast} />
        </div>
    );
}
