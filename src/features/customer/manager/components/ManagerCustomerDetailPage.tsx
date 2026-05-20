"use client";

import { CustomerDetailPageContent } from "../../shared/components/CustomerDetailPageContent";
import { useManagerCustomerDetail } from "../hooks/useManagerCustomerDetail";

export function ManagerCustomerDetailPage() {
    const {
        customer,
        loading,
        error,
        toast,
        loadCustomerDetail,
    } = useManagerCustomerDetail();

    return (
        <CustomerDetailPageContent
            customer={customer}
            loading={loading}
            error={error}
            toast={toast}
            isOwner={false}
            onRetry={loadCustomerDetail}
        />
    );
}