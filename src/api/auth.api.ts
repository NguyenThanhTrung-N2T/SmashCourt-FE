import {
  clearAuthSession,
  getAccessToken,
  getAuthUser,
  setAccessToken,
} from "@/src/modules/auth/session/sessionStore";

import type {
  ApiValidationErrors,
  ApiEnvelope,
  ApiErrorPayload,
  AuthApiSuccess,
} from "@/src/shared/types/api.types";

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

const GENERIC_CLIENT_ERROR_MESSAGE = "Yeu cau khong hop le. Vui long thu lai.";
const GENERIC_SERVER_ERROR_MESSAGE =
  "Da xay ra loi he thong, vui long thu lai sau.";

let refreshPromise: Promise<string> | null = null;

export class AuthApiError extends Error {
  status: number;
  code: string | null;
  errors: ApiValidationErrors | null;
  payload: ApiErrorPayload | null;

  constructor(
    message: string,
    options: {
      status: number;
      code?: string | null;
      errors?: ApiValidationErrors | null;
      payload: ApiErrorPayload | null;
    },
  ) {
    super(message);
    this.name = "AuthApiError";
    this.status = options.status;
    this.code = options.code ?? null;
    this.errors = options.errors ?? null;
    this.payload = options.payload;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function assertApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_BASE_URL. Vui long dat no trong moi truong cua ban.",
    );
  }
}

function toUrl(path: string) {
  assertApiBaseUrl();
  const base = API_BASE_URL!.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.clone().json()) as T;
  } catch {
    return null;
  }
}

async function parseTextSafe(res: Response): Promise<string | null> {
  try {
    const text = (await res.clone().text()).trim();
    return text || null;
  } catch {
    return null;
  }
}

function isHtmlLike(text: string) {
  const normalized = text.trim().toLowerCase();
  return normalized.startsWith("<!doctype") || normalized.startsWith("<html");
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return (
    isObjectLike(value) &&
    ("success" in value ||
      "code" in value ||
      "data" in value ||
      "errors" in value)
  );
}

async function parsePayload<T>(res: Response): Promise<T | null> {
  const jsonPayload = await parseJsonSafe<T>(res);
  if (jsonPayload) return jsonPayload;

  const textPayload = await parseTextSafe(res);
  if (!textPayload || isHtmlLike(textPayload)) {
    return null;
  }

  return { message: textPayload } as T;
}

