"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash, Pencil, Check, X, Warning, Coffee, ArrowClockwise } from '@phosphor-icons/react';
import type { BranchServiceDto, AddServiceToBranchDto, UpdateBranchServiceDto } from '@/src/features/branch/shared/types/branch.types';
import type { Service } from '@/src/features/service/shared/types/service.types';
import { fetchBranchServices, addServiceToBranch, updateBranchServicePrice, removeServiceFromBranch } from '@/src/api/branch.api';
import { fetchAllServices } from '@/src/api/service.api';
import { ConfirmationDialog } from '@/src/shared/components/ui';
import { BranchServicesLoading } from '../states';
import { EmptyState } from '@/src/shared/components/layout';
import { handleApiError } from '../../utils/error-handling';
import { useToast } from '@/src/shared/hooks/useToast';
import { formatCurrency } from '@/src/shared/utils/date';
import { SmartImage } from '@/src/shared/components/ui/SmartImage';

interface BranchServicesTabProps {
    branchId: string;
    onToast?: (tone: 'success' | 'error', message: string) => void;
}

export function BranchServicesTab({ branchId, onToast }: BranchServicesTabProps) {
    const [branchServices, setBranchServices] = useState<BranchServiceDto[]>([]);
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [serviceToRemove, setServiceToRemove] = useState<BranchServiceDto | null>(null);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState<number>(0);
    const { show: showToast } = useToast();
    const toast = onToast ?? showToast;

    const [isActionLoading, setIsActionLoading] = useState(false);

    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [services, appServices] = await Promise.all([
                fetchBranchServices(branchId),
                fetchAllServices(1, 50)
            ]);
            setBranchServices(services);
            setAllServices(appServices.items);
            setError(null);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [branchId]);

    const handleAddService = async (serviceId: string, defaultPrice: number) => {
        if (isActionLoading) return;
        setIsActionLoading(true);
        try {
            const dto: AddServiceToBranchDto = {
                serviceId,
                price: defaultPrice
            };
            await addServiceToBranch(branchId, dto);
            toast('success', 'Thêm dịch vụ thành công');
            await loadData(true);
        } catch (err: any) {
            toast('error', handleApiError(err));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleUpdatePrice = async (serviceId: string) => {
        if (editPrice < 1) {
            toast('error', 'Giá phải lớn hơn hoặc bằng 1');
            return;
        }
        if (isActionLoading) return;
        setIsActionLoading(true);
        try {
            const dto: UpdateBranchServiceDto = {
                price: editPrice
            };
            await updateBranchServicePrice(branchId, serviceId, dto);
            toast('success', 'Cập nhật giá thành công');
            setEditingServiceId(null);
            await loadData(true);
        } catch (err: any) {
            toast('error', handleApiError(err));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRemoveService = async () => {
        if (!serviceToRemove || isActionLoading) return;
        setIsActionLoading(true);
        try {
            await removeServiceFromBranch(branchId, serviceToRemove.serviceId);
            toast('success', 'Gỡ dịch vụ thành công');
            setServiceToRemove(null);
            await loadData(true);
        } catch (err: any) {
            toast('error', handleApiError(err));
        } finally {
            setIsActionLoading(false);
        }
    };

    const startEditing = (service: BranchServiceDto) => {
        setEditingServiceId(service.serviceId);
        setEditPrice(service.effectivePrice);
    };

    const cancelEditing = () => {
        setEditingServiceId(null);
    };

    const availableServices = allServices.filter(s =>
        !branchServices.some(bs => bs.serviceId === s.id)
    );

    if (loading) {
        return <BranchServicesLoading />;
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3">
                    <Warning className="h-6 w-6 text-red-500" />
                    <p className="font-bold text-red-600">{error}</p>
                </div>
            )}

            <div className="rounded-2xl border border-border bg-surface-1 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <Coffee className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-foreground">Dịch vụ chi nhánh</h3>
                            <p className="text-xs text-muted">Quản lý các dịch vụ đi kèm tại chi nhánh</p>
                        </div>
                    </div>
                </div>

                {/* Branch Services List */}
                {branchServices.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {branchServices.map((service, index) => {
                            const serviceInfo = allServices.find(s => s.id === service.serviceId);
                            return (
                                <div
                                    key={service.id || `branch-service-${index}`}
                                    className="group relative overflow-hidden rounded-2xl border border-border bg-surface-1 p-4 transition-all hover:border-primary/40 hover:shadow-md"
                                >
                                    <div className="flex gap-4">
                                        {/* Image */}
                                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-2">
                                            {serviceInfo?.serviceDisplayUrl ? (
                                                <SmartImage
                                                    src={serviceInfo.serviceDisplayUrl}
                                                    alt={service.serviceName}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                                                    <Coffee className="h-7 w-7" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h4 className="truncate text-sm font-extrabold text-foreground">
                                                        {service.serviceName}
                                                    </h4>

                                                    {service.description && (
                                                        <p className="mt-1 line-clamp-2 text-xs text-muted">
                                                            {service.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => startEditing(service)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted transition-all hover:border-primary hover:bg-primary hover:text-white"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setServiceToRemove(service)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="mt-1">
                                                {editingServiceId === service.serviceId ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={editPrice}
                                                            onChange={(e) => setEditPrice(Number(e.target.value))}
                                                            className="h-8 flex-1 rounded-xl border border-primary bg-surface-2 px-2 font-semibold outline-none"
                                                            autoFocus
                                                        />

                                                        <button
                                                            disabled={isActionLoading}
                                                            onClick={() => handleUpdatePrice(service.serviceId)}
                                                            className={`flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white transition-all hover:opacity-90 ${isActionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            {isActionLoading ? (
                                                                <ArrowClockwise className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Check className="h-4 w-4" />
                                                            )}
                                                        </button>

                                                        <button
                                                            onClick={cancelEditing}
                                                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted transition-all hover:bg-surface-3"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-end gap-2 rounded-2xl bg-primary/8 px-2 py-1">
                                                        <span className="font-black tracking-tight text-primary">
                                                            {formatCurrency(service.effectivePrice)}
                                                        </span>

                                                        <span className="pb-0.5 text-xs font-bold uppercase text-muted">
                                                            / {service.unit}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        icon={<Coffee className="h-16 w-16 text-muted" />}
                        title="Chưa có dịch vụ"
                        description="Thêm dịch vụ để phục vụ khách hàng tốt hơn"
                    />
                )}

                {/* Available Services to Add */}
                {availableServices.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-border">
                        <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            Dịch vụ có thể thêm
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {availableServices.length}
                            </span>
                        </h4>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {availableServices.map((service, index) => (
                                <button
                                    key={service.id || `available-service-${index}`}
                                    disabled={isActionLoading}
                                    onClick={() => handleAddService(service.id, service.defaultPrice)}
                                    className={`flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 transition-all text-left border border-border hover:border-primary group ${isActionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-surface-3 group-hover:bg-primary/10 transition-colors border border-border">
                                        {service.serviceDisplayUrl ? (
                                            <SmartImage
                                                src={service.serviceDisplayUrl}
                                                alt={service.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary opacity-50 group-hover:opacity-100 transition-opacity">
                                                <Coffee className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{service.name}</p>
                                        <p className="text-[11px] text-primary font-medium mt-0.5">
                                            {formatCurrency(service.defaultPrice)}
                                        </p>
                                    </div>
                                    <Plus className="h-4 w-4 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Remove Service Dialog */}
            {serviceToRemove && (
                <ConfirmationDialog
                    title="Gỡ dịch vụ"
                    message={`Bạn có chắc chắn muốn gỡ dịch vụ "${serviceToRemove.serviceName}" khỏi chi nhánh này?`}
                    confirmText="Gỡ dịch vụ"
                    cancelText="Hủy"
                    variant="danger"
                    onConfirm={handleRemoveService}
                    onCancel={() => setServiceToRemove(null)}
                />
            )}
        </div>
    );
}