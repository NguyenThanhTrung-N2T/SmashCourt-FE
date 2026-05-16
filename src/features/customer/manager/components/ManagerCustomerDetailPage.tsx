"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react';
import { Button } from '@/src/shared/components/ui/Button';
import { Toast } from '@/src/shared/components/ui/Toast';
import { useToast } from '@/src/shared/hooks/useToast';
import { CustomerDetailLoading, CustomerErrorState, CustomerDetailView } from '../../shared/components';
import { fetchCustomerById } from '@/src/api/customer.api';
import { handleApiError } from '../../shared/utils/error-handling';
import type { CustomerDetailDto } from '../../types/customer.types';

export function ManagerCustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast, show: showToast } = useToast();
    const customerId = params.id as string;

    const [customer, setCustomer] = useState<CustomerDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCustomerDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCustomerById(customerId);
            setCustomer(data);
        } catch (err) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            showToast('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (customerId) {
            loadCustomerDetail();
        }
    }, [customerId]);

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
                <CustomerErrorState message={error || 'Không tìm thấy khách hàng'} onRetry={loadCustomerDetail} />
                <Toast toast={toast} />
            </div>
        );
    }

    return (
        <>
            <CustomerDetailView
                customer={customer}
                isOwner={false}
                onBack={() => router.back()}
            />
            <Toast toast={toast} />
        </>
    );
}
