"use client";

/**
 * CourtCard
 *
 * Displays a single court's operational status, today's stats,
 * base price, occupancy timeline, and action controls.
 */

import { CalendarDots, Eye, PencilSimple, Prohibit, CheckCircle, Trash } from "@phosphor-icons/react";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Button } from "@/src/shared/components/ui/Button";
import { ActionMenu } from "@/src/shared/components/ui/ActionMenu";
import { CourtOccupancyTimeline } from "./CourtOccupancyTimeline";
import {
    CourtOperationalStatus,
    type CourtManagementCardDto,
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

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

interface CourtCardProps {
    court: CourtManagementCardDto;
    onViewDetail: (courtId: string) => void;
    onEdit: (courtId: string) => void;
    onSuspend: (courtId: string, name: string) => void;
    onActivate: (courtId: string, name: string) => void;
    onDelete: (courtId: string, name: string) => void;
}

export function CourtCard({
    court,
    onViewDetail,
    onEdit,
    onSuspend,
    onActivate,
    onDelete,
}: CourtCardProps) {
    const statusConfig = STATUS_CONFIG[court.operationalStatus] ?? STATUS_CONFIG[CourtOperationalStatus.READY];
    const isSuspended = court.operationalStatus === CourtOperationalStatus.SUSPENDED;

    const menuItems = [
        {
            label: "Chỉnh sửa",
            icon: <PencilSimple className="h-4 w-4" />,
            onClick: () => onEdit(court.id),
            variant: "default" as const,
        },
        {
            label: "Tạm ngưng",
            icon: <Prohibit className="h-4 w-4" />,
            onClick: () => onSuspend(court.id, court.name),
            variant: "default" as const,
            hidden: isSuspended,
        },
        {
            label: "Kích hoạt",
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: () => onActivate(court.id, court.name),
            variant: "success" as const,
            hidden: !isSuspended,
        },
        {
            label: "Xóa sân",
            icon: <Trash className="h-4 w-4" />,
            onClick: () => onDelete(court.id, court.name),
            variant: "danger" as const,
        },
    ];

    return (
        <div className="group relative flex flex-col rounded-2xl bg-surface-1 border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            {/* Status badge — top right */}
            <div className="absolute top-3 right-3 z-10">
                <Badge variant={statusConfig.variant} dot>
                    {statusConfig.label}
                </Badge>
            </div>

            {/* Card body */}
            <div className="flex-1 p-5">
                {/* Name + type */}
                <div className="pr-24">
                    <h3 className="text-base font-extrabold text-foreground truncate">{court.name}</h3>
                    <p className="text-xs font-medium text-muted mt-0.5">{court.typeName}</p>
                </div>

                <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-muted">
                        <CalendarDots className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-bold">
                            {court.bookingsCount} lượt đặt
                        </span>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                        <span className="text-sm font-bold text-foreground">
                            {formatCurrency(court.basePrice)}
                        </span>
                        <span className="text-xs text-muted">/ giờ</span>
                    </div>
                </div>

                {/* Occupancy timeline */}
                <CourtOccupancyTimeline slots={court.scheduleTimeline} />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-border bg-surface-2">
                <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Eye className="h-4 w-4" />}
                    onClick={() => onViewDetail(court.id)}
                >
                    Xem chi tiết
                </Button>
                <ActionMenu items={menuItems} size="sm" />
            </div>
        </div>
    );
}
