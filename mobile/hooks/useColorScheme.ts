/**
 * Custom hook that returns the color scheme.
 * This version always defaults to 'light' theme regardless of system preferences.
 */
export function useColorScheme(): "light" | "dark" {
  // Always return 'light' as the default theme
  return "light";
}
