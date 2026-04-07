"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
    getAccessToken,
    getAuthUser,
    clearAuthSession,
    setAccessToken,
    type AuthUserSession
} from "../session/sessionStore";
import { authRefresh } from "@/src/api/auth.api";

interface RoleGuardProps {
    children: (user: AuthUserSession) => ReactNode; // We use a function as children (Render Prop)
    allowedRole: string;
}

export function RoleGuard({ children, allowedRole }: RoleGuardProps) {
    const router = useRouter();
    const [user, setUser] = useState<AuthUserSession | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function checkAuth() {
            try {
                // Now it's safe to call these because we are inside useEffect (Browser only)
                const token = getAccessToken();
                const initialUser = getAuthUser();

                if (!initialUser) {
                    router.replace("/auth/login");
                    return;
                }

                // 1. Valid session exists
                if (token) {
                    if (initialUser.role.toUpperCase() !== allowedRole.toUpperCase()) {
                        router.replace("/");
                        return;
                    }
                    if (isMounted) {
                        setUser(initialUser);
                        setIsReady(true);
                    }
                    return;
                }

                // 2. Token expired - Try Refresh
                const data = await authRefresh();
                setAccessToken(data.accessToken);
                const refreshedUser = getAuthUser();

                if (!refreshedUser || refreshedUser.role.toUpperCase() !== allowedRole.toUpperCase()) {
                    throw new Error("Invalid role");
                }

                if (isMounted) {
                    setUser(refreshedUser);
                    setIsReady(true);
                }
            } catch (err) {
                console.error("Auth Guard Error:", err);
                clearAuthSession();
                router.replace("/auth/login");
            }
        }

        checkAuth();
        return () => { isMounted = false; };
    }, [allowedRole, router]);

    if (!isReady || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                    <p className="text-sm font-semibold text-slate-400">Đang xác thực…</p>
                </div>
            </div>
        );
    }

    // Pass the verified user to the layout
    return <>{children(user)}</>;
}