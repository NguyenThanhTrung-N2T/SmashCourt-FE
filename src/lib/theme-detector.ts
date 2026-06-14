/**
 * Theme Detector Utilities
 * 
 * Detects system theme preference using prefers-color-scheme media query
 * and provides listener for system theme changes.
 */

import type { SystemTheme } from "@/src/types/theme.types";

/**
 * Media query for detecting dark mode preference
 */
const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";

/**
 * Check if system theme detection is supported
 * 
 * @returns true if prefers-color-scheme is supported
 */
export function isSystemThemeSupported(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.matchMedia !== undefined;
  } catch (error) {
    return false;
  }
}

/**
 * Get current system theme preference
 * 
 * @returns "dark" if system prefers dark mode, "light" otherwise
 */
export function getSystemTheme(): SystemTheme {
  if (!isSystemThemeSupported()) {
    return "light"; // Default to light if not supported
  }

  try {
    const mediaQuery = window.matchMedia(DARK_MODE_QUERY);
    return mediaQuery.matches ? "dark" : "light";
  } catch (error) {
    console.warn("Failed to detect system theme:", error);
    return "light"; // Default to light on error
  }
}

/**
 * Listen for system theme changes
 * 
 * @param callback - Function to call when system theme changes
 * @returns Cleanup function to remove the listener
 */
export function onSystemThemeChange(
  callback: (theme: SystemTheme) => void
): () => void {
  if (!isSystemThemeSupported()) {
    // Return no-op cleanup function
    return () => {};
  }

  try {
    const mediaQuery = window.matchMedia(DARK_MODE_QUERY);
    
    // Modern browsers support addEventListener
    const listener = (e: MediaQueryListEvent) => {
      callback(e.matches ? "dark" : "light");
    };

    // Try modern API first
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", listener);
      
      return () => {
        mediaQuery.removeEventListener("change", listener);
      };
    }
    
    // Fallback to deprecated API for older browsers
    if (mediaQuery.addListener) {
      mediaQuery.addListener(listener);
      
      return () => {
        mediaQuery.removeListener(listener);
      };
    }

    // No listener support
    return () => {};
  } catch (error) {
    console.warn("Failed to setup system theme listener:", error);
    return () => {};
  }
}
