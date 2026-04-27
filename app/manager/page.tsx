"use client";

import {
  BarChart2,
  CalendarDays,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from "lucide-react";

export default function ManagerDashboardPage() {
  // ── KPI data ──────────────────────────────────────────────────────────────
  const kpis = [
    {
      label: "Doanh thu hôm nay",
      value: "4.2 triệu",
      sub: "Tăng so với hôm qua",
      trend: "up",
      icon: BarChart2,
      isPrimary: true,
    },
    {
      label: "Đặt sân hôm nay",
      value: "38",
      sub: "Tăng so với hôm qua",
      trend: "up",
      icon: CalendarDays,
    },
    {
      label: "Khách hàng mới",
      value: "12",
      sub: "Trong tuần này",
      trend: "up",
      icon: Users,
    },
    {
      label: "Chờ xác nhận",
      value: "3",
      sub: "Cần xử lý ngay",
      trend: "neutral",
      icon: AlertCircle,
    },
  ];

  // ── Bar chart data ─────────────────────────────────────────────────────────
  const barData = [
    { h: 40, label: "S" },
    { h: 65, label: "M" },
    { h: 50, label: "T" },
    { h: 85, label: "W", isToday: true },
    { h: 55, label: "T" },
    { h: 35, label: "F" },
    { h: 25, label: "S" },
  ];

  // ── Today's bookings ───────────────────────────────────────────────────────
  const schedule = [
    { time: "08:00", court: "Sân 1", customer: "Nguyễn Văn A", status: "Đang chơi" },
    { time: "09:30", court: "Sân 3", customer: "Trần Thị B", status: "Sắp tới" },
    { time: "10:00", court: "Sân 2", customer: "Lê Minh C", status: "Sắp tới" },
    { time: "11:00", court: "Sân 4", customer: "Phạm Thị D", status: "Sắp tới" },
  ];

  // ── Court occupancy ────────────────────────────────────────────────────────
  const courts = [
    { name: "Sân 1", status: "occupied", occupancy: 100 },
    { name: "Sân 2", status: "available", occupancy: 0 },
    { name: "Sân 3", status: "upcoming", occupancy: 0 },
    { name: "Sân 4", status: "maintenance", occupancy: 0 },
    { name: "Sân 5", status: "available", occupancy: 0 },
    { name: "Sân 6", status: "occupied", occupancy: 100 },
  ];

  function courtStatusCfg(status: string) {
    switch (status) {
      case "occupied":
        return {
          label: "Đang dùng",
          dot: "bg-[#1B5E38]",
          bg: "bg-[#1B5E38]/10 border-[#1B5E38]/20",
          text: "text-[#1B5E38]",
        };
      case "upcoming":
        return {
          label: "Sắp tới",
          dot: "bg-amber-500",
          bg: "bg-amber-50 border-amber-200",
          text: "text-amber-700",
        };
      case "maintenance":
        return {
          label: "Bảo trì",
          dot: "bg-red-500",
          bg: "bg-red-50 border-red-200",
          text: "text-red-700",
        };
      default:
        return {
          label: "Trống",
          dot: "bg-slate-300",
          bg: "bg-white border-slate-200",
          text: "text-slate-500",
        };
    }
  }

  return (
    <div className="space-y-6 animate-slide-up w-full pb-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Tổng quan hoạt động chi nhánh hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            Xuất báo cáo
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
              boxShadow: "0 4px 14px rgba(27, 94, 56, 0.35)",
            }}
          >
            <CalendarDays className="h-4 w-4" />
            Tạo đặt sân
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`relative rounded-2xl p-6 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden ${
                kpi.isPrimary
                  ? "text-white"
                  : "bg-white border border-slate-200 text-slate-900"
              }`}
              style={
                kpi.isPrimary
                  ? { background: "linear-gradient(145deg, #2D7A50 0%, #1B5E38 100%)" }
                  : {}
              }
            >
              <div className="flex items-start justify-between">
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    kpi.isPrimary ? "text-green-200" : "text-slate-500"
                  }`}
                >
                  {kpi.label}
                </p>
                <button
                  className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                    kpi.isPrimary
                      ? "border-white/30 text-white hover:bg-white/10"
                      : "border-slate-200 text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <p
                className={`mt-3 text-4xl font-extrabold tracking-tight leading-none ${
                  kpi.isPrimary ? "text-white" : "text-slate-900"
                }`}
              >
                {kpi.value}
              </p>

              <div className="mt-4 flex items-center gap-1.5">
                {kpi.trend === "up" && (
                  <span
                    className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      kpi.isPrimary
                        ? "bg-white/20 text-white"
                        : "bg-[#1B5E38]/10 text-[#1B5E38]"
                    }`}
                  >
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                )}
                {kpi.trend === "down" && (
                  <span className="inline-flex items-center gap-0.5 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                    <ArrowDownRight className="h-3 w-3" />
                  </span>
                )}
                <span
                  className={`text-[11px] font-medium ${
                    kpi.isPrimary ? "text-green-200/90" : "text-slate-400"
                  }`}
                >
                  {kpi.sub}
                </span>
              </div>

              {kpi.isPrimary && (
                <Icon className="absolute right-4 bottom-4 h-16 w-16 text-white/10" />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid gap-4 xl:grid-cols-3">

        {/* Revenue Chart */}
        <div className="xl:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Doanh thu theo tuần</h2>
              <p className="text-xs text-slate-500 mt-0.5">Chi nhánh — tuần hiện tại</p>
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 sm:gap-3">
            {barData.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2.5 h-full group">
                <div className="relative flex-1 w-full max-w-[52px] flex items-end justify-center">
                  {/* Hover tooltip */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow whitespace-nowrap z-10">
                    {bar.h}%
                  </div>
                  {/* Track */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full rounded-full bg-slate-100" style={{ height: "100%" }} />
                  {/* Bar */}
                  <div
                    className="relative w-full rounded-full transition-all duration-500"
                    style={{
                      height: `${bar.h}%`,
                      background: bar.isToday
                        ? "linear-gradient(180deg, #2A9D5C 0%, #1B5E38 100%)"
                        : "linear-gradient(180deg, #A7D7B8 0%, #7EC09A 100%)",
                      boxShadow: bar.isToday ? "0 4px 12px rgba(27,94,56,0.30)" : "none",
                    }}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wide ${
                    bar.isToday ? "text-[#1B5E38]" : "text-slate-400"
                  }`}
                >
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">

          {/* Court Status Grid */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-900">Trạng thái sân</h2>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Hôm nay
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {courts.map((court) => {
                const cfg = courtStatusCfg(court.status);
                return (
                  <div
                    key={court.name}
                    className={`rounded-xl border p-2.5 flex flex-col gap-1.5 ${cfg.bg}`}
                  >
                    <div className="flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                      <span className="text-[10px] font-bold text-slate-700 truncate leading-none">
                        {court.name}
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                { dot: "bg-[#1B5E38]", label: "Đang dùng" },
                { dot: "bg-amber-500", label: "Sắp tới" },
                { dot: "bg-slate-300", label: "Trống" },
                { dot: "bg-red-500", label: "Bảo trì" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${l.dot}`} />
                  <span className="text-[10px] font-semibold text-slate-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Occupancy Ring */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-900">Tỷ lệ lấp sân</h2>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Hôm nay</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative h-24 w-24 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="14" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#A7D7B8" strokeWidth="14" strokeDasharray="60 251" strokeDashoffset="-180" opacity="0.6" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1B5E38" strokeWidth="14" strokeDasharray="166 251" strokeDashoffset="0" strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-900">66%</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>Giờ vàng</span>
                    <span className="text-[#1B5E38]">85%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full w-[85%]" style={{ background: "linear-gradient(90deg,#2A9D5C,#1B5E38)" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>Giờ thường</span>
                    <span className="text-amber-500">45%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full w-[45%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's Schedule ── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-slate-900">Lịch đặt sân hôm nay</h2>
            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {schedule.length} lượt
            </span>
          </div>
          <button className="text-xs font-bold text-[#1B5E38] hover:underline">
            Xem tất cả
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Giờ</th>
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Sân</th>
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Khách hàng</th>
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Trạng thái</th>
                <th className="pb-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {schedule.map((slot, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-bold text-slate-900">{slot.time}</span>
                    </div>
                  </td>
                  <td className="py-3 font-semibold text-slate-700">{slot.court}</td>
                  <td className="py-3 text-slate-600">{slot.customer}</td>
                  <td className="py-3">
                    {slot.status === "Đang chơi" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#1B5E38]/10 px-2.5 py-1 text-[10px] font-bold text-[#1B5E38]">
                        <CheckCircle2 className="h-3 w-3" />
                        Đang chơi
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                        Sắp tới
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-xs font-bold text-[#1B5E38] hover:underline">
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: TrendingUp,
            label: "Doanh thu tháng này",
            value: "84.6 triệu",
            change: "+12%",
            up: true,
          },
          {
            icon: Users,
            label: "Tổng khách hàng",
            value: "284",
            change: "+8 tuần này",
            up: true,
          },
          {
            icon: CalendarDays,
            label: "Lượt đặt tháng này",
            value: "1,042",
            change: "+5% so với T3",
            up: true,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B5E38]/10 text-[#1B5E38]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500 truncate">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-slate-900 leading-none mt-0.5">{stat.value}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <span className="inline-flex items-center gap-0.5 rounded bg-[#1B5E38]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#1B5E38]">
                  <ArrowUpRight className="h-3 w-3" />
                </span>
                <span className="text-[11px] font-medium text-slate-400">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
