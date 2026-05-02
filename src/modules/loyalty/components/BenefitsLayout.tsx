"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Megaphone,
  Trophy,
} from "@phosphor-icons/react";
import { ReactNode } from "react";

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  {
    id: "loyalty",
    href: "/owner/benefits/loyalty",
    label: "Hạng thành viên",
    icon: Trophy,
  },
  {
    id: "promotion",
    href: "/owner/benefits/promotion",
    label: "Khuyến mãi",
    icon: Megaphone,
  },
];

// ─── Benefits Layout ─────────────────────────────────────────────────────────

export default function BenefitsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] flex flex-col overflow-hidden w-full">
      {/* ── Tab Bar ── */}
      <div className="shrink-0 px-8 pt-6 pb-2">
        <div className="flex items-center gap-1 rounded-2xl border border-border bg-surface-2 p-1 w-fit">
          {TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`relative inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-surface-1 text-primary shadow-md shadow-border/50"
                    : "text-muted hover:text-foreground hover:bg-surface-1/50"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                    isActive ? "bg-primary shadow-sm" : "bg-surface-3"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 transition-colors ${
                      isActive ? "text-inverse" : "text-muted"
                    }`}
                  />
                </div>
                {tab.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Page Content ── */}
      <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full px-8 pt-4 pb-10">
        {children}
      </div>
    </div>
  );
}
