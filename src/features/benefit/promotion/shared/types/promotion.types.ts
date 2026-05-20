export enum PromotionStatus {
  ACTIVE = 0,
  INACTIVE = 1,
  DELETED = 2,
}

export enum DiscountType {
  PERCENT = 0,
  FIXED = 1,
}

export type PromotionDiscountType = DiscountType | "PERCENT" | "FIXED";

export enum ConditionType {
  MIN_BOOKING_AMOUNT = "MIN_BOOKING_AMOUNT",
  MAX_PREVIOUS_BOOKINGS = "MAX_PREVIOUS_BOOKINGS",
  BRANCH_ID = "BRANCH_ID",
  COURT_ID = "COURT_ID",
  SPORT = "SPORT",
  DAY_OF_WEEK = "DAY_OF_WEEK",
  START_HOUR = "START_HOUR",
  END_HOUR = "END_HOUR",
  MONTH = "MONTH",
  DAYS_OF_MONTH = "DAYS_OF_MONTH",
  SPECIFIC_DATES = "SPECIFIC_DATES"
}

export interface PromotionCondition {
  conditionType: ConditionType;
  conditionValue: string;
}

export interface Promotion {
  id: string;
  name: string;
  code?: string;
  promoDisplayUrl?: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usagePerUserLimit?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  conditions?: PromotionCondition[];
  createdAt: string;
}

export interface SavePromotionRequest {
  name: string;
  code?: string;
  promoDisplayUrl?: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usagePerUserLimit?: number;
  startDate: string;
  endDate: string;
  conditions?: PromotionCondition[];
}

export interface ApplicablePromotionRequest {
  branchId: string;
  courtId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingAmount: number;
}

export interface ApplicablePromotion {
  id: string;
  name: string;
  code: string | null;
  promoDisplayUrl: string | null;
  description: string | null;
  discountType: PromotionDiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  discountAmount: number;
  finalAmount: number;
  usageLimit: number | null;
  usedCount: number;
  remainingUsage: number | null;
  usagePerUserLimit: number | null;
  userUsageCount: number;
  remainingUserUsage: number | null;
}
