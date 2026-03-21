type AuthSessionKeys = {
  email: string;
  tempToken: string;
  resetToken: string;
  authUser: string;
  persistedAuthUser: string;
  authSyncEvent: string;
  registerVerifyState: string;
  twoFactorVerifyState: string;
  registerFlashMessage: string;
  forgotPasswordFlashMessage: string;
  postVerifyLoginHint: string;
};

export type AuthUserSession = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: string;
  status: string;
};

export type RegisterVerifySession = {
  email: string;
  failedAttempts: number;
  resendCount: number;
};

export type TwoFactorVerifySession = {
  email: string;
  tempToken: string;
  failedAttempts: number;
  resendCount: number;
  startedAt: number;
};

const KEYS: AuthSessionKeys = {
  email: "auth.email",
  tempToken: "auth.tempToken",
  resetToken: "auth.resetToken",
  authUser: "auth.user",
  persistedAuthUser: "auth.persistedUser",
  authSyncEvent: "auth.syncEvent",
  registerVerifyState: "auth.registerVerifyState",
  twoFactorVerifyState: "auth.twoFactorVerifyState",
  registerFlashMessage: "auth.registerFlashMessage",
  forgotPasswordFlashMessage: "auth.forgotPasswordFlashMessage",
  postVerifyLoginHint: "auth.postVerifyLoginHint",
};

export const AUTH_SYNC_EVENT_KEY = KEYS.authSyncEvent;

let accessTokenMemory: string | null = null;

function ensureBrowser() {
  if (typeof window === "undefined") {
    throw new Error("sessionStore can only be used in the browser.");
  }
  if (!window.sessionStorage || !window.localStorage) {
    throw new Error("Browser storage is not available in this environment.");
  }
}

function getItem(key: string) {
  ensureBrowser();
  return window.sessionStorage.getItem(key);
}

function getPersistentItem(key: string) {
  ensureBrowser();
  return window.localStorage.getItem(key);
}

function setItem(key: string, value: string) {
  ensureBrowser();
  window.sessionStorage.setItem(key, value);
}

function setPersistentItem(key: string, value: string) {
  ensureBrowser();
  window.localStorage.setItem(key, value);
}

function removeItem(key: string) {
  ensureBrowser();
  window.sessionStorage.removeItem(key);
}

function removePersistentItem(key: string) {
  ensureBrowser();
  window.localStorage.removeItem(key);
}

export function setEmail(email: string) {
  setItem(KEYS.email, email);
}

export function getEmail() {
  return getItem(KEYS.email);
}

export function clearEmail() {
  removeItem(KEYS.email);
}

export function setTempToken(tempToken: string) {
  setItem(KEYS.tempToken, tempToken);
}

export function getTempToken() {
  return getItem(KEYS.tempToken);
}

export function clearTempToken() {
  removeItem(KEYS.tempToken);
}

export function setResetToken(resetToken: string) {
  setItem(KEYS.resetToken, resetToken);
}

export function getResetToken() {
  return getItem(KEYS.resetToken);
}

export function clearResetToken() {
  removeItem(KEYS.resetToken);
}

export function setAccessToken(accessToken: string | null) {
  accessTokenMemory = accessToken;
}

export function getAccessToken() {
  return accessTokenMemory;
}

export function clearAccessToken() {
  accessTokenMemory = null;
}

export function setAuthUser(user: AuthUserSession) {
  const serialized = JSON.stringify(user);
  setItem(KEYS.authUser, serialized);
  setPersistentItem(KEYS.persistedAuthUser, serialized);
}

export function getAuthUser(): AuthUserSession | null {
  const raw = getItem(KEYS.authUser) ?? getPersistentItem(KEYS.persistedAuthUser);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthUserSession;
    setItem(KEYS.authUser, raw);
    return parsed;
  } catch {
    removeItem(KEYS.authUser);
    removePersistentItem(KEYS.persistedAuthUser);
    return null;
  }
}

export function clearAuthUser() {
  removeItem(KEYS.authUser);
  removePersistentItem(KEYS.persistedAuthUser);
}

export function setAuthenticatedSession(input: {
  accessToken: string;
  user: AuthUserSession;
}) {
  setAccessToken(input.accessToken);
  setAuthUser(input.user);
  setEmail(input.user.email);
}

export function setRegisterVerifySession(session: RegisterVerifySession) {
  setItem(KEYS.registerVerifyState, JSON.stringify(session));
}

export function getRegisterVerifySession(): RegisterVerifySession | null {
  const raw = getItem(KEYS.registerVerifyState);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as RegisterVerifySession;
  } catch {
    removeItem(KEYS.registerVerifyState);
    return null;
  }
}

export function startRegisterVerifySession(email: string) {
  const session: RegisterVerifySession = {
    email: email.trim().toLowerCase(),
    failedAttempts: 0,
    resendCount: 0,
  };
  setRegisterVerifySession(session);
  return session;
}

export function clearRegisterVerifySession() {
  removeItem(KEYS.registerVerifyState);
}

export function setTwoFactorVerifySession(session: TwoFactorVerifySession) {
  setItem(KEYS.twoFactorVerifyState, JSON.stringify(session));
}

export function getTwoFactorVerifySession(): TwoFactorVerifySession | null {
  const raw = getItem(KEYS.twoFactorVerifyState);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as TwoFactorVerifySession;
  } catch {
    removeItem(KEYS.twoFactorVerifyState);
    return null;
  }
}

export function startTwoFactorVerifySession(email: string, tempToken: string) {
  const session: TwoFactorVerifySession = {
    email: email.trim().toLowerCase(),
    tempToken,
    failedAttempts: 0,
    resendCount: 0,
    startedAt: Date.now(),
  };
  setTwoFactorVerifySession(session);
  return session;
}

export function clearTwoFactorVerifySession() {
  removeItem(KEYS.twoFactorVerifyState);
}

export function setRegisterFlashMessage(message: string) {
  setItem(KEYS.registerFlashMessage, message);
}

export function consumeRegisterFlashMessage(): string | null {
  const value = getItem(KEYS.registerFlashMessage);
  if (value) removeItem(KEYS.registerFlashMessage);
  return value;
}

export function setForgotPasswordFlashMessage(message: string) {
  setItem(KEYS.forgotPasswordFlashMessage, message);
}

export function consumeForgotPasswordFlashMessage(): string | null {
  const value = getItem(KEYS.forgotPasswordFlashMessage);
  if (value) removeItem(KEYS.forgotPasswordFlashMessage);
  return value;
}

export function setPostVerifyLoginHint(message: string) {
  setItem(KEYS.postVerifyLoginHint, message);
}

export function consumePostVerifyLoginHint(): string | null {
  const value = getItem(KEYS.postVerifyLoginHint);
  if (value) removeItem(KEYS.postVerifyLoginHint);
  return value;
}

export function broadcastLogoutSync() {
  ensureBrowser();
  window.localStorage.setItem(
    KEYS.authSyncEvent,
    JSON.stringify({ type: "logout", at: Date.now() }),
  );
}

export function clearAuthSession() {
  clearEmail();
  clearTempToken();
  clearResetToken();
  clearAccessToken();
  clearAuthUser();
  clearRegisterVerifySession();
  clearTwoFactorVerifySession();
  removeItem(KEYS.registerFlashMessage);
  removeItem(KEYS.forgotPasswordFlashMessage);
  removeItem(KEYS.postVerifyLoginHint);
}
