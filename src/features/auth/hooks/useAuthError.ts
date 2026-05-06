/**
 * Centralized authentication error handling hook
 * 
 * Provides unified error state management with auto-dismiss functionality,
 * reducing boilerplate in auth components.
 * 
 * @example
 * ```typescript
 * const { error, showError, clearError } = useAuthError({
 *   autoDismiss: true,
 *   dismissDelay: 3500,
 * });
 * 
 * try {
 *   await authLogin({ email, password });
 * } catch (err) {
 *   showError(err, "login");
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getAuthErrorMessage, logAuthClientError } from "../utils/clientErrors";
import type { AuthContext } from "../utils/errorCodes";

export interface UseAuthErrorOptions {
  /** Automatically dismiss error after delay */
  autoDismiss?: boolean;
  /** Delay in milliseconds before auto-dismissing (default: 3500) */
  dismissDelay?: number;
  /** Callback when error is shown */
  onError?: (error: string) => void;
  /** Callback when error is cleared */
  onClear?: () => void;
}

export interface UseAuthErrorReturn {
  /** Current error message (null if no error) */
  error: string | null;
  /** Show an error with optional context */
  showError: (error: unknown, context?: AuthContext) => void;
  /** Clear the current error */
  clearError: () => void;
  /** Whether an error is currently displayed */
  hasError: boolean;
}

/**
 * Hook for managing authentication error state with auto-dismiss
 */
export function useAuthError(
  options: UseAuthErrorOptions = {}
): UseAuthErrorReturn {
  const {
    autoDismiss = false,
    dismissDelay = 3500,
    onError,
    onClear,
  } = options;

  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onClear?.();
  }, [onClear]);

  const showError = useCallback(
    (err: unknown, context: AuthContext = "generic") => {
      const message = getAuthErrorMessage(err, context);
      setError(message);
      onError?.(message);

      if (autoDismiss) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = window.setTimeout(() => {
          clearError();
        }, dismissDelay);
      }
    },
    [autoDismiss, dismissDelay, onError, clearError]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    error,
    showError,
    clearError,
    hasError: error !== null,
  };
}

/**
 * Hook for managing multiple error states (e.g., form errors vs toast errors)
 * 
 * @example
 * ```typescript
 * const { errors, showError, clearError, clearAllErrors } = useAuthErrors({
 *   types: ["form", "toast"],
 *   autoDismiss: { toast: true },
 * });
 * 
 * showError("form", err, "login");
 * showError("toast", err, "oauth");
 * ```
 */
export interface UseAuthErrorsOptions {
  /** Error types to manage */
  types: string[];
  /** Auto-dismiss configuration per type */
  autoDismiss?: Record<string, boolean>;
  /** Dismiss delay per type */
  dismissDelay?: Record<string, number>;
}

export interface UseAuthErrorsReturn {
  /** Current errors by type */
  errors: Record<string, string | null>;
  /** Show an error for a specific type */
  showError: (type: string, error: unknown, context?: AuthContext) => void;
  /** Clear error for a specific type */
  clearError: (type: string) => void;
  /** Clear all errors */
  clearAllErrors: () => void;
  /** Check if a specific type has an error */
  hasError: (type: string) => boolean;
}

export function useAuthErrors(
  options: UseAuthErrorsOptions
): UseAuthErrorsReturn {
  const { types, autoDismiss = {}, dismissDelay = {} } = options;

  const [errors, setErrors] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(types.map((type) => [type, null]))
  );

  const timersRef = useRef<Record<string, number>>({});

  const clearError = useCallback((type: string) => {
    setErrors((prev) => ({ ...prev, [type]: null }));
    if (timersRef.current[type]) {
      clearTimeout(timersRef.current[type]);
      delete timersRef.current[type];
    }
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors(Object.fromEntries(types.map((type) => [type, null])));
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
  }, [types]);

  const showError = useCallback(
    (type: string, err: unknown, context: AuthContext = "generic") => {
      const message = getAuthErrorMessage(err, context);
      setErrors((prev) => ({ ...prev, [type]: message }));

      if (autoDismiss[type]) {
        if (timersRef.current[type]) {
          clearTimeout(timersRef.current[type]);
        }
        timersRef.current[type] = window.setTimeout(() => {
          clearError(type);
        }, dismissDelay[type] ?? 3500);
      }
    },
    [autoDismiss, dismissDelay, clearError]
  );

  const hasError = useCallback(
    (type: string) => errors[type] !== null,
    [errors]
  );

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  return {
    errors,
    showError,
    clearError,
    clearAllErrors,
    hasError,
  };
}

/**
 * Hook for logging authentication errors with context
 * 
 * @example
 * ```typescript
 * const logError = useAuthErrorLogger("login");
 * 
 * try {
 *   await authLogin({ email, password });
 * } catch (err) {
 *   logError(err);
 *   showError(err);
 * }
 * ```
 */
export function useAuthErrorLogger(scope: string) {
  return useCallback(
    (err: unknown) => {
      logAuthClientError(scope, err);
    },
    [scope]
  );
}
