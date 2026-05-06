import { Storefront, Tag } from "@phosphor-icons/react";

interface PricingEmptyStateProps {
    type: "branch" | "courtType";
}

export function PricingEmptyState({ type }: PricingEmptyStateProps) {
    if (type === "branch") {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-1 rounded-4xl border border-border shadow-sm">
                <Storefront className="h-12 w-12 text-muted mb-4" />
                <p className="text-lg font-bold text-foreground">Vui lòng chọn chi nhánh</p>
                <p className="text-sm text-muted mt-1 max-w-sm">
                    Chọn một chi nhánh từ danh sách trên để xem hoặc cấu hình bảng giá ghi đè.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-1 rounded-4xl border border-border shadow-sm">
            <Tag className="h-12 w-12 text-muted mb-4" />
            <p className="text-lg font-bold text-foreground">Chi nhánh chưa có loại sân</p>
            <p className="text-sm text-muted mt-1 max-w-sm">
                Chi nhánh này chưa được cấu hình loại sân nào. Vui lòng thêm loại sân trong mục{" "}
                <span className="font-semibold text-foreground">Chi nhánh</span>.
            </p>
        </div>
    );
}
