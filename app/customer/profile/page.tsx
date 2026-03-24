"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserProfile from "@/src/customer/components/UserProfile";
import { getAccessToken, getAuthUser, type AuthUserSession } from "@/src/auth/session/sessionStore";

export default function UserProfilePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<AuthUserSession | null>(null);

  useEffect(() => {
    try {
      const accessToken = getAccessToken();
      const authUser = getAuthUser();

      if (!accessToken || !authUser) {
        router.push("/auth/login");
        return;
      }

      setUser(authUser);
      setIsChecking(false);
    } catch {
      router.push("/auth/login");
    }
  }, [router]);

  if (isChecking || !user) {
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
