"use client";

import { useState } from "react";
import { Gift, Megaphone, Trophy } from "lucide-react";

import LoyaltyTierManager from "./LoyaltyTierManager";
import PromotionManager from "./PromotionManager";

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabId = "loyalty" | "promotion";

const TABS: {
  id: TabId;
  label: string;
  icon: React.ElementType;
  gradient: string;
  activeText: string;
  activeBorder: string;
  activeBg: string;
}[] = [
    {
      id: "loyalty",
      label: "Hạng thành viên",
      icon: Trophy,
      gradient: "from-amber-400 to-yellow-500",
      activeText: "text-amber-700",
      activeBorder: "border-amber-500",
      activeBg: "bg-amber-50",
    },
    {
      id: "promotion",
      label: "Khuyến mãi",
      icon: Megaphone,
      gradient: "from-fuchsia-500 to-violet-600",
      activeText: "text-fuchsia-700",
      activeBorder: "border-fuchsia-500",
      activeBg: "bg-fuchsia-50",
    },
  ];

// ─── Benefits Manager ─────────────────────────────────────────────────────────

export default function BenefitsManager() {
  const [activeTab, setActiveTab] = useState<TabId>("loyalty");

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] flex flex-col overflow-hidden w-full">
      {/* ── Tab Header ── */}
      <div className="shrink-0 px-8 pt-8 pb-0">
        {/* Title Row */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Ưu đãi
            </h1>
            <p className="text-xs text-slate-500">
              Quản lý hạng thành viên & chương trình khuyến mãi
            </p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5 w-fit">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ${isActive
                    ? `bg-white ${tab.activeText} shadow-md shadow-slate-200/50`
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                  }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${isActive
                      ? `bg-gradient-to-br ${tab.gradient} shadow-sm`
                      : "bg-slate-200/80"
                    }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 transition-colors ${isActive ? "text-white" : "text-slate-500"
                      }`}
                  />
                </div>
                {tab.label}
                {isActive && (
                  <span
                    className={`absolute -bottom-1.5 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r ${tab.gradient}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full p-8 pt-6">
        {activeTab === "loyalty" && <LoyaltyTierManager />}
        {activeTab === "promotion" && <PromotionManager />}
      </div>
    </div>
  );
}
