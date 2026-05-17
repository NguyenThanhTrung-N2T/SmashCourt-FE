/**
 * Custom hook for calculating booking price
 */

import { useState, useEffect } from "react";
import { calculatePrice } from "@/src/api/pricing.api";
import type { BranchDto } from "@/src/features/branch/types/branch.types";
import type { CourtDto } from "@/src/features/court/types/court.types";
import type { TimeGridSlotDto } from "@/src/features/timeslot/types";

interface UsePriceCalculationParams {
  selectedBranch: BranchDto | null;
  selectedCourt: CourtDto | null;
  selectedDate: string;
  selectedSlots: TimeGridSlotDto[];
}

export function usePriceCalculation({
  selectedBranch,
  selectedCourt,
  selectedDate,
  selectedSlots,
}: UsePriceCalculationParams) {
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchPrice() {
      if (!selectedBranch || !selectedCourt || !selectedDate || selectedSlots.length === 0) {
        if (isMounted) setTotalAmount(0);
        return;
      }
      
      try {
        if (isMounted) setIsCalculatingPrice(true);
        
        const sortedSlots = [...selectedSlots].sort((a, b) => 
          a.startTime.localeCompare(b.startTime)
        );
        
        const startTime = sortedSlots[0].startTime;
        let endTime = sortedSlots[sortedSlots.length - 1].endTime;
        
        // Handle midnight slot for C# TimeSpan
        if (endTime === "00:00:00") {
          endTime = "24:00:00";
        }

        const result = await calculatePrice(selectedBranch.id, {
          courtId: selectedCourt.id,
          bookingDate: new Date(selectedDate).toISOString(),
          startTime,
          endTime,
        });
        
        if (result && isMounted) {
          setTotalAmount(result.courtFee);
        }
      } catch (err) {
        console.error("Failed to calculate price:", err);
      } finally {
        if (isMounted) setIsCalculatingPrice(false);
      }
    }
    
    const timeoutId = setTimeout(fetchPrice, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [selectedBranch, selectedCourt, selectedDate, selectedSlots]);

  return {
    totalAmount,
    isCalculatingPrice,
  };
}
