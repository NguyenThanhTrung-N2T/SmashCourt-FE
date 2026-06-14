"use client";

import { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import CustomerTopNav from "./CustomerTopNav";
import MobileNav from "./MobileNav";
import { authLogout } from "@/src/api/auth.api";
import { Toast } from "@/src/shared/components/ui/Toast";
import { useToast } from "@/src/shared/hooks/useToast";
import {
  broadcastLogoutSync,
  clearAuthSession,
  type AuthUserSession,
} from "@/src/features/auth/session/sessionStore";
import type { AuthUser } from "@/src/shared/types/auth.types";
import { AIAssistantWidget } from "@/src/features/ai/shared/components/AIAssistantWidget";

interface CustomerTopNavLayoutProps {
  user: AuthUser;
  children: ReactNode;
}

export default function CustomerTopNavLayout({
  user,
  children,
}: CustomerTopNavLayoutProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const { toast, show: showToast } = useToast();

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

  return (
    <div className="h-screen bg-background overflow-y-auto custom-scrollbar">
      {/* Top Navigation */}
      <CustomerTopNav
        user={user}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        onMobileMenuToggle={handleMobileMenuToggle}
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

      <Toast toast={toast} />
    </div>
  );
}
