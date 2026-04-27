/**
 * Reusable OTP verification hook
 * 
 * Provides complete OTP verification logic including state management,
 * validation, resend functionality, and attempt tracking.
 * 
 * @example
 * ```typescript
 * const {
 *   otpCode,
 *   setOtpCode,
 *   verify,
 *   resend,
 *   remainingAttempts,
 *   remainingResends,
 *   canResend,
 *   isVerifying,
 *   isResending,
 * } = useOtpVerification({
 *   email: "user@example.com",
 *   type: OtpType.EMAIL_VERIFY,
 *   maxAttempts: 3,
 *   maxResends: 3,
 *   onSuccess: () => router.push("/login"),
 *   onError: (err) => console.error(err),
 * });
 * ```
 */

import { useState, useCallback, useEffect, useRef } from "react";
import {
  authVerifyEmail,
  authResendOtp,
  authForgotPasswordVerifyOtp,
} from "@/src/api/auth.api";
import { OtpType, type OtpTypeValue } from "../constants";
import { isValidOtp, normalizeOtp } from "../validators";
import { logAuthClientError } from "../utils/clientErrors";
import type { AuthContext } from "../utils/errorCodes";

export interface UseOtpVerificationOptions {
  /** Email address for OTP verification */
  email: string;
  /** Type of OTP verification */
  type: OtpTypeValue;
  /** Maximum verification attempts (default: 3) */
  maxAttempts?: number;
  /** Maximum resend attempts (default: 3) */
  maxResends?: number;
  /** Initial failed attempts count */
  initialFailedAttempts?: number;
  /** Initial resend count */
  initialResendCount?: number;
  /** Callback on successful verification */
  onSuccess?: (data?: unknown) => void;
  /** Callback on verification error */
  onError?: (error: unknown) => void;
  /** Callback on successful resend */
  onResendSuccess?: (message?: string) => void;
  /** Callback on resend error */
  onResendError?: (error: unknown) => void;
  /** Context for error messages */
  context?: AuthContext;
}

export interface UseOtpVerificationReturn {
  /** Current OTP code value */
  otpCode: string;
  /** Set OTP code value */
  setOtpCode: (code: string) => void;
  /** Verify the OTP code */
  verify: () => Promise<void>;
  /** Resend OTP code */
  resend: () => Promise<void>;
  /** Remaining verification attempts */
  remainingAttempts: number;
  /** Remaining resend attempts */
  remainingResends: number;
  /** Whether resend is available */
  canResend: boolean;
  /** Whether verification is in progress */
  isVerifying: boolean;
  /** Whether resend is in progress */
  isResending: boolean;
  /** Whether OTP code is valid format */
  isValidFormat: boolean;
  /** Reset verification state */
  reset: () => void;
}

/**
 * Hook for OTP verification with attempt tracking and resend functionality
 */
