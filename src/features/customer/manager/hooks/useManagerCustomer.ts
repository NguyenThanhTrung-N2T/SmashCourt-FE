"use client";

import { useCustomerBase } from "@/src/features/customer/shared/hooks/useCustomerBase";

export function useManagerCustomer() {
    return useCustomerBase("manager");
}