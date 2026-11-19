"use client";

import { Suspense } from "react";
import { ManagerBookingApprovalPage } from "@/src/features/booking-approval/manager/ManagerBookingApprovalPage";

export default function ManagerBookingApprovalsRoute() {
  return (
    <Suspense>
      <ManagerBookingApprovalPage />
    </Suspense>
  );
}

