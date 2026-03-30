"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import {
  AuthApiError,
  authRefresh,
} from "@/src/auth/api/authApi";
import {
  clearAuthSession,
  getAccessToken,
  getAuthUser,
  setAccessToken,
  type AuthUserSession,
} from "@/src/auth/session/sessionStore";
import OwnerSidebarLayout from "@/src/owner/components/OwnerSidebarLayout";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<{
    ready: boolean;
    user: AuthUserSession | null;
  }>({ ready: false, user: null });

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const initialToken = getAccessToken();
      const initialUser = getAuthUser();

      // Already has a valid session
      if (initialToken && initialUser) {
        if (initialUser.role.toUpperCase() !== "OWNER") {
          router.replace("/");
          return;
        }
        if (active) setState({ ready: true, user: initialUser });
        return;
      }

      // No user at all — redirect to login
      if (!initialUser) {
        router.replace("/auth/login");
        return;
      }

      // Has user but token expired — try refresh
      try {
        const data = await authRefresh();
        if (!active) return;

        setAccessToken(data.accessToken);
        const refreshedUser = getAuthUser();

        if (!refreshedUser || refreshedUser.role.toUpperCase() !== "OWNER") {
          clearAuthSession();
          router.replace("/auth/login");
          return;
        }

        setState({ ready: true, user: refreshedUser });
      } catch (err) {
        if (!active) return;
        if (!(err instanceof AuthApiError)) {
          console.error("owner-layout-bootstrap", err);
        }
        clearAuthSession();
        router.replace("/auth/login");
      }
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, [router]);

  // Loading screen
  if (!state.ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-400">Đang xác thực…</p>
        </div>
      </div>
    );
  }

  if (!state.user) return null;

  return (
    <OwnerSidebarLayout user={state.user}>{children}</OwnerSidebarLayout>
  );
}
