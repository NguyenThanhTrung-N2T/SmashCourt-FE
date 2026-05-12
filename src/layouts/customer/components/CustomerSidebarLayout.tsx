"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

import { authLogout } from "@/src/api/auth.api";
import AuthStatusToast from "@/src/features/auth/components/AuthStatusToast";
import {
    broadcastLogoutSync,
    clearAuthSession,
    type AuthUserSession,
} from "@/src/features/auth/session/sessionStore";

import CustomerSidebar from "./CustomerSidebar";
import CustomerHeader from "./CustomerHeader";

type Props = {
    user: AuthUserSession;
    children: ReactNode;
};

export default function CustomerSidebarLayout({ user, children }: Props) {
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

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
        window.setTimeout(() => {
            router.push("/auth/login");
        }, 1200);
    }

    return (
        <div className="h-screen w-full overflow-hidden flex font-sans text-foreground bg-[var(--page-bg)] transition-colors duration-300">
            <CustomerSidebar
                isLoggingOut={loggingOut}
                onLogout={onLogout}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 p-4 gap-0">
                <CustomerHeader
                    user={user}
                    onMenuToggle={() => setMobileOpen(true)}
                    onLogout={onLogout}
                    isLoggingOut={loggingOut}
                />

                <main className="flex-1 min-w-0 overflow-y-auto scrollbar-none">
                    {children}
                </main>
            </div>

            <AuthStatusToast
                visible={redirecting}
                tone="success"
                message="Đăng xuất thành công"
            />
        </div>
    );
}
