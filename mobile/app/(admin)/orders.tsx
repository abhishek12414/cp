import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";

/**
 * Placeholder screen for managing orders.
 *
 * Route: /admin/orders
 *
 * Backend: Uses Strapi's api::order.order and api::order-item.order-item content types (see server/src/api/order).
 * Future: List orders, status updates, fulfillment, user links.
 */

export default function ManageOrdersScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      {/* SafeAreaView with edges excluding 'top' to prevent overlap with status bar
          and the custom Stack header (from admin layout, where headerShown: true).
          This ensures content doesn't get cut off by system UI elements like notches,
          home indicator, or header inset. */}
      <SafeAreaView
        style={styles.safeArea}
        // Exclude top since header + StatusBar handle it; include others for bottom/sides
        edges={["bottom", "left", "right"]}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: primaryColor }]}>Manage Orders</Text>
          <Text style={styles.placeholder}>
            This is a placeholder screen for order management.
            {"\n\n"}
            Features to implement: List orders (filter by status/user), view details, update status,
            totals/shipping.
            {"\n\n"}
            Navigate back via header or add UI controls later.
          </Text>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  placeholder: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
});
