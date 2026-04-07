"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import {
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { authLogout } from "@/src/api/auth.api";
import AuthStatusToast from "@/src/modules/auth/components/AuthStatusToast";
import {
  broadcastLogoutSync,
  clearAuthSession,
  type AuthUserSession,
} from "@/src/modules/auth/session/sessionStore";
import { NavItem } from "@/src/shared/types/navigation.types";
import { OWNER_NAV } from "../navigation/owner.navigation";

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SC";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

type Props = {
  user: AuthUserSession;
  children: ReactNode;
};

export default function OwnerSidebarLayout({ user, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const initials = getInitials(user.fullName);

  async function onLogout() {
    try {
      setLoggingOut(true);
      await authLogout();
    } catch {
      setLoggingOut(false);
      return;
    }
    broadcastLogoutSync();
    clearAuthSession();
    setRedirecting(true);
    window.setTimeout(() => {
      router.push("/auth/login");
    }, 1200);
  }

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const disabled = loggingOut || redirecting;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40">
      {/* BG orbs */}
      {/* <div className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-[480px] rounded-b-[3rem] bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900" /> */}
      <div className="pointer-events-none absolute left-10 top-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl animate-float" />
      <div
        className="pointer-events-none absolute right-20 top-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl animate-float"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] gap-8 px-6 py-8 lg:px-10">
        {/* ── Sidebar ── */}
        <aside className="hidden w-80 shrink-0 lg:block">
          <div className="sticky top-8 flex h-[calc(100vh-4rem)] flex-col rounded-[2rem] border border-white/20 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 px-5 py-6 text-white shadow-2xl shadow-indigo-900/40 backdrop-blur-xl">
            {/* User */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-11 w-11 rounded-xl border border-white/20 object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-indigo-500 to-violet-600 text-base font-bold">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {user.fullName}
                </p>
                <p className="truncate text-xs text-indigo-300">{user.email}</p>
                <div className="group relative mt-1 inline-block">
                  {/* The Visible Badge */}
                  <div className="inline-flex cursor-help items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Owner
                  </div>

                  {/* Hover Tooltip */}
                  <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-52 origin-top-left scale-95 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                    <div className="rounded-lg border border-white/10 bg-slate-800 p-2.5 shadow-2xl ring-1 ring-black/5">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-indigo-400" />
                        <p className="text-[11px] font-bold text-indigo-300">
                          Quản trị viên cấp cao
                        </p>
                      </div>
                      <p className="mt-1 text-[10px] leading-relaxed text-slate-300">
                        Toàn quyền kiểm soát SmashCourt.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="mt-2 flex-1 space-y-1 overflow-y-auto pr-2 scrollbar-none">
              {OWNER_NAV.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${active
                      ? "bg-indigo-600/30 border border-indigo-500/30 shadow-lg shadow-indigo-500/20 scale-[1.02]"
                      : "border border-transparent hover:bg-white/5 hover:scale-[1.02] hover:shadow-md"
                      }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${active
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/50 scale-110"
                        : "bg-white/5 text-slate-400 group-hover:bg-gradient-to-br group-hover:from-indigo-400 group-hover:to-violet-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-3"
                        }`}
                    >
                      <Icon style={{ height: "1rem", width: "1rem" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate transition-colors ${active
                          ? "font-semibold text-white"
                          : "text-slate-300 group-hover:text-white group-hover:font-semibold"
                          }`}
                      >
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate group-hover:text-slate-400 transition-colors">
                        {item.hint}
                      </p>
                    </div>
                    {active && (
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              disabled={disabled}
              className="mt-5 shrink-0 flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition-all hover:bg-red-500/20 active:scale-95 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>

      <AuthStatusToast
        visible={redirecting}
        tone="success"
        message="Đăng xuất thành công"
      />
    </div>
  );
}
