/**
 * Enhanced authentication error handling utilities
 * 
 * This module provides comprehensive error handling for authentication operations,
 * including context-aware Vietnamese error messages, enhanced logging, and utility functions.
 * 
 * FE hien thi loi nghiep vu an toan tu BE (4xx), con loi he thong (5xx) chi hien thi message chung.
 */

import { AuthApiError } from "@/src/api/auth.api";
import type { AuthErrorCode, AuthContext } from "./errorCodes";
import { AUTH_ERROR_MESSAGES, AUTH_GENERIC_MESSAGES } from "./errorMessages";

/**
 * Generic error messages (backward compatible)
 * 
 * @deprecated Use getAuthErrorMessage for context-aware error messages
 */
export const AUTH_GENERIC = AUTH_GENERIC_MESSAGES;

/**
 * Get context-aware error message for an authentication error
 * 
 * This function resolves authentication errors to user-friendly Vietnamese messages
 * based on the error code and the authentication operation context. It provides:
 * - Context-specific messages when available
 * - Fallback to default messages for each error code
 * - Graceful handling of errors without error codes
 * - Appropriate messages for 5xx vs 4xx errors
 * 
 * @param error - The error object (typically AuthApiError)
 * @param context - The authentication operation context (default: "generic")
 * @returns User-friendly Vietnamese error message
 * 
 * @example
 * ```typescript
 * // In a login component
 * try {
 *   await authLogin({ email, password });
 * } catch (err) {
 *   const message = getAuthErrorMessage(err, "login");
 *   setError(message);
 *   logAuthClientError("login", err);
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // In an email verification component
 * try {
 *   await authVerifyEmail({ email, otpCode });
 * } catch (err) {
 *   const message = getAuthErrorMessage(err, "verify-email");
 *   toast.error(message);
 * }
 * ```
 */
export function getAuthErrorMessage(
  error: unknown,
  context: AuthContext = "generic"
): string {
  // Handle AuthApiError with error code
  if (error instanceof AuthApiError && error.code) {
    const errorCode = error.code as AuthErrorCode;
    const messageConfig = AUTH_ERROR_MESSAGES[errorCode];
    
    if (messageConfig) {
      // Return context-specific message if available, otherwise default
      return messageConfig.contexts?.[context] ?? messageConfig.default;
    }
  }

  // Handle AuthApiError without error code (use message from backend)
  if (error instanceof AuthApiError) {
    // For 5xx errors, use generic server error message
    if (error.status >= 500) {
      return AUTH_GENERIC.serverError;
    }
    
    // For 4xx errors, use backend message or generic client error
    return error.message || AUTH_GENERIC.clientError;
  }

  // Handle generic errors
  if (error instanceof Error) {
    return error.message;
  }

  // Ultimate fallback
  return AUTH_GENERIC.clientError;
}

/**
 * Enhanced logging function with error code and context
 * 
 * Logs authentication errors in development mode with detailed information
 * including error scope, status code, error code, and message. In production
 * mode, logging is silent to avoid exposing sensitive information.
 * 
 * @param scope - The authentication operation scope (e.g., "login", "register", "verify-email")
 * @param err - The error object to log
 * 
 * @example
 * ```typescript
 * try {
 *   await authLogin({ email, password });
 * } catch (err) {
 *   logAuthClientError("login", err);
 *   const message = getAuthErrorMessage(err, "login");
 *   setError(message);
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Development mode output:
 * // [auth:login] 401 [INVALID_CREDENTIALS] — Email hoặc mật khẩu không đúng
 * // [auth:login] Full error: { status: 401, code: "INVALID_CREDENTIALS", ... }
 * ```
 */
export function logAuthClientError(scope: string, err: unknown): void {
  if (process.env.NODE_ENV === "development") {
    if (err instanceof AuthApiError) {
      const codeInfo = err.code ? ` [${err.code}]` : "";
      console.warn(
        `[auth:${scope}] ${err.status}${codeInfo} — ${err.message}`.trimEnd()
      );
      
      // Log full error object for detailed debugging
      console.debug(`[auth:${scope}] Full error:`, err);
    } else {
      console.error(`[auth:${scope}]`, err);
    }
  }
}

/**
 * Format email for display (backward compatible)
 * 
 * Displays email in a shortened format to protect privacy while still
 * being recognizable to the user.
 * 
 * @param email - The email address to format
 * @returns Formatted email string (e.g., "ng•••@domain.com")
 * 
 * @example
 * ```typescript
 * formatEmailShort("nguyen@example.com"); // Returns: "ng•••@example.com"
 * formatEmailShort("a@test.com");         // Returns: "a•••@test.com"
 * ```
 */
export function formatEmailShort(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return trimmed;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const head = local.slice(0, 2);
  return `${head}•••@${domain}`;
}
