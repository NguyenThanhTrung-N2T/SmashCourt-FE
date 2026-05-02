/**
 * Theme System Type Definitions
 * 
 * Defines TypeScript types for the theme system including preferences,
 * resolved themes, and context values.
 */

/**
 * User's theme preference
 * - "light": Always use light theme
 * - "dark": Always use dark theme
 * - "system": Follow system preference
 */
export type ThemePreference = "light" | "dark" | "system";

/**
 * Resolved theme (never "system")
 * This is the actual theme applied to the UI after resolving "system" preference
 */
export type ResolvedTheme = "light" | "dark";

/**
 * System theme detected from OS/browser
 */
export type SystemTheme = "light" | "dark";

/**
 * Theme context value provided by ThemeProvider
 */
export interface ThemeContextValue {
  /** User's theme preference (can be "system") */
  theme: ThemePreference;
  
  /** Resolved theme (always "light" or "dark", never "system") */
  resolvedTheme: ResolvedTheme;
  
  /** Function to update theme preference */
  setTheme: (theme: ThemePreference) => void;
}
