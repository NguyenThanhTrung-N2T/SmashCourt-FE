/**
 * Loyalty Feature
 * 
 * Export all loyalty-related modules.
 */

// Components
export * from "./components";

// Hooks
export * from "./hooks/useLoyalty";

// Utils
export * from "./utils";

// Types (re-export from shared)
export type {
  TierName,
  TransactionType,
  MyLoyaltyDto,
  LoyaltyTransactionDto,
  LoyaltyTransactionQuery,
} from "@/src/shared/types/loyalty.types";
