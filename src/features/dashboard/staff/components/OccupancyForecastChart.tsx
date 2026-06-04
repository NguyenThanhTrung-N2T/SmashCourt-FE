import React, { useState } from "react";
import { OccupancyForecastPointDto } from "@/src/features/report/shared/report.types";
import { getOccupancyColor } from "../utils/dashboard-helpers";

interface OccupancyForecastChartProps {
    data: OccupancyForecastPointDto[];
    height?: string;
}

export function OccupancyForecastChart({ data, height = "h-64" }: OccupancyForecastChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!data || data.length === 0) {
        return (
            <div className={`${height} flex items-center justify-center`}>
                <p className="text-sm font-medium text-slate-400">Không có dữ liệu dự báo</p>
            </div>
        );
    }

    const maxCourts = Math.max(...data.map(d => d.totalCourts), 1);
    const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;

    return (
        <div className={`${height} w-full flex flex-col`}>
            <div className="flex-1 relative" onMouseLeave={() => setHoveredIndex(null)}>
                {/* Tooltip */}
                {hoveredPoint && (
                    <div
                        className="absolute z-30 pointer-events-none transition-all duration-200"
                        style={{
                            left: `${((hoveredIndex! + 0.5) / data.length)}%`,
                            top: '10px',
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <div className="bg-surface-inverse text-inverse text-xs font-bold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-white/10">
                            <div className="space-y-1">
                                <div className="text-inverse/60 text-[10px] uppercase tracking-wider">
                                    {new Date(hoveredPoint.time).toLocaleTimeString('vi-VN', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-green-400">●</span>
                                    <span>Đang dùng: {hoveredPoint.occupiedCourts}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400">●</span>
                                    <span>Còn trống: {hoveredPoint.availableCourts}</span>
                                </div>
                                <div className="pt-1 border-t border-white/20">
                                    <span>Tỷ lệ: {hoveredPoint.occupancyRate > 1 
                                        ? Math.round(hoveredPoint.occupancyRate) 
                                        : Math.round(hoveredPoint.occupancyRate * 100)}%</span>
                                </div>
                                {hoveredPoint.isPeakRisk && (
                                    <div className="text-amber-400 text-[10px]">
                                        ⚠️ Cao điểm
                                    </div>
                                )}
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-surface-inverse" />
                        </div>
                    </div>
                )}

                {/* Chart */}
                <div className="h-full flex items-end gap-1 px-2">
                    {data.map((point, index) => {
                        // Calculate heights as percentage of total courts
                        const occupiedHeight = (point.occupiedCourts / maxCourts) * 100;
                        const availableHeight = (point.availableCourts / maxCourts) * 100;
                        const totalHeight = occupiedHeight + availableHeight;
                        
                        const isHovered = hoveredIndex === index;
                        const occupancyColor = getOccupancyColor(point.occupancyRate);

                        return (
                            <div
                                key={index}
                                className="flex-1 flex flex-col justify-end cursor-pointer transition-all duration-200"
                                style={{ 
                                    height: '100%',
                                    opacity: isHovered ? 1 : 0.85,
                                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                }}
                                onMouseEnter={() => setHoveredIndex(index)}
                            >
                                {/* Single stacked bar container */}
                                <div 
                                    className="w-full flex flex-col-reverse rounded-t overflow-hidden transition-all duration-300"
                                    style={{
                                        height: `${totalHeight}%`,
                                        minHeight: totalHeight > 0 ? '12px' : '0',
                                    }}
                                >
                                    {/* Occupied Courts (bottom part - green) */}
                                    {occupiedHeight > 0 && (
                                        <div
                                            className="w-full relative transition-all duration-300"
                                            style={{
                                                flex: occupiedHeight,
                                                backgroundColor: occupancyColor,
                                            }}
                                        >
                                            {/* Peak Risk Indicator */}
                                            {point.isPeakRisk && (
                                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                                    <span className="text-xs">⚠️</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Available Courts (top part - gray) */}
                                    {availableHeight > 0 && (
                                        <div
                                            className="w-full transition-all duration-300"
                                            style={{
                                                flex: availableHeight,
                                                backgroundColor: '#E2E8F0',
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Time Labels */}
            <div className="flex justify-between mt-3 px-2">
                {data.map((point, index) => {
                    // Show every label for 8 or fewer points, otherwise show every other
                    const shouldShow = data.length <= 8 || index % 2 === 0;
                    if (!shouldShow) return <div key={index} className="flex-1" />;

                    const time = new Date(point.time);
                    console.log(time);
                    const label = time.toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });

                    return (
                        <div key={index} className="flex-1 text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: '#16A34A' }} />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Đang dùng (thấp)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: '#F59E0B' }} />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Đang dùng (trung bình)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: '#DC2626' }} />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Đang dùng (cao)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-slate-300 dark:bg-slate-600" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Còn trống</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs">⚠️</span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Cao điểm</span>
                </div>
            </div>
        </div>
    );
}
