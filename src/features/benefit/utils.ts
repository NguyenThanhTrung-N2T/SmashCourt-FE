import { PromotionStatus } from "@/src/features/benefit/promotion/shared/types/promotion.types";

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
                label: "Không hoạt động",
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

function padDatePart(value: number): string {
    return String(value).padStart(2, "0");
}

function parseDateString(dateStr: string): Date | null {
    if (!dateStr?.trim()) {
        return null;
    }

    const raw = dateStr.trim();
    const [mainPart] = raw.split("T");
    const trimmed = mainPart.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return new Date(`${trimmed}T00:00:00Z`);
    }

    const spaceMatch = trimmed.match(/^(\d{1,2}) (\d{1,2}) (\d{4})(?: .*?)?$/);
    if (spaceMatch) {
        const [, day, month, year] = spaceMatch;
        return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00Z`);
    }

    const slashMatch = trimmed.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})(?: .*?)?$/);
    if (slashMatch) {
        const [, day, month, year] = slashMatch;
        return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00Z`);
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed;
    }

    return null;
}

function formatDateFromDate(date: Date) {
    return `${padDatePart(date.getUTCDate())}/${padDatePart(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`;
}

function inputDateFromDate(date: Date) {
    return `${date.getUTCFullYear()}-${padDatePart(date.getUTCMonth() + 1)}-${padDatePart(date.getUTCDate())}`;
}

export function formatDate(dateStr: string) {
    const date = parseDateString(dateStr);
    if (!date) {
        return dateStr;
    }
    return formatDateFromDate(date);
}

export function toInputDate(dateStr: string) {
    const date = parseDateString(dateStr);
    if (!date) {
        return dateStr;
    }
    return inputDateFromDate(date);
}

export function toIsoDateString(dateStr: string) {
    const date = parseDateString(dateStr);
    if (!date) {
        return `${dateStr}T00:00:00Z`;
    }
    return `${date.getUTCFullYear()}-${padDatePart(date.getUTCMonth() + 1)}-${padDatePart(date.getUTCDate())}T00:00:00Z`;
}

export function getTodayStr() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
