/**
 * Core API utilities
 * 
 * Barrel export for all core API modules.
 */

// Error handling
export {
  AuthApiError,
  hasAuthErrorCode,
  getAuthFieldError,
  buildExpiredSessionError,
} from "./apiError";

// HTTP client
export {
  toUrl,
  authFetch,
  authProtectedFetch,
} from "./apiClient";

// Response parsing
export {
  parseJsonSafe,
  parseTextSafe,
  isHtmlLike,
  isObjectLike,
  isApiEnvelope,
  parsePayload,
  toTrimmedString,
  extractValidationErrors,
  extractErrorCode,
  extractErrorMessage,
  resolveAuthErrorMessage,
  normalizeSuccessPayload,
  requireData,
  withResponseMeta,
} from "./apiParser";
