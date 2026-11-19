/**
 * Booking Result Page
 * 
 * Displays the result of an online booking submission:
 * - PENDING (approved): deposit details + countdown to expiresAt + Pay Deposit button
 * - CONFIRMED: pay at counter details
 * - PENDING_APPROVAL: branch manager review notice + countdown to approvalExpiresAt + Cancel button
 * 
 * Contract: DEPOSIT_APPROVAL_API.md §3.1
 */

"use client";

import { Suspense } from "react";
import { BookingResultPage } from "@/src/features/booking/customer/components";
import { Spinner } from "@/src/shared/components/feedback/Spinner";

function BookingResultContent() {
  return <BookingResultPage />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-surface-0">
          <Spinner size="lg" />
        </div>
      }
    >
      <BookingResultContent />
    </Suspense>
  );
}

