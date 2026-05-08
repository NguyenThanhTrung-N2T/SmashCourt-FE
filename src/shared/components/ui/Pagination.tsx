"use client";

import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string; // e.g., "nhân viên", "chi nhánh", "kết quả"
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = "kết quả",
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface-1 px-6 py-4">
      <div className="text-sm text-muted">
        Hiển thị <span className="font-bold text-foreground">{startItem}</span> đến{' '}
        <span className="font-bold text-foreground">{endItem}</span> trong tổng số{' '}
        <span className="font-bold text-foreground">{totalItems}</span> {itemLabel}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
            canGoPrevious
              ? 'border-border bg-surface-1 text-foreground hover:bg-surface-2 hover:border-primary'
              : 'border-border bg-surface-2 text-muted cursor-not-allowed opacity-50'
          }`}
          aria-label="Trang trước"
        >
          <CaretLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-muted">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold transition-all ${
                isActive
                  ? 'border-primary bg-primary text-white shadow-md'
                  : 'border-border bg-surface-1 text-foreground hover:bg-surface-2 hover:border-primary'
              }`}
              aria-label={`Trang ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
            canGoNext
              ? 'border-border bg-surface-1 text-foreground hover:bg-surface-2 hover:border-primary'
              : 'border-border bg-surface-2 text-muted cursor-not-allowed opacity-50'
          }`}
          aria-label="Trang sau"
        >
          <CaretRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
