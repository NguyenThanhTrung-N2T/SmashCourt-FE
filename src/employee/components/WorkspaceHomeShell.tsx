/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  UsersRound,
  FileText,
  DoorOpen,
  QrCode,
  LayoutGrid,
  MessagesSquare,
  LogOut,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { authLogout, authRefresh } from "@/src/auth/api/authApi";
import AuthStatusToast from "@/src/auth/components/AuthStatusToast";
import {
  broadcastLogoutSync,
  clearAuthSession,
  setAccessToken,
  type AuthUserSession,
} from "@/src/auth/session/sessionStore";

type WorkspaceHomeShellProps = {
  accessToken: string;
  user: AuthUserSession;
};

type MenuItem = {
  label: string;
  icon: ReactNode;
  hint: string;
  roles: string[];
};

const MENU_ITEMS: MenuItem[] = [
  {
    label: "Check-in Khách hàng",
    icon: <QrCode className="h-5 w-5" />,
    hint: "Quét QR để nhận sân nhanh",
    roles: ["STAFF", "BRANCH_MANAGER", "BRANCH-MANAGER"],
  },
  {
    label: "Lưới Sân Áp Dụng",
    icon: <LayoutGrid className="h-5 w-5" />,
    hint: "Trực quan lưới sân đang trống",
    roles: ["STAFF", "BRANCH_MANAGER", "BRANCH-MANAGER"],
  },
  {
    label: "Lịch đặt sân",
    icon: <CalendarDays className="h-5 w-5" />,
    hint: "Lịch thao tác & Kéo giờ sân",
    roles: ["STAFF", "BRANCH_MANAGER", "BRANCH-MANAGER"],
  },
  {
    label: "Quản trị Cơ sở",
    icon: <DoorOpen className="h-5 w-5" />,
    hint: "Thiết lập sân bãi & Kỹ thuật",
    roles: ["BRANCH_MANAGER", "BRANCH-MANAGER"],
  },
  {
    label: "Nhân sự trực ca",
    icon: <UsersRound className="h-5 w-5" />,
    hint: "Phân ca & Chấm công Staff",
    roles: ["BRANCH_MANAGER", "BRANCH-MANAGER"],
  },
  {
    label: "Báo cáo Chi nhánh",
    icon: <FileText className="h-5 w-5" />,
    hint: "Quản lý doanh thu chi tiết",
    roles: ["BRANCH_MANAGER", "BRANCH-MANAGER"],
  },
  {
    label: "Hỗ trợ Phản hồi",
    icon: <MessagesSquare className="h-5 w-5" />,
    hint: "Kênh livechat khách hàng",
    roles: ["STAFF", "BRANCH_MANAGER", "BRANCH-MANAGER"],
  },
];

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SC";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export default function WorkspaceHomeShell({
  accessToken,
  user,
}: WorkspaceHomeShellProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const upperRole = user.role.toUpperCase();
  const isManager = upperRole.includes("MANAGER");

  const visibleNavItems = MENU_ITEMS.filter((item) =>
    item.roles.includes(upperRole)
  );

  async function onRefreshToken() {
    setError(null);
    setMessage(null);
    try {
      setRefreshing(true);
      const data = await authRefresh();
      setAccessToken(data.accessToken);
      setMessage("Phiên làm việc đã được gia hạn bảo mật.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi mạng.");
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
      setError(err instanceof Error ? err.message : "Chưa thể thoát ca.");
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
  const hasAccessToken = accessToken.trim().length > 0;
  const controlsDisabled = refreshing || loggingOut || redirecting;

  // Theme definition
  const themeColors = isManager ? {
    primary: "sky",
    secondary: "blue",
    gradient: "from-sky-500 to-blue-500",
    bgGradient: "from-slate-50 via-sky-50/30 to-blue-50/40",
    darkBg: "from-slate-900 via-sky-900 to-slate-900",
    floatingOrb1: "bg-sky-500/10",
    floatingOrb2: "bg-blue-500/10",
  } : {
    primary: "amber",
    secondary: "orange",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-slate-50 via-amber-50/30 to-orange-50/40",
    darkBg: "from-slate-900 via-amber-900 to-slate-900",
    floatingOrb1: "bg-amber-500/10",
    floatingOrb2: "bg-orange-500/10",
  };

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${themeColors.bgGradient} text-slate-900 selection:bg-${themeColors.primary}-500 selection:text-white`}>
      {/* Animated gradient background */}
      <div className={`pointer-events-none absolute left-0 right-0 top-0 z-0 h-[500px] rounded-b-[3rem] bg-gradient-to-br ${themeColors.darkBg} animate-gradient`} />
      
      {/* Floating orbs */}
      <div className={`pointer-events-none absolute left-10 top-20 h-72 w-72 rounded-full ${themeColors.floatingOrb1} blur-3xl animate-float`} />
      <div className={`pointer-events-none absolute right-20 top-40 h-96 w-96 rounded-full ${themeColors.floatingOrb2} blur-3xl animate-float`} style={{ animationDelay: '1s' }} />
      <div className={`pointer-events-none absolute bottom-20 left-1/3 h-80 w-80 rounded-full ${themeColors.floatingOrb1} blur-3xl animate-float`} style={{ animationDelay: '2s' }} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col gap-8 px-6 py-8 lg:flex-row lg:px-10">
        
        {/* Sidebar */}
        <aside className={`w-full shrink-0 rounded-[2.5rem] border-2 border-white/20 bg-gradient-to-br ${themeColors.darkBg} px-8 py-8 text-white shadow-2xl shadow-${themeColors.primary}-900/30 backdrop-blur-xl lg:w-96 animate-slide-up`}>
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className={`h-20 w-20 rounded-3xl border-4 border-white/20 object-cover shadow-xl animate-pulse-glow`}
              />
            ) : (
              <div className={`flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-white/20 bg-gradient-to-br ${themeColors.gradient} text-2xl font-extrabold text-white shadow-xl animate-pulse-glow`}>
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xl font-extrabold text-white">{user.fullName}</p>
              <p className={`truncate text-sm text-${themeColors.primary}-200`}>{user.email}</p>
              <div className={`mt-1 inline-flex items-center gap-1.5 rounded-full border border-${themeColors.primary}-400/30 bg-${themeColors.primary}-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-${themeColors.primary}-300`}>
                <ShieldCheck className="h-3 w-3" />
                {isManager ? "Manager" : "Staff"}
              </div>
            </div>
          </div>

          <div className={`mt-6 rounded-2xl border border-${themeColors.primary}-400/30 bg-gradient-to-br from-${themeColors.primary}-500/20 to-${themeColors.secondary}-500/10 px-5 py-5 shadow-lg backdrop-blur-sm animate-pulse-glow`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`h-4 w-4 text-${themeColors.primary}-300 animate-pulse`} />
              <p className={`text-xs font-black uppercase tracking-[0.22em] text-${themeColors.primary}-300`}>
                {isManager ? "Quản lý Chi nhánh" : "Trực ca Staff"}
              </p>
            </div>
            <p className="text-sm leading-6 text-slate-200">
              Không gian làm việc cho {isManager ? "điều hành cơ sở" : "nghiệp vụ lễ tân POS"}.
            </p>
          </div>

          <nav className="mt-8 space-y-3">
            {visibleNavItems.map((item, index) => (
              <button
                type="button"
                key={item.label}
                className={`group w-full cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition-all duration-300 hover:border-${themeColors.primary}-400/40 hover:bg-gradient-to-r hover:from-${themeColors.primary}-500/20 hover:to-${themeColors.secondary}-500/10 hover:-translate-y-1 hover:shadow-lg hover:scale-[1.02] animate-slide-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-${themeColors.primary}-300 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:${themeColors.gradient} group-hover:text-white group-hover:scale-110`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-slate-100 group-hover:text-white">{item.label}</p>
                    <p className={`text-xs text-slate-400 group-hover:text-${themeColors.primary}-200`}>{item.hint}</p>
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
            Out ca & Thoát
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-8">
          <header className="rounded-[2.5rem] border-2 border-white/30 bg-white/80 px-10 py-10 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-all hover:shadow-3xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className={`inline-flex items-center gap-2 rounded-full border border-${themeColors.primary}-200 bg-${themeColors.primary}-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-${themeColors.primary}-700`}>
                  <Clock className="h-3.5 w-3.5 animate-pulse" />
                  Workspace Dashboard
                </div>
                <h1 className={`mt-4 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-${themeColors.primary}-700 to-${themeColors.secondary}-700 bg-clip-text text-transparent lg:text-4xl`}>
                  Panel điều khiển, {user.fullName}
                </h1>
                <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-slate-600 lg:text-base">
                  {isManager ? "Bảng thông tin dành cho nhà điều phối quản lý hệ thống sân địa phương." : "Màn hình riêng để kiểm soát khách hàng tới sân check-in."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className={`group rounded-2xl border-2 border-${themeColors.primary}-200 bg-gradient-to-br from-${themeColors.primary}-50 to-${themeColors.primary}-100/50 px-6 py-5 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:border-${themeColors.primary}-300`}>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] text-${themeColors.primary}-600`}>Trạng thái</p>
                  <p className={`mt-2 text-base font-extrabold text-${themeColors.primary}-950`}>{user.status}</p>
                  <div className={`mt-2 h-1 w-full rounded-full bg-${themeColors.primary}-200`}>
                    <div className={`h-full w-full rounded-full bg-gradient-to-r ${themeColors.gradient} animate-shimmer`} />
                  </div>
                </div>
                <div className={`group rounded-2xl border-2 border-${themeColors.secondary}-200 bg-gradient-to-br from-${themeColors.secondary}-50 to-${themeColors.secondary}-100/50 px-6 py-5 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:border-${themeColors.secondary}-300`}>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] text-${themeColors.secondary}-600`}>Vai trò</p>
                  <p className={`mt-2 text-base font-extrabold text-${themeColors.secondary}-950`}>{isManager ? "Manager" : "Staff"}</p>
                  <div className={`mt-2 h-1 w-full rounded-full bg-${themeColors.secondary}-200`}>
                    <div className={`h-full w-full rounded-full bg-gradient-to-r ${themeColors.gradient} animate-shimmer`} />
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-8 lg:grid-cols-3">
            {/* Quick Stats */}
            <div className="lg:col-span-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { 
                  title: "Sân đang hoạt động", 
                  value: "8/12", 
                  icon: LayoutGrid, 
                  color: "emerald",
                  trend: "+2 từ hôm qua"
                },
                { 
                  title: "Khách hàng hôm nay", 
                  value: "47", 
                  icon: UsersRound, 
                  color: isManager ? "sky" : "amber",
                  trend: "+12% so với tuần trước"
                },
                { 
                  title: "Booking sắp tới", 
                  value: "23", 
                  icon: CalendarDays, 
                  color: "blue",
                  trend: "Trong 4 giờ tới"
                },
                { 
                  title: "Doanh thu hôm nay", 
                  value: "8.4M", 
                  icon: FileText, 
                  color: "violet",
                  trend: "+18% so với hôm qua"
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                const colorMap: Record<string, string> = {
                  emerald: "from-emerald-500 to-teal-500",
                  sky: "from-sky-500 to-blue-500",
                  amber: "from-amber-500 to-orange-500",
                  blue: "from-blue-500 to-indigo-500",
                  violet: "from-violet-500 to-purple-500",
                };
                return (
                  <div 
                    key={stat.title} 
                    className="group rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg transition-all hover:-translate-y-2 hover:border-slate-300 hover:shadow-2xl animate-slide-up"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                          {stat.title}
                        </p>
                        <p className="mt-3 text-3xl font-extrabold text-slate-900">
                          {stat.value}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          {stat.trend}
                        </p>
                      </div>
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colorMap[stat.color]} text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                        <Icon className="h-7 w-7" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activities */}
            <div className="lg:col-span-2 rounded-[2.5rem] border-2 border-white/30 bg-white/80 px-10 py-10 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-all hover:shadow-3xl animate-slide-up" style={{ animationDelay: '0.7s' }}>
              <div className="flex items-start justify-between gap-4 mb-8">
                <div className="flex-1">
                  <div className={`inline-flex items-center gap-2 rounded-full border border-${themeColors.primary}-200 bg-${themeColors.primary}-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-${themeColors.primary}-700`}>
                    <CalendarDays className="h-3.5 w-3.5" />
                    Hoạt động gần đây
                  </div>
                  <h2 className={`mt-4 text-2xl font-extrabold bg-gradient-to-r from-slate-900 to-${themeColors.primary}-700 bg-clip-text text-transparent lg:text-3xl`}>
                    Lịch sử thao tác
                  </h2>
                </div>
                <div className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${themeColors.gradient} text-white shadow-xl shadow-${themeColors.primary}-500/30 animate-pulse-glow`}>
                  <Clock className="h-8 w-8" />
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { action: "Check-in khách hàng", detail: "Nguyễn Văn A - Sân 3", time: "5 phút trước", icon: QrCode, color: "emerald" },
                  { action: "Cập nhật booking", detail: "Sân 1 - 18:00-19:30", time: "12 phút trước", icon: CalendarDays, color: "blue" },
                  { action: "Xác nhận thanh toán", detail: "Invoice #1234 - 450.000đ", time: "25 phút trước", icon: FileText, color: "violet" },
                  { action: "Thêm khách hàng mới", detail: "Trần Thị B - 0901234567", time: "1 giờ trước", icon: UsersRound, color: isManager ? "sky" : "amber" },
                ].map((activity, index) => {
                  const Icon = activity.icon;
                  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
                    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
                    sky: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
                    amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
                    blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
                    violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
                  };
                  const colors = colorMap[activity.color];
                  return (
                    <div key={index} className="group flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 transition-all hover:-translate-x-2 hover:border-slate-300 hover:shadow-md">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.text} border-2 ${colors.border} transition-transform group-hover:scale-110`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-extrabold text-slate-900">{activity.action}</p>
                        <p className="text-xs font-medium text-slate-600 truncate">{activity.detail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Personal Info */}
            <div className="rounded-[2.5rem] border-2 border-white/30 bg-white/80 px-10 py-10 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-all hover:shadow-3xl animate-slide-up" style={{ animationDelay: '0.8s' }}>
              <div className="flex items-start justify-between gap-4 mb-8">
                <div className="flex-1">
                  <div className={`inline-flex items-center gap-2 rounded-full border border-${themeColors.secondary}-200 bg-${themeColors.secondary}-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-${themeColors.secondary}-700`}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Phân quyền
                  </div>
                  <h2 className={`mt-4 text-2xl font-extrabold bg-gradient-to-r from-slate-900 to-${themeColors.secondary}-700 bg-clip-text text-transparent lg:text-3xl`}>
                    Thông tin cá nhân
                  </h2>
                </div>
                <div className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${themeColors.gradient} text-white shadow-xl shadow-${themeColors.secondary}-500/30 animate-pulse-glow`}>
                  <UsersRound className="h-8 w-8" />
                </div>
              </div>
              
              <dl className="space-y-4">
                <div className={`group rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-${themeColors.primary}-300 hover:shadow-md`}>
                  <dt className="text-[11px] font-black uppercase tracking-wider text-slate-500">Họ và tên</dt>
                  <dd className="mt-2 text-base font-extrabold text-slate-900">{user.fullName}</dd>
                </div>
                <div className={`group rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-${themeColors.primary}-300 hover:shadow-md`}>
                  <dt className="text-[11px] font-black uppercase tracking-wider text-slate-500">Email</dt>
                  <dd className="mt-2 text-base font-extrabold text-slate-900 break-all">{user.email}</dd>
                </div>
                <div className={`group rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-${themeColors.primary}-300 hover:shadow-md`}>
                  <dt className="text-[11px] font-black uppercase tracking-wider text-slate-500">Vai trò</dt>
                  <dd className="mt-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border-2 border-${themeColors.primary}-200 bg-${themeColors.primary}-50 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-${themeColors.primary}-800`}>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {isManager ? "Branch Manager" : "Staff"}
                    </span>
                  </dd>
                </div>
                <div className={`group rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-${themeColors.primary}-300 hover:shadow-md`}>
                  <dt className="text-[11px] font-black uppercase tracking-wider text-slate-500">Trạng thái</dt>
                  <dd className="mt-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {user.status}
                    </span>
                  </dd>
                </div>
              </dl>

              {/* Refresh Token Button */}
              <div className="mt-6 pt-6 border-t-2 border-slate-200">
                <button 
                  onClick={onRefreshToken} 
                  disabled={controlsDisabled || !hasAccessToken} 
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${themeColors.gradient} px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-${themeColors.primary}-500/30 transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-60`}
                >
                  <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
                  Gia hạn phiên làm việc
                </button>
                {message && <div className="mt-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-4 text-sm font-bold text-emerald-800 animate-in fade-in shadow-sm">{message}</div>}
                {error && <div className="mt-4 rounded-2xl bg-red-50 border-2 border-red-200 p-4 text-sm font-bold text-red-800 animate-in fade-in shadow-sm">{error}</div>}
              </div>
            </div>
          </section>
        </main>
      </div>
      <AuthStatusToast visible={redirecting} tone="success" message="Đang xử lý đăng xuất an toàn..." />
    </div>
  );
}
