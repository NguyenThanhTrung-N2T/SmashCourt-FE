import { Clock, Lightning, MapPin, CalendarCheck } from '@phosphor-icons/react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { ReportFilterDto } from '@/src/features/report/shared/report.types';
import { useCourtUtilizationReport } from '@/src/features/report/shared/hooks/useReportHooks';
import { ReportStatsCard } from '@/src/features/report/shared/components/ReportStatsCard';
import { ReportChartContainer } from '@/src/features/report/shared/components/ReportCharts/ReportChartContainer';
import { ReportLoading, ReportError, ReportEmpty } from '@/src/features/report/shared/components/states';

interface CourtUtilizationTabProps {
    filter: ReportFilterDto;
}

export function CourtUtilizationTab({ filter }: CourtUtilizationTabProps) {
    const { data, loading, error, refetch } = useCourtUtilizationReport(filter);

    if (loading) return <ReportLoading />;
    if (error) return <ReportError message={error} onRetry={refetch} />;
    if (!data || data.items.length === 0) return <ReportEmpty />;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportStatsCard
                    label="Tỷ lệ lấp đầy"
                    value={`${(data.overallOccupancyRate).toFixed(1)}%`}
                    icon={Lightning}
                    isPrimary
                    sub="Hiệu suất sử dụng"
                />
                <ReportStatsCard
                    label="Tổng giờ mở"
                    value={`${data.totalAvailableHours}h`}
                    icon={Clock}
                    sub="Thời gian kinh doanh"
                />
                <ReportStatsCard
                    label="Tổng giờ đặt"
                    value={`${data.totalBookedHours}h`}
                    icon={CalendarCheck}
                    sub="Thời gian đã đặt"
                />
                <ReportStatsCard
                    label="Sân hiệu quả nhất"
                    value={data.topCourts[0]?.courtName || 'N/A'}
                    icon={MapPin}
                    sub="Tỷ lệ lấp đầy cao nhất"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReportChartContainer
                    title="Tỷ lệ sử dụng theo khung giờ"
                    subtitle="Xác định giờ cao điểm và thấp điểm"
                >
                    <AreaChart data={data.peakHours}>
                        <defs>
                            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="hour" tickFormatter={(h) => `${h}h`} />
                        <YAxis tickFormatter={(val) => `${val.toFixed(0)}%`} />
                        <Tooltip formatter={(value: unknown) => [`${Number(value).toFixed(1)}%`, 'Tỷ lệ lấp đầy']} />
                        <Area
                            type="monotone"
                            dataKey="occupancyRate"
                            stroke="var(--primary)"
                            fillOpacity={1}
                            fill="url(#colorRate)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ReportChartContainer>

                <ReportChartContainer
                    title="Hiệu suất theo sân"
                    subtitle="So sánh tỷ lệ lấp đầy giữa các sân"
                >
                    <BarChart data={data.topCourts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                        <XAxis type="number" tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                        <YAxis dataKey="courtName" type="category" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: unknown) => [`${(Number(value) * 100).toFixed(1)}%`, 'Tỷ lệ lấp đầy']} />
                        <Bar dataKey="occupancyRate" name="Tỷ lệ lấp đầy" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ReportChartContainer>
            </div>
        </div>
    );
}
