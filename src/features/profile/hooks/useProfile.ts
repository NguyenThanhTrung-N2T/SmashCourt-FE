/**
 * Profile Management Hooks
 */

import { useState, useEffect, useCallback } from "react";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  getMySessions,
  logoutSession,
  logoutAllOtherSessions,
} from "@/src/api/profile.api";
import {
  getAuthUser,
  setAuthUser,
} from "@/src/features/auth/session/sessionStore";
import type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserSession,
} from "@/src/shared/types/profile.types";

/**
 * Hook to fetch and manage user profile
 */
export function useMyProfile() {
  const [data, setData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getMyProfile();
      setData(response);
      
      // Sync session storage with latest profile data
      const currentUser = getAuthUser();
      if (currentUser && response) {
        setAuthUser({
          ...currentUser,
          fullName: response.fullName,
          phone: response.phone,
          avatarUrl: response.avatarUrl,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thông tin profile");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await updateMyProfile(data);
      
      // Update session storage with new profile data
      const currentUser = getAuthUser();
      if (currentUser) {
        setAuthUser({
          ...currentUser,
          fullName: data.fullName,
          phone: data.phone || null,
          avatarUrl: data.avatarUrl || currentUser.avatarUrl,
        });
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể cập nhật profile";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    updateProfile,
    isLoading,
    error,
  };
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await changeMyPassword(data);
      return { success: true, message: response.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể đổi mật khẩu";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    changePassword,
    isLoading,
    error,
  };
}

/**
 * Hook to fetch and manage user sessions
 */
export function useMySessions() {
  const [data, setData] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getMySessions();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách thiết bị");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const removeSession = useCallback(async (sessionId: string) => {
    try {
      await logoutSession(sessionId);
      setData((prev) => prev.filter((s) => s.id !== sessionId));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể đăng xuất thiết bị";
      return { success: false, error: errorMessage };
    }
  }, []);

  const removeAllOtherSessions = useCallback(async () => {
    try {
      await logoutAllOtherSessions();
      setData((prev) => prev.filter((s) => s.isCurrent));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể đăng xuất tất cả thiết bị";
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchSessions,
    removeSession,
    removeAllOtherSessions,
  };
}
