/**
 * Booking Cancellation Page
 * 
 * Page for canceling a booking via token link.
 */

"use client";

import { Suspense } from "react";
import { CancellationView } from "@/src/features/booking/customer/components";
import { Spinner } from "@/src/shared/components/feedback/Spinner";

interface CancelBookingPageProps {
  params: {
    token: string;
  };
}

function CancelBookingContent({ token }: { token: string }) {
  return <CancellationView token={token} />;
}

export default function CancelBookingPage({ params }: CancelBookingPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface-0">
          <Spinner size="lg" />
        </div>
      }
    >
      <CancelBookingContent token={params.token} />
    </Suspense>
  );
}
