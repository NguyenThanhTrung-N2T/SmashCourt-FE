import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Users,
  MapPin,
  MessageCircle,
  Zap,
  Trophy,
  Target,
  Heart,
  CheckCircle2,
} from "lucide-react";

const PRINCIPLES = [
  {
    title: "Đa chi nhánh",
    description: "Quản lý nhiều chi nhánh trong một hệ thống thống nhất",
    icon: Building2,
  },
  {
    title: "Đặt sân thông minh",
    description: "Hệ thống đặt sân tự động với lịch real-time",
    icon: CalendarClock,
  },
  {
    title: "Chatbot AI",
    description: "Chatbot thông minh hỗ trợ khách hàng 24/7",
    icon: MessageCircle,
  },
  {
    title: "Bảo mật cao",
    description: "Thông tin được bảo mật tuyệt đối, thanh toán an toàn",
    icon: ShieldCheck,
  },
];

const FEATURES = [
  {
    title: "Quản lý sân",
    description: "Quản lý thông tin sân, giá cả và trạng thái",
    icon: MapPin,
  },
  {
    title: "Đặt sân online",
    description: "Khách hàng đặt sân trực tuyến với giao diện thân thiện",
    icon: CalendarClock,
  },
  {
    title: "Thanh toán",
    description: "Hỗ trợ VNPay, chuyển khoản và tiền mặt",
    icon: Zap,
  },
  {
    title: "Thành viên",
    description: "Hệ thống tích điểm và phân hạng thành viên",
    icon: Trophy,
  },
  {
    title: "Báo cáo",
    description: "Báo cáo doanh thu và hiệu suất kinh doanh",
    icon: Target,
  },
  {
    title: "Hỗ trợ",
    description: "Đội ngũ hỗ trợ nhiệt tình, sẵn sàng giải đáp",
    icon: Heart,
  },
];

const VALUES = [
  "Khách hàng là trung tâm",
  "Minh bạch trong mọi giao dịch",
  "Công nghệ hiện đại, dễ sử dụng",
  "Hỗ trợ 24/7",
  "Bảo mật thông tin",
  "Liên tục cải tiến",
];

export const metadata = {
  title: "Giới thiệu | SmashCourt",
  description:
    "Tìm hiểu về SmashCourt - Hệ thống quản lý và đặt sân cầu lông hiện đại",
};

export default function AboutPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="overflow-hidden rounded-[3rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 px-6 py-12 shadow-xl sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white/90 px-4 py-2 text-sm font-bold text-emerald-700 shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-4 w-4" />
              Về chúng tôi
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Hệ thống quản lý sân cầu lông{" "}
              <span className="text-emerald-600">hiện đại</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              SmashCourt được phát triển để số hóa và hiện đại hóa ngành kinh
              doanh sân cầu lông tại Việt Nam. Chúng tôi mang đến giải pháp toàn
              diện cho cả chủ sân và người chơi.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/auth/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:bg-emerald-500"
              >
                Bắt đầu sử dụng
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/cancellation-policy"
                className="inline-flex h-12 items-center justify-center rounded-full border-2 border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:-translate-y-1 hover:border-emerald-500"
              >
                Xem chính sách
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-lg sm:col-span-2">
              <Building2 className="h-10 w-10 text-emerald-600" />
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-emerald-600">
                Sứ mệnh
              </p>
              <p className="mt-3 text-xl font-bold leading-8 text-slate-950">
                Mang đến trải nghiệm đặt sân tốt nhất
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl">
              <Users className="h-10 w-10 text-emerald-400" />
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-emerald-400">
                Phục vụ
              </p>
              <p className="mt-3 text-lg font-bold leading-7">
                Hàng nghìn khách hàng
              </p>
            </div>

            <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
              <MonitorSmartphone className="h-10 w-10 text-emerald-700" />
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-emerald-700">
                Công nghệ
              </p>
              <p className="mt-3 text-lg font-bold leading-7 text-slate-950">
                Hiện đại, bảo mật cao
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section>
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
            Giá trị cốt lõi
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Tại sao chọn SmashCourt?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Chúng tôi cam kết mang đến giải pháp tốt nhất
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((item) => {
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
      </section>

      {/* Features Section */}
      <section className="rounded-[3rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-6 py-12 shadow-xl sm:px-8 lg:px-12">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
            Tính năng
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Hệ thống toàn diện
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Đầy đủ tính năng để vận hành sân cầu lông chuyên nghiệp
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Values Section */}
      <section className="rounded-[3rem] border border-emerald-200 bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-12 shadow-2xl shadow-emerald-500/30 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-200">
              Giá trị của chúng tôi
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Cam kết với khách hàng
            </h2>
            <p className="mt-4 text-lg text-emerald-100">
              Chúng tôi luôn đặt khách hàng lên hàng đầu
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {VALUES.map((value) => (
              <div
                key={value}
                className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                <span className="text-sm font-semibold text-white">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-[3rem] border border-slate-200 bg-white/90 px-6 py-12 shadow-xl sm:px-8 lg:px-12">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Đăng ký tài khoản miễn phí và khám phá hệ thống
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/register"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:bg-emerald-500"
            >
              Đăng ký ngay
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/cancellation-policy"
              className="inline-flex h-14 items-center justify-center rounded-full border-2 border-slate-300 bg-white px-8 text-base font-bold text-slate-700 transition-all hover:-translate-y-1 hover:border-emerald-500"
            >
              Xem chính sách
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
