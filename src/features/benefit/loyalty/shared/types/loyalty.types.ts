// Loyalty tier names
export type TierName = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

// Transaction types
export type TransactionType = "EARN" | "DEDUCT";

// My Loyalty Info DTO
export interface MyLoyaltyDto {
  tierName: TierName;
  totalPoints: number;
  discountRate: number;
  nextTierName: TierName | null;
  pointsToNextTier: number | null;
  progressPercent: number | null;
  isMaxTier: boolean;
}

// Loyalty Transaction DTO
export interface LoyaltyTransactionDto {
  id: string;
  bookingId: string | null;
  bookingCode: string;
  points: number;
  totalPointsAfter: number;
  type: TransactionType;
  note: string | null;
  createdAt: string;
}

// Query parameters for transactions
export interface LoyaltyTransactionQuery {
  page?: number;
  pageSize?: number;
}
