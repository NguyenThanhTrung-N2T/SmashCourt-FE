"use client";

import { Palette, Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme } from "@/src/contexts/ThemeContext";
import type { ThemePreference } from "@/src/shared/types/theme.types";

interface ThemeOption {
  id: ThemePreference;
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

export function SettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            Cài đặt giao diện
          </h1>
          <p className="text-sm text-muted mt-1">
            Tùy chỉnh giao diện hệ thống theo sở thích của bạn
          </p>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="rounded-2xl bg-surface-1 border border-border shadow-sm overflow-hidden">
        <div className="border-b border-border bg-surface-2 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-foreground">
                Chọn giao diện
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                Lựa chọn theme phù hợp với sở thích của bạn
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            {THEME_OPTIONS.map((themeOption) => {
              const Icon = themeOption.icon;
              const isSelected = theme === themeOption.id;

              return (
                <button
                  key={themeOption.id}
                  onClick={() => setTheme(themeOption.id)}
                  className={`relative flex flex-col items-center gap-4 rounded-2xl border-2 p-6 text-center transition-all ${isSelected
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border bg-surface-1 hover:border-primary/60 hover:bg-primary/5"
                    }`}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                      <Check className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${isSelected
                        ? "bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg"
                        : "bg-surface-2 text-muted"
                      }`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>

                  <div>
                    <h3
                      className={`text-lg font-bold ${isSelected
                          ? "text-primary"
                          : "text-foreground"
                        }`}
                    >
                      {themeOption.label}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {themeOption.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
