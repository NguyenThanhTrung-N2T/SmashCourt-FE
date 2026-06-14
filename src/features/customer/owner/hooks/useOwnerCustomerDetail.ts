"use client";

import { useCallback, useState } from "react";
import { lockCustomer, unlockCustomer } from "@/src/api/customer.api";
import { handleApiError } from "@/src/features/customer/shared/utils/error-handling";
import { useCustomerDetailBase } from "@/src/features/customer/shared/hooks/useCustomerDetailBase";

export function useOwnerCustomerDetail() {
    const base = useCustomerDetailBase();

    const [lockModal, setLockModal] = useState(false);
    const [unlockModal, setUnlockModal] = useState(false);

    const confirmLockCustomer = useCallback(
        async (data: { reason: string }) => {
            try {
                await lockCustomer(base.customerId, data);

                base.showToast("success", "Đã khóa tài khoản khách hàng");

                setLockModal(false);

                await base.loadCustomerDetail();
            } catch (err) {
                base.showToast("error", handleApiError(err));
                throw err;
            }
        },
        [base]
    );

    const confirmUnlockCustomer = useCallback(async () => {
        try {
            await unlockCustomer(base.customerId);

            base.showToast("success", "Đã mở khóa tài khoản khách hàng");

            setUnlockModal(false);

            await base.loadCustomerDetail();
        } catch (err) {
            base.showToast("error", handleApiError(err));
            throw err;
        }
    }, [base]);

    return {
        ...base,

        lockModal,
        unlockModal,

        setLockModal,
        setUnlockModal,

        confirmLockCustomer,
        confirmUnlockCustomer,
    };
}