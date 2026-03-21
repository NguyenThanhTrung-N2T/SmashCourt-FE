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
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <div className="relative hidden overflow-hidden bg-emerald-700 p-12 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        <div className="absolute inset-0 z-0 opacity-90">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-blue-900 mix-blend-multiply" />
          <div className="absolute left-[-10%] top-[-20%] h-[120%] w-[120%] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/30 via-transparent to-transparent" />
          <div className="absolute right-[10%] top-[20%] h-[2px] w-[200%] rotate-[-15deg] bg-white/10" />
          <div className="absolute right-[15%] top-[30%] h-[2px] w-[200%] rotate-[-15deg] bg-white/10" />
          <div className="absolute right-[20%] top-[40%] h-[2px] w-[200%] rotate-[-15deg] bg-white/10" />
        </div>

        <div className="relative z-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-base font-extrabold tracking-tight text-white backdrop-blur-sm transition-colors hover:text-emerald-200"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Trang chủ</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="mb-8 flex w-max items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 shadow-inner backdrop-blur-sm">
            <Activity className="h-6 w-6 text-emerald-300" />
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">
              SmashCourt
            </span>
          </div>

          <h1 className="relative z-20 mb-6 text-4xl font-extrabold leading-tight tracking-tight drop-shadow-lg sm:text-5xl">
            Quản lý sân tập <br />
            chuyên nghiệp
          </h1>

          <p className="relative z-20 mb-12 max-w-md text-lg font-medium leading-relaxed text-emerald-50 drop-shadow">
            Hệ thống đặt sân đa chi nhánh hàng đầu. Đăng nhập để sử dụng tính
            năng giữ chỗ và kiểm tra lịch trống.
          </p>

          <div className="relative z-10 hidden h-48 w-full max-w-md xl:block">
            <div className="absolute right-0 top-0 flex w-64 rotate-2 animate-[bounce_4s_infinite] items-center gap-3 rounded-2xl border border-emerald-100 bg-white p-4 text-slate-800 shadow-xl">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <svg
                  className="h-5 w-5 fill-emerald-500 text-emerald-500"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  AI Đề xuất
                </span>
                <span className="text-sm font-bold text-slate-900">
                  Sân VIP 1 - 19:00
                </span>
              </div>
            </div>

            <div
              className="absolute bottom-4 left-4 flex w-72 -rotate-3 animate-[bounce_5s_infinite] items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white shadow-2xl"
              style={{ animationDelay: "1s" }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Trạng thái
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  Đã giữ chỗ thành công
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-sm font-medium text-emerald-100">
          <span>© {new Date().getFullYear()} SmashCourt. All rights reserved.</span>
          <span>Hotline: 1900 9999</span>
        </div>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center bg-white p-8 sm:p-12 lg:w-1/2">
        <div className="absolute left-8 top-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2 text-slate-700">
            <Activity className="h-6 w-6 text-emerald-600" />
            <span className="text-lg font-bold tracking-tight">SmashCourt</span>
          </Link>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
