"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

import { authLogout } from "@/src/api/auth.api";
import AuthStatusToast from "@/src/modules/auth/components/AuthStatusToast";
import {
  broadcastLogoutSync,
  clearAuthSession,
  type AuthUserSession,
} from "@/src/modules/auth/session/sessionStore";

import Sidebar from "./Sidebar";
import Header from "./Header";

type Props = {
  user: AuthUserSession;
  children: ReactNode;
};

export default function OwnerSidebarLayout({ user, children }: Props) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function onLogout() {
    try {
      setLoggingOut(true);
      await authLogout();
    } catch {
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

  return (
    <div className="h-screen w-full overflow-hidden flex font-sans text-slate-900" style={{ backgroundColor: "#EBEBEB" }}>
      <Sidebar
        isLoggingOut={loggingOut}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 p-4 gap-0">
        <Header
          user={user}
          onMenuToggle={() => setMobileOpen(true)}
          onLogout={onLogout}
          isLoggingOut={loggingOut}
        />

        <main className="flex-1 min-w-0 overflow-y-auto scrollbar-none">
          {children}
        </main>
      </div>

      <AuthStatusToast
        visible={redirecting}
        tone="success"
        message="Đăng xuất thành công"
      />
    </div>
  );
}
