"use client";

import { ReactNode } from "react";
import { RoleGuard } from "@/src/modules/auth/components/RoleGuard";
import OwnerSidebarLayout from "@/src/domains/owner/components/OwnerSidebarLayout";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRole="OWNER">
      {(user) => (
        <OwnerSidebarLayout user={user}>
          {children}
        </OwnerSidebarLayout>
      )}
    </RoleGuard>
  );
}