"use client";

import { CustomerDetailPageContent } from "@/src/features/customer/shared/components/CustomerDetailPageContent";

import { LockCustomerModal } from "../dialogs/LockCustomerModal";
import { UnlockCustomerModal } from "../dialogs/UnlockCustomerModal";

import { useOwnerCustomerDetail } from "@/src/features/customer/owner/hooks/useOwnerCustomerDetail";

export function OwnerCustomerDetailPage() {
    const {
        customer,
        loading,
        error,
        toast,

        lockModal,
        unlockModal,

        setLockModal,
        setUnlockModal,

        loadCustomerDetail,

        confirmLockCustomer,
        confirmUnlockCustomer,
    } = useOwnerCustomerDetail();

    return (
        <>
            <CustomerDetailPageContent
                customer={customer}
                loading={loading}
                error={error}
                toast={toast}
                isOwner
                onRetry={loadCustomerDetail}
                onLockCustomer={() => setLockModal(true)}
                onUnlockCustomer={() => setUnlockModal(true)}
            />

            {lockModal && customer && (
                <LockCustomerModal
                    customerName={customer.fullName}
                    onClose={() => setLockModal(false)}
                    onConfirm={confirmLockCustomer}
                />
            )}

            {unlockModal && customer && (
                <UnlockCustomerModal
                    customerName={customer.fullName}
                    lockReason={customer.lockInfo?.reason}
                    onClose={() => setUnlockModal(false)}
                    onConfirm={confirmUnlockCustomer}
                />
            )}
        </>
    );
}