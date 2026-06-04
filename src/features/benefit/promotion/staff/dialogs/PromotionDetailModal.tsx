"use client";

import { CalendarBlank, Tag, Ticket, Info, CheckCircle, Clock } from "@phosphor-icons/react";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Badge } from "@/src/shared/components/ui/Badge";
import { SmartImage } from "@/src/shared/components/ui/SmartImage";
import { getStatusCfg, formatDate } from "@/src/features/benefit/utils";
import { formatDiscountDisplay } from "@/src/api/promotion.api";
import type { Promotion } from "@/src/features/benefit/promotion/shared/types/promotion.types";
import { DiscountType } from "@/src/features/benefit/promotion/shared/types/promotion.types";

interface PromotionDetailModalProps {
    promotion: Promotion;
    onClose: () => void;
}

export function PromotionDetailModal({ promotion, onClose }: PromotionDetailModalProps) {
    const statusCfg = getStatusCfg(promotion.status);

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Chi tiết khuyến mãi"
            subtitle="Thông tin chương trình ưu đãi"
            icon={<Ticket className="h-5 w-5" />}
            maxWidth="xl"
        >
            <div className="p-6 space-y-6">
                {/* Hero section with image and basic info */}
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative h-48 w-full md:w-48 flex-shrink-0 overflow-hidden rounded-2xl border border-border bg-primary/5">
                        {promotion.promoDisplayUrl ? (
                            <SmartImage
                                src={promotion.promoDisplayUrl}
                                alt={promotion.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary/40">
                                <Ticket className="h-16 w-16 mb-2" weight="duotone" />
                                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Ưu đãi</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <Badge variant={statusCfg.variant} size="md">
                                {statusCfg.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Tạo ngày {formatDate(promotion.createdAt)}
                            </span>
                        </div>

                        <h2 className="text-2xl font-bold text-foreground leading-tight">
                            {promotion.name}
                        </h2>

                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-primary">
                                {formatDiscountDisplay(promotion)}
                            </span>
                            {promotion.discountType === DiscountType.PERCENT && promotion.maxDiscountAmount && (
                                <span className="text-sm text-muted-foreground">
                                    (Tối đa {promotion.maxDiscountAmount.toLocaleString("vi-VN")} VNĐ)
                                </span>
                            )}
                        </div>

                        {promotion.code && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                                <Tag className="h-4 w-4" weight="bold" />
                                <span className="font-mono font-bold tracking-wider">{promotion.code}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                    {/* Dates and Usage */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                                <CalendarBlank className="h-4 w-4 text-primary" />
                                Thời gian áp dụng
                            </h4>
                            <div className="p-3 rounded-xl bg-surface-2 border border-border">
                                <p className="text-sm">Từ: <span className="font-semibold">{formatDate(promotion.startDate)}</span></p>
                                <p className="text-sm">Đến: <span className="font-semibold">{formatDate(promotion.endDate)}</span></p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                Giới hạn sử dụng
                            </h4>
                            <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
                                <p className="text-sm">Tổng lượt dùng: <span className="font-semibold">{promotion.usageLimit || "Không giới hạn"}</span></p>
                                <p className="text-sm">Mỗi khách hàng: <span className="font-semibold">{promotion.usagePerUserLimit || "Không giới hạn"}</span></p>
                                <p className="text-sm">Đã sử dụng: <span className="font-semibold text-primary">{promotion.usedCount} lượt</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Description and Conditions */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                                <Info className="h-4 w-4 text-primary" />
                                Mô tả
                            </h4>
                            <div className="p-3 rounded-xl bg-surface-2 border border-border min-h-[5rem]">
                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                    {promotion.description || "Không có mô tả cho chương trình này."}
                                </p>
                            </div>
                        </div>

                        {promotion.conditions && promotion.conditions.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    Điều kiện áp dụng
                                </h4>
                                <div className="p-3 rounded-xl bg-surface-2 border border-border">
                                    <ul className="space-y-1">
                                        {promotion.conditions.map((c, i) => (
                                            <li key={i} className="text-sm flex items-start gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                                <span className="text-muted-foreground">{c.conditionType}:</span>
                                                <span className="font-medium">{c.conditionValue}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-border bg-surface-2/50 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-6 py-2 rounded-xl bg-primary text-white font-bold shadow-md hover:bg-primary-dark transition-all active:scale-95"
                >
                    Đóng
                </button>
            </div>
        </Modal>
    );
}
