/**
 * Custom hook that returns the color scheme for web.
 * This version always returns 'light' theme.
 */
export function useColorScheme(): "light" | "dark" {
  // Always return 'light' as the default theme
  return "light";
}
