/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Building2,
  CheckCircle2,
  ClipboardList,
  Grid3x3,
  LogOut,
  MailPlus,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Trophy,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import LoyaltyTierPanel from "@/src/owner/components/LoyaltyTierPanel";
import CourtTypePanel from "@/src/owner/components/CourtTypePanel";

import { authLogout } from "@/src/auth/api/authApi";
import AuthStatusToast from "@/src/auth/components/AuthStatusToast";
import {
  broadcastLogoutSync,
  clearAuthSession,
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
    label: "Quản lý Loại sân",
    icon: <Grid3x3 className="h-5 w-5" />,
    hint: "Tạo và quản lý các loại sân",
  },
  {
    label: "Hạng Thành viên",
    icon: <Trophy className="h-5 w-5" />,
    hint: "Điểm thưởng & Tỷ lệ giảm giá",
  },
  {
    label: "Cài đặt Hệ thống",
    icon: <Settings className="h-5 w-5" />,
    hint: "Chính sách hủy, cấu hình hệ thống",
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
  accessToken: _accessToken,
  user,
}: OwnerHomeShellProps) {
  // Owner dashboard không hiển thị token ra UI.
  // Dùng `void` để tránh lint cảnh báo biến không dùng.
  void _accessToken;
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [activeMenu, setActiveMenu] = useState(MENU_ITEMS[0]?.label ?? "");

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

  const initials = getInitials(user.fullName);
  const controlsDisabled = loggingOut || redirecting;

  const activePanel = useMemo(() => {
    switch (activeMenu) {
      case "Quản lý Chi nhánh":
        return (
          <div className="rounded-[2.5rem] border-2 border-white/30 bg-white/80 px-10 py-10 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-all hover:shadow-3xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-indigo-700">
                  <Building2 className="h-3.5 w-3.5" />
                  Điều phối
                </div>
                <h2 className="mt-4 text-2xl font-extrabold bg-gradient-to-r from-slate-900 to-indigo-700 bg-clip-text text-transparent lg:text-3xl">
                  Quản lý Chi nhánh
                </h2>
                <p className="mt-3 text-sm font-medium text-slate-600 lg:text-base">
                  Tìm kiếm, bật/tắt hoạt động và điều phối trạng thái lịch theo chi nhánh.
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-xl shadow-indigo-500/30 animate-pulse-glow">
                <Store className="h-8 w-8" />
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white px-5 py-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  Search (placeholder)
                </p>
                <div className="mt-2 text-sm font-semibold text-slate-700">
                  CS Tân Bình, CS Gò Vấp...
                </div>
              </div>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-indigo-500/30 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-60">
                <UserPlus className="h-5 w-5" />
                Thêm chi nhánh
              </button>
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-xl">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-600">
                      Chi nhánh
                    </th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-600">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-600">
                      Số sân
                    </th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-600">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: "CS Tân Bình", status: "Đang hoạt động", courts: 6 },
                    { name: "CS Gò Vấp", status: "Đang hoạt động", courts: 8 },
                    { name: "CS Quận 7", status: "Tạm khóa", courts: 4 },
                  ].map((row) => (
                    <tr key={row.name} className="group transition-colors hover:bg-indigo-50/50">
                      <td className="px-6 py-5 text-sm font-extrabold text-slate-900 lg:text-base">
                        {row.name}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                            row.status === "Đang hoạt động"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                          }`}
                        >
                          {row.status === "Đang hoạt động" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-extrabold text-slate-700 lg:text-base">
                        {row.courts} sân
                      </td>
                      <td className="px-6 py-5">
                        <button className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:-translate-y-0.5 hover:shadow-md lg:text-sm">
                          Điều phối
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Tài khoản Nhân sự":
        return (
          <div className="rounded-[2.5rem] border-2 border-white/30 bg-white/80 px-10 py-10 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-all hover:shadow-3xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-700">
                  <Users className="h-3.5 w-3.5" />
                  Nhân sự
                </div>
                <h2 className="mt-4 text-2xl font-extrabold bg-gradient-to-r from-slate-900 to-emerald-700 bg-clip-text text-transparent lg:text-3xl">
                  Tài khoản Nhân sự
                </h2>
                <p className="mt-3 text-sm font-medium text-slate-600 lg:text-base">
                  Invite/Quản lý Manager & Staff theo từng chi nhánh.
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/30 animate-pulse-glow">
                <Users className="h-8 w-8" />
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white px-5 py-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  Bộ lọc (placeholder)
                </p>
                <div className="mt-2 text-sm font-semibold text-slate-700">
                  Role: Manager/Staff
                </div>
              </div>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-emerald-500/30 transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-60">
                <MailPlus className="h-5 w-5" />
                Mời nhân sự
              </button>
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-xl">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-slate-50 to-emerald-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-600">
                      Người dùng
                    </th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-600">
                      Vai trò
                    </th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-600">
                      Chi nhánh
                    </th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-600">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    {
                      name: "Nguyễn Minh",
                      role: "BRANCH_MANAGER",
                      branch: "CS Gò Vấp",
                    },
                    { name: "Trần An", role: "STAFF", branch: "CS Tân Bình" },
                    { name: "Lê Khoa", role: "STAFF", branch: "CS Quận 7" },
                  ].map((row) => (
                    <tr key={row.name} className="group transition-colors hover:bg-emerald-50/50">
                      <td className="px-6 py-5 text-sm font-extrabold text-slate-900 lg:text-base">
                        {row.name}
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-indigo-800">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {row.role}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                        {row.branch}
                      </td>
                      <td className="px-6 py-5">
                        <button className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:-translate-y-0.5 hover:shadow-md lg:text-sm">
                          Cập nhật quyền
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Hạng Thành viên":
        return <LoyaltyTierPanel />;

      case "Quản lý Loại sân":
        return <CourtTypePanel />;

      case "Cài đặt Hệ thống":
        return (
          <div className="rounded-[2.5rem] border-2 border-white/30 bg-white/80 px-10 py-10 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-all hover:shadow-3xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-violet-700">
                  <Settings className="h-3.5 w-3.5" />
                  Policy
                </div>
                <h2 className="mt-4 text-2xl font-extrabold bg-gradient-to-r from-slate-900 to-violet-700 bg-clip-text text-transparent lg:text-3xl">
                  Cài đặt Hệ thống
                </h2>
                <p className="mt-3 text-sm font-medium text-slate-600 lg:text-base">
                  Điều chỉnh chính sách hủy, hạng thành viên và các hành vi hệ thống.
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-xl shadow-violet-500/30 animate-pulse-glow">
                <Settings className="h-8 w-8" />
              </div>
            </div>

            <div className="mt-8 space-y-5">
              {[
                {
                  title: "Chính sách hủy",
                  desc: "Ví dụ: hủy trước 2h có hoàn/không hoàn điểm.",
                  tone: "emerald",
                  icon: ClipboardList,
                },
                {
                  title: "Hạng thành viên",
                  desc: "Tự động tính điểm theo lịch & thanh toán.",
                  tone: "indigo",
                  icon: ShieldCheck,
                },
                {
                  title: "Bảo mật token",
                  desc: "Rotation/Refresh theo chu kỳ hệ thống.",
                  tone: "violet",
                  icon: Sparkles,
                },
              ].map((row, index) => {
                const Icon = row.icon;
                const gradient =
                  row.tone === "emerald"
                    ? "from-emerald-500 to-teal-500"
                    : row.tone === "indigo"
                      ? "from-indigo-500 to-blue-500"
                      : "from-violet-500 to-purple-500";
                const borderColor =
                  row.tone === "emerald"
                    ? "border-emerald-200 hover:border-emerald-300"
                    : row.tone === "indigo"
                      ? "border-indigo-200 hover:border-indigo-300"
                      : "border-violet-200 hover:border-violet-300";
                return (
                  <div
                    key={row.title}
                    className={`group rounded-3xl border-2 ${borderColor} bg-gradient-to-br from-slate-50 to-white px-6 py-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl animate-slide-up`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <p className="flex items-center gap-2 text-base font-extrabold text-slate-900 lg:text-lg">
                          {row.title}
                        </p>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                          {row.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-indigo-500/30 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-60">
                <ClipboardList className="h-5 w-5" />
                Lưu thay đổi
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-extrabold text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:-translate-y-1 hover:shadow-md active:scale-95 disabled:opacity-60">
                Hoàn tác
              </button>
            </div>
          </div>
        );

      case "Tổng quan Kinh doanh":
      default:
        return (
          <div className="rounded-[2.5rem] border-2 border-white/30 bg-white/80 px-10 py-10 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-all hover:shadow-3xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-indigo-700">
                  <BarChart className="h-3.5 w-3.5" />
                  Business
                </div>
                <h2 className="mt-4 text-2xl font-extrabold bg-gradient-to-r from-slate-900 to-indigo-700 bg-clip-text text-transparent lg:text-3xl">
                  Tổng quan Kinh doanh
                </h2>
                <p className="mt-3 text-sm font-medium text-slate-600 lg:text-base">
                  Nhìn nhanh doanh thu, lượt đặt sân và hiệu suất theo chi nhánh.
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-xl shadow-indigo-500/30 animate-pulse-glow">
                <BarChart className="h-8 w-8" />
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                { title: "Doanh thu", value: "12.6B", icon: BarChart, tone: "indigo", delay: "0s" },
                { title: "Lượt đặt sân", value: "1,284", icon: ClipboardList, tone: "emerald", delay: "0.1s" },
                { title: "Tỉ lệ hủy", value: "3.2%", icon: ShieldCheck, tone: "violet", delay: "0.2s" },
              ].map((kpi) => {
                const Icon = kpi.icon;
                const gradient =
                  kpi.tone === "indigo"
                    ? "from-indigo-500 to-indigo-600"
                    : kpi.tone === "emerald"
                      ? "from-emerald-500 to-emerald-600"
                      : "from-violet-500 to-violet-600";
                const borderColor =
                  kpi.tone === "indigo"
                    ? "border-indigo-200 hover:border-indigo-300"
                    : kpi.tone === "emerald"
                      ? "border-emerald-200 hover:border-emerald-300"
                      : "border-violet-200 hover:border-violet-300";
                return (
                  <div key={kpi.title} className={`group rounded-3xl border-2 ${borderColor} bg-gradient-to-br from-slate-50 to-white p-6 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl animate-slide-up`} style={{ animationDelay: kpi.delay }}>
                    <div className="flex items-center gap-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                          {kpi.title}
                        </p>
                        <p className="mt-1 text-2xl font-extrabold text-slate-900 lg:text-3xl">
                          {kpi.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-50 to-indigo-50 border-b-2 border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg">
                    <BarChart className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 lg:text-base">
                    Biểu đồ doanh thu
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-800">
                  <Sparkles className="h-3.5 w-3.5" />
                  7 ngày gần nhất
                </span>
              </div>
              <div className="h-72 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-8">
                <div className="flex h-full items-end gap-4">
                  {[20, 40, 28, 55, 43, 64, 52, 75, 60].map((h, i) => (
                    <div
                      key={i}
                      className="group relative w-full flex-1 rounded-t-3xl bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-400 shadow-lg transition-all hover:from-violet-600 hover:via-violet-500 hover:to-violet-400 hover:scale-105 cursor-pointer"
                      style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="rounded-lg border-2 border-indigo-200 bg-white px-3 py-1 text-xs font-bold text-indigo-900 shadow-xl">
                          {h}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  }, [activeMenu]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-[500px] rounded-b-[3rem] bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 animate-gradient" />
      
      {/* Floating orbs */}
      <div className="pointer-events-none absolute left-10 top-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl animate-float" />
      <div className="pointer-events-none absolute right-20 top-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="pointer-events-none absolute bottom-20 left-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col gap-8 px-6 py-8 lg:flex-row lg:px-10">
        
        {/* Sidebar */}
        <aside className="w-full shrink-0 rounded-[2.5rem] border-2 border-white/20 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 px-8 py-8 text-white shadow-2xl shadow-indigo-900/30 backdrop-blur-xl lg:w-96 animate-slide-up">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-20 w-20 rounded-3xl border-4 border-white/20 object-cover shadow-xl animate-pulse-glow"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-white/20 bg-gradient-to-br from-indigo-500 to-violet-500 text-2xl font-extrabold shadow-xl animate-pulse-glow">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xl font-extrabold">{user.fullName}</p>
              <p className="truncate text-sm text-indigo-200">{user.email}</p>
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
                <ShieldCheck className="h-3 w-3" />
                Owner
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 px-5 py-5 shadow-lg backdrop-blur-sm animate-pulse-glow">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-indigo-300 animate-pulse" />
              <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-300">
                Quản trị viên cấp cao
              </p>
            </div>
            <p className="text-sm leading-6 text-slate-200">
              Hệ thống được thiết kế riêng dành cho chủ sở hữu với toàn quyền kiểm soát dữ liệu.
            </p>
          </div>

          <nav className="mt-8 space-y-3">
            {MENU_ITEMS.map((item, index) => (
              <button
                type="button"
                onClick={() => setActiveMenu(item.label)}
                key={item.label}
                className={`group w-full cursor-pointer rounded-2xl border px-5 py-4 text-left transition-all duration-300 animate-slide-up ${
                  activeMenu === item.label
                    ? "border-indigo-400/60 bg-gradient-to-r from-indigo-500/30 to-violet-500/20 shadow-xl shadow-indigo-500/20 -translate-y-1 scale-[1.02]"
                    : "border-white/10 bg-white/5 hover:border-indigo-400/40 hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-violet-500/10 hover:-translate-y-1 hover:shadow-lg hover:scale-[1.02]"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                    activeMenu === item.label
                      ? "bg-gradient-to-br from-indigo-400 to-violet-500 text-white shadow-lg scale-110"
                      : "bg-white/10 text-indigo-300 group-hover:bg-gradient-to-br group-hover:from-indigo-400 group-hover:to-violet-500 group-hover:text-white group-hover:scale-110"
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-slate-100 group-hover:text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 group-hover:text-indigo-200">{item.hint}</p>
                  </div>
                </div>
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={onLogout}
            disabled={controlsDisabled}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-400/30 bg-gradient-to-r from-red-500/20 to-pink-500/20 px-5 py-4 text-sm font-extrabold text-red-100 transition-all duration-200 hover:from-red-500/30 hover:to-pink-500/30 hover:shadow-xl hover:shadow-red-500/20 hover:-translate-y-1 active:scale-95 disabled:opacity-60"
          >
            <LogOut className="h-5 w-5" />
            Đăng xuất hệ thống
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-8">
          <header className="rounded-[2.5rem] border-2 border-white/30 bg-white/80 px-10 py-10 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-all hover:shadow-3xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-indigo-700">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  Owner Dashboard
                </div>
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-700 to-violet-700 bg-clip-text text-transparent lg:text-4xl">
                  Tổng quan hệ thống
                </h1>
                <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-slate-600 lg:text-base">
                  Chào mừng trở lại. Tại đây bạn có thể cấu trúc lại các nhánh chính sách Hủy, Điểm thưởng, cũng như đánh giá các báo cáo từ chi nhánh.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="group rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100/50 px-6 py-5 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:border-indigo-300">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Trạng thái</p>
                  <p className="mt-2 text-base font-extrabold text-indigo-950">{user.status}</p>
                  <div className="mt-2 h-1 w-full rounded-full bg-indigo-200">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-shimmer" />
                  </div>
                </div>
                <div className="group rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100/50 px-6 py-5 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:border-violet-300">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">Vai trò</p>
                  <p className="mt-2 text-base font-extrabold text-violet-950">Chủ sở hữu</p>
                  <div className="mt-2 h-1 w-full rounded-full bg-violet-200">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 animate-shimmer" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="space-y-6">{activePanel}</section>
        </main>
      </div>
      <AuthStatusToast visible={redirecting} tone="success" message="Đăng xuất thành công" />
    </div>
  );
}
