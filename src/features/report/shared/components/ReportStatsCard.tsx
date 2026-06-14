import React from 'react';
import { Icon as PhosphorIcon, ArrowUpRight, ArrowDownRight } from '@phosphor-icons/react';
import { clsx } from 'clsx';

interface ReportStatsCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    sub?: string;
    isPrimary?: boolean;
    className?: string;
}

export function ReportStatsCard({
    label,
    value,
    icon: Icon,
    trend,
    sub,
    isPrimary = false,
    className,
}: ReportStatsCardProps) {
    return (
        <div
            className={clsx(
                "relative rounded-2xl p-5 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden",
                isPrimary
                    ? "text-white"
                    : "bg-surface-1 border border-border text-foreground",
                className
            )}
            style={
                isPrimary
                    ? { background: "linear-gradient(145deg, #2D7A50 0%, #1B5E38 100%)" }
                    : {}
            }
        >
            <div className="flex items-start justify-between">
                <p
                    className={clsx(
                        "text-[10px] font-bold uppercase tracking-wider",
                        isPrimary ? "text-green-200" : "text-muted"
                    )}
                >
                    {label}
                </p>
                <div
                    className={clsx(
                        "flex h-6 w-6 items-center justify-center rounded-full border transition-colors flex-shrink-0",
                        isPrimary
                            ? "border-white/30 text-white"
                            : "border-border text-muted"
                    )}
                >
                    {trend === "up" ? (
                        <ArrowUpRight size={12} weight="bold" />
                    ) : trend === "down" ? (
                        <ArrowDownRight size={12} weight="bold" />
                    ) : (
                        <ArrowUpRight size={12} weight="bold" className="opacity-0" />
                    )}
                </div>
            </div>

            <p
                className={clsx(
                    "mt-2.5 text-[24px] font-bold tracking-tight leading-none",
                    isPrimary ? "text-white" : "text-foreground"
                )}
            >
                {value}
            </p>

            {sub && (
                <div className="mt-3 flex items-center gap-1.5">
                    {trend === "up" && (
                        <span
                            className={clsx(
                                "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold",
                                isPrimary ? "bg-white/20 text-white" : "bg-[#1B5E38]/10 text-[#1B5E38]"
                            )}
                        >
                            <ArrowUpRight size={10} weight="bold" />
                        </span>
                    )}
                    {trend === "down" && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                            <ArrowDownRight size={10} weight="bold" />
                        </span>
                    )}
                    <span
                        className={clsx(
                            "text-[11px] font-medium",
                            isPrimary ? "text-green-200/90" : "text-muted"
                        )}
                    >
                        {sub}
                    </span>
                </div>
            )}

            {isPrimary && Icon && (
                <Icon size={56} weight="thin" className="absolute right-3 bottom-3 text-white/10" />
            )}
        </div>
    );
}
