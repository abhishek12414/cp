import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Provider } from "react-redux";

import { useColorScheme } from "@/hooks/useColorScheme";
import { store } from "@/store";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create a client for React Query
const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Load fonts
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Hide the splash screen once the assets are loaded
  React.useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Wait for fonts to load
  if (!loaded) {
    return null;
  }

  // Return the layout with all providers
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            {/* Admin panel route for managing brands, categories, products, and orders.
                - Uses grouped layout (admin)/_layout.tsx which sets headerShown: true
                - Set headerShown: false in parent to avoid double headers/conflicts
                - Placeholder for now; will add auth guards and sub-routes later */}
            <Stack.Screen 
              name="(admin)" 
              options={{ headerShown: false }} 
            />
            <Stack.Screen name="product" />
            <Stack.Screen name="category" />
            <Stack.Screen name="upload-order" />
            <Stack.Screen name="cart" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}
