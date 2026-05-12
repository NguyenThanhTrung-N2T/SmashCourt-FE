"use client";

import { ReactNode } from "react";
import { RoleGuard } from "@/src/features/auth/components/RoleGuard";
import CustomerSidebarLayout from "@/src/layouts/customer/components/CustomerSidebarLayout";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRole="CUSTOMER">
      {(user) => (
        <CustomerSidebarLayout user={user}>
          {children}
        </CustomerSidebarLayout>
      )}
    </RoleGuard>
  );
}
