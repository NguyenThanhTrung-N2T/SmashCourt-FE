import { ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ReportChartContainerProps {
    title: string;
    subtitle?: string;
    height?: number;
    children: ReactNode;
}

export function ReportChartContainer({
    title,
    subtitle,
    height = 350,
    children,
}: ReportChartContainerProps) {
    return (
        <div className="bg-surface-1 rounded-2xl border border-border p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-10">
                <h3 className="text-base font-extrabold text-foreground tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs font-medium text-muted mt-1">{subtitle}</p>}
            </div>
            <div style={{ width: '100%', height }}>
                <ResponsiveContainer>
                    {children as any}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
