"use client";

import { useState } from "react";
import { PageHeader } from "@/src/shared/components/layout/PageHeader";
import { Toast } from "@/src/shared/components/ui";
import { useToast } from "@/src/shared/hooks/useToast";
import { PricingTabNav, PricingTabId } from "../shared/components/PricingTabNav";
import { SystemPricePage } from "../shared/pages/SystemPricePage";
import { BranchPricePage } from "../shared/pages/BranchPricePage";

export function StaffPricingPage() {
    const [activeTab, setActiveTab] = useState<PricingTabId>("system");
    const { toast } = useToast();

    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            <PageHeader
                title="Bảng giá"
                description="Xem bảng giá hệ thống và chi nhánh"
            />

            <PricingTabNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="min-h-[500px] bg-surface-1 rounded-2xl border border-border overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="p-8">
                    {activeTab === "system" && <SystemPricePage readOnly={true} />}
                    {activeTab === "branches" && <BranchPricePage role="staff" />}
                </div>
            </div>

            <Toast toast={toast} />
        </div>
    );
}
