"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "@phosphor-icons/react";
import { SmartImage } from "@/src/shared/components/ui/SmartImage";
import { Button } from "@/src/shared/components/ui/Button";
import { CUSTOMER_TOP_NAV, CUSTOMER_ACCOUNT_MENU } from "../navigation/customer.navigation";
import type { AuthUser } from "@/src/shared/types/auth.types";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export default function MobileNav({
  isOpen,
  onClose,
  user,
  onLogout,
  isLoggingOut,
}: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Check if a navigation item is active
  const isActive = (href: string) => {
    if (href === "/bookings/new") {
      return pathname === "/bookings/new";
    }
    if (href === "/bookings") {
      return pathname === "/bookings" || (pathname.startsWith("/bookings/") && !pathname.startsWith("/bookings/new"));
    }
    return pathname.startsWith(href);
  };

  // Handle navigation item click
  const handleNavClick = (href: string) => {
    onClose();
    router.push(href);
  };

  // Handle logout click
  const handleLogoutClick = () => {
    onClose();
    onLogout();
  };

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    const drawer = drawerRef.current;
    const focusableElements = drawer.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element (close button) when drawer opens
    closeButtonRef.current?.focus();

    function handleTabKey(event: KeyboardEvent) {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }

    drawer.addEventListener("keydown", handleTabKey as EventListener);
    return () => drawer.removeEventListener("keydown", handleTabKey as EventListener);
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Get user initials for avatar
  const userInitials = user.fullName
    ? user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : user.email[0].toUpperCase();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile menu"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="absolute left-0 top-0 bottom-0 w-[300px] bg-surface-1/95 backdrop-blur-xl flex flex-col shadow-2xl border-r border-border/50 animate-slide-in-left"
      >
        {/* Header */}
        <div className="h-[80px] flex items-center justify-between px-6 border-b border-border/50 shrink-0">
          <Link
            href="/bookings/new"
            onClick={onClose}
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
          >
            <SmartImage
              src="/favicon.ico"
              alt="SmashCourt Logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl shadow-sm"
            />
            <span className="text-xl font-bold tracking-tight text-foreground">
              SmashCourt
            </span>
          </Link>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Đóng menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 overflow-y-auto scrollbar-none py-6">
          {/* Primary CTA Button */}
          <div className="px-4 mb-6">
            <Button
              variant="primary"
              size="md"
              onClick={() => handleNavClick("/bookings/new")}
              className="w-full shadow-sm"
            >
              Đặt sân ngay
            </Button>
          </div>

          {/* Primary Navigation Links */}
          <div className="space-y-3 px-4 mb-6">
            {CUSTOMER_TOP_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  aria-current={active ? "page" : undefined}
                  className={`group relative w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden ${active
                    ? "bg-gradient-to-r from-primary/15 to-primary/10 text-primary shadow-lg shadow-primary/20 border border-primary/20"
                    : "text-foreground hover:bg-surface-2/80 hover:shadow-md hover:scale-[1.02]"
                    }`}
                >
                  {/* Background glow effect for active state */}
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl animate-pulse" />
                  )}

                  {/* Content */}
                  <div className="relative flex items-center gap-3">
                    <Icon className={`h-5 w-5 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"
                      }`} />
                    <span className="relative z-10">{item.label}</span>
                  </div>

                  {/* Hover ripple effect */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/5 to-secondary/5 transition-opacity duration-300" />
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50 my-6 mx-4" />

          {/* Account Menu Links */}
          <div className="space-y-3 px-4">
            {CUSTOMER_ACCOUNT_MENU.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  aria-current={active ? "page" : undefined}
                  className={`group relative w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden ${active
                    ? "bg-gradient-to-r from-primary/15 to-primary/10 text-primary shadow-lg shadow-primary/20 border border-primary/20"
                    : "text-foreground hover:bg-surface-2/80 hover:shadow-md hover:scale-[1.02]"
                    }`}
                >
                  {/* Background glow effect for active state */}
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl animate-pulse" />
                  )}

                  {/* Content */}
                  <div className="relative flex items-center gap-3">
                    <Icon className={`h-5 w-5 text-muted transition-transform duration-300 ${active ? "scale-110 text-primary" : "group-hover:scale-110"
                      }`} />
                    <span className="relative z-10">{item.label}</span>
                  </div>

                  {/* Hover ripple effect */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/5 to-secondary/5 transition-opacity duration-300" />
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer - User Info and Logout */}
        <div className="p-6 border-t border-border/50 shrink-0">
          {/* User Info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 shadow-sm">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-12 w-12 rounded-xl object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-primary">
                  {userInitials}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user.fullName}
              </p>
              <p className="text-xs text-muted truncate">{user.email}</p>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="danger"
            size="md"
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
            isLoading={isLoggingOut}
            className="w-full shadow-sm"
          >
            {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
