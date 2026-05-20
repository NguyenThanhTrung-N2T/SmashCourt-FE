/**
 * Loyalty API
 * 
 * API endpoints for loyalty tier and transaction operations.
 */

import { authProtectedFetch } from "./core";
import type { PaginatedData } from "../shared/types/api.types";
import type {
  MyLoyaltyDto,
  LoyaltyTransactionDto,
  LoyaltyTransactionQuery,
} from "../features/benefit/loyalty/shared/types/loyalty.types";

/**
 * Get current user's loyalty tier information and progress
 */
export async function fetchMyLoyalty(): Promise<MyLoyaltyDto> {
  const response = await authProtectedFetch<MyLoyaltyDto>(
    "/api/loyalty/me",
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch loyalty info");
  return response.data;
}

/**
 * Get paginated history of loyalty point transactions
 */
export async function fetchMyLoyaltyTransactions(
  query: LoyaltyTransactionQuery = {}
): Promise<PaginatedData<LoyaltyTransactionDto>> {
  const params = new URLSearchParams({
    page: (query.page || 1).toString(),
    pageSize: (query.pageSize || 10).toString(),
  });

  const response = await authProtectedFetch<PaginatedData<LoyaltyTransactionDto>>(
    `/api/loyalty/me/transactions?${params}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch loyalty transactions");
  return response.data;
}
