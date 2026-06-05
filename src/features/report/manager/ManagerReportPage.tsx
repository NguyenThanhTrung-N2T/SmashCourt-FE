"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportLayout, ReportTab } from '@/src/features/report/shared/components/ReportLayout';
import { ReportFilterDto } from '@/src/features/report/shared/report.types';
import { RevenueTab } from '@/src/features/report/shared/components/tabs/RevenueTab';
import { BookingTab } from '@/src/features/report/shared/components/tabs/BookingTab';
import { CourtUtilizationTab } from '@/src/features/report/shared/components/tabs/CourtUtilizationTab';
import { CustomerTab } from '@/src/features/report/shared/components/tabs/CustomerTab';
import { ServiceTab } from '@/src/features/report/shared/components/tabs/ServiceTab';
import { PromotionTab } from '@/src/features/report/shared/components/tabs/PromotionTab';
import { format, subDays } from 'date-fns';
import { AIPanelSection } from '@/src/features/ai/shared/components/AIPanelSection';
import { AnalyticsSummaryPanel } from '@/src/features/ai/shared/components/AnalyticsSummaryPanel';

export default function ManagerReportPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get('tab') as ReportTab) || 'revenue';

    const [activeTab, setActiveTab] = useState<ReportTab>(initialTab);
    const [filter, setFilter] = useState<ReportFilterDto>({
        fromDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        toDate: format(new Date(), 'yyyy-MM-dd'),
        groupBy: 'day',
        // branchId is omitted as it's auto-resolved by backend for managers
    });

    // Update URL when tab changes
    const handleTabChange = (tab: ReportTab) => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'revenue': return <RevenueTab filter={filter} />;
            case 'bookings': return <BookingTab filter={filter} />;
            case 'courts': return <CourtUtilizationTab filter={filter} />;
            case 'customers': return <CustomerTab filter={filter} />;
            case 'services': return <ServiceTab filter={filter} />;
            case 'promotions': return <PromotionTab filter={filter} />;
            default: return <RevenueTab filter={filter} />;
        }
    };

    return (
        <>
            <ReportLayout
                activeTab={activeTab}
                onTabChange={handleTabChange}
                filter={filter}
                onFilterChange={setFilter}
            >
                {renderTabContent()}
            </ReportLayout>

            {/* ── AI Analytics Summary (collapsible) ─────────────── */}
            <div className="px-6 pb-8">
                <AIPanelSection title="Phân tích tổng hợp - AI" accentClass="text-sky-500 border-sky-500/40">
                    <AnalyticsSummaryPanel />
                </AIPanelSection>
            </div>
        </>
    );
}
