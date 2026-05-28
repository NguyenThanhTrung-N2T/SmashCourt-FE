import React from 'react';
import { ErrorState } from '@/src/shared/components/feedback';

interface DashboardErrorProps {
    message?: string;
    onRetry?: () => void;
}

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
    return (
        <div className="flex items-center justify-center min-h-[400px] w-full">
            <ErrorState
                message={message}
                onRetry={onRetry || (() => window.location.reload())}
            />
        </div>
    );
}
