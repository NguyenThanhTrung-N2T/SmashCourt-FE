"use client";

import { useEffect, useState } from "react";
import {
    Phone, Envelope, Calendar, Clock, MapPin, Tag,
    Receipt, ShoppingCart, PencilLine, SignIn, SignOut,
    XCircle, CheckCircle, CreditCard, ArrowCounterClockwise,
    WarningCircle, ArrowRight
} from "@phosphor-icons/react";
import { Modal, Button, Badge } from "@/src/shared/components/ui";
import {
    fetchBookingDetailsById,
    checkInBooking,
    checkoutBooking,
    cancelBookingByStaff,
} from "@/src/api/booking.api";
import type { BookingDto, BookingCourtDto } from "@/src/features/booking/shared/types/booking.types";
import {
    canCheckIn,
    canCheckout,
    canCancel,
    canConfirmRefund,
    canCompletePayment,
    canAddService,
} from "@/src/features/booking/shared/utils/bookingRules";
import {
    getBookingStatusLabel,
    getBookingStatusVariant,
    getPaymentStatusLabel,
    getPaymentStatusVariant,
    formatCurrency,
    formatTime,
    getCourtTotal,
} from "@/src/features/booking/shared/utils/bookingStatus";
import { formatDate, formatDateTime } from "@/src/shared/utils/date";

interface BookingDetailModalProps {
    isOpen: boolean;
    bookingId: string | null;
    onClose: () => void;
}
import { useRouter } from "next/navigation";
import { getAuthUser } from "@/src/features/auth/session/sessionStore";

