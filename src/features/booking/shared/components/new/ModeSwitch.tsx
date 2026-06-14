import { User, UserCircle } from "@phosphor-icons/react";
import type { CustomerMode, ModeSwitchProps } from "@/src/features/booking/shared/types/walkinBooking.types";

export function ModeSwitch({ value, onChange }: ModeSwitchProps) {
    return (
        <div
            role="tablist"
            className="flex gap-0 rounded-xl bg-surface-2 p-1"
        >
            {(
                [
                    { key: "guest", label: "Khách vãng lai", Icon: User },
                    { key: "customer", label: "Khách có tài khoản", Icon: UserCircle },
                ] as { key: CustomerMode; label: string; Icon: React.ElementType }[]
            ).map(({ key, label, Icon }) => (
                <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={value === key}
                    onClick={() => onChange(key)}
                    className={[
                        "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                        value === key
                            ? "bg-surface-1 text-foreground shadow-sm ring-1 ring-border"
                            : "text-muted hover:text-foreground",
                    ].join(" ")}
                >
                    <Icon className="h-4 w-4" />
                    {label}
                </button>
            ))}
        </div>
    );
}