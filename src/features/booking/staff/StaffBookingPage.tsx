"use client";

/**
 * Manager Booking Management Page
 * 
 * Manages bookings for the manager's assigned branch only.
 */

import { useMyProfile } from '@/src/features/profile/hooks/useMyProfile';
import { BookingManagementBase } from '@/src/features/booking/shared/pages/BookingManagementBase';
import { PageLoadingState } from '@/src/features/staff/shared/components/states';

export function StaffBookingPage() {
  const { data: profile, isLoading, error } = useMyProfile();

  if (isLoading) {
    return (
      <div className="px-8 pt-6 pb-10">
        <PageLoadingState />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold">
        Không thể tải thông tin chi nhánh của bạn. Vui lòng tải lại trang.
      </div>
    );
  }

  const managerBranchId = profile.branch?.id;
  const managerBranchName = profile.branch?.name || "Chi nhánh";

  if (!managerBranchId) {
    return (
      <div className="p-8 text-center text-amber-500 font-semibold">
        Tài khoản của bạn chưa được chỉ định quản lý chi nhánh nào.
      </div>
    );
  }

  return (
    <BookingManagementBase
      isOwner={false}
      initialBranchId={managerBranchId}
      branchName={managerBranchName}
      title="Đặt sân"
      description="Quản lý và vận hành việc đặt sân tại chi nhánh của bạn"
    />
  );
}
