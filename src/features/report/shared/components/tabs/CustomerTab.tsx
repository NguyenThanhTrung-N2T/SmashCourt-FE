import { Heart, UserPlus, Users, UsersFour, Trophy } from '@phosphor-icons/react';
import { Cell, Pie, PieChart, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ReportFilterDto } from '@/src/features/report/shared/report.types';
import { useCustomerStatisticsReport, useTopSpendersReport } from '@/src/features/report/shared/hooks/useReportHooks';
import { ReportStatsCard } from '@/src/features/report/shared/components/ReportStatsCard';
import { ReportChartContainer } from '@/src/features/report/shared/components/ReportCharts/ReportChartContainer';
import { ReportLoading, ReportError, ReportEmpty } from '@/src/features/report/shared/components/states';
import { formatDisplayPeriod } from '@/src/features/report/shared/utils/reportUtils';
import { clsx } from 'clsx';

interface CustomerTabProps {
    filter: ReportFilterDto;
}

const tierNameToColor: Record<string, string> = {
    'Bronze': '#B87333',
    'Silver': '#A8B2BD',
    'Gold': '#F4C542',
    'Platinum': '#6EC6CA',
    'Diamond': '#3B82F6',
}

export function CustomerTab({ filter }: CustomerTabProps) {
    const { data, loading, error, refetch } = useCustomerStatisticsReport(filter);
    const { data: spenderData, loading: loadingSpenders } = useTopSpendersReport({
        ...filter,
        pageSize: 10
    });

    if (loading) return <ReportLoading />;
    if (error) return <ReportError message={error} onRetry={refetch} />;
    if (!data) return <ReportEmpty />;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportStatsCard
                    label="Tổng khách hàng"
                    value={data.totalCustomers}
                    icon={Users}
                    isPrimary
                    sub="Người dùng hệ thống"
                />
                <ReportStatsCard
                    label="Khách hàng mới"
                    value={data.newCustomers}
                    icon={UserPlus}
                    sub="Gia nhập kỳ này"
                />
                <ReportStatsCard
                    label="Tỷ lệ quay lại"
                    value={`${(data.repeatCustomerRate).toFixed(1)}%`}
                    icon={Heart}
                    sub="Khách hàng trung thành"
                />
                <ReportStatsCard
                    label="Trung bình đơn/KH"
                    value={data.averageBookingsPerCustomer.toFixed(1)}
                    icon={UsersFour}
                    sub="Lượt đặt bình quân"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ReportChartContainer
                        title="Tăng trưởng khách hàng"
                        subtitle="Số lượng khách hàng mới gia nhập"
                    >
                        <LineChart data={data.acquisitionTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="period" axisLine={false} tickLine={false} tickFormatter={formatDisplayPeriod} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip formatter={(value: unknown) => [value, 'Khách hàng mới']} />
                            <Line type="monotone" dataKey="newCustomers" name="Khách hàng mới" stroke="var(--primary)" strokeWidth={3} />
                        </LineChart>
                    </ReportChartContainer>
                </div>

                <ReportChartContainer
                    title="Phân hạng thành viên"
                    subtitle="Phân bổ khách hàng theo hạng loyalty"
                >
                    <PieChart>
                        <Pie
                            data={data.loyaltyTierDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="customerCount"
                            nameKey="tierName"
                        >
                            {data.loyaltyTierDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={tierNameToColor[entry.tierName]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: unknown) => [value, 'Số lượng']} />
                        <Legend verticalAlign="bottom" />
                    </PieChart>
                </ReportChartContainer>
            </div>

            {/* Top Spenders Table */}
            <div className="bg-surface-1 rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Trophy className="text-yellow-500" size={24} weight="fill" />
                            Top khách hàng chi tiêu
                        </h3>
                        <p className="text-sm text-muted mt-1">10 khách hàng có tổng chi tiêu cao nhất trong kỳ</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/5">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted">Hạng</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted">Khách hàng</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted">Hạng thành viên</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted">Tổng chi tiêu</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted">Số lượt đặt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {spenderData?.items.map((spender, index) => (
                                <tr key={spender.customerId} className="hover:bg-muted/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className={clsx(
                                            "flex items-center justify-center w-8 h-8 rounded-full font-black text-sm",
                                            index === 0 ? "bg-yellow-100 text-yellow-700" :
                                                index === 1 ? "bg-slate-100 text-slate-700" :
                                                    index === 2 ? "bg-orange-100 text-orange-700" : "bg-muted/10 text-muted"
                                        )}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="font-bold text-foreground">{spender.fullName}</div>
                                                <div className="text-xs text-muted">{spender.email || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className="text-[9px] px-2 py-1 rounded-full font-black uppercase text-white whitespace-nowrap"
                                            style={{ backgroundColor: tierNameToColor[spender.loyaltyTier] || '#94a3b8' }}
                                        >
                                            {spender.loyaltyTier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-primary font-black text-right">
                                            {formatCurrency(spender.totalRevenue)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-1.5 bg-muted/20 px-2.5 py-1 rounded-full text-sm font-bold text-muted">
                                            {spender.bookingCount} lượt
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!spenderData || spenderData.items.length === 0) && !loadingSpenders && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted italic">
                                        Chưa có dữ liệu chi tiêu trong kỳ này
                                    </td>
                                </tr>
                            )}
                            {loadingSpenders && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center gap-2 text-muted">
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            Đang tải dữ liệu...
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
