/**
 * Payment Result Page
 * 
 * Page for displaying VNPay payment result.
 */

"use client";

import { Suspense } from "react";
import { PaymentResult } from "@/src/features/booking/customer/components";
import { Spinner } from "@/src/shared/components/feedback/Spinner";

function PaymentResultContent() {
  return <PaymentResult />;
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface-0">
          <Spinner size="lg" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
