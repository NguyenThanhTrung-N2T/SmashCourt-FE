"use client";

import { Storefront } from "@phosphor-icons/react";
import { EmptyState } from "@/src/shared/components/layout";

interface BranchEmptyStateProps {
    action?: React.ReactNode;
}

export function BranchEmptyState({ action }: BranchEmptyStateProps) {
    return (
        <div className="rounded-2xl border border-border bg-surface-1 shadow-sm py-20">
            <EmptyState
                icon={<Storefront className="h-16 w-16 text-muted" />}
                title="Chưa có chi nhánh"
                description="Vui lòng tạo chi nhánh trước khi quản lý"
                action={action}
            />
        </div>
    );
}
