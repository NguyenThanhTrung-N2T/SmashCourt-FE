"use client";

import { Users } from "@phosphor-icons/react";
import { EmptyState } from "@/src/shared/components/layout";

interface CustomerEmptyStateProps {
    hasFilters?: boolean;
}

export function CustomerEmptyState({ hasFilters = false }: CustomerEmptyStateProps) {
    return (
        <div className="rounded-2xl border border-border bg-surface-1 shadow-sm py-20">
            <EmptyState
                icon={<Users className="h-16 w-16 text-muted" />}
                title={hasFilters ? "Không tìm thấy khách hàng" : "Chưa có khách hàng"}
                description={
                    hasFilters
                        ? "Thử thay đổi bộ lọc hoặc tìm kiếm để xem kết quả khác"
                        : "Khách hàng sẽ xuất hiện khi họ đăng ký và đặt sân"
                }
            />
        </div>
    );
}
