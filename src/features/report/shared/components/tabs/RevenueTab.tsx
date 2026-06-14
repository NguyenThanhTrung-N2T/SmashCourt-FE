/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { CurrencyCircleDollar, Receipt, Tag, TrendUp } from '@phosphor-icons/react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { ReportFilterDto } from '@/src/features/report/shared/report.types';
import { useRevenueReport } from '@/src/features/report/shared/hooks/useReportHooks';
import { ReportStatsCard } from '@/src/features/report/shared/components/ReportStatsCard';
import { ReportChartContainer } from '@/src/features/report/shared/components/ReportCharts/ReportChartContainer';
import { ReportLoading, ReportError, ReportEmpty } from '@/src/features/report/shared/components/states';
import { formatDisplayPeriod } from '@/src/features/report/shared/utils/reportUtils';

interface RevenueTabProps {
    filter: ReportFilterDto;
}

export function RevenueTab({ filter }: RevenueTabProps) {
    const { data, loading, error, refetch } = useRevenueReport(filter);

    if (loading) return <ReportLoading />;
    if (error) return <ReportError message={error} onRetry={refetch} />;
    if (!data || data.items.length === 0) return <ReportEmpty />;

    // Format currency
    const formatValue = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportStatsCard
                    label="Tổng doanh thu"
                    value={formatValue(data.totalRevenue)}
                    icon={CurrencyCircleDollar}
                    isPrimary
                    trend="neutral"
                    sub="Hiện tại"
                />
                <ReportStatsCard
                    label="Doanh thu sân"
                    value={formatValue(data.courtRevenue)}
                    icon={Receipt}
                    sub="Từ đặt sân"
                />
                <ReportStatsCard
                    label="Doanh thu dịch vụ"
                    value={formatValue(data.serviceRevenue)}
                    icon={Tag}
                    sub="Từ Menu"
                />
                <ReportStatsCard
                    label="Trung bình/đơn"
                    value={formatValue(data.averageBookingValue)}
                    icon={TrendUp}
                    sub="Mỗi lượt đặt"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReportChartContainer
                    title="Xu hướng doanh thu"
                    subtitle={`Phân tích doanh thu theo ${filter.groupBy === 'day' ? 'ngày' : filter.groupBy === 'week' ? 'tuần' : 'tháng'}`}
                >
                    <LineChart data={data.items}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis
                            dataKey="period"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'var(--muted)', fontWeight: 600 }}
                            tickFormatter={formatDisplayPeriod}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'var(--muted)', fontWeight: 600 }}
                            tickFormatter={(val) => `${val / 1000000}M`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            formatter={(value: any) => [formatValue(Number(value)), 'Doanh thu']}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--primary)"
                            strokeWidth={4}
                            dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ReportChartContainer>

                <ReportChartContainer
                    title="Doanh thu & Số đơn đặt"
                    subtitle="Tương quan giữa doanh thu và lượng giao dịch"
                >
                    <BarChart data={data.items}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis
                            dataKey="period"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'var(--muted)', fontWeight: 600 }}
                            tickFormatter={formatDisplayPeriod}
                        />
                        <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'var(--muted)', fontWeight: 600 }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'var(--muted)', fontWeight: 600 }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            formatter={(value: any, name: any) => [
                                typeof value === 'number' && name === 'Doanh thu' ? formatValue(value) : value,
                                name
                            ]}
                        />
                        <Legend verticalAlign="top" align="right" />
                        <Bar yAxisId="left" dataKey="revenue" name="Doanh thu" fill="#A7D7B8" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="bookingCount" name="Số đơn" fill="#1B5E38" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ReportChartContainer>
            </div>

            <div className="bg-surface-1 rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="p-6 border-bottom border-border">
                    <h3 className="text-lg font-bold text-foreground tracking-tight">Chi tiết doanh thu</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-2 border-y border-border">
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted">Giai đoạn</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted">Doanh thu</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted">Số đơn đặt</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted">Trung bình/đơn</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {data.items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-surface-2 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-foreground">{formatDisplayPeriod(item.period)}</td>
                                    <td className="px-6 py-4 text-sm font-black text-primary">{formatValue(item.revenue)}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-foreground">{item.bookingCount}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-muted">
                                        {formatValue(item.revenue / (item.bookingCount || 1))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
