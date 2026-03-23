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
  const [currentAccessToken, setCurrentAccessToken] = useState(accessToken);
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
      setCurrentAccessToken(data.accessToken);
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
  const controlsDisabled = refreshing || loggingOut || redirecting;

  // Theme definition
  const themeColors = isManager ? {
    bg: "bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#f0f9ff_100%)]",
    sidebar: "border-sky-300 bg-sky-950 shadow-sky-900/10",
    textPrimary: "text-sky-100",
    textSecondary: "text-sky-300",
    iconBg: "bg-sky-500",
    cardHover: "hover:border-sky-400/30 hover:bg-sky-900/40",
    cardBorder: "border-sky-800/30",
    mainHeader: "text-sky-600",
    metricBg: "bg-sky-50 border-sky-200"
  } : {
    bg: "bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),transparent_40%),linear-gradient(180deg,#fffbeb_0%,#fef3c7_100%)]",
    sidebar: "border-amber-200 bg-white/80 backdrop-blur shadow-amber-900/10",
    textPrimary: "text-amber-950",
    textSecondary: "text-amber-700/80",
    iconBg: "bg-amber-500",
    cardHover: "hover:border-amber-400 hover:bg-amber-100",
    cardBorder: "border-transparent bg-amber-50/50",
    mainHeader: "text-amber-600",
    metricBg: "bg-amber-100/50 border-amber-200"
  };

  return (
    <div className={`min-h-screen ${themeColors.bg} text-slate-900`}>
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        
        {/* Sidebar */}
        <aside className={`w-full shrink-0 rounded-[2rem] border px-6 py-6 transition-all hover:shadow-2xl lg:w-80 ${themeColors.sidebar}`}>
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-md"
              />
            ) : (
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${themeColors.iconBg} text-lg font-extrabold text-white shadow-md`}>
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className={`truncate text-lg font-extrabold ${themeColors.textPrimary}`}>{user.fullName}</p>
              <p className={`truncate text-sm ${themeColors.textSecondary}`}>{user.email}</p>
            </div>
          </div>

          <div className={`mt-6 rounded-2xl border ${isManager ? "border-sky-500/30 bg-sky-500/10" : "border-amber-300 bg-amber-100/50"} px-4 py-4`}>
            <p className={`text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 ${isManager ? "text-sky-300" : "text-amber-600"}`}>
              <Clock className="w-4 h-4" /> {isManager ? "Quản lý Chi nhánh" : "Trực ca Staff"}
            </p>
            <p className={`mt-2 text-sm leading-6 ${isManager ? "text-sky-100/80" : "text-amber-900/80"}`}>
              Không gian làm việc cho {isManager ? "điều hành cơ sở" : "nghiệp vụ lễ tân POS"}.
            </p>
          </div>

          <nav className="mt-8 space-y-3">
            {visibleNavItems.map((item) => (
              <div
                key={item.label}
                className={`group cursor-pointer rounded-2xl border px-4 py-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${themeColors.cardBorder} ${themeColors.cardHover}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`transition-transform duration-300 group-hover:scale-110 ${isManager ? "text-sky-400" : "text-amber-600"}`}>{item.icon}</div>
                  <div>
                    <p className={`font-bold ${isManager ? "text-slate-100" : "text-amber-950"}`}>{item.label}</p>
                    <p className={`text-sm ${isManager ? "text-slate-400" : "text-amber-700/80"}`}>{item.hint}</p>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          <button
            type="button"
            onClick={onLogout}
            disabled={controlsDisabled}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-extrabold text-red-500 transition-all duration-200 hover:bg-red-500 hover:text-white hover:shadow-md active:scale-95 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            Out ca & Thoát
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          <header className="rounded-[2rem] border border-white/60 bg-white/80 px-6 py-6 shadow-xl shadow-slate-200/50 backdrop-blur transition-all hover:shadow-2xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className={`text-sm font-bold uppercase tracking-[0.22em] ${themeColors.mainHeader}`}>
                  Workspace Dashboard
                </p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                  Panel điều khiển, {user.fullName}
                </h1>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                  {isManager ? "Bảng thông tin dành cho nhà điều phối quản lý hệ thống sân địa phương." : "Màn hình riêng để kiểm soát khách hàng tới sân check-in."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className={`rounded-2xl border px-4 py-4 text-center ${themeColors.metricBg}`}>
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isManager ? "text-sky-700" : "text-amber-700"}`}>Trạng thái</p>
                  <p className={`mt-2 text-sm font-extrabold ${isManager ? "text-sky-950" : "text-amber-950"}`}>{user.status}</p>
                </div>
                <div className={`rounded-2xl border px-4 py-4 text-center ${isManager ? "bg-indigo-50 border-indigo-200" : "bg-rose-50 border-rose-200"}`}>
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isManager ? "text-indigo-700" : "text-rose-700"}`}>Vai trò</p>
                  <p className={`mt-2 text-sm font-extrabold ${isManager ? "text-indigo-950" : "text-rose-950"}`}>{isManager ? "Manager" : "Staff"}</p>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
            <div className="rounded-[2rem] border border-white/60 bg-white/80 px-6 py-6 shadow-xl shadow-slate-200/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Kết nối API</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Dữ liệu Session</h2>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isManager ? "bg-sky-100 text-sky-600 border-sky-300" : "bg-amber-100 text-amber-600 border-amber-300"}`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono text-xs font-semibold text-slate-700 break-all">
                  {currentAccessToken}
                </div>
                {message && <div className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800 animate-in fade-in border border-emerald-100">{message}</div>}
                {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-800 animate-in fade-in border border-red-100">{error}</div>}

                <div className="pt-2">
                  <button onClick={onRefreshToken} disabled={controlsDisabled} className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold text-white transition-all hover:shadow-lg active:scale-95 disabled:opacity-60 ${isManager ? "bg-sky-600 hover:bg-sky-700" : "bg-amber-600 hover:bg-amber-700"}`}>
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    Gia hạn Server
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/60 bg-white/80 px-6 py-6 shadow-xl shadow-slate-200/50">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Phân quyền</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Danh tính cá nhân</h2>
              <dl className="mt-5 space-y-3">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 hover:border-slate-300 transition-colors">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Giới danh</dt>
                  <dd className="mt-1 text-sm font-bold text-slate-900">{user.fullName}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 hover:border-slate-300 transition-colors">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hộp thư lưu trữ</dt>
                  <dd className="mt-1 text-sm font-bold text-slate-900">{user.email}</dd>
                </div>
              </dl>
            </div>
          </section>
        </main>
      </div>
      <AuthStatusToast visible={redirecting} tone="success" message="Đang xử lý đăng xuất an toàn..." />
    </div>
  );
}
