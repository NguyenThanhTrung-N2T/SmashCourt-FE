"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Calendar,
  Crown,
  Edit,
  Mail,
  Phone,
  Sparkles,
  Star,
  Trophy,
  TrendingUp,
  Zap,
  ArrowLeft,
} from "lucide-react";
import type { AuthUserSession } from "@/src/auth/session/sessionStore";

type UserProfileProps = {
  user: AuthUserSession;
};

const RANKS = [
  { name: "Tân Binh", minPoints: 0, color: "slate", icon: Star },
  { name: "Đồng", minPoints: 500, color: "amber", icon: Award },
  { name: "Bạc", minPoints: 1500, color: "slate", icon: Trophy },
  { name: "Vàng", minPoints: 3000, color: "yellow", icon: Crown },
  { name: "Bạch Kim", minPoints: 5000, color: "cyan", icon: Sparkles },
  { name: "Kim Cương", minPoints: 10000, color: "blue", icon: Zap },
];

function getRankInfo(points: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (points >= RANKS[i].minPoints) {
      const current = RANKS[i];
      const next = RANKS[i + 1];
      return { current, next };
    }
  }
  return { current: RANKS[0], next: RANKS[1] };
}

export default function UserProfile({ user }: UserProfileProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const currentPoints = 1250;
  const { current, next } = getRankInfo(currentPoints);

  const progress = next
    ? ((currentPoints - current.minPoints) /
        (next.minPoints - current.minPoints)) *
      100
    : 100;

  const pointsToNext = next ? next.minPoints - currentPoints : 0;

  const CurrentIcon = current.icon;
  const NextIcon = next?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 py-8">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-x-1 hover:border-emerald-500 hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại trang chủ
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-700 bg-clip-text text-transparent">
            Thông tin cá nhân
          </h1>
          <p className="mt-2 text-slate-600">
            Quản lý thông tin và theo dõi tiến trình hạng thành viên
          </p>
        </div>

        {/* Profile Card */}
        <div className="mb-6 overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-xl">
          <div className="relative h-32 bg-gradient-to-br from-slate-900 via-emerald-800 to-teal-700 animate-gradient">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
          </div>

          <div className="relative px-8 pb-8">
            <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
              <div className="-mt-16 relative">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="h-32 w-32 rounded-3xl border-4 border-white bg-slate-100 object-cover shadow-xl"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-emerald-500 to-teal-500 text-4xl font-black text-white shadow-xl">
                    {user.fullName
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </div>
                )}
                <button className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-slate-200 text-slate-600 shadow-lg transition-all hover:bg-emerald-500 hover:text-white hover:border-emerald-500">
                  <Edit className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {user.fullName}
                </h2>
                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-emerald-600" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-blue-600" />
                    +84 123 456 789
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    Tham gia: 15/01/2024
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rank Progress Card */}
        <div className="mb-6 overflow-hidden rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 p-8 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Tiến trình lên hạng
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Tích điểm để mở khóa đặc quyền cao hơn
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-600 animate-pulse" />
          </div>

          {/* Current Rank */}
          <div className="mb-6 flex items-center gap-4 rounded-2xl border-2 border-emerald-300 bg-white p-5 shadow-sm animate-slide-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg animate-pulse-glow">
              <CurrentIcon className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-600">
                Hạng hiện tại
              </p>
              <p className="text-2xl font-extrabold text-slate-900">
                {current.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {currentPoints.toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-slate-500">điểm</p>
            </div>
          </div>

          {/* Progress Bar */}
          {next && (
            <>
              <div className="relative mb-4">
                <div className="h-6 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 transition-all duration-1000 ease-out animate-gradient"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="h-full w-full animate-shimmer" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-700 drop-shadow-sm">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>

              {/* Next Rank */}
              <div className="flex items-center justify-between rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg opacity-60">
                    {NextIcon && <NextIcon className="h-7 w-7" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">
                      Hạng tiếp theo
                    </p>
                    <p className="text-xl font-extrabold text-slate-900">
                      {next.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-600">
                    Còn thiếu
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-600">
                    {pointsToNext.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">điểm</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="group rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl animate-slide-up">
            <Trophy className="h-8 w-8 text-amber-500 mb-3 transition-transform group-hover:scale-110 group-hover:rotate-12" />
            <p className="text-3xl font-extrabold text-slate-900">12</p>
            <p className="text-sm font-semibold text-slate-600">Trận đã chơi</p>
          </div>
          <div className="group rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Calendar className="h-8 w-8 text-blue-500 mb-3 transition-transform group-hover:scale-110" />
            <p className="text-3xl font-extrabold text-slate-900">8</p>
            <p className="text-sm font-semibold text-slate-600">Giờ chơi</p>
          </div>
          <div className="group rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Star className="h-8 w-8 text-emerald-500 mb-3 transition-transform group-hover:scale-110" />
            <p className="text-3xl font-extrabold text-slate-900">4.8</p>
            <p className="text-sm font-semibold text-slate-600">Đánh giá TB</p>
          </div>
        </div>
      </div>
    </div>
  );
}
