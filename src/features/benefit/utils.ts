import { PromotionStatus } from "@/src/shared/types/promotion.types";

export type StatusCfg = {
    label: string;
    bg: string;
    text: string;
    dot: string;
    variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
};

export function getStatusCfg(status: PromotionStatus): StatusCfg {
    switch (status) {
        case PromotionStatus.ACTIVE:
            return {
                label: "Đang hoạt động",
                bg: "bg-emerald-100",
                text: "text-emerald-800",
                dot: "bg-emerald-500",
                variant: "success",
            };
        case PromotionStatus.INACTIVE:
            return {
                label: "Chưa hiệu lực",
                bg: "bg-amber-100",
                text: "text-amber-800",
                dot: "bg-amber-500",
                variant: "warning",
            };
        case PromotionStatus.DELETED:
            return {
                label: "Đã xóa",
                bg: "bg-red-100",
                text: "text-red-800",
                dot: "bg-red-500",
                variant: "error",
            };
    }
}

export function formatDate(dateStr: string) {
    try {
        // Handle ISO datetime format (e.g.,"2026-04-01T00:00:00")
        const dateOnly = dateStr.split("T")[0];
        const parts = dateOnly.split("-");
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    } catch {
        return dateStr;
    }
}

export function toInputDate(dateStr: string) {
    // Handle ISO datetime format and extract date part
    try {
        const dateOnly = dateStr.split("T")[0];
        return dateOnly;
    } catch {
        return dateStr;
    }
}

export function getTodayStr() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
