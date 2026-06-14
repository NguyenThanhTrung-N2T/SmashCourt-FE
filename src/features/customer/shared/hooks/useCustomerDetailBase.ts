"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/src/shared/hooks/useToast";
import { fetchCustomerById } from "@/src/api/customer.api";
import { handleApiError } from "@/src/features/customer/shared/utils/error-handling";
import type { CustomerDetailDto } from "@/src/features/customer/shared/types/customer.types";

export function useCustomerDetailBase() {
    const params = useParams();
    const customerId = params.id as string;

    const { toast, show: showToast } = useToast();

    const [customer, setCustomer] = useState<CustomerDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCustomerDetail = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchCustomerById(customerId);
            setCustomer(data);
        } catch (err) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            showToast("error", errorMessage);
        } finally {
            setLoading(false);
        }
    }, [customerId, showToast]);

    useEffect(() => {
        if (customerId) {
            void loadCustomerDetail();
        }
    }, [customerId, loadCustomerDetail]);

    return {
        customerId,
        customer,
        loading,
        error,
        toast,
        showToast,
        loadCustomerDetail,
    };
}