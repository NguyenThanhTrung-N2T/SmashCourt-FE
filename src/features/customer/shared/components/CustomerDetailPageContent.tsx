"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { Button, Toast } from "@/src/shared/components/ui";
import { CustomerDetailLoading, CustomerErrorState } from "@/src/features/customer/shared/states";
import { CustomerDetailView } from "@/src/features/customer/shared/components";

interface Props {
    customer: any;
    loading: boolean;
    error: string | null;
    toast: any;

    isOwner: boolean;

    onRetry: () => void;

    onLockCustomer?: () => void;
    onUnlockCustomer?: () => void;
}

export function CustomerDetailPageContent({
    customer,
    loading,
    error,
    toast,
    isOwner,
    onRetry,
    onLockCustomer,
    onUnlockCustomer,
}: Props) {
    const router = useRouter();

    if (loading) {
        return <CustomerDetailLoading />;
    }

    if (error || !customer) {
        return (
            <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                </div>

                <CustomerErrorState
                    message={error || "Không tìm thấy khách hàng"}
                    onRetry={onRetry}
                />

                <Toast toast={toast} />
            </div>
        );
    }

    return (
        <>
            <CustomerDetailView
                customer={customer}
                isOwner={isOwner}
                onBack={() => router.back()}
                onLockCustomer={onLockCustomer}
                onUnlockCustomer={onUnlockCustomer}
            />

            <Toast toast={toast} />
        </>
    );
}