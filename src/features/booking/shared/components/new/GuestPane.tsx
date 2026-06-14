import { CheckCircle, User, Phone } from "@phosphor-icons/react";
import { Input, Textarea } from "@/src/shared/components/ui";
import { getInitials } from "@/src/features/booking/shared/utils/getInitials";
import type { GuestPaneProps } from "@/src/features/booking/shared/types/walkinBooking.types";
import {
    createValidatedChangeHandler,
    ValidationRules,
} from "@/src/shared/utils/inputValidation";

export function GuestPane({ form, errors, updateForm }: GuestPaneProps) {
    const showPreview = form.guestName.trim().length > 0;

    return (
        <div role="tabpanel" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                {/* Name — required */}
                <Input
                    label="Họ và tên *"
                    value={form.guestName}
                    onChange={(e) => updateForm({ guestName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    error={errors.guestName}
                    leftIcon={<User className="h-4 w-4" />}
                />

                {/* Phone — optional */}
                <Input
                    label="Số điện thoại"
                    value={form.guestPhone}
                    onChange={createValidatedChangeHandler(
                        (val) => updateForm({ guestPhone: val }),
                        ValidationRules.phoneFormat
                    )}
                    placeholder="Ví dụ: 0901234567"
                    error={errors.guestPhone}
                    leftIcon={<Phone className="h-4 w-4" />}
                />

                {/* Email — optional, full width */}
                <div className="md:col-span-2">
                    <Input
                        label="Email"
                        type="email"
                        value={form.guestEmail}
                        onChange={createValidatedChangeHandler(
                            (val) => updateForm({ guestEmail: val }),
                            ValidationRules.emailFormat
                        )}
                        placeholder="khach@email.com"
                        error={errors.guestEmail}
                    />
                </div>
            </div>

            {/* Live preview card — appears once name is typed */}
            {showPreview && (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
                    {/* Avatar initials */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(form.guestName)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                            {form.guestName}
                        </p>
                        <p className="text-xs text-muted">
                            {form.guestPhone || "Chưa có số điện thoại"}
                        </p>
                    </div>
                    <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                </div>
            )}

            {/* Note */}
            <Textarea
                label="Ghi chú"
                value={form.note}
                onChange={(e) => updateForm({ note: e.target.value })}
                placeholder="Yêu cầu đặc biệt hoặc ghi chú cho nhân viên"
            />
        </div>
    );
}