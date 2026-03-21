"use client";

import GuestLanding from "@/app/GuestLanding";
import {
  getAccessToken,
  getAuthUser,
  type AuthUserSession,
} from "@/src/auth/session/sessionStore";
import CustomerHomeShell from "./CustomerHomeShell";

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
  const { accessToken, authUser } = readSession() as {
    accessToken: string | null;
    authUser: AuthUserSession | null;
  };

  if (accessToken && authUser && authUser.role.toUpperCase() === "CUSTOMER") {
    return <CustomerHomeShell accessToken={accessToken} user={authUser} />;
  }

  return <GuestLanding />;
}
