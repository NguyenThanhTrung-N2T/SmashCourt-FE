"use client";

import { OwnerBookingPage } from '@/src/features/booking/owner/OwnerBookingPage';
import {Suspense} from 'react';
export default function OwnerBookingsPage() {
  return (
    <Suspense>
      <OwnerBookingPage />
    </Suspense>
  );
}


