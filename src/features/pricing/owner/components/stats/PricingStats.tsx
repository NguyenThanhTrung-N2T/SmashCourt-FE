import type React from "react";

interface StatItem {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    val: number;
}

interface PricingStatsProps {
    stats: StatItem[];
}

export function PricingStats({ stats }: PricingStatsProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s) => (
                <div
                    key={s.label}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-surface-1 p-4 shadow-sm hover:shadow-md transition-all"
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <s.icon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-extrabold text-foreground leading-none">{s.val}</p>
                        <p className="mt-0.5 text-xs font-semibold text-muted">{s.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
