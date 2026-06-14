"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState, useEffect } from "react";

import { authLogout } from "@/src/api/auth.api";
import { Toast } from "@/src/shared/components/ui/Toast";
import { useToast } from "@/src/shared/hooks/useToast";
import {
    broadcastLogoutSync,
    clearAuthSession,
    getAuthUser,
    type AuthUserSession,
} from "@/src/features/auth/session/sessionStore";

import Sidebar from "./Sidebar";
import Header from "./Header";

type Props = {
    user: AuthUserSession;
    children: ReactNode;
};

export default function OwnerSidebarLayout({ user: initialUser, children }: Props) {
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const { toast, show: showToast } = useToast();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<AuthUserSession>(initialUser);

    // Listen for session storage changes to update user data
    useEffect(() => {
        const handleStorageChange = () => {
            const updatedUser = getAuthUser();
            if (updatedUser) {
                setUser(updatedUser);
            }
        };

        // Listen for storage events (from other tabs/windows)
        window.addEventListener("storage", handleStorageChange);
        
        // Also check periodically for same-tab updates
        const interval = setInterval(handleStorageChange, 1000);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    async function onLogout() {
        try {
            setLoggingOut(true);
            await authLogout();
        } catch {
            setLoggingOut(false);
            return;
        }
        broadcastLogoutSync();
        clearAuthSession();
        setRedirecting(true);
        showToast("success", "Đăng xuất thành công");
        window.setTimeout(() => {
            router.push("/auth/login");
        }, 1200);
    }

    return (
        <div className="h-screen w-full overflow-hidden flex font-sans text-foreground bg-[var(--page-bg)] transition-colors duration-300">
            <Sidebar
                isLoggingOut={loggingOut}
                onLogout={onLogout}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 p-4 gap-0">
                <Header
                    user={user}
                    onMenuToggle={() => setMobileOpen(true)}
                    onLogout={onLogout}
                    isLoggingOut={loggingOut}
                />

                <main className="flex-1 min-w-0 overflow-y-auto scrollbar-none">
                    {children}
                </main>
            </div>

            <Toast toast={toast} />
        </div>
    );
}
