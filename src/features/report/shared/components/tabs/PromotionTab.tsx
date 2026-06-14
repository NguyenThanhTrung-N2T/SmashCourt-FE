/* eslint-disable @typescript-eslint/no-explicit-any */
import { Gift, Percent, Ticket, TrendUp } from '@phosphor-icons/react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { ReportFilterDto } from '@/src/features/report/shared/report.types';
import { usePromotionEffectivenessReport } from '@/src/features/report/shared/hooks/useReportHooks';
import { ReportStatsCard } from '@/src/features/report/shared/components/ReportStatsCard';
import { ReportChartContainer } from '@/src/features/report/shared/components/ReportCharts/ReportChartContainer';
import { ReportLoading, ReportError, ReportEmpty } from '@/src/features/report/shared/components/states';
import { formatDisplayPeriod } from '@/src/features/report/shared/utils/reportUtils';

interface PromotionTabProps {
    filter: ReportFilterDto;
}

export function PromotionTab({ filter }: PromotionTabProps) {
    const { data, loading, error, refetch } = usePromotionEffectivenessReport(filter);

    if (loading) return <ReportLoading />;
    if (error) return <ReportError message={error} onRetry={refetch} />;
    if (!data || data.topPromotions.length === 0) return <ReportEmpty />;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportStatsCard
                    label="Tổng giảm giá"
                    value={formatCurrency(data.totalDiscountAmount)}
                    icon={Gift}
                    isPrimary
                    sub="Ngân sách KM đã dùng"
                />
                <ReportStatsCard
                    label="Lượt dùng KM"
                    value={data.totalPromotionUsage}
                    icon={Ticket}
                    sub="Lượt áp dụng mã"
                />
                <ReportStatsCard
                    label="Loyalty Point"
                    value={formatCurrency(data.averageDiscountPerUsage)}
                    icon={Percent}
                    sub="Điểm thưởng trung bình"
                />
                <ReportStatsCard
                    label="Tỷ lệ chuyển đổi"
                    value={`${(data.promotionConversionRate).toFixed(1)}%`}
                    icon={TrendUp}
                    sub="Lượt đặt có mã"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReportChartContainer
                    title="Xu hướng sử dụng khuyến mãi"
                    subtitle="Số lượng mã được áp dụng theo thời gian"
                >
                    <LineChart data={data.promotionTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="period" axisLine={false} tickLine={false} tickFormatter={formatDisplayPeriod} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value: any) => [value, 'Lượt dùng']} />
                        <Line type="monotone" dataKey="usageCount" name="Lượt dùng" stroke="var(--primary)" strokeWidth={3} />
                    </LineChart>
                </ReportChartContainer>

                <ReportChartContainer
                    title="Top khuyến mãi hiệu quả"
                    subtitle="Theo số lượng sử dụng"
                >
                    <BarChart data={data.topPromotions}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="promotionCode" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value: any) => [value, 'Lượt dùng']} />
                        <Bar dataKey="usageCount" name="Lượt dùng" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ReportChartContainer>
            </div>

            <div className="bg-surface-1 rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="p-6 border-bottom border-border">
                    <h3 className="text-lg font-bold text-foreground tracking-tight">Chi tiết hiệu quả khuyến mãi</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-2 border-y border-border">
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted">Mã KM</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted">Lượt dùng</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted">Tổng giảm</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted">D.thu sau giảm</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {data.topPromotions.map((item, idx) => (
                                <tr key={idx} className="hover:bg-surface-2 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-foreground">
                                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                                            {item.promotionCode}
                                        </span>
                                        <p className="mt-1 text-xs text-muted">{item.promotionName}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-foreground">{item.usageCount}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-red-500">{formatCurrency(item.totalDiscount)}</td>
                                    <td className="px-6 py-4 text-sm font-black text-foreground">{formatCurrency(item.revenueAfterDiscount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
