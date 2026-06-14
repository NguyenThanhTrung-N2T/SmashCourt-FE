"use client";

import { StaffBookingPage } from '@/src/features/booking/staff/StaffBookingPage';
import {Suspense} from 'react';
export default function ManagerBookingsPage() {
  return (
    <Suspense>
      <StaffBookingPage />
    </Suspense>
  );
}

