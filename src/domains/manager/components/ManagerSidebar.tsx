"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Question,
  CircleNotch,
  X,
} from "@phosphor-icons/react";
import { NavItem } from "@/src/shared/types/navigation.types";
import { MANAGER_NAV } from "../navigation/manager.navigation";

type SidebarProps = {
  isLoggingOut: boolean;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  /** Branch info to display in the sidebar */
  branchName?: string;
};

// Split nav into main menu and profile (last item)
const menuItems = MANAGER_NAV.filter((item) => item.href !== "/manager/profile");
const profileItem = MANAGER_NAV.find((item) => item.href === "/manager/profile");
const bottomItems: NavItem[] = profileItem ? [profileItem] : [];

export default function ManagerSidebar({
  isLoggingOut,
  onLogout,
  mobileOpen,
  onMobileClose,
  branchName = "Chi nhánh",
}: SidebarProps) {
  const pathname = usePathname();

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const renderNavLinks = (items: NavItem[]) => (
    <nav className="space-y-0.5" role="navigation">
      {items.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onMobileClose}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 py-2.5 px-6 border-l-[3px] transition-all duration-200 ${
              active
                ? "border-[#0A5C36] bg-[#0A5C36]/5 text-[#0A5C36] font-bold"
                : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
            }`}
          >
            <Icon
              className={`h-[18px] w-[18px] ${
                active ? "text-[#0A5C36]" : "text-slate-400 group-hover:text-slate-600"
              }`}
            />
            <span className="text-sm">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const sidebarContent = (
    <>
      {/* Logo + Branch Badge */}
      <div className="h-[88px] px-6 flex items-center gap-2.5 shrink-0">
        <img src="/favicon.ico" alt="SmashCourt Logo" className="h-9 w-9 rounded-xl" />
        <div className="flex flex-col min-w-0">
          <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
            SmashCourt
          </span>
          <span className="text-[10px] font-semibold text-[#1B5E38] truncate leading-tight">
            {branchName}
          </span>
        </div>

        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          aria-label="Đóng menu"
          className="ml-auto md:hidden flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E38]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col py-2 gap-6">
        {/* List section */}
        <div>
          <p className="px-6 text-[9px] font-extrabold text-slate-400 mb-2 uppercase tracking-[0.12em]">
            List
          </p>
          {renderNavLinks(menuItems)}
        </div>

        {/* General / bottom section */}
        <div>
          <p className="px-6 text-[9px] font-extrabold text-slate-400 mb-2 uppercase tracking-[0.12em]">
            General
          </p>
          {renderNavLinks(bottomItems)}
          <nav className="space-y-0.5 px-3">
            <button
              aria-label="Trợ giúp"
              className="w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-white/70 hover:text-slate-900 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E38] focus-visible:ring-offset-2"
            >
              <Question className="h-4 w-4 text-slate-400" />
              Help & Support
            </button>
            <button
              onClick={onLogout}
              disabled={isLoggingOut}
              aria-label="Đăng xuất"
              className="w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
            >
              {isLoggingOut ? (
                <CircleNotch className="h-4 w-4 text-red-400 animate-spin" />
              ) : (
                <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              )}
              {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </button>
          </nav>
        </div>
      </div>

      {/* Branch Role Badge at bottom */}
      <div className="p-4 shrink-0">
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)" }}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="relative z-10 text-white flex flex-col gap-2">
            <div className="h-8 w-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <img src="/favicon.ico" alt="App" className="h-4 w-4 rounded-md" />
            </div>
            <div>
              <p className="font-extrabold text-sm leading-tight">Branch Manager</p>
              <p className="text-[10px] text-white/70 mt-0.5 truncate">{branchName}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[220px] shrink-0 m-4 mr-0 bg-white rounded-3xl flex-col shadow-sm overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" aria-modal="true" role="dialog">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-white flex flex-col shadow-2xl animate-slide-in-left overflow-hidden z-50">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
