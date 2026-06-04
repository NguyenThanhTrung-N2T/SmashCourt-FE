"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import GuestLanding from "@/app/GuestLanding";
import { AuthApiError, authRefresh } from "@/src/api/auth.api";
import {
  clearAuthSession,
  getAccessToken,
  getAuthUser,
  setAccessToken,
  type AuthUserSession,
} from "@/src/features/auth/session/sessionStore";

function readSession() {
  try {
    return {
      accessToken: getAccessToken(),
      authUser: getAuthUser(),
    };
  } catch {
    return {
      accessToken: null,
      authUser: null,
    };
  }
}

/** Redirect OWNER to /owner (avoids calling router.push during render) */
function OwnerRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/owner");
  }, [router]);
  // Use inline style to ensure theme variable is applied
  return <div className="min-h-screen" style={{ background: 'var(--background)' }} />;
}

/** Redirect MANAGER to /manager (avoids calling router.push during render) */
function ManagerRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/manager");
  }, [router]);
  // Use inline style to ensure theme variable is applied
  return <div className="min-h-screen" style={{ background: 'var(--background)' }} />;
}
/** Redirect STAFF to /staff (avoids calling router.push during render) */
function StaffRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/staff");
  }, [router]);
  // Use inline style to ensure theme variable is applied
  return <div className="min-h-screen" style={{ background: 'var(--background)' }} />;
}
/** Redirect CUSTOMER to /bookings/new (avoids calling router.push during render) */
function CustomerRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/bookings/new");
  }, [router]);
  // Use inline style to ensure theme variable is applied
  return <div className="min-h-screen" style={{ background: 'var(--background)' }} />;
}

export default function HomeGateClient() {
  const [session, setSession] = useState(() => readSession());
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let active = true;

    async function bootstrapSession() {
      const currentSession = readSession();
      if (!active) return;
      setSession(currentSession);

      if (currentSession.accessToken && currentSession.authUser) {
        setBootstrapping(false);
        return;
      }

      // Nếu chưa login bao giờ (không user), không cố refresh
      if (!currentSession.authUser) {
        setBootstrapping(false);
        return;
      }

      try {
        const data = await authRefresh();
        if (!active) return;

        const nextUser = getAuthUser();
        if (!nextUser) {
          clearAuthSession();
          setSession({
            accessToken: null,
            authUser: null,
          });
          return;
        }

        setAccessToken(data.accessToken);
        setSession({
          accessToken: data.accessToken,
          authUser: nextUser,
        });
      } catch (err) {
        if (!active) return;

        if (err instanceof AuthApiError && err.status !== 401) {
          console.error("bootstrap-refresh", err);
        }

        clearAuthSession();
        setSession({
          accessToken: null,
          authUser: null,
        });
      } finally {
        if (active) {
          setBootstrapping(false);
        }
      }
    }

    void bootstrapSession();

    return () => {
      active = false;
    };
  }, []);

  const { accessToken, authUser } = session as {
    accessToken: string | null;
    authUser: AuthUserSession | null;
  };

  if (bootstrapping) {
    return null;
  }

  if (accessToken && authUser) {
    const role = authUser.role.toUpperCase();
    if (role === "OWNER") {
      return <OwnerRedirect />;
    }
    if (role === "BRANCH_MANAGER") {
      return <ManagerRedirect />;
    }
    if (role === "STAFF") {
      return <StaffRedirect />;
    }
    if (role === "CUSTOMER") {
      return <CustomerRedirect />;
    }
  }

  return <GuestLanding />;
}
