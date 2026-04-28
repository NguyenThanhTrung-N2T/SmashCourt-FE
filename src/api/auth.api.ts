/**
 * Authentication API
 * 
 * All authentication-related API endpoints.
 */

import type {
  RegisterRequest,
  VerifyEmailRequest,
  ResendOtpRequest,
  LoginRequest,
  AuthUser,
  Login2faRequest,
  ForgotPasswordRequest,
  VerifyForgotPasswordOtpRequest,
  ResetPasswordRequest,
  GoogleCallbackRequest,
} from "@/src/shared/types/auth.types";

// Import from core modules
import {
  AuthApiError,
  hasAuthErrorCode,
  getAuthFieldError,
  authFetch,
  authProtectedFetch,
  withResponseMeta,
} from "./core";

// Re-export utilities for backward compatibility
export { AuthApiError, hasAuthErrorCode, getAuthFieldError, authProtectedFetch };



export async function authRegister(body: RegisterRequest) {
  const response = await authFetch<null>(`/api/auth/register`, {
    method: "POST",
    body,
  });

  return {
    message: response.message ?? undefined,
    code: response.code ?? undefined,
  };
}

export async function authVerifyEmail(body: VerifyEmailRequest) {
  const response = await authFetch<null>(`/api/auth/verify-email`, {
    method: "POST",
    body,
  });

  return {
    status: response.code ?? (response.success ? "SUCCESS" : undefined),
    message: response.message ?? undefined,
    code: response.code ?? undefined,
  };
}

export async function authResendOtp(body: ResendOtpRequest) {
  const response = await authFetch<null>(`/api/auth/resend-otp`, {
    method: "POST",
    body,
  });

  return {
    message: response.message ?? undefined,
    code: response.code ?? undefined,
  };
}

export async function authLogin(body: LoginRequest) {
  const response = await authFetch<{
    status: string;
    tempToken?: string;
    accessToken?: string;
    user?: AuthUser;
  }>(`/api/auth/login`, { method: "POST", body });

  return withResponseMeta(response);
}

export async function authLogin2fa(body: Login2faRequest) {
  const response = await authFetch<{
    status: string;
    accessToken?: string;
    user?: AuthUser;
  }>(`/api/auth/login/2fa`, { method: "POST", body });

  return withResponseMeta(response);
}

export async function authRefresh() {
  const response = await authFetch<{ accessToken: string }>(`/api/auth/refresh`, {
    method: "POST",
  });

  return withResponseMeta(response);
}

export async function authLogout() {
  const response = await authFetch<null>(`/api/auth/logout`, {
    method: "POST",
  });

  return {
    message: response.message ?? undefined,
    code: response.code ?? undefined,
  };
}

export async function authForgotPassword(body: ForgotPasswordRequest) {
  const response = await authFetch<null>(`/api/auth/forgot-password`, {
    method: "POST",
    body,
  });

  return {
    message: response.message ?? undefined,
    code: response.code ?? undefined,
  };
}

export async function authForgotPasswordVerifyOtp(
  body: VerifyForgotPasswordOtpRequest,
) {
  const response = await authFetch<{ resetToken?: string }>(
    `/api/auth/forgot-password/verify-otp`,
    { method: "POST", body },
  );

  return withResponseMeta(response);
}

export async function authForgotPasswordReset(
  body: ResetPasswordRequest,
) {
  const response = await authFetch<null>(`/api/auth/forgot-password/reset`, {
    method: "POST",
    body,
  });

  return {
    message: response.message ?? undefined,
    status: response.code ?? (response.success ? "SUCCESS" : undefined),
    code: response.code ?? undefined,
  };
}

export async function authGoogleUrl() {
  const response = await authFetch<{ url: string }>(`/api/auth/google/url`, {
    method: "GET",
  });

  return withResponseMeta(response);
}



export async function authGoogleCallback(body: GoogleCallbackRequest) {
  const response = await authFetch<{
    status: string;
    accessToken?: string;
    user?: AuthUser;
  }>(`/api/auth/google/callback`, { method: "POST", body });

  return withResponseMeta(response);
}
