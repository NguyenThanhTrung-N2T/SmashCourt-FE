/**
 * Custom hook for fetching loyalty info and available promotions
 */

import { useState, useEffect } from "react";
import { fetchMyLoyalty } from "@/src/api/loyalty.api";
import { fetchApplicablePromotions } from "@/src/api/promotion.api";
import type { BranchDto } from "@/src/features/branch/types/branch.types";
import type { CourtDto } from "@/src/features/court/types/court.types";
import type { TimeGridSlotDto } from "@/src/features/timeslot/types";
import type { MyLoyaltyDto } from "@/src/shared/types/loyalty.types";
import type { ApplicablePromotion } from "@/src/shared/types/promotion.types";

interface UseLoyaltyAndPromotionsParams {
  isLoggedIn: boolean;
  selectedBranch: BranchDto | null;
  selectedCourt: CourtDto | null;
  selectedDate: string;
  selectedSlots: TimeGridSlotDto[];
  totalAmount: number;
}

interface UseLoyaltyAndPromotionsResult {
  loyaltyInfo: MyLoyaltyDto | null;
  availablePromotions: ApplicablePromotion[];
  isLoadingLoyalty: boolean;
  isLoadingPromotions: boolean;
  loyaltyError: string | null;
  promotionsError: string | null;
}

export function useLoyaltyAndPromotions({
  isLoggedIn,
  selectedBranch,
  selectedCourt,
  selectedDate,
  selectedSlots,
  totalAmount,
}: UseLoyaltyAndPromotionsParams): UseLoyaltyAndPromotionsResult {
  const [loyaltyInfo, setLoyaltyInfo] = useState<MyLoyaltyDto | null>(null);
  const [availablePromotions, setAvailablePromotions] = useState<ApplicablePromotion[]>([]);
  const [isLoadingLoyalty, setIsLoadingLoyalty] = useState(false);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);
  const [loyaltyError, setLoyaltyError] = useState<string | null>(null);
  const [promotionsError, setPromotionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoyaltyInfo(null);
      setLoyaltyError(null);
      return;
    }

    let isMounted = true;

    async function fetchLoyalty() {
      try {
        setIsLoadingLoyalty(true);
        setLoyaltyError(null);
        const data = await fetchMyLoyalty();
        if (isMounted) {
          setLoyaltyInfo(data);
        }
      } catch (err) {
        console.error("Failed to fetch loyalty info:", err);
        if (isMounted) {
          setLoyaltyError("Không thể tải thông tin hạng thành viên");
        }
      } finally {
        if (isMounted) {
          setIsLoadingLoyalty(false);
        }
      }
    }

    fetchLoyalty();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    let isMounted = true;

    async function fetchPromotions() {
      if (
        !isLoggedIn ||
        !selectedBranch ||
        !selectedCourt ||
        !selectedDate ||
        selectedSlots.length === 0 ||
        totalAmount <= 0
      ) {
        setAvailablePromotions([]);
        setPromotionsError(null);
        setIsLoadingPromotions(false);
        return;
      }

      try {
        setIsLoadingPromotions(true);
        setPromotionsError(null);

        const sortedSlots = [...selectedSlots].sort((a, b) =>
          a.startTime.localeCompare(b.startTime),
        );
        const startTime = sortedSlots[0].startTime;
        const endTime =
          sortedSlots[sortedSlots.length - 1].endTime === "00:00:00"
            ? "24:00:00"
            : sortedSlots[sortedSlots.length - 1].endTime;
        const loyaltyDiscount = loyaltyInfo
          ? Math.round((totalAmount * loyaltyInfo.discountRate) / 100)
          : 0;
        const bookingAmount = Math.max(0, totalAmount - loyaltyDiscount);

        if (bookingAmount <= 0) {
          if (isMounted) {
            setAvailablePromotions([]);
          }
          return;
        }

        const data = await fetchApplicablePromotions({
          branchId: selectedBranch.id,
          courtId: selectedCourt.id,
          bookingDate: `${selectedDate}T${startTime}`,
          startTime,
          endTime,
          bookingAmount,
        });

        if (isMounted) {
          setAvailablePromotions(data);
        }
      } catch (err) {
        console.error("Failed to fetch promotions:", err);
        if (isMounted) {
          setPromotionsError("Không thể tải danh sách khuyến mãi");
        }
      } finally {
        if (isMounted) {
          setIsLoadingPromotions(false);
        }
      }
    }

    fetchPromotions();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, selectedBranch, selectedCourt, selectedDate, selectedSlots, totalAmount, loyaltyInfo]);

  return {
    loyaltyInfo,
    availablePromotions,
    isLoadingLoyalty,
    isLoadingPromotions,
    loyaltyError,
    promotionsError,
  };
}
