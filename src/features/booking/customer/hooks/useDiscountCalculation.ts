/**
 * Custom hook for calculating discounts (loyalty + promotion)
 */

import { useMemo } from "react";
import { calculateDiscountAmount } from "@/src/api/promotion.api";
import type { MyLoyaltyDto } from "@/src/shared/types/loyalty.types";
import type { ApplicablePromotion } from "@/src/shared/types/promotion.types";

interface UseDiscountCalculationParams {
  courtFee: number;
  loyaltyInfo: MyLoyaltyDto | null;
  selectedPromotion: ApplicablePromotion | null;
}

interface DiscountCalculationResult {
  loyaltyDiscount: number;
  promotionDiscount: number;
  totalDiscount: number;
  finalAmount: number;
}

export function useDiscountCalculation({
  courtFee,
  loyaltyInfo,
  selectedPromotion,
}: UseDiscountCalculationParams): DiscountCalculationResult {
  return useMemo(() => {
    // Calculate loyalty discount (automatic if logged in)
    const loyaltyDiscount = loyaltyInfo
      ? Math.round((courtFee * loyaltyInfo.discountRate) / 100)
      : 0;

    // Calculate promotion discount (manual selection)
    const amountAfterLoyalty = Math.max(0, courtFee - loyaltyDiscount);

    const promotionDiscount = selectedPromotion
      ? selectedPromotion.discountAmount ?? calculateDiscountAmount(selectedPromotion, amountAfterLoyalty)
      : 0;

    // Total discount
    const totalDiscount = loyaltyDiscount + promotionDiscount;

    // Final amount after discounts
    const finalAmount = selectedPromotion
      ? selectedPromotion.finalAmount
      : Math.max(0, courtFee - totalDiscount);

    return {
      loyaltyDiscount,
      promotionDiscount,
      totalDiscount,
      finalAmount,
    };
  }, [courtFee, loyaltyInfo, selectedPromotion]);
}
