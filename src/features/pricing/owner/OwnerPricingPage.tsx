"use client";

import { useState } from "react";
import { PageHeader } from "@/src/shared/components/layout";
import { Toast } from "@/src/shared/components/ui";
import { useToast } from "@/src/shared/hooks/useToast";
import { PricingTabNav, PricingTabId } from "../shared/components/PricingTabNav";
import { SystemPricePage } from "../shared/pages/SystemPricePage";
import { BranchPricePage } from "../shared/pages/BranchPricePage";
import { AIPanelSection } from "@/src/features/ai/shared/components/AIPanelSection";
import { PricingSuggestionsPanel } from "@/src/features/ai/shared/components/PricingSuggestionsPanel";

export function OwnerPricingPage() {
    const [activeTab, setActiveTab] = useState<PricingTabId>("system");
    const { toast } = useToast();

    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            <PageHeader
                title="Bảng giá"
                description="Quản lý giá thuê sân theo loại và thời gian hiệu lực"
            />
            <PricingTabNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="min-h-[500px] bg-surface-1 rounded-2xl border border-border overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="p-8">
                    {activeTab === "system" && <SystemPricePage />}
                    {activeTab === "branches" && <BranchPricePage />}
                </div>
            </div>

            <Toast toast={toast} />

            {/* ── AI Pricing Suggestions (collapsible) ────────────── */}
            <AIPanelSection title="Gợi ý giá AI" accentClass="text-primary border-primary/40">
                <PricingSuggestionsPanel />
            </AIPanelSection>
        </div>
    );
}