import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Đăng nhập | SmashCourt",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-[#F4F6F2] font-sans">

      {/* Left Column: Image Background & Overlay (LG Screens only) */}
      <div className="relative hidden overflow-hidden bg-[#071F14] p-12 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between">

        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/login_sidebar.webp"
            alt="SmashCourt Sports Background"
            fill
            priority
            className="object-cover object-center brightness-[0.55] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#071F14]/75 via-[#071F14]/40 to-[#071F14]/90" />
          <div className="absolute left-[-10%] top-[-20%] h-[120%] w-[120%] bg-[radial-gradient(circle_at_top_right,_rgba(179,245,110,0.1),_transparent_45%)]" />
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight tracking-wider text-white">
              SmashCourt <span className="text-white/40 font-normal">|</span> <span className="text-[#B3F56E] font-bold">Đăng nhập</span>
            </span>
          </div>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:border-lime-300 hover:text-white"
          >
            {/* Inline SVG back arrow */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
            </svg>
            <span>Trang chủ</span>
          </Link>
        </div>

        {/* Headline */}
        <div className="relative z-10 max-w-lg mb-12">
          <h1 className="relative z-20 mb-6 text-5xl font-black leading-[1.15] tracking-tight drop-shadow-md">
            Tối ưu cho <br />
            <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">
              Hiệu suất Vượt trội.
            </span>
          </h1>

          <p className="relative z-20 max-w-md text-sm font-semibold leading-relaxed text-slate-350 drop-shadow-sm">
            Trải nghiệm hệ thống sân tập chuẩn thi đấu, đội ngũ huấn luyện viên chuyên môn cao và cộng đồng người chơi năng động.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span>© {new Date().getFullYear()} SmashCourt. Bảo lưu mọi quyền.</span>
          <span>Hotline: 1900 9999</span>
        </div>
      </div>

      {/* Right Column: Authentication Card Form */}
      <div className="relative flex w-full flex-col items-center justify-center p-6 sm:p-12 lg:w-1/2">
        <div className="absolute left-8 top-8 lg:hidden">
          <Link href="/" className="flex items-center gap-1.5 text-slate-800">
            <span className="text-lg font-black tracking-tight">SmashCourt</span>
          </Link>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
