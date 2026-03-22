"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  AUTH_SYNC_EVENT_KEY,
  clearAuthSession,
} from "@/src/auth/session/sessionStore";

export default function AuthSessionSync() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== AUTH_SYNC_EVENT_KEY || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue) as { type?: string };
        if (payload.type !== "logout") {
          return;
        }
      } catch {
        return;
      }

      clearAuthSession();

      if (pathname !== "/auth/login") {
        router.replace("/auth/login");
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [pathname, router]);

  return null;
}
