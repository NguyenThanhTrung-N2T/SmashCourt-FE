/**
 * Hook to update user profile
 */
import { useState, useCallback } from "react";
import { updateMyProfile } from "@/src/api/profile.api";
import type { UpdateProfileRequest } from "@/src/features/profile/types/profile.types";
import { getAuthUser, setAuthUser } from "@/src/features/auth/session/sessionStore";

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