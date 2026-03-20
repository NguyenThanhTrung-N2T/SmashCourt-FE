import Link from "next/link";
import { ArrowRight, Activity, MapPin, CalendarCheck, ShieldCheck, PhoneCall } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-slate-50 text-slate-900 overflow-hidden">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">SmashCourt</span>
          </Link>
          <nav className="flex items-center gap-6 text-base font-bold">
            <Link href="/about" className="text-slate-700 hover:text-emerald-600 transition-colors">
              Giới thiệu
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-slate-500 font-bold border-r border-slate-300 pr-5 mr-1">
              <PhoneCall className="h-4 w-4" />
              <span>Hotline: 1900 9999</span>
            </div>
            <Link href="/auth/login" className="text-slate-700 hover:text-emerald-600 transition-colors">
              Đăng nhập
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full bg-emerald-600 px-6 py-2.5 text-white hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-500/30"
            >
              Đăng ký
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center relative pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 h-[600px] w-[800px] -translate-y-1/4 translate-x-1/4 rounded-full bg-emerald-400/20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[600px] translate-y-1/4 -translate-x-1/4 rounded-full bg-blue-400/10 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:flex lg:h-[80vh] lg:items-center lg:px-8">
          <div className="max-w-3xl text-center lg:text-left">
            <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-50/50 px-3 py-1 text-sm font-semibold text-emerald-600 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Hệ thống đặt sân đa chi nhánh hàng đầu
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-slate-900">
              Quản Lý & Đặt Sân Cầu Lông{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                Trực Tuyến
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 lg:mx-0 mx-auto">
              Giải pháp tối ưu hóa việc đặt sân. Hệ thống quản lý chi nhánh thông minh, giúp hội viên dễ dàng tra cứu lịch trống và thanh toán nhanh chóng chỉ với vài thao tác.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/auth/register"
                className="group flex h-14 items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 text-base font-semibold text-white transition-all hover:bg-emerald-700 hover:scale-105 active:scale-95 shadow-xl hover:shadow-emerald-500/30"
              >
                Tạo tài khoản ngay
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="flex h-14 items-center justify-center rounded-full border border-slate-300 bg-white px-8 text-base font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights beneath Hero */}
        <div className="relative z-10 bg-white border-t border-slate-200 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 text-center sm:text-left">
              <div className="flex flex-col items-center sm:items-start">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm border border-emerald-200">
                  <CalendarCheck className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Đặt sân nhanh chóng</h3>
                <p className="mt-2 text-base leading-7 text-slate-600">
                  Tra cứu lịch trống realtime của tất cả các sân trực thuộc hệ thống chi nhánh. Đặt trước, giữ chỗ trực tuyến dễ dàng.
                </p>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm border border-blue-200">
                  <MapPin className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Quản lý đa chi nhánh</h3>
                <p className="mt-2 text-base leading-7 text-slate-600">
                  Hệ thống sân bãi trải rộng khắp các quận trung tâm. Dễ dàng chuyển đổi và lựa chọn cơ sở gần bạn nhất.
                </p>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 shadow-sm border border-teal-200">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Tài khoản Hội viên</h3>
                <p className="mt-2 text-base leading-7 text-slate-600">
                  Đăng ký tài khoản để quản lý lịch sử đặt sân, thanh toán linh hoạt và nhận thông báo nhắc nhở đặt chỗ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-6 w-6 text-emerald-500" />
                <span className="text-xl font-bold text-white">SmashCourt</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                Hệ thống đặt sân cầu lông hiện đại, đáp ứng nhu cầu tập luyện và thi đấu phong trào chuyên nghiệp.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-lg">Hệ thống chi nhánh</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="font-medium text-slate-300">CS1:</span> 123 Nguyễn Văn Linh, Quận 7, TP.HCM</li>
                <li><span className="font-medium text-slate-300">CS2:</span> 45 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM</li>
                <li><span className="font-medium text-slate-300">CS3:</span> 89 Cộng Hòa, Phường 4, Tân Bình, TP.HCM</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-lg">Liên hệ</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><PhoneCall className="h-4 w-4" /> Tổng đài: 1900 9999</li>
                <li>Email: hotro@smashcourt.vn</li>
                <li>Hỗ trợ khách hàng: 08:00 - 22:00 (Thứ 2 - CN)</li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <span>© {new Date().getFullYear()} SmashCourt. All rights reserved.</span>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-white transition-colors">Điều khoản</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Bảo mật</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
