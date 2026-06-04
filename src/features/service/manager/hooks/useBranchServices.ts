"use client";

import { useCallback, useEffect, useState } from "react";
import {
    getBranchServices,
    addServiceToBranch,
    updateServicePriceInBranch,
    disableBranchService,
} from "@/src/api/service.api";
import { fetchAllServices } from "@/src/api/service.api";
import { AuthApiError } from "@/src/api/auth.api";
import type {
    BranchService,
    Service,
    AddServiceToBranchRequest,
    UpdateBranchServicePriceRequest,
} from "@/src/features/service/shared/types/service.types";

interface UseBranchServicesOptions {
    branchId?: string;
    pageSize?: number;
}

interface UseBranchServicesReturn {
    // State
    branchServices: BranchService[];
    availableServices: Service[];
    allServicesCount: number;
    loading: boolean;
    actionLoading: boolean;
    error: string | null;

    // Pagination
    currentPage: number;
    totalPages: number;
    totalItems: number;

    // Actions
    refresh: () => Promise<void>;
    addService: (req: AddServiceToBranchRequest) => Promise<void>;
    updatePrice: (serviceId: string, req: UpdateBranchServicePriceRequest) => Promise<void>;
    disableService: (serviceId: string) => Promise<void>;
    setCurrentPage: (page: number) => void;
}

export function useBranchServices(
    { branchId, pageSize = 12 }: UseBranchServicesOptions = {}
): UseBranchServicesReturn {
    const [branchServices, setBranchServices] = useState<BranchService[]>([]);
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const load = useCallback(async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const [branchData, allData] = await Promise.all([
                getBranchServices(branchId, page, pageSize),
                fetchAllServices(1, 50),
            ]);

            setBranchServices(Array.isArray(branchData.items) ? branchData.items : []);
            setTotalPages(branchData.totalPages || 1);
            setTotalItems(branchData.totalItems || 0);
            setAllServices(Array.isArray(allData.items) ? allData.items : []);
        } catch (err) {
            setError(
                err instanceof AuthApiError
                    ? err.message
                    : "Không tải được danh sách dịch vụ"
            );
            setBranchServices([]);
        } finally {
            setLoading(false);
        }
    }, [branchId, pageSize]);

    useEffect(() => {
        load(currentPage);
    }, [load, currentPage]);

    const refresh = useCallback(async () => {
        await load(currentPage);
    }, [load, currentPage]);

    const addService = useCallback(async (req: AddServiceToBranchRequest) => {
        setActionLoading(true);
        try {
            await addServiceToBranch(req, branchId);
            await load(currentPage);
        } finally {
            setActionLoading(false);
        }
    }, [branchId, currentPage, load]);

    const updatePrice = useCallback(async (
        serviceId: string,
        req: UpdateBranchServicePriceRequest
    ) => {
        setActionLoading(true);
        try {
            await updateServicePriceInBranch(serviceId, req, branchId);
            await load(currentPage);
        } finally {
            setActionLoading(false);
        }
    }, [branchId, currentPage, load]);

    const disableService = useCallback(async (serviceId: string) => {
        setActionLoading(true);
        try {
            await disableBranchService(serviceId, branchId);
            await load(currentPage);
        } finally {
            setActionLoading(false);
        }
    }, [branchId, currentPage, load]);

    // Services not yet added to this branch
    const availableServices = allServices.filter(
        (s) => !branchServices.some((bs) => bs.serviceId === s.id)
    );

    return {
        branchServices,
        availableServices,
        allServicesCount: allServices.length,
        loading,
        actionLoading,
        error,
        currentPage,
        totalPages,
        totalItems,
        refresh,
        addService,
        updatePrice,
        disableService,
        setCurrentPage,
    };
}