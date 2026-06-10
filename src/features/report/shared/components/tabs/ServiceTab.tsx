/* eslint-disable @typescript-eslint/no-explicit-any */
import { Coffee, Package, ShoppingCartSimple, Star } from '@phosphor-icons/react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import { ReportFilterDto } from '@/src/features/report/shared/report.types';
import { useServicePerformanceReport } from '@/src/features/report/shared/hooks/useReportHooks';
import { ReportStatsCard } from '@/src/features/report/shared/components/ReportStatsCard';
import { ReportChartContainer } from '@/src/features/report/shared/components/ReportCharts/ReportChartContainer';
import { ReportLoading, ReportError, ReportEmpty } from '@/src/features/report/shared/components/states';

interface ServiceTabProps {
    filter: ReportFilterDto;
}

const COLORS = ['#1B5E38', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

export function ServiceTab({ filter }: ServiceTabProps) {
    const { data, loading, error, refetch } = useServicePerformanceReport(filter);

    if (loading) return <ReportLoading />;
    if (error) return <ReportError message={error} onRetry={refetch} />;
    if (!data || data.topServices.length === 0) return <ReportEmpty />;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportStatsCard
                    label="Doanh thu dịch vụ"
                    value={formatCurrency(data.totalServiceRevenue)}
                    icon={ShoppingCartSimple}
                    isPrimary
                    sub="Doanh thu từ Menu"
                />
                <ReportStatsCard
                    label="Số đơn kèm d.vụ"
                    value={data.totalBookingsWithServices}
                    icon={Package}
                    sub="Lượt đặt có dịch vụ"
                />
                <ReportStatsCard
                    label="Tỷ lệ kèm d.vụ"
                    value={`${(data.serviceAttachmentRate).toFixed(1)}%`}
                    icon={Star}
                    sub="Lượt đặt gắn kèm d.vụ"
                />
                <ReportStatsCard
                    label="Dịch vụ Hot nhất"
                    value={data.topServices[0]?.serviceName || 'N/A'}
                    icon={Coffee}
                    sub="Bán chạy nhất kỳ này"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReportChartContainer
                    title="Top dịch vụ theo doanh thu"
                    subtitle="Các dịch vụ đóng góp doanh thu lớn nhất"
                >
                    <BarChart data={data.topServices} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                        <XAxis type="number" tickFormatter={(val) => `${val / 1000}k`} />
                        <YAxis dataKey="serviceName" type="category" width={120} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Doanh thu']} />
                        <Bar dataKey="revenue" name="Doanh thu" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ReportChartContainer>

                <ReportChartContainer
                    title="Cơ cấu doanh thu dịch vụ"
                    subtitle="Tỷ trọng doanh thu giữa các loại dịch vụ"
                >
                    <PieChart>
                        <Pie
                            data={data.topServices}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="revenue"
                            nameKey="serviceName"
                        >
                            {data.topServices.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Doanh thu']} />
                        <Legend verticalAlign="bottom" />
                    </PieChart>
                </ReportChartContainer>
            </div>
        </div>
    );
}
