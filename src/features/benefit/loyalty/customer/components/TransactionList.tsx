/**
 * Transaction List Component
 * 
 * Displays a list of loyalty point transactions.
 */

"use client";

import { ArrowUp, ArrowDown } from "@phosphor-icons/react";
import type { LoyaltyTransactionDto } from "@/src/shared/types/loyalty.types";
import { formatPoints, getTransactionTypeLabel } from "../utils";

interface TransactionListProps {
  transactions: LoyaltyTransactionDto[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Hôm nay";
    } else if (diffInDays === 1) {
      return "Hôm qua";
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div 
          key={tx.id} 
          className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface-1 hover:bg-surface-2 transition-colors"
        >
          <div className="flex items-center gap-4">
            {/* Icon */}
            {tx.type === "EARN" ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <ArrowUp className="h-5 w-5 text-green-600 dark:text-green-400" weight="bold" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <ArrowDown className="h-5 w-5 text-red-600 dark:text-red-400" weight="bold" />
              </div>
            )}
            
            {/* Transaction Info */}
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                {getTransactionTypeLabel(tx.type)}
              </p>
              <p className="text-sm text-muted">
                {formatDate(tx.createdAt)}
              </p>
              {tx.note && (
                <p className="text-xs text-muted italic">{tx.note}</p>
              )}
              {tx.bookingId && (
                <p className="text-xs text-muted">
                  Mã đặt sân: {tx.bookingId.slice(0, 8)}...
                </p>
              )}
            </div>
          </div>
          
          {/* Points */}
          <div className="text-right space-y-1">
            <p className={`text-lg font-bold ${
              tx.type === "EARN" 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            }`}>
              {tx.points > 0 ? "+" : ""}{formatPoints(tx.points)}
            </p>
            <p className="text-xs text-muted">
              Số dư: {formatPoints(tx.totalPointsAfter)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
