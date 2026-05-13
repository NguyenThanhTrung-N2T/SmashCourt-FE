/**
 * Promotions Page
 * 
 * Customer active promotions page - displays all available promotion codes.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerPromotionsPage } from "@/src/features/benefit/promotion/customer/CustomerPromotionsPage";
import { getAccessToken, getAuthUser, type AuthUserSession } from "@/src/features/auth/session/sessionStore";

export default function PromotionsPage() {
  const router = useRouter();
  const [user] = useState<AuthUserSession | null>(() => {
    try {
      const accessToken = getAccessToken();
      const authUser = getAuthUser();
      if (!accessToken || !authUser) return null;
      return authUser;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [router, user]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return <CustomerPromotionsPage />;
}
