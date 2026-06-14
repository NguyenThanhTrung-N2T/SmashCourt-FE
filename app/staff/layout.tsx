"use client";

import { ReactNode } from "react";
import { RoleGuard } from "@/src/features/auth/components/RoleGuard";
import StaffSidebarLayout from "@/src/layouts/staff/components/StaffSidebarLayout";

export default function StaffLayout({ children }: { children: ReactNode }) {
    return (
        <RoleGuard allowedRole="STAFF">
            {(user) => (
                <StaffSidebarLayout user={user}>
                    {children}
                </StaffSidebarLayout>
            )}
        </RoleGuard>
    );
}