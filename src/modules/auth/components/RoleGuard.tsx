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
            <div className="flex min-h-screen flex-col items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative flex items-center justify-center">
                        {/* Outer pulsating ring */}
                        <div className="absolute h-20 w-20 animate-ping rounded-full bg-primary/20" />
                        {/* Main spinning ring */}
                        <div className="relative h-16 w-16 animate-spin rounded-full border-[3px] border-surface-2 border-t-primary" />
                        {/* Inner core */}
                        <div className="absolute h-5 w-5 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                        <h3 className="text-lg font-black tracking-tight text-foreground">
                            SmashCourt
                        </h3>
                        <p className="text-xs font-bold tracking-[0.2em] text-muted uppercase animate-pulse">
                            Đang xác thực...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Pass the verified user to the layout
    return <>{children(user)}</>;
}