export function BookingDetailModal({
    isOpen,
    bookingId,
    onClose,
}: BookingDetailModalProps) {
    const [booking, setBooking] = useState<BookingDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !bookingId) return;
        setBooking(null);
        setError(null);

        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchBookingDetailsById(bookingId);
                setBooking(data);
            } catch (err) {
                console.error("Failed to fetch booking", err);
                setError("Không thể tải thông tin đặt sân. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isOpen, bookingId]);

    // Derived values — safe to compute even when booking is null
    const displayName = booking?.customerName || booking?.guestName || "Khách vãng lai";
    const displayPhone = booking?.customerPhone || booking?.guestPhone;
    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    const router = useRouter();

    const handleViewDetail = () => {
        if (!bookingId) return;
        const user = getAuthUser();
        const basePath = user?.role === "BRANCH_MANAGER" ? "/manager" : "/staff";
        router.push(`${basePath}/bookings?bookingId=${bookingId}`);
        onClose();
    };

    return (
        <>
            {/* Modal handles: Portal, backdrop, close button, gradient header, body scroll */}
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                subtitle="Chi tiết đặt sân"
                title={booking?.bookingCode ?? "—"}
                maxWidth="lg"
            >
                {/* ── Loading skeleton ── */}
                {loading && <LoadingSkeleton />}

                {/* ── Load error (full-body) ── */}
                {!loading && error && !booking && (
                    <div className="p-10 flex flex-col items-center gap-3 text-center">
                        <WarningCircle size={40} className="text-error/60" weight="duotone" />
                        <p className="text-sm text-muted font-medium">{error}</p>
                        <Button variant="secondary" onClick={() => setError(null)}>
                            Thử lại
                        </Button>
                    </div>
                )}

                {/* ── Main content ── */}
                {!loading && booking && (
                    // min-h-full so the sticky footer pins to the visible bottom even when
                    // content is short. The parent Modal body is overflow-y-auto.
                    <div className="flex flex-col min-h-full">

                        {/* Status + timestamp strip */}
                        <div className="flex items-center gap-2 flex-wrap px-5 pt-4 pb-3 border-b border-border">
                            <Badge variant={getBookingStatusVariant(booking.status)}>
                                {getBookingStatusLabel(booking.status)}
                            </Badge>
                            {booking.paymentStatus !== undefined && (
                                <Badge variant={getPaymentStatusVariant(booking.paymentStatus)}>
                                    {getPaymentStatusLabel(booking.paymentStatus)}
                                </Badge>
                            )}
                            {booking.createdAt && (
                                <span className="ml-auto text-xs text-muted shrink-0">
                                    Đặt lúc {formatDateTime(booking.createdAt)}
                                </span>
                            )}
                        </div>

                        {/* Scrollable sections */}
                        <div className="flex-1 p-5 space-y-4">

                            {/* Action error banner */}
                            {error && (
                                <div className="flex items-center gap-2 rounded-xl bg-error/10 border border-error/20 px-3 py-2.5 text-sm text-error font-medium">
                                    <WarningCircle size={15} weight="bold" />
                                    {error}
                                </div>
                            )}

                            {/* ── Customer ── */}
                            <div className="flex items-center gap-3 bg-surface-2/60 border border-border rounded-2xl px-4 py-3">
                                <div className="h-11 w-11 shrink-0 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center text-sm font-black">
                                    {initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-black text-foreground truncate">{displayName}</p>
                                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                        {displayPhone && (
                                            <span className="flex items-center gap-1 text-xs text-muted font-medium">
                                                <Phone size={11} weight="bold" /> {displayPhone}
                                            </span>
                                        )}
                                        {booking.guestEmail && (
                                            <span className="flex items-center gap-1 text-xs text-muted font-medium truncate">
                                                <Envelope size={11} /> {booking.guestEmail}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── Booking meta ── */}
                            <div className="bg-surface-2/60 border border-border rounded-2xl px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-3">
                                <MetaItem icon={<MapPin size={12} className="text-primary" />} label="Chi nhánh" value={booking.branchName} />
                                <MetaItem icon={<Calendar size={12} className="text-primary" />} label="Ngày chơi" value={formatDate(booking.bookingDate)} />
                                <MetaItem
                                    icon={<Clock size={12} className="text-primary" />}
                                    label="Thời gian"
                                    value={booking.courts[0]
                                        ? `${formatTime(booking.courts[0].startTime)} – ${formatTime(booking.courts[0].endTime)}`
                                        : "—"}
                                />
                                <MetaItem
                                    icon={<Tag size={12} className="text-primary" />}
                                    label="Nguồn đặt"
                                    value={
                                        booking.source === "ONLINE" ? "Đặt online" :
                                            booking.source === "WALK_IN" ? "Tại quầy" :
                                                booking.source
                                    }
                                />
                            </div>

                            {/* ── Courts ── */}
                            <Section title="Sân thuê">
                                <div className="space-y-2">
                                    {booking.courts.map((court: BookingCourtDto, idx: number) => (
                                        <div key={idx} className="rounded-xl border border-border overflow-hidden">
                                            {/* Court name + total */}
                                            <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-2/80">
                                                <span className="text-sm font-black text-foreground">{court.courtName}</span>
                                                <span className="text-sm font-black text-primary">{formatCurrency(getCourtTotal(court))}</span>
                                            </div>
                                            {/* Price items */}
                                            {court.priceItems && court.priceItems.length > 0 && (
                                                <div className="divide-y divide-border/50 bg-surface-1">
                                                    {court.priceItems.map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between px-3.5 py-2 text-xs">
                                                            <span className="text-muted">
                                                                {formatTime(item.startTime)} – {formatTime(item.endTime)}
                                                                <span className="ml-1.5 opacity-60">×{item.hours}h</span>
                                                            </span>
                                                            <span className="font-semibold text-foreground">{formatCurrency(item.subTotal)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Section>

                            {/* ── Financial summary ── */}
                            <Section title="Tổng tiền" icon={<Receipt size={12} className="text-primary" />}>
                                <div className="rounded-2xl border border-border bg-surface-2/60 px-4 py-3 space-y-2 text-sm">
                                    <LineItem label="Tiền thuê sân" value={formatCurrency(booking.courtFee ?? 0)} />
                                    {(booking.serviceFee ?? 0) > 0 && (
                                        <LineItem label="Tiền dịch vụ" value={formatCurrency(booking.serviceFee!)} />
                                    )}
                                    {(booking.loyaltyDiscountAmount ?? 0) > 0 && (
                                        <LineItem label="Giảm giá thành viên" value={`−${formatCurrency(booking.loyaltyDiscountAmount!)}`} accent />
                                    )}
                                    {(booking.promotionDiscountAmount ?? 0) > 0 && (
                                        <LineItem label="Mã khuyến mãi" value={`−${formatCurrency(booking.promotionDiscountAmount!)}`} accent />
                                    )}
                                    <div className="border-t border-border pt-2 flex items-center justify-between">
                                        <span className="font-black text-foreground">Tổng cộng</span>
                                        <span className="text-base font-black text-primary">{formatCurrency(booking.finalTotal ?? 0)}</span>
                                    </div>
                                    {/* Refund */}
                                    {booking.refundAmount != null &&
                                        (booking.status === "CANCELLED_REFUNDED" || booking.status === "CANCELLED_PENDING_REFUND") && (
                                            <>
                                                <div className="border-t border-border pt-2 flex items-center justify-between">
                                                    <span className="font-bold text-foreground flex items-center gap-1.5">
                                                        <ArrowCounterClockwise size={13} /> Hoàn tiền
                                                    </span>
                                                    <span className={`font-black ${booking.status === "CANCELLED_REFUNDED" ? "text-success" : "text-warning"}`}>
                                                        {formatCurrency(booking.refundAmount)}
                                                    </span>
                                                </div>
                                                <div className={`text-xs rounded-lg px-3 py-2 ${booking.status === "CANCELLED_REFUNDED"
                                                    ? "bg-success/10 text-success"
                                                    : "bg-warning/10 text-warning"
                                                    }`}>
                                                    {booking.status === "CANCELLED_REFUNDED"
                                                        ? "✓ Đã hoàn tiền thành công"
                                                        : "⏳ Đang chờ xác nhận hoàn tiền"}
                                                </div>
                                            </>
                                        )}
                                </div>
                            </Section>

                            {/* ── Note ── */}
                            {booking.note && (
                                <Section title="Ghi chú">
                                    <p className="text-sm text-foreground leading-relaxed bg-surface-2/60 border border-border rounded-xl px-4 py-3">
                                        {booking.note}
                                    </p>
                                </Section>
                            )}
                        </div>

                        {/* ── Sticky footer actions ──
                sticky bottom-0 pins to the bottom of Modal's overflow-y-auto body */}
                        <div className="sticky bottom-0 shrink-0 border-t border-border bg-surface-1 px-5 py-3">
                            <Button
                                className="w-full font-bold"
                                variant="primary"
                                leftIcon={<ArrowRight size={15} weight="bold" />}
                                onClick={handleViewDetail}
                            >
                                Xem chi tiết đơn
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}

/* ─────────────────────────────────────────── */
/*  Atomic helpers                             */
/* ─────────────────────────────────────────── */

function Section({
    title, icon, children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted flex items-center gap-1.5 px-0.5">
                {icon}{title}
            </h4>
            {children}
        </div>
    );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1 mb-0.5">
                {icon} {label}
            </p>
            <p className="text-sm font-bold text-foreground">{value}</p>
        </div>
    );
}

function LineItem({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className={accent ? "text-primary" : "text-muted"}>{label}</span>
            <span className={`font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</span>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="p-5 space-y-4 animate-pulse">
            <div className="flex gap-2 pb-3 border-b border-border">
                <div className="h-5 w-24 rounded-full bg-surface-2" />
                <div className="h-5 w-20 rounded-full bg-surface-2" />
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
                <div className="h-11 w-11 rounded-xl bg-surface-2 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-32 rounded bg-surface-2" />
                    <div className="h-2.5 w-24 rounded bg-surface-2" />
                </div>
            </div>
            <div className="h-20 rounded-2xl bg-surface-2" />
            <div className="h-16 rounded-xl bg-surface-2" />
        </div>
    );
}