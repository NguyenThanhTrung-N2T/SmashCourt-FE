"use client";

import { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import CustomerTopNav from "./CustomerTopNav";
import MobileNav from "./MobileNav";
import { authLogout } from "@/src/api/auth.api";
import { useGlobalToast } from "@/src/shared/hooks/useGlobalToast";
import {
  broadcastLogoutSync,
  clearAuthSession,
  type AuthUserSession,
} from "@/src/features/auth/session/sessionStore";
import type { AuthUser } from "@/src/shared/types/auth.types";
import { AIAssistantWidget } from "@/src/features/ai/shared/components/AIAssistantWidget";
import { RealtimeProviders } from "@/src/contexts/RealtimeProviders";
import { NotificationDrawer } from "@/src/features/notifications/components/NotificationDrawer";

interface CustomerTopNavLayoutProps {
  user: AuthUser;
  children: ReactNode;
}

function CustomerTopNavLayoutInner({
  user,
  children,
}: CustomerTopNavLayoutProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const router = useRouter();
  const { showToast } = useGlobalToast();

  // Handle mobile drawer toggle
  const handleMobileMenuToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  // Handle mobile drawer close
  const handleMobileMenuClose = () => {
    setMobileDrawerOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    if (isLoggingOut || redirecting) return;

    try {
      setIsLoggingOut(true);
      await authLogout();
    } catch {
      setIsLoggingOut(false);
      return;
    }
    broadcastLogoutSync();
    clearAuthSession();
    setRedirecting(true);
    showToast("success", "Đăng xuất thành công");
    window.setTimeout(() => {
      router.push("/auth/login");
    }, 1200);
  };

  void redirecting;

  return (
    <div className="h-screen bg-background overflow-y-auto custom-scrollbar">
      {/* Top Navigation */}
      <CustomerTopNav
        user={user}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        onMobileMenuToggle={handleMobileMenuToggle}
        onOpenNotifications={() => setNotifOpen(true)}
      />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileDrawerOpen}
        onClose={handleMobileMenuClose}
        user={user}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Main Content Area */}
      <main className="w-full">
        {children}
      </main>

      {/* Floating AI Assistant — available on all customer pages */}
      <AIAssistantWidget role="CUSTOMER" />

      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}

export default function CustomerTopNavLayout(props: CustomerTopNavLayoutProps) {
  return (
    <RealtimeProviders>
      <CustomerTopNavLayoutInner {...props} />
    </RealtimeProviders>
  );
}
