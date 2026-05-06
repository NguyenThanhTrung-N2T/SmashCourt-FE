import { ElementType } from 'react';

type TabId = 'info' | 'manager' | 'staff' | 'courts';

interface Tab {
    id: TabId;
    label: string;
    icon: ElementType;
}

interface BranchTabNavProps {
    tabs: Tab[];
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function BranchTabNav({ tabs, activeTab, onTabChange }: BranchTabNavProps) {
    return (
        <div className="border-b border-border bg-surface-1 border-1">
            <nav className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                                isActive
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted hover:text-foreground hover:border-border'
                            }`}
                        >
                            <Icon className="h-5 w-5" />
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
