"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  MagnifyingGlass,
  Bell,
  Sun,
  Building,
  Clock,
  Trophy,
  DeviceMobile,
  ShieldCheck,
  Sparkle
} from "@phosphor-icons/react";
import { CancellationPolicyPreview } from "@/src/features/policy/customer/CancellationPolicyPreview";

export default function GuestLanding() {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sections = ["about", "courts", "policy"];
    const observerOptions = {
      root: null,
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection("home");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveSection(id);
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.getElementById(id);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F2] font-sans text-[#1C2C24]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-[#071F14]/90 backdrop-blur-md border-b border-white/5 text-white">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-lime-300 bg-clip-text text-transparent">
              SmashCourt
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-350">
            <a
              href="/"
              onClick={(e) => handleScrollTo(e, "home")}
              className={`pb-1 transition-all duration-200 cursor-pointer ${activeSection === "home"
                  ? "text-lime-350 border-b-2 border-lime-350"
                  : "text-slate-350 hover:text-white"
                }`}
            >
              Trang chủ
            </a>
            <a
              href="#about"
              onClick={(e) => handleScrollTo(e, "about")}
              className={`pb-1 transition-all duration-200 cursor-pointer ${activeSection === "about"
                  ? "text-lime-350 border-b-2 border-lime-350"
                  : "text-slate-350 hover:text-white"
                }`}
            >
              Giới thiệu
            </a>
            <a
              href="#courts"
              onClick={(e) => handleScrollTo(e, "courts")}
              className={`pb-1 transition-all duration-200 cursor-pointer ${activeSection === "courts"
                  ? "text-lime-350 border-b-2 border-lime-350"
                  : "text-slate-350 hover:text-white"
                }`}
            >
              Sân tập
            </a>
            <a
              href="#policy"
              onClick={(e) => handleScrollTo(e, "policy")}
              className={`pb-1 transition-all duration-200 cursor-pointer ${activeSection === "policy"
                  ? "text-lime-350 border-b-2 border-lime-350"
                  : "text-slate-350 hover:text-white"
                }`}
            >
              Chính sách
            </a>
          </nav>

          <div className="flex items-center gap-6">
            <button className="text-slate-300 hover:text-white transition-colors p-1 cursor-pointer" aria-label="Tìm kiếm">
              <MagnifyingGlass size={20} weight="bold" />
            </button>
            <button className="text-slate-300 hover:text-white transition-colors p-1 cursor-pointer" aria-label="Thông báo">
              <Bell size={20} weight="bold" />
            </button>
            <button className="text-slate-300 hover:text-white transition-colors p-1 cursor-pointer" aria-label="Đổi giao diện">
              <Sun size={20} weight="bold" />
            </button>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-[#B3F56E] hover:bg-[#a2e05f] text-[#071F14] text-sm font-extrabold px-5 py-2.5 rounded-full transition-all hover:scale-105 shadow-lg shadow-lime-500/10"
            >
              Đặt sân ngay
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[680px] bg-[#071F14] text-white overflow-hidden">
        {/* Background Hero Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/badminton_court_hero.webp"
            alt="Vợt cầu lông SmashCourt trên sân"
            fill
            priority
            className="object-cover object-center brightness-[0.7] contrast-[1.05]"
          />
          {/* Rich Dark Green Overlay and shadow gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#071F14] via-[#071F14]/40 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#071F14]/70 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 h-full flex flex-col justify-end pb-20">
          <div className="max-w-4xl">
            <h1 className="text-6xl sm:text-7xl font-black tracking-tight leading-[1.05] drop-shadow-md">
              Cầu lông <br />
              Mọi lúc, mọi nơi
            </h1>

            {/* Bottom-left overlay badge with member avatars */}
            <div className="mt-10 flex items-center gap-4">
              <div className="inline-flex items-center gap-3 bg-black/45 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5">
                <div className="flex -space-x-2.5">
                  <div className="h-7 w-7 rounded-full bg-emerald-500 border-2 border-[#071F14] overflow-hidden flex items-center justify-center text-[9px] font-bold">JD</div>
                  <div className="h-7 w-7 rounded-full bg-amber-550 border-2 border-[#071F14] overflow-hidden flex items-center justify-center text-[9px] font-bold">MK</div>
                  <div className="h-7 w-7 rounded-full bg-teal-500 border-2 border-[#071F14] overflow-hidden flex items-center justify-center text-[9px] font-bold">SL</div>
                </div>
                <span className="text-xs font-bold tracking-tight text-white/90">1.200+ Thành viên</span>
              </div>

              <Link
                href="/auth/register"
                className="h-11 w-11 rounded-full bg-white hover:bg-[#B3F56E] text-[#071F14] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg shadow-white/5"
              >
                <ArrowUpRight size={18} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Second Section: Two Column Layout */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid gap-16 lg:grid-cols-12 items-start">
          {/* Left Column: Court Layout Diagram with Stats */}
          <div className="lg:col-span-5">
            <div className="relative rounded-[2rem] bg-gradient-to-b from-[#163827] to-[#0D261A] p-6 text-white shadow-2xl shadow-emerald-950/20 aspect-[4/5] flex flex-col justify-between overflow-hidden border border-emerald-800/20">

              {/* Badminton Court Grid SVG diagram */}
              <div className="relative flex-1 flex items-center justify-center p-4">
                <Image
                  src="/images/from_top.webp"
                  alt="Góc nhìn từ trên cao xuống"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Stats overlay */}
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
                <div>
                  <span className="text-4xl sm:text-5xl font-black tracking-tight">91%</span>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#B3F56E] mt-1">Hài lòng</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight">68%</span>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#B3F56E] mt-1">Sẵn sàng thi đấu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Content and Thumbnails */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full min-h-[420px]">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#071F14] leading-tight">
                Không gian thi đấu chuyên nghiệp
              </h2>

              {/* Thumbnails list */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                  <Image
                    src="/images/thumb_badminton_serve.webp"
                    alt="Đập cầu lông"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                  <Image
                    src="/images/thumb_badminton_shuttlecocks.webp"
                    alt="Quả cầu lông trong hộp"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                  <Image
                    src="/images/thumb_badminton_run.webp"
                    alt="Bộ pháp di chuyển cầu lông"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            <div className="mt-12">
              <p className="text-lg text-slate-700 leading-relaxed font-medium">
                Trải nghiệm cầu lông trong không gian sáng, thoáng đãng, được thiết kế giúp bạn tập trung,
                di chuyển linh hoạt và phát triển. Nơi mỗi buổi tập đều có mục đích, tràn đầy năng lượng và kết nối.
              </p>

              <div className="mt-8">
                <Link
                  href="#about"
                  className="inline-flex items-center gap-2 text-sm font-extrabold text-[#071F14] group hover:text-emerald-700 transition-colors"
                >
                  Khám phá các chương trình tập
                  <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Giới thiệu Section */}
      <section id="about" className="py-24 max-w-7xl mx-auto px-6 border-t border-slate-200/60">
        <div className="grid gap-16 lg:grid-cols-12 items-center">
          {/* Left Column: Mission & Stats */}
          <div className="lg:col-span-5">
            <div className="relative rounded-[2.5rem] bg-[#071F14] p-8 text-white shadow-2xl overflow-hidden border border-white/5">
              <div className="absolute top-[-30%] right-[-10%] h-[250px] w-[250px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#B3F56E]">
                  <Sparkle className="h-3.5 w-3.5" weight="bold" />
                  Sứ mệnh của chúng tôi
                </div>
                <h3 className="text-3xl font-black tracking-tight leading-tight">
                  Số hóa thể thao, kết nối đam mê.
                </h3>
                <p className="text-sm text-slate-350 leading-relaxed font-medium">
                  SmashCourt ra đời nhằm mang đến giải pháp toàn diện giúp đơn giản hóa quy trình đặt sân và tối ưu hóa hiệu suất vận hành cho các câu lạc bộ thể thao phong trào tại Việt Nam. Nâng tầm trải nghiệm tập luyện chuyên nghiệp nhất.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <span className="text-3xl font-black text-[#B3F56E]">1.200+</span>
                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">Hội viên tin dùng</p>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-[#B3F56E]">24/7</span>
                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">Lịch đặt tự động</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Content and Grid Values */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full min-h-[420px]">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#071F14] leading-tight">
                Hệ thống Quản lý SmashCourt
              </h2>
              <p className="mt-4 text-lg text-slate-655 leading-relaxed font-medium">
                Chúng tôi cung cấp một nền tảng vận hành tối giản nhưng mạnh mẽ, giúp kết nối người chơi và chủ sân một cách nhanh chóng, minh bạch và hiệu quả nhất.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 mt-8">
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-[#071F14] text-[#B3F56E] flex items-center justify-center">
                  <DeviceMobile size={20} weight="bold" />
                </div>
                <div>
                  <h4 className="font-bold text-[#071F14] text-base">Ứng dụng đa nền tảng</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">Trải nghiệm đặt sân mượt mà trên cả máy tính, máy tính bảng và điện thoại di động.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-[#071F14] text-[#B3F56E] flex items-center justify-center">
                  <ShieldCheck size={20} weight="bold" />
                </div>
                <div>
                  <h4 className="font-bold text-[#071F14] text-base">Bảo mật & Đồng bộ</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">Dữ liệu thông tin lịch đặt sân, doanh thu và thông tin cá nhân được bảo vệ tối đa.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features & Benefits Section */}
      < section id="courts" className="py-20 bg-white border-t border-slate-200/60" >
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-700">Cơ sở vật chất</h3>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#071F14] mt-2">
              Được thiết kế tối ưu cho hiệu suất thi đấu.
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
            <div className="p-8 rounded-3xl bg-[#F4F6F2] hover:bg-[#ebeee7] border border-slate-100 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-[#071F14] text-[#B3F56E] flex items-center justify-center mb-6">
                <Building size={24} weight="bold" />
              </div>
              <h4 className="text-xl font-bold text-[#071F14]">Hệ thống đa chi nhánh</h4>
              <p className="text-slate-650 mt-2 text-sm leading-relaxed font-medium">
                Trải nghiệm bất kỳ câu lạc bộ hàng đầu nào thuộc hệ thống, với lịch hoạt động đồng bộ và thiết kế sân đạt chuẩn thi đấu.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#F4F6F2] hover:bg-[#ebeee7] border border-slate-100 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-[#071F14] text-[#B3F56E] flex items-center justify-center mb-6">
                <Clock size={24} weight="bold" />
              </div>
              <h4 className="text-xl font-bold text-[#071F14]">Lịch đặt AI 24/7</h4>
              <p className="text-slate-655 mt-2 text-sm leading-relaxed font-medium">
                Đặt sân nhanh, điều chỉnh lịch đặt và kiểm tra tình trạng sân trống theo thời gian thực mọi lúc, mọi nơi.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#F4F6F2] hover:bg-[#ebeee7] border border-slate-100 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-[#071F14] text-[#B3F56E] flex items-center justify-center mb-6">
                <Trophy size={24} weight="bold" />
              </div>
              <h4 className="text-xl font-bold text-[#071F14]">Huấn luyện viên chuyên nghiệp</h4>
              <p className="text-slate-655 mt-2 text-sm leading-relaxed font-medium">
                Kết nối với các huấn luyện viên chuyên nghiệp để nâng tầm kỹ năng và chiến thuật thi đấu của bạn.
              </p>
            </div>
          </div>
        </div>
      </section >

      {/* Cancellation Policy Section */}
      <section id="policy" className="py-20 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-700">Quy định</h3>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#071F14] mt-2">
              Chính sách hủy sân & hoàn tiền
            </h2>
            <p className="text-slate-650 mt-2 text-sm font-medium">
              Đảm bảo tính công bằng và minh bạch, hệ thống áp dụng các mốc thời gian hoàn tiền linh hoạt dựa trên thời điểm hủy sân.
            </p>
          </div>
          <CancellationPolicyPreview />
        </div>
      </section>

      {/* Footer */}
      < footer className="bg-[#071F14] text-white py-16 border-t border-white/5" >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-black tracking-tight text-white">SmashCourt</span>
            <p className="text-slate-400 text-xs mt-1">Hệ thống quản lý sân cầu lông & tennis cao cấp</p>
          </div>
          <div className="flex gap-8 text-sm text-slate-450 font-semibold">
            <Link href="/" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
            <Link href="/" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link>
            <Link href="/" className="hover:text-white transition-colors">Liên hệ</Link>
          </div>
          <p className="text-slate-550 text-xs font-bold">© {new Date().getFullYear()} SmashCourt. Bảo lưu mọi quyền.</p>
        </div>
      </footer >
    </div >
  );
}