export function useOtpVerification(
  options: UseOtpVerificationOptions
): UseOtpVerificationReturn {
  const {
    email,
    type,
    maxAttempts = 3,
    maxResends = 3,
    initialFailedAttempts = 0,
    initialResendCount = 0,
    onSuccess,
    onError,
    onResendSuccess,
    onResendError,
    context = "verify-email",
  } = options;

  const [otpCode, setOtpCodeState] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(initialFailedAttempts);
  const [resendCount, setResendCount] = useState(initialResendCount);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setOtpCode = useCallback((code: string) => {
    const normalized = normalizeOtp(code);
    setOtpCodeState(normalized);
  }, []);

  const remainingAttempts = Math.max(0, maxAttempts - failedAttempts);
  const remainingResends = Math.max(0, maxResends - resendCount);
  const canResend = remainingResends > 0;
  const isValidFormat = isValidOtp(otpCode);

  const reset = useCallback(() => {
    setOtpCodeState("");
    setFailedAttempts(0);
    setResendCount(0);
    setIsVerifying(false);
    setIsResending(false);
  }, []);

  const verify = useCallback(async () => {
    if (!isValidFormat) {
      const error = new Error("Vui lòng nhập đủ 6 chữ số.");
      onError?.(error);
      return;
    }

    if (isVerifying) return;

    try {
      setIsVerifying(true);

      let result;
      if (type === OtpType.EMAIL_VERIFY) {
        result = await authVerifyEmail({ email, otpCode });
      } else if (type === OtpType.FORGOT_PASSWORD) {
        result = await authForgotPasswordVerifyOtp({ email, otpCode });
      } else {
        throw new Error("Unsupported OTP type");
      }

      if (mountedRef.current) {
        setOtpCodeState("");
        setFailedAttempts(0);
        onSuccess?.(result);
      }
    } catch (err) {
      logAuthClientError(`verify-otp-${type}`, err);
      
      if (mountedRef.current) {
        setFailedAttempts((prev) => prev + 1);
        setOtpCodeState("");
        onError?.(err);
      }
    } finally {
      if (mountedRef.current) {
        setIsVerifying(false);
      }
    }
  }, [
    email,
    otpCode,
    type,
    isValidFormat,
    isVerifying,
    onSuccess,
    onError,
  ]);

  const resend = useCallback(async () => {
    if (!canResend || isResending) {
      const error = new Error("Bạn đã dùng hết lượt gửi lại OTP.");
      onResendError?.(error);
      throw error;
    }

    try {
      setIsResending(true);

      const result = await authResendOtp({ email, type });

      if (mountedRef.current) {
        setResendCount((prev) => prev + 1);
        setFailedAttempts(0);
        setOtpCodeState("");

        const newRemainingResends = Math.max(0, maxResends - (resendCount + 1));
        const message =
          newRemainingResends > 0
            ? `OTP đã được gửi lại, hiệu lực 5 phút. Còn ${newRemainingResends} lần gửi lại.`
            : "OTP đã được gửi lại, hiệu lực 5 phút. Đây là lần gửi lại cuối cùng.";

        onResendSuccess?.(message);
      }
    } catch (err) {
      logAuthClientError(`resend-otp-${type}`, err);
      
      if (mountedRef.current) {
        onResendError?.(err);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setIsResending(false);
      }
    }
  }, [
    email,
    type,
    canResend,
    isResending,
    resendCount,
    maxResends,
    onResendSuccess,
    onResendError,
  ]);

  return {
    otpCode,
    setOtpCode,
    verify,
    resend,
    remainingAttempts,
    remainingResends,
    canResend,
    isVerifying,
    isResending,
    isValidFormat,
    reset,
  };
}

/**
 * Hook for OTP verification with session management
 * 
 * Extends useOtpVerification with automatic session state persistence
 * 
 * @example
 * ```typescript
 * const otp = useOtpVerificationWithSession({
 *   email: "user@example.com",
 *   type: OtpType.EMAIL_VERIFY,
 *   sessionKey: "registerVerifyState",
 * });
 * ```
 */
export interface UseOtpVerificationWithSessionOptions
  extends UseOtpVerificationOptions {
  /** Session storage key */
  sessionKey: string;
  /** Load session on mount */
  loadSession?: boolean;
  /** Save session on changes */
  saveSession?: boolean;
}

export function useOtpVerificationWithSession(
  options: UseOtpVerificationWithSessionOptions
): UseOtpVerificationReturn {
  const {
    sessionKey,
    loadSession = true,
    saveSession = true,
    ...otpOptions
  } = options;

  // Load initial state from session
  const [initialState] = useState(() => {
    if (!loadSession || typeof window === "undefined") {
      return {
        failedAttempts: 0,
        resendCount: 0,
      };
    }

    try {
      const stored = window.sessionStorage.getItem(sessionKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          failedAttempts: parsed.failedAttempts ?? 0,
          resendCount: parsed.resendCount ?? 0,
        };
      }
    } catch {
      // Ignore parse errors
    }

    return {
      failedAttempts: 0,
      resendCount: 0,
    };
  });

  const otp = useOtpVerification({
    ...otpOptions,
    initialFailedAttempts: initialState.failedAttempts,
    initialResendCount: initialState.resendCount,
  });

  // Save state to session on changes
  useEffect(() => {
    if (!saveSession || typeof window === "undefined") return;

    const state = {
      email: options.email,
      failedAttempts: maxAttempts - otp.remainingAttempts,
      resendCount: maxResends - otp.remainingResends,
    };

    try {
      window.sessionStorage.setItem(sessionKey, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [
    saveSession,
    sessionKey,
    options.email,
    otp.remainingAttempts,
    otp.remainingResends,
  ]);

  return otp;
}
