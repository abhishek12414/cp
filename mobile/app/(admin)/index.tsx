import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button } from "react-native-paper";

import { ThemedView } from "../../components/ThemedView";
import { useThemeColor } from "../../hooks/useThemeColor";
import { Colors } from "../../constants/Colors";

/**
 * Admin Panel Placeholder
 * 
 * This is the starting point for the admin panel where administrators can manage:
 * - Brands
 * - Categories
 * - Products
 * - Orders
 * 
 * Backend is powered by Strapi which already has content types for these entities.
 * Future implementation will include:
 * - CRUD operations via API (e.g., extending product.api.ts patterns)
 * - Role-based access (admin users only, via auth reducer)
 * - List views, forms for editing, etc.
 * 
 * For now, this serves as a route setup in the mobile app with buttons to
 * navigate to placeholder screens for each management section. Content is wrapped
 * in ScrollView to handle cases where it exceeds screen height (e.g., long placeholder
 * text/buttons), while maintaining SafeAreaView for system UI protection.
 */

export default function AdminPanelScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;

  // Navigation handlers for management sections (placeholders for now).
  // Use full group path '/(admin)/...' for correct resolution under the (admin)
  // route group (common Expo Router pattern for nested/grouped routes; see
  // root index.tsx and (tabs)/admin.tsx redirect for examples). This fixes
  // the prior navigation issue where '/admin/...' was resolving incorrectly
  // at top-level instead of the grouped stack.
  const handleManageBrands = () => {
    router.push("/(admin)/brands");
  };

  const handleManageCategories = () => {
    router.push("/(admin)/categories");
  };

  const handleManageProducts = () => {
    router.push("/(admin)/products");
  };

  const handleManageOrders = () => {
    router.push("/(admin)/orders");
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      {/* SafeAreaView with edges excluding 'top' to prevent overlap with status bar
          and the custom Stack header (from admin layout, where headerShown: true).
          This ensures content doesn't get cut off by system UI elements like notches,
          home indicator, or header inset. ScrollView is nested inside for scrolling
          long content (e.g., extended placeholder text/buttons), matching patterns
          in (tabs)/index.tsx while preserving safe area handling. */}
      <SafeAreaView 
        style={styles.safeArea}
        // Exclude top since header + StatusBar handle it; include others for bottom/sides
        edges={['bottom', 'left', 'right']}
      >
        {/* ScrollView allows vertical scrolling if content exceeds screen height
            (e.g., on small devices or with future expansions). hides scroll indicator
            for clean UI; contentContainerStyle ensures padding, min-height, and
            centering behavior like non-scroll cases. */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <Text style={[styles.title, { color: primaryColor }]}>
              Admin Panel
            </Text>
            <Text style={styles.subtitle}>
              Manage Brands, Categories, Products, and Orders
            </Text>
            <Text style={styles.placeholder}>
              This is a placeholder for the admin panel functionality.
              {"\n\n"}
              The backend (Strapi) already supports managing these entities via its admin interface at http://localhost:1337/admin.
              {"\n\n"}
              Mobile admin features will be implemented later using the existing APIs for brands, categories, products, and orders.
              {"\n\n"}
              Use the buttons below to navigate to placeholder screens for each section (routes resolve under the (admin) group for proper Stack nav).
            </Text>

            {/* Management buttons - will link to full CRUD screens later */}
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                buttonColor={primaryColor}
                onPress={handleManageBrands}
                style={styles.button}
                labelStyle={styles.buttonLabel}
              >
                Manage Brands
              </Button>
              <Button
                mode="contained"
                buttonColor={primaryColor}
                onPress={handleManageCategories}
                style={styles.button}
                labelStyle={styles.buttonLabel}
              >
                Manage Categories
              </Button>
              <Button
                mode="contained"
                buttonColor={primaryColor}
                onPress={handleManageProducts}
                style={styles.button}
                labelStyle={styles.buttonLabel}
              >
                Manage Products
              </Button>
              <Button
                mode="contained"
                buttonColor={primaryColor}
                onPress={handleManageOrders}
                style={styles.button}
                labelStyle={styles.buttonLabel}
              >
                Manage Orders
              </Button>
            </View>
          </View>
        </ScrollView>
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
  // ScrollView's contentContainer for scrollable content with padding
  // and centering (when short); ensures full scrollability if exceeds height.
  // content remains inner wrapper for structure (no flex:1 to avoid ScrollView conflict).
  scrollContent: {
    flexGrow: 1, // Allows scrolling + fills space when short
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 48, // Extra bottom padding like in (tabs)/index.tsx
  },
  content: {
    // Inner content View for grouping; width constrained for readability
    width: "100%",
    maxWidth: 400, // Prevents overly wide buttons/text on large screens
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 24,
    textAlign: "center",
    opacity: 0.8,
  },
  placeholder: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 32, // Space before buttons
  },
  // Styles for management buttons (match login.tsx patterns)
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 16, // Spacing between buttons
  },
  button: {
    padding: 4,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 6,
  },
});
