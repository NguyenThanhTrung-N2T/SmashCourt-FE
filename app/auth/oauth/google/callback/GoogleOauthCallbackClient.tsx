"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authGoogleCallback } from "@/src/auth/api/authApi";
import { getRedirectPathByRole } from "@/src/auth/constants";
import { setAccessToken } from "@/src/auth/session/sessionStore";

export default function GoogleOauthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Code và state
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Trạng thái loading và error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Xử lý callback OAuth Google
  useEffect(() => {
    let cancelled = false;

    // Xử lý callback OAuth Google
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
          if (data.accessToken) setAccessToken(data.accessToken);
          const role = data.user?.role as string | undefined;
          if (!cancelled) router.push(getRedirectPathByRole(role));
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
        <p className="mt-2 text-sm opacity-80">Đang chuyển hướng...</p>
      )}
    </section>
  );
}
