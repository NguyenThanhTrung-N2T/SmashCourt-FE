"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpenText,
  Home,
  PhoneCall,
  TimerReset,
} from "lucide-react";

type TabId = "home" | "about" | "cancellation-policy";

type TabConfig = {
  id: TabId;
  href: string;
  label: string;
  icon: React.ElementType;
};

const TABS: TabConfig[] = [
  { id: "home", href: "/", label: "Trang chủ", icon: Home },
  { id: "about", href: "/about", label: "Giới thiệu", icon: BookOpenText },
  {
    id: "cancellation-policy",
    href: "/cancellation-policy",
    label: "Chính sách",
    icon: TimerReset,
  },
];

export default function PublicInfoHeader() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<Record<TabId, HTMLAnchorElement | null>>({
    home: null,
    about: null,
    "cancellation-policy": null,
  });
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });

  const activeTab = useMemo<TabId>(() => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/cancellation-policy"))
      return "cancellation-policy";
    return "about";
  }, [pathname]);

  useEffect(() => {
    function updateIndicator() {
      const container = containerRef.current;
      const activeLink = linkRefs.current[activeTab];
      if (!container || !activeLink) return;

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeLink.getBoundingClientRect();

      setIndicatorStyle({
        width: activeRect.width,
        left: activeRect.left - containerRect.left,
      });
    }

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/70 bg-white/82 px-4 py-3 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-slate-950 transition-colors hover:text-emerald-600"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-black tracking-tight">SmashCourt</p>
              </div>
            </Link>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex justify-center lg:justify-start">
                <div
                  ref={containerRef}
                  className="relative inline-flex rounded-full border border-slate-200 bg-slate-100/90 p-1 shadow-inner"
                >
                  <div
                    className="absolute bottom-1 top-1 rounded-full bg-slate-950 shadow-lg transition-all duration-300 ease-out"
                    style={{
                      width: `${indicatorStyle.width}px`,
                      transform: `translateX(${indicatorStyle.left}px)`,
                    }}
                  />
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <Link
                        key={tab.id}
                        href={tab.href}
                        ref={(node) => {
                          linkRefs.current[tab.id] = node;
                        }}
                        className={`relative z-10 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold transition-colors duration-300 ${isActive ? "text-white" : "text-slate-600 hover:text-emerald-700"}`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 lg:justify-end">
                <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 sm:inline-flex">
                  <PhoneCall className="h-4 w-4" />
                  1900 9999
                </div>
                <Link
                  href="/auth/login"
                  className="text-sm font-bold text-slate-700 transition-colors hover:text-emerald-600 sm:text-base"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600"
                >
                  Bắt đầu ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
