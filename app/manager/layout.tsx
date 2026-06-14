"use client";

import { ReactNode } from "react";
import { RoleGuard } from "@/src/features/auth/components/RoleGuard";
import ManagerSidebarLayout from "@/src/layouts/manager/components/ManagerSidebarLayout";

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRole="BRANCH_MANAGER">
      {(user) => (
        <ManagerSidebarLayout user={user} branchName="Chi nhánh">
          {children}
        </ManagerSidebarLayout>
      )}
    </RoleGuard>
  );
}
