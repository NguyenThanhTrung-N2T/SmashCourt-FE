"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Warning,
    CircleNotch,
    Megaphone,
    Plus,
    ArrowClockwise,
    CalendarBlank,
    Tag,
    Ticket,
    PencilSimple,
    Trash,
} from "@phosphor-icons/react";

import { fetchAllPromotions, deletePromotion, formatDiscountDisplay } from "@/src/api/promotion.api";
import { PromotionStatus } from "@/src/features/benefit/promotion/shared/types/promotion.types";
import type { Promotion } from "@/src/features/benefit/promotion/shared/types/promotion.types";
import { AuthApiError } from "@/src/api/auth.api";
import { useToast } from "@/src/shared/hooks/useToast";

import { Button } from "@/src/shared/components/ui/Button";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Stack } from "@/src/shared/components/layout/Stack";
import { Badge } from "@/src/shared/components/ui/Badge";
import { PageHeader } from "@/src/shared/components/layout";
import { ConfirmationDialog } from "@/src/shared/components/ui/ConfirmationDialog";
import { SmartImage } from "@/src/shared/components/ui/SmartImage";
import { Toast } from "@/src/shared/components/ui/Toast";
import { CreatePromotionModal } from "./dialogs/CreatePromotionModal";
import { UpdatePromotionModal } from "./dialogs/UpdatePromotionModal";
import { PromotionCard } from "../shared/components/PromotionCard";
import { getStatusCfg, formatDate } from "../../utils";
import { AIPanelSection } from "@/src/features/ai/shared/components/AIPanelSection";
import { PromotionSuggestionsPanel } from "@/src/features/ai/shared/components/PromotionSuggestionsPanel";

export default function OwnerPromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [deletingPromotion, setDeletingPromotion] = useState<Promotion | null>(null);
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

    async function handleDelete(promotion: Promotion) {
        try {
            await deletePromotion(promotion.id);
            setPromotions((prev) => prev.filter((p) => p.id !== promotion.id));
            showToast("success", `Đã xóa "${promotion.name}"`);
            setDeletingPromotion(null);
        } catch (err) {
            const msg = err instanceof AuthApiError ? err.message : "Không thể xóa khuyến mãi.";
            showToast("error", msg);
        }
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
    }

    return (
        <div className="space-y-6 w-full animate-slide-up">
            {/* Header */}
            <PageHeader
                title="Quản lý mã khuyến mãi"
                description="Quản lý chương trình khuyến mãi trong hệ thống"
                action={
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        variant="primary"
                        leftIcon={<Plus className="h-5 w-5" />}
                    >
                        Thêm khuyến mãi
                    </Button>
                }
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

            {/* Content Layout - Modern Horizontal Card Grid */}
            {!loading && !loadError && promotions.length > 0 && (
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {promotions.map((promotion) => (
                        <PromotionCard
                            key={promotion.id}
                            promotion={promotion}
                            onEdit={setEditingPromotion}
                            onDelete={setDeletingPromotion}
                            readOnly={false}
                        />
                    ))}
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

            {editingPromotion && (
                <UpdatePromotionModal
                    promotion={editingPromotion}
                    onUpdated={handleSaved}
                    onClose={() => setEditingPromotion(null)}
                    showToast={showToast}
                />
            )}

            {deletingPromotion && (
                <ConfirmationDialog
                    onCancel={() => setDeletingPromotion(null)}
                    onConfirm={() => handleDelete(deletingPromotion)}
                    title="Xác nhận xóa khuyến mãi"
                    message={`Bạn có chắc chắn muốn xóa khuyến mãi "${deletingPromotion.name}"? Hành động này không thể hoàn tác.`}
                    confirmText="Xóa khuyến mãi"
                    variant="danger"
                />
            )}

            {/* ── AI Promotion Suggestions (collapsible) ──────────── */}
            <AIPanelSection title="AI Promotion Suggestions" accentClass="text-violet-500 border-violet-500/40">
                <PromotionSuggestionsPanel />
            </AIPanelSection>

            {/* Global Toast */}
            <Toast toast={toast} />
        </div>
    );
}
