import {
  MD3LightTheme,
  MD3DarkTheme,
  adaptNavigationTheme,
  configureFonts,
} from "react-native-paper";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import { Colors } from "./constants/Colors";

// Adapt navigation theme
const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

// Default font configuration that conforms to MD3Typescale
const fontConfig = configureFonts();

// Create the light theme
export const LightAppTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  fonts: fontConfig,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    primary: Colors.light.primary,
    onPrimary: "#ffffff",
    primaryContainer: "#FFE2A1",
    onPrimaryContainer: "#261900",
    secondary: Colors.light.secondary,
    onSecondary: "#ffffff",
    secondaryContainer: "#DBE2F9",
    onSecondaryContainer: "#000F37",
    tertiary: "#6B5900",
    onTertiary: "#ffffff",
    tertiaryContainer: "#F8DF74",
    onTertiaryContainer: "#221B00",
    error: "#BA1A1A",
    onError: "#ffffff",
    errorContainer: "#FFDAD6",
    onErrorContainer: "#410002",
    background: "#FFFBFF",
    onBackground: "#1E1B16",
    surface: "#FFFBFF",
    onSurface: "#1E1B16",
    surfaceVariant: "#EEE1CF",
    onSurfaceVariant: "#4E4639",
    outline: "#7F7667",
    outlineVariant: "#D1C5B4",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#33302A",
    inverseOnSurface: "#F7EFE7",
    inversePrimary: "#FFB94C",
  },
};

// Create the dark theme
export const DarkAppTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  fonts: fontConfig,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    onPrimary: "#3F2E00",
    primaryContainer: "#5A4300",
    onPrimaryContainer: "#FFD98F",
    secondary: Colors.dark.secondary,
    onSecondary: "#001944",
    secondaryContainer: "#00296B",
    onSecondaryContainer: "#D5E3FF",
    tertiary: "#D9C248",
    onTertiary: "#383000",
    tertiaryContainer: "#514700",
    onTertiaryContainer: "#F8DF74",
    error: "#FFB4AB",
    onError: "#690005",
    errorContainer: "#93000A",
    onErrorContainer: "#FFDAD6",
    background: "#1E1B16",
    onBackground: "#E9E1D9",
    surface: "#1E1B16",
    onSurface: "#E9E1D9",
    surfaceVariant: "#4E4639",
    onSurfaceVariant: "#D1C5B4",
    outline: "#998F80",
    outlineVariant: "#4E4639",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#E9E1D9",
    inverseOnSurface: "#33302A",
    inversePrimary: "#7B5800",
  },
};
