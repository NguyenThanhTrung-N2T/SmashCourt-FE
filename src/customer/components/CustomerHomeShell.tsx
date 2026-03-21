/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { authLogout, authRefresh } from "@/src/auth/api/authApi";
import AuthStatusToast from "@/src/auth/components/AuthStatusToast";
import {
  broadcastLogoutSync,
  clearAuthSession,
  setAccessToken,
  type AuthUserSession,
} from "@/src/auth/session/sessionStore";

type CustomerHomeShellProps = {
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
    label: "Tổng quan",
    icon: <LayoutDashboard className="h-5 w-5" />,
    hint: "Trang điều hướng chính cho hội viên",
  },
  {
    label: "Lịch đặt sân",
    icon: <CalendarClock className="h-5 w-5" />,
    hint: "Sẵn sàng nối API booking sau",
  },
  {
    label: "Tài khoản",
    icon: <UserRound className="h-5 w-5" />,
    hint: "Thông tin hồ sơ và bảo mật",
  },
  {
    label: "Thanh toán",
    icon: <CreditCard className="h-5 w-5" />,
    hint: "Khu vực kiểm tra giao dịch và ví",
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

export default function CustomerHomeShell({
  accessToken,
  user,
}: CustomerHomeShellProps) {
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
      setError(
        err instanceof Error
          ? err.message
          : "Không thể làm mới access token.",
      );
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef6f3_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 rounded-[2rem] border border-white/70 bg-slate-900 px-6 py-6 text-white shadow-2xl shadow-slate-900/10 lg:w-80">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-extrabold">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold">{user.fullName}</p>
              <p className="truncate text-sm text-slate-300">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              Khách hàng
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Giao diện hội viên đã sẵn sàng để bạn test toàn bộ flow auth và
              session sau đăng nhập.
            </p>
          </div>

          <nav className="mt-8 space-y-3">
            {MENU_ITEMS.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="text-emerald-300">{item.icon}</div>
                  <div>
                    <p className="font-bold">{item.label}</p>
                    <p className="text-sm text-slate-300">{item.hint}</p>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          <button
            type="button"
            onClick={onLogout}
            disabled={controlsDisabled}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-extrabold text-red-100 transition-colors hover:bg-red-500/20 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </aside>

        <main className="flex-1 space-y-6">
          <header className="rounded-[2rem] border border-slate-200/70 bg-white/90 px-6 py-6 shadow-xl shadow-slate-200/40 backdrop-blur">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-600">
                  Client Dashboard
                </p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                  Xin chào, {user.fullName}
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                  Đây là khung UI khách hàng sau khi đăng nhập thành công. Bạn
                  có thể dùng ngay để test lưu token, refresh token bằng cookie
                  HttpOnly và luồng logout.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                    Trạng thái
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-emerald-950">
                    {user.status}
                  </p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                    Vai trò
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-blue-950">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
            <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 px-6 py-6 shadow-xl shadow-slate-200/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                    Phiên xác thực
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                    Token & session
                  </h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Access token hiện tại
                  </p>
                  <p className="mt-2 break-all font-mono text-sm font-semibold text-slate-800">
                    {currentAccessToken}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium leading-6 text-slate-700">
                  Refresh token đã được backend set trong cookie HttpOnly. FE
                  không đọc trực tiếp cookie đó, chỉ gọi API `refresh` để nhận
                  access token mới khi cần.
                </div>

                {message ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
                    {message}
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                    {error}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={onRefreshToken}
                    disabled={controlsDisabled}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                    {refreshing ? "Đang refresh..." : "Refresh access token"}
                  </button>

                  <Link
                    href="/auth/login"
                    className="inline-flex items-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-extrabold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Về trang đăng nhập
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 px-6 py-6 shadow-xl shadow-slate-200/40">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Hồ sơ hội viên
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                Thông tin client hiện tại
              </h2>

              <dl className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 px-4 py-4">
                  <dt className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Họ và tên
                  </dt>
                  <dd className="mt-2 text-sm font-extrabold text-slate-900">
                    {user.fullName}
                  </dd>
                </div>

                <div className="rounded-2xl border border-slate-200 px-4 py-4">
                  <dt className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Email
                  </dt>
                  <dd className="mt-2 text-sm font-extrabold text-slate-900">
                    {user.email}
                  </dd>
                </div>

                <div className="rounded-2xl border border-slate-200 px-4 py-4">
                  <dt className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Số điện thoại
                  </dt>
                  <dd className="mt-2 text-sm font-extrabold text-slate-900">
                    {user.phone || "Chưa cập nhật"}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </main>
      </div>

      <AuthStatusToast
        visible={redirecting}
        tone="success"
        message="Đăng xuất thành công"
      />
    </div>
  );
}





