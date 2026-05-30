"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, User, Phone } from '@phosphor-icons/react';
import { Button, ConfirmationDialog } from '@/src/shared/components/ui';
import { fetchAllBookings } from '@/src/api/booking.api';
import { BookingStatus } from '../../types/booking.types';
import type { BookingDto } from '../../types/booking.types';
import { formatCurrency } from '../../utils/bookingStatus';
import { formatDate } from '@/src/shared/utils/date';

interface RefundConfirmDrawerProps {
    isOpen: boolean;
    branchId?: string;
    onClose: () => void;
    onConfirmRefund: (bookingId: string) => Promise<void> | void;
}

export function RefundConfirmDrawer({ isOpen, branchId, onClose, onConfirmRefund }: RefundConfirmDrawerProps) {
    const [mounted, setMounted] = useState(false);
    const [items, setItems] = useState<BookingDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState<{ isOpen: boolean; bookingId?: string; bookingCode?: string }>({ isOpen: false });

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadPendingRefunds();
        }
    }, [isOpen, branchId]);

    async function loadPendingRefunds() {
        setLoading(true);
        try {
            // Fetch pending refund bookings (status = CANCELLED_PENDING_REFUND)
            const data = await fetchAllBookings({ status: (BookingStatus as any).CANCELLED_PENDING_REFUND, branchId, page: 1, pageSize: 50 });
            setItems(data.items || []);
        } catch (error) {
            console.error('Failed to load pending refunds', error);
        } finally {
            setLoading(false);
        }
    }

    const handleRequestConfirm = (bookingId?: string, bookingCode?: string) => {
        setConfirm({ isOpen: true, bookingId, bookingCode });
    };

    const handleConfirm = async (reason?: string) => {
        const bookingId = confirm.bookingId;
        setConfirm({ isOpen: false });
        if (!bookingId) return;
        try {
            await onConfirmRefund(bookingId);
            // reload list
            await loadPendingRefunds();
        } catch (error) {
            console.error('Confirm refund failed', error);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <>
            <div className="fixed inset-0 bg-slate-900/70 z-50" onClick={onClose} />

            <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-surface-2 shadow-2xl z-55 animate-slide-in-right overflow-y-auto custom-scrollbar">
                <div className="sticky top-0 bg-linear-to-r from-[#1B5E38] to-[#2A9D5C] px-6 py-5 flex items-center justify-between z-10">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-white/70">Chờ hoàn tiền</p>
                        <h2 className="text-lg font-bold text-white">{items.length} đơn cần xác nhận</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {loading && (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-16 bg-surface-1 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    )}

                    {!loading && items.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-sm text-muted">Không có đơn nào đang chờ hoàn tiền.</p>
                        </div>
                    )}

                    {!loading && items.length > 0 && (
                        <div className="space-y-3">
                            {items.map((booking) => {
                                const id = booking.id || booking.bookingId || '';
                                const total = booking.invoice?.finalTotal ?? booking.finalTotal ?? 0;
                                return (
                                    <div key={id} className="flex items-center justify-between bg-surface-1 rounded-lg p-4">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-full bg-surface-2 h-9 w-9 flex items-center justify-center text-muted">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{booking.bookingCode || id}</p>
                                                    <p className="text-xs text-muted">{booking.customerName || booking.guestName || 'Khách'} • {formatDate(booking.bookingDate)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm font-bold text-foreground">{formatCurrency(total)}</div>
                                            <Button variant="secondary" onClick={() => handleRequestConfirm(id, booking.bookingCode)}>
                                                <CheckCircle className="h-4 w-4" />
                                                Xác nhận
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationDialog
                isOpen={confirm.isOpen}
                title="Xác nhận hoàn tiền"
                message={`Bạn có chắc chắn muốn xác nhận hoàn tiền cho đơn ${confirm.bookingCode || ''}?`}
                onConfirm={handleConfirm}
                onCancel={() => setConfirm({ isOpen: false })}
            />
        </>,
        document.body,
    );
}
