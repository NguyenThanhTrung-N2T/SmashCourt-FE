"use client";

import { ArrowLeft, Lock, LockOpen } from '@phosphor-icons/react';
import { PageHeader } from '@/src/shared/components/layout/PageHeader';
import { Button, Badge } from '@/src/shared/components/ui';
import { formatDate } from '@/src/shared/utils/date';
import { getTierCfg } from '@/src/features/benefit/loyalty/owner/LoyaltyTierConfig';
import type { CustomerDetailDto } from '../types/customer.types';

interface CustomerDetailViewProps {
    customer: CustomerDetailDto;
    isOwner?: boolean;
    onBack: () => void;
    onLockCustomer?: () => void;
    onUnlockCustomer?: () => void;
}

export function CustomerDetailView({
    customer,
    isOwner = false,
    onBack,
    onLockCustomer,
    onUnlockCustomer,
}: CustomerDetailViewProps) {
    const cfg = getTierCfg(customer.loyaltyTier);

    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            {/* Header with Back Button */}
            <div className={`flex items-center ${isOwner ? 'justify-between' : 'gap-4'}`}>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                    {customer.avatarUrl && (
                        <img
                            src={customer.avatarUrl}
                            alt={customer.fullName}
                            className="h-16 w-16 rounded-full object-cover border-2 border-border shadow-md"
                        />
                    )}
                    <PageHeader
                        title={customer.fullName}
                        description="Thông tin chi tiết khách hàng"
                    />
                </div>
                {isOwner && (
                    <div className="flex items-center gap-3">
                        {customer.status === 'ACTIVE' ? (
                            <Button
                                variant="danger"
                                onClick={onLockCustomer}
                            >
                                <Lock className="h-4 w-4" />
                                Khóa tài khoản
                            </Button>
                        ) : (
                            <Button
                                variant="success"
                                onClick={onUnlockCustomer}
                            >
                                <LockOpen className="h-4 w-4" />
                                Mở khóa tài khoản
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Customer Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info Card */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="rounded-2xl border border-border bg-surface-1 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-foreground mb-6">Thông tin cơ bản</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            <div>
                                <label className="text-xs font-medium text-muted uppercase tracking-wide">Họ và tên</label>
                                <p className="mt-1.5 text-base font-semibold text-foreground">{customer.fullName}</p>
                            </div>

                            {customer.phone && (
                                <div>
                                    <label className="text-xs font-medium text-muted uppercase tracking-wide">Số điện thoại</label>
                                    <p className="mt-1.5 text-base font-semibold text-foreground">{customer.phone}</p>
                                </div>
                            )}

                            {isOwner && customer.email && (
                                <div>
                                    <label className="text-xs font-medium text-muted uppercase tracking-wide">Email</label>
                                    <p className="mt-1.5 text-base font-semibold text-foreground">{customer.email}</p>
                                </div>
                            )}

                            {isOwner && customer.registrationMethod && (
                                <div>
                                    <label className="text-xs font-medium text-muted uppercase tracking-wide">Phương thức đăng ký</label>
                                    <p className="mt-1.5 text-base font-semibold text-foreground">{customer.registrationMethod}</p>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-medium text-muted uppercase tracking-wide">Trạng thái</label>
                                <div className="mt-1.5">
                                    {customer.status === 'ACTIVE' ? (
                                        <Badge variant="success" dot>Hoạt động</Badge>
                                    ) : (
                                        <Badge variant="error" dot>Đã khóa</Badge>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted uppercase tracking-wide">Ngày tạo</label>
                                <p className="mt-1.5 text-base font-semibold text-foreground">{formatDate(customer.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Lock Info */}
                    {customer.status === 'LOCKED' && customer.lockInfo && (
                        <div className="rounded-2xl border border-error/30 bg-error/5 p-6 shadow-sm">
                            <h4 className="text-base font-bold text-error mb-4 flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Thông tin khóa
                            </h4>
                            <div className="space-y-3">
                                {customer.lockInfo.reason && (
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-muted uppercase tracking-wide">Lý do</span>
                                        <span className="mt-1 text-sm text-foreground font-medium">{customer.lockInfo.reason}</span>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {customer.lockInfo.lockedAt && (
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-muted uppercase tracking-wide">Thời gian khóa</span>
                                            <span className="mt-1 text-sm text-foreground font-medium">{formatDate(customer.lockInfo.lockedAt)}</span>
                                        </div>
                                    )}
                                    {customer.lockInfo.lockedByName && (
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-muted uppercase tracking-wide">Người khóa</span>
                                            <span className="mt-1 text-sm text-foreground font-medium">{customer.lockInfo.lockedByName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loyalty Card */}
                <div className={`rounded-2xl border ${cfg.cardBorder} ${cfg.cardBg} p-6 shadow-sm`}>
                    <h3 className="text-lg font-bold text-foreground mb-6">Thông tin thành viên</h3>

                    <div className="space-y-5">
                        <div>
                            <label className="text-xs font-medium text-muted uppercase tracking-wide">Hạng thành viên</label>
                            <div className="mt-2">
                                <div className={`inline-flex items-center px-4 py-2 rounded-full ${cfg.pillBg} border ${cfg.cardBorder}`}>
                                    <span className={`text-sm font-bold ${cfg.pillText}`}>
                                        {customer.loyaltyTier}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {isOwner && customer.totalPoints !== undefined && (
                            <div>
                                <label className="text-xs font-medium text-muted uppercase tracking-wide">Điểm tích lũy</label>
                                <p className="mt-2 text-2xl font-bold text-primary">{customer.totalPoints.toLocaleString()}</p>
                            </div>
                        )}

                        {isOwner && customer.pointsToNextTier !== undefined && customer.pointsToNextTier > 0 && (
                            <div>
                                <label className="text-xs font-medium text-muted uppercase tracking-wide">Điểm để lên hạng</label>
                                <p className="mt-2 text-lg font-semibold text-foreground">{customer.pointsToNextTier.toLocaleString()}</p>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-medium text-muted uppercase tracking-wide">Giảm giá hiện tại</label>
                            <p className="mt-2 text-2xl font-bold text-success">{customer.currentDiscount}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Card */}
            <div className="rounded-2xl border border-border bg-surface-1 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-6">Thống kê</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {isOwner && customer.statistics.totalRevenue !== undefined && (
                        <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-2">Tổng doanh thu</label>
                            <p className="text-2xl font-bold text-success">{customer.statistics.totalRevenue.toLocaleString()} ₫</p>
                        </div>
                    )}

                    <div className="p-4 rounded-xl bg-surface-2 border border-border">
                        <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-2">Tổng booking hoàn thành</label>
                        <p className="text-3xl font-bold text-foreground">{customer.statistics.totalCompletedBookings}</p>
                    </div>

                    {isOwner && customer.statistics.mostBookedBranch && (
                        <div className="p-4 rounded-xl bg-surface-2 border border-border">
                            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-2">Chi nhánh thường đặt</label>
                            <p className="text-base font-bold text-foreground mt-2">{customer.statistics.mostBookedBranch}</p>
                        </div>
                    )}

                    {isOwner && customer.statistics.mostBookedTimeSlot && (
                        <div className="p-4 rounded-xl bg-surface-2 border border-border">
                            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-2">Khung giờ thường đặt</label>
                            <p className="text-base font-bold text-foreground mt-2">{customer.statistics.mostBookedTimeSlot}</p>
                        </div>
                    )}

                    {customer.statistics.lastBookingDate && (
                        <div className="p-4 rounded-xl bg-surface-2 border border-border">
                            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-2">Booking gần nhất</label>
                            <p className="text-base font-bold text-foreground mt-2">{formatDate(customer.statistics.lastBookingDate)}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
