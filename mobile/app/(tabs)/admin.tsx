import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";

/**
 * Tab redirect wrapper for the admin panel.
 *
 * This screen appears in the bottom tab navigation (as a public route for now).
 * It immediately redirects to the main admin panel at /(admin), which has the
 * placeholder UI and dedicated stack layout for managing brands, categories,
 * products, and orders.
 *
 * Why a redirect? The admin panel uses a separate route group outside of (tabs)
 * to maintain its own Stack layout (with headers) while integrating easily into
 * tabs for quick access. This keeps it public/placeholder as requested.
 *
 * Future: Replace with auth guard (e.g., check admin role from Redux/auth reducer)
 * and direct integration.
 */

export default function AdminTabRedirect() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure layout is mounted before redirect (avoids flash)
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Show brief loading to prevent flicker during redirect
  if (!isReady) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Redirect to the admin panel route setup previously
  return <Redirect href="/(admin)" />;
}
