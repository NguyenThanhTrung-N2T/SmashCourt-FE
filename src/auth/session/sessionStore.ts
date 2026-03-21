type AuthSessionKeys = {
  email: string;
  tempToken: string;
  resetToken: string;
  accessToken: string;
  authUser: string;
  registerVerifyState: string;
  registerFlashMessage: string;
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

const KEYS: AuthSessionKeys = {
  email: "auth.email",
  tempToken: "auth.tempToken",
  resetToken: "auth.resetToken",
  accessToken: "auth.accessToken",
  authUser: "auth.user",
  registerVerifyState: "auth.registerVerifyState",
  registerFlashMessage: "auth.registerFlashMessage",
  postVerifyLoginHint: "auth.postVerifyLoginHint",
};

function ensureBrowser() {
  if (typeof window === "undefined") {
    throw new Error("sessionStore can only be used in the browser.");
  }
  if (!window.sessionStorage) {
    throw new Error("sessionStorage is not available in this environment.");
  }
}

function getItem(key: string) {
  ensureBrowser();
  return window.sessionStorage.getItem(key);
}

function setItem(key: string, value: string) {
  ensureBrowser();
  window.sessionStorage.setItem(key, value);
}

function removeItem(key: string) {
  ensureBrowser();
  window.sessionStorage.removeItem(key);
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

export function setAccessToken(accessToken: string) {
  setItem(KEYS.accessToken, accessToken);
}

export function getAccessToken() {
  return getItem(KEYS.accessToken);
}

export function clearAccessToken() {
  removeItem(KEYS.accessToken);
}

export function setAuthUser(user: AuthUserSession) {
  setItem(KEYS.authUser, JSON.stringify(user));
}

export function getAuthUser(): AuthUserSession | null {
  const raw = getItem(KEYS.authUser);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUserSession;
  } catch {
    removeItem(KEYS.authUser);
    return null;
  }
}

export function clearAuthUser() {
  removeItem(KEYS.authUser);
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

export function setRegisterFlashMessage(message: string) {
  setItem(KEYS.registerFlashMessage, message);
}

export function consumeRegisterFlashMessage(): string | null {
  const value = getItem(KEYS.registerFlashMessage);
  if (value) removeItem(KEYS.registerFlashMessage);
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

export function clearAuthSession() {
  clearEmail();
  clearTempToken();
  clearResetToken();
  clearAccessToken();
  clearAuthUser();
  clearRegisterVerifySession();
  removeItem(KEYS.registerFlashMessage);
  removeItem(KEYS.postVerifyLoginHint);
}
