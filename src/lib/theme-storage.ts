/**
 * Theme Storage Utilities
 * 
 * Handles persistence of theme preference to localStorage with proper
 * error handling for environments where localStorage is unavailable.
 */

import type { ThemePreference } from "@/src/shared/types/theme.types";

const STORAGE_KEY = "theme-preference";

/**
 * Valid theme preference values
 */
const VALID_THEMES: ThemePreference[] = ["light", "dark", "system"];

/**
 * Check if a value is a valid theme preference
 */
function isValidTheme(value: unknown): value is ThemePreference {
  return typeof value === "string" && VALID_THEMES.includes(value as ThemePreference);
}

/**
 * Get stored theme preference from localStorage
 * 
 * @returns Stored theme preference or null if not found/invalid
 */
export function getStoredTheme(): ThemePreference | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return null;
    }

    // Validate stored value
    if (isValidTheme(stored)) {
      return stored;
    }

    // Invalid value found, clear it
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch (error) {
    // localStorage might be unavailable (private browsing, etc.)
    console.warn("Failed to read theme from localStorage:", error);
    return null;
  }
}

/**
 * Store theme preference to localStorage
 * 
 * @param theme - Theme preference to store
 */
export function setStoredTheme(theme: ThemePreference): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }

    // Validate before storing
    if (!isValidTheme(theme)) {
      console.warn("Attempted to store invalid theme:", theme);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    // localStorage might be unavailable or full
    console.warn("Failed to save theme to localStorage:", error);
  }
}

/**
 * Clear stored theme preference from localStorage
 */
export function clearStoredTheme(): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear theme from localStorage:", error);
  }
}
