/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heartbeat,
  Robot,
  CalendarBlank,
  CheckCircle,
  CaretDown,
  CaretRight,
  CaretUp,
  Clock,
  Crown,
  ClockCounterClockwise,
  Info,
  Stack,
  SignOut,
  MapPin,
  Cursor,
  Sparkle,
  Trophy,
  User,
  Lightning,
} from "@phosphor-icons/react";

import { authLogout } from "@/src/api/auth.api";
import AuthStatusToast from "@/src/modules/auth/components/AuthStatusToast";
import {
  broadcastLogoutSync,
  clearAuthSession,
  type AuthUserSession,
} from "@/src/modules/auth/session/sessionStore";

type CustomerHomeShellProps = {
  accessToken: string;
  user: AuthUserSession;
};

const COURTS = ["Sân 1", "Sân 2", "Sân 3"] as const;
const START_HOUR = 5;
const END_HOUR = 22;
const SLOT_STEP_MINUTES = 30;
const SLOT_DURATION_MINUTES = 60;
const BOOKED_SLOT_BY_COURT: Record<(typeof COURTS)[number], string[]> = {
  "Sân 1": ["06:30", "09:30", "12:00", "18:00"],
  "Sân 2": ["07:00", "10:30", "16:00", "19:30"],
  "Sân 3": ["06:00", "08:30", "14:00", "17:30"],
};

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SC";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function minutesToText(totalMinutes: number) {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function getTimeSlots() {
  const slots: string[] = [];
  const start = START_HOUR * 60;
  const end = END_HOUR * 60;
  for (let minute = start; minute <= end; minute += SLOT_STEP_MINUTES) {
    slots.push(minutesToText(minute));
  }
  return slots;
}

