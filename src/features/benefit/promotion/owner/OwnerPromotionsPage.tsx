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
import { ConfirmationDialog } from "@/src/shared/components/ui/ConfirmationDialog";
import { SmartImage } from "@/src/shared/components/ui/SmartImage";
import { Toast } from "@/src/shared/components/ui/Toast";
import { CreatePromotionModal } from "./dialogs/CreatePromotionModal";
import { UpdatePromotionModal } from "./dialogs/UpdatePromotionModal";

import { PromotionStatsHeader } from "./components/PromotionStatsHeader";
import { getStatusCfg, formatDate } from "../../utils";

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

            {/* Content Layout - Modern Horizontal Card Grid */}
            {/* Content Layout - Modern Horizontal Card Grid */}
            {!loading && !loadError && promotions.length > 0 && (
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {promotions.map((promotion) => {
                        const statusCfg = getStatusCfg(promotion.status);

                        return (
                            <div
                                key={promotion.id}
                                className="group relative flex flex-row items-center overflow-hidden rounded-2xl border border-border bg-surface-1 p-3 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5"
                            >
                                {/* Left Side: Square Image */}
                                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-border/50 bg-primary/5">
                                    {promotion.promoDisplayUrl ? (
                                        <SmartImage
                                            src={promotion.promoDisplayUrl}
                                            alt={promotion.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary/40">
                                            <div className="absolute inset-0 opacity-[0.08]"
                                                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '10px 10px' }}
                                            />
                                            <Ticket className="h-8 w-8 mb-1" weight="duotone" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Ưu đãi</span>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Promotion Content */}
                                <div className="ml-4 flex flex-1 flex-col justify-center min-w-0">
                                    <div className="space-y-1">
                                        {/* Header: Title and Status */}
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="line-clamp-1 text-[13px] font-bold text-foreground" title={promotion.name}>
                                                {promotion.name}
                                            </h3>
                                            <Badge variant={statusCfg.variant} size="sm" className="h-[22px] px-1.5 text-[10px] shrink-0">
                                                {statusCfg.label}
                                            </Badge>
                                        </div>

                                        {/* Discount Display */}
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-black text-primary leading-none">
                                                {formatDiscountDisplay(promotion)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer Section */}
                                    <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2">
                                        {/* Code or Expiry */}
                                        {promotion.code && (
                                            <div className="flex items-center gap-1.5 text-primary">
                                                <Tag className="h-3.5 w-3.5" weight="bold" />
                                                <span className="font-mono text-[14px] font-bold tracking-tight">{promotion.code}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                                            <CalendarBlank className="h-3.5 w-3.5" />
                                            <span className="truncate">Đến {formatDate(promotion.endDate)}</span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-1 shrink-0">
                                            <button
                                                onClick={() => setEditingPromotion(promotion)}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                                                aria-label="Chỉnh sửa khuyến mãi"
                                            >
                                                <PencilSimple className="h-4 w-4" weight="bold" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingPromotion(promotion)}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors"
                                                aria-label="Xóa khuyến mãi"
                                            >
                                                <Trash className="h-4 w-4" weight="bold" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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

            {/* Global Toast */}
            <Toast toast={toast} />
        </div>
    );
}
