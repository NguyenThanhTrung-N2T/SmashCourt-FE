"use client";

import { ReactNode } from "react";
import { RoleGuard } from "@/src/features/auth/components/RoleGuard";
import CustomerTopNavLayout from "@/src/layouts/customer/components/CustomerTopNavLayout";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRole="CUSTOMER">
      {(user) => (
        <CustomerTopNavLayout user={user}>
          {children}
        </CustomerTopNavLayout>
      )}
    </RoleGuard>
  );
}