export default function CustomerHomeShell({ user }: CustomerHomeShellProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    startIdx: number;
    endIdx: number;
  } | null>(null);
  const [selectedCourts, setSelectedCourts] = useState<string[]>([]);
  const [dragging, setDragging] = useState<{
    court: string;
    startIdx: number;
    endIdx: number;
  } | null>(null);
  const courtTrackRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const today = new Date().toISOString().split("T")[0];
  const timeSlots = useMemo(() => getTimeSlots(), []);
  const hourMarks = useMemo(
    () =>
      Array.from(
        { length: END_HOUR - START_HOUR + 1 },
        (_, idx) => START_HOUR + idx,
      ),
    [],
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const closeDropdown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#profile-menu-container")) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, [isProfileOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function onLogout() {
    setError(null);
    try {
      setLoggingOut(true);
      await authLogout();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đăng xuất thất bại do lỗi mạng.",
      );
      setLoggingOut(false);
      return;
    }

    broadcastLogoutSync();
    clearAuthSession();
    setRedirecting(true);
    window.setTimeout(() => {
      router.push("/auth/login");
    }, 1200);
  }

  const blockCount = timeSlots.length - 1;

  function normalizeRange(startIdx: number, endIdx: number) {
    return {
      startIdx: Math.min(startIdx, endIdx),
      endIdx: Math.max(startIdx, endIdx),
    };
  }

  function toBookedBlockIndices(courtName: string) {
    const starts = BOOKED_SLOT_BY_COURT[courtName as (typeof COURTS)[number]];
    const indices = new Set<number>();
    for (const start of starts) {
      const startIdx = timeSlots.indexOf(start);
      if (startIdx < 0) continue;
      const durationBlocks = SLOT_DURATION_MINUTES / SLOT_STEP_MINUTES;
      for (let i = 0; i < durationBlocks; i += 1) {
        const block = startIdx + i;
        if (block >= 0 && block < blockCount) {
          indices.add(block);
        }
      }
    }
    return indices;
  }

  function isRangeAvailable(
    courtName: string,
    startIdx: number,
    endIdx: number,
  ) {
    const booked = toBookedBlockIndices(courtName);
    const range = normalizeRange(startIdx, endIdx);
    for (let idx = range.startIdx; idx <= range.endIdx; idx += 1) {
      if (booked.has(idx)) {
        return false;
      }
    }
    return true;
  }

  function onToggleCourt(courtName: string) {
    if (!selectedRange) return;
    if (
      !isRangeAvailable(courtName, selectedRange.startIdx, selectedRange.endIdx)
    ) {
      return;
    }

    setSelectedCourts((prev) => {
      if (prev.includes(courtName)) {
        return prev.filter((court) => court !== courtName);
      }
      return [...prev, courtName];
    });
  }

  function getBlockIdxFromClientX(courtName: string, clientX: number) {
    const track = courtTrackRefs.current[courtName];
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const clampedX = Math.max(rect.left, Math.min(rect.right, clientX));
    const ratio = (clampedX - rect.left) / rect.width;
    const idx = Math.floor(ratio * blockCount);
    return Math.max(0, Math.min(blockCount - 1, idx));
  }

  function rangeToLabel(range: { startIdx: number; endIdx: number }) {
    const startText = timeSlots[range.startIdx];
    const endText = timeSlots[range.endIdx + 1];
    return `${startText} - ${endText}`;
  }

  function onTrackMouseDown(courtName: string, clientX: number) {
    const idx = getBlockIdxFromClientX(courtName, clientX);
    if (!isRangeAvailable(courtName, idx, idx)) return;
    setDragging({ court: courtName, startIdx: idx, endIdx: idx });
    setSelectedRange({ startIdx: idx, endIdx: idx });
    setSelectedCourts([courtName]);
  }

  function onTrackMouseMove(courtName: string, clientX: number) {
    if (!dragging || dragging.court !== courtName) return;
    const idx = getBlockIdxFromClientX(courtName, clientX);
    if (!isRangeAvailable(courtName, dragging.startIdx, idx)) return;
    const next = { ...dragging, endIdx: idx };
    setDragging(next);
    setSelectedRange(normalizeRange(next.startIdx, next.endIdx));
  }

  function onTrackMouseUp() {
    setDragging(null);
  }

  const initials = getInitials(user.fullName);
  const controlsDisabled = loggingOut || redirecting;
  const selectedRangeLabel = selectedRange ? rangeToLabel(selectedRange) : "";
  const canBook = selectedCourts.length > 0 && Boolean(selectedRange);

  useEffect(() => {
    if (!dragging) return;
    const handleUp = () => onTrackMouseUp();
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
  }, [dragging]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 pb-24 font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-[460px] rounded-b-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 animate-gradient" />
      
      {/* Floating orbs */}
      <div className="pointer-events-none absolute left-10 top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl animate-float" />
      <div className="pointer-events-none absolute right-20 top-40 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <header className="relative z-50 w-full border-b border-white/10 bg-white/5 backdrop-blur-2xl shadow-lg shadow-black/5">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 transition-all group-hover:shadow-emerald-500/50 group-hover:scale-110 animate-pulse-glow">
                <Heartbeat className="h-6 w-6" />
              </div>
              <span className="hidden text-2xl font-black tracking-tight text-white sm:block">
                Smash<span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Court</span>
              </span>
            </div>

            <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md md:flex shadow-lg shadow-black/5">
              <button
                onClick={() => router.push("/")}
                className="shrink-0 rounded-full bg-gradient-to-r from-white to-emerald-50 px-6 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-white/20 transition-all hover:shadow-xl hover:scale-105"
              >
                Khám phá & Đặt sân
              </button>
              <button
                onClick={() => router.push("/customer/history")}
                className="flex shrink-0 items-center gap-2 rounded-full bg-transparent px-6 py-2.5 text-sm font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white hover:scale-105"
              >
                <ClockCounterClockwise className="h-4 w-4" /> Lịch sử của tôi
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div id="profile-menu-container" className="relative ml-2">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 rounded-full border border-transparent p-1.5 pr-5 outline-none transition-colors hover:border-white/10 hover:bg-white/5 focus:ring-2 focus:ring-emerald-500/40"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full border-2 border-white/20 bg-slate-800 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-sm font-black text-emerald-400">
                    {initials}
                  </div>
                )}
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-bold leading-tight text-white">
                    {user.fullName}
                  </p>
                  <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Hạng Tân Binh
                  </p>
                </div>
                <CaretDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`absolute right-0 top-[115%] w-64 origin-top-right rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl transition-all ${isProfileOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}
              >
                <div className="mb-2 border-b border-slate-50 p-4">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {user.fullName}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                    {user.email}
                  </p>
                  
                  {/* Mini Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        Hạng Tân Binh
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        1,250 điểm
                      </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 animate-shimmer"
                        style={{ width: '50%' }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Còn 250 điểm để lên <span className="font-bold text-amber-600">Đồng</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/customer/profile")}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-emerald-600"
                >
                  <User className="h-4 w-4" /> Xem thông tin tài khoản
                </button>
                <button
                  onClick={() => router.push("/customer/history")}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-emerald-600 md:hidden"
                >
                  <ClockCounterClockwise className="h-4 w-4" /> Lịch sử Đặt sân
                </button>
                <div className="my-1 h-px w-full bg-slate-50" />
                <button
                  onClick={onLogout}
                  disabled={controlsDisabled}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                >
                  <SignOut className="h-4 w-4" /> Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1500px] px-6 pb-8 pt-8 lg:px-10 lg:pt-12">
        <div className="mb-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="w-full lg:w-3/5 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              <Sparkle className="h-3.5 w-3.5 animate-pulse" />
              Lịch đặt sân thông minh
            </div>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Chào mừng trở lại,{" "}
              <span className="bg-gradient-to-r from-emerald-200 to-teal-100 bg-clip-text text-transparent">
                {user.fullName}
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] font-medium leading-relaxed text-slate-300 lg:text-base">
              Chọn khung giờ theo block 30 phút, đặt nhiều sân cùng 1 chi nhánh
              và cùng 1 mốc giờ trong một lần thao tác.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 lg:w-auto">
            <article className="group rounded-3xl border border-white/20 bg-gradient-to-br from-white/15 to-white/5 p-5 shadow-xl backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl hover:border-emerald-400/30 animate-slide-up">
              <div className="flex items-center justify-between">
                <CalendarBlank className="h-6 w-6 text-emerald-300 transition-transform group-hover:scale-110" />
                <Sparkle className="h-4 w-4 text-emerald-300/50 animate-pulse" />
              </div>
              <p className="mt-3 text-3xl font-extrabold leading-none text-white">
                0
              </p>
              <p className="mt-1.5 text-sm font-medium text-slate-200">
                Lượt đặt sắp tới
              </p>
            </article>
            <article className="group rounded-3xl border border-white/20 bg-gradient-to-br from-blue-500/15 to-white/5 p-5 shadow-xl backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl hover:border-blue-400/30 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between">
                <Trophy className="h-6 w-6 text-blue-300 transition-transform group-hover:scale-110" />
                <Lightning className="h-4 w-4 text-blue-300/50 animate-pulse" />
              </div>
              <p className="mt-3 text-3xl font-extrabold leading-none text-white">
                12
              </p>
              <p className="mt-1.5 text-sm font-medium text-slate-200">
                Trận đã chơi
              </p>
            </article>
            <article className="group rounded-3xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/25 to-teal-500/15 p-5 shadow-xl backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl hover:border-emerald-400/60 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between">
                <Crown className="h-6 w-6 text-amber-300 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                <Sparkle className="h-4 w-4 text-amber-300/70 animate-pulse" />
              </div>
              <p className="mt-3 text-3xl font-extrabold leading-none bg-gradient-to-r from-emerald-100 to-teal-100 bg-clip-text text-transparent">
                1,250
              </p>
              <p className="mt-1.5 text-sm font-medium text-emerald-100">
                Điểm thành viên
              </p>
            </article>
          </div>
        </div>

        <section className="relative flex flex-col gap-8 rounded-[2rem] border-2 border-transparent bg-gradient-to-br from-white via-white to-emerald-50/30 p-6 shadow-2xl shadow-slate-900/10 lg:p-10 before:absolute before:inset-0 before:-z-10 before:rounded-[2rem] before:bg-gradient-to-br before:from-emerald-500/20 before:via-teal-500/10 before:to-transparent before:blur-xl">
          <div className="flex flex-col gap-6 border-b border-slate-100 pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-700 bg-clip-text text-transparent lg:text-2xl">
                Chọn sân theo khung giờ{" "}
                <Lightning className="h-6 w-6 text-emerald-500 animate-pulse" />
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-500 lg:text-[15px]">
                Time-grid là trục thời gian nguyên ngày cho từng sân. Kéo trực
                tiếp trên thanh để chọn khoảng giờ, hệ thống sẽ snap theo
                setting block 30 phút. Khung hiển thị hiện tại từ 05:00 đến
                22:00.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-2.5 shadow-inner sm:flex-row">
              <div className="relative w-full sm:w-auto group">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600 transition-transform group-hover:scale-110" />
                <select className="h-12 w-full cursor-pointer appearance-none rounded-[14px] border-2 border-slate-200 bg-white pl-12 pr-6 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 hover:border-emerald-400 sm:w-[300px]">
                  <option>CS Tân Bình (Nguyễn Văn Linh)</option>
                  <option>CS Gò Vấp (Phan Văn Trị)</option>
                  <option>CS Quận 7 (Huỳnh Tấn Phát)</option>
                  <option>CS Quận 10 (Thành Thái)</option>
                </select>
                <CaretDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-transform group-hover:text-emerald-600" />
              </div>

              <div className="relative w-full sm:w-auto group">
                <CalendarBlank className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600 transition-transform group-hover:scale-110" />
                <input
                  type="date"
                  defaultValue={today}
                  className="h-12 w-full cursor-pointer rounded-[14px] border-2 border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 hover:border-emerald-400 sm:w-[220px]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
              <span className="h-4 w-6 rounded border border-slate-300 bg-white" />
              Còn trống
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <span className="h-4 w-6 rounded bg-emerald-500" />
              Đang chọn
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
              <span className="h-4 w-6 rounded bg-slate-400/70" />
              Đã đặt
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Cursor className="h-4 w-4" />
              Kéo để chọn range
            </span>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/70 p-5 pb-5 shadow-inner [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
            <div className="min-w-[1480px]">
              <div className="mb-3 flex items-end gap-4">
                <div className="w-[150px]" />
                <div className="relative h-8 flex-1">
                  {hourMarks.map((hour) => {
                    const idx = (hour - START_HOUR) * 2;
                    const left = (idx / blockCount) * 100;
                    return (
                      <div
                        key={`hour-${hour}`}
                        className="absolute top-0 -translate-x-1/2 text-sm font-semibold text-slate-600"
                        style={{ left: `${left}%` }}
                      >
                        {`${hour.toString().padStart(2, "0")}:00`}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 space-y-5">
                {COURTS.map((court) => {
                  const bookedBlocks = toBookedBlockIndices(court);
                  const isCourtSelected = selectedCourts.includes(court);
                  const selectedOverlay =
                    selectedRange && isCourtSelected
                      ? normalizeRange(
                          selectedRange.startIdx,
                          selectedRange.endIdx,
                        )
                      : null;

                  return (
                    <div key={court} className="flex items-center gap-4">
                      <div className="w-[150px] rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-slate-800 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Stack className="h-5 w-5 text-slate-500" />
                          <span>{court}</span>
                        </div>
                      </div>

                      <div
                        ref={(el) => {
                          courtTrackRefs.current[court] = el;
                        }}
                        onMouseDown={(e) => onTrackMouseDown(court, e.clientX)}
                        onMouseMove={(e) => onTrackMouseMove(court, e.clientX)}
                        className="relative h-14 flex-1 cursor-crosshair rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-emerald-300"
                        style={{
                          backgroundImage: `linear-gradient(to right, rgba(226,232,240,0.7) 1px, transparent 1px)`,
                          backgroundSize: `${100 / blockCount}% 100%`,
                        }}
                      >
                        {[...bookedBlocks].map((idx) => (
                          <div
                            key={`${court}-booked-${idx}`}
                            className="pointer-events-none absolute inset-y-1 rounded-lg bg-slate-400/70 transition-all"
                            style={{
                              left: `${(idx / blockCount) * 100}%`,
                              width: `${(1 / blockCount) * 100}%`,
                            }}
                          />
                        ))}

                        {selectedOverlay ? (
                          <div
                            className="pointer-events-none absolute inset-y-1 rounded-lg bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)] transition-all"
                            style={{
                              left: `${(selectedOverlay.startIdx / blockCount) * 100}%`,
                              width: `${((selectedOverlay.endIdx - selectedOverlay.startIdx + 1) / blockCount) * 100}%`,
                            }}
                          />
                        ) : null}

                        {selectedOverlay ? (
                          <div
                            className="pointer-events-none absolute top-0 z-10 -translate-y-[115%] rounded-full border border-emerald-600 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm"
                            style={{
                              left: `${(selectedOverlay.startIdx / blockCount) * 100}%`,
                              transform: "translateX(-2px)",
                            }}
                          >
                            {rangeToLabel(selectedOverlay)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 lg:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <p className="flex items-center gap-2 text-base font-bold text-emerald-700">
                  <Clock className="h-5 w-5" />
                  Chế độ đặt nhiều sân cùng giờ
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">
                  Kéo chọn range thời gian trên một hàng sân, sau đó thêm/bỏ các
                  sân khác bằng chip bên dưới nếu cùng trống trong range đó.
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {COURTS.map((court) => {
                    const available = selectedRange
                      ? isRangeAvailable(
                          court,
                          selectedRange.startIdx,
                          selectedRange.endIdx,
                        )
                      : false;
                    return (
                      <button
                        key={`chip-${court}`}
                        disabled={!selectedRange || !available}
                        onClick={() => onToggleCourt(court)}
                        className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                          selectedCourts.includes(court)
                            ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                            : !selectedRange || !available
                              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                              : "border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-700"
                        }`}
                      >
                        <Stack className="h-4 w-4" />
                        {court}
                      </button>
                    );
                  })}
                </div>
                {canBook ? (
                  <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Bạn đang chọn: {selectedCourts.join(", ")} -{" "}
                    {selectedRangeLabel}
                  </p>
                ) : (
                  <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
                    <Info className="h-4 w-4 text-slate-500" />
                    Kéo trên thanh timeline để chọn giờ trước, rồi chọn ít nhất
                    một sân để đặt.
                  </p>
                )}
              </div>

              <button
                disabled={!canBook}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-700 to-teal-700 px-7 text-sm font-semibold text-white shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 animate-gradient"
              >
                Đặt sân <CaretRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <div className="pointer-events-none fixed bottom-32 right-6 z-[100] flex flex-col items-end lg:right-10">
        <div
          className={`mb-4 w-80 origin-bottom-right overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 transition-all duration-300 pointer-events-auto sm:w-[380px] ${isChatOpen ? "scale-100 opacity-100" : "pointer-events-none scale-50 opacity-0"}`}
        >
          <div className="flex items-center justify-between bg-slate-900 px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Sparkle className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold tracking-wide">
                Smash AI Assistant
              </h3>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="rounded-full bg-white/10 p-1.5 text-white/50 transition-colors hover:text-white"
            >
              <CaretUp className="h-4 w-4 rotate-180" />
            </button>
          </div>

          <div className="flex h-[360px] flex-col gap-5 overflow-y-auto bg-slate-50 p-5">
            <div className="flex max-w-[85%] items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                <Robot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-slate-100 bg-white px-5 py-3.5 text-sm font-medium leading-relaxed text-slate-700 shadow-sm">
                Chào {user.fullName}! Bạn muốn tìm sân theo giờ cố định hay chọn
                nhiều sân cùng một khung giờ?
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-white p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Hỏi AI bất kỳ điều gì..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-5 pr-14 text-[15px] font-medium outline-none transition-colors focus:border-emerald-500 focus:bg-white"
              />
              <button className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm transition-colors hover:bg-emerald-400">
                <CaretRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="group fixed bottom-10 right-6 z-[100] flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-800 bg-gradient-to-br from-slate-900 to-emerald-900 text-white shadow-2xl shadow-slate-900/30 transition-all hover:scale-110 hover:shadow-emerald-500/30 animate-pulse-glow"
      >
        <Robot className="h-7 w-7 transition-transform group-hover:scale-110" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-[10px] font-bold shadow-lg animate-pulse">
          1
        </span>
      </button>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-[120px] right-6 z-[90] flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-xl shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 hover:text-emerald-600 active:scale-90 lg:right-10 ${
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-8 opacity-0"
        }`}
      >
        <CaretUp className="h-6 w-6" />
      </button>

      <AuthStatusToast
        visible={redirecting}
        tone="success"
        message="Đăng xuất thành công"
      />
      {error && (
        <AuthStatusToast visible={!!error} tone="danger" message={error} />
      )}
    </div>
  );
}
