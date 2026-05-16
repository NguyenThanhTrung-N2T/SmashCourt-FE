import { authProtectedFetch } from "./auth.api";
import type { PaginatedData } from "../shared/types/api.types";
import type {
  CustomerListDto,
  CustomerDetailDto,
  CustomerBookingDto,
  LoyaltyTransactionDto,
  CustomerStatisticsDto,
  LockCustomerDto,
  CustomerListQuery,
  CustomerBookingQuery,
  LoyaltyTransactionQuery,
} from "../features/customer/types/customer.types";

// ============================================================================
// 1. Customer List Endpoint
// ============================================================================

export async function fetchCustomers(
  query: CustomerListQuery = {}
): Promise<PaginatedData<CustomerListDto>> {
  const params = new URLSearchParams({
    page: (query.page || 1).toString(),
    pageSize: (query.pageSize || 20).toString(),
  });

  if (query.searchTerm) params.append('searchTerm', query.searchTerm);
  if (query.loyaltyTier) params.append('loyaltyTier', query.loyaltyTier);
  if (query.loyaltyTierId) params.append('loyaltyTierId', query.loyaltyTierId);
  if (query.status) params.append('status', query.status);
  if (query.branchId) params.append('branchId', query.branchId);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const response = await authProtectedFetch<PaginatedData<CustomerListDto>>(
    `/api/customers?${params}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch customers");
  return response.data;
}

// ============================================================================
// 2. Customer Detail Endpoint
// ============================================================================

export async function fetchCustomerById(id: string): Promise<CustomerDetailDto> {
  const response = await authProtectedFetch<CustomerDetailDto>(
    `/api/customers/${id}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch customer details");
  return response.data;
}

// ============================================================================
// 3. Customer Bookings Endpoint
// ============================================================================

export async function fetchCustomerBookings(
  customerId: string,
  query: CustomerBookingQuery = {}
): Promise<PaginatedData<CustomerBookingDto>> {
  const params = new URLSearchParams({
    page: (query.page || 1).toString(),
    pageSize: (query.pageSize || 20).toString(),
  });

  if (query.branchId) params.append('branchId', query.branchId);
  if (query.status) params.append('status', query.status);
  if (query.fromDate) params.append('fromDate', query.fromDate);
  if (query.toDate) params.append('toDate', query.toDate);

  const response = await authProtectedFetch<PaginatedData<CustomerBookingDto>>(
    `/api/customers/${customerId}/bookings?${params}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch customer bookings");
  return response.data;
}

// ============================================================================
// 4. Loyalty Transactions Endpoint (OWNER only)
// ============================================================================

export async function fetchLoyaltyTransactions(
  customerId: string,
  query: LoyaltyTransactionQuery = {}
): Promise<PaginatedData<LoyaltyTransactionDto>> {
  const params = new URLSearchParams({
    page: (query.page || 1).toString(),
    pageSize: (query.pageSize || 20).toString(),
  });

  if (query.fromDate) params.append('fromDate', query.fromDate);
  if (query.toDate) params.append('toDate', query.toDate);

  const response = await authProtectedFetch<PaginatedData<LoyaltyTransactionDto>>(
    `/api/customers/${customerId}/loyalty-transactions?${params}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch loyalty transactions");
  return response.data;
}

// ============================================================================
// 5. Customer Statistics Endpoint
// ============================================================================

export async function fetchCustomerStatistics(
  customerId: string
): Promise<CustomerStatisticsDto> {
  const response = await authProtectedFetch<CustomerStatisticsDto>(
    `/api/customers/${customerId}/statistics`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch customer statistics");
  return response.data;
}

// ============================================================================
// 6. Lock Customer Endpoint (OWNER only)
// ============================================================================

export async function lockCustomer(
  customerId: string,
  dto: LockCustomerDto
): Promise<void> {
  await authProtectedFetch<null>(
    `/api/customers/${customerId}/lock`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: dto,
    }
  );
}

// ============================================================================
// 7. Unlock Customer Endpoint (OWNER only)
// ============================================================================

export async function unlockCustomer(customerId: string): Promise<void> {
  await authProtectedFetch<null>(
    `/api/customers/${customerId}/unlock`,
    { method: "POST" }
  );
}
