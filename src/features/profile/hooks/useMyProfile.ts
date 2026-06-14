/**
 * Hook to fetch and manage user profile
 */
import { useState, useEffect, useCallback } from "react";
import { getMyProfile } from "@/src/api/profile.api";
import { getAuthUser, setAuthUser } from "@/src/features/auth/session/sessionStore";
import type { UserProfile } from "@/src/features/profile/types/profile.types";

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



