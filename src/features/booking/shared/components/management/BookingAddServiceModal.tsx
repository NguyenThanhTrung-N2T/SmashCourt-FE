import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, MagnifyingGlass, Plus, Minus } from '@phosphor-icons/react';
import { getBranchServices } from '@/src/api/service.api';
import { addServiceToBooking, removeServiceFromBooking } from '@/src/api/booking.api';
import type { BranchService } from '@/src/features/service/shared/types/service.types';
import type { BookingDto } from '@/src/features/booking/shared/types/booking.types';
import { formatCurrency } from '../../utils/bookingStatus';

interface BookingAddServiceModalProps {
    isOpen: boolean;
    booking: BookingDto;
    onClose: () => void;
    onUpdated: (updated: BookingDto) => void;
    onError: (message: string) => void;
}

export function BookingAddServiceModal({
    isOpen,
    booking,
    onClose,
    onUpdated,
    onError,
}: BookingAddServiceModalProps) {
    const [mounted, setMounted] = useState(false);
    const [branchServices, setBranchServices] = useState<BranchService[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [search, setSearch] = useState('');
    const [pendingId, setPendingId] = useState<string | null>(null);

    useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

    useEffect(() => {
        if (!isOpen) return;
        setLoadingServices(true);
        getBranchServices(booking.branchId, 1, 50)
            .then((data) => setBranchServices(data.items))
            .catch(() => onError('Không tải được danh sách dịch vụ'))
            .finally(() => setLoadingServices(false));
    }, [isOpen, booking.branchId]);

    const getExistingQty = (serviceId: string) =>
        booking.services?.find((s) => s.serviceId === serviceId)?.quantity ?? 0;

    const handleAdd = useCallback(async (serviceId: string) => {
        setPendingId(serviceId);
        try {
            const updated = await addServiceToBooking(booking.id || '', {
                serviceId,
                quantity: 1,
            });
            onUpdated(updated);
        } catch {
            onError('Không thể thêm dịch vụ');
        } finally {
            setPendingId(null);
        }
    }, [booking, onUpdated, onError]);

    const handleRemove = useCallback(async (serviceId: string) => {
        setPendingId(serviceId);
        try {
            const updated = await removeServiceFromBooking(
                booking.id || '',
                serviceId
            );
            onUpdated(updated);
        } catch {
            onError('Không thể bỏ dịch vụ');
        } finally {
            setPendingId(null);
        }
    }, [booking, onUpdated, onError]);

    const filtered = branchServices.filter((s) =>
        s.serviceName.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen || !mounted) return null;

    return createPortal(
        <>
            {/* Backdrop — higher z than drawer (z-55), clicks close modal only */}
            <div
                className="fixed inset-0 bg-slate-900/50 z-60 animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-65 w-full max-w-md bg-surface-2 rounded-2xl shadow-2xl animate-scale-in flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h3 className="text-base font-bold text-foreground">Thêm dịch vụ</h3>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-3 hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-5 py-3 border-b border-border">
                    <div className="relative">
                        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Tìm dịch vụ..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-surface-1 border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar">
                    {loadingServices ? (
                        <div className="flex justify-center py-8 text-muted text-sm">Đang tải...</div>
                    ) : filtered.length === 0 ? (
                        <div className="flex justify-center py-8 text-muted text-sm">Không tìm thấy dịch vụ</div>
                    ) : (
                        filtered.map((service) => {
                            const qty = getExistingQty(service.serviceId);
                            const isPending = pendingId === service.serviceId;

                            return (
                                <div
                                    key={service.serviceId}
                                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-foreground">{service.serviceName}</p>
                                        <p className="text-xs text-muted">
                                            {formatCurrency(service.effectivePrice)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {qty > 0 && (
                                            <button
                                                onClick={() => handleRemove(service.serviceId)}
                                                disabled={isPending}
                                                className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted hover:text-red-600 hover:border-red-300 disabled:opacity-40 transition-colors"
                                            >
                                                <Minus className="h-3.5 w-3.5" weight="bold" />
                                            </button>
                                        )}

                                        {qty > 0 && (
                                            <span className="text-sm font-bold text-primary w-5 text-center">
                                                {qty}
                                            </span>
                                        )}

                                        <button
                                            onClick={() => handleAdd(service.serviceId)}
                                            disabled={isPending}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted hover:text-primary hover:border-primary disabled:opacity-40 transition-colors"
                                        >
                                            <Plus className="h-3.5 w-3.5" weight="bold" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                        Xong
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
}