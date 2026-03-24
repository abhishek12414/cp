import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useCallback } from "react";
import { Linking, AppState, AppStateStatus } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColorScheme } from "@/hooks/useColorScheme";
import { store } from "@/store";
import { parseDeepLink } from "@/helpers/share";
import {
  initializeStart,
  initializeSuccess,
  initializeFail,
  setOffline,
} from "@/reducers/auth.reducer";
import authApi from "@/apis/auth.api";
import { User } from "@/reducers/auth.reducer";
import OfflineScreen from "@/components/OfflineScreen";
import LoadingScreen from "@/components/LoadingScreen";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create a client for React Query
const queryClient = new QueryClient();

// Auth Provider Component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isInitialized, isAuthenticated, isOffline } = useSelector(
    (state: any) => state.auth
  );
  const [isChecking, setIsChecking] = useState(true);

  // Check network connectivity
  const checkConnectivity = useCallback(async () => {
    try {
      // Try to make a simple API call to check connectivity
      await fetch("https://www.google.com", { method: "HEAD", mode: "no-cors" });
      return true;
    } catch {
      return false;
    }
  }, []);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      dispatch(initializeStart());

      // Check if we have a stored token
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        dispatch(initializeFail());
        setIsChecking(false);
        return;
      }

      // Check connectivity first
      const isConnected = await checkConnectivity();
      if (!isConnected) {
        dispatch(setOffline(true));
        setIsChecking(false);
        return;
      }

      dispatch(setOffline(false));

      // Validate token by fetching user data
      try {
        const response = await authApi.getMe();
        const userData = response.data;

        const user: User = {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          name: userData.name || userData.username,
          phone: userData.phone,
          provider: userData.provider,
          confirmed: userData.confirmed,
          blocked: userData.blocked,
        };

        dispatch(initializeSuccess({ user, token }));
      } catch (error) {
        // Token is invalid or expired
        await AsyncStorage.removeItem("auth_token");
        dispatch(initializeFail());
      }
    } catch (error) {
      dispatch(initializeFail());
    } finally {
      setIsChecking(false);
    }
  }, [dispatch, checkConnectivity]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          // Re-check auth when app comes to foreground
          initializeAuth();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [initializeAuth]);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Handle deep links
  useEffect(() => {
    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle deep links when app is already running
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    console.log("Received deep link:", url);
    const parsed = parseDeepLink(url);

    if (parsed) {
      switch (parsed.type) {
        case "product":
          router.push(`/product/${parsed.id}`);
          break;
        case "category":
          router.push(`/category/${parsed.id}`);
          break;
        default:
          console.log("Unknown deep link type:", parsed.type);
      }
    }
  };

  // Show loading while checking auth
  if (isChecking) {
    return <LoadingScreen message="Initializing..." />;
  }

  // Show offline screen if device is offline
  if (isOffline && !isInitialized) {
    return (
      <OfflineScreen
        onRetry={() => {
          setIsChecking(true);
          initializeAuth();
        }}
      />
    );
  }

  return <>{children}</>;
}

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
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

// Root Navigator Component
function RootNavigator() {
  const { isAuthenticated, isInitialized, isOffline } = useSelector(
    (state: any) => state.auth
  );
  const dispatch = useDispatch();

  // Handle retry when offline
  const handleRetry = useCallback(async () => {
    try {
      // Try to reach the server
      const token = await AsyncStorage.getItem("auth_token");
      if (token) {
        const response = await authApi.getMe();
        const userData = response.data;
        const user: User = {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          name: userData.name || userData.username,
          phone: userData.phone,
          provider: userData.provider,
          confirmed: userData.confirmed,
          blocked: userData.blocked,
        };
        dispatch(initializeSuccess({ user, token }));
      }
      dispatch(setOffline(false));
    } catch (error) {
      // Still offline or auth failed
      console.log("Retry failed:", error);
    }
  }, [dispatch]);

  // Show offline screen if device is offline but user was authenticated
  if (isOffline && isAuthenticated) {
    return <OfflineScreen onRetry={handleRetry} />;
  }

  // Not authenticated - show auth screens
  if (isInitialized && !isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot-password" />
      </Stack>
    );
  }

  // Authenticated - show app screens
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="(admin)"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="product" />
      <Stack.Screen name="category" />
      <Stack.Screen name="upload-order" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="wishlist" />
    </Stack>
  );
}
