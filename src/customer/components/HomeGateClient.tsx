"use client";

import { useEffect, useState } from "react";

import GuestLanding from "@/app/GuestLanding";
import { AuthApiError, authRefresh } from "@/src/auth/api/authApi";
import {
  clearAuthSession,
  getAccessToken,
  getAuthUser,
  setAccessToken,
  type AuthUserSession,
} from "@/src/auth/session/sessionStore";
import CustomerHomeShell from "./CustomerHomeShell";
import OwnerHomeShell from "@/src/owner/components/OwnerHomeShell";
import WorkspaceHomeShell from "@/src/employee/components/WorkspaceHomeShell";

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
      return <OwnerHomeShell accessToken={accessToken} user={authUser} />;
    }
    if (role === "BRANCH_MANAGER" || role === "BRANCH-MANAGER" || role === "STAFF") {
      return <WorkspaceHomeShell accessToken={accessToken} user={authUser} />;
    }
    if (role === "CUSTOMER") {
      return <CustomerHomeShell accessToken={accessToken} user={authUser} />;
    }
  }

  return <GuestLanding />;
}
