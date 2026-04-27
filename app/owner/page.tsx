"use client";

import {
  BarChart2,
  CalendarDays,
  ShieldAlert,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  MoreHorizontal,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function OwnerDashboardPage() {
  const kpis = [
    {
      label: "Tổng doanh thu",
      value: "12.6 tỷ",
      sub: "Tăng so với tháng trước",
      trend: "up",
      icon: BarChart2,
      isPrimary: true,
    },
    {
      label: "Lượt kết thúc",
      value: "1,284",
      sub: "Tăng so với tháng trước",
      trend: "up",
      icon: CalendarDays,
    },
    {
      label: "Đang hoạt động",
      value: "342",
      sub: "Tăng so với tháng trước",
      trend: "up",
      icon: Users,
    },
    {
      label: "Chờ xử lý",
      value: "2",
      sub: "Đang thảo luận",
      trend: "neutral",
      icon: ShieldAlert,
    },
  ];

  // Revenue data — heights as % of chart
  const barData = [
    { h: 45, label: "S" },
    { h: 70, label: "M" },
    { h: 55, label: "T" },
    { h: 90, label: "W", isToday: true },
    { h: 60, label: "T" },
    { h: 40, label: "F" },
    { h: 30, label: "S" },
  ];

  const schedule = [
    { time: "18:00", court: "Sân 1", status: "Đang chơi" },
    { time: "18:30", court: "Sân 3", status: "Sắp tới" },
    { time: "19:00", court: "Sân 2", status: "Sắp tới" },
  ];

  return (
    <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight text-slate-900">
            Tổng quan
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Theo dõi hiệu suất kinh doanh, doanh thu và lịch đặt sân.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Secondary: pill, white, border */}
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            Xuất dữ liệu
          </button>
          {/* Primary: pill, gradient green */}
          <button
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
              boxShadow: "0 4px 14px rgba(27, 94, 56, 0.35)",
            }}
          >
            <Plus className="h-4 w-4" />
            Thêm mới
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
                {/* Arrow circle */}
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

              {/* Background icon watermark */}
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
            <h2 className="text-base font-extrabold text-slate-900">Doanh thu theo tuần</h2>
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          {/* Chart bars — capsule style like the template */}
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-3">
            {barData.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2.5 h-full group">
                <div className="relative flex-1 w-full max-w-[52px] flex items-end justify-center">
                  {/* Hover tooltip */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow whitespace-nowrap z-10">
                    {bar.h}%
                  </div>
                  {/* Background track (empty capsule) */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full rounded-full bg-slate-100"
                    style={{ height: "100%" }}
                  />
                  {/* Filled capsule bar */}
                  <div
                    className="relative w-full rounded-full transition-all duration-500"
                    style={{
                      height: `${bar.h}%`,
                      background: bar.isToday
                        ? "linear-gradient(180deg, #2A9D5C 0%, #1B5E38 100%)"
                        : "linear-gradient(180deg, #A7D7B8 0%, #7EC09A 100%)",
                      boxShadow: bar.isToday
                        ? "0 4px 12px rgba(27,94,56,0.30)"
                        : "none",
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

          {/* Court Occupancy */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-900">Tỷ lệ lấp sân</h2>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Hôm nay
              </span>
            </div>

            <div className="flex items-center gap-5">
              {/* Ring chart */}
              <div className="relative h-24 w-24 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="14" />
                  {/* Striped/lighter secondary arc */}
                  <circle
                    cx="50" cy="50" r="40" fill="transparent"
                    stroke="#A7D7B8" strokeWidth="14"
                    strokeDasharray="60 251"
                    strokeDashoffset="-180"
                    opacity="0.6"
                  />
                  {/* Primary arc */}
                  <circle
                    cx="50" cy="50" r="40" fill="transparent"
                    stroke="#1B5E38" strokeWidth="14"
                    strokeDasharray="150 251"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-900">75%</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>Giờ vàng</span>
                    <span className="text-[#1B5E38]">90%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full w-[90%]" style={{ background: "linear-gradient(90deg,#2A9D5C,#1B5E38)" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>Giờ thường</span>
                    <span className="text-amber-500">40%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full w-[40%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-900">Lịch sắp tới</h2>
              <button className="text-xs font-bold text-[#1B5E38] hover:underline">
                Xem tất cả
              </button>
            </div>

            <div className="space-y-2">
              {schedule.map((slot, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-3 transition-all hover:bg-slate-100"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 shadow-sm">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">{slot.time}</p>
                    <p className="text-xs font-medium text-slate-500">{slot.court}</p>
                  </div>
                  {slot.status === "Đang chơi" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#1B5E38]/10 px-2.5 py-1 text-[10px] font-bold text-[#1B5E38]">
                      <CheckCircle2 className="h-3 w-3" />
                      Đang chơi
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                      Sắp tới
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
