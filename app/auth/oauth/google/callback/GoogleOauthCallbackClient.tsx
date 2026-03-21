"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authGoogleCallback } from "@/src/auth/api/authApi";
import AuthStatusToast from "@/src/auth/components/AuthStatusToast";
import { getRedirectPathByRole } from "@/src/auth/constants";
import { setAuthenticatedSession } from "@/src/auth/session/sessionStore";

const REDIRECT_MS = 2000;

export default function GoogleOauthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTimeoutRef = useRef<number | null>(null);

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      if (!code || !state) {
        setLoading(false);
        setError("Thiếu thông tin callback OAuth Google.");
        return;
      }

      try {
        const data = await authGoogleCallback({ code, state });
        if (data.status === "Success") {
          if (data.accessToken && data.user) {
            setAuthenticatedSession({
              accessToken: data.accessToken,
              user: data.user,
            });
          }
          const role = data.user?.role as string | undefined;

          if (!cancelled) {
            setRedirecting(true);
            redirectTimeoutRef.current = window.setTimeout(() => {
              router.push(getRedirectPathByRole(role));
            }, REDIRECT_MS);
          }
          return;
        }

        setError(data.message ?? "Đăng nhập Google thất bại.");
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Đăng nhập Google thất bại.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [code, router, state]);

  return (
    <section>
      <h2 className="text-2xl font-semibold">Đăng nhập với Google</h2>
      {loading ? (
        <p className="mt-2 text-sm opacity-80">Đang kết nối với Google...</p>
      ) : error ? (
        <p className="mt-2 text-sm text-red-700">{error}</p>
      ) : (
        <p className="mt-2 text-sm opacity-80">Đang hoàn tất đăng nhập...</p>
      )}

      <AuthStatusToast
        visible={redirecting}
        tone="success"
        message="Đăng nhập thành công"
      />
    </section>
  );
}

