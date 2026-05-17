/**
 * Loyalty Error State
 * 
 * Error state for the loyalty page when data fails to load.
 */

import { Warning } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";

interface LoyaltyErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function LoyaltyErrorState({ 
  message = "Đã xảy ra lỗi khi tải thông tin điểm thưởng. Vui lòng thử lại sau.",
  onRetry 
}: LoyaltyErrorStateProps) {
  return (
    <div className="min-h-screen bg-surface-0 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6">
              <Warning className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-foreground">Không thể tải thông tin</h3>
            <p className="text-sm text-muted leading-relaxed">
              {message}
            </p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="primary" size="lg">
              Thử lại
            </Button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
