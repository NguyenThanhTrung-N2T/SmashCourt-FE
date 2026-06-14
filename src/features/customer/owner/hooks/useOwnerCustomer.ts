"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchBranches } from "@/src/api/branch.api";
import { fetchAllLoyaltyTiers } from "@/src/api/loyalty-tier.api";
import { lockCustomer, unlockCustomer } from "@/src/api/customer.api";
import { handleApiError } from "../../shared/utils/error-handling";
import { useCustomerBase } from "@/src/features/customer/shared/hooks/useCustomerBase";

type CustomerLockModal = {
    customerId: string;
    customerName: string;
};

type CustomerUnlockModal = {
    customerId: string;
    customerName: string;
    lockReason?: string;
};

export function useOwnerCustomer() {
    const base = useCustomerBase("owner");

    const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
    const [loyaltyTiers, setLoyaltyTiers] = useState<Array<{ id: string; name: string }>>([]);
    const [lockModal, setLockModal] = useState<CustomerLockModal | null>(null);
    const [unlockModal, setUnlockModal] = useState<CustomerUnlockModal | null>(null);

    useEffect(() => {
        const loadFilterData = async () => {
            try {
                const [branchesData, tiersData] = await Promise.all([
                    fetchBranches(1, 50),
                    fetchAllLoyaltyTiers(),
                ]);

                setBranches(branchesData.items.map((branch) => ({ id: branch.id, name: branch.name })));
                setLoyaltyTiers(tiersData.map((tier) => ({ id: tier.id, name: tier.name })));
            } catch (err) {
                console.error("Failed to load filter data:", err);
            }
        };

        void loadFilterData();
    }, []);

    const handleLockCustomer = useCallback(
        (customerId: string) => {
            const customer = base.customers.find((c) => c.id === customerId);
            if (customer) {
                setLockModal({
                    customerId,
                    customerName: customer.fullName,
                });
            }
        },
        [base.customers]
    );

    const handleUnlockCustomer = useCallback(
        (customerId: string) => {
            const customer = base.customers.find((c) => c.id === customerId);
            if (customer) {
                setUnlockModal({
                    customerId,
                    customerName: customer.fullName,
                    lockReason: undefined,
                });
            }
        },
        [base.customers]
    );

    const confirmLockCustomer = useCallback(
        async (data: { reason: string }) => {
            if (!lockModal) return;

            try {
                await lockCustomer(lockModal.customerId, data);
                base.showToast("success", "Đã khóa tài khoản khách hàng");
                setLockModal(null);
                await base.refreshCustomers();
            } catch (err) {
                const message = handleApiError(err);
                base.showToast("error", message);
                throw err;
            }
        },
        [base, lockModal]
    );

    const confirmUnlockCustomer = useCallback(async () => {
        if (!unlockModal) return;

        try {
            await unlockCustomer(unlockModal.customerId);
            base.showToast("success", "Đã mở khóa tài khoản khách hàng");
            setUnlockModal(null);
            await base.refreshCustomers();
        } catch (err) {
            const message = handleApiError(err);
            base.showToast("error", message);
            throw err;
        }
    }, [base, unlockModal]);

    return {
        ...base,
        branches,
        loyaltyTiers,
        lockModal,
        unlockModal,
        setLockModal,
        setUnlockModal,
        handleLockCustomer,
        handleUnlockCustomer,
        confirmLockCustomer,
        confirmUnlockCustomer,
    };
}