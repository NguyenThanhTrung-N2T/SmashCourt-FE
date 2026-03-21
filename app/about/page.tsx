import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Monitor,
  ShieldCheck,
  PhoneCall,
  Building2,
  CalendarCheck,
  TrendingUp,
  Star,
} from "lucide-react";

export const metadata = {
  title: "Giới thiệu | SmashCourt",
  description:
    "Tìm hiểu về SmashCourt - Hệ thống quản lý và đặt sân cầu lông trực tuyến quy mô nhất.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200">
      {/* Navbar Minimal */}
      <header className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-base font-extrabold tracking-tight text-slate-800 transition-colors hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Về trang chủ
          </Link>
          <div className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-100/80 px-4 py-1.5 rounded-full text-sm">
            <PhoneCall className="h-4 w-4" />
            Hotline: 1900 9999
          </div>
        </div>
      </header>

      <main className="pt-24 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="text-center pt-16 pb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm mb-6">
              <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" /> Nền
              tảng Đặt Sân Hàng Đầu
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
              Vượt trội với giải pháp <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                Quản Lý Sân Nhánh Nội Bộ
              </span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-medium">
              Phần mềm quản lý đặt sân và hội viên chuyên nghiệp dành riêng cho
              vận hành hệ thống chuỗi cơ sở thể thao. Trải nghiệm nhanh chóng,
              đồng bộ và minh bạch.
            </p>
          </div>

          {/* Bento Grid Layout cho Tính năng & Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {/* Box 1: Sứ mệnh (Large) */}
            <div className="md:col-span-2 relative bg-white rounded-3xl p-10 border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp
                  className="w-48 h-48 text-emerald-600"
                  strokeWidth={1}
                />
              </div>
              <div className="relative z-10 w-full md:w-2/3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                  <Monitor className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">
                  Số Hóa Toàn Diện Quy Trình
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Tạm biệt phương pháp ghi chép sổ sách thủ công gây nhầm lẫn.
                  Nền tảng cho phép mọi hội viên tra cứu lịch trống realtime ở
                  mọi chi nhánh, tự động chốt giờ và ngăn ngừa 100% tình trạng
                  trùng lịch sân.
                </p>
              </div>
            </div>

            {/* Box 2: AI Integration */}
            <div className="bg-emerald-600 text-white rounded-3xl p-10 shadow-md relative overflow-hidden group">
              <div className="absolute top-[0%] right-[0%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/40 via-transparent to-transparent" />
              <div className="relative z-10 w-full">
                <div className="h-12 w-12 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-6">
                  <Star className="h-6 w-6 fill-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Trợ Lý AI Thông Minh
                </h3>
                <p className="text-emerald-50 text-base lg:text-lg leading-relaxed mb-4">
                  Ứng dụng AI thông minh trên hệ thống mang đến trợ lý Chatbot
                  tư vấn giải đáp siêu tốc 24/7. Đồng thời, hệ thống phân tích
                  lịch sử thuê sân của bạn để tự động{" "}
                  <span className="font-bold underline decoration-emerald-300 text-white">
                    gợi ý các khung giờ trống
                  </span>{" "}
                  lý tưởng nhất.
                </p>
              </div>
            </div>

            {/* Box 3: Bảo mật */}
            <div className="bg-slate-900 text-white rounded-3xl p-10 border border-slate-800 shadow-lg group">
              <div className="h-12 w-12 rounded-2xl bg-white/10 text-teal-400 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Bảo Mật & Ổn Định</h3>
              <p className="text-slate-400 text-base leading-relaxed">
                Chi phí, danh sách thành viên và lịch sử đánh sân được lưu trữ
                hoàn toàn bảo mật. Backup dữ liệu đám mây hàng giờ đảm bảo hệ
                thống vận hành trơn tru xuyên suốt các mùa giải cao điểm.
              </p>
            </div>

            {/* Box 4: Multi-Branch & Contact (Large width) */}
            <div className="md:col-span-2 bg-white rounded-3xl p-10 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">
                  Mạng Lưới Chi Nhánh Đồng Bộ
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed mb-8">
                  Chỉ cần 1 mã hội viên, cho phép khách hàng linh hoạt di chuyển
                  và đặt sân ở bất kỳ quận nào thuộc cùng thương hiệu. Dưới đây
                  là các chi nhánh trọng điểm:
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                  <div className="flex items-center gap-2 font-bold mb-2 text-slate-900">
                    <MapPin className="h-4 w-4 text-emerald-600" /> Quận 7,
                    TP.HCM
                  </div>
                  <div className="text-slate-500 text-sm">
                    123 Nguyễn Văn Linh. Quy mô: 12 sân (Thảm tiêu chuẩn BWF).
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                  <div className="flex items-center gap-2 font-bold mb-2 text-slate-900">
                    <MapPin className="h-4 w-4 text-emerald-600" /> Quận 1,
                    TP.HCM
                  </div>
                  <div className="text-slate-500 text-sm">
                    45 Lê Lợi, Bến Nghé. Quy mô: 8 sân (Cam kết dịch vụ VIP).
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                  <div className="flex items-center gap-2 font-bold mb-2 text-slate-900">
                    <MapPin className="h-4 w-4 text-emerald-600" /> Tây Hồ, Hà
                    Nội
                  </div>
                  <div className="text-slate-500 text-sm">
                    22 Lạc Long Quân. Quy mô: 16 sân (Nhà thi đấu quy mô lớn).
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <div className="text-emerald-700 font-semibold flex items-center gap-2 text-sm">
                    <PhoneCall className="h-4 w-4" /> Liên hệ hợp tác nhượng
                    quyền
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 text-center bg-emerald-950 text-white py-20 px-6 rounded-[2.5rem] shadow-xl relative overflow-hidden border border-emerald-900">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/30 via-emerald-950 to-emerald-950"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                <CalendarCheck className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
                Bạn đã sẵn sàng bước vào sân?
              </h2>
              <p className="text-emerald-100/80 mb-10 max-w-xl mx-auto text-lg leading-relaxed font-medium">
                Tạo tài khoản đa hệ thống trong 30 giây để bắt đầu tra cứu lịch
                trống và trực tiếp đặt sân hôm nay. Hỗ trợ sự cố kỹ thuật thông
                qua Hotline 1900 9999.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex h-14 items-center justify-center rounded-full bg-emerald-500 text-white px-10 text-lg font-bold hover:bg-emerald-400 transition-all shadow-lg hover:shadow-emerald-500/30 active:scale-95"
              >
                Đăng ký tài khoản hội viên
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
