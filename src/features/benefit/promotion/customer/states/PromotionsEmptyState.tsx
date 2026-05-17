/**
 * Promotions Empty State
 * 
 * Empty state when there are no active promotions.
 */

import { Tag } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import Link from "next/link";

export function PromotionsEmptyState() {
  return (
    <div className="min-h-screen bg-surface-0 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Tag className="h-16 w-16 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-foreground">Chưa có khuyến mãi</h3>
            <p className="text-sm text-muted leading-relaxed">
              Hiện tại chưa có chương trình khuyến mãi nào đang diễn ra. Hãy quay lại sau để không bỏ lỡ các ưu đãi hấp dẫn!
            </p>
          </div>
          <div className="space-y-4">
            <Link href="/bookings/new">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Đặt sân ngay
              </Button>
            </Link>
            <div className="rounded-lg border border-border bg-surface-1 p-4 text-left">
              <h4 className="font-semibold text-foreground mb-2 text-sm">Về chương trình khuyến mãi:</h4>
              <ul className="space-y-1.5 text-xs text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Các mã khuyến mãi sẽ được cập nhật thường xuyên</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Áp dụng mã khi đặt sân để nhận ưu đãi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Theo dõi trang này để không bỏ lỡ khuyến mãi</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
