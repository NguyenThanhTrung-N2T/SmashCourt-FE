"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserProfile from "@/src/domains/customer/components/UserProfile";
import { getAccessToken, getAuthUser, type AuthUserSession } from "@/src/modules/auth/session/sessionStore";

export default function UserProfilePage() {
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="mt-4 text-sm font-semibold text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return <UserProfile user={user} />;
}
