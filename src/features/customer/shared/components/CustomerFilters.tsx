"use client";

import { MagnifyingGlass, Funnel } from "@phosphor-icons/react";
import { Input } from "@/src/shared/components/ui/Input";
import type { CustomerListQuery } from "../types/customer.types";

interface CustomerFiltersProps {
    filters: CustomerListQuery;
    onFiltersChange: (filters: CustomerListQuery) => void;
    branches?: Array<{ id: string; name: string }>;
    loyaltyTiers?: Array<{ id: string; name: string }>;
}

export function CustomerFilters({
    filters,
    onFiltersChange,
    branches = [],
    loyaltyTiers = []
}: CustomerFiltersProps) {
    const handleSearchChange = (value: string) => {
        onFiltersChange({ ...filters, searchTerm: value, page: 1 });
    };

    const handleStatusChange = (value: string) => {
        onFiltersChange({ ...filters, status: value || undefined, page: 1 });
    };

    const handleLoyaltyTierChange = (value: string) => {
        onFiltersChange({
            ...filters,
            loyaltyTierId: value || undefined,
            loyaltyTier: value || undefined,
            page: 1
        });
    };

    const handleBranchChange = (value: string) => {
        onFiltersChange({ ...filters, branchId: value || undefined, page: 1 });
    };

    const handleSortChange = (value: string) => {
        const [sortBy, sortOrder] = value.split('-') as [
            'fullname' | 'createdat',
            'asc' | 'desc'
        ];
        onFiltersChange({ ...filters, sortBy, sortOrder, page: 1 });
    };

    return (
        <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
                <Input
                    placeholder="Tìm kiếm theo tên, số điện thoại, email..."
                    value={filters.searchTerm || ''}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    leftIcon={<MagnifyingGlass className="h-4 w-4" />}
                />
            </div>

            {/* Status Filter */}
            <select
                value={filters.status || ''}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded-xl border-2 border-border bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground outline-none transition-all focus:bg-surface-1 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
            >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="LOCKED">Đã khóa</option>
            </select>

            {/* Loyalty Tier Filter */}
            {loyaltyTiers.length > 0 && (
                <select
                    value={filters.loyaltyTierId || filters.loyaltyTier || ''}
                    onChange={(e) => handleLoyaltyTierChange(e.target.value)}
                    className="rounded-xl border-2 border-border bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground outline-none transition-all focus:bg-surface-1 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                >
                    <option value="">Tất cả hạng thành viên</option>
                    {loyaltyTiers.map((tier) => (
                        <option key={tier.id} value={tier.id}>
                            {tier.name}
                        </option>
                    ))}
                </select>
            )}

            {/* Branch Filter */}
            {branches.length > 0 && (
                <select
                    value={filters.branchId || ''}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className="rounded-xl border-2 border-border bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground outline-none transition-all focus:bg-surface-1 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                >
                    <option value="">Tất cả chi nhánh</option>
                    {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                            {branch.name}
                        </option>
                    ))}
                </select>
            )}

            {/* Sort */}
            <select
                value={`${filters.sortBy || 'createdat'}-${filters.sortOrder || 'desc'}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="rounded-xl border-2 border-border bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground outline-none transition-all focus:bg-surface-1 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
            >
                <option value="createdat-desc">Mới nhất</option>
                <option value="createdat-asc">Cũ nhất</option>
                <option value="fullname-asc">Tên A-Z</option>
                <option value="fullname-desc">Tên Z-A</option>
            </select>

            {/* Filter Icon (visual indicator) */}
            <div className="flex items-center justify-center px-4 py-3 rounded-xl border-2 border-border bg-surface-2 text-muted">
                <Funnel className="h-5 w-5" />
            </div>
        </div>
    );
}
