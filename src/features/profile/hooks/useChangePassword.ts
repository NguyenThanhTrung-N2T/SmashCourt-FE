/**
 * Hook to change password
 */
import { useState, useCallback } from "react";
import type { ChangePasswordRequest } from "@/src/features/profile/types/profile.types";
import { changeMyPassword } from "@/src/api/profile.api";

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