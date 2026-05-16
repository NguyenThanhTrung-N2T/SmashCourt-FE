"use client";

import { useEffect, useRef, useState } from "react";
import {
    MagnifyingGlass,
    Bell,
    List,
    CaretDown,
    SignOut,
    CircleNotch,
    Buildings,
} from "@phosphor-icons/react";
import { type AuthUserSession } from "@/src/features/auth/session/sessionStore";
import { SmartImage } from "@/src/shared/components/ui";
import ThemeToggle from "@/src/shared/components/ui/ThemeToggle";
import { MANAGER_ACCOUNT_MENU } from "../navigation/manager.navigation";
import Link from "next/link";

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
                    className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-surface-1 text-muted shadow-sm hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E38]"
                >
                    <List className="h-5 w-5" />
                </button>

                {/* Search bar */}
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
                        className="w-full bg-surface-1 rounded-full pl-11 pr-14 py-2.5 text-sm text-foreground font-medium shadow-sm outline-none border border-transparent focus:border-[#1B5E38]/40 focus:ring-4 focus:ring-[#1B5E38]/10 transition-all placeholder-muted"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <kbd className="inline-flex items-center gap-0.5 rounded-lg bg-surface-3 px-1.5 py-1 text-[10px] font-bold text-slate-400">
                            <span>Ctrl</span>F
                        </kbd>
                    </div>
                </div>

                {/* Branch label pill — desktop only */}
                <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-primary/8 border border-primary/15 px-3 py-1.5">
                    <Buildings className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-primary truncate max-w-[140px]">
                        {branchName}
                    </span>
                </div>
            </div>

            {/* Right: notification + theme toggle + profile */}
            <div className="flex items-center gap-3">
                <button
                    aria-label="Thông báo"
                    className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-1 text-muted hover:text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E38]"
                >
                    <Bell className="h-[18px] w-[18px]" />
                    <span
                        className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-surface-1"
                        aria-label="Có thông báo mới"
                    />
                </button>

                {/* Theme toggle */}
                <ThemeToggle />

                {/* Profile dropdown */}
                <div className="relative ml-1" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen((prev) => !prev)}
                        aria-label="List tài khoản"
                        aria-expanded={profileOpen}
                        aria-haspopup="true"
                        className="flex items-center gap-2.5 cursor-pointer group rounded-full pr-3 pl-1 py-1 hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E38]"
                    >
                        {user.avatarUrl ? (
                            <SmartImage
                                src={user.avatarUrl}
                                alt={user.fullName}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                        ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary border-2 border-white shadow-sm">
                                {initials}
                            </div>
                        )}
                        <div className="hidden sm:flex flex-col text-left">
                            <p className="text-sm font-bold text-foreground leading-none">{user.fullName}</p>
                            <p className="text-[11px] text-muted mt-0.5">{user.email}</p>
                        </div>
                        <CaretDown
                            className={`hidden sm:block h-4 w-4 text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {/* Dropdown */}
                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-1 shadow-xl border border-border py-2 z-50 animate-slide-up">
                            <div className="px-4 py-2 border-b border-border">
                                <p className="text-sm font-bold text-foreground truncate">{user.fullName}</p>
                                <p className="text-xs text-muted truncate">{user.email}</p>
                                <span className="inline-flex mt-1 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                    Branch Manager
                                </span>
                            </div>
                            
                            {/* Account menu items */}
                            {MANAGER_ACCOUNT_MENU.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
                                        title={item.hint}
                                    >
                                        <Icon className="h-4 w-4 text-muted" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                            
                            <button
                                onClick={() => {
                                    setProfileOpen(false);
                                    onLogout();
                                }}
                                disabled={isLoggingOut}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-50"
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
