/**
 * Loyalty Page Content Component
 * 
 * Main content for the loyalty page with tier info and transaction history.
 */

"use client";

import { useMyLoyalty, useMyLoyaltyTransactions } from "../hooks/useLoyalty";
import { LoyaltyProgress } from "./LoyaltyProgress";
import { TransactionList } from "./TransactionList";
import { Button } from "@/src/shared/components/ui/Button";
import { Receipt } from "@phosphor-icons/react";
import {
  LoyaltyPageLoading,
  LoyaltyErrorState,
  TransactionListLoading,
  TransactionEmptyState
} from "./states";

export function LoyaltyPageContent() {
  const { data: loyalty, isLoading: loyaltyLoading, error: loyaltyError, refetch: refetchLoyalty } = useMyLoyalty();
  const {
    data: transactions,
    isLoading: txLoading,
    error: txError,
    updateQuery,
    query
  } = useMyLoyaltyTransactions({ page: 1, pageSize: 10 });

  const handlePageChange = (newPage: number) => {
    updateQuery({ page: newPage });
  };

  // Loading state
  if (loyaltyLoading) {
    return <LoyaltyPageLoading />;
  }

  // Error state
  if (loyaltyError || !loyalty) {
    return (
      <LoyaltyErrorState
        message={loyaltyError || "Đã xảy ra lỗi khi tải thông tin điểm thưởng. Vui lòng thử lại sau."}
        onRetry={refetchLoyalty}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Điểm thưởng</h1>
          <p className="mt-2 text-sm text-muted">
            Tích điểm và nhận ưu đãi khi đặt sân tại SmashCourt
          </p>
        </div>

        {/* Loyalty Info Card */}
        <LoyaltyProgress loyalty={loyalty} />

        {/* Transaction History Section */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3">
            <Receipt className="h-6 w-6 text-foreground" />
            <h2 className="text-xl font-semibold text-foreground">Lịch sử tích điểm</h2>
          </div>

          {txLoading ? (
            <TransactionListLoading />
          ) : txError ? (
            <div className="text-center py-12 space-y-3 rounded-xl border border-red-500/30 bg-red-500/5">
              <p className="text-sm text-red-600 dark:text-red-400">{txError}</p>
              <Button onClick={() => window.location.reload()} variant="secondary" size="sm">
                Thử lại
              </Button>
            </div>
          ) : transactions && transactions.items.length > 0 ? (
            <>
              <TransactionList transactions={transactions.items} />

              {/* Pagination */}
              {transactions.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    onClick={() => handlePageChange((query.page || 1) - 1)}
                    disabled={!transactions.hasPrev}
                    variant="secondary"
                    size="sm"
                  >
                    Trang trước
                  </Button>
                  <span className="text-sm text-muted px-4">
                    Trang {transactions.page} / {transactions.totalPages}
                  </span>
                  <Button
                    onClick={() => handlePageChange((query.page || 1) + 1)}
                    disabled={!transactions.hasNext}
                    variant="secondary"
                    size="sm"
                  >
                    Trang sau
                  </Button>
                </div>
              )}
            </>
          ) : (
            <TransactionEmptyState />
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 rounded-lg border border-border bg-surface-1 p-6 space-y-3">
          <h3 className="font-semibold text-foreground">Cách tích điểm</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Tích 1 điểm cho mỗi 1.000 VND chi tiêu (chỉ tính tiền sân).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Điểm được cộng tự động khi hoàn thành việc đặt sân và đến chơi.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Giảm giá áp dụng tự động theo hạng thành viên.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Điểm sẽ được trừ tương ứng khi hoàn tiền.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
