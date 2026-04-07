export enum PromotionStatus {
  ACTIVE = 0,
  INACTIVE = 1,
  DELETED = 2,
}

export interface Promotion {
  id: string;
  name: string;
  discountRate: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  createdAt: string;
}

export interface SavePromotionRequest {
  name: string;
  discountRate: number;
  startDate: string;
  endDate: string;
}
