"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  Clock3,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Building2,
  MessageCircle,
  Zap,
  Star,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import PublicInfoHeader from "@/src/customer/components/PublicInfoHeader";
import PublicSiteFooter from "@/src/customer/components/PublicSiteFooter";
import ChatbotWidget from "@/src/customer/components/ChatbotWidget";

const FEATURES = [
  {
    title: "Đặt sân nhanh",
    description: "Chọn sân và khung giờ trong vài bước đơn giản",
    icon: CalendarCheck2,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Quản lý đa chi nhánh",
    description: "Hệ thống hỗ trợ nhiều chi nhánh với giao diện thống nhất",
    icon: Building2,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Chatbot hỗ trợ",
    description: "Chatbot AI giải đáp thắc mắc và hỗ trợ đặt sân 24/7",
    icon: MessageCircle,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Chính sách rõ ràng",
    description: "Điều kiện hủy và hoàn tiền minh bạch, dễ tra cứu",
    icon: ShieldCheck,
    color: "from-amber-500 to-orange-500",
  },
  {
    title: "Lịch trực quan",
    description: "Xem lịch trống theo ngày, tuần hoặc tháng",
    icon: Clock3,
    color: "from-rose-500 to-red-500",
  },
  {
    title: "Tích điểm thành viên",
    description: "Khách hàng thân thiết nhận nhiều ưu đãi hấp dẫn",
    icon: Trophy,
    color: "from-indigo-500 to-violet-500",
  },
];

const STATS = [
  {
    value: "10+",
    label: "Chi nhánh",
    icon: Building2,
    color: "text-emerald-600",
  },
  { value: "50+", label: "Sân cầu lông", icon: MapPin, color: "text-blue-600" },
  { value: "10K+", label: "Khách hàng", icon: Users, color: "text-purple-600" },
  { value: "99%", label: "Hài lòng", icon: Star, color: "text-amber-600" },
];

const BENEFITS = [
  "Đặt sân online mọi lúc, mọi nơi",
  "Xem lịch trống real-time",
  "Thanh toán an toàn qua VNPay",
  "Nhận thông báo qua SMS/Email",
  "Tích điểm đổi quà hấp dẫn",
  "Hỗ trợ chatbot AI 24/7",
];

export default function GuestLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white font-sans text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.15),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.1),_transparent_25%)]" />
      <PublicInfoHeader />

      <main className="pt-32">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white/90 px-4 py-2 text-sm font-bold text-emerald-700 shadow-lg shadow-emerald-500/20 animate-pulse">
                <Sparkles className="h-4 w-4" />
                Hệ thống quản lý sân cầu lông
              </div>

              <h1 className="mt-5 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Đặt sân cầu lông{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  dễ dàng
                </span>{" "}
                và{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  tiện lợi
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                SmashCourt là hệ thống quản lý và đặt sân cầu lông hiện đại, hỗ
                trợ đa chi nhánh, tích hợp chatbot AI và thanh toán online.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth/register"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-8 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/40"
                >
                  Bắt đầu ngay
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex h-14 items-center justify-center rounded-full border-2 border-slate-300 bg-white/90 px-8 text-base font-bold text-slate-700 transition-all hover:-translate-y-1 hover:border-emerald-500 hover:bg-emerald-50"
                >
                  Tìm hiểu thêm
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {STATS.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="group rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-emerald-200"
                    >
                      <Icon
                        className={`h-5 w-5 ${stat.color} transition-transform group-hover:scale-110`}
                      />
                      <p className="mt-2 text-2xl font-black text-slate-950">
                        {stat.value}
                      </p>
                      <p className="text-xs font-semibold text-slate-500">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="rounded-[3rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-2xl shadow-emerald-500/20">
                <div className="space-y-3">
                  {/* Mock Calendar */}
                  <div className="rounded-2xl bg-white p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-950">
                        Lịch sân - Tháng 3
                      </h3>
                      <div className="flex gap-2">
                        <button
                          title="Tháng trước"
                          className="rounded-lg bg-slate-100 p-2 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                        >
                          <ArrowRight className="h-4 w-4 rotate-180" />
                        </button>
                        <button
                          title="Tháng sau"
                          className="rounded-lg bg-slate-100 p-2 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold">
                      {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                        <div key={day} className="text-slate-500">
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: 31 }, (_, i) => (
                        <div
                          key={i}
                          className={`rounded-lg p-2 transition-all hover:scale-105 ${
                            i === 15
                              ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md"
                              : i % 3 === 0
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-50 text-slate-700 hover:bg-emerald-50"
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock Booking Card */}
                  <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 p-4 text-white shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white/20 p-2">
                        <CalendarCheck2 className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold">Sân số 3 - Chi nhánh Quận 1</p>
                        <p className="text-sm text-emerald-100">
                          15:00 - 17:00, 15/03/2024
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 rounded-2xl bg-white p-3 shadow-xl animate-bounce">
                <MessageCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3 shadow-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                Tính năng nổi bật
              </p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Mọi thứ bạn cần
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">
                Hệ thống được thiết kế đặc biệt cho mô hình kinh doanh sân cầu
                lông
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="group rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl hover:border-emerald-200"
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-110`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[3rem] border border-emerald-200 bg-gradient-to-br from-emerald-600 to-teal-600 px-6 py-12 shadow-2xl shadow-emerald-500/30 sm:px-8 lg:px-12">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-emerald-200">
                    Lợi ích
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Tại sao chọn SmashCourt?
                  </h2>
                  <p className="mt-3 text-lg text-emerald-100">
                    Trải nghiệm đặt sân hiện đại với nhiều ưu đãi hấp dẫn
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {BENEFITS.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20"
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-200 shrink-0" />
                      <span className="text-sm font-semibold text-white">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Sẵn sàng đặt sân?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">
              Đăng ký tài khoản miễn phí và trải nghiệm hệ thống đặt sân hiện
              đại
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/register"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-8 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/40"
              >
                Đăng ký miễn phí
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex h-14 items-center justify-center rounded-full border-2 border-slate-300 bg-white px-8 text-base font-bold text-slate-700 transition-all hover:-translate-y-1 hover:border-emerald-500 hover:bg-emerald-50"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicSiteFooter />
      <ChatbotWidget />
    </div>
  );
}
