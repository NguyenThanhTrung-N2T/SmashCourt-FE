"use client";

import {
  BarChart2,
  ClipboardList,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function OwnerDashboardPage() {
  const kpis = [
    { label: "Doanh thu", value: "12.6 tỷ", sub: "Tháng này", icon: BarChart2, color: "from-indigo-500 to-indigo-600", border: "border-indigo-100", bg: "from-indigo-50 to-indigo-100/30" },
    { label: "Lượt đặt sân", value: "1,284", sub: "Tháng này", icon: ClipboardList, color: "from-emerald-500 to-emerald-600", border: "border-emerald-100", bg: "from-emerald-50 to-emerald-100/30" },
    { label: "Tỷ lệ hủy", value: "3.2%", sub: "Trên tổng booking", icon: ShieldCheck, color: "from-violet-500 to-violet-600", border: "border-violet-100", bg: "from-violet-50 to-violet-100/30" },
  ];

  const barData = [20, 40, 28, 55, 43, 64, 52, 75, 60];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page header */}
      <div className="rounded-[2rem] border border-white/40 bg-white/80 px-8 py-8 shadow-2xl shadow-slate-900/8 backdrop-blur-xl">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-700 w-fit">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Owner Dashboard
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800 bg-clip-text text-transparent">
            Tổng quan hệ thống
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 max-w-2xl">
            Nhìn nhanh doanh thu, lượt đặt sân và hiệu suất theo chi nhánh.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`group rounded-2xl border-2 ${kpi.border} bg-gradient-to-br ${kpi.bg} p-6 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl animate-slide-up`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{kpi.label}</p>
                  <p className="mt-0.5 text-2xl font-extrabold text-slate-900">{kpi.value}</p>
                  <p className="text-[11px] text-slate-400">{kpi.sub}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue chart */}
      <div className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-white shadow-md animate-slide-up" style={{ animationDelay: "0.25s" }}>
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow">
              <BarChart2 className="h-5 w-5" />
            </div>
            <p className="font-extrabold text-slate-800">Biểu đồ doanh thu</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-700">
            <Sparkles className="h-3 w-3" />
            7 ngày gần nhất
          </span>
        </div>
        <div className="h-56 px-7 pb-6 pt-5">
          <div className="flex h-full items-end gap-3">
            {barData.map((h, i) => (
              <div
                key={i}
                className="group relative flex-1 rounded-t-xl bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all hover:from-violet-600 hover:to-violet-400 hover:scale-105 cursor-pointer"
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="rounded-lg border border-indigo-100 bg-white px-2.5 py-1 text-xs font-bold text-indigo-900 shadow-lg whitespace-nowrap">
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
