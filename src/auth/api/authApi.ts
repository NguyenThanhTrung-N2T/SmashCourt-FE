import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
} from "@/src/auth/session/sessionStore";

type ApiErrorPayload = {
  message?: string;
  detail?: string;
  title?: string;
  error?: string;
};

const GENERIC_CLIENT_ERROR_MESSAGE = "Yeu cau khong hop le. Vui long thu lai.";
const GENERIC_SERVER_ERROR_MESSAGE =
  "Da xay ra loi he thong, vui long thu lai sau.";

export class AuthApiError extends Error {
  status: number;
  payload: ApiErrorPayload | null;

  constructor(
    message: string,
    options: { status: number; payload: ApiErrorPayload | null },
  ) {
    super(message);
    this.name = "AuthApiError";
    this.status = options.status;
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

async function parseErrorPayload<T extends ApiErrorPayload>(
  res: Response,
): Promise<T | null> {
  const jsonPayload = await parseJsonSafe<T>(res);
  if (jsonPayload) return jsonPayload;

  const textPayload = await parseTextSafe(res);
  if (!textPayload || isHtmlLike(textPayload)) {
    return null;
  }

  return { message: textPayload } as T;
}

function extractErrorMessage(payload: ApiErrorPayload | null) {
  if (!payload) return null;

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

async function authFetch<T>(
  path: string,
  options: {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    headers?: HeadersInit;
  },
): Promise<T> {
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

  const payload = await parseErrorPayload<ApiErrorPayload & T>(res);

  if (!res.ok) {
    throw new AuthApiError(
      resolveAuthErrorMessage(res.status, payload),
      { status: res.status, payload },
    );
  }

  return payload as T;
}

function buildExpiredSessionError() {
  return new AuthApiError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", {
    status: 401,
    payload: null,
  });
}

export async function authProtectedFetch<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    headers?: HeadersInit;
  } = {},
) {
  const currentAccessToken = getAccessToken();
  if (!currentAccessToken) {
    throw buildExpiredSessionError();
  }

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

  try {
    return await request(currentAccessToken);
  } catch (err) {
    if (!(err instanceof AuthApiError) || err.status !== 401) {
      throw err;
    }

    try {
      const refreshData = await authRefresh();
      setAccessToken(refreshData.accessToken);
      return await request(refreshData.accessToken);
    } catch (refreshErr) {
      clearAuthSession();

      if (refreshErr instanceof AuthApiError) {
        throw refreshErr;
      }

      throw buildExpiredSessionError();
    }
  }
}

export type AuthRegisterBody = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
};

export type AuthVerifyEmailBody = {
  email: string;
  otpCode: string;
};

export type AuthResendOtpBody = {
  email: string;
  type: number;
};

export type AuthLoginBody = {
  email: string;
  password: string;
};

export type AuthUserInfo = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: string;
  status: string;
};

export type AuthLogin2faBody = {
  tempToken: string;
  otpCode: string;
};

export type AuthForgotPasswordBody = {
  email: string;
};

export type AuthForgotPasswordVerifyOtpBody = {
  email: string;
  otpCode: string;
};

export type AuthForgotPasswordResetBody = {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
};

export async function authRegister(body: AuthRegisterBody) {
  return authFetch<{ message?: string }>(`/api/auth/register`, {
    method: "POST",
    body,
  });
}

export async function authVerifyEmail(body: AuthVerifyEmailBody) {
  return authFetch<{ status?: string; message?: string }>(
    `/api/auth/verify-email`,
    { method: "POST", body },
  );
}

export async function authResendOtp(body: AuthResendOtpBody) {
  return authFetch<{ message?: string }>(`/api/auth/resend-otp`, {
    method: "POST",
    body,
  });
}

export async function authLogin(body: AuthLoginBody) {
  return authFetch<{
    status: string;
    tempToken?: string;
    accessToken?: string;
    user?: AuthUserInfo;
    message?: string;
  }>(`/api/auth/login`, { method: "POST", body });
}

export async function authLogin2fa(body: AuthLogin2faBody) {
  return authFetch<{
    status: string;
    accessToken?: string;
    user?: AuthUserInfo;
    message?: string;
  }>(`/api/auth/login/2fa`, { method: "POST", body });
}

export async function authRefresh() {
  return authFetch<{ accessToken: string }>(`/api/auth/refresh`, {
    method: "POST",
  });
}

export async function authLogout() {
  return authFetch<{ message?: string }>(`/api/auth/logout`, {
    method: "POST",
  });
}

export async function authForgotPassword(body: AuthForgotPasswordBody) {
  return authFetch<{ message?: string }>(`/api/auth/forgot-password`, {
    method: "POST",
    body,
  });
}

export async function authForgotPasswordVerifyOtp(
  body: AuthForgotPasswordVerifyOtpBody,
) {
  return authFetch<{ message?: string; resetToken?: string }>(
    `/api/auth/forgot-password/verify-otp`,
    { method: "POST", body },
  );
}

export async function authForgotPasswordReset(
  body: AuthForgotPasswordResetBody,
) {
  return authFetch<{ message?: string; status?: string }>(
    `/api/auth/forgot-password/reset`,
    { method: "POST", body },
  );
}

export async function authGoogleUrl() {
  return authFetch<{ url: string }>(`/api/auth/google/url`, {
    method: "GET",
  });
}

export type AuthGoogleCallbackBody = {
  code: string;
  state: string;
};

export async function authGoogleCallback(body: AuthGoogleCallbackBody) {
  return authFetch<{
    status: string;
    accessToken?: string;
    user?: AuthUserInfo;
    message?: string;
  }>(`/api/auth/google/callback`, { method: "POST", body });
}
