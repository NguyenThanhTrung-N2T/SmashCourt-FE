"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BookingHistory from "@/src/customer/components/BookingHistory";
import { getAccessToken, getAuthUser } from "@/src/auth/session/sessionStore";

export default function BookingHistoryPage() {
  const router = useRouter();
  const [sessionOk] = useState(() => {
    try {
      const accessToken = getAccessToken();
      const authUser = getAuthUser();
      return Boolean(accessToken && authUser);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!sessionOk) {
      router.push("/auth/login");
    }
  }, [router, sessionOk]);

  if (!sessionOk) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="mt-4 text-sm font-semibold text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return <BookingHistory />;
}
