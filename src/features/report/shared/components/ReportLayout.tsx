import { ReactNode, useState, useEffect, ElementType } from 'react';
import { clsx } from 'clsx';
import {
    Calendar,
    Funnel,
    MagnifyingGlass,
    Coffee,
    ChartLineUp,
    Users,
    Tag,
    Ticket,
    PingPong,
} from '@phosphor-icons/react';
import { Select } from '@/src/shared/components/ui/Select';
import { PageHeader } from '@/src/shared/components/layout';
import { ReportFilterDto } from '../report.types';
import { format, subDays } from 'date-fns';

export type ReportTab = 'revenue' | 'bookings' | 'courts' | 'customers' | 'services' | 'promotions';

interface TabConfig {
    id: ReportTab;
    label: string;
    icon: ElementType;
}

interface ReportLayoutProps {
    activeTab: ReportTab;
    onTabChange: (tab: ReportTab) => void;
    filter: ReportFilterDto;
    onFilterChange: (filter: ReportFilterDto) => void;
    branchSelector?: ReactNode;
    children: ReactNode;
}

const TABS: TabConfig[] = [
    { id: 'revenue', label: 'Doanh thu', icon: ChartLineUp },
    { id: 'bookings', label: 'Đặt sân', icon: Calendar },
    { id: 'courts', label: 'Sử dụng sân', icon: PingPong },
    { id: 'customers', label: 'Khách hàng', icon: Users },
    { id: 'services', label: 'Dịch vụ', icon: Coffee },
    { id: 'promotions', label: 'Khuyến mãi', icon: Ticket },
];

export function ReportLayout({
    activeTab,
    onTabChange,
    filter,
    onFilterChange,
    branchSelector,
    children,
}: ReportLayoutProps) {

    const handleDateChange = (type: 'fromDate' | 'toDate', value: string) => {
        onFilterChange({ ...filter, [type]: value });
    };

    const handleGroupByChange = (value: string) => {
        onFilterChange({ ...filter, groupBy: value as any });
    };

    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            {/* Header */}
            <PageHeader
                title="Báo cáo & Phân tích"
                description="Theo dõi hiệu quả hoạt động kinh doanh và hiệu suất hệ thống"
                action={branchSelector}
            />

            {/* Navigation & Filters */}
            <div className="flex flex-col gap-4">
                {/* Modern Tabs Navigation - Matching BranchTabNav style */}
                <div className="border-b border-border bg-surface-1 rounded-2xl overflow-hidden shadow-sm border">
                    <nav className="flex overflow-x-auto custom-scrollbar">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${isActive
                                        ? 'border-primary text-primary bg-primary/5'
                                        : 'border-transparent text-muted hover:text-foreground hover:bg-surface-2'
                                        }`}
                                >
                                    <Icon size={20} weight={isActive ? "fill" : "bold"} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Filter Bar */}
                <div className="bg-surface-1 rounded-2xl border border-border p-4 shadow-sm flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Từ ngày</label>
                            <input
                                type="date"
                                value={filter.fromDate || ''}
                                onChange={(e) => handleDateChange('fromDate', e.target.value)}
                                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-bold text-foreground outline-none transition-all hover:border-primary focus:border-primary focus:bg-surface-1 focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Đến ngày</label>
                            <input
                                type="date"
                                value={filter.toDate || ''}
                                onChange={(e) => handleDateChange('toDate', e.target.value)}
                                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-bold text-foreground outline-none transition-all hover:border-primary focus:border-primary focus:bg-surface-1 focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Nhóm theo</label>
                            <Select
                                value={filter.groupBy || 'day'}
                                onChange={handleGroupByChange}
                                className="!py-2.5"
                            >
                                <option value="day">Theo Ngày</option>
                                <option value="week">Theo Tuần</option>
                                <option value="month">Theo Tháng</option>
                                <option value="dayOfWeek">Theo Thứ</option>
                                <option value="hour">Theo Giờ</option>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div className="animate-slide-up">
                {children}
            </div>
        </div>
    );
}
