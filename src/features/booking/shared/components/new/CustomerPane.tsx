import { useCallback } from "react";
import { ArrowCounterClockwise, MagnifyingGlass } from "@phosphor-icons/react";
import { Input, Textarea } from "@/src/shared/components/ui";
import { getInitials } from "@/src/features/booking/shared/utils/getInitials";
import { useDebounceSearch } from "@/src/shared/hooks/useDebounceSearch";
import { searchCustomers } from "@/src/api/customer.api";
import type { CustomerSearchDto } from "@/src/features/customer/shared/types/customer.types";
import type { CustomerPaneProps } from "@/src/features/booking/shared/types/walkinBooking.types";

const TIER_CONFIG: Record<
    string,
    { bg: string; text: string; border: string; pill: string }
> = {
    Bronze: {
        bg: "bg-amber-500/10",
        text: "text-amber-600",
        border: "border-amber-500/20",
        pill: "bg-amber-500/10",
    },
    Silver: {
        bg: "bg-slate-400/10",
        text: "text-slate-400",
        border: "border-slate-400/20",
        pill: "bg-slate-400/10",
    },
    Gold: {
        bg: "bg-yellow-500/10",
        text: "text-yellow-600",
        border: "border-yellow-500/20",
        pill: "bg-yellow-500/10",
    },
    Platinum: {
        bg: "bg-cyan-500/10",
        text: "text-cyan-500",
        border: "border-cyan-500/20",
        pill: "bg-cyan-500/10",
    },
    Diamond: {
        bg: "bg-purple-500/10",
        text: "text-purple-500",
        border: "border-purple-500/20",
        pill: "bg-purple-500/10",
    },
};

function TierBadge({
    tierName,
    discountRate,
}: {
    tierName: string;
    discountRate: number;
}) {
    const tier = TIER_CONFIG[tierName] || TIER_CONFIG.Bronze;

    return (
        <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tier.border} ${tier.pill} ${tier.text}`}
        >
            <span>{tierName}</span>
            <span className="opacity-80">•</span>
            <span>-{discountRate}%</span>
        </div>
    );
}

export function CustomerPane({
    form,
    errors,
    updateForm,
    selectedCustomer,
    setSelectedCustomer,
}: CustomerPaneProps) {
    const searchFn = useCallback(
        (term: string) => searchCustomers({ searchTerm: term, limit: 10 }),
        [],
    );

    const {
        searchTerm,
        setSearchTerm,
        results,
        loading,
        clearResults,
    } = useDebounceSearch<CustomerSearchDto>(searchFn);

    const showDropdown =
        searchTerm.trim().length >= 2 && (loading || results.length > 0 || !loading);

    function handleSelect(c: CustomerSearchDto) {
        setSelectedCustomer(c);
        setSearchTerm("");
        clearResults();
        updateForm({
            customerId: c.id,
            guestName: c.fullName || "",
            guestPhone: c.phone || "",
            guestEmail: c.email || "",
        });
    }

    function handleClear() {
        setSelectedCustomer(null);
        updateForm({ customerId: null, guestName: "", guestPhone: "", guestEmail: "" });
    }

    return (
        <div role="tabpanel" className="space-y-4">
            {/* ---- Search state ---- */}
            {!selectedCustomer && (
                <div className="space-y-1">
                    <div className="relative">
                        <Input
                            label="Tìm khách hàng"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm theo tên hoặc số điện thoại…"
                            leftIcon={<MagnifyingGlass className="h-4 w-4" />}
                        />

                        {showDropdown && (
                            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-surface-1 shadow-lg">
                                {loading && (
                                    <p className="px-4 py-3 text-sm text-muted">
                                        Đang tìm khách hàng…
                                    </p>
                                )}

                                {!loading && results.length === 0 && searchTerm.trim().length >= 2 && (
                                    <p className="px-4 py-6 text-center text-sm text-muted">
                                        Không tìm thấy khách hàng
                                    </p>
                                )}

                                {!loading &&
                                    results.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => handleSelect(c)}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                                {getInitials(c.fullName || "?")}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-foreground">
                                                    {c.fullName}
                                                </p>
                                                <p className="text-xs text-muted">
                                                    {c.phone || "Không có số điện thoại"}
                                                </p>
                                            </div>

                                            <div className="shrink-0">
                                                <TierBadge
                                                    tierName={c.tierName}
                                                    discountRate={c.discountRate}
                                                />
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-muted">
                        Nhập ít nhất 2 ký tự để tìm kiếm
                    </p>
                </div>
            )}

            {/* ---- Selected customer card ---- */}
            {selectedCustomer && (
                <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3">
                        <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                {getInitials(selectedCustomer.fullName || "?")}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {selectedCustomer.fullName}
                                </p>
                                <p className="text-xs text-muted">
                                    {selectedCustomer.phone || "Không có số điện thoại"}
                                </p>

                                <div className="mt-2">
                                    <TierBadge
                                        tierName={selectedCustomer.tierName}
                                        discountRate={selectedCustomer.discountRate}
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface-1 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                            >
                                <ArrowCounterClockwise className="h-3.5 w-3.5" />
                                Thay đổi
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs text-muted">Thông tin bổ sung</span>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Email"
                            type="email"
                            value={form.guestEmail}
                            onChange={(e) => updateForm({ guestEmail: e.target.value })}
                            placeholder="Tự điền từ tài khoản"
                        />
                        <div className="md:col-span-1">
                            <Input
                                label="Số điện thoại"
                                value={form.guestPhone}
                                onChange={(e) => updateForm({ guestPhone: e.target.value })}
                                placeholder="Tự điền từ tài khoản"
                            />
                        </div>
                    </div>

                    <Textarea
                        label="Ghi chú"
                        value={form.note}
                        onChange={(e) => updateForm({ note: e.target.value })}
                        placeholder="Yêu cầu đặc biệt hoặc ghi chú cho nhân viên."
                        rows={1}
                    />
                </div>
            )}

            {errors.customerId && (
                <p className="text-xs font-medium text-red-500">{errors.customerId}</p>
            )}
        </div>
    );
}