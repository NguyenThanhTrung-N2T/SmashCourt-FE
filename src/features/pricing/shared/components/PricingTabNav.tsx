import { ElementType } from 'react';
import { CurrencyCircleDollar, MapPin } from '@phosphor-icons/react';

export type PricingTabId = 'system' | 'branches';

interface Tab {
    id: PricingTabId;
    label: string;
    icon: ElementType;
}

export const PRICING_TABS: Tab[] = [
    { id: 'system', label: 'Bảng giá hệ thống', icon: CurrencyCircleDollar },
    { id: 'branches', label: 'Giá chi nhánh', icon: MapPin },
];

interface PricingTabNavProps {
    activeTab: PricingTabId;
    onTabChange: (tab: PricingTabId) => void;
}

export function PricingTabNav({ activeTab, onTabChange }: PricingTabNavProps) {
    return (
        <div className="border-b border-border bg-surface-1">
            <nav className="flex gap-2 overflow-x-auto custom-scrollbar">
                {PRICING_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all duration-200 ${isActive
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted hover:text-foreground hover:border-border'
                                }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse-subtle' : ''}`} weight={isActive ? "fill" : "regular"} />
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
