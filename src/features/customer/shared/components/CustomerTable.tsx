"use client";

import { Lock, LockOpen, Phone, EnvelopeSimple } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { Badge } from "@/src/shared/components/ui/Badge";
import type { CustomerListDto } from "../../types/customer.types";
import { formatDate } from "@/src/shared/utils/date";
import { getTierCfg } from "@/src/features/benefit/loyalty/owner/LoyaltyTierConfig";

interface CustomerTableProps {
    customers: CustomerListDto[];
    onViewDetails: (customerId: string) => void;
    onLockCustomer?: (customerId: string) => void;
    onUnlockCustomer?: (customerId: string) => void;
    isOwner?: boolean;
}

export function CustomerTable({
    customers,
    onViewDetails,
    onLockCustomer,
    onUnlockCustomer,
    isOwner = false,
}: CustomerTableProps) {
    const getStatusBadge = (status: string) => {
        if (status === 'ACTIVE') {
            return (
                <Badge variant="success" dot>
                    Hoạt động
                </Badge>
            );
        }
        return (
            <Badge variant="error" dot>
                Đã khóa
            </Badge>
        );
    };

    const getLoyaltyTierBadge = (tierName: string) => {
        const cfg = getTierCfg(tierName);
        
        return (
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${cfg.pillBg} border ${cfg.cardBorder}`}>
                <span className={`text-xs font-bold ${cfg.pillText}`}>
                    {tierName}
                </span>
            </div>
        );
    };

    return (
        <div className="rounded-2xl border border-border bg-surface-1 shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full">
                    <thead className="bg-surface-2 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                                Khách hàng
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                                Liên hệ
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                                Hạng thành viên
                            </th>
                            {isOwner && (
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                                    Điểm tích lũy
                                </th>
                            )}
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                                Số booking
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                                Trạng thái
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                                Ngày tạo
                            </th>
                            {isOwner && (
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted">
                                    Thao tác
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {customers.map((customer) => (
                            <tr
                                key={customer.id}
                                onClick={() => onViewDetails(customer.id)}
                                className="hover:bg-surface-2 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-semibold text-foreground">
                                        {customer.fullName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 min-w-[200px]">
                                    <div className="space-y-1">
                                        {customer.phone && (
                                            <div className="flex items-center gap-2 text-sm text-muted">
                                                <Phone className="h-4 w-4" />
                                                {customer.phone}
                                            </div>
                                        )}
                                        {isOwner && customer.email && (
                                            <div className="flex items-center gap-2 text-sm text-muted">
                                                <EnvelopeSimple className="h-4 w-4" />
                                                {customer.email}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getLoyaltyTierBadge(customer.loyaltyTier)}
                                </td>
                                {isOwner && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-primary">
                                            {customer.totalPoints?.toLocaleString() || 0}
                                        </span>
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-semibold text-foreground">
                                        {customer.totalCompletedBookings}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(customer.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                                    {formatDate(customer.createdAt)}
                                </td>
                                {isOwner && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            {customer.status === 'ACTIVE' ? (
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => onLockCustomer?.(customer.id)}
                                                >
                                                    <Lock className="h-4 w-4" />
                                                    Khóa
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() => onUnlockCustomer?.(customer.id)}
                                                >
                                                    <LockOpen className="h-4 w-4" />
                                                    Mở khóa
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
