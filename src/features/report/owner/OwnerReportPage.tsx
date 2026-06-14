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
import { BranchSelector } from '@/src/shared/components/layout/BranchSelector';
import { useReportBranches } from '@/src/features/report/shared/hooks/useReportBranches';
import { format, subDays } from 'date-fns';
import { AIPanelSection } from '@/src/features/ai/shared/components/AIPanelSection';
import { AnalyticsSummaryPanel } from '@/src/features/ai/shared/components/AnalyticsSummaryPanel';

export default function OwnerReportPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get('tab') as ReportTab) || 'revenue';

    const [activeTab, setActiveTab] = useState<ReportTab>(initialTab);
    const [filter, setFilter] = useState<ReportFilterDto>({
        fromDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        toDate: format(new Date(), 'yyyy-MM-dd'),
        groupBy: 'day',
        branchId: '',
    });

    // Update URL when tab changes
    const handleTabChange = (tab: ReportTab) => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const { branches, loading: loadingBranches } = useReportBranches();

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
                branchSelector={
                    <BranchSelector
                        branches={[
                            { id: '', name: 'Tất cả chi nhánh' },
                            ...branches.map(b => ({ id: b.id, name: b.name }))
                        ]}
                        selectedBranchId={filter.branchId || ''}
                        onBranchChange={(id) => setFilter({ ...filter, branchId: id })}
                        label="Chi nhánh"
                        showCard={false}
                    />
                }
            >
                {renderTabContent()}
            </ReportLayout>

            {/* ── AI Panels (collapsible) ────────────────────────── */}
            <div className="px-6 pb-8 space-y-4">
                {/* Analytics Summary — for all managers/owners */}
                <AIPanelSection title="Phân tích tổng hợp - AI" accentClass="text-sky-500 border-sky-500/40">
                    <AnalyticsSummaryPanel branchId={filter.branchId || undefined} />
                </AIPanelSection>
            </div>
        </>
    );
}
