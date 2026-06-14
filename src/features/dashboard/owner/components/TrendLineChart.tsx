import React, { useState } from "react";

interface TrendLineChartProps {
    data: number[];
    labels: string[];
    height?: string;
    color?: string;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
    data,
    labels,
    height = "h-48",
    color = "#1D9E75",
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!data || data.length < 1) return null;

    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;

    const paddingY = 15;
    const chartHeight = 100 - paddingY * 2;

    const isSinglePoint = data.length === 1;

    const getY = (v: number) => {
        return 100 - paddingY - ((v - min) / range) * chartHeight;
    };

    const getX = (i: number) => {
        if (isSinglePoint) return 50;
        return (i / (data.length - 1)) * 100;
    };

    const points = data.map((v, i) => ({
        x: getX(i),
        y: getY(v),
        value: v,
        label: labels[i],
    }));

    // Smooth cubic bezier line
    let pathD = `M ${points[0].x} ${points[0].y}`;

    if (!isSinglePoint) {
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];

            const cp1x = p0.x + (p1.x - p0.x) / 3;
            const cp2x = p0.x + ((p1.x - p0.x) * 2) / 3;

            pathD += ` C ${cp1x} ${p0.y}, ${cp2x} ${p1.y}, ${p1.x} ${p1.y}`;
        }
    }

    const fillPathD = !isSinglePoint
        ? `${pathD} L 100 100 L 0 100 Z`
        : "";

    const hoveredPoint =
        hoveredIndex !== null ? points[hoveredIndex] : null;

    const tooltipBelow =
        hoveredPoint && hoveredPoint.y < 20;

    return (
        <div className={`${height} w-full flex flex-col`}>
            <div
                className="flex-1 relative rounded-xl"
                onMouseLeave={() => setHoveredIndex(null)}
            >
                {/* Tooltip */}
                {hoveredPoint && (
                    <div
                        className="absolute z-30 pointer-events-none transition-all duration-200 ease-out will-change-transform"
                        style={{
                            left: `${hoveredPoint.x}%`,
                            top: `${hoveredPoint.y}%`,
                            transform: tooltipBelow
                                ? "translate(-50%, 12px)"
                                : "translate(-50%, -115%)",
                        }}
                    >
                        <div className="bg-surface-inverse text-inverse text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-white/10">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-inverse/60 text-[8px] uppercase tracking-wider">
                                    {hoveredPoint.label}
                                </span>

                                <span>
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(hoveredPoint.value)}
                                </span>
                            </div>

                            {!tooltipBelow && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-surface-inverse" />
                            )}

                            {tooltipBelow && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-b-surface-inverse" />
                            )}
                        </div>
                    </div>
                )}

                {/* Single Point UI */}
                {isSinglePoint && (
                    <>
                        {/* Hint */}
                        <div className="absolute inset-x-0 top-6 flex justify-center pointer-events-none z-10">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 opacity-60">
                                Chưa đủ dữ liệu xu hướng
                            </span>
                        </div>

                        {/* Dot */}
                        <div
                            className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                            style={{
                                left: `${points[0].x}%`,
                                top: `${points[0].y}%`,
                            }}
                        >
                            {/* Pulse */}
                            <div
                                className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-30"
                                style={{ backgroundColor: color }}
                            />

                            {/* Main Dot */}
                            <div
                                className="relative w-3 h-3 rounded-full border-2 border-white shadow-lg"
                                style={{ backgroundColor: color }}
                            />
                        </div>
                    </>
                )}

                {/* Hover Marker */}
                {hoveredPoint && !isSinglePoint && (
                    <div
                        className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-out"
                        style={{
                            left: `${hoveredPoint.x}%`,
                            top: `${hoveredPoint.y}%`,
                        }}
                    >
                        <div
                            className="w-3 h-3 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: color }}
                        />
                    </div>
                )}

                {/* CHART LAYER */}
                <div className="absolute inset-0 overflow-hidden rounded-xl bg-slate-50/30 dark:bg-slate-900/10">
                    <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="w-full h-full"
                        style={{ display: "block" }}
                    >
                        <defs>
                            <linearGradient
                                id="chartLineGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor={color}
                                    stopOpacity="0.25"
                                />
                                <stop
                                    offset="100%"
                                    stopColor={color}
                                    stopOpacity="0"
                                />
                            </linearGradient>
                        </defs>

                        {/* Grid */}
                        {[20, 40, 60, 80].map((line) => (
                            <line
                                key={line}
                                x1="0"
                                y1={line}
                                x2="100"
                                y2={line}
                                stroke="currentColor"
                                className="text-slate-100 dark:text-slate-800/60"
                                strokeWidth="0.5"
                            />
                        ))}

                        {/* Area */}
                        {!isSinglePoint && (
                            <path
                                d={fillPathD}
                                fill="url(#chartLineGradient)"
                            />
                        )}

                        {/* Hover Reference */}
                        {hoveredPoint && (
                            <line
                                x1={hoveredPoint.x}
                                y1="0"
                                x2={hoveredPoint.x}
                                y2="100"
                                stroke={color}
                                strokeWidth="0.5"
                                strokeDasharray="2,2"
                                className="opacity-50"
                            />
                        )}

                        {/* Main Line */}
                        {!isSinglePoint && (
                            <path
                                d={pathD}
                                fill="none"
                                stroke={color}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                                className="transition-all duration-700"
                            />
                        )}

                        {/* Hover Areas */}
                        {points.map((p, i) => {
                            const width = !isSinglePoint
                                ? 100 / (data.length - 1)
                                : 100;

                            const x = !isSinglePoint
                                ? p.x - width / 2
                                : 0;

                            return (
                                <rect
                                    key={i}
                                    x={x}
                                    y="0"
                                    width={width}
                                    height="100"
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() =>
                                        setHoveredIndex(i)
                                    }
                                />
                            );
                        })}
                    </svg>
                </div>
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-3 px-1">
                {labels.map((label, i) => (
                    <span
                        key={i}
                        className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500"
                    >
                        {label}
                    </span>
                ))}
            </div>
        </div>
    );
};