/**
 * Loyalty Hooks
 * 
 * Hooks for loyalty data fetching.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchMyLoyalty, fetchMyLoyaltyTransactions } from "@/src/api/loyalty.api";
import type {
  MyLoyaltyDto,
  LoyaltyTransactionDto,
  LoyaltyTransactionQuery,
} from "@/src/shared/types/loyalty.types";
import type { PaginatedData } from "@/src/shared/types/api.types";

/**
 * Hook to fetch current user's loyalty tier information
 */
export function useMyLoyalty() {
  const [loyalty, setLoyalty] = useState<MyLoyaltyDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLoyalty = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchMyLoyalty();
      setLoyalty(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thông tin điểm thưởng");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLoyalty();
  }, [loadLoyalty]);

  const refetch = useCallback(() => {
    loadLoyalty();
  }, [loadLoyalty]);

  return {
    data: loyalty,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch paginated loyalty transaction history
 */
export function useMyLoyaltyTransactions(initialQuery: LoyaltyTransactionQuery = {}) {
  const [transactions, setTransactions] = useState<PaginatedData<LoyaltyTransactionDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<LoyaltyTransactionQuery>(initialQuery);

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchMyLoyaltyTransactions(query);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải lịch sử giao dịch");
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const refetch = useCallback(() => {
    loadTransactions();
  }, [loadTransactions]);

  const updateQuery = useCallback((newQuery: Partial<LoyaltyTransactionQuery>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  }, []);

  return {
    data: transactions,
    isLoading,
    error,
    refetch,
    updateQuery,
    query,
  };
}
