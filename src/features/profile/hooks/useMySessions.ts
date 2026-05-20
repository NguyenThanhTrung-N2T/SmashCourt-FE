/**
 * Hook to fetch and manage user sessions
 */
import { useEffect, useState, useCallback } from "react";
import { UserSession } from "../types/profile.types";
import { getMySessions, logoutSession, logoutAllOtherSessions } from "@/src/api/profile.api";

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