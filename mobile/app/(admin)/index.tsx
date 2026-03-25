import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useBrand, useCategories, useProducts } from "@/hooks/queries";

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
  const palette = Colors[colorScheme];

  const { data: brands } = useBrand();
  const { data: categories } = useCategories();
  const { data: products } = useProducts({});

  const stats = [
    {
      id: "brands",
      label: "Brands",
      value: brands?.length ?? 0,
      icon: "pricetags-outline",
      color: palette.info,
    },
    {
      id: "categories",
      label: "Categories",
      value: categories?.length ?? 0,
      icon: "grid-outline",
      color: palette.success,
    },
    {
      id: "products",
      label: "Products",
      value: products?.length ?? 0,
      icon: "cube-outline",
      color: palette.warning,
    },
  ];

  const actions = [
    {
      id: "brands",
      label: "Manage Brands",
      description: "Logos, website links",
      icon: "pricetag-outline",
      onPress: () => router.push("/(admin)/brands"),
    },
    {
      id: "categories",
      label: "Manage Categories",
      description: "Organize storefront",
      icon: "apps-outline",
      onPress: () => router.push("/(admin)/categories"),
    },
    {
      id: "products",
      label: "Manage Products",
      description: "Pricing & inventory",
      icon: "cube-outline",
      onPress: () => router.push("/(admin)/products"),
    },
    {
      id: "orders",
      label: "Manage Orders",
      description: "Track fulfillment",
      icon: "receipt-outline",
      onPress: () => router.push("/(admin)/orders"),
    },
    {
      id: "upload-orders",
      label: "Upload Orders",
      description: "Review electrician uploads",
      icon: "cloud-upload-outline",
      onPress: () => router.push("/(admin)/upload-orders"),
    },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.text }]}>Admin Dashboard</Text>
            <Text style={[styles.subtitle, { color: palette.icon }]}
            >
              Quick insights and management actions
            </Text>
          </View>

          <SectionHeader title="Overview" containerStyle={styles.sectionHeader} />
          <View style={styles.statsGrid}>
            {stats.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.statCard,
                  { backgroundColor: palette.card, borderColor: palette.border },
                ]}
              >
                <View style={[styles.statIconWrap, { backgroundColor: `${item.color}1A` }]}
                >
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={[styles.statValue, { color: palette.text }]}
                >
                  {item.value}
                </Text>
                <Text style={[styles.statLabel, { color: palette.icon }]}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          <SectionHeader title="Quick Actions" containerStyle={styles.sectionHeader} />
          <View style={styles.actionGrid}>
            {actions.map((action) => (
              <View
                key={action.id}
                style={[
                  styles.actionCard,
                  { backgroundColor: palette.card, borderColor: palette.border },
                ]}
              >
                <View style={styles.actionHeader}>
                  <View style={[styles.actionIconWrap, { backgroundColor: `${palette.tint}1A` }]}
                  >
                    <Ionicons name={action.icon as any} size={20} color={palette.tint} />
                  </View>
                  <Text style={[styles.actionTitle, { color: palette.text }]}
                  >
                    {action.label}
                  </Text>
                </View>
                <Text style={[styles.actionDescription, { color: palette.icon }]}
                >
                  {action.description}
                </Text>
                <Text
                  onPress={action.onPress}
                  style={[styles.actionLink, { color: palette.tint }]}
                >
                  Open
                </Text>
              </View>
            ))}
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 4,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  sectionHeader: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 4,
  },
  statCard: {
    flexBasis: "31%",
    minWidth: 110,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  actionGrid: {
    gap: 12,
    paddingHorizontal: 4,
    paddingBottom: 32,
  },
  actionCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  actionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  actionDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  actionLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
