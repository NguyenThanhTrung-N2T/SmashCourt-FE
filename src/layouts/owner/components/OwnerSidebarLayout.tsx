"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState, useEffect } from "react";

import { authLogout } from "@/src/api/auth.api";
import { useGlobalToast } from "@/src/shared/hooks/useGlobalToast";
import {
    broadcastLogoutSync,
    clearAuthSession,
    getAuthUser,
    type AuthUserSession,
} from "@/src/features/auth/session/sessionStore";
import { RealtimeProviders } from "@/src/contexts/RealtimeProviders";
import { NotificationDrawer } from "@/src/features/notifications/components/NotificationDrawer";

import Sidebar from "./Sidebar";
import Header from "./Header";

type Props = {
    user: AuthUserSession;
    children: ReactNode;
};

function OwnerSidebarLayoutInner({ user: initialUser, children }: Props) {
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const { showToast } = useGlobalToast();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [user, setUser] = useState<AuthUserSession>(initialUser);

    useEffect(() => {
        const handleStorageChange = () => {
            const updatedUser = getAuthUser();
            if (updatedUser) setUser(updatedUser);
        };
        window.addEventListener("storage", handleStorageChange);
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

    void redirecting;

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
                    onOpenNotifications={() => setNotifOpen(true)}
                />

                <main className="flex-1 min-w-0 overflow-y-auto scrollbar-none">
                    {children}
                </main>
            </div>

            <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>
    );
}

export default function OwnerSidebarLayout(props: Props) {
    return (
        <RealtimeProviders>
            <OwnerSidebarLayoutInner {...props} />
        </RealtimeProviders>
    );
}
