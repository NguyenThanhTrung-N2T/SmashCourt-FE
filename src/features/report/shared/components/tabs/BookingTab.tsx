/* eslint-disable @typescript-eslint/no-explicit-any */
import { CalendarCheck, CalendarX, Clock, Users } from '@phosphor-icons/react';
import { Cell, Pie, PieChart, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ReportFilterDto } from '@/src/features/report/shared/report.types';
import { useBookingReport } from '@/src/features/report/shared/hooks/useReportHooks';
import { ReportStatsCard } from '@/src/features/report/shared/components/ReportStatsCard';
import { ReportChartContainer } from '@/src/features/report/shared/components/ReportCharts/ReportChartContainer';
import { ReportLoading, ReportError, ReportEmpty } from '@/src/features/report/shared/components/states';
import { formatDisplayPeriod } from '@/src/features/report/shared/utils/reportUtils';

interface BookingTabProps {
    filter: ReportFilterDto;
}

const COLORS = ['#1B5E38', '#F59E0B', '#EF4444', '#64748B'];

export function BookingTab({ filter }: BookingTabProps) {
    const { data, loading, error, refetch } = useBookingReport(filter);

    if (loading) return <ReportLoading />;
    if (error) return <ReportError message={error} onRetry={refetch} />;
    if (!data || data.items.length === 0) return <ReportEmpty />;

    const statusData = [
        { name: 'Hoàn thành', value: data.completed },
        { name: 'Chờ thanh toán', value: data.pendingPayment },
        { name: 'Đã hủy', value: data.cancelled },
        { name: 'Vắng mặt', value: data.noShow },
    ];

    const bookingSourceData = [
        { name: 'Online', value: data.onlineBookings },
        { name: 'Trực tiếp', value: data.walkInBookings },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportStatsCard
                    label="Tổng lượt đặt"
                    value={data.totalBookings}
                    icon={CalendarCheck}
                    isPrimary
                    sub="Tổng số trong kỳ"
                />
                <ReportStatsCard
                    label="Tỷ lệ hoàn thành"
                    value={`${((data.completed / data.totalBookings) * 100).toFixed(1)}%`}
                    icon={Users}
                    sub="Đã xong"
                />
                <ReportStatsCard
                    label="Tỷ lệ hủy"
                    value={`${(data.cancellationRate).toFixed(1)}%`}
                    icon={CalendarX}
                    trend={data.cancellationRate > 10 ? "down" : "neutral"}
                    sub="Đã hủy/Vắng mặt"
                />
                <ReportStatsCard
                    label="Vắng mặt"
                    value={data.noShow}
                    icon={Clock}
                    sub="Lượt No-show"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ReportChartContainer
                        title="Xu hướng đơn đặt sân"
                        subtitle="Số lượng đơn theo thời gian"
                    >
                        <BarChart data={data.items}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis
                                dataKey="period"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'var(--muted)' }}
                                tickFormatter={formatDisplayPeriod}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(value: any) => [value, 'Số lượng']} />
                            <Legend verticalAlign="top" align="right" />
                            <Bar dataKey="bookingCount" name="Tổng đơn" fill="#A7D7B8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="completedCount" name="Hoàn thành" fill="#1B5E38" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ReportChartContainer>
                </div>
 
                <ReportChartContainer
                    title="Trạng thái đơn hàng"
                    subtitle="Cơ cấu theo trạng thái xử lý"
                >
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [value, 'Lượt đặt']} />
                        <Legend verticalAlign="bottom" layout="horizontal" />
                    </PieChart>
                </ReportChartContainer>
            </div>
        </div>
    );
}
