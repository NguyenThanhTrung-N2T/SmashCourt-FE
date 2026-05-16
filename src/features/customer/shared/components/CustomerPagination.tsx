"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";

interface CustomerPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export function CustomerPagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
}: CustomerPaginationProps) {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-1 rounded-b-2xl">
            <div className="text-sm text-muted">
                Hiển thị <span className="font-semibold text-foreground">{startItem}</span> đến{' '}
                <span className="font-semibold text-foreground">{endItem}</span> trong tổng số{' '}
                <span className="font-semibold text-foreground">{totalItems}</span> khách hàng
            </div>
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <CaretLeft className="h-4 w-4" />
                    Trước
                </Button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                                    currentPage === pageNum
                                        ? 'bg-primary text-white'
                                        : 'text-muted hover:bg-surface-2'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Sau
                    <CaretRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
