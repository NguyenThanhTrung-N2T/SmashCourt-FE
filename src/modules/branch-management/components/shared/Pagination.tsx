"use client";

import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
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
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
      <div className="text-sm text-slate-600">
        Hiển thị <span className="font-bold text-slate-900">{startItem}</span> đến{' '}
        <span className="font-bold text-slate-900">{endItem}</span> trong tổng số{' '}
        <span className="font-bold text-slate-900">{totalItems}</span> kết quả
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
            canGoPrevious
              ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-[#1B5E38]'
              : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
          }`}
        >
          <CaretLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
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
                  ? 'border-[#1B5E38] bg-[#1B5E38] text-white shadow-md'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-[#1B5E38]'
              }`}
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
              ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-[#1B5E38]'
              : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
          }`}
        >
          <CaretRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
