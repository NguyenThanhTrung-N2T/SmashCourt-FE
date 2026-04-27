/**
 * TypeScript type definitions for authentication error handling
 * 
 * This module provides comprehensive type definitions for all backend authentication
 * error codes and authentication operation contexts used throughout the auth system.
 */

/**
 * All possible backend authentication error codes
 * 
 * These error codes are returned by the backend API and should be handled
 * with user-friendly messages in the frontend.
 * 
 * @example
 * ```typescript
 * const errorCode: AuthErrorCode = "INVALID_CREDENTIALS";
 * ```
 */
export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_VERIFIED"
  | "ACCOUNT_LOCKED"
  | "INVALID_OTP"
  | "OTP_EXPIRED"
  | "OTP_MAX_ATTEMPTS"
  | "OTP_LIMIT_EXCEEDED"
  | "TOKEN_EXPIRED"
  | "TOKEN_INVALID"
  | "INVALID_TOKEN"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "BAD_REQUEST"
  | "INTERNAL_ERROR";

/**
 * Authentication operation contexts
 * 
 * These contexts represent different authentication flows and are used
 * to provide context-specific error messages to users.
 * 
 * @example
 * ```typescript
 * const context: AuthContext = "login";
 * const message = getAuthErrorMessage(error, context);
 * ```
 */
export type AuthContext =
  | "login"
  | "register"
  | "verify-email"
  | "2fa"
  | "forgot-password"
  | "verify-otp"
  | "reset-password"
  | "oauth"
  | "refresh"
  | "logout"
  | "generic";

/**
 * Error message configuration for a specific error code
 * 
 * Each error code has a default message and optional context-specific messages
 * that provide more relevant guidance based on the operation being performed.
 * 
 * @example
 * ```typescript
 * const config: ErrorMessageConfig = {
 *   default: "Email hoặc mật khẩu không đúng.",
 *   contexts: {
 *     login: "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra và thử lại."
 *   }
 * };
 * ```
 */
export interface ErrorMessageConfig {
  /** Default message used when no context-specific message exists */
  default: string;
  /** Context-specific messages for different authentication operations */
  contexts?: Partial<Record<AuthContext, string>>;
}

/**
 * Complete error message mapping for all error codes
 * 
 * Maps each AuthErrorCode to its ErrorMessageConfig containing default
 * and context-specific messages.
 * 
 * @example
 * ```typescript
 * const messageMap: ErrorMessageMap = {
 *   INVALID_CREDENTIALS: {
 *     default: "Email hoặc mật khẩu không đúng.",
 *     contexts: { login: "..." }
 *   },
 *   // ... other error codes
 * };
 * ```
 */
export type ErrorMessageMap = Record<AuthErrorCode, ErrorMessageConfig>;
