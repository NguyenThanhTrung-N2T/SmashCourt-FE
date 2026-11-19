"use client";

import { Suspense } from "react";
import { OwnerBookingApprovalPage } from "@/src/features/booking-approval/owner/OwnerBookingApprovalPage";

export default function OwnerBookingApprovalsRoute() {
  return (
    <Suspense>
      <OwnerBookingApprovalPage />
    </Suspense>
  );
}

