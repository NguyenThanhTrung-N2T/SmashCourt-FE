import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication | SmashCourt",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Left Canvas - Branding / Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-emerald-700 overflow-hidden flex-col justify-between p-12 text-white">
        {/* Abstract Background Effect */}
        <div className="absolute inset-0 z-0 opacity-90">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-blue-900 mix-blend-multiply" />
          <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/30 via-transparent to-transparent" />
          {/* Decorative lines/patterns to simulate courts */}
          <div className="absolute top-[20%] right-[10%] w-[200%] h-[2px] bg-white/10 rotate-[-15deg]" />
          <div className="absolute top-[30%] right-[15%] w-[200%] h-[2px] bg-white/10 rotate-[-15deg]" />
          <div className="absolute top-[40%] right-[20%] w-[200%] h-[2px] bg-white/10 rotate-[-15deg]" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 group hover:text-emerald-200 transition-colors font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Trang chủ</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 mb-8 bg-white/10 w-max px-4 py-2 rounded-2xl backdrop-blur-sm shadow-inner border border-white/20">
            <Activity className="h-6 w-6 text-emerald-300" />
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">SmashCourt</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight drop-shadow-lg relative z-20">
            Quản lý sân tập <br/> chuyên nghiệp
          </h1>
          <p className="text-lg text-emerald-50 leading-relaxed max-w-md drop-shadow font-medium mb-12 relative z-20">
            Hệ thống đặt sân đa chi nhánh hàng đầu. Đăng nhập để sử dụng tính năng giữ chỗ và kiểm tra lịch trống.
          </p>

          {/* Decorative floating cards */}
          <div className="relative h-48 w-full max-w-md hidden xl:block z-10">
            {/* AI Suggestion Card */}
            <div className="absolute top-0 right-0 animate-[bounce_4s_infinite] bg-white text-slate-800 rounded-2xl p-4 shadow-xl border border-emerald-100 flex items-center gap-3 w-64 transform rotate-2">
              <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 fill-emerald-500 text-emerald-500" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">AI Đề xuất</span>
                <span className="text-sm font-bold text-slate-900">Sân VIP 1 - 19:00</span>
              </div>
            </div>
            
            {/* Booking Confirmed Card */}
            <div className="absolute bottom-4 left-4 animate-[bounce_5s_infinite] bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 flex items-center gap-3 w-72 transform -rotate-3" style={{ animationDelay: "1s" }}>
              <div className="h-10 w-10 bg-teal-500 rounded-full flex items-center justify-center shrink-0">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Trạng thái</span>
                <span className="text-sm font-bold text-emerald-400">Đã giữ chỗ thành công</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm font-medium text-emerald-100 flex items-center justify-between">
          <span>© {new Date().getFullYear()} SmashCourt. All rights reserved.</span>
          <span>Hotline: 1900 9999</span>
        </div>
      </div>

      {/* Right Canvas - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative bg-white">
        <div className="lg:hidden absolute top-8 left-8">
          <Link href="/" className="flex items-center gap-2 text-slate-700">
            <Activity className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-lg tracking-tight">SmashCourt</span>
          </Link>
        </div>
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
