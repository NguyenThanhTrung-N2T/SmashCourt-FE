/**
 * Centralized authentication redirect management hook
 * 
 * Provides unified redirect logic with scheduled delays, cleanup,
 * and role-based routing for authentication flows.
 * 
 * @example
 * ```typescript
 * const { scheduleRedirect, cancelRedirect, isRedirecting } = useAuthRedirect({
 *   delay: 2000,
 * });
 * 
 * // After successful login
 * scheduleRedirect("/dashboard");
 * 
 * // Or with role-based routing
 * scheduleRedirectByRole(user.role);
 * ```
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRedirectPathByRole } from "../constants";
import type { UserRole } from "../constants";

export interface UseAuthRedirectOptions {
  /** Delay in milliseconds before redirect (default: 2000) */
  delay?: number;
  /** Callback before redirect starts */
  onBeforeRedirect?: (path: string) => void;
  /** Callback after redirect completes */
  onAfterRedirect?: (path: string) => void;
  /** Callback if redirect is cancelled */
  onCancel?: () => void;
}

export interface UseAuthRedirectReturn {
  /** Schedule a redirect to a specific path */
  scheduleRedirect: (path: string) => void;
  /** Schedule a redirect based on user role */
  scheduleRedirectByRole: (role: string | undefined | null) => void;
  /** Cancel a scheduled redirect */
  cancelRedirect: () => void;
  /** Whether a redirect is currently scheduled */
  isRedirecting: boolean;
  /** The path that will be redirected to */
  redirectPath: string | null;
}

/**
 * Hook for managing authentication redirects with scheduled delays
 */
export function useAuthRedirect(
  options: UseAuthRedirectOptions = {}
): UseAuthRedirectReturn {
  const {
    delay = 2000,
    onBeforeRedirect,
    onAfterRedirect,
    onCancel,
  } = options;

  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const cancelRedirect = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsRedirecting(false);
    setRedirectPath(null);
    onCancel?.();
  }, [onCancel]);

  const scheduleRedirect = useCallback(
    (path: string) => {
      // Cancel any existing redirect
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setIsRedirecting(true);
      setRedirectPath(path);
      onBeforeRedirect?.(path);

      timerRef.current = window.setTimeout(() => {
        router.push(path);
        onAfterRedirect?.(path);
        timerRef.current = null;
      }, delay);
    },
    [router, delay, onBeforeRedirect, onAfterRedirect]
  );

  const scheduleRedirectByRole = useCallback(
    (role: string | undefined | null) => {
      const path = getRedirectPathByRole(role);
      scheduleRedirect(path);
    },
    [scheduleRedirect]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    scheduleRedirect,
    scheduleRedirectByRole,
    cancelRedirect,
    isRedirecting,
    redirectPath,
  };
}

/**
 * Hook for immediate redirects (no delay)
 * 
 * @example
 * ```typescript
 * const { redirect, redirectByRole } = useAuthImmediateRedirect();
 * 
 * // Redirect immediately
 * redirect("/dashboard");
 * 
 * // Or by role
 * redirectByRole(user.role);
 * ```
 */
export interface UseAuthImmediateRedirectReturn {
  /** Redirect immediately to a specific path */
  redirect: (path: string) => void;
  /** Redirect immediately based on user role */
  redirectByRole: (role: string | undefined | null) => void;
}

export function useAuthImmediateRedirect(): UseAuthImmediateRedirectReturn {
  const router = useRouter();

  const redirect = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  const redirectByRole = useCallback(
    (role: string | undefined | null) => {
      const path = getRedirectPathByRole(role);
      router.push(path);
    },
    [router]
  );

  return {
    redirect,
    redirectByRole,
  };
}

/**
 * Hook for conditional redirects with guards
 * 
 * @example
 * ```typescript
 * const { scheduleRedirect } = useAuthConditionalRedirect({
 *   guard: (path) => {
 *     // Only redirect if user is authenticated
 *     return !!getAuthUser();
 *   },
 * });
 * ```
 */
export interface UseAuthConditionalRedirectOptions
  extends UseAuthRedirectOptions {
  /** Guard function to check if redirect should proceed */
  guard?: (path: string) => boolean;
  /** Callback if guard fails */
  onGuardFail?: (path: string) => void;
}

export function useAuthConditionalRedirect(
  options: UseAuthConditionalRedirectOptions = {}
): UseAuthRedirectReturn {
  const { guard, onGuardFail, ...redirectOptions } = options;
  const baseRedirect = useAuthRedirect(redirectOptions);

  const scheduleRedirect = useCallback(
    (path: string) => {
      if (guard && !guard(path)) {
        onGuardFail?.(path);
        return;
      }
      baseRedirect.scheduleRedirect(path);
    },
    [guard, onGuardFail, baseRedirect]
  );

  const scheduleRedirectByRole = useCallback(
    (role: string | undefined | null) => {
      const path = getRedirectPathByRole(role);
      scheduleRedirect(path);
    },
    [scheduleRedirect]
  );

  return {
    ...baseRedirect,
    scheduleRedirect,
    scheduleRedirectByRole,
  };
}
