/**
 * Transaction Empty State
 * 
 * Empty state when user has no transaction history.
 */

import { Receipt } from "@phosphor-icons/react";

export function TransactionEmptyState() {
  return (
    <div className="text-center py-12 space-y-4 rounded-xl border border-border bg-surface-1">
      <div className="flex justify-center">
        <div className="rounded-full bg-muted/20 p-4">
          <Receipt className="h-12 w-12 text-muted" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-foreground">Chưa có lần tích điểm nào</p>
        <p className="text-sm text-muted max-w-sm mx-auto">
          Bạn sẽ tích điểm khi đặt sân và đến chơi tại SmashCourt. Lịch sử tích điểm sẽ hiển thị tại đây.
        </p>
      </div>
    </div>
  );
}
