/**
 * Transaction List Component
 * 
 * Displays a list of loyalty point transactions.
 */

"use client";

import { ArrowUp, ArrowDown } from "@phosphor-icons/react";
import type { LoyaltyTransactionDto } from "@/src/features/benefit/loyalty/shared/types/loyalty.types";
import { formatPoints, getTransactionTypeLabel } from "../utils";
import { formatDate } from "@/src/shared/utils/date";
interface TransactionListProps {
  transactions: LoyaltyTransactionDto[];
}

export function TransactionList({ transactions }: TransactionListProps) {
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
              {tx.bookingCode && (
                <p className="text-xs text-muted">
                  Mã đặt sân: {tx.bookingCode}
                </p>
              )}
            </div>
          </div>

          {/* Points */}
          <div className="text-right space-y-1">
            <p className={`text-lg font-bold ${tx.type === "EARN"
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
