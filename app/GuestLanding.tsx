"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";

export default function GuestLanding() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
      <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              SmashCourt
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-base font-bold">
            <Link
              href="/about"
              className="text-slate-700 transition-colors hover:text-emerald-600"
            >
              Giới thiệu
            </Link>
            <div className="mr-1 hidden items-center gap-2 border-r border-slate-300 pr-5 font-bold text-slate-500 sm:flex">
              <PhoneCall className="h-4 w-4" />
              <span>Hotline: 1900 9999</span>
            </div>
            <Link
              href="/auth/login"
              className="text-slate-700 transition-colors hover:text-emerald-600"
            >
              Đăng nhập
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full bg-emerald-600 px-6 py-2.5 text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-emerald-500/30"
            >
              Đăng ký
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute right-0 top-0 h-[600px] w-[800px] translate-x-1/4 -translate-y-1/4 rounded-full bg-emerald-400/20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[600px] -translate-x-1/4 translate-y-1/4 rounded-full bg-blue-400/10 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:flex lg:h-[80vh] lg:items-center lg:px-8">
          <div className="max-w-3xl text-center lg:text-left">
            <div className="mb-6 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-50/50 px-3 py-1 text-sm font-semibold text-emerald-600">
              <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Hệ thống đặt sân đa chi nhánh hàng đầu
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Quản Lý & Đặt Sân Cầu Lông{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Trực Tuyến
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 lg:mx-0">
              Giải pháp tối ưu hóa việc đặt sân. Hệ thống quản lý chi nhánh
              thông minh, giúp hội viên dễ dàng tra cứu lịch trống và thanh toán
              nhanh chóng chỉ với vài thao tác.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/auth/register"
                className="group flex h-14 items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 text-base font-semibold text-white shadow-xl transition-all hover:scale-105 hover:bg-emerald-700 hover:shadow-emerald-500/30 active:scale-95"
              >
                Tạo tài khoản ngay
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="flex h-14 items-center justify-center rounded-full border border-slate-300 bg-white px-8 text-base font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-slate-200 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-center sm:text-left lg:mx-0 lg:max-w-none lg:grid-cols-3 sm:gap-y-20">
              <div className="flex flex-col items-center sm:items-start">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-100 text-emerald-600 shadow-sm">
                  <CalendarCheck className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Đặt sân nhanh chóng
                </h3>
                <p className="mt-2 text-base leading-7 text-slate-600">
                  Tra cứu lịch trống realtime của tất cả các sân trực thuộc hệ
                  thống chi nhánh. Đặt trước, giữ chỗ trực tuyến dễ dàng.
                </p>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-100 text-blue-600 shadow-sm">
                  <MapPin className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Quản lý đa chi nhánh
                </h3>
                <p className="mt-2 text-base leading-7 text-slate-600">
                  Hệ thống sân bãi trải rộng khắp các quận trung tâm. Dễ dàng
                  chuyển đổi và lựa chọn cơ sở gần bạn nhất.
                </p>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-200 bg-teal-100 text-teal-600 shadow-sm">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Tài khoản Hội viên
                </h3>
                <p className="mt-2 text-base leading-7 text-slate-600">
                  Đăng ký tài khoản để quản lý lịch sử đặt sân, thanh toán linh
                  hoạt và nhận thông báo nhắc nhở đặt chỗ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 py-12 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 grid grid-cols-1 gap-8 border-b border-slate-800 pb-8 md:grid-cols-3">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-6 w-6 text-emerald-500" />
                <span className="text-xl font-bold text-white">SmashCourt</span>
              </div>
              <p className="mb-4 text-sm leading-relaxed">
                Hệ thống đặt sân cầu lông hiện đại, đáp ứng nhu cầu tập luyện và
                thi đấu phong trào chuyên nghiệp.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-semibold text-white">
                Hệ thống chi nhánh
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="font-medium text-slate-300">CS1:</span> 123
                  Nguyễn Văn Linh, Quận 7, TP.HCM
                </li>
                <li>
                  <span className="font-medium text-slate-300">CS2:</span> 45 Lê
                  Lợi, Phường Bến Nghé, Quận 1, TP.HCM
                </li>
                <li>
                  <span className="font-medium text-slate-300">CS3:</span> 89
                  Cộng Hòa, Phường 4, Tân Bình, TP.HCM
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-semibold text-white">Liên hệ</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4" /> Tổng đài: 1900 9999
                </li>
                <li>Email: hotro@smashcourt.vn</li>
                <li>Hỗ trợ khách hàng: 08:00 - 22:00 (Thứ 2 - CN)</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
            <span>
              © {new Date().getFullYear()} SmashCourt. All rights reserved.
            </span>
            <div className="flex gap-6">
              <Link
                href="/terms"
                className="transition-colors hover:text-white"
              >
                Điều khoản
              </Link>
              <Link
                href="/privacy"
                className="transition-colors hover:text-white"
              >
                Bảo mật
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
