import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { createQueryClient, setupQueryPersistence } from "@/config/queryClient";
import { analytics } from "@/services/analytics";
import {
  initializeNetworkMonitoring,
  useNetworkStatus,
} from "@/hooks/useNetworkStatus";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create query client with proper configuration
const queryClient = createQueryClient();

// Auth Provider Component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isInitialized, isAuthenticated, isOffline } = useSelector(
    (state: any) => state.auth
  );
  const [isChecking, setIsChecking] = useState(true);
  const { checkConnectivity } = useNetworkStatus();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

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
          role: userData.role,
        };

        dispatch(initializeSuccess({ user, token }));
        
        // Set user ID for analytics
        analytics.setUserId(String(user.id));
      } catch (error) {
        // Token is invalid or expired
        await AsyncStorage.removeItem("auth_token");
        dispatch(initializeFail());
        analytics.setUserId(null);
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
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // App came to foreground, re-check auth
          initializeAuth();
        }
        appStateRef.current = nextAppState;
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
          analytics.trackScreenView("product_detail", { product_id: parsed.id });
          break;
        case "category":
          router.push(`/category/${parsed.id}`);
          analytics.trackScreenView("category", { category_id: parsed.id });
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

// App Initialization Component
function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize analytics
        await analytics.initialize();

        // Initialize network monitoring
        await initializeNetworkMonitoring();

        // Setup query persistence for offline support
        await setupQueryPersistence(queryClient);

        setIsReady(true);
      } catch (error) {
        console.error("App initialization failed:", error);
        // Continue even if some initialization fails
        setIsReady(true);
      }
    };

    initialize();
  }, []);

  if (!isReady) {
    return <LoadingScreen message="Loading cached data..." />;
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
          <AppInitializer>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </AppInitializer>
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
  const { checkConnectivity } = useNetworkStatus();

  // Handle retry when offline
  const handleRetry = useCallback(async () => {
    try {
      // Check connectivity first
      const isConnected = await checkConnectivity();
      if (!isConnected) {
        return;
      }

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
          role: userData.role,
        };
        dispatch(initializeSuccess({ user, token }));
      }
      dispatch(setOffline(false));
    } catch (error) {
      // Still offline or auth failed
      console.log("Retry failed:", error);
    }
  }, [dispatch, checkConnectivity]);

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
