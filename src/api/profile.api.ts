/**
 * Profile Management API
 * 
 * All profile-related API endpoints.
 */

import type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserSession,
} from "@/src/shared/types/profile.types";

import { authProtectedFetch, withResponseMeta } from "./core";

/**
 * Get current user's profile
 */
export async function getMyProfile() {
  const response = await authProtectedFetch<UserProfile>("/api/me", {
    method: "GET",
  });

  return withResponseMeta(response);
}

/**
 * Update current user's profile
 */
export async function updateMyProfile(body: UpdateProfileRequest) {
  const response = await authProtectedFetch<null>("/api/me", {
    method: "PUT",
    body,
  });

  return {
    message: response.message ?? undefined,
    code: response.code ?? undefined,
  };
}

/**
 * Change current user's password
 */
export async function changeMyPassword(body: ChangePasswordRequest) {
  const response = await authProtectedFetch<null>("/api/me/password", {
    method: "PUT",
    body,
  });

  return {
    message: response.message ?? undefined,
    code: response.code ?? undefined,
  };
}

/**
 * Get all active sessions for current user
 */
export async function getMySessions() {
  const response = await authProtectedFetch<UserSession[]>("/api/me/sessions", {
    method: "GET",
  });

  if (!response.data) {
    throw new Error("Không thể tải danh sách thiết bị");
  }

  return response.data;
}

/**
 * Logout a specific session
 */
export async function logoutSession(sessionId: string) {
  const response = await authProtectedFetch<null>(
    `/api/me/sessions/${sessionId}`,
    {
      method: "DELETE",
    },
  );

  return {
    message: response.message ?? undefined,
    code: response.code ?? undefined,
  };
}

/**
 * Logout all other sessions except current
 */
export async function logoutAllOtherSessions() {
  const response = await authProtectedFetch<null>("/api/me/sessions/all", {
    method: "DELETE",
  });

  return {
    message: response.message ?? undefined,
    code: response.code ?? undefined,
  };
}
