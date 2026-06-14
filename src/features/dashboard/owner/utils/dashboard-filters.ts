import { format, subDays, startOfMonth } from "date-fns";

export type FilterOption = "Hôm nay" | "7 ngày qua" | "30 ngày qua" | "Tháng này" | "Tất cả";

export function getFilterDates(option: FilterOption) {
    const today = new Date();
    const toDate = format(today, "yyyy-MM-dd");

    switch (option) {
        case "Hôm nay":
            return { fromDate: toDate, toDate };
        case "7 ngày qua":
            return { fromDate: format(subDays(today, 7), "yyyy-MM-dd"), toDate };
        case "30 ngày qua":
            return { fromDate: format(subDays(today, 30), "yyyy-MM-dd"), toDate };
        case "Tháng này":
            return { fromDate: format(startOfMonth(today), "yyyy-MM-dd"), toDate };
        case "Tất cả":
            return { fromDate: undefined, toDate: undefined };
        default:
            return { fromDate: format(startOfMonth(today), "yyyy-MM-dd"), toDate };
    }
}

export function getRevenueGroupBy(option: FilterOption): 'hour' | 'day' | 'week' | 'month' {
    switch (option) {
        case "Hôm nay":
            return "hour";
        case "7 ngày qua":
        case "30 ngày qua":
            return "day";
        case "Tháng này":
            return "day";
        case "Tất cả":
            return "month";
        default:
            return "day";
    }
}

export function getGroupByLabel(option: FilterOption): string {
    switch (option) {
        case "Hôm nay":
            return "Theo giờ";

        case "7 ngày qua":
        case "30 ngày qua":
            return "Theo ngày";

        case "Tháng này":
            return "Theo ngày";

        case "Tất cả":
            return "Theo tháng";

        default:
            return "Theo ngày";
    }
}
