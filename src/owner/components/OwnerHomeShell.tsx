/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Building2,
  LogOut,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { authLogout, authRefresh } from "@/src/auth/api/authApi";
import AuthStatusToast from "@/src/auth/components/AuthStatusToast";
import {
  broadcastLogoutSync,
  clearAuthSession,
  setAccessToken,
  type AuthUserSession,
} from "@/src/auth/session/sessionStore";

type OwnerHomeShellProps = {
  accessToken: string;
  user: AuthUserSession;
};

type MenuItem = {
  label: string;
  icon: ReactNode;
  hint: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    label: "Tổng quan Kinh doanh",
    icon: <BarChart className="h-5 w-5" />,
    hint: "Báo cáo doanh thu toàn hệ thống",
  },
  {
    label: "Quản lý Chi nhánh",
    icon: <Building2 className="h-5 w-5" />,
    hint: "Xem & Điều phối các cơ sở",
  },
  {
    label: "Tài khoản Nhân sự",
    icon: <Users className="h-5 w-5" />,
    hint: "Quản lý Manager & Staff",
  },
  {
    label: "Cài đặt Hệ thống",
    icon: <Settings className="h-5 w-5" />,
    hint: "Chính sách hủy, Hạng thành viên",
  },
];

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SC";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function OwnerHomeShell({
  accessToken,
  user,
}: OwnerHomeShellProps) {
  const router = useRouter();
  const [currentAccessToken, setCurrentAccessToken] = useState(accessToken);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  async function onRefreshToken() {
    setError(null);
    setMessage(null);
    try {
      setRefreshing(true);
      const data = await authRefresh();
      setAccessToken(data.accessToken);
      setCurrentAccessToken(data.accessToken);
      setMessage("Đã cấp mới access token thành công.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gặp lỗi khi refresh.");
    } finally {
      setRefreshing(false);
    }
  }

  async function onLogout() {
    setError(null);
    setMessage(null);
    try {
      setLoggingOut(true);
      await authLogout();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng xuất thất bại.");
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

  const initials = getInitials(user.fullName);
  const controlsDisabled = refreshing || loggingOut || redirecting;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.10),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        
        {/* Sidebar */}
        <aside className="w-full shrink-0 rounded-[2rem] border border-white/70 bg-[#0f172a] px-6 py-6 text-white shadow-2xl shadow-indigo-900/10 lg:w-80">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-md"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 text-lg font-extrabold shadow-md">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold">{user.fullName}</p>
              <p className="truncate text-sm text-indigo-200">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 animate-pulse rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">
              Quản trị viên cấp cao
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Hệ thống được thiết kế riêng dành cho chủ sở hữu với toàn quyền kiểm soát dữ liệu.
            </p>
          </div>

          <nav className="mt-8 space-y-3">
            {MENU_ITEMS.map((item) => (
              <div
                key={item.label}
                className="group cursor-pointer rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition-all duration-300 hover:border-indigo-400/30 hover:bg-indigo-900/40 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="text-indigo-400 transition-transform duration-300 group-hover:scale-110 group-hover:text-indigo-300">{item.icon}</div>
                  <div>
                    <p className="font-bold text-slate-100 group-hover:text-white">{item.label}</p>
                    <p className="text-sm text-slate-400 group-hover:text-indigo-200">{item.hint}</p>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          <button
            type="button"
            onClick={onLogout}
            disabled={controlsDisabled}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-extrabold text-red-100 transition-all duration-200 hover:bg-red-500/20 hover:shadow-md active:scale-95 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất hệ thống
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          <header className="rounded-[2rem] border border-slate-200/70 bg-white/90 px-6 py-6 shadow-xl shadow-slate-200/40 backdrop-blur transition-all hover:shadow-2xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-indigo-600">
                  Owner Dashboard
                </p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                  Tổng quan hệ thống
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  Chào mừng trở lại. Tại đây bạn có thể cấu trúc lại các nhánh chính sách Hủy, Điểm thưởng, cũng như đánh giá các báo cáo từ chi nhánh.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-4 transition-colors hover:bg-indigo-50">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">Trạng thái</p>
                  <p className="mt-2 text-sm font-extrabold text-indigo-950">{user.status}</p>
                </div>
                <div className="rounded-2xl border border-violet-100 bg-violet-50/50 px-4 py-4 transition-colors hover:bg-violet-50">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">Vai trò</p>
                  <p className="mt-2 text-sm font-extrabold text-violet-950">Chủ sở hữu</p>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
            <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 px-6 py-6 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Phiên xác thực</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Bảo mật Token</h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm border border-indigo-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">API Access Token</p>
                  <p className="mt-2 break-all font-mono text-sm font-semibold text-slate-700">{currentAccessToken}</p>
                </div>

                {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900 animate-in fade-in">{message}</div>}
                {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800 animate-in fade-in">{error}</div>}

                <div className="flex flex-wrap gap-3">
                  <button onClick={onRefreshToken} disabled={controlsDisabled} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-extrabold text-white transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95 disabled:opacity-60">
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    Làm mới Token
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 px-6 py-6 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Hồ sơ cấp cao</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Thông tin Administrator</h2>
              <dl className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-4 hover:border-indigo-100 transition-colors">
                  <dt className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Họ và tên</dt>
                  <dd className="mt-1 text-sm font-extrabold text-slate-900">{user.fullName}</dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-4 hover:border-indigo-100 transition-colors">
                  <dt className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Email quản trị</dt>
                  <dd className="mt-1 text-sm font-extrabold text-slate-900">{user.email}</dd>
                </div>
              </dl>
            </div>
          </section>
        </main>
      </div>
      <AuthStatusToast visible={redirecting} tone="success" message="Đăng xuất thành công" />
    </div>
  );
}
