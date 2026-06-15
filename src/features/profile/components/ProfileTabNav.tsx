/**
 * Profile Tab Navigation Component
 * 
 * Reusable tab navigation for profile sections.
 */

import { ElementType } from 'react';

export type ProfileTabId = 'info' | 'security' | 'sessions';

interface Tab {
  id: ProfileTabId;
  label: string;
  icon: ElementType;
}

interface ProfileTabNavProps {
  tabs: Tab[];
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
}

export function ProfileTabNav({ tabs, activeTab, onTabChange }: ProfileTabNavProps) {
  return (
    <div className="border-b border-border bg-surface-1">
      <nav className="flex gap-2 overflow-x-auto justify-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${isActive
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
