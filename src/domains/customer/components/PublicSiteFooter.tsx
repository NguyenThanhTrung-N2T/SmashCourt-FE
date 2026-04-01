import { Activity, ArrowRight, PhoneCall } from "lucide-react";
import Link from "next/link";

export default function PublicSiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-slate-950 py-12 text-slate-400">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.2),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_24%)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">SmashCourt</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Quản lý & Đặt sân Cầu lông Trực tuyến
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-emerald-200">
            <PhoneCall className="h-4 w-4" />
            1900 9999
          </div>
          <Link
            href="/about"
            className="text-sm font-bold text-slate-300 transition-colors hover:text-white"
          >
            Giới thiệu
          </Link>
          <Link
            href="/cancellation-policy"
            className="text-sm font-bold text-slate-300 transition-colors hover:text-white"
          >
            Chính sách hủy
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-400"
          >
            Tạo tài khoản
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
