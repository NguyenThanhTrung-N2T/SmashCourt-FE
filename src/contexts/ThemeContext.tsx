"use client";

/**
 * Theme Context and Provider
 * 
 * Provides global theme state management with persistence and system theme detection.
 * Handles theme switching, localStorage persistence, and DOM class application.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import type {
  ThemePreference,
  ResolvedTheme,
  ThemeContextValue,
} from "@/src/shared/types/theme.types";
import {
  getStoredTheme,
  setStoredTheme,
} from "@/src/lib/theme-storage";
import {
  getSystemTheme,
  onSystemThemeChange,
} from "@/src/lib/theme-detector";
import { usePathname } from "next/navigation";

/**
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Resolve theme preference to actual theme
 * Converts "system" to "light" or "dark" based on system preference
 */
function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "system") {
    return getSystemTheme();
  }
  return preference;
}

/**
 * Apply theme to DOM by adding/removing "dark" class
 */
function applyTheme(theme: ResolvedTheme): void {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

/**
 * Theme Provider Component
 * 
 * Manages theme state, persistence, and system theme detection.
 * Must wrap the application to provide theme context.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const pathname = usePathname();
  const isPublicPage = pathname === "/" || pathname?.startsWith("/auth");

  // Initialize theme from storage or default to "system"
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") {
      return "system";
    }
    return getStoredTheme() ?? "system";
  });

  // Resolved theme (never "system")
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    return resolveTheme(theme);
  });

  const actualResolvedTheme = isPublicPage ? "light" : resolvedTheme;

  /**
   * Update theme preference
   * - Updates state
   * - Persists to localStorage
   * - Applies to DOM
   */
  const setTheme = (newTheme: ThemePreference) => {
    // Validate theme value
    if (!["light", "dark", "system"].includes(newTheme)) {
      console.warn("Invalid theme value:", newTheme);
      return;
    }

    console.log("[ThemeContext] Setting theme to:", newTheme);
    setThemeState(newTheme);
    setStoredTheme(newTheme);

    const resolved = resolveTheme(newTheme);
    console.log("[ThemeContext] Resolved theme:", resolved);
    setResolvedTheme(resolved);

    // Check again in case it changed
    applyTheme(isPublicPage ? "light" : resolved);

    // Verify DOM update
    console.log("[ThemeContext] Dark class present:", document.documentElement.classList.contains("dark"));
  };

  // Apply theme when resolved theme or path changes
  useEffect(() => {
    applyTheme(actualResolvedTheme);
  }, [actualResolvedTheme]);

  // Listen for system theme changes when preference is "system"
  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    // Update resolved theme when system theme changes
    const cleanup = onSystemThemeChange((systemTheme) => {
      setResolvedTheme(systemTheme);
    });

    return cleanup;
  }, [theme]);

  // Initialize theme on mount (client-side only)
  useEffect(() => {
    const stored = getStoredTheme();
    if (stored && stored !== theme) {
      // Use setTimeout to defer state updates and avoid cascading renders
      const timer = setTimeout(() => {
        setThemeState(stored);
        const resolved = resolveTheme(stored);
        setResolvedTheme(resolved);
        applyTheme(isPublicPage ? "light" : resolved);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      // Apply current theme on mount
      applyTheme(actualResolvedTheme);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value: ThemeContextValue = {
    theme,
    resolvedTheme: actualResolvedTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * 
 * @throws Error if used outside ThemeProvider
 * @returns Theme context value
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
