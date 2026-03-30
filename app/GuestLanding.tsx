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
  },
  {
    title: "Quản lý đa chi nhánh",
    description: "Hệ thống hỗ trợ nhiều chi nhánh với giao diện thống nhất",
    icon: Building2,
  },
  {
    title: "Chatbot hỗ trợ",
    description: "Chatbot AI giải đáp thắc mắc và hỗ trợ đặt sân 24/7",
    icon: MessageCircle,
  },
  {
    title: "Chính sách rõ ràng",
    description: "Điều kiện hủy và hoàn tiền minh bạch, dễ tra cứu",
    icon: ShieldCheck,
  },
  {
    title: "Lịch trực quan",
    description: "Xem lịch trống theo ngày, tuần hoặc tháng",
    icon: Clock3,
  },
  {
    title: "Tích điểm thành viên",
    description: "Khách hàng thân thiết nhận nhiều ưu đãi hấp dẫn",
    icon: Trophy,
  },
];

const STATS = [
  { value: "10+", label: "Chi nhánh", icon: Building2 },
  { value: "50+", label: "Sân cầu lông", icon: MapPin },
  { value: "10K+", label: "Khách hàng", icon: Users },
  { value: "99%", label: "Hài lòng", icon: Star },
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

      <main className="pt-36">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white/90 px-4 py-2 text-sm font-bold text-emerald-700 shadow-lg shadow-emerald-500/20">
                <Sparkles className="h-4 w-4" />
                Hệ thống quản lý sân cầu lông
              </div>

              <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Đặt sân cầu lông{" "}
                <span className="text-emerald-600">dễ dàng</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                SmashCourt là hệ thống quản lý và đặt sân cầu lông hiện đại, hỗ
                trợ đa chi nhánh, tích hợp chatbot AI và thanh toán online.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/auth/register"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:bg-emerald-500"
                >
                  Bắt đầu ngay
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex h-14 items-center justify-center rounded-full border-2 border-slate-300 bg-white/90 px-8 text-base font-bold text-slate-700 transition-all hover:-translate-y-1 hover:border-emerald-500"
                >
                  Tìm hiểu thêm
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {STATS.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
                    >
                      <Icon className="h-5 w-5 text-emerald-600" />
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
              <div className="rounded-[3rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-2xl shadow-emerald-500/20">
                <div className="space-y-4">
                  {/* Mock Calendar */}
                  <div className="rounded-2xl bg-white p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-950">
                        Lịch sân - Tháng 3
                      </h3>
                      <div className="flex gap-2">
                        <button
                          title="Tháng trước"
                          className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200"
                        >
                          <ArrowRight className="h-4 w-4 rotate-180" />
                        </button>
                        <button
                          title="Tháng sau"
                          className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold">
                      {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                        <div key={day} className="text-slate-500">
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: 31 }, (_, i) => (
                        <div
                          key={i}
                          className={`rounded-lg p-2 ${
                            i === 15
                              ? "bg-emerald-600 text-white"
                              : i % 3 === 0
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-50 text-slate-700"
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock Booking Card */}
                  <div className="rounded-2xl bg-emerald-600 p-4 text-white shadow-lg">
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
              <div className="absolute -top-4 -right-4 rounded-2xl bg-white p-3 shadow-xl">
                <MessageCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-2xl bg-emerald-600 p-3 shadow-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                Tính năng
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Mọi thứ bạn cần
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                Hệ thống được thiết kế đặc biệt cho mô hình kinh doanh sân cầu
                lông
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="group rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
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
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[3rem] bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-16 shadow-2xl shadow-emerald-500/30 sm:px-8 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-200">
                  Tại sao chọn chúng tôi
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Trải nghiệm đặt sân tuyệt vời
                </h2>
                <p className="mt-4 text-lg text-emerald-100">
                  Chúng tôi cam kết mang đến trải nghiệm tốt nhất với công nghệ
                  hiện đại
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {BENEFITS.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                      <span className="text-sm font-semibold text-white">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur-sm">
                  <Users className="h-10 w-10 text-emerald-200" />
                  <p className="mt-4 text-2xl font-black text-white">10,000+</p>
                  <p className="mt-2 text-sm text-emerald-100">
                    Khách hàng tin tưởng
                  </p>
                </div>
                <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur-sm">
                  <Star className="h-10 w-10 text-emerald-200" />
                  <p className="mt-4 text-2xl font-black text-white">4.9/5</p>
                  <p className="mt-2 text-sm text-emerald-100">
                    Đánh giá từ người dùng
                  </p>
                </div>
                <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur-sm">
                  <Zap className="h-10 w-10 text-emerald-200" />
                  <p className="mt-4 text-2xl font-black text-white">24/7</p>
                  <p className="mt-2 text-sm text-emerald-100">
                    Hỗ trợ khách hàng
                  </p>
                </div>
                <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur-sm">
                  <ShieldCheck className="h-10 w-10 text-emerald-200" />
                  <p className="mt-4 text-2xl font-black text-white">100%</p>
                  <p className="mt-2 text-sm text-emerald-100">
                    Bảo mật thông tin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Sẵn sàng đặt sân?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Đăng ký tài khoản miễn phí và trải nghiệm hệ thống đặt sân hiện
              đại
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/register"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:bg-emerald-500"
              >
                Đăng ký miễn phí
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex h-14 items-center justify-center rounded-full border-2 border-slate-300 bg-white px-8 text-base font-bold text-slate-700 transition-all hover:-translate-y-1 hover:border-emerald-500"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-slate-200 bg-white/90 p-8 shadow-xl sm:p-12">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Hotline
                  </p>
                  <p className="text-lg font-bold text-slate-950">1900 9999</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Email</p>
                  <p className="text-lg font-bold text-slate-950">
                    support@smashcourt.vn
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Địa chỉ
                  </p>
                  <p className="text-lg font-bold text-slate-950">
                    TP. Hồ Chí Minh
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicSiteFooter />
      <ChatbotWidget />
    </div>
  );
}
