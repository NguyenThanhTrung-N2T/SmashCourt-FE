"use client";

import { useEffect, useRef, useState } from "react";
import {
  MagnifyingGlass,
  Bell,
  List,
  CaretDown,
  SignOut,
  UserCircle,
  CircleNotch,
  Buildings,
} from "@phosphor-icons/react";
import { type AuthUserSession } from "@/src/modules/auth/session/sessionStore";

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MG";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

type ManagerHeaderProps = {
  user: AuthUserSession;
  branchName?: string;
  onMenuToggle: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
};

export default function ManagerHeader({
  user,
  branchName = "Chi nhánh",
  onMenuToggle,
  onLogout,
  isLoggingOut,
}: ManagerHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const initials = getInitials(user.fullName);

  // Ctrl+F shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-[72px] flex items-center justify-between px-2 shrink-0">
      {/* Left: hamburger + search */}
      <div className="flex items-center gap-3">
        {/* Hamburger (mobile only) */}
        <button
          onClick={onMenuToggle}
          aria-label="Mở menu"
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E38]"
        >
          <List className="h-5 w-5" />
        </button>

        {/* MagnifyingGlass */}
        <div className="relative w-[280px] lg:w-[320px] hidden sm:block">
          <MagnifyingGlass
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Tìm kiếm..."
            aria-label="Tìm kiếm"
            className="w-full bg-white rounded-full pl-11 pr-14 py-2.5 text-sm text-slate-700 font-medium shadow-sm outline-none border border-transparent focus:border-[#1B5E38]/40 focus:ring-4 focus:ring-[#1B5E38]/10 transition-all placeholder-slate-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <kbd className="inline-flex items-center gap-0.5 rounded-lg bg-slate-100 px-1.5 py-1 text-[10px] font-bold text-slate-400">
              <span>Ctrl</span>F
            </kbd>
          </div>
        </div>

        {/* Branch label pill — desktop only */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-[#1B5E38]/8 border border-[#1B5E38]/15 px-3 py-1.5">
          <Buildings className="h-3.5 w-3.5 text-[#1B5E38]" />
          <span className="text-xs font-bold text-[#1B5E38] truncate max-w-[140px]">{branchName}</span>
        </div>
      </div>

      {/* Right: notification + profile */}
      <div className="flex items-center gap-3">
        <button
          aria-label="Thông báo"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 hover:text-slate-800 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E38]"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span
            className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"
            aria-label="Có thông báo mới"
          />
        </button>

        {/* Profile dropdown */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-label="List tài khoản"
            aria-expanded={profileOpen}
            aria-haspopup="true"
            className="flex items-center gap-2.5 cursor-pointer group rounded-full pr-3 pl-1 py-1 hover:bg-white/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E38]"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B5E38]/10 text-sm font-bold text-[#1B5E38] border-2 border-white shadow-sm">
                {initials}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <p className="text-sm font-bold text-slate-900 leading-none">{user.fullName}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{user.email}</p>
            </div>
            <CaretDown
              className={`hidden sm:block h-4 w-4 text-slate-400 transition-transform duration-200 ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-slide-up">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                <span className="inline-flex mt-1 items-center gap-1 rounded-full bg-[#1B5E38]/10 px-2 py-0.5 text-[10px] font-bold text-[#1B5E38]">
                  Branch Manager
                </span>
              </div>
              <a
                href="/manager/profile"
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <UserCircle className="h-4 w-4 text-slate-400" />
                Hồ sơ cá nhân
              </a>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  onLogout();
                }}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <CircleNotch className="h-4 w-4 animate-spin" />
                ) : (
                  <SignOut className="h-4 w-4" />
                )}
                {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
