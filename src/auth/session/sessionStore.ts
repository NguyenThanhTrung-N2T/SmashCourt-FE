type AuthSessionKeys = {
  email: string;
  tempToken: string;
  resetToken: string;
  accessToken: string;
};

const KEYS: AuthSessionKeys = {
  email: "auth.email",
  tempToken: "auth.tempToken",
  resetToken: "auth.resetToken",
  accessToken: "auth.accessToken",
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

export function clearAuthSession() {
  // Xóa tất cả các key trong một chỗ để dễ dàng xóa.
  clearEmail();
  clearTempToken();
  clearResetToken();
  clearAccessToken();
}
