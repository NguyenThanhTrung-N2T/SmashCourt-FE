"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/shared/hooks/useToast";
import { fetchCustomers } from "@/src/api/customer.api";
import { handleApiError } from "../../shared/utils/error-handling";
import type { CustomerListDto, CustomerListQuery } from "../../shared/types/customer.types";

type PaginationState = {
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};

const DEFAULT_FILTERS: CustomerListQuery = {
    page: 1,
    pageSize: 20,
    sortBy: "createdat",
    sortOrder: "desc",
};

const DEFAULT_PAGINATION: PaginationState = {
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
};

export function useCustomerBase(rolePath: "manager" | "owner" | "staff") {
    const router = useRouter();
    const { toast, show: showToast } = useToast();
    const isFirstLoad = useRef(true);

    const [customers, setCustomers] = useState<CustomerListDto[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<CustomerListQuery>(DEFAULT_FILTERS);
    const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);

    const loadCustomers = useCallback(
        async (queryFilters: CustomerListQuery, isInitial = false) => {
            if (isInitial) {
                setInitialLoading(true);
            } else {
                setTableLoading(true);
            }

            setError(null);

            try {
                const data = await fetchCustomers(queryFilters);

                setCustomers(data.items);
                setPagination({
                    totalItems: data.totalItems,
                    totalPages: data.totalPages,
                    hasNext: data.hasNext,
                    hasPrev: data.hasPrev,
                });
            } catch (err) {
                const errorMessage = handleApiError(err);
                setError(errorMessage);
                showToast("error", errorMessage);
            } finally {
                setInitialLoading(false);
                setTableLoading(false);
            }
        },
        [showToast]
    );

    useEffect(() => {
        void loadCustomers(filters, isFirstLoad.current);
        isFirstLoad.current = false;
    }, [filters, loadCustomers]);

    const handleFiltersChange = useCallback((newFilters: CustomerListQuery) => {
        setFilters(newFilters);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    }, []);

    const handleViewDetails = useCallback(
        (customerId: string) => {
            router.push(`/${rolePath}/customers/${customerId}`);
        },
        [router, rolePath]
    );

    const refreshCustomers = useCallback(async () => {
        await loadCustomers(filters, false);
    }, [filters, loadCustomers]);

    return {
        toast,
        showToast,
        customers,
        initialLoading,
        tableLoading,
        error,
        filters,
        pagination,
        loadCustomers,
        refreshCustomers,
        handleFiltersChange,
        handlePageChange,
        handleViewDetails,
        setCustomers,
        setFilters,
        setPagination,
        setError,
    };
}