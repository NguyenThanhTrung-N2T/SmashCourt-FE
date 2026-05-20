export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  discountRate: number;
}

export interface UpdateLoyaltyTierRequest {
  minPoints: number;
  discountRate: number;
}
