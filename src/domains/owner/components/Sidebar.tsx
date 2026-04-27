"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignOut,
  Question,
  CircleNotch,
  X,
} from "@phosphor-icons/react";

import { NavItem } from "@/src/shared/types/navigation.types";
import { OWNER_NAV } from "../navigation/owner.navigation";

type SidebarProps = {
  isLoggingOut: boolean;
  onLogout: () => void;
  /** Mobile drawer open state */
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export default function Sidebar({
  isLoggingOut,
  onLogout,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const menuItems = OWNER_NAV.filter((item) => item.href !== "/owner/settings");
  const sysItems = OWNER_NAV.filter((item) => item.href === "/owner/settings");

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
            className={`group flex items-center gap-3 py-2.5 px-6 border-l-[3px] transition-all duration-200 ${active
              ? "border-[#0A5C36] bg-[#0A5C36]/5 text-[#0A5C36] font-bold"
              : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
              }`}
          >
            <Icon className={`h-[18px] w-[18px] ${active ? "text-[#0A5C36]" : "text-slate-400 group-hover:text-slate-600"}`} />
            <span className="text-sm">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-[88px] px-6 flex items-center gap-2.5 shrink-0">
        <img src="/favicon.ico" alt="SmashCourt Logo" className="h-9 w-9 rounded-xl" />
        <span className="text-lg font-extrabold tracking-tight text-slate-900">SmashCourt</span>

        {/* Mobile close button */}
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
        <div>
          <p className="px-6 text-[9px] font-extrabold text-slate-400 mb-2 uppercase tracking-[0.12em]">
            List
          </p>
          {renderNavLinks(menuItems)}
        </div>

        <div>
          <p className="px-6 text-[9px] font-extrabold text-slate-400 mb-2 uppercase tracking-[0.12em]">
            General
          </p>
          {renderNavLinks(sysItems)}
          <nav className="space-y-0.5 px-3">
            <button
              aria-label="Trợ giúp"
              className="w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-white/70 hover:text-slate-900 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E38] focus-visible:ring-offset-2"
            >
              <Question className="h-4 w-4 text-slate-400" />
              Trợ giúp
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
                <SignOut className="h-4 w-4 text-slate-400" />
              )}
              {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile App Promo Card */}
      <div className="p-4 shrink-0">
        <div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{
            backgroundImage: "url('/mobile_app_bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-slate-900/60 rounded-3xl" />
          <div className="relative z-10 text-white flex flex-col gap-3">
            <div className="h-9 w-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <img src="/favicon.ico" alt="App" className="h-5 w-5 rounded-md" />
            </div>
            <div>
              <p className="font-extrabold text-sm leading-tight">
                Download our
                <br />
                Mobile App
              </p>
              <p className="text-[10px] text-white/60 mt-0.5">Get easy in another way</p>
            </div>
            <button className="w-full rounded-xl bg-[#1B5E38] hover:bg-[#145229] py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
              Download
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — always visible on md+ */}
      <aside className="hidden md:flex w-[220px] shrink-0 m-4 mr-0 bg-white rounded-3xl flex-col shadow-sm overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-white flex flex-col shadow-2xl animate-slide-in-left overflow-hidden z-50">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
