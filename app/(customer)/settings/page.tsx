/**
 * Customer Settings Page
 * 
 * Page for customer account settings and preferences.
 */

"use client";

import { useState } from "react";
import { Bell, Lock, Palette, Globe } from "@phosphor-icons/react";

export default function CustomerSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-surface-0 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Cài đặt</h1>
          <p className="mt-2 text-sm text-muted">
            Quản lý tài khoản và tùy chọn của bạn
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="rounded-2xl border border-border bg-surface-1 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Thông báo</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Email thông báo</p>
                  <p className="text-sm text-muted">
                    Nhận thông báo về đặt sân qua email
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">SMS thông báo</p>
                  <p className="text-sm text-muted">
                    Nhận thông báo về đặt sân qua SMS
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={smsNotifications}
                    onChange={(e) => setSmsNotifications(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-2xl border border-border bg-surface-1 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Bảo mật</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-surface-3">
                Đổi mật khẩu
              </button>
              <button className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-surface-3">
                Xác thực hai yếu tố
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className="rounded-2xl border border-border bg-surface-1 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Palette className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Giao diện</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-surface-3">
                Chế độ sáng/tối
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="rounded-2xl border border-border bg-surface-1 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Globe className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Ngôn ngữ</h2>
            </div>
            <select className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-surface-3 focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
