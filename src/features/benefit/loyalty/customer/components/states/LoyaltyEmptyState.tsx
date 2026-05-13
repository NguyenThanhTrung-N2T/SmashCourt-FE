/**
 * Loyalty Empty State
 * 
 * Empty state when user has no loyalty data yet.
 */

import { Trophy } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import Link from "next/link";

export function LoyaltyEmptyState() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Trophy className="h-16 w-16 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-foreground">Chưa có điểm thưởng</h3>
            <p className="text-sm text-muted leading-relaxed">
              Bạn chưa có điểm thưởng nào. Hãy đặt sân để bắt đầu tích điểm và nhận ưu đãi!
            </p>
          </div>
          <div className="space-y-4">
            <Link href="/bookings/new">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Đặt sân ngay
              </Button>
            </Link>
            <div className="rounded-lg border border-border bg-surface-1 p-4 text-left">
              <h4 className="font-semibold text-foreground mb-2 text-sm">Cách tích điểm:</h4>
              <ul className="space-y-1.5 text-xs text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Tích 1 điểm cho mỗi 1.000 VND chi tiêu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Điểm được cộng tự động khi hoàn thành đặt sân</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Giảm giá áp dụng tự động theo hạng thành viên</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
