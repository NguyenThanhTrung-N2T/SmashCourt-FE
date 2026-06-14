/**
 * useCancelPolicies Hook
 * 
 * Hook for fetching cancellation policies.
 */

"use client";

import { useState, useEffect } from "react";
import { fetchCancelPolicies } from "@/src/api/cancel-policy.api";
import type { CancelPolicy } from "@/src/features/policy/shared/types/cancel-policy.types";

interface UseCancelPoliciesResult {
  policies: CancelPolicy[];
  isLoading: boolean;
  error: string | null;
}

export function useCancelPolicies(): UseCancelPoliciesResult {
  const [policies, setPolicies] = useState<CancelPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCancelPolicies();
        setPolicies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải chính sách hủy");
        // Set default policies as fallback
        setPolicies([
          { id: "default-1", hoursBefore: 24, refundPercent: 100, description: null, createdAt: "", updatedAt: "" },
          { id: "default-2", hoursBefore: 12, refundPercent: 50, description: null, createdAt: "", updatedAt: "" },
          { id: "default-3", hoursBefore: 6, refundPercent: 25, description: null, createdAt: "", updatedAt: "" },
          { id: "default-4", hoursBefore: 0, refundPercent: 0, description: null, createdAt: "", updatedAt: "" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPolicies();
  }, []);

  return {
    policies,
    isLoading,
    error,
  };
}