function toTrimmedString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function extractValidationErrors(
  payload: ApiErrorPayload | null,
): ApiValidationErrors | null {
  if (!payload || !isObjectLike(payload.errors)) {
    return null;
  }

  const entries = Object.entries(payload.errors).flatMap(([field, messages]) => {
    if (!Array.isArray(messages)) {
      return [];
    }

    const normalizedMessages = messages
      .filter((message): message is string => typeof message === "string")
      .map((message) => message.trim())
      .filter(Boolean);

    return normalizedMessages.length > 0 ? [[field, normalizedMessages]] : [];
  });

  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

function extractFirstValidationMessage(errors: ApiValidationErrors | null) {
  if (!errors) return null;

  for (const messages of Object.values(errors)) {
    const firstMessage = messages.find((message) => message.trim());
    if (firstMessage) {
      return firstMessage.trim();
    }
  }

  return null;
}

function extractErrorCode(payload: ApiErrorPayload | null) {
  return toTrimmedString(payload?.code);
}

function extractErrorMessage(payload: ApiErrorPayload | null) {
  if (!payload) return null;

  const validationMessage = extractFirstValidationMessage(
    extractValidationErrors(payload),
  );
  if (validationMessage) {
    return validationMessage;
  }

  const candidates = [
    payload.message,
    payload.detail,
    payload.error,
    payload.title,
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed;
  }

  return null;
}

function resolveAuthErrorMessage(
  status: number,
  payload: ApiErrorPayload | null,
) {
  if (status >= 500) {
    return GENERIC_SERVER_ERROR_MESSAGE;
  }

  return extractErrorMessage(payload) ?? GENERIC_CLIENT_ERROR_MESSAGE;
}

function normalizeSuccessPayload<T>(
  payload: T | ApiEnvelope<T> | null,
): AuthApiSuccess<T> {
  if (isApiEnvelope<T>(payload)) {
    return {
      success: typeof payload.success === "boolean" ? payload.success : null,
      code: toTrimmedString(payload.code),
      message: toTrimmedString(payload.message),
      data: (payload.data ?? null) as T | null,
      errors: extractValidationErrors(payload as ApiErrorPayload),
    };
  }

  return {
    success: null,
    code: null,
    message: null,
    data: payload,
    errors: null,
  };
}

function requireData<T>(response: AuthApiSuccess<T>, fallbackMessage: string) {
  if (response.data === null || response.data === undefined) {
    throw new AuthApiError(fallbackMessage, {
      status: 500,
      payload: null,
    });
  }

  return response.data;
}

function withResponseMeta<T extends object>(response: AuthApiSuccess<T>) {
  const data = requireData(response, "Phan hoi API khong hop le. Vui long thu lai.");

  return {
    ...data,
    message: response.message ?? undefined,
    code: response.code ?? undefined,
  };
}

async function authFetch<T>(
  path: string,
  options: {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    headers?: HeadersInit;
  },
): Promise<AuthApiSuccess<T>> {
  const url = toUrl(path);
  const headers = new Headers(options.headers);

  if (options.method !== "GET" && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    method: options.method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  const payload = await parsePayload<ApiErrorPayload & T>(res);
  const normalizedErrorPayload = payload as ApiErrorPayload | null;

  if (!res.ok) {
    throw new AuthApiError(resolveAuthErrorMessage(res.status, normalizedErrorPayload), {
      status: res.status,
      code: extractErrorCode(normalizedErrorPayload),
      errors: extractValidationErrors(normalizedErrorPayload),
      payload: normalizedErrorPayload,
    });
  }

  return normalizeSuccessPayload(payload as T | ApiEnvelope<T> | null);
}

function buildExpiredSessionError() {
  return new AuthApiError(
    "Phien dang nhap da het han, vui long dang nhap lai.",
    {
      status: 401,
      payload: null,
    },
  );
}

function normalizeFieldKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function hasAuthErrorCode(
  error: unknown,
  expectedCode: string | readonly string[],
) {
  if (!(error instanceof AuthApiError) || !error.code) {
    return false;
  }

  const expectedCodes = Array.isArray(expectedCode)
    ? expectedCode
    : [expectedCode];

  return expectedCodes.some((code) => code === error.code);
}

export function getAuthFieldError(
  error: unknown,
  fieldNames: string | readonly string[],
) {
  if (!(error instanceof AuthApiError)) {
    return null;
  }

  const fieldErrors = error.errors;
  if (!fieldErrors) {
    return null;
  }

  const normalizedFieldNames = new Set(
    (Array.isArray(fieldNames) ? fieldNames : [fieldNames]).map(normalizeFieldKey),
  );

  for (const [field, messages] of Object.entries(fieldErrors)) {
    const candidates = [field, field.split(".").at(-1) ?? field];
    const isMatch = candidates.some((candidate) =>
      normalizedFieldNames.has(normalizeFieldKey(candidate)),
    );

    if (!isMatch) {
      continue;
    }

    const firstMessage = messages.find((message) => message.trim());
    if (firstMessage) {
      return firstMessage.trim();
    }
  }

  return extractFirstValidationMessage(fieldErrors);
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = authRefresh()
      .then((data) => {
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch((err) => {
        clearAuthSession();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function authProtectedFetch<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    headers?: HeadersInit;
  } = {},
) {
  const request = (accessToken: string) =>
    authFetch<T>(path, {
      method: options.method ?? "GET",
      body: options.body,
      headers: (() => {
        const headers = new Headers(options.headers);
        headers.set("Authorization", `Bearer ${accessToken}`);
        return headers;
      })(),
    });

  let currentAccessToken = getAccessToken();

  if (!currentAccessToken) {
    const user = getAuthUser();
    if (!user) {
      throw buildExpiredSessionError();
    }

    try {
      currentAccessToken = await refreshAccessToken();
    } catch (err) {
      if (err instanceof AuthApiError) {
        throw err;
      }
      throw buildExpiredSessionError();
    }
  }

  try {
    return await request(currentAccessToken);
  } catch (err) {
    if (!(err instanceof AuthApiError) || err.status !== 401) {
      throw err;
    }

    try {
      const refreshedAccessToken = await refreshAccessToken();
      return await request(refreshedAccessToken);
    } catch (refreshErr) {
      clearAuthSession();
      if (refreshErr instanceof AuthApiError) {
        throw refreshErr;
      }

      throw buildExpiredSessionError();
    }
  }
}



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
