"use client";

/**
 * Owner Booking Management Page
 * 
 * Manages bookings across all branches. Enables branch selection.
 */

import { useState, useEffect } from 'react';
import { fetchBranches } from '@/src/api/branch.api';
import type { BranchDto } from '@/src/features/branch/shared/types/branch.types';
import { BookingManagementBase } from '@/src/features/booking/shared/pages/BookingManagementBase';
import { PageLoadingState } from '@/src/features/staff/shared/components/states';

export function OwnerBookingPage() {
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data = await fetchBranches(1, 50); // Get first 50 branches
        setBranches(data.items || []);
      } catch (error) {
        console.error('Failed to load branches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBranches();
  }, []);

  if (loading) {
    return (
      <div className="px-8 pt-6 pb-10">
        <PageLoadingState />
      </div>
    );
  }

  return (
    <BookingManagementBase
      isOwner={true}
      branches={branches}
      title="Đặt sân"
      description="Quản lý và vận hành việc đặt sân trên toàn hệ thống"
    />
  );
}
