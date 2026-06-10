"use client";

/**
 * CourtDetailModal
 *
 * Enhanced modal layout with more visual depth and project-aligned aesthetics.
 * Uses section cards, icons, and subtle gradients to avoid a "monotonous" look.
 */

import { useEffect, useState } from "react";
import {
    CourtBasketball,
    Clock,
    CalendarDots,
} from "@phosphor-icons/react";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Modal } from "@/src/shared/components/ui/Modal";
import { fetchCourtManagementDetail } from "@/src/api/court.api";
import {
    CourtOperationalStatus,
    type CourtManagementDetailDto,
} from "@/src/features/court/shared/types/court.types";

const STATUS_CONFIG: Record<
    CourtOperationalStatus,
    { label: string; variant: "success" | "info" | "warning" | "error" }
> = {
    [CourtOperationalStatus.READY]: { label: "Sẵn sàng", variant: "success" },
    [CourtOperationalStatus.BOOKED]: { label: "Đã đặt", variant: "info" },
    [CourtOperationalStatus.PLAYING]: { label: "Đang chơi", variant: "warning" },
    [CourtOperationalStatus.SUSPENDED]: { label: "Tạm ngưng", variant: "error" },
};

function formatCurrency(n: number) {
    return new Intl.NumberFormat("vi-VN").format(n);
}

function LoadingSkeleton() {
    return (
        <div className="p-6 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between py-3 border-b border-border">
                    <div className="h-4 bg-surface-2 rounded w-24" />
                    <div className="h-4 bg-surface-2 rounded w-32" />
                </div>
            ))}
        </div>
    );
}

interface CourtDetailModalProps {
    isOpen: boolean;
    courtId: string | null;
    onClose: () => void;
    date?: string;
}

export function CourtDetailModal({ isOpen, courtId, onClose, date }: CourtDetailModalProps) {
    const [detail, setDetail] = useState<CourtManagementDetailDto | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !courtId) {
            if (detail !== null) {
                setDetail(null);
            }
            return;
        }
        let cancelled = false;
        setLoading(true);
        fetchCourtManagementDetail(courtId, date)
            .then((data) => { if (!cancelled) setDetail(data); })
            .catch(() => { })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [isOpen, courtId, date]);

    const statusConfig = detail
        ? (STATUS_CONFIG[detail.operationalStatus] ?? STATUS_CONFIG[CourtOperationalStatus.READY])
        : null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={detail?.name ?? "Đang tải..."}
            subtitle={detail ? `${detail.typeName} · ${detail.branchName}` : "Thông tin chi tiết sân"}
            maxWidth="lg"
        >
            {/* Header Badge */}
            {detail && statusConfig && (
                <div className="absolute top-6 right-16 z-10 py-1">
                    <Badge
                        variant={statusConfig.variant}
                        dot
                        className="bg-white shadow-md border-none px-3 py-1"
                    >
                        {statusConfig.label}
                    </Badge>
                </div>
            )}

            {loading ? (
                <LoadingSkeleton />
            ) : detail ? (
                <div className="p-2">
                    {/* Info Card Section */}
                    <div>
                        <DataRow
                            label="Loại sân"
                            value={<Badge variant="neutral" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-none px-3 font-extrabold">{detail.typeName}</Badge>}
                        />
                        <DataRow
                            label="Giá giờ thường"
                            value={<span><span className="font-extrabold text-foreground">{formatCurrency(detail.prices.normalPrice)}</span> <span className="text-xs text-muted font-bold uppercase">đ/giờ</span></span>}
                        />
                        <DataRow
                            label="Giá giờ cao điểm"
                            value={<span><span className="font-extrabold text-foreground">{formatCurrency(detail.prices.peakPrice)}</span> <span className="text-xs text-muted font-bold uppercase">đ/giờ</span></span>}
                        />
                        <DataRow
                            label="Khách đang chơi"
                            value={<span className="font-extrabold text-foreground">{detail.currentPlayer?.name ?? "—"}</span>}
                        />
                        <DataRow
                            label="Đặt hôm nay"
                            value={<span><span className="font-extrabold text-foreground">{detail.bookingsCount}</span> <span className="text-xs text-muted font-bold uppercase">lượt</span></span>}
                        />
                    </div>

                    {/* Upcoming Bookings Section */}
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="h-4 w-4 text-muted" />
                            <h3 className="text-xs font-bold text-muted uppercase tracking-widest">
                                ĐẶT SÂN TỚI
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {detail.upcomingBookings.length > 0 ? (
                                detail.upcomingBookings.map((b, i) => {
                                    const isEven = i % 2 === 0;
                                    const slotVariant = isEven ? "info" : "success";
                                    const bgClass = isEven
                                        ? "bg-blue-50/70 text-blue-800 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                                        : "bg-emerald-50/70 text-emerald-800 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";

                                    return (
                                        <div
                                            key={i}
                                            className={`flex items-center justify-between rounded-xl px-4 py-3.5 border ${bgClass} shadow-xs transition-transform hover:scale-[1.01]`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase opacity-60">Thời gian</span>
                                                <span className="text-sm font-extrabold">{b.timeRange}</span>
                                            </div>

                                            <div className="flex flex-col items-center flex-1">
                                                <span className="text-[10px] font-bold uppercase opacity-60">Khách hàng</span>
                                                <span className="text-sm font-extrabold">{b.playerName}</span>
                                            </div>

                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-bold uppercase opacity-60 mb-1">Trạng thái</span>
                                                <Badge
                                                    variant={slotVariant}
                                                    dot
                                                    size="sm"
                                                    className={`bg-white/80 border-none shadow-sm ${isEven ? "text-blue-800" : "text-emerald-800"
                                                        }`}
                                                >
                                                    {b.status === "CONFIRMED" ? "Đã XN" : b.status === "PAID_ONLINE" ? "Đã TT" : b.statusShort}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 rounded-2xl border-2 border-dashed border-border bg-surface-2/30">
                                    <CalendarDots className="h-8 w-8 text-muted/30 mb-2" />
                                    <p className="text-sm text-muted font-medium italic">Không có lịch đặt sắp tới</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                    <p className="text-sm text-muted">Không thể tải thông tin sân.</p>
                </div>
            )}
        </Modal>
    );
}

function DataRow({
    icon,
    label,
    value,
    isLast = false
}: {
    icon?: React.ReactNode;
    label: string;
    value: React.ReactNode;
    isLast?: boolean;
}) {
    return (
        <div className={`flex items-center justify-between px-4 py-4 ${!isLast ? "border-b border-border" : ""}`}>
            <div className="flex items-center gap-3">
                {icon && <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2">{icon}</div>}
                <span className="text-sm font-bold text-muted">{label}</span>
            </div>
            <div className="text-sm text-foreground">{value}</div>
        </div>
    );
}
