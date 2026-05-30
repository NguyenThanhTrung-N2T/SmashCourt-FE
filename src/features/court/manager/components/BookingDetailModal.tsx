"use client";

import { useEffect, useState } from "react";
import { User, Phone, Calendar, Clock, CurrencyCircleDollar, Warning, Check, X, PencilLine, Trash } from "@phosphor-icons/react";
import { Modal, Button, Badge, Toast } from "@/src/shared/components/ui";
import { fetchBookingById, checkInBooking, checkoutBooking, cancelBookingByStaff } from "@/src/api/booking.api";
import { BookingStatus, type BookingDto } from "@/src/features/booking/shared/types/booking.types";

function formatCurrency(n: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

interface BookingDetailModalProps {
    isOpen: boolean;
    bookingId: string | null;
    onClose: () => void;
    onRefresh: () => void;
}

const STATUS_STYLE: Record<number, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
    [BookingStatus.PENDING]: { label: "Chờ xác nhận", variant: "warning" },
    [BookingStatus.CONFIRMED]: { label: "Đã xác nhận", variant: "info" },
    [BookingStatus.PAID_ONLINE]: { label: "Đã thanh toán (Online)", variant: "success" },
    [BookingStatus.IN_PROGRESS]: { label: "Đang chơi", variant: "warning" },
    [BookingStatus.COMPLETED]: { label: "Hoàn thành", variant: "success" },
    [BookingStatus.CANCELLED]: { label: "Đã huỷ", variant: "error" },
};

export function BookingDetailModal({ isOpen, bookingId, onClose, onRefresh }: BookingDetailModalProps) {
    const [booking, setBooking] = useState<BookingDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !bookingId) return;

        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchBookingById(bookingId);
                setBooking(data);
            } catch (err) {
                console.error("Failed to fetch booking", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isOpen, bookingId]);

    const handleAction = async (action: () => Promise<void>) => {
        setActionLoading(true);
        try {
            await action();
            onRefresh();
            onClose();
        } catch (err) {
            console.error("Action failed", err);
        } finally {
            setActionLoading(false);
        }
    };

    if (!isOpen) return null;

    const initials = booking?.customerName ? booking.customerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "??";
    const status = typeof booking?.status === 'number' ? booking.status : BookingStatus.PENDING;
    const style = STATUS_STYLE[status] || { label: "Không xác định", variant: "neutral" };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chi tiết đặt sân"
            maxWidth="md"
        >
            {loading ? (
                <div className="p-8 space-y-4 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-surface-2 rounded-full" />
                        <div className="space-y-2">
                            <div className="h-4 bg-surface-2 rounded w-48" />
                            <div className="h-3 bg-surface-2 rounded w-32" />
                        </div>
                    </div>
                    <div className="h-32 bg-surface-2 rounded-xl" />
                </div>
            ) : booking ? (
                <div className="p-6 space-y-6">
                    {/* Header: Player Info */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl text-xl font-black border border-primary/20">
                            {initials}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-foreground">{booking.customerName || "Khách vãng lai"}</h3>
                                <Badge variant={style.variant} dot>{style.label}</Badge>
                            </div>
                            <p className="flex items-center gap-1.5 text-sm text-muted font-medium mt-0.5">
                                <Phone size={14} weight="bold" />
                                {booking.customerPhone || booking.guestPhone || "N/A"}
                            </p>
                        </div>
                    </div>

                    {/* Court & Time Info */}
                    <div className="bg-surface-2/50 border border-border rounded-2xl p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase text-muted tracking-widest">Sân</span>
                                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                                    <Calendar size={16} className="text-primary" />
                                    {booking.courts.map(c => c.courtName).join(", ")}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase text-muted tracking-widest">Thời gian</span>
                                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                                    <Clock size={16} className="text-primary" />
                                    {booking.courts[0]?.startTime.substring(0, 5)} - {booking.courts[0]?.endTime.substring(0, 5)}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase text-muted tracking-widest">Thành tiền</span>
                                <div className="flex items-center gap-2 text-sm font-black text-primary">
                                    <CurrencyCircleDollar size={18} weight="fill" />
                                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(booking.finalTotal || 0)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase text-muted tracking-widest">Thanh toán</span>
                                <div className="flex items-center gap-2 text-sm font-bold">
                                    {booking.paymentStatus === 'PAID' ? (
                                        <span className="text-success flex items-center gap-1">
                                            <Check size={14} weight="bold" /> Đã trả
                                        </span>
                                    ) : (
                                        <span className="text-warning flex items-center gap-1">
                                            <Warning size={14} weight="bold" /> Chờ TT
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-col gap-2 pt-2">
                        <div className="flex items-center gap-2">
                            {/* PENDING -> Confirm / CONFIRMED -> Check in / PLAYING -> Complete */}
                            {status === BookingStatus.PENDING && (
                                <Button
                                    className="flex-1"
                                    variant="primary"
                                    isLoading={actionLoading}
                                    onClick={() => handleAction(async () => { /* placeholder confirm */ })}
                                >
                                    Xác nhận
                                </Button>
                            )}
                            {status === BookingStatus.CONFIRMED && (
                                <Button
                                    className="flex-1 font-black"
                                    variant="primary"
                                    leftIcon={<Check size={18} weight="bold" />}
                                    isLoading={actionLoading}
                                    onClick={() => handleAction(() => checkInBooking(booking.id!))}
                                >
                                    Check-in
                                </Button>
                            )}
                            {status === BookingStatus.IN_PROGRESS && (
                                <Button
                                    className="flex-1 font-black"
                                    variant="success"
                                    leftIcon={<Check size={18} weight="bold" />}
                                    isLoading={actionLoading}
                                    onClick={() => handleAction(() => checkoutBooking(booking.id!))}
                                >
                                    Hoàn thành
                                </Button>
                            )}

                            <Button
                                variant="secondary"
                                className="px-4"
                                leftIcon={<PencilLine size={18} />}
                                onClick={() => { }}
                            >
                                Sửa
                            </Button>
                        </div>

                        {(status !== BookingStatus.CANCELLED && status !== BookingStatus.COMPLETED) && (
                            <Button
                                variant="ghost"
                                className="w-full text-error hover:bg-error/5 font-bold"
                                leftIcon={<X size={18} weight="bold" />}
                                isLoading={actionLoading}
                                onClick={() => handleAction(() => cancelBookingByStaff(booking.id!))}
                            >
                                Huỷ đặt sân
                            </Button>
                        )}
                    </div>
                </div>
            ) : null}
        </Modal>
    );
}
