"use client";

import { useState } from "react";
import { Palette, Sun, Moon, Monitor, Check } from "lucide-react";

type Theme = "light" | "dark" | "system";

interface ThemeOption {
  id: Theme;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    label: "Sáng",
    description: "Giao diện sáng, dễ nhìn vào ban ngày",
    icon: Sun,
  },
  {
    id: "dark",
    label: "Tối",
    description: "Giao diện tối, bảo vệ mắt vào ban đêm",
    icon: Moon,
  },
  {
    id: "system",
    label: "Theo hệ thống",
    description: "Tự động chuyển theo cài đặt thiết bị",
    icon: Monitor,
  },
];

export default function SettingsPage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>("light");

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="rounded-[2.25rem] border border-white/40 bg-white/85 px-8 py-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-purple-700">
              <Palette className="h-3.5 w-3.5" />
              Theme Settings
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
              Cài đặt giao diện
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 lg:text-base">
              Tùy chỉnh giao diện hệ thống theo sở thích của bạn. Chọn theme
              sáng hoặc tối để phù hợp với môi trường làm việc.
            </p>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="rounded-[2rem] border border-white/40 bg-white/85 shadow-xl shadow-slate-200/60 backdrop-blur-xl overflow-hidden">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Chọn giao diện
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Lựa chọn theme phù hợp với sở thích của bạn
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            {THEME_OPTIONS.map((theme) => {
              const Icon = theme.icon;
              const isSelected = selectedTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`relative flex flex-col items-center gap-4 rounded-2xl border-2 p-6 text-center transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-50 shadow-lg shadow-purple-500/20"
                      : "border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/50"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg">
                      <Check className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                      isSelected
                        ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>

                  <div>
                    <h3
                      className={`text-lg font-bold ${
                        isSelected ? "text-purple-700" : "text-slate-900"
                      }`}
                    >
                      {theme.label}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {theme.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preview Section */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Xem trước giao diện
            </h3>
            <div
              className={`rounded-xl p-6 ${
                selectedTheme === "dark"
                  ? "bg-slate-900 text-white"
                  : selectedTheme === "light"
                    ? "bg-white text-slate-900 border border-slate-200"
                    : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`h-10 w-10 rounded-lg ${
                    selectedTheme === "dark" ? "bg-purple-500" : "bg-purple-100"
                  }`}
                />
                <div>
                  <p className="font-bold">SmashCourt</p>
                  <p
                    className={`text-sm ${
                      selectedTheme === "dark"
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    Hệ thống đặt sân cầu lông
                  </p>
                </div>
              </div>
              <div
                className={`h-2 w-full rounded-full ${
                  selectedTheme === "dark" ? "bg-slate-700" : "bg-slate-200"
                }`}
              >
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
