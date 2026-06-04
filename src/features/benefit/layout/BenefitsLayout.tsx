"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy,
  Ticket
} from "@phosphor-icons/react";
import { ReactNode } from "react";

// ─── Benefits Layout ─────────────────────────────────────────────────────────

export default function BenefitsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Resolve base segment (owner, manager, staff)
  const segments = pathname.split("/");
  const role = segments[1] || "owner";

  const TABS = [
    {
      id: "promotion",
      href: `/${role}/benefits/promotions`,
      label: "Khuyến mãi",
      icon: Ticket,
    },
    {
      id: "loyalty",
      href: `/${role}/benefits/loyalty`,
      label: "Hạng thành viên",
      icon: Trophy,
    }
  ];

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] flex flex-col overflow-hidden w-full">
      {/* ── Tab Bar ── */}
      <div className="border-b border-border bg-surface-1">
        <nav className="flex gap-2 overflow-x-auto custom-scrollbar px-8">
          {TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground hover:border-border"
                  }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Page Content ── */}
      <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full px-8 pt-4 pb-10">
        {children}
      </div>
    </div>
  );
}
