"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";

interface CustomerErrorStateProps {
    message: string;
    onRetry?: () => void;
}

export function CustomerErrorState({ message, onRetry }: CustomerErrorStateProps) {
    return (
        <div className="rounded-2xl border border-border bg-surface-1 shadow-sm py-20">
            <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                    <WarningCircle className="h-16 w-16 text-red-500" />
                </div>
                <p className="text-base font-bold text-foreground">Đã xảy ra lỗi</p>
                <p className="text-sm text-muted mt-2">{message}</p>
                {onRetry && (
                    <div className="mt-6">
                        <Button onClick={onRetry} variant="secondary">
                            Thử lại
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
