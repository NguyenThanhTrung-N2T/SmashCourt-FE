/**
 * Authentication hooks barrel export
 * 
 * Centralized export for all authentication hooks.
 * Import from this file for better organization.
 * 
 * @example
 * ```typescript
 * import {
 *   useAuthRedirect,
 *   useAuthError,
 *   useOtpVerification,
 * } from "@/src/modules/auth/hooks";
 * ```
 */

// Redirect management
export {
  useAuthRedirect,
  useAuthImmediateRedirect,
  useAuthConditionalRedirect,
  type UseAuthRedirectOptions,
  type UseAuthRedirectReturn,
  type UseAuthImmediateRedirectReturn,
  type UseAuthConditionalRedirectOptions,
} from "./useAuthRedirect";

// Error handling
export {
  useAuthError,
  useAuthErrors,
  useAuthErrorLogger,
  type UseAuthErrorOptions,
  type UseAuthErrorReturn,
  type UseAuthErrorsOptions,
  type UseAuthErrorsReturn,
} from "./useAuthError";

// OTP verification
export {
  useOtpVerification,
  useOtpVerificationWithSession,
  type UseOtpVerificationOptions,
  type UseOtpVerificationReturn,
  type UseOtpVerificationWithSessionOptions,
} from "./useOtpVerification";
