import {
  CalendarClock,
  ShieldCheck,
  TimerReset,
  AlertCircle,
} from "lucide-react";

import CancellationPolicyPreview from "@/src/customer/components/CancellationPolicyPreview";

export const metadata = {
  title: "Chính sách hủy | SmashCourt",
  description: "Chính sách hủy sân và hoàn tiền tại SmashCourt",
};

export default function CancellationPolicyPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="overflow-hidden rounded-[3rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 px-6 py-12 shadow-xl sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white/90 px-4 py-2 text-sm font-bold text-emerald-700 shadow-lg shadow-emerald-500/20">
              <TimerReset className="h-4 w-4" />
              Chính sách hủy sân
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Chính sách <span className="text-emerald-600">minh bạch</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Chúng tôi cam kết mang đến chính sách hủy sân rõ ràng và công
              bằng. Dữ liệu được đồng bộ trực tiếp từ hệ thống.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl">
              <ShieldCheck className="h-10 w-10 text-emerald-400" />
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-emerald-400">
                Minh bạch
              </p>
              <p className="mt-3 text-lg font-bold leading-7">
                Thông tin công khai rõ ràng
              </p>
            </div>

            <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
              <CalendarClock className="h-10 w-10 text-emerald-700" />
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-emerald-700">
                Dễ tra cứu
              </p>
              <p className="mt-3 text-lg font-bold leading-7 text-slate-950">
                Trình bày dễ hiểu
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="rounded-[2.5rem] border border-amber-200 bg-amber-50 px-6 py-8 shadow-sm sm:px-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900">
              Lưu ý quan trọng
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-800">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>
                  Chính sách áp dụng cho tất cả chi nhánh trong hệ thống
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>
                  Thời gian hủy tính từ lúc bạn hủy đến giờ bắt đầu đặt sân
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>
                  Tiền hoàn chuyển về tài khoản trong 3-5 ngày làm việc
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>Liên hệ hotline 1900 9999 nếu cần hỗ trợ</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Policy Preview */}
      <CancellationPolicyPreview anchorId="cancellation-policy" />

      {/* CTA Section */}
      <section className="rounded-[3rem] border border-emerald-200 bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-12 shadow-2xl shadow-emerald-500/30 sm:px-8 lg:px-12">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Còn thắc mắc?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-100">
            Đội ngũ hỗ trợ luôn sẵn sàng giải đáp
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="tel:19009999"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-bold text-emerald-600 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              Gọi hotline: 1900 9999
            </a>
            <a
              href="mailto:support@smashcourt.vn"
              className="inline-flex h-14 items-center justify-center rounded-full border-2 border-white/30 bg-transparent px-8 text-base font-bold text-white transition-all hover:-translate-y-1 hover:bg-white/10"
            >
              Email hỗ trợ
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
