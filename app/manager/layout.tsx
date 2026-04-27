"use client";

import { ReactNode } from "react";
import { RoleGuard } from "@/src/modules/auth/components/RoleGuard";
import ManagerSidebarLayout from "@/src/domains/manager/components/ManagerSidebarLayout";

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
