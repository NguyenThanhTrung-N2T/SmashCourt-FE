"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List } from "@phosphor-icons/react";
import { SmartImage } from "@/src/shared/components/ui/SmartImage";
import ThemeToggle from "@/src/shared/components/ui/ThemeToggle";
import UserAccountMenu from "./UserAccountMenu";
import { CUSTOMER_TOP_NAV } from "../navigation/customer.navigation";
import type { AuthUser } from "@/src/shared/types/auth.types";

interface CustomerTopNavProps {
  user: AuthUser;
  onLogout: () => void;
  isLoggingOut: boolean;
  onMobileMenuToggle: () => void;
}

export default function CustomerTopNav({
  user,
  onLogout,
  isLoggingOut,
  onMobileMenuToggle,
}: CustomerTopNavProps) {
  const pathname = usePathname();

  // Check if a navigation item is active
  const isActive = (href: string) => {
    if (href === "/bookings/new") {
      return pathname === "/bookings/new";
    }
    if (href === "/bookings") {
      return pathname === "/bookings" || (pathname.startsWith("/bookings/") && !pathname.startsWith("/bookings/new"));
    }
    if (href === "/promotions") {
      return pathname === "/promotions" || pathname.startsWith("/promotions/");
    }
    if (href === "/loyalty") {
      return pathname === "/loyalty" || pathname.startsWith("/loyalty/");
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="bg-surface-1/80 backdrop-blur-md sticky top-0 z-40 border-b border-border/50 shadow-sm"
    >
      {/* Main Navigation Row */}
      <div className="max-w-[1920px] mx-auto px-6 h-[80px] flex items-center justify-between">
        {/* Logo and Brand */}
        <Link
          href="/bookings/new"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl group transition-transform hover:scale-105"
        >
          <SmartImage
            src="/favicon.ico"
            alt="SmashCourt Logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl shadow-sm"
          />
          <span className="text-xl font-bold tracking-tight text-foreground hidden md:block group-hover:text-primary transition-colors">
            SmashCourt
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-2">
          {CUSTOMER_TOP_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={item.hint}
                className={`group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden ${active
                    ? "bg-gradient-to-r from-primary/15 to-primary/10 text-primary shadow-lg shadow-primary/20 border border-primary/20"
                    : "text-muted hover:text-foreground hover:bg-surface-2/80 hover:shadow-md hover:scale-105"
                  }`}
              >
                {/* Background glow effect for active state */}
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl animate-pulse" />
                )}

                {/* Content */}
                <div className="relative flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"
                    }`} />
                  <span className="relative z-10">{item.label}</span>
                </div>

                {/* Hover ripple effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/5 to-secondary/5 transition-opacity duration-300" />
              </Link>
            );
          })}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <ThemeToggle variant="icon" />

          {/* User Account Menu (Desktop Only) */}
          <div className="hidden md:block">
            <UserAccountMenu
              user={user}
              onLogout={onLogout}
              isLoggingOut={isLoggingOut}
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            aria-label="Mở menu"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <List className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
