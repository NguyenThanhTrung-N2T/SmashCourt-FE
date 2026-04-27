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

import ManagerSidebar from "./ManagerSidebar";
import ManagerHeader from "./ManagerHeader";

type Props = {
  user: AuthUserSession;
  children: ReactNode;
  /** Branch name shown in the sidebar and header */
  branchName?: string;
};

export default function ManagerSidebarLayout({ user, children, branchName }: Props) {
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
    <div
      className="h-screen w-full overflow-hidden flex font-sans text-slate-900"
      style={{ backgroundColor: "#EBEBEB" }}
    >
      <ManagerSidebar
        isLoggingOut={loggingOut}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        branchName={branchName}
      />

      <div className="flex-1 flex flex-col min-w-0 p-4 gap-0">
        <ManagerHeader
          user={user}
          branchName={branchName}
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
