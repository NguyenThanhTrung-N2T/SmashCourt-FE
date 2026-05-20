import { ConditionType } from "@/src/features/benefit/promotion/shared/types/promotion.types";

export type ConditionInputType =
  | "number"
  | "select"
  | "time"
  | "branch-select"
  | "court-select"
  | "multi-number"
  | "text";

export interface ConditionConfig {
  label: string;
  inputType: ConditionInputType;
  options?: string[] | number[];
  placeholder?: string;
  unit?: string;
  description?: string;
}

export const CONDITION_CONFIG: Record<ConditionType, ConditionConfig> = {
  [ConditionType.MIN_BOOKING_AMOUNT]: {
    label: "Giá trị đơn hàng tối thiểu",
    inputType: "number",
    unit: "VNĐ",
    placeholder: "VD: 300000",
    description: "Đơn hàng phải đạt giá trị tối thiểu này",
  },
  [ConditionType.MAX_PREVIOUS_BOOKINGS]: {
    label: "Số booking trước đó tối đa",
    inputType: "number",
    placeholder: "VD: 5",
    description: "Khách hàng chỉ được có tối đa số booking này trước đó",
  },
  [ConditionType.BRANCH_ID]: {
    label: "Chi nhánh áp dụng",
    inputType: "branch-select",
    description: "Chỉ áp dụng cho chi nhánh được chọn",
  },
  [ConditionType.COURT_ID]: {
    label: "Sân áp dụng",
    inputType: "court-select",
    description: "Chỉ áp dụng cho sân được chọn",
  },
  [ConditionType.SPORT]: {
    label: "Môn thể thao",
    inputType: "select",
    options: ["BADMINTON", "PICKLEBALL", "TENNIS"],
    description: "Chỉ áp dụng cho môn thể thao này",
  },
  [ConditionType.DAY_OF_WEEK]: {
    label: "Ngày trong tuần",
    inputType: "select",
    options: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
    description: "Chỉ áp dụng vào ngày được chọn",
  },
  [ConditionType.START_HOUR]: {
    label: "Giờ bắt đầu",
    inputType: "time",
    placeholder: "VD: 08:00",
    description: "Booking phải bắt đầu từ giờ này trở đi",
  },
  [ConditionType.END_HOUR]: {
    label: "Giờ kết thúc",
    inputType: "time",
    placeholder: "VD: 22:00",
    description: "Booking phải kết thúc trước giờ này",
  },
  [ConditionType.MONTH]: {
    label: "Tháng áp dụng",
    inputType: "select",
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description: "Chỉ áp dụng trong tháng được chọn",
  },
  [ConditionType.DAYS_OF_MONTH]: {
    label: "Ngày trong tháng",
    inputType: "multi-number",
    placeholder: "VD: 1,15,30",
    description: "Chỉ áp dụng vào các ngày này trong tháng (phân cách bằng dấu phẩy)",
  },
  [ConditionType.SPECIFIC_DATES]: {
    label: "Ngày cụ thể",
    inputType: "text",
    placeholder: "VD: 30/04,01/05",
    description: "Chỉ áp dụng vào các ngày cụ thể (định dạng DD/MM, phân cách bằng dấu phẩy)",
  },
};

// Helper to get display label for condition values
export function getConditionValueDisplay(type: ConditionType, value: string): string {
  const config = CONDITION_CONFIG[type];

  switch (type) {
    case ConditionType.MIN_BOOKING_AMOUNT:
      return `${Number(value).toLocaleString("vi-VN")} VNĐ`;
    case ConditionType.MAX_PREVIOUS_BOOKINGS:
      return `Tối đa ${value} booking`;
    case ConditionType.DAY_OF_WEEK:
      return getDayOfWeekLabel(value);
    case ConditionType.START_HOUR:
      return `Từ ${value}:00`;
    case ConditionType.END_HOUR:
      return `Trước ${value}:00`;
    case ConditionType.MONTH:
      return `Tháng ${value}`;
    case ConditionType.DAYS_OF_MONTH:
    case ConditionType.SPECIFIC_DATES:
      return `Ngày ${value}`;
    case ConditionType.SPORT:
      return getSportLabel(value);
    default:
      return value;
  }
}

function getDayOfWeekLabel(day: string): string {
  const labels: Record<string, string> = {
    MONDAY: "Thứ 2",
    TUESDAY: "Thứ 3",
    WEDNESDAY: "Thứ 4",
    THURSDAY: "Thứ 5",
    FRIDAY: "Thứ 6",
    SATURDAY: "Thứ 7",
    SUNDAY: "Chủ nhật",
  };
  return labels[day] || day;
}

function getSportLabel(sport: string): string {
  const labels: Record<string, string> = {
    BADMINTON: "Cầu lông",
    PICKLEBALL: "Pickleball",
    TENNIS: "Quần vợt",
  };
  return labels[sport] || sport;
}
