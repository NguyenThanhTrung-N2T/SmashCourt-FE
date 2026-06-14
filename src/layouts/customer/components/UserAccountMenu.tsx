"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaretDown, SignOut } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { CUSTOMER_ACCOUNT_MENU } from "../navigation/customer.navigation";
import type { AuthUser } from "@/src/shared/types/auth.types";

interface UserAccountMenuProps {
  user: AuthUser;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export default function UserAccountMenu({
  user,
  onLogout,
  isLoggingOut,
}: UserAccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleMenuItemClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  // Get user initials for avatar
  const userInitials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={toggleMenu}
        aria-label="Menu tài khoản"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {/* User Avatar */}
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-primary">{userInitials}</span>
          )}
        </div>

        {/* User Name (hidden on mobile) */}
        <span className="hidden md:block text-sm font-semibold text-foreground max-w-[120px] truncate">
          {user.fullName || user.email}
        </span>

        {/* Caret Icon */}
        <CaretDown
          className={`h-4 w-4 text-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-64 bg-surface-1 rounded-2xl shadow-xl border border-border overflow-hidden auth-animate-scale-in z-50"
        >
          {/* User Info Section */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-base font-bold text-primary">
                    {userInitials}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="py-2">
            {CUSTOMER_ACCOUNT_MENU.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleMenuItemClick(item.href)}
                  role="menuitem"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:bg-surface-2"
                >
                  <Icon className="h-[18px] w-[18px] text-muted" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-3 border-t border-border">
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              isLoading={isLoggingOut}
              className="w-full"
              leftIcon={<SignOut className="h-4 w-4" />}
            >
              {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
